import axios from 'axios';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;

const api = axios.create({
  baseURL: API,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Tools API
export const toolsApi = {
  getAll: () => api.get('/tools'),
  get: (id) => api.get(`/tools/${id}`),
  create: (data) => api.post('/tools', data),
  update: (id, data) => api.put(`/tools/${id}`, data),
  delete: (id) => api.delete(`/tools/${id}`),
};

// Founders API
export const foundersApi = {
  getAll: (toolId) => api.get('/founders', { params: { tool_id: toolId } }),
  get: (id) => api.get(`/founders/${id}`),
  create: (data) => api.post('/founders', data),
  update: (id, data) => api.put(`/founders/${id}`, data),
  delete: (id) => api.delete(`/founders/${id}`),
};

// Profiles API
export const profilesApi = {
  getAll: () => api.get('/profiles'),
  get: (id) => api.get(`/profiles/${id}`),
  create: (data) => api.post('/profiles', data),
  update: (id, data) => api.put(`/profiles/${id}`, data),
  delete: (id) => api.delete(`/profiles/${id}`),
};

// Templates API
export const templatesApi = {
  getAll: () => api.get('/templates'),
  get: (id) => api.get(`/templates/${id}`),
  create: (data) => api.post('/templates', data),
  update: (id, data) => api.put(`/templates/${id}`, data),
  delete: (id) => api.delete(`/templates/${id}`),
};

// Outreach API
export const outreachApi = {
  getAll: (filters = {}) => api.get('/outreach', { params: filters }),
  generate: (data) => api.post('/outreach/generate', data),
  update: (id, data) => api.put(`/outreach/${id}`, data),
  delete: (id) => api.delete(`/outreach/${id}`),
};

// Stats API
export const statsApi = {
  get: () => api.get('/stats'),
};

export default api;
