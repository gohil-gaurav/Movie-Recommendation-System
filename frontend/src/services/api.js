const API_BASE_URL = "http://localhost:8000";

async function parseResponse(response, fallbackMessage) {
  if (!response.ok) {
    const payload = await response.json().catch(() => ({}));
    const message = payload.detail || fallbackMessage;
    throw new Error(message);
  }

  return response.json();
}

export async function fetchRecommendations(movie) {
  if (!movie || !movie.trim()) {
    return { results: [] };
  }

  const response = await fetch(
    `${API_BASE_URL}/recommend?movie=${encodeURIComponent(movie)}`
  );
  return parseResponse(response, "Failed to fetch recommendations.");
}

export async function fetchPopularMovies() {
  const response = await fetch(`${API_BASE_URL}/movies/popular`);
  const data = await parseResponse(response, "Failed to fetch popular movies.");
  return Array.isArray(data.results) ? data.results : [];
}

export async function fetchTopRatedMovies() {
  const response = await fetch(`${API_BASE_URL}/movies/top-rated`);
  const data = await parseResponse(response, "Failed to fetch top-rated movies.");
  return Array.isArray(data.results) ? data.results : [];
}

export async function fetchTrendingMovies() {
  const response = await fetch(`${API_BASE_URL}/movies/trending`);
  const data = await parseResponse(response, "Failed to fetch trending movies.");
  return Array.isArray(data.results) ? data.results : [];
}

export async function fetchSuggestions(query) {
  if (!query || !query.trim()) {
    return [];
  }

  const response = await fetch(
    `${API_BASE_URL}/suggest?query=${encodeURIComponent(query)}`
  );
  const data = await parseResponse(response, "Failed to fetch suggestions.");
  return Array.isArray(data.results) ? data.results : [];
}

export async function fetchMovieDetails(title) {
  if (!title || !title.trim()) {
    throw new Error("Movie title is required.");
  }

  const response = await fetch(
    `${API_BASE_URL}/movie?title=${encodeURIComponent(title)}`
  );
  return parseResponse(response, "Failed to fetch movie details.");
}
