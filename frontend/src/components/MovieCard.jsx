import { useMemo, useState } from "react";
import { Link } from "react-router-dom";

import "./MovieCard.css";
import {
  addToWatchlist,
  isInWatchlist,
  removeFromWatchlist
} from "../utils/watchlist.js";

function formatRating(value) {
  if (value === null || value === undefined || Number.isNaN(Number(value))) {
    return "N/A";
  }

  return Number(value).toFixed(1);
}

export default function MovieCard({ movie }) {
  const title = movie.title || "Untitled";
  const movieId = movie?.id;
  const initiallyFavorited = useMemo(() => isInWatchlist(movieId), [movieId]);
  const [favorited, setFavorited] = useState(initiallyFavorited);

  const showToast = (message) => {
    window.dispatchEvent(new CustomEvent("cinevault:toast", { detail: message }));
  };

  const handleFavoriteClick = (event) => {
    event.preventDefault();
    event.stopPropagation();

    if (!movieId) {
      showToast("Unavailable for watchlist");
      return;
    }

    if (favorited) {
      removeFromWatchlist(movieId);
      setFavorited(false);
      showToast("Removed from watchlist");
      return;
    }

    addToWatchlist(movie);
    setFavorited(true);
    showToast("Added to watchlist");
  };

  const favoriteLabel = favorited ? "Remove from watchlist" : "Add to watchlist";

  return (
    <article className="movie-card">
      <Link className="movie-card__link" to={`/movie/${encodeURIComponent(title)}`}>
        <div className="movie-card__poster">
          {movie.poster ? (
            <img src={movie.poster} alt={title} loading="lazy" />
          ) : (
            <div className="movie-card__poster-placeholder">No image</div>
          )}
          <span className="movie-card__rating">{formatRating(movie.rating)}</span>
          <button
            type="button"
            className={`movie-card__favorite${favorited ? " movie-card__favorite--active" : ""}`}
            aria-label={favoriteLabel}
            onClick={handleFavoriteClick}
          >
            <span aria-hidden="true">&#10084;</span>
          </button>
        </div>
        <div className="movie-card__content">
          <h3>{title}</h3>
          <p>{movie.tagline || movie.overview}</p>
        </div>
      </Link>
    </article>
  );
}
