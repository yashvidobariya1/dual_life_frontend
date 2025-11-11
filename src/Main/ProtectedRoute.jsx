import React from "react";
import { Navigate, useLocation } from "react-router-dom";
import { useSelector } from "react-redux";

const ProtectedRoute = ({ children }) => {
  const reduxUser = useSelector((state) => state.userInfo?.userInfo);
  const token = localStorage.getItem("token");
  const adharverifytoken = localStorage.getItem("adharverifytoken");
  const location = useLocation();

  // Case 1: Admin token → can access everything except AadhaarVerify/Login
  if ((token && token !== undefined) || reduxUser?.token) {
    return children;
  }

  // Case 2: Aadhaar verify token → can ONLY access /userdashboard/:id
  if (adharverifytoken) {
    if (location.pathname.startsWith("/userdashboard")) {
      return children;
    } else {
      return <Navigate to="/userdashboard" replace />; // you can redirect to correct id
    }
  }

  // Case 3: Not authenticated → go to login
  return <Navigate to="/login" replace />;
};

export default ProtectedRoute;
