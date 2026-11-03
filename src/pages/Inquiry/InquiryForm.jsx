import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import "./InquiryForm.css";
import { createInquiry, updateInquiry, getInquiryById } from "../../services/inquiryService.js";
import { getAllSources } from "../../services/hostelService.js";

const todayStr = () => {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
};

const MH_DISTRICTS = ["Pune","Mumbai","Nagpur","Nashik","Aurangabad","Kolhapur","Satara","Solapur","Ahmednagar","Other"];

const Field = ({ label, required, children }) => (
  <div className="iq-field">
    <span className="iq-label">
      {label}
      {required && <em>*</em>}
    </span>
    {children}
  </div>
);

const InquiryForm = ({ onSaved, editData: editDataProp }) => {
  // Support both prop-driven (standalone) and route-driven (/hostel-add-inquiry/:id) editing
  const { id: routeId } = useParams() || {};
  const [editData, setEditData] = useState(editDataProp || null);

  useEffect(() => {
    if (routeId && !editDataProp) {
      getInquiryById(routeId)
        .then((data) => setEditData(data))
        .catch((err) => console.error("Failed to load inquiry", err));
    }
  }, [routeId, editDataProp]);

  const emptyForm = {
    studentName: "", email: "", studentMobileNo: "",
    state: "", district: "", taluka: "", city: "", pincode: "",
    gender: "", address: "", roomType: "AC", bedType: "Single",
    numberOfMembers: "1", courseOfStudy: "", source: "",
    currentStatus: "New", inquiryDate: todayStr(),
    fatherName: "", fatherMobileNo: "",
  };

  const [form, setForm] = useState({ ...emptyForm });

  // Sync form when editData arrives (from route :id load or prop)
  useEffect(() => {
    if (editData) setForm({ ...emptyForm, ...editData });
  }, [editData]);
  const [sources, setSources] = useState([]);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
  getAllSources()
    .then((data) => {
      if (Array.isArray(data)) {
        setSources(
          data
            .map((s) => s.source || s.sourceName || "")
            .filter(Boolean)
        );
      }
    })
    .catch(() => {
      setSources(["Walk-in", "Online", "Referral", "Other"]);
    });
}, []);

  const set = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const save = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      const payload = {
        ...form,
        // map frontend field names → backend field names
        inquiryDate: form.inquiryDate,
      };

      let result;
      if (editData?.id) {
        result = await updateInquiry(editData.id, payload);
      } else {
        result = await createInquiry(payload);
      }

      window.dispatchEvent(new Event("hostel-inq-updated"));

      if (!editData) {
        alert(`Inquiry submitted successfully.\n\nID: ${result.id}`);
        setForm({ ...emptyForm, inquiryDate: todayStr() });
      }

      if (typeof onSaved === "function") onSaved(result);
    } catch (err) {
      alert("Failed to save inquiry: " + err.message);
    } finally {
      setSaving(false);
    }
  };

  return (
    <form className="iq" onSubmit={save}>
      <div className="iq-title">Personal Details</div>

      <div className="iq-grid3">
        <Field label="Student Name" required>
          <input name="studentName" value={form.studentName} onChange={set} required />
        </Field>

        <Field label="Email" required>
          <input type="email" name="email" value={form.email} onChange={set} required />
        </Field>

        <Field label="Student Mobile No" required>
          <input name="studentMobileNo" value={form.studentMobileNo} onChange={set} required />
        </Field>

        <Field label="Father Name">
          <input name="fatherName" value={form.fatherName} onChange={set} />
        </Field>

        <Field label="Father Mobile No">
          <input name="fatherMobileNo" value={form.fatherMobileNo} onChange={set} />
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
            {(form.state === "Maharashtra" ? MH_DISTRICTS : ["Other"]).map((d) => (
              <option key={d} value={d}>{d}</option>
            ))}
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
          {["Male","Female","Other"].map((g) => (
            <label key={g}>
              <input type="radio" name="gender" value={g} checked={form.gender === g} onChange={set} />
              {g}
            </label>
          ))}
        </div>
      </div>

      <div className="iq-grid1">
        <Field label="Address" required>
          <input name="address" value={form.address} onChange={set} required />
        </Field>
      </div>

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
          <input name="numberOfMembers" value={form.numberOfMembers} onChange={set} required />
        </Field>

        <Field label="Course Of Study" required>
          <input name="courseOfStudy" value={form.courseOfStudy} onChange={set} required />
        </Field>

        <Field label="Source">
          <select name="source" value={form.source} onChange={set}>
            <option value="">Select Source</option>
            {sources.length
              ? sources.map((s) => <option key={s} value={s}>{s}</option>)
              : ["Walk-in","Online","Referral","Other"].map((s) => <option key={s}>{s}</option>)
            }
          </select>
        </Field>

        <Field label="Date" required>
          <input type="date" name="inquiryDate" value={form.inquiryDate} onChange={set} required />
        </Field>
      </div>

      <p className="iq-note">( All * Marked Fields Are Necessary To Fill )</p>

      <div className="iq-submit-wrap">
        <button type="submit" className="iq-submit" disabled={saving}>
          {saving ? "Saving..." : "Submit"}
        </button>
      </div>
    </form>
  );
};

export default InquiryForm;
