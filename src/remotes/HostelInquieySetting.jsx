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
  { label: "Dashboard",     to: BASE },
  { label: "Add Inquiry",   to: `${BASE}/hostel-add-inquiry` },
  { label: "Inquiry List",  to: `${BASE}/hostel-inquiry-list` },
];

const HostelInquieySetting = () => (
  <div style={{ display: "flex", flexDirection: "column", height: "100%" }}>
    <nav
      style={{
        display: "flex", gap: 4, padding: "8px 16px",
        background: "#fff", borderBottom: "1px solid #e5e7eb", flexShrink: 0,
      }}
    >
      {TABS.map((t) => (
        <NavLink
          key={t.to}
          to={t.to}
          end={t.to === BASE}
          style={({ isActive }) => ({
            padding: "6px 16px", borderRadius: 6, fontSize: 13, fontWeight: 600,
            textDecoration: "none", cursor: "pointer",
            background: isActive ? "#2563eb" : "transparent",
            color: isActive ? "#fff" : "#374151",
            border: isActive ? "none" : "1px solid #e5e7eb",
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
