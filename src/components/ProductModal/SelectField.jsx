import React from "react";
import PropTypes from "prop-types";
import { Listbox } from "@headlessui/react";
import { HiSelector } from "react-icons/hi";

const ListboxButton = Listbox.Button;
const ListboxOptions = ListboxOptions;

const SelectField = ({
  label,
  value,
  onChange,
  options,
  getOptionLabel,
  getOptionValue,
  placeholder,
  disabled = false,
  required = false,
  hasError = false,
  emptyMessage = "No options available",
}) => {
  const selectedOption = options.find((opt) => getOptionValue(opt) === value);

  const buttonClassName = `w-full bg-gray-50 border rounded-lg px-3 py-2 text-left text-sm text-black flex items-center justify-between ${
    disabled ? "cursor-default" : "cursor-pointer"
  } ${hasError ? "border-red-500" : "border-gray-100"}`;

  return (
    <div>
      <label className="text-sm font-medium text-gray-700">
        {label}
        {required && <sup className="text-red-500">*</sup>}
      </label>
      <Listbox
        value={selectedOption || null}
        onChange={disabled ? () => {} : onChange}
        disabled={disabled}
      >
        <div className="relative">
          <ListboxButton className={buttonClassName} disabled={disabled}>
            <span>
              {selectedOption ? getOptionLabel(selectedOption) : placeholder}
            </span>
            {!disabled && <HiSelector className="w-5 h-5 text-gray-400 ml-2" />}
          </ListboxButton>
          <ListboxOptions className="absolute z-10 mt-1 w-full bg-white border border-gray-100 rounded-lg shadow-lg max-h-60 overflow-auto focus:outline-none text-sm">
            {options.length === 0 && (
              <div className="px-4 py-2 text-gray-400">{emptyMessage}</div>
            )}
            {options.map((option) => (
              <ListboxOption
                key={getOptionValue(option)}
                value={option}
                className={({ selected }) =>
                  `px-3 py-2 cursor-pointer text-[#64748b] text-sm hover:text-black hover:bg-[#f1f5f9] rounded-lg ${
                    selected ? "bg-[#1e3a5f] text-white" : ""
                  }`
                }
              >
                {getOptionLabel(option)}
              </ListboxOption>
            ))}
          </ListboxOptions>
        </div>
      </Listbox>
    </div>
  );
};

SelectField.propTypes = {
  label: PropTypes.string.isRequired,
  value: PropTypes.string,
  onChange: PropTypes.func.isRequired,
  options: PropTypes.array.isRequired,
  getOptionLabel: PropTypes.func.isRequired,
  getOptionValue: PropTypes.func.isRequired,
  placeholder: PropTypes.string,
  disabled: PropTypes.bool,
  required: PropTypes.bool,
  hasError: PropTypes.bool,
  emptyMessage: PropTypes.string,
};

export default SelectField;
