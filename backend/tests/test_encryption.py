import pytest
from app.utils.encryption import encrypt_api_key, decrypt_api_key


def test_encrypt_decrypt_api_key():
    """Test API key encryption and decryption."""
    original_key = "sk-test-api-key-123456789"

    # Encrypt
    encrypted = encrypt_api_key(original_key)

    # Should be different
    assert encrypted != original_key

    # Decrypt should return original
    decrypted = decrypt_api_key(encrypted)
    assert decrypted == original_key


def test_encrypt_different_keys_produce_different_ciphertexts():
    """Test that same key encrypted twice produces different results."""
    key1 = "sk-test-key-1"
    key2 = "sk-test-key-2"

    encrypted1 = encrypt_api_key(key1)
    encrypted2 = encrypt_api_key(key2)

    assert encrypted1 != encrypted2


def test_decrypt_encrypted_key():
    """Test decryption of various API key formats."""
    keys = [
        "sk-openai-123",
        "sk-ant-claude-456",
        "tvly-tavily-789",
    ]

    for original in keys:
        encrypted = encrypt_api_key(original)
        decrypted = decrypt_api_key(encrypted)
        assert decrypted == original
