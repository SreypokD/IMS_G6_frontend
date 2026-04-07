import axios from "axios";

// NOTE
// _t = access_token
// _r = refresh_token
// _u = user info

// Base API URL from environment variables
const API_BASE = import.meta.env.VITE_API_BASE_URL;

// Create axios instance with base URL and auth header
const api = axios.create({
  baseURL: API_BASE,
});

// Request interceptor to add auth token
api.interceptors.request.use((config) => {
  const access_token = localStorage.getItem("_t");
  if (access_token) {
    config.headers.Authorization = `Bearer ${access_token}`;
  }
  return config;
});

// Response interceptor for auto-refresh and auto logout
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;
    if (
      error.response &&
      error.response.status === 401 &&
      !originalRequest._retry &&
      localStorage.getItem("_r")
    ) {
      originalRequest._retry = true;
      try {
        const refresh_token = localStorage.getItem("_r");
        const res = await api.post("/auth/refresh", { refresh_token });
        if (res.data && res.data.success && res.data.data.access_token) {
          localStorage.setItem("_t", res.data.data.access_token);
          originalRequest.headers["Authorization"] =
            `Bearer ${res.data.data.access_token}`;
          return api(originalRequest);
        }
      } catch (err) {
        // Refresh failed, auto logout
        localStorage.removeItem("_t");
        localStorage.removeItem("_r");
        localStorage.removeItem("_u");
        window.location.href = "/login";
        return Promise.reject(err);
      }
    }
    return Promise.reject(error);
  },
);

const profile = "/auth/profile";
const products = "/products";
const categories = "/categories";
const suppliers = "/suppliers";
const stocks = "/stocks";
const orderRequests = "/order-requests";
const approveRequests = "/approve-requests";
const sales = "/sales";
const inventorySummary = "/reports/inventory-summary";
const orderStats = "/reports/order-stats";
const activityLogs = "/reports/activity-logs";
const trends = "/reports/trends";
const permissions = "/permissions";
const users = "/users";

// Notifications
const notifications = "/notifications";
export const getNotifications = () => api.get(notifications);
export const markNotificationRead = (id) =>
  api.patch(`${notifications}/${id}/read`);
export const markAllNotificationsRead = () =>
  api.patch(`${notifications}/read-all`);
export const getUnreadNotificationCount = () =>
  api.get(`${notifications}/unread/count`);

// Get current user profile
export const getProfile = () => api.get(profile);

// Dashboard Report
export const getInventorySummary = () => api.get(inventorySummary);
export const getOrderStats = (params) => api.get(orderStats, { params });
export const getTrends = (params) => api.get(trends, { params });
export const getFinancialSummary = (params) =>
  api.get("/reports/financial-summary", { params });
export const getRecentOrders = () =>
  api.get(orderRequests, {
    params: { limit: 5, page: 1, sort: "createdAt:desc" },
  });
export const getRecentActivity = () =>
  api.get(activityLogs, { params: { limit: 5, page: 1 } });

// Product CRUD
export const getProducts = (params = {}) => api.get(products, { params });
export const createProduct = (data) => api.post(products, data);
export const updateProduct = (id, data) => api.patch(`${products}/${id}`, data);
export const deleteProduct = (id) => api.delete(`${products}/${id}`);

// Category CRUD
export const getCategories = (params = {}) => api.get(categories, { params });
export const createCategory = (data) => api.post(categories, data);
export const updateCategory = (id, data) =>
  api.patch(`${categories}/${id}`, data);
export const deleteCategory = (id) => api.delete(`${categories}/${id}`);

// Get Supplier
export const getSuppliers = (params = {}) => api.get(suppliers, { params });
export const createSupplier = (data) => api.post(suppliers, data);
export const updateSupplier = (id, data) =>
  api.patch(`${suppliers}/${id}`, data);
export const deleteSupplier = (id) => api.delete(`${suppliers}/${id}`);

// Order request CRUD for current user
export const getOrderRequests = (params) => api.get(orderRequests, { params });
export const createOrderRequest = (data) => api.post(orderRequests, data);
export const updateOrderRequest = (id, data) =>
  api.patch(`${orderRequests}/${id}`, data);
export const deleteOrderRequest = (id) => api.delete(`${orderRequests}/${id}`);
export const cancelOrderRequest = (id) =>
  api.patch(`${orderRequests}/${id}/status`, { status: "cancelled" });

// Get count of order requests needing approval (pending or rejected)
export const getPendingOrderRequestCount = () =>
  api.get(`${orderRequests}/pending/count`);

// Approve order requests
export const getApproveRequests = (params) =>
  api.get(approveRequests, { params });
export const updateApproveRequests = (id, data) =>
  api.patch(`${approveRequests}/${id}`, data);
export const deleteApproveRequest = (id) =>
  api.delete(`${approveRequests}/${id}`);

// Confirm delivery (via Order Requests)
// getConfirmDeliveries is replaced by getOrderRequests with status filtering in the component
export const confirmDeliveryAction = (id) =>
  api.post(`${orderRequests}/${id}/confirm`);

// Sales
export const getSales = (params = {}) => api.get(sales, { params });
export const createSale = (data) => api.post(sales, data);
export const updateSale = (id, data) => api.patch(`/sales/${id}`, data);
export const deleteSale = (id) => api.delete(`/sales/${id}`);
export const getSalesSummary = () => api.get("/sales/summary");

// Stocks
export const getStocks = (params = {}) => api.get(stocks, { params });
export const getStockSummary = (params = {}) =>
  api.get(`${stocks}/summary`, { params });
export const createStock = (data) => api.post(stocks, data);
export const updateStock = (id, data) => api.put(`${stocks}/${id}`, data);
export const deleteStock = (id) => api.delete(`${stocks}/${id}`);

// Activity Logs
export const getActivityLogs = (params = {}) =>
  api.get(activityLogs, { params });

// Permission CRUD
export const getPermissions = (params = {}) => api.get(permissions, { params });
export const createPermission = (data) => api.post(permissions, data);
export const updatePermission = (id, data) =>
  api.patch(`${permissions}/${id}`, data);
export const deletePermission = (id) => api.delete(`${permissions}/${id}`);

// User CRUD
export const getUsers = (params = {}) => api.get(users, { params });
export const getUser = (id) => api.get(`${users}/${id}`);
export const createUser = (data) => api.post(users, data);
export const updateUser = (id, data) => api.patch(`${users}/${id}`, data);
export const deleteUser = (id) => api.delete(`${users}/${id}`);
export const updateSelfProfile = (data) => api.put("/users/profile", data);
export const resetUserPassword = (id, password) =>
  api.patch(`/users/${id}/reset-password`, { password });

// Expense CRUD
const expenses = "/expenses";
export const getExpenses = (params = {}) => api.get(expenses, { params });
export const createExpense = (data) => api.post(expenses, data);
export const updateExpense = (id, data) => api.patch(`${expenses}/${id}`, data);
export const deleteExpense = (id) => api.delete(`${expenses}/${id}`);

// Upload File
export const uploadFile = (file) => {
  const formData = new FormData();
  formData.append("file", file);
  return api.post("/upload", formData, {
    headers: { "Content-Type": "multipart/form-data" },
  });
};
export default api;
