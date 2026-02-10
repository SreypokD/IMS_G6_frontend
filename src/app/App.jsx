import React, { useState, useEffect, Suspense, lazy } from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { Navigate } from "react-router-dom";
import Sidebar from "./Sidebar.jsx";
import Navbar from "./Navbar.jsx";
import Loading from "../components/Loading.jsx";
import { useAuth } from "../contexts/auth/useAuth.js";
import { DialogProvider } from "../contexts/dialog/DialogContext.jsx";
import Breadcrumb from "../components/Breadcrumb.jsx";

// Lazy-loaded components
const Login = lazy(() => import("../pages/Login.jsx"));
const ForgotPassword = lazy(() => import("../pages/ForgotPassword.jsx"));
const Register = lazy(() => import("../pages/Register.jsx"));
const Reports = lazy(() => import("../pages/Reports.jsx"));
const Products = lazy(() => import("../pages/Products.jsx"));
const Suppliers = lazy(() => import("../pages/Suppliers.jsx"));
const Dashboard = lazy(() => import("../pages/Dashboard.jsx"));
const Categories = lazy(() => import("../pages/Categories.jsx"));
const Stocks = lazy(() => import("../pages/Stocks.jsx"));
const OrderRequests = lazy(() => import("../pages/OrderRequests.jsx"));
const OrderHistory = lazy(() => import("../pages/OrderHistory.jsx"));
const ApproveRequests = lazy(() => import("../pages/ApproveRequests.jsx"));
const ConfirmDelivery = lazy(() => import("../pages/ConfirmDelivery.jsx"));
const Sales = lazy(() => import("../pages/Sales.jsx"));
const Expenses = lazy(() => import("../pages/Expenses.jsx"));
const ActivityLog = lazy(() => import("../pages/ActivityLog.jsx"));
const Permissions = lazy(() => import("../pages/Permissions.jsx"));
const Users = lazy(() => import("../pages/Users.jsx"));
const Settings = lazy(() => import("../pages/Settings.jsx"));

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
    <DialogProvider>
      <Router>
        <Suspense
          fallback={
            <div className="h-screen w-screen flex items-center justify-center">
              <Loading />
            </div>
          }
        >
          <Routes>
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route path="/forgot-password" element={<ForgotPassword />} />
            <Route
              path="*"
              element={
                <PrivateRoute>
                  <div className="h-screen flex overflow-hidden bg-[#f9fafb]">
                    <Sidebar mini={sidebarHidden} />
                    <div className="flex-1 flex flex-col min-w-0">
                      <Navbar onBellClick={() => setSidebarHidden((v) => !v)} />
                      <main className="flex-1 p-3 overflow-y-auto min-h-0">
                        <Breadcrumb />
                        <Suspense
                          fallback={
                            <div className="h-full w-full flex items-center justify-center">
                              <Loading />
                            </div>
                          }
                        >
                          <Routes>
                            {[
                              // Dashboard
                              { path: "/", element: <Dashboard /> },

                              // Master Data
                              { path: "/categories", element: <Categories /> },
                              { path: "/products", element: <Products /> },
                              { path: "/suppliers", element: <Suppliers /> },

                              // Purchasing / Procurement
                              {
                                path: "/order-requests",
                                element: <OrderRequests />,
                              },
                              {
                                path: "/approve-requests",
                                element: <ApproveRequests />,
                              },
                              {
                                path: "/confirm-delivery",
                                element: <ConfirmDelivery />,
                              },
                              {
                                path: "/order-history",
                                element: <OrderHistory />,
                              },

                              // Inventory / Stock
                              { path: "/stocks", element: <Stocks /> },

                              // Sales
                              { path: "/sales", element: <Sales /> },
                              { path: "/expenses", element: <Expenses /> },

                              // Reports & Logs
                              { path: "/reports", element: <Reports /> },
                              {
                                path: "/activity-logs",
                                element: <ActivityLog />,
                              },

                              // System / Security
                              { path: "/users", element: <Users /> },
                              {
                                path: "/permissions",
                                element: <Permissions />,
                              },
                              { path: "/settings", element: <Settings /> },
                            ].map((route) => (
                              <Route
                                key={route.path}
                                path={route.path}
                                element={route.element}
                              />
                            ))}
                          </Routes>
                        </Suspense>
                      </main>
                    </div>
                  </div>
                </PrivateRoute>
              }
            />
          </Routes>
        </Suspense>
      </Router>
    </DialogProvider>
  );
}

export default App;
