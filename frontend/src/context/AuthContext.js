import React, { createContext, useState, useEffect, useContext } from "react";
import axios from "axios";

const AuthContext = createContext();

const API_URL = process.env.REACT_APP_API_URL || "http://localhost:5000";

export const AuthProvider = ({ children }) => {

  const [user, setUser] = useState(null);
  const [token, setToken] = useState(localStorage.getItem("token"));
  const [loading, setLoading] = useState(true);

  useEffect(() => {

    const loadUser = () => {

      if (token) {

        axios.defaults.headers.common["Authorization"] = `Bearer ${token}`;

        try {

          // Decode JWT locally
          const decoded = JSON.parse(atob(token.split(".")[1]));

          // Check if token has expired
          if (decoded.exp && decoded.exp * 1000 < Date.now()) {
            localStorage.removeItem("token");
            setToken(null);
            setUser(null);
            delete axios.defaults.headers.common["Authorization"];
            
            // Redirect with expired parameter if client-side router is active
            if (window.location.pathname !== "/login") {
              window.location.href = "/login?expired=true";
            }
          } else {
            // Set JWT-decoded user first for instant render
            setUser(decoded.user);

            // Then fetch fresh profile from server to get latest avatar, bio, etc.
            axios.get(`${API_URL}/api/user/profile`)
              .then((res) => {
                setUser(res.data);
              })
              .catch(() => {
                // Keep the JWT-decoded user if server fetch fails
              });
          }

        } catch (error) {

          localStorage.removeItem("token");
          setToken(null);
          setUser(null);

          delete axios.defaults.headers.common["Authorization"];
        }
      }

      setLoading(false);
    };

    loadUser();

  }, [token]);

  const login = (newToken) => {

    localStorage.setItem("token", newToken);
    setToken(newToken);

    axios.defaults.headers.common["Authorization"] = `Bearer ${newToken}`;

    // Instantly set user from JWT so UI shows immediately
    const decoded = JSON.parse(atob(newToken.split(".")[1]));
    setUser(decoded.user);

    // Then fetch fresh profile from DB (includes latest profileImage)
    axios.get(`${API_URL}/api/user/profile`, {
      headers: { Authorization: `Bearer ${newToken}` }
    })
      .then((res) => {
        setUser(res.data);
      })
      .catch(() => {
        // Keep JWT-decoded user if profile fetch fails
      });
  };

  const logout = () => {

    localStorage.removeItem("token");
    setToken(null);
    setUser(null);

    delete axios.defaults.headers.common["Authorization"];
  };

  const refreshUser = async () => {
    if (!token) return;
    try {
      const res = await axios.get(`${API_URL}/api/user/profile`);
      setUser(res.data);
    } catch (err) {
      // Clean error catch without console log in prod
    }
  };

  /**
   * updateAvatar — fast path for immediate avatar sync after upload.
   * Updates only the profileImage field so every consumer re-renders
   * without triggering a full server round-trip.
   * @param {string} avatarUrl - The new profile image URL
   */
  const updateAvatar = (avatarUrl) => {
    setUser((prev) => prev ? { ...prev, profileImage: avatarUrl } : prev);
  };

  return (
    <AuthContext.Provider value={{ user, token, loading, login, logout, refreshUser, updateAvatar }}>
      {children}
    </AuthContext.Provider>
  );

};

export const useAuth = () => useContext(AuthContext);