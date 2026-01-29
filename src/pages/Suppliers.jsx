import React, { useEffect, useState } from "react";
import { Listbox } from "@headlessui/react";
import { HiSelector } from "react-icons/hi";
import {
  HiOutlinePlus,
  HiOutlinePencil,
  HiOutlineTrash,
  HiOutlineBuildingOffice2,
  HiOutlineCube,
  HiOutlineEye,
} from "react-icons/hi2";
import {
  getSuppliers,
  createSupplier,
  updateSupplier,
  deleteSupplier,
} from "../api";
import SupplierModal from "../components/SupplierModal";
import { useAuth } from "../context/useAuth";
import Pagination from "../components/Pagination";

// Custom dropdowns for Suppliers page
const statusOptions = ["All Status", "Active", "Inactive"];
const locationOptions = [
  "All Locations",
  "Warehouse 1",
  "Warehouse 2",
  "Storefront",
];

function SupplierStatusDropdown() {
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

function SupplierLocationDropdown() {
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

const Suppliers = () => {
  const [suppliers, setSuppliers] = useState([]);
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 10,
    totalItems: 0,
    totalPages: 1,
  });
  const [modalOpen, setModalOpen] = useState(false);
  const [editSupplier, setEditSupplier] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const { user } = useAuth();

  useEffect(() => {
    if (user) {
      fetchSuppliers(1, 10);
    }
  }, [user]);

  // Fetch suppliers from API
  async function fetchSuppliers(page = 1, limit = 10) {
    setLoading(true);
    setError("");
    try {
      const res = await getSuppliers({ page, limit });
      setSuppliers(res.data.data);
      setPagination(res.data.pagination);
    } catch {
      setError("Failed to load suppliers");
    } finally {
      setLoading(false);
    }
  }

  // Save supplier (create or update)
  async function handleSave(supplier) {
    setLoading(true);
    setError("");
    try {
      if (editSupplier) {
        await updateSupplier(editSupplier._id, supplier);
      } else {
        await createSupplier(supplier);
      }
      fetchSuppliers(pagination.page, pagination.limit);
      setModalOpen(false);
      setEditSupplier(null);
    } catch {
      setError("Failed to save supplier");
    } finally {
      setLoading(false);
    }
  }

  // Delete supplier
  async function handleDelete(id) {
    if (window.confirm("Delete this supplier?")) {
      setLoading(true);
      try {
        await deleteSupplier(id);
        fetchSuppliers(pagination.page, pagination.limit);
      } catch {
        setError("Failed to delete supplier");
      } finally {
        setLoading(false);
      }
    }
  }

  return (
    <div>
      <SupplierModal
        key={modalOpen ? (editSupplier ? editSupplier._id : "new") : "closed"}
        open={modalOpen}
        onClose={() => {
          setModalOpen(false);
          setEditSupplier(null);
        }}
        onSave={handleSave}
        initial={editSupplier}
      />
      <div className="flex items-center justify-between mb-8">
        <div className="flex flex-col">
          <h1 className="text-2xl font-semibold">Supplier Management</h1>
          <span className="text-gray-500">
            Manage vendor relationships and product associations
          </span>
        </div>
        {user?.permission?.permissions?.includes("create_supplier") && (
          <button
            className="bg-[#1e3a5f] hover:bg-[#16375b] text-white px-5 py-2 rounded-xl transition flex items-center gap-2 cursor-pointer"
            onClick={() => {
              setEditSupplier(null);
              setModalOpen(true);
            }}
          >
            <HiOutlinePlus className="text-md" /> Add Supplier
          </button>
        )}
      </div>
      <div className="bg-white rounded-xl p-6 mb-6 border border-gray-200">
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
          <input
            className="bg-gray-50 border border-gray-200 rounded-lg py-2 px-4 text-gray-700 min-w-0 w-full"
            placeholder="Search..."
          />
          <SupplierStatusDropdown />
          <SupplierLocationDropdown />
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
                <th className="py-3 px-4">Company Name</th>
                <th className="py-3 px-4">Contact Person</th>
                <th className="py-3 px-4">Email</th>
                <th className="py-3 px-4">Phone</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4">Products</th>
                {user?.permission?.permissions?.includes("update_supplier") ||
                user?.permission?.permissions?.includes("delete_supplier") ? (
                  <th className="py-3 px-4">Actions</th>
                ) : null}
              </tr>
            </thead>
            <tbody>
              {suppliers.map((s, index) => (
                <tr key={s._id} className="border-t border-gray-200">
                  <td className="py-1 px-4">{index + 1}</td>
                  <td className="py-1 px-4">
                    <div className="flex items-center gap-2">
                      <HiOutlineBuildingOffice2 className="text-lg text-blue-700" />
                      <div className="font-semibold text-base text-[#1e3a5f]">
                        {s.company_name}
                      </div>
                      <div className="text-xs text-gray-500">
                        ({s.location})
                      </div>
                    </div>
                  </td>
                  <td className="py-1 px-4 flex items-center gap-1">
                    <div className="font-medium text-gray-900">
                      {s.contact_person}
                    </div>
                    <div className="text-xs text-gray-500">
                      ({s.contact_position})
                    </div>
                  </td>
                  <td className="py-1 px-4">{s.contact_email}</td>
                  <td className="py-1 px-4">{s.contact_phone}</td>
                  <td className="py-1 px-4">
                    <span
                      className={
                        s.status === "Active"
                          ? "text-green-600 font-semibold flex items-center gap-1"
                          : "text-gray-400 font-semibold flex items-center gap-1"
                      }
                    >
                      <span
                        className="inline-block w-2 h-2 rounded-full mr-1"
                        style={{
                          background:
                            s.status === "Active" ? "#22c55e" : "#d1d5db",
                        }}
                      ></span>
                      {s.status}
                    </span>
                  </td>
                  <td className="py-1 px-4">
                    <span className="flex items-center gap-2">
                      <HiOutlineCube className="text-base text-gray-500" />
                      <span>
                        {typeof s.products_count === "number"
                          ? s.products_count
                          : 0}
                      </span>
                    </span>
                  </td>
                  <td className="py-1 px-4 flex items-center gap-1">
                    <button
                      className="text-[#1e3a5f] font-semibold cursor-pointer p-2 rounded-full hover:bg-[#f1f5f9]"
                      title="View"
                    >
                      <HiOutlineEye className="text-xl" />
                    </button>
                    {user?.permission?.permissions?.includes(
                      "update_supplier",
                    ) && (
                      <button
                        className="text-[#1e3a5f] font-semibold cursor-pointer p-2 rounded-full hover:bg-[#f1f5f9]"
                        title="Edit"
                        onClick={() => {
                          setEditSupplier(s);
                          setModalOpen(true);
                        }}
                      >
                        <HiOutlinePencil className="text-xl" />
                      </button>
                    )}
                    {user?.permission?.permissions?.includes(
                      "delete_supplier",
                    ) && (
                      <button
                        className="text-red-600 font-semibold cursor-pointer p-2 rounded-full hover:bg-[#f1f5f9]"
                        title="Delete"
                        onClick={() => handleDelete(s._id)}
                      >
                        <HiOutlineTrash className="text-xl" />
                      </button>
                    )}
                  </td>
                </tr>
              ))}{" "}
              {suppliers.length === 0 && (
                <tr className="border-t border-gray-200">
                  <td colSpan="7" className="py-4 text-center text-gray-500">
                    No suppliers found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        )}
      </div>
      {suppliers.length > 0 && (
        <div className="flex justify-end mt-4">
          <Pagination
            total={pagination.totalItems}
            page={pagination.page}
            limit={pagination.limit}
            onChange={({ page, limit }) => fetchSuppliers({page, limit})}
          />
        </div>
      )}
    </div>
  );
};

export default Suppliers;
