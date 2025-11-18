from fastapi import APIRouter, Depends, HTTPException, status, Query
from sqlalchemy.orm import Session
from typing import List, Optional
from uuid import UUID

from app.db.database import get_db
from app.models.food import FoodItem
from app.models.user import User
from app.schemas.food import FoodItemCreate, FoodItemResponse, FoodItemUpdate
from app.utils.auth import get_current_user

router = APIRouter(prefix="/food-items", tags=["Food Items"])


@router.get("", response_model=List[FoodItemResponse])
async def list_food_items(
    skip: int = Query(0, ge=0),
    limit: int = Query(100, ge=1, le=500),
    search: Optional[str] = None,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """List all food items with optional search."""
    query = db.query(FoodItem)

    if search:
        query = query.filter(FoodItem.name.ilike(f"%{search}%"))

    food_items = query.offset(skip).limit(limit).all()
    return food_items


@router.get("/{food_item_id}", response_model=FoodItemResponse)
async def get_food_item(
    food_item_id: UUID,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Get a specific food item."""
    food_item = db.query(FoodItem).filter(FoodItem.id == food_item_id).first()
    if not food_item:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Food item not found",
        )
    return food_item


@router.post("", response_model=FoodItemResponse, status_code=status.HTTP_201_CREATED)
async def create_food_item(
    food_item_data: FoodItemCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Create a new food item."""
    # Check if food item with this name already exists
    existing = db.query(FoodItem).filter(FoodItem.name == food_item_data.name.lower()).first()
    if existing:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Food item with this name already exists",
        )

    food_item = FoodItem(**food_item_data.model_dump(), name=food_item_data.name.lower())
    db.add(food_item)
    db.commit()
    db.refresh(food_item)

    return food_item


@router.patch("/{food_item_id}", response_model=FoodItemResponse)
async def update_food_item(
    food_item_id: UUID,
    food_item_data: FoodItemUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Update a food item."""
    food_item = db.query(FoodItem).filter(FoodItem.id == food_item_id).first()
    if not food_item:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Food item not found",
        )

    update_data = food_item_data.model_dump(exclude_unset=True)
    if "name" in update_data:
        update_data["name"] = update_data["name"].lower()

    for field, value in update_data.items():
        setattr(food_item, field, value)

    db.commit()
    db.refresh(food_item)

    return food_item


@router.delete("/{food_item_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_food_item(
    food_item_id: UUID,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Delete a food item."""
    food_item = db.query(FoodItem).filter(FoodItem.id == food_item_id).first()
    if not food_item:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Food item not found",
        )

    db.delete(food_item)
    db.commit()

    return None
