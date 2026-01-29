import React, { useEffect, useState } from "react";
import { useAuth } from "../context/useAuth";
import { getOrderRequests, cancelOrderRequest } from "../api";
import Pagination from "../components/Pagination";

const OrderHistory = () => {
  const [orders, setOrders] = useState([]);
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 10,
    totalItems: 0,
    totalPages: 1,
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const { user } = useAuth();

  useEffect(() => {
    if (user) {
      fetchOrders(1, 10);
    }
  }, [user]);

  async function fetchOrders(page = 1, limit = 10) {
    setLoading(true);
    setError("");
    try {
      const res = await getOrderRequests({ page, limit });
      setOrders(res.data.data);
      setPagination(res.data.pagination);
    } catch {
      setError("Failed to load order history");
    } finally {
      setLoading(false);
    }
  }

  if (!user) {
    return (
      <div className="text-red-600">
        Please log in to view your order history.
      </div>
    );
  }

  async function handleCancel(orderId) {
    if (!window.confirm("Cancel this order request?")) return;
    setLoading(true);
    try {
      await cancelOrderRequest(orderId);
      fetchOrders();
    } catch {
      setError("Failed to cancel order");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <div className="flex flex-col">
          <h1 className="text-2xl font-semibold">Order History</h1>
          <span className="text-gray-500"></span>
        </div>
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
                <th className="py-3 px-4">Product</th>
                <th className="py-3 px-4">Quantity</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4">Admin Remarks</th>
                <th className="py-3 px-4">Rejection Reason</th>
                {user?.permission?.permissions?.includes(
                  "update_order_request",
                ) ||
                user?.permission?.permissions?.includes(
                  "delete_order_request",
                ) ? (
                  <th className="py-3 px-4">Actions</th>
                ) : null}
              </tr>
            </thead>
            <tbody>
              {orders.map((order, idx) => (
                <tr key={order._id} className="border-t border-gray-200">
                  <td className="py-1 px-4">{idx + 1}</td>
                  <td className="py-1 px-4">
                    {order.Product?.name || order.productId}
                  </td>
                  <td className="py-1 px-4">{order.quantity}</td>
                  <td className="py-1 px-4">{order.status}</td>
                  <td className="py-1 px-4">{order.admin_remarks || "-"}</td>
                  <td className="py-1 px-4">
                    {order.status === "rejected"
                      ? order.rejection_reason || "-"
                      : "-"}
                  </td>
                  <td className="py-1 px-4">
                    {order.status === "pending" &&
                      user?.permission?.permissions?.includes(
                        "update_order_request",
                      ) && (
                        <button
                          className="text-red-600 font-semibold cursor-pointer p-2 rounded-full hover:bg-[#f1f5f9]"
                          onClick={() => handleCancel(order._id)}
                        >
                          Cancel
                        </button>
                      )}
                  </td>
                </tr>
              ))}
              {orders.length === 0 && (
                <tr className="border-t border-gray-200">
                  <td colSpan="7" className="py-4 text-center text-gray-500">
                    No orders found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        )}
      </div>
      {orders.length > 0 && (
        <div className="flex justify-end mt-6">
          <Pagination
            total={pagination.totalItems}
            page={pagination.page}
            limit={pagination.limit}
            onChange={({ page, limit }) => fetchOrders({page, limit})}
          />
        </div>
      )}
    </div>
  );
};

export default OrderHistory;
