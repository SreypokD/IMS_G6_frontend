import React, { useState, useEffect } from "react";
import PermissionModal from "../components/PermissionModal";
import {
  HiOutlineCheckCircle,
  HiOutlineXCircle,
  HiOutlineArchive,
  HiOutlinePencil,
  HiOutlineTrash,
  HiOutlinePlus,
  HiOutlineFilter,
  HiOutlineRefresh,
  HiOutlineEye,
  HiDotsVertical,
} from "react-icons/hi";
import { Menu } from "@headlessui/react";
import {
  getPermissions,
  createPermission,
  updatePermission,
  deletePermission,
} from "../api";
import { useAuth } from "../contexts/auth/useAuth";
import Pagination from "../components/Pagination";
import NoDataFound from "../components/NoDataFound";
import Loading from "../components/Loading";
import { useDialog } from "../contexts/dialog/useDialog";

const Permissions = () => {
  const [permissions, setPermissions] = useState([]);

  // View permission
  const [viewPermission, setViewPermission] = useState(null);

  // Pagination
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 10,
    totalItems: 0,
    totalPages: 1,
  });

  // Modal
  const [modalOpen, setModalOpen] = useState(false);
  const [editPermission, setEditPermission] = useState(null);

  // Loading and Error
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  // Dialog
  const { user } = useAuth();
  const dialog = useDialog();

  // Filters
  const [search, setSearch] = useState("");

  // Permissions
  const canView = user?.permission?.permissions?.includes("view_permission");
  const canCreate =
    user?.permission?.permissions?.includes("create_permission");
  const canUpdate =
    user?.permission?.permissions?.includes("update_permission");
  const canDelete =
    user?.permission?.permissions?.includes("delete_permission");

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

  const handleReset = () => {
    setSearch("");
    setPagination((prev) => ({ ...prev, page: 1 }));
    fetchPermissions(1, pagination.limit, "");
  };

  // Selection
  const [selectedIds, setSelectedIds] = useState([]);

  function handleSelectAll(e) {
    if (e.target.checked) {
      setSelectedIds(permissions.map((p) => p._id));
    } else {
      setSelectedIds([]);
      setSelectAllMatches(false);
    }
  }

  const [selectAllMatches, setSelectAllMatches] = useState(false);

  async function handleSelectAllGlobal() {
    setLoading(true);
    try {
      const res = await getPermissions({ page: 1, limit: -1, search });
      const allIds = res.data.data.map((p) => p._id);
      setSelectedIds(allIds);
      setSelectAllMatches(true);
    } catch (err) {
      console.error(err);
      dialog.error("Failed to select all permissions.");
    } finally {
      setLoading(false);
    }
  }

  function handleSelectOne(e, id) {
    if (e.target.checked) {
      setSelectedIds((prev) => [...prev, id]);
    } else {
      setSelectedIds((prev) => prev.filter((i) => i !== id));
    }
  }

  async function handleBulkStatus(status) {
    if (selectedIds.length === 0) return;
    setLoading(true);
    try {
      await Promise.all(
        selectedIds.map((id) => updatePermission(id, { status })),
      );
      await dialog.success(`Permissions marked as ${status} successfully.`);
      fetchPermissions(pagination.page, pagination.limit, search);
      setSelectedIds([]);
      setSelectAllMatches(false);
    } catch {
      await dialog.error("Failed to update permissions.");
    } finally {
      setLoading(false);
    }
  }

  async function handleBulkDelete() {
    if (selectedIds.length === 0) return;
    const confirmed = await dialog.ask({
      type: "confirm",
      title: "Delete Permissions",
      message: `Are you sure you want to delete ${selectedIds.length} permissions?`,
      confirmText: "Delete",
      cancelText: "Cancel",
    });
    if (!confirmed) return;

    setLoading(true);
    try {
      await Promise.all(selectedIds.map((id) => deletePermission(id)));
      await dialog.success("Permissions deleted successfully.");
      fetchPermissions(pagination.page, pagination.limit, search);
      setSelectedIds([]);
      setSelectAllMatches(false);
    } catch {
      await dialog.error("Failed to delete permissions.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="h-content-available">
      <PermissionModal
        open={modalOpen}
        onClose={() => {
          setModalOpen(false);
          setEditPermission(null);
        }}
        onSave={handleSave}
        data={editPermission || viewPermission}
        viewOnly={!!viewPermission}
      />
      <div className="flex items-center justify-between mb-8">
        <div className="flex flex-col">
          <h1 className="text-xl font-semibold">Permissions</h1>
          <span className="text-gray-500 text-sm">Manage permissions</span>
        </div>
        <div className="flex items-center gap-2">
          {canCreate && (
            <button
              className="bg-[#1e3a5f] hover:bg-[#16375b] text-white px-6 py-2 rounded-xl focus:outline-none flex items-center gap-2 cursor-pointer text-sm"
              onClick={() => {
                setEditPermission(null);
                setModalOpen(true);
              }}
            >
              <HiOutlinePlus /> Add Permission
            </button>
          )}
          {(canUpdate || canDelete) && (
            <Menu as="div" className="relative inline-block text-left ml-2">
              <Menu.Button className="text-[#1e3a5f] font-semibold cursor-pointer p-2 rounded-full hover:bg-gray-200">
                <HiDotsVertical className="text-xl" />
              </Menu.Button>
              <Menu.Items
                anchor="bottom end"
                className="bg-white rounded-2xl shadow-lg p-2 w-50 z-50 animate-fade-in-up border border-gray-100"
              >
                <Menu.Item>
                  {() => (
                    <button
                      onClick={() => handleBulkStatus("active")}
                      className={`w-full flex items-center px-2 py-3 text-[#64748b] transition text-sm space-x-2 rounded-xl ${selectedIds.length === 0 ? "opacity-50 cursor-default" : "cursor-pointer hover:text-black hover:bg-[#f1f5f9]"}`}
                    >
                      <HiOutlineCheckCircle
                        className="mr-2 h-5 w-5"
                        aria-hidden="true"
                      />
                      Active Permissions
                    </button>
                  )}
                </Menu.Item>
                <Menu.Item>
                  {() => (
                    <button
                      onClick={() => handleBulkStatus("inactive")}
                      className={`w-full flex items-center px-2 py-3 text-[#64748b] transition text-sm space-x-2 rounded-xl ${selectedIds.length === 0 ? "opacity-50 cursor-default" : "cursor-pointer hover:text-black hover:bg-[#f1f5f9]"}`}
                    >
                      <HiOutlineArchive
                        className="mr-2 h-5 w-5"
                        aria-hidden="true"
                      />
                      Archive Permissions
                    </button>
                  )}
                </Menu.Item>
                <Menu.Item>
                  {() => (
                    <button
                      onClick={handleBulkDelete}
                      className={`w-full flex items-center px-2 py-3 text-red-500 transition text-sm space-x-2 rounded-xl ${selectedIds.length === 0 ? "opacity-50 cursor-default" : "cursor-pointer hover:bg-red-50"}`}
                    >
                      <HiOutlineTrash
                        className="text-red-500 mr-2 h-5 w-5"
                        aria-hidden="true"
                      />
                      Delete Permissions
                    </button>
                  )}
                </Menu.Item>
              </Menu.Items>
            </Menu>
          )}
        </div>
      </div>
      <div className="bg-white rounded-xl p-6 mb-3 border border-gray-100">
        <div className="w-full flex items-center justify-between">
          <h3 className="flex items-center gap-2 text-base mb-3 text-[#1e3a5f] font-semibold">
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
              onChange={(e) => setSearch(e.target.value)}
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
                  {(canUpdate || canDelete) && (
                    <th className="w-15">
                      <input
                        type="checkbox"
                        name="selectAll"
                        id="selectAll"
                        className="w-4 h-4 accent-[#1e3a5f] cursor-pointer"
                        checked={
                          permissions.length > 0 &&
                          selectedIds.length === permissions.length
                        }
                        onChange={handleSelectAll}
                      />
                    </th>
                  )}
                  <th className="number">No.</th>
                  <th>Name</th>
                  <th>Description</th>
                  <th>Status</th>
                  {canView || canUpdate || canDelete ? (
                    <th className="text-center action">Actions</th>
                  ) : null}
                </tr>
              </thead>
              <tbody>
                {permissions.map((permission, index) => (
                  <tr key={permission._id} className="hover:bg-[#f1f5f9]">
                    {(canUpdate || canDelete) && (
                      <td className="w-15">
                        <input
                          type="checkbox"
                          name="select"
                          id="select"
                          className="w-4 h-4 accent-[#1e3a5f] cursor-pointer"
                          checked={selectedIds.includes(permission._id)}
                          onChange={(e) => handleSelectOne(e, permission._id)}
                        />
                      </td>
                    )}
                    <td className="number">
                      {index + 1 + (pagination.page - 1) * pagination.limit}
                    </td>
                    <td>{permission.name}</td>
                    <td className="whitespace-nowrap">
                      {permission.description}
                    </td>
                    <td>
                      <span
                        className={`inline-block px-3 py-1 rounded-full text-sm capitalize text-white ${permission.status === "active" ? "bg-green-400" : "bg-gray-100"}`}
                      >
                        {permission.status}
                      </span>
                    </td>
                    <td className="flex items-center gap-1 justify-center action">
                      {canView && (
                        <button
                          className="text-[#1e3a5f] font-semibold cursor-pointer p-2 rounded-full hover:bg-gray-200"
                          title="View"
                          onClick={() => handleView(permission)}
                        >
                          <HiOutlineEye className="text-xl" />
                        </button>
                      )}
                      {(canUpdate || canDelete) && (
                        <Menu
                          as="div"
                          className="relative inline-block text-left"
                        >
                          <Menu.Button className="text-[#1e3a5f] font-semibold cursor-pointer p-2 rounded-full hover:bg-gray-200">
                            <HiDotsVertical className="text-xl" />
                          </Menu.Button>
                          <Menu.Items
                            anchor="bottom end"
                            className="bg-white rounded-2xl shadow-lg p-2 w-40 z-50 animate-fade-in-up border border-gray-100"
                          >
                            {canUpdate && (
                              <Menu.Item>
                                {() => (
                                  <button
                                    onClick={() => {
                                      setEditPermission(permission);
                                      setViewPermission(null);
                                      setModalOpen(true);
                                    }}
                                    className="w-full flex items-center px-2 py-3 text-[#64748b] hover:text-black hover:bg-[#f1f5f9] transition text-sm space-x-2 rounded-xl cursor-pointer"
                                  >
                                    <HiOutlinePencil
                                      className="mr-2 h-5 w-5"
                                      aria-hidden="true"
                                    />
                                    Update
                                  </button>
                                )}
                              </Menu.Item>
                            )}
                            {canDelete && (
                              <Menu.Item>
                                {() => (
                                  <button
                                    onClick={() => handleDelete(permission._id)}
                                    className="w-full flex items-center px-2 py-3 text-red-500 hover:bg-red-50 transition text-sm space-x-2 rounded-xl cursor-pointer"
                                  >
                                    <HiOutlineTrash
                                      className="text-red-500 mr-2 h-5 w-5"
                                      aria-hidden="true"
                                    />
                                    Delete
                                  </button>
                                )}
                              </Menu.Item>
                            )}
                          </Menu.Items>
                        </Menu>
                      )}
                    </td>
                  </tr>
                ))}
                {permissions.length === 0 && (
                  <tr>
                    <td colSpan={canUpdate || canDelete ? 6 : 5}>
                      <NoDataFound message="No permissions found." />
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          )}
        </div>
      </div>
      {permissions.length > 0 && (
        <div className="flex justify-end mt-3">
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
