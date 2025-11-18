from sqlalchemy import Column, DateTime, Numeric, ForeignKey, Text
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.sql import func
import uuid
from app.db.database import Base


class BodyMetric(Base):
    __tablename__ = "body_metrics"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    user_id = Column(UUID(as_uuid=True), ForeignKey("users.id", ondelete="CASCADE"), nullable=False)
    measured_at = Column(DateTime(timezone=True), nullable=False)
    weight_kg = Column(Numeric(5, 2))
    body_fat_percentage = Column(Numeric(4, 2))
    muscle_mass_kg = Column(Numeric(5, 2))
    bmi = Column(Numeric(4, 2))
    notes = Column(Text)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
