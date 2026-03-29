import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";

import HeroDescription from "../components/HeroDescription.jsx";
import MovieRow from "../components/MovieRow.jsx";
import {
  fetchPopularMovies,
  fetchTopRatedMovies,
  fetchTrendingMovies
} from "../services/api.js";

export default function Home() {
  const navigate = useNavigate();
  const [popularMovies, setPopularMovies] = useState([]);
  const [topRatedMovies, setTopRatedMovies] = useState([]);
  const [trendingMovies, setTrendingMovies] = useState([]);

  const [popularLoading, setPopularLoading] = useState(true);
  const [topRatedLoading, setTopRatedLoading] = useState(true);
  const [trendingLoading, setTrendingLoading] = useState(true);

  const [popularError, setPopularError] = useState("");
  const [topRatedError, setTopRatedError] = useState("");
  const [trendingError, setTrendingError] = useState("");

  useEffect(() => {
    let active = true;

    const loadHomeSections = async () => {
      setPopularLoading(true);
      setTopRatedLoading(true);
      setTrendingLoading(true);
      setPopularError("");
      setTopRatedError("");
      setTrendingError("");

      const [popularResult, topRatedResult, trendingResult] = await Promise.allSettled([
        fetchPopularMovies(),
        fetchTopRatedMovies(),
        fetchTrendingMovies()
      ]);

      if (!active) {
        return;
      }

      if (popularResult.status === "fulfilled") {
        setPopularMovies(popularResult.value);
      } else {
        setPopularMovies([]);
        setPopularError(popularResult.reason?.message || "Unable to load popular movies.");
      }
      setPopularLoading(false);

      if (topRatedResult.status === "fulfilled") {
        setTopRatedMovies(topRatedResult.value);
      } else {
        setTopRatedMovies([]);
        setTopRatedError(topRatedResult.reason?.message || "Unable to load top-rated movies.");
      }
      setTopRatedLoading(false);

      if (trendingResult.status === "fulfilled") {
        setTrendingMovies(trendingResult.value);
      } else {
        setTrendingMovies([]);
        setTrendingError(trendingResult.reason?.message || "Unable to load trending movies.");
      }
      setTrendingLoading(false);
    };

    loadHomeSections();
    return () => {
      active = false;
    };
  }, []);

  const sectionData = useMemo(() => {
    const usedIds = new Set();

    const removeDuplicates = (movies) => {
      const uniqueMovies = [];
      for (const movie of movies) {
        const movieId = movie?.id;
        if (!movieId) {
          uniqueMovies.push(movie);
          continue;
        }
        if (usedIds.has(movieId)) {
          continue;
        }
        usedIds.add(movieId);
        uniqueMovies.push(movie);
      }
      return uniqueMovies;
    };

    return {
      trending: removeDuplicates(trendingMovies),
      popular: removeDuplicates(popularMovies),
      topRated: removeDuplicates(topRatedMovies)
    };
  }, [popularMovies, topRatedMovies, trendingMovies]);

  const heroMovie = sectionData.trending[0] || sectionData.popular[0] || sectionData.topRated[0] || null;

  const heroStyle = {
    "--hero-bg": `url(${heroMovie?.poster || ""})`
  };

  const handleViewDetails = () => {
    if (!heroMovie?.title) {
      return;
    }
    navigate(`/movie/${encodeURIComponent(heroMovie.title)}`);
  };

  const handleSeeRecommendations = () => {
    const row = document.getElementById("home-recommendations");
    if (row) {
      row.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  };

  const heroGenres = Array.isArray(heroMovie?.genres)
    ? heroMovie.genres.filter(Boolean).slice(0, 2).join(" • ")
    : "";

  const heroMeta = [
    heroMovie?.rating ? `IMDb ${Number(heroMovie.rating).toFixed(1)}` : null,
    heroGenres || null,
    heroMovie?.release_year ? String(heroMovie.release_year) : null
  ].filter(Boolean);

  return (
    <section className="page">
      <div className="hero" style={heroStyle}>
        <div className="hero__content">
          <p className="hero__label">Recommended for you</p>
          <h1>{heroMovie?.title || "Discover your next favorite movie"}</h1>
          <div className="hero__meta hero__meta--chips">
            {heroMeta.map((item) => (
              <span key={item} className="hero__meta-item">
                {item}
              </span>
            ))}
          </div>
          <HeroDescription
            text={
              heroMovie?.overview ||
              "Browse popular, top-rated, and trending picks curated from TMDB."
            }
            lines={3}
          />
          <div className="hero__actions">
            <button type="button" className="button button--primary" onClick={handleViewDetails}>
              View Details
            </button>
            <button type="button" className="button button--ghost" onClick={handleSeeRecommendations}>
              See Recommendations
            </button>
          </div>
        </div>
      </div>

      <div id="home-recommendations" />
      {trendingLoading ? <p>Loading Trending Movies...</p> : null}
      {trendingError ? <p>{trendingError}</p> : null}
      {!trendingLoading && !trendingError ? (
        <MovieRow title="Trending Movies" movies={sectionData.trending} />
      ) : null}

      {popularLoading ? <p>Loading Popular Movies...</p> : null}
      {popularError ? <p>{popularError}</p> : null}
      {!popularLoading && !popularError ? (
        <MovieRow title="Popular Movies" movies={sectionData.popular} />
      ) : null}

      {topRatedLoading ? <p>Loading Top Rated Movies...</p> : null}
      {topRatedError ? <p>{topRatedError}</p> : null}
      {!topRatedLoading && !topRatedError ? (
        <MovieRow title="Top Rated Movies" movies={sectionData.topRated} />
      ) : null}
    </section>
  );
}
