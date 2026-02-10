import React, { useState, useEffect } from "react";
import {
  HiSelector,
  HiOutlinePlus,
  HiOutlinePencil,
  HiOutlineXCircle,
  HiOutlineFilter,
  HiOutlineEye,
  HiOutlineRefresh,
} from "react-icons/hi";
import { useAuth } from "../contexts/auth/useAuth.js";
import { useDialog } from "../contexts/dialog/useDialog.js";
import OrderRequestModal from "../components/OrderRequestModal.jsx";
import { getOrderRequests, cancelOrderRequest } from "../api";
import Pagination from "../components/Pagination";
import NoDataFound from "../components/NoDataFound";
import Loading from "../components/Loading";
import { formatDate } from "../utils/dateFormat";
import { Listbox } from "@headlessui/react";
import DatePicker from "../components/DatePicker";

const statusOptions = [
  { value: "Pending", label: "Pending" },
  { value: "Approved", label: "Approved" },
  { value: "Rejected", label: "Rejected" },
  { value: "Completed", label: "Completed" },
  { value: "On Hold", label: "On Hold" },
];

function StatusDropdown({ value, onChange }) {
  return (
    <Listbox value={value} onChange={onChange}>
      <div className="relative">
        <Listbox.Button className="cursor-pointer w-full bg-gray-50 border border-gray-100 rounded-lg px-3 py-2 text-left text-gray-800 text-sm flex items-center justify-between">
          <span>{value || "All Statuses"}</span>
          <HiSelector className="w-5 h-5 text-gray-400 ml-2" />
        </Listbox.Button>
        <Listbox.Options className="absolute z-10 mt-1 w-full bg-white border border-gray-100 rounded-lg shadow-lg max-h-60 overflow-auto focus:outline-none">
          <Listbox.Option
            className="px-4 py-2 cursor-pointer text-black text-sm hover:bg-[#f1f5f9]"
            value=""
          >
            <span>All Statuses</span>
          </Listbox.Option>
          {statusOptions.map((option) => (
            <Listbox.Option
              key={option.value}
              value={option.value}
              className={({ selected }) =>
                `px-4 py-2 cursor-pointer text-black text-sm hover:bg-[#f1f5f9] ${selected ? "bg-blue-50" : ""}`
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

  // Pagination
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 10,
    totalItems: 0,
    totalPages: 1,
  });

  // Modal
  const [modalOpen, setModalOpen] = useState(false);
  const [editOrderRequest, setEditOrderRequest] = useState(null);

  // Loading and Error
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
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
  const [status, setStatus] = useState("");

  // Permissions
  const canView = user?.permission?.permissions?.includes("view_order_request");
  const canCreate = user?.permission?.permissions?.includes(
    "create_order_request",
  );
  const canUpdate = user?.permission?.permissions?.includes(
    "update_order_request",
  );
  const canDelete = user?.permission?.permissions?.includes(
    "delete_order_request",
  );

  useEffect(() => {
    if (user) {
      fetchOrderRequests(
        pagination.page,
        pagination.limit,
        search,
        startDate,
        endDate,
        status,
      );
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user, search, status, startDate, endDate]);

  // Fetch order requests from API
  async function fetchOrderRequests(
    page = pagination.page,
    limit = pagination.limit,
    search,
    startDate,
    endDate,
    status,
  ) {
    setLoading(true);
    setError("");
    try {
      const res = await getOrderRequests({
        page,
        limit,
        search,
        startDate,
        endDate,
        status,
      });
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

  const handleReset = () => {
    setSearch("");
    setStartDate("");
    setEndDate("");
    setStatus("");
    setPagination((prev) => ({ ...prev, page: 1 }));
    fetchOrderRequests(1, pagination.limit, "", "", "", "");
  };

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
          <h1 className="text-xl font-semibold">Order Management</h1>
          <span className="text-gray-500 text-sm">
            Manage and track order requests
          </span>
        </div>
        {canCreate && (
          <button
            className="bg-[#1e3a5f] hover:bg-[#16375b] text-white px-6 py-2 rounded-xl focus:outline-none flex items-center gap-2 cursor-pointer text-sm"
            onClick={() => setModalOpen(true)}
          >
            <HiOutlinePlus className="text-md" /> Add Request
          </button>
        )}
      </div>
      <div className="bg-white rounded-xl p-6 mb-4 border border-gray-100">
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
              className="bg-gray-50 border border-gray-100 rounded-lg py-2 px-4 text-gray-700 min-w-0 w-full text-sm"
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
          <div>
            <label className="block text-gray-700 text-sm mb-1">Status</label>
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
      <div className="bg-white rounded-xl overflow-x-auto border border-gray-100 px-3">
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
                <th>Notes</th>
                <th>Requested Date</th>
                <th>Delivery Date</th>
                <th>Status</th>
                {canView || canUpdate || canDelete ? (
                  <th className="text-center action">Actions</th>
                ) : null}
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
                return filteredRequests.map((request, index) => (
                  <tr key={request._id}>
                    <td className="number">
                      {index + 1 + (pagination.page - 1) * pagination.limit}
                    </td>
                    <td>
                      {request.requester?.first_name +
                        " " +
                        request.requester?.last_name || "-"}
                    </td>
                    <td>
                      {Array.isArray(request.items) && request.items.length > 0
                        ? request.items
                            .map((item) => item.product?.name)
                            .join(", ")
                        : "-"}
                    </td>
                    <td>
                      {Array.isArray(request.items) && request.items.length > 0
                        ? request.items.map((item) => item.quantity).join(", ")
                        : "-"}
                    </td>
                    <td>{request.notes || "-"}</td>
                    <td>{formatDate(request.createdAt) || "-"}</td>
                    <td>{formatDate(request.delivery_date) || "-"}</td>
                    <td>
                      <span
                        className={`inline-block px-3 py-1 rounded-full text-sm ${request.status === "pending" ? "bg-yellow-100 text-yellow-700" : request.status === "approved" ? "bg-green-100 text-green-700" : request.status === "rejected" ? "bg-red-100 text-red-700" : request.status === "completed" ? "bg-blue-100 text-blue-700" : request.status === "on_hold" ? "bg-orange-100 text-orange-700" : "bg-gray-100 text-gray-700"}`}
                      >
                        {request.status.charAt(0).toUpperCase() +
                          request.status.slice(1)}
                      </span>
                    </td>
                    <td className="flex items-center gap-1 justify-center action">
                      {(user?.role === "admin" ||
                        user?.role === "staff" ||
                        String(request.requester_id) === String(user?._id)) && (
                        <div>
                          {(user?.permission?.permissions?.includes(
                            "view_order_request",
                          ) ||
                            String(request.requester_id) ===
                              String(user?._id)) && (
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
