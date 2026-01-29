import React, { useEffect, useState } from "react";
import { Listbox } from "@headlessui/react";
import { HiSelector } from "react-icons/hi";
import { HiOutlinePlus, HiOutlinePencil, HiOutlineTrash } from "react-icons/hi";
import CategoryModal from "../components/CategoryModal";
import {
  getCategories,
  createCategory,
  updateCategory,
  deleteCategory,
} from "../api";
import { useAuth } from "../context/useAuth";
import Pagination from "../components/Pagination";

// Custom dropdowns for Categories page
const statusOptions = ["All Status", "Active", "Inactive"];
const locationOptions = [
  "All Locations",
  "Warehouse 1",
  "Warehouse 2",
  "Storefront",
];

function CategoryStatusDropdown() {
  const [selected, setSelected] = useState(statusOptions[0]);
  return (
    <Listbox value={selected} onChange={setSelected}>
      <div className="relative">
        <Listbox.Button className="cursor-pointer w-full bg-gray-50 border border-gray-200 rounded-lg px-3 py-2 text-left text-gray-800 flex items-center justify-between">
          <span>{selected}</span>
          <HiSelector className="w-5 h-5 text-gray-400 ml-2" />
        </Listbox.Button>
        <Listbox.Options className="absolute z-10 mt-1 w-full bg-white border border-gray-200 rounded-lg shadow-lg max-h-60 overflow-auto focus:outline-none">
          {statusOptions.map((option) => (
            <Listbox.Option
              key={option}
              value={option}
              className={({ active, selected }) =>
                `px-4 py-2 cursor-pointer ${active ? "text-[#64748b] hover:bg-[#f1f5f9] hover:text-black" : "text-gray-900"} ${selected ? "font-semibold bg-blue-50" : ""}`
              }
            >
              {option}
            </Listbox.Option>
          ))}
        </Listbox.Options>
      </div>
    </Listbox>
  );
}

function CategoryLocationDropdown() {
  const [selected, setSelected] = useState(locationOptions[0]);
  return (
    <Listbox value={selected} onChange={setSelected}>
      <div className="relative">
        <Listbox.Button className="cursor-pointer w-full bg-gray-50 border border-gray-200 rounded-lg px-3 py-2 text-left text-gray-800 flex items-center justify-between">
          <span>{selected}</span>
          <HiSelector className="w-5 h-5 text-gray-400 ml-2" />
        </Listbox.Button>
        <Listbox.Options className="absolute z-10 mt-1 w-full bg-white border border-gray-200 rounded-lg shadow-lg max-h-60 overflow-auto focus:outline-none">
          {locationOptions.map((option) => (
            <Listbox.Option
              key={option}
              value={option}
              className={({ active, selected }) =>
                `px-4 py-2 cursor-pointer ${active ? "text-[#64748b] hover:bg-[#f1f5f9] hover:text-black" : "text-gray-900"} ${selected ? "font-semibold bg-blue-50" : ""}`
              }
            >
              {option}
            </Listbox.Option>
          ))}
        </Listbox.Options>
      </div>
    </Listbox>
  );
}

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

  useEffect(() => {
    if (user) {
      fetchCategories(1, 10);
    }
  }, [user]);

  async function fetchCategories(page = 1, limit = 10) {
    setLoading(true);
    setError("");
    try {
      const res = await getCategories({ page, limit });
      setCategories(res.data.data);
      setPagination(res.data.pagination);
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
      } else {
        await createCategory(category);
      }
      fetchCategories();
      setModalOpen(false);
      setEditCategory(null);
    } catch {
      setError("Failed to save category");
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
      } catch {
        setError("Failed to delete category");
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
            className="bg-gray-50 border border-gray-200 rounded-lg py-2 px-4 text-gray-700 min-w-0 w-full"
            placeholder="Search..."
          />
          <CategoryStatusDropdown />
          <CategoryLocationDropdown />
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
                <th className="py-3 px-4">Description</th>
                {user?.permission?.permissions?.includes("update_category") ||
                user?.permission?.permissions?.includes("delete_category") ? (
                  <th className="py-3 px-4">Actions</th>
                ) : null}
              </tr>
            </thead>
            <tbody>
              {categories.map((cat, index) => (
                <tr key={cat._id} className=" border-t border-gray-200 ">
                  <td className="py-1 px-4">{index + 1}</td>
                  <td className="py-1 px-4">{cat.name}</td>
                  <td className="py-1 px-4">{cat.description}</td>
                  <td className="py-1 px-4 flex items-center gap-1">
                    {user?.permission?.permissions?.includes(
                      "update_category",
                    ) && (
                      <button
                        className="text-[#1e3a5f] font-semibold cursor-pointer p-2 rounded-full hover:bg-[#f1f5f9]"
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
                        className="text-red-600 font-semibold cursor-pointer p-2 rounded-full hover:bg-[#f1f5f9]"
                        title="Delete"
                        onClick={() => handleDelete(cat._id)}
                      >
                        <HiOutlineTrash className="text-xl" />
                      </button>
                    )}
                  </td>
                </tr>
              ))}
              {categories.length === 0 && (
                <tr className="border-t border-gray-200">
                  <td colSpan="4" className="py-4 text-center text-gray-500">
                    No categories found.
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
            onChange={({ page, limit }) => fetchCategories({page, limit})}
          />
        </div>
      )}
    </div>
  );
};

export default Categories;
