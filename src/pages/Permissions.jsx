import React, { useState, useEffect } from "react";
import PermissionModal from "../components/PermissionModal";
import {
  HiOutlinePencil,
  HiOutlineTrash,
  HiOutlinePlus,
  HiOutlineFilter,
  HiOutlineRefresh,
  HiOutlineEye,
} from "react-icons/hi";
import {
  getPermissions,
  createPermission,
  updatePermission,
  deletePermission,
} from "../api";
import { useAuth } from "../contexts/auth/useAuth";
import Pagination from "../components/Pagination";
import NoDataFound from "../components/NoDataFound";
import { useDialog } from "../contexts/dialog/useDialog";

const Permissions = () => {
  const [permissions, setPermissions] = useState([]);
  const [viewPermission, setViewPermission] = useState(null);
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 10,
    totalItems: 0,
    totalPages: 1,
  });
  const [modalOpen, setModalOpen] = useState(false);
  const [editPermission, setEditPermission] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const { user } = useAuth();
  const dialog = useDialog();
  const [search, setSearch] = useState("");

  useEffect(() => {
    if (user) {
      const delayDebounceFn = setTimeout(() => {
        fetchPermissions(1, pagination.limit, search);
        setPagination((prev) => ({ ...prev, page: 1 }));
      }, 500);
      return () => clearTimeout(delayDebounceFn);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user, search]);

  // Fetch permissions from API
  async function fetchPermissions(page = 1, limit = 10, search) {
    setLoading(true);
    setError("");
    try {
      const res = await getPermissions({ page, limit, search });
      setPermissions(res.data.data);
      setPagination((prev) => ({
        ...prev,
        ...res.data.pagination,
        page,
        limit,
      }));
    } catch {
      setError("Failed to load permissions");
    } finally {
      setLoading(false);
    }
  }

  function handleView(permission) {
    setEditPermission(null);
    setViewPermission(permission);
    setModalOpen(true);
  }

  // Save permission (create or update)
  async function handleSave(permission) {
    setLoading(true);
    setError("");
    try {
      if (editPermission) {
        await updatePermission(editPermission._id, permission);
        dialog.success("Permission updated successfully");
      } else {
        await createPermission(permission);
        dialog.success("Permission created successfully");
      }
      fetchPermissions(1, pagination.limit, search);
      setModalOpen(false);
      setEditPermission(null);
    } catch {
      setError("Failed to save permission");
      dialog.error("Failed to save permission");
    } finally {
      setLoading(false);
    }
  }

  // Delete permission
  async function handleDelete(id) {
    const confirmed = await dialog.ask({
      type: "confirm",
      title: "Delete Permission",
      message: "Are you sure you want to delete this permission?",
      confirmText: "Delete",
      cancelText: "Cancel",
    });
    if (confirmed) {
      setLoading(true);
      try {
        await deletePermission(id);
        dialog.success("Permission deleted successfully");
        fetchPermissions(pagination.page, pagination.limit, search);
      } catch {
        setError("Failed to delete permission");
        dialog.error("Failed to delete permission");
      } finally {
        setLoading(false);
      }
    }
  }

  return (
    <div>
      <PermissionModal
        open={modalOpen}
        onClose={() => {
          setModalOpen(false);
          setEditPermission(null);
        }}
        onSave={handleSave}
        initial={editPermission || viewPermission}
        viewOnly={!!viewPermission}
      />
      <div className="flex items-center justify-between mb-8">
        <div className="flex flex-col">
          <h1 className="text-xl font-semibold">Permissions</h1>
          <span className="text-gray-500 text-sm">Manage permissions</span>
        </div>
        {user?.permission?.permissions?.includes("create_permission") && (
          <button
            className="bg-[#1e3a5f] hover:bg-[#16375b] text-white px-6 py-2 rounded-xl focus:outline-none flex items-center gap-2 cursor-pointer"
            onClick={() => {
              setEditPermission(null);
              setModalOpen(true);
            }}
          >
            <HiOutlinePlus className="text-md" /> Add Permission
          </button>
        )}
      </div>
      <div className="bg-white rounded-xl p-6 mb-4 border border-gray-200">
        <div className="w-full flex items-center justify-between">
          <h3 className="flex items-center gap-2 text-base mb-2 text-black">
            <HiOutlineFilter className="inline-block text-xl text-black" />
            <span>Filters</span>
          </h3>
          <button className="flex items-center gap-2 text-base mb-2 text-black cursor-pointer">
            <HiOutlineRefresh className="inline-block text-xl text-black" />
            <span>Reset</span>
          </button>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
          <div>
            <label className="block text-gray-700 text-sm mb-1">Search</label>
            <input
              className="bg-gray-50 border border-gray-200 rounded-lg py-2 px-4 text-gray-700 min-w-0 w-full text-sm"
              placeholder="Search..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
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
          <table className="min-w-full text-left text-sm align-middle">
            <thead>
              <tr>
                <th className="number">No.</th>
                <th>Name</th>
                <th>Description</th>
                {user?.permission?.permissions?.includes("update_permission") ||
                user?.permission?.permissions?.includes("delete_permission") ? (
                  <th className="text-center action">Actions</th>
                ) : null}
              </tr>
            </thead>
            <tbody>
              {permissions.map((permission, index) => (
                <tr key={permission._id}>
                  <td className="number">
                    {index + 1 + (pagination.page - 1) * pagination.limit}
                  </td>
                  <td>{permission.name}</td>
                  <td className="whitespace-nowrap">
                    {permission.description}
                  </td>
                  <td className="flex items-center gap-1 justify-center action">
                    {user?.permission?.permissions?.includes(
                      "view_permission",
                    ) && (
                      <button
                        className="text-[#1e3a5f] font-semibold cursor-pointer p-2 rounded-full hover:bg-[#f1f5f9]"
                        title="View"
                        onClick={() => handleView(permission)}
                      >
                        <HiOutlineEye className="text-xl" />
                      </button>
                    )}
                    {user?.permission?.permissions?.includes(
                      "update_permission",
                    ) && (
                      <button
                        className="text-[#1e3a5f] font-semibold cursor-pointer p-2 rounded-full hover:bg-[#f1f5f9]"
                        title="Edit"
                        onClick={() => {
                          setEditPermission(permission);
                          setModalOpen(true);
                        }}
                      >
                        <HiOutlinePencil className="text-xl" />
                      </button>
                    )}
                    {user?.permission?.permissions?.includes(
                      "delete_permission",
                    ) && (
                      <button
                        className="text-red-600 font-semibold cursor-pointer p-2 rounded-full hover:bg-[#f1f5f9]"
                        title="Delete"
                        onClick={() => handleDelete(permission._id)}
                      >
                        <HiOutlineTrash className="text-xl" />
                      </button>
                    )}
                  </td>
                </tr>
              ))}
              {permissions.length === 0 && (
                <tr>
                  <td colSpan="4">
                    <NoDataFound message="No permissions found." />
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        )}
      </div>
      {permissions.length > 0 && (
        <div className="flex justify-end mt-4">
          <Pagination
            total={pagination.totalItems}
            page={pagination.page}
            limit={pagination.limit}
            onChange={({ page, limit }) => {
              setPagination((prev) => ({ ...prev, page, limit }));
              fetchPermissions(page, limit);
            }}
          />
        </div>
      )}
    </div>
  );
};

export default Permissions;
