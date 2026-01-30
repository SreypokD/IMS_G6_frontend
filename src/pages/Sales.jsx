import React, { useEffect, useState } from "react";
import { getSales } from "../api";
import Pagination from "../components/Pagination";
import { useAuth } from "../context/useAuth";
import NoDataFound from "../components/NoDataFound";

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
      setPagination(res.data.pagination);
    } catch {
      setError("Failed to load sales");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <div className="flex flex-col">
          <h1 className="text-2xl font-semibold">Sales</h1>
          <span className="text-gray-500">Manage and view sales</span>
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
              {sales.map((sale, idx) => (
                <tr key={sale._id}>
                  <td className="py-1 px-4">{idx + 1}</td>
                  <td className="py-1 px-4">{sale.quantity}</td>
                  <td className="py-1 px-4">{sale.status}</td>
                  <td className="py-1 px-4">
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
            onChange={({ page, limit }) => fetchSales({ page, limit })}
          />
        </div>
      )}
    </div>
  );
};

export default Sales;
