import React, { useState } from "react";
import { HiXCircle, HiOutlineDocumentText, HiOutlineKey } from "react-icons/hi";

const permissionTable = [
  {
    label: "Dashboard",
    actions: ["view_dashboard"],
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
    label: "Categories",
    actions: [
      "view_category",
      "create_category",
      "update_category",
      "delete_category",
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
  {
    label: "Stocks",
    actions: ["view_stock", "create_stock", "update_stock", "delete_stock"],
  },
  {
    label: "Reports",
    actions: ["view_report"],
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
  {
    label: "Users",
    actions: ["view_user", "create_user", "update_user", "delete_user"],
  },
];

const initialPermission = {
  name: "",
  description: "",
  permissions: [],
};

const PermissionModal = ({ open, onClose, onSave, initial }) => {
  const [permission, setEditPermission] = useState(
    initial || initialPermission,
  );
  const [touched, setTouched] = useState({});
  const [validateOnSave, setValidateOnSave] = useState(false);

  React.useEffect(() => {
    if (open && !initial) {
      setEditPermission(initialPermission);
      setTouched({});
      setValidateOnSave(false);
    } else if (open && initial) {
      setEditPermission(initial);
      setTouched({});
      setValidateOnSave(false);
    }
  }, [open, initial]);

  function handlePermissionChange(e) {
    const { name, value, checked } = e.target;
    if (name === "name" || name === "description") {
      setEditPermission((f) => ({ ...f, [name]: value }));
    } else {
      setEditPermission((f) => {
        const perms = new Set(f.permissions || []);
        if (checked) perms.add(value);
        else perms.delete(value);
        return { ...f, permissions: Array.from(perms) };
      });
    }
  }

  if (!open) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/5 backdrop-blur-sm">
      <div className="bg-white rounded-2xl p-5 w-full max-w-[40%] min-h-[60vh] max-h-[80vh] shadow-xl relative">
        <h2 className="text-2xl font-bold mb-6 text-center">
          {initial ? "Edit Permission" : "Add Permission"}
        </h2>
        <form className="space-y-5 overflow-auto max-h-[50vh] px-1">
          <div className="col-span-2 mb-2">
            <h3 className="flex items-center gap-2 font-semibold text-lg mb-2 text-black">
              <HiOutlineDocumentText className="inline-block text-xl text-black" />
              <span>Basic Info</span>
            </h3>
            <div className="mb-3 grid grid-cols-2 gap-4">
              <div>
                <label className="block text-gray-600 mb-1 text-sm font-medium">
                  Name{" "}
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
                <label className="block text-gray-600 mb-1 text-sm font-medium">
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
            <div className="bg-white rounded-xl overflow-x-auto border border-gray-200">
              <table className="min-w-full text-center text-sm align-middle">
                <thead>
                  <tr className="bg-white">
                    <th className="py-3 px-4 text-left">Module</th>
                    <th className="py-3 px-4">View</th>
                    <th className="py-3 px-4">Create</th>
                    <th className="py-3 px-4">Update</th>
                    <th className="py-3 px-4">Delete</th>
                  </tr>
                </thead>
                <tbody>
                  {permissionTable.map((row) => (
                    <tr key={row.label} className="border-t border-gray-200">
                      <td className="py-3 px-4 font-semibold text-left">
                        {row.label}
                      </td>
                      {["view", "create", "update", "delete"].map((action) => {
                        const actionKey = row.actions.find((a) =>
                          a.startsWith(action),
                        );
                        return (
                          <td className="py-3 px-4 text-center" key={action}>
                            {actionKey ? (
                              <input
                                className="w-4.5 h-4.5 cursor-pointer"
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
                name: true,
              });
              onSave(permission);
            }}
          >
            <HiOutlineDocumentText className="inline-block" />
            {initial ? "Update Permission" : "Add Permission"}
          </button>
        </div>
      </div>
    </div>
  );
};

export default PermissionModal;
