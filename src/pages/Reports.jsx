import React, { useEffect, useState } from "react";
import {
  getInventorySummary,
  getOrderStats,
  getTrends,
  getProducts,
} from "../api";
import {
  HiOutlineDownload,
  HiOutlineRefresh,
  HiOutlineCalendar,
  HiOutlineChartBar,
  HiOutlineChartPie,
  HiOutlineExclamationCircle,
} from "react-icons/hi";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Legend,
} from "recharts";

const COLORS = ["#f59e0b", "#10b981", "#ef4444"]; // Amber, Green, Red for Pending, Approved, Rejected

function exportCSV(data, filename) {
  if (!data || data.length === 0) return;
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
  const [trends, setTrends] = useState([]);
  const [lowStockProducts, setLowStockProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [dateRange, setDateRange] = useState({
    startDate: new Date(new Date().setDate(new Date().getDate() - 30))
      .toISOString()
      .split("T")[0],
    endDate: new Date().toISOString().split("T")[0],
  });

  useEffect(() => {
    fetchData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [dateRange]);

  async function fetchData() {
    setLoading(true);
    setError("");
    try {
      const [summaryRes, statsRes, trendsRes, lowStockRes] = await Promise.all([
        getInventorySummary(),
        getOrderStats({ from: dateRange.startDate, to: dateRange.endDate }),
        getTrends(), // Trends endpoint might need date filtering in future, currently static 7 days in backend
        getProducts({ status: "low_stock", limit: 5 }),
      ]);

      setSummary(summaryRes.data);
      setOrderStats(statsRes.data);
      setTrends(trendsRes.data?.data || []);
      setLowStockProducts(lowStockRes.data?.data || []);
    } catch (err) {
      console.error(err);
      setError("Failed to load reports");
    } finally {
      setLoading(false);
    }
  }

  const orderPieData = orderStats
    ? [
        { name: "Pending", value: orderStats.pending },
        { name: "Approved", value: orderStats.approved },
        { name: "Rejected", value: orderStats.rejected },
      ]
    : [];

  return (
    <div className="space-y-6">
      {/* Header & Actions */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-gray-900">
            Reports & Analytics
          </h1>
          <p className="text-gray-500">
            Insights into inventory, orders, and stock movements
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          {/* Date Filter */}
          <div className="flex items-center gap-2 bg-white px-3 py-2 rounded-xl border border-gray-200 shadow-sm">
            <HiOutlineCalendar className="text-gray-500" />
            <input
              type="date"
              value={dateRange.startDate}
              onChange={(e) =>
                setDateRange({ ...dateRange, startDate: e.target.value })
              }
              className="text-sm border-none focus:ring-0 text-gray-700 bg-transparent outline-none"
            />
            <span className="text-gray-400">-</span>
            <input
              type="date"
              value={dateRange.endDate}
              onChange={(e) =>
                setDateRange({ ...dateRange, endDate: e.target.value })
              }
              className="text-sm border-none focus:ring-0 text-gray-700 bg-transparent outline-none"
            />
          </div>

          <button
            onClick={fetchData}
            className="p-2 bg-white border border-gray-200 rounded-xl hover:bg-gray-50 text-gray-600 shadow-sm transition-colors"
            title="Refresh Data"
          >
            <HiOutlineRefresh className="text-xl" />
          </button>

          <button
            className="bg-[#1e3a5f] hover:bg-[#16375b] text-white px-4 py-2 rounded-xl flex items-center gap-2 shadow-sm transition-colors cursor-pointer"
            onClick={() => {
              if (orderStats) {
                exportCSV(
                  [{ ...orderStats, date_range: JSON.stringify(dateRange) }],
                  "order_stats_report.csv",
                );
              }
            }}
          >
            <HiOutlineDownload className="text-lg" />
            <span>Export CSV</span>
          </button>
        </div>
      </div>

      {loading ? (
        <div className="h-64 flex items-center justify-center">
          <div className="text-gray-500 flex flex-col items-center">
            <HiOutlineRefresh className="animate-spin text-3xl mb-2" />
            Loading reports...
          </div>
        </div>
      ) : error ? (
        <div className="bg-red-50 text-red-600 p-4 rounded-xl border border-red-100 text-center">
          {error}
        </div>
      ) : (
        <>
          {/* Summary Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm flex flex-col">
              <span className="text-gray-500 text-sm font-medium">
                Total Products
              </span>
              <span className="text-3xl font-bold text-gray-900 mt-2">
                {summary?.totalProducts || 0}
              </span>
            </div>
            <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm flex flex-col">
              <span className="text-gray-500 text-sm font-medium">
                Total Inventory Value
              </span>
              <div className="flex items-baseline gap-1 mt-2">
                <span className="text-3xl font-bold text-gray-900">
                  {summary?.totalQuantity || 0}
                </span>
                <span className="text-sm text-gray-400">items</span>
              </div>
            </div>
            <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm flex flex-col">
              <span className="text-gray-500 text-sm font-medium">
                Low Stock Items
              </span>
              <span
                className={`text-3xl font-bold mt-2 ${
                  (summary?.lowStock || 0) > 0
                    ? "text-red-600"
                    : "text-green-600"
                }`}
              >
                {summary?.lowStock || 0}
              </span>
            </div>
            <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm flex flex-col">
              <span className="text-gray-500 text-sm font-medium">
                Total Suppliers
              </span>
              <span className="text-3xl font-bold text-gray-900 mt-2">
                {summary?.totalSuppliers || 0}
              </span>
            </div>
          </div>

          {/* Charts Row */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Inventory Trends */}
            <div className="lg:col-span-2 bg-white p-6 rounded-2xl border border-gray-100 shadow-sm">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-lg font-bold text-gray-800 flex items-center gap-2">
                  <HiOutlineChartBar className="text-blue-600" /> Inventory
                  Trends (7 Days)
                </h2>
              </div>
              <div className="h-80 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart
                    data={trends}
                    margin={{ top: 10, right: 30, left: 0, bottom: 0 }}
                  >
                    <defs>
                      <linearGradient id="colorIn" x1="0" y1="0" x2="0" y2="1">
                        <stop
                          offset="5%"
                          stopColor="#10B981"
                          stopOpacity={0.1}
                        />
                        <stop
                          offset="95%"
                          stopColor="#10B981"
                          stopOpacity={0}
                        />
                      </linearGradient>
                      <linearGradient id="colorOut" x1="0" y1="0" x2="0" y2="1">
                        <stop
                          offset="5%"
                          stopColor="#EF4444"
                          stopOpacity={0.1}
                        />
                        <stop
                          offset="95%"
                          stopColor="#EF4444"
                          stopOpacity={0}
                        />
                      </linearGradient>
                    </defs>
                    <CartesianGrid
                      strokeDasharray="3 3"
                      vertical={false}
                      stroke="#f3f4f6"
                    />
                    <XAxis
                      dataKey="name"
                      fontSize={12}
                      tickLine={false}
                      axisLine={false}
                      stroke="#9ca3af"
                    />
                    <YAxis
                      fontSize={12}
                      tickLine={false}
                      axisLine={false}
                      stroke="#9ca3af"
                    />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: "#fff",
                        borderRadius: "12px",
                        border: "none",
                        boxShadow: "0 4px 6px -1px rgb(0 0 0 / 0.1)",
                      }}
                    />
                    <Area
                      type="monotone"
                      dataKey="in"
                      name="Stock In"
                      stroke="#10B981"
                      strokeWidth={3}
                      fillOpacity={1}
                      fill="url(#colorIn)"
                    />
                    <Area
                      type="monotone"
                      dataKey="out"
                      name="Stock Out"
                      stroke="#EF4444"
                      strokeWidth={3}
                      fillOpacity={1}
                      fill="url(#colorOut)"
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Order Stats Pie */}
            <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm">
              <h2 className="text-lg font-bold text-gray-800 mb-6 flex items-center gap-2">
                <HiOutlineChartPie className="text-purple-600" /> Order Status
              </h2>
              <div className="h-64 w-full relative">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={orderPieData}
                      cx="50%"
                      cy="50%"
                      innerRadius={60}
                      outerRadius={80}
                      paddingAngle={5}
                      dataKey="value"
                    >
                      {orderPieData.map((entry, index) => (
                        <Cell
                          key={`cell-${index}`}
                          fill={COLORS[index % COLORS.length]}
                        />
                      ))}
                    </Pie>
                    <Tooltip />
                    <Legend verticalAlign="bottom" height={36} />
                  </PieChart>
                </ResponsiveContainer>
                {/* Center Text */}
                <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                  <div className="text-center">
                    <span className="block text-xl font-bold text-gray-800">
                      {orderStats?.totalOrders || 0}
                    </span>
                    <span className="text-xs text-gray-400">Total</span>
                  </div>
                </div>
              </div>
              <div className="mt-4 space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-500 text-sm">Pending</span>
                  <span className="font-semibold text-gray-900">
                    {orderStats?.pending || 0}
                  </span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-500 text-sm">Approved</span>
                  <span className="font-semibold text-gray-900">
                    {orderStats?.approved || 0}
                  </span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-500 text-sm">Rejected</span>
                  <span className="font-semibold text-gray-900">
                    {orderStats?.rejected || 0}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Low Stock Alert Table */}
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
            <div className="p-6 border-b border-gray-100 flex justify-between items-center">
              <h2 className="text-lg font-bold text-gray-800 flex items-center gap-2">
                <HiOutlineExclamationCircle className="text-red-500" /> Low
                Stock Alerts
              </h2>
            </div>
            <div className="overflow-x-auto">
              {lowStockProducts.length > 0 ? (
                <table className="w-full text-left text-sm">
                  <thead className="bg-gray-50 text-gray-500">
                    <tr>
                      <th className="px-6 py-3 font-medium">Product</th>
                      <th className="px-6 py-3 font-medium">Category</th>
                      <th className="px-6 py-3 font-medium text-right">
                        Stock
                      </th>
                      <th className="px-6 py-3 font-medium text-right">
                        Price
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {lowStockProducts.map((product) => (
                      <tr key={product._id} className="hover:bg-gray-50">
                        <td className="px-6 py-4 font-medium text-gray-900">
                          {product.name}
                        </td>
                        <td className="px-6 py-4 text-gray-500">
                          {product.category?.name || "N/A"}
                        </td>
                        <td className="px-6 py-4 text-right text-red-600 font-bold">
                          {product.stock}
                        </td>
                        <td className="px-6 py-4 text-right text-gray-600">
                          ${product.price}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              ) : (
                <div className="p-8 text-center text-gray-500">
                  No low stock items found. Good job!
                </div>
              )}
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default Reports;
