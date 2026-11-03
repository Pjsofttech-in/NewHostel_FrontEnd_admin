// =====================================================
//  Central fetch wrapper
//  Host Super Admin (sessionStorage):
//    authToken, role, email, branchCode, instituteEmail
//  Standalone fallback:
//    hostel-token / hostel-session
// =====================================================

export const BASE_URL =
  import.meta.env.VITE_API_BASE_URL || "http://localhost:8115";

// ---- Token (host uses authToken) ----
const getToken = () =>
  sessionStorage.getItem("authToken") ||
  sessionStorage.getItem("token") ||
  sessionStorage.getItem("hostel-token") ||
  localStorage.getItem("token") ||
  "";

// ---- Branch code (same as library / student) ----
export const getBranchCode = () =>
  (
    sessionStorage.getItem("branchCode") ||
    sessionStorage.getItem("libraryBranchCode") ||
    ""
  ).trim();

  /** Map Super Admin host roles → hostel backend roles */
const mapHostRoleToHostel = (hostRole) => {
  const r = (hostRole || "").toLowerCase();

  if (r === "superadmin") return "BRANCH";   // or "BRANCH" if backend has no ADMIN
  if (r === "branch") return "BRANCH";
  if (r === "department") return "DEPARTMENT";
  if (r === "staff") return "STAFF";

  // already a hostel role
  if (["ADMIN", "BRANCH", "DEPARTMENT", "STAFF"].includes((hostRole || "").toUpperCase())) {
    return (hostRole || "").toUpperCase();
  }

  return "BRANCH"; // safe default when embedded
};

// ---- Session (prefer host sessionStorage keys) ----
const getSession = () => {
  const role = sessionStorage.getItem("role");
  const email = sessionStorage.getItem("email");
  const branchCode = getBranchCode();
  const instituteEmail = sessionStorage.getItem("instituteEmail");

  if (role || email || branchCode) {
    return {
      role: (role || "").toUpperCase(),
      email: email || "",
      branchCode,
      instituteEmail: instituteEmail || "",
    };
  }

  try {
    const superUser = localStorage.getItem("user");
    if (superUser) {
      const u = JSON.parse(superUser);
      if (u && (u.email || u.emailId)) {
        return {
          role: (u.role || "BRANCH").toUpperCase(),
          email: u.email || u.emailId || "",
          branchCode: u.branchCode || branchCode || "",
          instituteEmail: u.instituteEmail || "",
        };
      }
    }
    const hostelSession = localStorage.getItem("hostel-session");
    if (hostelSession) {
      const s = JSON.parse(hostelSession);
      return {
        role: (s.role || "").toUpperCase(),
        email: s.email || "",
        branchCode: s.branchCode || branchCode || "",
        instituteEmail: s.instituteEmail || "",
      };
    }
  } catch {
    /* ignore */
  }
  return null;
};

export const getAuthParams = () => {
  const session = getSession();
  return {
    role: session?.role || "",
    email: session?.email || "",
    branchCode: session?.branchCode || getBranchCode() || "",
    instituteEmail: session?.instituteEmail || "",
  };
};

// ---- Core request — always attaches branchCode ----
async function request(
  method,
  path,
  { params = {}, body, isFormData = false } = {}
) {
  const url = new URL(`${BASE_URL}${path}`);

  const auth = getAuthParams();

  // Host identity (if your hostel backend still uses role/email)
  if (auth.role) url.searchParams.set("role", auth.role);
  if (auth.email) url.searchParams.set("email", auth.email);

  // Required for multi-tenant Super Admin (same as library)
  const branchCode = auth.branchCode || getBranchCode();
  if (branchCode) {
    url.searchParams.set("branchCode", branchCode);
  }

  // Caller params (do not overwrite branchCode with empty)
  Object.entries(params).forEach(([k, v]) => {
    if (v === undefined || v === null || v === "") return;
    if (k === "branchCode" && !String(v).trim()) return;
    url.searchParams.set(k, v);
  });

  // If caller passed branchCode in params, keep it; else ensure ours is set
  if (!url.searchParams.get("branchCode") && branchCode) {
    url.searchParams.set("branchCode", branchCode);
  }

  const headers = {};
  const token = getToken();
  if (token) {
    headers["Authorization"] = token.startsWith("Bearer ")
      ? token
      : `Bearer ${token}`;
  }
  if (!isFormData && body) {
    headers["Content-Type"] = "application/json";
  }

  const res = await fetch(url.toString(), {
    method,
    headers,
    body: isFormData ? body : body ? JSON.stringify(body) : undefined,
  });

  if (!res.ok) {
    const text = await res.text();
    throw new Error(text || `HTTP ${res.status}`);
  }

  const contentType = res.headers.get("content-type") || "";
  return contentType.includes("application/json") ? res.json() : res.text();
}

export const api = {
  get: (path, params) => request("GET", path, { params }),
  post: (path, body, params) => request("POST", path, { body, params }),
  put: (path, body, params) => request("PUT", path, { body, params }),
  delete: (path, params) => request("DELETE", path, { params }),
  postForm: (path, formData, params) =>
    request("POST", path, { body: formData, params, isFormData: true }),
};