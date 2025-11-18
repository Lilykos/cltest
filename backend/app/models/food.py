from sqlalchemy import Column, String, DateTime, Numeric, ForeignKey, Integer, Boolean, Text, CheckConstraint
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.sql import func
from sqlalchemy.orm import relationship
import uuid
from app.db.database import Base


class FoodItem(Base):
    __tablename__ = "food_items"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    name = Column(String(255), unique=True, nullable=False, index=True)
    calories_per_100g = Column(Numeric(8, 2), nullable=False)
    protein_per_100g = Column(Numeric(6, 2), nullable=False)
    carbs_per_100g = Column(Numeric(6, 2), nullable=False)
    fat_per_100g = Column(Numeric(6, 2), nullable=False)
    fiber_per_100g = Column(Numeric(6, 2), default=0)
    source = Column(String(100))
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    last_updated = Column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now())


class Recipe(Base):
    __tablename__ = "recipes"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    user_id = Column(UUID(as_uuid=True), ForeignKey("users.id", ondelete="CASCADE"))
    name = Column(String(255), nullable=False)
    description = Column(Text)
    servings = Column(Integer, default=1)
    instructions = Column(Text)
    is_public = Column(Boolean, default=False)
    created_at = Column(DateTime(timezone=True), server_default=func.now())

    # Relationships
    ingredients = relationship("RecipeIngredient", back_populates="recipe", cascade="all, delete-orphan")


class RecipeIngredient(Base):
    __tablename__ = "recipe_ingredients"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    recipe_id = Column(UUID(as_uuid=True), ForeignKey("recipes.id", ondelete="CASCADE"), nullable=False)
    food_item_id = Column(UUID(as_uuid=True), ForeignKey("food_items.id", ondelete="CASCADE"), nullable=False)
    amount_grams = Column(Numeric(8, 2), nullable=False)
    notes = Column(Text)

    # Relationships
    recipe = relationship("Recipe", back_populates="ingredients")
    food_item = relationship("FoodItem")


class FoodLog(Base):
    __tablename__ = "food_log"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    user_id = Column(UUID(as_uuid=True), ForeignKey("users.id", ondelete="CASCADE"), nullable=False)
    food_item_id = Column(UUID(as_uuid=True), ForeignKey("food_items.id", ondelete="SET NULL"))
    recipe_id = Column(UUID(as_uuid=True), ForeignKey("recipes.id", ondelete="SET NULL"))
    amount_grams = Column(Numeric(8, 2), nullable=False)
    meal_type = Column(String(20))
    logged_at = Column(DateTime(timezone=True), nullable=False)
    notes = Column(Text)
    calories = Column(Numeric(8, 2))
    protein = Column(Numeric(6, 2))
    carbs = Column(Numeric(6, 2))
    fat = Column(Numeric(6, 2))
    fiber = Column(Numeric(6, 2))
    created_at = Column(DateTime(timezone=True), server_default=func.now())

    __table_args__ = (
        CheckConstraint(
            "meal_type IN ('breakfast', 'lunch', 'dinner', 'snack', 'other')",
            name="check_meal_type"
        ),
    )

    # Relationships
    food_item = relationship("FoodItem")
    recipe = relationship("Recipe")
