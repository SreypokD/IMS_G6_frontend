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
          <span className="text-gray-500">
            Manage and confirm deliveries efficiently
          </span>
        </div>
      </div>
      <div className="bg-white rounded-xl overflow-x-auto border border-gray-200">
        <table className="min-w-full text-left text-sm align-middle">
          <thead>
            <tr className="bg-white">
              <th className="py-3 px-4">No.</th>
              <th className="py-3 px-4">Order</th>
              <th className="py-3 px-4">Status</th>
              <th className="py-3 px-4">Date</th>
              <th className="py-3 px-4">Action</th>
            </tr>
          </thead>
          <tbody>
            {deliveries.map((d, index) => (
              <tr key={d._id} className="border-t border-gray-200">
                <td className="py-3 px-4">{index + 1}</td>
                <td className="py-3 px-4">{d.order}</td>
                <td className="py-3 px-4">
                  <span
                    className={`inline-block px-3 py-1 rounded-full text-xs font-semibold ${d.status === "Pending" ? "bg-yellow-100 text-yellow-700" : "bg-green-100 text-green-700"}`}
                  >
                    {d.status}
                  </span>
                </td>
                <td className="py-3 px-4">{d.date}</td>
                <td className="py-3 px-4">
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
