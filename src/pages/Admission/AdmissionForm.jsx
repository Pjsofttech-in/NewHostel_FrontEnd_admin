import React, { useEffect, useRef, useState } from "react";
import "./AdmissionForm.css";

const REG_KEY = "hostel-registrations";
const ADM_KEY = "hostel-admissions";
const BANKS_KEY = "hostel-banks";

const todayStr = () => {
  const d = new Date();

  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(
    2,
    "0",
  )}-${String(d.getDate()).padStart(2, "0")}`;
};

const empty = {
  userNo: "",
  studentName: "",
  email: "",
  mobile: "",

  building: "",
  floor: "",
  roomType: "",
  roomNumber: "",
  bedType: "",
  bedNumber: "",

  admissionDate: todayStr(),
  stayFrom: "",
  stayTo: "",

  totalMonths: "",

  amountPaid: "",
  paymentStatus: "",
  dueDate: "",
  rentMonth: "",
  includeGst: false,
  gstPercent: "",
  gstNo: "",
  totalAmount: "",
  paymentMode: "",
  bankId: "",
  txnId: "",
};

const loadJson = (key, fb) => {
  try {
    const raw = localStorage.getItem(key);
    return raw ? JSON.parse(raw) : fb;
  } catch {
    return fb;
  }
};

/* ===== ALL REGISTERED STUDENTS ===== */

const readRegisteredUsers = () => loadJson(REG_KEY, []).filter((r) => r);

const Field = ({ label, required, children, pillOnValue = false }) => {
  const [focused, setFocused] = useState(false);

  const child = React.Children.toArray(children)[0];
  const childValue = child?.props?.value;
  const hasValue =
    childValue !== undefined &&
    childValue !== null &&
    String(childValue).trim() !== "";

  const pill = focused || (pillOnValue && hasValue);

  return (
    <div
      className={`af-field ${pill ? "is-focused" : ""}`}
      onFocus={() => setFocused(true)}
      onBlur={(e) => {
        if (!e.currentTarget.contains(e.relatedTarget)) {
          setFocused(false);
        }
      }}
    >
      {children}

      <span className="af-label">
        {label}
        {required && <em>*</em>}
      </span>
    </div>
  );
};

/* =========================================
   SEARCHABLE STUDENT SELECT
========================================= */

const SearchableUserSelect = ({
  value,
  users,
  onSelect,
  onManual,
  required = false,
}) => {
  const [search, setSearch] = useState("");
  const [open, setOpen] = useState(false);
  const [active, setActive] = useState(0);

  const boxRef = useRef(null);

  const selected =
    users.find((x) => String(x.userNo) === String(value)) || null;

  const text = search.trim().toLowerCase();

  const filtered = text
    ? users.filter((x) =>
        [
          String(x.userNo || ""),
          x.name || "",
          x.city || "",
          (x.form || {}).city || "",
        ]
          .map((y) => String(y || "").toLowerCase())
          .some((y) => y.includes(text)),
      )
    : users;

  useEffect(() => {
    const onDocClick = (e) => {
      if (boxRef.current && !boxRef.current.contains(e.target)) {
        setOpen(false);
      }
    };

    document.addEventListener("mousedown", onDocClick);

    return () => document.removeEventListener("mousedown", onDocClick);
  }, []);

  useEffect(() => {
    setActive(0);
  }, [search]);

  const pick = (user) => {
    onSelect(user.userNo);

    setSearch("");
    setOpen(false);
  };

  const onKeyDown = (e) => {
    if (!open) {
      if (e.key === "ArrowDown" || e.key === "Enter") {
        setOpen(true);
      }

      return;
    }

    if (e.key === "ArrowDown") {
      e.preventDefault();

      setActive((prev) => Math.min(prev + 1, filtered.length - 1));
    } else if (e.key === "ArrowUp") {
      e.preventDefault();

      setActive((prev) => Math.max(prev - 1, 0));
    } else if (e.key === "Enter") {
      e.preventDefault();

      if (filtered[active]) {
        pick(filtered[active]);
      }
    } else if (e.key === "Escape") {
      setOpen(false);
      setSearch("");
    }
  };

  const S = {
    outer: { position: "relative" },
    row: { display: "flex", gap: 6, alignItems: "center", width: "100%" },
    input: { flex: 1, minWidth: 0 },
    clear: {
      flexShrink: 0,
      width: 30,
      height: 30,
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      border: "1px solid #d5dbe4",
      borderRadius: 5,
      background: "#ffffff",
      color: "#ef4444",
      fontSize: 11,
      fontWeight: 700,
      cursor: "pointer",
      padding: 0,
    },
    dropdown: {
      position: "absolute",
      top: "calc(100% + 4px)",
      left: 0,
      right: 0,
      maxHeight: 210,
      overflowY: "auto",
      background: "#ffffff",
      border: "1px solid #d5dbe4",
      borderRadius: 5,
      boxShadow: "0 8px 20px rgba(15, 23, 42, 0.1)",
      zIndex: 60,
      padding: 4,
    },
    empty: {
      padding: "12px 10px",
      textAlign: "center",
      fontSize: 11,
      color: "#9ca3af",
    },
    option: {
      width: "100%",
      display: "flex",
      alignItems: "center",
      gap: 10,
      padding: "6px 8px",
      border: "none",
      background: "transparent",
      borderRadius: 4,
      cursor: "pointer",
      textAlign: "left",
      fontFamily: "inherit",
    },
    optionActive: { background: "#eff6ff" },
    optionSelected: {
      background: "#eff6ff",
      boxShadow: "inset 0 0 0 1px #2563eb",
    },
    optNo: {
      fontSize: 11,
      fontWeight: 700,
      color: "#2563eb",
      whiteSpace: "nowrap",
    },
    optName: {
      flex: 1,
      fontSize: 11,
      fontWeight: 600,
      color: "#111827",
      whiteSpace: "nowrap",
      overflow: "hidden",
      textOverflow: "ellipsis",
    },
    optMeta: { fontSize: 9, color: "#64748b", whiteSpace: "nowrap" },
  };

  return (
    <div style={S.outer} ref={boxRef}>
      <div style={S.row}>
        <input
          type="text"
          name="studentName"
          style={S.input}
          value={
            open
              ? search
              : selected
                ? `${selected.userNo} - ${selected.name || "Student"}`
                : search
          }
          placeholder="Search name / user no / city..."
          onChange={(e) => {
            setSearch(e.target.value);

            if (onManual) {
              onManual(e.target.value);
            }

            setOpen(true);
          }}
          onFocus={() => setOpen(true)}
          onKeyDown={onKeyDown}
          required={required}
          autoComplete="off"
        />

        {selected && (
          <button
            type="button"
            style={S.clear}
            title="Clear"
            onClick={() => {
              setSearch("");

              if (onManual) {
                onManual("");
              }

              onSelect("");
            }}
          >
            ✕
          </button>
        )}
      </div>

      {open && (
        <div style={S.dropdown}>
          {filtered.length === 0 ? (
            <div style={S.empty}>No matching students found</div>
          ) : (
            filtered.map((user, index) => {
              const isSelected = String(user.userNo) === String(value);
              const isActive = index === active;

              return (
                <button
                  key={user.userNo}
                  type="button"
                  style={{
                    ...S.option,
                    ...(isSelected ? S.optionSelected : {}),
                    ...(!isSelected && isActive ? S.optionActive : {}),
                  }}
                  onMouseEnter={() => setActive(index)}
                  onClick={() => pick(user)}
                >
                  <b style={S.optNo}>{user.userNo}</b>

                  <span style={S.optName}>{user.name || "Unknown"}</span>

                  <small style={S.optMeta}>
                    {[user.city, user.phone].filter(Boolean).join(" · ")}
                  </small>
                </button>
              );
            })
          )}
        </div>
      )}
    </div>
  );
};

/* =========================================
   ADMISSION FORM
   - New admission : details + first fees
========================================= */

const AdmissionForm = ({ editRow = null, onDone, onCancel }) => {
  const [form, setForm] = useState(() =>
    editRow
      ? { ...empty, ...editRow }
      : { ...empty, admissionDate: todayStr() },
  );

  const [users, setUsers] = useState(() => readRegisteredUsers());

  useEffect(() => {
    const refreshUsers = () => setUsers(readRegisteredUsers());

    window.addEventListener("storage", refreshUsers);
    window.addEventListener("hostel-reg-updated", refreshUsers);

    return () => {
      window.removeEventListener("storage", refreshUsers);
      window.removeEventListener("hostel-reg-updated", refreshUsers);
    };
  }, []);

  /* =========================================
     BANKS
  ========================================= */

  const [banks, setBanks] = useState(() => loadJson(BANKS_KEY, []));

  useEffect(() => {
    const refresh = () => setBanks(loadJson(BANKS_KEY, []));

    window.addEventListener("storage", refresh);
    window.addEventListener("hostel-data-updated", refresh);

    return () => {
      window.removeEventListener("storage", refresh);
      window.removeEventListener("hostel-data-updated", refresh);
    };
  }, []);

  /* =========================================
     TOTAL MONTHS
  ========================================= */

  const calculateMonths = (from, to) => {
    if (!from || !to) return "";

    const start = new Date(from);
    const end = new Date(to);

    if (end < start) return "";

    let months =
      (end.getFullYear() - start.getFullYear()) * 12 +
      (end.getMonth() - start.getMonth());

    if (end.getDate() > start.getDate()) {
      months += 1;
    }

    return Math.max(1, months);
  };

  /* =========================================
     MAIN CHANGE HANDLER
  ========================================= */

  const set = (e) => {
    const { name, type, checked, value } = e.target;

    setForm((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  /* =========================================
     USER SELECTION — AUTOFILL
  ========================================= */

  const handleUserSelect = (userNo) => {
    const user = users.find((x) => String(x.userNo) === String(userNo));

    if (!user) {
      setForm((prev) => ({
        ...prev,
        userNo: userNo || "",
      }));

      return;
    }

    const f = user.form || {};

    setForm((prev) => {
      const base = {
        ...prev,

        userNo,

        studentName: user.name || f.fullName || "",

        email: f.email || f.contactEmail || "",

        mobile: user.phone || f.mobile || "",

        building: f.buildingName || f.building || "",

        floor: f.depFloor || f.floor || "",

        roomType: user.roomType || f.roomType || "",

        roomNumber: f.roomNumber || "",

        bedType: user.bedType || f.bedType || "",

        bedNumber: f.bedNumber || "",
      };

      const stayFrom = f.stayFrom || prev.stayFrom;
      const stayTo = f.stayTo || prev.stayTo;

      return {
        ...base,

        stayFrom,

        stayTo,

        totalMonths: calculateMonths(stayFrom, stayTo),
      };
    });
  };

  /* =========================================
     BANK SELECTION
  ========================================= */

  const onBank = (e) => {
    setForm((prev) => ({
      ...prev,
      bankId: e.target.value,
    }));
  };

  const selectedBank = banks.find((b) => String(b.id) === String(form.bankId));

  /* ===== TOTAL — amount + GST ===== */

  const gstAmount = form.includeGst
    ? ((Number(form.amountPaid) || 0) * (Number(form.gstPercent) || 0)) / 100
    : 0;

  const totalAmount = form.includeGst
    ? (Number(form.amountPaid) || 0) + gstAmount
    : "";

  const reset = () => {
    setForm({
      ...empty,
      admissionDate: todayStr(),
    });
  };
  const save = (e) => {
    e.preventDefault();

    const list = loadJson(ADM_KEY, []);

    if (editRow) {
      const updatedList = list.map((r) =>
        r.id === editRow.id
          ? {
              ...r,
              ...form,
              totalAmount: totalAmount || "",
              bank: selectedBank || null,
            }
          : r,
      );

      localStorage.setItem(ADM_KEY, JSON.stringify(updatedList));

      window.dispatchEvent(new Event("hostel-data-updated"));

      window.dispatchEvent(new Event("admission-updated"));

      alert("Admission updated successfully.");

      if (onDone) {
        onDone();
      } else {
        reset();
      }

      return;
    }

    /* ===== NEW ADMISSION — first fees ===== */

    const dup = list.find(
      (a) =>
        a &&
        a.status !== "Cancelled" &&
        ((form.userNo && a.userNo === form.userNo) ||
          (form.mobile && a.mobile === form.mobile) ||
          (form.studentName &&
            String(a.studentName || "")
              .trim()
              .toLowerCase() === form.studentName.trim().toLowerCase())),
    );

    if (dup) {
      alert(
        `This student already has an admission (${dup.userNo || dup.studentName}).`,
      );
      return;
    }

    const row = {
      id: Date.now(),
      ...form,
      totalAmount: totalAmount || "",
      bank: selectedBank || null,
      status: "Active",
    };

    localStorage.setItem(ADM_KEY, JSON.stringify([...list, row]));

    window.dispatchEvent(new Event("hostel-data-updated"));

    window.dispatchEvent(new Event("admission-updated"));

    alert("Admission saved successfully.");

    reset();
  };

  return (
    <form className="af" onSubmit={save}>
      <div className="af-grid">
        {/* ================= STUDENT NAME ================= */}
        <Field label="Student Name" required pillOnValue>
          <SearchableUserSelect
            value={form.userNo}
            users={users}
            onSelect={handleUserSelect}
            onManual={(text) =>
              setForm((prev) => ({
                ...prev,
                studentName: text,
              }))
            }
            required
          />
        </Field>
        {/* ================= MOBILE (autofill) ================= */}
        <Field label="Mobile No">
          <input name="mobile" value={form.mobile} readOnly />
        </Field>
        {/* ================= BUILDING (autofill) ================= */}
        <Field label="Building Name">
          <input name="building" value={form.building} readOnly />
        </Field>
        {/* ================= ROOM NUMBER (autofill) ================= */}
        <Field label="Room No">
          <input name="roomNumber" value={form.roomNumber} readOnly />
        </Field>
        {/* ================= BED NUMBER (autofill) ================= */}
        <Field label="Bed No">
          <input name="bedNumber" value={form.bedNumber} readOnly />
        </Field>

        {/* ================= ADMISSION DETAILS ================= */}

        <Field label="Admission Date" required>
          <input
            type="date"
            name="admissionDate"
            value={form.admissionDate}
            onChange={set}
            required
          />
        </Field>

        <Field label="Stay From" required>
          <input
            type="date"
            name="stayFrom"
            value={form.stayFrom}
            onChange={set}
            required
          />
        </Field>

        <Field label="Stay To" required>
          <input
            type="date"
            name="stayTo"
            value={form.stayTo}
            onChange={set}
            required
          />
        </Field>

        {/* ================= PAYMENT ================= */}

        <Field label="Amount Paid" required>
          <input
            type="number"
            min="0"
            name="amountPaid"
            value={form.amountPaid}
            onChange={set}
            placeholder="Enter paid amount"
            required
          />
        </Field>

        <Field label="Payment Status" required>
          <select
            name="paymentStatus"
            value={form.paymentStatus}
            onChange={(e) => {
              const status = e.target.value;

              setForm((prev) => ({
                ...prev,
                paymentStatus: status,
                dueDate: "",
                rentMonth: "",
                paymentMode: "",
                bankId: "",
                txnId: "",
              }));
            }}
            required
          >
            <option value=""></option>
            <option>Installment</option>
            <option>Monthly</option>
            <option>Completed</option>
            <option>Pending</option>
          </select>
        </Field>

        {/* ===== GST (normal checkbox — image sarkha) ===== */}

        <div className="af-field">
          <label
            style={{
              display: "flex",
              alignItems: "center",
              gap: 7,
              width: "100%",
              height: 36,
              cursor: "pointer",
              userSelect: "none",
            }}
          >
            <input
              type="checkbox"
              name="includeGst"
              checked={form.includeGst}
              onChange={(e) => {
                const checked = e.target.checked;

                setForm((prev) => ({
                  ...prev,
                  includeGst: checked,
                  gstPercent: checked ? prev.gstPercent : "",
                  gstNo: checked ? prev.gstNo : "",
                }));
              }}
            />

            <span style={{ fontSize: 11, fontWeight: 500, color: "#3f4c63" }}>
              GST
            </span>
          </label>
        </div>

        {form.includeGst && (
          <>
            <Field label="GST %" required>
              <input
                type="number"
                min="0"
                name="gstPercent"
                value={form.gstPercent}
                onChange={set}
                placeholder="Enter GST %"
                required
              />
            </Field>

            <Field label="GST No" required>
              <input
                type="text"
                name="gstNo"
                value={form.gstNo}
                onChange={set}
                placeholder="Enter GST number"
                required
              />
            </Field>

            <Field label="Total Amount" required>
              <input value={totalAmount || ""} readOnly required />
            </Field>
          </>
        )}

        {/* ===== CONDITIONAL FIELDS (status var) ===== */}

        {form.paymentStatus === "Installment" && (
          <Field label="Due Date" required>
            <input
              type="date"
              name="dueDate"
              value={form.dueDate}
              onChange={set}
              required
            />
          </Field>
        )}

        {form.paymentStatus === "Monthly" && (
          <Field label="Month" required>
            <input
              type="month"
              name="rentMonth"
              value={form.rentMonth}
              onChange={set}
              required
            />
          </Field>
        )}

        {form.paymentStatus === "Completed" && (
          <Field label="Payment Mode" required>
            <select
              name="paymentMode"
              value={form.paymentMode}
              onChange={(e) => {
                setForm((prev) => ({
                  ...prev,
                  paymentMode: e.target.value,
                  bankId: "",
                  txnId: "",
                }));
              }}
              required
            >
              <option value=""></option>
              <option>Cash</option>
              <option>UPI</option>
              <option>Online</option>
              <option>Bank</option>
              <option>Bank Transfer</option>
              <option>Cheque</option>
            </select>
          </Field>
        )}
        {/* ===== BANK + TRANSACTION (mode var — Cash sivay) ===== */}

        {form.paymentMode && form.paymentMode !== "Cash" && (
          <Field label="Bank Name" required>
            <select
              name="bankId"
              value={form.bankId}
              onChange={onBank}
              required
            >
              <option value="">Select Bank</option>

              {banks.map((bank) => (
                <option key={bank.id} value={bank.id}>
                  {bank.bankName}
                </option>
              ))}
            </select>
          </Field>
        )}

        {form.paymentMode && form.paymentMode !== "Cash" && selectedBank && (
          <Field label="Transaction ID" required>
            <input
              type="text"
              name="txnId"
              value={form.txnId}
              onChange={set}
              placeholder="Enter transaction ID"
              required
            />
          </Field>
        )}

        {form.paymentMode === "Bank" && selectedBank && (
          <>
            <Field label="Account Holder">
              <input value={selectedBank.accountHolder || ""} readOnly />
            </Field>

            <Field label="Account Number">
              <input value={selectedBank.accountNumber || ""} readOnly />
            </Field>

            <Field label="IFSC Code">
              <input value={selectedBank.ifsc || ""} readOnly />
            </Field>

            {selectedBank.branch && (
              <Field label="Branch">
                <input value={selectedBank.branch || ""} readOnly />
              </Field>
            )}

            {selectedBank.upiId && (
              <Field label="UPI ID">
                <input value={selectedBank.upiId || ""} readOnly />
              </Field>
            )}
          </>
        )}
      </div>
      {/* ================= ACTIONS ================= */}
      <div className="af-actions">
        <button type="submit" className="af-save">
          {editRow ? "Update" : "Save"}
        </button>

        {editRow ? (
          <button type="button" className="af-reset" onClick={onCancel}>
            Cancel
          </button>
        ) : (
          <button type="button" className="af-reset" onClick={reset}>
            Reset
          </button>
        )}
      </div>
    </form>
  );
};

export default AdmissionForm;
