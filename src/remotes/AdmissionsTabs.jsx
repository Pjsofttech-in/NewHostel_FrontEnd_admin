/**
 * AdmissionsTabs
 * Layout shell for the Admission section.
 * Exposed as: hostelAdmin/AdmissionsTabs
 */
import React from "react";
import { NavLink, Outlet } from "react-router-dom";

const BASE = "/superadminclient/layout/layringhosteladmin/hostel-admission";

const TABS = [
  { label: "Dashboard", to: BASE, end: true },
  { label: "Add Admission", to: `${BASE}/form` },
  { label: "Admissions", to: `${BASE}/report` },
  { label: "Registration", to: `${BASE}/users/registration-form` },
  { label: "Students", to: `${BASE}/users/report` },
  { label: "Settings", to: `${BASE}/admission-settings` },
];

const AdmissionsTabs = () => (
  <div style={{ display: "flex", flexDirection: "column", height: "100%" }}>
    {/* <nav
      style={{
        display: "flex", flexWrap: "wrap", gap: 4, padding: "8px 16px",
        background: "#fff", borderBottom: "1px solid #e5e7eb", flexShrink: 0,
      }}
    >
      {TABS.map((t) => (
        <NavLink
          key={t.to}
          to={t.to}
          end={!!t.end}
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
    </nav> */}
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
          end={!!t.end}
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

export default AdmissionsTabs;
