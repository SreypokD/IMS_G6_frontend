import axios from "axios";

const API_BASE = import.meta.env.VITE_API_BASE_URL;
const auth = "auth";

// Login API
export const login = (email, password) =>
  axios.post(`${API_BASE}/${auth}/login`, { email, password });

// Logout API
export const logout = () => axios.post(`${API_BASE}/${auth}/logout`);

// Register API
export const register = (email, password, role) =>
  axios.post(`${API_BASE}/${auth}/register`, { email, password, role });

// Refresh token API
export const refreshToken = (refresh_token) =>
  axios.post(`${API_BASE}/${auth}/refresh`, { refresh_token });
