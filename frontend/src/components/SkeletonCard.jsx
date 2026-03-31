import "./Skeleton.css";

export default function SkeletonCard() {
  return (
    <div className="skeleton-card" aria-hidden="true">
      <div className="skeleton-card__poster skeleton-shimmer" />
      <div className="skeleton-line skeleton-line--title skeleton-shimmer" />
      <div className="skeleton-line skeleton-line--subtitle skeleton-shimmer" />
    </div>
  );
}
