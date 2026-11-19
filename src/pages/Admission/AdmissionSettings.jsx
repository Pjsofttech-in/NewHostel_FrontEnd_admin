import React, { useCallback, useEffect, useState } from "react";
import { MdKingBed } from "react-icons/md";
import "./AdmissionSettings.css";
import {
  // Building
  getAllBuildings, createBuilding, updateBuilding, deleteBuilding,
  // Floor
  getAllFloors, createFloor, updateFloor, deleteFloor as apiDeleteFloor,
  // Room
  getRoomsByFloor, createRoom, updateRoom, deleteRoom as apiDeleteRoom,
  // Bed
  getBedsByRoom, createBed, updateBed, deleteBed as apiDeleteBed,
  // Source
  getAllSources, createSource, updateSource, deleteSource as apiDeleteSource,
} from "../../services/hostelService.js";
import {
  FaBed, FaGavel, FaPen, FaTrashAlt, FaUniversity,
  FaWhatsapp, FaYoutube, FaTelegram, FaReddit, FaInstagram,
  FaFacebook, FaTwitter, FaLinkedin, FaBullhorn, FaNewspaper,
  FaBookOpen, FaWalking, FaBuilding
} from "react-icons/fa";

const BANKS_KEY = "hostel-banks";
const RULES_KEY = "hostel-rules";

const emptyBank = { bankName: "", accountHolder: "", accountNumber: "", confirmAccount: "", ifsc: "", branch: "", upiId: "", remark: "" };

const readLocal = (key, fb) => {
  try { return JSON.parse(localStorage.getItem(key) || "null") ?? fb; }
  catch { return fb; }
};

const AdmissionSettings = () => {
  // Get role & email from your auth (adjust as per your project)
  const role = sessionStorage.getItem("role") || "BRANCH";
const email = sessionStorage.getItem("email") || "";
const branchCode = sessionStorage.getItem("branchCode") || "";

  const [section, setSection] = useState("rooms");

  // Hierarchy states
  const [buildings, setBuildings] = useState([]);
  const [selectedBuilding, setSelectedBuilding] = useState(null);
  const [floors, setFloors] = useState([]);
  const [selectedFloor, setSelectedFloor] = useState(null);
  const [rooms, setRooms] = useState([]);

  // Building modal
  const [openBuilding, setOpenBuilding] = useState(false);
  const [editBuilding, setEditBuilding] = useState(null);
  const [buildingForm, setBuildingForm] = useState({ buildingName: "" });

  // Floor modal
  const [openFloor, setOpenFloor] = useState(false);
  const [editFloor, setEditFloor] = useState(null);
  const [floorForm, setFloorForm] = useState({ floorNumber: "" });

  // Room modal
  const [openRoom, setOpenRoom] = useState(false);
  const [editRoom, setEditRoom] = useState(null);
  const [roomForm, setRoomForm] = useState({ roomNumber: "", roomType: "AC", totalBeds: "" });

  // Bed modal
  const [openBed, setOpenBed] = useState(false);
  const [editBed, setEditBed] = useState(null);
  const [bedRoomId, setBedRoomId] = useState(null);
  const [bedForm, setBedForm] = useState({ bedNumber: "", bedType: "Single", status: "AVAILABLE" });

  // Sources
  const [sources, setSources] = useState([]);
  const [openSource, setOpenSource] = useState(false);
  const [editSource, setEditSource] = useState(null);
  const [sourceForm, setSourceForm] = useState({ source: "" });

  // Local data
  const [banks, setBanks] = useState(() => readLocal(BANKS_KEY, []));
  const [openBank, setOpenBank] = useState(false);
  const [editBank, setEditBank] = useState(null);
  const [bankForm, setBankForm] = useState(emptyBank);
  const [bankError, setBankError] = useState("");

  const [rules, setRules] = useState(() => readLocal(RULES_KEY, []));
  const [ruleText, setRuleText] = useState("");

  // ===================== LOADERS =====================
  const loadBuildings = useCallback(async () => {
    try {
      const data = await getAllBuildings(branchCode, role, email);
      setBuildings(data || []);
    } catch (err) {
      console.error("Failed to load buildings:", err);
    }
  }, [branchCode, role, email]);

  const loadFloors = useCallback(async (buildingId) => {
    try {
      const data = await getAllFloors(buildingId, role, email);
      setFloors(data || []);
    } catch (err) {
      console.error("Failed to load floors:", err);
    }
  }, [role, email]);

  const loadRooms = useCallback(async (floorId) => {
    try {
      const roomsData = await getRoomsByFloor(floorId, role, email);

      const roomsWithBeds = await Promise.all(
        (roomsData || []).map(async (room) => {
          try {
            const beds = await getBedsByRoom(room.id, role, email);
            return { ...room, beds: beds || [] };
          } catch {
            return { ...room, beds: [] };
          }
        })
      );

      setRooms(roomsWithBeds);
    } catch (err) {
      console.error("Failed to load rooms:", err);
    }
  }, [role, email]);

  const loadSources = useCallback(async () => {
    try {
      const data = await getAllSources(role, email);
      setSources(data || []);
    } catch {
      setSources([]);
    }
  }, [role, email]);

  useEffect(() => {
    loadBuildings();
    loadSources();
  }, [loadBuildings, loadSources]);

  useEffect(() => {
    if (selectedBuilding) {
      loadFloors(selectedBuilding.id);
    }
  }, [selectedBuilding, loadFloors]);

  useEffect(() => {
    if (selectedFloor) {
      loadRooms(selectedFloor.id);
    }
  }, [selectedFloor, loadRooms]);

  useEffect(() => { localStorage.setItem(BANKS_KEY, JSON.stringify(banks)); }, [banks]);
  useEffect(() => { localStorage.setItem(RULES_KEY, JSON.stringify(rules)); }, [rules]);

  // ===================== BUILDING CRUD =====================
  const saveBuilding = async (e) => {
    e.preventDefault();
    try {
      if (editBuilding) {
        await updateBuilding(editBuilding.id, buildingForm, role, email);
      } else {
        await createBuilding({ ...buildingForm, createdByEmail: email, role }, role, email);
      }
      await loadBuildings();
      setOpenBuilding(false);
      setEditBuilding(null);
      setBuildingForm({ buildingName: "" });
    } catch (err) {
      alert("Failed: " + (err?.message || err));
    }
  };

  const handleDeleteBuilding = async (b) => {
    if (!window.confirm(`Delete building "${b.buildingName}"?`)) return;
    try {
      await deleteBuilding(b.id, role, email);
      await loadBuildings();
      if (selectedBuilding?.id === b.id) {
        setSelectedBuilding(null);
        setFloors([]);
        setSelectedFloor(null);
        setRooms([]);
      }
    } catch (err) {
      alert("Failed: " + (err?.message || err));
    }
  };

  // ===================== FLOOR CRUD =====================
  const saveFloor = async (e) => {
    e.preventDefault();
    if (!selectedBuilding) {
    alert("No building selected!");
    return;
  }

  console.log("Creating floor for buildingId:", selectedBuilding.id); // ← check this
    if (!selectedBuilding) return;
    try {
      if (editFloor) {
        await updateFloor(editFloor.id, selectedBuilding.id, floorForm, role, email);
      } else {
        await createFloor(selectedBuilding.id, floorForm, role, email);
      }
      await loadFloors(selectedBuilding.id);
      setOpenFloor(false);
      setEditFloor(null);
      setFloorForm({ floorNumber: "" });
    } catch (err) {
      alert("Failed: " + (err?.message || err));
    }
  };

  const handleDeleteFloor = async (f) => {
    if (!window.confirm(`Delete floor "${f.floorNumber}"?`)) return;
    try {
      await apiDeleteFloor(f.id, role, email);
      await loadFloors(selectedBuilding.id);
      if (selectedFloor?.id === f.id) {
        setSelectedFloor(null);
        setRooms([]);
      }
    } catch (err) {
      alert("Failed: " + (err?.message || err));
    }
  };

  // ===================== ROOM CRUD =====================
  const saveRoom = async (e) => {
    e.preventDefault();
    if (!selectedFloor) return;
    try {
      if (editRoom) {
        await updateRoom(editRoom.id, roomForm, role, email);
      } else {
        await createRoom(selectedFloor.id, roomForm, role, email);
      }
      await loadRooms(selectedFloor.id);
      setOpenRoom(false);
      setEditRoom(null);
      setRoomForm({ roomNumber: "", roomType: "AC", totalBeds: "" });
    } catch (err) {
      alert("Failed: " + (err?.message || err));
    }
  };

  const handleDeleteRoom = async (room) => {
    if (!window.confirm(`Delete room "${room.roomNumber}"?`)) return;
    try {
      await apiDeleteRoom(room.id, role, email);
      await loadRooms(selectedFloor.id);
    } catch (err) {
      alert("Failed: " + (err?.message || err));
    }
  };

  // ===================== BED CRUD =====================
  const openAddBed = (roomId) => {
    setBedRoomId(roomId);
    setBedForm({ bedNumber: "", bedType: "Single", status: "AVAILABLE" });
    setEditBed(null);
    setOpenBed(true);
  };

  const saveBed = async (e) => {
    e.preventDefault();
    try {
      if (editBed) {
        await updateBed(editBed.id, bedForm, role, email);
      } else {
        await createBed(bedRoomId, bedForm, role, email);
      }
      await loadRooms(selectedFloor.id);
      setOpenBed(false);
      setEditBed(null);
      setBedRoomId(null);
    } catch (err) {
      alert("Failed: " + (err?.message || err));
    }
  };

  const handleDeleteBed = async (bed) => {
    if (!window.confirm(`Delete bed "${bed.bedNumber}"?`)) return;
    try {
      await apiDeleteBed(bed.id, role, email);
      await loadRooms(selectedFloor.id);
    } catch (err) {
      alert("Failed: " + (err?.message || err));
    }
  };

  // ===================== SOURCE CRUD =====================
  const saveSource = async (e) => {
    e.preventDefault();
    try {
      if (editSource) {
        await updateSource(editSource.id, sourceForm, role, email);
      } else {
        await createSource(sourceForm, role, email);
      }
      await loadSources();
      setOpenSource(false);
      setEditSource(null);
      setSourceForm({ source: "" });
    } catch (err) {
      alert("Failed: " + (err?.message || err));
    }
  };

  const handleDeleteSource = async (s) => {
    if (!window.confirm(`Delete source "${s.source}"?`)) return;
    try {
      await apiDeleteSource(s.id, role, email);
      await loadSources();
    } catch (err) {
      alert("Failed: " + (err?.message || err));
    }
  };

  // ===================== BANK & RULES (local) =====================
  const saveBank = (e) => {
    e.preventDefault();
    if (!bankForm.bankName || !bankForm.accountHolder || !bankForm.accountNumber || !bankForm.ifsc) {
      setBankError("Bank Name, Account Holder, Account Number and IFSC are required.");
      return;
    }
    if (bankForm.accountNumber !== bankForm.confirmAccount) {
      setBankError("Account numbers do not match.");
      return;
    }
    const data = { id: editBank ? editBank.id : Date.now(), ...bankForm };
    setBanks((prev) => editBank ? prev.map((b) => b.id === editBank.id ? data : b) : [...prev, data]);
    setOpenBank(false);
    setBankError("");
    setEditBank(null);
    setBankForm(emptyBank);
  };

  const addRule = () => {
    if (!ruleText.trim()) {
      alert("Please type a rule first.");
      return;
    }
    setRules((prev) => [...prev, { id: Date.now(), text: ruleText.trim() }]);
    setRuleText("");
  };

  const deleteRule = (id) => {
    setRules((prev) => prev.filter((r) => r.id !== id));
  };

  return (
    <div className="as-page">
      <aside className="as-rail">
        {[
          { id: "rooms", icon: <FaBed />, label: "Rooms" },
          { id: "sources", icon: <FaGavel />, label: "Sources" },
          { id: "bank", icon: <FaUniversity />, label: "Bank" },
          { id: "rules", icon: <FaGavel />, label: "Rules" },
        ].map(({ id, icon, label }) => (
          <button
            key={id}
            type="button"
            className={section === id ? "as-rail-btn on" : "as-rail-btn"}
            onClick={() => setSection(id)}
          >
            <span className="as-ico">{icon}</span>
            <span className="as-rail-text">{label}</span>
          </button>
        ))}
      </aside>

      <section className="as-main">
        {/* ===================== ROOMS SECTION ===================== */}
        {section === "rooms" && (
          <>
            {/* Level 1: Buildings */}
            {!selectedBuilding && (
              <>
                <div className="as-top">
                  <button
                    type="button"
                    className="as-add-btn"
                    onClick={() => {
                      setOpenBuilding(true);
                      setEditBuilding(null);
                      setBuildingForm({ buildingName: "" });
                    }}
                  >
                    Add Building
                  </button>
                </div>
                <div className="as-board">
                  <div className="as-grid">
                    {buildings.map((b) => (
                      <div
                        key={b.id}
                        className="as-card as-card-btn"
                        onClick={() => setSelectedBuilding(b)}
                      >
                        <div className="as-card-actions">
                          <button
                            type="button"
                            className="as-ico-btn edit"
                            onClick={(e) => {
                              e.stopPropagation();
                              setEditBuilding(b);
                              setBuildingForm({ buildingName: b.buildingName });
                              setOpenBuilding(true);
                            }}
                          >
                            <FaPen />
                          </button>
                          <button
                            type="button"
                            className="as-ico-btn del"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleDeleteBuilding(b);
                            }}
                          >
                            <FaTrashAlt />
                          </button>
                        </div>
                        <div className="as-card-name">
                          <FaBuilding style={{ marginRight: 6 }} />
                          {b.buildingName}
                        </div>
                        <div className="as-card-meta">Click to view floors</div>
                      </div>
                    ))}
                  </div>
                </div>
              </>
            )}

            {/* Level 2: Floors of selected building */}
            {selectedBuilding && !selectedFloor && (
              <>
                <div className="as-top">
                  <button
                    type="button"
                    className="as-add-btn"
                    onClick={() => {
                      setOpenFloor(true);
                      setEditFloor(null);
                      setFloorForm({ floorNumber: "" });
                    }}
                  >
                    Add Floor
                  </button>
                </div>
                <div className="as-board">
                  <div className="as-floor-no">
                    Building: <strong>{selectedBuilding.buildingName}</strong>
                  </div>
                  <div className="as-grid">
                    {floors.map((f) => (
                      <div
                        key={f.id}
                        className="as-card as-card-btn"
                        onClick={() => setSelectedFloor(f)}
                      >
                        <div className="as-card-actions">
                          <button
                            type="button"
                            className="as-ico-btn edit"
                            onClick={(e) => {
                              e.stopPropagation();
                              setEditFloor(f);
                              setFloorForm({ floorNumber: f.floorNumber });
                              setOpenFloor(true);
                            }}
                          >
                            <FaPen />
                          </button>
                          <button
                            type="button"
                            className="as-ico-btn del"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleDeleteFloor(f);
                            }}
                          >
                            <FaTrashAlt />
                          </button>
                        </div>
                        <div className="as-card-floor">{f.floorNumber}</div>
                        <div className="as-card-meta">
                          <FaBed /> Click to view rooms
                        </div>
                      </div>
                    ))}
                  </div>
                  <div className="as-back-wrap">
                    <button
                      type="button"
                      className="as-add-btn"
                      onClick={() => {
                        setSelectedBuilding(null);
                        setFloors([]);
                      }}
                    >
                      ← Back to Buildings
                    </button>
                  </div>
                </div>
              </>
            )}

            {/* Level 3: Rooms + Beds */}
            {selectedFloor && (
              <>
                <div className="as-top">
                  <button
                    type="button"
                    className="as-add-btn"
                    onClick={() => {
                      setOpenRoom(true);
                      setEditRoom(null);
                      setRoomForm({ roomNumber: "", roomType: "AC", totalBeds: "" });
                    }}
                  >
                    Add Room
                  </button>
                </div>
                <div className="as-board">
                  <div className="as-floor-no">
                    {selectedBuilding?.buildingName} — {selectedFloor.floorNumber}
                  </div>
                  <div className="as-grid">
                    {rooms.map((r) => (
                      <div
                        key={r.id}
                        className={r.roomType === "AC" ? "as-room ac" : "as-room nonac"}
                      >
                        <div className="as-room-actions">
                          <button
                            type="button"
                            className="as-ico-btn edit"
                            onClick={() => {
                              setEditRoom(r);
                              setRoomForm({
                                roomNumber: r.roomNumber,
                                roomType: r.roomType,
                                totalBeds: r.totalBeds,
                              });
                              setOpenRoom(true);
                            }}
                          >
                            <FaPen />
                          </button>
                          <button
                            type="button"
                            className="as-ico-btn del"
                            onClick={() => handleDeleteRoom(r)}
                          >
                            <FaTrashAlt />
                          </button>
                        </div>

                        <div className="as-room-name">{r.roomNumber}</div>
                        <div className="as-room-cap">
                          Capacity: {r.totalBeds} beds — {r.roomType}
                        </div>

                        <div className="as-beds-list">
                          {r.beds && r.beds.length > 0 ? (
                            r.beds.map((bed) => (
                              <div key={bed.id} className="as-bed-item">
                                <span className="as-bed-number">
                                  {bed.bedType === "Double" ? <MdKingBed /> : <FaBed />}{" "}
                                  {bed.bedNumber}
                                </span>
                                <span className={`as-bed-status ${bed.status?.toLowerCase()}`}>
                                  {bed.status || "AVAILABLE"}
                                </span>
                                <button
                                  type="button"
                                  className="as-ico-btn del"
                                  onClick={() => handleDeleteBed(bed)}
                                  title="Delete Bed"
                                >
                                  <FaTrashAlt />
                                </button>
                              </div>
                            ))
                          ) : (
                            <div className="as-no-beds">No beds added</div>
                          )}
                        </div>

                        <button
                          type="button"
                          className="as-plus"
                          onClick={() => openAddBed(r.id)}
                        >
                          + Add Bed
                        </button>
                      </div>
                    ))}
                  </div>
                  <div className="as-back-wrap">
                    <button
                      type="button"
                      className="as-add-btn"
                      onClick={() => {
                        setSelectedFloor(null);
                        setRooms([]);
                      }}
                    >
                      ← Back to Floors
                    </button>
                  </div>
                </div>
              </>
            )}
          </>
        )}

        {/* ===================== SOURCES ===================== */}
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
                    <tr>
                      <td colSpan={3} className="as-leave-empty">
                        No sources added yet.
                      </td>
                    </tr>
                  ) : (
                    sources.map((s) => (
                      <tr key={s.id}>
                        <td>{s.id}</td>
                        <td>
                          <span className="as-source-name">{s.source}</span>
                        </td>
                        <td>
                          <div className="as-source-actions">
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

        {/* ===================== BANK ===================== */}
        {section === "bank" && (
          <div className="as-leave">
            <div className="as-top">
              <button
                type="button"
                className="as-add-btn"
                onClick={() => {
                  setEditBank(null);
                  setBankForm(emptyBank);
                  setBankError("");
                  setOpenBank(true);
                }}
              >
                Add Bank
              </button>
            </div>
            <div className="as-bank-grid">
              {banks.length === 0 ? (
                <div className="as-bank-empty">No banks added yet.</div>
              ) : (
                banks.map((b) => (
                  <div key={b.id} className="as-bank-card">
                    <div className="as-bank-actions">
                      <button
                        type="button"
                        className="as-ico-btn edit"
                        onClick={() => {
                          setEditBank(b);
                          setBankForm({ ...b, confirmAccount: b.accountNumber });
                          setOpenBank(true);
                        }}
                      >
                        <FaPen />
                      </button>
                      <button
                        type="button"
                        className="as-ico-btn del"
                        onClick={() => setBanks((prev) => prev.filter((x) => x.id !== b.id))}
                      >
                        <FaTrashAlt />
                      </button>
                    </div>
                    <div className="as-bank-name">{b.bankName}</div>
                    <div className="as-bank-row">
                      <span>Account No</span>
                      <b>{b.accountNumber}</b>
                    </div>
                    <div className="as-bank-row">
                      <span>IFSC</span>
                      <b>{b.ifsc}</b>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        )}

        {/* ===================== RULES ===================== */}
        {section === "rules" && (
          <div className="as-leave">
            <div className="as-top as-rule-top">
              <input
                className="as-input as-rule-input"
                type="text"
                placeholder="Type hostel rule here..."
                value={ruleText}
                onChange={(e) => setRuleText(e.target.value)}
              />
              <button type="button" className="as-add-btn" onClick={addRule}>
                Add Rule
              </button>
            </div>
            <div className="as-rule-list">
              {rules.length === 0 ? (
                <div className="as-bank-empty">No rules added yet.</div>
              ) : (
                rules.map((r, i) => (
                  <div key={r.id} className="as-rule-item">
                    <span className="as-rule-no">{i + 1}.</span>
                    <span className="as-rule-text">{r.text}</span>
                    <button
                      type="button"
                      className="as-ico-btn del"
                      onClick={() => deleteRule(r.id)}
                    >
                      <FaTrashAlt />
                    </button>
                  </div>
                ))
              )}
            </div>
          </div>
        )}
      </section>

      {/* ===================== MODALS ===================== */}

      {/* Building Modal */}
      {openBuilding && (
        <div className="as-overlay" onClick={() => setOpenBuilding(false)}>
          <form
            className="as-modal as-modal-sm"
            onClick={(e) => e.stopPropagation()}
            onSubmit={saveBuilding}
          >
            <div className="as-modal-title">
              {editBuilding ? "Edit Building" : "Add Building"}
            </div>
            <div className="as-modal-grid">
              <input
                className="as-input as-span2"
                placeholder="Building Name"
                value={buildingForm.buildingName}
                onChange={(e) =>
                  setBuildingForm({ ...buildingForm, buildingName: e.target.value })
                }
                required
              />
              <div className="as-modal-actions">
                <button type="submit" className="as-save">Save</button>
                <button
                  type="button"
                  className="as-cancel"
                  onClick={() => setOpenBuilding(false)}
                >
                  Cancel
                </button>
              </div>
            </div>
          </form>
        </div>
      )}

      {/* Floor Modal */}
      {openFloor && (
        <div className="as-overlay" onClick={() => setOpenFloor(false)}>
          <form
            className="as-modal as-modal-sm"
            onClick={(e) => e.stopPropagation()}
            onSubmit={saveFloor}
          >
            <div className="as-modal-title">
              {editFloor ? "Edit Floor" : "Add Floor"}
            </div>
            <div className="as-modal-grid">
              <input
                className="as-input as-span2"
                placeholder="Floor Number / Name"
                value={floorForm.floorNumber}
                onChange={(e) =>
                  setFloorForm({ ...floorForm, floorNumber: e.target.value })
                }
                required
              />
              <div className="as-modal-actions">
                <button type="submit" className="as-save">Save</button>
                <button
                  type="button"
                  className="as-cancel"
                  onClick={() => setOpenFloor(false)}
                >
                  Cancel
                </button>
              </div>
            </div>
          </form>
        </div>
      )}

      {/* Room Modal */}
      {openRoom && (
        <div className="as-overlay" onClick={() => setOpenRoom(false)}>
          <form
            className="as-modal as-modal-sm"
            onClick={(e) => e.stopPropagation()}
            onSubmit={saveRoom}
          >
            <div className="as-modal-title">
              {editRoom ? "Edit Room" : "Add Room"}
            </div>
            <div className="as-modal-grid">
              <input
                className="as-input"
                placeholder="Room Number"
                value={roomForm.roomNumber}
                onChange={(e) =>
                  setRoomForm({ ...roomForm, roomNumber: e.target.value })
                }
                required
              />
              <input
                className="as-input"
                type="number"
                min="1"
                placeholder="Total Beds"
                value={roomForm.totalBeds}
                onChange={(e) =>
                  setRoomForm({ ...roomForm, totalBeds: e.target.value })
                }
              />
              <select
                className="as-input as-span2"
                value={roomForm.roomType}
                onChange={(e) =>
                  setRoomForm({ ...roomForm, roomType: e.target.value })
                }
              >
                <option value="AC">AC Room</option>
                <option value="NON_AC">Non-AC Room</option>
              </select>
              <div className="as-modal-actions">
                <button type="submit" className="as-save">Save</button>
                <button
                  type="button"
                  className="as-cancel"
                  onClick={() => setOpenRoom(false)}
                >
                  Cancel
                </button>
              </div>
            </div>
          </form>
        </div>
      )}

      {/* Bed Modal */}
      {openBed && (
        <div className="as-overlay" onClick={() => setOpenBed(false)}>
          <form
            className="as-modal as-modal-sm"
            onClick={(e) => e.stopPropagation()}
            onSubmit={saveBed}
          >
            <div className="as-modal-title">Add Bed</div>
            <div className="as-modal-grid">
              <input
                className="as-input"
                placeholder="Bed Number"
                value={bedForm.bedNumber}
                onChange={(e) =>
                  setBedForm({ ...bedForm, bedNumber: e.target.value })
                }
                required
              />
              <select
                className="as-input"
                value={bedForm.bedType}
                onChange={(e) =>
                  setBedForm({ ...bedForm, bedType: e.target.value })
                }
              >
                <option value="Single">Single</option>
                <option value="Double">Double</option>
              </select>
              <select
                className="as-input as-span2"
                value={bedForm.status}
                onChange={(e) =>
                  setBedForm({ ...bedForm, status: e.target.value })
                }
              >
                <option value="AVAILABLE">Available</option>
                <option value="OCCUPIED">Occupied</option>
                <option value="MAINTENANCE">Maintenance</option>
              </select>
              <div className="as-modal-actions">
                <button type="submit" className="as-save">Save</button>
                <button
                  type="button"
                  className="as-cancel"
                  onClick={() => setOpenBed(false)}
                >
                  Cancel
                </button>
              </div>
            </div>
          </form>
        </div>
      )}

      {/* Source Modal */}
      {openSource && (
        <div className="as-overlay" onClick={() => setOpenSource(false)}>
          <div className="as-modal as-source-modal" onClick={(e) => e.stopPropagation()}>
            <div className="as-modal-header">
              <h3>Select or Add Source</h3>
            </div>

            <div className="as-source-body">
              <div className="as-popular-label">Popular Sources</div>

              <div className="as-source-chips">
                {[
                  { name: "WhatsApp", icon: <FaWhatsapp /> },
                  { name: "YouTube", icon: <FaYoutube /> },
                  { name: "Telegram", icon: <FaTelegram /> },
                  { name: "Reddit", icon: <FaReddit /> },
                  { name: "Instagram", icon: <FaInstagram /> },
                  { name: "Facebook", icon: <FaFacebook /> },
                  { name: "Twitter", icon: <FaTwitter /> },
                  { name: "LinkedIn", icon: <FaLinkedin /> },
                  { name: "Banner", icon: <FaBullhorn /> },
                  { name: "Hoarding", icon: <FaBullhorn /> },
                  { name: "Newspaper", icon: <FaNewspaper /> },
                  { name: "Pamphlet", icon: <FaBookOpen /> },
                  { name: "Direct Walk-in", icon: <FaWalking /> },
                ].map((item) => (
                  <button
                    key={item.name}
                    type="button"
                    className="as-source-chip"
                    onClick={() => {
                      createSource({ source: item.name }, role, email)
                        .then(() => {
                          loadSources();
                          setOpenSource(false);
                          setSourceForm({ source: "" });
                        })
                        .catch((err) => alert("Failed: " + (err?.message || err)));
                    }}
                  >
                    <span className="as-chip-icon">{item.icon}</span>
                    {item.name}
                  </button>
                ))}
              </div>

              <div className="as-or-label">Or Enter Custom Source</div>

              <form onSubmit={saveSource}>
                <input
                  className="as-input as-custom-source"
                  placeholder="Source Name"
                  value={sourceForm.source}
                  onChange={(e) => setSourceForm({ source: e.target.value })}
                  autoFocus
                />
                <div className="as-modal-actions as-source-actions">
                  <button
                    type="button"
                    className="as-cancel"
                    onClick={() => {
                      setOpenSource(false);
                      setEditSource(null);
                      setSourceForm({ source: "" });
                    }}
                  >
                    Cancel
                  </button>
                  <button type="submit" className="as-save">
                    Submit
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* Bank Modal */}
      {openBank && (
        <div className="as-overlay" onClick={() => setOpenBank(false)}>
          <form
            className="as-modal as-modal-sm"
            onClick={(e) => e.stopPropagation()}
            onSubmit={saveBank}
          >
            <div className="as-modal-title">
              {editBank ? "Edit Bank" : "Add Bank"}
            </div>
            <div className="as-modal-grid">
              <input
                className="as-input as-span2"
                placeholder="Bank Name"
                value={bankForm.bankName}
                onChange={(e) => setBankForm({ ...bankForm, bankName: e.target.value })}
              />
              <input
                className="as-input"
                placeholder="Account Holder"
                value={bankForm.accountHolder}
                onChange={(e) => setBankForm({ ...bankForm, accountHolder: e.target.value })}
              />
              <input
                className="as-input"
                placeholder="Account Number"
                value={bankForm.accountNumber}
                onChange={(e) => setBankForm({ ...bankForm, accountNumber: e.target.value })}
              />
              <input
                className="as-input"
                placeholder="Confirm Account Number"
                value={bankForm.confirmAccount}
                onChange={(e) => setBankForm({ ...bankForm, confirmAccount: e.target.value })}
              />
              <input
                className="as-input"
                placeholder="IFSC Code"
                value={bankForm.ifsc}
                onChange={(e) => setBankForm({ ...bankForm, ifsc: e.target.value })}
              />
              <input
                className="as-input"
                placeholder="Branch"
                value={bankForm.branch}
                onChange={(e) => setBankForm({ ...bankForm, branch: e.target.value })}
              />
              {bankError && <div className="as-error">{bankError}</div>}
              <div className="as-modal-actions">
                <button type="submit" className="as-save">Save</button>
                <button
                  type="button"
                  className="as-cancel"
                  onClick={() => setOpenBank(false)}
                >
                  Cancel
                </button>
              </div>
            </div>
          </form>
        </div>
      )}
    </div>
  );
};

export default AdmissionSettings;