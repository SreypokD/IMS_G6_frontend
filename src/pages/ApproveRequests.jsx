import { HiOutlineCheckCircle, HiOutlineXCircle } from "react-icons/hi";

const OrderRequestApproval = () => {
  // Placeholder data
  const approvals = [
    { id: 1, requester: "Staff A", status: "Pending", date: "2026-01-25" },
    { id: 2, requester: "Staff B", status: "Pending", date: "2026-01-24" },
  ];
  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <div className="flex flex-col">
          <h1 className="text-2xl font-semibold">Order Request Approvals</h1>
          <span className="text-gray-500">
            Review and manage order request approvals
          </span>
        </div>
      </div>
      <div className="bg-white rounded-xl overflow-x-auto border border-gray-200">
        <table className="min-w-full text-left text-sm align-middle">
          <thead>
            <tr className="bg-white">
              <th className="py-3 px-4">No.</th>
              <th className="py-3 px-4">Requester</th>
              <th className="py-3 px-4">Status</th>
              <th className="py-3 px-4">Date</th>
              <th className="py-3 px-4">Action</th>
            </tr>
          </thead>
          <tbody>
            {approvals.map((req, index) => (
              <tr key={req._id} className="border-t border-gray-200">
                <td className="py-3 px-4">{index + 1}</td>
                <td className="py-3 px-4">{req.requester}</td>
                <td className="py-3 px-4">
                  <span className="inline-block px-3 py-1 rounded-full text-xs font-semibold bg-yellow-100 text-yellow-700">
                    {req.status}
                  </span>
                </td>
                <td className="py-3 px-4">{req.date}</td>
                <td className="py-3 px-4 text-left">
                  <button
                    className="text-green-600 hover:text-green-700 rounded-full cursor-pointer"
                    title="Approve"
                  >
                    <HiOutlineCheckCircle className="w-8 h-8" />
                  </button>
                  <button
                    className="text-red-500 hover:text-red-600 rounded-full cursor-pointer"
                    title="Reject"
                  >
                    <HiOutlineXCircle className="w-8 h-8" />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default OrderRequestApproval;
