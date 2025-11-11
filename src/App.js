import React, { useState, useEffect } from "react";
import { BrowserRouter, Routes, Route, useLocation } from "react-router-dom";

import "./App.css";
import Sidebar from "./Main/SideBar";
import Header from "./Main/Header";
import Dashboard from "./Screen/Dashboard";
import SubAdmin from "./Screen/SubAdmin";
import TestRecord from "./Screen/TestRecord";
import RecordDetails from "./Screen/RecordDetails";
import Report from "./Screen/Report";
import ReportDetails from "./Screen/ReportDetails";
import Login from "./Screen/Login";
import AdharVerfiy from "./User/AdharVerfiy";
import UserDashboard from "./User/UserDashboard";
import ProtectedRoute from "./Main/ProtectedRoute";
import PublicRoute from "./Main/PublicRoute";
import ToastManager from "./Main/ToastManager";
import Account from "./Screen/Account";
import ChangePassword from "./Screen/ChangePassword";
import SubadminDetials from "./Screen/SubadminDetails";
import Healthtest from "./Screen/Healthtest";

function Layout({
  children,
  collapsed,
  setCollapsed,
  isMobile,
  sidebarOpen,
  setSidebarOpen,
}) {
  const location = useLocation();

  // pages where sidebar & header should NOT show
  const hideLayoutPaths = ["/login", "/"];
  // special handling for dynamic route (/userdashboard/:id)
  const isUserDashboardPage = location.pathname.startsWith("/userdashboard");

  const shouldHideLayout =
    hideLayoutPaths.includes(location.pathname) || isUserDashboardPage;

  if (shouldHideLayout) {
    return children;
  }

  return (
    <div className={`app-container ${collapsed ? "collapsed" : ""}`}>
      <Sidebar
        collapsed={collapsed}
        mobileOpen={sidebarOpen}
        closeSidebar={() => setSidebarOpen(false)}
      />

      <div className="main-content">
        <Header
          toggleSidebar={() =>
            isMobile ? setSidebarOpen(!sidebarOpen) : setCollapsed(!collapsed)
          }
        />
        {children}
      </div>
    </div>
  );
}

function App() {
  const [collapsed, setCollapsed] = useState(false);
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);
  const [sidebarOpen, setSidebarOpen] = useState(false);

  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth < 768);
      if (window.innerWidth >= 768) {
        setSidebarOpen(false);
      }
    };
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  return (
    <BrowserRouter>
      <ToastManager />
      <Layout
        collapsed={collapsed}
        setCollapsed={setCollapsed}
        isMobile={isMobile}
        sidebarOpen={sidebarOpen}
        setSidebarOpen={setSidebarOpen}
      >
        <Routes>
          {/* Public Routes (blocked if logged in) */}
          <Route
            path="/login"
            element={
              <PublicRoute>
                <Login />
              </PublicRoute>
            }
          />
          <Route
            path="/"
            element={
              <PublicRoute>
                <AdharVerfiy />
              </PublicRoute>
            }
          />

          {/* Protected Routes */}
          <Route
            path="/dashboard"
            element={
              <ProtectedRoute>
                <Dashboard />
              </ProtectedRoute>
            }
          />
          <Route
            path="/sub-admins"
            element={
              <ProtectedRoute>
                <SubAdmin />
              </ProtectedRoute>
            }
          />
          <Route
            path="/test-records"
            element={
              <ProtectedRoute>
                <TestRecord />
              </ProtectedRoute>
            }
          />
          {/* <Route
            path="/test-records/recorddetails/:id"
            element={
              <ProtectedRoute>
                <RecordDetails />
              </ProtectedRoute>
            }
          /> */}
          <Route
            path="/reports"
            element={
              <ProtectedRoute>
                <Report />
              </ProtectedRoute>
            }
          />
          <Route
            path="/reports/reportdetails/:id"
            element={
              <ProtectedRoute>
                <ReportDetails />
              </ProtectedRoute>
            }
          />
          <Route
            path="/userdashboard"
            element={
              <ProtectedRoute>
                <UserDashboard />
              </ProtectedRoute>
            }
          />
          <Route
            path="/account"
            element={
              <ProtectedRoute>
                <Account />
              </ProtectedRoute>
            }
          />
          <Route
            path="/changepassword"
            element={
              <ProtectedRoute>
                <ChangePassword />
              </ProtectedRoute>
            }
          />
          <Route
            path="/sub-admins/sub-adminsdetails/:id"
            element={
              <ProtectedRoute>
                <SubadminDetials />
              </ProtectedRoute>
            }
          />
          <Route
            path="/healthtest"
            element={
              <ProtectedRoute>
                <Healthtest />
              </ProtectedRoute>
            }
          />
        </Routes>
      </Layout>
    </BrowserRouter >
  );
}

export default App;
