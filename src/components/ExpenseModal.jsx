import React, { useState, useEffect } from "react";
import {
  HiXCircle,
  HiOutlineDocumentText,
  HiOutlineCamera,
  HiOutlineUpload,
} from "react-icons/hi";
import { uploadFile } from "../api";
import { Listbox } from "@headlessui/react";
import { HiSelector } from "react-icons/hi";
import DatePicker from "../components/DatePicker";

const initialExpense = {
  description: "",
  amount: "",
  category: "Other",
  date: new Date().toISOString().split("T")[0],
  receipt_image: "",
};

const categories = [
  "Rent",
  "Utilities",
  "Salary",
  "Inventory",
  "Marketing",
  "Miscellaneous",
  "Transport",
  "Maintenance",
  "Other",
];

const ExpenseModal = ({ open, onClose, onSave, initial, viewOnly = false }) => {
  const [expense, setExpense] = useState(initial || initialExpense);
  const [selectedImage, setSelectedImage] = useState(null);
  const [touched, setTouched] = useState({});
  const [validateOnSave, setValidateOnSave] = useState(false);

  useEffect(() => {
    if (open) {
      setExpense(initial || initialExpense);
      setSelectedImage(null);
      setTouched({});
      setValidateOnSave(false);
    }
  }, [open, initial]);

  async function handleImageChange(e) {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setSelectedImage(file);
      try {
        const res = await uploadFile(file);
        if (res.data && res.data.url) {
          setExpense((prev) => ({ ...prev, receipt_image: res.data.url }));
        }
      } catch (err) {
        console.error("Image upload failed", err);
      }
    }
  }

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/5 backdrop-blur-sm">
      <div className="bg-white rounded-2xl p-5 w-full max-w-[40%] max-h-[80vh] shadow-xl relative">
        <h2 className="text-xl font-bold mb-6 text-center">
          {viewOnly ? "View Expense" : initial ? "Edit Expense" : "Add Expense"}
        </h2>
        <form className="space-y-5 overflow-auto max-h-[50vh] px-1">
          <div className="col-span-2 mb-2">
            <h3 className="flex items-center gap-2 text-base mb-2 text-black">
              <HiOutlineDocumentText className="inline-block text-xl text-black" />
              <span>Expense Details</span>
            </h3>
            <div className="mb-3 grid grid-cols-1 gap-4">
              <div>
                <label className="block text-sm font-medium mb-1">
                  Description
                  {!expense.description && !initial ? (
                    <sup className="text-red-500">*</sup>
                  ) : null}
                </label>
                <input
                  name="description"
                  value={expense.description}
                  onChange={(e) =>
                    setExpense({ ...expense, description: e.target.value })
                  }
                  onBlur={() =>
                    setTouched((prev) => ({ ...prev, description: true }))
                  }
                  placeholder="Expense Description"
                  className={`w-full bg-gray-50 border rounded-lg px-3 py-2 text-sm text-gray-800 ${!expense.description && !initial && (touched.description || validateOnSave) ? "border-red-500" : "border-gray-200"}`}
                  disabled={viewOnly}
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-1">
                    Amount
                    {(!expense.amount || isNaN(expense.amount)) && !initial ? (
                      <sup className="text-red-500">*</sup>
                    ) : null}
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <span className="text-gray-500 sm:text-sm">$</span>
                    </div>
                    <input
                      name="amount"
                      value={expense.amount}
                      onChange={(e) =>
                        setExpense({ ...expense, amount: e.target.value })
                      }
                      onBlur={() =>
                        setTouched((prev) => ({ ...prev, amount: true }))
                      }
                      type="number"
                      step="0.01"
                      placeholder="0.00"
                      className={`w-full bg-gray-50 border rounded-lg pl-7 pr-3 py-2 text-sm text-gray-800 ${(!expense.amount || isNaN(expense.amount)) && !initial && (touched.amount || validateOnSave) ? "border-red-500" : "border-gray-200"}`}
                      disabled={viewOnly}
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">
                    Category
                  </label>
                  <Listbox
                    value={
                      categories.find((cat) => cat._id === expense.category) ||
                      null
                    }
                    onChange={
                      viewOnly
                        ? () => {}
                        : (cat) =>
                            setExpense({
                              ...expense,
                              category: cat,
                            })
                    }
                    disabled={viewOnly}
                  >
                    <div className="relative">
                      <Listbox.Button
                        className={`w-full bg-gray-50 border rounded-lg px-3 py-2 text-left text-sm text-gray-800 flex items-center justify-between cursor-pointer${viewOnly ? "bg-gray-100 cursor-default" : ""} ${!expense.category && !initial && (touched.category || validateOnSave) ? "border-red-500" : "border-gray-200"}`}
                        disabled={viewOnly}
                      >
                        <span>{expense.category || "Select category"}</span>
                        <HiSelector className="w-5 h-5 text-gray-400 ml-2" />
                      </Listbox.Button>
                      <Listbox.Options className="absolute z-10 mt-1 w-full bg-white border border-gray-200 rounded-lg shadow-lg max-h-60 overflow-auto focus:outline-none text-sm">
                        {categories.length === 0 && (
                          <div className="px-4 py-2 text-gray-400">
                            No categories
                          </div>
                        )}
                        {categories.map((cat) => (
                          <Listbox.Option
                            key={cat._id}
                            value={cat}
                            className={({ selected }) =>
                              `px-4 py-2 cursor-pointer text-black text-sm hover:bg-[#f1f5f9] ${selected ? "bg-blue-50" : ""}`
                            }
                          >
                            {({ selected }) => (
                              <>
                                <span
                                  className={`block truncate ${selected ? "font-medium" : "font-normal"}`}
                                >
                                  {cat}
                                </span>
                              </>
                            )}
                          </Listbox.Option>
                        ))}
                      </Listbox.Options>
                    </div>
                  </Listbox>
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Date</label>
                <DatePicker
                  selected={expense.date}
                  onChange={(date) =>
                    setExpense((prev) => ({
                      ...prev,
                      date: date ? date.toISOString().split("T")[0] : "",
                    }))
                  }
                  disabled={viewOnly}
                  placeholder="Date"
                />
              </div>
            </div>
          </div>
          <div className="col-span-2 mb-2">
            <h3 className="flex items-center gap-2 text-base mb-2 text-black">
              <HiOutlineCamera className="inline-block text-xl text-black" />
              <span>Receipt</span>
            </h3>
            <div className="mb-4">
              <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 flex flex-col items-center justify-center transition-colors">
                <input
                  type="file"
                  accept="image/jpeg,image/png,image/gif,application/pdf"
                  className="hidden"
                  id="receipt-upload"
                  onChange={handleImageChange}
                  disabled={viewOnly}
                />
                <label
                  htmlFor="receipt-upload"
                  className={`flex flex-col items-center w-full h-full ${viewOnly ? "cursor-default opacity-60" : "cursor-pointer"}`}
                  style={viewOnly ? { pointerEvents: "none" } : {}}
                >
                  <HiOutlineUpload className="text-4xl text-gray-400 mb-2" />
                  <span className="text-gray-600">Upload Receipt</span>
                </label>
                {(selectedImage || expense.receipt_image) && (
                  <div className="mt-2 flex items-center">
                    <img
                      src={
                        selectedImage
                          ? URL.createObjectURL(selectedImage)
                          : expense.receipt_image
                      }
                      alt="Receipt Preview"
                      className="h-40 w-auto object-contain rounded mr-2"
                    />
                  </div>
                )}
              </div>
            </div>
          </div>
        </form>
        <div className="col-span-2 w-full flex items-center justify-end gap-3 mt-4">
          <button
            type="button"
            className="bg-gray-100 hover:bg-gray-200 text-[#1e3a5f] px-6 py-2 rounded-xl focus:outline-none border border-gray-200 flex items-center gap-2 cursor-pointer"
            onClick={onClose}
          >
            <HiXCircle className="inline-block text-xl" />
            {viewOnly ? "Close" : "Cancel"}
          </button>
          {!viewOnly && (
            <button
              type="button"
              className="bg-[#1e3a5f] hover:bg-[#16375b] text-white px-6 py-2 rounded-xl focus:outline-none flex items-center gap-2 cursor-pointer text-sm"
              onClick={() => {
                setValidateOnSave(true);
                setTouched({ description: true, amount: true });
                if (expense.description && expense.amount) {
                  onSave(expense);
                }
              }}
            >
              <HiOutlineDocumentText className="inline-block text-xl" />
              {initial ? "Update Expense" : "Add Expense"}
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default ExpenseModal;
