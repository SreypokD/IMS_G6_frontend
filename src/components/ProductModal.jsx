import React, { useState, useEffect } from "react";
import PropTypes from "prop-types";
import {
  HiXCircle,
  HiOutlineDocumentText,
  HiOutlineCamera,
} from "react-icons/hi";
import { getCategories, getSuppliers, uploadFile } from "../api";
import FormField from "./ProductModal/FormField";
import SelectField from "./ProductModal/SelectField";
import ImageUpload from "./ProductModal/ImageUpload";
import SectionHeader from "./ProductModal/SectionHeader";
import { shouldShowError } from "./ProductModal/validation";

const initialProduct = {
  code: "",
  name: "",
  category: "",
  supplier: "",
  cost_price: "",
  price: "",
  stock: "",
  image: "",
  status: "active",
};

const getModalTitle = (viewOnly, productId) => {
  if (viewOnly) return "Product Details";
  return productId ? "Update Product" : "Add Product";
};

const getStockLabel = (productId) => {
  return productId ? "Current Stock" : "Initial Stock";
};

const getStockPlaceholder = (productId) => {
  return productId ? "Current Stock" : "Initial Quantity";
};

const ProductModal = ({ open, onClose, onSave, data, viewOnly = false }) => {
  const [product, setProduct] = useState(data || initialProduct);
  const [touched, setTouched] = useState({});
  const [validateOnSave, setValidateOnSave] = useState(false);
  const [categories, setCategories] = useState([]);
  const [suppliers, setSuppliers] = useState([]);

  useEffect(() => {
    if (!open) return;

    setProduct(data || initialProduct);
    setTouched({});
    setValidateOnSave(false);

    getCategories({ limit: -1 }).then((res) => {
      setCategories(res.data.data || []);
    });
    getSuppliers({ limit: -1 }).then((res) => {
      setSuppliers(res.data.data || []);
    });
  }, [open, data]);

  const handleFieldChange = (fieldName, value) => {
    setProduct((prev) => ({ ...prev, [fieldName]: value }));
  };

  const handleFieldBlur = (fieldName) => {
    setTouched((prev) => ({ ...prev, [fieldName]: true }));
  };

  const handleCategoryChange = (category) => {
    handleFieldChange("category", category ? category._id : "");
  };

  const handleSupplierChange = (supplier) => {
    handleFieldChange("supplier", supplier ? supplier._id : "");
  };

  async function handleImageChange(e) {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      const res = await uploadFile(file);
      const url = res.data?.url || res.data?.file?.url;
      if (url) {
        handleFieldChange("image", url);
      }
    } catch (err) {
      console.error("Image upload failed", err);
    }
  }

  const handleSave = () => {
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
  };

  const showImageSection = !viewOnly || product.image;
  const isStockDisabled = viewOnly || !!product._id;
  const showStockHelpText = !!product._id && !viewOnly;

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/5 backdrop-blur-sm">
      <div className="bg-white rounded-2xl p-5 w-full max-w-[40%] max-h-[80vh] shadow-xl relative">
        <h2 className="text-xl font-bold mb-6 text-center">
          {getModalTitle(viewOnly, product._id)}
        </h2>
        <form className="space-y-5 overflow-auto max-h-[50vh] px-1">
          <div className="col-span-2 mb-2">
            <SectionHeader
              icon={HiOutlineDocumentText}
              title="Basic Information"
            />
            <div className="mb-3 grid lg:grid-cols-2 md:grid-cols-1 gap-3">
              <FormField
                label="Product Code"
                name="code"
                value={product.code}
                onChange={(e) => handleFieldChange("code", e.target.value)}
                placeholder="Product Code"
                disabled={true}
              />
              <FormField
                label="Name"
                name="name"
                value={product.name}
                onChange={(e) => handleFieldChange("name", e.target.value)}
                onBlur={() => handleFieldBlur("name")}
                placeholder="Product Name"
                disabled={viewOnly}
                required={!viewOnly}
                hasError={shouldShowError(
                  "name",
                  product,
                  data,
                  touched,
                  validateOnSave,
                )}
              />
              <SelectField
                label="Category"
                value={product.category}
                onChange={handleCategoryChange}
                options={categories}
                getOptionLabel={(cat) => cat.name}
                getOptionValue={(cat) => cat._id}
                placeholder="Select category"
                disabled={viewOnly}
                required={!viewOnly}
                hasError={shouldShowError(
                  "category",
                  product,
                  data,
                  touched,
                  validateOnSave,
                )}
                emptyMessage="No categories"
              />
              <SelectField
                label="Supplier"
                value={product.supplier}
                onChange={handleSupplierChange}
                options={suppliers}
                getOptionLabel={(sup) => sup.company_name}
                getOptionValue={(sup) => sup._id}
                placeholder="Select supplier"
                disabled={viewOnly}
                required={!viewOnly}
                hasError={shouldShowError(
                  "supplier",
                  product,
                  data,
                  touched,
                  validateOnSave,
                )}
                emptyMessage="No suppliers"
              />
              <FormField
                label="Price"
                name="price"
                value={product.price}
                onChange={(e) => handleFieldChange("price", e.target.value)}
                onBlur={() => handleFieldBlur("price")}
                type={viewOnly ? "text" : "number"}
                step="0.01"
                disabled={viewOnly}
                required={!viewOnly}
                hasError={shouldShowError(
                  "price",
                  product,
                  data,
                  touched,
                  validateOnSave,
                )}
              />
              <FormField
                label={getStockLabel(product._id)}
                name="stock"
                value={product.stock}
                onChange={(e) => handleFieldChange("stock", e.target.value)}
                onBlur={() => handleFieldBlur("stock")}
                type={viewOnly ? "text" : "number"}
                placeholder={getStockPlaceholder(product._id)}
                disabled={isStockDisabled}
                required={!viewOnly && !product._id}
                hasError={shouldShowError(
                  "stock",
                  product,
                  data,
                  touched,
                  validateOnSave,
                )}
                helpText={
                  showStockHelpText
                    ? 'To adjust stock, use "Stock In" or "Stock Out".'
                    : undefined
                }
              />
            </div>
          </div>
          {showImageSection && (
            <div className="col-span-2 mb-2">
              <SectionHeader icon={HiOutlineCamera} title="Image" />
              <div className="mb-3">
                <div className="block text-gray-700 text-sm mb-1">
                  Product Image
                </div>
                <ImageUpload
                  image={product.image}
                  onChange={handleImageChange}
                  disabled={viewOnly}
                />
              </div>
            </div>
          )}
        </form>
        <div className="col-span-2 w-full flex items-center justify-end gap-3 mt-4">
          <button
            type="button"
            className="bg-gray-100 hover:bg-gray-200 text-[#1e3a5f] px-6 py-2 rounded-xl focus:outline-none border border-gray-100 flex items-center gap-2 cursor-pointer text-sm"
            onClick={onClose}
          >
            <HiXCircle className="inline-block text-xl" />
            {viewOnly ? "Close" : "Cancel"}
          </button>
          {!viewOnly && (
            <button
              type="button"
              className="bg-[#1e3a5f] hover:bg-[#16375b] text-white px-6 py-2 rounded-xl focus:outline-none flex items-center gap-2 cursor-pointer text-sm"
              onClick={handleSave}
            >
              <HiOutlineDocumentText className="inline-block text-xl" />
              {product._id ? "Update Product" : "Add Product"}
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

ProductModal.propTypes = {
  open: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
  onSave: PropTypes.func.isRequired,
  data: PropTypes.object,
  viewOnly: PropTypes.bool,
};

export default ProductModal;
