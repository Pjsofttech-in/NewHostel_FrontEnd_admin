// =====================================================
//  Registration Service
//  Wraps HostelRegistrationFormController endpoints
// =====================================================

import { api, getAuthParams, BASE_URL } from "./api.js";

// POST /createRegistrationForm  (multipart/form-data)
export async function createOrUpdateRegistration({
  data,
  inquiryId,
  personalPhoto,
  addressProofFile,
  educationProofFile,
  signature,
  parentSignature,
}) {
  const auth = getAuthParams();
  const formData = new FormData();

  formData.append("data", JSON.stringify(data));
  if (personalPhoto) formData.append("personalPhoto", personalPhoto);
  if (addressProofFile) formData.append("addressProofFile", addressProofFile);
  if (educationProofFile) formData.append("educationProofFile", educationProofFile);
  if (signature) formData.append("signature", signature);
  if (parentSignature) formData.append("parentSignature", parentSignature);

  const url = new URL(`${BASE_URL}/createRegistrationForm`);
  if (auth.role) url.searchParams.set("role", auth.role);
  if (auth.email) url.searchParams.set("email", auth.email);
  if (auth.branchCode) url.searchParams.set("branchCode", auth.branchCode);
  if (inquiryId) url.searchParams.set("inquiryId", inquiryId);

  const token =
    sessionStorage.getItem("authToken") ||
    sessionStorage.getItem("token") ||
    "";

  const headers = {};
  if (token) {
    headers["Authorization"] = token.startsWith("Bearer ")
      ? token
      : `Bearer ${token}`;
  }

  const res = await fetch(url.toString(), {
    method: "POST",
    headers,
    body: formData,
  });

  if (!res.ok) {
    const text = await res.text();
    throw new Error(text || `HTTP ${res.status}`);
  }
  return res.json();
}

// GET /getRegistrationFormById/:id
export async function getRegistrationById(id) {
  return api.get(`/getRegistrationFormById/${id}`);
}

// POST /getRegistrationForms  (paginated + filtered)
export async function getRegistrations({
  page = 0,
  size = 10,
  dateRange,
  startDate,
  endDate,
  filter = {},
} = {}) {
  const params = { page, size };
  if (dateRange) params.dateRange = dateRange;
  if (startDate) params.startDate = startDate;
  if (endDate) params.endDate = endDate;

  return api.post("/getRegistrationForms", filter, params);
}
