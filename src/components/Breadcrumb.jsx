import React from "react";
import { Link, useLocation } from "react-router-dom";
import { HiOutlineHome, HiChevronRight } from "react-icons/hi";

const routeName = (segment, segments, i) => {
  // Context-aware for forms
  if (segment === "new" || segment === "create") return "Create";
  if (segment === "edit" || segment === "update") return "Update";
  // If the previous segment is products/categories/suppliers and this is an id, show 'Update'
  if (
    i > 0 &&
    ["products", "categories", "suppliers"].includes(segments[i - 1]) &&
    /^\d+$/.test(segment)
  ) {
    return "Update";
  }
  switch (segment) {
    case "products":
      return "Products";
    case "categories":
      return "Categories";
    case "suppliers":
      return "Suppliers";
    case "stock":
      return "Stock Alerts";
    case "reports":
      return "Reports";
    case "order-requests":
      return "Order Requests";
    case "approve-requests":
      return "Approve Requests";
    case "confirm-delivery":
      return "Confirm Delivery";
    case "dashboard":
      return "Dashboard";
    default:
      return segment.charAt(0).toUpperCase() + segment.slice(1);
  }
};

const Breadcrumb = () => {
  const location = useLocation();
  const segments = location.pathname.split("/").filter(Boolean);
  return (
    <nav className="mb-4" aria-label="Breadcrumb">
      <ol className="flex items-center text-sm space-x-1">
        <li>
          <Link
            to="/"
            className="text-[#1e3a5f] hover:text-black flex items-center gap-1"
          >
            <HiOutlineHome className="text-lg" />
            <span>Home</span>
          </Link>
        </li>
        <HiChevronRight className="mx-2 text-lg text-[#1e3a5f]" />
        {segments.length === 0 ? (
          <span className="text-black">Dashboard</span>
        ) : (
          segments.map((seg, i) => {
            let path = "/" + segments.slice(0, i + 1).join("/");
            const isLast = i === segments.length - 1;
            return (
              <React.Fragment key={i}>
                {i !== 0 && (
                  <HiChevronRight className="mx-2 text-lg text-[#1e3a5f]" />
                )}
                {isLast ? (
                  <span className="text-black">
                    {routeName(seg, segments, i)}
                  </span>
                ) : (
                  <Link to={path} className="text-[#1e3a5f] hover:text-black">
                    {routeName(seg, segments, i)}
                  </Link>
                )}
              </React.Fragment>
            );
          })
        )}
      </ol>
    </nav>
  );
};

export default Breadcrumb;
