from pydantic import BaseModel, Field, ConfigDict
from typing import Optional, List
from datetime import datetime
from uuid import UUID
from decimal import Decimal


# Food Item Schemas
class FoodItemBase(BaseModel):
    name: str = Field(..., min_length=1, max_length=255)
    calories_per_100g: Decimal = Field(..., ge=0)
    protein_per_100g: Decimal = Field(..., ge=0)
    carbs_per_100g: Decimal = Field(..., ge=0)
    fat_per_100g: Decimal = Field(..., ge=0)
    fiber_per_100g: Decimal = Field(default=0, ge=0)
    source: Optional[str] = None


class FoodItemCreate(FoodItemBase):
    pass


class FoodItemResponse(FoodItemBase):
    id: UUID
    created_at: datetime
    last_updated: datetime

    model_config = ConfigDict(from_attributes=True)


class FoodItemUpdate(BaseModel):
    name: Optional[str] = None
    calories_per_100g: Optional[Decimal] = None
    protein_per_100g: Optional[Decimal] = None
    carbs_per_100g: Optional[Decimal] = None
    fat_per_100g: Optional[Decimal] = None
    fiber_per_100g: Optional[Decimal] = None
    source: Optional[str] = None


# Recipe Schemas
class RecipeIngredientBase(BaseModel):
    food_item_id: UUID
    amount_grams: Decimal = Field(..., gt=0)
    notes: Optional[str] = None


class RecipeIngredientCreate(RecipeIngredientBase):
    pass


class RecipeIngredientResponse(RecipeIngredientBase):
    id: UUID
    food_item: Optional[FoodItemResponse] = None

    model_config = ConfigDict(from_attributes=True)


class RecipeBase(BaseModel):
    name: str = Field(..., min_length=1, max_length=255)
    description: Optional[str] = None
    servings: int = Field(default=1, gt=0)
    instructions: Optional[str] = None
    is_public: bool = False


class RecipeCreate(RecipeBase):
    ingredients: List[RecipeIngredientCreate] = []


class RecipeResponse(RecipeBase):
    id: UUID
    user_id: UUID
    created_at: datetime
    ingredients: List[RecipeIngredientResponse] = []

    model_config = ConfigDict(from_attributes=True)


class RecipeUpdate(BaseModel):
    name: Optional[str] = None
    description: Optional[str] = None
    servings: Optional[int] = None
    instructions: Optional[str] = None
    is_public: Optional[bool] = None
    ingredients: Optional[List[RecipeIngredientCreate]] = None


# Food Log Schemas
class FoodLogBase(BaseModel):
    food_item_id: Optional[UUID] = None
    recipe_id: Optional[UUID] = None
    amount_grams: Decimal = Field(..., gt=0)
    meal_type: str = Field(..., pattern="^(breakfast|lunch|dinner|snack|other)$")
    logged_at: datetime
    notes: Optional[str] = None


class FoodLogCreate(FoodLogBase):
    pass


class FoodLogResponse(FoodLogBase):
    id: UUID
    user_id: UUID
    calories: Optional[Decimal] = None
    protein: Optional[Decimal] = None
    carbs: Optional[Decimal] = None
    fat: Optional[Decimal] = None
    fiber: Optional[Decimal] = None
    created_at: datetime
    food_item: Optional[FoodItemResponse] = None
    recipe: Optional[RecipeResponse] = None

    model_config = ConfigDict(from_attributes=True)


class FoodLogUpdate(BaseModel):
    food_item_id: Optional[UUID] = None
    recipe_id: Optional[UUID] = None
    amount_grams: Optional[Decimal] = None
    meal_type: Optional[str] = None
    logged_at: Optional[datetime] = None
    notes: Optional[str] = None
    calories: Optional[Decimal] = None
    protein: Optional[Decimal] = None
    carbs: Optional[Decimal] = None
    fat: Optional[Decimal] = None
    fiber: Optional[Decimal] = None


# Natural Language Food Log
class NaturalLanguageFoodLog(BaseModel):
    message: str = Field(..., min_length=1)
    timestamp: Optional[datetime] = None
