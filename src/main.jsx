/**
 * main.jsx — Standalone entry point only.
 * When loaded as a Module Federation remote by superadmin,
 * this file is NOT executed. Each exposed component is imported directly.
 *
 * When running `npm run dev` or `npm run preview` alone,
 * this mounts the standalone App (with its own Login page).
 */
import React from "react";
import ReactDOM from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import App from "./App";
import "./index.css";

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <BrowserRouter>
      <App />
    </BrowserRouter>
  </React.StrictMode>
);
