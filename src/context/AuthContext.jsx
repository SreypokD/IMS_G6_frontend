import React, { useState, useEffect } from "react";
import { AuthContext } from "./AuthContextBase";
import { logoutApi, getProfile } from "../api/index";

export const AuthProvider = ({ children }) => {
  // Initialize user state from localStorage
  const [user, setUser] = useState(() => {
    const stored = localStorage.getItem("_u");
    return stored ? JSON.parse(stored) : null;
  });

  // Fetch profile from backend and update user state
  const fetchProfile = async () => {
    try {
      const res = await getProfile();
      if (res.data && res.data.success && res.data.data) {
        setUser(res.data.data);
        localStorage.setItem("_u", JSON.stringify(res.data.data));
      }
    } catch (err) {
      // Only logout if error is 401 Unauthorized
      if (err?.response?.status === 401) {
        setUser(null);
        localStorage.removeItem("_u");
      } else {
        // Optionally, you can log the error or show a notification
        console.error("Profile fetch error", err);
      }
    }
  };

  // Accepts optional callback to run after user is set
  const login = (userObj, cb) => {
    setUser(userObj);
    if (cb) cb();
    // Always fetch latest profile after login
    fetchProfile();
  };

  // Logout function
  const logout = async () => {
    try {
      await logoutApi();
    } catch (err) {
      console.error("Logout API error", err);
    }

    // Clear all local/session storage for auth
    setUser(null);
    localStorage.removeItem("_t");
    localStorage.removeItem("_r");
    localStorage.removeItem("_u");
    sessionStorage.clear();
  };

  useEffect(() => {
    const token = localStorage.getItem("_t");
    if (token) {
      Promise.resolve().then(() => {
        fetchProfile();
      });
    }
  }, []);

  return (
    <AuthContext.Provider value={{ user, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};
