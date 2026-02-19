import React, { useState, useEffect } from "react";
import loginImage from "../assets/images/image.png";
import {
  HiEye,
  HiEyeOff,
  HiCube,
  HiOutlineDownload,
  HiOutlineUpload,
  HiCheckCircle,
  HiSelector,
} from "react-icons/hi";
import { Listbox } from "@headlessui/react";
import { register as registerApi } from "../api/auth-services";
import { uploadFile, getCategories } from "../api";
import { useNavigate } from "react-router-dom";
import { locations } from "../data/locations";

const Register = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);

  // --- Form State ---
  const [formData, setFormData] = useState({
    email: "",
    phone: "",
    password: "",
    confirmPassword: "",
    customer_type: "business", // always business
    first_name: "",
    last_name: "",
    company_name: "",
    company_registration_no: "",
    address: {
      province: "",
      district: "",
      commune: "",
      village: "",
      street: "",
      house: "",
    },
    request_purpose: "",
    expected_order_volume: "small", // small | medium | large
    order_frequency: "weekly", // daily | weekly | monthly
    product_categories: [], // Array of strings
    id_card_or_business_license: "", // URL
    shop_photo: "", // URL
    location_photo: "", // URL
    agree_terms: false,
    note_from_customer: "",
  });

  const [showPassword, setShowPassword] = useState(false);
  const [categoriesList, setCategoriesList] = useState([]);

  // --- Fetch Categories ---
  useEffect(() => {
    async function fetchCats() {
      try {
        const res = await getCategories({ limit: -1 });
        if (res.data.success) {
          setCategoriesList(res.data.data);
        }
      } catch (err) {
        console.error("Failed to fetch categories", err);
      }
    }
    fetchCats();
  }, []);

  // --- Handlers ---
  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    if (type === "checkbox" && name === "agree_terms") {
      setFormData((prev) => ({ ...prev, [name]: checked }));
    } else {
      setFormData((prev) => ({ ...prev, [name]: value }));
    }
  };

  const handleAddressChange = (field, value) => {
    setFormData((prev) => ({
      ...prev,
      address: { ...prev.address, [field]: value },
    }));
  };

  const handleFileUpload = async (e, fieldName) => {
    const file = e.target.files[0];
    if (!file) return;

    try {
      const res = await uploadFile(file);
      const url = res.data?.url || res.data?.file?.url; // adaptable to response structure
      if (url) {
        setFormData((prev) => ({
          ...prev,
          [fieldName]: url,
        }));
      }
    } catch (err) {
      console.error("Upload failed", err);
      setError("File upload failed. Please try again.");
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    // Validation
    if (formData.password !== formData.confirmPassword) {
      setError("Passwords do not match");
      setLoading(false);
      return;
    }
    if (!formData.agree_terms) {
      setError("You must agree to the terms and conditions");
      setLoading(false);
      return;
    }

    try {
      const res = await registerApi(formData);
      if (!res.data.success) {
        setError(res.data.error || "Registration failed");
        setLoading(false);
        return;
      }
      setSuccess("Account request submitted! Please wait for admin approval.");
      setTimeout(() => navigate("/login"), 3000);
    } catch (err) {
      setError(
        err.response?.data?.error || "Registration failed. Please try again.",
      );
    } finally {
      setLoading(false);
    }
  };

  // --- Derived Data for Address ---
  const provinces = locations;
  const districts =
    provinces.find((p) => p.name === formData.address.province)?.districts ||
    [];
  const communes =
    districts.find((d) => d.name === formData.address.district)?.communes || [];
  const villages =
    communes.find((c) => c.name === formData.address.commune)?.villages || [];

  return (
    <div className="min-h-screen flex bg-white">
      {/* Left Image */}
      <div className="hidden md:flex w-1/2 h-screen items-center justify-center bg-white/80 sticky top-0">
        <img
          src={loginImage}
          alt="Background"
          className="object-contain h-full max-h-screen"
        />
      </div>

      {/* Right Form */}
      <div className="flex flex-col w-full md:w-1/2 items-center justify-start overflow-y-auto h-screen py-10 px-4 md:px-10">
        <div className="w-full max-w-2xl bg-white/90 rounded-xl p-8 border border-gray-100 shadow-xl">
          <div className="w-18 h-15 m-auto bg-linear-to-br from-[#1e3a5f] to-[#bb7c18] rounded-xl flex items-center justify-center mb-3">
            <HiCube className="w-9 h-9 mx-auto text-white" />
          </div>
          <h2 className="text-3xl font-bold text-center text-gray-800 tracking-tight">
            Partner Request
          </h2>
          <span className="block mb-6 text-sm text-center text-gray-400">
            Apply to become a partner and access our inventory
          </span>
          {success ? (
            <div className="bg-green-50 text-green-700 p-4 rounded-lg text-center mb-6 border border-green-200">
              <HiCheckCircle className="inline-block text-2xl mb-2" />
              <p className="text-lg">Request Submitted!</p>
              <p>{success}</p>
              <p className="text-sm mt-2">Redirecting to login...</p>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* 1. Account Info */}
              <section>
                <h3 className="text-lg font-semibold text-[#1e3a5f] border-b border-gray-100 pb-2 mb-4">
                  1. Account Information
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-gray-700 text-sm font-medium mb-1">
                      First Name <sup className="text-red-500">*</sup>
                    </label>
                    <input
                      name="first_name"
                      value={formData.first_name}
                      onChange={handleChange}
                      required
                      className="w-full border border-gray-200 rounded-lg px-3 py-2 bg-gray-50 text-sm"
                    />
                  </div>
                  <div>
                    <label className="block text-gray-700 text-sm font-medium mb-1">
                      Last Name <sup className="text-red-500">*</sup>
                    </label>
                    <input
                      name="last_name"
                      value={formData.last_name}
                      onChange={handleChange}
                      required
                      className="w-full border border-gray-200 rounded-lg px-3 py-2 bg-gray-50 text-sm"
                    />
                  </div>

                  <div>
                    <label className="block text-gray-700 text-sm font-medium mb-1">
                      Email <sup className="text-red-500">*</sup>
                    </label>
                    <input
                      name="email"
                      type="email"
                      value={formData.email}
                      onChange={handleChange}
                      required
                      className="w-full border border-gray-200 rounded-lg px-3 py-2 bg-gray-50 text-sm"
                    />
                  </div>
                  <div>
                    <label className="block text-gray-700 text-sm font-medium mb-1">
                      Phone <sup className="text-red-500">*</sup>
                    </label>
                    <input
                      name="phone"
                      value={formData.phone}
                      onChange={handleChange}
                      required
                      className="w-full border border-gray-200 rounded-lg px-3 py-2 bg-gray-50 text-sm"
                    />
                  </div>
                  <div className="relative">
                    <label className="block text-gray-700 text-sm font-medium mb-1">
                      Password <sup className="text-red-500">*</sup>
                    </label>
                    <input
                      name="password"
                      type={showPassword ? "text" : "password"}
                      value={formData.password}
                      onChange={handleChange}
                      required
                      className="w-full border border-gray-200 rounded-lg px-3 py-2 bg-gray-50 text-sm pr-10"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-8.5 text-gray-500"
                    >
                      {showPassword ? <HiEyeOff /> : <HiEye />}
                    </button>
                  </div>
                  <div className="relative">
                    <label className="block text-gray-700 text-sm font-medium mb-1">
                      Confirm Password <sup className="text-red-500">*</sup>
                    </label>
                    <input
                      name="confirmPassword"
                      type="password"
                      value={formData.confirmPassword}
                      onChange={handleChange}
                      required
                      className="w-full border border-gray-200 rounded-lg px-3 py-2 bg-gray-50 text-sm"
                    />
                  </div>
                </div>
              </section>

              {/* 2. Customer / Company Info */}
              <section>
                <h3 className="text-lg font-semibold text-[#1e3a5f] border-b border-gray-100 pb-2 mb-4">
                  2. Company Information
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-gray-700 text-sm font-medium mb-1">
                      Company Name <sup className="text-red-500">*</sup>
                    </label>
                    <input
                      name="company_name"
                      value={formData.company_name}
                      onChange={handleChange}
                      required
                      className="w-full border border-gray-200 rounded-lg px-3 py-2 bg-gray-50 text-sm"
                    />
                  </div>

                  <div>
                    <label className="block text-gray-700 text-sm font-medium mb-1">
                      Company Registration No.
                    </label>
                    <input
                      name="company_registration_no"
                      value={formData.company_registration_no}
                      onChange={handleChange}
                      className="w-full border border-gray-200 rounded-lg px-3 py-2 bg-gray-50 text-sm"
                    />
                  </div>
                </div>
              </section>

              {/* 3. Address */}
              <section>
                <h3 className="text-lg font-semibold text-[#1e3a5f] border-b border-gray-100 pb-2 mb-4">
                  3. Address
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="z-40">
                    <label className="block text-gray-700 text-sm font-medium mb-1">
                      Province/City <sup className="text-red-500">*</sup>
                    </label>
                    <Listbox
                      value={formData.address.province}
                      onChange={(val) => {
                        handleAddressChange("province", val);
                        handleAddressChange("district", "");
                        handleAddressChange("commune", "");
                        handleAddressChange("village", "");
                      }}
                    >
                      <div className="relative">
                        <ListboxButton className="w-full bg-gray-50 border border-gray-200 rounded-lg px-3 py-2 text-left text-sm text-gray-800 flex items-center justify-between cursor-pointer">
                          <span>{formData.address.province}</span>
                          <HiSelector className="w-5 h-5 text-gray-400" />
                        </ListboxButton>
                        <ListboxOptions className="absolute z-50 mt-1 w-full bg-white border border-gray-100 rounded-lg shadow-lg max-h-60 overflow-auto focus:outline-none text-sm">
                          {provinces.map((p) => (
                            <ListboxOption
                              key={p.name}
                              value={p.name}
                              className={({ active }) =>
                                `px-3 py-2 cursor-pointer text-black text-sm hover:text-white hover:bg-[#1e3a5f] rounded-lg ${
                                  active ? "bg-[#1e3a5f] text-white" : ""
                                }`
                              }
                            >
                              {p.name}
                            </ListboxOption>
                          ))}
                        </ListboxOptions>
                      </div>
                    </Listbox>
                  </div>
                  <div className="z-30">
                    <label className="block text-gray-700 text-sm font-medium mb-1">
                      District <sup className="text-red-500">*</sup>
                    </label>
                    <Listbox
                      value={formData.address.district}
                      onChange={(val) => {
                        handleAddressChange("district", val);
                        handleAddressChange("commune", "");
                        handleAddressChange("village", "");
                      }}
                      disabled={!formData.address.province}
                    >
                      <div className="relative">
                        <ListboxButton
                          className={`w-full border border-gray-200 rounded-lg px-3 py-2 text-left text-sm text-black flex items-center justify-between bg-gray-50 ${
                            !formData.address.province
                              ? "cursor-default"
                              : "cursor-pointer"
                          }`}
                        >
                          <span>{formData.address.district}</span>
                          <HiSelector className="w-5 h-5 text-gray-400" />
                        </ListboxButton>
                        <ListboxOptions className="absolute z-50 mt-1 w-full bg-white border border-gray-100 rounded-lg shadow-lg max-h-60 overflow-auto focus:outline-none text-sm">
                          {districts.map((d) => (
                            <ListboxOption
                              key={d.name}
                              value={d.name}
                              className={({ active }) =>
                                `px-3 py-2 cursor-pointer text-black text-sm hover:text-white hover:bg-[#1e3a5f] rounded-lg ${
                                  active ? "bg-[#1e3a5f] text-white" : ""
                                }`
                              }
                            >
                              {d.name}
                            </ListboxOption>
                          ))}
                        </ListboxOptions>
                      </div>
                    </Listbox>
                  </div>
                  <div className="z-20">
                    <label className="block text-gray-700 text-sm font-medium mb-1">
                      Commune <sup className="text-red-500">*</sup>
                    </label>
                    <Listbox
                      value={formData.address.commune}
                      onChange={(val) => {
                        handleAddressChange("commune", val);
                        handleAddressChange("village", "");
                      }}
                      disabled={!formData.address.district}
                    >
                      <div className="relative">
                        <ListboxButton
                          className={`w-full border border-gray-200 rounded-lg px-3 py-2 text-left text-sm text-black flex items-center justify-between bg-gray-50 ${
                            !formData.address.district
                              ? "cursor-default"
                              : "cursor-pointer"
                          }`}
                        >
                          <span>{formData.address.commune}</span>
                          <HiSelector className="w-5 h-5 text-gray-400" />
                        </ListboxButton>
                        <ListboxOptions className="absolute z-50 mt-1 w-full bg-white border border-gray-100 rounded-lg shadow-lg max-h-60 overflow-auto focus:outline-none text-sm">
                          {communes.map((c) => (
                            <ListboxOption
                              key={c.name}
                              value={c.name}
                              className={({ active }) =>
                                `px-3 py-2 cursor-pointer text-black text-sm hover:text-white hover:bg-[#1e3a5f] rounded-lg ${
                                  active ? "bg-[#1e3a5f] text-white" : ""
                                }`
                              }
                            >
                              {c.name}
                            </ListboxOption>
                          ))}
                        </ListboxOptions>
                      </div>
                    </Listbox>
                  </div>
                  <div>
                    <label className="block text-gray-700 text-sm font-medium mb-1">
                      Village <sup className="text-red-500">*</sup>
                    </label>
                    <Listbox
                      value={formData.address.village}
                      onChange={(val) => handleAddressChange("village", val)}
                      disabled={!formData.address.commune}
                    >
                      <div className="relative">
                        <ListboxButton
                          className={`w-full border border-gray-200 rounded-lg px-3 py-2 text-left text-sm text-black flex items-center justify-between bg-gray-50 ${
                            !formData.address.commune
                              ? "cursor-default"
                              : "cursor-pointer"
                          }`}
                        >
                          <span>{formData.address.village}</span>
                          <HiSelector className="w-5 h-5 text-gray-400" />
                        </ListboxButton>
                        <ListboxOptions className="absolute z-50 mt-1 w-full bg-white border border-gray-100 rounded-lg shadow-lg max-h-60 overflow-auto focus:outline-none text-sm">
                          {villages.map((v) => (
                            <ListboxOption
                              key={v}
                              value={v}
                              className={({ active }) =>
                                `px-3 py-2 cursor-pointer text-black text-sm hover:text-white hover:bg-[#1e3a5f] rounded-lg ${
                                  active ? "bg-[#1e3a5f] text-white" : ""
                                }`
                              }
                            >
                              {v}
                            </ListboxOption>
                          ))}
                        </ListboxOptions>
                      </div>
                    </Listbox>
                  </div>
                  <div>
                    <label className="block text-gray-700 text-sm font-medium mb-1">
                      House No.
                    </label>
                    <input
                      value={formData.address.house}
                      onChange={(e) =>
                        handleAddressChange("house", e.target.value)
                      }
                      className="w-full border border-gray-200 rounded-lg px-3 py-2 bg-gray-50 text-sm"
                    />
                  </div>
                  <div>
                    <label className="block text-gray-700 text-sm font-medium mb-1">
                      Street
                    </label>
                    <input
                      value={formData.address.street}
                      onChange={(e) =>
                        handleAddressChange("street", e.target.value)
                      }
                      className="w-full border border-gray-200 rounded-lg px-3 py-2 bg-gray-50 text-sm"
                    />
                  </div>
                </div>
              </section>

              {/* 4. Order Profile */}
              <section>
                <h3 className="text-lg font-semibold text-[#1e3a5f] border-b border-gray-100 pb-2 mb-4">
                  4. Order Request Profile
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-gray-700 text-sm font-medium mb-1">
                      Request Purpose
                    </label>
                    <input
                      name="request_purpose"
                      value={formData.request_purpose}
                      onChange={handleChange}
                      placeholder="e.g. Retail resale"
                      className="w-full border border-gray-200 rounded-lg px-3 py-2 bg-gray-50 text-sm"
                    />
                  </div>
                  <div className="z-30">
                    <label className="block text-gray-700 text-sm font-medium mb-1">
                      Expected Volume
                    </label>
                    <Listbox
                      value={formData.expected_order_volume}
                      onChange={(val) =>
                        setFormData((prev) => ({
                          ...prev,
                          expected_order_volume: val,
                        }))
                      }
                    >
                      <div className="relative">
                        <ListboxButton className="w-full bg-gray-50 border border-gray-200 rounded-lg px-3 py-2 text-left text-sm text-black flex items-center justify-between">
                          <span className="capitalize">
                            {formData.expected_order_volume}
                          </span>
                          <HiSelector className="w-5 h-5 text-gray-400" />
                        </ListboxButton>
                        <ListboxOptions className="absolute z-50 mt-1 w-full bg-white border border-gray-100 rounded-lg shadow-lg max-h-60 overflow-auto focus:outline-none text-sm">
                          {["small", "medium", "large"].map((vol) => (
                            <ListboxOption
                              key={vol}
                              value={vol}
                              className={({ active }) =>
                                `px-3 py-2 cursor-pointer text-black text-sm capitalize hover:text-white hover:bg-[#1e3a5f] rounded-lg ${
                                  active ? "bg-[#1e3a5f] text-white" : ""
                                }`
                              }
                            >
                              {vol}
                            </ListboxOption>
                          ))}
                        </ListboxOptions>
                      </div>
                    </Listbox>
                  </div>
                  <div className="z-20">
                    <label className="block text-gray-700 text-sm font-medium mb-1">
                      Order Frequency
                    </label>
                    <Listbox
                      value={formData.order_frequency}
                      onChange={(val) =>
                        setFormData((prev) => ({
                          ...prev,
                          order_frequency: val,
                        }))
                      }
                    >
                      <div className="relative">
                        <ListboxButton className="w-full bg-gray-50 border border-gray-200 rounded-lg px-3 py-2 text-left text-sm text-black flex items-center justify-between">
                          <span className="capitalize">
                            {formData.order_frequency}
                          </span>
                          <HiSelector className="w-5 h-5 text-gray-400" />
                        </ListboxButton>
                        <ListboxOptions className="absolute z-50 mt-1 w-full bg-white border border-gray-100 rounded-lg shadow-lg max-h-60 overflow-auto focus:outline-none text-sm">
                          {["daily", "weekly", "monthly"].map((freq) => (
                            <ListboxOption
                              key={freq}
                              value={freq}
                              className={({ active }) =>
                                `px-3 py-2 cursor-pointer text-black text-sm capitalize hover:text-white hover:bg-[#1e3a5f] rounded-lg ${
                                  active ? "bg-[#1e3a5f] text-white" : ""
                                }`
                              }
                            >
                              {freq}
                            </ListboxOption>
                          ))}
                        </ListboxOptions>
                      </div>
                    </Listbox>
                  </div>
                  <div>
                    <label className="block text-gray-700 text-sm font-medium mb-1">
                      Product Categories
                      <span className="text-gray-400 font-normal ml-2 text-xs">
                        (Select all that apply)
                      </span>
                    </label>
                    <Listbox
                      value={formData.product_categories}
                      onChange={(cats) =>
                        setFormData((prev) => ({
                          ...prev,
                          product_categories: cats,
                        }))
                      }
                      multiple
                    >
                      <div className="relative mt-1">
                        <ListboxButton className="w-full bg-gray-50 border border-gray-200 rounded-lg px-3 py-2 text-left text-sm text-black flex items-center justify-between">
                          <span className="block truncate">
                            {formData.product_categories.length > 0
                              ? formData.product_categories.join(", ")
                              : ""}
                          </span>
                          <HiSelector className="w-5 h-5 text-gray-400" />
                        </ListboxButton>
                        <ListboxOptions className="absolute z-50 mt-1 w-full bg-white border border-gray-100 rounded-lg shadow-lg max-h-60 overflow-auto focus:outline-none text-sm">
                          {categoriesList.length === 0 ? (
                            <div className="relative cursor-default select-none py-2 px-4 text-gray-700">
                              No categories found.
                            </div>
                          ) : (
                            categoriesList.map((cat) => (
                              <ListboxOption
                                key={cat._id}
                                value={cat.name}
                                className={({ active }) =>
                                  `px-3 py-2 cursor-pointer text-black text-sm capitalize hover:text-white hover:bg-[#1e3a5f] rounded-lg ${
                                    active ? "bg-[#1e3a5f] text-white" : ""
                                  }`
                                }
                              >
                                {cat.name}
                              </ListboxOption>
                            ))
                          )}
                        </ListboxOptions>
                      </div>
                    </Listbox>
                  </div>
                </div>
              </section>

              {/* 5. Documents */}
              <section>
                <h3 className="text-lg font-semibold text-[#1e3a5f] border-b border-gray-100 pb-2 mb-4">
                  5. Verification Documents
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="border border-dashed border-gray-300 rounded-lg p-4 text-center hover:bg-gray-50 transition">
                    <label className="cursor-pointer relative group h-full flex flex-col items-center justify-center">
                      <span className="block text-sm font-medium text-gray-700 mb-2">
                        ID Card / License <sup className="text-red-500">*</sup>
                      </span>
                      {formData.id_card_or_business_license ? (
                        <div className="relative w-full h-32">
                          <img
                            src={formData.id_card_or_business_license}
                            alt="ID Document"
                            className="w-full h-full object-cover rounded-md"
                          />
                          <div className="absolute inset-0 bg-black/50 flex items-center justify-center text-white opacity-0 group-hover:opacity-100 transition-opacity rounded-md">
                            <span className="text-xs font-medium">
                              Click to Change
                            </span>
                          </div>
                        </div>
                      ) : (
                        <>
                          <div className="w-12 h-12 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center mx-auto mb-2">
                            <HiOutlineUpload />
                          </div>
                          <span className="text-xs text-gray-500">
                            Upload File
                          </span>
                        </>
                      )}
                      <input
                        type="file"
                        className="hidden"
                        onChange={(e) =>
                          handleFileUpload(e, "id_card_or_business_license")
                        }
                        accept="image/*,.pdf"
                        required={!formData.id_card_or_business_license}
                      />
                    </label>
                  </div>
                  <div className="border border-dashed border-gray-300 rounded-lg p-4 text-center hover:bg-gray-50 transition">
                    <label className="cursor-pointer relative group h-full flex flex-col items-center justify-center">
                      <span className="block text-sm font-medium text-gray-700 mb-2">
                        Shop Photo (Opt)
                      </span>
                      {formData.shop_photo ? (
                        <div className="relative w-full h-32">
                          <img
                            src={formData.shop_photo}
                            alt="Shop"
                            className="w-full h-full object-cover rounded-md"
                          />
                          <div className="absolute inset-0 bg-black/50 flex items-center justify-center text-white opacity-0 group-hover:opacity-100 transition-opacity rounded-md">
                            <span className="text-xs font-medium">
                              Click to Change
                            </span>
                          </div>
                        </div>
                      ) : (
                        <>
                          <div className="w-12 h-12 bg-orange-100 text-orange-600 rounded-full flex items-center justify-center mx-auto mb-2">
                            <HiOutlineUpload />
                          </div>
                          <span className="text-xs text-gray-500">
                            Upload File
                          </span>
                        </>
                      )}
                      <input
                        type="file"
                        className="hidden"
                        onChange={(e) => handleFileUpload(e, "shop_photo")}
                        accept="image/*"
                      />
                    </label>
                  </div>
                  <div className="border border-dashed border-gray-300 rounded-lg p-4 text-center hover:bg-gray-50 transition">
                    <label className="cursor-pointer relative group h-full flex flex-col items-center justify-center">
                      <span className="block text-sm font-medium text-gray-700 mb-2">
                        Location Photo (Opt)
                      </span>
                      {formData.location_photo ? (
                        <div className="relative w-full h-32">
                          <img
                            src={formData.location_photo}
                            alt="Location"
                            className="w-full h-full object-cover rounded-md"
                          />
                          <div className="absolute inset-0 bg-black/50 flex items-center justify-center text-white opacity-0 group-hover:opacity-100 transition-opacity rounded-md">
                            <span className="text-xs font-medium">
                              Click to Change
                            </span>
                          </div>
                        </div>
                      ) : (
                        <>
                          <div className="w-12 h-12 text-gray-600 rounded-full flex items-center justify-center mx-auto mb-2">
                            <HiOutlineUpload />
                          </div>
                          <span className="text-xs text-gray-500">
                            Upload File
                          </span>
                        </>
                      )}
                      <input
                        type="file"
                        className="hidden"
                        onChange={(e) => handleFileUpload(e, "location_photo")}
                        accept="image/*"
                      />
                    </label>
                  </div>
                </div>
              </section>

              {/* 6. Agreement & Notes */}
              <section>
                <div className="mb-4">
                  <label className="block text-gray-700 text-sm font-medium mb-1">
                    Note to Admin
                  </label>
                  <textarea
                    name="note_from_customer"
                    value={formData.note_from_customer}
                    onChange={handleChange}
                    className="w-full border border-gray-200 rounded-lg px-3 py-2 bg-gray-50 text-sm"
                    rows="3"
                    placeholder="Anything else you'd like to tell us?"
                  ></textarea>
                </div>
                <div className="flex items-start gap-2">
                  <input
                    type="checkbox"
                    name="agree_terms"
                    checked={formData.agree_terms}
                    onChange={handleChange}
                    id="agree"
                    className="w-4 h-4 accent-[#1e3a5f] mt-0.5 cursor-pointer"
                    required
                  />
                  <label
                    htmlFor="agree"
                    className="text-sm text-gray-600 cursor-pointer"
                  >
                    I agree to the
                    <span className="text-[#1e3a5f] font-medium">
                      Terms and Conditions
                    </span>
                    and confirm that the information provided is accurate.
                  </label>
                </div>
              </section>
              {error && (
                <div className="text-red-500 text-center text-sm font-medium bg-red-50 p-3 rounded-lg border border-red-100">
                  {error}
                </div>
              )}
              <div className="flex flex-col gap-3">
                <button
                  type="submit"
                  className="w-full bg-[#1e3a5f] text-white hover:bg-[#1e3a5f] py-2.5 rounded-xl transition disabled:opacity-50 mt-2 cursor-pointer mb-2"
                  disabled={loading}
                >
                  {loading ? "Submitting Request..." : "Submit Partner Request"}
                  {!loading && (
                    <HiOutlineDownload className="inline-block ml-2 text-xl -rotate-90" />
                  )}
                </button>
                <span
                  className="block text-sm text-[#1e3a5f] hover:underline text-center cursor-pointer mb-2"
                  onClick={() => navigate("/login")}
                >
                  Already have an account?
                </span>
              </div>
            </form>
          )}
        </div>
        <div className="text-center mt-8 text-sm text-gray-400">
          © 2026 IMS. All rights reserved.
        </div>
      </div>
    </div>
  );
};

export default Register;
