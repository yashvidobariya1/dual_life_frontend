import React, { useEffect, useState } from "react";
import "./SubadminDetials.css";
import { useNavigate, useParams } from "react-router-dom";
import { PostCall } from "./ApiService";
import Loader from "../Main/Loader";
import { showToast } from "../Main/ToastManager"; // optional if you use toast

const SubadminDetials = () => {
  const { id } = useParams();
  const [subadminDetails, setSubadminDetials] = useState({});
  const [recordhealthDetials, setrecordhealthDetials] = useState([]);
  const [loading, setLoading] = useState(true);
  const [assignkit, setassignkit] = useState(false);
  const [removekit, setremovekit] = useState(false);
  const [formdata, setFormdata] = useState({
    kitsToAssign: "",
    kitsToRemove: "",
  });
  const navigate = useNavigate();

  // fetch details
  useEffect(() => {
    const fetchPatientDetails = async () => {
      try {
        setLoading(true);
        const response = await PostCall(`admin/GetSubAdminById/${id}`);
        if (response?.success) {
          const subAdmin = response?.subAdmin?.subAdmin || {};
          const dob = response?.subAdmin?.dob || null;

          setSubadminDetials({
            ...subAdmin,
            dob,
            performance: subAdmin.performance || {},
            KitInventory: subAdmin.KitInventory || {},
            kitsAssigned: subAdmin.kitsAssigned || 0,
            kitUsageHistory: subAdmin.kitUsageHistory || [],
            patientHistory: subAdmin.patientHistory || [],
          });

          setrecordhealthDetials(
            response?.subAdmin?.reports?.[0]?.healthResults || {}
          );
        } else {
          console.error("Failed to fetch patient:", response?.message);
        }
      } catch (error) {
        console.error("Error fetching patient details:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchPatientDetails();
  }, [id]);

  if (loading) return <Loader />;

  const handleinputopen = () => {
    setassignkit((prev) => !prev); // toggle assign box
    setremovekit(false); // ensure remove is closed
  };

  const handleRemoveInputOpen = () => {
    setremovekit((prev) => !prev); // toggle remove box
    setassignkit(false); // ensure assign is closed
  };

  // handle change for input
  const handleChange = (e) => {
    setFormdata({ ...formdata, [e.target.name]: e.target.value });
  };

  // assign kits API call
  const handleassignkit = async () => {
    if (!formdata.kitsToAssign || Number(formdata.kitsToAssign) <= 0) {
      showToast("Enter valid number of kits", "error");
      return;
    }
    const payload = {
      subAdminId: id,
      kitsToAssign: Number(formdata.kitsToAssign),
    };

    try {
      setLoading(true);
      const response = await PostCall(`admin/assignKitsToSubAdmin`, payload);
      if (response?.success) {
        showToast("Kits assigned successfully", "success");
        setassignkit(false);
        setFormdata({ kitsToAssign: "" });
        const refreshed = await PostCall(`admin/GetSubAdminById/${id}`);
        if (refreshed?.success) {
          setSubadminDetials(refreshed?.subAdmin?.subAdmin || {});
          setassignkit(false);
        }
      } else {
        showToast(response?.message || "Failed to assign kits", "error");
      }
    } catch (error) {
      console.error("Error assigning kits:", error);
      showToast("Something went wrong", "error");
    } finally {
      setLoading(false);
    }
  };

  const handleremovekit = async () => {
    if (!formdata.kitsToRemove || Number(formdata.kitsToRemove) <= 0) {
      showToast("Enter valid number of kits to remove", "error");
      return;
    }
    const payload = {
      subAdminId: id,
      kitsToRemove: Number(formdata.kitsToRemove),
    };

    try {
      setLoading(true);
      const response = await PostCall(`admin/removeKitsFromSubAdmin`, payload);
      if (response?.success) {
        showToast("Kits removed successfully", "success");
        setremovekit(false);
        setFormdata({ ...formdata, kitsToRemove: "" });
        const refreshed = await PostCall(`admin/GetSubAdminById/${id}`);
        if (refreshed?.success) {
          setSubadminDetials(refreshed?.subAdmin?.subAdmin || {});
        }
      } else {
        showToast(response?.message || "Failed to remove kits", "error");
      }
    } catch (error) {
      console.error("Error removing kits:", error);
      showToast("Something went wrong", "error");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div id="test-details-view" className="test-details-container">
      <div className="header">
        <h2 className="title">Sub Admin Details</h2>
        <button className="btn btn-back" onClick={() => navigate(-1)}>
          Back to List
        </button>
      </div>

      <div className="card-testdetails">
        <div className="card-header">Aadhaar Information</div>
        <div className="card-body">
          <div className="grid two-cols">
            <div>
              <div className="user-info-subadmin">
                <div>
                  <h4 className="user-name">{subadminDetails?.name}</h4>
                  <p className="user-aadhaar">
                    Aadhaar:{" "}
                    <span className="aadhaar-mask">
                      XXXX-XXXX-{subadminDetails?.aadhaarNumber?.slice(-4)}
                    </span>
                  </p>
                  <p className="user-phone">Phone: {subadminDetails.phone}</p>
                  <p className="user-phone">Email: {subadminDetails.email}</p>
                  <p className="user-phone">
                    Sub-Admin Id: {subadminDetails.subAdminId}
                  </p>
                  <p className="user-phone">
                    Date of Birth:{" "}
                    {new Date(subadminDetails?.dob).toLocaleDateString()}
                  </p>
                </div>
                <div className="subadmin-details">
                  <div className="address">
                    <span className="label-subadmin">Performance</span>
                    <p>
                      Total Tests: {subadminDetails?.performance?.totalTests}
                    </p>
                    <p>
                      Kits Assigned:{" "}
                      {subadminDetails?.performance?.successfulTests}
                    </p>
                    <p>Kit Used: {subadminDetails?.performance?.failedTests}</p>
                  </div>
                  <div className="address">
                    <span className="label-subadmin">Kit Inventory</span>
                    <p>Kit Used: {subadminDetails?.KitInventory?.kitUsed}</p>
                    <p>
                      Kit Available:{" "}
                      {subadminDetails?.KitInventory?.kitAvailable}
                    </p>
                    <p>
                      Lifetime Kit Used:{" "}
                      {subadminDetails?.KitInventory?.lifetimekitUsed}
                    </p>
                    <div className="action-button">
                      <button onClick={handleinputopen} className="assign-kit">
                        Assign kits
                      </button>
                      <button
                        onClick={handleRemoveInputOpen}
                        className="assign-kit"
                      >
                        Remove kits
                      </button>
                    </div>
                    <div className="assignkit-div">
                      <div className="action-button-subadmin">
                        {assignkit && (
                          <>
                            <input
                              type="number"
                              name="kitsToAssign"
                              value={formdata.kitsToAssign}
                              onChange={handleChange}
                              placeholder="Enter kits to assign"
                            />
                            <button onClick={handleassignkit}>Submit</button>
                          </>
                        )}
                      </div>
                      <div className="action-button-subadmin">
                        {removekit && (
                          <>
                            <input
                              type="number"
                              name="kitsToRemove"
                              value={formdata.kitsToRemove}
                              onChange={handleChange}
                              placeholder="Enter kits to remove"
                            />
                            <button onClick={handleremovekit}>Submit</button>
                          </>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
          {/* <div className="card-header test-data">Test Data</div> */}
          <div className="card-body"></div>
        </div>
      </div>
    </div>
  );
};

export default SubadminDetials;
