import React, { useEffect, useState } from "react";
import { getSales, deleteSale, getUsers, createSale, updateSale } from "../api";
import Pagination from "../components/Pagination";
import SaleModal from "../components/SaleModal";
import { useAuth } from "../contexts/auth/useAuth";
import NoDataFound from "../components/NoDataFound";
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

const statusOptions = ["Processing", "Completed", "Cancelled"];

function UserDropdown({ value, onChange, userOptions = [] }) {
  return (
    <Listbox value={value} onChange={onChange}>
      <div className="relative">
        <Listbox.Button className="cursor-pointer w-full bg-gray-50 border border-gray-200 rounded-lg px-3 py-2 text-left text-gray-800 text-sm flex items-center justify-between">
          <span>
            {userOptions.find((u) => u._id === value)
              ? `${userOptions.find((u) => u._id === value).first_name} ${userOptions.find((u) => u._id === value).last_name}`
              : "All Users"}
          </span>
          <HiSelector className="w-5 h-5 text-gray-400 ml-2" />
        </Listbox.Button>
        <Listbox.Options className="absolute z-10 mt-1 w-full bg-white border border-gray-200 rounded-lg shadow-lg max-h-60 overflow-auto focus:outline-none">
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
                `px-4 py-2 cursor-pointer text-black text-sm hover:bg-[#f1f5f9] ${selected ? "bg-blue-50" : ""}`
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
        <Listbox.Button className="cursor-pointer w-full bg-gray-50 border border-gray-200 rounded-lg px-3 py-2 text-left text-gray-800 text-sm flex items-center justify-between">
          <span>{value || "All Status"}</span>
          <HiSelector className="w-5 h-5 text-gray-400 ml-2" />
        </Listbox.Button>
        <Listbox.Options className="absolute z-10 mt-1 w-full bg-white border border-gray-200 rounded-lg shadow-lg max-h-60 overflow-auto focus:outline-none">
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
                `px-4 py-2 cursor-pointer text-black text-sm hover:bg-[#f1f5f9] ${selected ? "bg-blue-50" : ""}`
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
  const [viewSale, setViewSale] = useState(null);
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 10,
    totalItems: 0,
    totalPages: 1,
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [modalOpen, setModalOpen] = useState(false);
  const { user } = useAuth();
  const dialog = useDialog();
  const [editSale, setEditSale] = useState(null);
  const notification = useNotification();

  // Filters
  const [users, setUsers] = useState([]);
  const [customer, setCustomer] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [status, setStatus] = useState("");

  useEffect(() => {
    if (user) {
      getUsers().then((res) => setUsers(res.data.data || []));
      fetchSales(1, 10);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user]);

  useEffect(() => {
    fetchSales(1, 10);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [customer, startDate, endDate, status]);

  async function fetchSales(page = 1, limit = 10) {
    setLoading(true);
    setError("");
    try {
      const params = { page, limit };
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
    setEditSale(null);
    setViewSale(sale);
    setModalOpen(true);
  }

  // Save sale (create or update)
  async function handleSave(saleData) {
    setLoading(true);
    setError("");
    try {
      if (editSale) {
        await updateSale(editSale._id, saleData);
        dialog.success("Sale updated successfully");
        // Show notification if status changed to Completed
        if (
          saleData.status &&
          saleData.status.toLowerCase() === "completed"
        ) {
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
      setEditSale(null);
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
        fetchSales(pagination.page, pagination.limit);
      } catch {
        dialog.error("Failed to delete sale");
      } finally {
        setLoading(false);
      }
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
    <div>
      <SaleModal
        key={modalOpen ? (editSale ? editSale._id : "new") : "closed"}
        open={modalOpen}
        onClose={() => {
          setModalOpen(false);
          setEditSale(null);
          setViewSale(null);
        }}
        onSave={handleSave}
        initial={editSale || viewSale}
        viewOnly={!!viewSale}
      />
      <div className="flex items-center justify-between mb-8">
        <div className="flex flex-col">
          <h1 className="text-xl font-semibold">Sales Management</h1>
          <span className="text-gray-500 text-sm">
            Record and track all sales transactions with customer information
          </span>
        </div>
        <button
          className="bg-[#1e3a5f] hover:bg-[#16375b] text-white px-6 py-2 rounded-xl focus:outline-none flex items-center gap-2 cursor-pointer"
          onClick={() => {
            setViewSale(null);
            setEditSale(null);
            setModalOpen(true);
          }}
        >
          <HiOutlinePlus className="text-md" /> Record Sale
        </button>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4 mb-4">
        <div className="bg-white rounded-2xl p-6 flex flex-col gap-4 border border-gray-200 transition-all duration-300 hover:scale-101">
          <div className="flex items-center justify-between">
            <BsCurrencyDollar className="text-3xl text-green-600" />
            <div className="flex items-center gap-2 text-green-600 text-sm">
              <HiTrendingUp />
              <span>12.5%</span>
            </div>
          </div>
          <div>
            <div className="text-gray-500 text-sm">Total Revenue</div>
            <div className="text-xl font-bold">$571.87</div>
          </div>
        </div>
        <div className="bg-white rounded-2xl p-6 flex flex-col gap-4 border border-gray-200 transition-all duration-300 hover:scale-101">
          <div className="flex items-center justify-between">
            <HiOutlineShoppingCart className="text-3xl text-gray-700" />
            <div className="flex items-center gap-2 text-green-600 text-sm">
              <HiTrendingUp />
              <span>8.3%</span>
            </div>
          </div>
          <div>
            <div className="text-gray-500 text-sm">Total Sales</div>
            <div className="text-xl font-bold">6</div>
          </div>
        </div>
        <div className="bg-white rounded-2xl p-6 flex flex-col gap-4 border border-gray-200 transition-all duration-300 hover:scale-101">
          <div className="flex items-center justify-between">
            <HiTrendingUp className="text-3xl text-yellow-600" />
            <div className="flex items-center gap-2 text-green-600 text-sm">
              <HiTrendingUp />
              <span>5.2%</span>
            </div>
          </div>
          <div>
            <div className="text-gray-500 text-sm">Avg Transaction</div>
            <div className="text-xl font-bold">$95.31</div>
          </div>
        </div>
        <div className="bg-white rounded-2xl p-6 flex flex-col gap-4 border border-gray-200 transition-all duration-300 hover:scale-101">
          <div className="flex items-center justify-between">
            <HiOutlineClock className="text-3xl text-yellow-600" />
            <div className="flex items-center gap-2 text-red-600 text-sm">
              <HiTrendingDown />
              <span>3.1%</span>
            </div>
          </div>
          <div>
            <div className="text-gray-500 text-sm">Pending Payments</div>
            <div className="text-xl font-bold">$145.96</div>
          </div>
        </div>
      </div>
      <div className="bg-white rounded-2xl p-6 mb-4 border border-gray-200">
        <div className="w-full flex items-center justify-between">
          <h3 className="flex items-center gap-2 text-base mb-2 text-black">
            <HiOutlineFilter className="inline-block text-base text-black" />
            <span>Filters</span>
          </h3>
          <button
            onClick={handleReset}
            className="flex items-center gap-2 text-base mb-2 text-black cursor-pointer"
          >
            <HiOutlineRefresh className="inline-block text-base text-black" />
            <span>Reset</span>
          </button>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
          <div>
            <label className="block text-gray-700 text-sm mb-1">From</label>
            <input
              type="date"
              className="w-full bg-gray-50 border border-gray-200 rounded-lg py-2 px-3 text-gray-700 text-sm"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
            />
          </div>
          <div>
            <label className="block text-gray-700 text-sm mb-1">To</label>
            <input
              type="date"
              className="w-full bg-gray-50 border border-gray-200 rounded-lg py-2 px-3 text-gray-700 text-sm"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
            />
          </div>
          <div>
            <label className="block text-gray-700 text-sm mb-1">Customer</label>
            <UserDropdown
              value={customer}
              onChange={setCustomer}
              userOptions={users}
            />
          </div>
          <div>
            <label className="block text-gray-700 text-sm mb-1">Status</label>
            <StatusDropdown value={status} onChange={setStatus} />
          </div>
        </div>
      </div>
      <div className="bg-white rounded-xl overflow-x-auto border border-gray-200 px-3">
        {loading ? (
          <div className="p-8 text-center text-gray-500">Loading...</div>
        ) : error ? (
          <div className="p-8 text-center text-red-500">{error}</div>
        ) : (
          <table className="min-w-full text-left text-sm align-middle">
            <thead>
              <tr>
                <th className="number">No.</th>
                <th>Customer</th>
                <th>Total</th>
                <th>Payment Method</th>
                <th>Status</th>
                <th>Date</th>
                <th className="action">Actions</th>
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
                  <tr key={sale._id}>
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
                        className={`inline-block px-3 py-1 rounded-full text-sm font-semibold capitalize ${sale.status === "processing" ? "bg-yellow-100 text-yellow-700" : sale.status === "completed" ? "bg-blue-100 text-blue-700" : sale.status === "cancelled" ? "bg-red-100 text-red-700" : "bg-gray-100 text-gray-700"}`}
                      >
                        {sale.status}
                      </span>
                    </td>
                    <td>{formatDate(sale.completed_at) || "-"}</td>
                    <td className="flex items-center gap-1 justify-center action">
                      {user?.permission?.permissions?.includes("view_sale") && (
                        <button
                          className="text-[#1e3a5f] font-semibold cursor-pointer p-2 rounded-full hover:bg-[#f1f5f9]"
                          title="View"
                          onClick={() => handleView(sale)}
                        >
                          <HiOutlineEye className="text-xl" />
                        </button>
                      )}
                      {user?.permission?.permissions?.includes(
                        "update_sale",
                      ) && (
                        <button
                          className="text-[#1e3a5f] font-semibold cursor-pointer p-2 rounded-full hover:bg-[#f1f5f9]"
                          title="Edit"
                          onClick={() => {
                            setViewSale(null);
                            setEditSale(sale);
                            setModalOpen(true);
                          }}
                        >
                          <HiOutlinePencil className="text-xl" />
                        </button>
                      )}
                      {user?.permission?.permissions?.includes(
                        "delete_sale",
                      ) && (
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
      {sales.length > 0 && (
        <div className="flex justify-end mt-4">
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
