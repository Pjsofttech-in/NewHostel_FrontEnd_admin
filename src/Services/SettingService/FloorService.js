import axiosInstance from '../../Components/Common/axiosConfig';

export const createFloor = async (floorData, role, email) => {
  try {
    const response = await axiosInstance.post(
      '/createFloor',
      floorData,
      {
        params: { role, email },
        headers: {
          'Content-Type': 'application/json'
        }
      }
    );
    return response.data;
  } catch (error) {
    console.error('Error creating floor:', error);
    if (error.response) {
      throw error.response.data;
    }
    throw error;
  }
};

export const getAllFloors = async (role, email, branchCode) => {
  try {
    const params = { role };
    
    // Only add email and branchCode if they exist
    if (email) params.email = email;
    if (branchCode) params.branchCode = branchCode;
    
    const response = await axiosInstance.get(
      '/getAllFloors',
      { params }
    );
    return response.data;
  } catch (error) {
    console.error('Error fetching floors:', error);
    if (error.response) {
      throw error.response.data;
    }
    throw error;
  }
};

export const updateFloor = async (id, floorData, role, email) => {
  try {
    const response = await axiosInstance.put(
      `/updateFloor/${id}`,
      floorData,
      {
        params: { role, email },
        headers: {
          'Content-Type': 'application/json'
        }
      }
    );
    return response.data;
  } catch (error) {
    console.error('Error updating floor:', error);
    if (error.response) {
      throw error.response.data;
    }
    throw error;
  }
};

export const deleteFloor = async (id, role, email) => {
  try {
    const response = await axiosInstance.delete(
      `/deleteFloor/${id}`,
      {
        params: { role, email }
      }
    );
    return response.data;
  } catch (error) {
    console.error('Error deleting floor:', error);
    // Return the error response data if available
    if (error.response) {
      throw error.response.data;
    }
    throw error;
  }
};
   