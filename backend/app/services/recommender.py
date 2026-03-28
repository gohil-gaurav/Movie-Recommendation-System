"""Movie recommendation service using TF-IDF and cosine similarity."""

from __future__ import annotations

from functools import lru_cache
from typing import Any, Mapping

import numpy as np
from sklearn.metrics.pairwise import linear_kernel

from app.utils import load_artifacts


@lru_cache(maxsize=1)
def load_recommender_artifacts(
    movies_path: str,
    tfidf_path: str,
    indices_path: str,
) -> tuple[Any, Any, dict[str, int], dict[str, int], list[str]]:
    """Load and normalize artifacts for recommendations.

    Returns:
        movies: Raw movies dataset.
        tfidf_matrix: Precomputed TF-IDF matrix.
        index_map: Title -> index mapping (original case).
        index_map_lower: Title -> index mapping (lowercased keys).
        titles: List of movie titles aligned to the TF-IDF matrix.
    """

    artifacts = load_artifacts(
        {
            "movies": movies_path,
            "tfidf_matrix": tfidf_path,
            "indices": indices_path,
        }
    )

    movies = artifacts["movies"]
    tfidf_matrix = artifacts["tfidf_matrix"]
    indices = artifacts["indices"]

    index_map = _coerce_indices(indices)
    index_map_lower = {title.lower(): idx for title, idx in index_map.items()}
    titles = _extract_titles(movies)

    return movies, tfidf_matrix, index_map, index_map_lower, titles


def get_recommendations(
    title: str,
    movies_path: str,
    tfidf_path: str,
    indices_path: str,
    top_n: int = 10,
) -> list[str]:
    """Return top-N similar movie titles for a given movie name.

    Args:
        title: Input movie title.
        movies_path: Path to the movies dataset pickle.
        tfidf_path: Path to the TF-IDF matrix pickle.
        indices_path: Path to the title->index mapping pickle.
        top_n: Number of recommendations to return.
    """

    if not title or not title.strip():
        return []

    _, _, index_map, index_map_lower, _ = load_recommender_artifacts(
        movies_path, tfidf_path, indices_path
    )

    normalized = title.strip()
    idx = index_map.get(normalized)
    if idx is None:
        idx = index_map_lower.get(normalized.lower())

    if idx is None:
        return []

    return _recommend_by_index(idx, top_n, movies_path, tfidf_path, indices_path)


@lru_cache(maxsize=4096)
def _recommend_by_index(
    idx: int,
    top_n: int,
    movies_path: str,
    tfidf_path: str,
    indices_path: str,
) -> list[str]:
    """Compute recommendations for an index and cache the result."""

    _, tfidf_matrix, _, _, titles = load_recommender_artifacts(
        movies_path, tfidf_path, indices_path
    )

    if idx < 0 or idx >= len(titles):
        return []

    # Cosine similarity for a single movie against all movies.
    scores = linear_kernel(tfidf_matrix[idx], tfidf_matrix).ravel()
    if scores.size <= 1:
        return []

    # Exclude the input movie from recommendations.
    scores[idx] = -1.0

    k = min(top_n, scores.size - 1)
    if k <= 0:
        return []

    # Fast top-k selection without full sort.
    candidate_idx = np.argpartition(scores, -k)[-k:]
    candidate_idx = candidate_idx[np.argsort(scores[candidate_idx])[::-1]]

    return [titles[i] for i in candidate_idx]


def _coerce_indices(indices: Any) -> dict[str, int]:
    """Normalize indices mapping to a standard dict of title -> index."""

    if hasattr(indices, "to_dict"):
        mapping = indices.to_dict()
    elif isinstance(indices, Mapping):
        mapping = dict(indices)
    else:
        raise ValueError("Indices artifact must be a mapping of title -> index.")

    return {str(key): int(value) for key, value in mapping.items()}


def _extract_titles(movies: Any) -> list[str]:
    """Extract title list from the movies dataset."""

    try:
        titles = movies["title"]
    except Exception as exc:
        raise ValueError("Movies artifact must include a 'title' column.") from exc

    try:
        return titles.fillna("").astype(str).tolist()
    except Exception:
        return [str(title) for title in titles]
