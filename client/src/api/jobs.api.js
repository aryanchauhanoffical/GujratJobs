import api from './axios';

export const jobsAPI = {
  getAll: async (params = {}) => {
    const res = await api.get('/jobs', { params });
    return res.data.data;
  },

  getById: async (id) => {
    const res = await api.get(`/jobs/${id}`);
    return res.data.data;
  },

  create: async (data) => {
    const res = await api.post('/jobs', data);
    return res.data.data;
  },

  update: async (id, data) => {
    const res = await api.put(`/jobs/${id}`, data);
    return res.data.data;
  },

  delete: async (id) => {
    const res = await api.delete(`/jobs/${id}`);
    return res.data;
  },

  close: async (id) => {
    const res = await api.patch(`/jobs/${id}/close`);
    return res.data;
  },

  getMyJobs: async (params = {}) => {
    const res = await api.get('/jobs/my-jobs', { params });
    return res.data.data;
  },

  getWalkIns: async (params = {}) => {
    const res = await api.get('/jobs/walk-ins', { params });
    return res.data.data;
  },
};
