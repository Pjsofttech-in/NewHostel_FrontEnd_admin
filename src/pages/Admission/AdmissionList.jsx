import React, { useEffect, useMemo, useState } from "react";
import {
  FaSearch,
  FaChevronLeft,
  FaChevronRight,
  FaEdit,
  FaTrashAlt,
} from "react-icons/fa";
import Receipt from "./Receipt";
import AdmissionForm from "./AdmissionForm";
import "./AdmissionList.css";

const ADM_KEY = "hostel-admissions";

const PAGE_SIZES = [10, 20, 50];

const loadAdmissions = () => {
  try {
    const data = JSON.parse(localStorage.getItem(ADM_KEY) || "[]");
    return Array.isArray(data) ? data : [];
  } catch {
    return [];
  }
};

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

const money = (v) => {
  const n = Number(v) || 0;
  return `₹ ${n.toLocaleString("en-IN")}`;
};

/* ============================================
   DELETE ADMISSION
============================================ */

const deleteAdmission = (row) => {
  if (!row) return false;

  const student = row.studentName || row.userNo || "this admission";

  const confirmed = window.confirm(
    `Are you sure you want to delete the admission of ${student}?`,
  );

  if (!confirmed) return false;

  try {
    const current = loadAdmissions();

    const updated = current.filter((item) => item.id !== row.id);

    localStorage.setItem(ADM_KEY, JSON.stringify(updated));

    window.dispatchEvent(new Event("hostel-admission-updated"));

    window.dispatchEvent(new Event("hostel-data-updated"));

    return true;
  } catch {
    alert("Unable to delete admission.");
    return false;
  }
};

/* ============================================
   COMPONENT
============================================ */

const AdmissionList = () => {
  const [admissions, setAdmissions] = useState(loadAdmissions);

  const [search, setSearch] = useState("");
  const [buildingFilter, setBuildingFilter] = useState("All");
  const [paymentFilter, setPaymentFilter] = useState("All");
  const [statusFilter, setStatusFilter] = useState("All");

  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);

  const [receiptRow, setReceiptRow] = useState(null);

  const [payRow, setPayRow] = useState(null);
  const [payAmount, setPayAmount] = useState("");
  const [payMode, setPayMode] = useState("Cash");

  const [viewRow, setViewRow] = useState(null);
  const [editRow, setEditRow] = useState(null);

  /* ============================================
     REFRESH
  ============================================ */

  useEffect(() => {
    const refresh = () => {
      setAdmissions(loadAdmissions());
    };

    refresh();

    window.addEventListener("hostel-admission-updated", refresh);

    window.addEventListener("hostel-reg-updated", refresh);

    window.addEventListener("storage", refresh);

    return () => {
      window.removeEventListener("hostel-admission-updated", refresh);

      window.removeEventListener("hostel-reg-updated", refresh);

      window.removeEventListener("storage", refresh);
    };
  }, []);

  /* ============================================
     RESET PAGE
  ============================================ */

  useEffect(() => {
    setPage(1);
  }, [search, buildingFilter, paymentFilter, statusFilter, pageSize]);

  /* ============================================
     BUILDING OPTIONS
  ============================================ */

  const buildingOpts = useMemo(
    () => [...new Set(admissions.map((a) => a.building).filter(Boolean))],
    [admissions],
  );

  /* ============================================
     FILTER
  ============================================ */

  const filtered = useMemo(() => {
    const text = search.trim().toLowerCase();

    return [...admissions].reverse().filter((row) => {
      const matchesSearch =
        !text ||
        String(row.userNo || "")
          .toLowerCase()
          .includes(text) ||
        String(row.studentName || "")
          .toLowerCase()
          .includes(text) ||
        String(row.mobile || "")
          .toLowerCase()
          .includes(text) ||
        String(row.email || "")
          .toLowerCase()
          .includes(text) ||
        String(row.roomNumber || "")
          .toLowerCase()
          .includes(text) ||
        String(row.building || "")
          .toLowerCase()
          .includes(text);

      const matchesBuilding =
        buildingFilter === "All" || row.building === buildingFilter;

      const matchesPayment =
        paymentFilter === "All" || (row.paymentStatus || "") === paymentFilter;

      const matchesStatus =
        statusFilter === "All" || (row.status || "Active") === statusFilter;

      return (
        matchesSearch && matchesBuilding && matchesPayment && matchesStatus
      );
    });
  }, [admissions, search, buildingFilter, paymentFilter, statusFilter]);

  /* ============================================
     SUMMARY
  ============================================ */

  const sums = useMemo(() => {
    let paid = 0;
    let partial = 0;
    let pending = 0;
    let revenue = 0;

    filtered.forEach((row) => {
      const st = row.paymentStatus || "";

      if (st === "Paid") {
        paid++;
      } else if (st === "Partial") {
        partial++;
      } else if (st === "Pending") {
        pending++;
      }

      revenue += Number(row.grandTotal) || 0;
    });

    return {
      total: filtered.length,
      paid,
      partial,
      pending,
      revenue,
    };
  }, [filtered]);

  /* ============================================
     PAGINATION
  ============================================ */

  const totalPages = Math.max(1, Math.ceil(filtered.length / pageSize));

  const currentPage = Math.min(page, totalPages);

  const startIndex = (currentPage - 1) * pageSize;

  const paged = filtered.slice(startIndex, startIndex + pageSize);

  const pageNumbers = getPageNumbers(totalPages, currentPage);

  /* ============================================
     CLEAR FILTERS
  ============================================ */

  const clearFilters = () => {
    setSearch("");
    setBuildingFilter("All");
    setPaymentFilter("All");
    setStatusFilter("All");
  };

  /* ============================================
     CSV
  ============================================ */

  const exportCsv = () => {
    if (filtered.length === 0) {
      alert("No admissions to export.");
      return;
    }

    const heads = [
      "User No",
      "Date",
      "Student",
      "Mobile",
      "Building",
      "Floor",
      "Room",
      "Bed",
      "Stay From",
      "Stay To",
      "Grand Total",
      "Paid",
      "Payment Status",
      "Mode",
      "Status",
    ];

    const rows = filtered.map((r) => [
      r.userNo || "-",
      r.admissionDate || "-",
      r.studentName || "-",
      r.mobile || "-",
      r.building || "-",
      r.floor || "-",
      r.roomNumber || "-",
      r.bedNumber || "-",
      r.stayFrom || "-",
      r.stayTo || "-",
      Number(r.grandTotal) || 0,
      Number(r.amountPaid) || 0,
      r.paymentStatus || "-",
      r.paymentMode || "-",
      r.status || "-",
    ]);

    const csv = [heads, ...rows]
      .map((line) => line.map((c) => `"${String(c)}"`).join(","))
      .join("\n");

    const blob = new Blob([csv], {
      type: "text/csv;charset=utf-8;",
    });

    const url = URL.createObjectURL(blob);

    const link = document.createElement("a");

    link.href = url;
    link.download = "admissions.csv";

    link.click();

    URL.revokeObjectURL(url);
  };

  /* ============================================
     PAYMENT
  ============================================ */

  const openPay = (row) => {
    const remaining =
      (Number(row.grandTotal) || 0) - (Number(row.amountPaid) || 0);

    setPayRow(row);

    setPayAmount(String(remaining > 0 ? remaining : ""));

    setPayMode(row.paymentMode || "Cash");
  };

  const savePay = () => {
    const total = Number(payRow.grandTotal) || 0;

    const already = Number(payRow.amountPaid) || 0;

    const add = Number(payAmount) || 0;

    if (add <= 0) {
      alert("Please enter a valid payment amount.");
      return;
    }

    if (already + add > total) {
      alert(`Payment exceeds remaining amount (${money(total - already)}).`);
      return;
    }

    const newPaid = already + add;

    const status = newPaid >= total ? "Paid" : "Partial";

    let list = [];

    try {
      list = JSON.parse(localStorage.getItem(ADM_KEY) || "[]");
    } catch {
      list = [];
    }

    let updatedRow = null;

    const updated = list.map((r) => {
      if (r.id !== payRow.id) return r;

      const today = new Date();

      const payDate = `${today.getFullYear()}-${String(
        today.getMonth() + 1,
      ).padStart(2, "0")}-${String(today.getDate()).padStart(2, "0")}`;

      updatedRow = {
        ...r,
        amountPaid: newPaid,
        paymentStatus: status,
        paymentMode: payMode,
        payments: [
          ...(r.payments || []).map((pm) => ({
            ...pm,
          })),
          {
            date: payDate,
            amount: add,
            mode: payMode,
          },
        ],
      };

      return updatedRow;
    });

    localStorage.setItem(ADM_KEY, JSON.stringify(updated));

    setAdmissions(updated);

    window.dispatchEvent(new Event("hostel-admission-updated"));

    setPayRow(null);
    setPayAmount("");

    if (updatedRow) {
      setReceiptRow(updatedRow);
    }
  };

  /* ============================================
     DELETE HANDLER
  ============================================ */

  const handleDelete = (row) => {
    const deleted = deleteAdmission(row);

    if (!deleted) return;

    const updated = loadAdmissions();

    setAdmissions(updated);

    setViewRow(null);
    setEditRow(null);
    setReceiptRow(null);

    const newTotalPages = Math.max(1, Math.ceil(updated.length / pageSize));

    if (page > newTotalPages) {
      setPage(newTotalPages);
    }
  };

  /* ============================================
     JSX
  ============================================ */

  return (
    <div className="al">
      {/* FILTER CARD */}

      <div className="al-filter-card">
        <div className="al-filters">
          <div className="al-field al-search">
            <label>Search</label>

            <div className="al-search-box">
              <span>
                <FaSearch />
              </span>

              <input
                type="text"
                placeholder="Search name, user no, mobile, room..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>
          </div>

          <div className="al-field">
            <label>Building</label>

            <select
              value={buildingFilter}
              onChange={(e) => setBuildingFilter(e.target.value)}
            >
              <option value="All">All Buildings</option>

              {buildingOpts.map((b) => (
                <option key={b} value={b}>
                  {b}
                </option>
              ))}
            </select>
          </div>

          <div className="al-field">
            <label>Payment Status</label>

            <select
              value={paymentFilter}
              onChange={(e) => setPaymentFilter(e.target.value)}
            >
              <option value="All">All Payments</option>
              <option value="Paid">Paid</option>
              <option value="Partial">Partial</option>
              <option value="Pending">Pending</option>
            </select>
          </div>

          <div className="al-field">
            <label>Status</label>

            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
            >
              <option value="All">All Status</option>
              <option value="Active">Active</option>
              <option value="Pending">Pending</option>
              <option value="Cancelled">Cancelled</option>
              <option value="Completed">Completed</option>
            </select>
          </div>

          <button type="button" className="al-clear" onClick={clearFilters}>
            Clear
          </button>
        </div>
      </div>

      {/* SUMMARY */}

      <div className="al-top-row">
        <div className="al-summary-actions">
          <div className="al-pill total-pill">
            <span>Total</span>
            <strong>{sums.total}</strong>
          </div>

          <div className="al-pill paid-pill">
            <span>Paid</span>
            <strong>{sums.paid}</strong>
          </div>

          <div className="al-pill partial-pill">
            <span>Partial</span>
            <strong>{sums.partial}</strong>
          </div>

          <div className="al-pill pending-pill">
            <span>Pending</span>
            <strong>{sums.pending}</strong>
          </div>

          <div className="al-pill revenue-pill">
            <span>Revenue</span>
            <strong>{money(sums.revenue)}</strong>
          </div>

          <button
            type="button"
            className="al-btn al-pdf"
            onClick={() => window.print()}
          >
            PDF
          </button>

          <button type="button" className="al-btn al-csv" onClick={exportCsv}>
            CSV
          </button>
        </div>
      </div>

      {/* TABLE */}

      <div className="al-table-card">
        <div className="al-table-wrap">
          <table className="al-table">
            <thead>
              <tr>
                <th>U No</th>
                <th>Date</th>
                <th>Name</th>
                <th>Floor</th>
                <th>Room Type</th>
                <th>Room No</th>
                <th>Bed Type</th>
                <th>Bed No</th>
                <th>From Date</th>
                <th>To Date</th>
                <th> Rent</th>
                <th> Months</th>
                <th>Total Rent</th>
                <th>P Mode</th>
                <th>P Status</th>
                <th>Receipt</th>
              </tr>
            </thead>

            <tbody>
              {paged.length === 0 ? (
                <tr>
                  <td colSpan="16" className="al-empty">
                    No admissions found
                  </td>
                </tr>
              ) : (
                paged.map((row) => (
                  <tr
                    key={row.id}
                    className="al-row"
                    onClick={() => setViewRow(row)}
                  >
                    <td>
                      <span className="al-user-no">{row.userNo || "-"}</span>
                    </td>

                    <td>
                      <span className="al-date">
                        {row.admissionDate || "-"}
                      </span>
                    </td>

                    <td>
                      <span className="al-name">{row.studentName || "-"}</span>
                    </td>

                    <td>
                      <span className="al-floor">{row.floor || "-"}</span>
                    </td>

                    <td>
                      <span className="al-rtype">{row.roomType || "-"}</span>
                    </td>

                    <td>
                      <span className="al-room">{row.roomNumber || "-"}</span>
                    </td>

                    <td>
                      <span className="al-btype">{row.bedType || "-"}</span>
                    </td>

                    <td>
                      <span className="al-bed">{row.bedNumber || "-"}</span>
                    </td>

                    <td>
                      <span className="al-date">{row.stayFrom || "-"}</span>
                    </td>

                    <td>
                      <span className="al-date">{row.stayTo || "-"}</span>
                    </td>

                    <td>
                      <span className="al-amount">
                        {money(row.monthlyRent)}
                      </span>
                    </td>

                    <td>
                      <span className="al-months">
                        {row.totalMonths || "-"}
                      </span>
                    </td>

                    <td>
                      <span className="al-amount">{money(row.grandTotal)}</span>
                    </td>

                    <td>
                      <span className="al-mode">{row.paymentMode || "-"}</span>
                    </td>

                    <td>
                      {row.paymentStatus === "Paid" ? (
                        <span className="al-payment-status paid">Paid</span>
                      ) : (
                        <button
                          type="button"
                          className={`al-payment-status payable ${String(
                            row.paymentStatus || "",
                          ).toLowerCase()}`}
                          onClick={(e) => {
                            e.stopPropagation();
                            openPay(row);
                          }}
                          title="Pay Remaining"
                        >
                          {row.paymentStatus || "Pending"}
                        </button>
                      )}
                    </td>

                    <td>
                      <button
                        type="button"
                        className="al-receipt-btn"
                        onClick={(e) => {
                          e.stopPropagation();
                          setReceiptRow(row);
                        }}
                      >
                        Receipt
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* PAGER */}

        <div className="al-pager">
          <span className="al-page-info">
            Showing{" "}
            <b>
              {filtered.length === 0 ? 0 : startIndex + 1}-
              {startIndex + paged.length}
            </b>{" "}
            of <b>{filtered.length}</b> admissions
          </span>

          <div className="al-page-controls">
            <button
              type="button"
              onClick={() => setPage(currentPage - 1)}
              disabled={currentPage === 1}
            >
              <FaChevronLeft />
            </button>

            {pageNumbers.map((pg, i) =>
              pg === "..." ? (
                <span key={`gap-${i}`} className="al-gap">
                  ...
                </span>
              ) : (
                <button
                  key={pg}
                  type="button"
                  className={pg === currentPage ? "al-pg" : ""}
                  onClick={() => setPage(pg)}
                >
                  {pg}
                </button>
              ),
            )}

            <button
              type="button"
              onClick={() => setPage(currentPage + 1)}
              disabled={currentPage === totalPages}
            >
              <FaChevronRight />
            </button>

            <select
              value={pageSize}
              onChange={(e) => setPageSize(Number(e.target.value))}
            >
              {PAGE_SIZES.map((size) => (
                <option key={size} value={size}>
                  {size} / page
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* RECEIPT */}

      {receiptRow && (
        <Receipt row={receiptRow} onClose={() => setReceiptRow(null)} />
      )}

      {/* PAYMENT MODAL */}

      {payRow && (
        <div className="ap-overlay" onClick={() => setPayRow(null)}>
          <div className="ap-modal" onClick={(e) => e.stopPropagation()}>
            <div className="ap-title">
              Pay Remaining — {payRow.userNo || payRow.studentName}
            </div>

            <div className="ap-info">
              <div>
                <span>Student</span>
                <b>{payRow.studentName || "-"}</b>
              </div>

              <div>
                <span>Grand Total</span>
                <b>{money(payRow.grandTotal)}</b>
              </div>

              <div>
                <span>Already Paid</span>
                <b>{money(payRow.amountPaid)}</b>
              </div>

              <div>
                <span>Remaining</span>
                <b className="ap-rem">
                  {money(
                    (Number(payRow.grandTotal) || 0) -
                      (Number(payRow.amountPaid) || 0),
                  )}
                </b>
              </div>
            </div>

            <div className="ap-fields">
              <label>
                Pay Amount
                <input
                  type="number"
                  min="1"
                  value={payAmount}
                  onChange={(e) => setPayAmount(e.target.value)}
                />
              </label>

              <label>
                Payment Mode
                <select
                  value={payMode}
                  onChange={(e) => setPayMode(e.target.value)}
                >
                  <option>Cash</option>
                  <option>UPI</option>
                  <option>Online</option>
                  <option>Bank</option>
                  <option>Bank Transfer</option>
                  <option>Cheque</option>
                </select>
              </label>
            </div>

            <div className="ap-actions">
              <button
                type="button"
                className="ap-cancel"
                onClick={() => setPayRow(null)}
              >
                Cancel
              </button>

              <button type="button" className="ap-save" onClick={savePay}>
                Save & Receipt
              </button>
            </div>
          </div>
        </div>
      )}

      {/* VIEW MODAL */}

      {viewRow && (
        <div className="alv-overlay" onClick={() => setViewRow(null)}>
          <div className="alv-modal" onClick={(e) => e.stopPropagation()}>
            <div className="alv-head">
              <div>
                <b>{viewRow.studentName || "-"}</b>

                <span>
                  {viewRow.userNo || "-"} · {viewRow.building || "-"} · Room{" "}
                  {viewRow.roomNumber || "-"} · Bed {viewRow.bedNumber || "-"}
                </span>
              </div>

              <button
                type="button"
                className="alv-close"
                onClick={() => setViewRow(null)}
              >
                Close
              </button>
            </div>

            <div className="alv-body">
              <div className="alv-sec">Admission Details</div>

              <div className="alv-grid">
                <p>
                  <span>User No</span>
                  <b>{viewRow.userNo || "-"}</b>
                </p>

                <p>
                  <span>Admission Date</span>
                  <b>{viewRow.admissionDate || "-"}</b>
                </p>

                <p>
                  <span>Email</span>
                  <b>{viewRow.email || "-"}</b>
                </p>

                <p>
                  <span>Mobile</span>
                  <b>{viewRow.mobile || "-"}</b>
                </p>

                <p>
                  <span>Building</span>
                  <b>{viewRow.building || "-"}</b>
                </p>

                <p>
                  <span>Floor</span>
                  <b>{viewRow.floor || "-"}</b>
                </p>

                <p>
                  <span>Room Type</span>
                  <b>{viewRow.roomType || "-"}</b>
                </p>

                <p>
                  <span>Room Number</span>
                  <b>{viewRow.roomNumber || "-"}</b>
                </p>

                <p>
                  <span>Bed Type</span>
                  <b>{viewRow.bedType || "-"}</b>
                </p>

                <p>
                  <span>Bed Number</span>
                  <b>{viewRow.bedNumber || "-"}</b>
                </p>

                <p>
                  <span>Stay From</span>
                  <b>{viewRow.stayFrom || "-"}</b>
                </p>

                <p>
                  <span>Stay To</span>
                  <b>{viewRow.stayTo || "-"}</b>
                </p>
              </div>

              <div className="alv-sec">Payment Details</div>

              <div className="alv-grid">
                <p>
                  <span>Total Months</span>
                  <b>{viewRow.totalMonths || "-"}</b>
                </p>

                <p>
                  <span>Monthly Rent</span>
                  <b>{money(viewRow.monthlyRent)}</b>
                </p>

                <p>
                  <span>Grand Total</span>
                  <b>{money(viewRow.grandTotal)}</b>
                </p>

                <p>
                  <span>Amount Paid</span>
                  <b>{money(viewRow.amountPaid)}</b>
                </p>

                <p>
                  <span>Balance</span>
                  <b>
                    {money(
                      (Number(viewRow.grandTotal) || 0) -
                        (Number(viewRow.amountPaid) || 0),
                    )}
                  </b>
                </p>

                <p>
                  <span>Payment Mode</span>
                  <b>{viewRow.paymentMode || "-"}</b>
                </p>

                <p>
                  <span>Payment Status</span>
                  <b>{viewRow.paymentStatus || "-"}</b>
                </p>

                <p>
                  <span>Source</span>
                  <b>{viewRow.sources || "-"}</b>
                </p>

                <p>
                  <span>Status</span>
                  <b>{viewRow.status || "-"}</b>
                </p>
              </div>
            </div>

            {/* VIEW ACTIONS */}

            <div className="alv-actions">
              <button
                type="button"
                className="alv-edit"
                onClick={() => {
                  setEditRow(viewRow);
                  setViewRow(null);
                }}
              >
                <FaEdit />
                Edit
              </button>

              {viewRow.paymentStatus !== "Paid" && (
                <button
                  type="button"
                  className="alv-pay"
                  onClick={() => {
                    openPay(viewRow);
                    setViewRow(null);
                  }}
                >
                  Pay Remaining
                </button>
              )}

              <button
                type="button"
                className="alv-rcpt"
                onClick={() => setReceiptRow(viewRow)}
              >
                Receipt
              </button>

              <button
                type="button"
                className="alv-delete"
                onClick={() => handleDelete(viewRow)}
              >
                <FaTrashAlt />
                Delete
              </button>
            </div>
          </div>
        </div>
      )}

      {/* EDIT MODAL */}

      {editRow && (
        <div className="al-edit-overlay">
          <div className="al-edit-box">
            <div className="al-edit-head">
              <b>Edit Admission — {editRow.studentName || editRow.userNo}</b>

              <button type="button" onClick={() => setEditRow(null)}>
                Close
              </button>
            </div>

            <div className="al-edit-body">
              <AdmissionForm
                editRow={editRow}
                onDone={() => {
                  setAdmissions(loadAdmissions());

                  setEditRow(null);
                }}
                onCancel={() => setEditRow(null)}
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdmissionList;
