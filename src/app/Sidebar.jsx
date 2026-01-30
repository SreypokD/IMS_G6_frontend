import React, { useState } from "react";

import { Link, useLocation } from "react-router-dom";
import { useAuth } from "../context/useAuth.js";
import {
  HiClipboardList,
  HiOutlineCollection,
  HiCheckCircle,
  HiTruck,
  HiCube,
  HiUserGroup,
  HiArchive,
  HiChartBar,
  HiTemplate,
  HiCog,
  HiChevronRight,
  HiKey,
  HiShoppingCart,
  HiClock,
} from "react-icons/hi";
import logo from "../assets/images/logo.png";

const navLinks = (permissions = []) =>
  [
    // Dashboard
    permissions.includes("view_dashboard") && {
      to: "/",
      label: "Dashboard",
      icon: <HiTemplate />,
    },

    // Master Data
    permissions.includes("view_category") && {
      to: "/categories",
      label: "Categories",
      icon: <HiOutlineCollection />,
    },
    permissions.includes("view_product") && {
      to: "/products",
      label: "Products",
      icon: <HiCube />,
    },
    permissions.includes("view_supplier") && {
      to: "/suppliers",
      label: "Suppliers",
      icon: <HiUserGroup />,
    },

    // Purchasing / Procurement
    permissions.includes("view_order_request") && {
      to: "/order-requests",
      label: "Order Requests",
      icon: <HiClipboardList />,
    },
    permissions.includes("view_approve_request") && {
      to: "/approve-requests",
      label: "Approve Requests",
      icon: <HiCheckCircle />,
    },
    permissions.includes("view_confirm_delivery") && {
      to: "/confirm-delivery",
      label: "Confirm Delivery",
      icon: <HiTruck />,
    },

    // Inventory
    permissions.includes("view_stock") && {
      to: "/stocks",
      label: "Stocks",
      icon: <HiArchive />,
    },

    // Sales
    permissions.includes("view_sale") && {
      to: "/sales",
      label: "Sales",
      icon: <HiShoppingCart />,
    },

    // Reports & Logs
    permissions.includes("view_report") && {
      to: "/reports",
      label: "Reports",
      icon: <HiChartBar />,
    },
    permissions.includes("view_activity_log") && {
      to: "/activity-log",
      label: "Activity Log",
      icon: <HiClock />,
    },

    // Settings / Security
    permissions.includes("view_permission") && {
      label: "Settings",
      icon: <HiCog />,
      submenus: [
        permissions.includes("view_user") && {
          to: "/users",
          label: "Users",
          icon: <HiUserGroup />,
        },
        permissions.includes("view_permission") && {
          to: "/permissions",
          label: "Permissions",
          icon: <HiKey />,
        },
      ].filter(Boolean),
    },
  ].filter(Boolean);

const Sidebar = ({ mini }) => {
  const { user } = useAuth();
  const location = useLocation();
  const links = navLinks(user?.permission?.permissions);
  const [expanded, setExpanded] = useState(null);

  return (
    <aside
      className={`bg-white h-screen flex flex-col border-r border-[#ececec] transition-all duration-300 ${mini ? "w-18" : "w-64"}`}
    >
      <div
        className={`text-lg font-bold m-3 tracking-tight flex items-center justify-center gap-3 ${mini ? "flex-col" : ""}`}
      >
        <img src={logo} alt="Logo" className="object-contain h-10 w-10 mb-2" />
        {!mini && <span>Stockify IMS</span>}
      </div>
      <nav className="flex-1 min-h-0">
        <ul className="space-y-2 overflow-y-auto h-[calc(100vh-100px)] px-3">
          {links.map((link, i) => {
            const parentKey = link.label || link.to || i;
            if (link.submenus) {
              const isExpanded = expanded === parentKey;
              return (
                <li key={parentKey}>
                  <div
                    className={`group flex items-center justify-between p-3 rounded-xl transition font-base text-base space-x-3 mb-2 text-[#64748b] hover:bg-[#f1f5f9] hover:text-black`}
                    onClick={() => setExpanded(isExpanded ? null : parentKey)}
                    style={{ cursor: "pointer" }}
                  >
                    <div className="flex items-center space-x-3">
                      <span className="text-xl">{link.icon}</span>
                      {!mini && <span className="text-base">{link.label}</span>}
                    </div>
                    <HiChevronRight
                      className={`transition-transform ${isExpanded ? "rotate-90" : ""}`}
                    />
                  </div>
                  <ul
                    className="space-y-2"
                    style={{
                      maxHeight: isExpanded ? "500px" : "0px",
                      overflow: "hidden",
                      transition: "max-height 0.3s cubic-bezier(0.4,0,0.2,1)",
                      opacity: isExpanded ? 1 : 0,
                    }}
                  >
                    {isExpanded &&
                      link.submenus.map((submenu, j) => {
                        const submenuKey = submenu.label || submenu.to || j;
                        return (
                          <li key={submenuKey}>
                            <Link
                              to={submenu.to}
                              className={`group flex items-center p-3 rounded-xl transition font-base text-base space-x-3
                            ${
                              location.pathname === submenu.to
                                ? "bg-[#1e3a5f] text-white hover:bg-[#1e3a5f]"
                                : "text-[#64748b] hover:bg-[#f1f5f9] hover:text-black"
                            }`}
                            >
                              <span className="text-xl">{submenu.icon}</span>
                              {!mini && (
                                <span className="text-base">
                                  {submenu.label}
                                </span>
                              )}
                            </Link>
                          </li>
                        );
                      })}
                  </ul>
                </li>
              );
            } else {
              return (
                <li key={parentKey}>
                  <Link
                    to={link.to}
                    className={`group flex items-center p-3 rounded-xl transition font-base text-base space-x-3
                    ${
                      location.pathname === link.to ||
                      location.pathname.includes(link.to + "/")
                        ? "bg-[#1e3a5f] text-white hover:bg-[#1e3a5f]"
                        : "text-[#64748b] hover:bg-[#f1f5f9] hover:text-black"
                    }
                  `}
                  >
                    <span className="text-xl">{link.icon}</span>
                    {!mini && <span className="text-base">{link.label}</span>}
                  </Link>
                </li>
              );
            }
          })}
        </ul>
      </nav>
    </aside>
  );
};

export default Sidebar;
