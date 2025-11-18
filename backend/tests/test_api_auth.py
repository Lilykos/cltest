import pytest


def test_register_user(client):
    """Test user registration."""
    response = client.post(
        "/api/auth/register",
        json={
            "username": "newuser",
            "email": "newuser@example.com",
            "password": "securepass123"
        }
    )

    assert response.status_code == 201
    data = response.json()
    assert data["username"] == "newuser"
    assert data["email"] == "newuser@example.com"
    assert "password" not in data


def test_register_duplicate_username(client, test_user):
    """Test registering with duplicate username."""
    response = client.post(
        "/api/auth/register",
        json={
            "username": "testuser",  # Already exists
            "email": "different@example.com",
            "password": "securepass123"
        }
    )

    assert response.status_code == 400


def test_login_success(client, test_user):
    """Test successful login."""
    response = client.post(
        "/api/auth/login",
        data={
            "username": "testuser",
            "password": "testpassword123"
        }
    )

    assert response.status_code == 200
    data = response.json()
    assert "access_token" in data
    assert data["token_type"] == "bearer"


def test_login_wrong_password(client, test_user):
    """Test login with wrong password."""
    response = client.post(
        "/api/auth/login",
        data={
            "username": "testuser",
            "password": "wrongpassword"
        }
    )

    assert response.status_code == 401


def test_get_current_user(client, auth_headers):
    """Test getting current user info."""
    response = client.get("/api/auth/me", headers=auth_headers)

    assert response.status_code == 200
    data = response.json()
    assert data["username"] == "testuser"
    assert data["email"] == "test@example.com"


def test_get_current_user_no_token(client):
    """Test getting current user without token."""
    response = client.get("/api/auth/me")

    assert response.status_code == 401
