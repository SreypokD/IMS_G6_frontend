import React, { useEffect, useState } from "react";
import {
  HiOutlinePlus,
  HiOutlinePencil,
  HiOutlineTrash,
  HiOutlineFilter,
} from "react-icons/hi";
import CategoryModal from "../components/CategoryModal";
import {
  getCategories,
  createCategory,
  updateCategory,
  deleteCategory,
} from "../api";
import { useAuth } from "../contexts/auth/useAuth";
import { useDialog } from "../contexts/dialog/useDialog.js";
import Pagination from "../components/Pagination";
import NoDataFound from "../components/NoDataFound";

const Categories = () => {
  const [categories, setCategories] = useState([]);
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 10,
    totalItems: 0,
    totalPages: 1,
  });
  const [modalOpen, setModalOpen] = useState(false);
  const [editCategory, setEditCategory] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const { user } = useAuth();
  const dialog = useDialog();

  useEffect(() => {
    if (user) {
      fetchCategories(pagination.page, pagination.limit);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user]);

  async function fetchCategories(
    page = pagination.page,
    limit = pagination.limit,
  ) {
    setLoading(true);
    setError("");
    try {
      const res = await getCategories({ page, limit });
      setCategories(res.data.data);
      setPagination((prev) => ({
        ...prev,
        ...res.data.pagination,
        page,
        limit,
      }));
    } catch {
      setError("Failed to load categories");
    } finally {
      setLoading(false);
    }
  }

  async function handleSave(category) {
    setLoading(true);
    setError("");
    try {
      if (editCategory) {
        await updateCategory(editCategory._id, category);
        await dialog.success("Category updated successfully.");
      } else {
        await createCategory(category);
        await dialog.success("Category created successfully.");
      }
      fetchCategories();
      setModalOpen(false);
      setEditCategory(null);
    } catch {
      await dialog.error("Failed to save category.");
    } finally {
      setLoading(false);
    }
  }

  async function handleDelete(id) {
    const confirmed = await dialog.ask({
      type: "confirm",
      title: "Delete Category",
      message: "Are you sure you want to delete this category?",
      confirmText: "Delete",
      cancelText: "Cancel",
    });
    if (!confirmed) return;
    setLoading(true);
    try {
      await deleteCategory(id);
      await dialog.success("Category deleted successfully.");
      fetchCategories();
    } catch {
      await dialog.error("Failed to delete category.");
    } finally {
      setLoading(false);
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
            className="bg-[#1e3a5f] hover:bg-[#16375b] text-white px-6 py-2 rounded-xl focus:outline-none flex items-center gap-2 cursor-pointer"
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
        <h3 className="flex items-center gap-2 font-semibold text-lg mb-2 text-black">
          <HiOutlineFilter className="inline-block text-xl text-black" />
          <span>Filters</span>
        </h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
          <div>
            <label className="block text-gray-700 text-base font-bold mb-2">
              Search
            </label>
            <input
              className="bg-gray-50 border border-gray-200 rounded-lg py-2 px-4 text-gray-700 min-w-0 w-full"
              placeholder="Search..."
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
          <table className="min-w-full text-left text-base align-middle">
            <thead>
              <tr className="bg-white">
                <th className="p-3">No.</th>
                <th className="p-3">Name</th>
                <th className="p-3">Description</th>
                {user?.permission?.permissions?.includes("update_category") ||
                user?.permission?.permissions?.includes("delete_category") ? (
                  <th className="p-3">Actions</th>
                ) : null}
              </tr>
            </thead>
            <tbody>
              {categories.map((category, index) => (
                <tr key={category._id}>
                  <td className="px-3 py-1">
                    {index + 1 + (pagination.page - 1) * pagination.limit}
                  </td>
                  <td className="px-3 py-1">{category.name}</td>
                  <td className="px-3 py-1">{category.description}</td>
                  <td className="px-3 py-1 flex items-center gap-1">
                    {user?.permission?.permissions?.includes(
                      "update_category",
                    ) && (
                      <button
                        className="text-[#1e3a5f] font-semibold cursor-pointer p-2 rounded-full hover:bg-[#f1f5f9]"
                        title="Edit"
                        onClick={() => {
                          setEditCategory(category);
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
                        className="text-red-600 font-semibold cursor-pointer p-2 rounded-full hover:bg-[#f1f5f9]"
                        title="Delete"
                        onClick={() => handleDelete(category._id)}
                      >
                        <HiOutlineTrash className="text-xl" />
                      </button>
                    )}
                  </td>
                </tr>
              ))}
              {categories.length === 0 && (
                <tr>
                  <td colSpan="4">
                    <NoDataFound message="No categories found." />
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        )}
      </div>
      {categories.length > 0 && (
        <div className="flex justify-end mt-4">
          <Pagination
            total={pagination.totalItems}
            page={pagination.page}
            limit={pagination.limit}
            onChange={({ page, limit }) => {
              setPagination((prev) => ({ ...prev, page, limit }));
              fetchCategories(page, limit);
            }}
          />
        </div>
      )}
    </div>
  );
};

export default Categories;
