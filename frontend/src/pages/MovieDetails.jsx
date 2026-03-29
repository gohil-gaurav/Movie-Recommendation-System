import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";

import MovieRow from "../components/MovieRow.jsx";
import { fetchMovieDetails, fetchRecommendations } from "../services/api.js";

export default function MovieDetails() {
  const { title } = useParams();
  const [movie, setMovie] = useState(null);
  const [recommendations, setRecommendations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [recommendationsError, setRecommendationsError] = useState("");

  useEffect(() => {
    let active = true;

    const load = async () => {
      setLoading(true);
      setError("");
      setRecommendationsError("");

      const [detailsResult, recsResult] = await Promise.allSettled([
        fetchMovieDetails(title),
        fetchRecommendations(title)
      ]);

      if (!active) {
        return;
      }

      if (detailsResult.status === "fulfilled") {
        setMovie(detailsResult.value);
      } else {
        setMovie(null);
        setError(detailsResult.reason?.message || "Unable to load movie details.");
      }

      if (recsResult.status === "fulfilled") {
        setRecommendations(recsResult.value?.results ?? []);
      } else {
        setRecommendations([]);
        setRecommendationsError(
          recsResult.reason?.message || "Unable to load recommendations for this movie."
        );
      }

      if (active) {
        setLoading(false);
      }
    };

    load();
    return () => {
      active = false;
    };
  }, [title]);

  if (loading) {
    return (
      <section className="page">
        <p>Loading movie details...</p>
      </section>
    );
  }

  if (error) {
    return (
      <section className="page">
        <h1>Movie details</h1>
        <p>{error}</p>
      </section>
    );
  }

  if (!movie) {
    return (
      <section className="page">
        <h1>Movie not found</h1>
      </section>
    );
  }

  const heroStyle = movie.poster
    ? { "--hero-bg": `url(${movie.poster})` }
    : undefined;

  return (
    <section className="page">
      <div className="hero" style={heroStyle}>
        <div className="hero__content">
          <p className="hero__label">Featured title</p>
          <h1>{movie.title}</h1>
          <p>{movie.overview}</p>
          <div className="hero__meta">
            <span>Rating {movie.rating}</span>
            <span>{Array.isArray(movie.genres) ? movie.genres.join(", ") : movie.genres}</span>
            <span>Popularity {movie.popularity}</span>
          </div>
          <div className="hero__actions">
            <button className="button button--primary">Play</button>
            <button className="button button--ghost">Add to list</button>
          </div>
        </div>
      </div>

      <MovieRow title="Recommended for you" movies={recommendations} />
      {recommendationsError ? <p>{recommendationsError}</p> : null}
    </section>
  );
}
