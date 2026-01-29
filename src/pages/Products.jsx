import React, { useState, useEffect } from "react";
import { Listbox } from "@headlessui/react";
import { HiSelector } from "react-icons/hi";
import { HiOutlinePencil, HiOutlineTrash, HiOutlinePlus } from "react-icons/hi";
import ProductModal from "../components/ProductModal.jsx";
import {
  getProducts,
  createProduct,
  updateProduct,
  deleteProduct,
} from "../api";
import { useAuth } from "../context/useAuth";
import Pagination from "../components/Pagination";

const initialProducts = [];
const categoryOptions = [
  "Select category",
  "Category 1",
  "Category 2",
  "Category 3",
];
const supplierOptions = [
  "Select supplier",
  "Supplier 1",
  "Supplier 2",
  "Supplier 3",
];
const stockStatusOptions = [
  "All Stock Status",
  "In Stock",
  "Out of Stock",
  "Low Stock",
];

function ProductCategoryDropdown() {
  const [selected, setSelected] = useState(categoryOptions[0]);
  return (
    <Listbox value={selected} onChange={setSelected}>
      <div className="relative">
        <Listbox.Button className="cursor-pointer w-full bg-gray-50 border border-gray-200 rounded-lg px-3 py-2 text-left text-gray-800 flex items-center justify-between">
          <span>{selected}</span>
          <HiSelector className="w-5 h-5 text-gray-400 ml-2" />
        </Listbox.Button>
        <Listbox.Options className="absolute z-10 mt-1 w-full bg-white border border-gray-200 rounded-lg shadow-lg max-h-60 overflow-auto focus:outline-none">
          {categoryOptions.map((option) => (
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

function ProductSupplierDropdown() {
  const [selected, setSelected] = useState(supplierOptions[0]);
  return (
    <Listbox value={selected} onChange={setSelected}>
      <div className="relative">
        <Listbox.Button className="cursor-pointer w-full bg-gray-50 border border-gray-200 rounded-lg px-3 py-2 text-left text-gray-800 flex items-center justify-between">
          <span>{selected}</span>
          <HiSelector className="w-5 h-5 text-gray-400 ml-2" />
        </Listbox.Button>
        <Listbox.Options className="absolute z-10 mt-1 w-full bg-white border border-gray-200 rounded-lg shadow-lg max-h-60 overflow-auto focus:outline-none">
          {supplierOptions.map((option) => (
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

function ProductStockStatusDropdown() {
  const [selected, setSelected] = useState(stockStatusOptions[0]);
  return (
    <Listbox value={selected} onChange={setSelected}>
      <div className="relative">
        <Listbox.Button className="cursor-pointer w-full bg-gray-50 border border-gray-200 rounded-lg px-3 py-2 text-left text-gray-800 flex items-center justify-between">
          <span>{selected}</span>
          <HiSelector className="w-5 h-5 text-gray-400 ml-2" />
        </Listbox.Button>
        <Listbox.Options className="absolute z-10 mt-1 w-full bg-white border border-gray-200 rounded-lg shadow-lg max-h-60 overflow-auto focus:outline-none">
          {stockStatusOptions.map((option) => (
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

const Products = () => {
  const [products, setProducts] = useState(initialProducts);
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 10,
    totalItems: 0,
    totalPages: 1,
  });
  const [modalOpen, setModalOpen] = useState(false);
  const [editProduct, setEditProduct] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const { user } = useAuth();

  useEffect(() => {
    if (user) {
      fetchProducts(1, 10);
    }
  }, [user]);

  async function fetchProducts(page = 1, limit = 10) {
    setLoading(true);
    setError("");
    try {
      const res = await getProducts({ page, limit });
      setProducts(res.data.data);
      setPagination(res.data.pagination);
    } catch {
      setError("Failed to load products");
    } finally {
      setLoading(false);
    }
  }

  function handleAdd() {
    setEditProduct(null);
    setModalOpen(true);
  }

  function handleEdit(product) {
    // Ensure category and supplier are _id strings for the modal
    let categoryId = product.category;
    let supplier_id = product.supplier;
    // If product.category is an object, get its _id
    if (product.category && typeof product.category === "object") {
      categoryId = product.category._id || product.category.id || "";
    }
    // If product.supplier is an object, get its _id
    if (product.supplier && typeof product.supplier === "object") {
      supplier_id = product.supplier._id || product.supplier.id || "";
    }
    setEditProduct({ ...product, category: categoryId, supplier: supplier_id });
    setModalOpen(true);
  }

  async function handleSave(product) {
    setLoading(true);
    setError("");
    try {
      // Handle image upload (FormData) if image is a File
      let data = { ...product };
      if (product.image instanceof File) {
        const formData = new FormData();
        Object.entries(product).forEach(([key, value]) => {
          formData.append(key, value);
        });
        data = formData;
      }
      let res;
      if (editProduct) {
        res = await updateProduct(editProduct._id, data);
      } else {
        res = await createProduct(data);
      }
      if (res.data && res.data.success === false) {
        if (res.data.errors) {
          setError(res.data.errors.map((e) => e.msg).join(", "));
        } else {
          setError(res.data.error || "Failed to save product");
        }
        return;
      }
      fetchProducts(pagination.page, pagination.limit);
      setModalOpen(false);
    } catch {
      setError("Failed to save product");
    } finally {
      setLoading(false);
    }
  }

  async function handleDelete(id) {
    if (window.confirm("Delete this product?")) {
      setLoading(true);
      setError("");
      try {
        await deleteProduct(id);
        fetchProducts(pagination.page, pagination.limit);
      } catch {
        setError("Failed to delete product");
      } finally {
        setLoading(false);
      }
    }
  }

  return (
    <div>
      <ProductModal
        key={modalOpen ? (editProduct ? editProduct._id : "new") : "closed"}
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        onSave={handleSave}
        initial={editProduct}
      />
      <div className="flex items-center justify-between mb-8">
        <div className="flex flex-col">
          <h1 className="text-2xl font-semibold">Products</h1>
          <span className="text-gray-500">
            Manage your product catalog and inventory
          </span>
        </div>
        {user?.permission?.permissions?.includes("create_product") && (
          <button
            onClick={handleAdd}
            disabled={loading}
            className="bg-[#1e3a5f] hover:bg-[#16375b] text-white px-5 py-2 rounded-xl transition flex items-center gap-2 cursor-pointer"
          >
            <HiOutlinePlus className="text-md" /> Add Product
          </button>
        )}
      </div>
      <div className="bg-white rounded-xl p-6 mb-6 border border-gray-200">
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
          <input
            className="bg-gray-50 border border-gray-200 rounded-lg py-2 px-4 text-gray-700 min-w-0 w-full"
            placeholder="Search..."
          />
          <ProductCategoryDropdown />
          <ProductSupplierDropdown />
          <ProductStockStatusDropdown />
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
                <th className="py-3 px-4">Product Name</th>
                <th className="py-3 px-4">Category</th>
                <th className="py-3 px-4">Supplier</th>
                <th className="py-3 px-4 text-right">Stock</th>
                <th className="py-3 px-4 text-right">Price</th>
                <th className="py-3 px-4">Expiry Date</th>
                {user?.permission?.permissions?.includes("update_product") ||
                user?.permission?.permissions?.includes("delete_product") ? (
                  <th className="py-3 px-4">Actions</th>
                ) : null}
              </tr>
            </thead>
            <tbody>
              {products.map((p, index) => (
                <tr key={p._id} className="border-t border-gray-200">
                  <td className="py-1 px-4">{index + 1}</td>
                  <td className="py-1 px-4">{p.name}</td>
                  <td className="py-1 px-4">
                    <span className="text-blue-500/80">
                      {p.category?.name || p.category}
                    </span>
                  </td>
                  <td className="py-1 px-4">
                    <span className="text-blue-500/80">
                      {p.supplier?.name || p.supplier}
                    </span>
                  </td>
                  <td className="py-1 px-4 text-right">
                    <span
                      className={`text-base ${p.stock === 0 ? "text-red-600" : p.stock < 10 ? "text-orange-600" : "text-green-600"}`}
                    >
                      {p.stock} units
                    </span>
                  </td>
                  <td className="py-1 px-4 text-right">
                    ${Number(p.price).toFixed(2)}
                  </td>
                  <td className="py-1 px-4 text-center">{p.expiry}</td>
                  <td className="py-1 px-4 flex items-center gap-1">
                    {user?.permission?.permissions?.includes(
                      "update_product",
                    ) && (
                      <button
                        className="text-[#1e3a5f] font-semibold cursor-pointer p-2 rounded-full hover:bg-[#f1f5f9]"
                        title="Edit"
                        onClick={() => handleEdit(p)}
                      >
                        <HiOutlinePencil className="text-xl" />
                      </button>
                    )}
                    {user?.permission?.permissions?.includes(
                      "delete_product",
                    ) && (
                      <button
                        className="text-red-600 font-semibold cursor-pointer p-2 rounded-full hover:bg-[#f1f5f9]"
                        title="Delete"
                        onClick={() => handleDelete(p._id)}
                      >
                        <HiOutlineTrash className="text-xl" />
                      </button>
                    )}
                  </td>
                </tr>
              ))}
              {products.length === 0 && (
                <tr className="border-t border-gray-200">
                  <td colSpan="8" className="py-4 text-center text-gray-500">
                    No products found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        )}
      </div>
      {products.length > 0 && (
        <div className="flex justify-end mt-4">
          <Pagination
            total={pagination.totalItems}
            page={pagination.page}
            limit={pagination.limit}
            onChange={({ page, limit }) => fetchProducts({page, limit})}
          />
        </div>
      )}
    </div>
  );
};

export default Products;
