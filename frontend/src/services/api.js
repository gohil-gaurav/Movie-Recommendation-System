const API_BASE_URL = "http://localhost:8000";

export async function fetchRecommendations(movie) {
  if (!movie || !movie.trim()) {
    return { results: [] };
  }

  const response = await fetch(
    `${API_BASE_URL}/recommend?movie=${encodeURIComponent(movie)}`
  );

  if (!response.ok) {
    const payload = await response.json().catch(() => ({}));
    const message = payload.detail || "Failed to fetch recommendations.";
    throw new Error(message);
  }

  return response.json();
}

export async function fetchSuggestions(query) {
  if (!query || !query.trim()) {
    return [];
  }

  const response = await fetch(
    `${API_BASE_URL}/suggest?query=${encodeURIComponent(query)}`
  );

  if (!response.ok) {
    const payload = await response.json().catch(() => ({}));
    const message = payload.detail || "Failed to fetch suggestions.";
    throw new Error(message);
  }

  const data = await response.json();
  return Array.isArray(data.results) ? data.results : [];
}
