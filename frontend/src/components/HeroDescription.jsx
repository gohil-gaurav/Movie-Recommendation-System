import { useMemo, useState } from "react";

const TOGGLE_THRESHOLD = 150;

export default function HeroDescription({ text, lines = 3 }) {
  const [expanded, setExpanded] = useState(false);

  const normalizedText = useMemo(() => {
    if (!text) {
      return "";
    }
    return String(text).trim();
  }, [text]);

  const canToggle = normalizedText.length > TOGGLE_THRESHOLD;

  if (!normalizedText) {
    return null;
  }

  return (
    <div className="hero__description">
      <p
        className={expanded ? "hero__description-text is-expanded" : "hero__description-text"}
        style={{ "--hero-description-lines": String(lines) }}
      >
        {normalizedText}
      </p>
      {canToggle ? (
        <button
          type="button"
          className="hero__description-toggle"
          onClick={() => setExpanded((value) => !value)}
          aria-expanded={expanded}
        >
          {expanded ? "Show Less" : "Read More"}
        </button>
      ) : null}
    </div>
  );
}