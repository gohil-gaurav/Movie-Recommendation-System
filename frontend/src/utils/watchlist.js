const WATCHLIST_KEY = "watchlist";

function safeParse(value) {
  try {
    const parsed = JSON.parse(value);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

function getStorage() {
  if (typeof window === "undefined") {
    return null;
  }
  return window.localStorage;
}

export function getWatchlist() {
  const storage = getStorage();
  if (!storage) {
    return [];
  }

  return safeParse(storage.getItem(WATCHLIST_KEY));
}

function saveWatchlist(items) {
  const storage = getStorage();
  if (!storage) {
    return;
  }

  storage.setItem(WATCHLIST_KEY, JSON.stringify(items));
}

export function isInWatchlist(movieId) {
  if (!movieId) {
    return false;
  }

  return getWatchlist().some((item) => String(item.id) === String(movieId));
}

export function addToWatchlist(movie) {
  if (!movie?.id) {
    return false;
  }

  const list = getWatchlist();
  if (list.some((item) => String(item.id) === String(movie.id))) {
    return false;
  }

  const next = [
    ...list,
    {
      id: movie.id,
      title: movie.title,
      poster: movie.poster || null,
      rating: movie.rating ?? null
    }
  ];

  saveWatchlist(next);
  return true;
}

export function removeFromWatchlist(movieId) {
  if (!movieId) {
    return false;
  }

  const list = getWatchlist();
  const next = list.filter((item) => String(item.id) !== String(movieId));

  if (next.length === list.length) {
    return false;
  }

  saveWatchlist(next);
  return true;
}
