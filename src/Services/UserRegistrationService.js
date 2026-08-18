import axiosInstance from "../Components/Common/axiosConfig";

const UserRegistrationService = {
  /**
   * Save all user registration details with file uploads
   * @param {Object} formData - Form data object
   * @param {File} studentPhoto - Student photo file
   * @param {File} applicantAddressProof - Applicant address proof file
   * @param {File} parentAddressProof - Parent address proof file
   * @param {File} applicantSignature - Applicant signature file
   * @param {File} parentSignature - Parent signature file
   * @param {String} role - User role
   * @param {String} email - Created by email
   * @returns {Promise} API response
   */
  saveAllDetails: async (
    formData,
    studentPhoto,
    applicantAddressProof,
    parentAddressProof,
    applicantSignature,
    parentSignature,
    role,
    email
  ) => {
    try {
      const multipartData = new FormData();

      // Add JSON data as string
      multipartData.append("data", JSON.stringify(formData));

      // Add role and email as request params
      multipartData.append("role", role);
      multipartData.append("email", email);

      // Add files if they exist
      if (studentPhoto) {
        multipartData.append("studentPhoto", studentPhoto);
      }
      if (applicantAddressProof) {
        multipartData.append("applicantAddressProof", applicantAddressProof);
      }
      if (parentAddressProof) {
        multipartData.append("parentAddressProof", parentAddressProof);
      }
      if (applicantSignature) {
        multipartData.append("applicantSignature", applicantSignature);
      }
      if (parentSignature) {
        multipartData.append("parentSignature", parentSignature);
      }

      const response = await axiosInstance.post(
        "/saveAllDetails",
        multipartData,
        {
          headers: {
            "Content-Type": "multipart/form-data",
          },
        }
      );

      return response.data;
    } catch (error) {
      console.error("Error saving user registration:", error);
      throw error;
    }
  },
};

export default UserRegistrationService;
