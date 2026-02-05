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
  orderItems: [
    { product_id: "", quantity: 1, unit_price: null, subtotal: null },
  ],
};

const OrderRequestModal = ({ open, onClose, onSave, initial }) => {
  const [products, setProducts] = useState([]);
  const [suppliers, setSuppliers] = useState([]);
  const [order, setOrder] = useState(initial || initialOrderRequest);
  const [touched, setTouched] = useState({});
  const [validateOnSave, setValidateOnSave] = useState(false);
  const [loading, setLoading] = useState(false);
  const dialog = useDialog();
  const viewOnly = initial && initial.viewOnly;

  useEffect(() => {
    if (open) {
      getProducts().then((res) => setProducts(res.data.data || []));
      getSuppliers().then((res) => setSuppliers(res.data.data || []));
      if (initial) {
        // Convert delivery_date to yyyy-MM-dd for input value
        let deliveryDateValue = initial.delivery_date || "";
        if (deliveryDateValue) {
          const d = new Date(deliveryDateValue);
          if (!isNaN(d)) {
            deliveryDateValue = d.toISOString().slice(0, 10);
          }
        }
        setOrder({
          supplier_id:
            initial.supplier_id ||
            (typeof initial.supplier === "object"
              ? initial.supplier?._id
              : initial.supplier) ||
            "",
          delivery_date: deliveryDateValue,
          notes: initial.notes || "",
          orderItems:
            initial.orderItems &&
            Array.isArray(initial.orderItems) &&
            initial.orderItems.length > 0
              ? initial.orderItems
              : initial.items && Array.isArray(initial.items)
                ? initial.items.map((item) => ({
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
    <div>
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/5 backdrop-blur-sm">
        <div className="bg-white rounded-2xl p-6 w-full max-w-[60vw] max-h-[90vh] shadow-xl relative">
          <h2 className="text-2xl font-bold mb-6 text-center">
            {viewOnly
              ? "View Order Request"
              : initial
                ? "Edit Order Request"
                : "Add Order Request"}
          </h2>
          <form className="space-y-5 overflow-auto max-h-[50vh] px-1">
            <div className="col-span-2 mb-2">
              <h3 className="flex items-center gap-2 font-semibold text-lg mb-2 text-black">
                <HiOutlineDocumentText className="inline-block text-xl text-black" />
                <span>Basic Information</span>
              </h3>
              <div className="mb-3 grid lg:grid-cols-2 md:grid-cols-1 gap-4">
                <div>
                  <label className="block text-base font-medium mb-1">
                    Supplier
                    {!viewOnly && !order.supplier_id ? (
                      <sup className="text-red-500">*</sup>
                    ) : null}
                  </label>
                  <Listbox
                    value={
                      suppliers.find((s) => s._id === order.supplier_id) || null
                    }
                    onChange={(supplier) => {
                      if (viewOnly) return;
                      setOrder((prev) => ({
                        ...prev,
                        supplier_id: supplier ? supplier._id : "",
                      }));
                      setTouched((prev) => ({ ...prev, supplier_id: true }));
                    }}
                    disabled={viewOnly}
                  >
                    <div className="relative">
                      <Listbox.Button
                        className={`${viewOnly ? "cursor-default" : "cursor-pointer"} w-full bg-gray-50 border rounded-lg px-3 py-2 text-left text-gray-800 flex items-center justify-between ${!order.supplier_id && (touched.supplier_id || validateOnSave) ? "border-red-500" : "border-gray-200"}`}
                      >
                        <span>
                          {suppliers.find(
                            (s) => s._id === (order.supplier_id || ""),
                          )?.company_name || "Select supplier"}
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
                            className={({ selected }) =>
                              `px-4 py-2 cursor-pointer text-black hover:bg-[#f1f5f9] ${selected ? "bg-blue-50" : ""}`
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
                    Delivery Date
                    {!viewOnly && !order.delivery_date ? (
                      <sup className="text-red-500">*</sup>
                    ) : null}
                  </label>
                  <input
                    name="delivery_date"
                    type="date"
                    value={order.delivery_date || ""}
                    onChange={handleChange}
                    onBlur={handleBlur}
                    required
                    disabled={viewOnly}
                    className={`w-full bg-gray-50 border rounded-lg px-3 py-2 text-gray-800 ${!order.delivery_date && (touched.delivery_date || validateOnSave) ? "border-red-500" : "border-gray-200"}`}
                  />
                </div>
              </div>
            </div>
            <div className="col-span-2 mb-2">
              <h3 className="flex items-center gap-2 font-semibold text-lg mb-2 text-black">
                <HiCube className="inline-block text-xl text-black" />
                <span>Products</span>
              </h3>
              {(order.orderItems || []).map((item, idx) => (
                <div key={idx} className="w-full flex items-center">
                  <div className="w-full mb-3 grid lg:grid-cols-4 md:grid-cols-2 grid-cols-1 gap-4">
                    <div>
                      <label className="block text-base font-medium mb-1">
                        Product
                        {!viewOnly && !item.product_id ? (
                          <sup className="text-red-500">*</sup>
                        ) : null}
                      </label>
                      <Listbox
                        value={
                          products.find((p) => p._id === item.product_id) ||
                          null
                        }
                        onChange={(product) => {
                          if (viewOnly) return;
                          handleOrderItemChange(
                            idx,
                            "product_id",
                            product ? product._id : "",
                          );
                        }}
                        disabled={viewOnly}
                      >
                        <div className="relative">
                          <Listbox.Button
                            className={`${viewOnly ? "cursor-default" : "cursor-pointer"} w-full bg-gray-50 border rounded-lg px-3 py-2 text-left text-gray-800 flex items-center justify-between ${!item.product_id && validateOnSave ? "border-red-500" : "border-gray-200"}`}
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
                                className={({ selected }) =>
                                  `px-4 py-2 cursor-pointer text-black hover:bg-[#f1f5f9] ${selected ? "bg-blue-50" : ""}`
                                }
                              >
                                {product.name} (Stock:
                                {product.stock - (product.reserved_stock || 0)})
                              </Listbox.Option>
                            ))}
                          </Listbox.Options>
                        </div>
                      </Listbox>
                    </div>
                    <div>
                      <label className="block text-base font-medium mb-1">
                        Quantity
                        {!viewOnly && !item.quantity ? (
                          <sup className="text-red-500">*</sup>
                        ) : null}
                      </label>
                      <input
                        type="number"
                        min={1}
                        className={`w-full bg-gray-50 border rounded-lg px-3 py-2 text-gray-800 border-gray-200`}
                        placeholder="Qty"
                        value={item.quantity}
                        onChange={(e) => {
                          if (viewOnly) return;
                          handleOrderItemChange(
                            idx,
                            "quantity",
                            e.target.value,
                          );
                        }}
                        disabled={viewOnly}
                      />
                    </div>
                    <div>
                      <label className="block text-base font-medium mb-1">
                        Unit Price
                      </label>
                      <input
                        type="number"
                        min={0}
                        className={`w-full bg-gray-50 border rounded-lg px-3 py-2 text-gray-800 border-gray-200`}
                        placeholder="Unit Price"
                        value={item.unit_price?.toFixed(2) ?? ""}
                        disabled
                      />
                    </div>
                    <div>
                      <label className="block text-base font-medium mb-1">
                        Line Total
                      </label>
                      <input
                        className={`w-full bg-gray-50 border rounded-lg px-3 py-2 text-gray-800 border-gray-200`}
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
                    className=" text-[#1e3a5f] px-6 py-2 rounded-full focus:outline-none border border-[#1e3a5f] flex items-center gap-2 cursor-pointer"
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
            <div>
              <label className="block text-base font-medium mb-1">
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
                className="w-full bg-gray-50 border rounded-lg px-3 py-2 text-gray-800 border-gray-200"
                disabled={viewOnly}
                rows={3}
              />
            </div>
          </form>
          <div className="col-span-2 w-full flex items-center justify-end gap-3 mt-4">
            <button
              type="button"
              className="bg-gray-100 hover:bg-gray-200 text-[#1e3a5f] px-6 py-2 rounded-xl focus:outline-none border border-gray-200 flex items-center gap-2 cursor-pointer"
              onClick={handleClose}
            >
              <HiXCircle className="inline-block text-xl" />
              {viewOnly ? "Close" : "Cancel"}
            </button>
            {!viewOnly && (
              <button
                type="button"
                className="bg-[#1e3a5f] hover:bg-[#16375b] text-white px-6 py-2 rounded-xl focus:outline-none flex items-center gap-2 cursor-pointer"
                onClick={handleSubmit}
              >
                <HiOutlineDocumentText className="inline-block text-xl" />
                {loading ? "Submitting..." : initial ? "Update" : "Submit"}
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default OrderRequestModal;
