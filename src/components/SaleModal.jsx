import React, { useState, useEffect } from "react";
import { getProducts, getUsers, createSale } from "../api";
import {
  HiXCircle,
  HiOutlineDocumentText,
  HiSelector,
  HiCube,
  HiOutlineTrash,
  HiOutlinePlus,
} from "react-icons/hi";
import { Listbox } from "@headlessui/react";

const defaultSale = {
  customer: "",
  items: [{ product: "", quantity: 1, price: 0, discount: 0 }],
  payment_method: "Cash",
  notes: "",
};

const paymentMethods = ["Cash", "Card", "Bank Transfer", "Other"];

export default function SaleModal({ open, onClose, onSuccess }) {
  const [sale, setSale] = useState(defaultSale);
  const [products, setProducts] = useState([]);
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (open) {
      getProducts().then((res) => setProducts(res.data.data || []));
      getUsers().then((res) => setUsers(res.data.data || []));
    }
  }, [open]);

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
    setLoading(true);
    try {
      // Compose payload as needed for backend
      await createSale({
        customer_id: sale.customer,
        items: sale.items.map((item) => ({
          product_id: item.product,
          quantity: Number(item.quantity),
          price: Number(item.price),
          discount: Number(item.discount),
        })),
        payment_method: sale.payment_method,
        notes: sale.notes,
      });
      onSuccess && onSuccess();
      onClose();
    } catch {
      setLoading(false);
    }
  };

  if (!open) return null;

  return (
    <div>
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/5 backdrop-blur-sm">
        <div className="bg-white rounded-2xl p-6 w-full max-w-[65vw] max-h-[90vh] shadow-xl relative">
          <h2 className="text-xl font-bold mb-6 text-gray-900">
            Record New Sale
          </h2>
          <form className="space-y-8 overflow-auto max-h-[70vh] px-1">
            <div className="col-span-2 mb-2">
              <h3 className="flex items-center gap-2 font-semibold text-lg mb-2 text-black">
                <HiOutlineDocumentText className="inline-block text-xl text-black" />
                <span> Customer Information</span>
              </h3>
              <div className="mb-3 grid grid-cols-1 gap-4">
                <div>
                  <label className="block text-base font-medium mb-1">
                    Customer <span className="text-red-500">*</span>
                  </label>
                  <Listbox
                    value={sale.customer}
                    onChange={(val) =>
                      setSale((prev) => ({ ...prev, customer: val }))
                    }
                    as="div"
                  >
                    <div className="relative">
                      <Listbox.Button
                        className={`cursor-pointer w-full bg-gray-50 border rounded-lg px-3 py-2 text-left text-gray-800 flex items-center justify-between border-gray-200`}
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
                            className={({ active, selected }) =>
                              `px-4 py-2 cursor-pointer ${active ? "text-[#64748b] hover:bg-[#f1f5f9] hover:text-black" : "text-gray-900"} ${selected ? "font-semibold bg-blue-50" : ""}`
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
              <h3 className="flex items-center gap-2 font-semibold text-lg mb-2 text-black">
                <HiCube className="inline-block text-xl text-black" />
                <span>Products</span>
              </h3>
              {sale.items.map((item, idx) => {
                return (
                  <div key={idx} className="w-full flex items-center">
                    <div className="w-[98%] mb-3 grid grid-cols-5 gap-4">
                      <div>
                        <label className="block text-base font-medium mb-1">
                          Product <span className="text-red-500">*</span>
                        </label>
                        <Listbox
                          value={item.product}
                          onChange={(val) =>
                            handleItemChange(idx, "product", val)
                          }
                          as="div"
                        >
                          <div className="relative">
                            <Listbox.Button
                              className={`cursor-pointer w-full bg-gray-50 border rounded-lg px-3 py-2 text-left text-gray-800 flex items-center justify-between border-gray-200`}
                            >
                              <span
                                className={item.product ? "" : "text-gray-400"}
                              >
                                {item.product
                                  ? (() => {
                                      const p = products.find(
                                        (p) => p._id === item.product,
                                      );
                                      return p ? p.name : "Select an option";
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
                                  className={({ active, selected }) =>
                                    `px-4 py-2 cursor-pointer ${active ? "text-[#64748b] hover:bg-[#f1f5f9] hover:text-black" : "text-gray-900"} ${selected ? "font-semibold bg-blue-50" : ""}`
                                  }
                                >
                                  {p.name}
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
                          min="1"
                          className={`w-full bg-gray-50 border rounded-lg px-3 py-2 text-gray-800 border-gray-200`}
                          value={item.quantity}
                          onChange={(e) =>
                            handleItemChange(idx, "quantity", e.target.value)
                          }
                          required
                        />
                      </div>
                      <div>
                        <label className="block text-base font-medium mb-1">
                          Price <span className="text-red-500">*</span>
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
                        />
                      </div>
                      <div>
                        <label className="block text-base font-medium mb-1">
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
                        />
                      </div>
                      <div>
                        <label className="block text-base font-medium mb-1">
                          Line Total:
                        </label>
                        <input
                          className="w-full bg-gray-50 border rounded-lg px-3 py-2 text-gray-800 border-gray-200"
                          value={calcLineTotal(item)}
                          disabled
                        />
                      </div>
                    </div>
                    <div className="max-w-10">
                      <button
                        type="button"
                        className={`text-xl px-2 mt-6 cursor-pointer max-w-10 ${sale.items.length === 1 ? "text-red-400 cursor-not-allowed" : "text-red-500"}`}
                        onClick={() => removeItem(idx)}
                        title="Remove"
                        disabled={sale.items.length === 1}
                      >
                        <HiOutlineTrash />
                      </button>
                    </div>
                  </div>
                );
              })}
              <div className="w-full flex items-center justify-center mt-4">
                <button
                  type="button"
                  className=" text-[#1e3a5f] px-6 py-2 rounded-full focus:outline-none border border-[#1e3a5f] flex items-center gap-2 cursor-pointer"
                  onClick={addItem}
                >
                  <HiOutlinePlus className="text-md" /> Add Item
                </button>
              </div>
            </div>
            <div className="col-span-1 mb-2">
              <h3 className="flex items-center gap-2 font-semibold text-lg mb-2 text-black">
                <HiOutlineDocumentText className="inline-block text-xl text-black" />
                <span>Payment Details</span>
              </h3>
              <div className="mb-3 grid grid-cols-2 gap-4">
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
                  >
                    <div className="relative">
                      <Listbox.Button
                        className={`cursor-pointer w-full bg-gray-50 border rounded-lg px-3 py-2 text-left text-gray-800 flex items-center justify-between border-gray-200`}
                      >
                        <span>{sale.payment_method}</span>
                        <HiSelector className="w-5 h-5 text-gray-400 ml-2" />
                      </Listbox.Button>
                      <Listbox.Options className="absolute z-10 mt-1 w-full bg-white border border-gray-200 rounded-lg shadow-lg max-h-60 overflow-auto focus:outline-none">
                        {paymentMethods.map((method) => (
                          <Listbox.Option
                            key={method}
                            value={method}
                            className={({ active, selected }) =>
                              `px-4 py-2 cursor-pointer ${active ? "text-[#64748b] hover:bg-[#f1f5f9] hover:text-black" : "text-gray-900"} ${selected ? "font-semibold bg-blue-50" : ""}`
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
                    type="number"
                    min="0"
                    max="100"
                    className={`w-full bg-gray-50 border rounded-lg px-3 py-2 text-gray-800 border-gray-200`}
                    value={calcTotal()}
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
                rows={2}
                value={sale.notes}
                onChange={(e) =>
                  setSale((prev) => ({ ...prev, notes: e.target.value }))
                }
                placeholder="Add any additional notes..."
              />
            </div>
          </form>
          <div className="col-span-2 w-full flex items-center justify-end gap-3 mt-4">
            <button
              type="button"
              className="bg-gray-100 hover:bg-gray-200 text-[#1e3a5f] px-6 py-2 rounded-full focus:outline-none border border-gray-200 flex items-center gap-2 cursor-pointer"
              onClick={onClose}
              disabled={loading}
            >
              <HiXCircle className="inline-block text-xl" /> Cancel
            </button>
            <button
              type="submit"
              className="bg-[#1e3a5f] hover:bg-[#16375b] text-white px-6 py-2 rounded-full focus:outline-none flex items-center gap-2 cursor-pointer"
              disabled={loading}
              onClick={handleSubmit}
            >
              <HiOutlineDocumentText className="inline-block text-xl" />{" "}
              {loading ? "Saving..." : "Complete Sale"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
