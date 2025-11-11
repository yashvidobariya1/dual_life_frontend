import React, { useEffect, useState } from "react";
import { GetCall, PostCall, PutCall } from "../Screen/ApiService";
import Loader from "../Main/Loader"; // make sure this exists
import "./Account.css";
import { showToast } from "../Main/ToastManager";

const Account = () => {
  const [profile, setProfile] = useState(null);
  const [editMode, setEditMode] = useState(false);
  const [formData, setFormData] = useState({});
  const [loading, setLoading] = useState(false);

  // Fetch profile on load
  useEffect(() => {
    const fetchProfile = async () => {
      setLoading(true);
      try {
        const response = await GetCall("auth/me");
        if (response?.success) {
          setProfile(response.user); // ✅ fixed (response.user not response.data)
          setFormData(response.user);
        }
      } catch (error) {
        console.error("Error fetching profile:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchProfile();
  }, []);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSave = async () => {
    setLoading(true);

    try {
      const response = await PutCall("auth/update-profile", formData);
      if (response?.success) {
        setProfile(formData);
        setEditMode(false);
        showToast(response?.message, "success");
      } else {
        showToast("Update failed!", "error");
      }
    } catch (error) {
      console.error(error.message, error);
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => {
    setFormData(profile);
    setEditMode(false);
  };

  if (loading) {
    return <Loader />;
  }

  if (!profile) {
    return <p>No profile data found.</p>;
  }

  return (
    <div className="card-main">
      <div className="account-card">
        <div className="account-container">
          <div className="account-flex">
            <img
              src={`https://ui-avatars.com/api/?name=${encodeURIComponent(
                profile.name
              )}&background=0D8ABC&color=fff&size=128`}
              alt={profile.name}
              className="account-avatar"
            />
            <div className="name-details">
              <h2 className="account-name">{profile.name}</h2>
              <p className="account-email">{profile.email}</p>
            </div>
          </div>

          {/* Info Section */}
          <div className="account-info">
            <label>
              Name:
              <input
                type="text"
                name="name"
                value={formData.name || ""}
                disabled
                onChange={handleChange}
              />
            </label>
            <label>
              Email:
              <input
                type="email"
                name="email"
                value={formData.email || ""}
                disabled={!editMode}
                onChange={handleChange}
              />
            </label>
            <label>
              Phone:
              <input
                type="text"
                name="phone"
                value={formData.phone || ""}
                disabled={!editMode}
                onChange={handleChange}
              />
            </label>
            <label>
              Aadhaar:
              <input
                type="text"
                name="aadhaarNumber"
                value={formData.aadhaarNumber || ""}
                disabled
                onChange={handleChange}
              />
            </label>

            <p>
              <span>User ID:</span> {profile.userId}
            </p>
            <p>
              <span>Role:</span> {profile.role}
            </p>
            <p>
              <span>Status:</span>{" "}
              <span
                className={`status ${profile.isActive ? "active" : "inactive"}`}
              >
                {profile.isActive ? "Active" : "Inactive"}
              </span>
            </p>

            <div className="kits-info">
              <h3>Kits Information</h3>
              <p>Kits Available: {profile.kitInventory?.kitsAvailable}</p>
              <p>Kits Used: {profile.kitInventory?.kitsUsed}</p>
              <p>
                Lifetime Kits Assigned:{" "}
                {profile.kitInventory?.lifetimeKitsAssigned}
              </p>
            </div>

            <p>
              <span>Last Login:</span>{" "}
              {profile.lastLogin
                ? new Date(profile.lastLogin).toLocaleString()
                : "Never"}
            </p>
          </div>

          {/* Action buttons */}
          <div className="account-actions">
            {!editMode ? (
              <button onClick={() => setEditMode(true)}>Edit</button>
            ) : (
              <>
                <button onClick={handleSave} disabled={loading}>
                  {loading ? "Saving..." : "Save"}
                </button>
                <button onClick={handleCancel} disabled={loading}>
                  Cancel
                </button>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Account;
