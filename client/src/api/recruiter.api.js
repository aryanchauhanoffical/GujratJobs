import api from './axios';

export const recruiterAPI = {
  getProfile: async () => {
    const res = await api.get('/recruiter/profile');
    return res.data.data;
  },

  updateProfile: async (data) => {
    const res = await api.put('/recruiter/profile', data);
    return res.data.data;
  },

  uploadLogo: async (file) => {
    const formData = new FormData();
    formData.append('logo', file);
    const res = await api.post('/recruiter/logo', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    return res.data.data;
  },

  getDashboard: async () => {
    const res = await api.get('/recruiter/dashboard');
    return res.data.data;
  },

  getApplicants: async (params = {}) => {
    const res = await api.get('/recruiter/applicants', { params });
    return res.data.data;
  },

  markAsHired: async (applicationId) => {
    const res = await api.put(`/recruiter/applicants/${applicationId}/hire`);
    return res.data;
  },

  shortlist: async (applicationId) => {
    const res = await api.put(`/recruiter/applicants/${applicationId}/shortlist`);
    return res.data;
  },
};
