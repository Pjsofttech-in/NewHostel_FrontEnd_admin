import React, { useEffect, useRef, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import "./Registration.css";
import {
  createOrUpdateRegistration,
  getRegistrationById,
  getRegistrations,
} from "../../services/registrationService.js";
import {
  getAllFloors,
  getRoomsByFloor,
  getBedsByRoom,
} from "../../services/hostelService.js";
import { getInquiryForRegistration } from "../../services/inquiryService.js";

const STEPS = [
  { id: 1, label: "BASIC DETAILS" },
  { id: 2, label: "GUARDIAN" },
  { id: 3, label: "WORK INFO" },
  { id: 4, label: "UNDERTAKING" },
  { id: 5, label: "AGREEMENT" },
];

const emptyForm = {
  // regType: "",
  // inquiryId: null,
  fullName: "", dateOfBirth: "", gender: "", email: "", maritalStatus: "",
  bloodGroup: "", religion: "",
  permanentAddress: "", city: "", state: "", pincode: "",
  parentsName: "", parentsMobNo: "",
  yearOfAdmission: "", currentInstitution: "", courseEnrolled: "",
  currentEmployer: "", designation: "", yearOfJoining: "",
  stayFrom: "", stayTo: "",
  // floorId:"",
  floorNumber: "", roomNumber: "", bedType: "", bedNumber: "", roomType: "",
  depositCollected: "", totalFees: "", remainingFees: "",
  paymentMode: "", transactionNumber: "", remark: "", status: "ACTIVE",
  admissionDate: new Date().toISOString().slice(0, 10),
  addressProofType: "", educationProofType: "",
  guardianMedical: {
    guardianFullName: "", guardianPermanentAddress: "", mobileNo: "",
    medicalCondition: "", allergies: "", familyDoctorFullName: "",
    doctormobileNo: "", vehicleType: "", registrationNo: "",
  },
};

/* ===== SIMPLE TEXT FIELD ===== */
const TextField = ({ name, label, value, onChange, required = false, type = "text", disabled = false }) => (
  <div className={`rf-text-field ${value ? "has-value" : ""} ${disabled ? "rf-disabled-field" : ""}`}>
    <span className="rf-text-placeholder">{label}{required && <em>*</em>}</span>
    <input type={type} name={name} value={value || ""} onChange={onChange} required={required} autoComplete="off" disabled={disabled} />
  </div>
);

const SelectField = ({ name, label, value, onChange, options, required = false, disabled = false }) => (
  <div className={`rf-float-field ${value ? "" : "is-empty"} ${disabled ? "rf-disabled-field" : ""}`}>
    <span className="rf-float-label">{label}{required && <em>*</em>}</span>
    <select name={name} value={value || ""} onChange={onChange} required={required} disabled={disabled}>
      <option value=""></option>
      {options.map((o) => <option key={o} value={o}>{o}</option>)}
    </select>
  </div>
);

const DateField = ({ name, label, value, onChange, required = false }) => (
  <div className={`rf-float-field ${value ? "" : "is-empty"}`}>
    <span className="rf-float-label">{label}{required && <em>*</em>}</span>
    <input type="date" name={name} value={value || ""} onChange={onChange} required={required} />
  </div>
);

const RadioField = ({ name, label, options, value, onChange, required = false }) => (
  <div className="rf-float-field rf-radio-field">
    <span className="rf-float-label">{label}{required && <em>*</em>}</span>
    <div className="rf-radios">
      {options.map((o) => (
        <label key={o}>
          <input type="radio" name={name} value={o} checked={value === o} onChange={onChange} required={required && !value} />
          <span>{o}</span>
        </label>
      ))}
    </div>
  </div>
);

const SaveReset = ({ onSave, onReset }) => (
  <div className="rf-right-btns">
    <button type="button" className="rf-save" onClick={onSave}>Save Draft</button>
    <button type="button" className="rf-reset" onClick={onReset}>Reset</button>
  </div>
);

/* ===== MAIN REGISTRATION COMPONENT ===== */

const Registration = ({ onSaved }) => {
  const { id: routeId } = useParams() || {};
  const navigate = useNavigate();
  const [step, setStep] = useState(1);
  const [form, setForm] = useState({ ...emptyForm });

  // Load existing registration when editing via route /:id
  useEffect(() => {
    if (!routeId) return;
    getRegistrationById(routeId).then((data) => {
      setForm((prev) => ({
        ...prev,
        ...data,
        guardianMedical: data.guardianMedical || prev.guardianMedical,
      }));
    }).catch((err) => console.error("Failed to load registration", err));
  }, [routeId]);
  const [saving, setSaving] = useState(false);

  // Files
  const [personalPhotoFile, setPersonalPhotoFile] = useState(null);
  const [addressProofFileObj, setAddressProofFileObj] = useState(null);
  const [educationProofFileObj, setEducationProofFileObj] = useState(null);
  const [signatureFile, setSignatureFile] = useState(null);
  const [parentSignatureFile, setParentSignatureFile] = useState(null);
  const [photoPreview, setPhotoPreview] = useState("");

  // Infrastructure dropdowns
  const [floors, setFloors] = useState([]);
  const [rooms, setRooms] = useState([]);
  const [beds, setBeds] = useState([]);

  // Inquiry prefill mode
  const [inquiryIdInput, setInquiryIdInput] = useState("");
  const [prefillLoading, setPrefillLoading] = useState(false);

  useEffect(() => {
    getAllFloors().then((data) => setFloors(Array.isArray(data) ? data : [])).catch(() => {});
  }, []);

const handleFloorChange = async (e) => {
  const floorId = e.target.value; // String(f.id) from <option>
  const floor = floors.find((f) => String(f.id) === String(floorId));

  setForm((prev) => ({
    ...prev,
    floorId: floorId || "",
    floorNumber: floor?.floorNumber != null ? String(floor.floorNumber) : "",
    roomNumber: "",
    bedNumber: "",
    bedType: "",
  }));
  setRooms([]);
  setBeds([]);

  if (!floor?.id) return;

  try {
    const r = await getRoomsByFloor(floor.id);
    const list = Array.isArray(r)
      ? r
      : Array.isArray(r?.data)
        ? r.data
        : Array.isArray(r?.content)
          ? r.content
          : [];
    setRooms(list);
  } catch (err) {
    console.error("getRoomsByFloor failed", err);
    setRooms([]);
  }
};

const handleRoomChange = async (e) => {
  const roomNumber = e.target.value;
  setForm((prev) => ({
    ...prev,
    roomNumber,
    bedNumber: "",
    bedType: "",
  }));
  setBeds([]);

  if (!roomNumber) return;

  const room = rooms.find(
    (r) =>
      String(r.roomNumber) === String(roomNumber) ||
      String(r.id) === String(roomNumber)
  );

  if (!room?.id) {
    console.warn("Room not found for value:", roomNumber, rooms);
    return;
  }

  try {
    const b = await getBedsByRoom(room.id);
    const list = Array.isArray(b)
      ? b
      : Array.isArray(b?.data)
        ? b.data
        : Array.isArray(b?.content)
          ? b.content
          : [];
    setBeds(list);
  } catch (err) {
    console.error("getBedsByRoom failed", err);
    setBeds([]);
  }
};

  const prefillFromInquiry = async () => {
    if (!inquiryIdInput) return;
    setPrefillLoading(true);
    try {
      const data = await getInquiryForRegistration(inquiryIdInput);
      setForm((prev) => ({
        ...prev,
        regType: "inquiry",
        inquiryId: data.inquiryId,
        fullName: data.fullName || prev.fullName,
        gender: data.gender || prev.gender,
        email: data.email || prev.email,
        parentsMobNo: data.parentsMobNo || prev.parentsMobNo,
        permanentAddress: data.permanentAddress || prev.permanentAddress,
        city: data.city || prev.city,
        state: data.state || prev.state,
        pincode: data.pincode || prev.pincode,
        courseEnrolled: data.courseEnrolled || prev.courseEnrolled,
        roomType: data.roomType || prev.roomType,
        bedType: data.bedType || prev.bedType,
      }));
      alert(`Prefilled from Inquiry ID: ${inquiryIdInput}`);
    } catch (err) {
      alert("Could not load inquiry: " + err.message);
    } finally {
      setPrefillLoading(false);
    }
  };

  const set = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const setGuardian = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({
      ...prev,
      guardianMedical: { ...prev.guardianMedical, [name]: value },
    }));
  };

  const onPhoto = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      setPersonalPhotoFile(file);
      setPhotoPreview(URL.createObjectURL(file));
    }
  };

  const reset = () => {
    setForm({ ...emptyForm });
    setPhotoPreview("");
    setPersonalPhotoFile(null);
    setAddressProofFileObj(null);
    setEducationProofFileObj(null);
    setSignatureFile(null);
    setParentSignatureFile(null);
    setRooms([]); setBeds([]);
    setInquiryIdInput("");
  };

  const submitAll = async (e) => {
    if (e && e.preventDefault) e.preventDefault();

    if (!form.fullName) {
      alert("Please enter Full Name.");
      setStep(1);
      return;
    }

    setSaving(true);
    try {
      const { guardianMedical, ...rest } = form;
      const payload = {
        ...rest,
        guardianMedical: guardianMedical,
      };

      await createOrUpdateRegistration({
        data: payload,
        inquiryId: form.inquiryId || null,
        personalPhoto: personalPhotoFile,
        addressProofFile: addressProofFileObj,
        educationProofFile: educationProofFileObj,
        signature: signatureFile,
        parentSignature: parentSignatureFile,
      });

      window.dispatchEvent(new Event("hostel-reg-updated"));
      alert("Registration completed successfully.");
      reset();
      setStep(1);
      if (typeof onSaved === "function") {
        onSaved();
      } else {
        // MFE context — navigate to users list
        navigate("/superadminclient/layout/layringhosteladmin/hostel-admission/users/report");
      }
    } catch (err) {
      alert("Registration failed: " + err.message);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="rf">
      {/* STEPS */}
      <div className="rf-steps">
        {STEPS.map((s) => (
          <button key={s.id} type="button" className={step === s.id ? "rf-step on" : "rf-step"} onClick={() => setStep(s.id)}>
            <i>{s.id}</i><b>{s.label}</b>
          </button>
        ))}
      </div>

      {/* INQUIRY PREFILL BAR */}
      <div style={{ display: "flex", gap: 8, padding: "8px 16px", background: "#f0f4ff", borderRadius: 8, marginBottom: 8, alignItems: "center" }}>
        <span style={{ fontSize: 12, fontWeight: 600, color: "#374151" }}>Prefill from Inquiry ID:</span>
        <input
          style={{ flex: 1, maxWidth: 180, padding: "4px 8px", border: "1px solid #d1d5db", borderRadius: 6, fontSize: 12 }}
          type="number"
          placeholder="Enter Inquiry ID"
          value={inquiryIdInput}
          onChange={(e) => setInquiryIdInput(e.target.value)}
        />
        <button type="button" style={{ padding: "4px 12px", background: "#2563eb", color: "#fff", border: "none", borderRadius: 6, fontSize: 12, cursor: "pointer" }}
          onClick={prefillFromInquiry} disabled={prefillLoading}>
          {prefillLoading ? "Loading..." : "Prefill"}
        </button>
        {form.inquiryId && (
          <span style={{ fontSize: 11, color: "#16a34a", fontWeight: 600 }}>✓ Linked to Inquiry #{form.inquiryId}</span>
        )}
        <button type="button" style={{ marginLeft: "auto", padding: "4px 10px", background: "#ef4444", color: "#fff", border: "none", borderRadius: 6, fontSize: 11, cursor: "pointer" }} onClick={reset}>
          Reset All
        </button>
      </div>

      {/* ===== STEP 1 ===== */}
      {step === 1 && (
        <form className="rf-box" onSubmit={(e) => { e.preventDefault(); setStep(2); }}>
          <div className="rf-title">Personal Details</div>

          <div className="rf-person">
            <div className="rf-person-main">
              <div className="rf-line1">
                <TextField name="fullName" label="Full Name" value={form.fullName} onChange={set} required />
                <DateField name="dateOfBirth" label="Date of Birth" value={form.dateOfBirth} onChange={set} required />
                <SelectField name="bloodGroup" label="Blood Group" value={form.bloodGroup} onChange={set} required
                  options={["A+","A-","B+","B-","O+","O-","AB+","AB-"]} />
                <SelectField name="religion" label="Religion" value={form.religion} onChange={set} required
                  options={["Hindu","Muslim","Christian","Sikh","Buddhist","Jain","Other"]} />
              </div>
              <div className="rf-line2">
                <RadioField name="gender" label="Gender" value={form.gender} onChange={set} required options={["Male","Female","Other"]} />
                <RadioField name="maritalStatus" label="Marital Status" value={form.maritalStatus} onChange={set} required options={["Married","Un-Married","Other"]} />
                <TextField name="email" label="Email" value={form.email} onChange={set} required type="email" disabled={!!form.inquiryId} />
              </div>
            </div>
            <label className="rf-photo">
              {photoPreview ? <img src={photoPreview} alt="" /> : <span>Click to Upload Photograph</span>}
              <input type="file" accept="image/*" className="rf-file" onChange={onPhoto} />
            </label>
          </div>

          <div className="rf-title">Contact Details</div>
          <div className="rf-ct1">
            <TextField name="permanentAddress" label="Permanent Address" value={form.permanentAddress} onChange={set} required disabled={!!form.inquiryId} />
            <TextField name="city" label="City" value={form.city} onChange={set} required disabled={!!form.inquiryId} />
            <SelectField name="state" label="State" value={form.state} onChange={set} required disabled={!!form.inquiryId}
              options={["Maharashtra","Gujarat","Karnataka","Delhi","Other"]} />
          </div>
          <div className="rf-ct2">
            <TextField name="pincode" label="Pincode" value={form.pincode} onChange={set} required disabled={!!form.inquiryId} />
            <TextField name="parentsName" label="Parent's Name" value={form.parentsName} onChange={set} required />
            <TextField name="parentsMobNo" label="Parent's Mobile" value={form.parentsMobNo} onChange={set} required disabled={!!form.inquiryId} />
          </div>

          <SaveReset onSave={() => alert("Draft saved locally.")} onReset={reset} />
          <div className="rf-nav">
            <button type="button" className="rf-back" disabled>Back</button>
            <button type="submit" className="rf-next">Next</button>
          </div>
        </form>
      )}

      {/* ===== STEP 2 — GUARDIAN / MEDICAL ===== */}
      {step === 2 && (
        <form className="rf-box" onSubmit={(e) => { e.preventDefault(); setStep(3); }}>
          <div className="rf-title">Guardian & Medical Information</div>
          <div className="rf-grid3">
            <TextField name="guardianFullName" label="Guardian Full Name" value={form.guardianMedical.guardianFullName} onChange={setGuardian} />
            <TextField name="mobileNo" label="Guardian Mobile" value={form.guardianMedical.mobileNo} onChange={setGuardian} />
            <TextField name="guardianPermanentAddress" label="Guardian Address" value={form.guardianMedical.guardianPermanentAddress} onChange={setGuardian} />
            <TextField name="medicalCondition" label="Medical Conditions" value={form.guardianMedical.medicalCondition} onChange={setGuardian} />
            <TextField name="allergies" label="Allergies" value={form.guardianMedical.allergies} onChange={setGuardian} />
            <TextField name="familyDoctorFullName" label="Family Doctor Name" value={form.guardianMedical.familyDoctorFullName} onChange={setGuardian} />
            <TextField name="doctormobileNo" label="Doctor Mobile" value={form.guardianMedical.doctormobileNo} onChange={setGuardian} />
            <SelectField name="vehicleType" label="Vehicle Type" value={form.guardianMedical.vehicleType} onChange={setGuardian}
              options={["Two-Wheeler","Four-Wheeler","None"]} />
            <TextField name="registrationNo" label="Vehicle Reg No" value={form.guardianMedical.registrationNo} onChange={setGuardian} />
          </div>
          <SaveReset onSave={() => alert("Draft saved locally.")} onReset={reset} />
          <div className="rf-nav">
            <button type="button" className="rf-next" onClick={() => setStep(1)}>Back</button>
            <button type="submit" className="rf-next">Next</button>
          </div>
        </form>
      )}

      {/* ===== STEP 3 — WORK INFO ===== */}
      {step === 3 && (
        <form className="rf-box" onSubmit={(e) => { e.preventDefault(); setStep(4); }}>
          <div className="rf-title">Work / Study Information</div>
          <div className="rf-grid3">
            <TextField name="currentInstitution" label="Institution / Employer" value={form.currentInstitution} onChange={set} />
            <TextField name="courseEnrolled" label="Course / Designation" value={form.courseEnrolled} onChange={set} disabled={!!form.inquiryId} />
            <TextField name="yearOfAdmission" label="Year of Admission / Joining" value={form.yearOfAdmission} onChange={set} />
            <TextField name="currentEmployer" label="Current Employer" value={form.currentEmployer} onChange={set} />
            <TextField name="designation" label="Designation" value={form.designation} onChange={set} />
            <TextField name="yearOfJoining" label="Year of Joining" value={form.yearOfJoining} onChange={set} />
          </div>
          <SaveReset onSave={() => alert("Draft saved locally.")} onReset={reset} />
          <div className="rf-nav">
            <button type="button" className="rf-next" onClick={() => setStep(2)}>Back</button>
            <button type="submit" className="rf-next">Next</button>
          </div>
        </form>
      )}

      {/* ===== STEP 4 — UNDERTAKING + DEPOSIT ===== */}
      {step === 4 && (
        <form className="rf-box rf-dark" onSubmit={(e) => { e.preventDefault(); setStep(5); }}>
          <div className="rf-title">Document Proofs</div>
          <div className="rf-grid3 rf-dark-labels">
            <SelectField name="addressProofType" label="Address Proof Type" value={form.addressProofType} onChange={set}
              options={["Aadhaar","Passport","Voter ID","Utility Bill"]} />
            <SelectField name="educationProofType" label="Education Proof Type" value={form.educationProofType} onChange={set}
              options={["Admission Letter","Bonafied Certificate","ID Card","Offer Letter"]} />
          </div>

          <div className="rf-grid2">
            <div className="rf-float-field">
              <span className="rf-float-label">Address Proof File</span>
              <input type="file" accept="image/*,application/pdf" onChange={(e) => setAddressProofFileObj(e.target.files?.[0] || null)} />
            </div>
            <div className="rf-float-field">
              <span className="rf-float-label">Education Proof File</span>
              <input type="file" accept="image/*,application/pdf" onChange={(e) => setEducationProofFileObj(e.target.files?.[0] || null)} />
            </div>
          </div>

          <div className="rf-grid2">
            <DateField name="stayFrom" label="Stay From" value={form.stayFrom} onChange={set} />
            <DateField name="stayTo" label="Stay To" value={form.stayTo} onChange={set} />
          </div>

          <div className="rf-grid2">
            <div className="rf-float-field">
              <span className="rf-float-label">Applicant Signature</span>
              <input type="file" accept="image/*" onChange={(e) => setSignatureFile(e.target.files?.[0] || null)} />
            </div>
            <div className="rf-float-field">
              <span className="rf-float-label">Parent Signature</span>
              <input type="file" accept="image/*" onChange={(e) => setParentSignatureFile(e.target.files?.[0] || null)} />
            </div>
          </div>

          <div className="rf-title">Room / Bed Assignment</div>
          <div className="rf-grid4 deposit-grid rf-dark-labels">
            <select
  name="floorNumber"
  value={form.floorId || ""}
  onChange={handleFloorChange}
  required
>
  <option value=""></option>
  {floors.map((f) => (
    <option key={f.id} value={String(f.id)}>
      {f.hostelBuildingName || "Floor"} — {f.floorNumber}
    </option>
  ))}
</select>
            <SelectField name="roomType" label="Room Type" value={form.roomType} onChange={set}
              options={["AC","Non-AC"]} disabled={!!form.inquiryId} />
            <SelectField name="roomNumber" label="Room No" value={form.roomNumber} onChange={handleRoomChange} required
              options={rooms.map((r) => r.roomNumber || String(r.id))} />
            <SelectField name="bedType" label="Bed Type" value={form.bedType} onChange={set}
              options={["Single","Double"]} disabled={!!form.inquiryId} />
          </div>
          <div className="rf-grid4 deposit-grid rf-dark-labels">
            <SelectField name="bedNumber" label="Bed No" value={form.bedNumber} onChange={set}
              options={beds.map((b) => b.bedNumber || String(b.id))} />
            <TextField name="depositCollected" label="Deposit Collected" value={form.depositCollected} onChange={set} required />
            <TextField name="totalFees" label="Total Fees" value={form.totalFees} onChange={set} />
            <TextField name="remainingFees" label="Remaining Fees" value={form.remainingFees} onChange={set} />
          </div>
          <div className="rf-grid3 rf-dark-labels">
            <SelectField name="paymentMode" label="Payment Mode" value={form.paymentMode} onChange={set}
              options={["Cash","UPI","Online","Bank Transfer","Cheque"]} />
            <TextField name="transactionNumber" label="Transaction No" value={form.transactionNumber} onChange={set} />
            <TextField name="remark" label="Remark" value={form.remark} onChange={set} />
          </div>

          <SaveReset onSave={() => alert("Draft saved locally.")} onReset={reset} />
          <div className="rf-nav">
            <button type="button" className="rf-next" onClick={() => setStep(3)}>Back</button>
            <button type="submit" className="rf-next">Next</button>
          </div>
        </form>
      )}

      {/* ===== STEP 5 — AGREEMENT ===== */}
      {step === 5 && (
        <form className="rf-box" onSubmit={submitAll}>
          <div className="rf-title">Agreement & Final Submission</div>
          <p className="rf-agree-text">
            I agree to abide by all rules and regulations of the Hostel. I confirm that all information
            provided is accurate and complete.
          </p>

          <div className="rf-grid2">
            <DateField name="admissionDate" label="Admission Date" value={form.admissionDate} onChange={set} required />
            <SelectField name="status" label="Status" value={form.status} onChange={set}
              options={["ACTIVE","PENDING","CANCEL","REFUND"]} />
          </div>

          <SaveReset onSave={() => alert("Draft saved locally.")} onReset={reset} />
          <div className="rf-nav">
            <button type="button" className="rf-next" onClick={() => setStep(4)}>Back</button>
            <button type="submit" className="rf-next" disabled={saving}>
              {saving ? "Submitting..." : "Submit Registration"}
            </button>
          </div>
        </form>
      )}
    </div>
  );
};

export default Registration;
