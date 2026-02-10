import React, { useEffect, useState } from "react";
import {
  HiOutlineCheckCircle,
  HiOutlineFilter,
  HiSelector,
  HiOutlineRefresh,
} from "react-icons/hi";
import { useAuth } from "../contexts/auth/useAuth";
import { getConfirmDeliveries, updateConfirmDelivery } from "../api";
import { formatDate } from "../utils/dateFormat";
import Pagination from "../components/Pagination";
import NoDataFound from "../components/NoDataFound";
import { Listbox } from "@headlessui/react";
import { useDialog } from "../contexts/dialog/useDialog";
import Loading from "../components/Loading";
import DatePicker from "../components/DatePicker";

const deliveryStatusOptions = [
  { value: "Pending", label: "Pending" },
  { value: "Approved", label: "Approved" },
  { value: "Rejected", label: "Rejected" },
];
const approvalStatusOptions = [
  { value: "Delivered", label: "Delivered" },
  { value: "Pending", label: "Pending" },
];

function ApprovalStatusDropdown({ value, onChange }) {
  return (
    <Listbox value={value} onChange={onChange}>
      <div className="relative">
        <Listbox.Button className="cursor-pointer w-full bg-gray-50 border border-gray-200 rounded-lg px-3 py-2 text-left text-gray-800 text-sm flex items-center justify-between">
          <span>{value || "All Statuses"}</span>
          <HiSelector className="w-5 h-5 text-gray-400 ml-2" />
        </Listbox.Button>
        <Listbox.Options className="absolute z-10 mt-1 w-full bg-white border border-gray-200 rounded-lg shadow-lg max-h-60 overflow-auto focus:outline-none">
          <Listbox.Option
            className="px-4 py-2 cursor-pointer text-black text-sm hover:bg-[#f1f5f9]"
            value=""
          >
            <span>All Statuses</span>
          </Listbox.Option>
          {deliveryStatusOptions.map((option) => (
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

function DeliveryStatusDropdown({ value, onChange }) {
  return (
    <Listbox value={value} onChange={onChange}>
      <div className="relative">
        <Listbox.Button className="cursor-pointer w-full bg-gray-50 border border-gray-200 rounded-lg px-3 py-2 text-left text-gray-800 text-sm flex items-center justify-between">
          <span>{value || "All Statuses"}</span>
          <HiSelector className="w-5 h-5 text-gray-400 ml-2" />
        </Listbox.Button>
        <Listbox.Options className="absolute z-10 mt-1 w-full bg-white border border-gray-200 rounded-lg shadow-lg max-h-60 overflow-auto focus:outline-none">
          <Listbox.Option
            className="px-4 py-2 cursor-pointer text-black text-sm hover:bg-[#f1f5f9]"
            value=""
          >
            <span>All Statuses</span>
          </Listbox.Option>
          {approvalStatusOptions.map((option) => (
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

const DeliveryConfirmation = () => {
  const [confirmDeliveries, setConfirmDeliveries] = useState([]);

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

  // Dialog
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
  const [approve_status, setApproveStatus] = useState("");
  const [delivery_status, setDeliveryStatus] = useState("");

  // Permissions
  const canUpdate = user?.permission?.permissions?.includes(
    "update_confirm_delivery",
  );

  useEffect(() => {
    if (user) {
      fetchConfirmDeliveries(
        pagination.page,
        pagination.limit,
        search,
        startDate,
        endDate,
        approve_status,
        delivery_status,
      );
    }
  }, [
    user,
    pagination.page,
    pagination.limit,
    search,
    startDate,
    endDate,
    approve_status,
    delivery_status,
  ]);

  async function fetchConfirmDeliveries(
    page = 1,
    limit = 10,
    search,
    startDate,
    endDate,
    approve_status,
    delivery_status,
  ) {
    setLoading(true);
    setError("");
    try {
      // Map frontend filter names to backend query params
      const params = { page, limit };
      if (search) params.search = search;
      if (startDate) params.startDate = startDate;
      if (endDate) params.endDate = endDate;
      // approve_status maps to approve_request.status
      if (approve_status) params["approve_request"] = approve_status;
      // deliveryStatus maps to confirm_delivery.status
      if (delivery_status) params["confirm_delivery"] = delivery_status;
      const res = await getConfirmDeliveries(params);
      // Only show orders that are approved and not yet delivered
      setConfirmDeliveries(
        res.data.data.filter(
          (o) =>
            o.status === "approved" &&
            (!o.confirm_delivery || o.confirm_delivery.status !== "delivered"),
        ),
      );
      setPagination((prev) => ({
        ...prev,
        ...res.data.pagination,
        page,
        limit,
      }));
    } catch {
      setError("Failed to load confirm deliveries");
    } finally {
      setLoading(false);
    }
  }

  async function handleConfirmDelivery(id) {
    const confirmed = await dialog.ask({
      type: "confirm",
      title: "Confirm Delivery",
      message: "Are you sure you want to confirm this delivery?",
      confirmText: "Confirm",
      cancelText: "Cancel",
    });
    if (!confirmed) return;
    try {
      await updateConfirmDelivery(id, {});
      await dialog.success("Delivery confirmed.");
      fetchConfirmDeliveries(
        pagination.page,
        pagination.limit,
        search,
        startDate,
        endDate,
        approve_status,
        delivery_status,
      );
    } catch (err) {
      const msg =
        err?.response?.data?.error ||
        err?.message ||
        "Failed to confirm delivery";
      await dialog.error(msg);
      setError(msg);
    }
  }

  const handleReset = () => {
    setSearch("");
    setApproveStatus("");
    setDeliveryStatus("");
    setPagination((prev) => ({ ...prev, page: 1 }));
    fetchConfirmDeliveries(1, pagination.limit, "", "", "", "", "");
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <div className="flex flex-col">
          <h1 className="text-xl font-semibold">Delivery Confirmation</h1>
          <span className="text-gray-500 text-sm">
            Manage and confirm deliveries
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
          <div>
            <label className="block text-gray-700 text-sm mb-1">
              Approval Status
            </label>
            <ApprovalStatusDropdown
              value={approve_status}
              onChange={(status) => {
                setApproveStatus(status);
                fetchConfirmDeliveries(
                  1,
                  pagination.limit,
                  search,
                  approve_status,
                );
                setPagination((prev) => ({ ...prev, page: 1 }));
              }}
            />
          </div>
          <div>
            <label className="block text-gray-700 text-sm mb-1">
              Delivery Status
            </label>
            <DeliveryStatusDropdown
              value={delivery_status}
              onChange={(status) => {
                setDeliveryStatus(status);
                fetchConfirmDeliveries(
                  1,
                  pagination.limit,
                  search,
                  delivery_status,
                );
                setPagination((prev) => ({ ...prev, page: 1 }));
              }}
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
                <th>Approval Status</th>
                <th>Delivery Status</th>
                <th className="text-center action">Actions</th>
              </tr>
            </thead>
            <tbody>
              {confirmDeliveries.map((confirm_delivery, index) => {
                const approve = confirm_delivery.approve_request;
                const delivery = confirm_delivery.confirm_delivery;
                return (
                  <tr key={confirm_delivery._id}>
                    <td className="number">
                      {index + 1 + (pagination.page - 1) * pagination.limit}
                    </td>
                    <td>
                      {confirm_delivery.requester?.first_name}
                      {confirm_delivery.requester?.last_name}
                    </td>
                    <td>
                      {Array.isArray(confirm_delivery?.items) &&
                      confirm_delivery?.items.length > 0
                        ? confirm_delivery?.items
                            .map((item) => item.product?.name)
                            .join(", ")
                        : "-"}
                    </td>
                    <td>
                      {Array.isArray(confirm_delivery?.items) &&
                      confirm_delivery?.items.length > 0
                        ? confirm_delivery?.items
                            .map((item) => item.quantity)
                            .join(", ")
                        : "-"}
                    </td>
                    <td>{formatDate(confirm_delivery.createdAt) || "-"}</td>
                    <td>{formatDate(confirm_delivery.delivery_date) || "-"}</td>
                    <td>
                      <span
                        className={`inline-block px-3 py-1 rounded-full text-sm ${approve?.status === "approved" ? "bg-green-100 text-green-700" : approve?.status === "rejected" ? "bg-red-100 text-red-700" : "bg-yellow-100 text-yellow-700"}`}
                      >
                        {approve?.status
                          ? approve.status.charAt(0).toUpperCase() +
                            approve.status.slice(1)
                          : "Pending"}
                      </span>
                    </td>
                    <td>
                      <span
                        className={`inline-block px-3 py-1 rounded-full text-sm ${delivery?.status === "delivered" ? "bg-green-100 text-green-700" : "bg-yellow-100 text-yellow-700"}`}
                      >
                        {delivery?.status === "delivered"
                          ? "Delivered"
                          : "Pending"}
                      </span>
                    </td>
                    <td className="text-center action">
                      {(!delivery || delivery.status !== "delivered") &&
                        canUpdate && (
                          <button
                            className="text-green-600 font-semibold cursor-pointer p-2 rounded-full hover:bg-[#f1f5f9]"
                            title="Confirm Delivery"
                            onClick={() =>
                              handleConfirmDelivery(confirm_delivery._id)
                            }
                          >
                            <HiOutlineCheckCircle className="text-2xl" />
                          </button>
                        )}
                    </td>
                  </tr>
                );
              })}
              {confirmDeliveries.length === 0 && (
                <tr>
                  <td colSpan="9">
                    <NoDataFound message="No deliveries found." />
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        )}
      </div>
      {confirmDeliveries.length > 0 && (
        <div className="flex justify-end mt-4">
          <Pagination
            total={pagination.totalItems}
            page={pagination.page}
            limit={pagination.limit}
            onChange={({ page, limit }) => {
              setPagination((prev) => ({ ...prev, page, limit }));
              fetchConfirmDeliveries(page, limit);
            }}
          />
        </div>
      )}
    </div>
  );
};

export default DeliveryConfirmation;
