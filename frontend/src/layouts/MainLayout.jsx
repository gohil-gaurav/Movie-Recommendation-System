import { Outlet } from "react-router-dom";

import Header from "../components/Header.jsx";
import Sidebar from "../components/Sidebar.jsx";
import "./MainLayout.css";

export default function MainLayout() {
  return (
    <div className="layout">
      <Sidebar />
      <div className="layout__main">
        <Header />
        <Outlet />
      </div>
    </div>
  );
}
