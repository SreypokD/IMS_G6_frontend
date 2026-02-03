import React, { useEffect, useState } from "react";
import { useAuth } from "../contexts/auth/useAuth";
import { getOrderRequests } from "../api";
import Pagination from "../components/Pagination";
import NoDataFound from "../components/NoDataFound";
import { formatDate } from "../utils/dateFormat";

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
      setPagination((prev) => ({
        ...prev,
        ...res.data.pagination,
        page,
        limit,
      }));
    } catch {
      setError("Failed to load order history");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <div className="flex flex-col">
          <h1 className="text-2xl font-semibold">Order History</h1>
          <span className="text-gray-500">
            Review your past order requests and their statuses
          </span>
        </div>
      </div>
      <div className="bg-white rounded-xl overflow-x-auto border border-gray-200 px-3">
        {loading ? (
          <div className="p-8 text-center text-gray-500">Loading...</div>
        ) : error ? (
          <div className="p-8 text-center text-red-500">{error}</div>
        ) : (
          <table className="min-w-full text-left text-base align-middle">
            <thead>
              <tr>
                <th className="p-3">No.</th>
                <th className="p-3">Product(s)</th>
                <th className="p-3">Quantity(ies)</th>{" "}
                <th className="p-3">Notes</th>
                <th className="p-3">Admin Remarks</th>{" "}
                <th className="p-3">Requested Date</th>
                <th className="p-3">Delivery Date</th>
                <th className="p-3">Status</th>
                <th className="p-3">Rejection Reason</th>
              </tr>
            </thead>
            <tbody>
              {(user?.role === "admin" || user?.role === "staff"
                ? orders
                : orders.filter(
                    (order) => String(order.requester_id) === String(user?._id),
                  )
              ).map((order, index) => (
                <tr key={order._id}>
                  <td className="p-3">
                    {index + 1 + (pagination.page - 1) * pagination.limit}
                  </td>
                  <td className="p-3">
                    {Array.isArray(order.items) && order.items.length > 0
                      ? order.items
                          .map((item) => item.product?.name || item.product_id)
                          .join(", ")
                      : "-"}
                  </td>
                  <td className="p-3">
                    {Array.isArray(order.items) && order.items.length > 0
                      ? order.items.map((item) => item.quantity).join(", ")
                      : "-"}
                  </td>
                  <td className="p-3">{order.notes || "-"}</td>
                  <td className="p-3">{order.admin_remarks || "-"}</td>
                  <td className="p-3">{formatDate(order.createdAt) || "-"}</td>
                  <td className="p-3">
                    {formatDate(order.delivery_date) || "-"}
                  </td>
                  <td className="p-3">
                    <span
                      className={`inline-block px-3 py-1 rounded-full text-sm font-semibold ${order.status === "approved" ? "bg-green-100 text-green-700" : order.status === "rejected" ? "bg-red-100 text-red-700" : order.status === "completed" ? "bg-blue-100 text-blue-700" : "bg-yellow-100 text-yellow-700"}`}
                    >
                      {order.status
                        ? order.status.charAt(0).toUpperCase() +
                          order.status.slice(1)
                        : "Pending"}
                    </span>
                  </td>
                  <td className="p-3">
                    {order.status === "rejected"
                      ? order.rejection_reason || "-"
                      : "-"}
                  </td>
                </tr>
              ))}
              {(user?.role === "admin" || user?.role === "staff"
                ? orders
                : orders.filter(
                    (order) => String(order.requester_id) === String(user?._id),
                  )
              ).length === 0 && (
                <tr>
                  <td colSpan="7">
                    <NoDataFound message="No orders found." />
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        )}
      </div>
      {orders.length > 0 && (
        <div className="flex justify-end mt-4">
          <Pagination
            total={pagination.totalItems}
            page={pagination.page}
            limit={pagination.limit}
            onChange={({ page, limit }) => {
              setPagination((prev) => ({ ...prev, page, limit }));
              fetchOrders(page, limit);
            }}
          />
        </div>
      )}
    </div>
  );
};

export default OrderHistory;
