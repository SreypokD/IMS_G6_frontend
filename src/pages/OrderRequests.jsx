import React, { useState, useEffect } from "react";
import { HiOutlinePlus } from "react-icons/hi";
import { useAuth } from "../context/useAuth";
import OrderRequestModal from "../components/OrderRequestModal.jsx";
import { getOrderRequests } from "../api";
import Pagination from "../components/Pagination";
import NoDataFound from "../components/NoDataFound";
import { formatDate } from "../utils/dateFormat";

const OrderRequests = () => {
  const [requests, setRequests] = useState([]);
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 10,
    totalItems: 0,
    totalPages: 1,
  });
  const [modalOpen, setModalOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const { user } = useAuth();

  useEffect(() => {
    if (user) {
      fetchOrderRequests(1, 10);
    }
  }, [user]);

  // Fetch order requests from API
  async function fetchOrderRequests(page = 1, limit = 10) {
    setLoading(true);
    setError("");
    try {
      const res = await getOrderRequests({ page, limit });
      setRequests(res.data.data);
      setPagination(res.data.pagination);
    } catch {
      setError("Failed to load order requests");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div>
      <OrderRequestModal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        onSave={() => {
          setModalOpen(false);
          fetchOrderRequests(pagination.page, pagination.limit);
        }}
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
        ) : error ? (
          <div className="p-8 text-center text-red-500">{error}</div>
        ) : (
          <table className="min-w-full text-left text-base align-middle">
            <thead>
              <tr>
                <th className="py-3 px-4">No.</th>
                <th className="py-3 px-4">Requester</th>
                <th className="py-3 px-4">Date</th>
                <th className="py-3 px-4">Customer Remark</th>
                <th className="py-3 px-4">Delivery Date</th>
                <th className="py-3 px-4">Status</th>
              </tr>
            </thead>
            <tbody>
              {(() => {
                const filteredRequests =
                  user?.permission?.name === "Customer" ||
                  (user?.permission?.permissions &&
                    user.permission.permissions.includes(
                      "create_order_request",
                    ) &&
                    !user.permission.permissions.includes(
                      "update_order_request",
                    ))
                    ? requests.filter(
                        (req) => String(req.requester_id) === String(user._id),
                      )
                    : requests;
                if (!filteredRequests || filteredRequests.length === 0) {
                  return (
                    <tr>
                      <td colSpan="6">
                        <NoDataFound message="No order requests found." />
                      </td>
                    </tr>
                  );
                }
                return filteredRequests.map((req, index) => (
                  <tr key={req._id}>
                    <td className="py-1 px-4">
                      {index + 1 + (pagination.page - 1) * pagination.limit}
                    </td>
                    <td className="py-1 px-4">
                      {req.requester?.first_name ||
                        req.requester?.email ||
                        req.requester ||
                        "-"}
                    </td>
                    <td className="py-1 px-4">
                      {formatDate(req.date || req.requested_date)}
                    </td>
                    <td className="py-1 px-4">{req.customer_remark || "-"}</td>
                    <td className="py-1 px-4">
                      {formatDate(req.delivery_date)}
                    </td>
                    <td className="py-1 px-4">
                      <span
                        className={`inline-block px-3 py-1 rounded-full text-sm font-semibold ${req.status === "pending" ? "bg-yellow-100 text-yellow-700" : req.status === "approved" ? "bg-green-100 text-green-700" : req.status === "rejected" ? "bg-red-100 text-red-700" : req.status === "completed" ? "bg-blue-100 text-blue-700" : req.status === "on_hold" ? "bg-orange-100 text-orange-700" : "bg-gray-100 text-gray-700"}`}
                      >
                        {req.status.charAt(0).toUpperCase() +
                          req.status.slice(1)}
                      </span>
                      {user?.role === "customer" &&
                        req.status === "pending" &&
                        String(req.requester_id) === String(user._id) && (
                          <button
                            className="ml-2 text-sm text-red-600 underline cursor-pointer"
                            onClick={async () => {
                              try {
                                await import("../api").then((api) =>
                                  api.cancelOrderRequest(req._id),
                                );
                                fetchOrderRequests(
                                  pagination.page,
                                  pagination.limit,
                                );
                              } catch {
                                //
                              }
                            }}
                          >
                            Cancel
                          </button>
                        )}
                    </td>
                  </tr>
                ));
              })()}
            </tbody>
          </table>
        )}
      </div>
      {requests.length > 0 && (
        <div className="flex justify-end mt-4">
          <Pagination
            total={pagination.totalItems}
            page={pagination.page}
            limit={pagination.limit}
            onChange={({ page, limit }) => fetchOrderRequests({ page, limit })}
          />
        </div>
      )}
    </div>
  );
};

export default OrderRequests;
