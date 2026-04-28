import api from './axios';

export const authAPI = {
  register: async (data) => {
    const res = await api.post('/auth/register', data);
    return res.data.data;
  },

  login: async (data) => {
    const res = await api.post('/auth/login', data);
    return res.data.data;
  },

  logout: async () => {
    const res = await api.post('/auth/logout');
    return res.data;
  },

  getMe: async () => {
    const res = await api.get('/auth/me');
    return res.data.data;
  },

  forgotPassword: async (email) => {
    const res = await api.post('/auth/forgot-password', { email });
    return res.data;
  },

  resetPassword: async (token, password) => {
    const res = await api.post(`/auth/reset-password/${token}`, { password });
    return res.data.data;
  },

  updatePassword: async (data) => {
    const res = await api.put('/auth/update-password', data);
    return res.data.data;
  },

  verifyEmail: async (token) => {
    const res = await api.get(`/auth/verify-email/${token}`);
    return res.data;
  },
};
