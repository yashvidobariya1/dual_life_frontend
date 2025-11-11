import React, { useState } from "react";
import "./AdharVerfiy.css";
import { useNavigate } from "react-router-dom";
import { PostCall } from "../Screen/ApiService";
import { showToast } from "../Main/ToastManager";
import Loader from "../Main/Loader";
import { MdHealthAndSafety } from "react-icons/md";

const AdharVerfiy = () => {
  const [aadhaar, setAadhaar] = useState("");
  const [loading, setLoading] = useState(false);
  const [showResults, setShowResults] = useState(false);
  const [showOtpPopup, setShowOtpPopup] = useState(false);
  const [otp, setOtp] = useState("");
  const [refId, setrefId] = useState("");
  const navigate = useNavigate();

  const handleAadhaarChange = (e) => {
    let value = e.target.value.replace(/\D/g, "");
    if (value.length > 12) value = value.substring(0, 12);
    setAadhaar(value);
  };

  const handleFetchClick = async () => {
    if (aadhaar.length !== 12) {
      showToast("Please enter a valid 12-digit Aadhaar number", "error");
      return;
    }
    setLoading(true);
    try {
      const res = await fetch(
        "https://duallife-backend.vercel.app/verification/generate-otp",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ aadhaarNumber: aadhaar }),
        }
      );
      const data = await res.json();
      if (res.ok) {
        setrefId(data.refId);
        setShowOtpPopup(true);
      } else {
        showToast(data.message || "Failed to generate OTP", "error");
      }
    } catch (err) {
      showToast("Something went wrong while generating OTP", "error");
    } finally {
      setLoading(false);
    }
  };

  const handleOtpSubmit = async () => {
    if (otp.length !== 6) {
      showToast("Please enter a valid 6-digit OTP", "error");
      return;
    }
    setLoading(true);
    try {
      const res = await PostCall("verification/verify-otp", {
        refId,
        otp,
        aadhaarNumber: aadhaar,
      });

      if (res.success) {
        localStorage.setItem("adharverifytoken", JSON.stringify(res.token));
        localStorage.setItem("adharnumber", aadhaar);
        showToast(res.message, "success");
        navigate(`/userdashboard`);
      } else {
        showToast(res.message || "OTP verification failed", "error");
      }
    } catch (err) {
      console.error("OTP Verify Error:", err);
      showToast("Something went wrong while verifying OTP", "error");
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <Loader />;
  }

  return (
    <div className="adharverfiy-div">
      <div className="portal-container">
        <header className="portal-header">
          <div className="icon-circle">
            <i className="fa-heartbeat">
              <MdHealthAndSafety />
            </i>
          </div>
          <h1>Dual Life Science Healthcare Portal </h1>
          <p>
            View your medical test results securely using Aadhaar authentication
          </p>
        </header>

        {!showResults && (
          <div className="card-adhar">
            <h2>Enter Aadhaar Details</h2>
            <p>Aadhaar Number</p>
            <div className="input-wrapper">
              <input
                type="text"
                value={aadhaar}
                onChange={handleAadhaarChange}
                placeholder="Enter 12-digit Aadhaar number"
              />
              <i className="fas fa-id-card-adhar input-icon"></i>
            </div>
            <button
              onClick={handleFetchClick}
              disabled={loading}
              className="fetching-button"
            >
              <i className="fas fa-search"></i> Fetch Results
            </button>
            <p className="secure-text">
              <i className="fas fa-lock"></i> Your data is securely processed
              and never stored
            </p>
          </div>
        )}

        {showOtpPopup && (
          <div className="otp-popup">
            <div className="otp-popup-content">
              <h2>Enter OTP</h2>
              <p>We’ve sent a 6-digit OTP to your registered mobile.</p>
              <input
                type="text"
                maxLength="6"
                value={otp}
                onChange={(e) => setOtp(e.target.value.replace(/\D/g, ""))}
                placeholder="Enter OTP"
              />
              <div className="otp-buttons">
                <button onClick={() => setShowOtpPopup(false)}>Cancel</button>
                <button onClick={handleOtpSubmit}>Verify</button>
              </div>
            </div>
          </div>
        )}

        <footer className="portal-footer">
          <p>
            © 2023 Dual Life Science Healthcare Platform. All rights reserved.
          </p>
          <p>Secured with Aadhaar authentication • Data privacy compliant</p>
        </footer>
      </div>
    </div>
  );
};

export default AdharVerfiy;
