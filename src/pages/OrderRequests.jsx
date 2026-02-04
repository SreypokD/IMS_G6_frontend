import React, { useState, useEffect } from "react";
import {
  HiSelector,
  HiOutlinePlus,
  HiOutlinePencil,
  HiOutlineXCircle,
  HiOutlineFilter,
  HiOutlineEye,
} from "react-icons/hi";
import { useAuth } from "../contexts/auth/useAuth.js";
import { useDialog } from "../contexts/dialog/useDialog.js";
import OrderRequestModal from "../components/OrderRequestModal.jsx";
import { getOrderRequests, cancelOrderRequest } from "../api";
import Pagination from "../components/Pagination";
import NoDataFound from "../components/NoDataFound";
import { formatDate } from "../utils/dateFormat";
import { Listbox } from "@headlessui/react";

const statusOptions = [
  { value: "pending", label: "Pending" },
  { value: "approved", label: "Approved" },
  { value: "rejected", label: "Rejected" },
  { value: "completed", label: "Completed" },
  { value: "on_hold", label: "On Hold" },
];

function StatusDropdown({ value, onChange }) {
  return (
    <Listbox value={value} onChange={onChange}>
      <div className="relative">
        <Listbox.Button className="cursor-pointer w-full bg-gray-50 border border-gray-200 rounded-lg px-3 py-2 text-left text-gray-800 flex items-center justify-between">
          <span>{value || "All Statuses"}</span>
          <HiSelector className="w-5 h-5 text-gray-400 ml-2" />
        </Listbox.Button>
        <Listbox.Options className="absolute z-10 mt-1 w-full bg-white border border-gray-200 rounded-lg shadow-lg max-h-60 overflow-auto focus:outline-none">
          <Listbox.Option
            className="px-4 py-2 cursor-pointer text-black hover:bg-[#f1f5f9]"
            value=""
          >
            <span>All Statuses</span>
          </Listbox.Option>
          {statusOptions.map((option) => (
            <Listbox.Option
              key={option.value}
              value={option.value}
              className={({ selected }) =>
                `px-4 py-2 cursor-pointer text-black hover:bg-[#f1f5f9] ${selected ? "bg-blue-50" : ""}`
              }
            >
              {option.label}
            </Listbox.Option>
          ))}
        </Listbox.Options>
      </div>
    </Listbox>
  );
}

const OrderRequests = () => {
  const [requests, setRequests] = useState([]);
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 10,
    totalItems: 0,
    totalPages: 1,
  });
  const [modalOpen, setModalOpen] = useState(false);
  const [editOrderRequest, setEditOrderRequest] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const { user } = useAuth();
  const dialog = useDialog();
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("");

  useEffect(() => {
    if (user) {
      fetchOrderRequests(pagination.page, pagination.limit, search, status);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user, search, status]);

  // Fetch order requests from API
  async function fetchOrderRequests(
    page = pagination.page,
    limit = pagination.limit,
    search,
    status,
  ) {
    setLoading(true);
    setError("");
    try {
      const res = await getOrderRequests({ page, limit, search, status });
      setRequests(res.data.data);
      setPagination((prev) => ({
        ...prev,
        ...res.data.pagination,
        page,
        limit,
      }));
    } catch {
      setError("Failed to load order requests");
    } finally {
      setLoading(false);
    }
  }

  async function handleCancelRequest(id) {
    const confirmed = await dialog.ask({
      type: "confirm",
      title: "Cancel Order Request",
      message: "Are you sure you want to cancel this order request?",
      confirmText: "Yes",
      cancelText: "No",
    });
    if (!confirmed) return;
    setLoading(true);
    try {
      await cancelOrderRequest(id);
      await dialog.success("Order request cancelled successfully.");
      fetchOrderRequests(pagination.page, pagination.limit, search, status);
    } catch {
      setError("Failed to cancel order request");
      dialog.error("Failed to cancel order request");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div>
      <OrderRequestModal
        open={modalOpen}
        initial={editOrderRequest}
        onClose={() => {
          setModalOpen(false);
          setEditOrderRequest(null);
        }}
        onSave={() => {
          setModalOpen(false);
          setEditOrderRequest(null);
          fetchOrderRequests(pagination.page, pagination.limit, search, status);
        }}
      />
      <div className="flex items-center justify-between mb-8">
        <div className="flex flex-col">
          <h1 className="text-2xl font-semibold">Order Management</h1>
          <span className="text-gray-500">Manage and track order requests</span>
        </div>
        {user?.permission?.permissions?.includes("create_order_request") && (
          <button
            className="bg-[#1e3a5f] hover:bg-[#16375b] text-white px-6 py-2 rounded-xl focus:outline-none flex items-center gap-2 cursor-pointer"
            onClick={() => setModalOpen(true)}
          >
            <HiOutlinePlus className="text-md" /> Add Request
          </button>
        )}
      </div>
      <div className="bg-white rounded-xl p-6 mb-6 border border-gray-200">
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
          <div>
            <label className="block text-gray-700 text-base font-bold mb-2">
              Status
            </label>
            <StatusDropdown
              value={status}
              onChange={(status) => {
                setStatus(status);
                fetchOrderRequests(1, pagination.limit, search, status);
                setPagination((prev) => ({ ...prev, page: 1 }));
              }}
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
                <th className="p-3">No.</th>
                <th className="p-3">Requested By</th>
                <th className="p-3">Product(s)</th>
                <th className="p-3">Quantity(ies)</th>
                <th className="p-3">Notes</th>
                <th className="p-3">Requested Date</th>
                <th className="p-3">Delivery Date</th>
                <th className="p-3">Status</th>
                <th className="p-3">Actions</th>
              </tr>
            </thead>
            <tbody>
              {(() => {
                // Admins and staff see all requests, customers see only their own
                const isAdminOrStaff =
                  user?.role === "admin" || user?.role === "staff";
                const filteredRequests = isAdminOrStaff
                  ? requests
                  : requests.filter(
                      (req) => String(req.requester_id) === String(user._id),
                    );
                if (!filteredRequests || filteredRequests.length === 0) {
                  return (
                    <tr>
                      <td colSpan="7">
                        <NoDataFound message="No order requests found." />
                      </td>
                    </tr>
                  );
                }
                return filteredRequests.map((request, index) => (
                  <tr key={request._id}>
                    <td className="px-3 py-1">
                      {index + 1 + (pagination.page - 1) * pagination.limit}
                    </td>
                    <td className="px-3 py-1">
                      {request.requester?.first_name +
                        " " +
                        request.requester?.last_name || "-"}
                    </td>
                    <td className="px-3 py-1">
                      {Array.isArray(request.items) && request.items.length > 0
                        ? request.items
                            .map((item) => item.product?.name)
                            .join(", ")
                        : "-"}
                    </td>
                    <td className="px-3 py-1">
                      {Array.isArray(request.items) && request.items.length > 0
                        ? request.items.map((item) => item.quantity).join(", ")
                        : "-"}
                    </td>
                    <td className="px-3 py-1">{request.notes || "-"}</td>
                    <td className="px-3 py-1">
                      {formatDate(request.createdAt) || "-"}
                    </td>
                    <td className="px-3 py-1">
                      {formatDate(request.delivery_date) || "-"}
                    </td>
                    <td className="px-3 py-1">
                      <span
                        className={`inline-block px-3 py-1 rounded-full text-sm font-semibold ${request.status === "pending" ? "bg-yellow-100 text-yellow-700" : request.status === "approved" ? "bg-green-100 text-green-700" : request.status === "rejected" ? "bg-red-100 text-red-700" : request.status === "completed" ? "bg-blue-100 text-blue-700" : request.status === "on_hold" ? "bg-orange-100 text-orange-700" : "bg-gray-100 text-gray-700"}`}
                      >
                        {request.status.charAt(0).toUpperCase() +
                          request.status.slice(1)}
                      </span>
                    </td>
                    <td className="px-3 py-1 flex items-center gap-1">
                      {(user?.role === "admin" ||
                        user?.role === "staff" ||
                        String(request.requester_id) === String(user?._id)) && (
                        <div className="flex items-center gap-1">
                          {user?.permission?.permissions?.includes(
                            "view_order_request",
                          ) && (
                            <button
                              className="text-[#1e3a5f] font-semibold cursor-pointer p-2 rounded-full hover:bg-[#f1f5f9]"
                              title="View"
                              onClick={() => {
                                setEditOrderRequest({
                                  ...request,
                                  viewOnly: true,
                                });
                                setModalOpen(true);
                              }}
                            >
                              <HiOutlineEye className="text-xl" />
                            </button>
                          )}
                          {request?.status === "pending" &&
                            (user?.role === "admin" ||
                              user?.role === "staff" ||
                              String(request.requester_id) ===
                                String(user?._id)) && (
                              <button
                                className="text-[#1e3a5f] font-semibold cursor-pointer p-2 rounded-full hover:bg-[#f1f5f9]"
                                title="Edit"
                                onClick={() => {
                                  setEditOrderRequest(request);
                                  setModalOpen(true);
                                }}
                              >
                                <HiOutlinePencil className="text-xl" />
                              </button>
                            )}
                          {request?.status === "pending" &&
                            (user?.role === "admin" ||
                              user?.role === "staff" ||
                              String(request.requester_id) ===
                                String(user?._id)) && (
                              <button
                                className="text-red-600 font-semibold cursor-pointer p-2 rounded-full hover:bg-[#f1f5f9]"
                                title="Cancel"
                                onClick={() => handleCancelRequest(request._id)}
                              >
                                <HiOutlineXCircle className="text-2xl" />
                              </button>
                            )}
                        </div>
                      )}
                    </td>
                  </tr>
                ));
              })()}
              {requests.length === 0 && (
                <tr>
                  <td colSpan="9">
                    <NoDataFound message="No order requests found." />
                  </td>
                </tr>
              )}
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
            onChange={({ page, limit }) => {
              setPagination((prev) => ({ ...prev, page, limit }));
              fetchOrderRequests(page, limit);
            }}
          />
        </div>
      )}
    </div>
  );
};

export default OrderRequests;
