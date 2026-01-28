import React, { useEffect, useState, useRef } from "react";
import {
  HiOutlinePlus,
  HiOutlinePencil,
  HiOutlineTrash,
  HiXCircle,
  HiOutlineDocumentText,
} from "react-icons/hi";
import { getUsers, createUser, updateUser, deleteUser } from "../api";

const initialUser = {
  first_name: "",
  last_name: "",
  email: "",
  password: "",
  role: "user",
  phone: "",
  address: {
    street: "",
    house: "",
    village: "",
    commune: "",
    district: "",
    province: "",
    country: "",
  },
  profile: "",
};

const UserModal = ({ open, onClose, onSave, initial }) => {
  const [user, setUser] = useState(initial || initialUser);
  const [profilePreview, setProfilePreview] = useState(user.profile || "");
  const fileInputRef = useRef();
  // Handle file upload
  const handleProfileUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    // Preview
    const reader = new FileReader();
    reader.onload = (ev) => {
      setProfilePreview(ev.target.result);
    };
    reader.readAsDataURL(file);
    // Upload to server (replace with your API endpoint)
    const formData = new FormData();
    formData.append("file", file);
    try {
      const res = await fetch("http://localhost:5001/api/upload", {
        method: "POST",
        body: formData,
      });
      const data = await res.json();
      if (data.url) {
        setUser({ ...user, profile: data.url });
      }
    } catch (err) {
      alert("Upload failed");
    }
  };
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/10 backdrop-blur-sm">
      <div className="bg-white rounded-2xl p-5 w-full max-w-[40%] max-h-[80vh] shadow-xl relative">
        <h2 className="text-2xl font-bold mb-6 text-center">
          {initial ? "Edit User" : "Add User"}
        </h2>
        <form className="space-y-5 overflow-auto max-h-[50vh] px-1">
          <div className="col-span-2 mb-2">
            <h3 className="font-semibold nametext-lg mb-2 text-[#1e3a5f]">
              Basic Info
            </h3>
            <div className="mb-3 grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-1">
                  First Name
                </label>
                <input
                  className="w-full border rounded-lg px-3 py-2"
                  value={user.first_name}
                  onChange={(e) =>
                    setUser({ ...user, first_name: e.target.value })
                  }
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">
                  Last Name
                </label>
                <input
                  className="w-full border rounded-lg px-3 py-2"
                  value={user.last_name}
                  onChange={(e) =>
                    setUser({ ...user, last_name: e.target.value })
                  }
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
              {!initial && (
                <div>
                  <label className="block text-sm font-medium mb-1">
                    Password
                  </label>
                  <input
                    className="w-full border rounded-lg px-3 py-2"
                    type="password"
                    value={user.password || ""}
                    onChange={(e) =>
                      setUser({ ...user, password: e.target.value })
                    }
                    required
                    minLength={6}
                    placeholder="Enter password"
                  />
                </div>
              )}
            </div>
          </div>
          <div className="col-span-2 mb-2">
            <h3 className="font-semibold text-lg mb-2 text-[#1e3a5f]">
              Contact & Role
            </h3>
            <div className="mb-3 grid grid-cols-2 gap-4">
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
                <label className="block text-sm font-medium mb-1">Phone</label>
                <input
                  className="w-full border rounded-lg px-3 py-2"
                  value={user.phone}
                  onChange={(e) => setUser({ ...user, phone: e.target.value })}
                />
              </div>
            </div>
          </div>
          <div className="col-span-2 mb-2">
            <h3 className="font-semibold text-lg mb-2 text-[#1e3a5f]">
              Address
            </h3>
            <div className="mb-3 grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-1">Street</label>
                <input
                  className="w-full border rounded-lg px-3 py-2"
                  value={user.address.street}
                  onChange={(e) =>
                    setUser({
                      ...user,
                      address: { ...user.address, street: e.target.value },
                    })
                  }
                />
              </div>
              <div>
                <label className="block mb-1">House</label>
                <input
                  type="text"
                  className="w-full border rounded px-3 py-2 mb-2"
                  value={user.address.house}
                  onChange={(e) =>
                    setUser({
                      ...user,
                      address: { ...user.address, house: e.target.value },
                    })
                  }
                />
              </div>
              <div>
                <label className="block mb-1">Village</label>
                <input
                  type="text"
                  className="w-full border rounded px-3 py-2 mb-2"
                  value={user.address.village}
                  onChange={(e) =>
                    setUser({
                      ...user,
                      address: { ...user.address, village: e.target.value },
                    })
                  }
                />
              </div>
              <div>
                <label className="block mb-1">Commune</label>
                <input
                  type="text"
                  className="w-full border rounded px-3 py-2 mb-2"
                  value={user.address.commune}
                  onChange={(e) =>
                    setUser({
                      ...user,
                      address: { ...user.address, commune: e.target.value },
                    })
                  }
                />
              </div>
              <div>
                <label className="block mb-1">District</label>
                <input
                  type="text"
                  className="w-full border rounded px-3 py-2 mb-2"
                  value={user.address.district}
                  onChange={(e) =>
                    setUser({
                      ...user,
                      address: { ...user.address, district: e.target.value },
                    })
                  }
                />
              </div>
              <div>
                <label className="block mb-1">City/Province</label>
                <input
                  type="text"
                  className="w-full border rounded px-3 py-2 mb-2"
                  value={user.address.province}
                  onChange={(e) =>
                    setUser({
                      ...user,
                      address: { ...user.address, province: e.target.value },
                    })
                  }
                />
              </div>
              <div>
                <label className="block mb-1">Country</label>
                <input
                  type="text"
                  className="w-full border rounded px-3 py-2 mb-2"
                  value={user.address.country}
                  onChange={(e) =>
                    setUser({
                      ...user,
                      address: { ...user.address, country: e.target.value },
                    })
                  }
                />
              </div>
            </div>
          </div>
          <div className="col-span-2 mb-2">
            <h3 className="font-semibold text-lg mb-2 text-[#1e3a5f]">
              Profile
            </h3>
            <div className="mb-3 grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-1">
                  Profile Image
                </label>
                <input
                  type="file"
                  accept="image/*"
                  ref={fileInputRef}
                  className="w-full border rounded-lg px-3 py-2 mb-2 cursor-pointer"
                  onChange={handleProfileUpload}
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">
                  Or paste image URL
                </label>
                <input
                  className="w-full border rounded-lg px-3 py-2"
                  value={user.profile}
                  onChange={(e) => {
                    setUser({ ...user, profile: e.target.value });
                    setProfilePreview(e.target.value);
                  }}
                />
              </div>
            </div>
            {profilePreview && (
              <div className="flex justify-center mb-2">
                <img
                  src={profilePreview}
                  alt="Profile Preview"
                  className="h-50 w-50 rounded-lg object-cover"
                  onError={(e) => {
                    e.target.style.display = "none";
                  }}
                />
              </div>
            )}
          </div>
        </form>
        <div className="col-span-2 w-full flex items-center justify-end gap-3 mt-4">
          <button
            type="button"
            className="px-5 py-2 bg-[#f8f8f8] hover:bg-[#e5e7eb] text-gray-black rounded-xl cursor-pointer  flex items-center gap-2"
            onClick={onClose}
          >
            <HiXCircle className="inline-block" /> Cancel
          </button>
          <button
            type="button"
            className="px-5 py-2 bg-[#1e3a5f] hover:bg-[#16375b] text-white rounded-xl cursor-pointer flex items-center gap-2"
            onClick={() => {
              if (!user.first_name.trim() || !user.last_name.trim())
                return alert("First and last name are required");
              if (
                !user.email.trim() ||
                !/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(user.email)
              )
                return alert("Valid email is required");
              if (!initial && (!user.password || user.password.length < 6))
                return alert("Password (min 6 chars) required");
              onSave(user);
            }}
          >
            <HiOutlineDocumentText className="inline-block" />
            {initial ? "Update" : "Create"}
          </button>
        </div>
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
                <th className="py-3 px-4 font-semibold text-left">Phone</th>
                <th className="py-3 px-4 font-semibold text-left">Role</th>
                <th className="py-3 px-4 font-semibold text-left">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {users.map((u, index) => (
                <tr key={u._id}>
                  <td className="py-3 px-4">{index + 1}</td>
                  <td className="py-3 px-4">
                    {u.first_name} {u.last_name}
                  </td>
                  <td className="py-3 px-4">{u.email}</td>
                  <td className="py-3 px-4">{u.phone}</td>
                  <td className="py-3 px-4 capitalize">{u.role}</td>
                  <td className="py-3 px-4 whitespace-nowrap flex items-left gap-3 ">
                    <button
                      className="text-[#1e3a5f] font-semibold cursor-pointer"
                      title="Edit"
                      onClick={() => {
                        setEditUser(u);
                        setModalOpen(true);
                      }}
                    >
                      <HiOutlinePencil className="text-xl" />
                    </button>
                    <button
                      className="text-red-600 font-semibold cursor-pointer"
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
