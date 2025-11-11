import React, { useEffect, useState } from "react";
import "./RecordDetails.css";
import { useNavigate, useParams } from "react-router-dom";
import { PostCall } from "./ApiService";
import Loader from "../Main/Loader";

const RecordDetails = () => {
  const { id } = useParams();
  const [recordDetails, setRecordDetails] = useState([]);
  const [recordhealthDetials, setrecordhealthDetials] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchPatientDetails = async () => {
      try {
        setLoading(true);
        const response = await PostCall(`admin/getPatientById/${id}`);
        if (response?.success) {
          setRecordDetails(response?.patient);
          setrecordhealthDetials(
            response?.patient?.reports?.[0]?.healthResults || {}
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

  if (loading) {
    return <Loader />;
  }

  return (
    <div id="test-details-view" className="test-details-container">
      <div className="header">
        <h2 className="title">Test Record Details</h2>
        <button className="btn btn-back" onClick={() => navigate(-1)}>
          Back to List
        </button>
      </div>

      <div className="card-testdetails">
        {/* Aadhaar Info */}
        <div className="card-header">Aadhaar Information</div>
        <div className="card-body">
          <div className="grid two-cols">
            <div>
              <div className="user-info">
                <img
                  className="user-avatar"
                  src={
                    recordDetails.photo
                      ? `data:image/jpeg;base64,${recordDetails.photo}`
                      : "https://via.placeholder.com/150"
                  }
                  alt="User"
                />
                <div>
                  <h4 className="user-name">{recordDetails.name}</h4>
                  <p className="user-aadhaar">
                    Aadhaar:{" "}
                    <span className="aadhaar-mask">
                      XXXX-XXXX-{recordDetails.aadhaarNumber?.slice(-4)}
                    </span>
                  </p>
                  <p className="user-phone">Phone: {recordDetails.phone}</p>
                </div>
              </div>
              <div className="address">
                <p>
                  <span className="label">Address:</span>{" "}
                  {recordDetails.address}
                </p>
              </div>
            </div>

            <div className="doc-box">
              <h4 className="doc-title">Uploaded Documents</h4>
              <div className="doc-grid">
                {recordDetails?.reports?.length > 0 ? (
                  recordDetails.reports.map((report, reportIndex) =>
                    report?.testImages?.length > 0 ? (
                      report.testImages.map((img, imgIndex) => (
                        <div
                          className="doc-item"
                          key={`${reportIndex}-${imgIndex}`}
                        >
                          <img
                            src={`data:image/jpeg;base64,${img.imageData}`}
                            alt={img.imageType || `Document ${imgIndex + 1}`}
                          />
                          <p>{img.imageType || `Document ${imgIndex + 1}`}</p>
                        </div>
                      ))
                    ) : (
                      <p key={reportIndex}>
                        No documents uploaded for this report
                      </p>
                    )
                  )
                ) : (
                  <p>No reports available</p>
                )}
              </div>
            </div>
          </div>
        </div>

        <div className="card-header test-data">Test Data</div>
        <div className="card-body">
          <div className="grid three-cols">
            {recordhealthDetials?.length > 0 ? (
              recordhealthDetials.map((testItem) => (
                <div className="field" key={testItem._id}>
                  <label>{testItem.testName || "Unknown Test"}</label>
                  <input type="text" value={testItem.value || "-"} disabled />
                </div>
              ))
            ) : (
              <p>No test data available</p>
            )}
          </div>
        </div>

        <div className="card-footer">
          <p className="submitted">Submitted by: {recordDetails.name}</p>
        </div>
      </div>
    </div>
  );
};

export default RecordDetails;
