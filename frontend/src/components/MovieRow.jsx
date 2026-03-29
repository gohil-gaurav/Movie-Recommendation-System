import MovieCard from "./MovieCard.jsx";
import "./MovieRow.css";

export default function MovieRow({ title, movies }) {
  return (
    <section className="movie-row">
      <div className="movie-row__header">
        <h2>{title}</h2>
        <button type="button">Explore all</button>
      </div>
      <div className="movie-row__scroller">
        <div className="movie-row__list">
          {movies.map((movie) => (
            <MovieCard key={movie.id || movie.title} movie={movie} />
          ))}
        </div>
      </div>
    </section>
  );
}
