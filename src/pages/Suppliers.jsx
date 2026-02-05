import React, { useEffect, useState } from "react";
import { Listbox } from "@headlessui/react";
import {
  HiOutlinePlus,
  HiOutlinePencil,
  HiOutlineTrash,
  HiOutlineBuildingOffice2,
  HiOutlineCube,
  HiOutlineEye,
} from "react-icons/hi2";
import { HiSelector, HiOutlineFilter } from "react-icons/hi";
import {
  getSuppliers,
  createSupplier,
  updateSupplier,
  deleteSupplier,
} from "../api";
import { useDialog } from "../contexts/dialog/useDialog";
import SupplierModal from "../components/SupplierModal";
import { useAuth } from "../contexts/auth/useAuth";
import Pagination from "../components/Pagination";
import NoDataFound from "../components/NoDataFound";

// Custom dropdowns for Suppliers page
const statusOptions = ["Active", "Inactive"];
const locationOptions = ["Warehouse 1", "Warehouse 2", "Storefront"];

// Dropdowns now accept value and onChange from parent
function StatusDropdown({ value, onChange }) {
  return (
    <Listbox value={value} onChange={onChange}>
      <div className="relative">
        <Listbox.Button className="cursor-pointer w-full bg-gray-50 border border-gray-200 rounded-lg px-3 py-2 text-left text-gray-800 flex items-center justify-between">
          <span>{value || "All Statuses"}</span>
          <HiSelector className="w-5 h-5 text-gray-400 ml-2" />
        </Listbox.Button>
        <Listbox.Options className="absolute z-10 mt-1 w-full bg-white border border-gray-200 rounded-lg shadow-lg max-h-60 overflow-auto focus:outline-none">
          <Listbox.Option
            className="px-4 py-2 cursor-pointer text-black hover:bg-[#f1f5f9]"
            value=""
          >
            <span>All Statuses</span>
          </Listbox.Option>
          {statusOptions.map((option) => (
            <Listbox.Option
              key={option}
              value={option}
              className={({ selected }) =>
                `px-4 py-2 cursor-pointer text-black hover:bg-[#f1f5f9] ${selected ? "bg-blue-50" : ""}`
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

function LocationDropdown({ value, onChange }) {
  return (
    <Listbox value={value} onChange={onChange}>
      <div className="relative">
        <Listbox.Button className="cursor-pointer w-full bg-gray-50 border border-gray-200 rounded-lg px-3 py-2 text-left text-gray-800 flex items-center justify-between">
          <span>{value || "All Locations"}</span>
          <HiSelector className="w-5 h-5 text-gray-400 ml-2" />
        </Listbox.Button>
        <Listbox.Options className="absolute z-10 mt-1 w-full bg-white border border-gray-200 rounded-lg shadow-lg max-h-60 overflow-auto focus:outline-none">
          <Listbox.Option
            className="px-4 py-2 cursor-pointer text-black hover:bg-[#f1f5f9]"
            value=""
          >
            <span>All Locations</span>
          </Listbox.Option>
          {locationOptions.map((option) => (
            <Listbox.Option
              key={option}
              value={option}
              className={({ selected }) =>
                `px-4 py-2 cursor-pointer text-black hover:bg-[#f1f5f9] ${selected ? "bg-blue-50" : ""}`
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
  const [viewSupplier, setViewSupplier] = useState(null);
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
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("");
  const [location, setLocation] = useState("");
  const dialog = useDialog();
  const { user } = useAuth();

  useEffect(() => {
    if (user) {
      fetchSuppliers(
        pagination.page,
        pagination.limit,
        search,
        status,
        location,
      );
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user, pagination.page, pagination.limit, search, status, location]);

  // Fetch suppliers from API
  async function fetchSuppliers(
    page = pagination.page,
    limit = pagination.limit,
    searchVal = search,
    statusVal = status,
    locationVal = location,
  ) {
    setLoading(true);
    setError("");
    try {
      const params = { page, limit };
      if (searchVal) params.search = searchVal;
      if (statusVal) params.status = statusVal;
      if (locationVal) params.location = locationVal;
      const res = await getSuppliers(params);
      setSuppliers(res.data.data);
      setPagination((prev) => ({
        ...prev,
        ...res.data.pagination,
        page,
        limit,
      }));
    } catch {
      setError("Failed to load suppliers");
    } finally {
      setLoading(false);
    }
  }

  function handleView(supplier) {
    // Always open in view mode (viewOnly) for view action
    setEditSupplier(null);
    setViewSupplier(supplier);
    setModalOpen(true);
  }

  // Save supplier (create or update)
  async function handleSave(supplier) {
    setLoading(true);
    setError("");
    try {
      if (editSupplier) {
        await updateSupplier(editSupplier._id, supplier);
        dialog.success("Supplier updated successfully");
      } else {
        await createSupplier(supplier);
        dialog.success("Supplier created successfully");
      }
      fetchSuppliers(pagination.page, pagination.limit);
      setModalOpen(false);
      setEditSupplier(null);
    } catch {
      setError("Failed to save supplier");
      dialog.error("Failed to save supplier");
    } finally {
      setLoading(false);
    }
  }

  // Delete supplier
  async function handleDelete(id) {
    const confirmed = await dialog.ask({
      type: "confirm",
      title: "Delete Supplier",
      message: "Are you sure you want to delete this supplier?",
      confirmText: "Delete",
      cancelText: "Cancel",
    });
    if (confirmed) {
      setLoading(true);
      try {
        await deleteSupplier(id);
        dialog.success("Supplier deleted successfully");
        fetchSuppliers(pagination.page, pagination.limit);
      } catch {
        setError("Failed to delete supplier");
        dialog.error("Failed to delete supplier");
      } finally {
        setLoading(false);
      }
    }
  }

  return (
    <div>
      <SupplierModal
        key={
          modalOpen
            ? editSupplier
              ? editSupplier._id
              : viewSupplier
                ? viewSupplier._id
                : "new"
            : "closed"
        }
        open={modalOpen}
        onClose={() => {
          setModalOpen(false);
          setEditSupplier(null);
          setViewSupplier(null);
        }}
        onSave={handleSave}
        initial={editSupplier || viewSupplier}
        viewOnly={!!viewSupplier}
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
            className="bg-[#1e3a5f] hover:bg-[#16375b] text-white px-6 py-2 rounded-xl focus:outline-none flex items-center gap-2 cursor-pointer"
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
        <h3 className="flex items-center gap-2 font-semibold text-lg mb-2 text-black">
          <HiOutlineFilter className="inline-block text-xl text-black" />
          <span>Filters</span>
        </h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
          <div>
            <label className="block text-gray-700 text-base font-bold mb-2">
              Search
            </label>
            <input
              className="bg-gray-50 border border-gray-200 rounded-lg py-2 px-4 text-gray-700 min-w-0 w-full"
              placeholder="Search..."
              value={search}
              onChange={(e) => {
                setSearch(e.target.value);
                fetchSuppliers(
                  1,
                  pagination.limit,
                  e.target.value,
                  status,
                  location,
                );
                setPagination((prev) => ({ ...prev, page: 1 }));
              }}
            />
          </div>
          <div>
            <label className="block text-gray-700 text-base font-bold mb-2">
              Location
            </label>
            <LocationDropdown
              value={location}
              onChange={(val) => {
                setLocation(val);
                fetchSuppliers(1, pagination.limit, search, status, val);
                setPagination((prev) => ({ ...prev, page: 1 }));
              }}
            />
          </div>
          <div>
            <label className="block text-gray-700 text-base font-bold mb-2">
              Status
            </label>
            <StatusDropdown
              value={status}
              onChange={(val) => {
                setStatus(val);
                fetchSuppliers(1, pagination.limit, search, val, location);
                setPagination((prev) => ({ ...prev, page: 1 }));
              }}
            />
          </div>
        </div>
      </div>
      <div className="bg-white rounded-xl overflow-x-auto border border-gray-200 px-3">
        {loading ? (
          <div className="p-8 text-center text-gray-500">Loading...</div>
        ) : error ? (
          <div className="p-8 text-center text-red-500">{error}</div>
        ) : (
          <table className="min-w-full text-left text-base align-middle">
            <thead>
              <tr>
                <th>No.</th>
                <th>Company Name</th>
                <th>Contact Person</th>
                <th>Email</th>
                <th>Phone</th>
                <th>Products</th>
                <th>Status</th>
                <th className="text-center">Actions</th>
              </tr>
            </thead>
            <tbody>
              {suppliers.map((supplier, index) => (
                <tr key={supplier._id}>
                  <td>
                    {index + 1 + (pagination.page - 1) * pagination.limit}
                  </td>
                  <td>
                    <div className="flex items-center gap-2">
                      <HiOutlineBuildingOffice2 className="text-lg text-blue-700" />
                      <div className="font-semibold text-base">
                        {supplier.company_name}
                      </div>
                      <div className="text-sm">({supplier.location})</div>
                    </div>
                  </td>
                  <td className="flex items-center gap-1">
                    <div className="font-medium  ">
                      {supplier.contact_person}
                    </div>
                    <div className="text-sm">({supplier.contact_position})</div>
                  </td>
                  <td>{supplier.contact_email}</td>
                  <td>{supplier.contact_phone}</td>
                  <td>
                    <span className="flex items-center gap-2">
                      <HiOutlineCube className="text-base" />
                      <span>
                        {typeof supplier.products_count === "number"
                          ? supplier.products_count
                          : 0}
                      </span>
                    </span>
                  </td>
                  <td>
                    <span
                      className={`inline-block px-3 py-1 rounded-full text-sm font-semibold ${supplier.status === "Active" ? "bg-green-100 text-green-700" : "bg-gray-100 text-gray-700"}`}
                    >
                      {supplier.status}
                    </span>
                  </td>
                  <td className="flex items-center gap-1 justify-center">
                    <button
                      className="text-[#1e3a5f] font-semibold cursor-pointer p-2 rounded-full hover:bg-[#f1f5f9]"
                      title="View"
                      onClick={() => handleView(supplier)}
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
                          setEditSupplier(supplier);
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
                        onClick={() => handleDelete(supplier._id)}
                      >
                        <HiOutlineTrash className="text-xl" />
                      </button>
                    )}
                  </td>
                </tr>
              ))}
              {suppliers.length === 0 && (
                <tr>
                  <td colSpan="7">
                    <NoDataFound message="No suppliers found." />
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
            onChange={({ page, limit }) => {
              setPagination((prev) => ({ ...prev, page, limit }));
              fetchSuppliers(page, limit, search, status, location);
            }}
          />
        </div>
      )}
    </div>
  );
};

export default Suppliers;
