import React, { useState } from "react";
import "./InquiryForm.css";

const KEY = "hostel-inquiries";
const SEQ = "hostel-inq-seq";

const todayStr = () => {
  const d = new Date();

  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(
    2,
    "0",
  )}-${String(d.getDate()).padStart(2, "0")}`;
};

const empty = {
  studentName: "",
  email: "",
  mobile: "",
  state: "",
  district: "",
  taluka: "",
  city: "",
  pincode: "",
  gender: "",
  address: "",
  roomType: "AC",
  bedType: "Single",
  members: "1",
  course: "",
  source: "",
  status: "New",
  date: todayStr(),
};

const MH_DISTRICTS = [
  "Pune",
  "Mumbai",
  "Nagpur",
  "Nashik",
  "Aurangabad",
  "Kolhapur",
  "Satara",
  "Solapur",
  "Ahmednagar",
  "Other",
];

const Field = ({ label, required, children }) => (
  <div className="iq-field">
    <span className="iq-label">
      {label}
      {required && <em>*</em>}
    </span>

    {children}
  </div>
);

const InquiryForm = ({ onSaved }) => {
  const [form, setForm] = useState(empty);

  const set = (e) => {
    const { name, value } = e.target;

    setForm((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const save = (e) => {
    e.preventDefault();

    let list = [];

    try {
      list = JSON.parse(localStorage.getItem(KEY) || "[]");
    } catch {
      list = [];
    }

    const next = (Number(localStorage.getItem(SEQ)) || 0) + 1;

    const inquiryNo = `INQ-${String(next).padStart(4, "0")}`;

    const row = {
      id: Date.now(),
      inquiryNo,

      ...form,
      status: "New",

      registered: false,
      registrationNo: "",
    };

    localStorage.setItem(KEY, JSON.stringify([...list, row]));

    localStorage.setItem(SEQ, String(next));

    window.dispatchEvent(new Event("hostel-inq-updated"));

    alert(`Inquiry submitted successfully.\n\nInquiry No: ${inquiryNo}`);

    setForm({
      ...empty,
      date: todayStr(),
    });

    if (typeof onSaved === "function") {
      onSaved(row);
    }
  };

  return (
    <form className="iq" onSubmit={save}>
      {/* ================= PERSONAL DETAILS ================= */}

      <div className="iq-title">Personal Details</div>

      <div className="iq-grid3">
        <Field label="Student Name" required>
          <input
            name="studentName"
            value={form.studentName}
            onChange={set}
            required
          />
        </Field>

        <Field label="Email" required>
          <input
            type="email"
            name="email"
            value={form.email}
            onChange={set}
            required
          />
        </Field>

        <Field label="Student Mobile No" required>
          <input name="mobile" value={form.mobile} onChange={set} required />
        </Field>

        <Field label="State">
          <select name="state" value={form.state} onChange={set}>
            <option value="">Select State</option>
            <option>Maharashtra</option>
            <option>Gujarat</option>
            <option>Karnataka</option>
            <option>Delhi</option>
            <option>Other</option>
          </select>
        </Field>

        <Field label="District">
          <select name="district" value={form.district} onChange={set}>
            <option value="">Select District</option>

            {(form.state === "Maharashtra" ? MH_DISTRICTS : ["Other"]).map(
              (d) => (
                <option key={d} value={d}>
                  {d}
                </option>
              ),
            )}
          </select>
        </Field>

        <Field label="Taluka" required>
          <input name="taluka" value={form.taluka} onChange={set} required />
        </Field>

        <Field label="City" required>
          <input name="city" value={form.city} onChange={set} required />
        </Field>

        <Field label="Pincode" required>
          <input name="pincode" value={form.pincode} onChange={set} required />
        </Field>

        <div className="iq-gender">
          <b>Gender :</b>

          {["Male", "Female", "Other"].map((g) => (
            <label key={g}>
              <input
                type="radio"
                name="gender"
                value={g}
                checked={form.gender === g}
                onChange={set}
              />

              {g}
            </label>
          ))}
        </div>
      </div>

      {/* ADDRESS */}

      <div className="iq-grid1">
        <Field label="Address" required>
          <input name="address" value={form.address} onChange={set} required />
        </Field>
      </div>

      {/* ================= ADDITIONAL ================= */}

      <div className="iq-title">Additional Information</div>

      <div className="iq-grid3">
        <Field label="Preferred Room Type">
          <select name="roomType" value={form.roomType} onChange={set}>
            <option>AC</option>
            <option>Non-AC</option>
          </select>
        </Field>

        <Field label="Preferred Bed Type">
          <select name="bedType" value={form.bedType} onChange={set}>
            <option>Single</option>
            <option>Double</option>
          </select>
        </Field>

        <Field label="Number Of Members" required>
          <input name="members" value={form.members} onChange={set} required />
        </Field>

        <Field label="Course Of Study" required>
          <input name="course" value={form.course} onChange={set} required />
        </Field>

        <Field label="Source">
          <select name="source" value={form.source} onChange={set}>
            <option value="">Select Source</option>

            <option>Walk-in</option>
            <option>Online</option>
            <option>Referral</option>
            <option>Other</option>
          </select>
        </Field>

        <Field label="Date" required>
          <input
            type="date"
            name="date"
            value={form.date}
            onChange={set}
            required
          />
        </Field>
      </div>

      <p className="iq-note">( All * Marked Fields Are Necessary To Fill )</p>

      <div className="iq-submit-wrap">
        <button type="submit" className="iq-submit">
          Submit
        </button>
      </div>
    </form>
  );
};

export default InquiryForm;
