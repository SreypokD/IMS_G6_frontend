import React from "react";
import DatePicker from "react-datepicker";
import { HiOutlineCalendar } from "react-icons/hi";
import "react-datepicker/dist/react-datepicker.css";
import "../styles/DatePicker.css";

const CustomDatePicker = ({
  selected,
  onChange,
  placeholder = "Select date",
  className,
}) => {
  return (
    <div className={`relative w-full ${className}`}>
      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none z-10">
        <HiOutlineCalendar className="h-5 w-5 text-gray-500" />
      </div>
      <DatePicker
        selected={selected ? new Date(selected) : null}
        onChange={onChange}
        dateFormat="dd/MM/yyyy"
        placeholderText={placeholder}
        className={`w-full border rounded-lg pl-10 px-3 py-2 text-gray-800 border-gray-100 text-sm ${className ? "bg-white" : "bg-gray-50"}`}
        wrapperClassName="w-full"
        showPopperArrow={false}
      />
    </div>
  );
};

export default CustomDatePicker;
