"""Application configuration using Pydantic settings.

This module provides a singleton Settings instance for the app.
"""

from functools import lru_cache
from pathlib import Path

from pydantic import Field
from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    """Central application settings loaded from environment variables."""

    model_config = SettingsConfigDict(
        env_file=".env",
        env_file_encoding="utf-8",
        case_sensitive=False,
    )

    # Core app settings
    app_name: str = Field("Movie Recommendation API", env="APP_NAME")
    app_description: str = Field(
        "Production-ready movie recommendation service.", env="APP_DESCRIPTION"
    )
    app_version: str = Field("1.0.0", env="APP_VERSION")
    debug: bool = Field(False, env="DEBUG")

    # CORS settings
    cors_origins: str = Field("*", env="CORS_ORIGINS")

    # External service settings
    tmdb_api_key: str = Field(..., env="TMDB_API_KEY")

    # ML artifact settings
    data_dir: Path = Field(Path("data"), env="DATA_DIR")
    movies_artifact: str = Field("movies.pkl", env="MOVIES_ARTIFACT")
    tfidf_artifact: str = Field("tfidf_matrix.pkl", env="TFIDF_ARTIFACT")
    indices_artifact: str = Field("indices.pkl", env="INDICES_ARTIFACT")



@lru_cache(maxsize=1)
def get_settings() -> Settings:
    """Return a cached Settings instance (singleton)."""

    return Settings()
