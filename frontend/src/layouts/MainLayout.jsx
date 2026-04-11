import { useEffect, useState } from "react";
import { Outlet } from "react-router-dom";

import Header from "../components/Header.jsx";
import Sidebar from "../components/Sidebar.jsx";
import Toast from "../components/Toast.jsx";
import "./MainLayout.css";

export default function MainLayout() {
  const [toastMessage, setToastMessage] = useState("");
  const [toastVisible, setToastVisible] = useState(false);

  useEffect(() => {
    const handleToast = (event) => {
      setToastMessage(event.detail);
      setToastVisible(true);
    };

    window.addEventListener("cinevault:toast", handleToast);
    return () => window.removeEventListener("cinevault:toast", handleToast);
  }, []);

  return (
    <div className="layout">
      <Sidebar />
      <div className="layout__main">
        <Header />
        <Outlet />
      </div>
      <Toast
        message={toastMessage}
        visible={toastVisible}
        onClose={() => setToastVisible(false)}
      />
    </div>
  );
}
