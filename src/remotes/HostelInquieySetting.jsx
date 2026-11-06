/**
 * HostelInquieySetting
 * Layout shell for the Inquiry section.
 * Renders the top-tab nav and an <Outlet> for child routes.
 * Exposed as: hostelAdmin/HostelInquieySetting
 */
import React from "react";
import { NavLink, Outlet, useNavigate } from "react-router-dom";
import "../pages/Dashboard/Dashboard.css";

const BASE = "/superadminclient/layout/layringhosteladmin/hostel-inquiry";

const TABS = [
  { label: "Dashboard", to: BASE },
  { label: "Add Inquiry", to: `${BASE}/hostel-add-inquiry` },
  { label: "Inquiry List", to: `${BASE}/hostel-inquiry-list` },
];

const HostelInquieySetting = () => (
  <div style={{ display: "flex", flexDirection: "column", height: "100%" }}>
    <nav
      style={{
        display: "flex",
        alignItems: "center",
        gap: 4,
        padding: "4px",
        background: "#3b82f6",
        borderRadius: 999,
        flexShrink: 0,
        width: "100%",
      }}
    >
      {TABS.map((t) => (
        <NavLink
          key={t.to}
          to={t.to}
          end={t.to === BASE}
          style={({ isActive }) => ({
            flex: 1,
            textAlign: "center",
            padding: "8px 12px",
            borderRadius: 999,
            fontSize: 13,
            fontWeight: 600,
            textDecoration: "none",
            cursor: "pointer",
            background: isActive ? "#fff" : "transparent",
            color: isActive ? "#1e293b" : "#fff",
            border: "none",
            whiteSpace: "nowrap",
            transition: "all 0.15s ease",
          })}
        >
          {t.label}
        </NavLink>
      ))}
    </nav>
    <div style={{ flex: 1, overflow: "auto", padding: 16 }}>
      <Outlet />
    </div>
  </div>
);

export default HostelInquieySetting;
