import { useAuth } from "../context/useAuth.js";
import {
  HiBell,
  HiOutlineLogout,
  HiChevronDown,
  HiOutlineMenuAlt2,
  HiUser,
  HiOutlineCog,
  HiOutlineQuestionMarkCircle,
} from "react-icons/hi";
import { useState, useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";

const Header = ({ onBellClick }) => {
  const { user, logout } = useAuth();
  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef();
  const navigate = useNavigate();

  // Close dropdown on click outside
  useEffect(() => {
    function handleClickOutside(e) {
      if (menuRef.current && !menuRef.current.contains(e.target)) {
        setMenuOpen(false);
      }
    }
    if (menuOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    } else {
      document.removeEventListener("mousedown", handleClickOutside);
    }
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [menuOpen, menuRef]);

  const handleLogout = async () => {
    try {
      await logout();
      navigate("/login");
    } catch (err) {
      console.error("[Navbar] logout failed", err);
    }
  };

  return (
    <header className="bg-white border-b border-[#ececec] flex items-center justify-between px-3 py-2">
      <HiOutlineMenuAlt2
        onClick={onBellClick}
        className="text-gray-500 hover:text-[#1e3a5f] text-xl cursor-pointer transition"
      />
      <div className="flex items-center gap-6">
        <button className="relative focus:outline-none hover:text-blue-700 transition hover:cursor-pointer">
          <HiBell className="text-gray-500 hover:text-[#1e3a5f] text-2xl" />
          <span className="absolute -top-3 -right-3 bg-red-500 text-white text-xs rounded-full px-1.5 py-0.5 font-bold border-2 border-white">
            2
          </span>
        </button>
        <div className="flex items-center gap-3 relative">
          <button
            ref={menuRef}
            tabIndex={0}
            onClick={() => setMenuOpen((v) => !v)}
            className="flex items-center gap-2 px-2 py-1 rounded-full transition focus:outline-none cursor-pointer hover:bg-[#f1f5f9]"
          >
            <div className="w-8 h-8 rounded-full bg-[#1e3a5f] flex items-center justify-center text-white font-bold text-xl overflow-hidden">
              {user?.profile &&
              user.profile !== "null" &&
              user.profile !== "" ? (
                <img
                  src={user.profile}
                  alt={user.name || user.email || "User"}
                  className="w-8 h-8 object-cover rounded-full"
                  onError={(e) => {
                    e.target.onerror = null;
                    e.target.src = "/default-profile.png";
                  }}
                />
              ) : (
                <HiUser className="text-white text-2xl" />
              )}
            </div>
            <div className="flex flex-col items-start text-left">
              <span className="text-gray-900 text-sm leading-tight">
                {user?.name || "User"}
              </span>
            </div>
            <HiChevronDown className="text-gray-400 text-xl ml-1" />
          </button>
          {menuOpen && (
            <div className="absolute right-0 top-14 bg-white rounded-2xl shadow-lg p-2 w-60 z-50 animate-fade-in-up border border-gray-100">
              <div className="px-3 pt-3">
                <div className="font-bold text-lg leading-tight">
                  {user?.name}{" "}
                  <span className="capitalize">({user?.role})</span>
                </div>
                <div className="text-gray-500 text-sm mb-1">{user?.email}</div>
              </div>
              <hr className="my-2 border-gray-200" />
              <button className="w-full flex items-center px-2 py-3 text-[#64748b] hover:text-black hover:bg-[#f1f5f9] transition text-sm space-x-2 rounded-xl cursor-pointer">
                <HiUser className="text-xl" />
                <span>Profile Settings</span>
              </button>
              <button className="w-full flex items-center px-2 py-3 text-[#64748b] hover:text-black hover:bg-[#f1f5f9] transition text-sm space-x-2 rounded-xl cursor-pointer">
                <HiOutlineCog className="text-xl" />
                <span>Account Settings</span>
              </button>
              <button className="w-full flex items-center px-2 py-3 text-[#64748b] hover:text-black hover:bg-[#f1f5f9] transition text-sm space-x-2 rounded-xl cursor-pointer">
                <HiOutlineQuestionMarkCircle className="text-xl" />
                <span>Help & Support</span>
              </button>
              <hr className="my-2 border-gray-200" />
              <button
                type="button"
                onMouseDown={(e) => {
                  e.preventDefault();
                  handleLogout();
                }}
                className="w-full flex items-center px-2 py-3 text-red-500 hover:bg-red-100 transition text-sm space-x-2 rounded-xl cursor-pointer"
              >
                <HiOutlineLogout className="text-red-500 text-xl" />
                <span>Logout</span>
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};

export default Header;
