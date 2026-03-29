const basePoster = "https://image.tmdb.org/t/p/w500";

export const movies = [
  {
    id: "1",
    title: "Blade Runner 2049",
    poster: `${basePoster}/gajva2L0rPYkEWjzgFlBXCAVBE5.jpg`,
    rating: 8.1,
    overview:
      "Young Blade Runner K's discovery of a long-buried secret leads him to track down former blade runner Rick Deckard.",
    tagline: "The key to the future is finally unearthed.",
    genre: "Sci-Fi",
    runtime: 164
  },
  {
    id: "2",
    title: "The Dark Knight",
    poster: `${basePoster}/qJ2tW6WMUDux911r6m7haRef0WH.jpg`,
    rating: 8.5,
    overview:
      "Batman raises the stakes in his war on crime with the help of Lt. Jim Gordon and Harvey Dent.",
    tagline: "Why so serious?",
    genre: "Action",
    runtime: 152
  },
  {
    id: "3",
    title: "Interstellar",
    poster: `${basePoster}/gEU2QniE6E77NI6lCU6MxlNBvIx.jpg`,
    rating: 8.3,
    overview:
      "A team of explorers travel through a wormhole in space in an attempt to ensure humanity's survival.",
    tagline: "Mankind was born on Earth. It was never meant to die here.",
    genre: "Adventure",
    runtime: 169
  },
  {
    id: "4",
    title: "Inception",
    poster: `${basePoster}/edv5CZvWj09upOsy2Y6IwDhK8bt.jpg`,
    rating: 8.3,
    overview:
      "A thief who steals corporate secrets through dream-sharing technology is given the inverse task of planting an idea.",
    tagline: "Your mind is the scene of the crime.",
    genre: "Thriller",
    runtime: 148
  },
  {
    id: "5",
    title: "Dune",
    poster: `${basePoster}/d5NXSklXo0qyIYkgV94XAgMIckC.jpg`,
    rating: 8.0,
    overview:
      "Paul Atreides leads nomadic tribes in a battle to control the desert planet Arrakis.",
    tagline: "Beyond fear, destiny awaits.",
    genre: "Sci-Fi",
    runtime: 155
  },
  {
    id: "6",
    title: "The Batman",
    poster: `${basePoster}/74xTEgt7R36Fpooo50r9T25onhq.jpg`,
    rating: 7.9,
    overview:
      "Batman ventures into Gotham City's underworld when a sadistic killer leaves behind a trail of clues.",
    tagline: "Unmask the truth.",
    genre: "Action",
    runtime: 176
  }
];

export const heroMovie = movies[0];

export const homeSections = [
  { title: "Popular Movies", movies },
  { title: "Top Rated", movies: [...movies].reverse() },
  { title: "Latest Releases", movies: movies.slice(1) }
];

export const categories = {
  popular: { title: "Popular Movies", movies },
  "top-rated": { title: "Top Rated", movies: [...movies].reverse() },
  latest: { title: "Latest Movies", movies: movies.slice(0, 4) },
  action: { title: "Action", movies: movies.filter((movie) => movie.genre === "Action") },
  comedy: { title: "Comedy", movies: movies.slice(0, 2) },
  drama: { title: "Drama", movies: movies.slice(2, 4) },
  "sci-fi": { title: "Sci-Fi", movies: movies.filter((movie) => movie.genre === "Sci-Fi") }
};

export const movieIndex = movies.reduce((acc, movie) => {
  acc[movie.id] = movie;
  return acc;
}, {});
