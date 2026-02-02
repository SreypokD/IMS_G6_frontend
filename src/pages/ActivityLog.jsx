import React, { useEffect, useState } from "react";
import { getActivityLogs } from "../api";
import Pagination from "../components/Pagination";
import { useAuth } from "../contexts/auth/useAuth";
import NoDataFound from "../components/NoDataFound";

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
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user]);

  async function fetchLogs(page = pagination.page, limit = pagination.limit) {
    setLoading(true);
    setError("");
    try {
      const res = await getActivityLogs({ page, limit });
      setLogs(res.data.data);
      setPagination((prev) => ({
        ...prev,
        ...res.data.pagination,
        page,
        limit,
      }));
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
                <th className="p-3">User</th>
                <th className="p-3">Entity Type</th>
                <th className="p-3">Details</th>
                <th className="p-3">Timestamp</th>
                <th className="p-3">Action</th>
              </tr>
            </thead>
            <tbody>
              {logs.map((log, index) => (
                <tr key={log._id}>
                  <td className="p-3">
                    {index + 1 + (pagination.page - 1) * pagination.limit}
                  </td>
                  <td className="p-3">
                    {log.user?.first_name + " " + log.user?.last_name || "-"}
                  </td>
                  <td className="p-3">{log.entity_type || "-"}</td>
                  <td className="p-3">{log.details || "-"}</td>
                  <td className="p-3">
                    {log.createdAt
                      ? new Date(log.createdAt).toLocaleString()
                      : "-"}
                  </td>
                  <td className="p-3">{log.action}</td>
                </tr>
              ))}
              {logs.length === 0 && (
                <tr>
                  <td colSpan="7">
                    <NoDataFound message="No activity logs found." />
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        )}
      </div>
      {logs.length > 0 && pagination && typeof pagination === "object" && (
        <div className="flex justify-end mt-4">
          <Pagination
            total={pagination.totalItems}
            page={pagination.page}
            limit={pagination.limit}
            onChange={({ page, limit }) => {
              setPagination((prev) => ({ ...prev, page, limit }));
              fetchLogs(page, limit);
            }}
          />
        </div>
      )}
    </div>
  );
};

export default ActivityLog;
