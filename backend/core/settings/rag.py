from pydantic_settings import BaseSettings, SettingsConfigDict
from core.settings.env import ENVSettings

env_settings = ENVSettings()


class RAGSettings(BaseSettings):

  
    model_config = SettingsConfigDict(
        env_file=f".env.{env_settings.ENV}",
        env_file_encoding="utf-8",
        extra="ignore",
    )
