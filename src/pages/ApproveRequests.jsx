import React, { useEffect, useState } from "react";
import { useAuth } from "../contexts/auth/useAuth";
import { useDialog } from "../contexts/dialog/useDialog";
import {
  HiOutlineCheckCircle,
  HiOutlineXCircle,
  HiOutlineFilter,
  HiOutlineEye,
} from "react-icons/hi";
import { getApproveRequests, updateApproveRequests } from "../api";
import Pagination from "../components/Pagination";
import NoDataFound from "../components/NoDataFound";
import Dialog from "../components/Dialog";
import OrderRequestModal from "../components/OrderRequestModal";

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
  const [rejectDialog, setRejectDialog] = useState({ open: false, id: null });
  const [viewDialog, setViewDialog] = useState({ open: false, order: null });
  const [rejectionReason, setRejectionReason] = useState("");
  const { user } = useAuth();
  const dialog = useDialog();
  const [search, setSearch] = useState("");

  useEffect(() => {
    const delayDebounceFn = setTimeout(() => {
      fetchApproveRequests(1, pagination.limit, search);
      setPagination((prev) => ({ ...prev, page: 1 }));
    }, 500);
    return () => clearTimeout(delayDebounceFn);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user, search]);

  async function fetchApproveRequests(page = 1, limit = 10, search) {
    setLoading(true);
    setError("");
    try {
      const res = await getApproveRequests({ page, limit, search });
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
      // setShowReject({});
      setPagination((prev) => ({ ...prev, page: 1 }));
      fetchApproveRequests(1, pagination.limit, search);
    } catch (err) {
      const msg =
        err?.response?.data?.error || err?.message || "Failed to approve order";
      await dialog.error(msg);
      setError(msg);
    } finally {
      setActionId(null);
    }
  }

  async function handleReject(id, reason) {
    setActionId(id);
    try {
      await updateApproveRequests(id, {
        status: "rejected",
        admin_remarks: remarks[id] || "",
        rejection_reason: reason || "",
      });
      await dialog.success("Order request rejected.");
      setRemarks({});
      setRejectionReason("");
      setRejectDialog({ open: false, id: null });
      setPagination((prev) => ({ ...prev, page: 1 }));
      fetchApproveRequests(1, pagination.limit, search);
    } catch (err) {
      const msg =
        err?.response?.data?.error || err?.message || "Failed to approve order";
      await dialog.error(msg);
      setError(msg);
    } finally {
      setActionId(null);
    }
  }

  function handleView(order) {
    setViewDialog({ open: true, order });
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
      <div className="bg-white rounded-xl p-6 mb-4 border border-gray-200">
        <h3 className="flex items-center gap-2 font-semibold text-lg mb-2 text-black">
          <HiOutlineFilter className="inline-block text-xl text-black" />
          <span>Filters</span>
        </h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
          <div>
            <label className="block text-gray-700 text-base font-bold mb-2">
              Search
            </label>
            <input
              className="bg-gray-50 border border-gray-200 rounded-lg py-2 px-4 text-gray-700 min-w-0 w-full"
              placeholder="Search..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
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
                <th>No.</th>
                <th>Requested By</th>
                <th>Product(s)</th>
                <th>Quantity(ies)</th>
                <th>Requested Date</th>
                <th>Delivery Date</th>
                <th>Notes</th>
                {user?.permission?.permissions?.includes(
                  "update_approve_request",
                ) ||
                user?.permission?.permissions?.includes(
                  "delete_approve_request",
                ) ? (
                  <th className="text-center">Actions</th>
                ) : null}
              </tr>
            </thead>
            <tbody>
              {orders.map((order, index) => (
                <tr key={order._id}>
                  <td>
                    {index + 1 + (pagination.page - 1) * pagination.limit}
                  </td>
                  <td>
                    {order.requester?.first_name +
                      " " +
                      order.requester?.last_name || "-"}
                  </td>
                  <td>
                    {Array.isArray(order.items) && order.items.length > 0
                      ? order.items
                          .map((item) => item.product?.name || item.product_id)
                          .join(", ")
                      : "-"}
                  </td>
                  <td>
                    {Array.isArray(order.items) && order.items.length > 0
                      ? order.items.map((item) => item.quantity).join(", ")
                      : "-"}
                  </td>
                  <td>
                    {order.createdAt
                      ? new Date(order.createdAt).toLocaleDateString()
                      : "-"}
                  </td>
                  <td>
                    {order.delivery_date
                      ? new Date(order.delivery_date).toLocaleDateString()
                      : "-"}
                  </td>
                  <td>{order.notes || "-"}</td>
                  <td className="flex items-center gap-1 justify-center">
                    {user?.permission?.permissions?.includes(
                      "view_approve_request",
                    ) && (
                      <button
                        className="text-[#1e3a5f] font-semibold cursor-pointer p-2 rounded-full hover:bg-[#f1f5f9]"
                        title="View"
                        onClick={() => handleView(order)}
                      >
                        <HiOutlineEye className="text-2xl" />
                      </button>
                    )}
                    {user?.permission?.permissions?.includes(
                      "update_approve_request",
                    ) && (
                      <OrderRequestModal
                        open={viewDialog.open}
                        onClose={() =>
                          setViewDialog({ open: false, order: null })
                        }
                        initial={{ ...viewDialog.order, viewOnly: true }}
                      />
                    )}
                    {user?.permission?.permissions?.includes(
                      "update_approve_request",
                    ) && (
                      <button
                        className="text-green-600 font-semibold cursor-pointer p-2 rounded-full hover:bg-[#f1f5f9]"
                        title="Approve"
                        disabled={actionId === order._id}
                        onClick={() => handleApprove(order._id)}
                      >
                        <HiOutlineCheckCircle className="text-2xl" />
                      </button>
                    )}
                    {user?.permission?.permissions?.includes(
                      "update_approve_request",
                    ) && (
                      <button
                        className="text-red-600 font-semibold cursor-pointer p-2 rounded-full hover:bg-[#f1f5f9]"
                        title="Reject"
                        disabled={actionId === order._id}
                        onClick={() => {
                          setRejectDialog({ open: true, id: order._id });
                          setRejectionReason("");
                        }}
                      >
                        <HiOutlineXCircle className="text-2xl" />
                      </button>
                    )}
                    <Dialog
                      open={rejectDialog.open}
                      type="confirm"
                      title="Reject Order Request"
                      cancelText="Cancel"
                      confirmText="Reject"
                      showActions
                      onClose={() => setRejectDialog({ open: false, id: null })}
                      onConfirm={() =>
                        handleReject(rejectDialog.id, rejectionReason)
                      }
                      confirmDisabled={
                        actionId === rejectDialog.id || !rejectionReason.trim()
                      }
                    >
                      <div className="mb-4 w-full">
                        <label className="block text-gray-500 text-base mb-2">
                          Please provide a reason for rejection:
                        </label>
                        <textarea
                          type="text"
                          className="w-full bg-gray-50 border rounded-lg px-3 py-2 text-gray-800 border-gray-200"
                          placeholder="Rejection reason"
                          value={rejectionReason}
                          onChange={(e) => setRejectionReason(e.target.value)}
                          disabled={actionId === rejectDialog.id}
                          autoFocus
                        />
                      </div>
                    </Dialog>
                  </td>
                </tr>
              ))}
              {orders.length === 0 && (
                <tr>
                  <td colSpan="8">
                    <NoDataFound message="No approve requests found." />
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
