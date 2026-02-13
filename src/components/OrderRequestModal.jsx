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
import { BsCurrencyDollar } from "react-icons/bs";
import { useDialog } from "../contexts/dialog/useDialog";
import DatePicker from "../components/DatePicker";

const initialOrderRequest = {
  supplier_id: "",
  delivery_date: new Date().toISOString().slice(0, 10),
  notes: "",
  orderItems: [
    { product_id: "", quantity: 1, unit_price: null, subtotal: null },
  ],
};

const OrderRequestModal = ({
  open,
  onClose,
  onSave,
  data,
  viewOnly = false,
}) => {
  const [products, setProducts] = useState([]);
  const [suppliers, setSuppliers] = useState([]);
  const [order, setOrder] = useState(data || initialOrderRequest);
  const [touched, setTouched] = useState({});
  const [validateOnSave, setValidateOnSave] = useState(false);
  const [loading, setLoading] = useState(false);
  const dialog = useDialog();

  useEffect(() => {
    if (open) {
      getProducts().then((res) => setProducts(res.data.data || []));
      getSuppliers().then((res) => setSuppliers(res.data.data || []));
      if (data) {
        // Convert delivery_date to yyyy-MM-dd for input value
        let deliveryDateValue = data.delivery_date || "";
        if (deliveryDateValue) {
          const d = new Date(deliveryDateValue);
          if (!isNaN(d)) {
            deliveryDateValue = d.toISOString().slice(0, 10);
          }
        }
        setOrder({
          _id: data._id, // Keep ID
          supplier_id:
            data.supplier_id ||
            (typeof data.supplier === "object"
              ? data.supplier?._id
              : data.supplier) ||
            "",
          delivery_date: deliveryDateValue,
          notes: data.notes || "",
          orderItems:
            data.orderItems &&
            Array.isArray(data.orderItems) &&
            data.orderItems.length > 0
              ? data.orderItems
              : data.items && Array.isArray(data.items)
                ? data.items.map((item) => ({
                    product_id: item.product_id,
                    quantity: item.quantity,
                    unit_price: item.unit_price,
                    subtotal: item.subtotal,
                  }))
                : [
                    {
                      product_id: "",
                      quantity: 1,
                      unit_price: null,
                      subtotal: null,
                    },
                  ],
        });
      } else {
        setOrder(initialOrderRequest);
      }
      setTouched({});
      setValidateOnSave(false);
    }
  }, [open, data]);

  function handleChange(e) {
    const { name, value } = e.target;
    setOrder((prev) => ({
      ...prev,
      [name]: value,
    }));
  }

  function handleOrderItemChange(idx, field, value) {
    setOrder((prev) => {
      const items = prev.orderItems.map((item, i) => {
        if (i === idx) {
          let newItem = { ...item };
          if (field === "product_id") {
            newItem.product_id = value;
            // Set unit price from selected product
            const product = products.find((p) => p._id === value);
            newItem.unit_price = product ? product.price : 0;
            // Optionally reset quantity
            if (!item.quantity) newItem.quantity = 1;
          } else if (field === "quantity") {
            const product = products.find((p) => p._id === item.product_id);
            const maxStock = product
              ? product.stock - (product.reserved_stock || 0)
              : null;
            let newValue = value;
            if (maxStock !== null && Number(value) > maxStock) {
              newValue = maxStock;
            }
            newItem.quantity = Number(newValue);
          } else if (field === "unit_price") {
            newItem.unit_price = Number(value);
          }
          // Always update subtotal
          newItem.subtotal =
            (newItem.unit_price ?? 0) * (newItem.quantity ?? 0);
          return newItem;
        }
        return item;
      });
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
    const isUpdate = Boolean(data);
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
      return;
    }
    setLoading(true);
    try {
      const payload = {
        supplier_id: order.supplier_id,
        delivery_date: order.delivery_date
          ? new Date(order.delivery_date).toISOString()
          : order.delivery_date,
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
      if (isUpdate) {
        await updateOrderRequest(data._id, payload);
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
      //
    } finally {
      setLoading(false);
    }
  }

  function handleClose() {
    setOrder(initialOrderRequest);
    setTouched({});
    setValidateOnSave(false);
    onClose();
  }

  if (!open) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/5 backdrop-blur-sm">
      <div className="bg-white rounded-2xl p-5 w-full max-w-[65%] max-h-[80vh] shadow-xl relative">
        <h2 className="text-xl font-bold mb-6 text-center">
          {viewOnly
            ? "Order Request Details"
            : data?._id
              ? "Update Order Request"
              : "New Order Request"}
        </h2>
        <form className="space-y-5 overflow-auto max-h-[60vh] px-1">
          <div className="col-span-2 mb-2">
            <h3 className="flex items-center gap-2 text-base mb-2 text-black">
              <HiOutlineDocumentText className="inline-block text-xl text-black" />
              <span>Basic Information</span>
            </h3>
            <div className="mb-3 grid lg:grid-cols-2 md:grid-cols-1 gap-3">
              <div>
                <label className="text-sm font-medium text-gray-700">
                  Supplier
                  {!viewOnly ? <sup className="text-red-500">*</sup> : null}
                </label>
                <Listbox
                  value={
                    suppliers.find((s) => s._id === order.supplier_id) || null
                  }
                  onChange={(supplier) => {
                    if (viewOnly) return;
                    // If supplier changes, reset items to avoid mismatch
                    if (order.supplier_id !== (supplier ? supplier._id : "")) {
                      setOrder((prev) => ({
                        ...prev,
                        supplier_id: supplier ? supplier._id : "",
                        orderItems: [
                          {
                            product_id: "",
                            quantity: 1,
                            unit_price: null,
                            subtotal: null,
                          },
                        ],
                      }));
                    } else {
                      setOrder((prev) => ({
                        ...prev,
                        supplier_id: supplier ? supplier._id : "",
                      }));
                    }
                    setTouched((prev) => ({ ...prev, supplier_id: true }));
                  }}
                  disabled={viewOnly}
                >
                  <div className="relative">
                    <Listbox.Button
                      className={`${viewOnly ? "cursor-default" : "cursor-pointer"} w-full bg-gray-50 border rounded-lg px-3 py-2 text-left text-sm text-gray-800 flex items-center justify-between ${!order.supplier_id && (touched.supplier_id || validateOnSave) ? "border-red-500" : "border-gray-100"}`}
                    >
                      <span>
                        {suppliers.find(
                          (s) => s._id === (order.supplier_id || ""),
                        )?.company_name || "Select supplier"}
                      </span>
                      <HiSelector className="w-5 h-5 text-gray-400 ml-2" />
                    </Listbox.Button>
                    <Listbox.Options className="absolute z-10 mt-1 w-full bg-white border border-gray-100 rounded-lg shadow-lg max-h-60 overflow-auto focus:outline-none text-sm">
                      {suppliers.length === 0 && (
                        <div className="px-4 py-2 text-gray-400">
                          No suppliers
                        </div>
                      )}
                      {suppliers.map((supplier) => (
                        <Listbox.Option
                          key={supplier._id}
                          value={supplier}
                          className={({ selected }) =>
                            `px-3 py-2 cursor-pointer text-black text-sm hover:bg-[#f1f5f9] ${selected ? "bg-blue-50" : ""}`
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
                <label className="text-sm font-medium text-gray-700">
                  Delivery Date
                  {!viewOnly ? <sup className="text-red-500">*</sup> : null}
                </label>
                <DatePicker
                  selected={order.delivery_date}
                  onChange={(date) =>
                    setOrder((prev) => ({
                      ...prev,
                      delivery_date: date
                        ? date.toISOString().split("T")[0]
                        : "",
                    }))
                  }
                  placeholder="Delivery Date"
                />
              </div>
            </div>
          </div>
          <div className="col-span-2 mb-2">
            <h3 className="flex items-center gap-2 text-base mb-2 text-black">
              <HiCube className="inline-block text-xl text-black" />
              <span>Products</span>
            </h3>
            {(order.orderItems || []).map((item, idx) => (
              <div key={idx} className="w-full flex items-center">
                <div className="w-full mb-3 grid lg:grid-cols-4 md:grid-cols-2 grid-cols-1 gap-3">
                  <div>
                    <label className="text-sm font-medium text-gray-700">
                      Product
                      {!viewOnly ? <sup className="text-red-500">*</sup> : null}
                    </label>
                    <Listbox
                      value={
                        products.find((p) => p._id === item.product_id) || null
                      }
                      onChange={(product) => {
                        if (viewOnly) return;
                        handleOrderItemChange(
                          idx,
                          "product_id",
                          product ? product._id : "",
                        );
                      }}
                      disabled={viewOnly || !order.supplier_id}
                    >
                      <div className="relative">
                        <Listbox.Button
                          className={`${viewOnly || !order.supplier_id ? "cursor-default" : "cursor-pointer"} bg-gray-50 w-full border rounded-lg px-3 py-2 text-left text-sm text-gray-800 flex items-center justify-between ${!item.product_id && validateOnSave ? "border-red-500" : "border-gray-100"}`}
                        >
                          <span>
                            {products.find((p) => p._id === item.product_id)
                              ?.name
                              ? `${products.find((p) => p._id === item.product_id)?.name} (Stock: ${products.find((p) => p._id === item.product_id)?.stock - (products.find((p) => p._id === item.product_id)?.reserved_stock || 0)})`
                              : order.supplier_id
                                ? "Select product"
                                : "Select supplier first"}
                          </span>
                          <HiSelector className="w-5 h-5 text-gray-400 ml-2" />
                        </Listbox.Button>
                        <Listbox.Options className="absolute z-10 mt-1 w-full bg-white border border-gray-100 rounded-lg shadow-lg max-h-60 overflow-auto focus:outline-none text-sm">
                          {(() => {
                            const filteredProducts = order.supplier_id
                              ? products.filter(
                                  (p) =>
                                    p.supplier_id === order.supplier_id ||
                                    p.supplier?._id === order.supplier_id,
                                )
                              : [];

                            if (filteredProducts.length === 0) {
                              return (
                                <div className="px-4 py-2 text-gray-400">
                                  {order.supplier_id
                                    ? "No products for this supplier"
                                    : "Select a supplier first"}
                                </div>
                              );
                            }

                            return filteredProducts.map((product) => {
                              const isSelected = order.orderItems.some(
                                (orderItem, orderIdx) =>
                                  orderItem.product_id === product._id &&
                                  orderIdx !== idx,
                              );
                              const isDisabled =
                                product.stock <= 0 || isSelected;
                              return (
                                <Listbox.Option
                                  key={product._id}
                                  value={product}
                                  className={({ selected }) =>
                                    `px-3 py-2 text-black text-sm hover:bg-[#f1f5f9] ${selected ? "bg-blue-50" : ""} ${isDisabled ? "opacity-50 cursor-default bg-gray-50 text-gray-400" : "cursor-pointer"}`
                                  }
                                  disabled={isDisabled}
                                >
                                  {product.name} (Stock:
                                  {product.stock -
                                    (product.reserved_stock || 0)}
                                  ){isSelected ? " - Already added" : ""}
                                  {product.stock <= 0 ? " - Out of stock" : ""}
                                </Listbox.Option>
                              );
                            });
                          })()}
                        </Listbox.Options>
                      </div>
                    </Listbox>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-700">
                      Quantity
                      {!viewOnly ? <sup className="text-red-500">*</sup> : null}
                    </label>
                    <input
                      type="number"
                      min={1}
                      className={`w-full bg-gray-50 border rounded-lg px-3 py-2 text-sm text-gray-800 border-gray-100`}
                      value={item.quantity}
                      onChange={(e) => {
                        if (viewOnly) return;
                        handleOrderItemChange(idx, "quantity", e.target.value);
                      }}
                      disabled={viewOnly}
                    />
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-700">
                      Unit Price
                    </label>
                    <input
                      type="number"
                      min={0}
                      className={`w-full bg-gray-50 border rounded-lg px-3 py-2 text-sm text-gray-800 border-gray-100`}
                      placeholder="Unit Price"
                      value={item.unit_price?.toFixed(2) ?? ""}
                      disabled
                    />
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-700">
                      Line Total
                    </label>
                    <input
                      className={`w-full bg-gray-50 border rounded-lg px-3 py-2 text-sm text-gray-800 border-gray-100`}
                      value={
                        (item.unit_price ?? 0) && (item.quantity ?? 0)
                          ? (
                              (item.unit_price ?? 0) * (item.quantity ?? 0)
                            ).toFixed(2)
                          : "0"
                      }
                      disabled
                    />
                  </div>
                </div>
                {!viewOnly && (
                  <div className="max-w-10">
                    <button
                      type="button"
                      className={`text-xl px-2 mt-6 max-w-10 ${order.orderItems.length === 1 ? "text-gray-400 cursor-default" : "text-red-500 cursor-pointer"}`}
                      onClick={() => {
                        if (viewOnly) return;
                        removeOrderItem(idx);
                      }}
                      title="Remove"
                      disabled={order.orderItems.length === 1 || viewOnly}
                    >
                      <HiOutlineTrash />
                    </button>
                  </div>
                )}
              </div>
            ))}
            {!viewOnly && (
              <div className="w-full flex items-center justify-center mt-4">
                <button
                  type="button"
                  className="text-sm text-[#1e3a5f] px-6 py-2 rounded-full focus:outline-none border border-[#1e3a5f] flex items-center gap-2 cursor-pointer"
                  onClick={() => {
                    if (viewOnly) return;
                    addOrderItem();
                  }}
                >
                  <HiOutlinePlus className="text-md" /> Add Item
                </button>
              </div>
            )}
          </div>
          <div className="w-full bg-gray-50 border rounded-lg px-3 py-4 text-sm text-gray-800 border-gray-100 flex items-center justify-end gap-2">
            <h3 className="flex items-center justify-end text-lg text-black">
              <BsCurrencyDollar className="inline-block" />
              <span>Total:</span>
              <span className="ml-2 font-bold">
                {(order.orderItems || [])
                  .reduce((acc, item) => acc + (Number(item.subtotal) || 0), 0)
                  .toFixed(2)}
              </span>
            </h3>
          </div>
          <div>
            <label className="text-sm font-medium text-gray-700">
              Notes / Remarks
            </label>
            <textarea
              name="notes"
              value={order.notes || ""}
              onChange={(e) => {
                if (viewOnly) return;
                handleChange(e);
              }}
              onBlur={handleBlur}
              className="w-full bg-gray-50 border rounded-lg px-3 py-2 text-sm text-gray-800 border-gray-100"
              disabled={viewOnly}
              rows={3}
            />
          </div>
        </form>
        <div className="col-span-2 w-full flex items-center justify-end gap-3 mt-4">
          <button
            type="button"
            className="bg-gray-100 hover:bg-gray-200 text-[#1e3a5f] px-6 py-2 rounded-xl focus:outline-none border border-gray-100 flex items-center gap-2 cursor-pointer text-sm"
            onClick={handleClose}
          >
            <HiXCircle className="inline-block text-xl" />
            {viewOnly ? "Close" : "Cancel"}
          </button>
          {!viewOnly && (
            <button
              type="button"
              className="bg-[#1e3a5f] hover:bg-[#16375b] text-white px-6 py-2 rounded-xl focus:outline-none flex items-center gap-2 cursor-pointer text-sm"
              onClick={handleSubmit}
            >
              <HiOutlineDocumentText className="inline-block text-xl" />
              {loading ? "Submitting..." : data ? "Update" : "Submit"}
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default OrderRequestModal;
