import React, { useEffect, useState } from "react";
import { getInventorySummary, getOrderStats } from "../api";
import {
  HiCube,
  HiClipboardList,
  HiExclamation,
  HiUserGroup,
  HiChartBar,
} from "react-icons/hi";
import { useAuth } from "../contexts/auth/useAuth";

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
        console.log(summaryRes.data);

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
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-white rounded-xl p-6 flex items-center gap-4 border border-gray-200 transition-all duration-300 hover:scale-101">
          <HiCube className="text-3xl text-blue-700" />
          <div>
            <div className="text-2xl font-bold">
              {summary?.totalProducts ?? "-"}
            </div>
            <div className="text-gray-500 text-base">Products</div>
          </div>
        </div>
        <div className="bg-white rounded-xl p-6 flex items-center gap-4 border border-gray-200 transition-all duration-300 hover:scale-101">
          <HiUserGroup className="text-3xl text-green-600" />
          <div>
            <div className="text-2xl font-bold">
              {summary?.totalSuppliers ?? "-"}
            </div>
            <div className="text-gray-500 text-base">Suppliers</div>
          </div>
        </div>
        <div className="bg-white rounded-xl p-6 flex items-center gap-4 border border-gray-200 transition-all duration-300 hover:scale-101">
          <HiExclamation className="text-3xl text-orange-600" />
          <div>
            <div className="text-2xl font-bold">{summary?.lowStock ?? "-"}</div>
            <div className="text-gray-500 text-base">Low Stock</div>
          </div>
        </div>
        <div className="bg-white rounded-xl p-6 flex items-center gap-4 border border-gray-200 transition-all duration-300 hover:scale-101">
          <HiClipboardList className="text-3xl text-purple-700" />
          <div>
            <div className="text-2xl font-bold">
              {orderStats?.pending ?? "-"}
            </div>
            <div className="text-gray-500 text-base">Pending Orders</div>
          </div>
        </div>
      </div>
      {/* Add more dashboard widgets/charts here as needed */}
      <div className="bg-white rounded-2xl p-6 border border-gray-200 mt-4">
        <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
          <HiChartBar className="text-blue-700" /> Order Statistics
        </h2>
        {orderStats ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-6">
            <div>
              <div className="text-xl font-bold">
                {orderStats.pending ?? "-"}
              </div>
              <div className="text-gray-500 text-base">Pending</div>
            </div>
            <div>
              <div className="text-xl font-bold">
                {orderStats.approved ?? "-"}
              </div>
              <div className="text-gray-500 text-base">Approved</div>
            </div>
            <div>
              <div className="text-xl font-bold">
                {orderStats.rejected ?? "-"}
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
