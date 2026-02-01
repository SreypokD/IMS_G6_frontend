import React, { useEffect, useState } from "react";
import { HiOutlinePlus, HiOutlinePencil, HiOutlineTrash } from "react-icons/hi";
import { getUsers, createUser, updateUser, deleteUser } from "../api";
import UserModal from "../components/UserModal";
import { useAuth } from "../context/useAuth";
import Pagination from "../components/Pagination";
import NoDataFound from "../components/NoDataFound";

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
  const { user } = useAuth();

  useEffect(() => {
    if (user) {
      fetchUsers(1, 10);
    }
  }, [user]);

  // Fetch users from API
  async function fetchUsers(page = 1, limit = 10) {
    setLoading(true);
    setError("");
    try {
      const res = await getUsers({ page, limit });
      setUsers(res.data.data);
      setPagination(res.data.pagination);
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
      } else {
        await createUser(user);
      }
      fetchUsers();
      setModalOpen(false);
      setEditUser(null);
    } catch {
      setError("Failed to save user");
    } finally {
      setLoading(false);
    }
  }

  // Delete user
  async function handleDelete(id) {
    if (window.confirm("Delete this user?")) {
      setLoading(true);
      try {
        await deleteUser(id);
        fetchUsers();
      } catch {
        setError("Failed to delete user");
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
          <h1 className="text-2xl font-semibold">Users</h1>
          <span className="text-gray-500">Manage users</span>
        </div>
        {user?.permission?.permissions?.includes("create_user") && (
          <button
            className="bg-[#1e3a5f] hover:bg-[#16375b] text-white px-5 py-2 rounded-xl transition flex items-center gap-2 cursor-pointer"
            onClick={() => {
              setEditUser(null);
              setModalOpen(true);
            }}
          >
            <HiOutlinePlus className="text-md" /> Add User
          </button>
        )}
      </div>
      <div className="bg-white rounded-xl p-6 mb-6 border border-gray-200">
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
          <input
            className="bg-gray-50 border border-gray-200 rounded-lg py-2 px-4 text-gray-700 min-w-0 w-full"
            placeholder="Search..."
          />
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
                <th className="py-3 px-4">Name</th>
                <th className="py-3 px-4">Email</th>
                <th className="py-3 px-4">Phone</th>
                <th className="py-3 px-4">Role</th>
                {user?.permission?.permissions?.includes("update_user") ||
                user?.permission?.permissions?.includes("delete_user") ? (
                  <th className="py-3 px-4">Actions</th>
                ) : null}
              </tr>
            </thead>
            <tbody>
              {users.map((u, index) => (
                <tr key={u._id}>
                  <td className="py-1 px-4">
                    {index + 1 + (pagination.page - 1) * pagination.limit}
                  </td>
                  <td className="py-1 px-4">
                    {u.first_name} {u.last_name}
                  </td>
                  <td className="py-1 px-4">{u.email}</td>
                  <td className="py-1 px-4">{u.phone}</td>
                  <td className="py-1 px-4 capitalize">{u.role}</td>
                  <td className="py-1 px-4 flex items-center gap-1">
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
            onChange={({ page, limit }) => fetchUsers({ page, limit })}
          />
        </div>
      )}
    </div>
  );
};

export default Users;
