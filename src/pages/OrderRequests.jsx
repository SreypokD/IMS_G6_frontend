import { useNavigate } from "react-router-dom";
import { HiOutlinePlus } from "react-icons/hi";

const OrderRequests = () => {
  const navigate = useNavigate();
  // Placeholder data
  const requests = [
    { id: 1, requester: "Staff A", status: "Pending", date: "2026-01-25" },
    { id: 2, requester: "Staff B", status: "Approved", date: "2026-01-24" },
  ];
  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <div className="flex flex-col">
          <h1 className="text-2xl font-semibold">Order Management</h1>
          <span className="text-gray-500">Manage and track order requests</span>
        </div>
        <button
          className="bg-[#1e3a5f] hover:bg-[#16375b] text-white px-5 py-2 rounded-xl transition flex items-center gap-2 cursor-pointer"
          onClick={() => navigate("/order-requests/new")}
        >
          <HiOutlinePlus className="text-md" /> Add Request
        </button>
      </div>
      <div className="bg-white rounded-xl overflow-x-auto border border-gray-200">
        <table className="min-w-full text-sm align-middle">
          <thead>
            <tr>
              <th className="py-3 px-4 font-semibold text-left w-8">
                <input
                  type="checkbox"
                  className="accent-blue-600 w-4 h-4"
                  disabled
                />
              </th>
              <th className="py-3 px-4 font-semibold text-left whitespace-nowrap">
                No.
              </th>
              <th className="py-3 px-4 font-semibold text-left whitespace-nowrap">
                Requester
              </th>
              <th className="py-3 px-4 font-semibold text-left whitespace-nowrap">
                Status
              </th>
              <th className="py-3 px-4 font-semibold text-left whitespace-nowrap">
                Date
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {requests.map((req, index) => (
              <tr key={req._id}>
                <td className="py-3 px-4 text-center">
                  <input
                    type="checkbox"
                    className="accent-blue-600 w-4 h-4"
                    disabled
                  />
                </td>
                <td className="py-3 px-4 font-semibold text-gray-800 whitespace-nowrap">
                  {index + 1}
                </td>
                <td className="py-3 px-4 text-gray-700 whitespace-nowrap">
                  {req.requester}
                </td>
                <td className="py-3 px-4 whitespace-nowrap">
                  <span
                    className={`inline-block px-3 py-1 rounded-full text-xs font-semibold ${req.status === "Pending" ? "bg-yellow-100 text-yellow-700" : "bg-green-100 text-green-700"}`}
                  >
                    {req.status}
                  </span>
                </td>
                <td className="py-3 px-4 text-gray-500 whitespace-nowrap">
                  {req.date}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default OrderRequests;
