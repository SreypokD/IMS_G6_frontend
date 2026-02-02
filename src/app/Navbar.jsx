import { useAuth } from "../contexts/auth/useAuth.js";
import { useNotification } from "../contexts/notification/useNotification.js";
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
  const { notifications, unreadCount, markAsRead } = useNotification();
  const [notificationOpen, setNotificationOpen] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef();
  const notificationRef = useRef();
  const navigate = useNavigate();

  // Close dropdowns on click outside
  useEffect(() => {
    function handleClickOutside(e) {
      if (menuRef.current && !menuRef.current.contains(e.target)) {
        setMenuOpen(false);
      }
      if (
        notificationRef.current &&
        !notificationRef.current.contains(e.target)
      ) {
        setNotificationOpen(false);
      }
    }
    if (menuOpen || notificationOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    } else {
      document.removeEventListener("mousedown", handleClickOutside);
    }
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [menuOpen, notificationOpen]);

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
        <div className="relative" ref={notificationRef}>
          <button
            tabIndex={0}
            className="relative mt-2 focus:outline-none hover:text-blue-700 transition hover:cursor-pointer"
            onClick={() => setNotificationOpen((v) => !v)}
          >
            <HiBell className="text-gray-500 hover:text-[#1e3a5f] text-2xl" />
            {unreadCount > 0 && (
              <span className="absolute -top-3 -right-3 bg-red-500 text-white text-sm rounded-full w-6 h-6 flex items-center justify-center font-bold border-2 border-white">
                {unreadCount}
              </span>
            )}
          </button>
          {notificationOpen && (
            <div className="absolute right-0 top-10 bg-white rounded-2xl shadow-lg p-2 w-120 z-50 animate-fade-in-up border border-gray-100">
              <div className="px-2 pt-2">
                <div className="font-bold text-lg leading-tight">
                  Notifications
                </div>
              </div>
              <hr className="my-2 border-gray-200" />
              {notifications.length === 0 ? (
                <div className="w-full px-2 py-3 text-[#64748b] text-center text-base space-x-2 rounded-xl cursor-pointer">
                  No notifications
                </div>
              ) : (
                <ul>
                  {notifications.map((n) => (
                    <li
                      key={n._id}
                      className="w-full flex items-center justify-between px-2 py-3 text-[#64748b] hover:text-black hover:bg-[#f1f5f9] transition text-base space-x-2 cursor-pointer"
                      onClick={() => markAsRead(n._id)}
                    >
                      <div className="text-sm text-gray-900">{n.message}</div>
                      <div className="text-sm text-gray-400">
                        {n.createdAt
                          ? new Date(n.createdAt).toLocaleString()
                          : ""}
                      </div>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          )}
        </div>
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
              <span className="text-gray-900 text-base leading-tight">
                {user?.first_name + " " + user?.last_name || "User"}
              </span>
            </div>
            <HiChevronDown className="text-gray-400 text-xl ml-1" />
          </button>
          {menuOpen && (
            <div className="absolute right-0 top-11 bg-white rounded-2xl shadow-lg p-2 w-60 z-50 animate-fade-in-up border border-gray-100">
              <div className="px-3 pt-3">
                <div className="font-bold text-lg leading-tight">
                  {user?.first_name + " " + user?.last_name}
                  <span className="ml-2 capitalize">({user?.role})</span>
                </div>
                <div className="text-gray-500 text-base mb-1">
                  {user?.email}
                </div>
              </div>
              <hr className="my-2 border-gray-200" />
              <button className="w-full flex items-center px-2 py-3 text-[#64748b] hover:text-black hover:bg-[#f1f5f9] transition text-base space-x-2 rounded-xl cursor-pointer">
                <HiUser className="text-xl" />
                <span>Profile Settings</span>
              </button>
              <button className="w-full flex items-center px-2 py-3 text-[#64748b] hover:text-black hover:bg-[#f1f5f9] transition text-base space-x-2 rounded-xl cursor-pointer">
                <HiOutlineCog className="text-xl" />
                <span>Account Settings</span>
              </button>
              <button className="w-full flex items-center px-2 py-3 text-[#64748b] hover:text-black hover:bg-[#f1f5f9] transition text-base space-x-2 rounded-xl cursor-pointer">
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
                className="w-full flex items-center px-2 py-3 text-red-500 hover:bg-red-100 transition text-base space-x-2 rounded-xl cursor-pointer"
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
