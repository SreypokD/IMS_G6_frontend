import React, { useState } from "react";
import { HiXCircle, HiOutlineDocumentText } from "react-icons/hi";

const initialCategory = {
  name: "",
  description: "",
  status: "active",
};

const CategoryModal = ({
  open,
  onClose,
  onSave,
  data,
  viewOnly = false,
}) => {
  const [category, setCategory] = useState(data || initialCategory);
  const [touched, setTouched] = useState({});
  const [validateOnSave, setValidateOnSave] = useState(false);

  // Reset form when modal opens or closes
  React.useEffect(() => {
    if (open && !data) {
      setCategory(initialCategory);
      setTouched({});
      setValidateOnSave(false);
    } else if (open && data) {
      setCategory(data);
      setTouched({});
      setValidateOnSave(false);
    }
  }, [open, data]);

  // Reset state when modal closes
  function handleClose() {
    setCategory(initialCategory);
    setTouched({});
    setValidateOnSave(false);
    onClose();
  }

  if (!open) return null;

  function handleChange(e) {
    const { name, value } = e.target;
    setCategory((prev) => ({ ...prev, [name]: value }));
  }

  function handleBlur(e) {
    const { name } = e.target;
    setTouched((prev) => ({ ...prev, [name]: true }));
  }

  function handleSubmit(e) {
    e.preventDefault();
    setValidateOnSave(true);
    if (!category.name) return;
    onSave(category);
    handleClose();
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/5 backdrop-blur-sm">
      <div className="bg-white rounded-2xl p-5 w-full max-w-[30%] max-h-[80vh] shadow-xl relative">
        <h2 className="text-xl font-bold mb-6 text-center">
          {viewOnly
            ? "Category Details"
            : data
              ? "Update Category"
              : "Add Category"}
        </h2>
        <form className="space-y-5 overflow-auto max-h-[50vh] px-1">
          <div>
            <label className="text-sm font-medium text-gray-700">
              Name
              {!viewOnly && <sup className="text-red-500">*</sup>}
            </label>
            <input
              name="name"
              value={category.name}
              onChange={handleChange}
              onBlur={handleBlur}
              placeholder="Category name"
              className={`w-full bg-gray-50 border rounded-lg px-3 py-2 text-sm text-gray-800 ${!category.name && !data && (touched.name || validateOnSave) ? "border-red-500" : "border-gray-100"}`}
              required
              disabled={viewOnly}
            />
          </div>
          <div>
            <label className="text-sm font-medium text-gray-700">
              Description
            </label>
            <textarea
              name="description"
              value={category.description}
              onChange={handleChange}
              onBlur={handleBlur}
              placeholder="Description (optional)"
              className="w-full bg-gray-50 border border-gray-100 rounded-lg px-3 py-2 text-gray-800"
              rows={3}
              disabled={viewOnly}
            />
          </div>
          <div>
            <label className="text-sm font-medium text-gray-700">
              Status <sup className="text-red-500">*</sup>
            </label>
            <select
              name="status"
              value={category.status}
              onChange={handleChange}
              onBlur={handleBlur}
              className="w-full bg-gray-50 border border-gray-100 rounded-lg px-3 py-2 text-gray-800"
              disabled={viewOnly}
            >
              <option value="active">Active</option>
              <option value="inactive">Inactive</option>
            </select>
          </div>
        </form>
        <div className="col-span-2 w-full flex items-center justify-end gap-3 mt-4">
          <button
            type="button"
            className="bg-gray-100 hover:bg-gray-200 text-[#1e3a5f] px-6 py-2 rounded-xl focus:outline-none border border-gray-100 flex items-center gap-2 cursor-pointer text-sm"
            onClick={onClose}
          >
            <HiXCircle className="inline-block text-xl" />
            {viewOnly ? "Close" : "Cancel"}
          </button>
          {!viewOnly && (
            <button
              type="button"
              className="bg-[#1e3a5f] hover:bg-[#16375b] text-white px-6 py-2 rounded-xl focus:outline-none flex items-center gap-2 cursor-pointer text-sm"
              onClick={handleSubmit}
            >
              <HiOutlineDocumentText className="inline-block text-xl" />
           {viewOnly ? "Category Details" : category._id ? "Update Category" : "Add Category"}
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default CategoryModal;
