import React, { useRef, useState } from "react";

const ProductModal = ({ open, onClose, onSave, initial }) => {
  const [form, setForm] = useState(
    initial || {
      name: "",
      sku: "",
      category: "",
      supplier: "",
      price: "",
      stock: "",
      expiry: "",
      image: null,
    },
  );
  const [preview, setPreview] = useState(initial?.image || null);
  const fileRef = useRef();

  function handleChange(e) {
    const { name, value } = e.target;
    setForm((f) => ({ ...f, [name]: value }));
  }

  function handleImage(e) {
    const file = e.target.files[0];
    if (file) {
      setForm((f) => ({ ...f, image: file }));
      setPreview(URL.createObjectURL(file));
    }
  }

  function handleSubmit(e) {
    e.preventDefault();
    onSave(form);
  }

  if (!open) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30">
      <div className="bg-white rounded-xl p-8 w-full max-w-lg relative">
        <button
          className="absolute top-4 right-4 text-gray-400 hover:text-gray-700 text-xl"
          onClick={onClose}
        >
          &times;
        </button>
        <h2 className="text-2xl font-bold mb-6 text-gray-800">
          {initial ? "Edit Product" : "Add Product"}
        </h2>
        <form onSubmit={handleSubmit} className="space-y-5">
          <div className="flex gap-4 items-center">
            <div className="flex flex-col items-center">
              <label className="block text-gray-600 mb-1 text-sm font-medium">
                Image
              </label>
              <div
                className="w-20 h-20 rounded-lg bg-gray-100 border border-gray-200 flex items-center justify-center overflow-hidden mb-2 cursor-pointer"
                onClick={() => fileRef.current.click()}
              >
                {preview ? (
                  <img
                    src={preview}
                    alt="Preview"
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <span className="text-gray-400 text-xs">Upload</span>
                )}
              </div>
              <input
                type="file"
                accept="image/*"
                ref={fileRef}
                className="hidden"
                onChange={handleImage}
              />
            </div>
            <div className="flex-1 grid grid-cols-2 gap-4">
              <input
                name="name"
                value={form.name}
                onChange={handleChange}
                required
                placeholder="Product Name"
                className="bg-gray-50 border border-gray-200 rounded-lg px-3 py-2 text-gray-800"
              />
              <input
                name="sku"
                value={form.sku}
                onChange={handleChange}
                required
                placeholder="SKU"
                className="bg-gray-50 border border-gray-200 rounded-lg px-3 py-2 text-gray-800"
              />
              <input
                name="category"
                value={form.category}
                onChange={handleChange}
                required
                placeholder="Category"
                className="bg-gray-50 border border-gray-200 rounded-lg px-3 py-2 text-gray-800"
              />
              <input
                name="supplier"
                value={form.supplier}
                onChange={handleChange}
                required
                placeholder="Supplier"
                className="bg-gray-50 border border-gray-200 rounded-lg px-3 py-2 text-gray-800"
              />
              <input
                name="price"
                value={form.price}
                onChange={handleChange}
                required
                type="number"
                step="0.01"
                placeholder="Price"
                className="bg-gray-50 border border-gray-200 rounded-lg px-3 py-2 text-gray-800"
              />
              <input
                name="stock"
                value={form.stock}
                onChange={handleChange}
                required
                type="number"
                placeholder="Stock"
                className="bg-gray-50 border border-gray-200 rounded-lg px-3 py-2 text-gray-800"
              />
              <input
                name="expiry"
                value={form.expiry}
                onChange={handleChange}
                required
                type="date"
                placeholder="Expiry Date"
                className="bg-gray-50 border border-gray-200 rounded-lg px-3 py-2 text-gray-800 col-span-2"
              />
            </div>
          </div>
          <div className="flex justify-end gap-2 mt-4">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-lg bg-gray-100 text-gray-700 font-semibold"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-6 py-2 rounded-lg bg-blue-700 text-white font-semibold hover:bg-blue-800 transition"
            >
              {initial ? "Update" : "Add"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ProductModal;
