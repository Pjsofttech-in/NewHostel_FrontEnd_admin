import React, { useCallback, useEffect, useMemo, useState } from "react";
import "./UserList.css";
import { getRegistrations } from "../../services/registrationService.js";

const money = (v) => `₹${Number(v || 0).toLocaleString("en-IN", { minimumFractionDigits: 2 })}`;

const UserList = () => {
  const [rows, setRows] = useState([]);
  const [summary, setSummary] = useState({ totalAmount: 0, deposit: 0, pending: 0, cancel: 0, refund: 0 });
  const [loading, setLoading] = useState(false);
  const [totalCount, setTotalCount] = useState(0);

  // Filters
  const [q, setQ] = useState("");
  const [paymentMode, setPaymentMode] = useState("");
  const [status, setStatus] = useState("");
  const [roomType, setRoomType] = useState("");
  const [bedType, setBedType] = useState("");
  const [dateRange, setDateRange] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");

  // Pagination
  const [page, setPage] = useState(1);
  const [per, setPer] = useState(10);
  const [totalPages, setTotalPages] = useState(1);

  const fetchRegistrations = useCallback(async () => {
    setLoading(true);
    try {
      const filter = {};
      if (paymentMode) filter.paymentMode = paymentMode;
      if (status) filter.status = status;
      if (roomType) filter.roomType = roomType;
      if (bedType) filter.bedType = bedType;

      const res = await getRegistrations({
        page: page - 1,
        size: per,
        dateRange: dateRange || undefined,
        startDate: dateRange === "CUSTOM" ? startDate : undefined,
        endDate: dateRange === "CUSTOM" ? endDate : undefined,
        filter,
      });

      // res = { registrations: Page<HostelRegistrationResponseDTO>, summary: HostelAmountSummaryDTO }
      const content = res.registrations?.content || res.content || [];
      setRows(Array.isArray(content) ? content : []);
      setTotalCount(res.registrations?.totalElements || res.totalElements || 0);
      setTotalPages(res.registrations?.totalPages || res.totalPages || 1);

      if (res.summary) {
        setSummary({
          totalAmount: res.summary.totalAmount || 0,
          deposit: res.summary.depositCollected || res.summary.deposit || 0,
          pending: res.summary.pendingAmount || res.summary.pending || 0,
          cancel: res.summary.cancelAmount || res.summary.cancel || 0,
          refund: res.summary.refundAmount || res.summary.refund || 0,
        });
      }
    } catch (err) {
      console.error("Failed to fetch registrations", err);
    } finally {
      setLoading(false);
    }
  }, [page, per, paymentMode, status, roomType, bedType, dateRange, startDate, endDate]);

  useEffect(() => { fetchRegistrations(); }, [fetchRegistrations]);

  useEffect(() => {
    const refresh = () => fetchRegistrations();
    window.addEventListener("hostel-reg-updated", refresh);
    return () => window.removeEventListener("hostel-reg-updated", refresh);
  }, [fetchRegistrations]);

  useEffect(() => { setPage(1); }, [paymentMode, status, roomType, bedType, dateRange, startDate, endDate, per, q]);

  // Client-side name/email search on loaded page
  const filtered = useMemo(() => {
    if (!q.trim()) return rows;
    const text = q.trim().toLowerCase();
    return rows.filter((r) =>
      [r.fullName, r.email, r.parentsMobNo, r.city, r.roomNumber, r.bedNumber]
        .some((v) => String(v || "").toLowerCase().includes(text))
    );
  }, [rows, q]);

  const clearFilters = () => {
    setQ(""); setPaymentMode(""); setStatus("");
    setRoomType(""); setBedType(""); setDateRange("");
    setStartDate(""); setEndDate(""); setPage(1);
  };

  const exportCsv = () => {
    const head = ["ID","Admission Date","Name","Email","Mobile","City","State",
      "Room","Bed","Total Fees","Deposit","Remaining","Payment Mode","Status"];
    const body = filtered.map((r) => [
      r.id, r.admissionDate, r.fullName, r.email, r.parentsMobNo,
      r.city, r.state, r.roomNumber, r.bedNumber,
      r.totalFees, r.depositCollected, r.remainingFees, r.paymentMode, r.status,
    ].map((v) => `"${String(v ?? "").replace(/"/g, '""')}"`).join(","));
    const blob = new Blob([[head.join(","), ...body].join("\n")], { type: "text/csv;charset=utf-8;" });
    const a = document.createElement("a");
    a.href = URL.createObjectURL(blob);
    a.download = "registrations.csv";
    a.click();
    URL.revokeObjectURL(a.href);
  };

  return (
    <div className="ul">
      {/* FILTER CARD */}
      <div className="ul-filter-card">
        <div className="ul-filters">
          <div className="ul-field ul-search ul-float-field">
            <span className="ul-float-label">Search</span>
            <div className="ul-search-box">
              <span>⌕</span>
              <input placeholder="Name, email, mobile, room..." value={q}
                onChange={(e) => setQ(e.target.value)} />
            </div>
          </div>

          <div className={`ul-field ul-float-field ${paymentMode ? "has-value" : ""}`}>
            <span className="ul-float-label">Payment Mode</span>
            <select value={paymentMode} onChange={(e) => setPaymentMode(e.target.value)}>
              <option value=""></option>
              <option>Cash</option><option>UPI</option>
              <option>Online</option><option>Bank Transfer</option><option>Cheque</option>
            </select>
          </div>

          <div className={`ul-field ul-float-field ${status ? "has-value" : ""}`}>
            <span className="ul-float-label">Status</span>
            <select value={status} onChange={(e) => setStatus(e.target.value)}>
              <option value=""></option>
              <option>ACTIVE</option><option>PENDING</option>
              <option>CANCEL</option><option>REFUND</option>
            </select>
          </div>

          <div className={`ul-field ul-float-field ${roomType ? "has-value" : ""}`}>
            <span className="ul-float-label">Room Type</span>
            <select value={roomType} onChange={(e) => setRoomType(e.target.value)}>
              <option value=""></option><option>AC</option><option>Non-AC</option>
            </select>
          </div>

          <div className={`ul-field ul-float-field ${bedType ? "has-value" : ""}`}>
            <span className="ul-float-label">Bed Type</span>
            <select value={bedType} onChange={(e) => setBedType(e.target.value)}>
              <option value=""></option><option>Single</option><option>Double</option>
            </select>
          </div>

          <div className={`ul-field ul-float-field ${dateRange ? "has-value" : ""}`}>
            <span className="ul-float-label">Date Range</span>
            <select value={dateRange} onChange={(e) => setDateRange(e.target.value)}>
              <option value="">All Time</option>
              <option value="TODAY">Today</option>
              <option value="7DAYS">Last 7 Days</option>
              <option value="30DAYS">Last 30 Days</option>
              <option value="365DAYS">Last 365 Days</option>
              <option value="CUSTOM">Custom</option>
            </select>
          </div>

          {dateRange === "CUSTOM" && (
            <>
              <div className="ul-field ul-float-field has-value">
                <span className="ul-float-label">From</span>
                <input type="date" value={startDate} onChange={(e) => setStartDate(e.target.value)} />
              </div>
              <div className="ul-field ul-float-field has-value">
                <span className="ul-float-label">To</span>
                <input type="date" value={endDate} onChange={(e) => setEndDate(e.target.value)} />
              </div>
            </>
          )}

          <button type="button" className="ul-clear" onClick={clearFilters}>Clear</button>
        </div>
      </div>

      {/* SUMMARY PILLS */}
      <div className="ul-action-bar">
        <div className="ul-sum-pills">
          <div className="ul-pill total"><span>Total Fees</span><strong>{money(summary.totalAmount)}</strong></div>
          <div className="ul-pill deposit"><span>Deposit</span><strong>{money(summary.deposit)}</strong></div>
          <div className="ul-pill pending"><span>Pending</span><strong>{money(summary.pending)}</strong></div>
          <div className="ul-pill cancelled"><span>Cancelled</span><strong>{money(summary.cancel)}</strong></div>
          <div className="ul-pill refund"><span>Refund</span><strong>{money(summary.refund)}</strong></div>
          <div className="ul-actions">
            <button type="button" className="ul-btn ul-csv" onClick={exportCsv}>↓ CSV</button>
          </div>
        </div>
      </div>

      {/* TABLE */}
      <div className="ul-table-card">
        <div className="ul-table-wrap">
          <table className="ul-table">
            <thead>
              <tr>
                <th>ID</th><th>Admission Date</th><th>Name</th><th>Email</th>
                <th>Mobile</th><th>City</th><th>Floor</th><th>Room</th>
                <th>Bed</th><th>Total Fees</th><th>Deposit</th>
                <th>Remaining</th><th>Payment Mode</th><th>Status</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr><td colSpan={14} className="ul-empty">Loading...</td></tr>
              ) : filtered.length === 0 ? (
                <tr><td colSpan={14} className="ul-empty">No Records Found!</td></tr>
              ) : filtered.map((r, i) => (
                <tr key={r.id || i}>
                  <td><span className="ul-user-no">{r.id}</span></td>
                  <td className="ul-date">{r.admissionDate || "-"}</td>
                  <td><span className="ul-name">{r.fullName || "-"}</span></td>
                  <td>{r.email || "-"}</td>
                  <td>{r.parentsMobNo || "-"}</td>
                  <td>{r.city || "-"}</td>
                  <td>{r.floorNumber || "-"}</td>
                  <td>{r.roomNumber || "-"}</td>
                  <td>{r.bedNumber || "-"}</td>
                  <td><span className="ul-amount">{money(r.totalFees)}</span></td>
                  <td><span className="ul-amount">{money(r.depositCollected)}</span></td>
                  <td>
                    <span className={`ul-amount ${Number(r.remainingFees) > 0 ? "pending-amt" : ""}`}>
                      {money(r.remainingFees)}
                    </span>
                  </td>
                  <td>{r.paymentMode || "-"}</td>
                  <td>
                    <span className={`ul-st ${String(r.status || "active").toLowerCase()}`}>
                      {r.status || "ACTIVE"}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* PAGINATION */}
        <div className="ul-pager">
          <span className="ul-page-info">
            {totalCount === 0 ? "0 records"
              : `Showing ${(page - 1) * per + 1}–${Math.min(page * per, totalCount)} of ${totalCount}`}
          </span>
          <div className="ul-page-controls">
            <button type="button" disabled={page <= 1} onClick={() => setPage(page - 1)}>‹</button>
            <span className="ul-pg">{page}</span>
            <button type="button" disabled={page >= totalPages} onClick={() => setPage(page + 1)}>›</button>
            <select value={per} onChange={(e) => { setPer(Number(e.target.value)); setPage(1); }}>
              <option value={10}>10 / page</option>
              <option value={20}>20 / page</option>
              <option value={50}>50 / page</option>
            </select>
          </div>
        </div>
      </div>
    </div>
  );
};

export default UserList;
