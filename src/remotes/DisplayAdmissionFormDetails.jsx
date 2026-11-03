/**
 * hostelAdmin/DisplayAdmissionFormDetails
 * Shows full details of a single registration by ID from the URL.
 * Route: users/user-details/:id
 */
import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { getRegistrationById } from "../services/registrationService.js";

const Field = ({ label, value }) => (
  <div style={{
    display: "flex", flexDirection: "column", gap: 2,
    padding: "10px 14px", background: "#f8fafc", borderRadius: 8,
    border: "1px solid #e5e7eb",
  }}>
    <span style={{ fontSize: 10, color: "#6b7280", fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.05em" }}>
      {label}
    </span>
    <b style={{ fontSize: 13, color: "#111827" }}>{value || "—"}</b>
  </div>
);

const Section = ({ title, children }) => (
  <div style={{ marginBottom: 24 }}>
    <div style={{
      fontSize: 12, fontWeight: 700, color: "#2563eb", textTransform: "uppercase",
      letterSpacing: "0.08em", marginBottom: 10, paddingBottom: 6,
      borderBottom: "2px solid #dbeafe",
    }}>
      {title}
    </div>
    <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(200px, 1fr))", gap: 10 }}>
      {children}
    </div>
  </div>
);

const DisplayAdmissionFormDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!id) return;
    setLoading(true);
    getRegistrationById(id)
      .then(setData)
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, [id]);

  if (loading) return <div style={{ padding: 32, textAlign: "center", color: "#6b7280" }}>Loading details...</div>;
  if (error)   return <div style={{ padding: 32, color: "#ef4444" }}>Error: {error}</div>;
  if (!data)   return <div style={{ padding: 32, color: "#6b7280" }}>No data found.</div>;

  const gm = data.guardianMedical || {};
  const docs = data.documents || {};

  return (
    <div style={{ maxWidth: 900, margin: "0 auto", padding: 24 }}>
      {/* Header */}
      <div style={{
        display: "flex", alignItems: "center", justifyContent: "space-between",
        marginBottom: 24, paddingBottom: 16, borderBottom: "2px solid #e5e7eb",
      }}>
        <div>
          <h2 style={{ margin: 0, fontSize: 20, fontWeight: 700, color: "#111827" }}>
            {data.fullName || "Student Details"}
          </h2>
          <span style={{
            display: "inline-block", marginTop: 4, padding: "3px 10px",
            background: data.status === "ACTIVE" ? "#dcfce7" : "#fef9c3",
            color: data.status === "ACTIVE" ? "#15803d" : "#92400e",
            borderRadius: 20, fontSize: 11, fontWeight: 700,
          }}>
            {data.status || "ACTIVE"}
          </span>
        </div>
        <button
          onClick={() => navigate(-1)}
          style={{
            padding: "8px 18px", background: "#f3f4f6", border: "1px solid #d1d5db",
            borderRadius: 8, fontSize: 13, cursor: "pointer", fontWeight: 600, color: "#374151",
          }}
        >
          ← Back
        </button>
      </div>

      <Section title="Personal Details">
        <Field label="Registration ID"   value={data.id} />
        <Field label="Admission Date"    value={data.admissionDate} />
        <Field label="Full Name"         value={data.fullName} />
        <Field label="Date of Birth"     value={data.dateOfBirth} />
        <Field label="Gender"            value={data.gender} />
        <Field label="Blood Group"       value={data.bloodGroup} />
        <Field label="Religion"          value={data.religion} />
        <Field label="Marital Status"    value={data.maritalStatus} />
        <Field label="Email"             value={data.email} />
        <Field label="Parent Name"       value={data.parentsName} />
        <Field label="Parent Mobile"     value={data.parentsMobNo} />
      </Section>

      <Section title="Address">
        <Field label="Permanent Address" value={data.permanentAddress} />
        <Field label="City"              value={data.city} />
        <Field label="State"             value={data.state} />
        <Field label="Pincode"           value={data.pincode} />
      </Section>

      <Section title="Academic / Work">
        <Field label="Institution"       value={data.currentInstitution} />
        <Field label="Course"            value={data.courseEnrolled} />
        <Field label="Year of Admission" value={data.yearOfAdmission} />
        <Field label="Employer"          value={data.currentEmployer} />
        <Field label="Designation"       value={data.designation} />
        <Field label="Year of Joining"   value={data.yearOfJoining} />
      </Section>

      <Section title="Room / Bed">
        <Field label="Floor"             value={data.floorNumber} />
        <Field label="Room Type"         value={data.roomType} />
        <Field label="Room Number"       value={data.roomNumber} />
        <Field label="Bed Type"          value={data.bedType} />
        <Field label="Bed Number"        value={data.bedNumber} />
        <Field label="Stay From"         value={data.stayFrom} />
        <Field label="Stay To"           value={data.stayTo} />
      </Section>

      <Section title="Fees">
        <Field label="Total Fees"        value={data.totalFees ? `₹ ${Number(data.totalFees).toLocaleString("en-IN")}` : undefined} />
        <Field label="Deposit Collected" value={data.depositCollected ? `₹ ${Number(data.depositCollected).toLocaleString("en-IN")}` : undefined} />
        <Field label="Remaining Fees"    value={data.remainingFees ? `₹ ${Number(data.remainingFees).toLocaleString("en-IN")}` : undefined} />
        <Field label="Payment Mode"      value={data.paymentMode} />
        <Field label="Transaction No"    value={data.transactionNumber} />
        <Field label="Remark"            value={data.remark} />
      </Section>

      {(gm.guardianFullName || gm.mobileNo) && (
        <Section title="Guardian & Medical">
          <Field label="Guardian Name"   value={gm.guardianFullName} />
          <Field label="Guardian Mobile" value={gm.mobileNo} />
          <Field label="Guardian Address"value={gm.guardianPermanentAddress} />
          <Field label="Medical Condition" value={gm.medicalCondition} />
          <Field label="Allergies"       value={gm.allergies} />
          <Field label="Doctor Name"     value={gm.familyDoctorFullName} />
          <Field label="Doctor Mobile"   value={gm.doctormobileNo} />
          <Field label="Vehicle Type"    value={gm.vehicleType} />
          <Field label="Vehicle Reg No"  value={gm.registrationNo} />
        </Section>
      )}

      {(docs.personalPhoto || docs.addressProofFile || docs.educationProofFile) && (
        <Section title="Documents">
          {docs.personalPhoto && (
            <div style={{ gridColumn: "span 2" }}>
              <div style={{ fontSize: 10, color: "#6b7280", fontWeight: 600, marginBottom: 6, textTransform: "uppercase" }}>
                Photo
              </div>
              <img src={docs.personalPhoto} alt="Photo"
                style={{ height: 100, borderRadius: 8, border: "1px solid #e5e7eb", objectFit: "cover" }} />
            </div>
          )}
          {docs.addressProofFile && (
            <div>
              <div style={{ fontSize: 10, color: "#6b7280", fontWeight: 600, marginBottom: 4, textTransform: "uppercase" }}>
                Address Proof ({data.addressProofType})
              </div>
              <a href={docs.addressProofFile} target="_blank" rel="noreferrer"
                style={{ color: "#2563eb", fontSize: 12, fontWeight: 600 }}>
                View File ↗
              </a>
            </div>
          )}
          {docs.educationProofFile && (
            <div>
              <div style={{ fontSize: 10, color: "#6b7280", fontWeight: 600, marginBottom: 4, textTransform: "uppercase" }}>
                Education Proof ({data.educationProofType})
              </div>
              <a href={docs.educationProofFile} target="_blank" rel="noreferrer"
                style={{ color: "#2563eb", fontSize: 12, fontWeight: 600 }}>
                View File ↗
              </a>
            </div>
          )}
          {docs.signature && (
            <div>
              <div style={{ fontSize: 10, color: "#6b7280", fontWeight: 600, marginBottom: 4, textTransform: "uppercase" }}>
                Signature
              </div>
              <img src={docs.signature} alt="Signature"
                style={{ height: 50, border: "1px solid #e5e7eb", borderRadius: 4 }} />
            </div>
          )}
        </Section>
      )}
    </div>
  );
};

export default DisplayAdmissionFormDetails;
