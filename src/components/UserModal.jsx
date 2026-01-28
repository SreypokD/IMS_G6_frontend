import React, { useState, useRef, useEffect } from "react";
import { getPermissions } from "../api/index";
import {
  HiXCircle,
  HiOutlineDocumentText,
  HiOutlineLocationMarker,
  HiOutlineUserCircle,
  HiOutlineKey,
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

const UserModal = ({ open, onClose, onSave, initial }) => {
  const computedInitialUser = React.useMemo(
    () => initial || initialUser,
    [initial],
  );
  const [user, setUser] = useState(() => computedInitialUser);
  const [profilePreview, setProfilePreview] = useState(user.profile || "");
  const fileInputRef = useRef();
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

  // Remove problematic effect. State is initialized in useState.

  // Handle file upload
  const handleProfileUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    // Preview
    const reader = new FileReader();
    reader.onload = (ev) => {
      setProfilePreview(ev.target.result);
    };
    reader.readAsDataURL(file);
    // Upload to server (replace with your API endpoint)
    const formData = new FormData();
    formData.append("file", file);
    try {
      const res = await fetch("http://localhost:5001/api/upload", {
        method: "POST",
        body: formData,
      });
      const data = await res.json();
      if (data.url) {
        setUser({ ...user, profile: data.url });
      }
    } catch {
      alert("Upload failed");
    }
  };

  if (!open) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/5 backdrop-blur-sm">
      <div className="bg-white rounded-2xl p-5 w-full max-w-[40%] min-h-[60vh] max-h-[80vh] shadow-xl relative">
        <h2 className="text-2xl font-bold mb-6 text-center">
          {initial ? "Edit User" : "Add User"}
        </h2>
        <form
          key={initial ? initial._id || initial.id : "new"}
          className="space-y-5 overflow-auto max-h-[60vh] px-1"
        >
          <div className="col-span-2 mb-2">
            <h3 className="flex items-center gap-2 font-semibold text-lg mb-2 text-black">
              <HiOutlineDocumentText className="inline-block text-xl text-black" />
              <span>Basic Info</span>
            </h3>
            <div className="mb-3 grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-1">
                  First Name{" "}
                  {!user.first_name && !initial ? (
                    <sup className="text-red-500">*</sup>
                  ) : null}
                </label>
                <input
                  className={`w-full bg-gray-50 border rounded-lg px-3 py-2 text-gray-800 ${!user.first_name && !initial && (touched.first_name || validateOnSave) ? "border-red-500" : "border-gray-200"}`}
                  value={user.first_name}
                  onChange={(e) =>
                    setUser({ ...user, first_name: e.target.value })
                  }
                  onBlur={() =>
                    setTouched((prev) => ({ ...prev, first_name: true }))
                  }
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">
                  Last Name{" "}
                  {!user.last_name && !initial ? (
                    <sup className="text-red-500">*</sup>
                  ) : null}
                </label>
                <input
                  className={`w-full bg-gray-50 border rounded-lg px-3 py-2 text-gray-800 ${!user.last_name && !initial && (touched.last_name || validateOnSave) ? "border-red-500" : "border-gray-200"}`}
                  value={user.last_name}
                  onChange={(e) =>
                    setUser({ ...user, last_name: e.target.value })
                  }
                  onBlur={() =>
                    setTouched((prev) => ({ ...prev, last_name: true }))
                  }
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">
                  Email{" "}
                  {!user.email && !initial ? (
                    <sup className="text-red-500">*</sup>
                  ) : null}
                </label>
                <input
                  className={`w-full bg-gray-50 border rounded-lg px-3 py-2 text-gray-800 ${!user.email && !initial && (touched.email || validateOnSave) ? "border-red-500" : "border-gray-200"}`}
                  type="email"
                  value={user.email}
                  onChange={(e) => setUser({ ...user, email: e.target.value })}
                  onBlur={() =>
                    setTouched((prev) => ({ ...prev, email: true }))
                  }
                  required
                  disabled={!!initial}
                />
              </div>
              {!initial && (
                <div>
                  <label className="block text-sm font-medium mb-1">
                    Password{" "}
                    {!user.password && !initial ? (
                      <sup className="text-red-500">*</sup>
                    ) : null}
                  </label>
                  <input
                    className={`w-full bg-gray-50 border rounded-lg px-3 py-2 text-gray-800 ${!user.password && !initial && (touched.password || validateOnSave) ? "border-red-500" : "border-gray-200"}`}
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
                  />
                </div>
              )}
            </div>
          </div>
          <div className="col-span-2 mb-2">
            <h3 className="flex items-center gap-2 font-semibold text-lg mb-2 text-black">
              <HiOutlineKey className="inline-block text-xl text-black" />
              <span>Contact & Role</span>
            </h3>
            <div className="mb-3 grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-1">
                  Role{" "}
                  {!user.role && !initial ? (
                    <sup className="text-red-500">*</sup>
                  ) : null}
                </label>
                <select
                  className={`w-full bg-gray-50 border rounded-lg px-3 py-2 text-gray-800 ${!user.role && !initial && (touched.role || validateOnSave) ? "border-red-500" : "border-gray-200"}`}
                  value={user.role}
                  onChange={(e) => setUser({ ...user, role: e.target.value })}
                  onBlur={() => setTouched((prev) => ({ ...prev, role: true }))}
                  required
                >
                  <option value="">Select role</option>
                  {roles.map((role) => (
                    <option key={role._id || role.id} value={role.name}>
                      {role.name}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">
                  Phone{" "}
                  {!initial ? <sup className="text-red-500">*</sup> : null}
                </label>
                <input
                  className={`w-full bg-gray-50 border rounded-lg px-3 py-2 text-gray-800 ${!user.phone && !initial && (touched.phone || validateOnSave) ? "border-red-500" : "border-gray-200"}`}
                  value={user.phone}
                  onChange={(e) => setUser({ ...user, phone: e.target.value })}
                  onBlur={() =>
                    setTouched((prev) => ({ ...prev, phone: true }))
                  }
                />
              </div>
            </div>
          </div>
          <div className="col-span-2 mb-2">
            <h3 className="flex items-center gap-2 font-semibold text-lg mb-2 text-black">
              <HiOutlineLocationMarker className="inline-block text-xl text-black" />
              <span>Address</span>
            </h3>
            <div className="mb-3 grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-1">Street</label>
                <input
                  className={`w-full bg-gray-50 border rounded-lg px-3 py-2 text-gray-800 ${!user.address.street && !initial && (touched.street || validateOnSave) ? "border-red-500" : "border-gray-200"}`}
                  value={user.address.street}
                  onChange={(e) =>
                    setUser({
                      ...user,
                      address: { ...user.address, street: e.target.value },
                    })
                  }
                  onBlur={() =>
                    setTouched((prev) => ({ ...prev, street: true }))
                  }
                />
              </div>
              <div>
                <label className="block mb-1">House</label>
                <input
                  type="text"
                  className={`w-full bg-gray-50 border rounded-lg px-3 py-2 text-gray-800 ${!user.address.house && !initial && (touched.house || validateOnSave) ? "border-red-500" : "border-gray-200"}`}
                  value={user.address.house}
                  onChange={(e) =>
                    setUser({
                      ...user,
                      address: { ...user.address, house: e.target.value },
                    })
                  }
                  onBlur={() =>
                    setTouched((prev) => ({ ...prev, house: true }))
                  }
                />
              </div>
              <div>
                <label className="block mb-1">
                  Village{" "}
                  {!user.address.village && !initial ? (
                    <sup className="text-red-500">*</sup>
                  ) : null}
                </label>
                <input
                  type="text"
                  className={`w-full bg-gray-50 border rounded-lg px-3 py-2 text-gray-800 ${!user.address.village && !initial && (touched.village || validateOnSave) ? "border-red-500" : "border-gray-200"}`}
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
                />
              </div>
              <div>
                <label className="block mb-1">
                  Commune{" "}
                  {!user.address.commune && !initial ? (
                    <sup className="text-red-500">*</sup>
                  ) : null}
                </label>
                <input
                  type="text"
                  className={`w-full bg-gray-50 border rounded-lg px-3 py-2 text-gray-800 ${!user.address.commune && !initial && (touched.commune || validateOnSave) ? "border-red-500" : "border-gray-200"}`}
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
                />
              </div>
              <div>
                <label className="block mb-1">
                  District{" "}
                  {!user.address.district && !initial ? (
                    <sup className="text-red-500">*</sup>
                  ) : null}
                </label>
                <input
                  type="text"
                  className={`w-full bg-gray-50 border rounded-lg px-3 py-2 text-gray-800 ${!user.address.district && !initial && (touched.district || validateOnSave) ? "border-red-500" : "border-gray-200"}`}
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
                />
              </div>
              <div>
                <label className="block mb-1">
                  City/Province{" "}
                  {!user.address.province && !initial ? (
                    <sup className="text-red-500">*</sup>
                  ) : null}
                </label>
                <input
                  type="text"
                  className={`w-full bg-gray-50 border rounded-lg px-3 py-2 text-gray-800 ${!user.address.province && !initial && (touched.province || validateOnSave) ? "border-red-500" : "border-gray-200"}`}
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
                />
              </div>
              <div>
                <label className="block mb-1">
                  Country{" "}
                  {!user.address.country && !initial ? (
                    <sup className="text-red-500">*</sup>
                  ) : null}
                </label>
                <input
                  type="text"
                  className={`w-full bg-gray-50 border rounded-lg px-3 py-2 text-gray-800 ${!user.address.country && !initial && (touched.country || validateOnSave) ? "border-red-500" : "border-gray-200"}`}
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
                />
              </div>
            </div>
          </div>
          <div className="col-span-2 mb-2">
            <h3 className="flex items-center gap-2 font-semibold text-lg mb-2 text-black">
              <HiOutlineUserCircle className="inline-block text-xl text-black" />
              <span>Profile</span>
            </h3>
            <div className="mb-3 grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-1">
                  Profile Image
                </label>
                <input
                  type="file"
                  accept="image/*"
                  ref={fileInputRef}
                  className="w-full bg-gray-50 border border-gray-200 rounded-lg px-3 py-2 text-gray-800 mb-2 cursor-pointer"
                  onChange={handleProfileUpload}
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">
                  Or paste image URL
                </label>
                <input
                  className="w-full bg-gray-50 border border-gray-200 rounded-lg px-3 py-2 text-gray-800"
                  value={user.profile}
                  onChange={(e) => {
                    setUser({ ...user, profile: e.target.value });
                    setProfilePreview(e.target.value);
                  }}
                />
              </div>
            </div>
            {profilePreview && (
              <div className="flex justify-center mb-2">
                <img
                  src={profilePreview}
                  alt="Profile Preview"
                  className="h-50 w-50 rounded-lg object-cover"
                  onError={(e) => {
                    e.target.style.display = "none";
                  }}
                />
              </div>
            )}
          </div>
        </form>
        <div className="col-span-2 w-full flex items-center justify-end gap-3 mt-4">
          <button
            type="button"
            className="px-5 py-2 bg-[#f8f8f8] hover:bg-[#e5e7eb] text-gray-black rounded-xl cursor-pointer  flex items-center gap-2"
            onClick={onClose}
          >
            <HiXCircle className="inline-block" /> Cancel
          </button>
          <button
            type="button"
            className="px-5 py-2 bg-[#1e3a5f] hover:bg-[#16375b] text-white rounded-xl cursor-pointer flex items-center gap-2"
            onClick={() => {
              setValidateOnSave(true);
              setTouched({
                first_name: true,
                last_name: true,
                email: true,
                password: true,
                role: true,
                phone: true,
                street: true,
                house: true,
                village: true,
                commune: true,
                district: true,
                province: true,
                country: true,
              });
              onSave(user);
            }}
          >
            <HiOutlineDocumentText className="inline-block" />
            {initial ? "Update User" : "Add User"}
          </button>
        </div>
      </div>
    </div>
  );
};

export default UserModal;
