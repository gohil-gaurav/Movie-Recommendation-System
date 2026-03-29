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
    get_movies_by_genre,
    get_popular_movies,
    get_top_rated_movies,
    get_trending_movies,
)
from app.utils import ArtifactLoadError

router = APIRouter(tags=["Recommendations"])


def _dedupe_by_movie_id(movies: list[Dict[str, Any]]) -> list[Dict[str, Any]]:
    """Remove duplicate movies while preserving order by TMDB id when available."""

    seen_ids: set[int] = set()
    unique: list[Dict[str, Any]] = []
    for movie in movies:
        movie_id = movie.get("id")
        if isinstance(movie_id, int):
            if movie_id in seen_ids:
                continue
            seen_ids.add(movie_id)
        unique.append(movie)
    return unique


async def _fallback_recommendations(title: str, limit: int = 10) -> list[Dict[str, Any]]:
    """Fallback recommendations from TMDB lists when local model has no matches."""

    title_lower = title.strip().lower()
    trending = await get_trending_movies()
    popular = await get_popular_movies()
    merged = _dedupe_by_movie_id(trending + popular)

    filtered = [
        movie for movie in merged
        if str(movie.get("title", "")).strip().lower() != title_lower
    ]
    return filtered[:limit]


def _tmdb_details_to_movie_payload(title: str, tmdb_details: Dict[str, Any]) -> Dict[str, Any]:
    """Convert TMDB detail response to the movie payload shape expected by frontend."""

    return {
        "title": tmdb_details.get("title") or title.strip(),
        "overview": tmdb_details.get("overview"),
        "genres": tmdb_details.get("genres") or [],
        "release_year": tmdb_details.get("release_year"),
        "rating": tmdb_details.get("rating"),
        "popularity": None,
        "tagline": None,
        "poster": tmdb_details.get("poster_path"),
    }


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
    "/movies/genre",
    summary="Get movies by genre",
)
async def movies_by_genre(genre: str | None = Query(None, description="Genre slug")) -> Dict[str, Any]:
    """Return movies for supported genre slugs: action, comedy, drama, sci-fi."""

    if genre is None or not genre.strip():
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Query parameter 'genre' is required.",
        )

    try:
        results = await get_movies_by_genre(genre)
    except ValueError as exc:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=str(exc),
        )
    except Exception as exc:
        _raise_tmdb_http_error(exc)

    return {"genre": genre.strip().lower(), "results": results}


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
        try:
            results = await _fallback_recommendations(movie)
        except Exception as exc:
            _raise_tmdb_http_error(exc)

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
        try:
            tmdb_details = await get_movie_details(title)
            return _tmdb_details_to_movie_payload(title, tmdb_details)
        except Exception as exc:
            _raise_tmdb_http_error(exc)

    poster = None
    try:
        tmdb_details = await get_movie_details(title)
        poster = tmdb_details.get("poster_path")
    except TmdbError:
        poster = None

    local_details["poster"] = poster
    return local_details
