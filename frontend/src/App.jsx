import { BrowserRouter, Route, Routes } from "react-router-dom";

import MainLayout from "./layouts/MainLayout.jsx";
import Category from "./pages/Category.jsx";
import Home from "./pages/Home.jsx";
import MovieDetails from "./pages/MovieDetails.jsx";

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route element={<MainLayout />}>
          <Route index element={<Home />} />
          <Route path="movie/:title" element={<MovieDetails />} />
          <Route path="category/:slug" element={<Category />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}
