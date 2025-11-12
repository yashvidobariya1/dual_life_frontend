import React, { useEffect, useState } from "react";
import "./SubAdmin.css";
import { IoCallOutline } from "react-icons/io5";
import { FaCheck, FaUserCheck, FaUserSlash } from "react-icons/fa6";
import { PostCall, PutCall } from "../Screen/ApiService";
import moment from "moment";
import { showToast } from "../Main/ToastManager";
import Loader from "../Main/Loader";
import { FaEdit, FaSearch } from "react-icons/fa";
import { FaEye, FaEyeSlash } from "react-icons/fa";
import { useNavigate } from "react-router-dom";
import {
  MdOutlineArrowBackIos,
  MdOutlineArrowForwardIos,
} from "react-icons/md";

const SubAdmin = () => {
  const [step, setStep] = useState(0);
  const [showModal, setShowModal] = useState(false);
  const [loading, setLoading] = useState(false);
  const [subadminData, setsubadminData] = useState([]);
  const [aadhaar, setAadhaar] = useState("");
  const [otp, setOtp] = useState("");
  const [refId, setRefId] = useState("");
  const [verifyResponse, setVerifyResponse] = useState([]);
  const [filter, setFilter] = useState(true);
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [totalPages, setTotalPages] = useState(1);
  const [searchQuery, setsearchQuery] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState(searchQuery);

  const navigate = useNavigate();
  const [isEditMode, setIsEditMode] = useState(false);
  const [editId, setEditId] = useState(null);
  const [showPassword, setShowPassword] = useState(false);

  const togglePassword = () => {
    setShowPassword((prev) => !prev);
  };

  const [formData, setFormData] = useState({
    name: "",
    aadhaar: "",
    email: "",
    mobileNumber: "",
    password: "",
    // confirmPassword: "",
    dob: "",
  });

  const [errors, setErrors] = useState({});

  // ------------------ VALIDATION ------------------
  const validateField = (name, value) => {
    let error = "";

    switch (name) {
      case "name":
        if (!value) error = "Name is required";
        break;

      case "email":
        if (!value) error = "Email is required";
        else if (!/\S+@\S+\.\S+/.test(value)) error = "Enter a valid email";
        break;

      case "mobileNumber":
        if (!value) error = "Mobile number is required";
        else if (!/^[0-9]{10}$/.test(value))
          error = "Enter a valid 10-digit number";
        break;

      case "password":
        if (!isEditMode && !value) error = "Password is required";
        else if (value && value.length < 6)
          error = "Password must be at least 6 characters";
        break;

      // case "confirmPassword":
      //   if (!isEditMode && !value) error = "Confirm Password is required";
      //   else if (value !== formData.password) error = "Passwords do not match";
      //   break;

      default:
        break;
    }
    return error;
  };

  const validateForm = () => {
    const newErrors = {};
    Object.keys(formData).forEach((key) => {
      const error = validateField(key, formData[key]);
      if (error) newErrors[key] = error;
    });
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleFormChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));

    // live validation
    const error = validateField(name, value);
    setErrors((prev) => ({ ...prev, [name]: error }));
  };
  // -------------------------------------------------

  const resetAll = () => {
    setStep(0);
    setAadhaar("");
    setOtp("");
    setRefId("");
    setVerifyResponse([]);
    setFormData({
      name: "",
      aadhaar: "",
      email: "",
      mobileNumber: "",
      password: "",
      dob: "",
    });
    setErrors({});
    setShowModal(false);
    setLoading(false);
    setIsEditMode(false);
    setEditId(null);
  };

  const openModal = () => {
    resetAll();
    setShowModal(true);
    setStep(0);
  };

  const goBack = () => {
    if (step === 1) {
      setOtp("");
      setRefId("");
    }
    setStep((s) => Math.max(0, s - 1));
  };

  const handleGenerateOtp = async () => {
    if (!aadhaar || aadhaar.length !== 12) {
      showToast("Enter valid 12-digit Aadhaar number", "error");
      return;
    }
    setLoading(true);
    try {
      const res = await PostCall("verification/generate-otp", {
        aadhaarNumber: aadhaar,
      });
      const returnedRefId =
        res?.data?.refId || res?.refId || res?.data?.referenceId || "";

      if (res?.success && returnedRefId) {
        setRefId(returnedRefId);
        setStep(1);
      } else if (res?.success) {
        setStep(1);
      } else {
        showToast(res?.message || "Failed to generate OTP", "error");
      }
    } catch (err) {
      console.error(err);
      showToast("Error generating OTP", "error");
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyOtp = async () => {
    if (!otp || otp.length !== 6) {
      showToast("Enter valid 6-digit OTP", "error");
      return;
    }
    setLoading(true);
    try {
      const res = await PostCall("verification/verify-otp", {
        refId,
        otp,
        aadhaarNumber: aadhaar,
      });

      if (res?.success) {
        setVerifyResponse(res.kycData);
        setFormData({
          name: res?.kycData?.name || "",
          aadhaar: aadhaar,
          email: "",
          mobileNumber: "",
          password: "",
          dob: res?.kycData?.dob,
        });

        setStep(2);
      } else {
        showToast(res?.message || "Invalid OTP", "error");
      }
    } catch (err) {
      console.error("OTP verify error:", err);
      const msg =
        err?.response?.data?.message || err?.message || "Error verifying OTP";
      showToast(msg, "error");
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (event) => {
    const value = event.target.value === "true"; // convert to boolean
    setFilter(value);
  };

  const handleEdit = async (id) => {
    try {
      setLoading(true);
      setIsEditMode(true);
      setEditId(id);
      setShowModal(true);
      setStep(2); // jump directly to form

      const res = await PostCall(`admin/GetSubAdminById/${id}`);
      if (res?.success) {
        const subAdminData = res.subAdmin?.subAdmin || {};
        const dob = subAdminData.kycDataId?.dob || res.subAdmin?.dob || "";

        setFormData({
          name: subAdminData.name || "",
          aadhaar: subAdminData.aadhaarNumber || "",
          email: subAdminData.email || "",
          mobileNumber: subAdminData.phone || "",
          password: subAdminData.password || "",
          kycDataId: subAdminData.kycDataId || "",
          // confirmPassword: subAdminData.password || "",
          dob: dob ? dob.split("T")[0] : "",
        });
        setVerifyResponse({
          dob: subAdminData?.dob || "",
          name: subAdminData?.name || "",
        });
      } else {
        showToast(res?.message || "Failed to fetch profile", "error");
        setShowModal(false);
      }
    } catch (err) {
      console.error(err);
      showToast("Error fetching profile", "error");
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) {
      showToast("Please fix form errors before submitting", "error");
      return;
    }

    const body = {
      aadhaarNumber: formData.aadhaar,
      name: formData.name,
      email: formData.email,
      phone: formData.mobileNumber,
      password: formData.password,
      dob: formData.dob,
      kycDataId: verifyResponse._id,
    };

    try {
      let res;
      if (isEditMode) {
        res = await PutCall(`admin/updateSubAdmin/${editId}`, body);
      } else {
        res = await PostCall("auth/register-subadmin", body);
      }

      console.log("API Response:", res);

      if (res?.success) {
        showToast(res?.message || "Sub-admin saved successfully!", "success");
        resetAll();
      } else {
        showToast(res?.message || "Something went wrong!", "error");
      }
    } catch (err) {
      console.error("Error:", err);
      const errorMessage =
        err?.response?.data?.message ||
        err?.message ||
        "An unexpected error occurred.";
      showToast(errorMessage, "error");
    }
  };

  const handleToggleActive = async (id, currentStatus) => {
    try {
      setLoading(true);
      const body = { isActive: !currentStatus };
      const res = await PutCall(`admin/toggleSubAdmin/${id}`, body);

      if (res?.success) {
        showToast(res.message, "success");
        fetchRecentRecords();
      } else {
        showToast(res?.message || "Failed to update status", "success");
      }
    } catch (err) {
      console.error("Error toggling subadmin status:", err);
      showToast("Something went wrong!", "error");
    } finally {
      setLoading(false);
    }
  };

  const fetchRecentRecords = async () => {
    try {
      setLoading(true);
      const response = await PostCall(
        `admin/getAllSubAdmins?recentSubAdmins=${filter}&page=${page}&limit=${pageSize}&query=${debouncedSearch}`
      );
      if (response?.success) {
        setsubadminData(response.subAdmins);
        setTotalPages(response.totalPages || 1);
      } else {
        console.error("Failed to fetch records:", response?.message);
      }
    } catch (error) {
      console.error("Error fetching recent patients:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRecentRecords();
  }, [page, pageSize, filter, debouncedSearch]);

  useEffect(() => {
    setPage(1);
  }, [searchQuery]);

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedSearch(searchQuery);
    }, 1000);

    return () => {
      clearTimeout(handler);
    };
  }, [searchQuery]);

  if (loading) {
    return <Loader />;
  }

  const handleDetails = (id) => {
    navigate(`/sub-admins/sub-adminsdetails/${id}`);
  };

  return (
    <div id="subadmin-view" className="subadmin-container">
      <div className="header">
        <h2 className="title-header">Sub Admin Management</h2>
        <button className="add-btn" onClick={openModal}>
          Add New Sub Admin
        </button>
      </div>
      <div className="filter">
        <div className="actions">
          <div className="search-box">
            <input
              type="text"
              placeholder="Search Aadhaar"
              value={searchQuery}
              onChange={(e) => setsearchQuery(e.target.value.slice(0, 12))}
              maxLength={12}
            />
            <span className="search-icon">
              <FaSearch />
            </span>
          </div>
        </div>
        <div className="filter-subadmin">
          <label htmlFor="filter" className="filter-label">
            Filter:{" "}
          </label>
          <select
            id="filter"
            value={filter.toString()}
            onChange={handleChange}
            className="filter-select"
          >
            <option value="false">All</option>
            <option value="true">Recent</option>
          </select>
        </div>
      </div>

      <div className="list-container">
        {subadminData.length === 0 ? (
          <p className="no-data">No data found</p>
        ) : (
          subadminData.map((admin, index) => (
            <div key={index} className="list-item">
              <div className="list-header">
                <p className="admin-name">{admin.name}</p>
                <div className="actions-action">
                  <div
                    className="action-btn edit-btn"
                    onClick={() => handleEdit(admin._id)}
                  >
                    <FaEdit />
                  </div>
                  <div
                    className={`action-btn ${
                      admin.isActive ? "deactivate-btn" : "activate-btn"
                    }`}
                    onClick={() =>
                      handleToggleActive(admin._id, admin.isActive)
                    }
                  >
                    {admin.isActive ? <FaUserSlash /> : <FaUserCheck />}
                  </div>
                </div>
              </div>

              <div className="list-body">
                <p className="phone">
                  <IoCallOutline /> {admin.phone}
                </p>
              </div>

              <div className="record-footer">
                <button
                  className="view-btn"
                  onClick={() => handleDetails(admin._id)}
                >
                  View Details
                </button>
              </div>
            </div>
          ))
        )}
      </div>

      {showModal && (
        <div className="modal-overlay">
          <div className="modal">
            {/* Aadhaar Flow */}
            {!isEditMode && step === 0 && (
              <>
                <h3>Enter Aadhaar Number</h3>
                <input
                  type="text"
                  value={aadhaar}
                  onChange={(e) =>
                    setAadhaar(e.target.value.replace(/\D/g, "").slice(0, 12))
                  }
                  placeholder="Enter Aadhaar Number"
                  maxLength={12}
                  inputMode="numeric"
                />
                <div className="modal-actions">
                  <button
                    onClick={handleGenerateOtp}
                    className="btn save-btn"
                    disabled={loading}
                  >
                    {loading ? "Sending..." : "Send OTP"}
                  </button>
                  <button className="btn cancel-btn" onClick={resetAll}>
                    Cancel
                  </button>
                </div>
              </>
            )}

            {!isEditMode && step === 1 && (
              <>
                <h3>Enter OTP</h3>
                <input
                  type="text"
                  value={otp}
                  onChange={(e) =>
                    setOtp(e.target.value.replace(/\D/g, "").slice(0, 6))
                  }
                  placeholder="Enter OTP"
                  maxLength={6}
                  inputMode="numeric"
                />
                <div className="modal-actions">
                  <button
                    onClick={handleVerifyOtp}
                    className="btn save-btn"
                    disabled={loading}
                  >
                    {loading ? "Verifying..." : "Verify OTP"}
                  </button>
                  <button className="btn cancel-btn" onClick={resetAll}>
                    Cancel
                  </button>
                  <button
                    className="btn back-btn"
                    type="button"
                    onClick={goBack}
                  >
                    Back
                  </button>
                </div>
              </>
            )}

            {/* Add/Edit Form */}
            {step === 2 && (
              <>
                <h3>{isEditMode ? "Edit Sub Admin" : "Add New Sub Admin"}</h3>
                <form className="modal-form">
                  {/* Aadhaar */}
                  <label>Aadhaar Number</label>
                  <input
                    type="text"
                    name="aadhaar"
                    value={formData.aadhaar}
                    readOnly
                  />

                  {/* Name */}
                  <label>Name</label>
                  <input
                    type="text"
                    name="name"
                    value={formData.name}
                    readOnly={!isEditMode}
                    onChange={handleFormChange}
                  />
                  {errors.name && <p className="error-text">{errors.name}</p>}

                  {/* Email */}
                  <label>Email</label>
                  <input
                    type="email"
                    name="email"
                    placeholder="Enter Email"
                    value={formData.email}
                    onChange={handleFormChange}
                  />
                  {errors.email && <p className="error-text">{errors.email}</p>}

                  {/* Mobile */}
                  <label>Mobile Number</label>
                  <input
                    type="text"
                    name="mobileNumber"
                    placeholder="Enter Mobile Number"
                    value={formData.mobileNumber}
                    onChange={handleFormChange}
                  />
                  {errors.mobileNumber && (
                    <p className="error-text">{errors.mobileNumber}</p>
                  )}

                  {/* DOB */}
                  <label>Date Of Birth</label>
                  <input
                    type="date"
                    name="dob"
                    value={
                      formData?.dob
                        ? moment(formData.dob).format("YYYY-MM-DD")
                        : ""
                    }
                    readOnly
                  />

                  {/* Password */}
                  <div
                    className="password-input-wrapper"
                    style={{ position: "relative" }}
                  >
                    <label>Password</label>
                    <input
                      type={showPassword ? "text" : "password"}
                      name="password"
                      placeholder="Enter Password"
                      value={formData.password}
                      onChange={handleFormChange}
                    />
                    <span
                      onClick={togglePassword}
                      style={{
                        position: "absolute",
                        right: "15px",
                        top: "65%",
                        transform: "translateY(-50%)",
                        cursor: "pointer",
                      }}
                    >
                      {showPassword ? <FaEyeSlash /> : <FaEye />}
                    </span>
                  </div>
                  {errors.password && (
                    <p className="error-text">{errors.password}</p>
                  )}

                  {/* Confirm Password (only for new sub-admins) */}
                  {/* {!isEditMode && (
                    <>
                      <label>Confirm Password</label>
                      <input
                        type={showPassword ? "text" : "password"}
                        name="confirmPassword"
                        placeholder="Confirm Password"
                        value={formData.confirmPassword}
                        onChange={handleFormChange}
                      />
                      {errors.confirmPassword && (
                        <p className="error-text">{errors.confirmPassword}</p>
                      )}
                    </>
                  )} */}

                  {/* Actions */}
                  <div className="modal-actions">
                    <button
                      type="submit"
                      className="btn save-btn"
                      onClick={handleSubmit}
                    >
                      {isEditMode ? "Update" : "Save"}
                    </button>
                    <button
                      type="button"
                      onClick={resetAll}
                      className="btn cancel-btn"
                    >
                      Cancel
                    </button>
                  </div>
                </form>
              </>
            )}
          </div>
        </div>
      )}
      {subadminData?.length > 0 && !filter && (
        <div className="pagination">
          <button
            disabled={page === 1}
            onClick={() => setPage((prev) => prev - 1)}
          >
            <MdOutlineArrowBackIos />
          </button>
          <span>
            Page {page} of {totalPages}
          </span>
          <button
            disabled={page === totalPages}
            onClick={() => setPage((prev) => prev + 1)}
          >
            <MdOutlineArrowForwardIos />
          </button>

          <select
            value={pageSize}
            onChange={(e) => {
              setPageSize(Number(e.target.value));
              setPage(1);
            }}
          >
            <option value={10}>10</option>
            <option value={15}>15</option>
            <option value={20}>20</option>
          </select>
        </div>
      )}
    </div>
  );
};

export default SubAdmin;
