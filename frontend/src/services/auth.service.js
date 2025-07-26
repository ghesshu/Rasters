import axios from 'axios';

const API_URL = import.meta.env.VITE_SERVER_URL || 'http://localhost:3000';
const AUTH_API_URL = `${API_URL}/api/auth`;

class AuthService {
  async register(name, email, password) {
    try {
      const response = await axios.post(`${AUTH_API_URL}/register`, {
        name,
        email,
        password
      }, {
        withCredentials: true
      });
      return response.data;
    } catch (error) {
      throw error;
    }
  }

  async login(email, password) {
    try {
      const response = await axios.post(`${AUTH_API_URL}/login`, {
        email,
        password
      }, {
        withCredentials: true
      });
      return response.data;
    } catch (error) {
      throw error;
    }
  }

  async googleLogin(credential) {
    try {
      const response = await axios.post(`${AUTH_API_URL}/google`, { idToken: credential }, {
        withCredentials: true
      });
      return response.data;
    } catch (error) {
      throw error;
    }
  }

  async logout() {
    try {
      await axios.post(`${AUTH_API_URL}/logout`, {}, {
        withCredentials: true
      });
      localStorage.removeItem('user');
    } catch (error) {
      throw error;
    }
  }

  async refreshToken() {
    try {
      const response = await axios.post(`${AUTH_API_URL}/refresh-token`, {}, {
        withCredentials: true
      });
      return response.data;
    } catch (error) {
      throw error;
    }
  }

  getCurrentUser() {
    return JSON.parse(localStorage.getItem('user'));
  }
}

export default new AuthService(); 