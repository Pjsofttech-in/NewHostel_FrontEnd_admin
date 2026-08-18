import axiosInstance from "../../Components/Common/axiosConfig";

export const createBed = async (bed, role, email, roomId) => {
  const res = await axiosInstance.post(
    `/createBed?role=${role}&email=${email}&roomId=${roomId}`,
    bed
  );
  return res.data;
};

export const getBedsByRoom = async (roomId, role, email) => {
  const res = await axiosInstance.get(
    `/getBedsByRoom/${roomId}?role=${role}&email=${email}`
  );
  return res.data;
};

export const updateBed = async (id, bed, role, email) => {
  const res = await axiosInstance.put(
    `/updateBed/${id}?role=${role}&email=${email}`,
    bed
  );
  return res.data;
};

export const deleteBed = async (id, role, email) => {
  const res = await axiosInstance.delete(
    `/deleteBed/${id}?role=${role}&email=${email}`
  );
  return res.data;
};
