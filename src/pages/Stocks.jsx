import React, { useState } from "react";
import { Listbox } from "@headlessui/react";
import { HiSelector } from "react-icons/hi";

import {
  HiDownload,
  HiLogout,
  HiOutlineUpload,
  HiOutlineDownload,
} from "react-icons/hi";

// Custom dropdowns for Stock page
const statusOptions = ["All Status", "In Stock", "Out of Stock", "Low Stock"];
const locationOptions = [
  "All Locations",
  "Warehouse 1",
  "Warehouse 2",
  "Storefront",
];

function StockStatusDropdown() {
  const [selected, setSelected] = useState(statusOptions[0]);
  return (
    <Listbox value={selected} onChange={setSelected}>
      <div className="relative">
        <Listbox.Button className="cursor-pointer w-full bg-gray-50 border border-gray-200 rounded-lg px-3 py-2 text-left text-gray-800 flex items-center justify-between">
          <span>{selected}</span>
          <HiSelector className="w-5 h-5 text-gray-400 ml-2" />
        </Listbox.Button>
        <Listbox.Options className="absolute z-10 mt-1 w-full bg-white border border-gray-200 rounded-lg shadow-lg max-h-60 overflow-auto focus:outline-none">
          {statusOptions.map((option) => (
            <Listbox.Option
              key={option}
              value={option}
              className={({ active, selected }) =>
                `px-4 py-2 cursor-pointer ${active ? "text-[#64748b] hover:bg-[#f1f5f9] hover:text-black" : "text-gray-900"} ${selected ? "font-semibold bg-blue-50" : ""}`
              }
            >
              {option}
            </Listbox.Option>
          ))}
        </Listbox.Options>
      </div>
    </Listbox>
  );
}

function StockLocationDropdown() {
  const [selected, setSelected] = useState(locationOptions[0]);
  return (
    <Listbox value={selected} onChange={setSelected}>
      <div className="relative">
        <Listbox.Button className="cursor-pointer w-full bg-gray-50 border border-gray-200 rounded-lg px-3 py-2 text-left text-gray-800 flex items-center justify-between">
          <span>{selected}</span>
          <HiSelector className="w-5 h-5 text-gray-400 ml-2" />
        </Listbox.Button>
        <Listbox.Options className="absolute z-10 mt-1 w-full bg-white border border-gray-200 rounded-lg shadow-lg max-h-60 overflow-auto focus:outline-none">
          {locationOptions.map((option) => (
            <Listbox.Option
              key={option}
              value={option}
              className={({ active, selected }) =>
                `px-4 py-2 cursor-pointer ${active ? "text-[#64748b] hover:bg-[#f1f5f9] hover:text-black" : "text-gray-900"} ${selected ? "font-semibold bg-blue-50" : ""}`
              }
            >
              {option}
            </Listbox.Option>
          ))}
        </Listbox.Options>
      </div>
    </Listbox>
  );
}

const Stocks = () => {
  return (
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
            className="bg-gray-50 border border-gray-200 rounded-lg py-2 px-4 text-gray-700 min-w-0 w-full"
            placeholder="Search..."
          />
          <StockStatusDropdown />
          <StockLocationDropdown />
        </div>
      </div>
    </div>
  );
};

export default Stocks;
