import React, { useEffect, useState } from "react";
import { useAuth } from "../context/useAuth";
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
      setPagination(res.data.pagination);
    } catch {
      setError("Failed to load approve requests");
    } finally {
      setLoading(false);
    }
  }

  async function handleApprove(id) {
    setActionId(id);
    try {
      await updateApproveRequests(id, {
        status: "approved",
        admin_remarks: remarks[id] || "",
      });
      fetchApproveRequests();
    } catch {
      setError("Failed to approve order");
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
      fetchApproveRequests();
    } catch {
      setError("Failed to reject order");
    } finally {
      setActionId(null);
      setShowReject((prev) => ({ ...prev, [id]: false }));
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
      <div className="bg-white rounded-xl overflow-x-auto border border-gray-200">
        {loading ? (
          <div className="p-8 text-center text-gray-500">Loading...</div>
        ) : error ? (
          <div className="p-8 text-center text-red-500">{error}</div>
        ) : (
          <table className="min-w-full text-left text-base align-middle">
            <thead>
              <tr className="bg-white">
                <th className="py-3 px-4">No.</th>
                <th className="py-3 px-4">Requester</th>
                <th className="py-3 px-4">Product</th>
                <th className="py-3 px-4">Quantity</th>
                <th className="py-3 px-4">Requested Date</th>
                <th className="py-3 px-4">Notes</th>
                <th className="py-3 px-4">Remarks</th>
                {user?.permission?.permissions?.includes(
                  "update_approve_request",
                ) ||
                user?.permission?.permissions?.includes(
                  "delete_approve_request",
                ) ? (
                  <th className="py-3 px-4">Actions</th>
                ) : null}
              </tr>
            </thead>
            <tbody>
              {orders.map((order, idx) => (
                <tr key={order._id}>
                  <td className="py-1 px-4">
                    {idx + 1 + (pagination.page - 1) * pagination.limit}
                  </td>
                  <td className="py-1 px-4">
                    {order.requester?.first_name +
                      " " +
                      order.requester?.last_name || "-"}
                  </td>
                  <td className="py-1 px-4">
                    {order.Product?.name || order.product_id}
                  </td>
                  <td className="py-1 px-4">{order.quantity}</td>
                  <td className="py-1 px-4">
                    {order.requested_date
                      ? new Date(order.requested_date).toLocaleDateString()
                      : ""}
                  </td>
                  <td className="py-1 px-4">{order.notes}</td>
                  <td className="py-1 px-4">
                    <input
                      type="text"
                      className="border border-gray-200 rounded px-2 py-1 text-base"
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
                  <td className="py-1 px-4 flex items-center gap-1">
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
                          className="ml-2 px-2 py-1 bg-red-500 text-white rounded text-sm"
                          onClick={() => handleReject(order._id)}
                          disabled={actionId === order._id}
                        >
                          Confirm Reject
                        </button>
                      </div>
                    )}
                  </td>
                </tr>
              ))}
              {orders.length === 0 && (
                <tr>
                  <td colSpan="9">
                    <NoDataFound message="No users found." />
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
            onChange={({ page, limit }) =>
              fetchApproveRequests({ page, limit })
            }
          />
        </div>
      )}
    </div>
  );
};

export default OrderRequestApproval;
