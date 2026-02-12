import { useAuth } from "../contexts/auth/useAuth.js";
import { useNotification } from "../contexts/notification/useNotification.js";
import {
  HiOutlineBell,
  HiOutlineLogout,
  HiChevronDown,
  HiOutlineMenuAlt2,
  HiUser,
  HiOutlineCog,
  HiOutlineQuestionMarkCircle,
} from "react-icons/hi";
import { useState, useRef, useEffect } from "react";
import { formatDate } from "../utils/dateFormat";
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

  // Notification click handler with navigation
  const handleNotificationClick = async (n) => {
    await markAsRead(n._id);
    if (n.entity_type === "OrderRequest" && n.entity_id) {
      navigate(`/order-requests?open=${n.entity_id}`);
    }
    // Add more entity_type navigation as needed
  };

  return (
    <header className="bg-white border-b border-[#ececec] flex items-center justify-between px-3 py-2">
      <HiOutlineMenuAlt2
        onClick={onBellClick}
        className="text-gray-500 hover:text-[#1e3a5f] text-xl cursor-pointer transition"
      />
      <div className="flex items-center gap-3">
        <div className="relative" ref={notificationRef}>
          <button
            tabIndex={0}
            className="relative mt-2 focus:outline-none hover:text-blue-700 transition hover:cursor-pointer"
            onClick={() => setNotificationOpen((v) => !v)}
          >
            <HiOutlineBell className="text-gray-500 hover:text-[#1e3a5f] text-xl" />
            {unreadCount > 0 && (
              <span className="absolute -top-3 -right-3 bg-red-500 text-white text-sm rounded-full w-6 h-6 pt-0.5 flex items-center justify-center font-bold border-2 border-white">
                {unreadCount}
              </span>
            )}
          </button>
          {notificationOpen && (
            <div className="absolute right-0 top-10 bg-white rounded-2xl shadow-lg p-2 w-120 z-50 animate-fade-in-up border border-gray-100">
              <div className="px-2 pt-2">
                <div className="font-bold text-sm leading-tight">
                  Notifications
                </div>
              </div>
              <hr className="my-2 border-gray-100" />
              {notifications.length === 0 ? (
                <div className="w-full p-2 text-[#64748b] text-center text-sm space-x-2 rounded-xl cursor-pointer">
                  No notifications
                </div>
              ) : (
                <ul>
                  {notifications.map((n) => (
                    <li
                      key={n._id}
                      className="w-full flex items-center justify-between p-2 text-[#64748b] hover:text-black hover:bg-[#f1f5f9] transition text-sm space-x-2 cursor-pointer"
                      onClick={() => handleNotificationClick(n)}
                    >
                      <div className="flex flex-col text-sm text-gray-900">
                        <span>{n.message}</span>
                        {n.entity_type && n.entity_id && (
                          <span className="text-xs text-gray-400">
                            {n.entity_type} ID: {n.entity_id}
                          </span>
                        )}
                      </div>
                      <div className="text-sm text-gray-400 text-right min-w-35">
                        {formatDate(n.createdAt, true)}
                      </div>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          )}
        </div>
        <div className="flex items-center gap-3 relative" ref={menuRef}>
          <button
            tabIndex={0}
            onClick={() => setMenuOpen((v) => !v)}
            className="flex items-center gap-2 p-1 rounded-full transition focus:outline-none cursor-pointer hover:bg-[#f1f5f9]"
          >
            <div className="w-8 h-8 rounded-full bg-[#1e3a5f] flex items-center justify-center text-white text-sm overflow-hidden">
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
                <HiUser className="text-white text-xl" />
              )}
            </div>
            <div className="flex flex-col items-start text-left">
              <span className="text-gray-900 text-sm leading-tight">
                {user?.first_name + " " + user?.last_name || "User"}
              </span>
            </div>
            <HiChevronDown className="text-gray-400 text-xl ml-1" />
          </button>
          {menuOpen && (
            <div className="absolute right-0 top-11 bg-white rounded-2xl shadow-lg p-2 w-60 z-50 animate-fade-in-up border border-gray-100">
              <div className="px-3 pt-3">
                <div className="text-sm leading-tight">
                  {user?.first_name + " " + user?.last_name}
                  <span className="ml-2 capitalize">({user?.role})</span>
                </div>
                <div className="text-gray-500 text-sm mb-1">{user?.email}</div>
              </div>
              <hr className="my-2 border-gray-100" />
              <button
                onClick={() => {
                  setMenuOpen(false);
                  navigate("/settings?tab=profile");
                }}
                className="w-full flex items-center px-2 py-3 text-[#64748b] hover:text-black hover:bg-[#f1f5f9] transition text-sm space-x-2 rounded-xl cursor-pointer"
              >
                <HiUser className="text-xl" />
                <span>Profile Settings</span>
              </button>
              <button
                onClick={() => {
                  setMenuOpen(false);
                  navigate("/settings?tab=account");
                }}
                className="w-full flex items-center px-2 py-3 text-[#64748b] hover:text-black hover:bg-[#f1f5f9] transition text-sm space-x-2 rounded-xl cursor-pointer"
              >
                <HiOutlineCog className="text-xl" />
                <span>Account Settings</span>
              </button>
              <button
                onClick={() => {
                  setMenuOpen(false);
                  navigate("/settings?tab=help");
                }}
                className="w-full flex items-center px-2 py-3 text-[#64748b] hover:text-black hover:bg-[#f1f5f9] transition text-sm space-x-2 rounded-xl cursor-pointer"
              >
                <HiOutlineQuestionMarkCircle className="text-xl" />
                <span>Help & Support</span>
              </button>
              <hr className="my-2 border-gray-100" />
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
