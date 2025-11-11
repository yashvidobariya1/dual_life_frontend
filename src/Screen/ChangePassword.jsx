import React, { useState } from "react";
import "./ChangePassword.css";
import { FaEye, FaEyeSlash } from "react-icons/fa";
import { PutCall } from "./ApiService";

const ChangePassword = () => {
  const [formData, setFormData] = useState({
    oldPassword: "",
    newPassword: "",
    confirmPassword: "",
  });

  const [showPassword, setShowPassword] = useState({
    oldPassword: false,
    newPassword: false,
    confirmPassword: false,
  });

  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const toggleShowPassword = (field) => {
    setShowPassword((prev) => ({ ...prev, [field]: !prev[field] }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (formData.newPassword !== formData.confirmPassword) {
      alert("New Password and Confirm Password do not match!");
      return;
    }

    setLoading(true);
    try {
      const data = {
        currentPassword: formData.oldPassword,
        newPassword: formData.newPassword,
        confirmPassword: formData.confirmPassword,
      };

      const response = await PutCall("auth/change-password", data);

      alert(response.message || "Password changed successfully!");
      setFormData({ oldPassword: "", newPassword: "", confirmPassword: "" });
    } catch (error) {
      console.error("Change Password Error:", error);
      alert(error.message || "Failed to change password.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="change-password-container">
      <h2>Change Password</h2>
      <form onSubmit={handleSubmit} className="change-password-form">
        {/* Old Password */}
        <div className="input-group">
          <label>Old Password</label>
          <div className="password-input">
            <input
              type={showPassword.oldPassword ? "text" : "password"}
              name="oldPassword"
              value={formData.oldPassword}
              onChange={handleChange}
              required
            />
            <span
              className="toggle-icon"
              onClick={() => toggleShowPassword("oldPassword")}
            >
              {showPassword.oldPassword ? <FaEyeSlash /> : <FaEye />}
            </span>
          </div>
        </div>

        {/* New Password */}
        <div className="input-group">
          <label>New Password</label>
          <div className="password-input">
            <input
              type={showPassword.newPassword ? "text" : "password"}
              name="newPassword"
              value={formData.newPassword}
              onChange={handleChange}
              required
            />
            <span
              className="toggle-icon"
              onClick={() => toggleShowPassword("newPassword")}
            >
              {showPassword.newPassword ? <FaEyeSlash /> : <FaEye />}
            </span>
          </div>
        </div>

        {/* Confirm Password */}
        <div className="input-group">
          <label>Confirm Password</label>
          <div className="password-input">
            <input
              type={showPassword.confirmPassword ? "text" : "password"}
              name="confirmPassword"
              value={formData.confirmPassword}
              onChange={handleChange}
              required
            />
            <span
              className="toggle-icon"
              onClick={() => toggleShowPassword("confirmPassword")}
            >
              {showPassword.confirmPassword ? <FaEyeSlash /> : <FaEye />}
            </span>
          </div>
        </div>

        <button type="submit" className="submit-btn" disabled={loading}>
          {loading ? "Changing..." : "Change Password"}
        </button>
      </form>
    </div>
  );
};

export default ChangePassword;
