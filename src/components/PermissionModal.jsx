import React, { useState } from "react";
import { HiXCircle, HiOutlineDocumentText, HiOutlineKey } from "react-icons/hi";

const permissionTable = [
  {
    label: "Dashboard",
    actions: ["view_dashboard"],
  },

  // Master Data
  {
    label: "Categories",
    actions: [
      "view_category",
      "create_category",
      "update_category",
      "delete_category",
    ],
  },
  {
    label: "Products",
    actions: [
      "view_product",
      "create_product",
      "update_product",
      "delete_product",
    ],
  },
  {
    label: "Suppliers",
    actions: [
      "view_supplier",
      "create_supplier",
      "update_supplier",
      "delete_supplier",
    ],
  },

  // Inventory
  {
    label: "Stocks",
    actions: ["view_stock", "create_stock", "update_stock", "delete_stock"],
  },

  // Purchasing / Receiving
  {
    label: "Order Requests",
    actions: [
      "view_order_request",
      "create_order_request",
      "update_order_request",
      "delete_order_request",
      "post_order_request",
    ],
  },
  {
    label: "Approve Requests",
    actions: ["view_approve_request", "update_approve_request"],
  },
  {
    label: "Confirm Delivery",
    actions: ["view_confirm_delivery", "update_confirm_delivery"],
  },

  // Sales
  {
    label: "Sales",
    actions: ["view_sale", "create_sale", "update_sale", "delete_sale"],
  },
  {
    label: "Order History",
    actions: ["view_order_history"],
  },

  // Reports & Logs
  {
    label: "Activity Log",
    actions: ["view_activity_log"],
  },
  {
    label: "Reports",
    actions: ["view_report"],
  },

  // System Management
  {
    label: "Users",
    actions: ["view_user", "create_user", "update_user", "delete_user"],
  },
  {
    label: "Permissions",
    actions: [
      "view_permission",
      "create_permission",
      "update_permission",
      "delete_permission",
    ],
  },
];

const initialPermission = {
  name: "",
  description: "",
  permissions: [],
};

const PermissionModal = ({ open, onClose, onSave, initial }) => {
  // Always deep clone the initial permission to avoid reference issues
  function clonePermission(obj) {
    return obj ? JSON.parse(JSON.stringify(obj)) : initialPermission;
  }
  const [permission, setEditPermission] = useState(clonePermission(initial));
  const [touched, setTouched] = useState({});
  const [validateOnSave, setValidateOnSave] = useState(false);

  React.useEffect(() => {
    if (open && !initial) {
      setEditPermission(clonePermission(null));
      setTouched({});
      setValidateOnSave(false);
    } else if (open && initial) {
      setEditPermission(clonePermission(initial));
      setTouched({});
      setValidateOnSave(false);
    }
  }, [open, initial]);

  function updatePermissionsState(updater) {
    setEditPermission((prev) => {
      const currentPerms = Array.isArray(prev.permissions)
        ? prev.permissions.filter((p) => typeof p === "string")
        : [];
      const newPerms = updater(new Set(currentPerms));
      return { ...prev, permissions: Array.from(newPerms) };
    });
  }

  function handlePermissionChange(e) {
    const { name, value, checked } = e.target;
    if (name === "name" || name === "description") {
      setEditPermission((f) => ({ ...f, [name]: value }));
    } else {
      updatePermissionsState((set) => {
        if (checked) set.add(value);
        else set.delete(value);
        return set;
      });
    }
  }

  if (!open) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/5 backdrop-blur-sm">
      <div className="bg-white rounded-2xl p-5 w-full max-w-[50%] max-h-[80vh] shadow-xl relative">
        <h2 className="text-2xl font-bold mb-6 text-center">
          {initial ? "Edit Permission" : "Add Permission"}
        </h2>
        <form className="space-y-5 overflow-auto max-h-[50vh] px-1">
          <div className="col-span-2 mb-2">
            <h3 className="flex items-center gap-2 font-semibold text-lg mb-2 text-black">
              <HiOutlineDocumentText className="inline-block text-xl text-black" />
              <span>Basic Information</span>
            </h3>
            <div className="mb-3 grid lg:grid-cols-2 md:grid-cols-1 gap-4">
              <div>
                <label className="block text-gray-600 mb-1 text-base font-medium">
                  Name
                  {!permission.name && !initial ? (
                    <sup className="text-red-500">*</sup>
                  ) : null}
                </label>
                <input
                  type="text"
                  name="name"
                  value={permission.name}
                  onChange={handlePermissionChange}
                  onBlur={() => setTouched((prev) => ({ ...prev, name: true }))}
                  className={`w-full bg-gray-50 border rounded-lg px-3 py-2 text-gray-800 ${!permission.name && !initial && (touched.name || validateOnSave) ? "border-red-500" : "border-gray-200"}`}
                  required
                />
              </div>
              <div>
                <label className="block text-gray-600 mb-1 text-base font-medium">
                  Description
                </label>
                <input
                  type="text"
                  name="description"
                  value={permission.description}
                  onChange={handlePermissionChange}
                  onBlur={() =>
                    setTouched((prev) => ({ ...prev, description: true }))
                  }
                  className="w-full bg-gray-50 border rounded-lg px-3 py-2 text-gray-800 border-gray-200"
                  required
                />
              </div>
            </div>
          </div>
          <div className="col-span-2 mb-2">
            <h3 className="flex items-center gap-2 font-semibold text-lg mb-2 text-black">
              <HiOutlineKey className="inline-block text-xl text-black" />
              <span>Permissions</span>
            </h3>
            <div className="bg-white rounded-xl overflow-x-auto border border-gray-200 px-3">
              <table className="min-w-full text-center text-base align-middle">
                <thead>
                  <tr>
                    <th className="text-left">Module</th>
                    <th>Check All</th>
                    <th>View</th>
                    <th>Create</th>
                    <th>Update</th>
                    <th>Delete</th>
                  </tr>
                </thead>
                <tbody>
                  {permissionTable.map((row) => (
                    <tr key={row.label} className="border-t border-gray-200">
                      <td className="text-left">{row.label}</td>
                      <td>
                        <input
                          className="w-5 h-5 mt-2 cursor-pointer accent-[#1e3a5f]"
                          type="checkbox"
                          checked={row.actions.every((a) =>
                            permission.permissions?.includes(a),
                          )}
                          onChange={(e) => {
                            updatePermissionsState((set) => {
                              if (e.target.checked) {
                                row.actions.forEach((a) => set.add(a));
                              } else {
                                row.actions.forEach((a) => set.delete(a));
                              }
                              return set;
                            });
                          }}
                        />
                      </td>
                      {["view", "create", "update", "delete"].map((action) => {
                        const actionKey = row.actions.find((a) =>
                          a.startsWith(action),
                        );
                        return (
                          <td className="text-center" key={action}>
                            {actionKey ? (
                              <input
                                className="w-5 h-5 mt-2 cursor-pointer accent-[#1e3a5f]"
                                type="checkbox"
                                value={actionKey}
                                checked={
                                  permission.permissions?.includes(actionKey) ||
                                  false
                                }
                                onChange={handlePermissionChange}
                              />
                            ) : null}
                          </td>
                        );
                      })}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </form>
        <div className="col-span-2 w-full flex items-center justify-end gap-3 mt-4">
          <button
            type="button"
            className="bg-gray-100 hover:bg-gray-200 text-[#1e3a5f] px-6 py-2 rounded-xl focus:outline-none border border-gray-200 flex items-center gap-2 cursor-pointer"
            onClick={onClose}
          >
            <HiXCircle className="inline-block text-xl" /> Cancel
          </button>
          <button
            type="button"
            className="bg-[#1e3a5f] hover:bg-[#16375b] text-white px-6 py-2 rounded-xl focus:outline-none flex items-center gap-2 cursor-pointer"
            onClick={() => {
              setValidateOnSave(true);
              setTouched({
                name: true,
              });
              onSave(permission);
            }}
          >
            <HiOutlineDocumentText className="inline-block text-xl" />
            {initial ? "Update Permission" : "Add Permission"}
          </button>
        </div>
      </div>
    </div>
  );
};

export default PermissionModal;
