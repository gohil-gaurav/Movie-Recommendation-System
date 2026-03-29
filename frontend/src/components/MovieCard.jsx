import { Link } from "react-router-dom";

import "./MovieCard.css";

function formatRating(value) {
  if (value === null || value === undefined || Number.isNaN(Number(value))) {
    return "N/A";
  }

  return Number(value).toFixed(1);
}

export default function MovieCard({ movie }) {
  const title = movie.title || "Untitled";
  return (
    <Link className="movie-card" to={`/movie/${encodeURIComponent(title)}`}>
      <div className="movie-card__poster">
        {movie.poster ? (
          <img src={movie.poster} alt={title} loading="lazy" />
        ) : (
          <div className="movie-card__poster-placeholder">No image</div>
        )}
        <span className="movie-card__rating">{formatRating(movie.rating)}</span>
      </div>
      <div className="movie-card__content">
        <h3>{title}</h3>
        <p>{movie.tagline || movie.overview}</p>
      </div>
    </Link>
  );
}
