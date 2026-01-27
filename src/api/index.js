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

// Logout API
export const logoutApi = () => api.post("/auth/logout");

// Get current user profile
export const getProfile = () => api.get("/auth/profile");

// Product CRUD
export const getSuppliers = (params = {}) => api.get("/suppliers", { params });
export const getProducts = (params = {}) => api.get("/products", { params });
export const createProduct = (data) => api.post("/products", data);
export const updateProduct = (id, data) => api.put(`/products/${id}`, data);
export const deleteProduct = (id) => api.delete(`/products/${id}`);
export const createOrderRequest = (data) => api.post("/orderRequests", data);

// User CRUD
export const getUsers = (params = {}) => api.get("/users", { params });
export const createUser = (data) => api.post("/users", data);
export const updateUser = (id, data) => api.put(`/users/${id}`, data);
export const deleteUser = (id) => api.delete(`/users/${id}`);

// Dashboard Reporting
export const getInventorySummary = () => api.get("/reporting/inventory-summary");
export const getOrderStats = (params) => api.get("/reporting/order-stats", { params });

export default api;
