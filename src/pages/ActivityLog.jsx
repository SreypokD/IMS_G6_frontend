import React, { useEffect, useState } from "react";
import { getActivityLogs } from "../api";
import Pagination from "../components/Pagination";
import { useAuth } from "../context/useAuth";

const ActivityLog = () => {
  const [logs, setLogs] = useState([]);
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
      fetchLogs(1, 10);
    }
  }, [user]);

  async function fetchLogs(page = 1, limit = 10) {
    setLoading(true);
    setError("");
    try {
      const res = await getActivityLogs({ page, limit });
      setLogs(res.data.data);
      setPagination(res.data.pagination);
    } catch {
      setError("Failed to load activity logs");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <div className="flex flex-col">
          <h1 className="text-2xl font-semibold">Activity Log</h1>
          <span className="text-gray-500">View and manage activity logs</span>
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
                <th className="py-3 px-4">User ID</th>
                <th className="py-3 px-4">Action</th>
                <th className="py-3 px-4">Entity Type</th>
                <th className="py-3 px-4">Entity ID</th>
                <th className="py-3 px-4">Details</th>
                <th className="py-3 px-4">Timestamp</th>
              </tr>
            </thead>
            <tbody>
              {logs.map((log, idx) => (
                <tr key={log._id} className="border-t border-gray-200">
                  <td className="py-1 px-4">{idx + 1}</td>
                  <td className="py-1 px-4">{log.user_id}</td>
                  <td className="py-1 px-4">{log.action}</td>
                  <td className="py-1 px-4">{log.entity_type || "-"}</td>
                  <td className="py-1 px-4">{log.entity_id || "-"}</td>
                  <td className="py-1 px-4">{log.details || "-"}</td>
                  <td className="py-1 px-4">
                    {log.createdAt
                      ? new Date(log.createdAt).toLocaleString()
                      : "-"}
                  </td>
                </tr>
              ))}
              {logs.length === 0 && (
                <tr className="border-t border-gray-200">
                  <td colSpan="7" className="py-4 text-center text-gray-500">
                    No activity logs found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        )}
      </div>
      {logs.length > 0 && (
        <div className="flex justify-end mt-6">
          <Pagination
            total={pagination.totalItems}
            page={pagination.page}
            limit={pagination.limit}
            onChange={({ page, limit }) => fetchLogs({page, limit})}
          />
        </div>
      )}
    </div>
  );
};

export default ActivityLog;
