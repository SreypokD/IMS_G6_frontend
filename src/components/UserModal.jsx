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

  async function handleImageChange(e) {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setSelectedImage(file);
      try {
        const res = await uploadFile(file);
        if (res.data && res.data.url) {
          setUser((prev) => ({ ...prev, profile: res.data.url }));
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

  if (!open) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/5 backdrop-blur-sm">
      <div className="bg-white rounded-2xl p-5 w-full max-w-[40%] max-h-[80vh] shadow-xl relative">
        <h2 className="text-xl font-bold mb-6 text-center">
          {viewOnly ? "User Details" : data ? "Update User" : "Add User"}
        </h2>
        <form
          key={data ? data._id : "new"}
          className="space-y-5 overflow-auto max-h-[50vh] px-1"
        >
          <div className="col-span-2 mb-2">
            <h3 className="flex items-center gap-2 text-base mb-2 text-black">
              <HiOutlineDocumentText className="inline-block text-xl text-black" />
              <span>Basic Information</span>
            </h3>
            <div className="mb-3 grid lg:grid-cols-2 md:grid-cols-1 gap-3">
              <div>
                <label className="text-sm font-medium text-gray-700">
                  First Name
                  {!viewOnly && <sup className="text-red-500">*</sup>}
                </label>
                <input
                  className={`w-full bg-gray-50 border rounded-lg px-3 py-2 text-sm text-gray-800 ${!user.first_name && (touched.first_name || validateOnSave) ? "border-red-500" : "border-gray-100"}`}
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
                <label className="text-sm font-medium text-gray-700">
                  Last Name
                  {!viewOnly && <sup className="text-red-500">*</sup>}
                </label>
                <input
                  className={`w-full bg-gray-50 border rounded-lg px-3 py-2 text-sm text-gray-800 ${!user.last_name && (touched.last_name || validateOnSave) ? "border-red-500" : "border-gray-100"}`}
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
                <label className="text-sm font-medium text-gray-700">
                  Email
                  {!viewOnly && <sup className="text-red-500">*</sup>}
                </label>
                <input
                  className={`w-full bg-gray-50 border rounded-lg px-3 py-2 text-sm text-gray-800 ${!user.email && (touched.email || validateOnSave) ? "border-red-500" : "border-gray-100"}`}
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
                  <label className="text-sm font-medium text-gray-700">
                    Password
                    {!viewOnly && <sup className="text-red-500">*</sup>}
                  </label>
                  <div className="relative">
                    <input
                      className={`w-full bg-gray-50 border rounded-lg px-3 py-2 text-sm text-gray-800 ${!user.password && !data && (touched.password || validateOnSave) ? "border-red-500" : "border-gray-100"}`}
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
          <div className="col-span-2 mb-2">
            <h3 className="flex items-center gap-2 text-base mb-2 text-black">
              <HiOutlineKey className="inline-block text-xl text-black" />
              <span>Contact & Role</span>
            </h3>
            <div className="mb-3 grid lg:grid-cols-2 md:grid-cols-1 gap-3">
              <div>
                <label className="text-sm font-medium text-gray-700">
                  Role
                  {!viewOnly && <sup className="text-red-500">*</sup>}
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
                      className={`w-full bg-gray-50 border rounded-lg px-3 py-2 text-left text-sm text-gray-800 flex items-center justify-between border-gray-100 ${viewOnly ? "cursor-default" : "cursor-pointer"}`}
                    >
                      <span>
                        {roles.find((role) => role.name === user.role)?.name ||
                          "Select role"}
                      </span>
                      <HiSelector className="w-5 h-5 text-gray-400 ml-2" />
                    </Listbox.Button>
                    <Listbox.Options className="absolute z-10 mt-1 w-full bg-white border border-gray-100 rounded-lg shadow-lg max-h-60 overflow-auto focus:outline-none text-sm">
                      {roles.length === 0 && (
                        <div className="px-4 py-2 text-gray-400">No roles</div>
                      )}
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
                <label className="text-sm font-medium text-gray-700">
                  Phone
                  {!viewOnly && <sup className="text-red-500">*</sup>}
                </label>
                <input
                  className={`w-full bg-gray-50 border rounded-lg px-3 py-2 text-sm text-gray-800 ${!user.phone && (touched.phone || validateOnSave) ? "border-red-500" : "border-gray-100"}`}
                  value={user.phone}
                  onChange={(e) => setUser({ ...user, phone: e.target.value })}
                  onBlur={() =>
                    setTouched((prev) => ({ ...prev, phone: true }))
                  }
                  disabled={viewOnly}
                />
              </div>
              <div>
                <label className="text-sm font-medium text-gray-700">
                  Status
                  {!viewOnly && <sup className="text-red-500">*</sup>}
                </label>
                <div className="relative">
                  <select
                    className="w-full bg-gray-50 border rounded-lg px-3 py-2 text-sm text-gray-800 border-gray-100 cursor-pointer appearance-none pr-8"
                    value={user.status}
                    onChange={(e) =>
                      setUser({ ...user, status: e.target.value })
                    }
                    disabled={viewOnly}
                  >
                    <option value="active">Active</option>
                    <option value="inactive">Inactive</option>
                  </select>
                  <HiSelector className="w-5 h-5 text-gray-400 absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                </div>
              </div>
            </div>
          </div>
          <div className="col-span-2 mb-2">
            <h3 className="flex items-center gap-2 text-base mb-2 text-black">
              <HiOutlineLocationMarker className="inline-block text-xl text-black" />
              <span>Address</span>
            </h3>
            <div className="mb-3 grid lg:grid-cols-2 md:grid-cols-1 gap-3">
              <div>
                <label className="text-sm font-medium text-gray-700">
                  City/Province
                  {!viewOnly && <sup className="text-red-500">*</sup>}
                </label>
                <Listbox
                  value={user.address.province}
                  onChange={handleProvinceChange}
                  disabled={viewOnly}
                >
                  <div className="relative">
                    <Listbox.Button
                      className={`w-full bg-gray-50 border rounded-lg px-3 py-2 text-left text-sm text-gray-800 flex items-center justify-between ${viewOnly ? "cursor-default" : "cursor-pointer"} ${!user.address.province && (touched.province || validateOnSave) ? "border-red-500" : "border-gray-100"}`}
                    >
                      <span>{user.address.province}</span>
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
                <label className="text-sm font-medium text-gray-700">
                  District
                  {!viewOnly && <sup className="text-red-500">*</sup>}
                </label>
                <Listbox
                  value={user.address.district}
                  onChange={handleDistrictChange}
                  disabled={viewOnly || !user.address.province}
                >
                  <div className="relative">
                    <Listbox.Button
                      className={`w-full bg-gray-50 border rounded-lg px-3 py-2 text-left text-sm text-gray-800 flex items-center justify-between ${viewOnly ? "cursor-default" : "cursor-pointer"} ${!user.address.district && (touched.district || validateOnSave) ? "border-red-500" : "border-gray-100"}`}
                    >
                      <span>{user.address.district}</span>
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
                <label className="text-sm font-medium text-gray-700">
                  Commune
                  {!viewOnly && <sup className="text-red-500">*</sup>}
                </label>
                <Listbox
                  value={user.address.commune}
                  onChange={handleCommuneChange}
                  disabled={viewOnly || !user.address.district}
                >
                  <div className="relative">
                    <Listbox.Button
                      className={`w-full bg-gray-50 border rounded-lg px-3 py-2 text-left text-sm text-gray-800 flex items-center justify-between border-gray-100 ${viewOnly ? "cursor-default" : "cursor-pointer"} ${!user.role && (touched.role || validateOnSave) ? "border-red-500" : "border-gray-100"}`}
                    >
                      <span>{user.address.commune}</span>
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
                <label className="text-sm font-medium text-gray-700">
                  Village
                  {!viewOnly && <sup className="text-red-500">*</sup>}
                </label>
                <Listbox
                  value={user.address.village}
                  onChange={handleVillageChange}
                  disabled={viewOnly || !user.address.commune}
                >
                  <div className="relative">
                    <Listbox.Button
                      className={`w-full bg-gray-50 border rounded-lg px-3 py-2 text-left text-sm text-gray-800 flex items-center justify-between ${viewOnly ? "cursor-default" : "cursor-pointer"} ${!user.address.village && (touched.village || validateOnSave) ? "border-red-500" : "border-gray-100"}`}
                    >
                      <span>{user.address.village}</span>
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
                <label className="text-sm font-medium text-gray-700">
                  House
                </label>
                <input
                  type="text"
                  className="w-full bg-gray-50 border rounded-lg px-3 py-2 text-sm text-gray-800 border-gray-100"
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
                <label className="text-sm font-medium text-gray-700">
                  Street
                </label>
                <input
                  className="w-full bg-gray-50 border rounded-lg px-3 py-2 text-sm text-gray-800 border-gray-100"
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
          {(!viewOnly || user.profile) && (
            <div className="col-span-2 mb-2">
              <h3 className="flex items-center gap-2 text-base mb-2 text-black">
                <HiOutlineCamera className="inline-block text-xl text-black" />
                <span>Profile</span>
              </h3>
              <div className="mb-3">
                <label className="block text-gray-700 text-sm mb-1">
                  Profile Image
                </label>
                {viewOnly ? (
                  <div className="mt-2 flex items-center justify-center border border-gray-200 rounded-lg p-4 bg-gray-50">
                    <img
                      src={user.profile}
                      alt="Profile"
                      className="h-40 w-40 object-cover rounded"
                    />
                  </div>
                ) : (
                  <div className="border-2 border-dashed border-gray-100 rounded-lg p-6 flex flex-col items-center justify-center transition-colors">
                    <input
                      type="file"
                      accept="image/jpeg,image/png,image/gif"
                      className="hidden"
                      id="image-upload"
                      onChange={handleImageChange}
                      disabled={viewOnly}
                    />
                    <label
                      htmlFor="image-upload"
                      className={`flex flex-col items-center w-full h-full ${viewOnly ? "cursor-default opacity-60" : "cursor-pointer"}`}
                      style={viewOnly ? { pointerEvents: "none" } : {}}
                    >
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
                    </label>
                    {(selectedImage || user.profile) && (
                      <div className="mt-2 flex items-center">
                        <img
                          src={
                            selectedImage
                              ? URL.createObjectURL(selectedImage)
                              : user.profile
                          }
                          alt="Preview"
                          className="h-40 w-40 object-cover rounded mr-2"
                        />
                      </div>
                    )}
                  </div>
                )}
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
