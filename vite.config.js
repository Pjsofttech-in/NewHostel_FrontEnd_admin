import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import federation from '@originjs/vite-plugin-federation';

export default defineConfig({
  // base:'/layringhosteladmin/',
  plugins: [
    react(),
    federation({
      name: "Hostel Admin",
      filename: "remoteEntry.js",
      exposes: {
        "./hostelAdminSidebar": "./src/App.jsx",
        "./HostelInquieySetting": "./src/Components/HostelInquieySetting.jsx",
        "./InquiryReportDashboard": "./src/Components/Enquiries/InquiryReportDashboard.jsx",
        "./HostelEnquiry": "./src/Components/Enquiries/InquiryForm/HostelEnquiry.jsx",
        "./InquiryReport": "./src/Components/Enquiries/InquiryReport.jsx",
        "./AdmissionsTabs": "./src/Components/AdmissionsTabs.jsx",
        "./AdmissionFormDashboard": "./src/Components/Admissions/AdmissionFormDashboard.jsx",
        "./AdmissionForm": "./src/Components/Admissions/AdmissionForm.jsx",
        "./AdmissionReport": "./src/Components/Admissions/AdmissionReport.jsx",
        "./RegistrationForm": "./src/Components/Users/RegistrationForm/RegistrationForm.jsx",
        "./UsersList": "./src/Components/Users/UsersList/UsersList.jsx",
        "./AdmissionSettings": "./src/Components/AdmissionSettings.jsx",
        "./DynamicWebsite": "./src/Components/DynamicWebsite/DynamicWebsite.jsx",
        "./WebsiteUrl": "./src/Components/DynamicWebsite/WebsiteUrl.jsx",
        "./Slidebar": "./src/Components/DynamicWebsite/Slidebar/Slidebar.jsx",
        "./Footer": "./src/Components/DynamicWebsite/Footer/Footer.jsx",
        "./WebsiteSettings": "./src/Components/DynamicWebsite/WebsiteSettings.jsx",
        "./DisplayAdmissionFormDetails": "./src/Components/Users/UsersList/DisplayAdmissionFormDetails.jsx",
      },
      shared: {
        react: { singleton: true, eager: true, requiredVersion: "^18.2.0" },
        "react-dom": { singleton: true, eager: true, requiredVersion: "^18.2.0" },
        "react-router-dom": { singleton: true, eager: true, requiredVersion: "^6.22.3" },
        "@mui/material": { singleton: true, eager: false, requiredVersion: "^5.15.13" }, // lazy-load MUI
        "@mui/icons-material": { singleton: true, eager: false, requiredVersion: "^5.15.13" },
        "@emotion/react": { singleton: true, eager: false, requiredVersion: "^11.11.1" },
        "@emotion/styled": { singleton: true, eager: false, requiredVersion: "^11.11.0" },
        antd: { singleton: true, eager: false, requiredVersion: "^5.24.7" }, // lazy-load AntD
        axios: { singleton: true, eager: false },
        sweetalert2: { singleton: true, eager: false },
      },
    }),
  ],
  build: {
    modulePreload: true,
    target: "esnext",
    minify: "esbuild",
    cssCodeSplit: true,
    sourcemap: false,
    rollupOptions: {
      output: {
        manualChunks: {
          react: ["react", "react-dom"],
          mui: ["@mui/material", "@mui/icons-material", "@emotion/react", "@emotion/styled"],
          antd: ["antd"],
        },
      },
    },
  },
  server: {
    port: 5001,
    strictPort: true,
  },
});
