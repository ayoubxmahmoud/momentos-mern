import { createContext, useContext, useState, useEffect } from "react";
import { useNavigate } from "react-router";
import api from "../lib/axios";
import toast from "react-hot-toast";

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loadingAuth, setLoadingAuth] = useState(true);
  const navigate = useNavigate();

  // Load saved user from localStorage on initial render
  useEffect(() => {
    const storedUser = localStorage.getItem("momentos_user");
    const token = localStorage.getItem("momentos_token");

    if (storedUser && token) {
      setUser(JSON.parse(storedUser));
      api.defaults.headers.common["Authorization"] = `Bearer ${token}`;
    }
    setLoadingAuth(false);
  }, []);

  // Login helper (we will connect this to LoginPage next)
  const login = (userData, token) => {
    localStorage.setItem("momentos_user", JSON.stringify(userData));
    localStorage.setItem("momentos_token", token);
    api.defaults.headers.common["Authorization"] = `Bearer ${token}`;
    setUser(userData);
  };

  // Logout function
  const logout = () => {
    localStorage.removeItem("momentos_user");
    localStorage.removeItem("momentos_token");
    delete api.defaults.headers.common["Authorization"];
    setUser(null);
    toast.success("Logged out successfully");
    navigate("/login");
  };

  const updateUser = (updatedData) => {
    localStorage.setItem("momentos_user", JSON.stringify(updatedData));
    setUser(updatedData);
  };
  return (
    <AuthContext.Provider value={{ user, login, logout, loadingAuth, updateUser }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
