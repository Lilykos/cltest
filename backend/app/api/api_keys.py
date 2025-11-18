from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from sqlalchemy import and_
from typing import List
from uuid import UUID

from app.db.database import get_db
from app.models.api_key import APIKey
from app.models.user import User
from app.schemas.api_key import APIKeyCreate, APIKeyResponse, APIKeyUpdate
from app.utils.auth import get_current_user
from app.utils.encryption import encrypt_api_key

router = APIRouter(prefix="/api-keys", tags=["API Keys"])


@router.get("", response_model=List[APIKeyResponse])
async def list_api_keys(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """List all API keys for current user."""
    api_keys = db.query(APIKey).filter(APIKey.user_id == current_user.id).all()
    return api_keys


@router.get("/{provider}", response_model=APIKeyResponse)
async def get_api_key(
    provider: str,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Get API key for a specific provider."""
    api_key = db.query(APIKey).filter(
        and_(
            APIKey.user_id == current_user.id,
            APIKey.provider == provider
        )
    ).first()

    if not api_key:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"No API key found for provider: {provider}",
        )

    return api_key


@router.post("", response_model=APIKeyResponse, status_code=status.HTTP_201_CREATED)
async def create_api_key(
    api_key_data: APIKeyCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Create or update an API key for a provider."""
    # Check if API key already exists for this provider
    existing = db.query(APIKey).filter(
        and_(
            APIKey.user_id == current_user.id,
            APIKey.provider == api_key_data.provider
        )
    ).first()

    encrypted_key = encrypt_api_key(api_key_data.api_key)

    if existing:
        # Update existing
        existing.encrypted_key = encrypted_key
        existing.is_active = True
        db.commit()
        db.refresh(existing)
        return existing
    else:
        # Create new
        api_key = APIKey(
            user_id=current_user.id,
            provider=api_key_data.provider,
            encrypted_key=encrypted_key,
            is_active=True,
        )
        db.add(api_key)
        db.commit()
        db.refresh(api_key)
        return api_key


@router.patch("/{provider}", response_model=APIKeyResponse)
async def update_api_key(
    provider: str,
    api_key_data: APIKeyUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Update an API key."""
    api_key = db.query(APIKey).filter(
        and_(
            APIKey.user_id == current_user.id,
            APIKey.provider == provider
        )
    ).first()

    if not api_key:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"No API key found for provider: {provider}",
        )

    update_data = api_key_data.model_dump(exclude_unset=True)

    if "api_key" in update_data:
        update_data["encrypted_key"] = encrypt_api_key(update_data.pop("api_key"))

    for field, value in update_data.items():
        setattr(api_key, field, value)

    db.commit()
    db.refresh(api_key)

    return api_key


@router.delete("/{provider}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_api_key(
    provider: str,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Delete an API key."""
    api_key = db.query(APIKey).filter(
        and_(
            APIKey.user_id == current_user.id,
            APIKey.provider == provider
        )
    ).first()

    if not api_key:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"No API key found for provider: {provider}",
        )

    db.delete(api_key)
    db.commit()

    return None
