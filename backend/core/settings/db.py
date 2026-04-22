from pydantic_settings import BaseSettings, SettingsConfigDict
from core.settings.env import ENVSettings

env_settings = ENVSettings()


class DBSettings(BaseSettings):
    PG_NAME: str
    PG_HOST: str
    PG_PORT: int
    PG_USER: str
    PG_PASSWORD: str

    REDIS_HOST: str
    REDIS_PORT: int
    REDIS_PASSWORD: str
    REDIS_DB: int

    @property
    def DATABASE_URL(self):
        return f"postgresql+asyncpg://{self.PG_USER}:{self.PG_PASSWORD}@{self.PG_HOST}:{self.PG_PORT}/{self.PG_NAME}"

    @property
    def REDIS_URL(self):
        return f"redis://:{self.REDIS_PASSWORD}@{self.REDIS_HOST}:{self.REDIS_PORT}/{self.REDIS_DB}"

    model_config = SettingsConfigDict(
        env_file=f".env.{env_settings.ENV}",
        env_file_encoding="utf-8",
        extra="ignore",
    )
