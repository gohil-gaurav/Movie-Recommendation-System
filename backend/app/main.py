"""FastAPI application entry point."""

from __future__ import annotations

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.api import recommendations_router
from app.core import get_settings


def _parse_origins(value: str) -> list[str]:
    """Parse a comma-separated list of CORS origins."""

    return [origin.strip() for origin in value.split(",") if origin.strip()]


def create_app() -> FastAPI:
    """Create and configure the FastAPI application."""

    settings = get_settings()
    app = FastAPI(
        title=settings.app_name,
        description=settings.app_description,
        version=settings.app_version,
    )

    # CORS configuration for frontend integration.
    app.add_middleware(
        CORSMiddleware,
        allow_origins=[
            "https://cinevault-black.vercel.app"
        ],
        allow_credentials=True,
        allow_methods=["*"],
        allow_headers=["*"],
    )

    # Health check endpoint.
    @app.get("/", summary="Health check")
    async def health_check() -> dict[str, str]:
        return {"status": "ok"}

    # API routes.
    app.include_router(recommendations_router)

    return app


app = create_app()
