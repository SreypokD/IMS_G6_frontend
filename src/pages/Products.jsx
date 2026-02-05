import React, { useState, useEffect } from "react";
import { Listbox } from "@headlessui/react";
import {
  HiSelector,
  HiOutlinePencil,
  HiOutlineTrash,
  HiOutlinePlus,
  HiOutlineEye,
  HiOutlineFilter,
} from "react-icons/hi";
import ProductModal from "../components/ProductModal.jsx";
import {
  getProducts,
  createProduct,
  updateProduct,
  deleteProduct,
  getCategories,
  getSuppliers,
} from "../api";
import { useDialog } from "../contexts/dialog/useDialog";
import { useAuth } from "../contexts/auth/useAuth.js";
import Pagination from "../components/Pagination";
import NoDataFound from "../components/NoDataFound";

const initialProducts = [];
const statusOptions = [
  { value: "", label: "All Statuses" },
  { value: "in_stock", label: "In Stock" },
  { value: "out_of_stock", label: "Out of Stock" },
  { value: "low_stock", label: "Low Stock" },
];

function CategoryDropdown({
  selected,
  setSelected,
  categoryOptions: categories,
}) {
  return (
    <Listbox value={selected} onChange={setSelected}>
      <div className="relative">
        <Listbox.Button className="cursor-pointer w-full bg-gray-50 border border-gray-200 rounded-lg px-3 py-2 text-left text-gray-800 flex items-center justify-between">
          <span>
            {categories.find((p) => p._id === selected)?.name ||
              "All Categories"}
          </span>
          <HiSelector className="w-5 h-5 text-gray-400 ml-2" />
        </Listbox.Button>
        <Listbox.Options className="absolute z-10 mt-1 w-full bg-white border border-gray-200 rounded-lg shadow-lg max-h-60 overflow-auto focus:outline-none">
          <Listbox.Option
            className="px-4 py-2 cursor-pointer text-black hover:bg-[#f1f5f9]"
            value=""
          >
            <span>All Categories</span>
          </Listbox.Option>
          {categories.map((option) => (
            <Listbox.Option
              key={option._id}
              value={option._id}
              className={({ selected }) =>
                `px-4 py-2 cursor-pointer text-black hover:bg-[#f1f5f9] ${selected ? "bg-blue-50" : ""}`
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

function SupplierDropdown({
  selected,
  setSelected,
  supplierOptions: suppliers,
}) {
  return (
    <Listbox value={selected} onChange={setSelected}>
      <div className="relative">
        <Listbox.Button className="cursor-pointer w-full bg-gray-50 border border-gray-200 rounded-lg px-3 py-2 text-left text-gray-800 flex items-center justify-between">
          <span>
            {suppliers.find((p) => p._id === selected)?.company_name ||
              "All Suppliers"}
          </span>
          <HiSelector className="w-5 h-5 text-gray-400 ml-2" />
        </Listbox.Button>
        <Listbox.Options className="absolute z-10 mt-1 w-full bg-white border border-gray-200 rounded-lg shadow-lg max-h-60 overflow-auto focus:outline-none">
          <Listbox.Option
            className="px-4 py-2 cursor-pointer text-black hover:bg-[#f1f5f9]"
            value=""
          >
            <span>All Suppliers</span>
          </Listbox.Option>
          {suppliers.map((option) => (
            <Listbox.Option
              key={option._id}
              value={option._id}
              className={({ selected }) =>
                `px-4 py-2 cursor-pointer text-black hover:bg-[#f1f5f9] ${selected ? "bg-blue-50" : ""}`
              }
            >
              {option.company_name}
            </Listbox.Option>
          ))}
        </Listbox.Options>
      </div>
    </Listbox>
  );
}

function StatusDropdown({ selected, setSelected, statusOptions }) {
  return (
    <Listbox value={selected} onChange={setSelected}>
      <div className="relative">
        <Listbox.Button className="cursor-pointer w-full bg-gray-50 border border-gray-200 rounded-lg px-3 py-2 text-left text-gray-800 flex items-center justify-between">
          <span>
            {statusOptions.find((p) => p.value === selected)?.label ||
              "All Statuses"}
          </span>
          <HiSelector className="w-5 h-5 text-gray-400 ml-2" />
        </Listbox.Button>
        <Listbox.Options className="absolute z-10 mt-1 w-full bg-white border border-gray-200 rounded-lg shadow-lg max-h-60 overflow-auto focus:outline-none">
          {statusOptions.map((option) => (
            <Listbox.Option
              key={option.value}
              value={option.value}
              className={({ selected }) =>
                `px-4 py-2 cursor-pointer text-black hover:bg-[#f1f5f9] ${selected ? "bg-blue-50" : ""}`
              }
            >
              {option.label}
            </Listbox.Option>
          ))}
        </Listbox.Options>
      </div>
    </Listbox>
  );
}

const Products = () => {
  const [products, setProducts] = useState(initialProducts);
  const [viewProduct, setViewProduct] = useState(null);
  const [search, setSearch] = useState("");
  const [categories, setCategories] = useState([]);
  const [category, setCategory] = useState("");
  const [suppliers, setSuppliers] = useState([]);
  const [supplier, setSupplier] = useState("");
  const [status, setStatus] = useState("");

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
  const dialog = useDialog();
  const { user } = useAuth();

  useEffect(() => {
    getCategories().then((res) => setCategories(res.data.data || []));
    getSuppliers().then((res) => setSuppliers(res.data.data || []));
  }, []);

  useEffect(() => {
    if (user) {
      const delayDebounceFn = setTimeout(() => {
        fetchProducts(1, pagination.limit, search, category, supplier, status);
        setPagination((prev) => ({ ...prev, page: 1 }));
      }, 500);
      return () => clearTimeout(delayDebounceFn);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user, search, category, supplier, status]);

  async function fetchProducts(
    page = 1,
    limit = 10,
    search = "",
    category = "",
    supplier = "",
    status = "",
  ) {
    setLoading(true);
    setError("");
    try {
      const params = { page, limit };
      if (search) params.search = search;
      if (category) params.category = category;
      if (supplier) params.supplier = supplier;
      if (status) params.status = status;
      const res = await getProducts(params);
      setProducts(res.data.data);
      setPagination((prev) => ({
        ...prev,
        ...res.data.pagination,
        page,
        limit,
      }));
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
    // Ensure category and supplier are _id strings for the modal, handle nulls
    let category = "";
    let supplier = "";
    if (product.category && typeof product.category === "object") {
      category = product.category._id || "";
    } else if (typeof product.category === "string") {
      category = product.category;
    }
    if (product.supplier && typeof product.supplier === "object") {
      supplier = product.supplier._id || "";
    } else if (typeof product.supplier === "string") {
      supplier = product.supplier;
    }
    setEditProduct({ ...product, category: category, supplier: supplier });
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
          dialog.error(
            res.data.errors.map((e) => e.msg).join(", ") ||
              "Failed to save product",
          );
        } else {
          setError(res.data.error || "Failed to save product");
          dialog.error(res.data.error || "Failed to save product");
        }
        return;
      }
      dialog.success(
        editProduct
          ? "Product updated successfully"
          : "Product created successfully",
      );
      fetchProducts(pagination.page, pagination.limit);
      setModalOpen(false);
    } catch {
      setError("Failed to save product");
      dialog.error("Failed to save product");
    } finally {
      setLoading(false);
    }
  }

  function handleView(product) {
    // Always open in view mode (viewOnly) for view action
    setEditProduct(null);
    setViewProduct(product);
    setModalOpen(true);
  }

  async function handleDelete(id) {
    const confirmed = await dialog.ask({
      type: "confirm",
      title: "Delete Product",
      message: "Are you sure you want to delete this product?",
      confirmText: "Delete",
      cancelText: "Cancel",
    });
    if (confirmed) {
      setLoading(true);
      setError("");
      try {
        await deleteProduct(id);
        dialog.success("Product deleted successfully");
        fetchProducts(pagination.page, pagination.limit);
      } catch {
        setError("Failed to delete product");
        dialog.error("Failed to delete product");
      } finally {
        setLoading(false);
      }
    }
  }

  return (
    <div>
      <ProductModal
        key={
          modalOpen
            ? editProduct
              ? editProduct._id
              : viewProduct
                ? viewProduct._id
                : "new"
            : "closed"
        }
        open={modalOpen}
        onClose={() => {
          setModalOpen(false);
          setEditProduct(null);
          setViewProduct(null);
        }}
        onSave={handleSave}
        initial={editProduct || viewProduct}
        viewOnly={!!viewProduct}
      />
      <div className="flex items-center justify-between mb-8">
        <div className="flex flex-col">
          <h1 className="text-2xl font-semibold">Products Management</h1>
          <span className="text-gray-500">
            Manage your product catalog and inventory
          </span>
        </div>
        {user?.permission?.permissions?.includes("create_product") && (
          <button
            onClick={handleAdd}
            disabled={loading}
            className="bg-[#1e3a5f] hover:bg-[#16375b] text-white px-6 py-2 rounded-xl focus:outline-none flex items-center gap-2 cursor-pointer"
          >
            <HiOutlinePlus className="text-md" /> Add Product
          </button>
        )}
      </div>
      <div className="bg-white rounded-xl p-6 mb-4 border border-gray-200">
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
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
          <div>
            <label className="block text-gray-700 text-base font-bold mb-2">
              Category
            </label>
            <CategoryDropdown
              selected={category}
              setSelected={setCategory}
              categoryOptions={categories}
            />
          </div>
          <div>
            <label className="block text-gray-700 text-base font-bold mb-2">
              Supplier
            </label>
            <SupplierDropdown
              selected={supplier}
              setSelected={setSupplier}
              supplierOptions={suppliers}
            />
          </div>
          <div>
            <label className="block text-gray-700 text-base font-bold mb-2">
              Stock Status
            </label>
            <StatusDropdown
              selected={status}
              setSelected={setStatus}
              statusOptions={statusOptions}
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
              <tr>
                <th>No.</th>
                <th>Product Code</th>
                <th>Product Name</th>
                <th>Category</th>
                <th>Supplier</th>
                <th className="text-right">Stock</th>
                <th className="text-right">Price</th>
                <th className="text-center">Actions</th>
              </tr>
            </thead>
            <tbody>
              {products.map((product, index) => (
                <tr key={product._id}>
                  <td>
                    {index + 1 + (pagination.page - 1) * pagination.limit}
                  </td>
                  <td>#{product.code}</td>
                  <td>{product.name}</td>
                  <td>
                    <span className="text-blue-500/80">
                      {product.category?.name || product.category}
                    </span>
                  </td>
                  <td>
                    <span className="text-blue-500/80">
                      {typeof product.supplier === "object"
                        ? product.supplier?.company_name ||
                          product.supplier?.name
                        : product.supplier}
                    </span>
                  </td>
                  <td className="text-right">
                    <span
                      className={`text-base ${product.stock === 0 ? "text-red-600" : product.stock < 10 ? "text-orange-600" : "text-green-600"}`}
                    >
                      {product.stock} units
                    </span>
                  </td>
                  <td className="text-right">
                    ${Number(product.price).toFixed(2)}
                  </td>
                  <td className="flex items-center gap-1 justify-center">
                    {user?.permission?.permissions?.includes(
                      "view_product",
                    ) && (
                      <button
                        className="text-[#1e3a5f] font-semibold cursor-pointer p-2 rounded-full hover:bg-[#f1f5f9]"
                        title="View"
                        onClick={() => handleView(product)}
                      >
                        <HiOutlineEye className="text-xl" />
                      </button>
                    )}
                    {user?.permission?.permissions?.includes(
                      "update_product",
                    ) && (
                      <button
                        className="text-[#1e3a5f] font-semibold cursor-pointer p-2 rounded-full hover:bg-[#f1f5f9]"
                        title="Edit"
                        onClick={() => handleEdit(product)}
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
                        onClick={() => handleDelete(product._id)}
                      >
                        <HiOutlineTrash className="text-xl" />
                      </button>
                    )}
                  </td>
                </tr>
              ))}
              {products.length === 0 && (
                <tr>
                  <td colSpan="8">
                    <NoDataFound message="No products found." />
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
            onChange={({ page, limit }) => {
              setPagination((prev) => ({ ...prev, page, limit }));
              fetchProducts(page, limit);
            }}
          />
        </div>
      )}
    </div>
  );
};

export default Products;
