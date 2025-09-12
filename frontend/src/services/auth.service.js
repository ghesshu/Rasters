import axios from "axios";

const API_URL = import.meta.env.VITE_SERVER_URL || "http://localhost:3000";
const AUTH_API_URL = `${API_URL}/api/auth`;

class AuthService {
  async getNonce(walletAddress) {
    try {
      const response = await axios.get(`${AUTH_API_URL}/nonce/${walletAddress}`);
      return response.data;
    } catch (error) {
      throw error;
    }
  }

  async walletAuth(walletAddress, signature, message, walletType, name) {
    try {
      const response = await axios.post(`${AUTH_API_URL}/wallet`, {
        walletAddress,
        signature,
        message,
        walletType,
        name
      });
      return response.data;
    } catch (error) {
      throw error;
    }
  }

  async logout() {
    try {
      await axios.post(`${AUTH_API_URL}/logout`, {});
      // Clear all authentication data
      localStorage.removeItem("user");
      localStorage.removeItem("token");
      // Optional: Clear any wallet connection state if needed
      // This depends on your wallet connector implementation
    } catch (error) {
      // Even if the server call fails, clear local storage
      localStorage.removeItem("user");
      localStorage.removeItem("token");
      throw error;
    }
  }

  getCurrentUser() {
    return JSON.parse(localStorage.getItem("user"));
  }
}

export default new AuthService();
