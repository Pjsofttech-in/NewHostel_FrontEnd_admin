import React, { useEffect, useMemo, useState } from "react";
import "./UserList.css";

const load = () => {
  try {
    return JSON.parse(localStorage.getItem("hostel-registrations") || "[]");
  } catch {
    return [];
  }
};

const UserList = () => {
  const [rows, setRows] = useState(load);

  useEffect(() => {
    const refresh = () => setRows(load());

    window.addEventListener("hostel-reg-updated", refresh);
    window.addEventListener("storage", refresh);

    refresh();

    return () => {
      window.removeEventListener("hostel-reg-updated", refresh);
      window.removeEventListener("storage", refresh);
    };
  }, []);

  const [q, setQ] = useState("");
  const [pMode, setPMode] = useState("");
  const [pStatus, setPStatus] = useState("");
  const [roomType, setRoomType] = useState("");
  const [bedType, setBedType] = useState("");
  const [page, setPage] = useState(1);
  const [per, setPer] = useState(10);

  const filtered = useMemo(() => {
    return rows.filter((r) => {
      if (
        q &&
        !String(r.userNo).toLowerCase().includes(q.toLowerCase()) &&
        !(r.name || "").toLowerCase().includes(q.toLowerCase())
      ) {
        return false;
      }

      if (pMode && r.pMode !== pMode) return false;
      if (pStatus && r.pStatus !== pStatus) return false;
      if (roomType && r.roomType !== roomType) return false;
      if (bedType && r.bedType !== bedType) return false;

      return true;
    });
  }, [rows, q, pMode, pStatus, roomType, bedType]);

  const totalAmt = filtered.reduce((s, r) => s + (Number(r.deposite) || 0), 0);

  const pending = filtered
    .filter((r) => r.pStatus === "Pending")
    .reduce((s, r) => s + (Number(r.deposite) || 0), 0);

  const pages = Math.max(1, Math.ceil(filtered.length / per));

  const slice = filtered.slice((page - 1) * per, page * per);

  const clearFilters = () => {
    setQ("");
    setPMode("");
    setPStatus("");
    setRoomType("");
    setBedType("");
    setPage(1);
  };

  const csv = () => {
    const head = [
      "User No",
      "Date",
      "Name",
      "Phone",
      "City",
      "Deposite",
      "P Mode",
      "P Status",
      "Room Type",
      "Bed Type",
      "Status",
    ];

    const body = filtered.map((r) =>
      [
        r.userNo,
        r.date,
        r.name,
        r.phone,
        r.city,
        r.deposite,
        r.pMode,
        r.pStatus,
        r.roomType,
        r.bedType,
        r.status,
      ]
        .map((value) => `"${String(value ?? "").replace(/"/g, '""')}"`)
        .join(","),
    );

    const blob = new Blob([[head.join(","), ...body].join("\n")], {
      type: "text/csv;charset=utf-8;",
    });

    const a = document.createElement("a");
    a.href = URL.createObjectURL(blob);
    a.download = "user-list.csv";
    a.click();

    URL.revokeObjectURL(a.href);
  };

  const pdf = () => {
    const head = [
      "Form No",
      "Date",
      "Name",
      "Phone",
      "City",
      "State",
      "Deposite Amount",
      "Payment Mode",
      "Payment Status",
      "Room Type",
      "Bed Type",
    ];

    const body = filtered
      .map((r, i) => {
        const cells = [
          r.userNo,
          r.date,
          r.name,
          r.phone,
          r.city,
          r.state || r.form?.state || "",
          r.deposite,
          r.pMode,
          r.pStatus,
          r.roomType,
          r.bedType,
        ]
          .map((c) => `<td>${c ?? ""}</td>`)
          .join("");

        const bg = i % 2 === 0 ? "#f8fafc" : "#ffffff";

        return `<tr style="background:${bg}">${cells}</tr>`;
      })
      .join("");

    const html = `
      <!DOCTYPE html>
      <html>
      <head>
        <title>Registrations</title>

        <style>
          @page {
            size: A4 landscape;
            margin: 16px;
          }

          html,
          body,
          table,
          th,
          td,
          tr {
            -webkit-print-color-adjust: exact !important;
            print-color-adjust: exact !important;
            color-adjust: exact !important;
          }

          body {
            font-family: Arial, sans-serif;
            margin: 24px;
            color: #111827;
          }

          table {
            width: 100%;
            border-collapse: collapse;
            font-size: 12px;
          }

          th {
            background-color: #2563eb !important;
            box-shadow: inset 0 0 0 1000px #2563eb;
            color: #fff !important;
            text-align: left;
            padding: 8px 6px;
            font-weight: 700;
          }

          td {
            padding: 7px 6px;
            border-bottom: 1px solid #e5e7eb;
          }

          tr:nth-child(even) td {
            background: #f8fafc !important;
          }
        </style>
      </head>

      <body>
        <table>
          <thead>
            <tr>
              ${head.map((h) => `<th>${h}</th>`).join("")}
            </tr>
          </thead>

          <tbody>
            ${body}
          </tbody>
        </table>

        <script>
          window.onload = function () {
            window.print();
          };
        </script>
      </body>
      </html>
    `;

    const w = window.open("", "_blank");

    if (!w) return;

    w.document.open();
    w.document.write(html);
    w.document.close();
  };

  useEffect(() => {
    if (page > pages) {
      setPage(pages);
    }
  }, [page, pages]);

  return (
    <div className="ul">
      {/* FILTER CARD */}
      <div className="ul-filter-card">
        <div className="ul-filters">
          {/* SEARCH */}
          <div className="ul-field ul-search ul-float-field">
            <span className="ul-float-label">Search</span>

            <div className="ul-search-box">
              <span>⌕</span>

              <input
                placeholder="Search form no. or name"
                value={q}
                onChange={(e) => {
                  setQ(e.target.value);
                  setPage(1);
                }}
              />
            </div>
          </div>

          {/* PAYMENT MODE */}
          <div
            className={`ul-field ul-float-field ${pMode ? "has-value" : ""}`}
          >
            <span className="ul-float-label">Payment Mode</span>

            <select
              value={pMode}
              onChange={(e) => {
                setPMode(e.target.value);
                setPage(1);
              }}
            >
              <option value=""></option>
              <option>Cash</option>
              <option>UPI</option>
              <option>Online</option>
            </select>
          </div>

          {/* PAYMENT STATUS */}
          <div
            className={`ul-field ul-float-field ${pStatus ? "has-value" : ""}`}
          >
            <span className="ul-float-label">Payment Status</span>

            <select
              value={pStatus}
              onChange={(e) => {
                setPStatus(e.target.value);
                setPage(1);
              }}
            >
              <option value=""></option>
              <option>Paid</option>
              <option>Pending</option>
              <option>Partial</option>
            </select>
          </div>

          {/* ROOM TYPE */}
          <div
            className={`ul-field ul-float-field ${roomType ? "has-value" : ""}`}
          >
            <span className="ul-float-label">Room Type</span>

            <select
              value={roomType}
              onChange={(e) => {
                setRoomType(e.target.value);
                setPage(1);
              }}
            >
              <option value=""></option>
              <option>Single</option>
              <option>Double</option>
              <option>Triple</option>
            </select>
          </div>

          {/* BED TYPE */}
          <div
            className={`ul-field ul-float-field ${bedType ? "has-value" : ""}`}
          >
            <span className="ul-float-label">Bed Type</span>

            <select
              value={bedType}
              onChange={(e) => {
                setBedType(e.target.value);
                setPage(1);
              }}
            >
              <option value=""></option>
              <option>Single</option>
              <option>Bunk</option>
            </select>
          </div>

          <button type="button" className="ul-clear" onClick={clearFilters}>
            Clear
          </button>
        </div>
      </div>

      {/* PILLS + PDF + CSV */}
      <div className="ul-action-bar">
        <div className="ul-sum-pills">
          <div className="ul-pill total">
            <span>Total Amount</span>
            <strong>₹{totalAmt.toFixed(2)}</strong>
          </div>

          <div className="ul-pill deposit">
            <span>Deposit</span>
            <strong>₹{totalAmt.toFixed(2)}</strong>
          </div>

          <div className="ul-pill pending">
            <span>Pending</span>
            <strong>₹{pending.toFixed(2)}</strong>
          </div>

          <div className="ul-pill cancelled">
            <span>Cancelled</span>
            <strong>₹0.00</strong>
          </div>

          <div className="ul-pill refund">
            <span>Refund</span>
            <strong>₹0.00</strong>
          </div>

          <div className="ul-actions">
            <button type="button" className="ul-btn ul-pdf" onClick={pdf}>
              ↓ PDF
            </button>

            <button type="button" className="ul-btn ul-csv" onClick={csv}>
              ↓ CSV
            </button>
          </div>
        </div>
      </div>

      {/* TABLE */}
      <div className="ul-table-card">
        <div className="ul-table-wrap">
          <table className="ul-table">
            <thead>
              <tr>
                <th>User No</th>
                <th>Date</th>
                <th>Name</th>
                <th>Phone</th>
                <th>City</th>
                <th>Deposit</th>
                <th>Payment</th>
                <th>Payment Status</th>
                <th>Room</th>
                <th>Bed</th>
                <th>Status</th>
              </tr>
            </thead>

            <tbody>
              {slice.length === 0 ? (
                <tr>
                  <td colSpan={11} className="ul-empty">
                    No Records Found!
                  </td>
                </tr>
              ) : (
                slice.map((r, index) => (
                  <tr key={r.userNo || index}>
                    <td>
                      <span className="ul-user-no">{r.userNo}</span>
                    </td>

                    <td className="ul-date">{r.date}</td>

                    <td>
                      <span className="ul-name">{r.name}</span>
                    </td>

                    <td>{r.phone}</td>

                    <td>{r.city}</td>

                    <td>
                      <span className="ul-amount">
                        ₹{Number(r.deposite || 0).toFixed(2)}
                      </span>
                    </td>

                    <td>{r.pMode || "-"}</td>

                    <td>
                      <span
                        className={`ul-payment-status ${
                          r.pStatus ? r.pStatus.toLowerCase() : ""
                        }`}
                      >
                        {r.pStatus || "-"}
                      </span>
                    </td>

                    <td>{r.roomType || "-"}</td>

                    <td>{r.bedType || "-"}</td>

                    <td>
                      <span
                        className={`ul-st ${
                          r.status ? r.status.toLowerCase() : ""
                        }`}
                      >
                        {r.status || "Active"}
                      </span>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* PAGINATION */}
        <div className="ul-pager">
          <span className="ul-page-info">
            {filtered.length === 0
              ? "0 records"
              : `${(page - 1) * per + 1}-${Math.min(
                  page * per,
                  filtered.length,
                )} of ${filtered.length}`}
          </span>

          <div className="ul-page-controls">
            <button
              type="button"
              disabled={page <= 1}
              onClick={() => setPage(page - 1)}
            >
              ‹
            </button>

            <span className="ul-pg">{page}</span>

            <button
              type="button"
              disabled={page >= pages}
              onClick={() => setPage(page + 1)}
            >
              ›
            </button>

            <select
              value={per}
              onChange={(e) => {
                setPer(Number(e.target.value));
                setPage(1);
              }}
            >
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
