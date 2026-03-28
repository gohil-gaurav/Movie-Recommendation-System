"""Utilities for loading ML artifacts (pickle files) with caching."""

from __future__ import annotations

import pickle
from functools import lru_cache
from pathlib import Path
from typing import Any, Dict


class ArtifactLoadError(RuntimeError):
    """Raised when an artifact cannot be loaded."""


@lru_cache(maxsize=32)
def load_pickle(path: str | Path) -> Any:
    """Load a pickle file once and cache the result.

    Args:
        path: Path to the pickle file.

    Returns:
        The deserialized Python object stored in the pickle file.

    Raises:
        FileNotFoundError: If the file does not exist.
        ArtifactLoadError: If the file cannot be read or is corrupted.
    """

    file_path = Path(path)
    if not file_path.exists():
        raise FileNotFoundError(f"Artifact not found: {file_path}")

    try:
        with file_path.open("rb") as handle:
            return pickle.load(handle)
    except (pickle.UnpicklingError, EOFError, OSError) as exc:
        raise ArtifactLoadError(f"Failed to load artifact: {file_path}") from exc


def load_artifacts(paths: Dict[str, str | Path]) -> Dict[str, Any]:
    """Load multiple artifacts by name using the cached loader.

    Args:
        paths: Mapping of artifact names to pickle file paths.

    Returns:
        Mapping of artifact names to loaded objects.
    """

    return {name: load_pickle(path) for name, path in paths.items()}
