"""TMDB API service for fetching movie metadata."""

from __future__ import annotations

from collections import OrderedDict
from typing import Any, Dict, Optional

import httpx

from app.core import get_settings

TMDB_BASE_URL = "https://api.themoviedb.org/3"
TMDB_IMAGE_BASE_URL = "https://image.tmdb.org/t/p/w500"

_CACHE_SIZE = 512
_movie_cache: "OrderedDict[str, Dict[str, Any]]" = OrderedDict()


class TmdbError(RuntimeError):
    """Base error for TMDB service failures."""


class TmdbNotFoundError(TmdbError):
    """Raised when the movie cannot be found on TMDB."""


class TmdbRateLimitError(TmdbError):
    """Raised when TMDB rate limits the request (HTTP 429)."""


class TmdbApiError(TmdbError):
    """Raised when TMDB returns an unexpected error response."""


def _cache_get(key: str) -> Optional[Dict[str, Any]]:
    """Get a cached item and refresh LRU order."""

    value = _movie_cache.get(key)
    if value is not None:
        _movie_cache.move_to_end(key)
    return value


def _cache_set(key: str, value: Dict[str, Any]) -> None:
    """Set a cached item with LRU eviction."""

    _movie_cache[key] = value
    _movie_cache.move_to_end(key)
    if len(_movie_cache) > _CACHE_SIZE:
        _movie_cache.popitem(last=False)


def _normalize_title(title: str) -> str:
    """Normalize input title for cache and search purposes."""

    return " ".join(title.strip().split()).lower()


async def get_movie_details(title: str) -> Dict[str, Any]:
    """Fetch movie details from TMDB by title.

    Args:
        title: Movie title to search.

    Returns:
        A dict with title, poster_path, rating, and overview.

    Raises:
        ValueError: If the input title is empty.
        TmdbNotFoundError: If no movie matches the given title.
        TmdbRateLimitError: If TMDB rate limits the request.
        TmdbApiError: If TMDB returns an error response.
    """

    if not title or not title.strip():
        raise ValueError("Movie title must not be empty.")

    normalized = _normalize_title(title)
    cached = _cache_get(normalized)
    if cached is not None:
        return cached

    settings = get_settings()

    params = {
        "api_key": settings.tmdb_api_key,
        "query": title.strip(),
        "include_adult": "false",
    }

    async with httpx.AsyncClient(base_url=TMDB_BASE_URL, timeout=10.0) as client:
        response = await client.get("/search/movie", params=params)

    if response.status_code == 429:
        raise TmdbRateLimitError("TMDB rate limit exceeded.")
    if response.status_code >= 500:
        raise TmdbApiError("TMDB service is currently unavailable.")
    if response.status_code >= 400:
        raise TmdbApiError(
            f"TMDB request failed with status {response.status_code}."
        )

    payload = response.json()
    results = payload.get("results", [])
    if not results:
        raise TmdbNotFoundError(f"Movie not found: {title}")

    movie = results[0]
    poster_path = movie.get("poster_path")

    details = {
        "title": movie.get("title") or title.strip(),
        "poster_path": f"{TMDB_IMAGE_BASE_URL}{poster_path}"
        if poster_path
        else None,
        "rating": movie.get("vote_average"),
        "overview": movie.get("overview"),
    }

    _cache_set(normalized, details)
    return details
