import React, { useState, useEffect } from "react";
import { Listbox } from "@headlessui/react";
import { HiSelector } from "react-icons/hi";
import { getPermissions, uploadFile } from "../api/index";
import {
  HiXCircle,
  HiOutlineDocumentText,
  HiOutlineLocationMarker,
  HiOutlineKey,
  HiOutlineCamera,
  HiOutlineUpload,
  HiEye,
  HiEyeOff,
  HiOutlineBriefcase,
  HiOutlineIdentification,
} from "react-icons/hi";
import { locations } from "../data/locations";

const initial = {
  first_name: "",
  last_name: "",
  email: "",
  password: "",
  role: "",
  phone: "",
  status: "active",
  address: {
    street: "",
    house: "",
    village: "",
    commune: "",
    district: "",
    province: "",
  },
  profile: "",
  customer_type: "business",
  company_name: "",
  position: "",
  company_registration_no: "",
  request_purpose: "",
  expected_order_volume: "",
  order_frequency: "",
  product_categories: [],
  id_card_or_business_license: "",
  shop_photo: "",
  location_photo: "",
  note_from_customer: "",
};

const UserModal = ({ open, onClose, onSave, data, viewOnly = false }) => {
  const computedInitialUser = React.useMemo(() => data || initial, [data]);
  const [user, setUser] = useState(() => computedInitialUser);
  const [selectedImage, setSelectedImage] = useState(null);
  const [touched, setTouched] = useState({});
  const [validateOnSave, setValidateOnSave] = useState(false);
  const [roles, setRoles] = useState([]);
  const [showPassword, setShowPassword] = useState(false);

  // Fetch roles when modal opens
  useEffect(() => {
    if (open) {
      getPermissions().then((res) => {
        if (Array.isArray(res.data)) {
          setRoles(res.data);
        } else if (Array.isArray(res.data?.data)) {
          setRoles(res.data.data);
        } else {
          setRoles([]);
        }
      });
    }
  }, [open]);

  // Update local state when data changes (e.g. when opening "View" for a different user)
  useEffect(() => {
    setUser(data || initial);
  }, [data]);

  async function handleImageChange(e) {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setSelectedImage(file);
      try {
        const res = await uploadFile(file);
        const url = res.data?.url || res.data?.file?.url;
        if (url) {
          setUser((prev) => ({ ...prev, profile: url }));
        }
      } catch (err) {
        console.error("Image upload failed", err);
      }
    }
  }

  const handleProvinceChange = (provinceName) => {
    setUser((prev) => ({
      ...prev,
      address: {
        ...prev.address,
        province: provinceName,
        district: "",
        commune: "",
      },
    }));
  };

  const handleDistrictChange = (districtName) => {
    setUser((prev) => ({
      ...prev,
      address: {
        ...prev.address,
        district: districtName,
        commune: "",
      },
    }));
  };

  const handleCommuneChange = (communeName) => {
    setUser((prev) => ({
      ...prev,
      address: {
        ...prev.address,
        commune: communeName,
        village: "",
      },
    }));
  };

  const handleVillageChange = (villageName) => {
    setUser((prev) => ({
      ...prev,
      address: {
        ...prev.address,
        village: villageName,
      },
    }));
  };

  const renderBadge = (text) => (
    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800 mr-2 mb-1">
      {text}
    </span>
  );

  const renderImagePreview = (url, label) => {
    if (!url) return null;
    return (
      <div className="flex flex-col items-center">
        <span className="text-xs text-gray-500 mb-1">{label}</span>
        <a href={url} target="_blank" rel="noopener noreferrer">
          <img
            src={url}
            alt={label}
            className="h-20 w-20 object-cover rounded border border-gray-200 hover:border-blue-500 transition"
          />
        </a>
      </div>
    );
  };

  if (!open) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/5 backdrop-blur-sm">
      <div className="bg-white rounded-2xl p-5 w-full max-w-[50vw] max-h-[90vh] shadow-xl relative flex flex-col">
        <h2 className="text-xl font-bold mb-4 text-center shrink-0">
          {viewOnly ? "User Details" : data ? "Update User" : "Add User"}
        </h2>
        <form
          key={data ? data._id : "new"}
          className="space-y-6 overflow-y-auto px-4 grow custom-scrollbar"
        >
          {/* Basic Info */}
          <div className="col-span-2">
            <h3 className="flex items-center gap-2 text-base mb-3 text-[#1e3a5f] font-semibold border-b border-gray-100 pb-2">
              <HiOutlineDocumentText className="inline-block text-xl" />
              <span>Basic Information</span>
            </h3>
            <div className="grid lg:grid-cols-2 md:grid-cols-1 gap-4">
              <div>
                <label className="text-sm font-medium text-gray-700 block mb-1">
                  First Name{" "}
                  {!viewOnly && <sup className="text-red-500">*</sup>}
                </label>
                <input
                  className={`w-full bg-gray-50 border rounded-lg px-3 py-2 text-sm text-gray-800 ${!user.first_name && (touched.first_name || validateOnSave) ? "border-red-500" : "border-gray-200"}`}
                  value={user.first_name}
                  onChange={(e) =>
                    setUser({ ...user, first_name: e.target.value })
                  }
                  onBlur={() =>
                    setTouched((prev) => ({ ...prev, first_name: true }))
                  }
                  required
                  disabled={viewOnly}
                />
              </div>
              <div>
                <label className="text-sm font-medium text-gray-700 block mb-1">
                  Last Name {!viewOnly && <sup className="text-red-500">*</sup>}
                </label>
                <input
                  className={`w-full bg-gray-50 border rounded-lg px-3 py-2 text-sm text-gray-800 ${!user.last_name && (touched.last_name || validateOnSave) ? "border-red-500" : "border-gray-200"}`}
                  value={user.last_name}
                  onChange={(e) =>
                    setUser({ ...user, last_name: e.target.value })
                  }
                  onBlur={() =>
                    setTouched((prev) => ({ ...prev, last_name: true }))
                  }
                  required
                  disabled={viewOnly}
                />
              </div>
              <div>
                <label className="text-sm font-medium text-gray-700 block mb-1">
                  Email {!viewOnly && <sup className="text-red-500">*</sup>}
                </label>
                <input
                  className={`w-full bg-gray-50 border rounded-lg px-3 py-2 text-sm text-gray-800 ${!user.email && (touched.email || validateOnSave) ? "border-red-500" : "border-gray-200"}`}
                  type="email"
                  value={user.email}
                  onChange={(e) => setUser({ ...user, email: e.target.value })}
                  onBlur={() =>
                    setTouched((prev) => ({ ...prev, email: true }))
                  }
                  required
                  disabled={viewOnly}
                />
              </div>
              {!data && (
                <div>
                  <label className="text-sm font-medium text-gray-700 block mb-1">
                    Password{" "}
                    {!viewOnly && <sup className="text-red-500">*</sup>}
                  </label>
                  <div className="relative">
                    <input
                      className={`w-full bg-gray-50 border rounded-lg px-3 py-2 text-sm text-gray-800 ${!user.password && !data && (touched.password || validateOnSave) ? "border-red-500" : "border-gray-200"}`}
                      type={showPassword ? "text" : "password"}
                      value={user.password || ""}
                      onChange={(e) =>
                        setUser({ ...user, password: e.target.value })
                      }
                      onBlur={() =>
                        setTouched((prev) => ({ ...prev, password: true }))
                      }
                      required
                      minLength={8}
                      disabled={viewOnly}
                    />
                    <button
                      type="button"
                      className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 cursor-pointer"
                      onClick={() => setShowPassword(!showPassword)}
                    >
                      {showPassword ? (
                        <HiEyeOff className="w-5 h-5" />
                      ) : (
                        <HiEye className="w-5 h-5" />
                      )}
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Contact & Role */}
          <div className="col-span-2">
            <h3 className="flex items-center gap-2 text-base mb-3 text-[#1e3a5f] font-semibold border-b border-gray-100 pb-2">
              <HiOutlineKey className="inline-block text-xl" />
              <span>Contact & Role</span>
            </h3>
            <div className="grid lg:grid-cols-2 md:grid-cols-1 gap-4">
              <div>
                <label className="text-sm font-medium text-gray-700 block mb-1">
                  Role {!viewOnly && <sup className="text-red-500">*</sup>}
                </label>
                <Listbox
                  value={roles.find((role) => role.name === user.role) || null}
                  onChange={(role) =>
                    setUser({
                      ...user,
                      role: role ? role.name : "",
                      permission_id: role ? role._id : "",
                    })
                  }
                  disabled={viewOnly}
                >
                  <div className="relative">
                    <Listbox.Button
                      className={`w-full bg-gray-50 border rounded-lg px-3 py-2 text-left text-sm text-gray-800 flex items-center justify-between border-gray-200 ${viewOnly ? "cursor-default" : "cursor-pointer"}`}
                    >
                      <span>
                        {roles.find((role) => role.name === user.role)?.name ||
                          "Select role"}
                      </span>
                      <HiSelector className="w-5 h-5 text-gray-400 ml-2" />
                    </Listbox.Button>
                    <Listbox.Options className="absolute z-10 mt-1 w-full bg-white border border-gray-100 rounded-lg shadow-lg max-h-60 overflow-auto focus:outline-none text-sm">
                      {roles.map((role) => (
                        <Listbox.Option
                          key={role._id || role.id}
                          value={role}
                          className={({ selected }) =>
                            `px-3 py-2 cursor-pointer text-black text-sm hover:bg-[#f1f5f9] ${selected ? "bg-blue-50" : ""}`
                          }
                        >
                          {role.name}
                        </Listbox.Option>
                      ))}
                    </Listbox.Options>
                  </div>
                </Listbox>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-700 block mb-1">
                  Phone {!viewOnly && <sup className="text-red-500">*</sup>}
                </label>
                <input
                  className={`w-full bg-gray-50 border rounded-lg px-3 py-2 text-sm text-gray-800 ${!user.phone && (touched.phone || validateOnSave) ? "border-red-500" : "border-gray-200"}`}
                  value={user.phone}
                  onChange={(e) => setUser({ ...user, phone: e.target.value })}
                  onBlur={() =>
                    setTouched((prev) => ({ ...prev, phone: true }))
                  }
                  disabled={viewOnly}
                />
              </div>
              <div>
                <label className="text-sm font-medium text-gray-700 block mb-1">
                  Status {!viewOnly && <sup className="text-red-500">*</sup>}
                </label>
                <Listbox
                  value={user.status}
                  onChange={(val) => setUser({ ...user, status: val })}
                  disabled={viewOnly}
                >
                  <div className="relative">
                    <Listbox.Button
                      className={`w-full bg-gray-50 border rounded-lg px-3 py-2 text-left text-sm text-gray-800 flex items-center justify-between border-gray-200 ${viewOnly ? "cursor-default" : "cursor-pointer"}`}
                    >
                      <span className="capitalize">{user.status}</span>
                      <HiSelector className="w-5 h-5 text-gray-400 ml-2" />
                    </Listbox.Button>
                    <Listbox.Options className="absolute z-10 mt-1 w-full bg-white border border-gray-100 rounded-lg shadow-lg max-h-60 overflow-auto focus:outline-none text-sm">
                      {["active", "inactive", "pending"].map((status) => (
                        <Listbox.Option
                          key={status}
                          value={status}
                          className={({ selected }) =>
                            `px-3 py-2 cursor-pointer text-black text-sm capitalize hover:bg-[#f1f5f9] ${selected ? "bg-blue-50" : ""}`
                          }
                        >
                          {status}
                        </Listbox.Option>
                      ))}
                    </Listbox.Options>
                  </div>
                </Listbox>
              </div>
            </div>
          </div>

          {/* Address */}
          <div className="col-span-2">
            <h3 className="flex items-center gap-2 text-base mb-3 text-[#1e3a5f] font-semibold border-b border-gray-100 pb-2">
              <HiOutlineLocationMarker className="inline-block text-xl" />
              <span>Address</span>
            </h3>
            <div className="grid lg:grid-cols-2 md:grid-cols-1 gap-4">
              <div>
                <label className="text-sm font-medium text-gray-700 block mb-1">
                  City/Province
                </label>
                <Listbox
                  value={user.address.province}
                  onChange={handleProvinceChange}
                  disabled={viewOnly}
                >
                  <div className="relative">
                    <Listbox.Button
                      className={`w-full bg-gray-50 border rounded-lg px-3 py-2 text-left text-sm text-gray-800 flex items-center justify-between border-gray-200 ${viewOnly ? "cursor-default" : "cursor-pointer"}`}
                    >
                      <span>{user.address.province || "Select Province"}</span>
                      <HiSelector className="w-5 h-5 text-gray-400 ml-2" />
                    </Listbox.Button>
                    <Listbox.Options className="absolute z-10 mt-1 w-full bg-white border border-gray-100 rounded-lg shadow-lg max-h-60 overflow-auto focus:outline-none text-sm">
                      {locations.map((province) => (
                        <Listbox.Option
                          key={province.name}
                          value={province.name}
                          className={({ selected }) =>
                            `px-3 py-2 cursor-pointer text-black text-sm hover:bg-[#f1f5f9] ${selected ? "bg-blue-50" : ""}`
                          }
                        >
                          {province.name}
                        </Listbox.Option>
                      ))}
                    </Listbox.Options>
                  </div>
                </Listbox>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-700 block mb-1">
                  District
                </label>
                <Listbox
                  value={user.address.district}
                  onChange={handleDistrictChange}
                  disabled={viewOnly || !user.address.province}
                >
                  <div className="relative">
                    <Listbox.Button
                      className={`w-full bg-gray-50 border rounded-lg px-3 py-2 text-left text-sm text-gray-800 flex items-center justify-between border-gray-200 ${viewOnly ? "cursor-default" : "cursor-pointer"}`}
                    >
                      <span>{user.address.district || "Select District"}</span>
                      <HiSelector className="w-5 h-5 text-gray-400 ml-2" />
                    </Listbox.Button>
                    <Listbox.Options className="absolute z-10 mt-1 w-full bg-white border border-gray-100 rounded-lg shadow-lg max-h-60 overflow-auto focus:outline-none text-sm">
                      {locations
                        .find((p) => p.name === user.address.province)
                        ?.districts.map((district) => (
                          <Listbox.Option
                            key={district.name}
                            value={district.name}
                            className={({ selected }) =>
                              `px-3 py-2 cursor-pointer text-black text-sm hover:bg-[#f1f5f9] ${selected ? "bg-blue-50" : ""}`
                            }
                          >
                            {district.name}
                          </Listbox.Option>
                        ))}
                    </Listbox.Options>
                  </div>
                </Listbox>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-700 block mb-1">
                  Commune
                </label>
                <Listbox
                  value={user.address.commune}
                  onChange={handleCommuneChange}
                  disabled={viewOnly || !user.address.district}
                >
                  <div className="relative">
                    <Listbox.Button
                      className={`w-full bg-gray-50 border rounded-lg px-3 py-2 text-left text-sm text-gray-800 flex items-center justify-between border-gray-200 ${viewOnly ? "cursor-default" : "cursor-pointer"}`}
                    >
                      <span>{user.address.commune || "Select Commune"}</span>
                      <HiSelector className="w-5 h-5 text-gray-400 ml-2" />
                    </Listbox.Button>
                    <Listbox.Options className="absolute z-10 mt-1 w-full bg-white border border-gray-100 rounded-lg shadow-lg max-h-60 overflow-auto focus:outline-none text-sm">
                      {locations
                        .find((p) => p.name === user.address.province)
                        ?.districts.find(
                          (d) => d.name === user.address.district,
                        )
                        ?.communes.map((commune) => (
                          <Listbox.Option
                            key={commune.name}
                            value={commune.name}
                            className={({ selected }) =>
                              `px-3 py-2 cursor-pointer text-black text-sm hover:bg-[#f1f5f9] ${selected ? "bg-blue-50" : ""}`
                            }
                          >
                            {commune.name}
                          </Listbox.Option>
                        ))}
                    </Listbox.Options>
                  </div>
                </Listbox>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-700 block mb-1">
                  Village
                </label>
                <Listbox
                  value={user.address.village}
                  onChange={handleVillageChange}
                  disabled={viewOnly || !user.address.commune}
                >
                  <div className="relative">
                    <Listbox.Button
                      className={`w-full bg-gray-50 border rounded-lg px-3 py-2 text-left text-sm text-gray-800 flex items-center justify-between border-gray-200 ${viewOnly ? "cursor-default" : "cursor-pointer"}`}
                    >
                      <span>{user.address.village || "Select Village"}</span>
                      <HiSelector className="w-5 h-5 text-gray-400 ml-2" />
                    </Listbox.Button>
                    <Listbox.Options className="absolute z-10 mt-1 w-full bg-white border border-gray-100 rounded-lg shadow-lg max-h-60 overflow-auto focus:outline-none text-sm">
                      {locations
                        .find((p) => p.name === user.address.province)
                        ?.districts.find(
                          (d) => d.name === user.address.district,
                        )
                        ?.communes.find((c) => c.name === user.address.commune)
                        ?.villages.map((village) => (
                          <Listbox.Option
                            key={village}
                            value={village}
                            className={({ selected }) =>
                              `px-3 py-2 cursor-pointer text-black text-sm hover:bg-[#f1f5f9] ${selected ? "bg-blue-50" : ""}`
                            }
                          >
                            {village}
                          </Listbox.Option>
                        ))}
                    </Listbox.Options>
                  </div>
                </Listbox>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-700 block mb-1">
                  House
                </label>
                <input
                  type="text"
                  className="w-full bg-gray-50 border border-gray-200 rounded-lg px-3 py-2 text-sm text-gray-800"
                  value={user.address.house}
                  onChange={(e) =>
                    setUser({
                      ...user,
                      address: { ...user.address, house: e.target.value },
                    })
                  }
                  disabled={viewOnly}
                />
              </div>
              <div>
                <label className="text-sm font-medium text-gray-700 block mb-1">
                  Street
                </label>
                <input
                  className="w-full bg-gray-50 border border-gray-200 rounded-lg px-3 py-2 text-sm text-gray-800"
                  value={user.address.street}
                  onChange={(e) =>
                    setUser({
                      ...user,
                      address: { ...user.address, street: e.target.value },
                    })
                  }
                  disabled={viewOnly}
                />
              </div>
            </div>
          </div>

          {/* Partner Information Section */}
          {(user.customer_type || user.request_purpose) && (
            <div className="col-span-2">
              <h3 className="flex items-center gap-2 text-base mb-3 text-[#1e3a5f] font-semibold border-b border-gray-100 pb-2">
                <HiOutlineBriefcase className="inline-block text-xl" />
                <span>Partner Information</span>
              </h3>
              <div className="grid lg:grid-cols-2 md:grid-cols-1 gap-4">
                <div>
                  <label className="text-sm font-medium text-gray-700 block mb-1">
                    Customer Type
                  </label>
                  <input
                    className="w-full bg-gray-50 border border-gray-200 rounded-lg px-3 py-2 text-sm text-gray-800 outline-none"
                    value={user.customer_type || ""}
                    readOnly
                    disabled
                  />
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-700 block mb-1">
                    Company Name
                  </label>
                  <input
                    className="w-full bg-gray-50 border border-gray-200 rounded-lg px-3 py-2 text-sm text-gray-800 outline-none"
                    value={user.company_name || ""}
                    readOnly
                    disabled
                  />
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-700 block mb-1">
                    Position
                  </label>
                  <input
                    className="w-full bg-gray-50 border border-gray-200 rounded-lg px-3 py-2 text-sm text-gray-800 outline-none"
                    value={user.position || ""}
                    readOnly
                    disabled
                  />
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-700 block mb-1">
                    Reg No.
                  </label>
                  <input
                    className="w-full bg-gray-50 border border-gray-200 rounded-lg px-3 py-2 text-sm text-gray-800 outline-none"
                    value={user.company_registration_no || ""}
                    readOnly
                    disabled
                  />
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-700 block mb-1">
                    Request Purpose
                  </label>
                  <input
                    className="w-full bg-gray-50 border border-gray-200 rounded-lg px-3 py-2 text-sm text-gray-800 outline-none"
                    value={user.request_purpose || ""}
                    readOnly
                    disabled
                  />
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-700 block mb-1">
                    Expected Volume
                  </label>
                  <input
                    className="w-full bg-gray-50 border border-gray-200 rounded-lg px-3 py-2 text-sm text-gray-800 outline-none"
                    value={user.expected_order_volume || ""}
                    readOnly
                    disabled
                  />
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-700 block mb-1">
                    Order Frequency
                  </label>
                  <input
                    className="w-full bg-gray-50 border border-gray-200 rounded-lg px-3 py-2 text-sm text-gray-800 outline-none"
                    value={user.order_frequency || ""}
                    readOnly
                    disabled
                  />
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-700 block mb-1">
                    Product Categories
                  </label>
                  <div className="flex flex-wrap">
                    {Array.isArray(user.product_categories) &&
                    user.product_categories.length > 0 ? (
                      user.product_categories.map((cat, idx) => (
                        <span key={idx} className="mr-2">
                          {renderBadge(cat)}
                        </span>
                      ))
                    ) : (
                      <span className="text-sm text-gray-500">None</span>
                    )}
                  </div>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-700 block mb-1">
                    Customer Note
                  </label>
                  <p className="text-sm text-gray-600 bg-gray-50 p-2 rounded border border-gray-200">
                    {user.note_from_customer || "-"}
                  </p>
                </div>
              </div>
              <div>
                {renderImagePreview(
                  user.id_card_or_business_license,
                  "ID/License",
                )}
                {renderImagePreview(user.shop_photo, "Shop Photo")}
                {renderImagePreview(user.location_photo, "Location Photo")}
              </div>
            </div>
          )}

          {/* Profile Image (Existing) */}
          {(!viewOnly || user.profile) && (
            <div className="col-span-2 mb-2">
              <h3 className="flex items-center gap-2 text-base mb-2 text-[#1e3a5f] font-semibold border-b border-gray-100 pb-2">
                <HiOutlineCamera className="inline-block text-xl" />
                <span>Profile Image</span>
              </h3>
              <div className="mb-3">
                {viewOnly ? (
                  <div className="mt-2 flex items-center justify-center border border-gray-200 rounded-lg p-4 bg-gray-50">
                    <img
                      src={user.profile}
                      alt="Profile"
                      className="h-40 w-40 object-cover rounded"
                    />
                  </div>
                ) : (
                  <label className="cursor-pointer block relative group h-full flex flex-col items-center justify-center border-2 border-dashed border-gray-100 rounded-lg p-6 hover:bg-gray-50 transition w-full">
                    {user.profile ? (
                      <div className="relative w-40 h-40">
                        <img
                          src={user.profile}
                          alt="Profile"
                          className="w-full h-full object-cover rounded-md"
                        />
                        <div className="absolute inset-0 bg-black/50 flex items-center justify-center text-white opacity-0 group-hover:opacity-100 transition-opacity rounded-md">
                          <span className="text-xs font-medium">
                            Click to Change
                          </span>
                        </div>
                      </div>
                    ) : (
                      <div className="flex flex-col items-center">
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
                      </div>
                    )}
                    <input
                      type="file"
                      accept="image/jpeg,image/png,image/gif"
                      className="hidden"
                      onChange={handleImageChange}
                      disabled={viewOnly}
                    />
                  </label>
                )}
              </div>
            </div>
          )}
        </form>
        <div className="col-span-2 w-full flex items-center justify-end gap-3 mt-4 shrink-0 pt-4 border-t border-gray-100">
          <button
            type="button"
            className="bg-gray-100 hover:bg-gray-200 text-[#1e3a5f] px-6 py-2 rounded-xl focus:outline-none border border-gray-100 flex items-center gap-2 cursor-pointer text-sm font-medium"
            onClick={onClose}
          >
            <HiXCircle className="inline-block text-xl" />
            {viewOnly ? "Close" : "Cancel"}
          </button>
          {!viewOnly && (
            <button
              type="button"
              className="bg-[#1e3a5f] hover:bg-[#16375b] text-white px-6 py-2 rounded-xl focus:outline-none flex items-center gap-2 cursor-pointer text-sm font-medium"
              onClick={() => {
                setValidateOnSave(true);
                setTouched({
                  first_name: true,
                  last_name: true,
                  email: true,
                  password: true,
                  role: true,
                  phone: true,
                  village: true,
                  commune: true,
                  district: true,
                  province: true,
                });
                onSave(user);
              }}
            >
              <HiOutlineDocumentText className="inline-block text-xl" />
              {data ? "Update User" : "Add User"}
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default UserModal;
