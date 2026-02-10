import React, { useEffect, useState } from "react";
import { useAuth } from "../contexts/auth/useAuth";
import { useDialog } from "../contexts/dialog/useDialog";
import {
  HiOutlineCheckCircle,
  HiOutlineXCircle,
  HiOutlineFilter,
  HiOutlineEye,
  HiOutlineRefresh,
} from "react-icons/hi";
import { getApproveRequests, updateApproveRequests } from "../api";
import Pagination from "../components/Pagination";
import NoDataFound from "../components/NoDataFound";
import Loading from "../components/Loading";
import Dialog from "../components/Dialog";
import OrderRequestModal from "../components/OrderRequestModal";
import DatePicker from "../components/DatePicker";

const OrderRequestApproval = () => {
  const [orders, setOrders] = useState([]);

  // Pagination
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 10,
    totalItems: 0,
    totalPages: 1,
  });

  // Loading and Error
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  // Modal
  const [remarks, setRemarks] = useState({});
  const [actionId, setActionId] = useState(null);

  // Dialog
  const [rejectDialog, setRejectDialog] = useState({ open: false, id: null });
  const [viewDialog, setViewDialog] = useState({ open: false, order: null });
  const [rejectionReason, setRejectionReason] = useState("");

  // Auth
  const { user } = useAuth();
  const dialog = useDialog();

  // Filters
  const [search, setSearch] = useState("");
  const [startDate, setStartDate] = useState(
    new Date(new Date().setDate(new Date().getDate() - 7))
      .toISOString()
      .split("T")[0],
  );
  const [endDate, setEndDate] = useState(
    new Date().toISOString().split("T")[0],
  );

  // Permissions
  const canView = user?.permission?.permissions?.includes(
    "view_approve_request",
  );
  const canUpdate = user?.permission?.permissions?.includes(
    "update_approve_request",
  );

  useEffect(() => {
    const delayDebounceFn = setTimeout(() => {
      fetchApproveRequests(1, pagination.limit, search, startDate, endDate);
      setPagination((prev) => ({ ...prev, page: 1 }));
    }, 500);
    return () => clearTimeout(delayDebounceFn);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user, search, startDate, endDate]);

  async function fetchApproveRequests(
    page = 1,
    limit = 10,
    search,
    startDate,
    endDate,
  ) {
    setLoading(true);
    setError("");
    try {
      const res = await getApproveRequests({
        page,
        limit,
        search,
        startDate,
        endDate,
      });
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
      fetchApproveRequests(1, pagination.limit, search, startDate, endDate);
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
      fetchApproveRequests(1, pagination.limit, search, startDate, endDate);
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

  const handleReset = () => {
    setSearch("");
    setStartDate("");
    setEndDate("");
    setPagination((prev) => ({ ...prev, page: 1 }));
    fetchApproveRequests(1, pagination.limit, "", "", "");
  };

  return (
    <div>
      <OrderRequestModal
        open={viewDialog.open}
        initial={
          viewDialog.order ? { ...viewDialog.order, viewOnly: true } : null
        }
        onClose={() => setViewDialog({ open: false, order: null })}
      />
      <div className="flex items-center justify-between mb-8">
        <div className="flex flex-col">
          <h1 className="text-xl font-semibold">Order Request Approvals</h1>
          <span className="text-gray-500 text-sm">
            Review and manage order request approvals
          </span>
        </div>
      </div>
      <div className="bg-white rounded-xl p-6 mb-4 border border-gray-200">
        <div className="w-full flex items-center justify-between">
          <h3 className="flex items-center gap-2 text-base mb-2 text-black">
            <HiOutlineFilter className="inline-block text-sm text-black" />
            <span>Filters</span>
          </h3>
          <button
            onClick={handleReset}
            className="flex items-center gap-2 text-sm mb-2 text-black cursor-pointer"
          >
            <HiOutlineRefresh className="inline-block text-sm text-black" />
            <span>Reset</span>
          </button>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
          <div>
            <label className="block text-gray-700 text-sm mb-1">Search</label>
            <input
              className="bg-gray-50 border border-gray-200 rounded-lg py-2 px-4 text-gray-700 min-w-0 w-full text-sm"
              placeholder="Search..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
          <div>
            <label className="block text-gray-700 text-sm mb-1">From</label>
            <DatePicker
              selected={startDate}
              onChange={(date) =>
                setStartDate(date ? date.toISOString().split("T")[0] : "")
              }
              placeholder="Start Date"
            />
          </div>
          <div>
            <label className="block text-gray-700 text-sm mb-1">To</label>
            <DatePicker
              selected={endDate}
              onChange={(date) =>
                setEndDate(date ? date.toISOString().split("T")[0] : "")
              }
              placeholder="End Date"
            />
          </div>
        </div>
      </div>
      <div className="bg-white rounded-xl overflow-x-auto border border-gray-200 px-3">
        {loading ? (
          <Loading />
        ) : error ? (
          <div className="p-8 text-center text-red-500">{error}</div>
        ) : (
          <table className="min-w-full text-left text-sm align-middle">
            <thead>
              <tr>
                <th className="number">No.</th>
                <th>Requested By</th>
                <th>Product(s)</th>
                <th>Quantity(ies)</th>
                <th>Requested Date</th>
                <th>Delivery Date</th>
                <th>Notes</th>
                {canUpdate ? (
                  <th className="text-center action">Actions</th>
                ) : null}
              </tr>
            </thead>
            <tbody>
              {orders.map((order, index) => (
                <tr key={order._id}>
                  <td className="number">
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
                  <td className="flex items-center gap-1 justify-center action">
                    {canView && (
                      <button
                        className="text-[#1e3a5f] font-semibold cursor-pointer p-2 rounded-full hover:bg-[#f1f5f9]"
                        title="View"
                        onClick={() => handleView(order)}
                      >
                        <HiOutlineEye className="text-2xl" />
                      </button>
                    )}
                    {canUpdate && (
                      <button
                        className="text-green-600 font-semibold cursor-pointer p-2 rounded-full hover:bg-[#f1f5f9]"
                        title="Approve"
                        disabled={actionId === order._id}
                        onClick={() => handleApprove(order._id)}
                      >
                        <HiOutlineCheckCircle className="text-2xl" />
                      </button>
                    )}
                    {canUpdate && (
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
                        <label className="block text-gray-500 text-sm mb-2">
                          Please provide a reason for rejection:
                        </label>
                        <textarea
                          type="text"
                          className="w-full bg-gray-50 border rounded-lg px-3 py-2 text-sm text-gray-800 border-gray-200"
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
