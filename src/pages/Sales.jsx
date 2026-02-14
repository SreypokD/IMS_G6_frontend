import React, { useEffect, useState } from "react";
import {
  getSales,
  deleteSale,
  getUsers,
  createSale,
  updateSale,
  getSalesSummary,
} from "../api";
import Pagination from "../components/Pagination";
import SaleModal from "../components/SaleModal";
import { useAuth } from "../contexts/auth/useAuth";
import NoDataFound from "../components/NoDataFound";
import Loading from "../components/Loading";
import {
  HiOutlinePlus,
  HiOutlineShoppingCart,
  HiTrendingUp,
  HiTrendingDown,
  HiOutlineClock,
  HiOutlineFilter,
  HiOutlineRefresh,
  HiSelector,
} from "react-icons/hi";
import { BsCurrencyDollar } from "react-icons/bs";
import { HiOutlinePencil, HiOutlineTrash, HiOutlineEye } from "react-icons/hi";
import { useDialog } from "../contexts/dialog/useDialog";
import { Listbox } from "@headlessui/react";
import { formatDate } from "../utils/dateFormat";
import { useNotification } from "../contexts/notification/useNotification";
import DatePicker from "../components/DatePicker";

const statusOptions = ["Processing", "Completed", "Cancelled"];

function UserDropdown({ value, onChange, userOptions = [] }) {
  return (
    <Listbox value={value} onChange={onChange}>
      <div className="relative">
        <Listbox.Button className="cursor-pointer w-full bg-gray-50 border border-gray-100 rounded-lg px-3 py-2 text-left text-gray-800 text-sm flex items-center justify-between">
          <span>
            {userOptions.find((u) => u._id === value)
              ? `${userOptions.find((u) => u._id === value).first_name} ${userOptions.find((u) => u._id === value).last_name}`
              : "All Users"}
          </span>
          <HiSelector className="w-5 h-5 text-gray-400 ml-2" />
        </Listbox.Button>
        <Listbox.Options className="absolute z-10 mt-1 w-full bg-white border border-gray-100 rounded-lg shadow-lg max-h-60 overflow-auto focus:outline-none">
          <Listbox.Option
            className="px-4 py-2 cursor-pointer text-black text-sm hover:bg-[#f1f5f9]"
            value=""
          >
            <span>All Users</span>
          </Listbox.Option>
          {userOptions.map((user) => (
            <Listbox.Option
              key={user._id}
              value={user._id}
              className={({ selected }) =>
                `px-3 py-2 cursor-pointer text-black text-sm hover:bg-[#f1f5f9] ${selected ? "bg-blue-50" : ""}`
              }
            >
              {user.first_name} {user.last_name}
            </Listbox.Option>
          ))}
        </Listbox.Options>
      </div>
    </Listbox>
  );
}

function StatusDropdown({ value, onChange }) {
  return (
    <Listbox value={value} onChange={onChange}>
      <div className="relative">
        <Listbox.Button className="cursor-pointer w-full bg-gray-50 border border-gray-100 rounded-lg px-3 py-2 text-left text-gray-800 text-sm flex items-center justify-between">
          <span>{value || "All Status"}</span>
          <HiSelector className="w-5 h-5 text-gray-400 ml-2" />
        </Listbox.Button>
        <Listbox.Options className="absolute z-10 mt-1 w-full bg-white border border-gray-100 rounded-lg shadow-lg max-h-60 overflow-auto focus:outline-none">
          <Listbox.Option
            className="px-4 py-2 cursor-pointer text-black text-sm hover:bg-[#f1f5f9]"
            value="All Status"
          >
            <span>All Status</span>
          </Listbox.Option>
          {statusOptions.map((status) => (
            <Listbox.Option
              key={status}
              value={status}
              className={({ selected }) =>
                `px-3 py-2 cursor-pointer text-black text-sm hover:bg-[#f1f5f9] ${selected ? "bg-blue-50" : ""}`
              }
            >
              {status}
            </Listbox.Option>
          ))}
        </Listbox.Options>
      </div>
    </Listbox>
  );
}

const Sales = () => {
  const [sales, setSales] = useState([]);
  const [summary, setSummary] = useState({
    totalRevenue: 0,
    totalSales: 0,
    avgTransaction: 0,
    pendingPayments: 0,
    trends: {
      revenue: 0,
      sales: 0,
      avgTransaction: 0,
    },
  });

  // View Sale
  const [viewSale, setViewSale] = useState(null);

  // Pagination
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 10,
    totalItems: 0,
    totalPages: 1,
  });

  // Modal
  const [modalOpen, setModalOpen] = useState(false);

  // Loading and Error
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  // Dialog
  const { user } = useAuth();
  const dialog = useDialog();
  const [updateSale, setUpdateSale] = useState(null);
  const notification = useNotification();

  // Filters
  const [users, setUsers] = useState([]);
  const [search, setSearch] = useState("");
  const [customer, setCustomer] = useState("");
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
  const canView = user?.permission?.permissions?.includes("view_sale");
  const canCreate = user?.permission?.permissions?.includes("create_sale");
  const canUpdate = user?.permission?.permissions?.includes("update_sale");
  const canDelete = user?.permission?.permissions?.includes("delete_sale");
  const canViewUsers = user?.permission?.permissions?.includes("view_user");
  
  async function fetchSummary() {
    try {
      const res = await getSalesSummary();
      if (res && res.data) {
        setSummary(res.data);
      }
    } catch (err) {
      console.error("Failed to fetch sales summary:", err);
    }
  }

  useEffect(() => {
    if (user) {
      if (canViewUsers) {
        getUsers()
          .then((res) => {
            if (res && res.data) {
              setUsers(res.data.data || []);
            }
          })
          .catch((err) => console.error("Failed to load users", err));
      }
      fetchSales(1, 10);
      fetchSummary();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user]);

  useEffect(() => {
    fetchSales(1, 10);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [search, customer, startDate, endDate, status]);

  async function fetchSales(page = 1, limit = 10) {
    setLoading(true);
    setError("");
    try {
      const params = { page, limit };
      if (search) params.search = search;
      if (customer !== "All Customers") params.customer = customer;
      if (status !== "All Status") params.status = status;
      if (startDate) params.startDate = startDate;
      if (endDate) params.endDate = endDate;

      const res = await getSales(params);
      setSales(res.data.data);
      setPagination((prev) => ({
        ...prev,
        ...res.data.pagination,
        page,
        limit,
      }));
    } catch {
      setError("Failed to load sales");
    } finally {
      setLoading(false);
    }
  }

  function handleView(sale) {
    setUpdateSale(null);
    setViewSale(sale);
    setModalOpen(true);
  }

  // Save sale (create or update)
  async function handleSave(saleData) {
    setLoading(true);
    setError("");
    try {
      if (updateSale) {
        await updateSale(updateSale._id, saleData);
        dialog.success("Sale updated successfully");
        // Show notification if status changed to Completed
        if (saleData.status && saleData.status.toLowerCase() === "completed") {
          notification?.show?.({
            type: "success",
            message: "Sale marked as completed!",
          });
        }
      } else {
        await createSale(saleData);
        dialog.success("Sale created successfully");
      }
      fetchSales(1, pagination.limit);
      setModalOpen(false);
      setUpdateSale(null);
      fetchSummary();
    } catch (err) {
      const msg =
        err?.response?.data?.error || err?.message || "Failed to save sale";
      setError(msg);
      dialog.error(msg);
    } finally {
      setLoading(false);
    }
  }

  async function handleDelete(id) {
    const confirmed = await dialog.ask({
      type: "confirm",
      title: "Delete Sale",
      message: "Are you sure you want to delete this sale record?",
      confirmText: "Delete",
      cancelText: "Cancel",
    });
    if (confirmed) {
      setLoading(true);
      try {
        await deleteSale(id);
        await dialog.success("Sale deleted successfully");
        await dialog.success("Sale deleted successfully");
        fetchSales(pagination.page, pagination.limit);
        fetchSummary();
      } catch {
        dialog.error("Failed to delete sale");
      } finally {
        setLoading(false);
      }
      fetchSummary();
    }
  }

  const handleReset = () => {
    setCustomer("All Customers");
    setStartDate("");
    setEndDate("");
    setStatus("All Status");
    setPagination((prev) => ({ ...prev, page: 1 }));
    fetchSales(1, pagination.limit);
  };

  return (
    <div className="h-content-available">
      <SaleModal
        key={modalOpen ? (updateSale ? updateSale._id : "new") : "closed"}
        open={modalOpen}
        onClose={() => {
          setModalOpen(false);
          setUpdateSale(null);
          setViewSale(null);
        }}
        onSave={handleSave}
        data={updateSale || viewSale}
        viewOnly={!!viewSale}
      />
      <div className="flex items-center justify-between mb-8">
        <div className="flex flex-col">
          <h1 className="text-xl font-semibold">Sales Management</h1>
          <span className="text-gray-500 text-sm">
            Record and track all sales transactions with customer information
          </span>
        </div>
        {canCreate && (
          <button
            className="bg-[#1e3a5f] hover:bg-[#16375b] text-white px-6 py-2 rounded-xl focus:outline-none flex items-center gap-2 cursor-pointer text-sm"
            onClick={() => {
              setViewSale(null);
              setUpdateSale(null);
              setModalOpen(true);
            }}
          >
            <HiOutlinePlus className="text-md" /> Record Sale
          </button>
        )}
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3 mb-3">
        <div className="bg-white rounded-2xl p-6 flex flex-col gap-3 border border-gray-100 transition-all duration-300 hover:scale-101">
          <div className="flex items-center justify-between">
            <BsCurrencyDollar className="text-2xl text-green-600" />
            <div
              className={`flex items-center gap-2 text-sm ${
                summary.trends?.revenue >= 0 ? "text-green-600" : "text-red-600"
              }`}
            >
              {summary.trends?.revenue >= 0 ? (
                <HiTrendingUp />
              ) : (
                <HiTrendingDown />
              )}
              <span>{Math.abs(summary.trends?.revenue || 0)}%</span>
            </div>
          </div>
          <div>
            <div className="text-gray-500 text-sm">Total Revenue</div>
            <div className="text-xl font-bold">
              ${summary.totalRevenue?.toFixed(2)}
            </div>
          </div>
        </div>
        <div className="bg-white rounded-2xl p-6 flex flex-col gap-3 border border-gray-100 transition-all duration-300 hover:scale-101">
          <div className="flex items-center justify-between">
            <HiOutlineShoppingCart className="text-2xl text-gray-700" />
            <div
              className={`flex items-center gap-2 text-sm ${
                summary.trends?.sales >= 0 ? "text-green-600" : "text-red-600"
              }`}
            >
              {summary.trends?.sales >= 0 ? (
                <HiTrendingUp />
              ) : (
                <HiTrendingDown />
              )}
              <span>{Math.abs(summary.trends?.sales || 0)}%</span>
            </div>
          </div>
          <div>
            <div className="text-gray-500 text-sm">Total Sales</div>
            <div className="text-xl font-bold">{summary.totalSales}</div>
          </div>
        </div>
        <div className="bg-white rounded-2xl p-6 flex flex-col gap-3 border border-gray-100 transition-all duration-300 hover:scale-101">
          <div className="flex items-center justify-between">
            <HiTrendingUp className="text-2xl text-yellow-600" />
            <div
              className={`flex items-center gap-2 text-sm ${
                summary.trends?.avgTransaction >= 0
                  ? "text-green-600"
                  : "text-red-600"
              }`}
            >
              {summary.trends?.avgTransaction >= 0 ? (
                <HiTrendingUp />
              ) : (
                <HiTrendingDown />
              )}
              <span>{Math.abs(summary.trends?.avgTransaction || 0)}%</span>
            </div>
          </div>
          <div>
            <div className="text-gray-500 text-sm">Avg Transaction</div>
            <div className="text-xl font-bold">
              ${summary.avgTransaction?.toFixed(2)}
            </div>
          </div>
        </div>
        <div className="bg-white rounded-2xl p-6 flex flex-col gap-3 border border-gray-100 transition-all duration-300 hover:scale-101">
          <div className="flex items-center justify-between">
            <HiOutlineClock className="text-2xl text-yellow-600" />
            <div className="flex items-center gap-2 text-gray-400 text-sm">
              <span>-</span>
            </div>
          </div>
          <div>
            <div className="text-gray-500 text-sm">Pending Payments</div>
            <div className="text-xl font-bold">
              ${summary.pendingPayments?.toFixed(2)}
            </div>
          </div>
        </div>
      </div>
      <div className="bg-white rounded-2xl p-6 mb-3 border border-gray-100">
        <div className="w-full flex items-center justify-between">
          <h3 className="flex items-center gap-2 text-base mb-3 text-[#1e3a5f] font-semibold border-b border-gray-100 pb-2">
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
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3">
          <div>
            <label className="block text-gray-700 text-sm mb-1">Search</label>
            <input
              type="text"
              className="w-full bg-gray-50 border border-gray-100 rounded-lg py-2 px-3 text-gray-700 text-sm"
              placeholder="Search..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
          <div>
            <label className="block text-gray-700 text-sm mb-1">
              Start Date
            </label>
            <DatePicker
              selected={startDate}
              onChange={(date) =>
                setStartDate(date ? date.toISOString().split("T")[0] : "")
              }
              placeholder="Start Date"
            />
          </div>
          <div>
            <label className="block text-gray-700 text-sm mb-1">End Date</label>
            <DatePicker
              selected={endDate}
              onChange={(date) =>
                setEndDate(date ? date.toISOString().split("T")[0] : "")
              }
              placeholder="End Date"
            />
          </div>
          {canViewUsers && (
            <div>
              <label className="block text-gray-700 text-sm mb-1">
                Customer
              </label>
              <UserDropdown
                value={customer}
                onChange={setCustomer}
                userOptions={users}
              />
            </div>
          )}
          <div>
            <label className="block text-gray-700 text-sm mb-1">Status</label>
            <StatusDropdown value={status} onChange={setStatus} />
          </div>
        </div>
      </div>
      <div className="flex-1 bg-white rounded-xl border border-gray-100 flex flex-col min-h-0">
        <div className="table-scroll-container">
          {loading ? (
            <Loading />
          ) : error ? (
            <div className="p-8 text-center text-red-500">{error}</div>
          ) : (
            <table className="min-w-full text-left text-sm align-middle">
              <thead className="table-sticky-header">
                <tr>
                  <th className="number">No.</th>
                  <th>Customer</th>
                  <th>Total</th>
                  <th>Payment Method</th>
                  <th>Status</th>
                  <th>Date</th>
                  {canView || canUpdate || canDelete ? (
                    <th className="action">Actions</th>
                  ) : null}
                </tr>
              </thead>
              <tbody>
                {sales.map((sale, index) => {
                  const totalAmount = (() => {
                    if (sale.items && sale.items.length > 0) {
                      return sale.items.reduce((sum, item) => {
                        const price = Number(item.price) || 0;
                        const qty = Number(item.quantity) || 0;
                        const discount = Number(item.discount) || 0;
                        return sum + price * qty * (1 - discount / 100);
                      }, 0);
                    } else {
                      const price = Number(sale.price) || 0;
                      const qty = Number(sale.quantity) || 0;
                      const discount = Number(sale.discount) || 0;
                      return price * qty * (1 - discount / 100);
                    }
                  })().toFixed(2);

                  const customer =
                    sale.customer ||
                    users.find((u) => u._id === sale.customer_id);

                  return (
                    <tr key={sale._id} className="hover:bg-[#f1f5f9]">
                      <td className="number">
                        {index + 1 + (pagination.page - 1) * pagination.limit}
                      </td>
                      <td>
                        {customer
                          ? `${customer.first_name || ""} ${customer.last_name || ""}`
                          : "N/A"}
                      </td>
                      <td>${totalAmount}</td>
                      <td>{sale.payment_method}</td>
                      <td>
                        <span
                          className={`inline-block px-3 py-1 rounded-full text-sm capitalize ${sale.status === "processing" ? "bg-yellow-100 text-yellow-700" : sale.status === "completed" ? "bg-blue-100 text-blue-700" : sale.status === "cancelled" ? "bg-red-100 text-red-700" : "bg-gray-100 text-gray-700"}`}
                        >
                          {sale.status}
                        </span>
                      </td>
                      <td>{formatDate(sale.completed_at) || "-"}</td>
                      <td className="flex items-center gap-1 justify-center action">
                        {canView && (
                          <button
                            className="text-[#1e3a5f] font-semibold cursor-pointer p-2 rounded-full hover:bg-[#f1f5f9]"
                            title="View"
                            onClick={() => handleView(sale)}
                          >
                            <HiOutlineEye className="text-xl" />
                          </button>
                        )}
                        {canUpdate && (
                          <button
                            className="text-[#1e3a5f] font-semibold cursor-pointer p-2 rounded-full hover:bg-[#f1f5f9]"
                            title="Update"
                            onClick={() => {
                              setViewSale(null);
                              setUpdateSale(sale);
                              setModalOpen(true);
                            }}
                          >
                            <HiOutlinePencil className="text-xl" />
                          </button>
                        )}
                        {canDelete && (
                          <button
                            className="text-red-500 font-semibold cursor-pointer p-2 rounded-full hover:bg-[#f1f5f9]"
                            title="Delete"
                            onClick={() => handleDelete(sale._id)}
                          >
                            <HiOutlineTrash className="text-xl" />
                          </button>
                        )}
                      </td>
                    </tr>
                  );
                })}
                {sales.length === 0 && (
                  <tr>
                    <td colSpan="7">
                      <NoDataFound message="No sales found." />
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          )}
        </div>
      </div>
      {sales.length > 0 && (
        <div className="flex justify-end mt-3">
          <Pagination
            total={pagination.totalItems}
            page={pagination.page}
            limit={pagination.limit}
            onChange={({ page, limit }) => {
              setPagination((prev) => ({ ...prev, page, limit }));
              fetchSales(page, limit);
            }}
          />
        </div>
      )}
    </div>
  );
};

export default Sales;
