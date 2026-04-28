import api from './axios';

export const applicationsAPI = {
  apply: async (jobId, data = {}) => {
    const res = await api.post(`/applications/job/${jobId}`, data);
    return res.data.data;
  },

  getMyApplications: async (params = {}) => {
    const res = await api.get('/applications/my', { params });
    return res.data.data;
  },

  getJobApplications: async (jobId, params = {}) => {
    const res = await api.get(`/applications/job/${jobId}`, { params });
    return res.data.data;
  },

  updateStatus: async (id, data) => {
    const res = await api.put(`/applications/${id}/status`, data);
    return res.data.data;
  },

  withdraw: async (id) => {
    const res = await api.delete(`/applications/${id}/withdraw`);
    return res.data;
  },
};
