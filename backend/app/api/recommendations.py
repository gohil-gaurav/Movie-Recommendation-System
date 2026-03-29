"""Recommendation API routes."""

from __future__ import annotations

from pathlib import Path
from typing import Any, Dict

from fastapi import APIRouter, HTTPException, Query, status

from app.core import get_settings
from app.services import get_enriched_recommendations, get_local_movie_details
from app.services.tmdb import (
    TmdbApiError,
    TmdbError,
    TmdbRateLimitError,
    get_movie_details,
    get_popular_movies,
    get_top_rated_movies,
    get_trending_movies,
)
from app.utils import ArtifactLoadError

router = APIRouter(tags=["Recommendations"])


def _raise_tmdb_http_error(exc: Exception) -> None:
    """Map TMDB service exceptions to API HTTP errors."""

    if isinstance(exc, TmdbRateLimitError):
        raise HTTPException(
            status_code=status.HTTP_429_TOO_MANY_REQUESTS,
            detail="TMDB rate limit exceeded. Please try again shortly.",
        )
    if isinstance(exc, TmdbApiError):
        raise HTTPException(
            status_code=status.HTTP_502_BAD_GATEWAY,
            detail="TMDB service error.",
        )
    if isinstance(exc, TmdbError):
        raise HTTPException(
            status_code=status.HTTP_502_BAD_GATEWAY,
            detail="Failed to fetch data from TMDB.",
        )
    raise HTTPException(
        status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
        detail="Unexpected server error while fetching movies.",
    )


@router.get(
    "/movies/popular",
    summary="Get popular movies",
)
async def popular_movies() -> Dict[str, Any]:
    """Return TMDB popular movies list."""

    try:
        results = await get_popular_movies()
    except Exception as exc:
        _raise_tmdb_http_error(exc)
    return {"results": results}


@router.get(
    "/movies/top-rated",
    summary="Get top-rated movies",
)
async def top_rated_movies() -> Dict[str, Any]:
    """Return TMDB top-rated movies list."""

    try:
        results = await get_top_rated_movies()
    except Exception as exc:
        _raise_tmdb_http_error(exc)
    return {"results": results}


@router.get(
    "/movies/trending",
    summary="Get trending movies",
)
async def trending_movies() -> Dict[str, Any]:
    """Return TMDB trending movies list."""

    try:
        results = await get_trending_movies()
    except Exception as exc:
        _raise_tmdb_http_error(exc)
    return {"results": results}


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


@router.get(
    "/movie",
    summary="Get movie details",
)
async def get_movie(title: str | None = Query(None, description="Movie title")) -> Dict[str, Any]:
    """Return movie details using local data with TMDB poster enrichment."""

    if title is None or not title.strip():
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Query parameter 'title' is required.",
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
        local_details = get_local_movie_details(
            title=title,
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

    if not local_details:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Movie not found in local dataset.",
        )

    poster = None
    try:
        tmdb_details = await get_movie_details(title)
        poster = tmdb_details.get("poster_path")
    except TmdbError:
        poster = None

    local_details["poster"] = poster
    return local_details
