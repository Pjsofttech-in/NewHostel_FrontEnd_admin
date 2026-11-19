import { api } from "./api.js";

/* ================== HOSTEL BUILDING ================== */

export const createBuilding = (data, role, email) =>
  api.post("/hostelBuilding/create", data, { role, email });

export const getBuildingById = (id, role, email) =>
  api.get(`/hostelBuilding/${id}`, { role, email });

export const getAllBuildings = (branchCode, role, email) =>
  api.get("/hostelBuilding/all", { branchCode, role, email });

export const updateBuilding = (id, data, role, email) =>
  api.put(`/hostelBuilding/update/${id}`, data, { role, email });

export const deleteBuilding = (id, role, email) =>
  api.delete(`/hostelBuilding/delete/${id}`, { role, email });


/* ================== FLOOR ================== */

export const createFloor = (buildingId, floorData, role, email) =>
  api.post("/createFloor", floorData, { role, email, buildingId });

export const updateFloor = (id, buildingId, floorData, role, email) =>
  api.put(`/updateFloor/${id}/${buildingId}`, floorData, { role, email });

export const getAllFloors = (buildingId, role, email) =>
  api.get(`/getAllFloor/${buildingId}`, { role, email });

export const getFloorById = (id, role, email) =>
  api.get(`/getFloorById/${id}`, { role, email });

export const deleteFloor = (id, role, email) =>
  api.delete(`/deleteFloor/${id}`, { role, email });


/* ================== ROOM ================== */

export const createRoom = (floorId, roomData, role, email) =>
  api.post("/createRoom", roomData, { role, email, floorId });

export const updateRoom = (id, roomData, role, email) =>
  api.put(`/updateRoom/${id}`, roomData, { role, email });

export const getRoomsByFloor = (floorId, role, email) =>
  api.get(`/getRoomsByFloor/${floorId}`, { role, email });

export const getRoomById = (id, role, email) =>
  api.get(`/getRoomById/${id}`, { role, email });

export const deleteRoom = (id, role, email) =>
  api.delete(`/deleteRoomById/${id}`, { role, email });


/* ================== BED ================== */

export const createBed = (roomId, bedData, role, email) =>
  api.post("/createBed", bedData, { role, email, roomId });

export const updateBed = (id, bedData, role, email) =>
  api.put(`/updateBed/${id}`, bedData, { role, email });

export const getAllBeds = (role, email) =>
  api.get("/getAllBed", { role, email });

export const getBedById = (id, role, email) =>
  api.get(`/getBedById/${id}`, { role, email });

export const getBedsByRoom = (roomId, role, email) =>
  api.get("/getBedsByRoom", { roomId, role, email });

export const deleteBed = (id, role, email) =>
  api.delete(`/deleteBedById/${id}`, { role, email });


/* ================== SOURCE ================== */

export const createSource = (sourceData, role, email) =>
  api.post("/createSource", sourceData, { role, email });

export const updateSource = (id, sourceData, role, email) =>
  api.put(`/updateSource/${id}`, sourceData, { role, email });

export const getAllSources = (role, email) =>
  api.get("/getAllSource", { role, email });

export const getSourceById = (id, role, email) =>
  api.get(`/getSourceById/${id}`, { role, email });

export const deleteSource = (id, role, email) =>
  api.delete(`/deleteSource/${id}`, { role, email });