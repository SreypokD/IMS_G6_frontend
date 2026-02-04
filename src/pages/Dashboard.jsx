import React, { useEffect, useState } from "react";
import { getInventorySummary, getOrderStats } from "../api";
import {
  HiCube,
  HiClipboardList,
  HiUserGroup,
  HiChartBar,
  HiTrendingUp,
  HiTrendingDown,
  HiOutlineExclamation,
} from "react-icons/hi";
import { useAuth } from "../contexts/auth/useAuth";
import { Link } from "react-router-dom";

const Dashboard = () => {
  const [summary, setSummary] = useState(null);
  const [orderStats, setOrderStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();

  useEffect(() => {
    async function fetchData() {
      setLoading(true);
      try {
        const [summaryRes, orderStatsRes] = await Promise.all([
          getInventorySummary(),
          getOrderStats(),
        ]);
        setSummary(summaryRes.data);
        setOrderStats(orderStatsRes.data);
      } catch {
        // handle error
      } finally {
        setLoading(false);
      }
    }
    if (user) {
      fetchData();
    }
  }, [user]);

  if (loading) {
    return (
      <div className="p-8 text-center text-gray-500">Loading dashboard...</div>
    );
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <div className="flex flex-col">
          <h1 className="text-2xl font-semibold">Dashboard</h1>
          <span className="text-gray-500">
            Welcome back! Here's your inventory overview
          </span>
        </div>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4 mb-4">
        <Link
          to="/products"
          className="bg-white rounded-xl p-6 flex flex-col gap-4 border border-gray-200 transition-all duration-300 hover:scale-101"
        >
          <div className="flex items-center justify-between">
            <HiCube className="text-3xl text-purple-600" />
            <div className="flex items-center gap-2 text-green-600 text-sm"></div>
          </div>
          <div>
            <div className="text-gray-500 text-base">Total Products</div>
            <div className="text-2xl font-bold">
              {summary?.totalProducts ?? 0}
            </div>
          </div>
        </Link>
        <Link
          to="/products"
          className="bg-white rounded-xl p-6 flex flex-col gap-4 border border-gray-200 transition-all duration-300 hover:scale-101"
        >
          <div className="flex items-center justify-between">
            <HiOutlineExclamation className="text-3xl text-yellow-600" />
            <div className="flex items-center gap-2 text-red-600 text-sm"></div>
          </div>
          <div>
            <div className="text-gray-500 text-base">Low Stock Products</div>
            <div className="text-2xl font-bold">{summary?.lowStock ?? 0}</div>
          </div>
        </Link>
        <Link
          to="/suppliers"
          className="bg-white rounded-xl p-6 flex flex-col gap-4 border border-gray-200 transition-all duration-300 hover:scale-101"
        >
          <div className="flex items-center justify-between">
            <HiUserGroup className="text-3xl text-pink-600" />
          </div>
          <div>
            <div className="text-gray-500 text-base">Total Suppliers</div>
            <div className="text-2xl font-bold">
              {summary?.totalSuppliers ?? 0}
            </div>
          </div>
        </Link>
        <Link
          to="/order-requests"
          className="bg-white rounded-xl p-6 flex flex-col gap-4 border border-gray-200 transition-all duration-300 hover:scale-101"
        >
          <div className="flex items-center justify-between">
            <HiClipboardList className="text-3xl text-orange-600" />
            <div className="flex items-center gap-2 text-green-600 text-sm"></div>
          </div>
          <div>
            <div className="text-gray-500 text-base">Pending Orders</div>
            <div className="text-2xl font-bold">{orderStats?.pending ?? 0}</div>
          </div>
        </Link>
      </div>

      {/* Add more dashboard widgets/charts here as needed */}
      <div className="bg-white rounded-2xl p-6 border border-gray-200 mt-4">
        <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
          <HiChartBar className="text-blue-700" /> Order Statistics
        </h2>
        {orderStats ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-6">
            <div>
              <div className="text-xl font-bold">{orderStats.pending ?? 0}</div>
              <div className="text-gray-500 text-base">Pending</div>
            </div>
            <div>
              <div className="text-xl font-bold">
                {orderStats.approved ?? 0}
              </div>
              <div className="text-gray-500 text-base">Approved</div>
            </div>
            <div>
              <div className="text-xl font-bold">
                {orderStats.rejected ?? 0}
              </div>
              <div className="text-gray-500 text-base">Rejected</div>
            </div>
          </div>
        ) : (
          <div className="text-gray-400">No order stats available.</div>
        )}
      </div>
    </div>
  );
};

export default Dashboard;
