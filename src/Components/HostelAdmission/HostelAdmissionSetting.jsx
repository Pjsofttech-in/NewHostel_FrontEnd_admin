    import React, { useState, lazy, Suspense } from "react";
    import { Box, Paper, Typography } from "@mui/material";
    import {
    // Quiz as ExamIcon,
    Source as SourceIcon,
    School as ConductIcon,
    QrCodeScanner as QrCodeIcon,
    MenuBook as CategoryIcon,
    AutoStories as CourseIcon,
    MoreHoriz as StatusIcon,
    AutoStories as DeptIcon,
    QrCodeScanner as FeedbackQRIcon,
    } from "@mui/icons-material";

    import LoadingOverlay from "../Common/LoadingOverlay"; // adjust path if needed

    const HostelFloor = lazy(() => import("./Settings/HostelFloor"));
    const HostelLeave = lazy(() => import("./Settings/HostelLeave"));


    const menuItems = [
    { id: "hostelFloor", label: "Hostel Floor", icon: <CourseIcon /> },
    { id: "hostelLeave", label: "Leave", icon: <SourceIcon /> },
    ];

    // Sidebar Component
    const Sidebar = ({ selectedComponent, onSelect }) => {
    const [isCollapsed, setIsCollapsed] = useState(true);

    return (
        <Paper
        elevation={5}
        sx={{
            width: isCollapsed ? 45 : 230,
            padding: 1,
            display: "flex",
            flexDirection: "column",
            borderRadius: 8,
            backgroundColor: "#2980B9",
            border:"1px solid black",
            transition: "width 0.7s ease",
            height: "100%",
            overflowY: "hidden",
    boxShadow: "0px 8px 20px rgba(0,0,0,0.2)",
        }}
        onMouseEnter={() => setIsCollapsed(false)}
        onMouseLeave={() => setIsCollapsed(true)}
        >
        {menuItems.map((item) => (
            <Box
            key={item.id}
            title={isCollapsed ? item.label : ""}
            placement="right"
            >
            <Typography
                onClick={() => onSelect(item.id)}
                sx={{
                display: "flex",
                alignItems: "center",
                gap: 1.5,
                padding: "10px",
                cursor: "pointer",
                fontSize: 13,
                color: selectedComponent === item.id ? "black" : "white",
                fontWeight: selectedComponent === item.id ? 600 : 400,
                borderRadius: 16,
                border :  selectedComponent === item.id ? "1px solid black" : "",
                backgroundColor:
                    selectedComponent === item.id ? "white" : "transparent",
                boxShadow:
                    selectedComponent === item.id
                    ? "0px 4px 10px rgba(0, 0, 0, 0.2)"
                    : "none",
                transition: "all 0.2s ease",
                whiteSpace: "nowrap",
                }}
            >
                {item.icon}
                {!isCollapsed && item.label}
            </Typography>
            </Box>
        ))}
        </Paper>
    );
    };

    // Main HostelAdmissionSetting Component
    const HostelAdmissionSetting = () => {
    const [selectedComponent, setSelectedComponent] = useState("hostelFloor");

    const renderSelectedComponent = () => {
        const components = {
        hostelFloor: <HostelFloor />,
        hostelLeave: <HostelLeave />,

        };
        return components[selectedComponent] || null;
    };

    return (
        <Box sx={{ display: "flex", padding: 2, height: "100%" }}>
        <Sidebar
            selectedComponent={selectedComponent}
            onSelect={setSelectedComponent}
        />
        <Box
            sx={{
            flexGrow: 1,
            padding: 2,
            marginLeft: 2,
            border: "1px solid #ddd",
            borderRadius: 2,
            // backgroundColor: "#f9f9f9",
            position: "relative", // for LoadingOverlay if needed
            }}
        >
            <Suspense fallback={<LoadingOverlay loading={true} />}>
            {renderSelectedComponent()}
            </Suspense>
        </Box>
        </Box>
    );
    };

    export default HostelAdmissionSetting;
