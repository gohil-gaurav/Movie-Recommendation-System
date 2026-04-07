import SkeletonCard from "./SkeletonCard.jsx";
import "./Skeleton.css";

export default function SkeletonGrid({ title, count = 6 }) {
  const items = Array.from({ length: count }, (_, index) => index);

  return (
    <section className="movie-row skeleton-row" aria-busy="true" aria-live="polite">
      <div className="movie-row__header">
        <h2>{title}</h2>
        <div className="skeleton-line skeleton-line--button skeleton-shimmer" aria-hidden="true" />
      </div>
      <div className="movie-row__scroller">
        <div className="movie-row__list">
          {items.map((item) => (
            <SkeletonCard key={item} />
          ))}
        </div>
      </div>
    </section>
  );
}
