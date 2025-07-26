import React, { createContext, useState, useContext, useEffect } from "react";
import authService from "../services/auth.service";

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [token, setToken] = useState(localStorage.getItem("token") || null);

  useEffect(() => {
    const initAuth = () => {
      const user = authService.getCurrentUser();
      const storedToken = localStorage.getItem("token");
      if (user && storedToken) {
        setUser(user);
        setToken(storedToken);
      }
      setLoading(false);
    };

    initAuth();
  }, []);

  const handleGoogleLogin = async (response) => {
    try {
      setLoading(true);
      // Handle both direct token and credential object cases
      const idToken =
        typeof response === "string" ? response : response.credential;

      // Send the ID token to your backend
      const result = await authService.googleLogin(idToken);
      console.log("Backend response:", result);

      // Store user data and JWT token
      const userData = {
        id: result.user.id,
        name: result.user.name,
        email: result.user.email,
        imageUrl: result.user.imageUrl,
      };
      setUser(userData);
      setToken(result.token);
      localStorage.setItem("user", JSON.stringify(userData));
      localStorage.setItem("token", result.token);

      // Show success message
      alert(
        `Successfully authenticated!\nWelcome ${userData.name}\nEmail: ${userData.email}`
      );

      return result;
    } catch (error) {
      console.error("Google login failed:", error);
      const errorMessage = error.response?.data?.message || error.message;
      alert("Authentication failed: " + errorMessage);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const handleLocalLogin = async (email, password) => {
    try {
      setLoading(true);
      const result = await authService.login(email, password);

      // Store user data and JWT token
      const userData = {
        id: result.user.id,
        name: result.user.name,
        email: result.user.email,
      };
      setUser(userData);
      setToken(result.token);
      localStorage.setItem("user", JSON.stringify(userData));
      localStorage.setItem("token", result.token);

      return result;
    } catch (error) {
      console.error("Local login failed:", error);
      const errorMessage = error.response?.data?.message || error.message;
      throw new Error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const handleLocalRegister = async (name, email, password) => {
    try {
      setLoading(true);
      const result = await authService.register(name, email, password);

      // Store user data and JWT token
      const userData = {
        id: result.user.id,
        name: result.user.name,
        email: result.user.email,
      };
      setUser(userData);
      setToken(result.token);
      localStorage.setItem("user", JSON.stringify(userData));
      localStorage.setItem("token", result.token);

      return result;
    } catch (error) {
      console.error("Local registration failed:", error);
      const errorMessage = error.response?.data?.message || error.message;
      throw new Error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const logout = async () => {
    try {
      // With JWT token auth, we don't need to call the server for logout
      // Just remove the token from localStorage
      localStorage.removeItem("user");
      localStorage.removeItem("token");

      // Add navigation to redirect user after logout
      window.location.href = "/"; // Redirects to home page
    } catch (error) {
      throw error;
    }
  };

  const value = {
    user,
    token,
    loading,
    handleGoogleLogin,
    handleLocalLogin,
    handleLocalRegister,
    logout,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};

export default AuthContext;
