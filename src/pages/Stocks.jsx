import React, { useEffect, useState } from "react";
import { Listbox } from "@headlessui/react";
import { HiSelector } from "react-icons/hi";
import { getStocks } from "../api";
import {
  HiDownload,
  HiLogout,
  HiOutlineUpload,
  HiOutlineDownload,
} from "react-icons/hi";
import Pagination from "../components/Pagination";
import { useAuth } from "../context/useAuth";
import NoDataFound from "../components/NoDataFound";

// Custom dropdowns for Stock page
const statusOptions = ["All Status", "In Stock", "Out of Stock", "Low Stock"];
const locationOptions = [
  "All Locations",
  "Warehouse 1",
  "Warehouse 2",
  "Storefront",
];

function StockStatusDropdown() {
  const [selected, setSelected] = useState(statusOptions[0]);
  return (
    <Listbox value={selected} onChange={setSelected}>
      <div className="relative">
        <Listbox.Button className="cursor-pointer w-full bg-gray-50 border border-gray-200 rounded-lg px-3 py-2 text-left text-gray-800 flex items-center justify-between">
          <span>{selected}</span>
          <HiSelector className="w-5 h-5 text-gray-400 ml-2" />
        </Listbox.Button>
        <Listbox.Options className="absolute z-10 mt-1 w-full bg-white border border-gray-200 rounded-lg shadow-lg max-h-60 overflow-auto focus:outline-none">
          {statusOptions.map((option) => (
            <Listbox.Option
              key={option}
              value={option}
              className={({ active, selected }) =>
                `px-4 py-2 cursor-pointer ${active ? "text-[#64748b] hover:bg-[#f1f5f9] hover:text-black" : "text-gray-900"} ${selected ? "font-semibold bg-blue-50" : ""}`
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

function StockLocationDropdown() {
  const [selected, setSelected] = useState(locationOptions[0]);
  return (
    <Listbox value={selected} onChange={setSelected}>
      <div className="relative">
        <Listbox.Button className="cursor-pointer w-full bg-gray-50 border border-gray-200 rounded-lg px-3 py-2 text-left text-gray-800 flex items-center justify-between">
          <span>{selected}</span>
          <HiSelector className="w-5 h-5 text-gray-400 ml-2" />
        </Listbox.Button>
        <Listbox.Options className="absolute z-10 mt-1 w-full bg-white border border-gray-200 rounded-lg shadow-lg max-h-60 overflow-auto focus:outline-none">
          {locationOptions.map((option) => (
            <Listbox.Option
              key={option}
              value={option}
              className={({ active, selected }) =>
                `px-4 py-2 cursor-pointer ${active ? "text-[#64748b] hover:bg-[#f1f5f9] hover:text-black" : "text-gray-900"} ${selected ? "font-semibold bg-blue-50" : ""}`
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
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 10,
    totalItems: 0,
    totalPages: 1,
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const { user } = useAuth();

  useEffect(() => {
    if (user) {
      fetchStocks(1, 10);
    }
  }, [user]);

  async function fetchStocks(page = 1, limit = 10) {
    setLoading(true);
    setError("");
    try {
      const res = await getStocks({ page, limit });
      setStocks(res.data.data);
      setPagination(res.data.pagination);
    } catch {
      setError("Failed to load stocks");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div>
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
          <button className="bg-red-600 hover:bg-red-700 text-white px-5 py-2 rounded-xl transition flex items-center gap-2 cursor-pointer">
            <HiLogout className="text-md rotate-270" /> Stock Out
          </button>
          <button className="bg-green-700 hover:bg-green-800 text-white px-5 py-2 rounded-xl transition flex items-center gap-2 cursor-pointer">
            <HiDownload className="text-md" /> Stock In
          </button>
        </div>
      </div>
      <div className="bg-white rounded-xl p-6 mb-6 border border-gray-200">
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
          <input
            className="bg-gray-50 border border-gray-200 rounded-lg py-2 px-4 text-gray-700 min-w-0 w-full"
            placeholder="Search..."
          />
          <StockStatusDropdown />
          <StockLocationDropdown />
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
              <tr>
                <th className="py-3 px-4">No.</th>
                <th className="py-3 px-4">Quantity</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4">Completed At</th>
              </tr>
            </thead>
            <tbody>
              {stocks.map((stock, idx) => (
                <tr key={stock._id}>
                  <td className="py-1 px-4">
                    {idx + 1 + (pagination.page - 1) * pagination.limit}
                  </td>
                  <td className="py-1 px-4">{stock.quantity}</td>
                  <td className="py-1 px-4">{stock.status}</td>
                  <td className="py-1 px-4">
                    {stock.completed_at
                      ? new Date(stock.completed_at).toLocaleString()
                      : "-"}
                  </td>
                </tr>
              ))}
              {stocks.length === 0 && (
                <tr>
                  <td colSpan="4">
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
