import { useEffect, useState } from "react";

import MovieCard from "../components/MovieCard.jsx";
import { getWatchlist } from "../utils/watchlist.js";

export default function Watchlist() {
  const [movies, setMovies] = useState([]);

  useEffect(() => {
    const syncWatchlist = () => {
      setMovies(getWatchlist());
    };

    syncWatchlist();
    window.addEventListener("storage", syncWatchlist);
    return () => window.removeEventListener("storage", syncWatchlist);
  }, []);

  return (
    <section className="page watchlist">
      <h1>My Watchlist</h1>
      {movies.length === 0 ? (
        <p className="watchlist__empty">No movies added</p>
      ) : (
        <div className="watchlist__grid">
          {movies.map((movie) => (
            <MovieCard key={movie.id} movie={movie} />
          ))}
        </div>
      )}
    </section>
  );
}
