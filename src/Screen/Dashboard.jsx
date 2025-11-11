import React, { useEffect, useState } from "react";
import "./Dashboard.css";
import { IoMdCheckmarkCircleOutline } from "react-icons/io";
import { HiMiniUsers } from "react-icons/hi2";
import { IoIosHourglass } from "react-icons/io";
import { FaChartSimple, FaUserClock } from "react-icons/fa6";
import { RiAdminFill } from "react-icons/ri";
import { TbFileReport } from "react-icons/tb";
import { HiCalendarDateRange } from "react-icons/hi2";
import { GetCall, PostCall } from "./ApiService";
import moment from "moment";
import Loader from "../Main/Loader";
import { showToast } from "../Main/ToastManager";
import { useNavigate } from "react-router-dom";

const Dashboard = () => {
  const [recentRecords, setRecentRecords] = useState([]);
  const [loading, setLoading] = useState(true);
  const [dashboardData, setDashboardData] = useState(null);
  const navigate = useNavigate();
  const [showPopup, setShowPopup] = useState(false);
  const [quantity, setQuantity] = useState("");

  useEffect(() => {
    fetchRecentRecords();
    fetchDashboardData();
  }, []);

  const fetchRecentRecords = async () => {
    try {
      setLoading(true);
      const response = await PostCall(
        "admin/getAllPatients?recentPatients=true"
      );
      if (response?.success) {
        setRecentRecords(response?.patients);
      }
    } catch (error) {
      console.error("Error fetching recent patients:", error);
    } finally {
      setLoading(false);
    }
  };

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      const response = await GetCall("admin/getAdminDashboardStats");
      if (response?.success) {
        setDashboardData(response.data);
      }
    } catch (error) {
      console.error("Error fetching dashboard data:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateInventory = async (action) => {
    if (!quantity || isNaN(quantity) || Number(quantity) <= 0) {
      showToast("Please enter a valid quantity.", "error");
      return;
    }

    try {
      setLoading(true);
      const response = await PostCall("admin/updateAdminInventory", {
        action,
        quantity: Number(quantity),
      });

      if (response?.success) {
        showToast(response.message, "success");
        setShowPopup(false);
        setQuantity("");
        fetchDashboardData();
      } else {
        showToast(response?.message || "Failed to update inventory", "error");
      }
    } catch (error) {
      console.error("Error updating inventory:", error);
      showToast(error, "error");
    } finally {
      setLoading(false);
    }
  };

  if (loading && !dashboardData) {
    return <Loader />;
  }

  const stats = dashboardData
    ? [
        {
          label: "Total Tests",
          value: dashboardData.totalTests,
          color: "blue",
          icon: <IoMdCheckmarkCircleOutline />,
        },
        {
          label: "Sub Admins Counts",
          value: dashboardData.subAdminCount,
          color: "green",
          icon: <HiMiniUsers />,
        },
        {
          label: "Admin Kits Available",
          value: dashboardData.adminKitsAvailable,
          color: "orange",
          icon: <FaChartSimple />,
          clickable: true,
        },
        {
          label: "Total Kits Available",
          value: dashboardData.totalKitsAvailable,
          color: "red",
          icon: <IoIosHourglass />,
        },
      ]
    : [];

  const quickActions = [
    {
      title: "Add Sub-admin",
      subtitle: "Register new sub-admin",
      color: "blue",
      icon: <RiAdminFill />,
      navigate: "/sub-admins",
    },
    {
      title: "View All Test Records",
      subtitle: "Browse all test results",
      color: "green",
      navigate: "/reports",
      icon: <FaUserClock />,
    },
    {
      title: "View Daily Report",
      subtitle: "Generate daily summary",
      color: "purple",
      icon: <TbFileReport />,
      navigate: "/reports",
    },
  ];

  const handleViewAll = () => {
    navigate("/reports");
  };

  const handleDetails = (id) => {
    navigate(`/reports/reportdetails/${id}`);
  };

  return (
    <div className="dashboard">
      <div className="stats-grid">
        {stats.map((item, index) => (
          <div
            className={`card ${item.clickable ? "clickable" : ""}`}
            key={index}
            onClick={() => item.clickable && setShowPopup(true)}
          >
            <div className={`icon ${item.color}`}>{item.icon}</div>
            <div className="info">
              <p className="label">{item.label}</p>
              <p className="value">{item.value}</p>
            </div>
          </div>
        ))}
      </div>

      {showPopup && (
        <div className="popup-overlay">
          <div className="popup">
            <button className="popup-close" onClick={() => setShowPopup(false)}>
              &times;
            </button>

            <h3>Update Admin Kits</h3>
            <p>Current Kits: {dashboardData?.adminKitsAvailable}</p>
            <input
              type="number"
              placeholder="Enter quantity"
              value={quantity}
              onChange={(e) => setQuantity(e.target.value)}
            />
            <div className="popup-actions">
              <button
                className="btn add"
                onClick={() => handleUpdateInventory("add")}
              >
                Add
              </button>
              <button
                className="btn remove"
                onClick={() => handleUpdateInventory("remove")}
              >
                Remove
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="quick-actions">
        <h2>Quick Actions</h2>
        <div className="quick-grid">
          {quickActions.map((action, index) => (
            <button className="quick-btn" key={index}>
              <div className={`quick-icon ${action.color}`}>{action.icon}</div>
              <div className="dashboard-content">
                <p className="title-dashboard">{action.title}</p>
                <p
                  className="subtitle"
                  onClick={(e) => {
                    e.stopPropagation(); // prevent button click bubbling
                    navigate(action.navigate); // go to the route
                  }}
                  style={{ cursor: "pointer" }} // optional styling
                >
                  {action.subtitle}
                </p>
              </div>
            </button>
          ))}
        </div>
      </div>

      <div className="recent-records">
        <div className="records-flex">
          <h2>Recent Test Records</h2>
          <button className="records-all" onClick={handleViewAll}>
            View All
          </button>
        </div>
        {recentRecords?.map((rec, index) => (
          <div key={index} className="record">
            <div className="record-header">
              <span className="aadhaar-details">
                Aadhaar: <b>{rec.aadhaarNumber}</b>
              </span>
            </div>
            <div className="record-footer">
              <span>
                <RiAdminFill /> {rec.name}
              </span>
              <span>
                <HiCalendarDateRange />{" "}
                {rec.registeredAt
                  ? moment(rec.registeredAt).format("DD/MM/YYYY")
                  : "N/A"}
              </span>
            </div>
            <div className="record-footer">
              <button
                className="view-btn"
                onClick={() => handleDetails(rec._id)}
              >
                View Details
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Dashboard;
