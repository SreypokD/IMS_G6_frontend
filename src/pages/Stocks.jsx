import React, { useEffect, useState } from "react";
import { Listbox } from "@headlessui/react";
import { getStocks, getProducts, getStockSummary, getUsers } from "../api";
import {
  HiSelector,
  HiOutlineFilter,
  HiOutlineRefresh,
  HiDownload,
  HiLogout,
  HiCube,
  HiTrendingUp,
  HiTrendingDown,
  HiOutlineExclamation,
} from "react-icons/hi";
import Pagination from "../components/Pagination";
import { useAuth } from "../contexts/auth/useAuth";
import NoDataFound from "../components/NoDataFound";
import Loading from "../components/Loading";
import { formatDate } from "../utils/dateFormat";
import StockOutModal from "../components/StockOutModal";
import StockInModal from "../components/StockInModal";
import StockViewModal from "../components/StockViewModal";
import { deleteStock } from "../api";
import { HiOutlinePencil, HiOutlineTrash, HiOutlineEye } from "react-icons/hi";
import { useDialog } from "../contexts/dialog/useDialog";

const transactionOptions = [
  { value: "", label: "All Transactions" },
  { value: "in", label: "Stock In" },
  { value: "out", label: "Stock Out" },
];
const locationOptions = ["Warehouse 1", "Warehouse 2", "Storefront"];

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

function TransactionDropdown({ value, onChange }) {
  return (
    <Listbox value={value} onChange={onChange}>
      <div className="relative">
        <Listbox.Button className="cursor-pointer w-full bg-gray-50 border border-gray-200 rounded-lg px-3 py-2 text-left text-gray-800 text-sm flex items-center justify-between">
          <span>
            {transactionOptions.find((t) => t.value === value)?.label ||
              "All Transactions"}
          </span>
          <HiSelector className="w-5 h-5 text-gray-400 ml-2" />
        </Listbox.Button>
        <Listbox.Options className="absolute z-10 mt-1 w-full bg-white border border-gray-200 rounded-lg shadow-lg max-h-60 overflow-auto focus:outline-none">
          {transactionOptions.map((option) => (
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

function LocationDropdown({ value, onChange }) {
  return (
    <Listbox value={value} onChange={onChange}>
      <div className="relative">
        <Listbox.Button className="cursor-pointer w-full bg-gray-50 border border-gray-200 rounded-lg px-3 py-2 text-left text-gray-800 text-sm flex items-center justify-between">
          <span>{value || "All Locations"}</span>
          <HiSelector className="w-5 h-5 text-gray-400 ml-2" />
        </Listbox.Button>
        <Listbox.Options className="absolute z-10 mt-1 w-full bg-white border border-gray-200 rounded-lg shadow-lg max-h-60 overflow-auto focus:outline-none">
          <Listbox.Option
            className="px-4 py-2 cursor-pointer text-black text-sm hover:bg-[#f1f5f9]"
            value=""
          >
            <span>All Locations</span>
          </Listbox.Option>
          {locationOptions.map((option) => (
            <Listbox.Option
              key={option}
              value={option}
              className={({ selected }) =>
                `px-4 py-2 cursor-pointer text-black text-sm hover:bg-[#f1f5f9] ${selected ? "bg-blue-50" : ""}`
              }
            >
              {option}
            </Listbox.Option>
          ))}
        </Listbox.Options>
      </div>
    </Listbox>
  );
}

const Stocks = () => {
  const [stocks, setStocks] = useState([]);

  // Products
  const [products, setProducts] = useState([]);

  // Modals
  const [stockOutOpen, setStockOutOpen] = useState(false);
  const [stockInOpen, setStockInOpen] = useState(false);
  const [viewModalOpen, setViewModalOpen] = useState(false);
  const [selectedStock, setSelectedStock] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const dialog = useDialog();

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

  // Filters
  const [search, setSearch] = useState("");
  const [filterUser, setFilterUser] = useState("");
  const [filterType, setFilterType] = useState("");
  const [filterLocation, setFilterLocation] = useState("");
  const [userOptions, setUserOptions] = useState([]);

  // Summary
  const [summary, setSummary] = useState({
    totalStockIn: 0,
    totalStockOut: 0,
    currentBalance: 0,
    lowStockItems: 0,
  });

  // Permissions
  const canView = user?.permission?.permissions?.includes("view_stock");
  const canCreate = user?.permission?.permissions?.includes("create_stock");
  const canUpdate = user?.permission?.permissions?.includes("update_stock");
  const canDelete = user?.permission?.permissions?.includes("delete_stock");

  useEffect(() => {
    if (user) {
      fetchStocks(
        pagination.page,
        pagination.limit,
        search,
        filterType,
        filterUser,
        filterLocation,
      );
      fetchProducts();
      fetchUsersList();
      fetchSummary();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [
    user,
    pagination.page,
    pagination.limit,
    search,
    filterType,
    filterUser,
    filterLocation,
  ]);

  async function fetchSummary(
    searchVal = search,
    typeVal = filterType,
    userVal = filterUser,
    locationVal = filterLocation,
  ) {
    try {
      const params = {};
      if (searchVal) params.search = searchVal;
      if (typeVal) params.type = typeVal;
      if (userVal) params.user = userVal;
      if (locationVal) params.location = locationVal;

      const res = await getStockSummary(params);
      setSummary(res.data);
    } catch (err) {
      console.error("Failed to fetch summary:", err);
    }
  }

  async function fetchProducts() {
    try {
      const res = await getProducts();
      setProducts(res.data.data || []);
    } catch {
      setProducts([]);
    }
  }

  async function fetchUsersList() {
    try {
      const res = await getUsers();
      setUserOptions(res.data.data || []);
    } catch {
      setUserOptions([]);
    }
  }

  async function fetchStocks(
    page = pagination.page,
    limit = pagination.limit,
    searchVal = search,
    typeVal = filterType,
    userVal = filterUser,
    locationVal = filterLocation,
  ) {
    setLoading(true);
    setError("");
    try {
      const params = { page, limit };
      if (searchVal) params.search = searchVal;
      if (typeVal) params.type = typeVal;
      if (userVal) params.user = userVal;
      if (locationVal) params.location = locationVal;
      const res = await getStocks(params);
      setStocks(res.data.data);
      setPagination((prev) => ({
        ...prev,
        ...res.data.pagination,
        page,
        limit,
      }));
    } catch {
      setError("Failed to load stocks");
    } finally {
      setLoading(false);
    }
  }

  const handleEdit = (stock) => {
    setSelectedStock(stock);
    setIsEditing(true);
    if (stock.type === "in") {
      setStockInOpen(true);
    } else {
      setStockOutOpen(true);
    }
  };

  const handleView = (stock) => {
    setSelectedStock(stock);
    setViewModalOpen(true);
  };

  // Delete user
  async function handleDelete(id) {
    const confirmed = await dialog.ask({
      type: "confirm",
      title: "Delete Stock",
      message: "Are you sure you want to delete this stock?",
      confirmText: "Delete",
      cancelText: "Cancel",
    });
    if (confirmed) {
      setLoading(true);
      try {
        await deleteStock(id);
        dialog.success("Stock deleted successfully");
        fetchStocks(
          pagination.page,
          pagination.limit,
          search,
          filterType,
          filterUser,
          filterLocation,
        );
      } catch {
        setError("Failed to delete stock");
        dialog.error("Failed to delete stock");
      } finally {
        setLoading(false);
      }
    }
  }

  const handleReset = () => {
    setSearch("");
    setFilterType("");
    setFilterUser("");
    setFilterLocation("");
    setPagination((prev) => ({ ...prev, page: 1 }));
    fetchStocks(1, pagination.limit, "", "", "", "");
    fetchSummary("", "", "", "");
  };

  return (
    <div>
      <StockOutModal
        open={stockOutOpen}
        onClose={() => {
          setStockOutOpen(false);
          setIsEditing(false);
          setSelectedStock(null);
          fetchStocks();
          fetchSummary();
        }}
        products={products}
        locations={locationOptions.filter((loc) => loc !== "All Locations")}
        initialData={isEditing ? selectedStock : null}
      />
      <StockInModal
        open={stockInOpen}
        onClose={() => {
          setStockInOpen(false);
          setIsEditing(false);
          setSelectedStock(null);
          fetchStocks();
          fetchSummary();
        }}
        products={products}
        locations={locationOptions.filter((loc) => loc !== "All Locations")}
        initialData={isEditing ? selectedStock : null}
      />
      <StockViewModal
        open={viewModalOpen}
        onClose={() => setViewModalOpen(false)}
        stock={selectedStock}
      />
      <div className="flex items-center justify-between mb-8">
        <div className="flex flex-col">
          <h1 className="text-xl font-semibold">Stock Management</h1>
          <span className="text-gray-500 text-sm">
            Track and manage inventory movements with real-time updates
          </span>
        </div>
        {canCreate && (
          <div className="flex items-center gap-3">
            <button
              className="bg-red-600 hover:bg-red-700 text-white px-5 py-2 rounded-xl transition flex items-center gap-2 cursor-pointer"
              onClick={() => setStockOutOpen(true)}
            >
              <HiLogout className="text-md rotate-270" /> Stock Out
            </button>
            <button
              className="bg-green-600 hover:bg-green-700 text-white px-5 py-2 rounded-xl transition flex items-center gap-2 cursor-pointer"
              onClick={() => setStockInOpen(true)}
            >
              <HiDownload className="text-md" /> Stock In
            </button>
          </div>
        )}
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4 mb-4">
        <div className="bg-white rounded-2xl p-6 flex flex-col gap-4 border border-gray-200 transition-all duration-300 hover:scale-101">
          <div className="flex items-center justify-between">
            <HiDownload className="text-3xl text-green-600" />
            <div className="flex items-center gap-2 text-green-600 text-sm">
              <HiTrendingUp />
              <span>+12.5%</span>
            </div>
          </div>
          <div>
            <div className="text-gray-500 text-sm">Total Stock In</div>
            <div className="text-xl font-bold">{summary.totalStockIn}</div>
          </div>
        </div>
        <div className="bg-white rounded-2xl p-6 flex flex-col gap-4 border border-gray-200 transition-all duration-300 hover:scale-101">
          <div className="flex items-center justify-between">
            <HiLogout className="text-3xl text-red-500 rotate-270" />
            <div className="flex items-center gap-2 text-green-600 text-sm">
              <HiTrendingUp />
              <span>+8.3%</span>
            </div>
          </div>
          <div>
            <div className="text-gray-500 text-sm">Total Stock Out</div>
            <div className="text-xl font-bold">{summary.totalStockOut}</div>
          </div>
        </div>
        <div className="bg-white rounded-2xl p-6 flex flex-col gap-4 border border-gray-200 transition-all duration-300 hover:scale-101">
          <div className="flex items-center justify-between">
            <HiCube className="text-3xl text-black" />
            <div className="flex items-center gap-2 text-green-600 text-sm">
              <HiTrendingUp />
              <span>+5.2%</span>
            </div>
          </div>
          <div>
            <div className="text-gray-500 text-sm">Current Balance</div>
            <div className="text-xl font-bold">{summary.currentBalance}</div>
          </div>
        </div>
        <div className="bg-white rounded-2xl p-6 flex flex-col gap-4 border border-gray-200 transition-all duration-300 hover:scale-101">
          <div className="flex items-center justify-between">
            <HiOutlineExclamation className="text-3xl text-yellow-600" />
            <div className="flex items-center gap-2 text-red-600 text-sm">
              <HiTrendingDown />
              <span>-2 items</span>
            </div>
          </div>
          <div>
            <div className="text-gray-500 text-sm">Low Stock items</div>
            <div className="text-xl font-bold">{summary.lowStockItems}</div>
          </div>
        </div>
      </div>
      <div className="bg-white rounded-2xl p-6 mb-4 border border-gray-200">
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
              onChange={(e) => {
                setSearch(e.target.value);
                fetchStocks(
                  1,
                  pagination.limit,
                  e.target.value,
                  filterType,
                  filterUser,
                  filterLocation,
                );
                setPagination((prev) => ({ ...prev, page: 1 }));
              }}
            />
          </div>
          <div>
            <label className="block text-gray-700 text-sm mb-1">
              Transaction Type
            </label>
            <TransactionDropdown
              value={filterType}
              onChange={(val) => {
                setFilterType(val);
                fetchStocks(
                  1,
                  pagination.limit,
                  search,
                  val,
                  filterUser,
                  filterLocation,
                );
                setPagination((prev) => ({ ...prev, page: 1 }));
              }}
            />
          </div>
          <div>
            <label className="block text-gray-700 text-sm mb-1">User</label>
            <UserDropdown
              value={filterUser}
              onChange={(val) => {
                setFilterUser(val);
                fetchStocks(
                  1,
                  pagination.limit,
                  search,
                  filterType,
                  val,
                  filterLocation,
                );
                setPagination((prev) => ({ ...prev, page: 1 }));
              }}
              userOptions={userOptions}
            />
          </div>
          <div>
            <label className="block text-gray-700 text-sm mb-1">Location</label>
            <LocationDropdown
              value={filterLocation}
              onChange={(val) => {
                setFilterLocation(val);
                fetchStocks(
                  1,
                  pagination.limit,
                  search,
                  filterType,
                  filterUser,
                  val,
                );
                setPagination((prev) => ({ ...prev, page: 1 }));
              }}
            />
          </div>
        </div>
      </div>
      <div className="bg-white rounded-2xl overflow-x-auto border border-gray-200 px-3">
        {loading ? (
          <Loading />
        ) : error ? (
          <div className="p-8 text-center text-red-500">{error}</div>
        ) : (
          <table className="min-w-full text-left text-sm align-middle">
            <thead>
              <tr>
                <th className="number">No.</th>
                <th>Date & Times</th>
                <th>Product</th>
                <th>Type</th>
                <th>Quantity</th>
                <th>Balance</th>
                <th>User</th>
                <th>Location</th>
                <th>Notes</th>
                {canView || canUpdate || canDelete ? (
                  <th className="action">Actions</th>
                ) : null}
              </tr>
            </thead>
            <tbody>
              {stocks.map((stock, index) => (
                <tr key={stock._id}>
                  <td className="number">
                    {index + 1 + (pagination.page - 1) * pagination.limit}
                  </td>
                  <td>{formatDate(stock.createdAt) || "-"}</td>
                  <td>{stock.product?.name || stock.product_id || "-"}</td>
                  <td>
                    {stock.type === "in" ? (
                      <span className="text-green-600 flex items-center gap-1">
                        <HiDownload className="inline-block" /> Stock In
                      </span>
                    ) : stock.type === "out" ? (
                      <span className="text-red-500 flex items-center gap-1">
                        <HiLogout className="inline-block rotate-270" /> Stock
                        Out
                      </span>
                    ) : (
                      "-"
                    )}
                  </td>
                  <td>{stock.quantity}</td>
                  <td>{stock.balance}</td>
                  <td>
                    {stock.user?.first_name
                      ? `${stock.user.first_name} ${stock.user.last_name}`
                      : stock.user_id || "-"}
                  </td>
                  <td>{stock.location || "-"}</td>
                  <td>{stock.note || "-"}</td>
                  <td className="action flex items-center gap-2">
                    {canView && (
                      <button
                        onClick={() => handleView(stock)}
                        className="text-[#1e3a5f] font-semibold cursor-pointer p-2 rounded-full hover:bg-[#f1f5f9]"
                        title="View"
                      >
                        <HiOutlineEye className="text-xl" />
                      </button>
                    )}
                    {canUpdate && (
                      <button
                        onClick={() => handleEdit(stock)}
                        className="text-[#1e3a5f] font-semibold cursor-pointer p-2 rounded-full hover:bg-[#f1f5f9]"
                        title="Edit"
                      >
                        <HiOutlinePencil className="text-xl" />
                      </button>
                    )}
                    {canDelete && (
                      <button
                        onClick={() => handleDelete(stock._id)}
                        className="text-red-600 font-semibold cursor-pointer p-2 rounded-full hover:bg-[#f1f5f9]"
                        title="Delete"
                      >
                        <HiOutlineTrash className="text-xl" />
                      </button>
                    )}
                  </td>
                </tr>
              ))}
              {stocks.length === 0 && (
                <tr>
                  <td colSpan="10">
                    <NoDataFound message="No stocks found." />
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        )}
      </div>
      {stocks.length > 0 && (
        <div className="flex justify-end mt-4">
          <Pagination
            total={pagination.totalItems}
            page={pagination.page}
            limit={pagination.limit}
            onChange={({ page, limit }) => fetchStocks({ page, limit })}
          />
        </div>
      )}
    </div>
  );
};

export default Stocks;
