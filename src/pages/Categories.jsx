import React, { useEffect, useState } from "react";
import { HiOutlinePlus, HiOutlinePencil, HiOutlineTrash } from "react-icons/hi";
import CategoryModal from "../components/CategoryModal";
import {
  getCategories,
  createCategory,
  updateCategory,
  deleteCategory,
} from "../api";
import { useAuth } from "../context/useAuth";

const Categories = () => {
  const [categories, setCategories] = useState([]);
  const [modalOpen, setModalOpen] = useState(false);
  const [editCategory, setEditCategory] = useState(null);
  const [loading, setLoading] = useState(false);
  const { user } = useAuth();

  useEffect(() => {
    fetchCategories();
  }, []);

  async function fetchCategories() {
    setLoading(true);
    try {
      const res = await getCategories();
      setCategories(res.data.data);
    } finally {
      setLoading(false);
    }
  }

  async function handleSave(category) {
    setLoading(true);
    try {
      if (editCategory) {
        await updateCategory(editCategory._id, category);
      } else {
        await createCategory(category);
      }
      fetchCategories();
      setModalOpen(false);
      setEditCategory(null);
    } finally {
      setLoading(false);
    }
  }

  async function handleDelete(id) {
    if (window.confirm("Delete this category?")) {
      setLoading(true);
      try {
        await deleteCategory(id);
        fetchCategories();
      } finally {
        setLoading(false);
      }
    }
  }

  return (
    <div>
      <CategoryModal
        key={modalOpen ? (editCategory ? editCategory._id : "new") : "closed"}
        open={modalOpen}
        onClose={() => {
          setModalOpen(false);
          setEditCategory(null);
        }}
        onSave={handleSave}
        initial={editCategory}
      />
      <div className="flex items-center justify-between mb-8">
        <div className="flex flex-col">
          <h1 className="text-2xl font-semibold">Categories Management</h1>
          <span className="text-gray-500">
            Organize and manage product categories
          </span>
        </div>
        {user?.permission?.permissions?.includes("create_category") && (
          <button
            className="bg-[#1e3a5f] hover:bg-[#16375b] text-white px-5 py-2 rounded-xl transition flex items-center gap-2 cursor-pointer"
            onClick={() => {
              setEditCategory(null);
              setModalOpen(true);
            }}
          >
            <HiOutlinePlus className="text-md" /> Add Category
          </button>
        )}
      </div>
      <div className="bg-white rounded-xl p-6 mb-6 border border-gray-200">
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
          <input
            className="bg-gray-50 border border-gray-200 rounded-lg py-3 px-4 text-gray-700 min-w-0 w-full"
            placeholder="Search..."
          />
          <select className="bg-gray-50 border border-gray-200 rounded-lg py-3 px-4 text-gray-700 min-w-0 w-full">
            <option>All Status</option>
          </select>
          <select className="bg-gray-50 border border-gray-200 rounded-lg py-3 px-4 text-gray-700 min-w-0 w-full">
            <option>All Locations</option>
          </select>
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
                {user?.permission?.permissions?.includes("update_category") ||
                user?.permission?.permissions?.includes("delete_category") ? (
                  <th className="py-3 px-4">Actions</th>
                ) : null}
              </tr>
            </thead>
            <tbody>
              {categories.map((cat, index) => (
                <tr key={cat._id} className="border-t border-gray-200">
                  <td className="py-3 px-4">{index + 1}</td>
                  <td className="py-3 px-4">{cat.name}</td>
                  <td className="py-3 px-4">{cat.description}</td>
                  <td className="py-3 px-4 flex items-center gap-3 ">
                    {user?.permission?.permissions?.includes(
                      "update_category",
                    ) && (
                      <button
                        className="text-[#1e3a5f] font-semibold cursor-pointer"
                        title="Edit"
                        onClick={() => {
                          setEditCategory(cat);
                          setModalOpen(true);
                        }}
                      >
                        <HiOutlinePencil className="text-xl" />
                      </button>
                    )}
                    {user?.permission?.permissions?.includes(
                      "delete_category",
                    ) && (
                      <button
                        className="text-red-600 font-semibold cursor-pointer"
                        title="Delete"
                        onClick={() => handleDelete(cat._id)}
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

export default Categories;
