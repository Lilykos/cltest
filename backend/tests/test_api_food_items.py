import pytest
from app.models.food import FoodItem


def test_list_food_items(client, auth_headers, db_session):
    """Test listing food items."""
    # Create some food items
    foods = [
        FoodItem(name="banana", calories_per_100g=89, protein_per_100g=1.1, carbs_per_100g=23, fat_per_100g=0.3, fiber_per_100g=2.6),
        FoodItem(name="apple", calories_per_100g=52, protein_per_100g=0.3, carbs_per_100g=14, fat_per_100g=0.2, fiber_per_100g=2.4),
    ]
    db_session.add_all(foods)
    db_session.commit()

    response = client.get("/api/food-items", headers=auth_headers)

    assert response.status_code == 200
    data = response.json()
    assert len(data) == 2


def test_create_food_item(client, auth_headers):
    """Test creating a food item."""
    response = client.post(
        "/api/food-items",
        headers=auth_headers,
        json={
            "name": "chicken breast",
            "calories_per_100g": 165,
            "protein_per_100g": 31,
            "carbs_per_100g": 0,
            "fat_per_100g": 3.6,
            "fiber_per_100g": 0,
            "source": "USDA"
        }
    )

    assert response.status_code == 201
    data = response.json()
    assert data["name"] == "chicken breast"
    assert float(data["calories_per_100g"]) == 165


def test_search_food_items(client, auth_headers, db_session):
    """Test searching food items."""
    foods = [
        FoodItem(name="banana", calories_per_100g=89, protein_per_100g=1.1, carbs_per_100g=23, fat_per_100g=0.3, fiber_per_100g=2.6),
        FoodItem(name="apple", calories_per_100g=52, protein_per_100g=0.3, carbs_per_100g=14, fat_per_100g=0.2, fiber_per_100g=2.4),
    ]
    db_session.add_all(foods)
    db_session.commit()

    response = client.get("/api/food-items?search=ban", headers=auth_headers)

    assert response.status_code == 200
    data = response.json()
    assert len(data) == 1
    assert data[0]["name"] == "banana"


def test_update_food_item(client, auth_headers, db_session):
    """Test updating a food item."""
    food = FoodItem(name="banana", calories_per_100g=89, protein_per_100g=1.1, carbs_per_100g=23, fat_per_100g=0.3, fiber_per_100g=2.6)
    db_session.add(food)
    db_session.commit()

    response = client.patch(
        f"/api/food-items/{food.id}",
        headers=auth_headers,
        json={"calories_per_100g": 90}
    )

    assert response.status_code == 200
    data = response.json()
    assert float(data["calories_per_100g"]) == 90


def test_delete_food_item(client, auth_headers, db_session):
    """Test deleting a food item."""
    food = FoodItem(name="banana", calories_per_100g=89, protein_per_100g=1.1, carbs_per_100g=23, fat_per_100g=0.3, fiber_per_100g=2.6)
    db_session.add(food)
    db_session.commit()
    food_id = food.id

    response = client.delete(f"/api/food-items/{food_id}", headers=auth_headers)

    assert response.status_code == 204

    # Verify deleted
    response = client.get(f"/api/food-items/{food_id}", headers=auth_headers)
    assert response.status_code == 404
