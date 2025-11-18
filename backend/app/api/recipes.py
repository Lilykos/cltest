from fastapi import APIRouter, Depends, HTTPException, status, Query
from sqlalchemy.orm import Session
from sqlalchemy import and_, or_
from typing import List, Optional
from uuid import UUID

from app.db.database import get_db
from app.models.food import Recipe, RecipeIngredient
from app.models.user import User
from app.schemas.food import RecipeCreate, RecipeResponse, RecipeUpdate
from app.utils.auth import get_current_user

router = APIRouter(prefix="/recipes", tags=["Recipes"])


@router.get("", response_model=List[RecipeResponse])
async def list_recipes(
    skip: int = Query(0, ge=0),
    limit: int = Query(100, ge=1, le=500),
    search: Optional[str] = None,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """List recipes (user's own + public recipes)."""
    query = db.query(Recipe).filter(
        or_(
            Recipe.user_id == current_user.id,
            Recipe.is_public == True
        )
    )

    if search:
        query = query.filter(Recipe.name.ilike(f"%{search}%"))

    recipes = query.offset(skip).limit(limit).all()
    return recipes


@router.get("/{recipe_id}", response_model=RecipeResponse)
async def get_recipe(
    recipe_id: UUID,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Get a specific recipe."""
    recipe = db.query(Recipe).filter(
        and_(
            Recipe.id == recipe_id,
            or_(
                Recipe.user_id == current_user.id,
                Recipe.is_public == True
            )
        )
    ).first()

    if not recipe:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Recipe not found",
        )

    return recipe


@router.post("", response_model=RecipeResponse, status_code=status.HTTP_201_CREATED)
async def create_recipe(
    recipe_data: RecipeCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Create a new recipe."""
    recipe = Recipe(
        user_id=current_user.id,
        name=recipe_data.name,
        description=recipe_data.description,
        servings=recipe_data.servings,
        instructions=recipe_data.instructions,
        is_public=recipe_data.is_public,
    )

    db.add(recipe)
    db.flush()  # Get the recipe ID

    # Add ingredients
    for ingredient_data in recipe_data.ingredients:
        ingredient = RecipeIngredient(
            recipe_id=recipe.id,
            **ingredient_data.model_dump()
        )
        db.add(ingredient)

    db.commit()
    db.refresh(recipe)

    return recipe


@router.patch("/{recipe_id}", response_model=RecipeResponse)
async def update_recipe(
    recipe_id: UUID,
    recipe_data: RecipeUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Update a recipe."""
    recipe = db.query(Recipe).filter(
        and_(Recipe.id == recipe_id, Recipe.user_id == current_user.id)
    ).first()

    if not recipe:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Recipe not found or not owned by you",
        )

    update_data = recipe_data.model_dump(exclude_unset=True)

    # Handle ingredients separately
    if "ingredients" in update_data:
        # Delete old ingredients
        db.query(RecipeIngredient).filter(RecipeIngredient.recipe_id == recipe_id).delete()

        # Add new ingredients
        for ingredient_data in update_data["ingredients"]:
            ingredient = RecipeIngredient(
                recipe_id=recipe.id,
                **ingredient_data
            )
            db.add(ingredient)

        del update_data["ingredients"]

    # Update other fields
    for field, value in update_data.items():
        setattr(recipe, field, value)

    db.commit()
    db.refresh(recipe)

    return recipe


@router.delete("/{recipe_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_recipe(
    recipe_id: UUID,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Delete a recipe."""
    recipe = db.query(Recipe).filter(
        and_(Recipe.id == recipe_id, Recipe.user_id == current_user.id)
    ).first()

    if not recipe:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Recipe not found or not owned by you",
        )

    db.delete(recipe)
    db.commit()

    return None
