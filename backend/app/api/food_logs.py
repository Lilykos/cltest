from fastapi import APIRouter, Depends, HTTPException, status, Query
from sqlalchemy.orm import Session
from sqlalchemy import and_
from typing import List, Optional
from datetime import datetime, date, timedelta
from uuid import UUID

from app.db.database import get_db
from app.models.food import FoodLog, FoodItem, Recipe
from app.models.user import User
from app.models.api_key import APIKey
from app.schemas.food import (
    FoodLogCreate,
    FoodLogResponse,
    FoodLogUpdate,
    NaturalLanguageFoodLog,
)
from app.utils.auth import get_current_user
from app.services.llm_service import get_llm_service
from app.services.tavily_service import get_tavily_service
from app.services.food_parser import FoodParser

router = APIRouter(prefix="/food-logs", tags=["Food Logs"])


@router.get("", response_model=List[FoodLogResponse])
async def list_food_logs(
    start_date: Optional[date] = None,
    end_date: Optional[date] = None,
    meal_type: Optional[str] = None,
    skip: int = Query(0, ge=0),
    limit: int = Query(100, ge=1, le=500),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """List food logs for current user with filters."""
    query = db.query(FoodLog).filter(FoodLog.user_id == current_user.id)

    if start_date:
        query = query.filter(FoodLog.logged_at >= datetime.combine(start_date, datetime.min.time()))

    if end_date:
        query = query.filter(FoodLog.logged_at <= datetime.combine(end_date, datetime.max.time()))

    if meal_type:
        query = query.filter(FoodLog.meal_type == meal_type)

    food_logs = query.order_by(FoodLog.logged_at.desc()).offset(skip).limit(limit).all()
    return food_logs


@router.get("/{food_log_id}", response_model=FoodLogResponse)
async def get_food_log(
    food_log_id: UUID,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Get a specific food log."""
    food_log = db.query(FoodLog).filter(
        and_(FoodLog.id == food_log_id, FoodLog.user_id == current_user.id)
    ).first()

    if not food_log:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Food log not found",
        )

    return food_log


@router.post("", response_model=FoodLogResponse, status_code=status.HTTP_201_CREATED)
async def create_food_log(
    food_log_data: FoodLogCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Create a food log entry."""
    # Calculate macros
    calories = protein = carbs = fat = fiber = 0

    if food_log_data.food_item_id:
        food_item = db.query(FoodItem).filter(FoodItem.id == food_log_data.food_item_id).first()
        if food_item:
            multiplier = float(food_log_data.amount_grams) / 100.0
            calories = float(food_item.calories_per_100g) * multiplier
            protein = float(food_item.protein_per_100g) * multiplier
            carbs = float(food_item.carbs_per_100g) * multiplier
            fat = float(food_item.fat_per_100g) * multiplier
            fiber = float(food_item.fiber_per_100g) * multiplier

    elif food_log_data.recipe_id:
        recipe = db.query(Recipe).filter(Recipe.id == food_log_data.recipe_id).first()
        if recipe:
            # Calculate recipe macros from ingredients
            total_calories = total_protein = total_carbs = total_fat = total_fiber = 0
            total_grams = 0

            for ingredient in recipe.ingredients:
                food_item = ingredient.food_item
                amount = float(ingredient.amount_grams)
                total_grams += amount
                multiplier = amount / 100.0

                total_calories += float(food_item.calories_per_100g) * multiplier
                total_protein += float(food_item.protein_per_100g) * multiplier
                total_carbs += float(food_item.carbs_per_100g) * multiplier
                total_fat += float(food_item.fat_per_100g) * multiplier
                total_fiber += float(food_item.fiber_per_100g) * multiplier

            # Calculate macros per serving
            if recipe.servings > 0 and total_grams > 0:
                servings_multiplier = float(food_log_data.amount_grams) / (total_grams / recipe.servings)
                calories = total_calories * servings_multiplier / recipe.servings
                protein = total_protein * servings_multiplier / recipe.servings
                carbs = total_carbs * servings_multiplier / recipe.servings
                fat = total_fat * servings_multiplier / recipe.servings
                fiber = total_fiber * servings_multiplier / recipe.servings

    food_log = FoodLog(
        user_id=current_user.id,
        **food_log_data.model_dump(),
        calories=calories,
        protein=protein,
        carbs=carbs,
        fat=fat,
        fiber=fiber,
    )

    db.add(food_log)
    db.commit()
    db.refresh(food_log)

    return food_log


@router.post("/natural-language", response_model=List[FoodLogResponse], status_code=status.HTTP_201_CREATED)
async def create_food_log_natural_language(
    data: NaturalLanguageFoodLog,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Create food log(s) from natural language input."""
    # Get user's LLM and Tavily API keys
    user_settings = current_user.settings or {}
    llm_provider = user_settings.get("llm_provider", "openai")
    llm_model = user_settings.get("llm_model", "gpt-3.5-turbo")

    # Get API keys
    llm_api_key_record = db.query(APIKey).filter(
        and_(
            APIKey.user_id == current_user.id,
            APIKey.provider == llm_provider,
            APIKey.is_active == True
        )
    ).first()

    tavily_api_key_record = db.query(APIKey).filter(
        and_(
            APIKey.user_id == current_user.id,
            APIKey.provider == "tavily",
            APIKey.is_active == True
        )
    ).first()

    if not llm_api_key_record:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"No active {llm_provider} API key found. Please add one in settings.",
        )

    if not tavily_api_key_record:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="No active Tavily API key found. Please add one in settings.",
        )

    # Create services
    llm_service = get_llm_service(llm_provider, llm_model, llm_api_key_record.encrypted_key)
    tavily_service = get_tavily_service(tavily_api_key_record.encrypted_key)

    # Parse and create food logs
    parser = FoodParser(db, current_user, llm_service, tavily_service)
    food_logs = await parser.parse_and_log(data.message, data.timestamp)

    if not food_logs:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Could not parse food items from message",
        )

    return food_logs


@router.patch("/{food_log_id}", response_model=FoodLogResponse)
async def update_food_log(
    food_log_id: UUID,
    food_log_data: FoodLogUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Update a food log entry."""
    food_log = db.query(FoodLog).filter(
        and_(FoodLog.id == food_log_id, FoodLog.user_id == current_user.id)
    ).first()

    if not food_log:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Food log not found",
        )

    update_data = food_log_data.model_dump(exclude_unset=True)
    for field, value in update_data.items():
        setattr(food_log, field, value)

    db.commit()
    db.refresh(food_log)

    return food_log


@router.delete("/{food_log_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_food_log(
    food_log_id: UUID,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Delete a food log entry."""
    food_log = db.query(FoodLog).filter(
        and_(FoodLog.id == food_log_id, FoodLog.user_id == current_user.id)
    ).first()

    if not food_log:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Food log not found",
        )

    db.delete(food_log)
    db.commit()

    return None
