import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";

import MovieRow from "../components/MovieRow.jsx";
import {
  fetchMoviesByGenre,
  fetchPopularMovies,
  fetchTopRatedMovies,
  fetchTrendingMovies
} from "../services/api.js";

const CATEGORY_CONFIG = {
  popular: {
    title: "Popular Movies",
    loader: fetchPopularMovies
  },
  "top-rated": {
    title: "Top Rated",
    loader: fetchTopRatedMovies
  },
  latest: {
    title: "Latest Movies",
    loader: fetchTrendingMovies
  },
  action: {
    title: "Action",
    loader: () => fetchMoviesByGenre("action")
  },
  comedy: {
    title: "Comedy",
    loader: () => fetchMoviesByGenre("comedy")
  },
  drama: {
    title: "Drama",
    loader: () => fetchMoviesByGenre("drama")
  },
  "sci-fi": {
    title: "Sci-Fi",
    loader: () => fetchMoviesByGenre("sci-fi")
  }
};

export default function Category() {
  const { slug } = useParams();
  const [movies, setMovies] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const category = CATEGORY_CONFIG[slug] || CATEGORY_CONFIG.popular;

  useEffect(() => {
    let active = true;

    const load = async () => {
      setLoading(true);
      setError("");
      try {
        const results = await category.loader();
        if (!active) {
          return;
        }
        setMovies(results);
      } catch (err) {
        if (!active) {
          return;
        }
        setMovies([]);
        setError(err.message || "Unable to load category movies.");
      } finally {
        if (active) {
          setLoading(false);
        }
      }
    };

    load();
    return () => {
      active = false;
    };
  }, [slug]);

  return (
    <section className="page">
      <h1>{category.title}</h1>
      {loading ? <p>Loading {category.title}...</p> : null}
      {error ? <p>{error}</p> : null}
      {!loading && !error ? <MovieRow title={category.title} movies={movies} /> : null}
    </section>
  );
}
