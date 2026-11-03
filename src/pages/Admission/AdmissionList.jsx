import React, { useEffect, useMemo, useState } from "react";
import { FaSearch, FaChevronLeft, FaChevronRight } from "react-icons/fa";
import Receipt from "./Receipt";
import AdmissionForm from "./AdmissionForm";
import "./AdmissionList.css";

const ADM_KEY = "hostel-admissions";

const PAGE_SIZES = [10, 20, 50];

/* ================= LOAD ADMISSIONS ================= */

const loadAdmissions = () => {
  try {
    const data = JSON.parse(localStorage.getItem(ADM_KEY) || "[]");
    return Array.isArray(data) ? data : [];
  } catch {
    return [];
  }
};

/* ================= PAGE NUMBERS ================= */

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

/* ================= MONEY ================= */

const money = (v) => {
  const n = Number(v) || 0;
  return `₹ ${n.toLocaleString("en-IN")}`;
};

/* ================= ROW TOTAL (new model + legacy) ================= */

const rowTotal = (row) => {
  const paid = Number(row.amountPaid) || 0;
  const gstAmt = row.includeGst
    ? (paid * (Number(row.gstPercent) || 0)) / 100
    : 0;

  return Number(row.totalAmount) || Number(row.grandTotal) || paid + gstAmt;
};

/* ================= DATE HELPERS ================= */

const todayISO = () => {
  const d = new Date();

  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
};

const monthShift = (offset) => {
  const now = new Date();

  const d = new Date(now.getFullYear(), now.getMonth() + offset, 1);

  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
};

/* ================= ADMISSION LIST ================= */

const AdmissionList = () => {
  const [admissions, setAdmissions] = useState(loadAdmissions);

  const [search, setSearch] = useState("");
  const [buildingFilter, setBuildingFilter] = useState("All");
  const [paymentFilter, setPaymentFilter] = useState("All");
  const [statusFilter, setStatusFilter] = useState("All");
  const [dateFilter, setDateFilter] = useState("All");
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");

  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);

  /* ===== RECEIPT ===== */

  const [receiptRow, setReceiptRow] = useState(null);

  /* ===== PAY REMAINING ===== */

  const [payRow, setPayRow] = useState(null);
  const [payAmount, setPayAmount] = useState("");
  const [payMode, setPayMode] = useState("Cash");

  /* ===== INSTALLMENT DETAILS ===== */

  const [instRow, setInstRow] = useState(null);
  const [showInstForm, setShowInstForm] = useState(false);
  const [newInstAmount, setNewInstAmount] = useState("");
  const [newInstDueDate, setNewInstDueDate] = useState("");
  const [newInstRemark, setNewInstRemark] = useState("");
  const [completingInstId, setCompletingInstId] = useState(null);
  const [completeInstDate, setCompleteInstDate] = useState(todayISO());
  const [completeInstMode, setCompleteInstMode] = useState("Cash");

  /* ===== VIEW / EDIT ===== */

  const [viewRow, setViewRow] = useState(null);
  const [editRow, setEditRow] = useState(null);

  /* ================= REFRESH ================= */

  useEffect(() => {
    const refresh = () => {
      setAdmissions(loadAdmissions());
    };

    refresh();

    window.addEventListener("hostel-admission-updated", refresh);
    window.addEventListener("admission-updated", refresh);
    window.addEventListener("hostel-reg-updated", refresh);
    window.addEventListener("storage", refresh);

    return () => {
      window.removeEventListener("hostel-admission-updated", refresh);

      window.removeEventListener("admission-updated", refresh);

      window.removeEventListener("hostel-reg-updated", refresh);

      window.removeEventListener("storage", refresh);
    };
  }, []);

  /* ================= FILTER CHANGE ================= */

  useEffect(() => {
    setPage(1);
  }, [
    search,
    buildingFilter,
    paymentFilter,
    statusFilter,
    dateFilter,
    dateFrom,
    dateTo,
    pageSize,
  ]);

  /* ================= BUILDINGS ================= */

  const buildingOpts = useMemo(
    () => [...new Set(admissions.map((a) => a.building).filter(Boolean))],
    [admissions],
  );

  /* ================= FILTER + SEARCH ================= */

  const filtered = useMemo(() => {
    const text = search.trim().toLowerCase();

    const matchDate = (d) => {
      const date = d || "";

      if (dateFilter === "Today") {
        return date === todayISO();
      }

      if (dateFilter === "This Month") {
        return date.slice(0, 7) === monthShift(0);
      }

      if (dateFilter === "Last Month") {
        return date.slice(0, 7) === monthShift(-1);
      }

      if (dateFilter === "Custom") {
        if (!date) {
          return false;
        }

        if (dateFrom && date < dateFrom) {
          return false;
        }

        if (dateTo && date > dateTo) {
          return false;
        }

        return true;
      }

      return true;
    };

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

      const matchesDate = matchDate(row.admissionDate);

      return (
        matchesSearch &&
        matchesBuilding &&
        matchesPayment &&
        matchesStatus &&
        matchesDate
      );
    });
  }, [
    admissions,
    search,
    buildingFilter,
    paymentFilter,
    statusFilter,
    dateFilter,
    dateFrom,
    dateTo,
  ]);

  /* ================= SUMMARY ================= */

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

  /* ================= PAGINATION ================= */

  const totalPages = Math.max(1, Math.ceil(filtered.length / pageSize));

  const currentPage = Math.min(page, totalPages);

  const startIndex = (currentPage - 1) * pageSize;

  const paged = filtered.slice(startIndex, startIndex + pageSize);

  const pageNumbers = getPageNumbers(totalPages, currentPage);

  /* ===== INSTALLMENT DETAILS (live row) ===== */

  const instLive = instRow
    ? admissions.find((a) => a.id === instRow.id) || instRow
    : null;

  const instPaid = Number(instLive?.amountPaid) || 0;

  const instTotal = instLive ? rowTotal(instLive) : 0;

  const instPending = instTotal - instPaid;

  const instPayments = instLive ? instLive.payments || [] : [];
  const instSchedules = instLive ? instLive.installments || [] : [];
  const scheduledPending = instSchedules
    .filter((item) => item.status !== "Completed")
    .reduce((sum, item) => sum + (Number(item.amount) || 0), 0);
  const unscheduledPending = Math.max(0, instPending - scheduledPending);

  const persistAdmissionUpdate = (updatedRow) => {
    const list = loadAdmissions().map((row) =>
      row.id === updatedRow.id ? updatedRow : row,
    );
    localStorage.setItem(ADM_KEY, JSON.stringify(list));
    setAdmissions(list);
    setInstRow(updatedRow);
    window.dispatchEvent(new Event("hostel-admission-updated"));
    window.dispatchEvent(new Event("admission-updated"));
  };

  const closeInstallments = () => {
    setInstRow(null);
    setShowInstForm(false);
    setNewInstAmount("");
    setNewInstDueDate("");
    setNewInstRemark("");
    setCompletingInstId(null);
  };

  const saveNewInstallment = () => {
    const amount = Number(newInstAmount) || 0;
    if (amount <= 0) {
      alert("Please enter a valid installment amount.");
      return;
    }
    if (!newInstDueDate) {
      alert("Please select a due date.");
      return;
    }
    if (amount > unscheduledPending) {
      alert(
        `Installment cannot exceed the unallocated pending amount (${money(unscheduledPending)}).`,
      );
      return;
    }

    const updatedRow = {
      ...instLive,
      installments: [
        ...instSchedules,
        {
          id: `inst-${Date.now()}`,
          amount,
          dueDate: newInstDueDate,
          remark: newInstRemark.trim(),
          status: "Pending",
          installmentDate: "",
          paymentMode: "",
        },
      ],
    };
    persistAdmissionUpdate(updatedRow);
    setShowInstForm(false);
    setNewInstAmount("");
    setNewInstDueDate("");
    setNewInstRemark("");
  };

  const saveInstallmentComplete = (item) => {
    const amount = Number(item?.amount) || 0;
    if (amount <= 0 || amount > instPending) {
      alert(
        "This installment amount is not valid for the current pending balance.",
      );
      return;
    }
    if (!completeInstDate) {
      alert("Please select the installment date.");
      return;
    }

    const updatedPayments = [
      ...instPayments,
      {
        date: completeInstDate,
        amount,
        mode: completeInstMode,
        remark: item?.remark || "",
        installmentId: item?.id || null,
      },
    ];
    const newPaid = instPaid + amount;
    const updatedSchedules = item?.id
      ? instSchedules.map((schedule) =>
          schedule.id === item.id
            ? {
                ...schedule,
                status: "Completed",
                installmentDate: completeInstDate,
                paymentMode: completeInstMode,
              }
            : schedule,
        )
      : instSchedules;

    persistAdmissionUpdate({
      ...instLive,
      amountPaid: newPaid,
      paymentMode: completeInstMode,
      paymentStatus: newPaid >= instTotal ? "Completed" : "Installment",
      payments: updatedPayments,
      installments: updatedSchedules,
    });
    setCompletingInstId(null);
    setCompleteInstDate(todayISO());
    setCompleteInstMode("Cash");
  };

  /* ================= CLEAR FILTERS ================= */

  const clearFilters = () => {
    setSearch("");
    setBuildingFilter("All");
    setPaymentFilter("All");
    setStatusFilter("All");
    setDateFilter("All");
    setDateFrom("");
    setDateTo("");
  };

  /* ================= CSV EXPORT ================= */

  const exportCsv = () => {
    if (filtered.length === 0) {
      alert("No admissions to export.");
      return;
    }

    const heads = [
      "User No",
      "Date",
      "Name",
      "Amount",
      "GST Amt",
      "Total (+GST)",
      "Paid",
      "Pending",
      "Payment Mode",
      "Status",
      "Due Date",
    ];

    const rows = filtered.map((r) => {
      const paid = Number(r.amountPaid) || 0;

      const gstAmt = r.includeGst
        ? (paid * (Number(r.gstPercent) || 0)) / 100
        : 0;

      const total = Number(r.totalAmount) || paid + gstAmt;

      const pending = total - paid;

      return [
        r.userNo || "-",
        r.admissionDate || "-",
        r.studentName || "-",
        paid,
        gstAmt,
        total,
        paid,
        pending,
        r.paymentMode || "-",
        r.paymentStatus || "-",
        r.dueDate || "-",
      ];
    });

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

  /* ================= PAY REMAINING ================= */

  /* ===== DELETE ADMISSION ===== */

  const deleteAdmission = (row) => {
    if (!window.confirm(`Delete admission of "${row.studentName}"?`)) {
      return;
    }

    let list = [];

    try {
      list = JSON.parse(localStorage.getItem(ADM_KEY) || "[]");
    } catch {
      list = [];
    }

    localStorage.setItem(
      ADM_KEY,
      JSON.stringify(list.filter((r) => r.id !== row.id)),
    );

    let floors = [];

    try {
      floors = JSON.parse(
        localStorage.getItem("hostel-admission-floors") || "[]",
      );
    } catch {
      floors = [];
    }

    const freedFloors = floors.map((floor) => ({
      ...floor,

      roomList: (floor.roomList || []).map((room) => ({
        ...room,

        beds: (room.beds || []).map((bed) =>
          bed.admissionId === row.id
            ? {
                ...bed,
                occupied: false,
                occupiedBy: null,
                userNo: null,
                admissionId: null,
              }
            : bed,
        ),
      })),
    }));

    localStorage.setItem(
      "hostel-admission-floors",
      JSON.stringify(freedFloors),
    );

    window.dispatchEvent(new Event("hostel-admission-updated"));

    window.dispatchEvent(new Event("hostel-data-updated"));

    setViewRow(null);

    alert("Admission deleted successfully.");
  };

  const openPay = (row, prefill) => {
    const remaining = rowTotal(row) - (Number(row.amountPaid) || 0);

    setPayRow(row);
    setPayAmount(
      prefill !== undefined
        ? String(prefill)
        : String(remaining > 0 ? remaining : ""),
    );
    setPayMode(row.paymentMode || "Cash");
  };

  const savePay = () => {
    const total = rowTotal(payRow);
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

    const newStatuses = ["Installment", "Monthly", "Pending"];

    const status =
      newPaid >= total
        ? newStatuses.includes(payRow.paymentStatus)
          ? "Completed"
          : "Paid"
        : newStatuses.includes(payRow.paymentStatus)
          ? payRow.paymentStatus
          : "Partial";

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
          ...(r.payments || []).map((pm) => ({ ...pm })),
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

    /* Receipt AUTOMATIC new values sobt ugto */

    if (updatedRow) setReceiptRow(updatedRow);
  };

  /* ================= RENDER ================= */

  return (
    <div className="al">
      {/* ================= FILTER CARD ================= */}

      <div className="al-filter-card">
        <div className="al-filters">
          {/* SEARCH */}

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

          {/* BUILDING */}

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

          {/* PAYMENT */}

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

          {/* STATUS */}

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

          {/* DATE RANGE */}

          <div className="al-field al-date-field">
            <label>Date</label>

            <select
              value={dateFilter}
              onChange={(e) => {
                setDateFilter(e.target.value);
                setDateFrom("");
                setDateTo("");
              }}
            >
              <option value="All">All Time</option>
              <option value="Today">Today</option>
              <option value="This Month">This Month</option>
              <option value="Last Month">Last Month</option>
              <option value="Custom">Custom Range</option>
            </select>
          </div>

          {dateFilter === "Custom" && (
            <>
              <div className="al-field al-date-range">
                <label>From</label>

                <input
                  type="date"
                  value={dateFrom}
                  onChange={(e) => setDateFrom(e.target.value)}
                />
              </div>

              <div className="al-field al-date-range">
                <label>To</label>

                <input
                  type="date"
                  value={dateTo}
                  onChange={(e) => setDateTo(e.target.value)}
                />
              </div>
            </>
          )}

          {/* CLEAR */}

          <button type="button" className="al-clear" onClick={clearFilters}>
            Clear
          </button>
        </div>
      </div>

      {/* ================= ACTION + PILLS ================= */}

      <div className="al-top-row">
        <div className="al-summary-actions">
          {/* TOTAL */}

          <div className="al-pill total-pill">
            <span>Total</span>
            <strong>{sums.total}</strong>
          </div>

          {/* PAID */}

          <div className="al-pill paid-pill">
            <span>Paid</span>
            <strong>{sums.paid}</strong>
          </div>

          {/* PARTIAL */}

          <div className="al-pill partial-pill">
            <span>Partial</span>
            <strong>{sums.partial}</strong>
          </div>

          {/* PENDING */}

          <div className="al-pill pending-pill">
            <span>Pending</span>
            <strong>{sums.pending}</strong>
          </div>

          {/* REVENUE */}

          <div className="al-pill revenue-pill">
            <span>Revenue</span>
            <strong>{money(sums.revenue)}</strong>
          </div>

          {/* PDF */}

          <button
            type="button"
            className="al-btn al-pdf"
            onClick={() => window.print()}
          >
            PDF
          </button>

          {/* CSV */}

          <button type="button" className="al-btn al-csv" onClick={exportCsv}>
            CSV
          </button>
        </div>
      </div>

      {/* ================= TABLE (11 columns) ================= */}

      <div className="al-table-card">
        <div className="al-table-wrap">
          <table className="al-table">
            <thead>
              <tr>
                <th>User No</th>
                <th>Date</th>
                <th>Name</th>
                <th>Amount</th>
                <th>GST Amt</th>
                <th>Total (+GST)</th>
                <th>Paid</th>
                <th>Pending</th>
                <th>Payment Mode</th>
                <th>Status</th>
                <th>Due Date</th>
              </tr>
            </thead>

            <tbody>
              {paged.length === 0 ? (
                <tr>
                  <td colSpan="11" className="al-empty">
                    No admissions found
                  </td>
                </tr>
              ) : (
                paged.map((row) => {
                  const paid = Number(row.amountPaid) || 0;

                  const gstAmt = row.includeGst
                    ? (paid * (Number(row.gstPercent) || 0)) / 100
                    : 0;

                  const total = Number(row.totalAmount) || paid + gstAmt;

                  const pending = total - paid;

                  return (
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
                        <span className="al-name">
                          {row.studentName || "-"}
                        </span>
                      </td>

                      <td>
                        <span className="al-amount">{money(paid)}</span>
                      </td>

                      <td>
                        <span className="al-amount">{money(gstAmt)}</span>
                      </td>

                      <td>
                        <span className="al-amount">{money(total)}</span>
                      </td>

                      <td>
                        <span className="al-amount al-paid">{money(paid)}</span>
                      </td>

                      <td>
                        <span
                          className={`al-amount al-balance ${
                            pending > 0 ? "due" : "clear"
                          }`}
                        >
                          {money(pending)}
                        </span>
                      </td>

                      <td>
                        <span className="al-bed">{row.paymentMode || "-"}</span>
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

                              if (row.paymentStatus === "Installment") {
                                setInstRow(row);
                              } else {
                                openPay(row);
                              }
                            }}
                            title={
                              row.paymentStatus === "Installment"
                                ? "Installment Details"
                                : "Pay Remaining"
                            }
                          >
                            {row.paymentStatus || "Pending"}
                          </button>
                        )}
                      </td>

                      <td>
                        <span className="al-date">{row.dueDate || "-"}</span>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {/* ================= PAGINATION ================= */}

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

      {/* ================= RECEIPT POPUP ================= */}

      {receiptRow && (
        <Receipt row={receiptRow} onClose={() => setReceiptRow(null)} />
      )}

      {/* ===== PAY REMAINING MODAL ===== */}

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
                <b>{money(rowTotal(payRow))}</b>
              </div>

              <div>
                <span>Already Paid</span>
                <b>{money(payRow.amountPaid)}</b>
              </div>

              <div>
                <span>Remaining</span>
                <b className="ap-rem">
                  {money(rowTotal(payRow) - (Number(payRow.amountPaid) || 0))}
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

      {/* ===== INSTALLMENT DETAILS MODAL ===== */}

      {instRow && instLive && (
        <div className="id-overlay" onClick={closeInstallments}>
          <div className="id-modal" onClick={(e) => e.stopPropagation()}>
            <div className="id-title">
              <b>Installment Details</b>
              <button
                type="button"
                className="id-close"
                onClick={closeInstallments}
              >
                ✕
              </button>
            </div>

            <div className="id-body">
              <div className="id-summary">
                <span>
                  Total: <b>{money(instTotal)}</b>
                </span>
                <span>
                  Paid: <b className="id-paid">{money(instPaid)}</b>
                </span>
                <span>
                  Pending: <b className="id-pending">{money(instPending)}</b>
                </span>
              </div>

              <button
                type="button"
                className="id-add"
                onClick={() => {
                  setShowInstForm((open) => !open);
                  setCompletingInstId(null);
                }}
                disabled={unscheduledPending <= 0}
              >
                ADD INSTALLMENT
              </button>

              {showInstForm && (
                <div className="id-add-form">
                  <label>
                    Amount
                    <input
                      type="number"
                      min="1"
                      max={unscheduledPending}
                      value={newInstAmount}
                      onChange={(e) => setNewInstAmount(e.target.value)}
                      placeholder="Enter amount"
                    />
                  </label>
                  <label>
                    Due Date
                    <input
                      type="date"
                      value={newInstDueDate}
                      onChange={(e) => setNewInstDueDate(e.target.value)}
                    />
                  </label>
                  <label className="id-remark-field">
                    Remark
                    <input
                      type="text"
                      value={newInstRemark}
                      onChange={(e) => setNewInstRemark(e.target.value)}
                      placeholder="Optional remark"
                    />
                  </label>
                  <div className="id-form-actions">
                    <button
                      type="button"
                      className="id-add"
                      onClick={saveNewInstallment}
                    >
                      ADD
                    </button>
                    <button
                      type="button"
                      className="id-form-cancel"
                      onClick={() => setShowInstForm(false)}
                    >
                      CANCEL
                    </button>
                  </div>
                </div>
              )}

              <div className="id-table-wrap">
                <table className="id-table">
                  <thead>
                    <tr>
                      <th>Invoice No</th>
                      <th>Amount</th>
                      <th>Due Date</th>
                      <th>Installment Date</th>
                      <th>Status / Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {instSchedules.map((item, i) => (
                      <tr key={item.id || `${item.dueDate}-${i}`}>
                        <td>
                          {item.invoiceNo ||
                            `INS${String(i + 1).padStart(4, "0")}`}
                        </td>
                        <td>{money(item.amount)}</td>
                        <td>{item.dueDate || "-"}</td>
                        <td>
                          {item.status === "Completed" ? (
                            item.installmentDate || "-"
                          ) : completingInstId === item.id ? (
                            <input
                              className="id-inline-date"
                              type="date"
                              value={completeInstDate}
                              onChange={(e) =>
                                setCompleteInstDate(e.target.value)
                              }
                            />
                          ) : (
                            "-"
                          )}
                        </td>
                        <td>
                          {item.status === "Completed" ? (
                            <span className="id-complete">Completed</span>
                          ) : completingInstId === item.id ? (
                            <div className="id-inline-actions">
                              <select
                                value={completeInstMode}
                                onChange={(e) =>
                                  setCompleteInstMode(e.target.value)
                                }
                              >
                                <option>Cash</option>
                                <option>UPI</option>
                                <option>Online</option>
                                <option>Bank</option>
                                <option>Bank Transfer</option>
                                <option>Cheque</option>
                              </select>
                              <button
                                type="button"
                                className="id-save"
                                onClick={() => saveInstallmentComplete(item)}
                              >
                                SAVE
                              </button>
                              <button
                                type="button"
                                className="id-cancel"
                                onClick={() => setCompletingInstId(null)}
                              >
                                CANCEL
                              </button>
                            </div>
                          ) : (
                            <button
                              type="button"
                              className="id-mark"
                              onClick={() => {
                                setCompletingInstId(item.id);
                                setCompleteInstDate(todayISO());
                                setCompleteInstMode(item.paymentMode || "Cash");
                                setShowInstForm(false);
                              }}
                            >
                              MARK COMPLETE
                            </button>
                          )}
                        </td>
                      </tr>
                    ))}

                    {instSchedules.length === 0 &&
                      instPayments.map((pm, i) => (
                        <tr key={`${pm.date}-${i}`}>
                          <td>
                            {pm.invoiceNo ||
                              `INV${String(i + 1).padStart(5, "0")}`}
                          </td>
                          <td>{money(pm.amount)}</td>
                          <td>{pm.dueDate || instLive.dueDate || "-"}</td>
                          <td>{pm.date || "-"}</td>
                          <td>
                            <span className="id-complete">Completed</span>
                          </td>
                        </tr>
                      ))}

                    {unscheduledPending > 0 && (
                      <tr>
                        <td>{`INS${String(instSchedules.length + 1).padStart(4, "0")}`}</td>
                        <td>{money(unscheduledPending)}</td>
                        <td>{instLive.dueDate || "-"}</td>
                        <td>
                          {completingInstId === "remaining" ? (
                            <input
                              className="id-inline-date"
                              type="date"
                              value={completeInstDate}
                              onChange={(e) =>
                                setCompleteInstDate(e.target.value)
                              }
                            />
                          ) : (
                            "-"
                          )}
                        </td>
                        <td>
                          {completingInstId === "remaining" ? (
                            <div className="id-inline-actions">
                              <select
                                value={completeInstMode}
                                onChange={(e) =>
                                  setCompleteInstMode(e.target.value)
                                }
                              >
                                <option>Cash</option>
                                <option>UPI</option>
                                <option>Online</option>
                                <option>Bank</option>
                                <option>Bank Transfer</option>
                                <option>Cheque</option>
                              </select>
                              <button
                                type="button"
                                className="id-save"
                                onClick={() =>
                                  saveInstallmentComplete({
                                    amount: unscheduledPending,
                                  })
                                }
                              >
                                SAVE
                              </button>
                              <button
                                type="button"
                                className="id-cancel"
                                onClick={() => setCompletingInstId(null)}
                              >
                                CANCEL
                              </button>
                            </div>
                          ) : (
                            <button
                              type="button"
                              className="id-mark"
                              onClick={() => {
                                setCompletingInstId("remaining");
                                setCompleteInstDate(todayISO());
                                setCompleteInstMode("Cash");
                                setShowInstForm(false);
                              }}
                            >
                              MARK COMPLETE
                            </button>
                          )}
                        </td>
                      </tr>
                    )}

                    {instSchedules.length === 0 &&
                      instPayments.length === 0 &&
                      unscheduledPending <= 0 && (
                        <tr>
                          <td colSpan="5" className="id-empty">
                            No installments
                          </td>
                        </tr>
                      )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ===== VIEW DETAILS MODAL ===== */}

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
                ✕
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

              {/* ===== MONTHLY RENT HISTORY ===== */}

              {(viewRow.rentLog || []).length > 0 && (
                <>
                  <div className="alv-sec">Monthly Rent History</div>

                  <table className="alv-rent-table">
                    <thead>
                      <tr>
                        <th>Month</th>
                        <th>Rent</th>
                        <th>GST</th>
                        <th>Received</th>
                        <th>Mode</th>
                        <th>Date</th>
                      </tr>
                    </thead>

                    <tbody>
                      {(viewRow.rentLog || []).map((r, i) => (
                        <tr key={`${r.month}-${i}`}>
                          <td>{r.month || "-"}</td>
                          <td>{money(r.rent)}</td>
                          <td>{r.gst ? money(r.gst) : "-"}</td>
                          <td>{money(r.received)}</td>
                          <td>{r.mode || "-"}</td>
                          <td>{r.date || "-"}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </>
              )}
            </div>

            <div className="alv-actions">
              <button
                type="button"
                className="alv-edit"
                onClick={() => {
                  setEditRow(viewRow);
                  setViewRow(null);
                }}
              >
                ✏ Edit
              </button>

              <button
                type="button"
                className="alv-delete"
                onClick={() => deleteAdmission(viewRow)}
              >
                🗑 Delete
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ===== EDIT ADMISSION ===== */}

      {editRow && (
        <div className="al-edit-overlay">
          <div className="al-edit-box">
            <div className="al-edit-head">
              <b>Edit Admission — {editRow.studentName || editRow.userNo}</b>

              <button type="button" onClick={() => setEditRow(null)}>
                ✕ Close
              </button>
            </div>

            <div className="al-edit-body">
              <AdmissionForm
                editRow={editRow}
                onDone={() => setEditRow(null)}
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
