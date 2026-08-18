import React, { Suspense, lazy } from "react";
import { Routes, Route } from "react-router-dom";
import LoadingOverlay from "./Components/Common/LoadingOverlay"; // Adjust path if needed
import theme from "./Components/Common/theme";
import { ThemeProvider } from "@mui/material";
import { UserRegistrationForm } from "./Components/UserRegiForm";

const HostelAdmissionSidebar = lazy(() => import("./Components/HostelAdmission/HostelAdmissionSidebar"));
const AdmissionDashboard = lazy(() => import("./Components/HostelAdmission/HostelAdmissionDash/AdmissionDashboard"));
const HostelAdmissionSetting = lazy(() => import("./Components/HostelAdmission/HostelAdmissionSetting"));

// const EmployeeList = lazy(() => import("./Components/Employee/EmployeeList"));
// const Dashboard = lazy(() => import("./Components/DashBoard/Dashboard"));
// const EmployeeReport = lazy(() => import("./Components/Employee/EmployeeReport"));
// const EmployeeQueries = lazy(() => import("./Components/EmployeeQueries/EmployeeQueries"));
// const EmployeeSetting = lazy(() => import("./Components/Employee/EmployeeSetting"));
// const MemoList = lazy(() => import("./Components/Memo/MemoList"));
// const NoticeList = lazy(() => import("./Components/Memo/NoticeList"));
// const MemoSidebar = lazy(() => import("./Components/Memo/MemoSidebar"));
// const EmployeeMemo = lazy(() => import("./Components/Memo/EmployeeMemo"));
// const LeaveSidebar = lazy(() => import('./Components/Leave/LeaveSidebar'));
// const LeaveRequest = lazy(() => import('./Components/Leave/LeaveRequest'));
// const LeaveListByEmployee = lazy(() => import('./Components/Leave/LeaveListByEmployee'));
// const AttendanceReport = lazy(()=> import('./Components/Attendance/AttendanceReport'));
// const EmployeeSalarySidebar = lazy(() => import('./Components/Salary/EmployeeSalarySidebar'));
// const SalaryDashboard = lazy(() => import('./Components/Salary/SalaryDashboard'));
// const EmployeeListWithSalary = lazy(() => import('./Components/Salary/EmployeeListWithSalary'));
// const SalaryTable = lazy(() => import('./Components/Salary/SalaryTable'));
const App = () => {
  return (
    <ThemeProvider theme={theme}>
      <Suspense fallback={<LoadingOverlay />}>
        <Routes>
          <Route path="/superadminclient/layout/layringhosteladmin/hostel-admission" element={<HostelAdmissionSidebar />}>
           <Route index element={<AdmissionDashboard />} />

            <Route path="admission-settings" element={<HostelAdmissionSetting />} />
<Route path="user-registration" element={<UserRegistrationForm />} />
            {/*  <Route path="addEmployee" element={<FormStepper />} />
            <Route path="employeeList" element={<EmployeeList />} />
            <Route path="employeeReport" element={<EmployeeReport />} />
            <Route path="loading" element={<LoadingOverlay />} /> */}
          </Route>
          {/* <Route path="/superadminclient/layout/layringemployee/memo" element={<MemoSidebar />} >
            <Route index element={<EmployeeMemo />} />
            <Route path="MemoList" element={<MemoList />} />
            <Route path="NoticeList" element={<NoticeList />} />
          </Route>
          <Route path="/superadminclient/layout/layringemployee/leave" element={<LeaveSidebar />} >
            <Route index element={<LeaveRequest />} />
            <Route path="leavelist" element={<LeaveListByEmployee />} />
            <Route path="EmployeeQueries" element={<EmployeeQueries />} />
            </Route>
          <Route path="/superadminclient/layout/layringemployee/attendance" element={<AttendanceSidebar />} >
            <Route index element={<AttendanceTable />} />
            <Route path="attendanceReport" element={<AttendanceReport />} />
          </Route>
          <Route path="/superadminclient/layout/layringemployee/salary" element={<EmployeeSalarySidebar />} >
            <Route index element={<SalaryDashboard />} />
            <Route path="createsalary" element={<EmployeeListWithSalary />} />
            <Route path="salarytable" element={<SalaryTable />} />
          </Route> */}
        </Routes>
      </Suspense>
    </ThemeProvider>
  );
};

export default App;
