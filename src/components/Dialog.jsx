import React from "react";
import {
  HiCheckCircle,
  HiExclamationCircle,
  HiExclamation,
  HiInformationCircle,
} from "react-icons/hi";

const Dialog = ({
  open,
  type = "success", // 'success' | 'confirm' | 'info' | 'error'
  title = "",
  message = "",
  onClose,
  onConfirm,
  confirmText = "Yes",
  cancelText = "No",
  showActions = false,
  children,
}) => {
  if (!open) return null;

  let icon, iconBg, iconColor, defaultTitle;
  switch (type) {
    case "success":
      iconBg = "bg-[#e6f7ed]";
      iconColor = "text-[#22c55e]";
      icon = <HiCheckCircle className="w-8 h-8" />;
      defaultTitle = "Success";
      break;
    case "confirm":
      iconBg = "bg-[#e6f2ff]";
      iconColor = "text-[#1e3a5f]";
      icon = <HiExclamationCircle className="w-8 h-8" />;
      defaultTitle = "Confirm";
      break;
    case "error":
      iconBg = "bg-[#fee]";
      iconColor = "text-[#ef4444]";
      icon = <HiExclamationCircle className="w-8 h-8" />;
      defaultTitle = "Error";
      break;
    case "warning":
      iconBg = "bg-[#fef3e6]";
      iconColor = "text-[#f59e0b]";
      icon = <HiExclamation className="w-8 h-8" />;
      defaultTitle = "Warning";
      break;
    case "info":
      iconBg = "bg-[#e6f2ff]";
      iconColor = "text-[#0071e3]";
      icon = <HiInformationCircle className="w-8 h-8" />;
      defaultTitle = "Info";
      break;
    default:
      iconBg = "bg-gray-100";
      iconColor = "text-gray-500";
      icon = null;
      defaultTitle = "Info";
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/5 backdrop-blur-sm">
      <div className="bg-white rounded-2xl p-5 min-w-100 max-w-100 flex flex-col items-center shadow-lg">
        <div className="mb-4">
          <div
            className={`flex items-center justify-center w-12 h-12 rounded-full ${iconBg}`}
          >
            <span className={`${iconColor}`}>{icon}</span>
          </div>
        </div>
        <h2 className="text-xl mb-2 text-center text-black">
          {title || defaultTitle}
        </h2>
        <p
          className={`${children ? "mb-4" : "mb-8"} text-center text-base text-gray-500`}
        >
          {message}
        </p>
        {children}
        {showActions ? (
          <div className="flex gap-4">
            <button
              className="bg-gray-100 hover:bg-gray-200 text-[#1e3a5f] px-6 py-2 rounded-full focus:outline-none border border-gray-200 cursor-pointer"
              onClick={onClose}
            >
              {cancelText}
            </button>
            <button
              className="bg-[#1e3a5f] hover:bg-[#16375b] text-white px-6 py-2 rounded-full focus:outline-none cursor-pointer"
              onClick={onConfirm}
            >
              {confirmText}
            </button>
          </div>
        ) : (
          <button
            className="bg-[#1e3a5f] hover:bg-[#16375b] text-white px-6 py-2 rounded-full focus:outline-none cursor-pointer"
            onClick={onClose}
          >
            OK
          </button>
        )}
      </div>
    </div>
  );
};

export default Dialog;
