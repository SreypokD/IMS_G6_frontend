import React, { useState, useEffect } from "react";
import { HiOutlinePencil, HiOutlineTrash, HiOutlinePlus } from "react-icons/hi";
import ProductModal from "../components/ProductModal.jsx";
import {
  getProducts,
  createProduct,
  updateProduct,
  deleteProduct,
} from "../api";

const initialProducts = [];

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

  useEffect(() => {
    fetchProducts(1, 10);
  }, []);

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
    setEditProduct(product);
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
        <button
          onClick={handleAdd}
          disabled={loading}
          className="bg-[#1e3a5f] hover:bg-[#16375b] text-white px-5 py-2 rounded-xl transition flex items-center gap-2 cursor-pointer"
        >
          <HiOutlinePlus className="text-md" /> Create
        </button>
      </div>
      {error && <div className="mb-4 text-red-600 font-semibold">{error}</div>}
      <div className="bg-white rounded-xl p-6 mb-6 border border-gray-200">
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
          <input
            className="bg-gray-50 border border-gray-200 rounded-lg px-4 py-2 text-gray-700 min-w-0 w-full"
            placeholder="Search..."
          />
          <select className="bg-gray-50 border border-gray-200 rounded-lg px-4 py-2 text-gray-700 min-w-0 w-full">
            <option>Select category</option>
          </select>
          <select className="bg-gray-50 border border-gray-200 rounded-lg px-4 py-2 text-gray-700 min-w-0 w-full">
            <option>Select supplier</option>
          </select>
          <select className="bg-gray-50 border border-gray-200 rounded-lg px-4 py-2 text-gray-700 min-w-0 w-full">
            <option>All Stock Status</option>
          </select>
        </div>
      </div>
      <div className="bg-white rounded-xl overflow-x-auto border border-gray-200">
        {loading ? (
          <div className="p-8 text-center text-gray-500">Loading...</div>
        ) : (
          <table className="min-w-full text-sm align-middle">
            <thead>
              <tr className="bg-white text-gray-700">
                <th className="py-3 px-4 font-semibold text-left w-8">
                  <input
                    type="checkbox"
                    className="accent-blue-600 w-4 h-4"
                    disabled
                  />
                </th>
                <th className="py-3 px-4 font-semibold text-left whitespace-nowrap">
                  No.
                </th>
                <th className="py-3 px-4 font-semibold text-left whitespace-nowrap">
                  Product Name
                </th>
                <th className="py-3 px-4 font-semibold text-left whitespace-nowrap">
                  Category
                </th>
                <th className="py-3 px-4 font-semibold text-left whitespace-nowrap">
                  Supplier
                </th>
                <th className="py-3 px-4 font-semibold text-right whitespace-nowrap">
                  Stock
                </th>
                <th className="py-3 px-4 font-semibold text-right whitespace-nowrap">
                  Price
                </th>
                <th className="py-3 px-4 font-semibold text-left whitespace-nowrap">
                  Expiry Date
                </th>
                <th className="py-3 px-4 font-semibold text-left whitespace-nowrap">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {products.map((p, index) => (
                <tr key={p._id}>
                  <td className="py-3 px-4 text-center">
                    <input
                      type="checkbox"
                      className="accent-blue-600 w-4 h-4"
                      disabled
                    />
                  </td>
                  <td className="py-3 px-4 text-gray-800 whitespace-nowrap">
                    {index + 1}
                  </td>
                  <td className="py-3 px-4 text-gray-900 whitespace-nowrap">
                    {p.name}
                  </td>
                  <td className="py-3 px-4 text-blue-900 whitespace-nowrap">
                    <span className="text-blue-500/80">
                      {p.category?.name || p.category}
                    </span>
                  </td>
                  <td className="py-3 px-4 text-blue-900 whitespace-nowrap">
                    <span className="text-blue-500/80">
                      {p.supplier?.name || p.supplier}
                    </span>
                  </td>
                  <td className="py-3 px-4 text-right whitespace-nowrap">
                    <span
                      className={`text-sm ${p.stock === 0 ? "text-red-600" : p.stock < 10 ? "text-orange-600" : "text-green-600"}`}
                    >
                      {p.stock} units
                    </span>
                  </td>
                  <td className="py-3 px-4 text-right font-bold text-gray-900 whitespace-nowrap">
                    ${Number(p.price).toFixed(2)}
                  </td>
                  <td className="py-3 px-4 text-center text-blue-700/80 font-medium whitespace-nowrap">
                    {p.expiry}
                  </td>
                  <td className="py-3 px-4 whitespace-nowrap flex items-center gap-3 ">
                    <button
                      className="text-[#1e3a5f] font-semibold cursor-pointer"
                      title="Edit"
                      onClick={() => handleEdit(p)}
                    >
                      <HiOutlinePencil className="text-xl" />
                    </button>
                    <button
                      className="text-red-600 font-semibold cursor-pointer"
                      title="Delete"
                      onClick={() => handleDelete(p._id)}
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

export default Products;
