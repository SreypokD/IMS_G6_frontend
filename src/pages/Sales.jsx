import React, { useEffect, useState } from "react";
import { getSales } from "../api";

const Sales = () => {
  const [sales, setSales] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    fetchSales();
  }, []);

  async function fetchSales() {
    setLoading(true);
    setError("");
    try {
      const res = await getSales();
      setSales(res.data.data);
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
      {loading ? (
        <div>Loading...</div>
      ) : error ? (
        <div className="text-red-600">{error}</div>
      ) : (
        <div className="bg-white rounded-xl overflow-x-auto border border-gray-200">
          <table className="min-w-full text-left text-sm align-middle">
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
                <tr key={sale._id} className="border-t border-gray-200">
                  <td className="py-3 px-4">{idx + 1}</td>
                  <td className="py-3 px-4">{sale.quantity}</td>
                  <td className="py-3 px-4">{sale.status}</td>
                  <td className="py-3 px-4">
                    {sale.completed_at
                      ? new Date(sale.completed_at).toLocaleString()
                      : "-"}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default Sales;
