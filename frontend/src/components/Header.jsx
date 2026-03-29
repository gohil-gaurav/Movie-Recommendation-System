import { useState } from "react";
import { useNavigate } from "react-router-dom";

import SearchBar from "./SearchBar.jsx";
import "./Header.css";

export default function Header() {
  const [query, setQuery] = useState("");
  const navigate = useNavigate();

  const handleSearch = (value) => {
    if (!value || !value.trim()) {
      return;
    }
    navigate(`/movie/${encodeURIComponent(value.trim())}`);
  };

  return (
    <header className="header">
      <div className="header__intro">
        <h1>Discover</h1>
        <p>Curated picks and cinematic deep dives.</p>
      </div>
      <div className="header__actions">
        <SearchBar
          value={query}
          onChange={setQuery}
          onSearch={handleSearch}
          loading={false}
        />
      </div>
    </header>
  );
}
