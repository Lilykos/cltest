from fastapi import APIRouter, Depends, Query
from sqlalchemy.orm import Session
from sqlalchemy import func, and_
from typing import Dict, Any, List
from datetime import date, datetime, timedelta
from decimal import Decimal

from app.db.database import get_db
from app.models.food import FoodLog
from app.models.metrics import BodyMetric
from app.models.user import User
from app.utils.auth import get_current_user

router = APIRouter(prefix="/analytics", tags=["Analytics"])


@router.get("/daily-summary")
async def get_daily_summary(
    target_date: date = Query(default_factory=date.today),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
) -> Dict[str, Any]:
    """Get summary of nutrition for a specific day."""
    start_datetime = datetime.combine(target_date, datetime.min.time())
    end_datetime = datetime.combine(target_date, datetime.max.time())

    # Get all food logs for the day
    food_logs = db.query(FoodLog).filter(
        and_(
            FoodLog.user_id == current_user.id,
            FoodLog.logged_at >= start_datetime,
            FoodLog.logged_at <= end_datetime
        )
    ).all()

    # Calculate totals
    total_calories = sum(float(log.calories or 0) for log in food_logs)
    total_protein = sum(float(log.protein or 0) for log in food_logs)
    total_carbs = sum(float(log.carbs or 0) for log in food_logs)
    total_fat = sum(float(log.fat or 0) for log in food_logs)
    total_fiber = sum(float(log.fiber or 0) for log in food_logs)

    # Group by meal type
    meals_by_type = {}
    for log in food_logs:
        meal_type = log.meal_type
        if meal_type not in meals_by_type:
            meals_by_type[meal_type] = {
                "count": 0,
                "calories": 0,
                "protein": 0,
                "carbs": 0,
                "fat": 0,
                "fiber": 0,
            }

        meals_by_type[meal_type]["count"] += 1
        meals_by_type[meal_type]["calories"] += float(log.calories or 0)
        meals_by_type[meal_type]["protein"] += float(log.protein or 0)
        meals_by_type[meal_type]["carbs"] += float(log.carbs or 0)
        meals_by_type[meal_type]["fat"] += float(log.fat or 0)
        meals_by_type[meal_type]["fiber"] += float(log.fiber or 0)

    return {
        "date": target_date.isoformat(),
        "totals": {
            "calories": round(total_calories, 2),
            "protein": round(total_protein, 2),
            "carbs": round(total_carbs, 2),
            "fat": round(total_fat, 2),
            "fiber": round(total_fiber, 2),
        },
        "meals_by_type": meals_by_type,
        "num_entries": len(food_logs),
    }


@router.get("/weekly-summary")
async def get_weekly_summary(
    start_date: date = Query(default_factory=lambda: date.today() - timedelta(days=6)),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
) -> Dict[str, Any]:
    """Get summary of nutrition for a week (7 days)."""
    end_date = start_date + timedelta(days=6)
    start_datetime = datetime.combine(start_date, datetime.min.time())
    end_datetime = datetime.combine(end_date, datetime.max.time())

    # Get all food logs for the week
    food_logs = db.query(FoodLog).filter(
        and_(
            FoodLog.user_id == current_user.id,
            FoodLog.logged_at >= start_datetime,
            FoodLog.logged_at <= end_datetime
        )
    ).all()

    # Group by day
    daily_data = {}
    current_date = start_date
    while current_date <= end_date:
        daily_data[current_date.isoformat()] = {
            "calories": 0,
            "protein": 0,
            "carbs": 0,
            "fat": 0,
            "fiber": 0,
            "count": 0,
        }
        current_date += timedelta(days=1)

    for log in food_logs:
        log_date = log.logged_at.date().isoformat()
        if log_date in daily_data:
            daily_data[log_date]["calories"] += float(log.calories or 0)
            daily_data[log_date]["protein"] += float(log.protein or 0)
            daily_data[log_date]["carbs"] += float(log.carbs or 0)
            daily_data[log_date]["fat"] += float(log.fat or 0)
            daily_data[log_date]["fiber"] += float(log.fiber or 0)
            daily_data[log_date]["count"] += 1

    # Calculate averages
    total_days = 7
    avg_calories = sum(day["calories"] for day in daily_data.values()) / total_days
    avg_protein = sum(day["protein"] for day in daily_data.values()) / total_days
    avg_carbs = sum(day["carbs"] for day in daily_data.values()) / total_days
    avg_fat = sum(day["fat"] for day in daily_data.values()) / total_days
    avg_fiber = sum(day["fiber"] for day in daily_data.values()) / total_days

    return {
        "start_date": start_date.isoformat(),
        "end_date": end_date.isoformat(),
        "daily_data": daily_data,
        "averages": {
            "calories": round(avg_calories, 2),
            "protein": round(avg_protein, 2),
            "carbs": round(avg_carbs, 2),
            "fat": round(avg_fat, 2),
            "fiber": round(avg_fiber, 2),
        },
        "total_entries": len(food_logs),
    }


@router.get("/monthly-summary")
async def get_monthly_summary(
    year: int = Query(default_factory=lambda: date.today().year),
    month: int = Query(default_factory=lambda: date.today().month, ge=1, le=12),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
) -> Dict[str, Any]:
    """Get summary of nutrition for a month."""
    start_date = date(year, month, 1)

    # Calculate last day of month
    if month == 12:
        end_date = date(year + 1, 1, 1) - timedelta(days=1)
    else:
        end_date = date(year, month + 1, 1) - timedelta(days=1)

    start_datetime = datetime.combine(start_date, datetime.min.time())
    end_datetime = datetime.combine(end_date, datetime.max.time())

    # Get all food logs for the month
    food_logs = db.query(FoodLog).filter(
        and_(
            FoodLog.user_id == current_user.id,
            FoodLog.logged_at >= start_datetime,
            FoodLog.logged_at <= end_datetime
        )
    ).all()

    # Group by day
    daily_data = {}
    current_date = start_date
    while current_date <= end_date:
        daily_data[current_date.isoformat()] = {
            "calories": 0,
            "protein": 0,
            "carbs": 0,
            "fat": 0,
            "fiber": 0,
            "count": 0,
        }
        current_date += timedelta(days=1)

    for log in food_logs:
        log_date = log.logged_at.date().isoformat()
        if log_date in daily_data:
            daily_data[log_date]["calories"] += float(log.calories or 0)
            daily_data[log_date]["protein"] += float(log.protein or 0)
            daily_data[log_date]["carbs"] += float(log.carbs or 0)
            daily_data[log_date]["fat"] += float(log.fat or 0)
            daily_data[log_date]["fiber"] += float(log.fiber or 0)
            daily_data[log_date]["count"] += 1

    # Calculate averages
    num_days = (end_date - start_date).days + 1
    avg_calories = sum(day["calories"] for day in daily_data.values()) / num_days
    avg_protein = sum(day["protein"] for day in daily_data.values()) / num_days
    avg_carbs = sum(day["carbs"] for day in daily_data.values()) / num_days
    avg_fat = sum(day["fat"] for day in daily_data.values()) / num_days
    avg_fiber = sum(day["fiber"] for day in daily_data.values()) / num_days

    return {
        "year": year,
        "month": month,
        "start_date": start_date.isoformat(),
        "end_date": end_date.isoformat(),
        "daily_data": daily_data,
        "averages": {
            "calories": round(avg_calories, 2),
            "protein": round(avg_protein, 2),
            "carbs": round(avg_carbs, 2),
            "fat": round(avg_fat, 2),
            "fiber": round(avg_fiber, 2),
        },
        "total_entries": len(food_logs),
    }


@router.get("/body-metrics-trends")
async def get_body_metrics_trends(
    start_date: date = Query(default_factory=lambda: date.today() - timedelta(days=30)),
    end_date: date = Query(default_factory=date.today),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
) -> Dict[str, Any]:
    """Get body metrics trends over a date range."""
    start_datetime = datetime.combine(start_date, datetime.min.time())
    end_datetime = datetime.combine(end_date, datetime.max.time())

    # Get all body metrics for the range
    metrics = db.query(BodyMetric).filter(
        and_(
            BodyMetric.user_id == current_user.id,
            BodyMetric.measured_at >= start_datetime,
            BodyMetric.measured_at <= end_datetime
        )
    ).order_by(BodyMetric.measured_at).all()

    data_points = []
    for metric in metrics:
        data_points.append({
            "date": metric.measured_at.date().isoformat(),
            "weight_kg": float(metric.weight_kg) if metric.weight_kg else None,
            "body_fat_percentage": float(metric.body_fat_percentage) if metric.body_fat_percentage else None,
            "muscle_mass_kg": float(metric.muscle_mass_kg) if metric.muscle_mass_kg else None,
            "bmi": float(metric.bmi) if metric.bmi else None,
        })

    return {
        "start_date": start_date.isoformat(),
        "end_date": end_date.isoformat(),
        "data_points": data_points,
        "count": len(data_points),
    }
