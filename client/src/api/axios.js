import { safeStorage } from "../utils/storage";
import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || '/api';

const axiosInstance = axios.create({
  baseURL: API_URL,
  withCredentials: true,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 15000,
});

// Request interceptor
axiosInstance.interceptors.request.use(
  (config) => {
    const token = safeStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor
axiosInstance.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;

      try {
        const storedToken = safeStorage.getItem('token');
        const response = await axiosInstance.post('/auth/refresh-token', {
          refreshToken: storedToken,
        });
        const { token } = response.data.data;

        safeStorage.setItem('token', token);
        axiosInstance.defaults.headers.common.Authorization = `Bearer ${token}`;
        originalRequest.headers.Authorization = `Bearer ${token}`;

        return axiosInstance(originalRequest);
      } catch (refreshError) {
        safeStorage.removeItem('token');
        window.location.href = '/#/login';
        return Promise.reject(refreshError);
      }
    }

    return Promise.reject(error);
  }
);

// Helper to set auth token
export const setAuthToken = (token) => {
  if (token) {
    axiosInstance.defaults.headers.common.Authorization = `Bearer ${token}`;
  } else {
    delete axiosInstance.defaults.headers.common.Authorization;
  }
};

export default axiosInstance;
