import React, { useState, useEffect } from "react";
import {
  Container,
  Box,
  Typography,
  Button,
  Paper,
  Stepper,
  Step,
  StepLabel,
  StepContent,
} from "@mui/material";
import { SaveOutlined, SendOutlined } from "@ant-design/icons";
import PersonalInfoSection from "./PersonalInfoSection";
import AddressSection from "./AddressSection";
import FamilyInfoSection from "./FamilyInfoSection";
import AcademicInfoSection from "./AcademicInfoSection";
import HostelInfoSection from "./HostelInfoSection";
import UserRegistrationService from "../../Services/UserRegistrationService";
import AlertService from "../Common/AlertService";
import LoadingOverlay from "../Common/LoadingOverlay";

const UserRegistrationForm = () => {
  const [activeStep, setActiveStep] = useState(0);
  const [loading, setLoading] = useState(false);
  const [sameAsCurrent, setSameAsCurrent] = useState(false);

  // Form Data State
  const [formData, setFormData] = useState({
    name: "",
    birthDate: "",
    age: "",
    gender: "",
    email: "",
    password: "",
    contactNo: "",
    martialStatus: "",
    bloodGroup: "",
    religon: "",
    address: "",
    state: "",
    city: "",
    fullAddress: "",
    pinCode: "",
    pstate: "",
    pcity: "",
    pfullAddress: "",
    ppinCode: "",
    gstate: "",
    gcity: "",
    gfullAddress: "",
    gpinCode: "",
    fatherName: "",
    mobNo: "",
    motherName: "",
    motherMobNo: "",
    guardianName: "",
    gmobNo: "",
    familyDoctorName: "",
    doctorMobileNo: "",
    parentState: "",
    parentCity: "",
    parentFullAddress: "",
    parentPinCode: "",
    studentIdNo: "",
    course: "",
    year: "",
    instituteName: "",
    vehicleNo: "",
    stayFrom: "",
    stayTo: "",
    applicantAddressProof: "",
    parentAddressProof: "",
    buildingName: "",
    floor: "",
    roomNo: "",
    bedType: "",
    bedNo: "",
    amount: "",
    depositedStatus: "",
    paymentMode: "",
    chequeNo: "",
    gst: "",
    source: "",
  });

  // File States
  const [studentPhoto, setStudentPhoto] = useState(null);
  const [applicantAddressProof, setApplicantAddressProof] = useState(null);
  const [parentAddressProof, setParentAddressProof] = useState(null);
  const [applicantSignature, setApplicantSignature] = useState(null);
  const [parentSignature, setParentSignature] = useState(null);

  // Handle input change
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  // Copy current address to permanent address
  useEffect(() => {
    if (sameAsCurrent) {
      setFormData((prev) => ({
        ...prev,
        pfullAddress: prev.fullAddress,
        pstate: prev.state,
        pcity: prev.city,
        ppinCode: prev.pinCode,
      }));
    }
  }, [sameAsCurrent, formData.fullAddress, formData.state, formData.city, formData.pinCode]);

  // Form Steps
  const steps = [
    {
      label: "Personal Information",
      component: (
        <PersonalInfoSection
          formData={formData}
          handleChange={handleChange}
          studentPhoto={studentPhoto}
          setStudentPhoto={setStudentPhoto}
        />
      ),
    },
    {
      label: "Address Information",
      component: (
        <AddressSection
          formData={formData}
          handleChange={handleChange}
          sameAsCurrent={sameAsCurrent}
          setSameAsCurrent={setSameAsCurrent}
          applicantAddressProof={applicantAddressProof}
          setApplicantAddressProof={setApplicantAddressProof}
          parentAddressProof={parentAddressProof}
          setParentAddressProof={setParentAddressProof}
        />
      ),
    },
    {
      label: "Family & Guardian",
      component: <FamilyInfoSection formData={formData} handleChange={handleChange} />,
    },
    {
      label: "Academic Information",
      component: <AcademicInfoSection formData={formData} handleChange={handleChange} />,
    },
    {
      label: "Hostel & Payment",
      component: (
        <HostelInfoSection
          formData={formData}
          handleChange={handleChange}
          applicantSignature={applicantSignature}
          setApplicantSignature={setApplicantSignature}
          parentSignature={parentSignature}
          setParentSignature={setParentSignature}
        />
      ),
    },
  ];

  const handleNext = () => {
    setActiveStep((prevActiveStep) => prevActiveStep + 1);
  };

  const handleBack = () => {
    setActiveStep((prevActiveStep) => prevActiveStep - 1);
  };

  const handleReset = () => {
    setActiveStep(0);
  };

  // Validate required fields
  const validateForm = () => {
    const requiredFields = [
      "name",
      "birthDate",
      "age",
      "gender",
      "email",
      "password",
      "contactNo",
      "martialStatus",
      "bloodGroup",
      "fullAddress",
      "state",
      "city",
      "pinCode",
      "fatherName",
      "mobNo",
      "motherName",
      "motherMobNo",
      "studentIdNo",
      "course",
      "year",
      "instituteName",
      "stayFrom",
      "stayTo",
      "buildingName",
      "floor",
      "roomNo",
      "bedType",
      "bedNo",
      "amount",
      "depositedStatus",
      "paymentMode",
    ];

    for (let field of requiredFields) {
      if (!formData[field] || formData[field].toString().trim() === "") {
        AlertService.error(`Please fill in the required field: ${field}`);
        return false;
      }
    }

    if (!sameAsCurrent) {
      if (!formData.pfullAddress || !formData.pstate || !formData.pcity || !formData.ppinCode) {
        AlertService.error("Please fill in permanent address details");
        return false;
      }
    }

    return true;
  };

  // Submit Form
  const handleSubmit = async () => {
    if (!validateForm()) {
      return;
    }

    setLoading(true);

    try {
      // Get role and email from session storage or context
      const role = sessionStorage.getItem("role") || "ADMIN";
      const email = sessionStorage.getItem("email") || formData.email;

      const response = await UserRegistrationService.saveAllDetails(
        formData,
        studentPhoto,
        applicantAddressProof,
        parentAddressProof,
        applicantSignature,
        parentSignature,
        role,
        email
      );

      AlertService.success("Registration completed successfully!");
      
      // Reset form
      setFormData({
        name: "",
        birthDate: "",
        age: "",
        gender: "",
        email: "",
        password: "",
        contactNo: "",
        martialStatus: "",
        bloodGroup: "",
        religon: "",
        address: "",
        state: "",
        city: "",
        fullAddress: "",
        pinCode: "",
        pstate: "",
        pcity: "",
        pfullAddress: "",
        ppinCode: "",
        gstate: "",
        gcity: "",
        gfullAddress: "",
        gpinCode: "",
        fatherName: "",
        mobNo: "",
        motherName: "",
        motherMobNo: "",
        guardianName: "",
        gmobNo: "",
        familyDoctorName: "",
        doctorMobileNo: "",
        parentState: "",
        parentCity: "",
        parentFullAddress: "",
        parentPinCode: "",
        studentIdNo: "",
        course: "",
        year: "",
        instituteName: "",
        vehicleNo: "",
        stayFrom: "",
        stayTo: "",
        applicantAddressProof: "",
        parentAddressProof: "",
        buildingName: "",
        floor: "",
        roomNo: "",
        bedType: "",
        bedNo: "",
        amount: "",
        depositedStatus: "",
        paymentMode: "",
        chequeNo: "",
        gst: "",
        source: "",
      });
      setStudentPhoto(null);
      setApplicantAddressProof(null);
      setParentAddressProof(null);
      setApplicantSignature(null);
      setParentSignature(null);
      setSameAsCurrent(false);
      setActiveStep(0);
    } catch (error) {
      console.error("Error submitting form:", error);
      AlertService.error(
        error.response?.data?.message || "Failed to submit registration. Please try again."
      );
    } finally {
      setLoading(false);
    }
  };

 return (
    <>
      <LoadingOverlay loading={loading} />

      <div sx={{ p: 2, mx: "auto" }}>
        {/* Horizontal Stepper */}
        <Stepper activeStep={activeStep} alternativeLabel>
          {steps.map((step) => (
            <Step key={step.label}>
              <StepLabel>
                <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>
                  {step.label}
                </Typography>
              </StepLabel>
            </Step>
          ))}
        </Stepper>

        {/* Step Content */}
        <Box sx={{ mt: 5 }}>
          {activeStep < steps.length ? (
            <>
              <Box sx={{ mb: 3 }}>{steps[activeStep].component}</Box>

              <Box sx={{ display: "flex", justifyContent: "flex-end", gap: 2 }}>
                <Button
                  disabled={activeStep === 0}
                  onClick={handleBack}
                  variant="outlined"
                >
                  Back
                </Button>

                <Button
                  variant="contained"
                  onClick={
                    activeStep === steps.length - 1 ? handleSubmit : handleNext
                  }
                  startIcon={
                    activeStep === steps.length - 1 ? <SendOutlined /> : null
                  }
                >
                  {activeStep === steps.length - 1 ? "Submit" : "Continue"}
                </Button>
              </Box>
            </>
          ) : (
            <Paper elevation={3} sx={{ p: 4, textAlign: "center" }}>
              <Typography variant="h6" gutterBottom>
                All steps completed — you’re finished!
              </Typography>
              <Button onClick={handleReset} variant="outlined">
                Reset
              </Button>
            </Paper>
          )}
        </Box>
      </div>
    </>
  );
};

export default UserRegistrationForm;