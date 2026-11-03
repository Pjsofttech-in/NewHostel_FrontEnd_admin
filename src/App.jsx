/**
 * App.jsx — STANDALONE mode only.
 * When hostelAdmin is loaded as a micro-frontend by superadmin,
 * individual components from src/remotes/ are used directly — this file is not touched.
 *
 * Standalone: shows Login then Dashboard with its own router.
 */
import React, { useEffect, useState } from "react";
import Dashboard from "./pages/Dashboard/Dashboard";
import Login from "./pages/Login/Login";

const SESSION_KEY = "hostel-session";

const loadSession = () => {
  try {
    const data = JSON.parse(localStorage.getItem(SESSION_KEY) || "null");
    return data && data.role ? data : null;
  } catch {
    return null;
  }
};

function App() {
  const [session, setSession] = useState(loadSession);

  useEffect(() => {
    const onSession = () => setSession(loadSession());
    window.addEventListener("hostel-session", onSession);
    window.addEventListener("storage", onSession);
    return () => {
      window.removeEventListener("hostel-session", onSession);
      window.removeEventListener("storage", onSession);
    };
  }, []);

  if (session?.role) return <Dashboard session={session} />;
  return <Login />;
}

export default App;
