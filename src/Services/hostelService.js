// =====================================================
//  Hostel Infrastructure Services
//  Floor / Room / Bed / Source
// =====================================================

import { api } from "./api.js";

/* ================== FLOOR ================== */

export async function createFloor(floorData) {
  return api.post("/createFloor", floorData);
}

export async function updateFloor(id, floorData) {
  return api.put(`/updateFloor/${id}`, floorData);
}

export async function getAllFloors() {
  return api.get("/getAllFloor");
}

export async function getFloorById(id) {
  return api.get(`/getFloorById/${id}`);
}

export async function deleteFloor(id) {
  return api.delete(`/deleteFloor/${id}`);
}

/* ================== ROOM ================== */

export async function createRoom(floorId, roomData) {
  return api.post("/createRoom", roomData, { floorId });
}

export async function updateRoom(id, roomData) {
  return api.put(`/updateRoom/${id}`, roomData);
}

export async function getRoomsByFloor(floorId) {
  return api.get(`/getRoomsByFloor/${floorId}`);
}

export async function getRoomById(id) {
  return api.get(`/getRoomById/${id}`);
}

export async function deleteRoom(id) {
  return api.delete(`/deleteRoomById/${id}`);
}

/* ================== BED ================== */

export async function createBed(bedData) {
  return api.post("/createBed", bedData);
}

export async function updateBed(id, bedData) {
  return api.put(`/updateBed/${id}`, bedData);
}

export async function getAllBeds() {
  return api.get("/getAllBed");
}

export async function getBedById(id) {
  return api.get(`/getBedById/${id}`);
}

export async function getBedsByRoom(roomId) {
  return api.get("/getBedsByRoom", { roomId });
}

export async function deleteBed(id) {
  return api.delete(`/deleteBedById/${id}`);
}

/* ================== SOURCE ================== */

export async function createSource(sourceData) {
  return api.post("/createSource", sourceData);
}

export async function updateSource(id, sourceData) {
  return api.put(`/updateSource/${id}`, sourceData);
}

export async function getAllSources() {
  return api.get("/getAllSource");
}

export async function getSourceById(id) {
  return api.get(`/getSourceById/${id}`);
}

export async function deleteSource(id) {
  return api.delete(`/deleteSource/${id}`);
}
