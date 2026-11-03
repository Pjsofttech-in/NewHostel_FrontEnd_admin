import React, { useCallback, useEffect, useMemo, useState } from "react";
import { FaEdit, FaSearch, FaTimes, FaChevronLeft, FaChevronRight } from "react-icons/fa";
import "./InquiryList.css";
import InquiryForm from "./InquiryForm";
import { getAllInquiries, deleteInquiry, updateInquiry } from "../../services/inquiryService.js";

const STATUS_OPTIONS = ["New", "Interested", "Callback", "Not Interested", "DND", "Ringing/Waiting", "Joined"];
const PAGE_SIZE_OPTIONS = [10, 20, 50];

const getPageNumbers = (totalPages, current) => {
  if (totalPages <= 7) return Array.from({ length: totalPages }, (_, i) => i + 1);
  const pages = new Set([1, totalPages, current - 1, current, current + 1]);
  const sorted = [...pages].filter((p) => p >= 1 && p <= totalPages).sort((a, b) => a - b);
  const result = [];
  sorted.forEach((p, i) => {
    if (i > 0 && p - sorted[i - 1] > 1) result.push("...");
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
  const [inquiries, setInquiries] = useState([]);
  const [totalCount, setTotalCount] = useState(0);
  const [statusWiseCount, setStatusWiseCount] = useState({});
  const [loading, setLoading] = useState(false);

  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [roomFilter, setRoomFilter] = useState("");

  const [editingId, setEditingId] = useState(null);
  const [editStatus, setEditStatus] = useState("");
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);

  const [viewItem, setViewItem] = useState(null);
  const [editOpen, setEditOpen] = useState(false);

  const fetchInquiries = useCallback(async () => {
    setLoading(true);
    try {
      const filter = {};
      if (roomFilter) filter.roomType = roomFilter;
      if (statusFilter) filter.currentStatus = statusFilter;

      const res = await getAllInquiries({
        page: page - 1,
        size: pageSize,
        filter,
      });

      // Spring Page is nested under "inquiries"
      const content =
        res?.inquiries?.content ??
        res?.content ??
        (Array.isArray(res?.inquiries) ? res.inquiries : null) ??
        (Array.isArray(res) ? res : []);

      setInquiries(Array.isArray(content) ? content : []);
      setTotalCount(
        res?.totalInquiries ??
        res?.inquiries?.totalElements ??
        (Array.isArray(content) ? content.length : 0)
      );
      setStatusWiseCount(res?.statusWiseCount ?? {});
    } catch (err) {
      console.error("Failed to fetch inquiries", err);
      setInquiries([]);
      setTotalCount(0);
    } finally {
      setLoading(false);
    }
  }, [page, pageSize, roomFilter, statusFilter]);

  useEffect(() => {
    fetchInquiries();
  }, [fetchInquiries]);

  useEffect(() => {
    const refresh = () => fetchInquiries();
    window.addEventListener("hostel-inq-updated", refresh);
    return () => window.removeEventListener("hostel-inq-updated", refresh);
  }, [fetchInquiries]);

  useEffect(() => { setPage(1); }, [search, statusFilter, roomFilter, pageSize]);

  // Client-side search filter on already-fetched page
  const filtered = useMemo(() => {
    if (!search.trim()) return inquiries;
    const text = search.trim().toLowerCase();
    return inquiries.filter((item) =>
      [item.studentName, item.studentMobileNo, item.email, item.city, item.state, item.source]
        .some((v) => String(v || "").toLowerCase().includes(text))
    );
  }, [inquiries, search]);

  const totalPages = Math.max(1, Math.ceil(totalCount / pageSize));
  const pageNumbers = getPageNumbers(totalPages, page);

  const startEdit = (item) => {
    if ((item.currentStatus || "New") === "Joined") return;
    setEditingId(item.id);
    setEditStatus(item.currentStatus || "New");
  };

  const cancelEdit = () => { setEditingId(null); setEditStatus(""); };

  const saveStatus = async (row) => {
    try {
      await updateInquiry(row.id, { currentStatus: editStatus });
      window.dispatchEvent(new Event("hostel-inq-updated"));
      setEditingId(null);
      setEditStatus("");
    } catch (err) {
      alert("Failed to update status: " + err.message);
    }
  };

  const handleDeleteInquiry = async () => {
    if (!window.confirm(`Delete inquiry?`)) return;
    try {
      await deleteInquiry(viewItem.id);
      window.dispatchEvent(new Event("hostel-inq-updated"));
      setViewItem(null);
    } catch (err) {
      alert("Failed to delete: " + err.message);
    }
  };

  const getStatusClass = (status) =>
    `status-${String(status || "New").toLowerCase().replace(/[^a-z]+/g, "-")}`;

  const downloadCSV = () => {
    const headers = ["ID", "Date", "Name", "Mobile", "Email", "City", "State", "Room", "Bed", "Status", "Source"];
    const rows = filtered.map((i) => [
      i.id || "", i.inquiryDate || "", i.studentName || "", i.studentMobileNo || "",
      i.email || "", i.city || "", i.state || "", i.roomType || "",
      i.bedType || "", i.currentStatus || "New", i.source || "",
    ]);
    const esc = (v) => `"${String(v).replace(/"/g, '""')}"`;
    const csv = [headers, ...rows].map((r) => r.map(esc).join(",")).join("\n");
    const blob = new Blob(["\ufeff" + csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url; a.download = "inquiry-list.csv"; a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="inquiry-list-page">
      {/* ========== FILTER BAR ========== */}
      <div className="inquiry-filter-bar">
        <div className="inquiry-search">
          <FaSearch />
          <input
            type="text"
            placeholder="Search name, mobile, email, city..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
          {search && (
            <button type="button" className="search-clear" onClick={() => setSearch("")}>
              <FaTimes />
            </button>
          )}
        </div>

        <div className="filter-right">
          <div className="filter-total">
            <span>Total</span>
            <strong>{totalCount}</strong>
          </div>

          <select className="status-filter" value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}>
            <option value="">Status</option>
            {STATUS_OPTIONS.map((s) => <option key={s} value={s}>{s}</option>)}
          </select>

          <select className="status-filter" value={roomFilter} onChange={(e) => setRoomFilter(e.target.value)}>
            <option value="">Room</option>
            <option>AC</option>
            <option>Non-AC</option>
          </select>

          <button type="button" className="download-pill csv" onClick={downloadCSV}>CSV</button>
        </div>
      </div>

      {/* ========== TABLE ========== */}
      <div className="inquiry-table-card">
        <div className="inquiry-table-wrap">
          <table className="inquiry-table">
            <thead>
              <tr>
                <th>ID</th><th>Date</th><th>Name</th><th>Mobile</th>
                <th>Email</th><th>City</th><th>State</th>
                <th>Room</th><th>Bed</th><th>Status</th><th>Source</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr><td colSpan="11" className="empty-list">Loading...</td></tr>
              ) : filtered.length === 0 ? (
                <tr><td colSpan="11" className="empty-list">No inquiries found</td></tr>
              ) : (
                filtered.map((item) => {
                  const currentStatus = item.currentStatus || "New";
                  const isEditing = editingId === item.id;
                  const isJoined = currentStatus === "Joined";

                  return (
                    <tr key={item.id}>
                      <td><span className="inquiry-number">{item.id || "-"}</span></td>
                      <td><span className="table-date">{item.inquiryDate || "-"}</span></td>
                      <td>
                        <button type="button" className="table-name-btn" onClick={() => { setViewItem(item); setEditOpen(false); }}>
                          {item.studentName || "Unknown"}
                        </button>
                      </td>
                      <td><span className="table-text">{item.studentMobileNo || "-"}</span></td>
                      <td><span className="table-text table-email">{item.email || "-"}</span></td>
                      <td><span className="table-text">{item.city || "-"}</span></td>
                      <td><span className="table-text">{item.state || "-"}</span></td>
                      <td><span className="table-text">{item.roomType || "-"}</span></td>
                      <td><span className="table-text">{item.bedType || "-"}</span></td>
                      <td>
                        {isEditing ? (
                          <div className="status-edit-box">
                            <select value={editStatus} onChange={(e) => setEditStatus(e.target.value)}>
                              {STATUS_OPTIONS.map((s) => <option key={s} value={s}>{s}</option>)}
                            </select>
                            <div className="status-edit-actions">
                              <button type="button" className="status-save-btn" onClick={() => saveStatus(item)}>Save</button>
                              <button type="button" className="status-cancel-btn" onClick={cancelEdit}>&#10005;</button>
                            </div>
                          </div>
                        ) : (
                          <button
                            type="button"
                            className={`inquiry-status ${getStatusClass(currentStatus)} ${isJoined ? "status-final" : "status-clickable"}`}
                            onClick={() => { if (!isJoined) startEdit(item); }}
                            disabled={isJoined}
                          >
                            {currentStatus}
                            {!isJoined && <FaEdit className="status-edit-icon" />}
                          </button>
                        )}
                      </td>
                      <td><span className="table-text">{item.source || "-"}</span></td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* ========== FOOTER + PAGINATION ========== */}
      <div className="inquiry-list-footer">
        {filtered.length > 0 && (
          <span>Showing <strong>{filtered.length}</strong> of <strong>{totalCount}</strong> inquiries</span>
        )}
        <div className="footer-right">
          <div className="per-page">
            <span>Per page:</span>
            <select value={pageSize} onChange={(e) => setPageSize(Number(e.target.value))}>
              {PAGE_SIZE_OPTIONS.map((s) => <option key={s} value={s}>{s}</option>)}
            </select>
          </div>
        </div>
      </div>

      {totalPages > 1 && (
        <div className="pagination">
          <button type="button" className="page-btn page-nav" onClick={() => setPage(page - 1)} disabled={page === 1}>
            <FaChevronLeft />
          </button>
          {pageNumbers.map((pg, i) =>
            pg === "..." ? (
              <span key={`gap-${i}`} className="page-ellipsis">...</span>
            ) : (
              <button key={pg} type="button" className={`page-btn ${pg === page ? "active" : ""}`} onClick={() => setPage(pg)}>
                {pg}
              </button>
            )
          )}
          <button type="button" className="page-btn page-nav" onClick={() => setPage(page + 1)} disabled={page === totalPages}>
            <FaChevronRight />
          </button>
        </div>
      )}

      {/* ========== DETAILS MODAL ========== */}
      {viewItem && (
        <div className="id-overlay" onClick={() => setViewItem(null)}>
          <div className="id-modal" onClick={(e) => e.stopPropagation()}>
            <div className="id-head">
              <div className="id-title">Inquiry Details — #{viewItem.id}</div>
              <button type="button" className="id-close" onClick={() => setViewItem(null)}><FaTimes /></button>
            </div>

            <div className="id-body">
              {editOpen ? (
                <div className="id-edit-form">
                  <InquiryForm key={viewItem.id} editData={viewItem} onSaved={(updated) => { setViewItem(updated); setEditOpen(false); }} />
                </div>
              ) : (
                <>
                  <div className="id-section">
                    <div className="id-sec-title">Personal Details</div>
                    <div className="id-grid">
                      <DetailField label="ID" name="id" item={viewItem} />
                      <DetailField label="Date" name="inquiryDate" item={viewItem} />
                      <DetailField label="Student Name" name="studentName" item={viewItem} />
                      <DetailField label="Mobile No" name="studentMobileNo" item={viewItem} />
                      <DetailField label="Father Name" name="fatherName" item={viewItem} />
                      <DetailField label="Father Mobile" name="fatherMobileNo" item={viewItem} />
                      <DetailField label="Email" name="email" span2 item={viewItem} />
                      <DetailField label="Gender" name="gender" item={viewItem} />
                      <DetailField label="Status" name="currentStatus" item={viewItem} />
                      <DetailField label="City" name="city" item={viewItem} />
                      <DetailField label="District" name="district" item={viewItem} />
                      <DetailField label="Taluka" name="taluka" item={viewItem} />
                      <DetailField label="State" name="state" item={viewItem} />
                      <DetailField label="Pincode" name="pincode" item={viewItem} />
                      <DetailField label="Address" name="address" span2 item={viewItem} />
                    </div>
                  </div>
                  <div className="id-section">
                    <div className="id-sec-title">Additional Information</div>
                    <div className="id-grid">
                      <DetailField label="Room Type" name="roomType" item={viewItem} />
                      <DetailField label="Bed Type" name="bedType" item={viewItem} />
                      <DetailField label="Members" name="numberOfMembers" item={viewItem} />
                      <DetailField label="Course" name="courseOfStudy" item={viewItem} />
                      <DetailField label="Source" name="source" item={viewItem} />
                    </div>
                  </div>
                </>
              )}
            </div>

            <div className="id-actions">
              {editOpen ? (
                <button type="button" className="id-cancel-btn" onClick={() => setEditOpen(false)}>Back to Details</button>
              ) : (
                <>
                  <button type="button" className="id-del-btn" onClick={handleDeleteInquiry}>Delete</button>
                  <button type="button" className="id-edit-btn" onClick={() => setEditOpen(true)}>Edit</button>
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
