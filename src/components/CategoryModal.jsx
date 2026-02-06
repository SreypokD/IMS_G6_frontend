import React, { useState } from "react";
import { HiXCircle, HiOutlineDocumentText } from "react-icons/hi";

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
    <div>
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/5 backdrop-blur-sm">
        <div className="bg-white rounded-2xl p-5 w-full max-w-[30%] max-h-[80vh] shadow-xl relative">
          <h2 className="text-xl font-bold mb-6 text-center">
            {initial ? "Edit Category" : "Add Category"}
          </h2>
          <form className="space-y-5 overflow-auto max-h-[50vh] px-1">
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
                <div className="text-red-500 text-sm mt-1">
                  Name is required
                </div>
              )}
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">
                Description
              </label>
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
          </form>
          <div className="col-span-2 w-full flex items-center justify-end gap-3 mt-4">
            <button
              type="button"
              className="bg-gray-100 hover:bg-gray-200 text-[#1e3a5f] px-6 py-2 rounded-xl focus:outline-none border border-gray-200 flex items-center gap-2 cursor-pointer"
              onClick={onClose}
            >
              <HiXCircle className="inline-block text-xl" /> Cancel
            </button>
            <button
              type="button"
              className="bg-[#1e3a5f] hover:bg-[#16375b] text-white px-6 py-2 rounded-xl focus:outline-none flex items-center gap-2 cursor-pointer"
              onClick={handleSubmit}
            >
              <HiOutlineDocumentText className="inline-block text-xl" />
              {initial ? "Update Category" : "Add Category"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CategoryModal;
