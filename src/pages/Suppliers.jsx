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
import { HiSelector, HiOutlineFilter, HiOutlineRefresh } from "react-icons/hi";
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
import Loading from "../components/Loading";

// Custom dropdowns for Suppliers page
const statusOptions = ["Active", "Inactive"];
const locationOptions = ["Main Warehouse", "Showroom"];

// Dropdowns now accept value and onChange from parent
function StatusDropdown({ value, onChange }) {
  return (
    <Listbox value={value} onChange={onChange}>
      <div className="relative">
        <Listbox.Button className="cursor-pointer w-full bg-gray-50 border border-gray-100 rounded-lg px-3 py-2 text-left text-gray-800 text-sm flex items-center justify-between">
          <span>{value || "All Statuses"}</span>
          <HiSelector className="w-5 h-5 text-gray-400 ml-2" />
        </Listbox.Button>
        <Listbox.Options className="absolute z-10 mt-1 w-full bg-white border border-gray-100 rounded-lg shadow-lg max-h-60 overflow-auto focus:outline-none">
          <Listbox.Option
            className="px-4 py-2 cursor-pointer text-black text-sm hover:bg-[#f1f5f9]"
            value=""
          >
            <span>All Statuses</span>
          </Listbox.Option>
          {statusOptions.map((option) => (
            <Listbox.Option
              key={option}
              value={option}
              className={({ selected }) =>
                `px-3 py-2 cursor-pointer text-black text-sm hover:bg-[#f1f5f9] ${selected ? "bg-blue-50" : ""}`
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
        <Listbox.Button className="cursor-pointer w-full bg-gray-50 border border-gray-100 rounded-lg px-3 py-2 text-left text-gray-800 text-sm flex items-center justify-between">
          <span>{value || "All Locations"}</span>
          <HiSelector className="w-5 h-5 text-gray-400 ml-2" />
        </Listbox.Button>
        <Listbox.Options className="absolute z-10 mt-1 w-full bg-white border border-gray-100 rounded-lg shadow-lg max-h-60 overflow-auto focus:outline-none">
          <Listbox.Option
            className="px-4 py-2 cursor-pointer text-black text-sm hover:bg-[#f1f5f9]"
            value=""
          >
            <span>All Locations</span>
          </Listbox.Option>
          {locationOptions.map((option) => (
            <Listbox.Option
              key={option}
              value={option}
              className={({ selected }) =>
                `px-3 py-2 cursor-pointer text-black text-sm hover:bg-[#f1f5f9] ${selected ? "bg-blue-50" : ""}`
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

  // View Supplier
  const [viewSupplier, setViewSupplier] = useState(null);

  // Pagination
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 10,
    totalItems: 0,
    totalPages: 1,
  });

  // Modal
  const [modalOpen, setModalOpen] = useState(false);
  const [updateSupplier, setUpdateSupplier] = useState(null);

  // Loading and Error
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  // Filters
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("");
  const [location, setLocation] = useState("");

  // Permissions
  const dialog = useDialog();
  const { user } = useAuth();
  const canView = user?.permission?.permissions?.includes("view_supplier");
  const canCreate = user?.permission?.permissions?.includes("create_supplier");
  const canUpdate = user?.permission?.permissions?.includes("update_supplier");
  const canDelete = user?.permission?.permissions?.includes("delete_supplier");

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
    setUpdateSupplier(null);
    setViewSupplier(supplier);
    setModalOpen(true);
  }

  // Save supplier (create or update)
  async function handleSave(supplier) {
    setLoading(true);
    setError("");
    try {
      if (updateSupplier) {
        await updateSupplier(updateSupplier._id, supplier);
        dialog.success("Supplier updated successfully");
      } else {
        await createSupplier(supplier);
        dialog.success("Supplier created successfully");
      }
      fetchSuppliers(pagination.page, pagination.limit);
      setModalOpen(false);
      setUpdateSupplier(null);
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

  const handleReset = () => {
    setSearch("");
    setStatus("");
    setLocation("");
    setPagination((prev) => ({ ...prev, page: 1 }));
    fetchSuppliers(1, pagination.limit, "", "", "");
  };

  return (
    <div className="h-content-available">
      <SupplierModal
        key={
          modalOpen
            ? updateSupplier
              ? updateSupplier._id
              : viewSupplier
                ? viewSupplier._id
                : "new"
            : "closed"
        }
        open={modalOpen}
        onClose={() => {
          setModalOpen(false);
          setUpdateSupplier(null);
          setViewSupplier(null);
        }}
        onSave={handleSave}
        data={updateSupplier || viewSupplier}
        viewOnly={!!viewSupplier}
      />
      <div className="flex items-center justify-between mb-8">
        <div className="flex flex-col">
          <h1 className="text-xl font-semibold">Supplier Management</h1>
          <span className="text-gray-500 text-sm">
            Manage vendor relationships and product associations
          </span>
        </div>
        {canCreate && (
          <button
            className="bg-[#1e3a5f] hover:bg-[#16375b] text-white px-6 py-2 rounded-xl focus:outline-none flex items-center gap-2 cursor-pointer text-sm"
            onClick={() => {
              setUpdateSupplier(null);
              setModalOpen(true);
            }}
          >
            <HiOutlinePlus className="text-md" /> Add Supplier
          </button>
        )}
      </div>
      <div className="bg-white rounded-xl p-6 mb-3 border border-gray-100">
        <div className="w-full flex items-center justify-between">
          <h3 className="flex items-center gap-2 text-base mb-3 text-[#1e3a5f] font-semibold border-b border-gray-100 pb-2">
            <HiOutlineFilter className="inline-block text-sm text-black" />
            <span>Filters</span>
          </h3>
          <button
            onClick={handleReset}
            className="flex items-center gap-2 text-sm mb-2 text-black cursor-pointer"
          >
            <HiOutlineRefresh className="inline-block text-sm text-black" />
            <span>Reset</span>
          </button>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3">
          <div>
            <label className="block text-gray-700 text-sm mb-1">Search</label>
            <input
              className="bg-gray-50 border border-gray-100 rounded-lg py-2 px-4 text-gray-700 min-w-0 w-full text-sm"
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
            <label className="block text-gray-700 text-sm mb-1">Location</label>
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
            <label className="block text-gray-700 text-sm mb-1">Status</label>
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
      <div className="flex-1 bg-white rounded-xl border border-gray-100 flex flex-col min-h-0">
        <div className="table-scroll-container">
          {loading ? (
            <Loading />
          ) : error ? (
            <div className="p-8 text-center text-red-500">{error}</div>
          ) : (
            <table className="min-w-full text-left text-sm align-middle">
              <thead className="table-sticky-header">
                <tr>
                  <th className="number">No.</th>
                  <th>Company Name</th>
                  <th>Contact Person</th>
                  <th>Email</th>
                  <th>Phone</th>
                  <th>Products</th>
                  <th>Status</th>
                  {canView || canUpdate || canDelete ? (
                    <th className="text-center action">Actions</th>
                  ) : null}
                </tr>
              </thead>
              <tbody>
                {suppliers.map((supplier, index) => (
                  <tr key={supplier._id} className="hover:bg-[#f1f5f9]">
                    <td className="number">
                      {index + 1 + (pagination.page - 1) * pagination.limit}
                    </td>
                    <td>
                      <div className="flex items-center gap-2">
                        <HiOutlineBuildingOffice2 className="text-lg text-blue-700" />
                        {supplier.company_name}
                      </div>
                    </td>
                    <td className="flex items-center gap-1">
                      {supplier.contact_person}
                    </td>
                    <td>{supplier.contact_email}</td>
                    <td>{supplier.contact_phone}</td>
                    <td>
                      <span className="flex items-center gap-2">
                        <HiOutlineCube className="text-sm" />
                        <span>
                          {typeof supplier.products_count === "number"
                            ? supplier.products_count
                            : 0}
                        </span>
                      </span>
                    </td>
                    <td>
                      <span
                        className={`inline-block px-3 py-1 rounded-full text-sm ${supplier.status === "Active" ? "bg-green-100 text-green-700" : "bg-gray-100 text-gray-700"}`}
                      >
                        {supplier.status}
                      </span>
                    </td>
                    <td className="flex items-center gap-1 justify-center action">
                      {canView && (
                        <button
                          className="text-[#1e3a5f] font-semibold cursor-pointer p-2 rounded-full hover:bg-[#f1f5f9]"
                          title="View"
                          onClick={() => handleView(supplier)}
                        >
                          <HiOutlineEye className="text-xl" />
                        </button>
                      )}
                      {canUpdate && (
                        <button
                          className="text-[#1e3a5f] font-semibold cursor-pointer p-2 rounded-full hover:bg-[#f1f5f9]"
                          title="Update"
                          onClick={() => {
                            setUpdateSupplier(supplier);
                            setModalOpen(true);
                          }}
                        >
                          <HiOutlinePencil className="text-xl" />
                        </button>
                      )}
                      {canDelete && (
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
      </div>
      {suppliers.length > 0 && (
        <div className="flex justify-end mt-3">
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
