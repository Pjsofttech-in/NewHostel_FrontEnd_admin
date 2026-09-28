import React, { useState } from "react";
import { FaHome, FaUserShield, FaUserGraduate } from "react-icons/fa";
import "./Login.css";

const SESSION_KEY = "hostel-session";

const REG_KEY = "hostel-registrations";

const ADMIN_KEY = "hostel-admin-account";

/* ================= ADMIN ACCOUNT ================= */

const adminAccount = () => {
  try {
    const saved = JSON.parse(localStorage.getItem(ADMIN_KEY) || "null");

    if (saved && saved.email && saved.password) {
      return saved;
    }
  } catch {
    /* default admin */
  }

  return { email: "admin", password: "admin123" };
};

/* ================= LOGIN ================= */

const Login = () => {
  const [role, setRole] = useState("admin");

  const [email, setEmail] = useState("");

  const [password, setPassword] = useState("");

  /* ================= SUBMIT ================= */

  const tryLogin = (e) => {
    e.preventDefault();

    if (!email.trim() || !password) {
      alert("Please enter email and password.");
      return;
    }

    if (role === "admin") {
      const acc = adminAccount();

      if (email.trim() !== acc.email || password !== acc.password) {
        alert("Invalid admin email or password.");
        return;
      }

      localStorage.setItem(SESSION_KEY, JSON.stringify({ role: "admin" }));

      window.dispatchEvent(new Event("hostel-session"));

      return;
    }

    let list = [];

    try {
      list = JSON.parse(localStorage.getItem(REG_KEY) || "[]");
    } catch {
      list = [];
    }

    const text = email.trim().toLowerCase();

    const found = (Array.isArray(list) ? list : []).find(
      (r) =>
        String((r.form && r.form.email) || "")
          .trim()
          .toLowerCase() === text &&
        String((r.form && r.form.password) || "") === password,
    );

    if (!found) {
      alert("Invalid email or password.");
      return;
    }

    localStorage.setItem(
      SESSION_KEY,
      JSON.stringify({ role: "user", userNo: found.userNo }),
    );

    window.dispatchEvent(new Event("hostel-session"));
  };

  /* ================= RENDER ================= */

  return (
    <div className="lg-page">
      <form className="lg-card" onSubmit={tryLogin}>
        <div className="lg-logo">
          <FaHome />
        </div>

        <div className="lg-school">Sant Gadagebaba Progressive School</div>

        <div className="lg-tag">Hostel Management — Pune Branch</div>

        {/* ================= LOGIN AS ================= */}

        <div className="lg-as">
          <button
            type="button"
            className={role === "admin" ? "lg-as-btn active" : "lg-as-btn"}
            onClick={() => setRole("admin")}
          >
            <FaUserShield />

            <span>Admin</span>
          </button>

          <button
            type="button"
            className={role === "user" ? "lg-as-btn active" : "lg-as-btn"}
            onClick={() => setRole("user")}
          >
            <FaUserGraduate />

            <span>Student</span>
          </button>
        </div>

        {/* ================= FIELDS ================= */}

        <div className="lg-field">
          <label>Email</label>

          <input
            type="text"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="Email"
          />
        </div>

        <div className="lg-field">
          <label>Password</label>

          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Password"
          />
        </div>

        <button type="submit" className="lg-btn">
          Login
        </button>
      </form>
    </div>
  );
};

export default Login;
