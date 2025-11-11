import React, { useEffect, useState } from "react";
import "./TestRecord.css";
import { useNavigate } from "react-router-dom";
import { RiAdminFill } from "react-icons/ri";
import { HiCalendarDateRange } from "react-icons/hi2";
import { FaSearch } from "react-icons/fa";
import moment from "moment";
import { PostCall } from "./ApiService";
import Loader from "../Main/Loader";
import {
  MdOutlineArrowBackIos,
  MdOutlineArrowForwardIos,
} from "react-icons/md";

const TestRecord = () => {
  const navigate = useNavigate();
  const [record, setRecord] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setsearchQuery] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState(searchQuery);
  // pagination states
  const [filter, setFilter] = useState(true);
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [totalPages, setTotalPages] = useState(1);

  useEffect(() => {
    const fetchRecentRecords = async () => {
      setLoading(true);
      try {
        const response = await PostCall(
          `admin/getAllPatients?recentPatients=${filter}&page=${page}&limit=${pageSize}&query=${debouncedSearch}`
        );
        if (response?.success) {
          setRecord(response.patients);
          setTotalPages(response.totalPages || 1); // make sure backend sends totalPages
        } else {
          console.error("Failed to fetch records:", response?.message);
        }
      } catch (error) {
        console.error("Error fetching recent patients:", error);
      } finally {
        setLoading(false);
      }
    };

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

  const handleDetails = (id) => {
    navigate(`/test-records/recorddetails/${id}`);
  };

  const handleChange = (event) => {
    const value = event.target.value === "true"; // convert to boolean
    setFilter(value);
    console.log("Selected:", value);
  };

  if (loading) {
    return <Loader />;
  }

  return (
    <div id="test-records-view" className="test-records">
      <div className="header">
        <h2>Test Record Management</h2>
        <div className="actions">
          <div className="search-box">
            <input
              type="text"
              placeholder="Search Aadhaar"
              value={searchQuery}
              onChange={(e) => setsearchQuery(e.target.value.slice(0, 12))}
              maxLength={12}
              // inputMode="numeric"
            />
            <span className="search-icon">
              <FaSearch />
            </span>
          </div>
          {/* <button className="filter-btn">Search</button> */}
        </div>
      </div>
      <div className="filter">
        <div className="filter-subadmin"></div>
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

      <div className="records-container">
        <ul>
          {record.length === 0 ? (
            <p className="no-data">No data found</p>
          ) : (
            record.map((record, index) => (
              <li key={index} className="record-item">
                <div className="record-header">
                  <p className="aadhaar">Aadhaar: {record.aadhaarNumber}</p>
                </div>
                <div className="record-info">
                  <p className="sub-admin">
                    <RiAdminFill /> {record.name}
                  </p>
                  <p className="date">
                    <HiCalendarDateRange />{" "}
                    {record.registeredAt
                      ? moment(record.registeredAt).format("DD/MM/YYYY")
                      : "-"}
                  </p>
                </div>
                <div className="record-footer">
                  <button
                    className="view-btn"
                    onClick={() => handleDetails(record._id)}
                  >
                    View Details
                  </button>
                </div>
              </li>
            ))
          )}
        </ul>
      </div>
      {record.length > 0 && !filter && (
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

export default TestRecord;
