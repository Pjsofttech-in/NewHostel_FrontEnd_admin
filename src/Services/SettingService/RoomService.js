import axiosInstance from "../../Components/Common/axiosConfig";



export const createRoom = async (room, role, email, floorId) => {
  const res = await axiosInstance.post(
    `/createRoom?role=${role}&email=${email}&floorId=${floorId}`,
    room
  );
  return res.data;
};

export const getRoomsByFloor = async (floorId, role, email) => {
  const res = await axiosInstance.get(
    `/getRoomsByFloor/${floorId}?role=${role}&email=${email}`
  );
  return res.data;
};

export const updateRoom = async (id, room, role, email) => {
  const res = await axiosInstance.put(
    `/updateRoom/${id}?role=${role}&email=${email}`,
    room
  );
  return res.data;
};

export const deleteRoom = async (id, role, email) => {
  const res = await axiosInstance.delete(
    `/deleteRoom/${id}?role=${role}&email=${email}`
  );
  return res.data;
};
