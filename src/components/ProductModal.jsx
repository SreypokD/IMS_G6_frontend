import React, { useState, useEffect } from "react";
import {
  HiXCircle,
  HiOutlineDocumentText,
  HiOutlineCamera,
  HiOutlineUpload,
} from "react-icons/hi";

const initialProduct = {
  code: "",
  name: "",
  category: "",
  supplier: "",
  price: "",
  stock: "",
  image: "",
};

import { getCategories, getSuppliers, uploadFile } from "../api";
import { Listbox } from "@headlessui/react";
import { HiSelector } from "react-icons/hi";

const ProductModal = ({ open, onClose, onSave, initial, viewOnly = false }) => {
  const [product, setProduct] = useState(initial || initialProduct);
  const [selectedImage, setSelectedImage] = useState(null);
  const [touched, setTouched] = useState({});
  const [validateOnSave, setValidateOnSave] = useState(false);
  const [categories, setCategories] = useState([]);
  const [suppliers, setSuppliers] = useState([]);

  useEffect(() => {
    if (open) {
      getCategories().then((res) => {
        setCategories(res.data.data || []);
      });
      getSuppliers().then((res) => {
        setSuppliers(res.data.data || []);
      });
    }
  }, [open]);

  async function handleImageChange(e) {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setSelectedImage(file);
      try {
        const res = await uploadFile(file);
        if (res.data && res.data.url) {
          setProduct((prev) => ({ ...prev, image: res.data.url }));
        }
      } catch (err) {
        console.error("Image upload failed", err);
      }
    }
  }

  if (!open) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/5 backdrop-blur-sm">
      <div className="bg-white rounded-2xl p-5 w-full max-w-[40%] max-h-[80vh] shadow-xl relative">
        <h2 className="text-xl font-bold mb-6 text-center">
          {viewOnly ? "View Product" : initial ? "Edit Product" : "Add Product"}
        </h2>
        <form className="space-y-5 overflow-auto max-h-[50vh] px-1">
          <div className="col-span-2 mb-2">
            <h3 className="flex items-center gap-2 text-base mb-2 text-black">
              <HiOutlineDocumentText className="inline-block text-xl text-black" />
              <span>Basic Information</span>
            </h3>
            <div className="mb-3 grid lg:grid-cols-2 md:grid-cols-1 gap-4">
              <div>
                <label className="block text-sm font-medium mb-1">
                  Product Code
                </label>
                <input
                  name="code"
                  value={product.code}
                  disabled
                  onChange={(e) =>
                    setProduct({ ...product, code: e.target.value })
                  }
                  placeholder="Product Code"
                  className="w-full bg-gray-50 border rounded-lg px-3 py-2 text-gray-800 border-gray-200"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">
                  Name
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
                  disabled={viewOnly}
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">
                  Category
                  {!product.category && !initial ? (
                    <sup className="text-red-500">*</sup>
                  ) : null}
                </label>
                <Listbox
                  value={
                    categories.find((cat) => cat._id === product.category) ||
                    null
                  }
                  onChange={
                    viewOnly
                      ? () => {}
                      : (cat) =>
                          setProduct({
                            ...product,
                            category: cat ? cat._id : "",
                          })
                  }
                  disabled={viewOnly}
                >
                  <div className="relative">
                    <Listbox.Button
                      className={`w-full bg-gray-50 border rounded-lg px-3 py-2 text-left text-gray-800 flex items-center justify-between cursor-pointer${viewOnly ? "bg-gray-100 cursor-default" : ""} ${!product.category && !initial && (touched.category || validateOnSave) ? "border-red-500" : "border-gray-200"}`}
                      disabled={viewOnly}
                    >
                      <span>
                        {categories.find((cat) => cat._id === product.category)
                          ?.name || "Select category"}
                      </span>
                      <HiSelector className="w-5 h-5 text-gray-400 ml-2" />
                    </Listbox.Button>
                    <Listbox.Options className="absolute z-10 mt-1 w-full bg-white border border-gray-200 rounded-lg shadow-lg max-h-60 overflow-auto focus:outline-none">
                      {categories.length === 0 && (
                        <div className="px-4 py-2 text-gray-400">
                          No categories
                        </div>
                      )}
                      {categories.map((cat) => (
                        <Listbox.Option
                          key={cat._id}
                          value={cat}
                          className={({ selected }) =>
                            `px-4 py-2 cursor-pointer text-black text-sm hover:bg-[#f1f5f9] ${selected ? "bg-blue-50" : ""}`
                          }
                        >
                          {cat.name}
                        </Listbox.Option>
                      ))}
                    </Listbox.Options>
                  </div>
                </Listbox>
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">
                  Supplier
                  {!product.supplier && !initial ? (
                    <sup className="text-red-500">*</sup>
                  ) : null}
                </label>
                <Listbox
                  value={
                    suppliers.find((sup) => sup._id === product.supplier) ||
                    null
                  }
                  onChange={
                    viewOnly
                      ? () => {}
                      : (sup) =>
                          setProduct({
                            ...product,
                            supplier: sup ? sup._id : "",
                          })
                  }
                  disabled={viewOnly}
                >
                  <div className="relative">
                    <Listbox.Button
                      className={`w-full bg-gray-50 border rounded-lg px-3 py-2 text-left text-gray-800 flex items-center justify-between ${viewOnly ? "bg-gray-100 cursor-default" : "cursor-pointer"} ${!product.supplier && !initial && (touched.supplier || validateOnSave) ? "border-red-500" : "border-gray-200"}`}
                      disabled={viewOnly}
                    >
                      <span>
                        {suppliers.find((sup) => sup._id === product.supplier)
                          ?.company_name || "Select supplier"}
                      </span>
                      <HiSelector className="w-5 h-5 text-gray-400 ml-2" />
                    </Listbox.Button>
                    <Listbox.Options className="absolute z-10 mt-1 w-full bg-white border border-gray-200 rounded-lg shadow-lg max-h-60 overflow-auto focus:outline-none">
                      {suppliers.length === 0 && (
                        <div className="px-4 py-2 text-gray-400">
                          No suppliers
                        </div>
                      )}
                      {suppliers.map((sup) => (
                        <Listbox.Option
                          key={sup._id}
                          value={sup}
                          className={({ selected }) =>
                            `px-4 py-2 cursor-pointer text-black text-sm hover:bg-[#f1f5f9] ${selected ? "bg-blue-50" : ""}`
                          }
                        >
                          {sup.company_name}
                        </Listbox.Option>
                      ))}
                    </Listbox.Options>
                  </div>
                </Listbox>
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">
                  Price
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
                  disabled={viewOnly}
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">
                  Stock
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
                  disabled={viewOnly}
                />
              </div>
            </div>
          </div>
          <div className="col-span-2 mb-2">
            <h3 className="flex items-center gap-2 text-base mb-2 text-black">
              <HiOutlineCamera className="inline-block text-xl text-black" />
              <span>Image</span>
            </h3>
            <div className="mb-4">
              <label className="block text-gray-700 text-sm mb-1">
                Product Image
              </label>
              <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 flex flex-col items-center justify-center transition-colors">
                <input
                  type="file"
                  accept="image/jpeg,image/png,image/gif"
                  className="hidden"
                  id="image-upload"
                  onChange={handleImageChange}
                  disabled={viewOnly}
                />
                <label
                  htmlFor="image-upload"
                  className={`flex flex-col items-center w-full h-full ${viewOnly ? "cursor-default opacity-60" : "cursor-pointer"}`}
                  style={viewOnly ? { pointerEvents: "none" } : {}}
                >
                  <HiOutlineUpload className="text-4xl text-gray-400 mb-2" />
                  <span className="text-gray-600">
                    Drag and drop your image here, or
                    <span className="text-blue-600 underline ml-1">
                      browse files
                    </span>
                  </span>
                  <span className="text-sm text-gray-400 mt-1">
                    Supported formats: JPG, PNG, GIF (Max 5MB)
                  </span>
                </label>
                {(selectedImage || product.image) && (
                  <div className="mt-2 flex items-center">
                    <img
                      src={
                        selectedImage
                          ? URL.createObjectURL(selectedImage)
                          : product.image
                      }
                      alt="Preview"
                      className="h-40 w-40 object-cover rounded mr-2"
                    />
                  </div>
                )}
              </div>
            </div>
          </div>
        </form>
        <div className="col-span-2 w-full flex items-center justify-end gap-3 mt-4">
          <button
            type="button"
            className="bg-gray-100 hover:bg-gray-200 text-[#1e3a5f] px-6 py-2 rounded-xl focus:outline-none border border-gray-200 flex items-center gap-2 cursor-pointer"
            onClick={onClose}
          >
            <HiXCircle className="inline-block text-xl" />
            {viewOnly ? "Close" : "Cancel"}
          </button>
          {!viewOnly && (
            <button
              type="button"
              className="bg-[#1e3a5f] hover:bg-[#16375b] text-white px-6 py-2 rounded-xl focus:outline-none flex items-center gap-2 cursor-pointer"
              onClick={() => {
                setValidateOnSave(true);
                setTouched({
                  code: true,
                  name: true,
                  category: true,
                  supplier: true,
                  price: true,
                  stock: true,
                  image: true,
                });
                onSave(product);
              }}
            >
              <HiOutlineDocumentText className="inline-block text-xl" />
              {initial ? "Update Product" : "Add Product"}
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default ProductModal;
