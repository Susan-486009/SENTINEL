/**
 * Sentinel API Service Layer
 * Base URL: http://localhost:5000/api/v1
 */

const BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api/v1';

const request = async (endpoint, options = {}) => {
  const token = localStorage.getItem('as_access_token');
  
  const headers = {
    ...(token && { Authorization: `Bearer ${token}` }),
    ...options.headers,
  };

  // Only set Content-Type to JSON if we aren't sending FormData
  if (!(options.body instanceof FormData)) {
    headers['Content-Type'] = 'application/json';
  }

  const config = {
    ...options,
    headers,
  };

  // Ensure BASE_URL doesn't end with a slash and endpoint starts with one
  const baseUrlClean = BASE_URL.replace(/\/$/, '');
  const endpointClean = endpoint.startsWith('/') ? endpoint : `/${endpoint}`;

  const response = await fetch(`${baseUrlClean}${endpointClean}`, config);
  
  if (!response.ok) {
    const error = await response.json().catch(() => ({ message: 'An unexpected error occurred' }));
    throw new Error(error.message || 'Request failed');
  }
  
  const result = await response.json();
  return result.data !== undefined ? result.data : result;
};

export const authService = {
  login:    (credentials) => request('/auth/login',    { method: 'POST', body: JSON.stringify(credentials) }),
  register: (userData)    => request('/auth/register', { method: 'POST', body: JSON.stringify(userData) }),
  me:       ()            => request('/auth/me'),
};

export const complaintService = {
  getAll:    ()      => request('/complaints'),
  getMine:   ()      => request('/complaints/mine'),
  getById:   (id)    => request(`/complaints/${id}`),
  track:     (refId) => request(`/complaints/track/${refId}`),
  submit:    (formData) => request('/complaints', { method: 'POST', body: formData }),
  updateStatus: (id, statusData) => request(`/complaints/${id}/status`, { method: 'PATCH', body: JSON.stringify(statusData) }),
  removeFile: (id, fileId) => request(`/complaints/${id}/files/${fileId}`, { method: 'DELETE' }),
};

export const aiService = {
  analyze: (text) => request('/ai/analyze', { method: 'POST', body: JSON.stringify({ text }) }),
  chat: (messages, signal) => request('/ai/chat', { method: 'POST', body: JSON.stringify({ messages }), signal }),
  getHistory: () => request('/ai/history'),
  saveHistory: (messageData) => request('/ai/history', { method: 'POST', body: JSON.stringify(messageData) }),
};

export const adminService = {
  getSuspicious: () => request('/complaints/admin/suspicious'),
};
