import React from "react";
import PropTypes from "prop-types";
import { HiOutlineUpload } from "react-icons/hi";

const ImageUpload = ({ image, onChange, disabled = false }) => {
  if (disabled) {
    return (
      <div className="mt-2 flex items-center justify-center border border-gray-200 rounded-lg p-4 bg-gray-50">
        <img
          src={image}
          alt="Product"
          className="h-40 w-40 object-cover rounded"
        />
      </div>
    );
  }

  return (
    <label className="cursor-pointer block relative group h-full flex flex-col items-center justify-center border-2 border-dashed border-gray-100 rounded-lg p-6 hover:bg-gray-50 transition w-full">
      {image ? (
        <div className="relative w-40 h-40">
          <img
            src={image}
            alt="Product"
            className="w-full h-full object-cover rounded-md"
          />
          <div className="absolute inset-0 bg-black/50 flex items-center justify-center text-white opacity-0 group-hover:opacity-100 transition-opacity rounded-md">
            <span className="text-xs font-medium">Click to Change</span>
          </div>
        </div>
      ) : (
        <div className="flex flex-col items-center">
          <HiOutlineUpload className="text-4xl text-gray-400 mb-2" />
          <span className="text-gray-600">
            Drag and drop your image here, or
            <span className="text-blue-600 underline ml-1">browse files</span>
          </span>
          <span className="text-sm text-gray-400 mt-1">
            Supported formats: JPG, PNG, GIF (Max 5MB)
          </span>
        </div>
      )}
      <input
        type="file"
        accept="image/jpeg,image/png,image/gif"
        className="hidden"
        onChange={onChange}
        disabled={disabled}
      />
    </label>
  );
};

ImageUpload.propTypes = {
  image: PropTypes.string,
  onChange: PropTypes.func.isRequired,
  disabled: PropTypes.bool,
};

export default ImageUpload;
