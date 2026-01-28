import React, { useState } from "react";
import { HiXCircle } from "react-icons/hi";

const initialCategory = {
  name: "",
  description: "",
};


const CategoryModal = ({ open, onClose, onSave, initial }) => {
  const [category, setCategory] = useState(initial || initialCategory);
  const [touched, setTouched] = useState({});
  const [validateOnSave, setValidateOnSave] = useState(false);

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
      <div className="bg-white rounded-2xl p-5 w-full max-w-md min-h-[30vh] shadow-xl relative">
        <button
          className="absolute top-3 right-3 text-gray-400 hover:text-red-500"
          onClick={handleClose}
        >
          <HiXCircle className="text-2xl" />
        </button>
        <h2 className="text-2xl font-bold mb-6 text-center">
          {initial ? "Edit Category" : "Add Category"}
        </h2>
        <form className="space-y-5" onSubmit={handleSubmit}>
          <div>
            <label className="block text-sm font-medium mb-1">
              Name <sup className="text-red-500">*</sup>
            </label>
            <input
              name="name"
              value={category.name}
              onChange={handleChange}
              onBlur={handleBlur}
              placeholder="Category name"
              className={`w-full bg-gray-50 border rounded-lg px-3 py-2 text-gray-800 ${!category.name && (touched.name || validateOnSave) ? "border-red-500" : "border-gray-200"}`}
              required
            />
            {!category.name && (touched.name || validateOnSave) && (
              <div className="text-red-500 text-xs mt-1">Name is required</div>
            )}
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Description</label>
            <textarea
              name="description"
              value={category.description}
              onChange={handleChange}
              onBlur={handleBlur}
              placeholder="Description (optional)"
              className="w-full bg-gray-50 border border-gray-200 rounded-lg px-3 py-2 text-gray-800"
              rows={3}
            />
          </div>
          <div className="flex justify-end gap-2 mt-6">
            <button
              type="button"
              className="px-4 py-2 rounded-lg bg-gray-100 text-gray-700 hover:bg-gray-200"
              onClick={onClose}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 rounded-lg bg-[#1e3a5f] text-white hover:bg-[#16375b]"
            >
              {initial ? "Update" : "Create"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CategoryModal;
