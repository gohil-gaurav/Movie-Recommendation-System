const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

function assertApiBaseUrl() {
  if (!API_BASE_URL || !String(API_BASE_URL).trim()) {
    throw new Error(
      "VITE_API_BASE_URL is missing. Set it in frontend/.env (example: http://localhost:8000)."
    );
  }
}

async function parseResponse(response, fallbackMessage) {
  if (!response.ok) {
    const payload = await response.json().catch(() => ({}));
    const message = payload.detail || fallbackMessage;
    throw new Error(message);
  }

  return response.json();
}

export async function fetchRecommendations(movie) {
  assertApiBaseUrl();
  if (!movie || !movie.trim()) {
    return { results: [] };
  }

  const response = await fetch(
    `${API_BASE_URL}/recommend?movie=${encodeURIComponent(movie)}`
  );
  return parseResponse(response, "Failed to fetch recommendations.");
}

export async function fetchPopularMovies() {
  assertApiBaseUrl();
  const response = await fetch(`${API_BASE_URL}/movies/popular`);
  const data = await parseResponse(response, "Failed to fetch popular movies.");
  return Array.isArray(data.results) ? data.results : [];
}

export async function fetchTopRatedMovies() {
  assertApiBaseUrl();
  const response = await fetch(`${API_BASE_URL}/movies/top-rated`);
  const data = await parseResponse(response, "Failed to fetch top-rated movies.");
  return Array.isArray(data.results) ? data.results : [];
}

export async function fetchTrendingMovies() {
  assertApiBaseUrl();
  const response = await fetch(`${API_BASE_URL}/movies/trending`);
  const data = await parseResponse(response, "Failed to fetch trending movies.");
  return Array.isArray(data.results) ? data.results : [];
}

export async function fetchMoviesByGenre(genre) {
  assertApiBaseUrl();
  if (!genre || !String(genre).trim()) {
    return [];
  }

  const response = await fetch(
    `${API_BASE_URL}/movies/genre?genre=${encodeURIComponent(String(genre).trim())}`
  );
  const data = await parseResponse(response, "Failed to fetch movies by genre.");
  return Array.isArray(data.results) ? data.results : [];
}

export async function fetchSuggestions(query) {
  assertApiBaseUrl();
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
  assertApiBaseUrl();
  if (!title || !title.trim()) {
    throw new Error("Movie title is required.");
  }

  const response = await fetch(
    `${API_BASE_URL}/movie?title=${encodeURIComponent(title)}`
  );
  return parseResponse(response, "Failed to fetch movie details.");
}
