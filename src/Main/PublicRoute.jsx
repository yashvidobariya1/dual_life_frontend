import React from "react";
import { Navigate } from "react-router-dom";
import { useSelector } from "react-redux";

const PublicRoute = ({ children }) => {
  const reduxUser = useSelector((state) => state.userInfo?.userInfo);
  const token = localStorage.getItem("token");
  const adharverifytoken = localStorage.getItem("adharverifytoken");

  if (token || reduxUser?.token) {
    // Admin already logged in → go to admin dashboard
    return <Navigate to="/dashboard" replace />;
  }

  if (adharverifytoken) {
    // Aadhaar already verified → go to user dashboard
    return <Navigate to="/userdashboard" replace />; // replace 123 with actual Aadhaar user id
  }

  return children;
};

export default PublicRoute;
