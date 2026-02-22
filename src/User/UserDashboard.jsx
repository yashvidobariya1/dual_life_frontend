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
  const [reportList, setReportList] = useState([]);
  const [selectedReportId, setSelectedReportId] = useState("");
  const [loading, setLoading] = useState(true);

  const Navigate = useNavigate();
  const cardRef = useRef();

  const getToken = () => {
    return JSON.parse(localStorage.getItem("adharverifytoken"));
  };

  // ================= FETCH REPORTS =================
  useEffect(() => {
    const fetchReportData = async () => {
      try {
        setLoading(true);

        const response = await fetch(
          `https://duallife-backend.vercel.app/report/by-aadhaar/${id}`,
          {
            method: "GET",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${getToken()}`,
            },
          },
        );

        const data = await response.json();

        if (response.ok && data.success && data.reports?.length > 0) {
          // Sort by latest createdAt
          const sortedReports = data.reports.sort(
            (a, b) => new Date(b.createdAt) - new Date(a.createdAt),
          );

          setReportList(sortedReports);

          // Set latest report by default
          setReportData(sortedReports[0]);
          setSelectedReportId(sortedReports[0]._id);
        } else {
          setReportList([]);
          setReportData(null);
        }
      } catch (error) {
        console.error("Error fetching reports:", error);
        setReportList([]);
        setReportData(null);
      } finally {
        setLoading(false);
      }
    };

    if (id) fetchReportData();
  }, [id]);

  // ================= HANDLE DROPDOWN CHANGE =================
  const handleReportChange = (e) => {
    const selectedId = e.target.value;
    setSelectedReportId(selectedId);

    const selectedReport = reportList.find(
      (report) => report._id === selectedId,
    );

    if (selectedReport) {
      setReportData(selectedReport);
    }
  };

  // ================= LOGOUT =================
  const handlelogout = () => {
    localStorage.clear();
    Navigate("/");
  };

  // ================= DOWNLOAD PDF =================
  const downloadPDF = async () => {
    const pdf = new jsPDF("p", "mm", "a4");

    const margin = 5;
    const pageHeight = pdf.internal.pageSize.getHeight() - margin * 2;
    const pdfWidth = pdf.internal.pageSize.getWidth() - margin * 2;

    const frontElement = document.querySelector(".health-card.front");
    const backElement = document.querySelector(".health-card.back");

    if (!frontElement || !backElement) {
      console.error("Health card elements not found");
      return;
    }

    try {
      const frontCanvas = await html2canvas(frontElement, {
        scale: 2,
        useCORS: true,
      });
      const backCanvas = await html2canvas(backElement, {
        scale: 2,
        useCORS: true,
      });

      const frontHeight = (frontCanvas.height * pdfWidth) / frontCanvas.width;
      const backHeight = (backCanvas.height * pdfWidth) / backCanvas.width;

      let currentPage = 1;
      let y = margin;

      // ===== ADD FRONT CARD =====
      if (y + frontHeight <= pageHeight) {
        pdf.addImage(
          frontCanvas.toDataURL("image/png"),
          "PNG",
          margin,
          y,
          pdfWidth,
          frontHeight,
        );
        y += frontHeight + 15; // Add spacing between cards
      } else {
        pdf.addPage();
        currentPage++;
        y = margin;
        pdf.addImage(
          frontCanvas.toDataURL("image/png"),
          "PNG",
          margin,
          y,
          pdfWidth,
          frontHeight,
        );
        y += frontHeight;
      }

      // ===== ADD BACK CARD =====
      if (y + backHeight <= pageHeight) {
        pdf.addImage(
          backCanvas.toDataURL("image/png"),
          "PNG",
          margin,
          y,
          pdfWidth,
          backHeight,
        );
      } else {
        pdf.addPage();
        y = margin;
        pdf.addImage(
          backCanvas.toDataURL("image/png"),
          "PNG",
          margin,
          y,
          pdfWidth,
          backHeight,
        );
      }

      // ===== ADD DOWNLOAD DATE TEXT =====
      const downloadDate = new Date().toLocaleDateString();
      let yFooter = y + backHeight;

      if (yFooter > pageHeight) {
        pdf.addPage();
        yFooter = margin;
      }

      pdf.setFontSize(10);
      pdf.text(`Downloaded At: ${downloadDate}`, margin, yFooter + 7);

      pdf.save(`${downloadDate} health-card.pdf`);
    } catch (error) {
      console.error("Error generating PDF:", error);
    }
  };

  // ================= LOADING =================
  if (loading) return <Loader />;
  if (!reportData) return <Loader />;

  const { patient, healthResults, testImages } = reportData;

  return (
    <div className="adharverfiy-div">
      <div className="dashboard-portal-container">
        {/* HEADER */}
        <header className="portal-header">
          <div className="icon-circle">
            <MdHealthAndSafety />
          </div>
          <h1>Dual Life Science Healthcare Portal</h1>
          <p>
            View your medical test results securely using Aadhaar authentication
          </p>
        </header>

        {/* DROPDOWN + LOGOUT */}
        <div className="logout-bar">
          <select
            value={selectedReportId}
            onChange={handleReportChange}
            className="report-dropdown"
          >
            {reportList.map((report) => (
              <option key={report._id} value={report._id}>
                {new Date(report.createdAt).toLocaleDateString()}
              </option>
            ))}
          </select>

          <button className="logout-btn" onClick={handlelogout}>
            Logout
          </button>
        </div>

        {/* PATIENT CARD */}
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
            </div>
          </div>

          <button className="download-btn" onClick={downloadPDF}>
            <FaRegFilePdf /> Download Health Card
          </button>
        </div>

        {/* TEST RESULTS */}
        <div className="card-adhar">
          <h2>
            <MdOutlineScience /> Test Results
          </h2>

          {healthResults?.length > 0 ? (
            healthResults.map((test) => (
              <div className="test-item" key={test._id}>
                <h3>{test.testName}</h3>
                <p>
                  {test.value} - {test.status}
                </p>
              </div>
            ))
          ) : (
            <p>No test data available</p>
          )}
        </div>

        {/* TEST IMAGES */}
        <div className="card-adhar">
          <h2>
            <FaCamera /> Test Device Images
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
                <p>
                  Create At -
                  {patient?.createdAt
                    ? new Date(patient.createdAt).toLocaleDateString()
                    : ""}
                </p>

                <p className="download-date-info">
                  Download At -
                  {patient?.downloadedAt
                    ? new Date(patient.downloadedAt).toLocaleDateString()
                    : ""}
                </p>

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
                {/* <p>
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
                  </p> */}

                {healthResults && (
                  <div>
                    {healthResults?.length > 0 ? (
                      healthResults.map((testItem) => (
                        <div className="test-item1" key={testItem.id}>
                          {/* <div> */}
                          {/* <strong>Test Name</strong>{" "} */}
                          <p>{testItem.testName}</p> -{" "}
                          <p>{testItem.value} - </p>
                          <p>{testItem.status}</p>
                        </div>
                        // </div>
                      ))
                    ) : (
                      <p>No test data available</p>
                    )}
                  </div>
                )}
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
  );
};

export default UserDashboard;
