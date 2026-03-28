import { useState } from "react";

import { fetchRecommendations } from "../services/api.js";

export function useRecommendations() {
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const fetchForMovie = async (movie) => {
    setLoading(true);
    setError("");
    try {
      const data = await fetchRecommendations(movie);
      setResults(data.results ?? []);
    } catch (err) {
      setResults([]);
      setError(err.message || "Unable to fetch recommendations.");
    } finally {
      setLoading(false);
    }
  };

  return { results, loading, error, fetchForMovie };
}
