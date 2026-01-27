import React from "react";

import {
  HiDownload,
  HiLogout,
  HiOutlineUpload,
  HiOutlineDownload,
} from "react-icons/hi";

const Stocks = () => (
  <div>
    <div className="flex items-center justify-between mb-8">
      <div className="flex flex-col">
        <h1 className="text-2xl font-semibold">Stock Management</h1>
        <span className="text-gray-500">
          Track and manage inventory movements with real-time updates
        </span>
      </div>
      <div className="flex items-center gap-3">
        <span className="flex items-center text-black px-5 py-2 gap-2 cursor-pointer">
          <HiOutlineUpload className="text-md" /> Bulk Import
        </span>
        <span className="flex items-center text-black px-5 py-2 gap-2 cursor-pointer">
          <HiOutlineDownload className="text-md" /> Export
        </span>
        <button className="bg-red-600 hover:bg-red-700 text-white px-5 py-2 rounded-xl transition flex items-center gap-2 cursor-pointer">
          <HiLogout className="text-md rotate-270" /> Stock Out
        </button>
        <button className="bg-green-700 hover:bg-green-800 text-white px-5 py-2 rounded-xl transition flex items-center gap-2 cursor-pointer">
          <HiDownload className="text-md" /> Stock In
        </button>
      </div>
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
  </div>
);

export default Stocks;
