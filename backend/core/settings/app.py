from pydantic_settings import BaseSettings, SettingsConfigDict
from core.settings.env import ENVSettings
env_settings = ENVSettings()
# 项目基础配置
class APPSettings(BaseSettings):
    APP_NAME: str
    # JWT 配置
    JWT_SECRET_KEY: str
    JWT_ALGORITHM: str
    ACCESS_TOKEN_EXPIRE_MINUTES: int
    REFRESH_TOKEN_EXPIRE_DAYS: int

    model_config = SettingsConfigDict(
        env_file=f".env.{env_settings.ENV}",
        env_file_encoding="utf-8",
        extra="ignore",  # 可选，避免 .env 里多余字段时报错
    )
