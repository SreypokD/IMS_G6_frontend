import React, { useState, useEffect } from "react";
import PermissionModal from "../components/PermissionModal";
import { HiOutlinePencil, HiOutlineTrash, HiOutlinePlus } from "react-icons/hi";
import {
  getPermissions,
  createPermission,
  updatePermission,
  deletePermission,
} from "../api";
import { useAuth } from "../context/useAuth";

const Permissions = () => {
  const [permissions, setPermissions] = useState([]);
  const [modalOpen, setModalOpen] = useState(false);
  const [editPermission, setEditPermission] = useState(null);
  const [loading, setLoading] = useState(false);
  const { user } = useAuth();

  useEffect(() => {
    fetchPermissions();
  }, []);

  // Fetch permissions from API
  async function fetchPermissions() {
    setLoading(true);
    try {
      const res = await getPermissions();
      setPermissions(res.data.data);
    } finally {
      setLoading(false);
    }
  }

  // Save permission (create or update)
  async function handleSave(permission) {
    setLoading(true);
    try {
      if (editPermission) {
        await updatePermission(editPermission._id, permission);
      } else {
        await createPermission(permission);
      }
      fetchPermissions();
      setModalOpen(false);
      setEditPermission(null);
    } finally {
      setLoading(false);
    }
  }

  // Delete permission
  async function handleDelete(id) {
    if (window.confirm("Delete this permission?")) {
      setLoading(true);
      try {
        await deletePermission(id);
        fetchPermissions();
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
        initial={editPermission}
      />
      <div className="flex items-center justify-between mb-8">
        <div className="flex flex-col">
          <h1 className="text-2xl font-semibold">Permissions</h1>
          <span className="text-gray-500">Manage permissions</span>
        </div>
        {user?.permission?.permissions?.includes("create_permission") && (
          <button
            className="bg-[#1e3a5f] hover:bg-[#16375b] text-white px-5 py-2 rounded-xl transition flex items-center gap-2 cursor-pointer"
            onClick={() => {
              setEditPermission(null);
              setModalOpen(true);
            }}
          >
            <HiOutlinePlus className="text-md" /> Add Permission
          </button>
        )}
      </div>
      <div className="bg-white rounded-xl p-6 mb-6 border border-gray-200">
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
          <input
            className="bg-gray-50 border border-gray-200 rounded-lg py-3 px-4 text-gray-700 min-w-0 w-full"
            placeholder="Search..."
          />
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
                <th className="py-3 px-4">Description</th>
                {user?.permission?.permissions?.includes("update_permission") ||
                user?.permission?.permissions?.includes("delete_permission") ? (
                  <th className="py-3 px-4">Actions</th>
                ) : null}
              </tr>
            </thead>
            <tbody>
              {permissions.map((perm, index) => (
                <tr key={perm._id} className="border-t border-gray-200">
                  <td className="py-3 px-4">{index + 1}</td>
                  <td className="py-3 px-4">{perm.name}</td>
                  <td className="py-3 px-4 whitespace-nowrap">
                    {perm.description}
                  </td>
                  <td className="py-3 px-4 whitespace-nowrap flex items-left gap-3">
                    {user?.permission?.permissions?.includes(
                      "update_permission",
                    ) && (
                      <button
                        className="text-[#1e3a5f] font-semibold cursor-pointer"
                        title="Edit"
                        onClick={() => {
                          setEditPermission(perm);
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
                        className="text-red-600 font-semibold cursor-pointer"
                        title="Delete"
                        onClick={() => handleDelete(perm._id)}
                      >
                        <HiOutlineTrash className="text-xl" />
                      </button>
                    )}
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

export default Permissions;
