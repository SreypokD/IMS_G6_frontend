import React, { useEffect, useState } from "react";
import {
  HiSelector,
  HiOutlineFilter,
  HiOutlineRefresh,
  HiOutlinePlus,
  HiOutlinePencil,
  HiOutlineTrash,
} from "react-icons/hi";
import {
  getUsers,
  createUser,
  updateUser,
  deleteUser,
  getPermissions,
} from "../api";
import UserModal from "../components/UserModal";
import { useAuth } from "../contexts/auth/useAuth";
import Pagination from "../components/Pagination";
import NoDataFound from "../components/NoDataFound";
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
        <Listbox.Button className="cursor-pointer w-full bg-gray-50 border border-gray-200 rounded-lg px-3 py-2 text-left text-gray-800 text-sm flex items-center justify-between">
          <span>
            {permissions.find((p) => p._id === selected)?.name ||
              "All Permissions"}
          </span>
          <HiSelector className="w-5 h-5 text-gray-400 ml-2" />
        </Listbox.Button>
        <Listbox.Options className="absolute z-10 mt-1 w-full bg-white border border-gray-200 rounded-lg shadow-lg max-h-60 overflow-auto focus:outline-none">
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
                `px-4 py-2 cursor-pointer text-black text-sm hover:bg-[#f1f5f9] ${selected ? "bg-blue-50" : ""}`
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
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 10,
    totalItems: 0,
    totalPages: 1,
  });
  const [modalOpen, setModalOpen] = useState(false);
  const [editUser, setEditUser] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const dialog = useDialog();
  const { user } = useAuth();
  const [search, setSearch] = useState("");
  const [permission, setPermission] = useState("");
  const [permissions, setPermissions] = useState([]);

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

  return (
    <div>
      <UserModal
        key={modalOpen ? (editUser ? editUser._id : "new") : "closed"}
        open={modalOpen}
        onClose={() => {
          setModalOpen(false);
          setEditUser(null);
        }}
        onSave={handleSave}
        initial={editUser}
      />
      <div className="flex items-center justify-between mb-8">
        <div className="flex flex-col">
          <h1 className="text-xl font-semibold">Users</h1>
          <span className="text-gray-500 text-sm">Manage users</span>
        </div>
        {user?.permission?.permissions?.includes("create_user") && (
          <button
            className="bg-[#1e3a5f] hover:bg-[#16375b] text-white px-6 py-2 rounded-xl focus:outline-none flex items-center gap-2 cursor-pointer"
            onClick={() => {
              setEditUser(null);
              setModalOpen(true);
            }}
          >
            <HiOutlinePlus className="text-md" /> Add User
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
            <label className="block text-gray-700 text-sm mb-1">
              Search
            </label>
            <input
              className="bg-gray-50 border border-gray-200 rounded-lg py-2 px-4 text-gray-700 min-w-0 w-full text-sm"
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
                <th>Email</th>
                <th>Phone</th>
                <th>Role</th>
                {user?.permission?.permissions?.includes("update_user") ||
                user?.permission?.permissions?.includes("delete_user") ? (
                  <th className="text-center action">Actions</th>
                ) : null}
              </tr>
            </thead>
            <tbody>
              {users.map((u, index) => (
                <tr key={u._id}>
                  <td className="number">
                    {index + 1 + (pagination.page - 1) * pagination.limit}
                  </td>
                  <td>
                    {u.first_name} {u.last_name}
                  </td>
                  <td>{u.email}</td>
                  <td>{u.phone}</td>
                  <td className="capitalize">{u.role}</td>
                  <td className="flex items-center gap-1 justify-center action">
                    {user?.permission?.permissions?.includes("update_user") && (
                      <button
                        className="text-[#1e3a5f] font-semibold cursor-pointer p-2 rounded-full hover:bg-[#f1f5f9]"
                        title="Edit"
                        onClick={() => {
                          setEditUser(u);
                          setModalOpen(true);
                        }}
                      >
                        <HiOutlinePencil className="text-xl" />
                      </button>
                    )}
                    {user?.permission?.permissions?.includes("delete_user") && (
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
      {users.length > 0 && (
        <div className="flex justify-end mt-4">
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
