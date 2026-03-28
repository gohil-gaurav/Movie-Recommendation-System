"""Service that combines ML recommendations with TMDB enrichment."""

from __future__ import annotations

import asyncio
import ast
from typing import Any, Dict, List

from app.services.recommender import get_recommendations, load_recommender_artifacts
from app.services.tmdb import TmdbError, get_movie_details


async def get_enriched_recommendations(
    title: str,
    movies_path: str,
    tfidf_path: str,
    indices_path: str,
    top_n: int = 10,
) -> List[Dict[str, Any]]:
    """Return enriched recommendations for a movie title.

    This uses the ML recommender to find similar movies and then fetches
    TMDB metadata for each recommendation concurrently.
    """

    if not title or not title.strip():
        return []

    recommended_titles = get_recommendations(
        title=title,
        movies_path=movies_path,
        tfidf_path=tfidf_path,
        indices_path=indices_path,
        top_n=top_n,
    )

    if not recommended_titles:
        return []

    movies, _, index_map, index_map_lower, _ = load_recommender_artifacts(
        movies_path, tfidf_path, indices_path
    )

    unique_titles = _unique_in_order(recommended_titles)
    tasks = [get_movie_details(name) for name in unique_titles]

    results = await asyncio.gather(*tasks, return_exceptions=True)
    poster_by_title: Dict[str, str | None] = {}
    for name, result in zip(unique_titles, results):
        if isinstance(result, TmdbError) or isinstance(result, Exception):
            poster_by_title[name] = None
            continue
        poster_by_title[name] = result.get("poster_path")

    enriched: List[Dict[str, Any]] = []
    for name in unique_titles:
        local_details = _get_local_details(name, movies, index_map, index_map_lower)
        if local_details is None:
            continue
        local_details["poster"] = poster_by_title.get(name)
        enriched.append(local_details)

    return enriched


def _unique_in_order(titles: List[str]) -> List[str]:
    """Preserve order while removing duplicates."""

    seen: set[str] = set()
    unique: List[str] = []
    for item in titles:
        if item in seen:
            continue
        seen.add(item)
        unique.append(item)
    return unique


def _get_local_details(
    title: str,
    movies: Any,
    index_map: Dict[str, int],
    index_map_lower: Dict[str, int],
) -> Dict[str, Any] | None:
    """Build local dataset details for a movie title."""

    idx = index_map.get(title)
    if idx is None:
        idx = index_map_lower.get(title.lower())
    if idx is None:
        return None

    row = _get_row(movies, idx)
    if row is None:
        return None

    return {
        "title": _get_value(row, "title") or title,
        "overview": _get_value(row, "overview"),
        "genres": _normalize_genres(_get_value(row, "genres")),
        "rating": _to_float(_get_value(row, "vote_average")),
        "popularity": _to_float(_get_value(row, "popularity")),
        "tagline": _get_value(row, "tagline"),
        "poster": None,
    }


def _get_row(movies: Any, idx: int) -> Any | None:
    """Safely fetch a row from a DataFrame-like object."""

    try:
        return movies.iloc[idx]
    except Exception:
        return None


def _get_value(row: Any, key: str) -> Any:
    """Return a value from a Series/dict-like row."""

    if hasattr(row, "get"):
        return row.get(key)
    try:
        return row[key]
    except Exception:
        return None


def _normalize_genres(value: Any) -> List[str] | str | None:
    """Normalize genre values to a list of strings when possible."""

    if value is None:
        return None
    if isinstance(value, list):
        return _normalize_genre_list(value)
    if isinstance(value, str):
        parsed = _try_parse_list(value)
        if isinstance(parsed, list):
            return _normalize_genre_list(parsed)
        return value
    return value


def _normalize_genre_list(items: List[Any]) -> List[str]:
    """Normalize a list of genre entries to names."""

    normalized: List[str] = []
    for item in items:
        if isinstance(item, dict):
            name = item.get("name")
            if name:
                normalized.append(str(name))
        else:
            normalized.append(str(item))
    return normalized


def _try_parse_list(value: str) -> Any:
    """Attempt to parse a stringified list safely."""

    stripped = value.strip()
    if not stripped.startswith("["):
        return value
    try:
        return ast.literal_eval(stripped)
    except Exception:
        return value


def _to_float(value: Any) -> float | None:
    """Convert numeric values to float when possible."""

    if value is None:
        return None
    try:
        return float(value)
    except Exception:
        return None
