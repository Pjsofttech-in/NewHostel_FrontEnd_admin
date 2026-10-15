import React from "react";
import "./Receipt.css";

/* ============================================
   HOSTEL INFO
============================================ */

const DEFAULT_HOSTEL = {
  hostelName: "Your Hostel Name",
  address: "",
  phone: "",
  email: "",
};

const getHostelInfo = () => {
  const out = { ...DEFAULT_HOSTEL };

  try {
    const raw = localStorage.getItem("hostel-settings");

    if (raw) {
      const data = JSON.parse(raw) || {};

      if (data.hostelName) out.hostelName = data.hostelName;
      if (data.address) out.address = data.address;
      if (data.phone) out.phone = data.phone;
      if (data.email) out.email = data.email;
    }
  } catch {
    // ignore
  }

  return out;
};

/* ============================================
   BUILDING INFO
============================================ */

const getBuildingInfo = (buildingName) => {
  if (!buildingName) return null;

  const target = String(buildingName).trim().toLowerCase();

  try {
    const list = JSON.parse(
      localStorage.getItem("hostel-admission-floors") || "[]",
    );

    if (Array.isArray(list)) {
      const entries = list.filter(
        (x) => x && x.building && x.building.trim().toLowerCase() === target,
      );

      if (entries.length > 0) {
        const withAddress = entries.find(
          (x) => x.address && String(x.address).trim(),
        );

        return {
          name: entries[0].building,
          address: withAddress ? String(withAddress.address).trim() : "",
        };
      }
    }
  } catch {
    // ignore
  }

  try {
    const list = JSON.parse(localStorage.getItem("hostel-buildings") || "[]");

    if (Array.isArray(list)) {
      const b = list.find(
        (x) => x && x.name && x.name.trim().toLowerCase() === target,
      );

      if (b) {
        return { name: b.name, address: String(b.address || "").trim() };
      }
    }
  } catch {
    // ignore
  }

  return null;
};

const money = (v) => {
  const n = Number(v) || 0;
  return `₹ ${n.toLocaleString("en-IN")}`;
};

const dash = (v) => (v === "" || v === null || v === undefined ? "-" : v);

const Receipt = ({ row, onClose }) => {
  if (!row) return null;

  const hostel = getHostelInfo();
  const building = getBuildingInfo(row.building);

  const headName = building ? building.name : hostel.hostelName;
  const headAddress = building
    ? building.address || hostel.address
    : hostel.address;

  const contactLine = [hostel.phone, hostel.email]
    .filter(Boolean)
    .join("  |  ");

  const grand = Number(row.grandTotal) || 0;
  const paid = Number(row.amountPaid) || 0;
  const balance = grand - paid;

  const payList = Array.isArray(row.payments) ? row.payments : [];

  const paySum = payList.reduce((sum, pm) => sum + (Number(pm.amount) || 0), 0);

  const history = [];

  if (paid - paySum > 0) {
    history.push({
      date: row.admissionDate,
      label: "Admission",
      amount: paid - paySum,
      mode: payList.length > 0 ? "-" : dash(row.paymentMode),
    });
  }

  payList.forEach((pm) => {
    history.push({
      date: pm.date,
      label: pm.label || "Rent",
      amount: Number(pm.amount) || 0,
      mode: pm.mode,
    });
  });
  const receiptNo = `REC-${String(row.id || "").slice(-6)}`;

  const txnLabel =
    row.paymentMode === "Cheque"
      ? "Cheque No."
      : row.paymentMode === "UPI" ||
          row.paymentMode === "Online" ||
          row.paymentMode === "Bank Transfer"
        ? "Transaction ID"
        : "Reference";

  return (
    <div className="rc-overlay">
      <div className="rc-modal">
        {/* ======= TOOLBAR ======= */}
        <div className="rc-toolbar no-print">
          <div className="rc-toolbar-btns">
            <button className="rc-print-btn" onClick={() => window.print()}>
              🖨 Print / Save PDF
            </button>
            <button className="rc-close-btn" onClick={onClose}>
              ✕ Close
            </button>
          </div>
        </div>

        {/* ======= RECEIPT PAPER ======= */}
        <div className="rc-paper receipt-print">
          {/* HEADER */}
          <div className="rc-head">
            <h1>{headName}</h1>
            {headAddress && <p>{headAddress}</p>}
            {contactLine && <p>{contactLine}</p>}
          </div>

          <div className="rc-title-band">ADMISSION RECEIPT</div>

          <div className="rc-meta">
            <span>
              <b>Receipt No:</b> {receiptNo}
            </span>
            <span>
              <b>Date:</b> {dash(row.admissionDate)}
            </span>
            <span
              className={`rc-chip ${row.paymentStatus ? row.paymentStatus.toLowerCase() : ""}`}
            >
              {dash(row.paymentStatus) || "Payment"}
            </span>
          </div>

          {/* STUDENT DETAILS */}
          <div className="rc-section">Student Details</div>
          <table className="rc-table">
            <tbody>
              <tr>
                <td>Student Name</td>
                <td className="rc-val">{dash(row.studentName)}</td>
                <td>User No</td>
                <td className="rc-val">{dash(row.userNo)}</td>
              </tr>
              <tr>
                <td>Mobile No</td>
                <td className="rc-val">{dash(row.mobile)}</td>
                <td>Email</td>
                <td className="rc-val">{dash(row.email)}</td>
              </tr>
            </tbody>
          </table>

          {/* ROOM DETAILS */}
          <div className="rc-section">Room &amp; Stay Details</div>
          <table className="rc-table">
            <tbody>
              <tr>
                <td>Building</td>
                <td className="rc-val">{dash(row.building)}</td>
                <td>Floor</td>
                <td className="rc-val">{dash(row.floor)}</td>
              </tr>
              <tr>
                <td>Room Type</td>
                <td className="rc-val">{dash(row.roomType)}</td>
                <td>Room Number</td>
                <td className="rc-val">{dash(row.roomNumber)}</td>
              </tr>
              <tr>
                <td>Bed Type</td>
                <td className="rc-val">{dash(row.bedType)}</td>
                <td>Bed Number</td>
                <td className="rc-val">{dash(row.bedNumber)}</td>
              </tr>
              <tr>
                <td>Stay From</td>
                <td className="rc-val">{dash(row.stayFrom)}</td>
                <td>Stay To</td>
                <td className="rc-val">{dash(row.stayTo)}</td>
              </tr>
            </tbody>
          </table>

          {/* FEE BREAKDOWN */}
          <div className="rc-section">Fee Breakdown</div>
          <table className="rc-fee">
            <tbody>
              <tr>
                <td>Monthly Rent</td>
                <td className="rc-num">{money(row.monthlyRent)}</td>
              </tr>
              <tr>
                <td>Total Months</td>
                <td className="rc-num">
                  {dash(row.totalMonths)} Month
                  {Number(row.totalMonths) > 1 ? "s" : ""}
                </td>
              </tr>
              <tr>
                <td>Total Amount</td>
                <td className="rc-num">{money(row.totalAmount)}</td>
              </tr>
              {row.includeGst && (
                <tr>
                  <td>GST ({dash(row.gstPercent)}%)</td>
                  <td className="rc-num">{money(row.gstAmount)}</td>
                </tr>
              )}
              <tr className="rc-row-grand">
                <td>Grand Total</td>
                <td className="rc-num">{money(row.grandTotal)}</td>
              </tr>
              <tr>
                <td>Amount Paid</td>
                <td className="rc-num rc-paid">{money(row.amountPaid)}</td>
              </tr>
              <tr className="rc-row-bal">
                <td>Balance Due</td>
                <td className={`rc-num ${balance > 0 ? "rc-red" : "rc-green"}`}>
                  {balance > 0 ? money(balance) : "₹ 0 (Fully Paid)"}
                </td>
              </tr>
            </tbody>
          </table>

          {/* PAYMENT DETAILS */}
          <div className="rc-section">Payment Details</div>
          <table className="rc-table">
            <tbody>
              <tr>
                <td>Payment Mode</td>
                <td className="rc-val">{dash(row.paymentMode)}</td>
                <td>{txnLabel}</td>
                <td className="rc-val">{dash(row.txnId)}</td>
              </tr>
              {row.bank && (
                <tr>
                  <td>Bank</td>
                  <td className="rc-val">{dash(row.bank.bankName)}</td>
                  <td>Account No</td>
                  <td className="rc-val">{dash(row.bank.accountNumber)}</td>
                </tr>
              )}
              <tr>
                <td>Source</td>
                <td className="rc-val">{dash(row.sources)}</td>
                <td>Admission Status</td>
                <td className="rc-val">{dash(row.status)}</td>
              </tr>
            </tbody>
          </table>

          {/* PAYMENT HISTORY */}
          {history.length > 0 && (
            <>
              <div className="rc-section">Payment History</div>
              <table className="rc-hist">
                <thead>
                  <tr>
                    <th>Date</th>
                    <th>For</th>
                    <th>Amount</th>
                    <th>Mode</th>
                  </tr>
                </thead>
                <tbody>
                  {history.map((pm, i) => (
                    <tr key={i}>
                      <td>{dash(pm.date)}</td>
                      <td>{dash(pm.label)}</td>
                      <td className="rc-num">{money(pm.amount)}</td>
                      <td>{dash(pm.mode)}</td>
                    </tr>
                  ))}
                  <tr className="rc-hist-total">
                    <td colSpan="2">Total Paid</td>
                    <td className="rc-num">{money(paid)}</td>
                    <td></td>
                  </tr>
                </tbody>
              </table>
            </>
          )}

          {/* SIGNATURES */}
          <div className="rc-sign">
            <div className="rc-sign-box">
              <span>Student / Guardian Signature</span>
            </div>
            <div className="rc-sign-box">
              <span>Authorized Signature</span>
            </div>
          </div>

          <p className="rc-foot">
            This is a computer generated receipt. Please retain it for future
            reference.
          </p>
        </div>
      </div>
    </div>
  );
};

export default Receipt;
