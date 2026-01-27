import React from "react";
import { HiOutlinePlus, HiOutlinePencil, HiOutlineTrash } from "react-icons/hi";

const Categories = () => {
  // Placeholder data
  const categories = [
    { id: 1, name: "Grains", description: "Rice, wheat, oats, etc." },
    { id: 2, name: "Spreads", description: "Nut butters, jams, etc." },
    { id: 3, name: "Beverages", description: "Tea, coffee, juices, etc." },
  ];
  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <div className="flex flex-col">
          <h1 className="text-2xl font-semibold">Categories Management</h1>
          <span className="text-gray-500">
            Organize and manage product categories
          </span>
        </div>
        <button className="bg-[#1e3a5f] hover:bg-[#16375b] text-white px-5 py-2 rounded-xl transition flex items-center gap-2 cursor-pointer">
          <HiOutlinePlus className="text-md" /> Create
        </button>
      </div>
      <div className="bg-white rounded-xl p-6 mb-6 border border-gray-200">
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
          <input
            className="bg-gray-50 border border-gray-200 rounded-lg px-4 py-2 text-gray-700 min-w-0 w-full"
            placeholder="Search..."
          />
          <select className="bg-gray-50 border border-gray-200 rounded-lg px-4 py-2 text-gray-700 min-w-0 w-full">
            <option>All Status</option>
          </select>
          <select className="bg-gray-50 border border-gray-200 rounded-lg px-4 py-2 text-gray-700 min-w-0 w-full">
            <option>All Locations</option>
          </select>
        </div>
      </div>
      <div className="bg-white rounded-xl overflow-x-auto border border-gray-200">
        <table className="min-w-full text-sm align-middle">
          <thead>
            <tr className="bg-white text-gray-700">
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
                Name
              </th>
              <th className="py-3 px-4 font-semibold text-left whitespace-nowrap">
                Description
              </th>
              <th className="py-3 px-4 font-semibold text-left whitespace-nowrap">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {categories.map((cat, index) => (
              <tr key={cat._id}>
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
                <td className="py-3 px-4 font-semibold text-gray-900 whitespace-nowrap">
                  {cat.name}
                </td>
                <td className="py-3 px-4 text-gray-700 whitespace-nowrap">
                  {cat.description}
                </td>
                <td className="py-3 px-4 whitespace-nowrap flex items-center gap-3 ">
                  <button
                    className="text-blue-600 hover:text-blue-800 font-semibold cursor-pointer"
                    title="Edit"
                  >
                    <HiOutlinePencil className="text-xl" />
                  </button>
                  <button
                    className="text-red-600 hover:text-red-800 font-semibold cursor-pointer"
                    title="Delete"
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

export default Categories;
