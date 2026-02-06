import React from "react";
import { HiXCircle, HiCube } from "react-icons/hi";

const StockViewModal = ({ open, onClose, stock }) => {
  if (!open || !stock) return null;

  return (
    <div>
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/5 backdrop-blur-sm">
        <div className="bg-white rounded-2xl p-5 w-full max-w-[40%] max-h-[80vh] shadow-xl relative">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
              <div className="bg-blue-50 p-2 rounded-lg">
                <HiCube className="text-xl text-blue-600" />
              </div>
              <div>
                <h2 className="text-xl font-bold text-gray-900">
                  Stock Details
                </h2>
                <span className="text-sm text-gray-500">
                  Transaction ID: #{stock._id?.slice(-6).toUpperCase()}
                </span>
              </div>
            </div>
          </div>
          <div className="space-y-5 overflow-auto max-h-[60vh] px-1">
            <div className="col-span-2 mb-2">
              <div>
                <label className="block text-sm mb-1">
                  Product
                </label>
                <input
                  type="text"
                  className="w-full bg-gray-50 border rounded-lg px-3 py-2 text-gray-800 border-gray-200"
                  value={stock.product?.name || "N/A"}
                  disabled
                />
              </div>
            </div>
            <div className="col-span-2 mb-2">
              <div className="mb-3 grid lg:grid-cols-2 md:grid-cols-1 gap-4">
                <div>
                  <label className="block text-sm mb-1">
                    Quantity
                  </label>
                  <input
                    className={`w-full bg-gray-50 border rounded-lg px-3 py-2 text-gray-800 border-gray-200 ${
                      stock.type === "in" ? "text-green-600" : "text-red-600"
                    }`}
                    value={(stock.type === "in" ? "+" : "-") + stock.quantity}
                    disabled
                  />
                </div>
                <div>
                  <label className="block text-sm mb-1">
                    Batch Number
                  </label>
                  <input
                    className="w-full bg-gray-50 border rounded-lg px-3 py-2 text-gray-800 border-gray-200"
                    value={stock.batch_number || "-"}
                    disabled
                  />
                </div>
                <div>
                  <label className="block text-sm mb-1">
                    Type
                  </label>
                  <input
                    className={`w-full bg-gray-50 border rounded-lg px-3 py-2 text-gray-800 border-gray-200 ${
                      stock.type === "in" ? "text-green-600" : "text-red-600"
                    }`}
                    value={"Stock " + stock.type}
                    disabled
                  />
                </div>
                <div>
                  <label className="block text-sm mb-1">
                    Reason
                  </label>
                  <input
                    className="w-full bg-gray-50 border rounded-lg px-3 py-2 text-gray-800 border-gray-200"
                    value={stock.reason || "-"}
                    disabled
                  />
                </div>
                <div>
                  <label className="block text-sm mb-1">
                    Balance After
                  </label>
                  <input
                    className="w-full bg-gray-50 border rounded-lg px-3 py-2 text-gray-800 border-gray-200"
                    value={stock.balance || "-"}
                    disabled
                  />
                </div>
                <div>
                  <label className="block text-sm mb-1">
                    Location
                  </label>
                  <input
                    className="w-full bg-gray-50 border rounded-lg px-3 py-2 text-gray-800 border-gray-200"
                    value={stock.location || "-"}
                    disabled
                  />
                </div>
                <div>
                  <label className="block text-sm mb-1">
                    User
                  </label>
                  <input
                    className="w-full bg-gray-50 border rounded-lg px-3 py-2 text-gray-800 border-gray-200"
                    value={
                      stock.user?.first_name
                        ? `${stock.user.first_name} ${stock.user.last_name}`
                        : "-"
                    }
                    disabled
                  />
                </div>
                <div>
                  <label className="block text-sm mb-1">
                    Date
                  </label>
                  <input
                    className="w-full bg-gray-50 border rounded-lg px-3 py-2 text-gray-800 border-gray-200"
                    value={new Date(stock.createdAt).toLocaleString()}
                    disabled
                  />
                </div>
              </div>
            </div>
            <div className="col-span-2 mb-2">
              <div>
                <label className="block text-sm mb-1">
                  Notes
                </label>
                <textarea
                  className="w-full bg-gray-50 border rounded-lg px-3 py-2 text-gray-800 border-gray-200"
                  value={stock.note || "-"}
                  disabled
                  rows={2}
                />
              </div>
            </div>
          </div>
          <div className="col-span-2 w-full flex items-center justify-end gap-3 mt-4">
            <button
              type="button"
              className="bg-gray-100 hover:bg-gray-200 text-[#1e3a5f] px-6 py-2 rounded-xl focus:outline-none border border-gray-200 flex items-center gap-2 cursor-pointer"
              onClick={onClose}
            >
              <HiXCircle className="inline-block text-xl" /> Close
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default StockViewModal;
