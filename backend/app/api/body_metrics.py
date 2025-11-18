from fastapi import APIRouter, Depends, HTTPException, status, Query
from sqlalchemy.orm import Session
from sqlalchemy import and_
from typing import List, Optional
from datetime import date, datetime
from uuid import UUID

from app.db.database import get_db
from app.models.metrics import BodyMetric
from app.models.user import User
from app.schemas.metrics import BodyMetricCreate, BodyMetricResponse, BodyMetricUpdate
from app.utils.auth import get_current_user

router = APIRouter(prefix="/body-metrics", tags=["Body Metrics"])


@router.get("", response_model=List[BodyMetricResponse])
async def list_body_metrics(
    start_date: Optional[date] = None,
    end_date: Optional[date] = None,
    skip: int = Query(0, ge=0),
    limit: int = Query(100, ge=1, le=500),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """List body metrics for current user."""
    query = db.query(BodyMetric).filter(BodyMetric.user_id == current_user.id)

    if start_date:
        query = query.filter(BodyMetric.measured_at >= datetime.combine(start_date, datetime.min.time()))

    if end_date:
        query = query.filter(BodyMetric.measured_at <= datetime.combine(end_date, datetime.max.time()))

    metrics = query.order_by(BodyMetric.measured_at.desc()).offset(skip).limit(limit).all()
    return metrics


@router.get("/{metric_id}", response_model=BodyMetricResponse)
async def get_body_metric(
    metric_id: UUID,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Get a specific body metric."""
    metric = db.query(BodyMetric).filter(
        and_(BodyMetric.id == metric_id, BodyMetric.user_id == current_user.id)
    ).first()

    if not metric:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Body metric not found",
        )

    return metric


@router.post("", response_model=BodyMetricResponse, status_code=status.HTTP_201_CREATED)
async def create_body_metric(
    metric_data: BodyMetricCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Create a body metric entry."""
    metric = BodyMetric(
        user_id=current_user.id,
        **metric_data.model_dump()
    )

    db.add(metric)
    db.commit()
    db.refresh(metric)

    return metric


@router.patch("/{metric_id}", response_model=BodyMetricResponse)
async def update_body_metric(
    metric_id: UUID,
    metric_data: BodyMetricUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Update a body metric entry."""
    metric = db.query(BodyMetric).filter(
        and_(BodyMetric.id == metric_id, BodyMetric.user_id == current_user.id)
    ).first()

    if not metric:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Body metric not found",
        )

    update_data = metric_data.model_dump(exclude_unset=True)
    for field, value in update_data.items():
        setattr(metric, field, value)

    db.commit()
    db.refresh(metric)

    return metric


@router.delete("/{metric_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_body_metric(
    metric_id: UUID,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Delete a body metric entry."""
    metric = db.query(BodyMetric).filter(
        and_(BodyMetric.id == metric_id, BodyMetric.user_id == current_user.id)
    ).first()

    if not metric:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Body metric not found",
        )

    db.delete(metric)
    db.commit()

    return None
