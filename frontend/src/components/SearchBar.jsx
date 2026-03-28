import { useEffect, useRef, useState } from "react";

import { fetchSuggestions } from "../services/api.js";
import "./SearchBar.css";

const DEBOUNCE_MS = 350;

function highlightMatch(text, query) {
  if (!query) {
    return text;
  }

  const lowerText = text.toLowerCase();
  const lowerQuery = query.toLowerCase();
  const index = lowerText.indexOf(lowerQuery);

  if (index === -1) {
    return text;
  }

  const before = text.slice(0, index);
  const match = text.slice(index, index + query.length);
  const after = text.slice(index + query.length);

  return (
    <>
      {before}
      <mark>{match}</mark>
      {after}
    </>
  );
}

export default function SearchBar({ value, onChange, onSearch, loading }) {
  const [suggestions, setSuggestions] = useState([]);
  const [open, setOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const wrapperRef = useRef(null);

  useEffect(() => {
    const handler = (event) => {
      if (wrapperRef.current && !wrapperRef.current.contains(event.target)) {
        setOpen(false);
      }
    };

    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  useEffect(() => {
    if (!value || !value.trim()) {
      setSuggestions([]);
      setOpen(false);
      return;
    }

    const timeout = setTimeout(async () => {
      setIsLoading(true);
      setError("");

      try {
        const results = await fetchSuggestions(value);
        setSuggestions(results);
        setOpen(true);
      } catch (err) {
        setSuggestions([]);
        setOpen(false);
        setError(err.message || "Unable to load suggestions.");
      } finally {
        setIsLoading(false);
      }
    }, DEBOUNCE_MS);

    return () => clearTimeout(timeout);
  }, [value]);

  const handleSubmit = (event) => {
    event.preventDefault();
    onSearch(event);
    setOpen(false);
  };

  const handleSelect = (suggestion) => {
    onChange(suggestion);
    setOpen(false);
  };

  return (
    <div className="search-bar" ref={wrapperRef}>
      <form onSubmit={handleSubmit} className="search-bar__form">
        <label htmlFor="movie">Movie name</label>
        <div className="search-bar__controls">
          <input
            id="movie"
            name="movie"
            type="text"
            value={value}
            onChange={(event) => onChange(event.target.value)}
            placeholder="Enter a movie title"
            autoComplete="off"
            onFocus={() => value && suggestions.length > 0 && setOpen(true)}
          />
          <button type="submit" disabled={loading}>
            {loading ? "Searching..." : "Get Recommendations"}
          </button>
        </div>
      </form>

      {open ? (
        <div className="search-bar__dropdown">
          {isLoading ? <div className="search-bar__status">Loading...</div> : null}
          {error ? <div className="search-bar__status">{error}</div> : null}
          {!isLoading && !error && suggestions.length === 0 ? (
            <div className="search-bar__status">No suggestions.</div>
          ) : null}
          {!isLoading && !error && suggestions.length > 0 ? (
            <ul>
              {suggestions.map((item) => (
                <li key={item}>
                  <button type="button" onClick={() => handleSelect(item)}>
                    {highlightMatch(item, value)}
                  </button>
                </li>
              ))}
            </ul>
          ) : null}
        </div>
      ) : null}
    </div>
  );
}
