import React, { useEffect, useMemo, useState } from "react";
import {
  FaHome,
  FaUserCircle,
  FaUserGraduate,
  FaCreditCard,
  FaReceipt,
} from "react-icons/fa";
import Receipt from "../Admission/Receipt";
import "./UserSite.css";

const REG_KEY = "hostel-registrations";

const ADM_KEY = "hostel-admissions";

const SESSION_KEY = "hostel-user-session";

/* ================= LOAD JSON ================= */

const loadJson = (key) => {
  try {
    const data = JSON.parse(localStorage.getItem(key) || "[]");
    return Array.isArray(data) ? data : [];
  } catch {
    return [];
  }
};

/* ================= MONEY ================= */

const money = (v) => {
  const n = Number(v) || 0;
  return `₹ ${n.toLocaleString("en-IN")}`;
};

/* ================= DEPOSIT STATUS ================= */

const depStatus = (r) =>
  ["Paid", "Partial", "Pending"].includes(r.pStatus) ? r.pStatus : "Pending";

/* ================= PAYMENT LIST ================= */

const payListFor = (adm) => {
  const list = [...(adm.payments || [])];

  const sum = list.reduce((s, p) => s + (Number(p.amount) || 0), 0);

  const paid = Number(adm.amountPaid) || 0;

  if (paid - sum > 0) {
    list.unshift({
      date: adm.admissionDate,
      amount: paid - sum,
      mode: adm.paymentMode,
    });
  }

  return list;
};

/* ================= SECTIONS ================= */

const SECTIONS = [
  { label: "Dashboard", value: "dashboard", icon: <FaHome /> },
  { label: "My Profile", value: "profile", icon: <FaUserCircle /> },
  { label: "My Admission", value: "admission", icon: <FaUserGraduate /> },
  { label: "Payments", value: "payments", icon: <FaCreditCard /> },
  { label: "Receipt", value: "receipt", icon: <FaReceipt /> },
];

/* ================= USER SITE ================= */

const UserSite = () => {
  const [regs, setRegs] = useState(() => loadJson(REG_KEY));

  const [admissions, setAdmissions] = useState(() => loadJson(ADM_KEY));

  const [userNo, setUserNo] = useState(null);

  const [email, setEmail] = useState("");

  const [password, setPassword] = useState("");

  const [section, setSection] = useState("dashboard");

  const [showReceipt, setShowReceipt] = useState(false);

  /* ================= SESSION RESTORE ================= */

  useEffect(() => {
    const saved = localStorage.getItem(SESSION_KEY);

    if (saved !== null && saved !== "") {
      setUserNo(saved);
    }
  }, []);

  /* ================= REFRESH ================= */

  useEffect(() => {
    const refresh = () => {
      setRegs(loadJson(REG_KEY));
      setAdmissions(loadJson(ADM_KEY));
    };

    window.addEventListener("hostel-reg-updated", refresh);
    window.addEventListener("hostel-admission-updated", refresh);
    window.addEventListener("storage", refresh);

    return () => {
      window.removeEventListener("hostel-reg-updated", refresh);
      window.removeEventListener("hostel-admission-updated", refresh);
      window.removeEventListener("storage", refresh);
    };
  }, []);

  /* ================= STALE SESSION CLEAR ================= */

  useEffect(() => {
    if (
      userNo !== null &&
      !regs.some((r) => String(r.userNo) === String(userNo))
    ) {
      localStorage.removeItem(SESSION_KEY);

      setUserNo(null);
    }
  }, [userNo, regs]);

  /* ================= MY ROWS ================= */

  const user = useMemo(
    () => regs.find((r) => String(r.userNo) === String(userNo)) || null,
    [regs, userNo],
  );

  const myAdm = useMemo(
    () => admissions.find((a) => String(a.userNo) === String(userNo)) || null,
    [admissions, userNo],
  );

  /* ================= LOGIN ================= */

  const tryLogin = (e) => {
    e.preventDefault();

    if (!email.trim() || !password) {
      alert("Please enter email and password.");
      return;
    }

    const list = loadJson(REG_KEY);

    const text = email.trim().toLowerCase();

    const found = list.find(
      (r) =>
        String((r.form && r.form.email) || "")
          .trim()
          .toLowerCase() === text &&
        String((r.form && r.form.password) || "") === password,
    );

    if (!found) {
      alert("Invalid email or password.");
      return;
    }

    localStorage.setItem(SESSION_KEY, String(found.userNo));

    setUserNo(found.userNo);

    setEmail("");

    setPassword("");

    setSection("dashboard");
  };

  /* ================= LOGOUT ================= */

  const logout = () => {
    localStorage.removeItem(SESSION_KEY);

    setUserNo(null);

    setSection("dashboard");

    setShowReceipt(false);
  };

  /* ================= LOGIN SCREEN ================= */

  if (!user) {
    return (
      <div className="us-login">
        <form className="us-login-card" onSubmit={tryLogin}>
          <div className="us-logo">
            <FaHome />
          </div>

          <div className="us-school">Sant Gadagebaba Progressive School</div>

          <div className="us-portal-tag">User Portal — Pune Branch</div>

          <div className="us-login-field">
            <label>Email</label>

            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Email"
            />
          </div>

          <div className="us-login-field">
            <label>Password</label>

            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Password"
            />
          </div>

          <button type="submit" className="us-login-btn">
            Login
          </button>
        </form>
      </div>
    );
  }

  /* ================= STAY ROWS ================= */

  const stay = myAdm
    ? {
        building: myAdm.building,
        floor: myAdm.floor,
        roomType: myAdm.roomType,
        roomNumber: myAdm.roomNumber,
        bedType: myAdm.bedType,
        bedNumber: myAdm.bedNumber,
        stayFrom: myAdm.stayFrom,
        stayTo: myAdm.stayTo,
      }
    : {
        building: user.form?.buildingName,
        floor: user.form?.depFloor,
        roomType: user.roomType,
        roomNumber: user.form?.roomNumber,
        bedType: user.bedType,
        bedNumber: user.form?.bedNumber,
        stayFrom: user.form?.stayFrom,
        stayTo: user.form?.stayTo,
      };

  /* ================= BALANCE ================= */

  const grand = Number(myAdm?.grandTotal) || 0;

  const paid = Number(myAdm?.amountPaid) || 0;

  const balance = grand - paid;

  const pays = myAdm ? payListFor(myAdm) : [];

  /* ================= RENDER ================= */

  return (
    <div className="us-app">
      <header className="us-header">
        <div className="us-head-left">
          <div className="us-logo-sm">
            <FaHome />
          </div>

          <div className="us-school-sm">Sant Gadagebaba Progressive School</div>
        </div>

        <div className="us-portal-tag">User Portal</div>

        <div className="us-head-right">
          <div className="us-user-chip">
            <FaUserCircle />

            <span>{user.name || "-"}</span>
          </div>

          <button type="button" className="us-logout" onClick={logout}>
            Logout
          </button>
        </div>
      </header>

      <div className="us-body">
        <aside className="us-sidebar">
          {SECTIONS.map((s) => (
            <button
              type="button"
              key={s.value}
              className={
                section === s.value ? "us-side-btn active" : "us-side-btn"
              }
              onClick={() => {
                setSection(s.value);
                setShowReceipt(false);
              }}
            >
              {s.icon}

              <span>{s.label}</span>
            </button>
          ))}
        </aside>

        <main className="us-main">
          {/* ================= DASHBOARD ================= */}

          {section === "dashboard" && (
            <>
              <div className="us-cards">
                <div className="us-card">
                  <span>Monthly Rent</span>

                  <strong>{myAdm ? money(myAdm.monthlyRent) : "-"}</strong>
                </div>

                <div className="us-card">
                  <span>Grand Total</span>

                  <strong>{myAdm ? money(grand) : "-"}</strong>
                </div>

                <div className="us-card">
                  <span>Paid</span>

                  <strong>{myAdm ? money(paid) : "-"}</strong>
                </div>

                <div className="us-card">
                  <span>Balance</span>

                  <strong>{myAdm ? money(balance) : "-"}</strong>
                </div>

                <div
                  className={
                    depStatus(user) === "Paid" ? "us-card ok" : "us-card warn"
                  }
                >
                  <span>Deposit ({depStatus(user)})</span>

                  <strong>{money(user.deposite)}</strong>
                </div>
              </div>

              <div className="us-card-box">
                <div className="us-box-title">Stay Details</div>

                <div className="us-grid">
                  <p>
                    <span>Building</span>
                    <b>{stay.building || "-"}</b>
                  </p>

                  <p>
                    <span>Floor</span>
                    <b>{stay.floor || "-"}</b>
                  </p>

                  <p>
                    <span>Room Type</span>
                    <b>{stay.roomType || "-"}</b>
                  </p>

                  <p>
                    <span>Room No</span>
                    <b>{stay.roomNumber || "-"}</b>
                  </p>

                  <p>
                    <span>Bed Type</span>
                    <b>{stay.bedType || "-"}</b>
                  </p>

                  <p>
                    <span>Bed No</span>
                    <b>{stay.bedNumber || "-"}</b>
                  </p>

                  <p>
                    <span>Stay From</span>
                    <b>{stay.stayFrom || "-"}</b>
                  </p>

                  <p>
                    <span>Stay To</span>
                    <b>{stay.stayTo || "-"}</b>
                  </p>
                </div>
              </div>
            </>
          )}

          {/* ================= MY PROFILE ================= */}

          {section === "profile" && (
            <>
              <div className="us-card-box">
                <div className="us-box-title">Personal Details</div>

                <div className="us-grid">
                  <p>
                    <span>Full Name</span>
                    <b>{user.form?.fullName || user.name || "-"}</b>
                  </p>

                  <p>
                    <span>Date of Birth</span>
                    <b>{user.form?.birthDate || "-"}</b>
                  </p>

                  <p>
                    <span>Age</span>
                    <b>{user.form?.age || "-"}</b>
                  </p>

                  <p>
                    <span>Gender</span>
                    <b>{user.form?.gender || "-"}</b>
                  </p>

                  <p>
                    <span>Blood Group</span>
                    <b>{user.form?.bloodGroup || "-"}</b>
                  </p>

                  <p>
                    <span>Religion</span>
                    <b>{user.form?.religion || "-"}</b>
                  </p>

                  <p>
                    <span>Marital Status</span>
                    <b>{user.form?.maritalStatus || "-"}</b>
                  </p>

                  <p>
                    <span>Email</span>
                    <b>{user.form?.email || "-"}</b>
                  </p>

                  <p>
                    <span>Mobile</span>
                    <b>{user.form?.mobile || user.phone || "-"}</b>
                  </p>

                  <p>
                    <span>City</span>
                    <b>{user.city || "-"}</b>
                  </p>

                  <p>
                    <span>State</span>
                    <b>{user.form?.state || "-"}</b>
                  </p>

                  <p>
                    <span>Pincode</span>
                    <b>{user.form?.pincode || "-"}</b>
                  </p>

                  <p>
                    <span>Permanent Address</span>
                    <b>{user.form?.permanentAddress || "-"}</b>
                  </p>
                </div>
              </div>

              <div className="us-card-box">
                <div className="us-box-title">Parents Details</div>

                <div className="us-grid">
                  <p>
                    <span>Father Name</span>
                    <b>{user.form?.fatherName || "-"}</b>
                  </p>

                  <p>
                    <span>Father Mobile</span>
                    <b>{user.form?.fatherMobile || "-"}</b>
                  </p>

                  <p>
                    <span>Mother Name</span>
                    <b>{user.form?.motherName || "-"}</b>
                  </p>

                  <p>
                    <span>Mother Mobile</span>
                    <b>{user.form?.motherMobile || "-"}</b>
                  </p>

                  <p>
                    <span>Parent Address</span>
                    <b>{user.form?.parentAddress || "-"}</b>
                  </p>

                  <p>
                    <span>Parent City</span>
                    <b>{user.form?.parentCity || "-"}</b>
                  </p>
                </div>
              </div>

              <div className="us-card-box">
                <div className="us-box-title">Education / Work</div>

                <div className="us-grid">
                  <p>
                    <span>Type</span>
                    <b>{user.form?.workType || "-"}</b>
                  </p>

                  <p>
                    <span>College Name</span>
                    <b>{user.form?.collegeName || "-"}</b>
                  </p>

                  <p>
                    <span>Course</span>
                    <b>{user.form?.course || "-"}</b>
                  </p>

                  <p>
                    <span>Year</span>
                    <b>{user.form?.year || "-"}</b>
                  </p>

                  <p>
                    <span>Student ID</span>
                    <b>{user.form?.studentId || "-"}</b>
                  </p>
                </div>
              </div>

              <div className="us-card-box">
                <div className="us-box-title">Guardian & Occupation</div>

                <div className="us-grid">
                  <p>
                    <span>Guardian Name</span>
                    <b>{user.form?.parentGuardName || "-"}</b>
                  </p>

                  <p>
                    <span>Occupation</span>
                    <b>{user.form?.occupation || "-"}</b>
                  </p>

                  <p>
                    <span>Organization</span>
                    <b>{user.form?.organization || "-"}</b>
                  </p>

                  <p>
                    <span>Designation</span>
                    <b>{user.form?.designation || "-"}</b>
                  </p>

                  <p>
                    <span>Monthly Income</span>
                    <b>{user.form?.monthlyIncome || "-"}</b>
                  </p>

                  <p>
                    <span>Work Phone</span>
                    <b>{user.form?.workPhone || "-"}</b>
                  </p>

                  <p>
                    <span>Work Address</span>
                    <b>{user.form?.workAddress || "-"}</b>
                  </p>

                  <p>
                    <span>Work City</span>
                    <b>{user.form?.workCity || "-"}</b>
                  </p>
                </div>
              </div>

              <div className="us-card-box">
                <div className="us-box-title">Emergency Details</div>

                <div className="us-grid">
                  <p>
                    <span>Contact Name</span>
                    <b>{user.form?.emergencyName || "-"}</b>
                  </p>

                  <p>
                    <span>Contact Number</span>
                    <b>{user.form?.emergencyNumber || "-"}</b>
                  </p>

                  <p>
                    <span>Relation</span>
                    <b>{user.form?.relation || "-"}</b>
                  </p>

                  <p>
                    <span>City</span>
                    <b>{user.form?.emergencyCity || "-"}</b>
                  </p>
                </div>
              </div>

              <div className="us-card-box">
                <div className="us-box-title">Vehicle & Medical</div>

                <div className="us-grid">
                  <p>
                    <span>Parking</span>
                    <b>{user.form?.parkVehicle || "-"}</b>
                  </p>

                  <p>
                    <span>Vehicle Type</span>
                    <b>{user.form?.vehicleType || "-"}</b>
                  </p>

                  <p>
                    <span>Vehicle Reg No</span>
                    <b>{user.form?.vehicleReg || "-"}</b>
                  </p>

                  <p>
                    <span>Medical Conditions</span>
                    <b>{user.form?.medicalConditions || "-"}</b>
                  </p>

                  <p>
                    <span>Allergies</span>
                    <b>{user.form?.allergies || "-"}</b>
                  </p>

                  <p>
                    <span>Medications</span>
                    <b>{user.form?.medications || "-"}</b>
                  </p>

                  <p>
                    <span>Doctor Name</span>
                    <b>{user.form?.doctorName || "-"}</b>
                  </p>

                  <p>
                    <span>Doctor Phone</span>
                    <b>{user.form?.doctorPhone || "-"}</b>
                  </p>
                </div>
              </div>
            </>
          )}

          {/* ================= MY ADMISSION ================= */}

          {section === "admission" &&
            (myAdm ? (
              <>
                <div className="us-card-box">
                  <div className="us-box-title">Admission Details</div>

                  <div className="us-grid">
                    <p>
                      <span>User No</span>
                      <b>{myAdm.userNo || "-"}</b>
                    </p>

                    <p>
                      <span>Admission Date</span>
                      <b>{myAdm.admissionDate || "-"}</b>
                    </p>

                    <p>
                      <span>Building</span>
                      <b>{myAdm.building || "-"}</b>
                    </p>

                    <p>
                      <span>Floor</span>
                      <b>{myAdm.floor || "-"}</b>
                    </p>

                    <p>
                      <span>Room Type</span>
                      <b>{myAdm.roomType || "-"}</b>
                    </p>

                    <p>
                      <span>Room No</span>
                      <b>{myAdm.roomNumber || "-"}</b>
                    </p>

                    <p>
                      <span>Bed Type</span>
                      <b>{myAdm.bedType || "-"}</b>
                    </p>

                    <p>
                      <span>Bed No</span>
                      <b>{myAdm.bedNumber || "-"}</b>
                    </p>

                    <p>
                      <span>Stay From</span>
                      <b>{myAdm.stayFrom || "-"}</b>
                    </p>

                    <p>
                      <span>Stay To</span>
                      <b>{myAdm.stayTo || "-"}</b>
                    </p>
                  </div>
                </div>

                <div className="us-card-box">
                  <div className="us-box-title">Rent & Payment</div>

                  <div className="us-grid">
                    <p>
                      <span>Monthly Rent</span>
                      <b>{money(myAdm.monthlyRent)}</b>
                    </p>

                    <p>
                      <span>Total Months</span>
                      <b>{myAdm.totalMonths || "-"}</b>
                    </p>

                    <p>
                      <span>Grand Total</span>
                      <b>{money(grand)}</b>
                    </p>

                    <p>
                      <span>Paid</span>
                      <b>{money(paid)}</b>
                    </p>

                    <p>
                      <span>Balance</span>
                      <b>{money(balance)}</b>
                    </p>

                    <p>
                      <span>Payment Mode</span>
                      <b>{myAdm.paymentMode || "-"}</b>
                    </p>

                    <p>
                      <span>Payment Status</span>
                      <b>
                        <span
                          className={`us-pill ${String(
                            myAdm.paymentStatus || "pending",
                          ).toLowerCase()}`}
                        >
                          {myAdm.paymentStatus || "Pending"}
                        </span>
                      </b>
                    </p>

                    <p>
                      <span>Status</span>
                      <b>{myAdm.status || "-"}</b>
                    </p>
                  </div>
                </div>
              </>
            ) : (
              <div className="us-card-box">
                <div className="us-box-title">Admission Details</div>

                <div className="us-empty">No admission yet.</div>
              </div>
            ))}

          {/* ================= PAYMENTS ================= */}

          {section === "payments" && (
            <>
              <div className="us-card-box">
                <div className="us-box-title">Deposit</div>

                <div className="us-grid">
                  <p>
                    <span>Deposit Amount</span>
                    <b>{money(user.deposite)}</b>
                  </p>

                  <p>
                    <span>Deposit Status</span>
                    <b>
                      <span
                        className={`us-pill ${depStatus(user).toLowerCase()}`}
                      >
                        {depStatus(user)}
                      </span>
                    </b>
                  </p>

                  <p>
                    <span>Payment Mode</span>
                    <b>{user.pMode || "-"}</b>
                  </p>
                </div>
              </div>

              <div className="us-card-box">
                <div className="us-box-title">Rent Payments</div>

                {pays.length === 0 ? (
                  <div className="us-empty">No payments yet.</div>
                ) : (
                  <table className="us-table">
                    <thead>
                      <tr>
                        <th>No</th>
                        <th>Date</th>
                        <th>Amount</th>
                        <th>Mode</th>
                      </tr>
                    </thead>

                    <tbody>
                      {pays.map((p, i) => (
                        <tr key={`${p.date}-${i}`}>
                          <td>{i + 1}</td>

                          <td>{p.date || "-"}</td>

                          <td className="us-amt">{money(p.amount)}</td>

                          <td>{p.mode || "-"}</td>
                        </tr>
                      ))}
                    </tbody>

                    <tfoot>
                      <tr>
                        <td colSpan="2">Total Paid</td>

                        <td className="us-amt">{money(paid)}</td>

                        <td></td>
                      </tr>
                    </tfoot>
                  </table>
                )}
              </div>
            </>
          )}

          {/* ================= RECEIPT ================= */}

          {section === "receipt" && (
            <div className="us-card-box">
              <div className="us-box-title">Receipt</div>

              {myAdm ? (
                <button
                  type="button"
                  className="us-view-btn"
                  onClick={() => setShowReceipt(true)}
                >
                  View Receipt
                </button>
              ) : (
                <div className="us-empty">No admission yet.</div>
              )}
            </div>
          )}
        </main>
      </div>

      {/* ================= RECEIPT POPUP ================= */}

      {showReceipt && myAdm && (
        <Receipt row={myAdm} onClose={() => setShowReceipt(false)} />
      )}
    </div>
  );
};

export default UserSite;
