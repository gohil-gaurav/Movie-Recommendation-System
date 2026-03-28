import "./MovieCard.css";

const OVERVIEW_LIMIT = 160;

function truncate(text) {
  if (!text) {
    return "Overview not available.";
  }

  const normalized = String(text).trim();
  if (normalized.length <= OVERVIEW_LIMIT) {
    return normalized;
  }

  return `${normalized.slice(0, OVERVIEW_LIMIT).trim()}...`;
}

function formatRating(value) {
  if (value === null || value === undefined || Number.isNaN(Number(value))) {
    return "N/A";
  }

  return Number(value).toFixed(1);
}

export default function MovieCard({ movie }) {
  return (
    <article className="movie-card">
      <div className="movie-card__poster">
        {movie.poster ? (
          <img src={movie.poster} alt={movie.title} loading="lazy" />
        ) : (
          <div className="movie-card__poster-placeholder">No image</div>
        )}
      </div>
      <div className="movie-card__content">
        <div className="movie-card__header">
          <h3>{movie.title}</h3>
          <span className="movie-card__rating">{formatRating(movie.rating)}</span>
        </div>
        <p className="movie-card__overview">{truncate(movie.overview)}</p>
      </div>
    </article>
  );
}
