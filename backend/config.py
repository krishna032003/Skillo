from pydantic_settings import BaseSettings, SettingsConfigDict
from functools import lru_cache
from pathlib import Path

ENV_FILE = Path(__file__).with_name(".env")

class Settings(BaseSettings):
    gemini_api_key: str = ""
    mongo_uri: str = "mongodb://localhost:27017/skillo"
    pinecone_api_key: str = ""

    model_config = SettingsConfigDict(env_file=ENV_FILE)

@lru_cache()
def get_settings():
    return Settings()
