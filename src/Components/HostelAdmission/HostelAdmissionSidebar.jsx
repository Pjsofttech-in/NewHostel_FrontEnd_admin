// npm run build npm run preview

import React, { useEffect, useState } from "react";
import { NavLink, Outlet, useLocation } from "react-router-dom";
import { Box, Button, Stack, Paper,  Fade,Slide, } from "@mui/material";
import LoadingOverlay from "../Common/LoadingOverlay"; // Make sure path is correct
import { useSession } from "../Common/useSession";
import LockIcon from "@mui/icons-material/Lock";

  const navItems = [
  { label: "Dashboard", to: "/superadminclient/layout/layringhosteladmin/hostel-admission" },
  { label: "Admission Form", to: "/superadminclient/layout/layringhosteladmin/hostel-admission/form" },
  { label: "Admission List", to: "/superadminclient/layout/layringhosteladmin/hostel-admission/report" },
  { label: "Registration Form", to: "/superadminclient/layout/layringhosteladmin/hostel-admission/user-registration" },
  { label: "User List", to: "/superadminclient/layout/layringhosteladmin/hostel-admission/users-report" },
   { label: "Admission Settings", to: "/superadminclient/layout/layringhosteladmin/hostel-admission/admission-settings" }
];

const HostelAdmissionSidebar = () => {
  const location = useLocation();
  const [loading, setLoading] = useState(false);
  const { role } = useSession();
  const [showContent, setShowContent] = useState(true);


  let canSeeDashboard = true;
  let canSeeSettings = true;
  if (role === "department") {
    canSeeDashboard = sessionStorage.getItem("canddashBoard") === "true";
    canSeeSettings = sessionStorage.getItem("candsetting") === "true";
  }
  if (role === "staff") {
    canSeeDashboard = sessionStorage.getItem("cansdashBoard") === "true";
    canSeeSettings = sessionStorage.getItem("canssetting") === "true";
  }
  const navItemsWithLock = navItems
    .map((item) => {
      let locked = false;
      if (
        role === "superAdmin" &&
        ["Add Employee", "Employee Settings", "Employee Report", "Employee Queries"].includes(item.label)
      ) {
        return null; // Remove completely
      }
      if (role === "department" || role === "staff") {
        // if (item.label === "Dashboard" && !canSeeDashboard) locked = true;
        // if (item.label === "Employee Settings" && !canSeeSettings) locked = true;
      }
      return { ...item, locked };
    })
    .filter(Boolean);

  const currentNav = navItemsWithLock.find((item) => location.pathname === item.to);
  const isCurrentLocked = currentNav?.locked;
  // Track route changes
useEffect(() => {
    setShowContent(false);
    setLoading(true);
    
    const timer = setTimeout(() => {
      setLoading(false);
      setShowContent(true);
    }, 300);
    
    return () => clearTimeout(timer);
  }, [location.pathname]);

  return (
    <Box>
      <Paper
        elevation={0} // remove default elevation
        sx={{
          display: "flex",
          justifyContent: "space-between",
          marginBottom: "12px",
          backgroundColor: "#2980B9",
          padding: "10px 12px",
          borderRadius: "30px",
          border: "1px solid black",
          // 👇 Inside shadow effect
          boxShadow: "inset 0px 4px 8px rgba(0,0,0,0.4), inset 0px -4px 8px rgba(255,255,255,0.2)",
        }}
      >
        <Stack direction="row" spacing={2} sx={{ justifyContent: "space-evenly", width: "100%" }}>
          {navItems.map((item, index) => {
            const isActive = location.pathname === item.to;

            return (
              <NavLink
                key={index}
                to={item.to}
                end
                style={{ textDecoration: "none", flex: 1 }}
              >
                <Button
                  fullWidth
                  sx={{
                    padding: "4px 10px",
                    fontSize: "12px",
                    fontWeight: isActive ? "bold" : "normal",
                    textAlign: "center",
                    color: isActive ? "black" : "white",
                    backgroundColor: isActive ? "white" : "transparent",
                    borderRadius: "30px",
                    textTransform: "none",
                    cursor: "pointer",
                    boxShadow: isActive ? "0px 4px 8px rgba(0, 0, 0, 0.2)" : "none",
                    border: isActive ? "1px solid black" : "",

                    transition: "background-color 0.3s ease, color 0.3s ease",
                    "&:hover": {
                      backgroundColor: isActive ? "#f5f5f5" : "#1f618d",
                    },
                  }}
                >
                  {item.label}
                </Button>
              </NavLink>
            );
          })}
        </Stack>
      </Paper>

      <Box sx={{ position: "relative" }}>
        <LoadingOverlay loading={loading} />
           <Fade in={showContent} timeout={500}>
          <Slide direction="right" in={showContent} timeout={400}>
            <Box>
        {isCurrentLocked ? (
          <Box
            sx={{
              p: 4,
              textAlign: "center",
              color: "#b71c1c",
              fontWeight: 600,
              fontSize: 18,
            }}
          >
            <LockIcon sx={{ fontSize: 40, mb: 1 }} color="error" />
            {role === "department" ? (
              <div>You don't have permission to access this section. Contact Branch for change.</div>
            ) : role === "staff" ? (
              <div>You don't have permission to access this section. Contact Department for change.</div>
            ) : (
              <div>You don't have permission to access this section.</div>
            )}
          </Box>
        ) : (
          <Outlet />
        )}
        </Box>
        </Slide>
        </Fade>
      </Box>
    </Box>
  );
};

export default HostelAdmissionSidebar;


// npm run dev

// import React, { useEffect, useState } from "react";
// import { NavLink, Outlet, useLocation } from "react-router-dom";
// import { Box, Button, Stack, Paper } from "@mui/material";
// import LoadingOverlay from "./Common/LoadingOverlay"; // Make sure path is correct

// const navItems = [
//   { label: "Dashboard", to: "/" },
//   { label: "Add Employee", to: "/addEmployee" },
//   { label: "Employee List", to: "/employeeList" },
//   { label: "Employee Report", to: "/employeeReport" },
//   { label: "Employee Queries", to: "/EmployeeQueries" },
//   { label: "Employee Settings", to: "/EmployeeSettings" },
// ];

// const HostelAdmissionSidebar = () => {
//   const location = useLocation();
//   const [loading, setLoading] = useState(false);

//   // Track route changes
//   useEffect(() => {
//     setLoading(true);
//     const timer = setTimeout(() => {
//       setLoading(false);
//     }, 1000); // Adjust delay as needed
//     return () => clearTimeout(timer);
//   }, [location.pathname]);

//   return (
//     <Box>
//       <Paper
//         elevation={3}
//         sx={{
//           display: "flex",
//           justifyContent: "space-between",
//           marginBottom: "5px",
//           backgroundColor: "#2980B9",
//           padding: "8px",
//           borderRadius: "30px",
// border: "1px solid black",

//           boxShadow: "0px 2px 5px rgba(0, 0, 0, 0.1)",
//         }}
//       >
//         <Stack direction="row" spacing={2} sx={{ justifyContent: "space-evenly", width: "100%" }}>
//           {navItems.map((item, index) => {
//             const isActive = location.pathname === item.to;

//             return (
//               <NavLink
//                 key={index}
//                 to={item.to}
//                 style={{ textDecoration: "none", flex: 1 }}
//               >
//                 <Button
//                   fullWidth
//                   sx={{
//                     padding: "4px 10px",
//                     fontSize: "12px",
//                     fontWeight: isActive ? "bold" : "normal",
//                     textAlign: "center",
//                     color: isActive ? "black" : "white",
//                     backgroundColor: isActive ? "white" : "transparent",
// border: isActive ? "1px solid black" : "",

//                     borderRadius: "30px",
//                     textTransform: "none",
//                     cursor: "pointer",
//                     boxShadow: isActive ? "0px 4px 8px rgba(0, 0, 0, 0.2)" : "none",
//                     transition: "background-color 0.3s ease, color 0.3s ease",
//                     "&:hover": {
//                       backgroundColor: isActive ? "#f5f5f5" : "#1f618d",
//                     },
//                   }}
//                 >
//                   {item.label}
//                 </Button>
//               </NavLink>
//             );
//           })}
//         </Stack>
//       </Paper>

//       <Box sx={{ position: "relative" }}>
//         <LoadingOverlay loading={loading} />
//         <Outlet />
//       </Box>
//     </Box>
//   );
// };

// export default HostelAdmissionSidebar;
