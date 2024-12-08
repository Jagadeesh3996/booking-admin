import React from "react";

// FormField component to handle different input types
const FormField = ({ label, value, onChange, type = "text", error, children, spanData }) => (
  <div className="col-md-6">
    <label className="form-label fw-bold">{label}</label>
    <div className={`input-group ${error ? "error" : ""}`}>
      {type === "select" ? (
          <div className="d-flex custom-w-100">
          {children} {/* This will render the two select elements inside the container */}
        </div>
      ) : type === "number" ? (
        <input
          type="number"
          className="form-control"
          value={value}
          onChange={onChange}
          min={1}
        />
      ) : (
        <input
          type="text"
          className="form-control"
          value={value}
          onChange={onChange}
        />
      )}
      {spanData && <span className="input-group-text">{spanData}</span>}

    </div>
    {error && <p className="error-message">{error}</p>}
  </div>
);

export default FormField;
