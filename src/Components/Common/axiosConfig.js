import axios from "axios";
import Swal from "sweetalert2";

const axiosInstance = axios.create({
  baseURL: "http://localhost:8110", // your base URL
});

// Request Interceptor: attach token
axiosInstance.interceptors.request.use(
  (config) => {
    const token = sessionStorage.getItem("authToken") || "eyJhbGciOiJIUzI1NiJ9.eyJzdWIiOiJzdGFmZkBnbWFpbC5jb20iLCJpYXQiOjE3NjE4MTI5NjQsImV4cCI6MTc2MTgxNjU2NH0.fiQimO7131bnbERjbXCyjqjTATwBc9cS6b-ojR3iOt0";
    console.log("Token before request:", token);
    if (token) {
      config.headers["Authorization"] = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response Interceptor: handle expired token
axiosInstance.interceptors.response.use(
  (response) => response,
  (error) => {
    const originalRequest = error.config;

    if (error.response && error.response.status === 401) {
      // Token expired or unauthorized
      Swal.fire({
        icon: "warning",
        title: "Session Expired",
        text: "Please login again.",
        confirmButtonColor: "#3085d6",
      }).then(() => {
        sessionStorage.clear(); // Clear token and other session data
        window.location.href = "/superadminclient/"; // Navigate to login
      });
    }

    return Promise.reject(error);
  }
);

export default axiosInstance;
