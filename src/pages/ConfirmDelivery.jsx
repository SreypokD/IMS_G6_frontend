import React, { useEffect, useState } from "react";
import { HiCheck } from "react-icons/hi";
import { useAuth } from "../context/useAuth";
import { getConfirmDeliveries, updateConfirmDelivery } from "../api";

const DeliveryConfirmation = () => {
  const [confirmDeliveries, setConfirmDeliveries] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const { user } = useAuth();

  useEffect(() => {
    if (user) {
      fetchConfirmDeliveries();
    }
  }, [user]);

  if (!user || user.role !== "admin") {
    return <div className="text-red-600">Access denied. Admins only.</div>;
  }

  async function fetchConfirmDeliveries() {
    setLoading(true);
    setError("");
    try {
      const res = await getConfirmDeliveries();
      setConfirmDeliveries(res.data.data.filter((o) => o.status === "pending"));
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
      {loading ? (
        <div>Loading...</div>
      ) : error ? (
        <div className="text-red-600">{error}</div>
      ) : (
        <div className="bg-white rounded-xl overflow-x-auto border border-gray-200">
          <table className="min-w-full text-left text-sm align-middle">
            <thead>
              <tr className="bg-white">
                <th className="py-3 px-4">No.</th>
                <th className="py-3 px-4">Order</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4">Date</th>
                {user?.permission?.permissions?.includes(
                  "update_confirm_delivery",
                ) ? (
                  <th className="py-3 px-4">Actions</th>
                ) : null}
              </tr>
            </thead>
            <tbody>
              {confirmDeliveries.map((d, index) => (
                <tr key={d._id} className="border-t border-gray-200">
                  <td className="py-3 px-4">{index + 1}</td>
                  <td className="py-3 px-4">{d.order}</td>
                  <td className="py-3 px-4">
                    <span
                      className={`inline-block px-3 py-1 rounded-full text-xs font-semibold ${d.status === "Pending" ? "bg-yellow-100 text-yellow-700" : "bg-green-100 text-green-700"}`}
                    >
                      {d.status}
                    </span>
                  </td>
                  <td className="py-3 px-4">{d.date}</td>
                  <td className="py-3 px-4">
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
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default DeliveryConfirmation;
