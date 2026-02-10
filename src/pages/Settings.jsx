import React, { useState, useEffect, useRef } from "react";
import { useSearchParams } from "react-router-dom";
import { useAuth } from "../contexts/auth/useAuth";
import { useDialog } from "../contexts/dialog/useDialog";
import { updateSelfProfile, uploadFile } from "../api";
import {
  HiUser,
  HiOutlineCog,
  HiCamera,
  HiOutlineMail,
  HiOutlinePhone,
  HiOutlineLocationMarker,
  HiOutlineKey,
  HiCheck,
} from "react-icons/hi";
import Loading from "../components/Loading";

export default function Settings() {
  const { user, refreshProfile } = useAuth();
  const { success, error } = useDialog();
  const [searchParams, setSearchParams] = useSearchParams();
  const [activeTab, setActiveTab] = useState("profile");
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);

  // Profile Form State
  const [profileData, setProfileData] = useState({
    first_name: "",
    last_name: "",
    phone: "",
    profile: "",
    address: {
      street: "",
      house: "",
      village: "",
      commune: "",
      district: "",
      province: "",
      country: "",
    },
  });

  // Account Form State
  const [passwordData, setPasswordData] = useState({
    password: "",
    confirmPassword: "",
  });

  const fileInputRef = useRef(null);

  // Sync tab with URL
  useEffect(() => {
    const tab = searchParams.get("tab");
    if (tab && ["profile", "account"].includes(tab)) {
      setActiveTab(tab);
    }
  }, [searchParams]);

  // Initial data load
  useEffect(() => {
    if (user) {
      setProfileData({
        first_name: user.first_name || "",
        last_name: user.last_name || "",
        phone: user.phone || "",
        profile: user.profile || "",
        address: {
          street: user.address?.street || "",
          house: user.address?.house || "",
          village: user.address?.village || "",
          commune: user.address?.commune || "",
          district: user.address?.district || "",
          province: user.address?.province || "",
          country: user.address?.country || "",
        },
      });
    }
  }, [user]);

  const handleTabChange = (tab) => {
    setActiveTab(tab);
    setSearchParams({ tab });
  };

  const handleProfileChange = (e) => {
    const { name, value } = e.target;
    if (name.startsWith("address.")) {
      const field = name.split(".")[1];
      setProfileData((prev) => ({
        ...prev,
        address: { ...prev.address, [field]: value },
      }));
    } else {
      setProfileData((prev) => ({ ...prev, [name]: value }));
    }
  };

  const handlePasswordChange = (e) => {
    const { name, value } = e.target;
    setPasswordData((prev) => ({ ...prev, [name]: value }));
  };

  const handleImageUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    // Validate type
    if (!file.type.match("image.*")) {
      error("Please select an image file", "Invalid File");
      return;
    }

    try {
      setUploading(true);
      const res = await uploadFile(file);
      if (res.data && res.data.url) {
        setProfileData((prev) => ({ ...prev, profile: res.data.url }));
        // Optionally save immediately
        // await updateSelfProfile({ profile: res.data.url });
        // refreshProfile();
        // success("Profile picture updated", "Success");
      }
    } catch (err) {
      console.error(err);
      error("Failed to upload image", "Upload Error");
    } finally {
      setUploading(false);
    }
  };

  const submitProfile = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      // Clean up empty address fields if needed, or backend handles it
      const payload = {
        ...profileData,
        // Ensure address is object
        address: profileData.address,
      };

      const res = await updateSelfProfile(payload);
      if (res.data.success) {
        await refreshProfile();
        success("Profile updated successfully", "Success");
      }
    } catch (err) {
      console.error(err);
      error(err.response?.data?.error || "Failed to update profile", "Error");
    } finally {
      setLoading(false);
    }
  };

  const submitPassword = async (e) => {
    e.preventDefault();
    if (passwordData.password !== passwordData.confirmPassword) {
      error("Passwords do not match", "Validation Error");
      return;
    }
    if (passwordData.password.length < 6) {
      error("Password must be at least 6 characters", "Validation Error");
      return;
    }

    setLoading(true);
    try {
      const res = await updateSelfProfile({
        password: passwordData.password,
      });
      if (res.data.success) {
        setPasswordData({ password: "", confirmPassword: "" });
        success("Password updated successfully", "Success");
      }
    } catch (err) {
      console.error(err);
      error(err.response?.data?.error || "Failed to update password", "Error");
    } finally {
      setLoading(false);
    }
  };

  if (!user) {
    return (
      <div className="flex justify-center items-center h-full">
        <Loading />
      </div>
    );
  }

  return (
    <div className="max-w-6xl space-y-6">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Settings</h1>
          <p className="text-gray-500">
            Manage your profile and account preferences
          </p>
        </div>
      </div>

      <div className="flex flex-col lg:flex-row gap-4">
        {/* Sidebar / Tabs */}
        <div className="w-full h-fit lg:w-64 bg-white rounded-2xl p-2 border border-gray-100">
          <button
            onClick={() => handleTabChange("profile")}
            className={`w-full flex items-center gap-3 px-2 py-3 transition text-sm rounded-xl cursor-pointer ${
              activeTab === "profile"
                ? "bg-[#1e3a5f] text-white hover:bg-[#1e3a5f]"
                : "text-[#64748b] hover:bg-[#f1f5f9] hover:text-black"
            }`}
          >
            <HiUser className="text-xl" />
            <span>Profile Settings</span>
          </button>
          <button
            onClick={() => handleTabChange("account")}
            className={`w-full flex items-center gap-3 px-2 py-3 transition text-sm rounded-xl cursor-pointer ${
              activeTab === "account"
                ? "bg-[#1e3a5f] text-white hover:bg-[#1e3a5f]"
                : "text-[#64748b] hover:bg-[#f1f5f9] hover:text-black"
            }`}
          >
            <HiOutlineCog className="text-xl" />
            <span>Account & Security</span>
          </button>
        </div>

        {/* Content */}
        <div className="flex-1">
          <div className="bg-white rounded-2xl border border-gray-100 p-6">
            {activeTab === "profile" && (
              <form
                onSubmit={submitProfile}
                className="space-y-6 animate-fade-in-up"
              >
                <div className="flex flex-col md:flex-row gap-6">
                  {/* Avatar Upload */}
                  <div className="flex flex-col items-center gap-4">
                    <div className="relative group">
                      <div className="w-32 h-32 rounded-full overflow-hidden border-4 border-white shadow-lg bg-gray-100">
                        {profileData.profile ? (
                          <img
                            src={profileData.profile}
                            alt="Profile"
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center text-gray-400">
                            <HiUser className="text-6xl" />
                          </div>
                        )}
                        {uploading && (
                          <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
                            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-white"></div>
                          </div>
                        )}
                      </div>
                      <button
                        type="button"
                        disabled={uploading}
                        onClick={() => fileInputRef.current?.click()}
                        className="absolute bottom-0 right-0 bg-[#1e3a5f] text-white p-2 rounded-full shadow-lg hover:bg-[#1e3a5f] transition transform hover:scale-105"
                      >
                        <HiCamera className="text-lg" />
                      </button>
                      <input
                        type="file"
                        ref={fileInputRef}
                        className="hidden"
                        accept="image/*"
                        onChange={handleImageUpload}
                      />
                    </div>
                    <div className="text-center">
                      <h3 className="font-semibold text-gray-900">
                        Profile Photo
                      </h3>
                    </div>
                  </div>

                  {/* Fields */}
                  <div className="flex-1 grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="text-sm font-medium text-gray-700">
                        First Name
                      </label>
                      <input
                        type="text"
                        name="first_name"
                        value={profileData.first_name}
                        onChange={handleProfileChange}
                        className="w-full bg-gray-50 border rounded-lg px-3 py-2 text-sm text-gray-800 border-gray-100"
                        placeholder="John"
                      />
                    </div>
                    <div>
                      <label className="text-sm font-medium text-gray-700">
                        Last Name
                      </label>
                      <input
                        type="text"
                        name="last_name"
                        value={profileData.last_name}
                        onChange={handleProfileChange}
                        className="w-full bg-gray-50 border rounded-lg px-3 py-2 text-sm text-gray-800 border-gray-100"
                        placeholder="Doe"
                      />
                    </div>
                    <div>
                      <label className="text-sm font-medium text-gray-700">
                        Phone Number
                      </label>
                      <input
                        type="tel"
                        name="phone"
                        value={profileData.phone}
                        onChange={handleProfileChange}
                        className="w-full bg-gray-50 border rounded-lg px-3 py-2 text-sm text-gray-800 border-gray-100"
                        placeholder="+855 12 345 678"
                      />
                    </div>
                  </div>
                </div>
                <hr className="border-gray-100" />
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                    <HiOutlineLocationMarker className="text-gray-400" />
                    Address Information
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="text-sm font-medium text-gray-700">
                        House No.
                      </label>
                      <input
                        type="text"
                        name="address.house"
                        value={profileData.address.house}
                        onChange={handleProfileChange}
                        className="w-full bg-gray-50 border rounded-lg px-3 py-2 text-sm text-gray-800 border-gray-100"
                      />
                    </div>
                    <div>
                      <label className="text-sm font-medium text-gray-700">
                        Street
                      </label>
                      <input
                        type="text"
                        name="address.street"
                        value={profileData.address.street}
                        onChange={handleProfileChange}
                        className="w-full bg-gray-50 border rounded-lg px-3 py-2 text-sm text-gray-800 border-gray-100"
                      />
                    </div>
                    <div>
                      <label className="text-sm font-medium text-gray-700">
                        Village
                      </label>
                      <input
                        type="text"
                        name="address.village"
                        value={profileData.address.village}
                        onChange={handleProfileChange}
                        className="w-full bg-gray-50 border rounded-lg px-3 py-2 text-sm text-gray-800 border-gray-100"
                      />
                    </div>
                    <div>
                      <label className="text-sm font-medium text-gray-700">
                        Commune/Sangkat
                      </label>
                      <input
                        type="text"
                        name="address.commune"
                        value={profileData.address.commune}
                        onChange={handleProfileChange}
                        className="w-full bg-gray-50 border rounded-lg px-3 py-2 text-sm text-gray-800 border-gray-100"
                      />
                    </div>
                    <div>
                      <label className="text-sm font-medium text-gray-700">
                        District/Khan
                      </label>
                      <input
                        type="text"
                        name="address.district"
                        value={profileData.address.district}
                        onChange={handleProfileChange}
                        className="w-full bg-gray-50 border rounded-lg px-3 py-2 text-sm text-gray-800 border-gray-100"
                      />
                    </div>
                    <div>
                      <label className="text-sm font-medium text-gray-700">
                        Province/City
                      </label>
                      <input
                        type="text"
                        name="address.province"
                        value={profileData.address.province}
                        onChange={handleProfileChange}
                        className="w-full bg-gray-50 border rounded-lg px-3 py-2 text-sm text-gray-800 border-gray-100"
                      />
                    </div>
                  </div>
                </div>

                <div className="flex justify-end pt-4">
                  <button
                    type="submit"
                    disabled={loading}
                    className="bg-[#1e3a5f] hover:bg-[#16375b] text-white px-6 py-2 rounded-xl focus:outline-none flex items-center gap-2 cursor-pointer text-sm"
                  >
                    {loading ? (
                      <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                    ) : (
                      <>
                        <HiCheck className="text-lg" />
                        Save Changes
                      </>
                    )}
                  </button>
                </div>
              </form>
            )}

            {activeTab === "account" && (
              <form
                onSubmit={submitPassword}
                className="space-y-6 animate-fade-in-up"
              >
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">
                    Account Information
                  </h3>
                  <div>
                    <label className="text-sm font-medium text-gray-700">
                      Email Address
                    </label>
                    <input
                      type="email"
                      value={user.email}
                      className="w-full px-4 py-2 rounded-xl border border-gray-100 bg-gray-50 text-gray-500 cursor-default"
                      disabled
                    />
                  </div>
                </div>

                <hr className="border-gray-100" />

                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                    <HiOutlineKey className="text-gray-400" />
                    Change Password
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="text-sm font-medium text-gray-700">
                        New Password
                      </label>
                      <input
                        type="password"
                        name="password"
                        value={passwordData.password}
                        onChange={handlePasswordChange}
                        className="w-full bg-gray-50 border rounded-lg px-3 py-2 text-sm text-gray-800 border-gray-100"
                        placeholder="••••••••"
                      />
                    </div>
                    <div>
                      <label className="text-sm font-medium text-gray-700">
                        Confirm New Password
                      </label>
                      <input
                        type="password"
                        name="confirmPassword"
                        value={passwordData.confirmPassword}
                        onChange={handlePasswordChange}
                        className="w-full bg-gray-50 border rounded-lg px-3 py-2 text-sm text-gray-800 border-gray-100"
                        placeholder="••••••••"
                      />
                    </div>
                  </div>
                </div>

                <div className="flex justify-end pt-4">
                  <button
                    type="submit"
                    disabled={loading || !passwordData.password}
                    className="bg-[#1e3a5f] hover:bg-[#16375b] text-white px-6 py-2 rounded-xl focus:outline-none flex items-center gap-2 cursor-pointer text-sm"
                  >
                    {loading ? (
                      <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                    ) : (
                      <>
                        <HiCheck className="text-lg" />
                        Update Password
                      </>
                    )}
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
