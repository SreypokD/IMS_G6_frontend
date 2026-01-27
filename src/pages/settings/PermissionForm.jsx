import React, { useState } from "react";

const groups = [
  {
    key: "dashboard",
    label: "Dashboard",
    items: [{ key: "view_dashboard", label: "Dashboard" }],
    actions: ["view_dashboard"],
  },
  {
    key: "products",
    label: "Products",
    items: [{ key: "products", label: "Products" }],
    actions: [
      "view_product",
      "create_product",
      "update_product",
      "delete_product",
    ],
  },
  {
    key: "categories",
    label: "Categories",
    items: [{ key: "categories", label: "Categories" }],
    actions: [
      "view_category",
      "create_category",
      "update_category",
      "delete_category",
    ],
  },
  {
    key: "suppliers",
    label: "Suppliers",
    items: [{ key: "suppliers", label: "Suppliers" }],
    actions: [
      "view_supplier",
      "create_supplier",
      "update_supplier",
      "delete_supplier",
    ],
  },
  {
    key: "order_requests",
    label: "Order Requests",
    items: [{ key: "order_requests", label: "Order Requests" }],
    actions: [
      "view_order_request",
      "create_order_request",
      "update_order_request",
      "delete_order_request",
      "post_order_request",
    ],
  },
  {
    key: "reports",
    label: "Reports",
    items: [{ key: "reports", label: "Reports" }],
    actions: ["view_report"],
  },
  {
    key: "permissions",
    label: "Permissions",
    items: [{ key: "permissions", label: "Permissions" }],
    actions: [
      "view_permission",
      "create_permission",
      "update_permission",
      "delete_permission",
    ],
  },
  {
    key: "users",
    label: "Users",
    items: [{ key: "users", label: "Users" }],
    actions: ["view_user", "create_user", "update_user", "delete_user"],
  },
];

const actionLabels = {
  view: "View",
  create: "Create",
  update: "Update",
  delete: "Delete",
  post: "Post",
};

export default function PermissionForm() {
  const [selected, setSelected] = useState({});
  const [groupId, setGroupId] = useState("");
  const [groupDesc, setGroupDesc] = useState("");

  // Toggle permission for a specific item/action
  const handleChange = (itemKey, actionKey) => {
    setSelected((prev) => {
      const itemPerms = prev[itemKey] || [];
      return {
        ...prev,
        [itemKey]: itemPerms.includes(actionKey)
          ? itemPerms.filter((a) => a !== actionKey)
          : [...itemPerms, actionKey],
      };
    });
  };

  // Check all actions for a group
  const handleCheckAll = (groupKey, checked) => {
    const group = groups.find((g) => g.key === groupKey);
    setSelected((prev) => {
      const updated = { ...prev };
      group.items.forEach((item) => {
        updated[item.key] = checked ? [...group.actions] : [];
      });
      return updated;
    });
  };

  // Check if all actions in group are selected
  const isAllChecked = (group) =>
    group.items.every((item) =>
      group.actions.every((action) => selected[item.key]?.includes(action)),
    );

  return (
    <div className="p-6">
      <h2 className="text-2xl font-bold mb-4 text-center">
        Create Permission Group
      </h2>
      <div className="mb-6 flex gap-4">
        <div className="flex-1">
          <label className="font-semibold text-lg">
            Group Id <span className="text-red-500">*</span>
          </label>
          <input
            className="border rounded px-3 py-2 w-full mt-1"
            value={groupId}
            onChange={(e) => setGroupId(e.target.value)}
            required
          />
        </div>
        <div className="flex-1">
          <label className="font-semibold text-lg">
            Group Description <span className="text-red-500">*</span>
          </label>
          <input
            className="border rounded px-3 py-2 w-full mt-1"
            value={groupDesc}
            onChange={(e) => setGroupDesc(e.target.value)}
            required
          />
        </div>
      </div>
      <table className="min-w-full border">
        <thead>
          <tr>
            <th className="border px-4 py-2">Section</th>
            <th className="border px-4 py-2">Item</th>
            <th className="border px-4 py-2">Check All</th>
            {Object.keys(actionLabels).map((action) => (
              <th key={action} className="border px-4 py-2">
                {actionLabels[action]}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {groups.map((group) => (
            <React.Fragment key={group.key}>
              {group.items.map((item, idx) => (
                <tr key={item.key}>
                  {idx === 0 && (
                    <td
                      className="border px-4 py-2 font-bold"
                      rowSpan={group.items.length}
                    >
                      {group.label}
                    </td>
                  )}
                  <td className="border px-4 py-2 font-semibold">
                    {item.label}
                  </td>
                  {idx === 0 && (
                    <td
                      className="border px-4 py-2 text-center"
                      rowSpan={group.items.length}
                    >
                      <input
                        type="checkbox"
                        checked={isAllChecked(group)}
                        onChange={(e) =>
                          handleCheckAll(group.key, e.target.checked)
                        }
                      />
                      <span className="ml-2">Check All</span>
                    </td>
                  )}
                  {Object.keys(actionLabels).map((action) => (
                    <td key={action} className="border px-4 py-2 text-center">
                      {group.actions.includes(action) ? (
                        <input
                          type="checkbox"
                          checked={
                            selected[item.key]?.includes(action) || false
                          }
                          onChange={() => handleChange(item.key, action)}
                        />
                      ) : null}
                    </td>
                  ))}
                </tr>
              ))}
            </React.Fragment>
          ))}
        </tbody>
      </table>
    </div>
  );
}

