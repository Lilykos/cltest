import pytest
from app.utils.auth import (
    get_password_hash,
    verify_password,
    create_access_token,
    decode_access_token,
)


def test_password_hashing():
    """Test password hashing and verification."""
    password = "securepassword123"
    hashed = get_password_hash(password)

    # Hash should be different from password
    assert hashed != password

    # Verification should work
    assert verify_password(password, hashed) is True

    # Wrong password should fail
    assert verify_password("wrongpassword", hashed) is False


def test_create_access_token():
    """Test JWT token creation."""
    user_id = "123e4567-e89b-12d3-a456-426614174000"
    token = create_access_token(data={"sub": user_id})

    assert token is not None
    assert isinstance(token, str)
    assert len(token) > 0


def test_decode_access_token():
    """Test JWT token decoding."""
    user_id = "123e4567-e89b-12d3-a456-426614174000"
    token = create_access_token(data={"sub": user_id})

    token_data = decode_access_token(token)

    assert token_data is not None
    assert str(token_data.user_id) == user_id


def test_decode_invalid_token():
    """Test decoding invalid token."""
    with pytest.raises(Exception):
        decode_access_token("invalid.token.here")
