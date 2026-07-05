import React, { createContext, useState, useEffect } from 'react';
import api from '../services/api';

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(localStorage.getItem('token'));
  const [loading, setLoading] = useState(true);

  // Validate token and fetch current user profile on app load
  useEffect(() => {
    const loadUser = async () => {
      if (!token) {
        setUser(null);
        setLoading(false);
        return;
      }

      try {
        const response = await api.get('/auth/me');
        if (response.data.success) {
          setUser(response.data.data);
        } else {
          // Token is invalid, clear it
          logout();
        }
      } catch (err) {
        console.error('Failed to load user profile:', err.message);
        logout();
      } finally {
        setLoading(false);
      }
    };

    loadUser();
  }, [token]);

  // Login handler
  const login = async (email, password) => {
    try {
      const response = await api.post('/auth/login', { email, password });
      if (response.data.success) {
        const { user: userData, token: userToken } = response.data.data;
        localStorage.setItem('token', userToken);
        setToken(userToken);
        setUser(userData);
        return { success: true };
      }
      return { success: false, message: response.data.message || 'Login failed' };
    } catch (error) {
      const errMsg = error.response?.data?.message || 'Login failed. Please check credentials.';
      const errors = error.response?.data?.error || null;
      return { success: false, message: errMsg, errors };
    }
  };

  // Register handler
  const register = async (username, email, password) => {
    try {
      const response = await api.post('/auth/register', { username, email, password });
      if (response.data.success) {
        const { user: userData, token: userToken } = response.data.data;
        localStorage.setItem('token', userToken);
        setToken(userToken);
        setUser(userData);
        return { success: true };
      }
      return { success: false, message: response.data.message || 'Registration failed' };
    } catch (error) {
      const errMsg = error.response?.data?.message || 'Registration failed.';
      const errors = error.response?.data?.error || null;
      return { success: false, message: errMsg, errors };
    }
  };

  // Logout handler
  const logout = () => {
    localStorage.removeItem('token');
    setToken(null);
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, token, loading, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  );
};
