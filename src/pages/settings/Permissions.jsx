import React from "react";

import PermissionForm from "./PermissionForm.jsx";
import { useNavigate } from "react-router-dom";
import { HiOutlinePencil, HiOutlineTrash, HiOutlinePlus } from "react-icons/hi";

// Mock permission list for demo
const mockPermissions = [
  {
    id: 1,
    name: "View Products",
    key: "view_product",
    description: "Can view products",
  },
  {
    id: 2,
    name: "Create Product",
    key: "create_product",
    description: "Can create new products",
  },
  {
    id: 3,
    name: "Update Product",
    key: "update_product",
    description: "Can update products",
  },
  {
    id: 4,
    name: "Delete Product",
    key: "delete_product",
    description: "Can delete products",
  },
  // ...add more as needed
];

const Permissions = () => {
  const navigate = useNavigate();
  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <div className="flex flex-col">
          <h1 className="text-2xl font-semibold">Permissions</h1>
          <span className="text-gray-500">Manage permissions</span>
        </div>
        <button
          className="bg-[#1e3a5f] hover:bg-[#16375b] text-white px-5 py-2 rounded-xl transition flex items-center gap-2 cursor-pointer"
          onClick={() => navigate("/settings/permissions/new")}
        >
          <HiOutlinePlus className="text-md" /> Create
        </button>
      </div>
      <div className="bg-white rounded-xl p-6 mb-6 border border-gray-200">
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
          <input
            className="bg-gray-50 border border-gray-200 rounded-lg px-4 py-2 text-gray-700 min-w-0 w-full"
            placeholder="Search..."
          />
        </div>
      </div>
      <div className="bg-white rounded-xl overflow-x-auto border border-gray-200">
        <table className="min-w-full text-sm align-middle">
          <thead>
            <tr className="bg-white text-gray-700">
              <th className="py-3 px-4 font-semibold text-left whitespace-nowrap">
                No.
              </th>
              <th className="py-3 px-4 font-semibold text-left whitespace-nowrap">
                Name
              </th>
              <th className="py-3 px-4 font-semibold text-left whitespace-nowrap">
                Description
              </th>
              <th className="py-3 px-4 font-semibold text-left whitespace-nowrap">
                Action
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {mockPermissions.map((perm, index) => (
              <tr key={perm._id} className="hover:bg-blue-50 transition group">
                <td className="py-3 px-4 font-semibold text-gray-900 whitespace-nowrap">
                  {index + 1}
                </td>
                <td className="py-3 px-4 font-semibold text-gray-900 whitespace-nowrap">
                  {perm.name}
                </td>
                <td className="py-3 px-4 text-gray-700 whitespace-nowrap">
                  {perm.description}
                </td>
                <td className="py-3 px-4 whitespace-nowrap flex items-center gap-3 ">
                  <button
                    className="text-blue-600 hover:text-blue-800 font-semibold cursor-pointer"
                    title="Edit"
                    onClick={() =>
                      navigate(`/settings/permissions/edit/${perm._id}`)
                    }
                  >
                    <HiOutlinePencil className="text-xl" />
                  </button>
                  <button
                    className="text-red-600 hover:text-red-800 font-semibold cursor-pointer"
                    title="Delete"
                    onClick={() =>
                      alert("Delete functionality not implemented")
                    }
                  >
                    <HiOutlineTrash className="text-xl" />
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

export default Permissions;
