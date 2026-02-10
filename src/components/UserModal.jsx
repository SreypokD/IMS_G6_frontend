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
} from "react-icons/hi";

const initialUser = {
  first_name: "",
  last_name: "",
  email: "",
  password: "",
  role: "",
  phone: "",
  address: {
    street: "",
    house: "",
    village: "",
    commune: "",
    district: "",
    province: "",
    country: "",
  },
  profile: "",
};

const UserModal = ({ open, onClose, onSave, initial, viewOnly = false }) => {
  const computedInitialUser = React.useMemo(
    () => initial || initialUser,
    [initial],
  );
  const [user, setUser] = useState(() => computedInitialUser);
  const [selectedImage, setSelectedImage] = useState(null);
  const [touched, setTouched] = useState({});
  const [validateOnSave, setValidateOnSave] = useState(false);
  const [roles, setRoles] = useState([]);

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

  if (!open) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/5 backdrop-blur-sm">
      <div className="bg-white rounded-2xl p-5 w-full max-w-[40%] max-h-[80vh] shadow-xl relative">
        <h2 className="text-xl font-bold mb-6 text-center">
          {viewOnly ? "View User" : initial ? "Edit User" : "Add User"}
        </h2>
        <form
          key={initial ? initial._id || initial.id : "new"}
          className="space-y-5 overflow-auto max-h-[50vh] px-1"
        >
          <div className="col-span-2 mb-2">
            <h3 className="flex items-center gap-2 text-base mb-2 text-black">
              <HiOutlineDocumentText className="inline-block text-xl text-black" />
              <span>Basic Information</span>
            </h3>
            <div className="mb-3 grid lg:grid-cols-2 md:grid-cols-1 gap-4">
              <div>
                <label className="block text-sm font-medium mb-1">
                  First Name
                  {!user.first_name && !initial ? (
                    <sup className="text-red-500">*</sup>
                  ) : null}
                </label>
                <input
                  className={`w-full bg-gray-50 border rounded-lg px-3 py-2 text-sm text-gray-800 ${!user.first_name && !initial && (touched.first_name || validateOnSave) ? "border-red-500" : "border-gray-200"}`}
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
                <label className="block text-sm font-medium mb-1">
                  Last Name
                  {!user.last_name && !initial ? (
                    <sup className="text-red-500">*</sup>
                  ) : null}
                </label>
                <input
                  className={`w-full bg-gray-50 border rounded-lg px-3 py-2 text-sm text-gray-800 ${!user.last_name && !initial && (touched.last_name || validateOnSave) ? "border-red-500" : "border-gray-200"}`}
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
                <label className="block text-sm font-medium mb-1">
                  Email
                  {!user.email && !initial ? (
                    <sup className="text-red-500">*</sup>
                  ) : null}
                </label>
                <input
                  className={`w-full bg-gray-50 border rounded-lg px-3 py-2 text-sm text-gray-800 ${!user.email && !initial && (touched.email || validateOnSave) ? "border-red-500" : "border-gray-200"}`}
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
              {!initial && (
                <div>
                  <label className="block text-sm font-medium mb-1">
                    Password
                    {!user.password && !initial ? (
                      <sup className="text-red-500">*</sup>
                    ) : null}
                  </label>
                  <input
                    className={`w-full bg-gray-50 border rounded-lg px-3 py-2 text-sm text-gray-800 ${!user.password && !initial && (touched.password || validateOnSave) ? "border-red-500" : "border-gray-200"}`}
                    type="password"
                    value={user.password || ""}
                    onChange={(e) =>
                      setUser({ ...user, password: e.target.value })
                    }
                    onBlur={() =>
                      setTouched((prev) => ({ ...prev, password: true }))
                    }
                    required
                    minLength={6}
                    placeholder="Enter password"
                    disabled={viewOnly}
                  />
                </div>
              )}
            </div>
          </div>
          <div className="col-span-2 mb-2">
            <h3 className="flex items-center gap-2 text-base mb-2 text-black">
              <HiOutlineKey className="inline-block text-xl text-black" />
              <span>Contact & Role</span>
            </h3>
            <div className="mb-3 grid lg:grid-cols-2 md:grid-cols-1 gap-4">
              <div>
                <label className="block text-sm font-medium mb-1">
                  Role
                  {!user.role && !initial ? (
                    <sup className="text-red-500">*</sup>
                  ) : null}
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
                      className={`w-full bg-gray-50 border rounded-lg px-3 py-2 text-left text-sm text-gray-800 flex items-center justify-between ${viewOnly ? "bg-gray-100 cursor-default" : "cursor-pointer"} ${!user.role && !initial && (touched.role || validateOnSave) ? "border-red-500" : "border-gray-200"}`}
                      disabled={viewOnly}
                    >
                      <span>
                        {roles.find((role) => role.name === user.role)?.name ||
                          "Select role"}
                      </span>
                      <HiSelector className="w-5 h-5 text-gray-400 ml-2" />
                    </Listbox.Button>
                    <Listbox.Options className="absolute z-10 mt-1 w-full bg-white border border-gray-200 rounded-lg shadow-lg max-h-60 overflow-auto focus:outline-none text-sm">
                      {roles.length === 0 && (
                        <div className="px-4 py-2 text-gray-400">No roles</div>
                      )}
                      {roles.map((role) => (
                        <Listbox.Option
                          key={role._id || role.id}
                          value={role}
                          className={({ selected }) =>
                            `px-4 py-2 cursor-pointer text-black text-sm hover:bg-[#f1f5f9] ${selected ? "bg-blue-50" : ""}`
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
                <label className="block text-sm font-medium mb-1">
                  Phone
                  {!initial ? <sup className="text-red-500">*</sup> : null}
                </label>
                <input
                  className={`w-full bg-gray-50 border rounded-lg px-3 py-2 text-sm text-gray-800 ${!user.phone && !initial && (touched.phone || validateOnSave) ? "border-red-500" : "border-gray-200"}`}
                  value={user.phone}
                  onChange={(e) => setUser({ ...user, phone: e.target.value })}
                  onBlur={() =>
                    setTouched((prev) => ({ ...prev, phone: true }))
                  }
                  disabled={viewOnly}
                />
              </div>
            </div>
          </div>
          <div className="col-span-2 mb-2">
            <h3 className="flex items-center gap-2 text-base mb-2 text-black">
              <HiOutlineLocationMarker className="inline-block text-xl text-black" />
              <span>Address</span>
            </h3>
            <div className="mb-3 grid lg:grid-cols-2 md:grid-cols-1 gap-4">
              <div>
                <label className="block text-sm font-medium mb-1">Street</label>
                <input
                  className="w-full bg-gray-50 border rounded-lg px-3 py-2 text-sm text-gray-800 border-gray-200"
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
              <div>
                <label className="block mb-1">House</label>
                <input
                  type="text"
                  className="w-full bg-gray-50 border rounded-lg px-3 py-2 text-sm text-gray-800 border-gray-200"
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
                <label className="block mb-1">
                  Village
                  {!user.address.village && !initial ? (
                    <sup className="text-red-500">*</sup>
                  ) : null}
                </label>
                <input
                  type="text"
                  className={`w-full bg-gray-50 border rounded-lg px-3 py-2 text-sm text-gray-800 ${!user.address.village && !initial && (touched.village || validateOnSave) ? "border-red-500" : "border-gray-200"}`}
                  value={user.address.village}
                  onChange={(e) =>
                    setUser({
                      ...user,
                      address: { ...user.address, village: e.target.value },
                    })
                  }
                  onBlur={() =>
                    setTouched((prev) => ({ ...prev, village: true }))
                  }
                  disabled={viewOnly}
                />
              </div>
              <div>
                <label className="block mb-1">
                  Commune
                  {!user.address.commune && !initial ? (
                    <sup className="text-red-500">*</sup>
                  ) : null}
                </label>
                <input
                  type="text"
                  className={`w-full bg-gray-50 border rounded-lg px-3 py-2 text-sm text-gray-800 ${!user.address.commune && !initial && (touched.commune || validateOnSave) ? "border-red-500" : "border-gray-200"}`}
                  value={user.address.commune}
                  onChange={(e) =>
                    setUser({
                      ...user,
                      address: { ...user.address, commune: e.target.value },
                    })
                  }
                  onBlur={() =>
                    setTouched((prev) => ({ ...prev, commune: true }))
                  }
                  disabled={viewOnly}
                />
              </div>
              <div>
                <label className="block mb-1">
                  District
                  {!user.address.district && !initial ? (
                    <sup className="text-red-500">*</sup>
                  ) : null}
                </label>
                <input
                  type="text"
                  className={`w-full bg-gray-50 border rounded-lg px-3 py-2 text-sm text-gray-800 ${!user.address.district && !initial && (touched.district || validateOnSave) ? "border-red-500" : "border-gray-200"}`}
                  value={user.address.district}
                  onChange={(e) =>
                    setUser({
                      ...user,
                      address: { ...user.address, district: e.target.value },
                    })
                  }
                  onBlur={() =>
                    setTouched((prev) => ({ ...prev, district: true }))
                  }
                  disabled={viewOnly}
                />
              </div>
              <div>
                <label className="block mb-1">
                  City/Province
                  {!user.address.province && !initial ? (
                    <sup className="text-red-500">*</sup>
                  ) : null}
                </label>
                <input
                  type="text"
                  className={`w-full bg-gray-50 border rounded-lg px-3 py-2 text-sm text-gray-800 ${!user.address.province && !initial && (touched.province || validateOnSave) ? "border-red-500" : "border-gray-200"}`}
                  value={user.address.province}
                  onChange={(e) =>
                    setUser({
                      ...user,
                      address: { ...user.address, province: e.target.value },
                    })
                  }
                  onBlur={() =>
                    setTouched((prev) => ({ ...prev, province: true }))
                  }
                  disabled={viewOnly}
                />
              </div>
              <div>
                <label className="block mb-1">
                  Country
                  {!user.address.country && !initial ? (
                    <sup className="text-red-500">*</sup>
                  ) : null}
                </label>
                <input
                  type="text"
                  className={`w-full bg-gray-50 border rounded-lg px-3 py-2 text-sm text-gray-800 ${!user.address.country && !initial && (touched.country || validateOnSave) ? "border-red-500" : "border-gray-200"}`}
                  value={user.address.country}
                  onChange={(e) =>
                    setUser({
                      ...user,
                      address: { ...user.address, country: e.target.value },
                    })
                  }
                  onBlur={() =>
                    setTouched((prev) => ({ ...prev, country: true }))
                  }
                  disabled={viewOnly}
                />
              </div>
            </div>
          </div>
          <div className="col-span-2 mb-2">
            <h3 className="flex items-center gap-2 text-base mb-2 text-black">
              <HiOutlineCamera className="inline-block text-xl text-black" />
              <span>Profile</span>
            </h3>
            <div className="mb-4">
              <label className="block text-gray-700 text-sm mb-1">
                Profile Image
              </label>
              <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 flex flex-col items-center justify-center transition-colors">
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
            </div>
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
                  country: true,
                });
                onSave(user);
              }}
            >
              <HiOutlineDocumentText className="inline-block text-xl" />
              {initial ? "Update User" : "Add User"}
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default UserModal;
