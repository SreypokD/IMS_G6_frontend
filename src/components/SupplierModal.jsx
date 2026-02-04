import React, { useState } from "react";
import { Listbox } from "@headlessui/react";
import { HiSelector } from "react-icons/hi";
import {
  HiXCircle,
  HiOutlineDocumentText,
  HiOutlineOfficeBuilding,
  HiOutlineUser,
  HiOutlineLocationMarker,
  HiOutlineNewspaper,
} from "react-icons/hi";

const paymentTerms = [
  { _id: 1, name: "Net 30 Days" },
  { _id: 2, name: "Net 60 Days" },
  { _id: 3, name: "Net 90 Days" },
  { _id: 4, name: "Cash on Delivery" },
  { _id: 5, name: "Advance Payment" },
];

const statuses = [
  { _id: 1, name: "Active" },
  { _id: 2, name: "Inactive" },
  { _id: 3, name: "Pending" },
];

const initialSupplier = {
  company_name: "",
  location: "",
  contact_person: "",
  contact_position: "",
  contact_email: "",
  contact_phone: "",
  address: {
    street: "",
    house: "",
    village: "",
    commune: "",
    district: "",
    province: "",
    country: "",
  },
  payment_term: "",
  status: statuses[0].name,
};

const SupplierModal = ({
  open,
  onClose,
  onSave,
  initial,
  readOnly = false,
}) => {
  const [supplier, setSupplier] = useState(initial || initialSupplier);
  const [touched, setTouched] = useState({});
  const [validateOnSave, setValidateOnSave] = useState(false);

  // Clear form fields when opening for create
  React.useEffect(() => {
    if (open && !initial) {
      setSupplier(initialSupplier);
      setTouched({});
      setValidateOnSave(false);
    } else if (open && initial) {
      setSupplier(initial);
      setTouched({});
      setValidateOnSave(false);
    }
  }, [open, initial]);

  if (!open) return null;
  return (
    <div>
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/5 backdrop-blur-sm">
        <div className="bg-white rounded-2xl p-5 w-full max-w-[40%] max-h-[80vh] shadow-xl relative">
          <h2 className="text-2xl font-bold mb-6 text-center">
            {readOnly
              ? "View Supplier"
              : initial
                ? "Edit Supplier"
                : "Add Supplier"}
          </h2>
          <form className="space-y-5 overflow-auto max-h-[50vh] px-1">
            <div className="col-span-2 mb-2">
              <h3 className="flex items-center gap-2 font-semibold text-lg mb-2 text-black">
                <HiOutlineOfficeBuilding className="inline-block text-xl text-black" />
                <span>Company Info</span>
              </h3>
              <div className="mb-3 grid lg:grid-cols-2 md:grid-cols-1 gap-4">
                <div>
                  <label className="block text-base font-medium mb-1">
                    Company Name
                    {!supplier.company_name && !initial ? (
                      <sup className="text-red-500">*</sup>
                    ) : null}
                  </label>
                  <input
                    name="company_name"
                    value={supplier.company_name}
                    onChange={(e) =>
                      setSupplier({ ...supplier, company_name: e.target.value })
                    }
                    onBlur={() =>
                      setTouched((prev) => ({ ...prev, company_name: true }))
                    }
                    placeholder="Supplier Name"
                    className={`w-full bg-gray-50 border rounded-lg px-3 py-2 text-gray-800 ${!supplier.company_name && !initial && (touched.company_name || validateOnSave) ? "border-red-500" : "border-gray-200"}`}
                    disabled={readOnly}
                  />
                </div>
                <div>
                  <label className="block text-base font-medium mb-1">
                    Location
                    {!supplier.location && !initial ? (
                      <sup className="text-red-500">*</sup>
                    ) : null}
                  </label>
                  <input
                    name="location"
                    value={supplier.location}
                    onChange={(e) =>
                      setSupplier({ ...supplier, location: e.target.value })
                    }
                    onBlur={() =>
                      setTouched((prev) => ({ ...prev, location: true }))
                    }
                    placeholder="Supplier Location"
                    className={`w-full bg-gray-50 border rounded-lg px-3 py-2 text-gray-800 ${!supplier.location && !initial && (touched.location || validateOnSave) ? "border-red-500" : "border-gray-200"}`}
                    disabled={readOnly}
                  />
                </div>
              </div>
            </div>
            <div className="col-span-2 mb-2">
              <h3 className="flex items-center gap-2 font-semibold text-lg mb-2 text-black">
                <HiOutlineUser className="inline-block text-xl text-black" />
                <span>Primary Contact Details</span>
              </h3>
              <div className="mb-3 grid lg:grid-cols-2 md:grid-cols-1 gap-4">
                <div>
                  <label className="block text-base font-medium mb-1">
                    Contact Person
                    {!supplier.contact_person && !initial ? (
                      <sup className="text-red-500">*</sup>
                    ) : null}
                  </label>
                  <input
                    name="contact_person"
                    value={supplier.contact_person}
                    onChange={(e) =>
                      setSupplier({
                        ...supplier,
                        contact_person: e.target.value,
                      })
                    }
                    onBlur={() =>
                      setTouched((prev) => ({
                        ...prev,
                        contact_person: true,
                      }))
                    }
                    placeholder="Supplier Contact Person"
                    className={`w-full bg-gray-50 border rounded-lg px-3 py-2 text-gray-800 ${!supplier.contact_person && !initial && (touched.contact_person || validateOnSave) ? "border-red-500" : "border-gray-200"}`}
                    disabled={readOnly}
                  />
                </div>
                <div>
                  <label className="block text-base font-medium mb-1">
                    Role/Position
                    {!supplier.contact_position && !initial ? (
                      <sup className="text-red-500">*</sup>
                    ) : null}
                  </label>
                  <input
                    name="contact_position"
                    value={supplier.contact_position}
                    onChange={(e) =>
                      setSupplier({
                        ...supplier,
                        contact_position: e.target.value,
                      })
                    }
                    onBlur={() =>
                      setTouched((prev) => ({
                        ...prev,
                        contact_position: true,
                      }))
                    }
                    placeholder="Supplier Contact Position"
                    className={`w-full bg-gray-50 border rounded-lg px-3 py-2 text-gray-800 ${!supplier.contact_position && !initial && (touched.contact_position || validateOnSave) ? "border-red-500" : "border-gray-200"}`}
                    disabled={readOnly}
                  />
                </div>
                <div>
                  <label className="block text-base font-medium mb-1">
                    Email Address
                    {!supplier.contact_email && !initial ? (
                      <sup className="text-red-500">*</sup>
                    ) : null}
                  </label>
                  <input
                    name="contact_email"
                    value={supplier.contact_email}
                    onChange={(e) =>
                      setSupplier({
                        ...supplier,
                        contact_email: e.target.value,
                      })
                    }
                    onBlur={() =>
                      setTouched((prev) => ({
                        ...prev,
                        contact_email: true,
                      }))
                    }
                    placeholder="Supplier Contact Email"
                    className={`w-full bg-gray-50 border rounded-lg px-3 py-2 text-gray-800 ${!supplier.contact_email && !initial && (touched.contact_email || validateOnSave) ? "border-red-500" : "border-gray-200"}`}
                    disabled={readOnly}
                  />
                </div>
                <div>
                  <label className="block text-base font-medium mb-1">
                    Phone Number
                    {!supplier.contact_phone && !initial ? (
                      <sup className="text-red-500">*</sup>
                    ) : null}
                  </label>
                  <input
                    name="contact_phone"
                    value={supplier.contact_phone}
                    onChange={(e) =>
                      setSupplier({
                        ...supplier,
                        contact_phone: e.target.value,
                      })
                    }
                    onBlur={() =>
                      setTouched((prev) => ({
                        ...prev,
                        contact_phone: true,
                      }))
                    }
                    placeholder="Supplier Contact Phone"
                    className={`w-full bg-gray-50 border rounded-lg px-3 py-2 text-gray-800 ${!supplier.contact_phone && !initial && (touched.contact_phone || validateOnSave) ? "border-red-500" : "border-gray-200"}`}
                    disabled={readOnly}
                  />
                </div>
              </div>
            </div>
            <div className="col-span-2 mb-2">
              <h3 className="flex items-center gap-2 font-semibold text-lg mb-2 text-black">
                <HiOutlineLocationMarker className="inline-block text-xl text-black" />
                <span>Address</span>
              </h3>
              <div className="mb-3 grid lg:grid-cols-2 md:grid-cols-1 gap-4">
                <div>
                  <label className="block text-base font-medium mb-1">
                    Street
                  </label>
                  <input
                    className={`w-full bg-gray-50 border rounded-lg px-3 py-2 text-gray-800 ${!supplier.address.street && !initial && (touched.street || validateOnSave) ? "border-red-500" : "border-gray-200"}`}
                    value={supplier.address.street}
                    onChange={(e) =>
                      setSupplier({
                        ...supplier,
                        address: {
                          ...supplier.address,
                          street: e.target.value,
                        },
                      })
                    }
                    onBlur={() =>
                      setTouched((prev) => ({ ...prev, street: true }))
                    }
                    disabled={readOnly}
                  />
                </div>
                <div>
                  <label className="block mb-1">House</label>
                  <input
                    type="text"
                    className={`w-full bg-gray-50 border rounded-lg px-3 py-2 text-gray-800 ${!supplier.address.house && !initial && (touched.house || validateOnSave) ? "border-red-500" : "border-gray-200"}`}
                    value={supplier.address.house}
                    onChange={(e) =>
                      setSupplier({
                        ...supplier,
                        address: { ...supplier.address, house: e.target.value },
                      })
                    }
                    onBlur={() =>
                      setTouched((prev) => ({ ...prev, house: true }))
                    }
                    disabled={readOnly}
                  />
                </div>
                <div>
                  <label className="block mb-1">
                    Village
                    {!supplier.address.village && !initial ? (
                      <sup className="text-red-500">*</sup>
                    ) : null}
                  </label>
                  <input
                    type="text"
                    className={`w-full bg-gray-50 border rounded-lg px-3 py-2 text-gray-800 ${!supplier.address.village && !initial && (touched.village || validateOnSave) ? "border-red-500" : "border-gray-200"}`}
                    value={supplier.address.village}
                    onChange={(e) =>
                      setSupplier({
                        ...supplier,
                        address: {
                          ...supplier.address,
                          village: e.target.value,
                        },
                      })
                    }
                    onBlur={() =>
                      setTouched((prev) => ({ ...prev, village: true }))
                    }
                    disabled={readOnly}
                  />
                </div>
                <div>
                  <label className="block mb-1">
                    Commune
                    {!supplier.address.commune && !initial ? (
                      <sup className="text-red-500">*</sup>
                    ) : null}
                  </label>
                  <input
                    type="text"
                    className={`w-full bg-gray-50 border rounded-lg px-3 py-2 text-gray-800 ${!supplier.address.commune && !initial && (touched.commune || validateOnSave) ? "border-red-500" : "border-gray-200"}`}
                    value={supplier.address.commune}
                    onChange={(e) =>
                      setSupplier({
                        ...supplier,
                        address: {
                          ...supplier.address,
                          commune: e.target.value,
                        },
                      })
                    }
                    onBlur={() =>
                      setTouched((prev) => ({ ...prev, commune: true }))
                    }
                    disabled={readOnly}
                  />
                </div>
                <div>
                  <label className="block mb-1">
                    District
                    {!supplier.address.district && !initial ? (
                      <sup className="text-red-500">*</sup>
                    ) : null}
                  </label>
                  <input
                    type="text"
                    className={`w-full bg-gray-50 border rounded-lg px-3 py-2 text-gray-800 ${!supplier.address.district && !initial && (touched.district || validateOnSave) ? "border-red-500" : "border-gray-200"}`}
                    value={supplier.address.district}
                    onChange={(e) =>
                      setSupplier({
                        ...supplier,
                        address: {
                          ...supplier.address,
                          district: e.target.value,
                        },
                      })
                    }
                    onBlur={() =>
                      setTouched((prev) => ({ ...prev, district: true }))
                    }
                    disabled={readOnly}
                  />
                </div>
                <div>
                  <label className="block mb-1">
                    City/Province
                    {!supplier.address.province && !initial ? (
                      <sup className="text-red-500">*</sup>
                    ) : null}
                  </label>
                  <input
                    type="text"
                    className={`w-full bg-gray-50 border rounded-lg px-3 py-2 text-gray-800 ${!supplier.address.province && !initial && (touched.province || validateOnSave) ? "border-red-500" : "border-gray-200"}`}
                    value={supplier.address.province}
                    onChange={(e) =>
                      setSupplier({
                        ...supplier,
                        address: {
                          ...supplier.address,
                          province: e.target.value,
                        },
                      })
                    }
                    onBlur={() =>
                      setTouched((prev) => ({ ...prev, province: true }))
                    }
                    disabled={readOnly}
                  />
                </div>
                <div>
                  <label className="block mb-1">
                    Country
                    {!supplier.address.country && !initial ? (
                      <sup className="text-red-500">*</sup>
                    ) : null}
                  </label>
                  <input
                    type="text"
                    className={`w-full bg-gray-50 border rounded-lg px-3 py-2 text-gray-800 ${!supplier.address.country && !initial && (touched.country || validateOnSave) ? "border-red-500" : "border-gray-200"}`}
                    value={supplier.address.country}
                    onChange={(e) =>
                      setSupplier({
                        ...supplier,
                        address: {
                          ...supplier.address,
                          country: e.target.value,
                        },
                      })
                    }
                    onBlur={() =>
                      setTouched((prev) => ({ ...prev, country: true }))
                    }
                    disabled={readOnly}
                  />
                </div>
              </div>
            </div>
            <div className="col-span-2 mb-2">
              <h3 className="flex items-center gap-2 font-semibold text-lg mb-2 text-black">
                <HiOutlineNewspaper className="inline-block text-xl text-black" />
                <span>Business Terms</span>
              </h3>
              <div className="mb-3 grid lg:grid-cols-2 md:grid-cols-1 gap-4">
                <div>
                  <label className="block text-base font-medium mb-1">
                    Payment Terms
                    {!initial ? <sup className="text-red-500">*</sup> : null}
                  </label>
                  <Listbox
                    value={
                      paymentTerms.find(
                        (pt) => pt.name === supplier.payment_term,
                      ) || null
                    }
                    onChange={
                      readOnly
                        ? () => {}
                        : (pt) =>
                            setSupplier({
                              ...supplier,
                              payment_term: pt ? pt.name : "",
                            })
                    }
                    disabled={readOnly}
                  >
                    <div className="relative">
                      <Listbox.Button
                        className={`w-full bg-gray-50 border rounded-lg px-3 py-2 text-left text-gray-800 flex items-center justify-between ${readOnly ? "bg-gray-100 cursor-default" : "cursor-pointer"} ${!supplier.payment_term && !initial && (touched.payment_term || validateOnSave) ? "border-red-500" : "border-gray-200"}`}
                        disabled={readOnly}
                      >
                        <span>
                          {paymentTerms.find(
                            (pt) => pt.name === supplier.payment_term,
                          )?.name || "Select Payment Term"}
                        </span>
                        <HiSelector className="w-5 h-5 text-gray-400 ml-2" />
                      </Listbox.Button>
                      <Listbox.Options className="absolute z-10 mt-1 w-full bg-white border border-gray-200 rounded-lg shadow-lg max-h-60 overflow-auto focus:outline-none">
                        {paymentTerms.length === 0 && (
                          <div className="px-4 py-2 text-gray-400">
                            No payment terms
                          </div>
                        )}
                        {paymentTerms.map((pt) => (
                          <Listbox.Option
                            key={pt._id}
                            value={pt}
                            className={({ selected }) =>
                              `px-4 py-2 cursor-pointer text-black hover:bg-[#f1f5f9] ${selected ? "bg-blue-50" : ""}`
                            }
                          >
                            {pt.name}
                          </Listbox.Option>
                        ))}
                      </Listbox.Options>
                    </div>
                  </Listbox>
                </div>
                <div>
                  <label className="block text-base font-medium mb-1">
                    Supplier Status
                    {!initial ? <sup className="text-red-500">*</sup> : null}
                  </label>
                  <Listbox
                    value={
                      statuses.find((st) => st.name === supplier.status) || null
                    }
                    onChange={
                      readOnly
                        ? () => {}
                        : (st) =>
                            setSupplier({
                              ...supplier,
                              status: st ? st.name : "",
                            })
                    }
                    disabled={readOnly}
                  >
                    <div className="relative">
                      <Listbox.Button
                        className={`w-full bg-gray-50 border rounded-lg px-3 py-2 text-left text-gray-800 flex items-center justify-between ${readOnly ? "bg-gray-100 cursor-default" : "cursor-pointer"} ${!supplier.status && !initial && (touched.status || validateOnSave) ? "border-red-500" : "border-gray-200"}`}
                        disabled={readOnly}
                      >
                        <span>
                          {statuses.find((st) => st.name === supplier.status)
                            ?.name || "Select status"}
                        </span>
                        <HiSelector className="w-5 h-5 text-gray-400 ml-2" />
                      </Listbox.Button>
                      <Listbox.Options className="absolute z-10 mt-1 w-full bg-white border border-gray-200 rounded-lg shadow-lg max-h-60 overflow-auto focus:outline-none">
                        {statuses.length === 0 && (
                          <div className="px-4 py-2 text-gray-400">
                            No statuses
                          </div>
                        )}
                        {statuses.map((st) => (
                          <Listbox.Option
                            key={st._id}
                            value={st}
                            className={({ selected }) =>
                              `px-4 py-2 cursor-pointer text-black hover:bg-[#f1f5f9] ${selected ? "bg-blue-50" : ""}`
                            }
                          >
                            {st.name}
                          </Listbox.Option>
                        ))}
                      </Listbox.Options>
                    </div>
                  </Listbox>
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
              <HiXCircle className="inline-block text-xl" /> Close
            </button>
            {!readOnly && (
              <button
                type="button"
                className="bg-[#1e3a5f] hover:bg-[#16375b] text-white px-6 py-2 rounded-xl focus:outline-none flex items-center gap-2 cursor-pointer"
                onClick={() => {
                  setValidateOnSave(true);
                  setTouched({
                    name: true,
                    category: true,
                    supplier: true,
                    price: true,
                    stock: true,
                    image: true,
                  });
                  onSave(supplier);
                }}
              >
                <HiOutlineDocumentText className="inline-block text-xl" />
                {initial ? "Update Supplier" : "Add Supplier"}
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default SupplierModal;
