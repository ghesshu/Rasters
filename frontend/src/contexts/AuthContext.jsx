import React, { createContext, useState, useContext, useEffect } from "react";
import authService from "../services/auth.service";
import { useAccount, useSignMessage } from "wagmi";

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [token, setToken] = useState(localStorage.getItem("token") || null);
  
  const { address, isConnected } = useAccount();
  const { signMessageAsync } = useSignMessage();

  // Check token validity
  const isTokenValid = (token) => {
    if (!token) return false;
    
    try {
      const payload = JSON.parse(atob(token.split('.')[1]));
      const currentTime = Date.now() / 1000;
      return payload.exp > currentTime;
    } catch (error) {
      return false;
    }
  };

  // Initialize auth state
  useEffect(() => {
    const initAuth = () => {
      const user = authService.getCurrentUser();
      const storedToken = localStorage.getItem("token");
      
      if (user && storedToken && isTokenValid(storedToken)) {
        setUser(user);
        setToken(storedToken);
      } else {
        localStorage.removeItem("user");
        localStorage.removeItem("token");
        setUser(null);
        setToken(null);
      }
      setLoading(false);
    };

    initAuth();
  }, []);

  // Handle wallet authentication
  const handleWalletAuth = async (walletType = 'metamask', userName) => {
    try {
      setLoading(true);
      
      if (!address || !isConnected) {
        throw new Error('Wallet not connected');
      }

      // Get nonce from backend
      const { message } = await authService.getNonce(address);
      
      // Sign the message
      const signature = await signMessageAsync({ message });
      
      // Authenticate with backend
      const result = await authService.walletAuth(
        address,
        signature,
        message,
        walletType,
        userName
      );

      // Store user data and JWT token
      const userData = {
        id: result.user.id,
        name: result.user.name,
        email: result.user.email,
        walletAddress: result.user.walletAddress,
        walletType: result.user.walletType,
      };
      
      setUser(userData);
      setToken(result.token);
      localStorage.setItem("user", JSON.stringify(userData));
      localStorage.setItem("token", result.token);

      return result;
    } catch (error) {
      console.error("Wallet authentication failed:", error);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const logout = async () => {
    try {
      await authService.logout();
      setUser(null);
      setToken(null);
      localStorage.removeItem("user");
      localStorage.removeItem("token");
    } catch (error) {
      console.error('Logout error:', error);
      throw error;
    }
  };

  const value = {
    user,
    token,
    loading,
    handleWalletAuth,
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
