import React, { useEffect, useState } from "react";
import { getActivityLogs } from "../api";

const ActivityLog = () => {
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    fetchLogs();
  }, []);

  async function fetchLogs() {
    setLoading(true);
    setError("");
    try {
      const res = await getActivityLogs();
      setLogs(res.data.data);
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
                  <td className="py-3 px-4">{idx + 1}</td>
                  <td className="py-3 px-4">{log.user_id}</td>
                  <td className="py-3 px-4">{log.action}</td>
                  <td className="py-3 px-4">{log.entity_type || "-"}</td>
                  <td className="py-3 px-4">{log.entity_id || "-"}</td>
                  <td className="py-3 px-4">{log.details || "-"}</td>
                  <td className="py-3 px-4">
                    {log.createdAt
                      ? new Date(log.createdAt).toLocaleString()
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

export default ActivityLog;
