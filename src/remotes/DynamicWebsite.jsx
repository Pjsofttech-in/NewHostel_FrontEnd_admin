/**
 * DynamicWebsite
 * Layout shell for the Dynamic Website section.
 * Exposed as: hostelAdmin/DynamicWebsite
 */
import React from "react";
import { NavLink, Outlet } from "react-router-dom";

const BASE = "/superadminclient/layout/layringhosteladmin/hostel-dynamic-website";

const TABS = [
  { label: "Website URL",      to: BASE,                        end: true },
  { label: "Slider",           to: `${BASE}/sliderbar`                   },
  { label: "Footer",           to: `${BASE}/footer`                      },
  { label: "Website Settings", to: `${BASE}/website-settings`            },
];

const DynamicWebsite = () => (
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
    </nav>
    <div style={{ flex: 1, overflow: "auto", padding: 16 }}>
      <Outlet />
    </div>
  </div>
);

export default DynamicWebsite;
