from pydantic import BaseModel, Field, ConfigDict
from typing import Optional
from datetime import datetime
from uuid import UUID


class APIKeyBase(BaseModel):
    provider: str = Field(..., pattern="^(openai|anthropic|deepseek|tavily)$")


class APIKeyCreate(APIKeyBase):
    api_key: str = Field(..., min_length=1)


class APIKeyResponse(APIKeyBase):
    id: UUID
    user_id: UUID
    is_active: bool
    created_at: datetime
    # Note: We never return the actual key

    model_config = ConfigDict(from_attributes=True)


class APIKeyUpdate(BaseModel):
    api_key: Optional[str] = None
    is_active: Optional[bool] = None


class LLMConfig(BaseModel):
    provider: str = Field(..., pattern="^(openai|anthropic|deepseek)$")
    model: str
