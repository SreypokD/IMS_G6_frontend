import React, { useEffect, useState } from "react";
import { getInventorySummary, getOrderStats } from "../api";

function exportCSV(data, filename) {
  const csvRows = [
    Object.keys(data[0]).join(","),
    ...data.map((row) => Object.values(row).join(",")),
  ];
  const blob = new Blob([csvRows.join("\n")], { type: "text/csv" });
  const url = window.URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  a.click();
  window.URL.revokeObjectURL(url);
}

const Reports = () => {
  const [summary, setSummary] = useState(null);
  const [orderStats, setOrderStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    async function fetchData() {
      setLoading(true);
      setError("");
      try {
        const [summaryRes, statsRes] = await Promise.all([
          getInventorySummary(),
          getOrderStats(),
        ]);
        setSummary(summaryRes.data);
        setOrderStats(statsRes.data);
      } catch {
        setError("Failed to load reports");
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, []);

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <div className="flex flex-col">
          <h1 className="text-2xl font-semibold">Reports & Analytics</h1>
          <span className="text-gray-500">
            View inventory insights, stock movements, and performance summaries
          </span>
        </div>
        <button
          className="bg-[#1e3a5f] hover:bg-[#16375b] text-white px-6 py-2 rounded-xl focus:outline-none flex items-center gap-2 cursor-pointer"
          onClick={() => {
            if (orderStats) {
              exportCSV(
                [
                  {
                    ...orderStats,
                    date: new Date().toLocaleDateString(),
                  },
                ],
                "order_stats.csv",
              );
            }
          }}
        >
          Export Order Stats CSV
        </button>
      </div>
      {loading ? (
        <div className="p-4 text-center text-gray-500">Loading...</div>
      ) : error ? (
        <div className="p-4 text-center text-red-500">{error}</div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div className="bg-white rounded-xl p-4 border border-gray-200">
            <h2 className="text-lg mb-4">Inventory Summary</h2>
            <div className="text-base">
              Total Products: <b>{summary?.totalProducts ?? "-"}</b>
            </div>
            <div className="text-base">
              Total Quantity: <b>{summary?.totalQuantity ?? "-"}</b>
            </div>
          </div>
          <div className="bg-white rounded-xl p-4 border border-gray-200">
            <h2 className="text-lg mb-4">Order Stats</h2>
            <div className="text-base">
              Total Orders: <b>{orderStats?.totalOrders ?? "-"}</b>
            </div>
            <div className="text-base">
              Pending: <b>{orderStats?.pending ?? "-"}</b>
            </div>
            <div className="text-base">
              Approved: <b>{orderStats?.approved ?? "-"}</b>
            </div>
            <div className="text-base">
              Rejected: <b>{orderStats?.rejected ?? "-"}</b>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Reports;
