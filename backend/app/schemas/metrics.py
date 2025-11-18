from pydantic import BaseModel, Field, ConfigDict
from typing import Optional
from datetime import datetime
from uuid import UUID
from decimal import Decimal


class BodyMetricBase(BaseModel):
    measured_at: datetime
    weight_kg: Optional[Decimal] = Field(None, gt=0, le=500)
    body_fat_percentage: Optional[Decimal] = Field(None, ge=0, le=100)
    muscle_mass_kg: Optional[Decimal] = Field(None, gt=0, le=300)
    bmi: Optional[Decimal] = Field(None, gt=0, le=100)
    notes: Optional[str] = None


class BodyMetricCreate(BodyMetricBase):
    pass


class BodyMetricResponse(BodyMetricBase):
    id: UUID
    user_id: UUID
    created_at: datetime

    model_config = ConfigDict(from_attributes=True)


class BodyMetricUpdate(BaseModel):
    measured_at: Optional[datetime] = None
    weight_kg: Optional[Decimal] = None
    body_fat_percentage: Optional[Decimal] = None
    muscle_mass_kg: Optional[Decimal] = None
    bmi: Optional[Decimal] = None
    notes: Optional[str] = None
