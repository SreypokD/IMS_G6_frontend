import React from "react";

import { HiCheck } from "react-icons/hi";

const DeliveryConfirmation = () => {
  // Placeholder data
  const deliveries = [
    { id: 1, order: "Order #1", status: "Pending", date: "2026-01-25" },
    { id: 2, order: "Order #2", status: "Delivered", date: "2026-01-24" },
  ];
  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <div className="flex flex-col">
          <h1 className="text-2xl font-semibold">Delivery Confirmation</h1>
          <span className="text-gray-500">Manage and confirm deliveries efficiently</span>
        </div>
      </div>
      <div className="bg-white rounded-xl overflow-x-auto border border-gray-200">
        <table className="min-w-full text-sm align-middle">
          <thead>
            <tr className="bg-white text-gray-700">
              <th className="py-3 px-4 font-semibold text-left w-8">
                <input
                  type="checkbox"
                  className="accent-blue-600 w-4 h-4"
                  disabled
                />
              </th>
              <th className="py-3 px-4 font-semibold text-left whitespace-nowrap">
                No.
              </th>
              <th className="py-3 px-4 font-semibold text-left whitespace-nowrap">
                Order
              </th>
              <th className="py-3 px-4 font-semibold text-left whitespace-nowrap">
                Status
              </th>
              <th className="py-3 px-4 font-semibold text-left whitespace-nowrap">
                Date
              </th>
              <th className="py-3 px-4 font-semibold text-center whitespace-nowrap">
                Action
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {deliveries.map((d, index) => (
              <tr key={d._id}>
                <td className="py-3 px-4 text-center">
                  <input
                    type="checkbox"
                    className="accent-blue-600 w-4 h-4"
                    disabled
                  />
                </td>
                <td className="py-3 px-4 font-semibold text-gray-800 whitespace-nowrap">
                  {index + 1}
                </td>
                <td className="py-3 px-4 text-gray-700 whitespace-nowrap">
                  {d.order}
                </td>
                <td className="py-3 px-4 whitespace-nowrap">
                  <span
                    className={`inline-block px-3 py-1 rounded-full text-xs font-semibold ${d.status === "Pending" ? "bg-yellow-100 text-yellow-700" : "bg-green-100 text-green-700"}`}
                  >
                    {d.status}
                  </span>
                </td>
                <td className="py-3 px-4 text-gray-500 whitespace-nowrap">
                  {d.date}
                </td>
                <td className="py-3 px-4 text-center whitespace-nowrap">
                  {d.status === "Pending" && (
                    <button
                      className="bg-[#0071e3] hover:bg-blue-700 text-white p-1 rounded-full cursor-pointer"
                      title="Confirm Delivery"
                    >
                      <HiCheck className="w-4 h-4" />
                    </button>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default DeliveryConfirmation;
