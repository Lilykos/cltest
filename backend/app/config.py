from pydantic_settings import BaseSettings
from typing import List


class Settings(BaseSettings):
    # Database
    DATABASE_URL: str = "postgresql://nutrition_user:nutrition_password@localhost:5432/nutrition_app"
    REDIS_URL: str = "redis://localhost:6379"

    # API Keys (optional defaults)
    DEFAULT_TAVILY_API_KEY: str = ""
    DEFAULT_OPENAI_API_KEY: str = ""
    DEFAULT_ANTHROPIC_API_KEY: str = ""
    DEFAULT_DEEPSEEK_API_KEY: str = ""

    # Encryption
    ENCRYPTION_KEY: str

    # JWT
    JWT_SECRET: str
    JWT_ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 10080  # 1 week

    # App
    PORT: int = 8000
    ENVIRONMENT: str = "development"

    # CORS
    CORS_ORIGINS: str = "http://localhost:3000,http://127.0.0.1:3000"

    @property
    def cors_origins_list(self) -> List[str]:
        return [origin.strip() for origin in self.CORS_ORIGINS.split(",")]

    class Config:
        env_file = ".env"
        case_sensitive = True


settings = Settings()
