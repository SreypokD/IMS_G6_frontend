import React, { useState, useEffect } from "react";
import { HiOutlinePlus } from "react-icons/hi";
import { useAuth } from "../context/useAuth";
import OrderRequestModal from "../components/OrderRequestModal.jsx";
import { getOrderRequests } from "../api";

const OrderRequests = () => {
  const [requests, setRequests] = useState([]);
  const [modalOpen, setModalOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const { user } = useAuth();

  useEffect(() => {
    fetchOrderRequests();
  }, []);

  // Fetch order requests from API
  async function fetchOrderRequests() {
    setLoading(true);
    try {
      const res = await getOrderRequests();
      setRequests(res.data.data);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div>
      <OrderRequestModal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        onSuccess={() => setModalOpen(false)}
      />
      <div className="flex items-center justify-between mb-8">
        <div className="flex flex-col">
          <h1 className="text-2xl font-semibold">Order Management</h1>
          <span className="text-gray-500">Manage and track order requests</span>
        </div>
        {user?.permission?.permissions?.includes("create_order_request") && (
          <button
            className="bg-[#1e3a5f] hover:bg-[#16375b] text-white px-5 py-2 rounded-xl transition flex items-center gap-2 cursor-pointer"
            onClick={() => setModalOpen(true)}
          >
            <HiOutlinePlus className="text-md" /> Add Request
          </button>
        )}
      </div>
      <div className="bg-white rounded-xl overflow-x-auto border border-gray-200">
        {loading ? (
          <div className="p-8 text-center text-gray-500">Loading...</div>
        ) : (
          <table className="min-w-full text-left text-sm align-middle">
            <thead>
              <tr>
                <th className="py-3 px-4">No.</th>
                <th className="py-3 px-4">Requester</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4">Date</th>
              </tr>
            </thead>
            <tbody>
              {requests.map((req, index) => (
                <tr key={req._id} className="border-t border-gray-200">
                  <td className="py-3 px-4">{index + 1}</td>
                  <td className="py-3 px-4">{req.requester}</td>
                  <td className="py-3 px-4">
                    <span
                      className={`inline-block px-3 py-1 rounded-full text-xs font-semibold ${req.status === "Pending" ? "bg-yellow-100 text-yellow-700" : "bg-green-100 text-green-700"}`}
                    >
                      {req.status}
                    </span>
                  </td>
                  <td className="py-3 px-4  ">{req.date}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
};

export default OrderRequests;
