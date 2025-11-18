from typing import Optional, Dict, Any, List
from tavily import TavilyClient
from app.config import settings
from app.utils.encryption import decrypt_api_key


class TavilyService:
    """Service for searching nutritional information using Tavily."""

    def __init__(self, api_key: Optional[str] = None):
        self.api_key = api_key or settings.DEFAULT_TAVILY_API_KEY
        if not self.api_key:
            raise ValueError("Tavily API key is required")
        self.client = TavilyClient(api_key=self.api_key)

    async def search_food_nutrition(self, food_name: str) -> Dict[str, Any]:
        """
        Search for nutritional information about a food item.

        Returns a dict with:
        - name: str
        - calories_per_100g: float
        - protein_per_100g: float
        - carbs_per_100g: float
        - fat_per_100g: float
        - fiber_per_100g: float
        - source: str
        """
        query = f"{food_name} nutrition facts per 100g calories protein carbs fat fiber"

        try:
            # Search using Tavily
            results = self.client.search(
                query=query,
                search_depth="basic",
                max_results=3,
            )

            # Extract nutritional data from search results
            # Note: This is a simplified extraction. In production, you'd use LLM to parse the results
            if results.get("results"):
                # Return the search results for LLM processing
                return {
                    "success": True,
                    "food_name": food_name,
                    "search_results": results["results"],
                }
            else:
                return {
                    "success": False,
                    "error": "No results found",
                    "food_name": food_name,
                }

        except Exception as e:
            return {
                "success": False,
                "error": str(e),
                "food_name": food_name,
            }


def get_tavily_service(encrypted_api_key: Optional[str] = None) -> TavilyService:
    """Factory function to create Tavily service."""
    api_key = None
    if encrypted_api_key:
        api_key = decrypt_api_key(encrypted_api_key)

    return TavilyService(api_key=api_key)
