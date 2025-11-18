import pytest
from app.models.user import User
from app.models.food import FoodItem, FoodLog, Recipe, RecipeIngredient
from app.models.metrics import BodyMetric
from app.models.api_key import APIKey
from datetime import datetime


def test_create_user(db_session):
    """Test creating a user."""
    user = User(
        username="testuser",
        email="test@example.com",
        password_hash="hashed_password"
    )
    db_session.add(user)
    db_session.commit()

    assert user.id is not None
    assert user.username == "testuser"
    assert user.email == "test@example.com"


def test_create_food_item(db_session):
    """Test creating a food item."""
    food = FoodItem(
        name="banana",
        calories_per_100g=89,
        protein_per_100g=1.1,
        carbs_per_100g=23,
        fat_per_100g=0.3,
        fiber_per_100g=2.6,
        source="USDA"
    )
    db_session.add(food)
    db_session.commit()

    assert food.id is not None
    assert food.name == "banana"
    assert float(food.calories_per_100g) == 89


def test_create_recipe_with_ingredients(db_session, test_user):
    """Test creating a recipe with ingredients."""
    # Create food items
    banana = FoodItem(
        name="banana",
        calories_per_100g=89,
        protein_per_100g=1.1,
        carbs_per_100g=23,
        fat_per_100g=0.3,
        fiber_per_100g=2.6
    )
    oats = FoodItem(
        name="oats",
        calories_per_100g=389,
        protein_per_100g=16.9,
        carbs_per_100g=66.3,
        fat_per_100g=6.9,
        fiber_per_100g=10.6
    )
    db_session.add_all([banana, oats])
    db_session.commit()

    # Create recipe
    recipe = Recipe(
        user_id=test_user.id,
        name="Banana Oatmeal",
        servings=1,
        instructions="Mix and cook"
    )
    db_session.add(recipe)
    db_session.commit()

    # Add ingredients
    ingredient1 = RecipeIngredient(
        recipe_id=recipe.id,
        food_item_id=banana.id,
        amount_grams=120
    )
    ingredient2 = RecipeIngredient(
        recipe_id=recipe.id,
        food_item_id=oats.id,
        amount_grams=50
    )
    db_session.add_all([ingredient1, ingredient2])
    db_session.commit()

    # Verify
    db_session.refresh(recipe)
    assert len(recipe.ingredients) == 2


def test_create_food_log(db_session, test_user):
    """Test creating a food log entry."""
    food = FoodItem(
        name="chicken breast",
        calories_per_100g=165,
        protein_per_100g=31,
        carbs_per_100g=0,
        fat_per_100g=3.6,
        fiber_per_100g=0
    )
    db_session.add(food)
    db_session.commit()

    log = FoodLog(
        user_id=test_user.id,
        food_item_id=food.id,
        amount_grams=200,
        meal_type="lunch",
        logged_at=datetime.utcnow(),
        calories=330,
        protein=62,
        carbs=0,
        fat=7.2,
        fiber=0
    )
    db_session.add(log)
    db_session.commit()

    assert log.id is not None
    assert float(log.calories) == 330


def test_create_body_metric(db_session, test_user):
    """Test creating a body metric."""
    metric = BodyMetric(
        user_id=test_user.id,
        measured_at=datetime.utcnow(),
        weight_kg=75.5,
        body_fat_percentage=18.5,
        bmi=23.5
    )
    db_session.add(metric)
    db_session.commit()

    assert metric.id is not None
    assert float(metric.weight_kg) == 75.5


def test_create_api_key(db_session, test_user):
    """Test creating an API key."""
    api_key = APIKey(
        user_id=test_user.id,
        provider="openai",
        encrypted_key="encrypted_key_here",
        is_active=True
    )
    db_session.add(api_key)
    db_session.commit()

    assert api_key.id is not None
    assert api_key.provider == "openai"
