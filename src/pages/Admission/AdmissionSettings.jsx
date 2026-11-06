import React, { useCallback, useEffect, useState } from "react";
import { FaBed, FaCalendarAlt, FaGavel, FaPen, FaTrashAlt, FaUniversity } from "react-icons/fa";
import { MdKingBed } from "react-icons/md";
import "./AdmissionSettings.css";
import {
  getAllFloors, createFloor, updateFloor, deleteFloor as apiDeleteFloor,
  getAllSources, createSource, updateSource, deleteSource as apiDeleteSource,
  getRoomsByFloor, createRoom, updateRoom, deleteRoom as apiDeleteRoom,
  getAllBeds, createBed, updateBed, deleteBed as apiDeleteBed, getBedsByRoom,
} from "../../services/hostelService.js";

const LEAVE_KEY = "hostel-admission-leaves";
const BANKS_KEY = "hostel-banks";
const RULES_KEY = "hostel-rules";

const emptyLeave = { userId: "", name: "", from: "", to: "", reason: "", remark: "" };
const emptyBank = { bankName: "", accountHolder: "", accountNumber: "", confirmAccount: "", ifsc: "", branch: "", upiId: "", remark: "" };

const BedIcon = ({ double }) => double ? <MdKingBed className="as-bed-dbl" /> : <FaBed className="as-bed-sgl" />;

const readLocal = (key, fb) => {
  try { return JSON.parse(localStorage.getItem(key) || "null") ?? fb; }
  catch { return fb; }
};

const AdmissionSettings = () => {
  const [section, setSection] = useState("rooms");

  // Floors from API
  const [floors, setFloors] = useState([]);
  const [selectedFloor, setSelectedFloor] = useState(null);
  const [rooms, setRooms] = useState([]);
  const [beds, setBeds] = useState([]); // all beds (for display)

  // Modals
  const [openFloor, setOpenFloor] = useState(false);
  const [editFloor, setEditFloor] = useState(null);
  const [floorForm, setFloorForm] = useState({ floorNumber: "", hostelBuildingName: "" });

  const [openRoom, setOpenRoom] = useState(false);
  const [editRoom, setEditRoom] = useState(null);
  const [roomForm, setRoomForm] = useState({ roomNumber: "", roomType: "AC", totalBeds: "" });

  const [openBed, setOpenBed] = useState(false);
  const [editBed, setEditBed] = useState(null);
  const [bedRoomId, setBedRoomId] = useState(null);
  const [bedForm, setBedForm] = useState({ bedNumber: "", bedType: "Single", status: "AVAILABLE" });

  // Sources from API
  const [sources, setSources] = useState([]);
  const [openSource, setOpenSource] = useState(false);
  const [editSource, setEditSource] = useState(null);
  const [sourceForm, setSourceForm] = useState({ source: "" });

  // Local data
  const [leaves, setLeaves] = useState(() => readLocal(LEAVE_KEY, []));
  const [openLeave, setOpenLeave] = useState(false);
  const [leaveForm, setLeaveForm] = useState(emptyLeave);
  const [leaveFilter, setLeaveFilter] = useState({ status: "All", start: "", end: "" });

  const [banks, setBanks] = useState(() => readLocal(BANKS_KEY, []));
  const [openBank, setOpenBank] = useState(false);
  const [editBank, setEditBank] = useState(null);
  const [bankForm, setBankForm] = useState(emptyBank);
  const [bankError, setBankError] = useState("");

  const [rules, setRules] = useState(() => readLocal(RULES_KEY, []));
  const [ruleText, setRuleText] = useState("");

  // ---- Load floors ----
  const loadFloors = useCallback(async () => {
    try { setFloors(await getAllFloors()); }
    catch (err) { console.error(err); }
  }, []);

  // ---- Load rooms for selected floor ----
  const loadRooms = useCallback(async (floorId) => {
    try { setRooms(await getRoomsByFloor(floorId)); setBeds([]); }
    catch (err) { console.error(err); }
  }, []);

  // ---- Load beds for a room ----
  const loadBedsForRoom = useCallback(async (roomId) => {
    try { return await getBedsByRoom(roomId); }
    catch { return []; }
  }, []);

  // ---- Load sources ----
  const loadSources = useCallback(async () => {
    try { setSources(await getAllSources()); }
    catch { setSources([]); }
  }, []);

  useEffect(() => { loadFloors(); loadSources(); }, [loadFloors, loadSources]);

  useEffect(() => {
    if (selectedFloor) loadRooms(selectedFloor.id);
  }, [selectedFloor, loadRooms]);

  // Save leaves / banks / rules to localStorage
  useEffect(() => { localStorage.setItem(LEAVE_KEY, JSON.stringify(leaves)); }, [leaves]);
  useEffect(() => { localStorage.setItem(BANKS_KEY, JSON.stringify(banks)); }, [banks]);
  useEffect(() => { localStorage.setItem(RULES_KEY, JSON.stringify(rules)); }, [rules]);

  /* ========== FLOOR CRUD ========== */
  const saveFloor = async (e) => {
    e.preventDefault();
    try {
      if (editFloor) {
        await updateFloor(editFloor.id, floorForm);
      } else {
        await createFloor(floorForm);
      }
      await loadFloors();
      setOpenFloor(false); setEditFloor(null);
      setFloorForm({ floorNumber: "", hostelBuildingName: "" });
    } catch (err) { alert("Failed: " + err.message); }
  };

  const handleDeleteFloor = async (f) => {
    if (!window.confirm(`Delete floor "${f.floorNumber}"?`)) return;
    try { await apiDeleteFloor(f.id); await loadFloors(); setSelectedFloor(null); }
    catch (err) { alert("Failed: " + err.message); }
  };

  /* ========== ROOM CRUD ========== */
  const saveRoom = async (e) => {
    e.preventDefault();
    if (!selectedFloor) return;
    try {
      if (editRoom) {
        await updateRoom(editRoom.id, roomForm);
      } else {
        await createRoom(selectedFloor.id, roomForm);
      }
      await loadRooms(selectedFloor.id);
      setOpenRoom(false); setEditRoom(null);
      setRoomForm({ roomNumber: "", roomType: "AC", totalBeds: "" });
    } catch (err) { alert("Failed: " + err.message); }
  };

  const handleDeleteRoom = async (room) => {
    if (!window.confirm(`Delete room "${room.roomNumber}"?`)) return;
    try { await apiDeleteRoom(room.id); await loadRooms(selectedFloor.id); }
    catch (err) { alert("Failed: " + err.message); }
  };

  /* ========== BED CRUD ========== */
  const openAddBed = (roomId) => {
    setBedRoomId(roomId);
    setBedForm({ bedNumber: "", bedType: "Single", status: "AVAILABLE" });
    setEditBed(null);
    setOpenBed(true);
  };

  const saveBed = async (e) => {
    e.preventDefault();
    try {
      const payload = { ...bedForm, room: { id: bedRoomId } };
      if (editBed) {
        await updateBed(editBed.id, payload);
      } else {
        await createBed(payload);
      }
      await loadRooms(selectedFloor.id);
      setOpenBed(false); setEditBed(null); setBedRoomId(null);
    } catch (err) { alert("Failed: " + err.message); }
  };

  const handleDeleteBed = async (bed) => {
    if (!window.confirm(`Delete bed "${bed.bedNumber}"?`)) return;
    try { await apiDeleteBed(bed.id); await loadRooms(selectedFloor.id); }
    catch (err) { alert("Failed: " + err.message); }
  };

  /* ========== SOURCE CRUD ========== */
  const saveSource = async (e) => {
    e.preventDefault();
    try {
      if (editSource) {
        await updateSource(editSource.id, sourceForm);
      } else {
        await createSource(sourceForm);
      }
      await loadSources();
      setOpenSource(false); setEditSource(null); setSourceForm({ source: "" });
    } catch (err) { alert("Failed: " + err.message); }
  };

  const handleDeleteSource = async (s) => {
    if (!window.confirm(`Delete source "${s.source}"?`)) return;
    try { await apiDeleteSource(s.id); await loadSources(); }
    catch (err) { alert("Failed: " + err.message); }
  };

  /* ========== LEAVE CRUD (local) ========== */
  const saveLeave = (e) => {
    e.preventDefault();
    if (!leaveForm.userId || !leaveForm.name || !leaveForm.from || !leaveForm.to) {
      alert("User ID, name and dates are required."); return;
    }
    setLeaves((prev) => [...prev, { id: Date.now(), ...leaveForm, status: "Pending" }]);
    setOpenLeave(false); setLeaveForm(emptyLeave);
  };

  /* ========== BANK CRUD (local) ========== */
  const saveBank = (e) => {
    e.preventDefault();
    if (!bankForm.bankName || !bankForm.accountHolder || !bankForm.accountNumber || !bankForm.ifsc) {
      setBankError("Bank Name, Account Holder, Account Number and IFSC are required."); return;
    }
    if (bankForm.accountNumber !== bankForm.confirmAccount) {
      setBankError("Account numbers do not match."); return;
    }
    const data = { id: editBank ? editBank.id : Date.now(), ...bankForm };
    setBanks((prev) => editBank ? prev.map((b) => b.id === editBank.id ? data : b) : [...prev, data]);
    localStorage.setItem(BANKS_KEY, JSON.stringify(banks));
    window.dispatchEvent(new Event("hostel-data-updated"));
    setOpenBank(false); setBankError(""); setEditBank(null); setBankForm(emptyBank);
  };

  /* ========== RULES (local) ========== */
  const addRule = () => {
    if (!ruleText.trim()) { alert("Please type a rule first."); return; }
    const next = [...rules, { id: Date.now(), text: ruleText.trim() }];
    setRules(next); localStorage.setItem(RULES_KEY, JSON.stringify(next)); setRuleText("");
  };
  const deleteRule = (id) => {
    const next = rules.filter((r) => r.id !== id);
    setRules(next); localStorage.setItem(RULES_KEY, JSON.stringify(next));
  };

  const shownLeaves = leaves.filter((l) => {
    if (leaveFilter.status !== "All" && l.status !== leaveFilter.status) return false;
    if (leaveFilter.start && l.to < leaveFilter.start) return false;
    if (leaveFilter.end && l.from > leaveFilter.end) return false;
    return true;
  });

  return (
    <div className="as-page">
      <aside className="as-rail">
        {[
          { id: "rooms", icon: <FaBed />, label: "Rooms" },
          { id: "sources", icon: <FaGavel />, label: "Sources" },
          { id: "leave", icon: <FaCalendarAlt />, label: "Leave" },
          { id: "bank", icon: <FaUniversity />, label: "Bank" },
          { id: "rules", icon: <FaGavel />, label: "Rules" },
        ].map(({ id, icon, label }) => (
          <button key={id} type="button" className={section === id ? "as-rail-btn on" : "as-rail-btn"} onClick={() => setSection(id)}>
            <span className="as-ico">{icon}</span>
            <span className="as-rail-text">{label}</span>
          </button>
        ))}
      </aside>

      <section className="as-main">

        {/* ========== ROOMS ========== */}
        {section === "rooms" && !selectedFloor && (
          <>
            <div className="as-top">
              <button type="button" className="as-add-btn" onClick={() => { setOpenFloor(true); setEditFloor(null); setFloorForm({ floorNumber: "", hostelBuildingName: "" }); }}>
                Add Floor
              </button>
            </div>
            <div className="as-board">
              <div className="as-grid">
                {floors.map((f) => (
                  <div key={f.id} className="as-card as-card-btn" onClick={() => setSelectedFloor(f)}>
                    <div className="as-card-actions">
                      <button type="button" className="as-ico-btn edit" onClick={(e) => { e.stopPropagation(); setEditFloor(f); setFloorForm({ floorNumber: f.floorNumber, hostelBuildingName: f.hostelBuildingName || "" }); setOpenFloor(true); }}><FaPen /></button>
                      <button type="button" className="as-ico-btn del" onClick={(e) => { e.stopPropagation(); handleDeleteFloor(f); }}><FaTrashAlt /></button>
                    </div>
                    <div className="as-card-name">{f.hostelBuildingName || "Floor"}</div>
                    <div className="as-card-floor">{f.floorNumber}</div>
                    <div className="as-card-meta"><FaBed /> Click to view rooms</div>
                  </div>
                ))}
              </div>
            </div>
          </>
        )}

        {section === "rooms" && selectedFloor && (
          <>
            <div className="as-top">
              <button type="button" className="as-add-btn" onClick={() => { setOpenRoom(true); setEditRoom(null); setRoomForm({ roomNumber: "", roomType: "AC", totalBeds: "" }); }}>
                Add Room
              </button>
            </div>
            <div className="as-board">
              <div className="as-floor-no">{selectedFloor.hostelBuildingName} — {selectedFloor.floorNumber}</div>
              <div className="as-grid">
                {rooms.map((r) => (
                  <div key={r.id} className={r.roomType === "AC" ? "as-room ac" : "as-room nonac"}>
                    <div className="as-room-actions">
                      <button type="button" className="as-ico-btn edit" onClick={() => { setEditRoom(r); setRoomForm({ roomNumber: r.roomNumber, roomType: r.roomType, totalBeds: r.totalBeds }); setOpenRoom(true); }}><FaPen /></button>
                      <button type="button" className="as-ico-btn del" onClick={() => handleDeleteRoom(r)}><FaTrashAlt /></button>
                    </div>
                    <div className="as-room-name">{r.roomNumber}</div>
                    <div className="as-room-cap">Capacity: {r.totalBeds} beds — {r.roomType}</div>
                    <button type="button" className="as-plus" onClick={() => openAddBed(r.id)}>+ Add Bed</button>
                  </div>
                ))}
              </div>
              <div className="as-back-wrap">
                <button type="button" className="as-add-btn" onClick={() => { setSelectedFloor(null); setRooms([]); }}>
                  Back to Floors
                </button>
              </div>
            </div>
          </>
        )}

        {/* ========== SOURCES ========== */}
        {/* {section === "sources" && (
          <div className="as-leave">
            <div className="as-top">
              <button type="button" className="as-add-btn" onClick={() => { setOpenSource(true); setEditSource(null); setSourceForm({ source: "" }); }}>
                Add Source
              </button>
            </div>
            <div className="as-bank-grid">
              {sources.length === 0 ? (
                <div className="as-bank-empty">No sources added yet.</div>
              ) : sources.map((s) => (
                <div key={s.id} className="as-bank-card">
                  <div className="as-bank-actions">
                    <button type="button" className="as-ico-btn edit" onClick={() => { setEditSource(s); setSourceForm({ source: s.source }); setOpenSource(true); }}><FaPen /></button>
                    <button type="button" className="as-ico-btn del" onClick={() => handleDeleteSource(s)}><FaTrashAlt /></button>
                  </div>
                  <div className="as-bank-name">{s.source}</div>
                </div>
              ))}
            </div>
          </div>
        )} */}

        {/* ========== LEAVE (local) ========== */}
        {/* ========== SOURCES ========== */}
        {section === "sources" && (
          <div className="as-leave">
            <div className="as-top">
              <button
                type="button"
                className="as-add-btn"
                onClick={() => {
                  setOpenSource(true);
                  setEditSource(null);
                  setSourceForm({ source: "" });
                }}
              >
                Add Source
              </button>
            </div>

            <div className="as-source-table-wrap">
              <table className="as-source-table">
                <thead>
                  <tr>
                    <th>Id</th>
                    <th>Source Name</th>
                    <th style={{ width: "120px" }}>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {sources.length === 0 ? (
                    <tr >
                      <td colSpan={2} className="as-leave-empty">
                        No sources added yet.
                      </td>
                    </tr>
                  ) : (
                    sources.map((s) => (
                      <tr key={s.id} onClick={() => {
                                setEditSource(s);
                                setSourceForm({ source: s.source });
                                setOpenSource(true);
                              }}>
                        <td>
                          <span>
                            {s.id}
                          </span>
                        </td>
                        <td>
                          <span className="as-source-name">{s.source}</span>
                        </td>
                        <td>
                          <div className="as-source-actions">
                            {/* <button
                              type="button"
                              className="as-ico-btn edit"
                              onClick={() => {
                                setEditSource(s);
                                setSourceForm({ source: s.source });
                                setOpenSource(true);
                              }}
                            >
                              <FaPen />
                            </button> */}
                            <button
                              type="button"
                              className="as-ico-btn del"
                              onClick={() => handleDeleteSource(s)}
                            >
                              <FaTrashAlt />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* ========== BANK (local) ========== */}
        {section === "bank" && (
          <div className="as-leave">
            <div className="as-top">
              <button type="button" className="as-add-btn" onClick={() => { setEditBank(null); setBankForm(emptyBank); setBankError(""); setOpenBank(true); }}>Add Bank</button>
            </div>
            <div className="as-bank-grid">
              {banks.length === 0 ? <div className="as-bank-empty">No banks added yet.</div>
                : banks.map((b) => (
                  <div key={b.id} className="as-bank-card">
                    <div className="as-bank-actions">
                      <button type="button" className="as-ico-btn edit" onClick={() => { setEditBank(b); setBankForm({ ...b, confirmAccount: b.accountNumber }); setOpenBank(true); }}><FaPen /></button>
                      <button type="button" className="as-ico-btn del" onClick={() => setBanks((prev) => prev.filter((x) => x.id !== b.id))}><FaTrashAlt /></button>
                    </div>
                    <div className="as-bank-name">{b.bankName}</div>
                    <div className="as-bank-row"><span>Account No</span><b>{b.accountNumber}</b></div>
                    <div className="as-bank-row"><span>IFSC</span><b>{b.ifsc}</b></div>
                  </div>
                ))}
            </div>
          </div>
        )}

        {/* ========== RULES (local) ========== */}
        {section === "rules" && (
          <div className="as-leave">
            <div className="as-top as-rule-top">
              <input className="as-input as-rule-input" type="text" placeholder="Type hostel rule here..." value={ruleText} onChange={(e) => setRuleText(e.target.value)} />
              <button type="button" className="as-add-btn" onClick={addRule}>Add Rule</button>
            </div>
            <div className="as-rule-list">
              {rules.length === 0 ? <div className="as-bank-empty">No rules added yet.</div>
                : rules.map((r, i) => (
                  <div key={r.id} className="as-rule-item">
                    <span className="as-rule-no">{i + 1}.</span>
                    <span className="as-rule-text">{r.text}</span>
                    <button type="button" className="as-ico-btn del" onClick={() => deleteRule(r.id)}><FaTrashAlt /></button>
                  </div>
                ))}
            </div>
          </div>
        )}
      </section>

      {/* ====== FLOOR MODAL ====== */}
      {openFloor && (
        <div className="as-overlay" onClick={() => setOpenFloor(false)}>
          <form className="as-modal as-modal-sm" onClick={(e) => e.stopPropagation()} onSubmit={saveFloor}>
            <div className="as-modal-title">{editFloor ? "Edit Floor" : "Add Floor"}</div>
            <div className="as-modal-grid">
              <input className="as-input" placeholder="Building Name" value={floorForm.hostelBuildingName} onChange={(e) => setFloorForm({ ...floorForm, hostelBuildingName: e.target.value })} />
              <input className="as-input" placeholder="Floor Number / Name" value={floorForm.floorNumber} onChange={(e) => setFloorForm({ ...floorForm, floorNumber: e.target.value })} />
              <div className="as-modal-actions">
                <button type="submit" className="as-save">Save</button>
                <button type="button" className="as-cancel" onClick={() => setOpenFloor(false)}>Cancel</button>
              </div>
            </div>
          </form>
        </div>
      )}

      {/* ====== ROOM MODAL ====== */}
      {openRoom && (
        <div className="as-overlay" onClick={() => setOpenRoom(false)}>
          <form className="as-modal as-modal-sm" onClick={(e) => e.stopPropagation()} onSubmit={saveRoom}>
            <div className="as-modal-title">{editRoom ? "Edit Room" : "Add Room"}</div>
            <div className="as-modal-grid">
              <input className="as-input" placeholder="Room Number" value={roomForm.roomNumber} onChange={(e) => setRoomForm({ ...roomForm, roomNumber: e.target.value })} />
              <input className="as-input" type="number" min="1" placeholder="Total Beds" value={roomForm.totalBeds} onChange={(e) => setRoomForm({ ...roomForm, totalBeds: e.target.value })} />
              <select className="as-input as-span2" value={roomForm.roomType} onChange={(e) => setRoomForm({ ...roomForm, roomType: e.target.value })}>
                <option value="AC">AC Room</option>
                <option value="NON_AC">Non-AC Room</option>
              </select>
              <div className="as-modal-actions">
                <button type="submit" className="as-save">Save</button>
                <button type="button" className="as-cancel" onClick={() => setOpenRoom(false)}>Cancel</button>
              </div>
            </div>
          </form>
        </div>
      )}

      {/* ====== BED MODAL ====== */}
      {openBed && (
        <div className="as-overlay" onClick={() => setOpenBed(false)}>
          <form className="as-modal as-modal-sm" onClick={(e) => e.stopPropagation()} onSubmit={saveBed}>
            <div className="as-modal-title">Add Bed</div>
            <div className="as-modal-grid">
              <input className="as-input" placeholder="Bed Number" value={bedForm.bedNumber} onChange={(e) => setBedForm({ ...bedForm, bedNumber: e.target.value })} />
              <select className="as-input" value={bedForm.bedType} onChange={(e) => setBedForm({ ...bedForm, bedType: e.target.value })}>
                <option value="Single">Single</option>
                <option value="Double">Double</option>
              </select>
              <select className="as-input as-span2" value={bedForm.status} onChange={(e) => setBedForm({ ...bedForm, status: e.target.value })}>
                <option value="AVAILABLE">Available</option>
                <option value="OCCUPIED">Occupied</option>
                <option value="MAINTENANCE">Maintenance</option>
              </select>
              <div className="as-modal-actions">
                <button type="submit" className="as-save">Save</button>
                <button type="button" className="as-cancel" onClick={() => setOpenBed(false)}>Cancel</button>
              </div>
            </div>
          </form>
        </div>
      )}

      {/* ====== SOURCE MODAL ====== */}
      {openSource && (
        <div className="as-overlay" onClick={() => setOpenSource(false)}>
          <form className="as-modal as-modal-sm" onClick={(e) => e.stopPropagation()} onSubmit={saveSource}>
            <div className="as-modal-title">{editSource ? "Edit Source" : "Add Source"}</div>
            <div className="as-modal-grid">
              <input className="as-input as-span2" placeholder="Source Name (e.g. Walk-in)" value={sourceForm.source} onChange={(e) => setSourceForm({ source: e.target.value })} />
              <div className="as-modal-actions">
                <button type="submit" className="as-save">Save</button>
                <button type="button" className="as-cancel" onClick={() => setOpenSource(false)}>Cancel</button>
              </div>
            </div>
          </form>
        </div>
      )}

      {/* ====== LEAVE MODAL ====== */}
      {openLeave && (
        <div className="as-overlay" onClick={() => setOpenLeave(false)}>
          <form className="as-modal as-modal-sm" onClick={(e) => e.stopPropagation()} onSubmit={saveLeave}>
            <div className="as-modal-title">Add Leave</div>
            <div className="as-modal-grid">
              <input className="as-input" placeholder="User ID" value={leaveForm.userId} onChange={(e) => setLeaveForm({ ...leaveForm, userId: e.target.value })} />
              <input className="as-input" placeholder="Student Name" value={leaveForm.name} onChange={(e) => setLeaveForm({ ...leaveForm, name: e.target.value })} />
              <div><label className="as-lab">From Date</label><input className="as-input" type="date" value={leaveForm.from} onChange={(e) => setLeaveForm({ ...leaveForm, from: e.target.value })} /></div>
              <div><label className="as-lab">To Date</label><input className="as-input" type="date" value={leaveForm.to} onChange={(e) => setLeaveForm({ ...leaveForm, to: e.target.value })} /></div>
              <input className="as-input" placeholder="Reason" value={leaveForm.reason} onChange={(e) => setLeaveForm({ ...leaveForm, reason: e.target.value })} />
              <div className="as-modal-actions">
                <button type="submit" className="as-save">Save</button>
                <button type="button" className="as-cancel" onClick={() => setOpenLeave(false)}>Cancel</button>
              </div>
            </div>
          </form>
        </div>
      )}

      {/* ====== BANK MODAL ====== */}
      {openBank && (
        <div className="as-overlay" onClick={() => setOpenBank(false)}>
          <form className="as-modal as-modal-sm" onClick={(e) => e.stopPropagation()} onSubmit={saveBank}>
            <div className="as-modal-title">{editBank ? "Edit Bank" : "Add Bank"}</div>
            <div className="as-modal-grid">
              <input className="as-input as-span2" placeholder="Bank Name" value={bankForm.bankName} onChange={(e) => setBankForm({ ...bankForm, bankName: e.target.value })} />
              <input className="as-input" placeholder="Account Holder" value={bankForm.accountHolder} onChange={(e) => setBankForm({ ...bankForm, accountHolder: e.target.value })} />
              <input className="as-input" placeholder="Account Number" value={bankForm.accountNumber} onChange={(e) => setBankForm({ ...bankForm, accountNumber: e.target.value })} />
              <input className="as-input" placeholder="Confirm Account Number" value={bankForm.confirmAccount} onChange={(e) => setBankForm({ ...bankForm, confirmAccount: e.target.value })} />
              <input className="as-input" placeholder="IFSC Code" value={bankForm.ifsc} onChange={(e) => setBankForm({ ...bankForm, ifsc: e.target.value })} />
              <input className="as-input" placeholder="Branch" value={bankForm.branch} onChange={(e) => setBankForm({ ...bankForm, branch: e.target.value })} />
              {bankError && <div className="as-error">{bankError}</div>}
              <div className="as-modal-actions">
                <button type="submit" className="as-save">Save</button>
                <button type="button" className="as-cancel" onClick={() => setOpenBank(false)}>Cancel</button>
              </div>
            </div>
          </form>
        </div>
      )}
    </div>
  );
};

export default AdmissionSettings;
