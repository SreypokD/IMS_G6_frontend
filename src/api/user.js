// src/api/user.js
import api from "./index";

export const getUserById = (id) => api.get(`/users/${id}`);
