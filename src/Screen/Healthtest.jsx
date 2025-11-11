import React, { useEffect, useState } from "react";
import { GetCall, PostCall, PutCall } from "../Screen/ApiService";
import { showToast } from "../Main/ToastManager";
import Loader from "../Main/Loader";
import { FaEdit, FaTrash } from "react-icons/fa";
import "./Healthtest.css";
import {
  MdOutlineArrowBackIos,
  MdOutlineArrowForwardIos,
} from "react-icons/md";
import moment from "moment";

const HealthTest = () => {
  const [tests, setTests] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);
  const [editId, setEditId] = useState(null);
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [totalPages, setTotalPages] = useState(1);
  const [deleteId, setDeleteId] = useState(null);
  const [errors, setErrors] = useState({});
  const [showDeleteModal, setShowDeleteModal] = useState(false);

  const [formData, setFormData] = useState({
    name: "",
    dataType: "number",
    unit: "",
    normalRange: { min: "", max: "" },
    options: [],
  });

  const validateField = (name, value) => {
    let error = "";

    if (name === "name" && !value.trim()) {
      error = "Name is required";
    }

    if (name === "unit" && formData.dataType === "number" && !value.trim()) {
      error = "Unit is required for numeric data";
    }

    if (name === "min" || name === "max") {
      const { min, max } = {
        ...formData.normalRange,
        [name]: value,
      };
      if (min && max && Number(min) > Number(max)) {
        error = "Min cannot be greater than Max";
      }
    }

    return error;
  };

  const validateForm = () => {
    let newErrors = {};

    if (!formData.name.trim()) {
      newErrors.name = "Name is required";
    }

    if (formData.dataType === "number") {
      if (!formData.unit.trim()) {
        newErrors.unit = "Unit is required for numeric data";
      }

      if (formData.normalRange.min && formData.normalRange.max) {
        if (
          Number(formData.normalRange.min) > Number(formData.normalRange.max)
        ) {
          newErrors.min = "Min cannot be greater than Max";
          newErrors.max = "Max must be greater than Min";
        }
      }
    }

    if (formData.dataType === "enum") {
      if (
        formData.options.length === 0 ||
        formData.options.some((opt) => !opt.trim())
      ) {
        newErrors.options = "Please add at least one valid option";
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const fetchTests = async () => {
    setLoading(true);
    try {
      const res = await GetCall("admin/getAllHealthTest");
      if (res?.success) setTests(res?.data);
      setTotalPages(res?.totalPages);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTests();
  }, [page, pageSize]);

  const resetAll = () => {
    setFormData({
      name: "",
      dataType: "number",
      unit: "",
      normalRange: { min: "", max: "" },
      options: [],
    });
    setErrors?.({});
    setShowModal(false);
    setIsEditMode(false);
    setEditId(null);
  };

  const handleChange = (e) => {
    const { name, value } = e.target;

    if (name === "min" || name === "max") {
      setFormData((prev) => ({
        ...prev,
        normalRange: { ...prev.normalRange, [name]: value },
      }));
      setErrors((prev) => ({
        ...prev,
        [name]: validateField(name, value),
      }));
    } else {
      setFormData((prev) => ({ ...prev, [name]: value }));
      setErrors((prev) => ({
        ...prev,
        [name]: validateField(name, value),
      }));
    }
  };

  const addOption = () => {
    setFormData((prev) => ({
      ...prev,
      options: [...prev.options, ""],
    }));
  };

  const handleOptionChange = (index, value) => {
    const newOptions = [...formData.options];
    newOptions[index] = value;
    setFormData((prev) => ({ ...prev, options: newOptions }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }
    setLoading(true);
    try {
      let res;
      if (isEditMode) {
        res = await PostCall(`admin/updateHealthTest/${editId}`, formData);
      } else {
        res = await PostCall("admin/createHealthTest", formData);
      }

      if (res?.success) {
        showToast(res.message, "success");
        fetchTests();
        resetAll();
      } else {
        showToast(res?.message || "Failed!", "error");
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (test) => {
    setFormData(test);
    setEditId(test._id);
    setIsEditMode(true);
    setShowModal(true);
  };

  const handleDelete = async (id) => {
    setDeleteId(id);
    setShowDeleteModal(true);
  };

  const confirmDelete = async () => {
    setLoading(true);
    try {
      const res = await PostCall(`admin/deleteHealthTest/${deleteId}`);
      if (res?.success) {
        showToast(res?.message, "success");
        fetchTests();
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
      setShowDeleteModal(false);
      setDeleteId(null);
    }
  };

  if (loading) {
    return <Loader />;
  }

  return (
    <div id="test-records-view" className="test-records">
      {/* <h2>Health Test Management</h2>
      <button
        onClick={() => {
          setShowModal(true);
          setIsEditMode(false);
        }}
      >
        Add New
      </button> */}
      <div className="header">
        <h2 className="title-header">Health Test</h2>
        <button
          className="add-btn"
          onClick={() => {
            setShowModal(true);
            setIsEditMode(false);
          }}
        >
          Add Health Test
        </button>
      </div>

      {showModal && (
        <div className="modal-overlay">
          <div className="modal-box">
            <h3>{isEditMode ? "Edit Test" : "Add New Health Test"}</h3>
            <form onSubmit={handleSubmit}>
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleChange}
                placeholder="Name"
              />
              {errors.name && <p className="error-text">{errors.name}</p>}

              <select
                name="dataType"
                value={formData.dataType}
                onChange={handleChange}
              >
                <option value="number">Number</option>
                <option value="enum">Enum</option>
                <option value="string">String</option>
              </select>

              <input
                type="text"
                name="unit"
                value={formData.unit}
                onChange={handleChange}
                placeholder="Unit"
              />
              {errors.unit && <p className="error-text">{errors.unit}</p>}
              {formData.dataType === "number" && (
                <>
                  <input
                    type="number"
                    name="min"
                    value={formData.normalRange.min}
                    onChange={handleChange}
                    placeholder="Min"
                  />
                  {errors.min && <p className="error-text">{errors.min}</p>}
                  <input
                    type="number"
                    name="max"
                    value={formData.normalRange.max}
                    onChange={handleChange}
                    placeholder="Max"
                  />
                  {errors.max && <p className="error-text">{errors.max}</p>}
                </>
              )}

              {formData.dataType === "enum" && (
                <>
                  {formData.options.map((opt, i) => (
                    <input
                      key={i}
                      value={opt}
                      onChange={(e) => handleOptionChange(i, e.target.value)}
                      placeholder="Option"
                    />
                  ))}
                  <button
                    type="button"
                    onClick={addOption}
                    className="addoption"
                  >
                    + Add Option
                  </button>
                </>
              )}

              <div className="modal-actions">
                <button type="submit">{isEditMode ? "Update" : "Save"}</button>
                <button type="button" onClick={resetAll}>
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      <div className="records-container">
        {tests.length === 0 ? (
          <p className="no-data">No data found</p>
        ) : (
          <table className="test-table">
            <thead>
              <tr>
                <th>Name</th>
                <th>Data Type</th>
                <th>Unit</th>
                <th>Normal Range / Options</th>
                <th>Created At</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {tests.map((record) => (
                <tr key={record._id}>
                  <td>{record.name}</td>
                  <td>{record.dataType}</td>
                  <td>{record.unit || "-"}</td>

                  <td>
                    {record.dataType === "number" ? (
                      <>
                        {record.normalRange?.min ?? "-"} -{" "}
                        {record.normalRange?.max ?? "-"}
                      </>
                    ) : record.dataType === "enum" ? (
                      record.options.length > 0 ? (
                        record.options.join(", ")
                      ) : (
                        "-"
                      )
                    ) : (
                      "-"
                    )}
                  </td>

                  <td>{moment(record.createdAt).format("DD/MM/YYYY")}</td>
                  <td>
                    <div className="actions-action">
                      <div
                        onClick={() => handleEdit(record)}
                        className="action-btn edit-btn"
                      >
                        <FaEdit />
                      </div>
                      <div
                        onClick={() => handleDelete(record._id)}
                        className="action-btn delete-btn-action"
                      >
                        <FaTrash />
                      </div>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {tests?.length > 0 && (
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
      {showDeleteModal && (
        <div className="modal-overlay">
          <div className="modal-box">
            <h3>Confirm Delete</h3>
            <p>Are you sure you want to delete this test?</p>
            <div className="modal-actions">
              <button onClick={confirmDelete} className="delete-btn">
                Yes, Delete
              </button>
              <button
                onClick={() => {
                  setShowDeleteModal(false);
                  setDeleteId(null);
                }}
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default HealthTest;
