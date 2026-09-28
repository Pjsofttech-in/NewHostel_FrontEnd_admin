import React, { useEffect, useState } from "react";
import {
  FaBed,
  FaCalendarAlt,
  FaGavel,
  FaPen,
  FaTrashAlt,
  FaUniversity,
} from "react-icons/fa";
import { MdKingBed } from "react-icons/md";
import "./AdmissionSettings.css";

const STORAGE_KEY = "hostel-admission-floors";
const LEAVE_KEY = "hostel-admission-leaves";
const ADMISSION_KEY = "hostel-admissions";
const BANKS_KEY = "hostel-banks";
const RULES_KEY = "hostel-rules";

const emptyLeave = {
  userId: "",
  name: "",
  from: "",
  to: "",
  reason: "",
  remark: "",
};

const emptyBank = {
  bankName: "",
  accountHolder: "",
  accountNumber: "",
  confirmAccount: "",
  ifsc: "",
  branch: "",
  upiId: "",
  remark: "",
};

const BedIcon = ({ double }) =>
  double ? (
    <MdKingBed className="as-bed-dbl" />
  ) : (
    <FaBed className="as-bed-sgl" />
  );

const readAdmissions = () => {
  try {
    const raw = localStorage.getItem(ADMISSION_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
};

const readBanks = () => {
  try {
    const raw = localStorage.getItem(BANKS_KEY);
    const data = raw ? JSON.parse(raw) : [];
    return Array.isArray(data) ? data : [];
  } catch {
    return [];
  }
};

const readRules = () => {
  try {
    const raw = localStorage.getItem(RULES_KEY);
    const data = raw ? JSON.parse(raw) : [];
    return Array.isArray(data) ? data : [];
  } catch {
    return [];
  }
};

const AdmissionSettings = () => {
  const [section, setSection] = useState("rooms");

  const [floors, setFloors] = useState(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      return raw ? JSON.parse(raw) : [];
    } catch {
      return [];
    }
  });

  const [admissions, setAdmissions] = useState(() => readAdmissions());

  const [selected, setSelected] = useState(null);
  const [openFloor, setOpenFloor] = useState(false);
  const [editFloor, setEditFloor] = useState(null);
  const [openRoom, setOpenRoom] = useState(false);
  const [editRoom, setEditRoom] = useState(null);

  const [openBed, setOpenBed] = useState(false);
  const [bedRoom, setBedRoom] = useState(null);
  const [bedError, setBedError] = useState("");

  const [floorForm, setFloorForm] = useState({
    building: "",
    address: "",
    floor: "",
    rooms: "",
  });

  const [roomForm, setRoomForm] = useState({
    name: "",
    capacity: "",
    ac: "ac",
  });

  const [bedForm, setBedForm] = useState({
    number: "1",
    type: "Single",
  });

  const [leaveFilter, setLeaveFilter] = useState({
    status: "All",
    start: "",
    end: "",
  });

  const [leaves, setLeaves] = useState(() => {
    try {
      const raw = localStorage.getItem(LEAVE_KEY);
      return raw ? JSON.parse(raw) : [];
    } catch {
      return [];
    }
  });

  const [openLeave, setOpenLeave] = useState(false);
  const [leaveForm, setLeaveForm] = useState(emptyLeave);
  const [leaveError, setLeaveError] = useState("");

  const [banks, setBanks] = useState(() => readBanks());
  const [openBank, setOpenBank] = useState(false);
  const [editBank, setEditBank] = useState(null);
  const [bankForm, setBankForm] = useState(emptyBank);
  const [bankError, setBankError] = useState("");

  const [rules, setRules] = useState(() => readRules());
  const [ruleText, setRuleText] = useState("");

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(floors));
  }, [floors]);

  useEffect(() => {
    localStorage.setItem(LEAVE_KEY, JSON.stringify(leaves));
  }, [leaves]);

  useEffect(() => {
    localStorage.setItem(BANKS_KEY, JSON.stringify(banks));
  }, [banks]);

  useEffect(() => {
    const refreshAdmissions = () => {
      setAdmissions(readAdmissions());

      try {
        const raw = localStorage.getItem(STORAGE_KEY);

        if (raw) {
          const updatedFloors = JSON.parse(raw);

          setFloors(updatedFloors);

          if (selected) {
            const updatedSelected = updatedFloors.find(
              (f) => f.id === selected.id,
            );

            if (updatedSelected) {
              setSelected(updatedSelected);
            }
          }
        }
      } catch {
        return;
      }
    };

    window.addEventListener("storage", refreshAdmissions);
    window.addEventListener("hostel-data-updated", refreshAdmissions);
    window.addEventListener("admission-updated", refreshAdmissions);

    const interval = setInterval(() => {
      setAdmissions(readAdmissions());

      try {
        const raw = localStorage.getItem(STORAGE_KEY);

        if (raw) {
          const latestFloors = JSON.parse(raw);

          setFloors((oldFloors) => {
            const oldData = JSON.stringify(oldFloors);
            const newData = JSON.stringify(latestFloors);

            if (oldData !== newData) {
              if (selected) {
                const latestSelected = latestFloors.find(
                  (f) => f.id === selected.id,
                );

                if (latestSelected) {
                  setSelected(latestSelected);
                }
              }

              return latestFloors;
            }

            return oldFloors;
          });
        }
      } catch {
        return;
      }
    }, 500);

    return () => {
      window.removeEventListener("storage", refreshAdmissions);
      window.removeEventListener("hostel-data-updated", refreshAdmissions);
      window.removeEventListener("admission-updated", refreshAdmissions);
      clearInterval(interval);
    };
  }, [selected]);

  const current = selected
    ? floors.find((f) => f.id === selected.id) || selected
    : null;

  const isBedOccupied = (bed, room, floor) => {
    if (!bed || !room || !floor) return false;

    if (bed.occupied === true) {
      return true;
    }

    const bedNumber = String(bed.number || "").trim();

    const roomName = String(room.name || "")
      .trim()
      .toLowerCase();

    const floorName = String(floor.floor || "")
      .trim()
      .toLowerCase();

    const buildingName = String(floor.building || "")
      .trim()
      .toLowerCase();

    return admissions.some((admission) => {
      if (!admission) return false;

      if (admission.status === "Rejected" || admission.status === "Cancelled") {
        return false;
      }

      const admissionBed =
        admission.bedNumber ||
        admission.bedNo ||
        admission.selectedBed ||
        admission.bed;

      const admissionBedNumber =
        typeof admissionBed === "object"
          ? String(
              admissionBed.number ||
                admissionBed.bedNumber ||
                admissionBed.no ||
                "",
            ).trim()
          : String(admissionBed || "").trim();

      if (!admissionBedNumber) return false;

      if (admissionBedNumber !== bedNumber) {
        return false;
      }

      const admissionRoom =
        admission.roomNumber ||
        admission.roomName ||
        admission.selectedRoom ||
        admission.room;

      const admissionRoomName =
        typeof admissionRoom === "object"
          ? String(
              admissionRoom.name ||
                admissionRoom.roomName ||
                admissionRoom.number ||
                "",
            )
              .trim()
              .toLowerCase()
          : String(admissionRoom || "")
              .trim()
              .toLowerCase();

      if (!admissionRoomName || admissionRoomName !== roomName) {
        return false;
      }

      const admissionFloor =
        admission.floor || admission.floorName || admission.selectedFloor;

      const admissionFloorName =
        typeof admissionFloor === "object"
          ? String(
              admissionFloor.floor ||
                admissionFloor.name ||
                admissionFloor.floorName ||
                "",
            )
              .trim()
              .toLowerCase()
          : String(admissionFloor || "")
              .trim()
              .toLowerCase();

      if (!admissionFloorName || admissionFloorName !== floorName) {
        return false;
      }

      const admissionBuilding =
        admission.building ||
        admission.buildingName ||
        admission.selectedBuilding;

      const admissionBuildingName =
        typeof admissionBuilding === "object"
          ? String(
              admissionBuilding.building ||
                admissionBuilding.name ||
                admissionBuilding.buildingName ||
                "",
            )
              .trim()
              .toLowerCase()
          : String(admissionBuilding || "")
              .trim()
              .toLowerCase();

      if (admissionBuildingName && admissionBuildingName !== buildingName) {
        return false;
      }

      return true;
    });
  };

  const bedsRemaining = (floor) =>
    (floor.roomList || []).reduce((sum, room) => {
      const cap = Number(room.capacity) || 0;

      const availableBeds = Array.from(
        { length: cap },
        (_, index) =>
          (room.beds || []).find(
            (b) => String(b.number) === String(index + 1),
          ) || null,
      ).filter((bed) => {
        if (!bed) return true;

        return !isBedOccupied(bed, room, floor);
      }).length;

      return sum + availableBeds;
    }, 0);

  const closeFloor = () => {
    setOpenFloor(false);
    setEditFloor(null);

    setFloorForm({
      building: "",
      address: "",
      floor: "",
      rooms: "",
    });
  };

  const openEditFloor = (f) => {
    setEditFloor(f);

    setFloorForm({
      building: f.building,
      address: f.address || "",
      floor: f.floor,
      rooms: String(f.rooms || ""),
    });

    setOpenFloor(true);
  };

  const deleteFloor = (f) => {
    if (!window.confirm(`Delete "${f.building} - ${f.floor}"?`)) return;

    const next = floors.filter((x) => x.id !== f.id);

    setFloors(next);
    setSelected(null);
  };

  const saveFloor = (e) => {
    e.preventDefault();

    if (
      !floorForm.building.trim() ||
      !floorForm.floor.trim() ||
      !floorForm.rooms
    ) {
      return;
    }

    if (editFloor) {
      const next = floors.map((f) =>
        f.id === editFloor.id
          ? {
              ...f,
              building: floorForm.building.trim(),
              address: floorForm.address.trim(),
              floor: floorForm.floor.trim(),
              rooms: Number(floorForm.rooms),
            }
          : f,
      );

      setFloors(next);
      closeFloor();
      return;
    }

    const newFloor = {
      id: Date.now(),
      building: floorForm.building.trim(),
      address: floorForm.address.trim(),
      floor: floorForm.floor.trim(),
      rooms: Number(floorForm.rooms),
      bedsLeft: 0,
      roomList: [],
    };

    setFloors((prev) => [...prev, newFloor]);

    closeFloor();
  };

  const closeRoom = () => {
    setOpenRoom(false);
    setEditRoom(null);

    setRoomForm({
      name: "",
      capacity: "",
      ac: "ac",
    });
  };

  const startEditRoom = (room) => {
    setEditRoom(room);

    setRoomForm({
      name: room.name,
      capacity: String(room.capacity),
      ac: room.ac,
    });

    setOpenRoom(true);
  };

  const deleteRoom = (room) => {
    if (!current) return;

    const next = floors.map((f) =>
      f.id === current.id
        ? {
            ...f,
            roomList: (f.roomList || []).filter((r) => r.id !== room.id),
          }
        : f,
    );

    setFloors(next);

    setSelected(next.find((f) => f.id === current.id) || null);
  };

  const saveRoom = (e) => {
    e.preventDefault();

    if (!selected || !roomForm.name.trim() || !roomForm.capacity) {
      return;
    }

    const cap = Number(roomForm.capacity);

    if (editRoom) {
      const next = floors.map((f) =>
        f.id === selected.id
          ? {
              ...f,
              roomList: (f.roomList || []).map((r) =>
                r.id === editRoom.id
                  ? {
                      ...r,
                      name: roomForm.name.trim(),
                      capacity: cap,
                      ac: roomForm.ac,
                      beds: (r.beds || []).filter(
                        (b) => Number(b.number) <= cap,
                      ),
                    }
                  : r,
              ),
            }
          : f,
      );

      setFloors(next);

      setSelected(next.find((f) => f.id === selected.id));

      closeRoom();
      return;
    }

    const room = {
      id: Date.now(),
      name: roomForm.name.trim(),
      capacity: cap,
      ac: roomForm.ac,
      beds: [],
    };

    const next = floors.map((f) =>
      f.id === selected.id
        ? {
            ...f,
            roomList: [...(f.roomList || []), room],
          }
        : f,
    );

    setFloors(next);

    setSelected(next.find((f) => f.id === selected.id));

    closeRoom();
  };

  const closeBed = () => {
    setOpenBed(false);
    setBedError("");
    setBedRoom(null);

    setBedForm({
      number: "1",
      type: "Single",
    });
  };

  const openAddBed = (room) => {
    const beds = room.beds || [];
    const cap = Number(room.capacity) || 0;

    let nextNumber = 1;
    let freeFound = false;

    for (let n = 1; n <= cap; n++) {
      const taken = beds.some((b) => String(b.number) === String(n));

      if (!taken) {
        nextNumber = n;
        freeFound = true;
        break;
      }
    }

    setBedRoom(room);

    setBedForm({
      number: String(nextNumber),
      type: "Single",
    });

    setBedError(
      freeFound
        ? ""
        : `Room is full (${cap} beds). Select an existing bed number to change its type.`,
    );

    setOpenBed(true);
  };

  const saveBed = (e) => {
    e.preventDefault();

    if (!current || !bedRoom) return;

    const room = (current.roomList || []).find((r) => r.id === bedRoom.id);

    if (!room) return;

    const beds = room.beds || [];
    const cap = Number(room.capacity) || 0;
    const bedNumber = bedForm.number.trim();

    if (!bedNumber || !bedForm.type) {
      setBedError("Please select bed number and type.");
      return;
    }

    const bedNo = Number(bedNumber);

    if (!Number.isInteger(bedNo) || bedNo < 1 || bedNo > cap) {
      setBedError(`Bed number must be between 1 and ${cap}.`);
      return;
    }

    const existing = beds.find((b) => String(b.number) === String(bedNumber));

    let updatedBeds;

    if (existing) {
      updatedBeds = beds.map((b) =>
        String(b.number) === String(bedNumber)
          ? {
              ...b,
              type: bedForm.type,
            }
          : b,
      );
    } else {
      if (beds.length >= cap) {
        setBedError(`Capacity is ${cap} beds. More beds cannot be added.`);
        return;
      }

      updatedBeds = [
        ...beds,
        {
          id: Date.now(),
          number: bedNumber,
          type: bedForm.type,
          occupied: false,
        },
      ];
    }

    const next = floors.map((f) =>
      f.id === current.id
        ? {
            ...f,
            roomList: f.roomList.map((r) =>
              r.id === room.id
                ? {
                    ...r,
                    beds: updatedBeds,
                  }
                : r,
            ),
          }
        : f,
    );

    setFloors(next);

    setSelected(next.find((f) => f.id === current.id));

    closeBed();
  };

  const closeLeave = () => {
    setOpenLeave(false);
    setLeaveError("");
    setLeaveForm(emptyLeave);
  };

  const saveLeave = (e) => {
    e.preventDefault();

    if (
      !leaveForm.userId.trim() ||
      !leaveForm.name.trim() ||
      !leaveForm.from ||
      !leaveForm.to
    ) {
      setLeaveError("User ID, name and dates are required.");
      return;
    }

    if (leaveForm.to < leaveForm.from) {
      setLeaveError("To Date cannot be before From Date.");
      return;
    }

    setLeaves((prev) => [
      ...prev,
      {
        id: Date.now(),
        userId: leaveForm.userId.trim(),
        name: leaveForm.name.trim(),
        from: leaveForm.from,
        to: leaveForm.to,
        reason: leaveForm.reason.trim(),
        remark: leaveForm.remark.trim(),
        status: "Pending",
      },
    ]);

    closeLeave();
  };

  const setLeaveStatus = (id, status) => {
    setLeaves((prev) => prev.map((l) => (l.id === id ? { ...l, status } : l)));
  };

  const deleteLeave = (id) => {
    setLeaves((prev) => prev.filter((l) => l.id !== id));
  };

  const shownLeaves = leaves.filter((l) => {
    if (leaveFilter.status !== "All" && l.status !== leaveFilter.status) {
      return false;
    }

    if (leaveFilter.start && l.to < leaveFilter.start) {
      return false;
    }

    if (leaveFilter.end && l.from > leaveFilter.end) {
      return false;
    }

    return true;
  });

  const openAddBank = () => {
    setEditBank(null);
    setBankForm(emptyBank);
    setBankError("");
    setOpenBank(true);
  };

  const startEditBank = (bank) => {
    setEditBank(bank);

    setBankForm({
      bankName: bank.bankName || "",
      accountHolder: bank.accountHolder || "",
      accountNumber: bank.accountNumber || "",
      confirmAccount: bank.accountNumber || "",
      ifsc: bank.ifsc || "",
      branch: bank.branch || "",
      upiId: bank.upiId || "",
      remark: bank.remark || "",
    });

    setBankError("");
    setOpenBank(true);
  };

  const closeBank = () => {
    setOpenBank(false);
    setBankError("");
    setEditBank(null);
    setBankForm(emptyBank);
  };

  const saveBank = (e) => {
    e.preventDefault();

    if (
      !bankForm.bankName.trim() ||
      !bankForm.accountHolder.trim() ||
      !bankForm.accountNumber.trim() ||
      !bankForm.ifsc.trim()
    ) {
      setBankError(
        "Bank Name, Account Holder, Account Number and IFSC are required.",
      );
      return;
    }

    if (bankForm.accountNumber.trim() !== bankForm.confirmAccount.trim()) {
      setBankError("Account numbers do not match.");
      return;
    }

    if (!/^\d{6,18}$/.test(bankForm.accountNumber.trim())) {
      setBankError("Please enter a valid account number (6–18 digits).");
      return;
    }

    if (!/^[A-Za-z]{4}0[A-Za-z0-9]{6}$/.test(bankForm.ifsc.trim())) {
      setBankError("Please enter a valid IFSC code (e.g. SBIN0001234).");
      return;
    }

    const data = {
      id: editBank ? editBank.id : Date.now(),
      bankName: bankForm.bankName.trim(),
      accountHolder: bankForm.accountHolder.trim(),
      accountNumber: bankForm.accountNumber.trim(),
      ifsc: bankForm.ifsc.trim().toUpperCase(),
      branch: bankForm.branch.trim(),
      upiId: bankForm.upiId.trim(),
      remark: bankForm.remark.trim(),
      addedAt: editBank ? editBank.addedAt : new Date().toISOString(),
    };

    const next = editBank
      ? banks.map((b) => (b.id === editBank.id ? data : b))
      : [...banks, data];

    localStorage.setItem(BANKS_KEY, JSON.stringify(next));

    setBanks(next);

    closeBank();

    window.dispatchEvent(new Event("hostel-data-updated"));
  };

  const deleteBank = (id) => {
    const next = banks.filter((b) => b.id !== id);

    localStorage.setItem(BANKS_KEY, JSON.stringify(next));

    setBanks(next);

    window.dispatchEvent(new Event("hostel-data-updated"));
  };

  const addRule = () => {
    const text = ruleText.trim();

    if (!text) {
      alert("Please type a rule first.");
      return;
    }

    const next = [
      ...rules,
      {
        id: Date.now(),
        text,
      },
    ];

    setRules(next);
    localStorage.setItem(RULES_KEY, JSON.stringify(next));
    setRuleText("");
  };

  const deleteRule = (id) => {
    const next = rules.filter((r) => r.id !== id);

    setRules(next);
    localStorage.setItem(RULES_KEY, JSON.stringify(next));
  };

  return (
    <div className="as-page">
      <aside className="as-rail">
        <button
          type="button"
          className={section === "rooms" ? "as-rail-btn on" : "as-rail-btn"}
          onClick={() => setSection("rooms")}
        >
          <span className="as-ico">
            <FaBed />
          </span>

          <span className="as-rail-text">Rooms</span>
        </button>

        <button
          type="button"
          className={section === "leave" ? "as-rail-btn on" : "as-rail-btn"}
          onClick={() => setSection("leave")}
        >
          <span className="as-ico">
            <FaCalendarAlt />
          </span>

          <span className="as-rail-text">Leave</span>
        </button>

        <button
          type="button"
          className={section === "bank" ? "as-rail-btn on" : "as-rail-btn"}
          onClick={() => setSection("bank")}
        >
          <span className="as-ico">
            <FaUniversity />
          </span>

          <span className="as-rail-text">Bank</span>
        </button>

        <button
          type="button"
          className={section === "rules" ? "as-rail-btn on" : "as-rail-btn"}
          onClick={() => setSection("rules")}
        >
          <span className="as-ico">
            <FaGavel />
          </span>

          <span className="as-rail-text">Rules</span>
        </button>
      </aside>

      <section className="as-main">
        {section === "rooms" && !current && (
          <>
            <div className="as-top">
              <button
                type="button"
                className="as-add-btn"
                onClick={() => setOpenFloor(true)}
              >
                Add Hostel
              </button>
            </div>

            <div className="as-board">
              <div className="as-grid">
                {floors.map((f) => (
                  <div
                    key={f.id}
                    className="as-card as-card-btn"
                    onClick={() => setSelected(f)}
                  >
                    <div className="as-card-actions">
                      <button
                        type="button"
                        className="as-ico-btn edit"
                        onClick={(e) => {
                          e.stopPropagation();
                          openEditFloor(f);
                        }}
                      >
                        <FaPen />
                      </button>

                      <button
                        type="button"
                        className="as-ico-btn del"
                        onClick={(e) => {
                          e.stopPropagation();
                          deleteFloor(f);
                        }}
                      >
                        <FaTrashAlt />
                      </button>
                    </div>

                    <div className="as-card-name">{f.building}</div>

                    <div className="as-card-floor">{f.floor}</div>

                    <div className="as-card-meta">
                      <FaBed />
                      {bedsRemaining(f)} beds remaining
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </>
        )}

        {section === "rooms" && current && (
          <>
            <div className="as-top">
              <button
                type="button"
                className="as-add-btn"
                onClick={() => setOpenRoom(true)}
              >
                Add Room
              </button>
            </div>

            <div className="as-board">
              <div className="as-floor-no">{current.floor}</div>

              <div className="as-grid">
                {(current.roomList || []).map((r) => {
                  const added = r.beds || [];
                  const cap = Number(r.capacity) || 0;

                  const slots = Array.from(
                    { length: cap },
                    (_, i) =>
                      added.find((b) => String(b.number) === String(i + 1)) ||
                      null,
                  );

                  const occupiedCount = slots.filter(
                    (b) => b && isBedOccupied(b, r, current),
                  ).length;

                  const availableCount = cap - occupiedCount;

                  return (
                    <div
                      key={r.id}
                      className={r.ac === "ac" ? "as-room ac" : "as-room nonac"}
                    >
                      <div className="as-room-actions">
                        <button
                          type="button"
                          className="as-ico-btn edit"
                          onClick={() => startEditRoom(r)}
                        >
                          <FaPen />
                        </button>

                        <button
                          type="button"
                          className="as-ico-btn del"
                          onClick={() => deleteRoom(r)}
                        >
                          <FaTrashAlt />
                        </button>
                      </div>

                      <div className="as-room-name">{r.name}</div>

                      <div className="as-beds">
                        {slots.map((b, i) => {
                          const occupied = b && isBedOccupied(b, r, current);

                          return (
                            <span
                              key={b ? b.id : `empty-${i}`}
                              className={
                                occupied ? "as-bed occupied" : "as-bed left"
                              }
                              title={
                                occupied
                                  ? `Occupied - ${b?.type || "Bed"} #${
                                      b?.number || i + 1
                                    }`
                                  : b
                                    ? `Available - ${b.type} #${b.number}`
                                    : "Remaining Bed"
                              }
                            >
                              <BedIcon double={b && b.type === "Double"} />
                            </span>
                          );
                        })}
                      </div>

                      <button
                        type="button"
                        className="as-plus"
                        onClick={() => openAddBed(r)}
                      >
                        +
                      </button>

                      <div className="as-room-cap">
                        Capacity: {r.capacity} Beds
                      </div>

                      <div className="as-room-occupancy">
                        <span className="occupied-text">
                          {occupiedCount} Occupied
                        </span>

                        <span className="available-text">
                          {availableCount} Available
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>

              <div className="as-legend">
                <span>
                  <i className="lg ac" />
                  AC Rooms
                </span>

                <span>
                  <i className="lg nonac" />
                  Non-AC Rooms
                </span>

                <span className="as-leg-bed occupied">
                  <FaBed />
                  Occupied Beds
                </span>

                <span className="as-leg-bed left">
                  <FaBed />
                  Available Beds
                </span>
              </div>

              <div className="as-back-wrap">
                <button
                  type="button"
                  className="as-add-btn"
                  onClick={() => setSelected(null)}
                >
                  Back to Floors
                </button>
              </div>
            </div>
          </>
        )}

        {section === "leave" && (
          <div className="as-leave">
            <div className="as-top">
              <button
                type="button"
                className="as-add-btn"
                onClick={() => setOpenLeave(true)}
              >
                Add Leave
              </button>
            </div>

            <div className="as-leave-bar">
              <label className="as-leave-field">
                <span>Status</span>

                <select
                  value={leaveFilter.status}
                  onChange={(e) =>
                    setLeaveFilter({
                      ...leaveFilter,
                      status: e.target.value,
                    })
                  }
                >
                  <option>All</option>
                  <option>Pending</option>
                  <option>Approved</option>
                  <option>Rejected</option>
                </select>
              </label>

              <label className="as-leave-field">
                <span>Start Date</span>

                <input
                  type="date"
                  value={leaveFilter.start}
                  onChange={(e) =>
                    setLeaveFilter({
                      ...leaveFilter,
                      start: e.target.value,
                    })
                  }
                />
              </label>

              <label className="as-leave-field">
                <span>End Date</span>

                <input
                  type="date"
                  value={leaveFilter.end}
                  onChange={(e) =>
                    setLeaveFilter({
                      ...leaveFilter,
                      end: e.target.value,
                    })
                  }
                />
              </label>
            </div>

            <div className="as-leave-stats">
              <div className="as-leave-pill">
                <span>Leave</span>
                <strong>{leaves.length}</strong>
              </div>

              <div className="as-leave-pill ok">
                <span>Approved</span>
                <strong>
                  {leaves.filter((l) => l.status === "Approved").length}
                </strong>
              </div>

              <div className="as-leave-pill no">
                <span>Rejected</span>
                <strong>
                  {leaves.filter((l) => l.status === "Rejected").length}
                </strong>
              </div>

              <div className="as-leave-pill wait">
                <span>Pending</span>
                <strong>
                  {leaves.filter((l) => l.status === "Pending").length}
                </strong>
              </div>
            </div>

            <div className="as-leave-table-wrap">
              <table className="as-leave-table">
                <thead>
                  <tr>
                    <th>User ID</th>
                    <th>Student Name</th>
                    <th>From Date</th>
                    <th>To Date</th>
                    <th>Reason</th>
                    <th>Remark</th>
                    <th>Status</th>
                    <th>Action</th>
                  </tr>
                </thead>

                <tbody>
                  {shownLeaves.length === 0 ? (
                    <tr>
                      <td colSpan={8} className="as-leave-empty">
                        No Records Found!
                      </td>
                    </tr>
                  ) : (
                    shownLeaves.map((l) => (
                      <tr key={l.id}>
                        <td>{l.userId}</td>
                        <td>{l.name}</td>
                        <td>{l.from}</td>
                        <td>{l.to}</td>
                        <td>{l.reason || "—"}</td>
                        <td>{l.remark || "—"}</td>

                        <td>
                          <span
                            className={`as-badge ${l.status.toLowerCase()}`}
                          >
                            {l.status}
                          </span>
                        </td>

                        <td>
                          <div className="as-leave-acts">
                            {l.status === "Pending" && (
                              <>
                                <button
                                  type="button"
                                  className="as-act ok"
                                  onClick={() =>
                                    setLeaveStatus(l.id, "Approved")
                                  }
                                >
                                  Approve
                                </button>

                                <button
                                  type="button"
                                  className="as-act no"
                                  onClick={() =>
                                    setLeaveStatus(l.id, "Rejected")
                                  }
                                >
                                  Reject
                                </button>
                              </>
                            )}

                            <button
                              type="button"
                              className="as-act del"
                              onClick={() => deleteLeave(l.id)}
                            >
                              Delete
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

        {section === "bank" && (
          <div className="as-leave">
            <div className="as-top">
              <button
                type="button"
                className="as-add-btn"
                onClick={openAddBank}
              >
                Add Bank
              </button>
            </div>

            <div className="as-bank-grid">
              {banks.length === 0 ? (
                <div className="as-bank-empty">
                  No banks added yet. Click "Add Bank" to add hostel bank
                  details.
                </div>
              ) : (
                banks.map((b) => (
                  <div key={b.id} className="as-bank-card">
                    <div className="as-bank-actions">
                      <button
                        type="button"
                        className="as-ico-btn edit"
                        onClick={() => startEditBank(b)}
                      >
                        <FaPen />
                      </button>

                      <button
                        type="button"
                        className="as-ico-btn del"
                        onClick={() => deleteBank(b.id)}
                      >
                        <FaTrashAlt />
                      </button>
                    </div>

                    <div className="as-bank-name">{b.bankName}</div>

                    <div className="as-bank-row">
                      <span>Account Holder</span>
                      <b>{b.accountHolder}</b>
                    </div>

                    <div className="as-bank-row">
                      <span>Account No</span>
                      <b>{b.accountNumber}</b>
                    </div>

                    <div className="as-bank-row">
                      <span>IFSC</span>
                      <b>{b.ifsc}</b>
                    </div>

                    {b.branch && (
                      <div className="as-bank-row">
                        <span>Branch</span>
                        <b>{b.branch}</b>
                      </div>
                    )}

                    {b.upiId && (
                      <div className="as-bank-row">
                        <span>UPI ID</span>
                        <b>{b.upiId}</b>
                      </div>
                    )}

                    {b.remark && (
                      <div className="as-bank-row">
                        <span>Remark</span>
                        <b>{b.remark}</b>
                      </div>
                    )}
                  </div>
                ))
              )}
            </div>
          </div>
        )}

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
                <div className="as-bank-empty">
                  No rules added yet. Type a rule above and click "Add Rule".
                </div>
              ) : (
                rules.map((r, i) => (
                  <div key={r.id} className="as-rule-item">
                    <span className="as-rule-no">{i + 1}.</span>

                    <span className="as-rule-text">{r.text}</span>

                    <button
                      type="button"
                      className="as-ico-btn del"
                      onClick={() => deleteRule(r.id)}
                      title="Delete Rule"
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

      {openFloor && (
        <div className="as-overlay" onClick={closeFloor}>
          <form
            className="as-modal as-modal-sm"
            onClick={(e) => e.stopPropagation()}
            onSubmit={saveFloor}
          >
            <div className="as-modal-title">
              {editFloor ? "Edit Hostel" : "Add Hostel"}
            </div>

            <div className="as-modal-grid">
              <input
                className="as-input"
                placeholder="Building Name"
                value={floorForm.building}
                onChange={(e) =>
                  setFloorForm({
                    ...floorForm,
                    building: e.target.value,
                  })
                }
              />

              <input
                className="as-input"
                placeholder="Floor Name"
                value={floorForm.floor}
                onChange={(e) =>
                  setFloorForm({
                    ...floorForm,
                    floor: e.target.value,
                  })
                }
              />

              <textarea
                className="as-input as-span2 as-textarea"
                rows="2"
                placeholder="Building Address"
                value={floorForm.address}
                onChange={(e) =>
                  setFloorForm({
                    ...floorForm,
                    address: e.target.value,
                  })
                }
              />

              <input
                className="as-input as-span2"
                type="number"
                min="1"
                placeholder="Total Rooms"
                value={floorForm.rooms}
                onChange={(e) =>
                  setFloorForm({
                    ...floorForm,
                    rooms: e.target.value,
                  })
                }
              />

              <div className="as-modal-actions">
                <button type="submit" className="as-save">
                  Save
                </button>

                <button
                  type="button"
                  className="as-cancel"
                  onClick={closeFloor}
                >
                  Cancel
                </button>
              </div>
            </div>
          </form>
        </div>
      )}

      {openRoom && (
        <div className="as-overlay" onClick={closeRoom}>
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
                placeholder="Room Name (e.g. Room 103)"
                value={roomForm.name}
                onChange={(e) =>
                  setRoomForm({
                    ...roomForm,
                    name: e.target.value,
                  })
                }
              />

              <input
                className="as-input"
                type="number"
                min="1"
                placeholder="Capacity (Beds)"
                value={roomForm.capacity}
                onChange={(e) =>
                  setRoomForm({
                    ...roomForm,
                    capacity: e.target.value,
                  })
                }
              />

              <select
                className="as-input as-span2"
                value={roomForm.ac}
                onChange={(e) =>
                  setRoomForm({
                    ...roomForm,
                    ac: e.target.value,
                  })
                }
              >
                <option value="ac">AC Room</option>

                <option value="nonac">Non-AC Room</option>
              </select>

              <div className="as-modal-actions">
                <button type="submit" className="as-save">
                  Save
                </button>

                <button type="button" className="as-cancel" onClick={closeRoom}>
                  Cancel
                </button>
              </div>
            </div>
          </form>
        </div>
      )}

      {openLeave && (
        <div className="as-overlay" onClick={closeLeave}>
          <form
            className="as-modal as-modal-sm"
            onClick={(e) => e.stopPropagation()}
            onSubmit={saveLeave}
          >
            <div className="as-modal-title">Add Leave</div>

            <div className="as-modal-grid">
              <input
                className="as-input"
                placeholder="User ID"
                value={leaveForm.userId}
                onChange={(e) =>
                  setLeaveForm({
                    ...leaveForm,
                    userId: e.target.value,
                  })
                }
              />

              <input
                className="as-input"
                placeholder="Student Name"
                value={leaveForm.name}
                onChange={(e) =>
                  setLeaveForm({
                    ...leaveForm,
                    name: e.target.value,
                  })
                }
              />

              <div>
                <label className="as-lab">From Date</label>

                <input
                  className="as-input"
                  type="date"
                  value={leaveForm.from}
                  onChange={(e) =>
                    setLeaveForm({
                      ...leaveForm,
                      from: e.target.value,
                    })
                  }
                />
              </div>

              <div>
                <label className="as-lab">To Date</label>

                <input
                  className="as-input"
                  type="date"
                  value={leaveForm.to}
                  onChange={(e) =>
                    setLeaveForm({
                      ...leaveForm,
                      to: e.target.value,
                    })
                  }
                />
              </div>

              <input
                className="as-input"
                placeholder="Reason"
                value={leaveForm.reason}
                onChange={(e) =>
                  setLeaveForm({
                    ...leaveForm,
                    reason: e.target.value,
                  })
                }
              />

              <input
                className="as-input"
                placeholder="Remark"
                value={leaveForm.remark}
                onChange={(e) =>
                  setLeaveForm({
                    ...leaveForm,
                    remark: e.target.value,
                  })
                }
              />

              {leaveError && <div className="as-error">{leaveError}</div>}

              <div className="as-modal-actions">
                <button type="submit" className="as-save">
                  Save
                </button>

                <button
                  type="button"
                  className="as-cancel"
                  onClick={closeLeave}
                >
                  Cancel
                </button>
              </div>
            </div>
          </form>
        </div>
      )}

      {openBed && (
        <div className="as-overlay" onClick={closeBed}>
          <form
            className="as-modal as-modal-sm"
            onClick={(e) => e.stopPropagation()}
            onSubmit={saveBed}
          >
            <div className="as-modal-title">Add Bed</div>

            <div className="as-modal-grid">
              <div>
                <label className="as-lab">Bed Number</label>

                <input
                  className="as-input"
                  value={bedForm.number}
                  onChange={(e) =>
                    setBedForm({
                      ...bedForm,
                      number: e.target.value,
                    })
                  }
                />
              </div>

              <div>
                <label className="as-lab">Bed Type</label>

                <select
                  className="as-input"
                  value={bedForm.type}
                  onChange={(e) =>
                    setBedForm({
                      ...bedForm,
                      type: e.target.value,
                    })
                  }
                >
                  <option value="">Bed Type</option>

                  <option value="Single">Single</option>

                  <option value="Double">Double</option>
                </select>
              </div>

              {bedError && <div className="as-error">{bedError}</div>}

              <div className="as-modal-actions">
                <button type="submit" className="as-save">
                  Save
                </button>

                <button type="button" className="as-cancel" onClick={closeBed}>
                  Cancel
                </button>
              </div>
            </div>
          </form>
        </div>
      )}

      {openBank && (
        <div className="as-overlay" onClick={closeBank}>
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
                placeholder="Bank Name (e.g. State Bank of India)"
                value={bankForm.bankName}
                onChange={(e) =>
                  setBankForm({
                    ...bankForm,
                    bankName: e.target.value,
                  })
                }
              />

              <input
                className="as-input"
                placeholder="Account Holder Name"
                value={bankForm.accountHolder}
                onChange={(e) =>
                  setBankForm({
                    ...bankForm,
                    accountHolder: e.target.value,
                  })
                }
              />

              <input
                className="as-input"
                placeholder="Account Number"
                value={bankForm.accountNumber}
                onChange={(e) =>
                  setBankForm({
                    ...bankForm,
                    accountNumber: e.target.value,
                  })
                }
              />

              <input
                className="as-input"
                placeholder="Confirm Account Number"
                value={bankForm.confirmAccount}
                onChange={(e) =>
                  setBankForm({
                    ...bankForm,
                    confirmAccount: e.target.value,
                  })
                }
              />

              <input
                className="as-input"
                placeholder="IFSC Code (e.g. SBIN0001234)"
                value={bankForm.ifsc}
                onChange={(e) =>
                  setBankForm({
                    ...bankForm,
                    ifsc: e.target.value,
                  })
                }
              />

              <input
                className="as-input"
                placeholder="Branch"
                value={bankForm.branch}
                onChange={(e) =>
                  setBankForm({
                    ...bankForm,
                    branch: e.target.value,
                  })
                }
              />

              <input
                className="as-input"
                placeholder="UPI ID (optional)"
                value={bankForm.upiId}
                onChange={(e) =>
                  setBankForm({
                    ...bankForm,
                    upiId: e.target.value,
                  })
                }
              />

              <input
                className="as-input"
                placeholder="Remark (optional)"
                value={bankForm.remark}
                onChange={(e) =>
                  setBankForm({
                    ...bankForm,
                    remark: e.target.value,
                  })
                }
              />

              {bankError && <div className="as-error">{bankError}</div>}

              <div className="as-modal-actions">
                <button type="submit" className="as-save">
                  Save
                </button>

                <button type="button" className="as-cancel" onClick={closeBank}>
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
