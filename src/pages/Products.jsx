import React, { useState, useEffect } from "react";
import { Listbox, Menu } from "@headlessui/react";
import {
  HiSelector,
  HiOutlinePencil,
  HiOutlineTrash,
  HiOutlinePlus,
  HiOutlineEye,
  HiOutlineFilter,
  HiOutlineRefresh,
  HiDotsVertical,
  HiOutlineCheckCircle,
  HiOutlineXCircle,
  HiOutlineArchive,
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
import Loading from "../components/Loading";

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
        <Listbox.Button className="cursor-pointer w-full bg-gray-50 border border-gray-100 rounded-lg px-3 py-2 text-left text-gray-800 text-sm flex items-center justify-between">
          <span>
            {categories.find((p) => p._id === selected)?.name ||
              "All Categories"}
          </span>
          <HiSelector className="w-5 h-5 text-gray-400 ml-2" />
        </Listbox.Button>
        <Listbox.Options className="absolute z-10 mt-1 w-full bg-white border border-gray-100 rounded-lg shadow-lg max-h-60 overflow-auto focus:outline-none">
          <Listbox.Option
            className="px-4 py-2 cursor-pointer text-black text-sm hover:bg-[#f1f5f9]"
            value=""
          >
            <span>All Categories</span>
          </Listbox.Option>
          {categories.map((option) => (
            <Listbox.Option
              key={option._id}
              value={option._id}
              className={({ selected }) =>
                `px-3 py-2 cursor-pointer text-black text-sm hover:bg-[#f1f5f9] ${selected ? "bg-blue-50" : ""}`
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
        <Listbox.Button className="cursor-pointer w-full bg-gray-50 border border-gray-100 rounded-lg px-3 py-2 text-left text-gray-800 text-sm flex items-center justify-between">
          <span>
            {suppliers.find((p) => p._id === selected)?.company_name ||
              "All Suppliers"}
          </span>
          <HiSelector className="w-5 h-5 text-gray-400 ml-2" />
        </Listbox.Button>
        <Listbox.Options className="absolute z-10 mt-1 w-full bg-white border border-gray-100 rounded-lg shadow-lg max-h-60 overflow-auto focus:outline-none">
          <Listbox.Option
            className="px-4 py-2 cursor-pointer text-black text-sm hover:bg-[#f1f5f9]"
            value=""
          >
            <span>All Suppliers</span>
          </Listbox.Option>
          {suppliers.map((option) => (
            <Listbox.Option
              key={option._id}
              value={option._id}
              className={({ selected }) =>
                `px-3 py-2 cursor-pointer text-black text-sm hover:bg-[#f1f5f9] ${selected ? "bg-blue-50" : ""}`
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
        <Listbox.Button className="cursor-pointer w-full bg-gray-50 border border-gray-100 rounded-lg px-3 py-2 text-left text-gray-800 text-sm flex items-center justify-between">
          <span>
            {statusOptions.find((p) => p.value === selected)?.label ||
              "All Statuses"}
          </span>
          <HiSelector className="w-5 h-5 text-gray-400 ml-2" />
        </Listbox.Button>
        <Listbox.Options className="absolute z-10 mt-1 w-full bg-white border border-gray-100 rounded-lg shadow-lg max-h-60 overflow-auto focus:outline-none">
          {statusOptions.map((option) => (
            <Listbox.Option
              key={option.value}
              value={option.value}
              className={({ selected }) =>
                `px-3 py-2 cursor-pointer text-black text-sm hover:bg-[#f1f5f9] ${selected ? "bg-blue-50" : ""}`
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
  const [products, setProducts] = useState([]);

  // Pagination
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 10,
    totalItems: 0,
    totalPages: 1,
  });

  // Modal
  const [modalOpen, setModalOpen] = useState(false);
  const [updateProduct, setUpdateProduct] = useState(null);
  const [viewProduct, setViewProduct] = useState(null);

  // Filters
  const [search, setSearch] = useState("");
  const [categories, setCategories] = useState([]);
  const [category, setCategory] = useState("");
  const [suppliers, setSuppliers] = useState([]);
  const [supplier, setSupplier] = useState("");
  const [status, setStatus] = useState("");

  // Loading and Error
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  // Dialog
  const dialog = useDialog();
  const { user } = useAuth();

  // Permissions
  const canView = user?.permission?.permissions?.includes("view_product");
  const canCreate = user?.permission?.permissions?.includes("create_product");
  const canUpdate = user?.permission?.permissions?.includes("update_product");
  const canDelete = user?.permission?.permissions?.includes("delete_product");

  useEffect(() => {
    getCategories({ limit: -1 }).then((res) =>
      setCategories(res.data.data || []),
    );
    getSuppliers({ limit: -1 }).then((res) =>
      setSuppliers(res.data.data || []),
    );
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
    setUpdateProduct(null);
    setModalOpen(true);
  }

  function handleUpdate(product) {
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
    setUpdateProduct({ ...product, category: category, supplier: supplier });
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
      if (updateProduct) {
        res = await updateProduct(updateProduct._id, data);
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
        updateProduct
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
    setUpdateProduct(null);
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

  const handleReset = () => {
    setSearch("");
    setCategory("");
    setSupplier("");
    setStatus("");
    setPagination((prev) => ({ ...prev, page: 1 }));
    fetchProducts(1, pagination.limit, "", "", "", "");
  };

  // Selection
  const [selectedIds, setSelectedIds] = useState([]);

  function handleSelectAll(e) {
    if (e.target.checked) {
      setSelectedIds(products.map((p) => p._id));
    } else {
      setSelectedIds([]);
      setSelectAllMatches(false);
    }
  }

  const [selectAllMatches, setSelectAllMatches] = useState(false);

  async function handleSelectAllGlobal() {
    setLoading(true);
    try {
      const params = {
        limit: -1,
        search,
        category,
        supplier,
        status,
      };
      const res = await getProducts(params);
      const allIds = res.data.data.map((p) => p._id);
      setSelectedIds(allIds);
      setSelectAllMatches(true);
    } catch (err) {
      console.error(err);
      dialog.error("Failed to select all products.");
    } finally {
      setLoading(false);
    }
  }

  function handleSelectOne(e, id) {
    if (e.target.checked) {
      setSelectedIds((prev) => [...prev, id]);
    } else {
      setSelectedIds((prev) => prev.filter((i) => i !== id));
    }
  }

  async function handleBulkStatus(status) {
    if (selectedIds.length === 0) return;
    setLoading(true);
    try {
      await Promise.all(selectedIds.map((id) => updateProduct(id, { status })));
      await dialog.success(`Products marked as ${status} successfully.`);
      fetchProducts(pagination.page, pagination.limit);
      setSelectedIds([]);
      setSelectAllMatches(false);
    } catch {
      await dialog.error("Failed to update products.");
    } finally {
      setLoading(false);
    }
  }

  async function handleBulkDelete() {
    if (selectedIds.length === 0) return;
    const confirmed = await dialog.ask({
      type: "confirm",
      title: "Delete Products",
      message: `Are you sure you want to delete ${selectedIds.length} products?`,
      confirmText: "Delete",
      cancelText: "Cancel",
    });
    if (!confirmed) return;

    setLoading(true);
    try {
      await Promise.all(selectedIds.map((id) => deleteProduct(id)));
      await dialog.success("Products deleted successfully.");
      fetchProducts(pagination.page, pagination.limit);
      setSelectedIds([]);
      setSelectAllMatches(false);
    } catch {
      await dialog.error("Failed to delete products.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="h-content-available">
      <ProductModal
        key={
          modalOpen
            ? updateProduct
              ? updateProduct._id
              : viewProduct
                ? viewProduct._id
                : "new"
            : "closed"
        }
        open={modalOpen}
        onClose={() => {
          setModalOpen(false);
          setUpdateProduct(null);
          setViewProduct(null);
        }}
        onSave={handleSave}
        data={updateProduct || viewProduct}
        viewOnly={!!viewProduct}
      />
      <div className="flex items-center justify-between mb-8">
        <div className="flex flex-col">
          <h1 className="text-xl font-semibold">Products Management</h1>
          <span className="text-gray-500 text-sm">
            Manage your product catalog and inventory
          </span>
        </div>
        <div className="flex items-center gap-2">
          {canCreate && (
            <button
              onClick={handleAdd}
              disabled={loading}
              className="bg-[#1e3a5f] hover:bg-[#16375b] text-white px-6 py-2 rounded-xl focus:outline-none flex items-center gap-2 cursor-pointer text-sm"
            >
              <HiOutlinePlus className="text-md" /> Add Product
            </button>
          )}
          {(canUpdate || canDelete) && (
            <Menu as="div" className="relative inline-block text-left">
              <Menu.Button className="text-[#1e3a5f] font-semibold cursor-pointer p-2 rounded-full hover:bg-gray-200">
                <HiDotsVertical className="text-xl" />
              </Menu.Button>
              <Menu.Items
                anchor="bottom end"
                className="bg-white rounded-2xl shadow-lg p-2 w-50 z-50 animate-fade-in-up border border-gray-100"
              >
                <Menu.Item>
                  {() => (
                    <button
                      onClick={() => handleBulkStatus("active")}
                      className={`w-full flex items-center px-2 py-3 text-[#64748b] transition text-sm space-x-2 rounded-xl ${selectedIds.length === 0 ? "opacity-50 cursor-default" : "cursor-pointer hover:text-black hover:bg-[#f1f5f9]"}`}
                    >
                      <HiOutlineCheckCircle
                        className="mr-2 h-5 w-5"
                        aria-hidden="true"
                      />
                      Active Products
                    </button>
                  )}
                </Menu.Item>
                <Menu.Item>
                  {() => (
                    <button
                      onClick={() => handleBulkStatus("inactive")}
                      className={`w-full flex items-center px-2 py-3 text-[#64748b] transition text-sm space-x-2 rounded-xl ${selectedIds.length === 0 ? "opacity-50 cursor-default" : "cursor-pointer hover:text-black hover:bg-[#f1f5f9]"}`}
                    >
                      <HiOutlineArchive
                        className="mr-2 h-5 w-5"
                        aria-hidden="true"
                      />
                      Archive Products
                    </button>
                  )}
                </Menu.Item>
                <Menu.Item>
                  {() => (
                    <button
                      onClick={handleBulkDelete}
                      className={`w-full flex items-center px-2 py-3 text-red-500 transition text-sm space-x-2 rounded-xl ${selectedIds.length === 0 ? "opacity-50 cursor-default" : "cursor-pointer hover:bg-red-50"}`}
                    >
                      <HiOutlineTrash
                        className="text-red-500 mr-2 h-5 w-5"
                        aria-hidden="true"
                      />
                      Delete Products
                    </button>
                  )}
                </Menu.Item>
              </Menu.Items>
            </Menu>
          )}
        </div>
      </div>
      <div className="bg-white rounded-xl p-6 mb-3 border border-gray-100">
        <div className="w-full flex items-center justify-between">
          <h3 className="flex items-center gap-2 text-base mb-3 text-[#1e3a5f] font-semibold border-b border-gray-100 pb-2">
            <HiOutlineFilter className="inline-block text-sm text-black" />
            <span>Filters</span>
          </h3>
          <button
            onClick={handleReset}
            className="flex items-center gap-2 text-sm mb-2 text-black cursor-pointer"
          >
            <HiOutlineRefresh className="inline-block text-sm text-black" />
            <span>Reset</span>
          </button>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3">
          <div>
            <label className="block text-gray-700 text-sm mb-1">Search</label>
            <input
              className="bg-gray-50 border border-gray-100 rounded-lg py-2 px-4 text-gray-700 min-w-0 w-full text-sm"
              placeholder="Search..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
          <div>
            <label className="block text-gray-700 text-sm mb-1">Category</label>
            <CategoryDropdown
              selected={category}
              setSelected={setCategory}
              categoryOptions={categories}
            />
          </div>
          <div>
            <label className="block text-gray-700 text-sm mb-1">Supplier</label>
            <SupplierDropdown
              selected={supplier}
              setSelected={setSupplier}
              supplierOptions={suppliers}
            />
          </div>
          <div>
            <label className="block text-gray-700 text-sm mb-1">
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
      <div className="flex-1 bg-white rounded-xl border border-gray-100 flex flex-col min-h-0">
        {
          /* Select All Banner */
          selectedIds.length > 0 &&
            !selectAllMatches &&
            pagination.totalItems > selectedIds.length && (
              <div className="bg-blue-50 px-4 py-2 text-sm text-blue-700 flex justify-center items-center gap-2">
                <span>
                  All {selectedIds.length} items on this page are selected.
                </span>
                <button
                  onClick={handleSelectAllGlobal}
                  className="font-semibold underline hover:text-blue-800 cursor-pointer"
                >
                  Select all {pagination.totalItems} items matching search
                </button>
              </div>
            )
        }
        {selectAllMatches && (
          <div className="bg-blue-50 px-4 py-2 text-sm text-blue-700 flex justify-center items-center gap-2">
            <span>All {selectedIds.length} items are selected.</span>
            <button
              onClick={() => {
                setSelectedIds([]);
                setSelectAllMatches(false);
              }}
              className="font-semibold underline hover:text-blue-800 cursor-pointer"
            >
              Clear selection
            </button>
          </div>
        )}

        <div className="table-scroll-container">
          {loading ? (
            <Loading />
          ) : error ? (
            <div className="p-8 text-center text-red-500">{error}</div>
          ) : (
            <table className="min-w-full text-left text-sm align-middle">
              <thead className="table-sticky-header">
                <tr>
                  {(canUpdate || canDelete) && (
                    <th className="w-15">
                      <input
                        type="checkbox"
                        name="selectAll"
                        id="selectAll"
                        className="w-4 h-4 accent-[#1e3a5f] cursor-pointer"
                        checked={
                          products.length > 0 &&
                          selectedIds.length === products.length
                        }
                        onChange={handleSelectAll}
                      />
                    </th>
                  )}
                  <th className="number">No.</th>
                  <th>Product Code</th>
                  <th>Product Name</th>
                  <th>Category</th>
                  <th>Supplier</th>
                  <th>Status</th>
                  <th className="text-right">Stock</th>
                  {canCreate || canUpdate || canDelete ? (
                    <th className="text-right">Cost</th>
                  ) : null}
                  <th className="text-right">Price</th>
                  {canView || canUpdate || canDelete ? (
                    <th className="text-center action">Actions</th>
                  ) : null}
                </tr>
              </thead>
              <tbody>
                {products.map((product, index) => (
                  <tr key={product._id} className="hover:bg-[#f1f5f9]">
                    {(canUpdate || canDelete) && (
                      <td className="w-15">
                        <input
                          type="checkbox"
                          name="select"
                          id="select"
                          className="w-4 h-4 accent-[#1e3a5f] cursor-pointer"
                          checked={selectedIds.includes(product._id)}
                          onChange={(e) => handleSelectOne(e, product._id)}
                        />
                      </td>
                    )}
                    <td className="number">
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
                    <td>
                      <span
                        className={`inline-block px-3 py-1 rounded-full text-sm capitalize ${product.status === "active" ? "bg-green-100 text-green-700" : "bg-gray-100 text-gray-700"}`}
                      >
                        {product.status}
                      </span>
                    </td>
                    <td className="text-right">
                      <span
                        className={`text-sm ${product.stock === 0 ? "text-red-600" : product.stock < 10 ? "text-orange-600" : "text-green-600"}`}
                      >
                        {product.stock} {product.stock > 1 ? "units" : "unit"}
                      </span>
                    </td>
                    {canCreate || canUpdate || canDelete ? (
                      <td className="text-right">
                        <span className="text-gray-500">
                          ${Number(product.cost_price || 0).toFixed(2)}
                        </span>
                      </td>
                    ) : null}
                    <td className="text-right">
                      ${Number(product.price).toFixed(2)}
                    </td>
                    <td className="flex items-center gap-1 justify-center action">
                      {canView && (
                        <button
                          className="text-[#1e3a5f] font-semibold cursor-pointer p-2 rounded-full hover:bg-gray-200"
                          title="View"
                          onClick={() => handleView(product)}
                        >
                          <HiOutlineEye className="text-xl" />
                        </button>
                      )}
                      {(canUpdate || canDelete) && (
                        <Menu
                          as="div"
                          className="relative inline-block text-left"
                        >
                          <Menu.Button className="text-[#1e3a5f] font-semibold cursor-pointer p-2 rounded-full hover:bg-gray-200">
                            <HiDotsVertical className="text-xl" />
                          </Menu.Button>
                          <Menu.Items
                            anchor="bottom end"
                            className="bg-white rounded-2xl shadow-lg p-2 w-40 z-50 animate-fade-in-up border border-gray-100"
                          >
                            {canUpdate && (
                              <Menu.Item>
                                {() => (
                                  <button
                                    onClick={() => handleUpdate(product)}
                                    className="w-full flex items-center px-2 py-3 text-[#64748b] hover:text-black hover:bg-[#f1f5f9] transition text-sm space-x-2 rounded-xl cursor-pointer"
                                  >
                                    <HiOutlinePencil
                                      className="mr-2 h-5 w-5"
                                      aria-hidden="true"
                                    />
                                    Update
                                  </button>
                                )}
                              </Menu.Item>
                            )}
                            {canDelete && (
                              <Menu.Item>
                                {() => (
                                  <button
                                    onClick={() => handleDelete(product._id)}
                                    className="w-full flex items-center px-2 py-3 text-red-500 hover:bg-red-50 transition text-sm space-x-2 rounded-xl cursor-pointer"
                                  >
                                    <HiOutlineTrash
                                      className="text-red-500 mr-2 h-5 w-5"
                                      aria-hidden="true"
                                    />
                                    Delete
                                  </button>
                                )}
                              </Menu.Item>
                            )}
                          </Menu.Items>
                        </Menu>
                      )}
                    </td>
                  </tr>
                ))}
                {products.length === 0 && (
                  <tr>
                    <td colSpan="10">
                      <NoDataFound message="No products found." />
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          )}
        </div>
      </div>
      {products.length > 0 && (
        <div className="flex justify-end mt-3">
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
