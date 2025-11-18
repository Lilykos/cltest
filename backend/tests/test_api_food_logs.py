import pytest
from datetime import datetime
from app.models.food import FoodItem, FoodLog


def test_create_food_log(client, auth_headers, db_session):
    """Test creating a food log entry."""
    # Create food item
    food = FoodItem(name="banana", calories_per_100g=89, protein_per_100g=1.1, carbs_per_100g=23, fat_per_100g=0.3, fiber_per_100g=2.6)
    db_session.add(food)
    db_session.commit()

    response = client.post(
        "/api/food-logs",
        headers=auth_headers,
        json={
            "food_item_id": str(food.id),
            "amount_grams": 120,
            "meal_type": "breakfast",
            "logged_at": datetime.utcnow().isoformat()
        }
    )

    assert response.status_code == 201
    data = response.json()
    assert data["meal_type"] == "breakfast"
    assert float(data["amount_grams"]) == 120
    # Macros should be calculated
    assert data["calories"] is not None


def test_list_food_logs(client, auth_headers, db_session, test_user):
    """Test listing food logs."""
    food = FoodItem(name="banana", calories_per_100g=89, protein_per_100g=1.1, carbs_per_100g=23, fat_per_100g=0.3, fiber_per_100g=2.6)
    db_session.add(food)
    db_session.commit()

    log = FoodLog(
        user_id=test_user.id,
        food_item_id=food.id,
        amount_grams=120,
        meal_type="breakfast",
        logged_at=datetime.utcnow(),
        calories=106.8,
        protein=1.32,
        carbs=27.6,
        fat=0.36,
        fiber=3.12
    )
    db_session.add(log)
    db_session.commit()

    response = client.get("/api/food-logs", headers=auth_headers)

    assert response.status_code == 200
    data = response.json()
    assert len(data) >= 1


def test_filter_food_logs_by_meal_type(client, auth_headers, db_session, test_user):
    """Test filtering food logs by meal type."""
    food = FoodItem(name="banana", calories_per_100g=89, protein_per_100g=1.1, carbs_per_100g=23, fat_per_100g=0.3, fiber_per_100g=2.6)
    db_session.add(food)
    db_session.commit()

    logs = [
        FoodLog(user_id=test_user.id, food_item_id=food.id, amount_grams=100, meal_type="breakfast", logged_at=datetime.utcnow(), calories=89, protein=1.1, carbs=23, fat=0.3, fiber=2.6),
        FoodLog(user_id=test_user.id, food_item_id=food.id, amount_grams=100, meal_type="lunch", logged_at=datetime.utcnow(), calories=89, protein=1.1, carbs=23, fat=0.3, fiber=2.6),
    ]
    db_session.add_all(logs)
    db_session.commit()

    response = client.get("/api/food-logs?meal_type=breakfast", headers=auth_headers)

    assert response.status_code == 200
    data = response.json()
    assert all(log["meal_type"] == "breakfast" for log in data)


def test_update_food_log(client, auth_headers, db_session, test_user):
    """Test updating a food log."""
    food = FoodItem(name="banana", calories_per_100g=89, protein_per_100g=1.1, carbs_per_100g=23, fat_per_100g=0.3, fiber_per_100g=2.6)
    db_session.add(food)
    db_session.commit()

    log = FoodLog(
        user_id=test_user.id,
        food_item_id=food.id,
        amount_grams=120,
        meal_type="breakfast",
        logged_at=datetime.utcnow(),
        calories=106.8,
        protein=1.32,
        carbs=27.6,
        fat=0.36,
        fiber=3.12
    )
    db_session.add(log)
    db_session.commit()

    response = client.patch(
        f"/api/food-logs/{log.id}",
        headers=auth_headers,
        json={"amount_grams": 150}
    )

    assert response.status_code == 200
    data = response.json()
    assert float(data["amount_grams"]) == 150


def test_delete_food_log(client, auth_headers, db_session, test_user):
    """Test deleting a food log."""
    food = FoodItem(name="banana", calories_per_100g=89, protein_per_100g=1.1, carbs_per_100g=23, fat_per_100g=0.3, fiber_per_100g=2.6)
    db_session.add(food)
    db_session.commit()

    log = FoodLog(
        user_id=test_user.id,
        food_item_id=food.id,
        amount_grams=120,
        meal_type="breakfast",
        logged_at=datetime.utcnow(),
        calories=106.8,
        protein=1.32,
        carbs=27.6,
        fat=0.36,
        fiber=3.12
    )
    db_session.add(log)
    db_session.commit()
    log_id = log.id

    response = client.delete(f"/api/food-logs/{log_id}", headers=auth_headers)

    assert response.status_code == 204
