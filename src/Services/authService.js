// =====================================================
//  Auth Service
//  Wraps:  POST /stafflogin
//          POST /departmentlogin
//          GET  /getInstituteDetails
//          GET  /getBranchCodeByInstituteEmail
// =====================================================

import { BASE_URL } from "./api.js";

const SESSION_KEY = "hostel-session";
const TOKEN_KEY = "hostel-token";

// ---- raw login (no auth header needed) ----

async function rawPost(path, body) {
  const res = await fetch(`${BASE_URL}${path}`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
  if (!res.ok) {
    const text = await res.text();
    throw new Error(text || `HTTP ${res.status}`);
  }
  return res.json();
}

// ---- Staff login ----
export async function loginStaff({ email, password }) {
  const data = await rawPost("/stafflogin", { email, password });
  // data = { token, data: { role, email, ... } }
  persistSession(data);
  return data;
}

// ---- Department login ----
export async function loginDepartment({ email, password }) {
  const data = await rawPost("/departmentlogin", { email, password });
  persistSession(data);
  return data;
}

// ---- Persist session to localStorage ----
function persistSession(data) {
  if (data.token) {
    sessionStorage.setItem(TOKEN_KEY, `Bearer ${data.token}`);
  }
  const info = data.data || data;
  const session = {
    role: info.role || "STAFF",
    email: info.email || "",
    name: info.name || "",
  };
  localStorage.setItem(SESSION_KEY, JSON.stringify(session));
  window.dispatchEvent(new Event("hostel-session"));
}

export function logout() {
  sessionStorage.removeItem(TOKEN_KEY);
  localStorage.removeItem(SESSION_KEY);
  window.dispatchEvent(new Event("hostel-session"));
}

export function getSession() {
  try {
    return JSON.parse(localStorage.getItem(SESSION_KEY) || "null");
  } catch {
    return null;
  }
}
