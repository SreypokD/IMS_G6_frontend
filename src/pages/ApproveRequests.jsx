import React, { useEffect, useState } from "react";
import { useAuth } from "../contexts/auth/useAuth";
import { useDialog } from "../contexts/dialog/useDialog";
import { HiOutlineCheckCircle, HiOutlineXCircle } from "react-icons/hi";
import { getApproveRequests, updateApproveRequests } from "../api";
import Pagination from "../components/Pagination";
import NoDataFound from "../components/NoDataFound";

const OrderRequestApproval = () => {
  const [orders, setOrders] = useState([]);
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 10,
    totalItems: 0,
    totalPages: 1,
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [remarks, setRemarks] = useState({});
  const [actionId, setActionId] = useState(null);
  const [showReject, setShowReject] = useState({});
  const [rejectionReason, setRejectionReason] = useState({});
  const { user } = useAuth();
  const dialog = useDialog();

  useEffect(() => {
    if (user) {
      fetchApproveRequests(1, 10);
    }
  }, [user]);

  async function fetchApproveRequests(page = 1, limit = 10) {
    setLoading(true);
    setError("");
    try {
      const res = await getApproveRequests({ page, limit });
      setOrders(res.data.data.filter((o) => o.status === "pending"));
      setPagination((prev) => ({
        ...prev,
        ...res.data.pagination,
        page,
        limit,
      }));
    } catch {
      setError("Failed to load approve requests");
    } finally {
      setLoading(false);
    }
  }

  async function handleApprove(id) {
    const confirmed = await dialog.ask({
      type: "confirm",
      title: "Approve Order Request",
      message: "Are you sure you want to approve this order request?",
      confirmText: "Approve",
      cancelText: "Cancel",
    });
    if (!confirmed) return;
    setActionId(id);
    try {
      await updateApproveRequests(id, {
        status: "approved",
        admin_remarks: remarks[id] || "",
      });
      await dialog.success("Order request approved.");
      // Reset all relevant state after approve
      setRemarks({});
      setRejectionReason({});
      setShowReject({});
      setPagination((prev) => ({ ...prev, page: 1 }));
      fetchApproveRequests(1, pagination.limit);
    } catch (err) {
      const msg =
        err?.response?.data?.error || err?.message || "Failed to approve order";
      await dialog.error(msg);
      setError(msg);
    } finally {
      setActionId(null);
    }
  }

  async function handleReject(id) {
    setActionId(id);
    try {
      await updateApproveRequests(id, {
        status: "rejected",
        admin_remarks: remarks[id] || "",
        rejection_reason: rejectionReason[id] || "",
      });
      // Reset all relevant state after reject
      setRemarks({});
      setRejectionReason({});
      setShowReject({});
      setPagination((prev) => ({ ...prev, page: 1 }));
      fetchApproveRequests(1, pagination.limit);
    } catch (err) {
      const msg =
        err?.response?.data?.error || err?.message || "Failed to reject order";
      await dialog.error(msg);
      setError(msg);
    } finally {
      setActionId(null);
    }
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <div className="flex flex-col">
          <h1 className="text-2xl font-semibold">Order Request Approvals</h1>
          <span className="text-gray-500">
            Review and manage order request approvals
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
              <tr className="bg-white">
                <th className="p-3">No.</th>
                <th className="p-3">Requested By</th>
                <th className="p-3">Product(s)</th>
                <th className="p-3">Quantity(ies)</th>
                <th className="p-3">Requested Date</th>
                <th className="p-3">Delivery Date</th>
                <th className="p-3">Notes</th>
                <th className="p-3">Remarks</th>
                {user?.permission?.permissions?.includes(
                  "update_approve_request",
                ) ||
                user?.permission?.permissions?.includes(
                  "delete_approve_request",
                ) ? (
                  <th className="p-3">Actions</th>
                ) : null}
              </tr>
            </thead>
            <tbody>
              {orders.map((order, index) => (
                <tr key={order._id}>
                  <td className="p-3">
                    {index + 1 + (pagination.page - 1) * pagination.limit}
                  </td>
                  <td className="p-3">
                    {order.requester?.first_name +
                      " " +
                      order.requester?.last_name || "-"}
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
                  <td className="p-3">
                    {order.createdAt
                      ? new Date(order.createdAt).toLocaleDateString()
                      : "-"}
                  </td>
                  <td className="p-3">
                    {order.delivery_date
                      ? new Date(order.delivery_date).toLocaleDateString()
                      : "-"}
                  </td>
                  <td className="p-3">{order.notes || "-"}</td>
                  <td className="p-3">
                    <input
                      type="text"
                      className="border border-gray-200 rounded-lg px-2 py-1 text-base"
                      placeholder="Admin remarks"
                      value={remarks[order._id] || ""}
                      onChange={(e) =>
                        setRemarks((r) => ({
                          ...r,
                          [order._id]: e.target.value,
                        }))
                      }
                      disabled={actionId === order._id}
                    />
                  </td>
                  <td className="p-3 flex items-center gap-1">
                    {user?.permission?.permissions?.includes(
                      "update_approve_request",
                    ) && (
                      <button
                        className="text-green-600 hover:text-green-700 rounded-full cursor-pointer mr-2"
                        title="Approve"
                        disabled={actionId === order._id}
                        onClick={() => handleApprove(order._id)}
                      >
                        <HiOutlineCheckCircle className="w-8 h-8" />
                      </button>
                    )}
                    {user?.permission?.permissions?.includes(
                      "update_approve_request",
                    ) && (
                      <button
                        className="text-red-500 hover:text-red-600 rounded-full cursor-pointer"
                        title="Reject"
                        disabled={actionId === order._id}
                        onClick={() =>
                          setShowReject((s) => ({
                            ...s,
                            [order._id]: !s[order._id],
                          }))
                        }
                      >
                        <HiOutlineXCircle className="w-8 h-8" />
                      </button>
                    )}
                    {showReject[order._id] && (
                      <div className="mt-2">
                        <input
                          type="text"
                          className="border border-gray-200 rounded px-2 text-base mb-1"
                          placeholder="Rejection reason"
                          value={rejectionReason[order._id] || ""}
                          onChange={(e) =>
                            setRejectionReason((r) => ({
                              ...r,
                              [order._id]: e.target.value,
                            }))
                          }
                          disabled={actionId === order._id}
                        />
                        <button
                          className="text-red-500 hover:text-red-600 rounded-full cursor-pointer"
                          onClick={() => handleReject(order._id)}
                          disabled={actionId === order._id}
                        >
                          <HiOutlineXCircle className="w-8 h-8" />
                        </button>
                      </div>
                    )}
                  </td>
                </tr>
              ))}
              {orders.length === 0 && (
                <tr>
                  <td colSpan="8">
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
              fetchApproveRequests(page, limit);
            }}
          />
        </div>
      )}
    </div>
  );
};

export default OrderRequestApproval;
