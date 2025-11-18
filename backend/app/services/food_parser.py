import json
import re
from typing import List, Dict, Any, Optional
from datetime import datetime
from sqlalchemy.orm import Session

from app.services.llm_service import LLMService
from app.services.tavily_service import TavilyService
from app.models.food import FoodItem, FoodLog
from app.models.user import User


FOOD_PARSING_SYSTEM_PROMPT = """You are a nutrition assistant that helps parse natural language food logs.

Your task is to extract food items, quantities, and meal information from user messages.

Respond ONLY with valid JSON in this exact format:
{
  "foods": [
    {
      "name": "food item name (lowercase)",
      "amount_grams": estimated grams,
      "meal_type": "breakfast|lunch|dinner|snack|other",
      "notes": "any additional context"
    }
  ],
  "timestamp": "ISO 8601 timestamp or null"
}

Estimation guidelines:
- "2 slices of edam cheese" ≈ 60g (30g per slice)
- "1 banana" ≈ 120g
- "1 chicken breast" ≈ 200g
- "100g almonds" = 100g (exact)
- "1 cup rice" ≈ 200g
- "1 tablespoon olive oil" ≈ 15g
- "1 egg" ≈ 50g

Infer meal_type from context:
- "had for breakfast" → breakfast
- "lunch" → lunch
- "dinner tonight" → dinner
- "snack" → snack
- default → other

Extract timestamp if mentioned, otherwise set to null.
"""


NUTRITION_EXTRACTION_PROMPT = """You are a nutrition data extractor.

Given search results about a food item, extract the nutritional information per 100g.

Respond ONLY with valid JSON in this exact format:
{
  "calories_per_100g": number,
  "protein_per_100g": number,
  "carbs_per_100g": number,
  "fat_per_100g": number,
  "fiber_per_100g": number,
  "source": "source name"
}

If data is per serving, convert to per 100g. Use USDA or reliable sources. If uncertain, use typical values.
"""


class FoodParser:
    """Service for parsing natural language food logs."""

    def __init__(
        self,
        db: Session,
        user: User,
        llm_service: LLMService,
        tavily_service: TavilyService,
    ):
        self.db = db
        self.user = user
        self.llm_service = llm_service
        self.tavily_service = tavily_service

    async def parse_and_log(self, message: str, timestamp: Optional[datetime] = None) -> List[FoodLog]:
        """
        Parse natural language message and create food logs.

        Returns list of created FoodLog entries.
        """
        # Step 1: Parse the message with LLM
        parsed_data = await self._parse_message(message)

        # Step 2: Process each food item
        food_logs = []
        for food_data in parsed_data.get("foods", []):
            food_log = await self._process_food_item(food_data, parsed_data.get("timestamp") or timestamp)
            if food_log:
                food_logs.append(food_log)

        return food_logs

    async def _parse_message(self, message: str) -> Dict[str, Any]:
        """Use LLM to parse the food message."""
        try:
            response = await self.llm_service.chat(
                messages=[{"role": "user", "content": message}],
                system_prompt=FOOD_PARSING_SYSTEM_PROMPT,
            )

            # Clean the response (remove markdown code blocks if present)
            response = response.strip()
            if response.startswith("```json"):
                response = response[7:]
            if response.startswith("```"):
                response = response[3:]
            if response.endswith("```"):
                response = response[:-3]
            response = response.strip()

            parsed = json.loads(response)
            return parsed

        except Exception as e:
            print(f"Error parsing message: {e}")
            # Fallback to simple parsing
            return {
                "foods": [{
                    "name": message.lower(),
                    "amount_grams": 100,
                    "meal_type": "other",
                    "notes": "Parsed with fallback method"
                }],
                "timestamp": None
            }

    async def _process_food_item(self, food_data: Dict[str, Any], timestamp: Optional[datetime]) -> Optional[FoodLog]:
        """Process a single food item and create a food log entry."""
        food_name = food_data["name"].lower().strip()

        # Check if food item exists in database
        food_item = self.db.query(FoodItem).filter(
            FoodItem.name == food_name
        ).first()

        # If not found, search for nutrition data
        if not food_item:
            food_item = await self._search_and_create_food_item(food_name)

        if not food_item:
            print(f"Could not find or create food item: {food_name}")
            return None

        # Calculate macros based on amount
        amount_grams = float(food_data["amount_grams"])
        multiplier = amount_grams / 100.0

        calories = float(food_item.calories_per_100g) * multiplier
        protein = float(food_item.protein_per_100g) * multiplier
        carbs = float(food_item.carbs_per_100g) * multiplier
        fat = float(food_item.fat_per_100g) * multiplier
        fiber = float(food_item.fiber_per_100g) * multiplier

        # Create food log entry
        food_log = FoodLog(
            user_id=self.user.id,
            food_item_id=food_item.id,
            amount_grams=amount_grams,
            meal_type=food_data.get("meal_type", "other"),
            logged_at=timestamp or datetime.utcnow(),
            notes=food_data.get("notes"),
            calories=calories,
            protein=protein,
            carbs=carbs,
            fat=fat,
            fiber=fiber,
        )

        self.db.add(food_log)
        self.db.commit()
        self.db.refresh(food_log)

        return food_log

    async def _search_and_create_food_item(self, food_name: str) -> Optional[FoodItem]:
        """Search for food nutrition data and create a new food item."""
        try:
            # Search with Tavily
            search_results = await self.tavily_service.search_food_nutrition(food_name)

            if not search_results.get("success"):
                return None

            # Use LLM to extract nutrition data from search results
            search_context = json.dumps(search_results["search_results"][:3])
            prompt = f"Extract nutrition data for '{food_name}' from these search results:\n\n{search_context}"

            response = await self.llm_service.chat(
                messages=[{"role": "user", "content": prompt}],
                system_prompt=NUTRITION_EXTRACTION_PROMPT,
            )

            # Clean response
            response = response.strip()
            if response.startswith("```json"):
                response = response[7:]
            if response.startswith("```"):
                response = response[3:]
            if response.endswith("```"):
                response = response[:-3]
            response = response.strip()

            nutrition_data = json.loads(response)

            # Create food item
            food_item = FoodItem(
                name=food_name,
                calories_per_100g=nutrition_data["calories_per_100g"],
                protein_per_100g=nutrition_data["protein_per_100g"],
                carbs_per_100g=nutrition_data["carbs_per_100g"],
                fat_per_100g=nutrition_data["fat_per_100g"],
                fiber_per_100g=nutrition_data.get("fiber_per_100g", 0),
                source=nutrition_data.get("source", "Tavily Search"),
            )

            self.db.add(food_item)
            self.db.commit()
            self.db.refresh(food_item)

            return food_item

        except Exception as e:
            print(f"Error searching/creating food item: {e}")
            return None
