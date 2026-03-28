import { useState } from "react";

import MovieCard from "../components/MovieCard.jsx";
import SearchBar from "../components/SearchBar.jsx";
import { useRecommendations } from "../hooks/useRecommendations.js";

export default function Home() {
  const [movie, setMovie] = useState("");
  const { results, error, loading, fetchForMovie } = useRecommendations();

  const handleSubmit = async (event) => {
    event.preventDefault();
    await fetchForMovie(movie);
  };

  return (
    <main className="home">
      <h1>Movie Recommendation System</h1>
      <p>Find similar movies and enrich them with TMDB data.</p>

      <SearchBar
        value={movie}
        onChange={setMovie}
        onSearch={handleSubmit}
        loading={loading}
      />

      {error ? <p>{error}</p> : null}

      <section>
        <h2>Recommendations</h2>
        <div className="movie-grid">
          {results.map((item) => (
            <MovieCard key={item.title} movie={item} />
          ))}
        </div>
      </section>
    </main>
  );
}
