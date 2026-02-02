import React, { useEffect, useState } from "react";
import { getSales } from "../api";
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
} from "react-icons/hi";
import { BsCurrencyDollar } from "react-icons/bs";

const Sales = () => {
  const [sales, setSales] = useState([]);
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

  useEffect(() => {
    if (user) {
      fetchSales(1, 10);
    }
  }, [user]);

  async function fetchSales(page = 1, limit = 10) {
    setLoading(true);
    setError("");
    try {
      const res = await getSales({ page, limit });
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

  return (
    <div>
      <SaleModal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        onSuccess={() => fetchSales(pagination.page, pagination.limit)}
      />
      <div className="flex items-center justify-between mb-8">
        <div className="flex flex-col">
          <h1 className="text-2xl font-semibold">Sales Management</h1>
          <span className="text-gray-500">
            Record and track all sales transactions with customer information
          </span>
        </div>
        <button
          className="bg-[#1e3a5f] hover:bg-[#16375b] text-white px-6 py-2 rounded-full focus:outline-none flex items-center gap-2 cursor-pointer"
          onClick={() => setModalOpen(true)}
        >
          <HiOutlinePlus className="text-md" /> Record Sale
        </button>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4 mb-4">
        <div className="bg-white rounded-xl p-6 flex flex-col gap-4 border border-gray-200 transition-all duration-300 hover:scale-101">
          <div className="flex items-center justify-between">
            <BsCurrencyDollar className="text-3xl text-green-600" />
            <div className="flex items-center gap-2 text-green-600 text-sm">
              <HiTrendingUp />
              <span>12.5%</span>
            </div>
          </div>
          <div>
            <div className="text-gray-500 text-base">Total Revenue</div>
            <div className="text-2xl font-bold">$571.87</div>
          </div>
        </div>
        <div className="bg-white rounded-xl p-6 flex flex-col gap-4 border border-gray-200 transition-all duration-300 hover:scale-101">
          <div className="flex items-center justify-between">
            <HiOutlineShoppingCart className="text-3xl text-gray-700" />
            <div className="flex items-center gap-2 text-green-600 text-sm">
              <HiTrendingUp />
              <span>8.3%</span>
            </div>
          </div>
          <div>
            <div className="text-gray-500 text-base">Total Sales</div>
            <div className="text-2xl font-bold">6</div>
          </div>
        </div>
        <div className="bg-white rounded-xl p-6 flex flex-col gap-4 border border-gray-200 transition-all duration-300 hover:scale-101">
          <div className="flex items-center justify-between">
            <HiTrendingUp className="text-3xl text-yellow-600" />
            <div className="flex items-center gap-2 text-green-600 text-sm">
              <HiTrendingUp />
              <span>5.2%</span>
            </div>
          </div>
          <div>
            <div className="text-gray-500 text-base">Avg Transaction</div>
            <div className="text-2xl font-bold">$95.31</div>
          </div>
        </div>
        <div className="bg-white rounded-xl p-6 flex flex-col gap-4 border border-gray-200 transition-all duration-300 hover:scale-101">
          <div className="flex items-center justify-between">
            <HiOutlineClock className="text-3xl text-yellow-600" />
            <div className="flex items-center gap-2 text-red-600 text-sm">
              <HiTrendingDown />
              <span>3.1%</span>
            </div>
          </div>
          <div>
            <div className="text-gray-500 text-base">Pending Payments</div>
            <div className="text-2xl font-bold">$145.96</div>
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
                <th className="p-3">Transaction ID</th>
                <th className="p-3">Status</th>
                <th className="p-3">Completed At</th>
              </tr>
            </thead>
            <tbody>
              {sales.map((sale, index) => (
                <tr key={sale._id}>
                  <td className="p-3">
                    {index + 1 + (pagination.page - 1) * pagination.limit}
                  </td>
                  <td className="p-3">{sale.quantity}</td>
                  <td className="p-3">{sale.status}</td>
                  <td className="p-3">
                    {sale.completed_at
                      ? new Date(sale.completed_at).toLocaleString()
                      : "-"}
                  </td>
                </tr>
              ))}
              {sales.length === 0 && (
                <tr>
                  <td colSpan="4">
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
