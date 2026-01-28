import React, { useEffect, useState } from "react";
import { HiOutlinePlus, HiOutlinePencil, HiOutlineTrash } from "react-icons/hi";
import {
  getSuppliers,
  createSupplier,
  updateSupplier,
  deleteSupplier,
} from "../api";

import SupplierModal from "../components/SupplierModal";

const Suppliers = () => {
  const [suppliers, setSuppliers] = useState([]);
  const [modalOpen, setModalOpen] = useState(false);
  const [editSupplier, setEditSupplier] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchSuppliers();
  }, []);

  // Fetch suppliers from API
  async function fetchSuppliers() {
    setLoading(true);
    try {
      const res = await getSuppliers();
      setSuppliers(res.data.data);
    } finally {
      setLoading(false);
    }
  }

  // Save supplier (create or update)
  async function handleSave(supplier) {
    setLoading(true);
    try {
      if (editSupplier) {
        await updateSupplier(editSupplier._id, supplier);
      } else {
        await createSupplier(supplier);
      }
      fetchSuppliers();
      setModalOpen(false);
      setEditSupplier(null);
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
        fetchSuppliers();
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
        <button
          className="bg-[#1e3a5f] hover:bg-[#16375b] text-white px-5 py-2 rounded-xl transition flex items-center gap-2 cursor-pointer"
          onClick={() => {
            setEditSupplier(null);
            setModalOpen(true);
          }}
        >
          <HiOutlinePlus className="text-md" /> Add Supplier
        </button>
      </div>
      <div className="bg-white rounded-xl p-6 mb-6 border border-gray-200">
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
          <input
            className="bg-gray-50 border border-gray-200 rounded-lg py-3 px-4 text-gray-700 min-w-0 w-full"
            placeholder="Search..."
          />
          <select className="bg-gray-50 border border-gray-200 rounded-lg py-3 px-4 text-gray-700 min-w-0 w-full">
            <option>All Status</option>
          </select>
          <select className="bg-gray-50 border border-gray-200 rounded-lg py-3 px-4 text-gray-700 min-w-0 w-full">
            <option>All Locations</option>
          </select>
        </div>
      </div>
      <div className="bg-white rounded-xl overflow-x-auto border border-gray-200">
        {loading ? (
          <div className="p-8 text-center text-gray-500">Loading...</div>
        ) : (
          <table className="min-w-full text-left text-sm align-middle">
            <thead>
              <tr className="bg-white">
                <th className="py-3 px-4">No.</th>
                <th className="py-3 px-4">Name</th>
                <th className="py-3 px-4">Contact</th>
                <th className="py-3 px-4">Phone</th>
                <th className="py-3 px-4">Actions</th>
              </tr>
            </thead>
            <tbody>
              {suppliers.map((s, index) => (
                <tr key={s._id} className="border-t border-gray-200">
                  <td className="py-3 px-4 text-left">{index + 1}</td>
                  <td className="py-3 px-4 text-left">{s.name}</td>
                  <td className="py-3 px-4 text-left">{s.contact}</td>
                  <td className="py-3 px-4 text-left">{s.phone}</td>
                  <td className="py-3 px-4 whitespace-nowrap flex items-left gap-3 ">
                    <button
                      className="text-[#1e3a5f] font-semibold cursor-pointer"
                      title="Edit"
                      onClick={() => {
                        setEditSupplier(s);
                        setModalOpen(true);
                      }}
                    >
                      <HiOutlinePencil className="text-xl" />
                    </button>
                    <button
                      className="text-red-600 font-semibold cursor-pointer"
                      title="Delete"
                      onClick={() => handleDelete(s._id)}
                    >
                      <HiOutlineTrash className="text-xl" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
};

export default Suppliers;
