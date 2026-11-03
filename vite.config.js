import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import federation from "@originjs/vite-plugin-federation";

export default defineConfig({
  base: "/layringhosteladmin/",

  plugins: [
    react(),
    federation({
      name: "hostelAdmin",

      // ── All components the superadmin host can import ──────────────────────
      exposes: {
        // Layout shells (contain <Outlet>)
        "./HostelInquieySetting": "./src/remotes/HostelInquieySetting.jsx",
        "./AdmissionsTabs": "./src/remotes/AdmissionsTabs.jsx",
        "./DynamicWebsite": "./src/remotes/DynamicWebsite.jsx",

        // Inquiry leaves
        "./InquiryReportDashboard": "./src/remotes/InquiryReportDashboard.jsx",
        "./HostelEnquiry": "./src/remotes/HostelEnquiry.jsx",
        "./InquiryReport": "./src/remotes/InquiryReport.jsx",

        // Admission leaves
        "./AdmissionFormDashboard": "./src/remotes/AdmissionFormDashboard.jsx",
        "./AdmissionForm": "./src/remotes/AdmissionForm.jsx",
        "./AdmissionReport": "./src/remotes/AdmissionReport.jsx",
        "./RegistrationForm": "./src/remotes/RegistrationForm.jsx",
        "./UsersList": "./src/remotes/UsersList.jsx",
        "./DisplayAdmissionFormDetails": "./src/remotes/DisplayAdmissionFormDetails.jsx",
        "./AdmissionSettings": "./src/remotes/AdmissionSettings.jsx",

        // Website leaves
        "./WebsiteUrl": "./src/remotes/WebsiteUrl.jsx",
        "./Slidebar": "./src/remotes/Slidebar.jsx",
        "./Footer": "./src/remotes/Footer.jsx",
        "./WebsiteSettings": "./src/remotes/WebsiteSettings.jsx",


        "./HostelDashboard": "./src/pages/Dashboard/Dashboard.jsx",



      },

      // ── Shared with the host (must match host's shared config) ─────────────
      shared: {
        react: {
          singleton: true,
          eager: true,
          requiredVersion: "^18.2.0",
        },
        "react-dom": {
          singleton: true,
          eager: true,
          requiredVersion: "^18.2.0",
        },
        "react-router-dom": {
          singleton: true,
          eager: true,
          requiredVersion: "^6.22.3",
        },
      },
    }),
  ],

  server: {
    port: 5014,
    cors: true,
  },

  preview: {
    port: 5014,
    cors: true,
  },

  build: {
    modulePreload: false,
    target: "esnext",
    minify: false,
    cssCodeSplit: false,
  },
});
