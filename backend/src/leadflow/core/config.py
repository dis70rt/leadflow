from functools import lru_cache
from zoneinfo import ZoneInfo

from pydantic import field_validator
from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    model_config = SettingsConfigDict(env_file=("../.env", ".env"), extra="ignore")
    database_url: str = "postgresql+psycopg://leadflow:leadflow_dev@localhost:5432/leadflow"
    solr_url: str = "http://localhost:8983/solr/leads"
    business_timezone: str = "Asia/Kolkata"
    seed_demo: bool = False
    cors_origins: list[str] = ["http://localhost:3000"]

    @field_validator("business_timezone")
    @classmethod
    def valid_timezone(cls, value: str) -> str:
        ZoneInfo(value)
        return value


@lru_cache
def get_settings() -> Settings:
    return Settings()
