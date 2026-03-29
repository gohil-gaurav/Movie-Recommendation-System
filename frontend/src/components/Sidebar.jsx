import { NavLink } from "react-router-dom";

import "./Sidebar.css";

const navItems = [
  { label: "Home", to: "/", icon: "home" },
  { label: "Watchlist", to: "/watchlist", icon: "bookmark" },
  { label: "Popular Movies", to: "/category/popular", icon: "fire" },
  { label: "Top Rated", to: "/category/top-rated", icon: "star" },
  { label: "Latest Movies", to: "/category/latest", icon: "spark" }
];

const genreItems = [
  { label: "Action", to: "/category/action" },
  { label: "Comedy", to: "/category/comedy" },
  { label: "Drama", to: "/category/drama" },
  { label: "Sci-Fi", to: "/category/sci-fi" }
];

function Icon({ name }) {
  const icons = {
    home: (
      <path d="M4 10.5 12 4l8 6.5v8.5a1 1 0 0 1-1 1h-5.2a1 1 0 0 1-1-1v-5h-3.6v5a1 1 0 0 1-1 1H5a1 1 0 0 1-1-1z" />
    ),
    fire: (
      <path d="M12.4 3.2c1.2 2.2 1.1 3.8-.6 5.5-1.1 1.1-1.6 2.5-1.4 3.9 2.3-1.6 4.7-4 4.4-8.1C17 6 19 8.5 19 12.1c0 4-3.4 7.2-7 7.2s-7-3.1-7-7c0-3.1 1.9-5.8 4.7-7.1-.2 2 .4 3.6 2 4.9.1-2.2.7-4.8.7-6.9z" />
    ),
    star: (
      <path d="m12 3.5 2.6 5.3 5.9.9-4.3 4.2 1 5.8-5.2-2.7-5.2 2.7 1-5.8-4.3-4.2 5.9-.9z" />
    ),
    bookmark: (
      <path d="M7 3.5A1.5 1.5 0 0 0 5.5 5v14.1c0 .3.3.5.6.3L12 15.7l5.9 3.7c.3.2.6 0 .6-.3V5A1.5 1.5 0 0 0 17 3.5z" />
    ),
    spark: (
      <path d="m7 4 2.5 5.5L15 12l-5.5 2.5L7 20l-2.5-5.5L-1 12l5.5-2.5z" />
    )
  };

  return (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      {icons[name]}
    </svg>
  );
}

export default function Sidebar() {
  return (
    <aside className="sidebar">
      <div className="sidebar__brand">
        <span className="sidebar__logo">N</span>
        <div>
          <h2>CineVault</h2>
          <p>Movie Hub</p>
        </div>
      </div>

      <nav className="sidebar__nav">
        <p className="sidebar__section">Browse</p>
        {navItems.map((item) => (
          <NavLink
            key={item.label}
            to={item.to}
            className={({ isActive }) =>
              isActive ? "sidebar__link sidebar__link--active" : "sidebar__link"
            }
          >
            <Icon name={item.icon} />
            <span>{item.label}</span>
          </NavLink>
        ))}

        <p className="sidebar__section">Genres</p>
        {genreItems.map((item) => (
          <NavLink
            key={item.label}
            to={item.to}
            className={({ isActive }) =>
              isActive ? "sidebar__link sidebar__link--active" : "sidebar__link"
            }
          >
            <span className="sidebar__dot" />
            <span>{item.label}</span>
          </NavLink>
        ))}
      </nav>
    </aside>
  );
}
