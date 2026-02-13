import React, { useState } from "react";
import loginImage from "../assets/images/image.png";
import { HiEye, HiEyeOff, HiCube, HiOutlineDownload } from "react-icons/hi";
import { register as registerApi } from "../api/auth-services";
import { useNavigate } from "react-router-dom";

const Register = () => {
  const navigate = useNavigate();
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    if (password !== confirmPassword) {
      setError("Passwords do not match");
      setLoading(false);
      return;
    }
    try {
      const res = await registerApi({
        first_name: firstName,
        last_name: lastName,
        email,
        phone,
        password,
      });
      if (!res.data.success) {
        setError(res.data.error || "Registration failed");
        setLoading(false);
        return;
      }
      navigate("/login");
    } catch {
      setError("Registration failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex bg-white">
      <div className="hidden md:flex w-1/2 h-screen items-center justify-center bg-white/80">
        <img
          src={loginImage}
          alt="Background"
          className="object-contain h-full"
          style={{ maxHeight: "100vh" }}
        />
      </div>
      <div className="flex flex-col w-full md:w-1/2 items-center justify-center">
        <div className="w-full max-w-lg bg-white/90 rounded-xl p-8 border border-gray-100 shadow-xl">
          <div className="w-18 h-15 m-auto bg-linear-to-br from-[#1e3a5f] to-[#bb7c18] rounded-xl flex items-center justify-center mb-3">
            <HiCube className="w-9 h-9 mx-auto text-white" />
          </div>
          <h2 className="text-3xl font-bold text-center text-gray-800 tracking-tight">
            Create Account
          </h2>
          <span className="block mb-6 text-sm text-center text-gray-400">
            Register to access your inventory dashboard
          </span>
          <form onSubmit={handleSubmit} className="space-y-5">
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-gray-600 mb-1 text-sm font-medium">
                  First Name <sup className="text-red-500">*</sup>
                </label>
                <input
                  type="text"
                  className="w-full border border-gray-100 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[#1e3a5f] bg-gray-50 text-gray-800 placeholder-gray-400"
                  value={firstName}
                  onChange={(e) => setFirstName(e.target.value)}
                  required
                  placeholder="First Name"
                  autoFocus
                />
              </div>
              <div>
                <label className="block text-gray-600 mb-1 text-sm font-medium">
                  Last Name <sup className="text-red-500">*</sup>
                </label>
                <input
                  type="text"
                  className="w-full border border-gray-100 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[#1e3a5f] bg-gray-50 text-gray-800 placeholder-gray-400"
                  value={lastName}
                  onChange={(e) => setLastName(e.target.value)}
                  required
                  placeholder="Last Name"
                />
              </div>
            </div>
            <div>
              <label className="block text-gray-600 mb-1 text-sm font-medium">
                Email Address <sup className="text-red-500">*</sup>
              </label>
              <input
                type="email"
                className="w-full border border-gray-100 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[#1e3a5f] bg-gray-50 text-gray-800 placeholder-gray-400"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                placeholder="you@email.com"
              />
            </div>
            <div>
              <label className="block text-gray-600 mb-1 text-sm font-medium">
                Phone Number <sup className="text-red-500">*</sup>
              </label>
              <input
                type="tel"
                className="w-full border border-gray-100 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[#1e3a5f] bg-gray-50 text-gray-800 placeholder-gray-400"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                required
                placeholder="(+855) 123 456 789"
              />
            </div>
            <div className="relative">
              <label className="block text-gray-600 mb-1 text-sm font-medium">
                Password <sup className="text-red-500">*</sup>
              </label>
              <input
                type={showPassword ? "text" : "password"}
                className="w-full border border-gray-100 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[#1e3a5f] bg-gray-50 text-gray-800 placeholder-gray-400 pr-10"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                placeholder="••••••••"
              />
              <button
                type="button"
                className="absolute right-3 top-12 transform -translate-y-1/2 text-gray-500 hover:text-gray-700 focus:outline-none z-0"
                tabIndex={-1}
                onClick={() => setShowPassword((prev) => !prev)}
                aria-label={showPassword ? "Hide password" : "Show password"}
              >
                {showPassword ? (
                  <HiEyeOff className="w-5 h-5 cursor-pointer" />
                ) : (
                  <HiEye className="w-5 h-5 cursor-pointer" />
                )}
              </button>
            </div>
            <div>
              <label className="block text-gray-600 mb-1 text-sm font-medium">
                Confirm Password <sup className="text-red-500">*</sup>
              </label>
              <input
                type={showPassword ? "text" : "password"}
                className="w-full border border-gray-100 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[#1e3a5f] bg-gray-50 text-gray-800 placeholder-gray-400"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                required
                placeholder="••••••••"
              />
            </div>
            {error && (
              <div className="mb-3 text-red-500 text-center text-sm font-medium">
                {error}
              </div>
            )}
            <button
              type="submit"
              className="w-full bg-[#1e3a5f] text-white hover:bg-[#1e3a5f] py-2.5 rounded-xl transition disabled:opacity-50 mt-2 cursor-pointer"
              disabled={loading}
            >
              {loading ? "Registering..." : "Register"}
              {!loading && (
                <HiOutlineDownload className="inline-block ml-1 text-lg -rotate-90" />
              )}
            </button>
            <span
              className="block text-sm text-[#1e3a5f] hover:underline text-center cursor-pointer"
              onClick={() => navigate("/login")}
            >
              Already have an account?
            </span>
          </form>
        </div>
        <br />
        <span className="block text-sm text-[#1e3a5f] text-center mt-6">
          © 2026 IMS. All rights reserved.
        </span>
      </div>
    </div>
  );
};

export default Register;
