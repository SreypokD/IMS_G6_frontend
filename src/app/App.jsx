import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { Navigate } from "react-router-dom";
import Sidebar from "./Sidebar.jsx";
import Navbar from "./Navbar.jsx";
import { useState, useEffect } from "react";

import Login from "../pages/Login.jsx";
import Reports from "../pages/Reports.jsx";
import Products from "../pages/Products.jsx";
import Suppliers from "../pages/Suppliers.jsx";
import Dashboard from "../pages/Dashboard.jsx";
import { useAuth } from "../context/useAuth.js";
import Categories from "../pages/Categories.jsx";
import Stocks from "../pages/Stocks.jsx";
import Breadcrumb from "../components/Breadcrumb.jsx";
import OrderRequests from "../pages/OrderRequests.jsx";
import OrderHistory from "../pages/OrderHistory.jsx";
import ApproveRequests from "../pages/ApproveRequests.jsx";
import ConfirmDelivery from "../pages/ConfirmDelivery.jsx";
import Sales from "../pages/Sales.jsx";
import ActivityLog from "../pages/ActivityLog.jsx";
import Permissions from "../pages/Permissions.jsx";
import Users from "../pages/Users.jsx";

// A wrapper for private routes that checks authentication
function PrivateRoute({ children }) {
  const { user } = useAuth();
  const hasToken = !!localStorage.getItem("_t");
  return user && hasToken ? children : <Navigate to="/login" replace />;
}

function App() {
  const [sidebarHidden, setSidebarHidden] = useState(false);

  // Auto-hide sidebar if screen size <= 1440px
  useEffect(() => {
    function handleResize() {
      if (window.innerWidth <= 1440) {
        setSidebarHidden(true);
      } else {
        setSidebarHidden(false);
      }
    }
    handleResize();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  return (
    <Router>
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route
          path="*"
          element={
            <PrivateRoute>
              <div className="h-screen flex overflow-hidden bg-[#fafbfc]">
                <Sidebar mini={sidebarHidden} />
                <div className="flex-1 flex flex-col min-w-0">
                  <Navbar onBellClick={() => setSidebarHidden((v) => !v)} />
                  <main className="flex-1 p-3 overflow-y-auto min-h-0">
                    <Breadcrumb />
                    <Routes>
                      {[
                        // Dashboard
                        { path: "/", element: <Dashboard /> },

                        // Master Data
                        { path: "/categories", element: <Categories /> },
                        { path: "/products", element: <Products /> },
                        { path: "/suppliers", element: <Suppliers /> },

                        // Purchasing / Procurement
                        { path: "/order-requests", element: <OrderRequests /> },
                        {
                          path: "/approve-requests",
                          element: <ApproveRequests />,
                        },
                        {
                          path: "/confirm-delivery",
                          element: <ConfirmDelivery />,
                        },
                        { path: "/order-history", element: <OrderHistory /> },

                        // Inventory / Stock
                        { path: "/stocks", element: <Stocks /> },

                        // Sales
                        { path: "/sales", element: <Sales /> },

                        // Reports & Logs
                        { path: "/reports", element: <Reports /> },
                        { path: "/activity-log", element: <ActivityLog /> },

                        // System / Security
                        { path: "/users", element: <Users /> },
                        { path: "/permissions", element: <Permissions /> },
                      ].map((route) => (
                        <Route
                          key={route.path}
                          path={route.path}
                          element={route.element}
                        />
                      ))}
                    </Routes>
                  </main>
                </div>
              </div>
            </PrivateRoute>
          }
        />
      </Routes>
    </Router>
  );
}

export default App;
