import React, { useState } from "react";
import "./Login.css";
import img1 from "../Images/bg.jpg";
import { PostCall } from "../Screen/ApiService";
import { useNavigate } from "react-router-dom";
import { loginSuccess } from "../Store/authSlice";
import { useDispatch } from "react-redux";
import { showToast } from "../Main/ToastManager";
import { FaEye, FaEyeSlash } from "react-icons/fa";

const Login = () => {
  const [isLogin, setIsLogin] = useState(true);
  const Navigate = useNavigate();
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false); // <-- NEW
  const dispatch = useDispatch();

  const [formData, setFormData] = useState({
    fullName: "",
    adhar: "",
    email: "",
    phone: "",
    password: "",
    confirmPassword: "",
  });

  const [errors, setErrors] = useState({});

  const validateField = (name, value) => {
    let error = "";
    switch (name) {
      case "email":
        if (!value) error = "Email is required";
        else if (!/\S+@\S+\.\S+/.test(value)) error = "Invalid email format";
        break;
      case "password":
        if (!value) error = "Password is required";
        else if (value.length < 6)
          error = "Password must be at least 6 characters";
        break;
      default:
        break;
    }
    return error;
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
    setErrors((prev) => ({
      ...prev,
      [name]: validateField(name, value),
    }));
  };

  const validateForm = () => {
    let newErrors = {};
    if (isLogin) {
      newErrors.email = validateField("email", formData.email);
      newErrors.password = validateField("password", formData.password);
    }
    setErrors(newErrors);
    return Object.values(newErrors).every((err) => err === "");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;

    try {
      setLoading(true); // <-- start loading
      if (isLogin) {
        const res = await PostCall("auth/login", {
          email: formData.email,
          password: formData.password,
        });

        localStorage.setItem("token", JSON.stringify(res.token));
        showToast(res?.message, "success");
        dispatch(
          loginSuccess({
            user: res.user,
            token: res.token,
          })
        );
        Navigate("/dashboard");
      }
    } catch (error) {
      showToast(error?.message, "error");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-main-div">
      <img src={img1} alt="bg" />
      <div className="auth-container">
        <div className="auth-box">
          <h1>Welcome To Dual Life</h1>
          <h2>{isLogin ? "Login" : "Sign Up"} to your Account</h2>

          <form onSubmit={handleSubmit}>
            <div className="input-group">
              <label>Email</label>
              <input
                type="text"
                name="email"
                placeholder="Enter your email"
                value={formData.email}
                onChange={handleChange}
              />
              {errors.email && <p className="error-text">{errors.email}</p>}
            </div>

            <div className="input-group" style={{ position: "relative" }}>
              <label>Password</label>
              <input
                type={showPassword ? "text" : "password"}
                name="password"
                placeholder="Enter your password"
                value={formData.password}
                onChange={handleChange}
              />
              <span
                onClick={() => setShowPassword((prev) => !prev)}
                style={{
                  position: "absolute",
                  right: "15px",
                  top: "73%",
                  transform: "translateY(-50%)",
                  cursor: "pointer",
                }}
              >
                {showPassword ? <FaEyeSlash /> : <FaEye />}
              </span>
              {errors.password && (
                <p className="error-text">{errors.password}</p>
              )}
            </div>

            <button
              type="submit"
              className="auth-btn"
              disabled={loading} // disable while loading
            >
              {loading ? "Loading..." : isLogin ? "Login" : "Sign Up"}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default Login;
