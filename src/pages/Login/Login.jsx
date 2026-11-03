import React, { useState } from "react";
import { FaHome, FaUserShield, FaUserGraduate } from "react-icons/fa";
import "./Login.css";
import { loginStaff, loginDepartment } from "../../services/authService.js";

const SESSION_KEY = "hostel-session";

/* ================= LOGIN ================= */

const Login = () => {
  const [role, setRole] = useState("BRANCH"); // BRANCH | STAFF | DEPARTMENT
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const tryLogin = async (e) => {
    e.preventDefault();
    setError("");

    if (!email.trim() || !password) {
      setError("Please enter email and password.");
      return;
    }

    setLoading(true);
    try {
      let data;
      if (role === "DEPARTMENT") {
        data = await loginDepartment({ email: email.trim(), password });
      } else {
        // BRANCH and STAFF both use /stafflogin
        data = await loginStaff({ email: email.trim(), password });
      }

      // The backend returns { token, data: { role, email, ... } }
      const info = data.data || data;
      const resolvedRole = info.role || role;

      const session = {
        role: resolvedRole,
        email: email.trim(),
        name: info.name || "",
        token: data.token || "",
      };

      localStorage.setItem(SESSION_KEY, JSON.stringify(session));
      if (data.token) {
        sessionStorage.setItem("hostel-token", `Bearer ${data.token}`);
      }

      window.dispatchEvent(new Event("hostel-session"));
    } catch (err) {
      setError(err.message || "Login failed. Please check your credentials.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="lg-page">
      <form className="lg-card" onSubmit={tryLogin}>
        <div className="lg-logo">
          <FaHome />
        </div>

        <div className="lg-school">Hostel Management System</div>

        <div className="lg-tag">Admin Portal</div>

        {/* ================= LOGIN AS ================= */}

        <div className="lg-as">
          <button
            type="button"
            className={role === "BRANCH" ? "lg-as-btn active" : "lg-as-btn"}
            onClick={() => setRole("BRANCH")}
          >
            <FaUserShield />
            <span>Branch</span>
          </button>

          <button
            type="button"
            className={role === "STAFF" ? "lg-as-btn active" : "lg-as-btn"}
            onClick={() => setRole("STAFF")}
          >
            <FaUserShield />
            <span>Staff</span>
          </button>

          <button
            type="button"
            className={role === "DEPARTMENT" ? "lg-as-btn active" : "lg-as-btn"}
            onClick={() => setRole("DEPARTMENT")}
          >
            <FaUserGraduate />
            <span>Department</span>
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

        {error && (
          <div style={{ color: "#ef4444", fontSize: 12, textAlign: "center", marginTop: 4 }}>
            {error}
          </div>
        )}

        <button type="submit" className="lg-btn" disabled={loading}>
          {loading ? "Logging in..." : "Login"}
        </button>
      </form>
    </div>
  );
};

export default Login;
