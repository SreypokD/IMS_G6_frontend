import React, { useEffect, useState } from "react";
import { Listbox } from "@headlessui/react";
import { getStocks, getProducts } from "../api";
import {
  HiSelector,
  HiOutlineFilter,
  HiDownload,
  HiLogout,
  HiOutlineUpload,
  HiOutlineDownload,
  HiCube,
  HiTrendingUp,
  HiTrendingDown,
  HiOutlineExclamation,
} from "react-icons/hi";
import Pagination from "../components/Pagination";
import { useAuth } from "../contexts/auth/useAuth";
import NoDataFound from "../components/NoDataFound";
import { formatDate } from "../utils/dateFormat";
import StockOutModal from "../components/StockOutModal";
import StockInModal from "../components/StockInModal";

const transactionOptions = ["All Transactions"];
const users = ["All Users"];
const locationOptions = ["Warehouse 1", "Warehouse 2", "Storefront"];

function UserDropdown({ value, onChange }) {
  return (
    <Listbox value={value} onChange={onChange}>
      <div className="relative">
        <Listbox.Button className="cursor-pointer w-full bg-gray-50 border border-gray-200 rounded-lg px-3 py-2 text-left text-gray-800 flex items-center justify-between">
          <span>{value || "All Users"}</span>
          <HiSelector className="w-5 h-5 text-gray-400 ml-2" />
        </Listbox.Button>
        <Listbox.Options className="absolute z-10 mt-1 w-full bg-white border border-gray-200 rounded-lg shadow-lg max-h-60 overflow-auto focus:outline-none">
          <Listbox.Option
            className="px-4 py-2 cursor-pointer text-black hover:bg-[#f1f5f9]"
            value=""
          >
            <span>All Users</span>
          </Listbox.Option>
          {users.map((option) => (
            <Listbox.Option
              key={option}
              value={option}
              className={({ selected }) =>
                `px-4 py-2 cursor-pointer text-black hover:bg-[#f1f5f9] ${selected ? "bg-blue-50" : ""}`
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

function TransactionDropdown({ value, onChange }) {
  return (
    <Listbox value={value} onChange={onChange}>
      <div className="relative">
        <Listbox.Button className="cursor-pointer w-full bg-gray-50 border border-gray-200 rounded-lg px-3 py-2 text-left text-gray-800 flex items-center justify-between">
          <span>{value || "All Transactions"}</span>
          <HiSelector className="w-5 h-5 text-gray-400 ml-2" />
        </Listbox.Button>
        <Listbox.Options className="absolute z-10 mt-1 w-full bg-white border border-gray-200 rounded-lg shadow-lg max-h-60 overflow-auto focus:outline-none">
          <Listbox.Option
            className="px-4 py-2 cursor-pointer text-black hover:bg-[#f1f5f9]"
            value=""
          >
            <span>All Transactions</span>
          </Listbox.Option>
          {transactionOptions.map((option) => (
            <Listbox.Option
              key={option}
              value={option}
              className={({ selected }) =>
                `px-4 py-2 cursor-pointer text-black hover:bg-[#f1f5f9] ${selected ? "bg-blue-50" : ""}`
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

function LocationDropdown({ value, onChange }) {
  return (
    <Listbox value={value} onChange={onChange}>
      <div className="relative">
        <Listbox.Button className="cursor-pointer w-full bg-gray-50 border border-gray-200 rounded-lg px-3 py-2 text-left text-gray-800 flex items-center justify-between">
          <span>{value || "All Locations"}</span>
          <HiSelector className="w-5 h-5 text-gray-400 ml-2" />
        </Listbox.Button>
        <Listbox.Options className="absolute z-10 mt-1 w-full bg-white border border-gray-200 rounded-lg shadow-lg max-h-60 overflow-auto focus:outline-none">
          <Listbox.Option
            className="px-4 py-2 cursor-pointer text-black hover:bg-[#f1f5f9]"
            value=""
          >
            <span>All Locations</span>
          </Listbox.Option>
          {locationOptions.map((option) => (
            <Listbox.Option
              key={option}
              value={option}
              className={({ selected }) =>
                `px-4 py-2 cursor-pointer text-black hover:bg-[#f1f5f9] ${selected ? "bg-blue-50" : ""}`
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
  const [products, setProducts] = useState([]);
  const [stockOutOpen, setStockOutOpen] = useState(false);
  const [stockInOpen, setStockInOpen] = useState(false);
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 10,
    totalItems: 0,
    totalPages: 1,
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const { user } = useAuth();
  const [search, setSearch] = useState("");
  const [filterUser, setFilterUser] = useState("");
  const [filterType, setFilterType] = useState("");
  const [filterLocation, setFilterLocation] = useState("");

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

  async function fetchProducts() {
    try {
      const res = await getProducts();
      setProducts(res.data.data || []);
    } catch {
      setProducts([]);
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

  return (
    <div>
      <StockOutModal
        open={stockOutOpen}
        onClose={() => {
          setStockOutOpen(false);
          fetchStocks();
        }}
        products={products}
        locations={locationOptions.filter((loc) => loc !== "All Locations")}
      />
      <StockInModal
        open={stockInOpen}
        onClose={() => {
          setStockInOpen(false);
          fetchStocks();
        }}
        products={products}
        locations={locationOptions.filter((loc) => loc !== "All Locations")}
      />
      <div className="flex items-center justify-between mb-8">
        <div className="flex flex-col">
          <h1 className="text-2xl font-semibold">Stock Management</h1>
          <span className="text-gray-500">
            Track and manage inventory movements with real-time updates
          </span>
        </div>
        <div className="flex items-center gap-3">
          <span className="flex items-center text-black px-5 py-2 gap-2 cursor-pointer">
            <HiOutlineUpload className="text-md" /> Bulk Import
          </span>
          <span className="flex items-center text-black px-5 py-2 gap-2 cursor-pointer">
            <HiOutlineDownload className="text-md" /> Export
          </span>
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
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4 mb-4">
        <div className="bg-white rounded-xl p-6 flex flex-col gap-4 border border-gray-200 transition-all duration-300 hover:scale-101">
          <div className="flex items-center justify-between">
            <HiDownload className="text-3xl text-green-600" />
            <div className="flex items-center gap-2 text-green-600 text-sm">
              <HiTrendingUp />
              <span>+12.5%</span>
            </div>
          </div>
          <div>
            <div className="text-gray-500 text-base">Total Stock In</div>
            <div className="text-2xl font-bold">2,847</div>
          </div>
        </div>
        <div className="bg-white rounded-xl p-6 flex flex-col gap-4 border border-gray-200 transition-all duration-300 hover:scale-101">
          <div className="flex items-center justify-between">
            <HiLogout className="text-3xl text-red-500 rotate-270" />
            <div className="flex items-center gap-2 text-green-600 text-sm">
              <HiTrendingUp />
              <span>+8.3%</span>
            </div>
          </div>
          <div>
            <div className="text-gray-500 text-base">Total Stock Out</div>
            <div className="text-2xl font-bold">1,923</div>
          </div>
        </div>
        <div className="bg-white rounded-xl p-6 flex flex-col gap-4 border border-gray-200 transition-all duration-300 hover:scale-101">
          <div className="flex items-center justify-between">
            <HiCube className="text-3xl text-black" />
            <div className="flex items-center gap-2 text-green-600 text-sm">
              <HiTrendingUp />
              <span>+5.2%</span>
            </div>
          </div>
          <div>
            <div className="text-gray-500 text-base">Current Balance</div>
            <div className="text-2xl font-bold">8,456</div>
          </div>
        </div>
        <div className="bg-white rounded-xl p-6 flex flex-col gap-4 border border-gray-200 transition-all duration-300 hover:scale-101">
          <div className="flex items-center justify-between">
            <HiOutlineExclamation className="text-3xl text-yellow-600" />
            <div className="flex items-center gap-2 text-red-600 text-sm">
              <HiTrendingDown />
              <span>-2 items</span>
            </div>
          </div>
          <div>
            <div className="text-gray-500 text-base">Low Stock items</div>
            <div className="text-2xl font-bold">12</div>
          </div>
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
            <label className="block text-gray-700 text-base font-bold mb-2">
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
            <label className="block text-gray-700 text-base font-bold mb-2">
              User
            </label>
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
            />
          </div>
          <div>
            <label className="block text-gray-700 text-base font-bold mb-2">
              Location
            </label>
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
                <th>Date & Times</th>
                <th>Product</th>
                <th>Type</th>
                <th>Quantity</th>
                <th>Balance</th>
                <th>User</th>
                <th>Location</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {stocks.map((stock, index) => (
                <tr key={stock._id}>
                  <td>
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
                </tr>
              ))}
              {stocks.length === 0 && (
                <tr>
                  <td colSpan="9">
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
