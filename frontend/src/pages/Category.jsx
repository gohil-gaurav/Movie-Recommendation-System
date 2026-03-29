import { useParams } from "react-router-dom";

import MovieRow from "../components/MovieRow.jsx";
import { categories } from "../utils/mockData.js";

export default function Category() {
  const { slug } = useParams();
  const category = categories[slug] || categories.popular;

  return (
    <section className="page">
      <h1>{category.title}</h1>
      <MovieRow title={category.title} movies={category.movies} />
    </section>
  );
}
