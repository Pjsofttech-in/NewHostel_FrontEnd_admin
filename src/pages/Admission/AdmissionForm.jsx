import React, { useEffect, useMemo, useRef, useState } from "react";
import "./AdmissionForm.css";

const REG_KEY = "hostel-registrations";
const FLOOR_KEY = "hostel-admission-floors";
const ADM_KEY = "hostel-admissions";
const BANKS_KEY = "hostel-banks";

const GST_RATE = 18;

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
  monthlyRent: "",
  totalAmount: "",

  includeGst: false,
  gstPercent: GST_RATE,
  gstAmount: "",
  grandTotal: "",

  amountPaid: "",
  paymentStatus: "",
  paymentMode: "",
  txnId: "",
  bankId: "",

  sources: "",
  sourceDetails: "",

  signature: "",

  /* ===== POLICE VERIFICATION (PDF) ===== */

  policeVerification: "",
};

const loadJson = (key, fb) => {
  try {
    const raw = localStorage.getItem(key);
    return raw ? JSON.parse(raw) : fb;
  } catch {
    return fb;
  }
};

/* ===== ADMITTED STUDENTS FILTER ===== */

const readAvailableUsers = () => {
  const regs = loadJson(REG_KEY, []);
  const ads = loadJson(ADM_KEY, []);

  const takenUserNo = new Set();
  const takenMobile = new Set();
  const takenName = new Set();

  ads.forEach((a) => {
    if (!a || a.status === "Cancelled") return;

    if (a.userNo) takenUserNo.add(String(a.userNo).trim());
    if (a.mobile) takenMobile.add(String(a.mobile).trim());
    if (a.studentName)
      takenName.add(String(a.studentName).trim().toLowerCase());
  });

  return regs.filter((r) => {
    if (!r) return false;

    const f = r.form || {};

    const regMobiles = [
      String(r.phone || "").trim(),
      String(r.mobile || "").trim(),
      String(f.mobile || "").trim(),
      String(f.applicantMobile || "").trim(),
    ].filter(Boolean);

    const regNames = [
      String(r.name || "")
        .trim()
        .toLowerCase(),
      String(f.fullName || "")
        .trim()
        .toLowerCase(),
    ].filter(Boolean);

    return (
      !takenUserNo.has(String(r.userNo || "").trim()) &&
      !regMobiles.some((m) => takenMobile.has(m)) &&
      !regNames.some((n) => takenName.has(n))
    );
  });
};

const formatMoney = (value) => {
  if (value === "" || value === null || value === undefined) {
    return "";
  }

  return `₹${Number(value).toLocaleString("en-IN", {
    maximumFractionDigits: 2,
  })}`;
};

const Field = ({ label, required, children }) => (
  <div className="af-field">
    <span className="af-label">
      {label}
      {required && <em>*</em>}
    </span>

    {children}
  </div>
);

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

const AdmissionForm = ({ editRow = null, onDone, onCancel }) => {
  const [form, setForm] = useState(() =>
    editRow
      ? { ...empty, ...editRow }
      : { ...empty, admissionDate: todayStr() },
  );

  const loadUsers = () => {
    const list = readAvailableUsers();

    if (!editRow) return list;

    const regs = loadJson(REG_KEY, []);
    const own = regs.find((r) => String(r.userNo) === String(editRow.userNo));

    if (own && !list.some((u) => String(u.userNo) === String(own.userNo))) {
      return [own, ...list];
    }

    return list;
  };

  const [users, setUsers] = useState(loadUsers);

  useEffect(() => {
    const refreshUsers = () => setUsers(loadUsers());

    window.addEventListener("storage", refreshUsers);
    window.addEventListener("admission-updated", refreshUsers);

    return () => {
      window.removeEventListener("storage", refreshUsers);
      window.removeEventListener("admission-updated", refreshUsers);
    };
  }, []);

  const floors = useMemo(() => loadJson(FLOOR_KEY, []), []);

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
     PAYMENT STATUS
  ========================================= */

  const calculateStatus = (total, paid) => {
    const totalAmount = Number(total) || 0;
    const amountPaid = Number(paid) || 0;

    if (totalAmount <= 0) return "";

    if (amountPaid <= 0) return "Pending";

    if (amountPaid < totalAmount) return "Partial";

    return "Paid";
  };

  /* =========================================
     PAYMENT CALCULATION
  ========================================= */

  const calculatePayment = (months, rent, includeGst, paid) => {
    const total = (Number(months) || 0) * (Number(rent) || 0);

    const gst = includeGst ? (total * GST_RATE) / 100 : 0;

    const grand = total + gst;

    const status = calculateStatus(grand, paid);

    return {
      totalAmount: total || "",
      gstAmount: includeGst ? gst : "",
      grandTotal: grand || "",
      paymentStatus: status,
    };
  };

  /* =========================================
     MAIN CHANGE HANDLER
  ========================================= */

  const set = (e) => {
    const { name, type, checked, value } = e.target;

    setForm((prev) => {
      const updated = {
        ...prev,
        [name]: type === "checkbox" ? checked : value,
      };

      let months = Number(prev.totalMonths) || 0;
      let rent = Number(prev.monthlyRent) || 0;
      let includeGst = prev.includeGst;
      let paid = Number(prev.amountPaid) || 0;

      if (name === "stayFrom" || name === "stayTo") {
        const from = name === "stayFrom" ? value : prev.stayFrom;
        const to = name === "stayTo" ? value : prev.stayTo;

        const calculatedMonths = calculateMonths(from, to);

        updated.totalMonths = calculatedMonths;

        months = Number(calculatedMonths) || 0;
      }

      if (name === "monthlyRent") {
        rent = Number(value) || 0;
      }

      if (name === "includeGst") {
        includeGst = checked;
        updated.gstPercent = GST_RATE;
      }

      if (name === "amountPaid") {
        paid = Number(value) || 0;
      }

      if (
        name === "stayFrom" ||
        name === "stayTo" ||
        name === "monthlyRent" ||
        name === "includeGst" ||
        name === "amountPaid"
      ) {
        const payment = calculatePayment(months, rent, includeGst, paid);

        updated.totalAmount = payment.totalAmount;
        updated.gstAmount = payment.gstAmount;
        updated.grandTotal = payment.grandTotal;
        updated.paymentStatus = payment.paymentStatus;
      }

      return updated;
    });
  };

  /* =========================================
     USER SELECTION
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

    setForm((prev) => ({
      ...prev,

      userNo,

      studentName: user.name || f.fullName || "",

      email: f.email || f.contactEmail || "",

      mobile: user.phone || f.mobile || "",

      building: f.building || "",

      floor: f.depFloor || f.floor || "",

      roomType: user.roomType || f.roomType || "",

      roomNumber: f.roomNumber || "",

      bedType: user.bedType || f.bedType || "",

      bedNumber: f.bedNumber || "",
    }));
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

  /* =========================================
     BUILDING DATA
  ========================================= */

  const buildingOpts = [
    ...new Set(floors.map((f) => f.building).filter(Boolean)),
  ];

  /* =========================================
     CURRENT BUILDING
  ========================================= */

  const buildingFloors = floors.filter((f) => f.building === form.building);

  const floorOpts = [
    ...new Set(buildingFloors.map((f) => f.floor).filter(Boolean)),
  ];

  const currentFloor = floors.find(
    (f) => f.building === form.building && f.floor === form.floor,
  );

  const rooms = currentFloor?.roomList || [];

  const roomTypes = [
    ...new Set(rooms.map((r) => (r.ac === "ac" ? "AC" : "Non-AC"))),
  ];

  const currentRoom = rooms.find((r) => r.name === form.roomNumber);

  const beds = currentRoom?.beds || [];

  const availableBeds = beds.filter(
    (b) => !b.occupied || (editRow && b.admissionId === editRow.id),
  );

  const bedTypes = [
    ...new Set(
      availableBeds
        .map((b) => {
          if (!b?.type) return "";

          const type = String(b.type).trim().toLowerCase();

          if (type === "single") return "Single";

          if (type === "double") return "Double";

          return b.type;
        })
        .filter(Boolean),
    ),
  ];

  const selectedBank = banks.find((b) => String(b.id) === String(form.bankId));
  const reset = () => {
    setForm({
      ...empty,
      admissionDate: todayStr(),
    });
  };
  const save = (e) => {
    e.preventDefault();

    const list = loadJson(ADM_KEY, []);

    const dup = list.find(
      (a) =>
        a &&
        a.status !== "Cancelled" &&
        (!editRow || a.id !== editRow.id) &&
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

    if (editRow) {
      const updatedList = list.map((r) =>
        r.id === editRow.id ? { ...r, ...form, bank: selectedBank || null } : r,
      );

      localStorage.setItem(ADM_KEY, JSON.stringify(updatedList));

      const clearedFloors = loadJson(FLOOR_KEY, []).map((floor) => ({
        ...floor,

        roomList: (floor.roomList || []).map((room) => ({
          ...room,

          beds: (room.beds || []).map((bed) =>
            bed.admissionId === editRow.id
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

      const editedFloors = clearedFloors.map((floor) => {
        if (floor.building !== form.building || floor.floor !== form.floor) {
          return floor;
        }

        return {
          ...floor,

          roomList: (floor.roomList || []).map((room) => {
            if (room.name !== form.roomNumber) {
              return room;
            }

            return {
              ...room,

              beds: (room.beds || []).map((bed) => {
                if (String(bed.number) === String(form.bedNumber)) {
                  return {
                    ...bed,
                    occupied: true,
                    occupiedBy: form.studentName,
                    userNo: form.userNo,
                    admissionId: editRow.id,
                  };
                }

                return bed;
              }),
            };
          }),
        };
      });

      localStorage.setItem(FLOOR_KEY, JSON.stringify(editedFloors));

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

    const row = {
      id: Date.now(),
      ...form,
      bank: selectedBank || null,
      status: "Active",
    };

    localStorage.setItem(ADM_KEY, JSON.stringify([...list, row]));
    const latestFloors = loadJson(FLOOR_KEY, []);

    const updatedFloors = latestFloors.map((floor) => {
      if (floor.building !== form.building || floor.floor !== form.floor) {
        return floor;
      }

      return {
        ...floor,

        roomList: (floor.roomList || []).map((room) => {
          if (room.name !== form.roomNumber) {
            return room;
          }

          return {
            ...room,

            beds: (room.beds || []).map((bed) => {
              if (String(bed.number) === String(form.bedNumber)) {
                return {
                  ...bed,
                  occupied: true,
                  occupiedBy: form.studentName,
                  userNo: form.userNo,
                  admissionId: row.id,
                };
              }

              return bed;
            }),
          };
        }),
      };
    });

    localStorage.setItem(FLOOR_KEY, JSON.stringify(updatedFloors));
    window.dispatchEvent(new Event("hostel-data-updated"));

    window.dispatchEvent(new Event("admission-updated"));

    alert("Admission saved successfully and bed allocated.");

    reset();
  };

  return (
    <form className="af" onSubmit={save}>
      <div className="af-grid">
        {/* ================= STUDENT NAME ================= */}
        <Field label="Student Name" required>
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
        {/* ================= EMAIL ================= */}
        <Field label="Email" required>
          <input
            type="email"
            name="email"
            value={form.email}
            onChange={set}
            required
          />
        </Field>
        {/* ================= MOBILE ================= */}
        <Field label="Mobile No" required>
          <input name="mobile" value={form.mobile} onChange={set} required />
        </Field>
        {/* ================= BUILDING ================= */}
        <Field label="Building Name" required>
          <select
            name="building"
            value={form.building}
            onChange={(e) =>
              setForm((prev) => ({
                ...prev,
                building: e.target.value,
                floor: "",
                roomNumber: "",
                bedType: "",
                bedNumber: "",
              }))
            }
            required
          >
            <option value=""></option>

            {buildingOpts.map((building) => (
              <option key={building} value={building}>
                {building}
              </option>
            ))}
          </select>
        </Field>
        {/* ================= FLOOR ================= */}
        <Field label="Floor" required>
          <select
            name="floor"
            value={form.floor}
            onChange={(e) =>
              setForm((prev) => ({
                ...prev,
                floor: e.target.value,
                roomNumber: "",
                bedType: "",
                bedNumber: "",
              }))
            }
            required
            disabled={!form.building}
          >
            <option value=""></option>

            {floorOpts.map((floor) => (
              <option key={floor} value={floor}>
                {floor}
              </option>
            ))}
          </select>
        </Field>
        {/* ================= ROOM TYPE ================= */}
        <Field label="Room Type" required>
          <select
            name="roomType"
            value={form.roomType}
            onChange={(e) =>
              setForm((prev) => ({
                ...prev,
                roomType: e.target.value,
                roomNumber: "",
                bedType: "",
                bedNumber: "",
              }))
            }
            required
            disabled={!form.floor}
          >
            <option value=""></option>

            {roomTypes.map((type) => (
              <option key={type} value={type}>
                {type}
              </option>
            ))}
          </select>
        </Field>
        {/* ================= ROOM NUMBER ================= */}
        <Field label="Room Number" required>
          <select
            name="roomNumber"
            value={form.roomNumber}
            onChange={(e) =>
              setForm((prev) => ({
                ...prev,
                roomNumber: e.target.value,
                bedType: "",
                bedNumber: "",
              }))
            }
            required
            disabled={!form.roomType}
          >
            <option value=""></option>

            {rooms
              .filter((r) =>
                form.roomType === "AC" ? r.ac === "ac" : r.ac === "nonac",
              )
              .map((r) => (
                <option key={r.id || r.name} value={r.name}>
                  {r.name}
                </option>
              ))}
          </select>
        </Field>
        {/* ================= BED TYPE ================= */}
        <Field label="Bed Type" required>
          <select
            name="bedType"
            value={form.bedType}
            onChange={(e) =>
              setForm((prev) => ({
                ...prev,
                bedType: e.target.value,
                bedNumber: "",
              }))
            }
            required
            disabled={!form.roomNumber}
          >
            <option value="">Select Bed Type</option>

            {bedTypes.map((type) => (
              <option key={type} value={type}>
                {type}
              </option>
            ))}
          </select>
        </Field>
        {/* ================= BED NUMBER ================= */}
        <Field label="Bed Number" required>
          <select
            name="bedNumber"
            value={form.bedNumber}
            onChange={set}
            required
            disabled={!form.bedType}
          >
            <option value="">Select Bed Number</option>

            {availableBeds
              .filter((b) => {
                const type = String(b?.type || "")
                  .trim()
                  .toLowerCase();

                return (
                  type ===
                  String(form.bedType || "")
                    .trim()
                    .toLowerCase()
                );
              })
              .map((b) => (
                <option key={b.id || b.number} value={b.number}>
                  {b.number}
                </option>
              ))}
          </select>
        </Field>
        {/* ================= ADMISSION DATE ================= */}
        <Field label="Admission Date" required>
          <input
            type="date"
            name="admissionDate"
            value={form.admissionDate}
            onChange={set}
            required
          />
        </Field>
        {/* ================= STAY FROM ================= */}
        <Field label="Stay From" required>
          <input
            type="date"
            name="stayFrom"
            value={form.stayFrom}
            onChange={set}
            required
          />
        </Field>
        {/* ================= STAY TO ================= */}
        <Field label="Stay To" required>
          <input
            type="date"
            name="stayTo"
            value={form.stayTo}
            onChange={set}
            required
          />
        </Field>
        {/* ================= TOTAL MONTHS ================= */}
        <Field label="Total Months" required>
          <input
            value={
              form.totalMonths
                ? `${form.totalMonths} Month${
                    Number(form.totalMonths) > 1 ? "s" : ""
                  }`
                : ""
            }
            readOnly
            placeholder="Months"
            required
          />
        </Field>
        {/* ================= MONTHLY RENT ================= */}
        <Field label="Monthly Rent" required>
          <input
            type="number"
            min="0"
            name="monthlyRent"
            value={form.monthlyRent}
            onChange={set}
            placeholder="Enter rent"
            required
          />
        </Field>
        {/* ================= TOTAL AMOUNT ================= */}
        <Field label="Total Amount" required>
          <input
            value={formatMoney(form.totalAmount)}
            readOnly
            placeholder="Amount"
            required
          />
        </Field>
        {/* ================= PAYMENT MODE ================= */}
        <Field label="Payment Mode" required>
          <select
            name="paymentMode"
            value={form.paymentMode}
            onChange={(e) => {
              setForm((prev) => ({
                ...prev,
                paymentMode: e.target.value,
                txnId: "",
                bankId: "",
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
        {/* ================= PAYMENT REFERENCE ================= */}
        {form.paymentMode === "UPI" ||
        form.paymentMode === "Online" ||
        form.paymentMode === "Bank Transfer" ? (
          <Field label="Transaction ID" required>
            <input
              name="txnId"
              value={form.txnId}
              onChange={set}
              placeholder="Enter transaction ID"
              required
            />
          </Field>
        ) : form.paymentMode === "Cheque" ? (
          <Field label="Cheque No." required>
            <input
              name="txnId"
              value={form.txnId}
              onChange={set}
              placeholder="Enter cheque number"
              required
            />
          </Field>
        ) : (
          <div className="af-payment-note">
            <span>Payment Reference</span>

            <strong>
              {form.paymentMode === "Cash" || form.paymentMode === "Bank"
                ? "Not required"
                : "Select payment mode"}
            </strong>
          </div>
        )}
        {/* ================= GST CHECK ================= */}
        <div className="af-gst-row">
          <label className="af-gst-check">
            <input
              type="checkbox"
              name="includeGst"
              checked={form.includeGst}
              onChange={set}
            />

            <span> GST</span>
          </label>
        </div>
        {/* ================= BANK ================= */}
        {form.paymentMode === "Bank" && (
          <>
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

            {selectedBank && (
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
          </>
        )}
        {/* ================= GST AMOUNT ================= */}
        {form.includeGst && (
          <Field label="GST Amount" required>
            <input
              value={formatMoney(form.gstAmount)}
              readOnly
              placeholder="Auto calculated"
              required
            />
          </Field>
        )}
        {/* ================= GRAND TOTAL ================= */}
        <Field label="Grand Total" required>
          <input
            className="af-grand-total-input"
            value={formatMoney(form.grandTotal)}
            readOnly
            placeholder="Auto calculated"
            required
          />
        </Field>
        {/* ================= AMOUNT PAID ================= */}
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
        {/* ================= PAYMENT STATUS ================= */}
        <Field label="Payment Status" required>
          <div
            className={`af-status ${
              form.paymentStatus ? form.paymentStatus.toLowerCase() : "empty"
            }`}
          >
            {form.paymentStatus || "Auto calculated"}
          </div>
        </Field>
        {/* ================= SOURCE ================= */}
        <Field label="Source" required>
          <select
            name="sources"
            value={form.sources}
            onChange={(e) => {
              setForm((prev) => ({
                ...prev,
                sources: e.target.value,
                sourceDetails: "",
              }));
            }}
            required
          >
            <option value=""></option>
            <option>Walk-in</option>
            <option>Online</option>
            <option>Referral</option>
            <option>Other</option>
          </select>
        </Field>
        {/* ================= ONLINE ================= */}
        {form.sources === "Online" && (
          <Field label="Online Source" required>
            <select
              name="sourceDetails"
              value={form.sourceDetails}
              onChange={set}
              required
            >
              <option value=""></option>
              <option>Website</option>
              <option>Google</option>
              <option>Instagram</option>
              <option>Facebook</option>
              <option>YouTube</option>
              <option>Other</option>
            </select>
          </Field>
        )}
        {/* ================= REFERRAL ================= */}
        {form.sources === "Referral" && (
          <Field label="Referred By" required>
            <input
              name="sourceDetails"
              value={form.sourceDetails}
              onChange={set}
              placeholder="Enter person's name"
              required
            />
          </Field>
        )}
        {/* ================= OTHER ================= */}
        {form.sources === "Other" && (
          <Field label="Specify Source" required>
            <input
              name="sourceDetails"
              value={form.sourceDetails}
              onChange={set}
              placeholder="Enter source"
              required
            />
          </Field>
        )}
        {/* ================= SIGNATURE ================= */}
        <div className="af-field af-file">
          <span className="af-label">
            Authorized Signature
            <em>*</em>
          </span>

          <input
            type="file"
            accept="image/*"
            name="signature"
            onChange={(e) =>
              setForm((prev) => ({
                ...prev,
                signature: e.target.files?.[0]?.name || "",
              }))
            }
          />
        </div>
        {/* ================= POLICE VERIFICATION ================= */}
        <div className="af-field af-file">
          <span className="af-label">
            Police Verification
            <em>*</em>
          </span>

          <input
            type="file"
            accept="application/pdf"
            name="policeVerification"
            onChange={(e) =>
              setForm((prev) => ({
                ...prev,
                policeVerification: e.target.files?.[0]?.name || "",
              }))
            }
          />
        </div>
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
