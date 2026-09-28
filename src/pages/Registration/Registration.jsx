import React, { useEffect, useRef, useState } from "react";
import "./Registration.css";

const STEPS = [
  { id: 1, label: "BASIC DETAILS" },
  { id: 2, label: "GUARDIAN" },
  { id: 3, label: "WORK INFO" },
  { id: 4, label: "UNDERTAKING" },
  { id: 5, label: "AGREEMENT" },
];

const FLOOR_KEY = "hostel-admission-floors";
const DRAFT_KEY = "hostel-reg-draft";
const LIST_KEY = "hostel-registrations";
const SEQ_KEY = "hostel-reg-seq";
const INQUIRY_KEY = "hostel-inquiries";

const emptyForm = {
  /* ===== "" => name var click karun Inquiry/Direct select ===== */

  regType: "",

  inquiryNo: "",
  registrationNo: "",

  inquiryStudentName: "",

  fullName: "",
  birthDate: "",
  age: "",
  bloodGroup: "",
  religion: "",
  gender: "",
  maritalStatus: "",
  email: "",
  password: "",
  confirmPassword: "",

  permanentAddress: "",
  city: "",
  state: "",
  pincode: "",
  mobile: "",
  contactEmail: "",

  fatherName: "",
  motherName: "",
  fatherMobile: "",
  motherMobile: "",
  parentAddress: "",
  parentCity: "",
  parentState: "",
  parentPincode: "",

  medicalConditions: "",
  allergies: "",
  medications: "",
  medicalCity: "",
  doctorName: "",
  doctorPhone: "",
  doctorAltPhone: "",

  emergencyName: "",
  emergencyNumber: "",
  emergencyCity: "",
  relation: "",
  applicantMobile: "",
  applicantAltMobile: "",

  parkVehicle: "",
  vehicleType: "",
  vehicleReg: "",

  workType: "",
  collegeName: "",
  course: "",
  year: "",
  studentId: "",

  applicantName: "",
  parentGuardName: "",
  occupation: "",
  organization: "",
  designation: "",
  workAddress: "",
  workCity: "",
  workState: "",
  workPincode: "",
  workPhone: "",
  workEmail: "",
  monthlyIncome: "",

  applicantAddrProof: "",
  parentAddrProof: "",
  eduProof: "",
  stayFrom: "",
  stayTo: "",

  applicantSign: "",
  parentSign: "",
  agreeApplicantSign: "",
  agreeParentSign: "",

  buildingName: "",
  depFloor: "",
  roomType: "",
  roomNumber: "",
  bedType: "",
  bedNumber: "",
  depositAmount: "",
  depositStatus: "",
};

const STATUS_JOINED = "Joined";

/* =====================================================
   LOAD JSON
===================================================== */

const loadJson = (key, fallback) => {
  try {
    const raw = localStorage.getItem(key);

    if (!raw) {
      return fallback;
    }

    const data = JSON.parse(raw);

    return data;
  } catch {
    return fallback;
  }
};

/* =====================================================
   LOAD JOINED INQUIRIES
===================================================== */

const loadJoinedInquiries = () => {
  const inquiries = loadJson(INQUIRY_KEY, []);

  if (!Array.isArray(inquiries)) {
    return [];
  }

  return inquiries.filter(
    (item) =>
      (item.status || "New") === STATUS_JOINED && item.registered !== true,
  );
};

/* =====================================================
   TEXT FIELD
===================================================== */

const TextField = ({
  name,
  label,
  value,
  onChange,
  required = false,
  type = "text",
  disabled = false,
}) => {
  return (
    <div
      className={`rf-text-field ${
        value ? "has-value" : ""
      } ${disabled ? "rf-disabled-field" : ""}`}
    >
      <span className="rf-text-placeholder">
        {label}

        {required && <em>*</em>}
      </span>

      <input
        type={type}
        name={name}
        value={value || ""}
        onChange={onChange}
        required={required}
        autoComplete="off"
        disabled={disabled}
      />
    </div>
  );
};

/* =====================================================
   SELECT FIELD
===================================================== */

const SelectField = ({
  name,
  label,
  value,
  onChange,
  options,
  required = false,
  disabled = false,
}) => {
  return (
    <div
      className={`rf-float-field ${value ? "" : "is-empty"} ${
        disabled ? "rf-disabled-field" : ""
      }`}
    >
      <span className="rf-float-label">
        {label}

        {required && <em>*</em>}
      </span>

      <select
        name={name}
        value={value || ""}
        onChange={onChange}
        required={required}
        disabled={disabled}
      >
        <option value="">Select</option>

        {options.map((option) => (
          <option key={option} value={option}>
            {option}
          </option>
        ))}
      </select>
    </div>
  );
};

/* =====================================================
   SEARCHABLE INQUIRY SELECT
===================================================== */

const SearchableInquirySelect = ({
  label,
  value,
  inquiries,
  onSelect,
  required = false,
  disabled = false,
}) => {
  const [search, setSearch] = useState("");
  const [open, setOpen] = useState(false);
  const [active, setActive] = useState(0);

  const boxRef = useRef(null);

  const selected = inquiries.find((item) => item.inquiryNo === value) || null;

  const text = search.trim().toLowerCase();

  const filtered = text
    ? inquiries.filter((item) =>
        [item.inquiryNo, item.studentName, item.city]
          .map((x) => String(x || "").toLowerCase())
          .some((x) => x.includes(text)),
      )
    : inquiries;

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

  const pick = (item) => {
    onSelect(item.inquiryNo);

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
    outer: { position: "relative", zIndex: 20 },
    row: { display: "flex", gap: 6, alignItems: "center", width: "100%" },
    field: { flex: 1, minWidth: 0 },
    clear: {
      flexShrink: 0,
      width: 30,
      height: 30,
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      border: "1px solid #d1d5db",
      borderRadius: 7,
      background: "#ffffff",
      color: "#e11d48",
      fontSize: 12,
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
      border: "1px solid #d1d5db",
      borderRadius: 7,
      boxShadow: "0 8px 20px rgba(15, 23, 42, 0.12)",
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
      borderRadius: 6,
      cursor: "pointer",
      textAlign: "left",
      fontFamily: "inherit",
    },
    optionActive: { background: "#e9edf1" },
    optionSelected: {
      background: "#e9edf1",
      boxShadow: "inset 0 0 0 1px #2f7ab8",
    },
    optNo: {
      fontSize: 11,
      fontWeight: 700,
      color: "#2f7ab8",
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
    optMeta: { fontSize: 10, color: "#6b7280", whiteSpace: "nowrap" },
  };

  return (
    <div style={S.outer} ref={boxRef}>
      <div style={S.row}>
        <div
          className={`rf-text-field ${
            value || search ? "has-value" : ""
          } ${disabled ? "rf-disabled-field" : ""}`}
          style={S.field}
        >
          <span className="rf-text-placeholder">
            {label}

            {required && <em>*</em>}
          </span>

          <input
            type="text"
            value={
              open
                ? search
                : selected
                  ? `${selected.inquiryNo} - ${
                      selected.studentName || "Student"
                    }`
                  : search
            }
            placeholder={
              disabled
                ? "No inquiry selected"
                : "Search name / inquiry no / city..."
            }
            onChange={(e) => {
              setSearch(e.target.value);

              setOpen(true);
            }}
            onFocus={() => setOpen(true)}
            onKeyDown={onKeyDown}
            disabled={disabled}
            autoComplete="off"
          />
        </div>

        {selected && !disabled && (
          <button
            type="button"
            style={S.clear}
            title="Clear"
            onClick={() => {
              setSearch("");

              onSelect("");
            }}
          >
            ✕
          </button>
        )}
      </div>

      {open && !disabled && (
        <div style={S.dropdown}>
          {filtered.length === 0 ? (
            <div style={S.empty}>No matching inquiries found</div>
          ) : (
            filtered.map((item, index) => {
              const isSelected = item.inquiryNo === value;
              const isActive = index === active;

              return (
                <button
                  key={item.id || item.inquiryNo}
                  type="button"
                  style={{
                    ...S.option,
                    ...(isSelected ? S.optionSelected : {}),
                    ...(!isSelected && isActive ? S.optionActive : {}),
                  }}
                  onMouseEnter={() => setActive(index)}
                  onClick={() => pick(item)}
                >
                  <b style={S.optNo}>{item.inquiryNo}</b>

                  <span style={S.optName}>{item.studentName || "Unknown"}</span>

                  <small style={S.optMeta}>
                    {[item.city, item.mobile].filter(Boolean).join(" · ")}
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

/* =====================================================
   NAME TYPE FIELD
   - Name field var click => 2 option (Inquiry / Direct)
   - Inquiry => joined inquiries search (name/city/inq no)
   - Direct  => name type karaycha normal input
===================================================== */

const NameTypeField = ({
  regType,
  onPickType,
  onClearType,
  fullName,
  onNameChange,
  inquiryNo,
  inquiries,
  onSelectInquiry,
  lockedSelected,
}) => {
  const [open, setOpen] = useState(false);

  const wrapRef = useRef(null);

  useEffect(() => {
    const onDocClick = (e) => {
      if (wrapRef.current && !wrapRef.current.contains(e.target)) {
        setOpen(false);
      }
    };

    document.addEventListener("mousedown", onDocClick);

    return () => document.removeEventListener("mousedown", onDocClick);
  }, []);

  const pick = (type) => {
    setOpen(false);

    onPickType(type);
  };

  /* ================= DIRECT ================= */

  if (regType === "direct") {
    return (
      <div className="rf-ntf-row">
        <TextField
          name="fullName"
          label="Full Name (With Father/Husband)"
          value={fullName}
          onChange={onNameChange}
          required
        />

        <button
          type="button"
          className="rf-ntf-swap"
          title="Change (Inquiry / Direct)"
          onClick={onClearType}
        >
          ⇄
        </button>
      </div>
    );
  }

  /* ================= INQUIRY ================= */

  if (regType === "inquiry") {
    return (
      <div className="rf-ntf-row">
        <SearchableInquirySelect
          label="Search Name / City / Inq No"
          value={inquiryNo}
          inquiries={inquiries}
          onSelect={onSelectInquiry}
          required
          disabled={lockedSelected}
        />

        <button
          type="button"
          className="rf-ntf-swap"
          title="Change (Inquiry / Direct)"
          onClick={onClearType}
        >
          ⇄
        </button>
      </div>
    );
  }

  /* ================= PICKER (name var click => 2 option) ================= */

  return (
    <div className="rf-ntf-wrap" ref={wrapRef}>
      <button
        type="button"
        className={`rf-ntf-pick ${open ? "on" : ""}`}
        onClick={() => setOpen((prev) => !prev)}
      >
        <span>
          Full Name <em>*</em>
        </span>

        <i className="rf-ntf-arrow">▾</i>
      </button>

      {open && (
        <div className="rf-ntf-menu">
          <button
            type="button"
            className="rf-ntf-opt"
            disabled={inquiries.length === 0}
            onClick={() => pick("inquiry")}
          >
            Inquiry
          </button>

          <button
            type="button"
            className="rf-ntf-opt"
            onClick={() => pick("direct")}
          >
            Direct
          </button>
        </div>
      )}
    </div>
  );
};

/* =====================================================
   DATE FIELD
===================================================== */

const DateField = ({ name, label, value, onChange, required = false }) => {
  return (
    <div className={`rf-float-field ${value ? "" : "is-empty"}`}>
      <span className="rf-float-label">
        {label}

        {required && <em>*</em>}
      </span>

      <input
        type="date"
        name={name}
        value={value || ""}
        onChange={onChange}
        required={required}
      />
    </div>
  );
};

/* =====================================================
   RADIO FIELD
===================================================== */

const RadioField = ({
  name,
  label,
  options,
  value,
  onChange,
  required = false,
}) => {
  return (
    <div className="rf-float-field rf-radio-field">
      <span className="rf-float-label">
        {label}

        {required && <em>*</em>}
      </span>

      <div className="rf-radios">
        {options.map((option) => (
          <label key={option}>
            <input
              type="radio"
              name={name}
              value={option}
              checked={value === option}
              onChange={onChange}
              required={required && !value}
            />

            <span>{option}</span>
          </label>
        ))}
      </div>
    </div>
  );
};

/* =====================================================
   SIGNATURE
===================================================== */

const SignatureField = ({ name, label, onChange }) => {
  return (
    <div className="rf-float-field rf-sign">
      <span className="rf-float-label">
        {label} <em>*</em>
      </span>

      <input
        type="file"
        accept="image/*"
        name={name}
        onChange={onChange}
        className="rf-native-file"
      />
    </div>
  );
};

/* =====================================================
   SAVE RESET
===================================================== */

const SaveReset = ({ onSave, onReset }) => {
  return (
    <div className="rf-right-btns">
      <button type="button" className="rf-save" onClick={onSave}>
        Save
      </button>

      <button type="button" className="rf-reset" onClick={onReset}>
        Reset
      </button>
    </div>
  );
};

/* =====================================================
   REGISTRATION
   - Via Inquiry : Joined inquiry select => auto fill
   - Direct      : inquiry sivay direct registration
===================================================== */

const Registration = ({ onSaved, selectedInquiry }) => {
  const [step, setStep] = useState(1);

  const [form, setForm] = useState(() => loadJson(DRAFT_KEY, emptyForm));

  const [preview, setPreview] = useState("");

  const [floors, setFloors] = useState(() => loadJson(FLOOR_KEY, []));

  const [joinedInquiries, setJoinedInquiries] = useState(loadJoinedInquiries);

  /* ===== NEW: isDirect helper ===== */

  const isDirect = form.regType === "direct";

  /* ===== NEXT USER NO (sequence internally use hoto) ===== */

  /* =====================================================
     REFRESH INQUIRIES
  ===================================================== */

  useEffect(() => {
    const refreshInquiries = () => {
      setJoinedInquiries(loadJoinedInquiries());
    };

    refreshInquiries();

    window.addEventListener("hostel-inq-updated", refreshInquiries);

    window.addEventListener("storage", refreshInquiries);

    return () => {
      window.removeEventListener("hostel-inq-updated", refreshInquiries);

      window.removeEventListener("storage", refreshInquiries);
    };
  }, []);

  /* =====================================================
     FLOOR REFRESH
  ===================================================== */

  useEffect(() => {
    setFloors(loadJson(FLOOR_KEY, []));
  }, [step]);

  /* =====================================================
     SELECTED INQUIRY FROM INQUIRY LIST
  ===================================================== */

  useEffect(() => {
    if (!selectedInquiry) {
      return;
    }

    if ((selectedInquiry.status || "New") !== STATUS_JOINED) {
      return;
    }

    if (selectedInquiry.registered === true) {
      return;
    }

    const inquiry = selectedInquiry;

    setForm((prev) => ({
      ...prev,

      regType: "inquiry",

      inquiryNo: inquiry.inquiryNo || "",

      inquiryStudentName: inquiry.studentName || "",

      fullName: inquiry.studentName || prev.fullName,

      email: inquiry.email || prev.email,

      mobile: inquiry.mobile || prev.mobile,

      contactEmail: inquiry.email || prev.contactEmail,

      city: inquiry.city || prev.city,

      state: inquiry.state || prev.state,

      pincode: inquiry.pincode || prev.pincode,

      permanentAddress:
        inquiry.address || inquiry.permanentAddress || prev.permanentAddress,

      course: inquiry.course || prev.course,

      gender: inquiry.gender || prev.gender,
    }));
  }, [selectedInquiry]);

  /* =====================================================
     TYPE SET (name field madhun pick / clear)
  ===================================================== */

  const setType = (type) => {
    setForm((prev) => ({
      ...prev,

      regType: type,

      /* Type badlali ki inquiry link kadhun fields unlock */

      inquiryNo: "",

      inquiryStudentName: "",
    }));
  };

  /* =====================================================
     INQUIRY SELECT
  ===================================================== */

  const handleInquirySelect = (inquiryNo) => {
    if (!inquiryNo) {
      setForm((prev) => ({
        ...prev,

        inquiryNo: "",

        inquiryStudentName: "",
      }));

      return;
    }

    const inquiry = joinedInquiries.find(
      (item) => item.inquiryNo === inquiryNo,
    );

    if (!inquiry) {
      return;
    }

    if (inquiry.registered === true) {
      alert("This inquiry is already registered.");

      return;
    }

    setForm((prev) => ({
      ...prev,

      inquiryNo: inquiry.inquiryNo || "",

      inquiryStudentName: inquiry.studentName || "",

      fullName: inquiry.studentName || "",

      email: inquiry.email || "",

      mobile: inquiry.mobile || "",

      contactEmail: inquiry.email || "",

      city: inquiry.city || "",

      state: inquiry.state || "",

      pincode: inquiry.pincode || "",

      permanentAddress: inquiry.address || inquiry.permanentAddress || "",

      course: inquiry.course || "",

      gender: inquiry.gender || "",
    }));
  };

  /* =====================================================
     NORMAL INPUT
  ===================================================== */

  const set = (e) => {
    const { name, type, checked, value } = e.target;

    const lockedFields = [
      "inquiryNo",
      "fullName",
      "email",
      "mobile",
      "contactEmail",
      "city",
      "state",
      "pincode",
      "permanentAddress",
      "course",
      "gender",
    ];

    if (lockedFields.includes(name) && form.inquiryNo) {
      return;
    }

    setForm((prev) => ({
      ...prev,

      [name]: type === "checkbox" ? checked : value,
    }));
  };

  /* =====================================================
     PHOTO
  ===================================================== */

  const onPhoto = (e) => {
    const file = e.target.files?.[0];

    if (file) {
      setPreview(URL.createObjectURL(file));
    }
  };

  /* =====================================================
     SIGNATURE
  ===================================================== */

  const onSign = (e) => {
    const { name, files } = e.target;

    const file = files?.[0];

    setForm((prev) => ({
      ...prev,

      [name]: file ? file.name : "",
    }));
  };

  /* =====================================================
     SAVE DRAFT
  ===================================================== */

  const saveDraft = () => {
    localStorage.setItem(DRAFT_KEY, JSON.stringify(form));

    alert("Saved.");
  };

  /* =====================================================
     RESET
  ===================================================== */

  const reset = () => {
    setForm({
      ...emptyForm,
    });

    setPreview("");

    localStorage.removeItem(DRAFT_KEY);
  };

  /* =====================================================
     FLOOR / ROOM DATA
  ===================================================== */

  const buildings = [...new Set(floors.map((f) => f.building).filter(Boolean))];

  const floorOpts = floors
    .filter((f) => !form.buildingName || f.building === form.buildingName)
    .map((f) => f.floor)
    .filter(Boolean);

  const currentFloor = floors.find(
    (f) =>
      (!form.buildingName || f.building === form.buildingName) &&
      f.floor === form.depFloor,
  );

  const rooms = currentFloor?.roomList || [];

  const currentRoom = rooms.find((r) => r.name === form.roomNumber);

  const beds = currentRoom?.beds || [];

  const roomTypes = [
    ...new Set(rooms.map((r) => (r.ac === "ac" ? "AC" : "Non-AC"))),
  ];

  const bedTypes = [...new Set(beds.map((b) => b.type).filter(Boolean))];

  /* =====================================================
     CREATE REGISTRATION NUMBER
  ===================================================== */

  const createRegistrationNo = (inquiryNo, sequence) => {
    const match = String(inquiryNo || "").match(/\d+/);

    const number = match ? Number(match[0]) : sequence;

    return `REG${String(number).padStart(3, "0")}`;
  };

  /* =====================================================
     SUBMIT REGISTRATION
  ===================================================== */

  const submitAll = (e) => {
    if (e && e.preventDefault) {
      e.preventDefault();
    }

    /* =========================
       TYPE PICK REQUIRED — name field madhun
    ========================= */

    if (!form.regType) {
      alert("Name field var click karun Inquiry / Direct select kara.");

      setStep(1);

      return;
    }

    /* =========================
       INQUIRY REQUIRED — fakt VIA INQUIRY mode madhe
    ========================= */

    if (!isDirect && !form.inquiryNo) {
      alert("Please select a Joined inquiry before registration.");

      setStep(1);

      return;
    }

    /* =========================
       INQUIRY VALIDATION — fakt inquiry mode madhe
    ========================= */

    let connectedInquiry = null;

    if (!isDirect && form.inquiryNo) {
      const inquiries = loadJson(INQUIRY_KEY, []);

      connectedInquiry = inquiries.find(
        (item) => item.inquiryNo === form.inquiryNo,
      );

      if (
        !connectedInquiry ||
        (connectedInquiry.status || "New") !== STATUS_JOINED
      ) {
        alert("This inquiry is not Joined. Registration is not allowed.");

        return;
      }

      if (connectedInquiry.registered === true) {
        alert("This inquiry is already registered.");

        return;
      }
    }

    /* =========================
       LOAD REGISTRATION LIST
    ========================= */

    const list = loadJson(LIST_KEY, []);

    /* =========================
       SEQUENCE
    ========================= */

    const nextSequence = (Number(localStorage.getItem(SEQ_KEY)) || 0) + 1;

    /* =========================
       REGISTRATION NO
       - Inquiry mode : INQ-0004 => REG004
       - Direct mode  : sequence madhun => REG005
    ========================= */

    const registrationNo = isDirect
      ? `REG${String(nextSequence).padStart(3, "0")}`
      : createRegistrationNo(form.inquiryNo, nextSequence);

    /* =========================
       DATE
    ========================= */

    const today = new Date();

    const date = `${today.getFullYear()}-${String(
      today.getMonth() + 1,
    ).padStart(2, "0")}-${String(today.getDate()).padStart(2, "0")}`;

    /* =========================
       REGISTRATION ROW
    ========================= */

    const row = {
      userNo: nextSequence,

      registrationNo,

      inquiryNo: isDirect ? "" : form.inquiryNo,

      source: isDirect ? "Direct" : "Inquiry",

      date,

      name: form.fullName || form.applicantName || "-",

      phone: form.mobile || form.applicantMobile || "-",

      city: form.city || "-",

      deposite: form.depositAmount || "0",

      pMode: "-",

      pStatus: form.depositStatus || "-",

      roomType: form.roomType || "-",

      bedType: form.bedType || "-",

      status: "Inactive",

      form: {
        ...form,

        registrationNo,
      },
    };

    /* =========================
       SAVE REGISTRATION
    ========================= */

    localStorage.setItem(LIST_KEY, JSON.stringify([...list, row]));

    localStorage.setItem(SEQ_KEY, String(nextSequence));

    /* =========================
       UPDATE INQUIRY — fakt inquiry mode madhe
    ========================= */

    if (!isDirect && form.inquiryNo) {
      const inquiries = loadJson(INQUIRY_KEY, []);

      const updatedInquiries = inquiries.map((item) => {
        if (item.inquiryNo !== form.inquiryNo) {
          return item;
        }

        return {
          ...item,

          registered: true,

          registrationCompleted: true,

          registrationNo,

          registrationUserNo: nextSequence,
        };
      });

      localStorage.setItem(INQUIRY_KEY, JSON.stringify(updatedInquiries));

      window.dispatchEvent(new Event("hostel-inq-updated"));
    }

    /* =========================
       CLEAN DRAFT
    ========================= */

    localStorage.removeItem(DRAFT_KEY);

    /* =========================
       EVENTS
    ========================= */

    window.dispatchEvent(new Event("hostel-reg-updated"));

    /* =========================
       SUCCESS
    ========================= */

    alert(
      `Registration completed successfully.\n\nRegistration No: ${registrationNo}\n${
        isDirect ? "Type: Direct Registration" : `Inquiry No: ${form.inquiryNo}`
      }`,
    );

    /* =========================
       RESET FORM
    ========================= */

    setForm({
      ...emptyForm,
    });

    setPreview("");

    setStep(1);

    /* =========================
       REFRESH JOINED LIST
    ========================= */

    setJoinedInquiries(loadJoinedInquiries());

    if (typeof onSaved === "function") {
      onSaved();
    }
  };

  /* =====================================================
     LOCK LOGIC — inquiry select zali tar fields lock,
     direct madhe sagle unlock
  ===================================================== */

  const locked = Boolean(form.inquiryNo);

  return (
    <div className="rf">
      {/* =====================================================
          STEPS
      ===================================================== */}

      <div className="rf-steps">
        {STEPS.map((s) => (
          <button
            key={s.id}
            type="button"
            className={step === s.id ? "rf-step on" : "rf-step"}
            onClick={() => setStep(s.id)}
          >
            <i>{s.id}</i>

            <b>{s.label}</b>
          </button>
        ))}
      </div>

      {/* =====================================================
          STEP 1
      ===================================================== */}

      {step === 1 && (
        <form
          className="rf-box"
          onSubmit={(e) => {
            e.preventDefault();

            if (!form.regType) {
              alert("Name field var click karun Inquiry / Direct select kara.");

              return;
            }

            if (!isDirect && !form.inquiryNo) {
              alert("Please select a Joined inquiry first.");

              return;
            }

            saveDraft();

            setStep(2);
          }}
        >
          {/* ================= PERSONAL ================= */}

          <div className="rf-title">Personal Details</div>

          <div className="rf-person">
            <div className="rf-person-main">
              {/* Line 1 : Name 33 + DOB + Age + Blood + Religion (chote) */}

              <div className="rf-line1">
                {/* Name var click => Inquiry / Direct 2 option */}

                <NameTypeField
                  regType={form.regType}
                  onPickType={setType}
                  onClearType={() => setType("")}
                  fullName={form.fullName}
                  onNameChange={set}
                  inquiryNo={form.inquiryNo}
                  inquiries={joinedInquiries}
                  onSelectInquiry={handleInquirySelect}
                  lockedSelected={
                    Boolean(selectedInquiry) &&
                    form.inquiryNo === selectedInquiry.inquiryNo
                  }
                />

                <DateField
                  name="birthDate"
                  label="Birth Date"
                  value={form.birthDate}
                  onChange={set}
                  required
                />

                <TextField
                  name="age"
                  label="Age"
                  value={form.age}
                  onChange={set}
                  required
                />

                <SelectField
                  name="bloodGroup"
                  label="Blood Group"
                  value={form.bloodGroup}
                  onChange={set}
                  required
                  options={["A+", "A-", "B+", "B-", "O+", "O-", "AB+", "AB-"]}
                />

                <SelectField
                  name="religion"
                  label="Religion"
                  value={form.religion}
                  onChange={set}
                  required
                  options={[
                    "Hindu",
                    "Muslim",
                    "Christian",
                    "Sikh",
                    "Buddhist",
                    "Jain",
                    "Other",
                  ]}
                />
              </div>

              {/* Line 2 : Gender + Marital Status + Email */}

              <div className="rf-line2">
                <RadioField
                  name="gender"
                  label="Gender"
                  value={form.gender}
                  onChange={set}
                  required
                  options={["Male", "Female", "Other"]}
                />

                <RadioField
                  name="maritalStatus"
                  label="Marital Status"
                  value={form.maritalStatus}
                  onChange={set}
                  required
                  options={["Married", "Un-Married", "Other"]}
                />

                <TextField
                  name="email"
                  label="Email"
                  value={form.email}
                  onChange={set}
                  required
                  type="email"
                  disabled={locked}
                />
              </div>

              {/* Line 3 : Password 33 + Confirm 33 + Save/Reset samor */}

              <div className="rf-line3">
                <TextField
                  name="password"
                  label="Password"
                  value={form.password}
                  onChange={set}
                  required
                  type="password"
                />

                <TextField
                  name="confirmPassword"
                  label="Confirm Password"
                  value={form.confirmPassword}
                  onChange={set}
                  required
                  type="password"
                />

                <div className="rf-right-btns rf-inline-btns">
                  <button type="button" className="rf-save" onClick={saveDraft}>
                    Save
                  </button>

                  <button type="button" className="rf-reset" onClick={reset}>
                    Reset
                  </button>
                </div>
              </div>
            </div>

            <label className="rf-photo">
              {preview ? (
                <img src={preview} alt="" />
              ) : (
                <span>
                  Click to Upload Photograph <em>*</em>
                </span>
              )}

              <input
                type="file"
                accept="image/*"
                className="rf-file"
                onChange={onPhoto}
              />
            </label>
          </div>

          {/* ================= CONTACT ================= */}

          <div className="rf-title">Contact Details</div>

          {/* Line 1 : Address 50 + City 25 + State 25 */}

          <div className="rf-ct1">
            <TextField
              name="permanentAddress"
              label="Permanent Address"
              value={form.permanentAddress}
              onChange={set}
              required
              disabled={locked}
            />

            <TextField
              name="city"
              label="City"
              value={form.city}
              onChange={set}
              required
              disabled={locked}
            />

            <SelectField
              name="state"
              label="State"
              value={form.state}
              onChange={set}
              required
              disabled={locked}
              options={[
                "Maharashtra",
                "Gujarat",
                "Karnataka",
                "Delhi",
                "Other",
              ]}
            />
          </div>

          {/* Line 2 : Pincode + Mobile + Contact Email + Save/Reset tight */}

          <div className="rf-ct2">
            <TextField
              name="pincode"
              label="Pincode"
              value={form.pincode}
              onChange={set}
              required
              disabled={locked}
            />

            <TextField
              name="mobile"
              label="Mobile No"
              value={form.mobile}
              onChange={set}
              required
              disabled={locked}
            />

            <TextField
              name="contactEmail"
              label="Contact Email"
              value={form.contactEmail}
              onChange={set}
              required
              type="email"
              disabled={locked}
            />

            <div className="rf-right-btns rf-inline-btns">
              <button type="button" className="rf-save" onClick={saveDraft}>
                Save
              </button>

              <button type="button" className="rf-reset" onClick={reset}>
                Reset
              </button>
            </div>
          </div>

          {/* ================= FAMILY ================= */}

          <div className="rf-title">Family Details</div>

          <div className="rf-grid3">
            <TextField
              name="fatherName"
              label="Father's Full Name"
              value={form.fatherName}
              onChange={set}
              required
            />

            <TextField
              name="fatherMobile"
              label="Father's Mobile No"
              value={form.fatherMobile}
              onChange={set}
              required
            />

            <TextField
              name="motherName"
              label="Mother's Full Name"
              value={form.motherName}
              onChange={set}
              required
            />
          </div>

          <div className="rf-grid2">
            <TextField
              name="motherMobile"
              label="Mother's Mobile No"
              value={form.motherMobile}
              onChange={set}
              required
            />

            <TextField
              name="parentAddress"
              label="Parent's Permanent Address"
              value={form.parentAddress}
              onChange={set}
              required
            />
          </div>

          <div className="rf-grid3">
            <TextField
              name="parentCity"
              label="City"
              value={form.parentCity}
              onChange={set}
              required
            />

            <SelectField
              name="parentState"
              label="State"
              value={form.parentState}
              onChange={set}
              required
              options={[
                "Maharashtra",
                "Gujarat",
                "Karnataka",
                "Delhi",
                "Other",
              ]}
            />

            <TextField
              name="parentPincode"
              label="Pincode"
              value={form.parentPincode}
              onChange={set}
              required
            />
          </div>
          <SaveReset onSave={saveDraft} onReset={reset} />

          <div className="rf-nav">
            <button type="button" className="rf-back" disabled>
              Back
            </button>

            <button type="submit" className="rf-next">
              Next
            </button>
          </div>
        </form>
      )}

      {/* =====================================================
          STEP 2
      ===================================================== */}

      {step === 2 && (
        <form
          className="rf-box"
          onSubmit={(e) => {
            e.preventDefault();

            saveDraft();

            setStep(3);
          }}
        >
          <div className="rf-title">
            MEDICAL INFORMATION & EMERGENCY CONTACT
          </div>

          {/* Row 1 : 4 box — Conditions + Allergies + Medications + City */}

          <div className="rf-grid4">
            <TextField
              name="medicalConditions"
              label="Existing Medical Conditions (if any)"
              value={form.medicalConditions}
              onChange={set}
            />

            <TextField
              name="allergies"
              label="Allergies (if any)"
              value={form.allergies}
              onChange={set}
            />

            <TextField
              name="medications"
              label="Medications (if any)"
              value={form.medications}
              onChange={set}
            />

            <TextField
              name="medicalCity"
              label="City"
              value={form.medicalCity}
              onChange={set}
            />
          </div>

          <div className="rf-grid3">
            <TextField
              name="doctorName"
              label="Family Doctor's Full Name"
              value={form.doctorName}
              onChange={set}
            />

            <TextField
              name="doctorPhone"
              label="Phone"
              value={form.doctorPhone}
              onChange={set}
            />

            <TextField
              name="doctorAltPhone"
              label="Alternate Phone"
              value={form.doctorAltPhone}
              onChange={set}
            />
          </div>

          <div className="rf-grid3">
            <TextField
              name="emergencyName"
              label="Emergency Person Name"
              value={form.emergencyName}
              onChange={set}
              required
            />

            <TextField
              name="emergencyNumber"
              label="Emergency Contact Number"
              value={form.emergencyNumber}
              onChange={set}
              required
            />

            <TextField
              name="emergencyCity"
              label="Emergency City"
              value={form.emergencyCity}
              onChange={set}
            />
          </div>

          <div className="rf-grid3">
            <TextField
              name="relation"
              label="Relation with the Applicant"
              value={form.relation}
              onChange={set}
              required
            />

            <TextField
              name="applicantMobile"
              label="Applicant's Mobile No"
              value={form.applicantMobile}
              onChange={set}
              required
            />

            <TextField
              name="applicantAltMobile"
              label="Applicant's Alternate Mobile No"
              value={form.applicantAltMobile}
              onChange={set}
            />
          </div>

          <SaveReset onSave={saveDraft} onReset={reset} />

          <div className="rf-title">VEHICLE ON THE PREMISES</div>

          <div className="rf-vehicle">
            <p>Would you be parking a vehicle on the premises?</p>

            <div className="rf-radios normal-radio">
              {["Yes", "No"].map((v) => (
                <label key={v}>
                  <input
                    type="radio"
                    name="parkVehicle"
                    value={v}
                    checked={form.parkVehicle === v}
                    onChange={set}
                  />

                  {v}
                </label>
              ))}
            </div>

            {form.parkVehicle === "Yes" && (
              <div className="rf-grid2 vehicle-fields">
                <TextField
                  name="vehicleType"
                  label="Vehicle Type / Brand Details"
                  value={form.vehicleType}
                  onChange={set}
                  required
                />

                <TextField
                  name="vehicleReg"
                  label="Registration Number"
                  value={form.vehicleReg}
                  onChange={set}
                  required
                />
              </div>
            )}
          </div>

          <SaveReset onSave={saveDraft} onReset={reset} />

          <div className="rf-nav">
            <button
              type="button"
              className="rf-next"
              onClick={() => setStep(1)}
            >
              Back
            </button>

            <button type="submit" className="rf-next">
              Next
            </button>
          </div>
        </form>
      )}

      {/* =====================================================
          STEP 3
      ===================================================== */}

      {step === 3 && (
        <form
          className="rf-box"
          onSubmit={(e) => {
            e.preventDefault();

            saveDraft();

            setStep(4);
          }}
        >
          <div className="rf-title">Work Information</div>

          <div className="rf-vehicle">
            <p>Are you a Student or Working?</p>

            <div className="rf-radios normal-radio">
              {["Study", "Working"].map((v) => (
                <label key={v}>
                  <input
                    type="radio"
                    name="workType"
                    value={v}
                    checked={form.workType === v}
                    onChange={set}
                  />

                  {v}
                </label>
              ))}
            </div>
          </div>

          {form.workType === "Study" && (
            <div className="rf-grid4">
              <TextField
                name="collegeName"
                label="College / Institute Name"
                value={form.collegeName}
                onChange={set}
                required
              />

              <TextField
                name="course"
                label="Course / Class"
                value={form.course}
                onChange={set}
                required
                disabled={locked}
              />

              <TextField
                name="year"
                label="Year / Semester"
                value={form.year}
                onChange={set}
                required
              />

              <TextField
                name="studentId"
                label="Student ID / Roll No"
                value={form.studentId}
                onChange={set}
                required
              />
            </div>
          )}

          {form.workType === "Working" && (
            <>
              <div className="rf-grid4">
                <TextField
                  name="occupation"
                  label="Occupation"
                  value={form.occupation}
                  onChange={set}
                  required
                />

                <TextField
                  name="designation"
                  label="Designation"
                  value={form.designation}
                  onChange={set}
                  required
                />

                <TextField
                  name="organization"
                  label="Organization / Company Name"
                  value={form.organization}
                  onChange={set}
                  required
                />

                <TextField
                  name="monthlyIncome"
                  label="Monthly Income"
                  value={form.monthlyIncome}
                  onChange={set}
                  required
                />
              </div>

              <div className="rf-grid1">
                <TextField
                  name="workAddress"
                  label="Work Address"
                  value={form.workAddress}
                  onChange={set}
                  required
                />
              </div>

              <div className="rf-grid3">
                <TextField
                  name="workCity"
                  label="City"
                  value={form.workCity}
                  onChange={set}
                  required
                />

                <SelectField
                  name="workState"
                  label="State"
                  value={form.workState}
                  onChange={set}
                  options={[
                    "Maharashtra",
                    "Gujarat",
                    "Karnataka",
                    "Delhi",
                    "Other",
                  ]}
                />

                <TextField
                  name="workPincode"
                  label="Pincode"
                  value={form.workPincode}
                  onChange={set}
                  required
                />
              </div>

              <div className="rf-grid2">
                <TextField
                  name="workPhone"
                  label="Work Phone"
                  value={form.workPhone}
                  onChange={set}
                  required
                />

                <TextField
                  name="workEmail"
                  label="Work Email"
                  value={form.workEmail}
                  onChange={set}
                  required
                  type="email"
                />
              </div>
            </>
          )}

          <SaveReset onSave={saveDraft} onReset={reset} />

          <div className="rf-nav">
            <button
              type="button"
              className="rf-next"
              onClick={() => setStep(2)}
            >
              Back
            </button>

            <button type="submit" className="rf-next">
              Next
            </button>
          </div>
        </form>
      )}

      {/* =====================================================
          STEP 4
      ===================================================== */}

      {step === 4 && (
        <form
          className="rf-box rf-dark"
          onSubmit={(e) => {
            e.preventDefault();

            saveDraft();

            setStep(5);
          }}
        >
          <div className="rf-title">UNDERTAKING</div>

          <p className="rf-agree-text">
            I hereby declare that the information provided in this form is true
            and accurate to the best of my knowledge. I am providing the
            following set of documents:
          </p>

          <div className="rf-grid3 rf-dark-labels">
            <SelectField
              name="applicantAddrProof"
              label="Applicant Address Proof"
              value={form.applicantAddrProof}
              onChange={set}
              options={["Aadhaar", "Passport", "Voter ID", "Utility Bill"]}
            />

            <SelectField
              name="parentAddrProof"
              label="Parent's Address Proof"
              value={form.parentAddrProof}
              onChange={set}
              options={["Aadhaar", "Passport", "Voter ID", "Utility Bill"]}
            />

            <SelectField
              name="eduProof"
              label="Educational / Company Proof"
              value={form.eduProof}
              onChange={set}
              options={[
                "Admission Letter / Offer Letter",
                "Bonafied Certificate",
                "Id Card",
              ]}
            />
          </div>

          {/* Stay dates — 2 box */}

          <div className="rf-grid2">
            <DateField
              name="stayFrom"
              label="Stay at hostel from"
              value={form.stayFrom}
              onChange={set}
            />

            <DateField
              name="stayTo"
              label="Stay at hostel to"
              value={form.stayTo}
              onChange={set}
            />
          </div>

          {/* Signatures — 2 box, extra gap nahi */}

          <div className="rf-grid2">
            <SignatureField
              name="applicantSign"
              label="Signature of the Applicant"
              onChange={onSign}
            />

            <SignatureField
              name="parentSign"
              label="Signature of the Parent/Guardian"
              onChange={onSign}
            />
          </div>

          <SaveReset onSave={saveDraft} onReset={reset} />

          <div className="rf-title">Deposit Details</div>

          <div className="rf-grid4 deposit-grid rf-dark-labels">
            <SelectField
              name="buildingName"
              label="Building Name"
              value={form.buildingName}
              onChange={set}
              required
              options={buildings.length ? buildings : []}
            />

            <SelectField
              name="depFloor"
              label="Floor"
              value={form.depFloor}
              onChange={set}
              required
              options={floorOpts}
            />

            <SelectField
              name="roomType"
              label="Room Type"
              value={form.roomType}
              onChange={set}
              options={roomTypes.length ? roomTypes : ["AC", "Non-AC"]}
            />

            <SelectField
              name="roomNumber"
              label="Room No"
              value={form.roomNumber}
              onChange={set}
              required
              options={rooms.map((r) => r.name)}
            />
          </div>

          <div className="rf-grid4 deposit-grid rf-dark-labels">
            <SelectField
              name="bedType"
              label="Bed Type"
              value={form.bedType}
              onChange={set}
              options={bedTypes.length ? bedTypes : ["Single", "Double"]}
            />

            <SelectField
              name="bedNumber"
              label="Bed No"
              value={form.bedNumber}
              onChange={set}
              options={beds.map((b) => b.number)}
            />

            <TextField
              name="depositAmount"
              label="Amount"
              value={form.depositAmount}
              onChange={set}
              required
            />

            <SelectField
              name="depositStatus"
              label="Deposit Status"
              value={form.depositStatus}
              onChange={set}
              options={["Paid", "Pending", "Partial"]}
            />
          </div>

          <SaveReset onSave={saveDraft} onReset={reset} />

          <div className="rf-nav">
            <button
              type="button"
              className="rf-next"
              onClick={() => setStep(3)}
            >
              Back
            </button>

            <button type="submit" className="rf-next">
              Next
            </button>
          </div>
        </form>
      )}

      {/* =====================================================
          STEP 5
      ===================================================== */}

      {step === 5 && (
        <form className="rf-box" onSubmit={submitAll}>
          <div className="rf-title">Agreement</div>

          <p className="rf-agree-text">
            I agree to abide by all rules and regulations of Hostel, and I
            understand that failure to comply may result in disciplinary
            actions, including cancellation of my admission.
          </p>

          <div className="rf-grid2">
            <TextField
              name="applicantName"
              label="Applicant's Name"
              value={form.applicantName}
              onChange={set}
              required
            />

            <SignatureField
              name="agreeApplicantSign"
              label="Applicant's Signature"
              onChange={onSign}
            />
          </div>

          <div className="rf-grid2">
            <TextField
              name="parentGuardName"
              label="Parent/Guardian's Name"
              value={form.parentGuardName}
              onChange={set}
              required
            />

            <SignatureField
              name="agreeParentSign"
              label="Parent/Guardian's Signature"
              onChange={onSign}
            />
          </div>

          <div className="rf-right-btns">
            <button type="button" className="rf-save" onClick={submitAll}>
              Save
            </button>

            <button type="button" className="rf-reset" onClick={reset}>
              Reset
            </button>
          </div>

          <div className="rf-nav">
            <button
              type="button"
              className="rf-next"
              onClick={() => setStep(4)}
            >
              Back
            </button>
          </div>
        </form>
      )}
    </div>
  );
};

export default Registration;
