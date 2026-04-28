import api from './axios';

export const userAPI = {
  getProfile: async () => {
    const res = await api.get('/users/profile');
    return res.data.data;
  },

  updateProfile: async (data) => {
    const res = await api.put('/users/profile', data);
    return res.data.data;
  },

  uploadResume: async (file) => {
    const formData = new FormData();
    formData.append('resume', file);
    const res = await api.post('/users/resume', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    return res.data.data;
  },

  uploadProfilePic: async (file) => {
    const formData = new FormData();
    formData.append('profilePic', file);
    const res = await api.post('/users/profile-pic', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    return res.data.data;
  },

  updateLocation: async (locationData) => {
    const res = await api.put('/users/location', locationData);
    return res.data.data;
  },

  getNotifications: async (params = {}) => {
    const res = await api.get('/notifications', { params });
    return res.data.data;
  },

  markNotificationRead: async (id) => {
    const res = await api.put(`/notifications/${id}/read`);
    return res.data.data;
  },

  markAllNotificationsRead: async () => {
    const res = await api.put('/notifications/mark-all-read');
    return res.data.data;
  },
};
