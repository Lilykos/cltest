from cryptography.fernet import Fernet
from app.config import settings


def get_cipher():
    """Get the Fernet cipher instance."""
    # Ensure the key is in bytes
    key = settings.ENCRYPTION_KEY
    if isinstance(key, str):
        key = key.encode()
    return Fernet(key)


def encrypt_api_key(api_key: str) -> str:
    """Encrypt an API key."""
    cipher = get_cipher()
    encrypted = cipher.encrypt(api_key.encode())
    return encrypted.decode()


def decrypt_api_key(encrypted_key: str) -> str:
    """Decrypt an API key."""
    cipher = get_cipher()
    decrypted = cipher.decrypt(encrypted_key.encode())
    return decrypted.decode()
