"""Recommendation API routes."""

from __future__ import annotations

from pathlib import Path
from typing import Any, Dict

from fastapi import APIRouter, HTTPException, Query, status

from app.core import get_settings
from app.services import get_enriched_recommendations
from app.utils import ArtifactLoadError

router = APIRouter(tags=["Recommendations"])


@router.get(
    "/recommend",
    summary="Get movie recommendations",
)
async def recommend_movies(movie: str | None = Query(None, description="Movie title")) -> Dict[str, Any]:
    """Return movie recommendations enriched with TMDB data."""

    if movie is None or not movie.strip():
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Query parameter 'movie' is required.",
        )

    settings = get_settings()
    base_dir = Path(__file__).resolve().parents[2]
    data_dir = settings.data_dir
    if not data_dir.is_absolute():
        data_dir = base_dir / data_dir

    movies_path = str(data_dir / settings.movies_artifact)
    tfidf_path = str(data_dir / settings.tfidf_artifact)
    indices_path = str(data_dir / settings.indices_artifact)

    try:
        results = await get_enriched_recommendations(
            title=movie,
            movies_path=movies_path,
            tfidf_path=tfidf_path,
            indices_path=indices_path,
        )
    except FileNotFoundError as exc:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Missing artifact file: {exc}",
        )
    except (ArtifactLoadError, ValueError) as exc:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Invalid artifact data: {exc}",
        )
    except Exception:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to generate recommendations.",
        )

    if not results:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="No recommendations found for the given movie.",
        )

    return {"movie": movie.strip(), "results": results}
