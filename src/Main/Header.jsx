import React, { useState, useRef, useEffect } from "react";
import { IoMdMenu } from "react-icons/io";
import { Navigate, useLocation, useNavigate } from "react-router-dom";
import "./Header.css";
import { useSelector, useDispatch } from "react-redux";
import { clearUserInfo } from "../Store/authSlice";
import img1 from "../Images/user.jpeg";

const Header = ({ toggleSidebar }) => {
  const location = useLocation();
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const user = useSelector((state) => state.auth.userInfo);

  const [dropdownOpen, setDropdownOpen] = useState(false);
  const dropdownRef = useRef(null);

  const routeTitles = {
    "/": "Dashboard",
    "/dashboard": "Dashboard",
    "/sub-admins": "Sub Admins",
    "/test-records": "Test Records",
    "/test-records/recorddetails/:id": "Test Records / Record Details",
    "/reports": "Reports",
    "/reports/reportdetails/:id": "Reports / Report Details",
    "/sub-admins/sub-adminsdetails/:id": "Sub Admins / Sub Admins Details",
    "/account": "Account",
    "/healthtest": "Health Test",
  };

  const getTitle = (pathname) => {
    if (pathname.startsWith("/test-records/recorddetails/")) {
      return "Test Records / Record Details";
    }
    if (pathname.startsWith("/reports/reportdetails/")) {
      return "Reports / Report Details";
    }
    if (pathname.startsWith("/sub-admins/sub-adminsdetails/")) {
      return "Sub Admins / Sub Admins Details";
    }
    return routeTitles[pathname] || "Unknown";
  };

  const title = getTitle(location.pathname);
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setDropdownOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  const handleLogout = () => {
    localStorage.clear();
    dispatch(clearUserInfo());
    window.location.href = "/login";
  };

  const handleChnagepassword = () => {
    navigate("/changepassword");
  };

  return (
    <header className="main-header">
      <div className="header-toggle-menu">
        <IoMdMenu
          onClick={toggleSidebar}
          style={{ cursor: "pointer", fontSize: "24px" }}
        />
        <div className="header-left">
          <h2 className="logo">{title}</h2>
        </div>
      </div>

      <div className="header-right" ref={dropdownRef}>
        <div
          className="profile"
          onClick={() => setDropdownOpen(!dropdownOpen)}
          style={{ cursor: "pointer", position: "relative" }}
        >
          <img src={img1} alt="User" style={{ borderRadius: "50%" }} />
          <span className="username">{user?.name}</span>

          {dropdownOpen && (
            <div className="dropdown-menu">
              <button onClick={handleLogout}>Logout</button>
              <button onClick={handleChnagepassword}>Change Password</button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};

export default Header;
