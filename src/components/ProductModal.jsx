import React, { useRef, useState, useEffect } from "react";
import {
  HiXCircle,
  HiOutlineDocumentText,
  HiOutlineCamera,
} from "react-icons/hi";

const initialProduct = {
  name: "",
  code: "",
  category: "",
  supplier: "",
  price: "",
  stock: "",
  expiry: "",
  image: "",
};

import { getCategories, getSuppliers } from "../api";

const ProductModal = ({ open, onClose, onSave, initial }) => {
  const [product, setProduct] = useState(initial || initialProduct);
  const [preview, setPreview] = useState(initial?.image || "");
  const fileInputRef = useRef();
  const [touched, setTouched] = useState({});
  const [validateOnSave, setValidateOnSave] = useState(false);
  const [categories, setCategories] = useState([]);
  const [suppliers, setSuppliers] = useState([]);

  // Clear form fields when opening for create
  // Only fetch categories and suppliers when modal opens
  useEffect(() => {
    if (open) {
      getCategories().then(res => {
        console.log('getCategories response:', res);
        setCategories(res.data.data || []);
      });
      getSuppliers().then(res => {
        console.log('getSuppliers response:', res);
        setSuppliers(res.data.data || []);
      });
    }
  }, [open]);

  // Handle file upload
  const handleImageUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    // Preview
    const reader = new FileReader();
    reader.onload = (ev) => {
      setPreview(ev.target.result);
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
        setProduct({ ...product, image: data.url });
      }
    } catch {
      alert("Upload failed");
    }
  };

  if (!open) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/5 backdrop-blur-sm">
      <div className="bg-white rounded-2xl p-5 w-full max-w-[40%] max-h-[80vh] shadow-xl relative">
        <h2 className="text-2xl font-bold mb-6 text-center">
          {initial ? "Edit Product" : "Add Product"}
        </h2>
        <form className="space-y-5 overflow-auto max-h-[60vh] px-1">
          <div className="col-span-2 mb-2">
            <h3 className="flex items-center gap-2 font-semibold text-lg mb-2 text-black">
              <HiOutlineDocumentText className="inline-block text-xl text-black" />
              <span>Basic Info</span>
            </h3>
            <div className="mb-3 grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-1">
                  Name{" "}
                  {!product.name && !initial ? (
                    <sup className="text-red-500">*</sup>
                  ) : null}
                </label>
                <input
                  name="name"
                  value={product.name}
                  onChange={(e) =>
                    setProduct({ ...product, name: e.target.value })
                  }
                  onBlur={() => setTouched((prev) => ({ ...prev, name: true }))}
                  placeholder="Product Name"
                  className={`w-full bg-gray-50 border rounded-lg px-3 py-2 text-gray-800 ${!product.name && !initial && (touched.name || validateOnSave) ? "border-red-500" : "border-gray-200"}`}
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">
                  Product Code{" "}
                  {!product.code && !initial ? (
                    <sup className="text-red-500">*</sup>
                  ) : null}
                </label>
                <input
                  name="code"
                  value={product.code}
                  onChange={(e) =>
                    setProduct({ ...product, code: e.target.value })
                  }
                  onBlur={() => setTouched((prev) => ({ ...prev, code: true }))}
                  placeholder="Product Code"
                  className={`w-full bg-gray-50 border rounded-lg px-3 py-2 text-gray-800 ${!product.code && !initial && (touched.code || validateOnSave) ? "border-red-500" : "border-gray-200"}`}
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">
                  Category{" "}
                  {!product.category && !initial ? (
                    <sup className="text-red-500">*</sup>
                  ) : null}
                </label>
                <select
                  name="category"
                  value={product.category}
                  onChange={e => setProduct({ ...product, category: e.target.value })}
                  onBlur={() => setTouched(prev => ({ ...prev, category: true }))}
                  className={`w-full bg-gray-50 border rounded-lg px-3 py-2 text-gray-800 ${!product.category && !initial && (touched.category || validateOnSave) ? "border-red-500" : "border-gray-200"}`}
                >
                  <option value="">Select category</option>
                  {categories.map(cat => (
                    <option key={cat._id} value={cat._id}>{cat.name}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">
                  Supplier{" "}
                  {!product.supplier && !initial ? (
                    <sup className="text-red-500">*</sup>
                  ) : null}
                </label>
                <select
                  name="supplier"
                  value={product.supplier}
                  onChange={e => setProduct({ ...product, supplier: e.target.value })}
                  onBlur={() => setTouched(prev => ({ ...prev, supplier: true }))}
                  className={`w-full bg-gray-50 border rounded-lg px-3 py-2 text-gray-800 ${!product.supplier && !initial && (touched.supplier || validateOnSave) ? "border-red-500" : "border-gray-200"}`}
                >
                  <option value="">Select supplier</option>
                  {suppliers.map(sup => (
                    <option key={sup._id} value={sup._id}>{sup.company_name}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">
                  Price{" "}
                  {(!product.price || isNaN(product.price)) && !initial ? (
                    <sup className="text-red-500">*</sup>
                  ) : null}
                </label>
                <input
                  name="price"
                  value={product.price}
                  onChange={(e) =>
                    setProduct({ ...product, price: e.target.value })
                  }
                  onBlur={() =>
                    setTouched((prev) => ({ ...prev, price: true }))
                  }
                  type="number"
                  step="0.01"
                  placeholder="Price"
                  className={`w-full bg-gray-50 border rounded-lg px-3 py-2 text-gray-800 ${(!product.price || isNaN(product.price)) && !initial && (touched.price || validateOnSave) ? "border-red-500" : "border-gray-200"}`}
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">
                  Stock{" "}
                  {(!product.stock || isNaN(product.stock)) && !initial ? (
                    <sup className="text-red-500">*</sup>
                  ) : null}
                </label>
                <input
                  name="stock"
                  value={product.stock}
                  onChange={(e) =>
                    setProduct({ ...product, stock: e.target.value })
                  }
                  onBlur={() =>
                    setTouched((prev) => ({ ...prev, stock: true }))
                  }
                  type="number"
                  placeholder="Stock"
                  className={`w-full bg-gray-50 border rounded-lg px-3 py-2 text-gray-800 ${(!product.stock || isNaN(product.stock)) && !initial && (touched.stock || validateOnSave) ? "border-red-500" : "border-gray-200"}`}
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">
                  Expiry{" "}
                  {!product.expiry && !initial ? (
                    <sup className="text-red-500">*</sup>
                  ) : null}
                </label>
                <input
                  name="expiry"
                  value={product.expiry}
                  onChange={(e) =>
                    setProduct({ ...product, expiry: e.target.value })
                  }
                  onBlur={() =>
                    setTouched((prev) => ({ ...prev, expiry: true }))
                  }
                  type="date"
                  placeholder="Expiry Date"
                  className={`w-full bg-gray-50 border rounded-lg px-3 py-2 text-gray-800 col-span-2 ${!product.expiry && !initial && (touched.expiry || validateOnSave) ? "border-red-500" : "border-gray-200"}`}
                />
              </div>
            </div>
          </div>
          <div className="col-span-2 mb-2">
            <h3 className="flex items-center gap-2 font-semibold text-lg mb-2 text-black">
              <HiOutlineCamera className="inline-block text-xl text-black" />
              <span>Image</span>
            </h3>
            <div className="mb-3 grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-1">
                  Profile Image{" "}
                  {!product.image && !initial ? (
                    <sup className="text-red-500">*</sup>
                  ) : null}
                </label>
                <input
                  type="file"
                  accept="image/*"
                  ref={fileInputRef}
                  className={`w-full bg-gray-50 border rounded-lg px-3 py-2 text-gray-800 col-span-2 mb-2 cursor-pointer ${!product.image && !initial && (touched.image || validateOnSave) ? "border-red-500" : "border-gray-200"}`}
                  onChange={handleImageUpload}
                  onBlur={() =>
                    setTouched((prev) => ({ ...prev, image: true }))
                  }
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">
                  Or paste image URL
                </label>
                <input
                  className={`w-full bg-gray-50 border rounded-lg px-3 py-2 text-gray-800 col-span-2 ${!product.image && !initial && (touched.image || validateOnSave) ? "border-red-500" : "border-gray-200"}`}
                  value={product.image}
                  onChange={(e) => {
                    setProduct({ ...product, image: e.target.value });
                    setPreview(e.target.value);
                  }}
                  onBlur={() =>
                    setTouched((prev) => ({ ...prev, image: true }))
                  }
                />
              </div>
            </div>
            {preview && (
              <div className="flex justify-center mb-2">
                <img
                  src={preview}
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
              setValidateOnSave(true);
              setTouched({
                name: true,
                sku: true,
                category: true,
                supplier: true,
                price: true,
                stock: true,
                expiry: true,
                image: true,
              });
              onSave(product);
            }}
          >
            <HiOutlineDocumentText className="inline-block" />
            {initial ? "Update Product" : "Add Product"}
          </button>
        </div>
      </div>
    </div>
  );
};

export default ProductModal;
