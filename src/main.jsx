import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App.jsx";
import AdminApp from "./AdminApp.jsx";
import "./index.css";

// Simple path-based routing — this is a single-page site with no router
// library, so /admin (and /admin/...) renders the admin dashboard instead
// of the public site. Everything else renders the public site as before.
const isAdminRoute = window.location.pathname.startsWith("/admin");

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    {isAdminRoute ? <AdminApp /> : <App />}
  </React.StrictMode>
);
