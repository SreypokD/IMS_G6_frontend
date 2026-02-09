import React, { useState, useEffect } from "react";
import { getProducts, getUsers } from "../api";
import {
  HiXCircle,
  HiOutlineDocumentText,
  HiSelector,
  HiCube,
  HiOutlineTrash,
  HiOutlinePlus,
} from "react-icons/hi";
import { Listbox } from "@headlessui/react";
import { useDialog } from "../contexts/dialog/useDialog";

const defaultSale = {
  customer: "",
  items: [{ product: "", quantity: 1, price: 0, discount: 0 }],
  payment_method: "Cash",
  notes: "",
};

const paymentMethods = ["Cash", "Card", "Bank Transfer", "Other"];

export default function SaleModal({
  open,
  onClose,
  onSave,
  initial,
  viewOnly = false,
}) {
  const [sale, setSale] = useState(defaultSale);
  const [products, setProducts] = useState([]);
  const [users, setUsers] = useState([]);
  const dialog = useDialog();

  useEffect(() => {
    if (open) {
      getProducts().then((res) => setProducts(res.data.data || []));
      getUsers().then((res) => setUsers(res.data.data || []));

      if (initial) {
        // eslint-disable-next-line react-hooks/set-state-in-effect
        setSale({
          customer: initial.customer?._id || initial.customer_id || "",
          items:
            initial.items && initial.items.length > 0
              ? initial.items.map((item) => ({
                  ...item,
                  product:
                    typeof item.product === "object"
                      ? item.product._id
                      : item.product,
                }))
              : [
                  {
                    product: initial.product?._id || initial.product_id || "",
                    quantity: initial.quantity || 1,
                    price: initial.price || 0,
                    discount: initial.discount || 0,
                  },
                ],
          payment_method: initial.payment_method || "Cash",
          notes: initial.notes || "",
        });
      } else {
        setSale(defaultSale);
      }
    }
  }, [open, initial]);

  const handleItemChange = (idx, field, value) => {
    setSale((prev) => {
      const items = [...prev.items];
      items[idx] = { ...items[idx], [field]: value };
      return { ...prev, items };
    });
  };

  const addItem = () => {
    setSale((prev) => ({
      ...prev,
      items: [
        ...prev.items,
        { product: "", quantity: 1, price: 0, discount: 0 },
      ],
    }));
  };

  const removeItem = (idx) => {
    setSale((prev) => ({
      ...prev,
      items: prev.items.filter((_, i) => i !== idx),
    }));
  };

  const calcLineTotal = (item) => {
    const price = Number(item.price) || 0;
    const qty = Number(item.quantity) || 0;
    const discount = Number(item.discount) || 0;
    return (price * qty * (1 - discount / 100)).toFixed(2);
  };

  const calcTotal = () => {
    return sale.items
      .reduce((sum, item) => sum + parseFloat(calcLineTotal(item)), 0)
      .toFixed(2);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Validation
    if (!sale.customer) {
      dialog.error("Please select a customer.");
      return;
    }
    if (sale.items.length === 0) {
      dialog.error("Please add at least one product.");
      return;
    }
    for (const item of sale.items) {
      if (!item.product) {
        dialog.error("Please select a product for all items.");
        return;
      }
      if (Number(item.quantity) <= 0) {
        dialog.error("Quantity must be greater than 0.");
        return;
      }
      if (Number(item.price) < 0) {
        dialog.error("Price cannot be negative.");
        return;
      }
    }

    const payload = {
      customer_id: sale.customer,
      items: sale.items.map((item) => ({
        product_id: item.product,
        quantity: Number(item.quantity),
        price: Number(item.price),
        discount: Number(item.discount),
      })),
      payment_method: sale.payment_method,
      notes: sale.notes,
    };

    onSave(payload);
  };

  if (!open) return null;

  return (
    <div>
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/5 backdrop-blur-sm">
        <div className="bg-white rounded-2xl p-5 w-full max-w-[70%] max-h-[80vh] shadow-xl relative">
          <h2 className="text-xl font-bold mb-6 text-center">
            {viewOnly ? "View Sale" : initial ? "Edit Sale" : "Record New Sale"}
          </h2>
          <form className="space-y-5 overflow-auto max-h-[60vh] px-1">
            <div className="col-span-2 mb-2">
              <h3 className="flex items-center gap-2 text-base mb-2 text-black">
                <HiOutlineDocumentText className="inline-block text-xl text-black" />
                <span> Customer Information</span>
              </h3>
              <div className="mb-3 grid grid-cols-1 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-1">
                    Customer
                    {!viewOnly ? <sup className="text-red-500">*</sup> : null}
                  </label>
                  <Listbox
                    value={sale.customer}
                    onChange={(val) =>
                      setSale((prev) => ({ ...prev, customer: val }))
                    }
                    as="div"
                    disabled={viewOnly}
                  >
                    <div className="relative">
                      <Listbox.Button
                        className={`${viewOnly ? "cursor-default" : "cursor-pointer"} w-full bg-gray-50 border rounded-lg px-3 py-2 text-left text-gray-800 flex items-center justify-between border-gray-200`}
                      >
                        <span className={sale.customer ? "" : "text-gray-400"}>
                          {sale.customer
                            ? (() => {
                                const u = users.find(
                                  (u) => u._id === sale.customer,
                                );
                                return u
                                  ? `${u.first_name} ${u.last_name || ""} (${u.email})`
                                  : "Select customer";
                              })()
                            : "Select customer"}
                        </span>
                        <HiSelector className="w-5 h-5 text-gray-400 ml-2" />
                      </Listbox.Button>
                      <Listbox.Options className="absolute z-10 mt-1 w-full bg-white border border-gray-200 rounded-lg shadow-lg max-h-60 overflow-auto focus:outline-none">
                        {users.map((u) => (
                          <Listbox.Option
                            key={u._id}
                            value={u._id}
                            className={({ selected }) =>
                              `px-4 py-2 cursor-pointer text-black text-sm hover:bg-[#f1f5f9] ${selected ? "bg-blue-50" : ""}`
                            }
                          >
                            {u.first_name} {u.last_name} ({u.email})
                          </Listbox.Option>
                        ))}
                      </Listbox.Options>
                    </div>
                  </Listbox>
                </div>
              </div>
            </div>
            <div className="col-span-1 mb-2">
              <h3 className="flex items-center gap-2 text-base mb-2 text-black">
                <HiCube className="inline-block text-xl text-black" />
                <span>Products</span>
              </h3>
              {sale.items.map((item, idx) => {
                return (
                  <div key={idx} className="w-full flex items-center">
                    <div className="w-full mb-3 grid lg:grid-cols-5 md:grid-cols-2 grid-cols-1 gap-4">
                      <div>
                        <label className="block text-sm font-medium mb-1">
                          Product
                          {!viewOnly ? (
                            <sup className="text-red-500">*</sup>
                          ) : null}
                        </label>
                        <Listbox
                          value={item.product}
                          onChange={(val) =>
                            handleItemChange(idx, "product", val)
                          }
                          as="div"
                          disabled={viewOnly}
                        >
                          <div className="relative">
                            <Listbox.Button
                              className={`${viewOnly ? "cursor-default" : "cursor-pointer"} w-full bg-gray-50 border rounded-lg px-3 py-2 text-left text-gray-800 flex items-center justify-between border-gray-200`}
                            >
                              <span
                                className={item.product ? "" : "text-gray-400"}
                              >
                                {item.product
                                  ? (() => {
                                      const p = products.find(
                                        (p) => p._id === item.product,
                                      );
                                      return p
                                        ? `${p.name}`
                                        : "Select an option";
                                    })()
                                  : "Select an option"}
                              </span>
                              <HiSelector className="w-5 h-5 text-gray-400 ml-2" />
                            </Listbox.Button>
                            <Listbox.Options className="absolute z-10 mt-1 w-full bg-white border border-gray-200 rounded-lg shadow-lg max-h-60 overflow-auto focus:outline-none">
                              {products.map((p) => (
                                <Listbox.Option
                                  key={p._id}
                                  value={p._id}
                                  className={({ selected }) =>
                                    `px-4 py-2 text-black text-sm hover:bg-[#f1f5f9] ${selected ? "bg-blue-50" : ""} ${p.stock <= 0 ? "opacity-50 cursor-default bg-red-50 text-red-500" : "cursor-pointer "}`
                                  }
                                  disabled={p.stock <= 0}
                                >
                                  {p.name} (Stock:
                                  {p.stock - (p.reserved_stock || 0)})
                                </Listbox.Option>
                              ))}
                            </Listbox.Options>
                          </div>
                        </Listbox>
                      </div>
                      <div>
                        <label className="block text-sm font-medium mb-1">
                          Quantity
                          {!viewOnly ? (
                            <sup className="text-red-500">*</sup>
                          ) : null}
                        </label>
                        <div className="relative">
                          <input
                            type="number"
                            className={`w-full bg-gray-50 border rounded-lg px-3 py-2 text-gray-800 border-gray-200`}
                            value={item.quantity}
                            onChange={(e) => {
                              const val = Number(e.target.value);
                              const p = products.find(
                                (prod) => prod._id === item.product,
                              );
                              if (p && val > p.stock) {
                                handleItemChange(idx, "quantity", p.stock);
                              } else {
                                handleItemChange(
                                  idx,
                                  "quantity",
                                  e.target.value,
                                );
                              }
                            }}
                            required
                            disabled={viewOnly}
                          />
                        </div>
                      </div>
                      <div>
                        <label className="block text-sm font-medium mb-1">
                          Price
                          {!viewOnly ? (
                            <sup className="text-red-500">*</sup>
                          ) : null}
                        </label>
                        <input
                          type="number"
                          min="0"
                          className={`w-full bg-gray-50 border rounded-lg px-3 py-2 text-gray-800 border-gray-200`}
                          value={item.price}
                          onChange={(e) =>
                            handleItemChange(idx, "price", e.target.value)
                          }
                          required
                          disabled={viewOnly}
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium mb-1">
                          Discount (%)
                        </label>
                        <input
                          type="number"
                          min="0"
                          max="100"
                          className={`w-full bg-gray-50 border rounded-lg px-3 py-2 text-gray-800 border-gray-200`}
                          value={item.discount}
                          onChange={(e) =>
                            handleItemChange(idx, "discount", e.target.value)
                          }
                          disabled={viewOnly}
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium mb-1">
                          Line Total
                        </label>
                        <input
                          className="w-full bg-gray-50 border rounded-lg px-3 py-2 text-gray-800 border-gray-200 bg-gray-100"
                          value={calcLineTotal(item)}
                          disabled
                        />
                      </div>
                    </div>
                    {!viewOnly && (
                      <div className="max-w-10">
                        <button
                          type="button"
                          className={`text-xl px-2 mt-6 max-w-10 ${sale.items.length === 1 ? "opacity-50 cursor-default" : "text-red-500 cursor-pointer"}`}
                          onClick={() => removeItem(idx)}
                          title="Remove"
                          disabled={sale.items.length === 1}
                        >
                          <HiOutlineTrash />
                        </button>
                      </div>
                    )}
                  </div>
                );
              })}
              {!viewOnly && (
                <div className="w-full flex items-center justify-center mt-4">
                  <button
                    type="button"
                    className=" text-[#1e3a5f] px-6 py-2 rounded-full focus:outline-none border border-[#1e3a5f] flex items-center gap-2 cursor-pointer"
                    onClick={addItem}
                  >
                    <HiOutlinePlus className="text-md" /> Add Item
                  </button>
                </div>
              )}
            </div>
            <div className="col-span-1 mb-2">
              <h3 className="flex items-center gap-2 text-base mb-2 text-black">
                <HiOutlineDocumentText className="inline-block text-xl text-black" />
                <span>Payment Details</span>
              </h3>
              <div className="mb-3 grid lg:grid-cols-2 md:grid-cols-1 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Payment Method <span className="text-red-500">*</span>
                  </label>
                  <Listbox
                    value={sale.payment_method}
                    onChange={(val) =>
                      setSale((prev) => ({ ...prev, payment_method: val }))
                    }
                    as="div"
                    disabled={viewOnly}
                  >
                    <div className="relative">
                      <Listbox.Button
                        className={`cursor-pointer w-full bg-gray-50 border rounded-lg px-3 py-2 text-left text-gray-800 flex items-center justify-between border-gray-200 ${viewOnly ? "bg-gray-100" : ""}`}
                      >
                        <span>{sale.payment_method}</span>
                        <HiSelector className="w-5 h-5 text-gray-400 ml-2" />
                      </Listbox.Button>
                      <Listbox.Options className="absolute z-10 mt-1 w-full bg-white border border-gray-200 rounded-lg shadow-lg max-h-60 overflow-auto focus:outline-none">
                        {paymentMethods.map((method) => (
                          <Listbox.Option
                            key={method}
                            value={method}
                            className={({ selected }) =>
                              `px-4 py-2 cursor-pointer text-black text-sm hover:bg-[#f1f5f9] ${selected ? "bg-blue-50" : ""}`
                            }
                          >
                            {method}
                          </Listbox.Option>
                        ))}
                      </Listbox.Options>
                    </div>
                  </Listbox>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Total Amount
                  </label>
                  <input
                    className={`w-full bg-gray-50 border rounded-lg px-3 py-2 text-gray-800 border-gray-200 bg-gray-100`}
                    value={calcTotal()}
                    disabled
                  />
                </div>
              </div>
            </div>
            <div className="mt-4">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Notes (Optional)
              </label>
              <textarea
                className="w-full border border-gray-200 rounded-lg px-3 py-2 bg-gray-50 text-gray-800"
                rows={3}
                value={sale.notes}
                onChange={(e) =>
                  setSale((prev) => ({ ...prev, notes: e.target.value }))
                }
                placeholder="Add any additional notes..."
                disabled={viewOnly}
              />
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
                type="submit"
                className="bg-[#1e3a5f] hover:bg-[#16375b] text-white px-6 py-2 rounded-xl focus:outline-none flex items-center gap-2 cursor-pointer"
                onClick={handleSubmit}
              >
                <HiOutlineDocumentText className="inline-block text-xl" />
                {initial ? "Update Sale" : "Complete Sale"}
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
