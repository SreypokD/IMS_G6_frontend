import React, { useState, useEffect } from "react";
import { Listbox } from "@headlessui/react";
import { HiSelector } from "react-icons/hi";
import {
  HiXCircle,
  HiOutlineDocumentText,
  HiCube,
  HiOutlinePlus,
  HiOutlineTrash,
} from "react-icons/hi";
import {
  getProducts,
  getSuppliers,
  createOrderRequest,
  updateOrderRequest,
} from "../api";
import { useDialog } from "../contexts/dialog/useDialog";

const initialOrderRequest = {
  supplier_id: "",
  delivery_date: "",
  notes: "",
  orderItems: [{ product_id: "", quantity: 1, unit_price: 0, subtotal: 0 }],
};

const OrderRequestModal = ({ open, onClose, onSave, initial }) => {
  const [products, setProducts] = useState([]);
  const [suppliers, setSuppliers] = useState([]);
  const [order, setOrder] = useState(initial || initialOrderRequest);
  const [touched, setTouched] = useState({});
  const [validateOnSave, setValidateOnSave] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const dialog = useDialog();

  useEffect(() => {
    if (open) {
      getProducts().then((res) => setProducts(res.data.data || []));
      getSuppliers().then((res) => setSuppliers(res.data.data || []));
      if (initial) {
        setOrder({
          supplier_id:
            initial.supplier_id ||
            (typeof initial.supplier === "object"
              ? initial.supplier?._id
              : initial.supplier) ||
            "",
          delivery_date: initial.delivery_date || initial.deliveryDate || "",
          notes: initial.notes || "",
          orderItems: initial.orderItems || [
            { product_id: "", quantity: 1, unit_price: 0, subtotal: 0 },
          ],
        });
      } else {
        setOrder(initialOrderRequest);
      }
      setTouched({});
      setValidateOnSave(false);
      setError("");
    }
  }, [open, initial]);

  function handleChange(e) {
    const { name, value } = e.target;
    setOrder((prev) => ({
      ...prev,
      [name]: value,
    }));
  }

  function handleOrderItemChange(idx, field, value) {
    setOrder((prev) => {
      const items = prev.orderItems.map((item, i) =>
        i === idx
          ? {
              ...item,
              [field]:
                field === "quantity" || field === "unit_price"
                  ? Number(value)
                  : value,
            }
          : item,
      );
      return { ...prev, orderItems: items };
    });
  }

  function addOrderItem() {
    setOrder((prev) => ({
      ...prev,
      orderItems: [
        ...prev.orderItems,
        { product_id: "", quantity: 1, unit_price: 0, subtotal: 0 },
      ],
    }));
  }

  function removeOrderItem(idx) {
    setOrder((prev) => ({
      ...prev,
      orderItems: prev.orderItems.filter((_, i) => i !== idx),
    }));
  }

  function handleBlur(e) {
    const { name } = e.target;
    setTouched((prev) => ({ ...prev, [name]: true }));
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setValidateOnSave(true);
    const isEdit = Boolean(initial);
    const supplierField = order.supplier_id;
    if (
      !supplierField ||
      !order.delivery_date ||
      order.orderItems.length === 0 ||
      order.orderItems.some(
        (item) =>
          !item.product_id ||
          typeof item.quantity !== "number" ||
          item.quantity <= 0 ||
          typeof item.unit_price !== "number" ||
          item.unit_price < 0,
      )
    ) {
      setError("Please fill all required fields for all products.");
      return;
    }
    setLoading(true);
    setError("");
    try {
      const payload = {
        supplier_id: order.supplier_id,
        delivery_date: order.delivery_date,
        notes: order.notes,
        orderItems: order.orderItems.map((item) => ({
          product_id: item.product_id,
          quantity: item.quantity,
          unit_price: item.unit_price,
          subtotal:
            item.unit_price && item.quantity
              ? item.unit_price * item.quantity
              : 0,
        })),
      };
      if (isEdit) {
        await updateOrderRequest(initial._id, payload);
        await dialog.success("Order request updated successfully.");
        if (onSave) onSave();
        handleClose();
      } else {
        await createOrderRequest(payload);
        await dialog.success("Order request created successfully.");
        if (onSave) onSave();
        handleClose();
      }
    } catch {
      setError(
        isEdit
          ? "Failed to update order request"
          : "Failed to submit order request",
      );
    } finally {
      setLoading(false);
    }
  }

  function handleClose() {
    setOrder(initialOrderRequest);
    setTouched({});
    setValidateOnSave(false);
    setError("");
    onClose();
  }

  if (!open) return null;
  return (
    <div>
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/5 backdrop-blur-sm">
        <div className="bg-white rounded-2xl p-6 w-full max-w-[60vw] max-h-[90vh] shadow-xl relative">
          <h2 className="text-2xl font-bold mb-6 text-center">
            {initial ? "Edit Order Request" : "Add Order Request"}
          </h2>
          <form className="space-y-5 overflow-auto max-h-[50vh] px-1">
            <div className="col-span-2 mb-2">
              <h3 className="flex items-center gap-2 font-semibold text-lg mb-2 text-black">
                <HiOutlineDocumentText className="inline-block text-xl text-black" />
                <span>Basic Info</span>
              </h3>
              <div className="mb-3 grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-base font-medium mb-1">
                    Supplier <sup className="text-red-500">*</sup>
                  </label>
                  <Listbox
                    value={
                      suppliers.find((s) => s._id === order.supplier_id) || null
                    }
                    onChange={(supplier) => {
                      setOrder((prev) => ({
                        ...prev,
                        supplier_id: supplier ? supplier._id : "",
                      }));
                      setTouched((prev) => ({ ...prev, supplier_id: true }));
                    }}
                  >
                    <div className="relative">
                      <Listbox.Button
                        className={`cursor-pointer w-full bg-gray-50 border rounded-lg px-3 py-2 text-left text-gray-800 flex items-center justify-between ${!order.supplier_id && (touched.supplier_id || validateOnSave) ? "border-red-500" : "border-gray-200"}`}
                      >
                        <span>
                          {suppliers.find((s) => s._id === order.supplier_id)
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
                        {suppliers.map((supplier) => (
                          <Listbox.Option
                            key={supplier._id}
                            value={supplier}
                            className={({ active, selected }) =>
                              `px-4 py-2 cursor-pointer ${active ? "text-[#64748b] hover:bg-[#f1f5f9] hover:text-black" : "text-gray-900"} ${selected ? "font-semibold bg-blue-50" : ""}`
                            }
                          >
                            {supplier.company_name}
                          </Listbox.Option>
                        ))}
                      </Listbox.Options>
                    </div>
                  </Listbox>
                </div>
                <div>
                  <label className="block text-base font-medium mb-1">
                    Requested Date <sup className="text-red-500">*</sup>
                  </label>
                  <input
                    name="delivery_date"
                    type="date"
                    value={order.delivery_date}
                    onChange={handleChange}
                    onBlur={handleBlur}
                    required
                    className={`w-full bg-gray-50 border rounded-lg px-3 py-2 text-gray-800 ${!order.delivery_date && (touched.delivery_date || validateOnSave) ? "border-red-500" : "border-gray-200"}`}
                  />
                </div>
              </div>
              <div className="col-span-1 mb-2">
                <h3 className="flex items-center gap-2 font-semibold text-lg mb-2 text-black">
                  <HiCube className="inline-block text-xl text-black" />
                  <span>Products</span>
                </h3>
                {order.orderItems.map((item, idx) => (
                  <div key={idx} className="w-full flex items-center">
                    <div className="w-[98%] mb-3 grid grid-cols-4 gap-4">
                      <div>
                        <label className="block text-base font-medium mb-1">
                          Product <span className="text-red-500">*</span>
                        </label>
                        <Listbox
                          value={
                            products.find((p) => p._id === item.product_id) ||
                            null
                          }
                          onChange={(product) =>
                            handleOrderItemChange(
                              idx,
                              "product_id",
                              product ? product._id : "",
                            )
                          }
                        >
                          <div className="relative">
                            <Listbox.Button
                              className={`cursor-pointer w-full bg-gray-50 border rounded-lg px-3 py-2 text-left text-gray-800 flex items-center justify-between ${!item.product_id && validateOnSave ? "border-red-500" : "border-gray-200"}`}
                            >
                              <span>
                                {products.find((p) => p._id === item.product_id)
                                  ?.name
                                  ? `${products.find((p) => p._id === item.product_id)?.name} (Stock: ${products.find((p) => p._id === item.product_id)?.stock - (products.find((p) => p._id === item.product_id)?.reserved_stock || 0)})`
                                  : "Select product"}
                              </span>
                              <HiSelector className="w-5 h-5 text-gray-400 ml-2" />
                            </Listbox.Button>
                            <Listbox.Options className="absolute z-10 mt-1 w-full bg-white border border-gray-200 rounded-lg shadow-lg max-h-60 overflow-auto focus:outline-none">
                              {products.length === 0 && (
                                <div className="px-4 py-2 text-gray-400">
                                  No products
                                </div>
                              )}
                              {products.map((product) => (
                                <Listbox.Option
                                  key={product._id}
                                  value={product}
                                  className={({ active, selected }) =>
                                    `px-4 py-2 cursor-pointer ${active ? "text-[#64748b] hover:bg-[#f1f5f9] hover:text-black" : "text-gray-900"} ${selected ? "font-semibold bg-blue-50" : ""}`
                                  }
                                >
                                  {product.name} (Stock:{" "}
                                  {product.stock -
                                    (product.reserved_stock || 0)}
                                  )
                                </Listbox.Option>
                              ))}
                            </Listbox.Options>
                          </div>
                        </Listbox>
                      </div>
                      <div>
                        <label className="block text-base font-medium mb-1">
                          Quantity <span className="text-red-500">*</span>
                        </label>
                        <input
                          type="number"
                          min={1}
                          className={`w-full bg-gray-50 border rounded-lg px-3 py-2 text-gray-800 border-gray-200`}
                          placeholder="Qty"
                          value={item.quantity}
                          onChange={(e) =>
                            handleOrderItemChange(
                              idx,
                              "quantity",
                              e.target.value,
                            )
                          }
                        />
                      </div>
                      <div>
                        <label className="block text-base font-medium mb-1">
                          Unit Price <span className="text-red-500">*</span>
                        </label>
                        <input
                          type="number"
                          min={0}
                          step="0.01"
                          className={`w-full bg-gray-50 border rounded-lg px-3 py-2 text-gray-800 border-gray-200`}
                          placeholder="Unit Price"
                          value={item.unit_price}
                          onChange={(e) =>
                            handleOrderItemChange(
                              idx,
                              "unit_price",
                              e.target.value,
                            )
                          }
                        />
                      </div>
                      <div>
                        <label className="block text-base font-medium mb-1">
                          Line Total:
                        </label>
                        <input
                          className={`w-full bg-gray-50 border rounded-lg px-3 py-2 text-gray-800 border-gray-200`}
                          value={
                            item.unit_price && item.quantity
                              ? (item.unit_price * item.quantity).toFixed(2)
                              : "-"
                          }
                          disabled
                        />
                      </div>
                    </div>
                    <div className="max-w-10">
                      <button
                        type="button"
                        className={`text-xl px-2 mt-6 cursor-pointer max-w-10 ${order.orderItems.length === 1 ? "text-red-400 cursor-not-allowed" : "text-red-500"}`}
                        onClick={() => removeOrderItem(idx)}
                        title="Remove"
                        disabled={order.orderItems.length === 1}
                      >
                        <HiOutlineTrash />
                      </button>
                    </div>
                  </div>
                ))}
                <div className="w-full flex items-center justify-center mt-4">
                  <button
                    type="button"
                    className=" text-[#1e3a5f] px-6 py-2 rounded-full focus:outline-none border border-[#1e3a5f] flex items-center gap-2 cursor-pointer"
                    onClick={addOrderItem}
                  >
                    <HiOutlinePlus className="text-md" /> Add Item
                  </button>
                </div>
              </div>
              <div>
                <label className="block text-base font-medium mb-1">
                  Notes / Remarks
                </label>
                <textarea
                  name="notes"
                  value={order.notes}
                  onChange={handleChange}
                  onBlur={handleBlur}
                  className="w-full bg-gray-50 border rounded-lg px-3 py-2 text-gray-800 border-gray-200"
                />
              </div>
            </div>
            {error && <div className="text-red-600">{error}</div>}
          </form>
          <div className="flex justify-end gap-2 mt-6">
            <button
              type="button"
              className="bg-gray-100 hover:bg-gray-200 text-[#1e3a5f] px-6 py-2 rounded-full focus:outline-none border border-gray-200 flex items-center gap-2 cursor-pointer"
              onClick={handleClose}
            >
              <HiXCircle className="inline-block text-xl" /> Cancel
            </button>
            <button
              type="button"
              className="bg-[#1e3a5f] hover:bg-[#16375b] text-white px-6 py-2 rounded-full focus:outline-none flex items-center gap-2 cursor-pointer"
              onClick={handleSubmit}
            >
              <HiOutlineDocumentText className="inline-block text-xl" />{" "}
              {loading ? "Submitting..." : initial ? "Update" : "Submit"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default OrderRequestModal;
