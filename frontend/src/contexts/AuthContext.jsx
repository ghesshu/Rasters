import React, { createContext, useState, useContext, useEffect } from "react";
import authService from "../services/auth.service";
import { useAccount, useSignMessage } from "wagmi";

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(null);
  const [loading, setLoading] = useState(true);

  const { address, isConnected } = useAccount();
  const { signMessageAsync } = useSignMessage();

  useEffect(() => {
    const initAuth = async () => {
      try {
        const storedToken = localStorage.getItem("token");
        const storedUser = localStorage.getItem("user");

        if (storedToken && storedUser) {
          setToken(storedToken);
          setUser(JSON.parse(storedUser));
        }
      } catch (error) {
        console.error("Error initializing auth:", error);
        // Clear invalid stored data
        localStorage.removeItem("token");
        localStorage.removeItem("user");
        setUser(null);
        setToken(null);
      }
      setLoading(false);
    };

    initAuth();
  }, []);

  // Handle wallet authentication
  const handleWalletAuth = async (walletType = 'phantom', userName) => {
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

      // Store in localStorage
      localStorage.setItem("token", result.token);
      localStorage.setItem("user", JSON.stringify(userData));

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
      setLoading(true);
      
      // Clear local storage
      localStorage.removeItem("token");
      localStorage.removeItem("user");
      
      // Clear state
      setUser(null);
      setToken(null);
    } catch (error) {
      console.error("Logout error:", error);
    } finally {
      setLoading(false);
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
