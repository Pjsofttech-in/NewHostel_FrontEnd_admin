import React, { useEffect, useState } from "react";
import {
  FaHome,
  FaUsers,
  FaUserGraduate,
  FaGlobe,
  FaChevronUp,
  FaChevronDown,
  FaUserCircle,
  FaCreditCard,
} from "react-icons/fa";

import "./Dashboard.css";
import Inquiry from "../Inquiry/Inquiry";
import Admission from "../Admission/Admission";
import AdmissionSettings from "../Admission/AdmissionSettings";
import Registration from "../Registration/Registration";
import UserList from "../UserList/UserList";
import AdmissionForm from "../Admission/AdmissionForm";
import AdmissionList from "../Admission/AdmissionList";
import InquiryForm from "../Inquiry/InquiryForm";
import InquiryList from "../Inquiry/InquiryList";

const Dashboard = () => {
  const [hostelOpen, setHostelOpen] = useState(true);
  const [activeModule, setActiveModule] = useState("inquiry");
  const [activeTab, setActiveTab] = useState("dashboard");

  const handleModuleClick = (module) => {
    setActiveModule(module);
    setActiveTab("dashboard");
  };

  useEffect(() => {
    const goList = () => {
      setActiveModule("admission");
      setActiveTab("user-list");
    };
    window.addEventListener("hostel-reg-updated", goList);
    return () => window.removeEventListener("hostel-reg-updated", goList);
  }, []);

  const getTabs = () => {
    if (activeModule === "inquiry") {
      return [
        { label: "Dashboard", value: "dashboard" },
        { label: "Add Inquiry", value: "add-inquiry" },
        { label: "Inquiry List", value: "inquiry-list" },
      ];
    }

    if (activeModule === "admission") {
      return [
        { label: "Dashboard", value: "dashboard" },
        { label: "Admissions", value: "add-admission" },
        { label: "Students", value: "admission-list" },
        { label: "Registration", value: "registration" },
        { label: "Users", value: "user-list" },
        { label: "Leave", value: "leave" },
        { label: "Settings", value: "admission-settings" },
      ];
    }

    if (activeModule === "website") {
      return [
        { label: "Dashboard", value: "dashboard" },
        { label: "Dynamic Website", value: "dynamic-website" },
      ];
    }

    return [];
  };

  const SimplePage = ({ title }) => (
    <div className="simple-page">
      <h2>{title}</h2>
    </div>
  );

  return (
    <div className="app-container">
      <header className="header">
        <div className="school-section">
          <div className="school-logo">
            <FaHome />
          </div>
          <div className="school-name">Sant Gadagebaba Progressive School</div>
        </div>

        <div className="branch-name">Pune Branch</div>

        <div className="header-actions">
          <button className="pay-button" type="button">
            <FaCreditCard />
            <span>Pay Now</span>
          </button>
          <FaUserCircle className="profile-icon" />
        </div>
      </header>

      <div className="below-header">
        <aside className="sidebar">
          <div className="sidebar-content">
            <button
              type="button"
              className="hostel-title"
              onClick={() => setHostelOpen(!hostelOpen)}
            >
              <FaHome className="menu-icon" />
              <span>Hostel Management</span>
              {hostelOpen ? (
                <FaChevronUp className="arrow-icon" />
              ) : (
                <FaChevronDown className="arrow-icon" />
              )}
            </button>

            {hostelOpen && (
              <div className="hostel-submenu">
                <button
                  type="button"
                  className={
                    activeModule === "inquiry"
                      ? "sidebar-option active"
                      : "sidebar-option"
                  }
                  onClick={() => handleModuleClick("inquiry")}
                >
                  <FaUsers />
                  <span>Inquiry</span>
                </button>

                <button
                  type="button"
                  className={
                    activeModule === "admission"
                      ? "sidebar-option active"
                      : "sidebar-option"
                  }
                  onClick={() => handleModuleClick("admission")}
                >
                  <FaUserGraduate />
                  <span>Admission</span>
                </button>

                <button
                  type="button"
                  className={
                    activeModule === "website"
                      ? "sidebar-option active"
                      : "sidebar-option"
                  }
                  onClick={() => handleModuleClick("website")}
                >
                  <FaGlobe />
                  <span>Dynamic Website</span>
                </button>
              </div>
            )}
          </div>
        </aside>

        <div className="main-area">
          <div className="top-navigation">
            {getTabs().map((tab) => (
              <button
                type="button"
                key={tab.value}
                className={
                  activeTab === tab.value ? "top-tab active" : "top-tab"
                }
                onClick={() => setActiveTab(tab.value)}
              >
                {tab.label}
              </button>
            ))}
          </div>

          <main className="content">
            {activeModule === "inquiry" && activeTab === "dashboard" && (
              <Inquiry />
            )}
            {activeModule === "inquiry" && activeTab === "add-inquiry" && (
              <InquiryForm onSaved={() => setActiveTab("inquiry-list")} />
            )}
            {activeModule === "inquiry" && activeTab === "inquiry-list" && (
              <InquiryList />
            )}

            {activeModule === "admission" && activeTab === "dashboard" && (
              <Admission />
            )}
            {activeModule === "admission" && activeTab === "add-admission" && (
              <AdmissionForm />
            )}
            {activeModule === "admission" && activeTab === "admission-list" && (
              <AdmissionList />
            )}
            {activeModule === "admission" && activeTab === "registration" && (
              <Registration
                onSaved={() => {
                  setActiveModule("admission");
                  setActiveTab("user-list");
                }}
              />
            )}
            {activeModule === "admission" && activeTab === "user-list" && (
              <UserList />
            )}
            {activeModule === "admission" &&
              activeTab === "admission-settings" && <AdmissionSettings />}

            {activeModule === "website" && activeTab === "dashboard" && (
              <SimplePage title="Website Dashboard" />
            )}
            {activeModule === "website" && activeTab === "dynamic-website" && (
              <SimplePage title="Dynamic Website" />
            )}
          </main>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
