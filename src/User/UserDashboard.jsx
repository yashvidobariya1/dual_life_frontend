import React, { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import "./Userdashboard.css";
import { FaLandmarkFlag, FaRegFilePdf } from "react-icons/fa6";
import { MdHealthAndSafety, MdOutlineScience } from "react-icons/md";
import { FaCamera, FaIdCard } from "react-icons/fa";
import Loader from "../Main/Loader";
import html2canvas from "html2canvas";
import jsPDF from "jspdf";
import { saveAs } from "file-saver";

const UserDashboard = () => {
  const id = localStorage.getItem("adharnumber");
  const [reportData, setReportData] = useState(null);
  const [loading, setLoading] = useState(true);
  const Navigate = useNavigate();
  const cardRef = useRef();

  const getToken = () => {
    const token = JSON.parse(localStorage.getItem("adharverifytoken"));
    console.log("token", token);
    return token;
  };

  const downloadPDF = async () => {
    const pdf = new jsPDF("p", "mm", "a4");
    const margin = 10;
    const gap = 15;

    // FRONT
    const frontElement = document.querySelector(".health-card.front");
    const frontCanvas = await html2canvas(frontElement, { scale: 1.5 });
    const frontImg = frontCanvas.toDataURL("image/png");
    const pdfWidth = pdf.internal.pageSize.getWidth() - margin * 2;
    const frontHeight = (frontCanvas.height * pdfWidth) / frontCanvas.width;

    // BACK
    const backElement = document.querySelector(".health-card.back");
    const backCanvas = await html2canvas(backElement, { scale: 1.5 });
    const backImg = backCanvas.toDataURL("image/png");
    const backHeight = (backCanvas.height * pdfWidth) / backCanvas.width;

    // Add to PDF
    let y = margin;
    pdf.addImage(frontImg, "PNG", margin, y, pdfWidth, frontHeight);
    y += frontHeight + gap;
    pdf.addImage(backImg, "PNG", margin, y, pdfWidth, backHeight);

    // Create blob
    const pdfBlob = pdf.output("blob");
    const pdfUrl = URL.createObjectURL(pdfBlob);

    // Detect iOS Safari
    const isIOS =
      /iPad|iPhone|iPod/.test(navigator.userAgent) && !window.MSStream;

    if (isIOS) {
      // Open in new tab (works in iOS Safari)
      window.open(pdfUrl, "_blank");
    } else {
      // Normal download (desktop + Android)
      saveAs(pdfBlob, "health-card.pdf");
    }
  };

  useEffect(() => {
    const fetchReportData = async () => {
      try {
        setLoading(true); // start loading

        const response = await fetch(
          `https://duallife-backend.vercel.app/report/by-aadhaar/${id}`,
          {
            method: "GET",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${getToken()}`,
            },
          }
        );

        const data = await response.json(); // parse JSON once

        if (response.ok && data.success && data.reports?.length > 0) {
          setReportData(data.reports[0]); // set first report
        } else {
          setReportData(null); // no data case
        }
      } catch (error) {
        console.error("Error fetching report:", error);
        setReportData(null);
      } finally {
        setLoading(false); // stop loading in all cases
      }
    };

    fetchReportData();
  }, [id]);

  if (!reportData) return <Loader />;

  const { patient, healthResults, testImages } = reportData;

  if (loading) {
    return <Loader />;
  }

  const handlelogout = () => {
    localStorage.clear();
    localStorage.removeItem("adharverifytoken");
    localStorage.removeItem("adharnumber");
    Navigate("/");
  };

  return (
    <div className="adharverfiy-div">
      <div className="dashboard-portal-container">
        <header className="portal-header">
          <div className="icon-circle">
            <i className="fa-heartbeat">
              <MdHealthAndSafety />
            </i>
          </div>
          <h1>Dual Life Science Healthcare Portal</h1>
          <p>
            View your medical test results securely using Aadhaar authentication
          </p>
        </header>

        <div className="results">
          <div className="logout">
            <button onClick={handlelogout}>Logout</button>
          </div>
          <div className="card-adhar user-card-adhar">
            <div className="card-detialls">
              <img
                src={
                  patient?.photo
                    ? `data:image/jpeg;base64,${patient.photo}`
                    : "/image/123.jpg"
                }
                alt="User"
                className="user-photo"
              />
              <div className="user-details">
                <h2>{patient?.name}</h2>
                <p>{patient?.address}</p>
                <p>
                  <strong>DOB:</strong>{" "}
                  {new Date(patient?.dateOfBirth).toLocaleDateString()}
                </p>
                <p>
                  <strong>Blood Group:</strong> {healthResults?.bloodGroup}
                </p>
              </div>
            </div>
            <button className="download-btn">
              <FaRegFilePdf />
              <h6 onClick={downloadPDF}> Download Health Card</h6>
            </button>
          </div>
          <div className="card-adhar">
            <h2>
              <i className="icon-latest-dashbaord">
                <MdOutlineScience />
              </i>{" "}
              Latest Test Results
            </h2>
            {healthResults && (
              <div>
                {healthResults?.length > 0 ? (
                  healthResults.map((testItem) => (
                    <div className="test-item">
                      <div>
                        <h3>{testItem.name}</h3>
                        <p>Normal range: {testItem.value}</p>
                      </div>
                      <div className="item-content">
                        <strong>
                          {testItem.value}
                          {/* <p> {testItem.value}</p> */}
                        </strong>
                        <h4 className="normal-range-dashboard">
                          {healthResults.status}
                        </h4>
                      </div>
                    </div>
                  ))
                ) : (
                  <p>No test data available</p>
                )}

                {/* {healthResults.glucose && (
                  <div className="test-item">
                    <div>
                      <h3>Glucose</h3>
                      <p>
                        Normal range: {healthResults.glucose.normalRange.min}-
                        {healthResults.glucose.normalRange.max}{" "}
                        <p>{healthResults.glucose.unit}</p>
                      </p>
                    </div>
                    <div className="item-content">
                      <strong>
                        {healthResults.glucose.value}{" "}
                        <p>{healthResults.glucose.unit}</p>
                      </strong>
                      <h4 className="normal-range-dashboard">
                        {healthResults.glucose.status}
                      </h4>
                    </div>
                  </div>
                )}

                {healthResults.sickleCell && (
                  <div className="test-item">
                    <div>
                      <h3>Sickle Cell</h3>
                      <p>Result: {healthResults.sickleCell.result}</p>
                    </div>
                    <div className="item-content">
                      <p>{healthResults.sickleCell.status}</p>
                    </div>
                  </div>
                )} */}
              </div>
            )}
          </div>
          <div className="card-adhar">
            <h2>
              <div className="camera-record">
                <FaCamera className="icon-camera" />
                Test Device Images
              </div>
            </h2>
            <div className="image-grid">
              {testImages?.map((img, i) => (
                <div key={i} className="image-card-adhar">
                  <img
                    src={`data:image/png;base64,${img.imageData}`}
                    alt={img.imageType}
                  />
                  <p>{img.imageType}</p>
                </div>
              ))}
            </div>
          </div>
          <div className="card-adhar">
            <h2>
              <div className="camera-record">
                <FaIdCard className="icon-camera" />
                Health Card Preview
              </div>
            </h2>
            <div className="image-grid-card">
              <div className="health-card-container" ref={cardRef}>
                <div className="health-card front">
                  <div className="card-title">
                    <div className="flex-card">
                      <div className="card-icon">
                        <FaLandmarkFlag className="mark-icon" />
                      </div>
                      <div className="card-content">
                        <h3>Tribal Development Department</h3>
                        <p>Goverment of Country Name</p>
                      </div>
                    </div>
                  </div>
                  <p>
                    <strong>Name:</strong> {patient?.name}
                  </p>
                  <p>
                    <strong>Age:</strong> {patient?.age || "N/A"}
                  </p>
                  <p>
                    <strong>Gender:</strong> {patient?.gender || "N/A"}
                  </p>
                  <p>
                    <strong>Address:</strong> {patient?.address}
                  </p>
                  <p>
                    <strong>Caste:</strong> {patient?.caste || "N/A"}
                  </p>
                </div>

                <div className="health-card back">
                  <div className="card-title">
                    <div className="flex-card">
                      <div className="card-icon">
                        <FaLandmarkFlag className="mark-icon" />
                      </div>
                      <div className="card-content">
                        <h3>Tribal Development Department</h3>
                        <p>Goverment of Country Name</p>
                      </div>
                    </div>
                  </div>
                  <p>
                    <strong>Hemoglobin:</strong>{" "}
                    {healthResults?.hemoglobin?.value}{" "}
                    {healthResults?.hemoglobin?.unit}
                  </p>
                  <p>
                    <strong>Glucose:</strong> {healthResults?.glucose?.value}{" "}
                    {healthResults?.glucose?.unit}
                  </p>
                  <p>
                    <strong>Blood Group:</strong> {healthResults?.bloodGroup}
                  </p>
                  <p>
                    <strong>Sickle Cell:</strong>{" "}
                    {healthResults?.sickleCell?.result}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

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

export default UserDashboard;
