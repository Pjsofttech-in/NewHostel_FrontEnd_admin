import React, { useEffect, useMemo, useState } from "react";
import {
  FaEdit,
  FaSearch,
  FaTimes,
  FaCheckCircle,
  FaChevronLeft,
  FaChevronRight,
} from "react-icons/fa";
import "./InquiryList.css";
import InquiryForm from "./InquiryForm";

const KEY = "hostel-inquiries";

const DEFAULT_PAGE_SIZE = 10;

const PAGE_SIZE_OPTIONS = [10, 20, 50];

const STATUS_OPTIONS = [
  "New",
  "Interested",
  "Callback",
  "Not Interested",
  "DND",
  "Ringing/Waiting",
  "Joined",
];

/* ===== SOURCE OPTIONS (Inquiry Form sarkhe) ===== */

const SOURCE_OPTIONS = ["Walk-in", "Online", "Referral", "Other"];

/* =====================================================
   LOAD INQUIRIES
===================================================== */

const loadInquiries = () => {
  try {
    const data = JSON.parse(localStorage.getItem(KEY) || "[]");
    return Array.isArray(data) ? data : [];
  } catch {
    return [];
  }
};

/* =====================================================
   PAGE NUMBERS (with ... gap for many pages)
===================================================== */

const getPageNumbers = (totalPages, current) => {
  if (totalPages <= 7) {
    return Array.from({ length: totalPages }, (_, i) => i + 1);
  }

  const pages = new Set([1, totalPages, current - 1, current, current + 1]);

  const sorted = [...pages]
    .filter((p) => p >= 1 && p <= totalPages)
    .sort((a, b) => a - b);

  const result = [];

  sorted.forEach((p, i) => {
    if (i > 0 && p - sorted[i - 1] > 1) {
      result.push("...");
    }

    result.push(p);
  });

  return result;
};

const DetailField = ({ label, item, name, span2 }) => (
  <div className={`id-field${span2 ? " span2" : ""}`}>
    <span className="id-lab">{label}</span>

    <b className="id-val">{item[name] || "-"}</b>
  </div>
);

const InquiryList = () => {
  const [inquiries, setInquiries] = useState(loadInquiries);

  const [search, setSearch] = useState("");

  const [statusFilter, setStatusFilter] = useState("All");
  const [cityFilter, setCityFilter] = useState("All");
  const [roomFilter, setRoomFilter] = useState("All");
  const [sourceFilter, setSourceFilter] = useState("All");

  const [editingId, setEditingId] = useState(null);

  const [editStatus, setEditStatus] = useState("");

  const [page, setPage] = useState(1);

  const [pageSize, setPageSize] = useState(DEFAULT_PAGE_SIZE);

  const [viewItem, setViewItem] = useState(null);

  const [editOpen, setEditOpen] = useState(false);

  /* =====================================================
     REFRESH INQUIRIES
  ===================================================== */

  useEffect(() => {
    const refresh = () => {
      setInquiries(loadInquiries());
    };

    refresh();

    window.addEventListener("hostel-inq-updated", refresh);

    window.addEventListener("storage", refresh);

    return () => {
      window.removeEventListener("hostel-inq-updated", refresh);

      window.removeEventListener("storage", refresh);
    };
  }, []);

  useEffect(() => {
    setPage(1);
  }, [search, statusFilter, cityFilter, roomFilter, sourceFilter, pageSize]);

  const cityOptions = useMemo(
    () => [...new Set(inquiries.map((i) => i.city).filter(Boolean))].sort(),
    [inquiries],
  );

  const startEdit = (item) => {
    if ((item.status || "New") === "Joined") {
      return;
    }

    setEditingId(item.id);

    setEditStatus(item.status || "New");
  };

  const cancelEdit = () => {
    setEditingId(null);

    setEditStatus("");
  };

  const saveStatus = (row) => {
    const selectedStatus = editStatus || "New";

    let latest = [];

    try {
      latest = JSON.parse(localStorage.getItem(KEY) || "[]");
    } catch {
      latest = [];
    }

    const updated = latest.map((it) => {
      const same =
        row.id != null
          ? it.id === row.id
          : it.inquiryNo === row.inquiryNo && it.mobile === row.mobile;

      return same ? { ...it, status: selectedStatus } : it;
    });

    localStorage.setItem(KEY, JSON.stringify(updated));

    setInquiries(updated);

    window.dispatchEvent(new Event("hostel-inq-updated"));

    setEditingId(null);

    setEditStatus("");
  };

  const openDetails = (item) => {
    setViewItem(item);

    setEditOpen(false);
  };

  const closeDetails = () => {
    setViewItem(null);

    setEditOpen(false);
  };

  const startFullEdit = () => {
    setEditOpen(true);
  };

  const handleUpdated = (row) => {
    setViewItem(row);

    setEditOpen(false);
  };

  const deleteInquiry = () => {
    if (!window.confirm(`Delete inquiry ${viewItem.inquiryNo || ""}?`)) {
      return;
    }

    const updated = inquiries.filter((item) => item.id !== viewItem.id);

    setInquiries(updated);

    localStorage.setItem(KEY, JSON.stringify(updated));

    window.dispatchEvent(new Event("hostel-inq-updated"));

    setViewItem(null);
  };

  const downloadCSV = () => {
    const headers = [
      "ID",
      "Date",
      "Name",
      "Mobile",
      "Email",
      "City",
      "State",
      "Room",
      "Bed",
      "Status",
      "Source",
    ];

    const rows = filteredInquiries.map((i) => [
      i.inquiryNo || "",
      i.date || "",
      i.studentName || "",
      i.mobile || "",
      i.email || "",
      i.city || "",
      i.state || "",
      i.roomType || "",
      i.bedType || "",
      i.status || "New",
      i.source || "",
    ]);

    const esc = (v) => `"${String(v).replace(/"/g, '""')}"`;

    const csv = [headers, ...rows].map((r) => r.map(esc).join(",")).join("\n");

    const blob = new Blob(["\ufeff" + csv], {
      type: "text/csv;charset=utf-8;",
    });

    const url = URL.createObjectURL(blob);

    const a = document.createElement("a");

    a.href = url;
    a.download = "inquiry-list.csv";
    a.click();

    URL.revokeObjectURL(url);
  };

  const downloadPDF = () => {
    const esc = (v) =>
      String(v ?? "")
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;");

    const rows = filteredInquiries
      .map(
        (i) => `<tr>
          <td>${esc(i.inquiryNo || "-")}</td>
          <td>${esc(i.date || "-")}</td>
          <td>${esc(i.studentName || "-")}</td>
          <td>${esc(i.mobile || "-")}</td>
          <td>${esc(i.email || "-")}</td>
          <td>${esc(i.city || "-")}</td>
          <td>${esc(i.state || "-")}</td>
          <td>${esc(i.roomType || "-")}</td>
          <td>${esc(i.bedType || "-")}</td>
          <td>${esc(i.status || "New")}</td>
          <td>${esc(i.source || "-")}</td>
        </tr>`,
      )
      .join("");

    const html = `<!DOCTYPE html>
<html>
<head>
  <title>Inquiry List</title>
  <style>
    * { box-sizing: border-box; font-family: Arial, Helvetica, sans-serif; }
    body { margin: 20px; color: #1f2937; }
    .head { text-align: center; margin-bottom: 14px; }
    .head h2 { margin: 0; font-size: 18px; }
    .head p { margin: 4px 0 0; font-size: 12px; color: #64748b; }
    table { width: 100%; border-collapse: collapse; margin-top: 10px; }
    th { background: #2563eb; color: #fff; font-size: 10px; padding: 6px 5px; text-align: left; }
    td { font-size: 10px; padding: 5px; border-bottom: 1px solid #e5e7eb; }
    tr:nth-child(even) td { background: #f8fafc; }
    @media print { body { margin: 8px; } }
  </style>
</head>
<body>
  <div class="head">
    <h2>Sant Gadagebaba Progressive School</h2>
    <p>Pune Branch — Inquiry List (${filteredInquiries.length} inquiries)</p>
  </div>
  <table>
    <thead>
      <tr>
        <th>ID</th><th>Date</th><th>Name</th><th>Mobile</th><th>Email</th>
        <th>City</th><th>State</th><th>Room</th><th>Bed</th><th>Status</th><th>Source</th>
      </tr>
    </thead>
    <tbody>${rows}</tbody>
  </table>
</body>
</html>`;

    const w = window.open("", "_blank", "width=950,height=700");

    w.document.write(html);
    w.document.close();
    w.focus();

    setTimeout(() => w.print(), 300);
  };

  const filteredInquiries = useMemo(() => {
    const text = search.trim().toLowerCase();

    return [...inquiries].reverse().filter((item) => {
      const matchesSearch =
        !text ||
        String(item.inquiryNo || "")
          .toLowerCase()
          .includes(text) ||
        String(item.studentName || "")
          .toLowerCase()
          .includes(text) ||
        String(item.mobile || "")
          .toLowerCase()
          .includes(text) ||
        String(item.email || "")
          .toLowerCase()
          .includes(text) ||
        String(item.course || "")
          .toLowerCase()
          .includes(text) ||
        String(item.city || "")
          .toLowerCase()
          .includes(text) ||
        String(item.state || "")
          .toLowerCase()
          .includes(text) ||
        String(item.source || "")
          .toLowerCase()
          .includes(text);

      const matchesStatus =
        statusFilter === "All" || (item.status || "New") === statusFilter;

      const matchesCity =
        cityFilter === "All" || (item.city || "") === cityFilter;

      const matchesRoom =
        roomFilter === "All" || (item.roomType || "") === roomFilter;

      const matchesSource =
        sourceFilter === "All" || (item.source || "") === sourceFilter;

      return (
        matchesSearch &&
        matchesStatus &&
        matchesCity &&
        matchesRoom &&
        matchesSource
      );
    });
  }, [inquiries, search, statusFilter, cityFilter, roomFilter, sourceFilter]);

  const totalPages = Math.max(
    1,
    Math.ceil(filteredInquiries.length / pageSize),
  );

  const currentPage = Math.min(page, totalPages);

  const startIndex = (currentPage - 1) * pageSize;

  const pagedInquiries = filteredInquiries.slice(
    startIndex,
    startIndex + pageSize,
  );

  const pageNumbers = getPageNumbers(totalPages, currentPage);

  /* =====================================================
     STATUS CLASS
  ===================================================== */

  const getStatusClass = (status) => {
    return `status-${String(status || "New")
      .toLowerCase()
      .replace(/[^a-z]+/g, "-")}`;
  };

  /* =====================================================
     RETURN
  ===================================================== */

  return (
    <div className="inquiry-list-page">
      {/* =================================================
          FILTER BAR (search + total + filters + downloads)
      ================================================= */}

      <div className="inquiry-filter-bar">
        {/* SEARCH */}

        <div className="inquiry-search">
          <FaSearch />

          <input
            type="text"
            placeholder="Search name, inquiry no, mobile, city..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />

          {search && (
            <button
              type="button"
              className="search-clear"
              onClick={() => setSearch("")}
              title="Clear Search"
            >
              <FaTimes />
            </button>
          )}
        </div>

        <div className="filter-right">
          {/* TOTAL */}

          <div className="filter-total">
            <span>Total</span>
            <strong>{inquiries.length}</strong>
          </div>

          {/* STATUS FILTER */}

          <select
            className="status-filter"
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
          >
            <option value="All">Status</option>

            {STATUS_OPTIONS.map((status) => (
              <option key={status} value={status}>
                {status}
              </option>
            ))}
          </select>

          {/* CITY FILTER (data madhun auto options) */}

          <select
            className="status-filter"
            value={cityFilter}
            onChange={(e) => setCityFilter(e.target.value)}
          >
            <option value="All">City</option>

            {cityOptions.map((city) => (
              <option key={city} value={city}>
                {city}
              </option>
            ))}
          </select>

          {/* ROOM FILTER (AC / Non-AC) */}

          <select
            className="status-filter"
            value={roomFilter}
            onChange={(e) => setRoomFilter(e.target.value)}
          >
            <option value="All">Room</option>

            <option>AC</option>

            <option>Non-AC</option>
          </select>

          {/* SOURCE FILTER */}

          <select
            className="status-filter"
            value={sourceFilter}
            onChange={(e) => setSourceFilter(e.target.value)}
          >
            <option value="All">Source</option>

            {SOURCE_OPTIONS.map((source) => (
              <option key={source} value={source}>
                {source}
              </option>
            ))}
          </select>

          {/* DOWNLOAD PILLS */}

          <button
            type="button"
            className="download-pill pdf"
            onClick={downloadPDF}
            title="Download PDF"
          >
            PDF
          </button>

          <button
            type="button"
            className="download-pill csv"
            onClick={downloadCSV}
            title="Download CSV"
          >
            CSV
          </button>
        </div>
      </div>

      {/* =================================================
          TABLE — ID, Date, Name, Mobile, Email, City,
          State, Room, Bed, Status, Source
          (horizontal scroll NAHI — compact)
      ================================================= */}

      <div className="inquiry-table-card">
        <div className="inquiry-table-wrap">
          <table className="inquiry-table">
            <thead>
              <tr>
                <th>ID</th>

                <th>Date</th>

                <th>Name</th>

                <th>Mobile</th>

                <th>Email</th>

                <th>City</th>

                <th>State</th>

                <th>Room</th>

                <th>Bed</th>

                <th>Status</th>

                <th>Source</th>
              </tr>
            </thead>

            <tbody>
              {pagedInquiries.length === 0 ? (
                <tr>
                  <td colSpan="11" className="empty-list">
                    No inquiries found
                  </td>
                </tr>
              ) : (
                pagedInquiries.map((item) => {
                  const currentStatus = item.status || "New";

                  const isEditing = editingId === item.id;

                  const isJoined = currentStatus === "Joined";

                  return (
                    <tr key={item.id}>
                      {/* ID */}

                      <td>
                        <span className="inquiry-number">
                          {item.inquiryNo || "-"}
                        </span>
                      </td>

                      {/* DATE */}

                      <td>
                        <span className="table-date">{item.date || "-"}</span>
                      </td>

                      {/* NAME */}

                      <td>
                        <button
                          type="button"
                          className="table-name-btn"
                          onClick={() => openDetails(item)}
                          title="View / Edit / Delete"
                        >
                          {item.studentName || "Unknown"}
                        </button>
                      </td>

                      {/* MOBILE */}

                      <td>
                        <span className="table-text">{item.mobile || "-"}</span>
                      </td>

                      {/* EMAIL */}

                      <td>
                        <span
                          className="table-text table-email"
                          title={item.email || ""}
                        >
                          {item.email || "-"}
                        </span>
                      </td>

                      {/* CITY */}

                      <td>
                        <span className="table-text">{item.city || "-"}</span>
                      </td>

                      {/* STATE */}

                      <td>
                        <span className="table-text">{item.state || "-"}</span>
                      </td>

                      {/* ROOM */}

                      <td>
                        <span className="table-text">
                          {item.roomType || "-"}
                        </span>
                      </td>

                      {/* BED */}

                      <td>
                        <span className="table-text">
                          {item.bedType || "-"}
                        </span>
                      </td>

                      {/* STATUS */}

                      <td>
                        {isEditing ? (
                          <div className="status-edit-box">
                            <select
                              value={editStatus}
                              onChange={(e) => setEditStatus(e.target.value)}
                            >
                              {STATUS_OPTIONS.map((status) => (
                                <option key={status} value={status}>
                                  {status}
                                </option>
                              ))}
                            </select>

                            <div className="status-edit-actions">
                              <button
                                type="button"
                                className="status-save-btn"
                                onClick={() => saveStatus(item)}
                              >
                                Save
                              </button>

                              <button
                                type="button"
                                className="status-cancel-btn"
                                onClick={cancelEdit}
                              >
                                &#10005;
                              </button>
                            </div>
                          </div>
                        ) : (
                          <button
                            type="button"
                            className={`inquiry-status ${getStatusClass(
                              currentStatus,
                            )} ${
                              isJoined ? "status-final" : "status-clickable"
                            }`}
                            onClick={() => {
                              if (!isJoined) {
                                startEdit(item);
                              }
                            }}
                            disabled={isJoined}
                            title={
                              isJoined
                                ? "Joined status is final"
                                : "Click to edit status"
                            }
                          >
                            {currentStatus}

                            {!isJoined && (
                              <FaEdit className="status-edit-icon" />
                            )}
                          </button>
                        )}
                      </td>

                      {/* SOURCE */}

                      <td>
                        <span className="table-text">{item.source || "-"}</span>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      <div className="inquiry-list-footer">
        {filteredInquiries.length > 0 && (
          <span>
            Showing{" "}
            <strong>
              {startIndex + 1}–{startIndex + pagedInquiries.length}
            </strong>{" "}
            of <strong>{filteredInquiries.length}</strong> inquiries
          </span>
        )}

        <div className="footer-right">
          <span className="joined-info">
            Joined inquiries can be registered from the Registration Form.
          </span>

          {/* PER PAGE SELECTOR — KHALI (footer madhe) */}

          <div className="per-page">
            <span>Inquiries per page:</span>

            <select
              value={pageSize}
              onChange={(e) => setPageSize(Number(e.target.value))}
            >
              {PAGE_SIZE_OPTIONS.map((size) => (
                <option key={size} value={size}>
                  {size}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {totalPages > 1 && (
        <div className="pagination">
          <button
            type="button"
            className="page-btn page-nav"
            onClick={() => setPage(currentPage - 1)}
            disabled={currentPage === 1}
            title="Previous Page"
          >
            <FaChevronLeft />
          </button>

          {pageNumbers.map((pg, i) =>
            pg === "..." ? (
              <span key={`gap-${i}`} className="page-ellipsis">
                ...
              </span>
            ) : (
              <button
                key={pg}
                type="button"
                className={`page-btn ${pg === currentPage ? "active" : ""}`}
                onClick={() => setPage(pg)}
              >
                {pg}
              </button>
            ),
          )}

          <button
            type="button"
            className="page-btn page-nav"
            onClick={() => setPage(currentPage + 1)}
            disabled={currentPage === totalPages}
            title="Next Page"
          >
            <FaChevronRight />
          </button>
        </div>
      )}

      {/* =================================================
          DETAILS MODAL — view / edit / delete
      ================================================= */}

      {viewItem && (
        <div className="id-overlay" onClick={closeDetails}>
          <div className="id-modal" onClick={(e) => e.stopPropagation()}>
            <div className="id-head">
              <div className="id-title">
                Inquiry Details{" "}
                {viewItem.inquiryNo ? `- ${viewItem.inquiryNo}` : ""}
              </div>

              <button
                type="button"
                className="id-close"
                onClick={closeDetails}
                title="Close"
              >
                <FaTimes />
              </button>
            </div>

            <div className="id-body">
              {editOpen ? (
                <div className="id-edit-form">
                  <InquiryForm
                    key={viewItem.id}
                    editData={viewItem}
                    onSaved={handleUpdated}
                  />
                </div>
              ) : (
                <>
                  {/* ============ PERSONAL DETAILS ============ */}

                  <div className="id-section">
                    <div className="id-sec-title">Personal Details</div>

                    <div className="id-grid">
                      <DetailField
                        label="ID"
                        name="inquiryNo"
                        item={viewItem}
                      />

                      <DetailField label="Date" name="date" item={viewItem} />

                      <DetailField
                        label="Student Name"
                        name="studentName"
                        item={viewItem}
                      />

                      <DetailField
                        label="Mobile No"
                        name="mobile"
                        item={viewItem}
                      />

                      <DetailField
                        label="Email"
                        name="email"
                        span2
                        item={viewItem}
                      />

                      <DetailField
                        label="Gender"
                        name="gender"
                        item={viewItem}
                      />

                      <DetailField
                        label="Status"
                        name="status"
                        item={viewItem}
                      />

                      <DetailField label="City" name="city" item={viewItem} />

                      <DetailField
                        label="District"
                        name="district"
                        item={viewItem}
                      />

                      <DetailField
                        label="Taluka"
                        name="taluka"
                        item={viewItem}
                      />

                      <DetailField label="State" name="state" item={viewItem} />

                      <DetailField
                        label="Pincode"
                        name="pincode"
                        item={viewItem}
                      />

                      <DetailField
                        label="Address"
                        name="address"
                        span2
                        item={viewItem}
                      />
                    </div>
                  </div>

                  {/* ============ ADDITIONAL INFORMATION ============ */}

                  <div className="id-section">
                    <div className="id-sec-title">Additional Information</div>

                    <div className="id-grid">
                      <DetailField
                        label="Preferred Room Type"
                        name="roomType"
                        item={viewItem}
                      />

                      <DetailField
                        label="Preferred Bed Type"
                        name="bedType"
                        item={viewItem}
                      />

                      <DetailField
                        label="Number Of Members"
                        name="members"
                        item={viewItem}
                      />

                      <DetailField
                        label="Course Of Study"
                        name="course"
                        item={viewItem}
                      />

                      <DetailField
                        label="Source"
                        name="source"
                        item={viewItem}
                      />
                    </div>
                  </div>
                </>
              )}
            </div>

            <div className="id-actions">
              {editOpen ? (
                <button
                  type="button"
                  className="id-cancel-btn"
                  onClick={() => setEditOpen(false)}
                >
                  Back to Details
                </button>
              ) : (
                <>
                  <button
                    type="button"
                    className="id-del-btn"
                    onClick={deleteInquiry}
                  >
                    Delete
                  </button>

                  <button
                    type="button"
                    className="id-edit-btn"
                    onClick={startFullEdit}
                  >
                    Edit
                  </button>
                </>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default InquiryList;
