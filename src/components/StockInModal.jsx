import React, { useState } from "react";
import { useAuth } from "../contexts/auth/useAuth";
import { createStock } from "../api";
import { Listbox } from "@headlessui/react";
import {
  HiSelector,
  HiXCircle,
  HiOutlineDocumentText,
  HiExclamationCircle,
  HiOutlineDownload,
} from "react-icons/hi";

const StockInModal = ({ open, onClose, products, locations }) => {
  const { user } = useAuth();
  const [productId, setProductId] = useState("");
  const [quantity, setQuantity] = useState("");
  const [batchNumber, setBatchNumber] = useState("");
  const [reason, setReason] = useState("");
  const [location, setLocation] = useState("");
  const [notes, setNotes] = useState("");
  const [loading, setLoading] = useState(false);
  const [touched, setTouched] = useState({});
  const [validateOnSave, setValidateOnSave] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    if (!productId || !quantity || !reason || !location) {
      setLoading(false);
      return;
    }
    try {
      await createStock({
        product_id: productId,
        quantity: Number(quantity),
        batch_number: batchNumber,
        reason,
        location,
        note: notes,
        type: "in",
        user_id: user?._id,
        completed_at: new Date(),
      });
      onClose();
    } catch {
      // no error handling for now
    } finally {
      setLoading(false);
    }
  };

  const onSave = () => {
    setValidateOnSave(true);
    if (!productId || !quantity || !reason || !location) {
      return;
    }
    handleSubmit();
  };

  if (!open) return null;

  return (
    <div>
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/5 backdrop-blur-sm">
        <div className="bg-white rounded-2xl p-5 w-full max-w-[40%] max-h-[80vh] shadow-xl relative">
          <div className="mb-6 text-center">
            <HiOutlineDownload className="text-3xl text-green-600 mx-auto mb-2" />
            <h2 className="text-2xl font-bold mb-2 text-center">Stock In</h2>
            <span className="text-base text-gray-600">
              Record inventory transaction
            </span>
          </div>
          <form className="space-y-5 overflow-auto max-h-[50vh] px-1">
            <div>
              <label className="block font-medium mb-1">
                Product
                {!productId ? <sup className="text-red-500">*</sup> : null}
              </label>
              <Listbox value={productId} onChange={setProductId}>
                <div className="relative">
                  <Listbox.Button
                    className={`cursor-pointer w-full bg-gray-50 border rounded-lg px-3 py-2 text-left text-gray-800 flex items-center justify-between ${!productId && (touched.productId || validateOnSave) ? "border-red-500" : "border-gray-200"}`}
                  >
                    <span>
                      {products.find((p) => p._id === productId)?.name ||
                        "Search and select product..."}
                    </span>
                    <HiSelector className="w-5 h-5 text-gray-400 ml-2" />
                  </Listbox.Button>
                  <Listbox.Options className="absolute z-10 mt-1 w-full bg-white border border-gray-200 rounded-lg shadow-lg max-h-60 overflow-auto focus:outline-none">
                    {products.map((p) => (
                      <Listbox.Option
                        key={p._id}
                        value={p._id}
                        className={({ selected }) =>
                          `px-4 py-2 cursor-pointer text-black hover:bg-[#f1f5f9] ${selected ? "bg-blue-50" : ""}`
                        }
                      >
                        {p.name}
                      </Listbox.Option>
                    ))}
                  </Listbox.Options>
                </div>
              </Listbox>
            </div>
            <div className="flex gap-4">
              <div className="flex-1">
                <label className="block font-medium mb-1">
                  Quantity
                  {!quantity ? <sup className="text-red-500">*</sup> : null}
                </label>
                <input
                  type="number"
                  className={`w-full bg-gray-50 border rounded-lg px-3 py-2 text-gray-800 ${!quantity && (touched.quantity || validateOnSave) ? "border-red-500" : "border-gray-200"}`}
                  value={quantity}
                  min={1}
                  onChange={(e) => setQuantity(e.target.value)}
                  onBlur={() =>
                    setTouched((prev) => ({ ...prev, quantity: true }))
                  }
                />
              </div>
              <div className="flex-1">
                <label className="block font-medium mb-1">Batch Number</label>
                <input
                  type="text"
                  className="w-full bg-gray-50 border rounded-lg px-3 py-2 text-gray-800 border-gray-200"
                  value={batchNumber}
                  onChange={(e) => setBatchNumber(e.target.value)}
                  placeholder="Optional batch number"
                />
              </div>
            </div>
            <div>
              <label className="block font-medium mb-1">
                Reason {!reason ? <sup className="text-red-500">*</sup> : null}
              </label>
              <Listbox value={reason} onChange={setReason}>
                <div className="relative">
                  <Listbox.Button
                    className={`cursor-pointer w-full bg-gray-50 border rounded-lg px-3 py-2 text-left text-gray-800 flex items-center justify-between ${!reason && (touched.reason || validateOnSave) ? "border-red-500" : "border-gray-200"}`}
                  >
                    <span>{reason || "Select transaction reason"}</span>
                    <HiSelector className="w-5 h-5 text-gray-400 ml-2" />
                  </Listbox.Button>
                  <Listbox.Options className="absolute z-10 mt-1 w-full bg-white border border-gray-200 rounded-lg shadow-lg max-h-60 overflow-auto focus:outline-none">
                    {["Purchase", "Return", "Adjustment", "Other"].map(
                      (option) => (
                        <Listbox.Option
                          key={option}
                          value={option}
                          className={({ selected }) =>
                            `px-4 py-2 cursor-pointer text-black hover:bg-[#f1f5f9] ${selected ? "bg-blue-50" : ""}`
                          }
                        >
                          {option}
                        </Listbox.Option>
                      ),
                    )}
                  </Listbox.Options>
                </div>
              </Listbox>
            </div>
            <div>
              <label className="block font-medium mb-1">
                Location
                {!location ? <sup className="text-red-500">*</sup> : null}
              </label>
              <Listbox value={location} onChange={setLocation}>
                <div className="relative">
                  <Listbox.Button
                    className={`cursor-pointer w-full bg-gray-50 border rounded-lg px-3 py-2 text-left text-gray-800 flex items-center justify-between ${!location && (touched.location || validateOnSave) ? "border-red-500" : "border-gray-200"}`}
                  >
                    <span>{location || "Select storage location"}</span>
                    <HiSelector className="w-5 h-5 text-gray-400 ml-2" />
                  </Listbox.Button>
                  <Listbox.Options className="absolute z-10 mt-1 w-full bg-white border border-gray-200 rounded-lg shadow-lg max-h-60 overflow-auto focus:outline-none">
                    {locations.map((loc) => (
                      <Listbox.Option
                        key={loc}
                        value={loc}
                        className={({ selected }) =>
                          `px-4 py-2 cursor-pointer text-black hover:bg-[#f1f5f9] ${selected ? "bg-blue-50" : ""}`
                        }
                      >
                        {loc}
                      </Listbox.Option>
                    ))}
                  </Listbox.Options>
                </div>
              </Listbox>
            </div>
            <div>
              <label className="block font-medium mb-1">Notes (Optional)</label>
              <textarea
                className="w-full bg-gray-50 border rounded-lg px-3 py-2 text-gray-800 border-gray-200"
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Add any additional notes or comments..."
              />
            </div>
            <div className="bg-gray-50 rounded-lg p-3 text-sm text-gray-600 flex gap-2">
              <HiExclamationCircle className="inline-block text-3xl" />
              <div className="flex flex-col">
                <span className="font-semibold">Transaction Information</span>
                <span>
                  This transaction will be recorded with your user ID and
                  current timestamp. Stock levels will be updated automatically
                  across the system.
                </span>
              </div>
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
              className="bg-green-600 hover:bg-green-700 text-white px-6 py-2 rounded-xl focus:outline-none flex items-center gap-2 cursor-pointer"
              disabled={loading}
              onClick={() => {
                setValidateOnSave(true);
                setTouched({
                  productId: true,
                  quantity: true,
                  reason: true,
                  location: true,
                });
                onSave();
              }}
            >
              <HiOutlineDocumentText className="inline-block text-xl" /> Confirm
              Stock In
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default StockInModal;
