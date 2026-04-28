import { safeStorage } from "../utils/storage";
import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { authAPI } from '../api/auth.api';
import { setAuthToken } from '../api/axios';
import toast from 'react-hot-toast';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(() => safeStorage.getItem('token'));
  const [isLoading, setIsLoading] = useState(true);

  // Initialize auth on mount
  useEffect(() => {
    const initAuth = async () => {
      const storedToken = safeStorage.getItem('token');
      if (storedToken) {
        setAuthToken(storedToken);
        try {
          const data = await authAPI.getMe();
          setUser(data.user);
        } catch (error) {
          // Token invalid, clear it
          safeStorage.removeItem('token');
          setToken(null);
          setAuthToken(null);
        }
      }
      setIsLoading(false);
    };

    initAuth();
  }, []);

  const login = useCallback(async (email, password) => {
    try {
      const data = await authAPI.login({ email, password });
      const { user: userData, token: accessToken } = data;

      setUser(userData);
      setToken(accessToken);
      safeStorage.setItem('token', accessToken);
      setAuthToken(accessToken);

      toast.success(`Welcome back, ${userData.name}!`);
      return { success: true, user: userData };
    } catch (error) {
      const message = error.response?.data?.message || 'Login failed';
      const errorCode = error.response?.data?.error || 'Unknown Error';
      // Only show toast for unexpected errors; specific UI states handle known ones
      if (errorCode !== 'Account Not Found' && errorCode !== 'Wrong Password') {
        toast.error(message);
      }
      return { success: false, error: message, errorCode };
    }
  }, []);

  const register = useCallback(async (formData) => {
    try {
      const data = await authAPI.register(formData);
      const { user: userData, token: accessToken } = data;

      setUser(userData);
      setToken(accessToken);
      safeStorage.setItem('token', accessToken);
      setAuthToken(accessToken);

      toast.success('Account created! Please verify your email.');
      return { success: true, user: userData };
    } catch (error) {
      const message = error.response?.data?.message || 'Registration failed';
      toast.error(message);
      return { success: false, error: message };
    }
  }, []);

  const logout = useCallback(async () => {
    try {
      await authAPI.logout();
    } catch (error) {
      // Ignore errors on logout
    } finally {
      setUser(null);
      setToken(null);
      safeStorage.removeItem('token');
      setAuthToken(null);
      toast.success('Logged out successfully');
    }
  }, []);

  const updateUser = useCallback((updatedUser) => {
    setUser((prev) => ({ ...prev, ...updatedUser }));
  }, []);

  const value = {
    user,
    token,
    isLoading,
    isAuthenticated: !!user,
    login,
    register,
    logout,
    updateUser,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export default AuthContext;
