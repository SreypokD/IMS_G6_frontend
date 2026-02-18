import React from "react";
import PropTypes from "prop-types";

const FormField = ({
  label,
  name,
  value,
  onChange,
  onBlur,
  type = "text",
  placeholder,
  disabled = false,
  required = false,
  hasError = false,
  helpText,
  step,
}) => {
  const inputClassName = `w-full bg-gray-50 border rounded-lg px-3 py-2 text-sm text-gray-800 ${
    hasError ? "border-red-500" : "border-gray-100"
  } ${disabled && type !== "text" ? "cursor-default" : ""}`;

  return (
    <div>
      <label className="text-sm font-medium text-gray-700">
        {label}
        {required && <sup className="text-red-500">*</sup>}
      </label>
      <input
        name={name}
        value={value}
        onChange={onChange}
        onBlur={onBlur}
        type={type}
        step={step}
        placeholder={placeholder}
        className={inputClassName}
        disabled={disabled}
      />
      {helpText && <p className="text-xs text-gray-500 mt-1">{helpText}</p>}
    </div>
  );
};

FormField.propTypes = {
  label: PropTypes.string.isRequired,
  name: PropTypes.string.isRequired,
  value: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
  onChange: PropTypes.func.isRequired,
  onBlur: PropTypes.func,
  type: PropTypes.string,
  placeholder: PropTypes.string,
  disabled: PropTypes.bool,
  required: PropTypes.bool,
  hasError: PropTypes.bool,
  helpText: PropTypes.string,
  step: PropTypes.string,
};

export default FormField;
