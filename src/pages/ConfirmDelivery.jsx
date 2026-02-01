import React, { useEffect, useState } from "react";
import { HiCheck } from "react-icons/hi";
import { useAuth } from "../context/useAuth";
import { getConfirmDeliveries, updateConfirmDelivery } from "../api";
import Pagination from "../components/Pagination";
import NoDataFound from "../components/NoDataFound";

const DeliveryConfirmation = () => {
  const [confirmDeliveries, setConfirmDeliveries] = useState([]);
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
      fetchConfirmDeliveries(1, 10);
    }
  }, [user]);

  async function fetchConfirmDeliveries(page = 1, limit = 10) {
    setLoading(true);
    setError("");
    try {
      const res = await getConfirmDeliveries({ page, limit });
      setConfirmDeliveries(res.data.data.filter((o) => o.status === "pending"));
      setPagination(res.data.pagination);
    } catch {
      setError("Failed to load confirm deliveries");
    } finally {
      setLoading(false);
    }
  }

  async function handleConfirmDelivery(id) {
    try {
      await updateConfirmDelivery(id, {});
      fetchConfirmDeliveries();
    } catch {
      setError("Failed to approve order");
    } finally {
      //
    }
  }
  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <div className="flex flex-col">
          <h1 className="text-2xl font-semibold">Delivery Confirmation</h1>
          <span className="text-gray-500">Manage and confirm deliveries</span>
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
              <tr className="bg-white">
                <th className="py-3 px-4">No.</th>
                <th className="py-3 px-4">Order</th>
                <th className="py-3 px-4">Date</th>
                <th className="py-3 px-4">Status</th>
                {user?.permission?.permissions?.includes(
                  "update_confirm_delivery",
                ) ? (
                  <th className="py-3 px-4">Actions</th>
                ) : null}
              </tr>
            </thead>
            <tbody>
              {confirmDeliveries.map((d, index) => (
                <tr key={d._id}>
                  <td className="py-1 px-4">
                    {index + 1 + (pagination.page - 1) * pagination.limit}
                  </td>
                  <td className="py-1 px-4">{d.order}</td>
                  <td className="py-1 px-4">{d.date}</td>
                  <td className="py-1 px-4">
                    <span
                      className={`inline-block px-3 py-1 rounded-full text-sm font-semibold ${d.status === "Pending" ? "bg-yellow-100 text-yellow-700" : "bg-green-100 text-green-700"}`}
                    >
                      {d.status}
                    </span>
                  </td>
                  <td className="py-1 px-4">
                    {d.status === "Pending" &&
                      user?.permission?.permissions?.includes(
                        "update_confirm_delivery",
                      ) && (
                        <button
                          className="bg-[#0071e3] hover:bg-blue-700 text-white p-1 rounded-full cursor-pointer"
                          title="Confirm Delivery"
                          onClick={() => handleConfirmDelivery(d._id)}
                        >
                          <HiCheck className="w-4 h-4" />
                        </button>
                      )}
                  </td>
                </tr>
              ))}
              {confirmDeliveries.length === 0 && (
                <tr>
                  <td colSpan="5">
                    <NoDataFound message="No users found." />
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        )}
      </div>
      {confirmDeliveries.length > 0 && (
        <div className="flex justify-end mt-4">
          <Pagination
            total={pagination.totalItems}
            page={pagination.page}
            limit={pagination.limit}
            onChange={({ page, limit }) =>
              fetchConfirmDeliveries({ page, limit })
            }
          />
        </div>
      )}
    </div>
  );
};

export default DeliveryConfirmation;
