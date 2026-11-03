// =====================================================
//  Inquiry Service
//  Wraps all InquiryController endpoints
// =====================================================

import { api } from "./api.js";

// POST /createInquiry
export async function createInquiry(inquiryData) {
  return api.post("/createInquiry", inquiryData);
}

// GET /getInquiryById/:id
export async function getInquiryById(id) {
  return api.get(`/getInquiryById/${id}`);
}

// POST /getAllHostelInquiry  (with pagination + filters)
export async function getAllInquiries({
  page = 0,
  size = 10,
  timeFrame,
  startDate,
  endDate,
  filter = {},
} = {}) {
  const params = { page, size };
  if (timeFrame) params.timeFrame = timeFrame;
  if (startDate) params.startDate = startDate;
  if (endDate) params.endDate = endDate;

  return api.post("/getAllHostelInquiry", filter, params);
}

// PUT /updateInquiry/:id
export async function updateInquiry(id, inquiryData) {
  return api.put(`/updateInquiry/${id}`, inquiryData);
}

// DELETE /deleteInquiry/:id
export async function deleteInquiry(id) {
  return api.delete(`/deleteInquiry/${id}`);
}

// GET /getInquiryCountForCards
export async function getInquiryCountForCards() {
  return api.get("/getInquiryCountForCards");
}

// GET /getInquiryCountByMonthAndYear?month=&year=
export async function getInquiryCountByMonth(month, year) {
  return api.get("/getInquiryCountByMonthAndYear", { month, year });
}

// GET /getInquiryCountByYear?year=
export async function getInquiryCountByYear(year) {
  return api.get("/getInquiryCountByYear", { year });
}

// GET /getInquiryCountBySource
export async function getInquiryCountBySource() {
  return api.get("/getInquiryCountBySource");
}

// GET /inquiryForRegistration?id=
export async function getInquiryForRegistration(id) {
  return api.get("/inquiryForRegistration", { id });
}
