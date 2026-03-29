import { useEffect, useMemo, useState } from "react";

import MovieRow from "../components/MovieRow.jsx";
import {
  fetchPopularMovies,
  fetchTopRatedMovies,
  fetchTrendingMovies
} from "../services/api.js";

export default function Home() {
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

  return (
    <section className="page">
      <div className="hero" style={heroStyle}>
        <div className="hero__content">
          <p className="hero__label">Recommended for you</p>
          <h1>{heroMovie?.title || "Discover your next favorite movie"}</h1>
          <p>{heroMovie?.overview || "Browse popular, top-rated, and trending picks curated from TMDB."}</p>
          <div className="hero__meta">
            {heroMovie?.rating ? <span>Rating {heroMovie.rating}</span> : null}
            <span>Live TMDB lists</span>
          </div>
          <div className="hero__actions">
            <button className="button button--primary">Play</button>
            <button className="button button--ghost">More info</button>
          </div>
        </div>
      </div>

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
