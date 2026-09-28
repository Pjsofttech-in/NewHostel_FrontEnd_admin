import React, { useEffect, useState } from "react";
import Dashboard from "./pages/Dashboard/Dashboard";
import UserSite from "./pages/UserSite/UserSite";
import Login from "./pages/Login/Login";

const SESSION_KEY = "hostel-session";

/* ================= LOAD SESSION ================= */

const loadSession = () => {
  try {
    const data = JSON.parse(localStorage.getItem(SESSION_KEY) || "null");
    return data && data.role ? data : null;
  } catch {
    return null;
  }
};

/* ================= APP ================= */

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

  if (session && session.role === "admin") {
    return <Dashboard />;
  }

  if (session && session.role === "user") {
    return <UserSite userNo={session.userNo} />;
  }

  return <Login />;
}

export default App;
