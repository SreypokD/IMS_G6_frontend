import React, { useEffect, useState } from "react";
import { HiOutlinePlus, HiOutlinePencil, HiOutlineTrash } from "react-icons/hi";
import { getUsers, createUser, updateUser, deleteUser } from "../api";

const initialUser = { name: "", email: "", role: "user", profile: "" };

const UserModal = ({ open, onClose, onSave, initial }) => {
  const [user, setUser] = useState(initial || initialUser);
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/10 backdrop-blur-sm">
      <div className="bg-white rounded-xl p-5 w-full max-w-md shadow-xl relative">
        <h2 className="text-xl font-bold mb-4">
          {initial ? "Edit User" : "Add User"}
        </h2>
        <form
          onSubmit={(e) => {
            e.preventDefault();
            onSave(user);
          }}
          className="space-y-4"
        >
          <div>
            <label className="block text-sm font-medium mb-1">Name</label>
            <input
              className="w-full border rounded-lg px-3 py-2"
              value={user.name}
              onChange={(e) => setUser({ ...user, name: e.target.value })}
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Email</label>
            <input
              className="w-full border rounded-lg px-3 py-2"
              type="email"
              value={user.email}
              onChange={(e) => setUser({ ...user, email: e.target.value })}
              required
              disabled={!!initial}
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Role</label>
            <select
              className="w-full border rounded-lg px-3 py-2"
              value={user.role}
              onChange={(e) => setUser({ ...user, role: e.target.value })}
              required
            >
              <option value="user">User</option>
              <option value="admin">Admin</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">
              Profile Image URL
            </label>
            <input
              className="w-full border rounded-lg px-3 py-2"
              value={user.profile}
              onChange={(e) => setUser({ ...user, profile: e.target.value })}
            />
          </div>
          <div className="w-full flex items-center justify-end gap-3 mt-4">
            <button
              type="button"
              className="px-5 py-2 bg-[#6b7280] text-white rounded-xl cursor-pointer"
              onClick={onClose}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-5 py-2 bg-[#1e3a5f] text-white rounded-xl cursor-pointer"
            >
              {initial ? "Update" : "Create"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

const Users = () => {
  const [users, setUsers] = useState([]);
  const [modalOpen, setModalOpen] = useState(false);
  const [editUser, setEditUser] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchUsers();
  }, []);
  async function fetchUsers() {
    setLoading(true);
    try {
      const res = await getUsers();
      setUsers(res.data.data);
    } finally {
      setLoading(false);
    }
  }
  async function handleSave(user) {
    setLoading(true);
    try {
      if (editUser) {
        await updateUser(editUser._id, user);
      } else {
        await createUser(user);
      }
      fetchUsers();
      setModalOpen(false);
      setEditUser(null);
    } finally {
      setLoading(false);
    }
  }
  async function handleDelete(id) {
    if (window.confirm("Delete this user?")) {
      setLoading(true);
      try {
        await deleteUser(id);
        fetchUsers();
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
        <button
          className="bg-[#1e3a5f] hover:bg-[#16375b] text-white px-5 py-2 rounded-xl transition flex items-center gap-2 cursor-pointer"
          onClick={() => {
            setEditUser(null);
            setModalOpen(true);
          }}
        >
          <HiOutlinePlus className="text-md" /> Create
        </button>
      </div>
      <div className="bg-white rounded-xl p-6 mb-6 border border-gray-200">
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
          <input
            className="bg-gray-50 border border-gray-200 rounded-lg px-4 py-2 text-gray-700 min-w-0 w-full"
            placeholder="Search..."
          />
        </div>
      </div>
      <div className="bg-white rounded-xl overflow-x-auto border border-gray-200">
        {loading ? (
          <div className="p-8 text-center text-gray-500">Loading...</div>
        ) : (
          <table className="min-w-full text-sm align-middle">
            <thead>
              <tr className="bg-white text-gray-700">
                <th className="py-3 px-4 font-semibold text-left">No.</th>
                <th className="py-3 px-4 font-semibold text-left">Name</th>
                <th className="py-3 px-4 font-semibold text-left">Email</th>
                <th className="py-3 px-4 font-semibold text-left">Role</th>
                <th className="py-3 px-4 font-semibold text-center">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {users.map((u, index) => (
                <tr key={u._id}>
                  <td className="py-3 px-4">{index + 1}</td>
                  <td className="py-3 px-4">{u.name}</td>
                  <td className="py-3 px-4">{u.email}</td>
                  <td className="py-3 px-4">{u.role}</td>
                  <td className="py-3 px-4 whitespace-nowrap flex items-center gap-3 ">
                    <button
                      className="text-blue-600 hover:text-blue-800 font-semibold cursor-pointer"
                      title="Edit"
                      onClick={() => {
                        setEditUser(u);
                        setModalOpen(true);
                      }}
                    >
                      <HiOutlinePencil className="text-xl" />
                    </button>
                    <button
                      className="text-red-600 hover:text-red-800 font-semibold cursor-pointer"
                      title="Delete"
                      onClick={() => handleDelete(u._id)}
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

export default Users;
