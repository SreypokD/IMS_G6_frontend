import React, { useEffect, useState } from "react";
import { useAuth } from "../context/useAuth";
import { getOrderRequests, cancelOrderRequest } from "../api";

const OrderHistory = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const { user } = useAuth();

  useEffect(() => {
    if (user) {
      fetchOrders();
    }
  }, [user]);

  if (!user) {
    return (
      <div className="text-red-600">
        Please log in to view your order history.
      </div>
    );
  }

  async function fetchOrders() {
    setLoading(true);
    setError("");
    try {
      const res = await getOrderRequests();
      setOrders(res.data.data);
    } catch {
      setError("Failed to load order history");
    } finally {
      setLoading(false);
    }
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
      <h1 className="text-2xl font-semibold mb-4">Order History</h1>
      {loading ? (
        <div>Loading...</div>
      ) : error ? (
        <div className="text-red-600">{error}</div>
      ) : (
        <table className="min-w-full text-left text-sm align-middle">
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
                <td className="py-3 px-4">{idx + 1}</td>
                <td className="py-3 px-4">
                  {order.Product?.name || order.productId}
                </td>
                <td className="py-3 px-4">{order.quantity}</td>
                <td className="py-3 px-4">{order.status}</td>
                <td className="py-3 px-4">{order.admin_remarks || "-"}</td>
                <td className="py-3 px-4">
                  {order.status === "rejected"
                    ? order.rejection_reason || "-"
                    : "-"}
                </td>
                <td className="py-3 px-4">
                  {order.status === "pending" &&
                    user?.permission?.permissions?.includes(
                      "update_order_request",
                    ) && (
                      <button
                        className="text-red-600 font-semibold cursor-pointer"
                        onClick={() => handleCancel(order._id)}
                      >
                        Cancel
                      </button>
                    )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
};

export default OrderHistory;
