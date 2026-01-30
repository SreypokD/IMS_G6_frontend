import React, { useState, useEffect } from "react";
import { Listbox } from "@headlessui/react";
import { HiSelector } from "react-icons/hi";
import { HiXCircle, HiOutlineDocumentText } from "react-icons/hi";
import { getProducts, createOrderRequest } from "../api";

const initialOrderRequest = {
  product_id: "",
  quantity: 1,
  requestedDate: "",
  notes: "",
};

const OrderRequestModal = ({ open, onClose, onSave, initial }) => {
  const [products, setProducts] = useState([]);
  const [order, setOrder] = useState(initial || initialOrderRequest);
  const [touched, setTouched] = useState({});
  const [validateOnSave, setValidateOnSave] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (open) {
      getProducts().then((res) => setProducts(res.data.data || []));
      setOrder(initial || initialOrderRequest);
      setTouched({});
      setValidateOnSave(false);
      setError("");
    }
  }, [open, initial]);

  function handleChange(e) {
    const { name, value } = e.target;
    setOrder((prev) => ({
      ...prev,
      [name]: name === "quantity" ? Number(value) : value,
    }));
  }

  function handleBlur(e) {
    const { name } = e.target;
    setTouched((prev) => ({ ...prev, [name]: true }));
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setValidateOnSave(true);
    if (!order.product_id || !order.quantity || !order.requestedDate) return;
    setLoading(true);
    setError("");
    try {
      await createOrderRequest({
        product_id: order.product_id,
        quantity: order.quantity,
        requested_date: order.requestedDate,
        notes: order.notes,
      });
      if (onSave) onSave();
      handleClose();
    } catch {
      setError("Failed to submit order request");
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
        <div className="bg-white rounded-2xl p-5 w-full max-w-[40%] max-h-[80vh] shadow-xl relative">
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
                    Product <sup className="text-red-500">*</sup>
                  </label>
                  <Listbox
                    value={
                      products.find((p) => p._id === order.product_id) || null
                    }
                    onChange={(product) => {
                      setOrder((prev) => ({
                        ...prev,
                        product_id: product ? product._id : "",
                      }));
                      setTouched((prev) => ({ ...prev, product_id: true }));
                    }}
                  >
                    <div className="relative">
                      <Listbox.Button
                        className={`cursor-pointer w-full bg-gray-50 border rounded-lg px-3 py-2 text-left text-gray-800 flex items-center justify-between ${!order.product_id && (touched.product_id || validateOnSave) ? "border-red-500" : "border-gray-200"}`}
                      >
                        <span>
                          {products.find((p) => p._id === order.product_id)?.name
                            ? `${products.find((p) => p._id === order.product_id)?.name} (Stock: ${products.find((p) => p._id === order.product_id)?.stock - (products.find((p) => p._id === order.product_id)?.reserved_stock || 0)})`
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
                            {product.stock - (product.reserved_stock || 0)})
                          </Listbox.Option>
                        ))}
                      </Listbox.Options>
                    </div>
                  </Listbox>
                </div>
                <div>
                  <label className="block text-base font-medium mb-1">
                    Quantity <sup className="text-red-500">*</sup>
                  </label>
                  <input
                    name="quantity"
                    value={order.quantity}
                    onChange={(e) =>
                      setOrder((prev) => ({
                        ...prev,
                        quantity: e.target.value,
                      }))
                    }
                    onBlur={() =>
                      setTouched((prev) => ({ ...prev, quantity: true }))
                    }
                    type="number"
                    step="0.01"
                    placeholder="Quantity"
                    className={`w-full bg-gray-50 border rounded-lg px-3 py-2 text-gray-800 ${(!order.quantity || isNaN(order.quantity)) && !initial && (touched.quantity || validateOnSave) ? "border-red-500" : "border-gray-200"}`}
                  />
                </div>
                <div>
                  <label className="block text-base font-medium mb-1">
                    Requested Date <sup className="text-red-500">*</sup>
                  </label>
                  <input
                    name="requestedDate"
                    type="date"
                    value={order.requestedDate}
                    onChange={handleChange}
                    onBlur={handleBlur}
                    required
                    className={`w-full bg-gray-50 border rounded-lg px-3 py-2 text-gray-800 ${!order.requestedDate && (touched.requestedDate || validateOnSave) ? "border-red-500" : "border-gray-200"}`}
                  />
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
              className="px-5 py-2 bg-[#f8f8f8] hover:bg-[#e5e7eb] text-gray-black rounded-xl cursor-pointer  flex items-center gap-2"
              onClick={handleClose}
            >
              <HiXCircle className="inline-block text-xl" /> Cancel
            </button>
            <button
              type="button"
              className="px-5 py-2 bg-[#1e3a5f] hover:bg-[#16375b] text-white rounded-xl cursor-pointer flex items-center gap-2"
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
