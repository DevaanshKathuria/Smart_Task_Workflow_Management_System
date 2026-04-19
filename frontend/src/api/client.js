import axios from 'axios';

// In production, VITE_API_URL is set to the Render backend URL
// In development, falls back to '/api' which is proxied by Vite to localhost:3001
const baseURL = import.meta.env.VITE_API_URL || '/api';

const api = axios.create({ baseURL });

// Attach JWT token to every request
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Handle 401 — clear auth and redirect to login
api.interceptors.response.use(
  (res) => res,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      window.location.href = '/';
    }
    return Promise.reject(error);
  }
);

export default api;
