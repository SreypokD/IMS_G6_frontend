import React, { useEffect, useState } from "react";
import {
  HiSelector,
  HiOutlineFilter,
  HiOutlineRefresh,
  HiOutlinePlus,
  HiOutlinePencil,
  HiOutlineTrash,
  HiOutlineEye,
  HiOutlineKey,
} from "react-icons/hi";
import {
  getUsers,
  createUser,
  updateUser,
  deleteUser,
  getPermissions,
  resetUserPassword,
} from "../api";
import UserModal from "../components/UserModal";
import { useAuth } from "../contexts/auth/useAuth";
import Pagination from "../components/Pagination";
import NoDataFound from "../components/NoDataFound";
import Loading from "../components/Loading";
import { Listbox } from "@headlessui/react";
import { useDialog } from "../contexts/dialog/useDialog";

function PermissionDropdown({
  selected,
  setSelected,
  permissionOptions: permissions,
}) {
  return (
    <Listbox value={selected} onChange={setSelected}>
      <div className="relative">
        <Listbox.Button className="cursor-pointer w-full bg-gray-50 border border-gray-100 rounded-lg px-3 py-2 text-left text-gray-800 text-sm flex items-center justify-between">
          <span>
            {permissions.find((p) => p._id === selected)?.name ||
              "All Permissions"}
          </span>
          <HiSelector className="w-5 h-5 text-gray-400 ml-2" />
        </Listbox.Button>
        <Listbox.Options className="absolute z-10 mt-1 w-full bg-white border border-gray-100 rounded-lg shadow-lg max-h-60 overflow-auto focus:outline-none">
          <Listbox.Option
            className="px-4 py-2 cursor-pointer text-black text-sm hover:bg-[#f1f5f9]"
            value=""
          >
            <span>All Permissions</span>
          </Listbox.Option>
          {permissions.map((option) => (
            <Listbox.Option
              key={option._id}
              value={option._id}
              className={({ selected }) =>
                `px-3 py-2 cursor-pointer text-black text-sm hover:bg-[#f1f5f9] ${selected ? "bg-blue-50" : ""}`
              }
            >
              {option.name}
            </Listbox.Option>
          ))}
        </Listbox.Options>
      </div>
    </Listbox>
  );
}

const Users = () => {
  const [users, setUsers] = useState([]);

  // View User
  const [viewUser, setViewUser] = useState(null);

  // Pagination
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 10,
    totalItems: 0,
    totalPages: 1,
  });

  // Modal
  const [modalOpen, setModalOpen] = useState(false);
  const [editUser, setEditUser] = useState(null);

  // Loading and Error
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  // Dialog
  const dialog = useDialog();
  const { user } = useAuth();

  // Permissions
  const [permissions, setPermissions] = useState([]);

  // Filters
  const [search, setSearch] = useState("");
  const [permission, setPermission] = useState("");

  // Permissions
  const canView = user?.permission?.permissions?.includes("view_user");
  const canCreate = user?.permission?.permissions?.includes("create_user");
  const canUpdate = user?.permission?.permissions?.includes("update_user");
  const canDelete = user?.permission?.permissions?.includes("delete_user");

  useEffect(() => {
    getPermissions().then((res) => {
      if (Array.isArray(res.data)) {
        setPermissions(res.data);
      } else if (Array.isArray(res.data?.data)) {
        setPermissions(res.data.data);
      } else {
        setPermissions([]);
      }
    });
  }, []);

  useEffect(() => {
    if (user) {
      const delayDebounceFn = setTimeout(() => {
        fetchUsers(1, pagination.limit, search, permission);
        setPagination((prev) => ({ ...prev, page: 1 }));
      }, 500);
      return () => clearTimeout(delayDebounceFn);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user, search, permission]);

  // Fetch users from API
  async function fetchUsers(page = 1, limit = 10, search, permission_id) {
    setLoading(true);
    setError("");
    try {
      const params = { page, limit, search };
      if (permission_id) params.permission_id = permission_id;
      const res = await getUsers(params);
      setUsers(res.data.data);
      setPagination((prev) => ({
        ...prev,
        ...res.data.pagination,
        page,
        limit,
      }));
    } catch {
      setError("Failed to load users");
    } finally {
      setLoading(false);
    }
  }

  function handleView(user) {
    setEditUser(null);
    setViewUser(user);
    setModalOpen(true);
  }

  // Save user (create or update)
  async function handleSave(user) {
    setLoading(true);
    setError("");
    try {
      if (editUser) {
        await updateUser(editUser._id, user);
        dialog.success("User updated successfully");
      } else {
        await createUser(user);
        dialog.success("User created successfully");
      }
      fetchUsers(1, pagination.limit, search, permission);
      setModalOpen(false);
      setEditUser(null);
    } catch {
      setError("Failed to save user");
      dialog.error("Failed to save user");
    } finally {
      setLoading(false);
    }
  }

  // Delete user
  async function handleDelete(id) {
    const confirmed = await dialog.ask({
      type: "confirm",
      title: "Delete User",
      message: "Are you sure you want to delete this user?",
      confirmText: "Delete",
      cancelText: "Cancel",
    });
    if (confirmed) {
      setLoading(true);
      try {
        await deleteUser(id);
        dialog.success("User deleted successfully");
        fetchUsers(pagination.page, pagination.limit, search, permission);
      } catch {
        setError("Failed to delete user");
        dialog.error("Failed to delete user");
      } finally {
        setLoading(false);
      }
    }
  }

  // Reset Password
  async function handleResetPassword(id) {
    const password = await dialog.prompt({
      title: "Reset Password",
      message: "Enter the new password for this user:",
      placeholder: "New Password",
      inputType: "password",
      confirmText: "Reset",
      cancelText: "Cancel",
    });
    if (password) {
      if (password.length < 6) {
        dialog.error("Password must be at least 6 characters long");
        return;
      }
      setLoading(true);
      try {
        await resetUserPassword(id, password);
        dialog.success("Password reset successfully");
      } catch (err) {
        dialog.error(err.response?.data?.error || "Failed to reset password");
      } finally {
        setLoading(false);
      }
    }
  }

  const handleReset = () => {
    setSearch("");
    setPermission("");
    setPagination((prev) => ({ ...prev, page: 1 }));
    fetchUsers(1, pagination.limit, "", "");
  };

  return (
    <div className="h-content-available">
      <UserModal
        key={modalOpen ? (editUser ? editUser._id : "new") : "closed"}
        open={modalOpen}
        onClose={() => {
          setModalOpen(false);
          setEditUser(null);
          setViewUser(null);
        }}
        onSave={handleSave}
        data={editUser || viewUser}
        viewOnly={!!viewUser}
      />
      <div className="flex items-center justify-between mb-8">
        <div className="flex flex-col">
          <h1 className="text-xl font-semibold">Users</h1>
          <span className="text-gray-500 text-sm">Manage users</span>
        </div>
        {canCreate && (
          <button
            className="bg-[#1e3a5f] hover:bg-[#16375b] text-white px-6 py-2 rounded-xl focus:outline-none flex items-center gap-2 cursor-pointer text-sm"
            onClick={() => {
              setEditUser(null);
              setViewUser(null);
              setModalOpen(true);
            }}
          >
            <HiOutlinePlus className="text-md" /> Add User
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
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
          <div>
            <label className="block text-gray-700 text-sm mb-1">
              Permission
            </label>
            <PermissionDropdown
              selected={permission}
              setSelected={setPermission}
              permissionOptions={permissions}
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
                  <th>Name</th>
                  <th>Email</th>
                  <th>Phone</th>
                  <th>Role</th>
                  <th>Status</th>
                  {canView || canUpdate || canDelete ? (
                    <th className="text-center action">Actions</th>
                  ) : null}
                </tr>
              </thead>
              <tbody>
                {users.map((u, index) => (
                  <tr key={u._id} className="hover:bg-[#f1f5f9]">
                    <td className="number">
                      {index + 1 + (pagination.page - 1) * pagination.limit}
                    </td>
                    <td>
                      {u.first_name} {u.last_name}
                    </td>
                    <td>{u.email}</td>
                    <td>{u.phone || "-"}</td>
                    <td className="capitalize">{u.role}</td>
                    <td>
                      <span
                        className={`inline-block px-3 py-1 rounded-full text-sm ${
                          u.status === "active"
                            ? "bg-green-100 text-green-700"
                            : u.status === "pending"
                            ? "bg-yellow-100 text-yellow-700"
                            : "bg-red-100 text-red-700"
                        }`}
                      >
                        {u.status
                          ? u.status.charAt(0).toUpperCase() + u.status.slice(1)
                          : "Active"}
                      </span>
                    </td>
                    <td className="flex items-center gap-1 justify-center action">
                      {canView && (
                        <button
                          className="text-[#1e3a5f] font-semibold cursor-pointer p-2 rounded-full hover:bg-[#f1f5f9]"
                          title="View"
                          onClick={() => handleView(u)}
                        >
                          <HiOutlineEye className="text-xl" />
                        </button>
                      )}
                      {canUpdate && (
                        <button
                          className="text-[#1e3a5f] font-semibold cursor-pointer p-2 rounded-full hover:bg-[#f1f5f9]"
                          title="Update"
                          onClick={() => {
                            setEditUser(u);
                            setViewUser(null);
                            setModalOpen(true);
                          }}
                        >
                          <HiOutlinePencil className="text-xl" />
                        </button>
                      )}
                      {canUpdate && (
                        <button
                          className="text-yellow-600 font-semibold cursor-pointer p-2 rounded-full hover:bg-[#f1f5f9]"
                          title="Reset Password"
                          onClick={() => handleResetPassword(u._id)}
                        >
                          <HiOutlineKey className="text-xl" />
                        </button>
                      )}
                      {canDelete && (
                        <button
                          className="text-red-600 font-semibold cursor-pointer p-2 rounded-full hover:bg-[#f1f5f9]"
                          title="Delete"
                          onClick={() => handleDelete(u._id)}
                        >
                          <HiOutlineTrash className="text-xl" />
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
                {users.length === 0 && (
                  <tr>
                    <td colSpan="6">
                      <NoDataFound message="No users found." />
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          )}
        </div>
      </div>
      {users.length > 0 && (
        <div className="flex justify-end mt-3">
          <Pagination
            total={pagination.totalItems}
            page={pagination.page}
            limit={pagination.limit}
            onChange={({ page, limit }) => {
              setPagination((prev) => ({ ...prev, page, limit }));
              fetchUsers(page, limit);
            }}
          />
        </div>
      )}
    </div>
  );
};

export default Users;
