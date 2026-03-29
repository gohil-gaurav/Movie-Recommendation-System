import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";

import HeroDescription from "../components/HeroDescription.jsx";
import MovieRow from "../components/MovieRow.jsx";
import { fetchMovieDetails, fetchRecommendations } from "../services/api.js";

export default function MovieDetails() {
  const { title } = useParams();
  const [movie, setMovie] = useState(null);
  const [recommendations, setRecommendations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [recommendationsError, setRecommendationsError] = useState("");

  const handleSeeRecommendations = () => {
    const row = document.getElementById("details-recommendations");
    if (row) {
      row.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  };

  const handleAddToWatchlist = () => {
    if (!movie?.title) {
      return;
    }

    const key = "watchlist";
    const existing = JSON.parse(localStorage.getItem(key) || "[]");
    const alreadyAdded = existing.some((item) => item?.title === movie.title);

    if (alreadyAdded) {
      return;
    }

    const next = [...existing, { title: movie.title, poster: movie.poster }];
    localStorage.setItem(key, JSON.stringify(next));
  };

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

  const heroGenres = Array.isArray(movie.genres)
    ? movie.genres.filter(Boolean).slice(0, 3).join(" • ")
    : movie.genres || "";

  const heroMeta = [
    movie?.rating ? `IMDb ${Number(movie.rating).toFixed(1)}` : null,
    heroGenres || null,
    movie?.release_year ? String(movie.release_year) : null
  ].filter(Boolean);

  return (
    <section className="page">
      <div className="hero" style={heroStyle}>
        <div className="hero__content">
          <p className="hero__label">Featured title</p>
          <h1>{movie.title}</h1>
          <div className="hero__meta hero__meta--chips">
            {heroMeta.map((item) => (
              <span key={item} className="hero__meta-item">
                {item}
              </span>
            ))}
          </div>
          <HeroDescription text={movie.overview} lines={3} />
          <div className="hero__actions">
            <button type="button" className="button button--primary" onClick={handleSeeRecommendations}>
              See Recommendations
            </button>
            <button type="button" className="button button--ghost" onClick={handleAddToWatchlist}>
              Add to Watchlist
            </button>
          </div>
        </div>
      </div>

      <div id="details-recommendations" />
      <MovieRow title="Recommended for you" movies={recommendations} />
      {recommendationsError ? <p>{recommendationsError}</p> : null}
    </section>
  );
}
