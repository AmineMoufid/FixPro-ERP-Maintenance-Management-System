import axios from 'axios';

const API_BASE_URL = '/api';

const axiosInstance = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

axiosInstance.interceptors.request.use(
  (config) => {
    if (import.meta.env.DEV) {
      console.debug('axios request', config.method, config.url, config.baseURL, config.params, config.data);
    }
    const token = localStorage.getItem('token');
    if (token) {
      const normalized = token.startsWith('Bearer ') || token.startsWith('bearer ') ? token : `Bearer ${token}`;
      if (import.meta.env.DEV) console.debug('axios auth header set to', normalized);
      config.headers.Authorization = normalized;
    } else {
      if (import.meta.env.DEV) console.debug('no token found in localStorage');
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

axiosInstance.interceptors.response.use(
  (response) => {
    if (import.meta.env.DEV) console.debug('axios response', response.config.url, response.status, response.data);
    return response;
  },
  (error) => {
    if (import.meta.env.DEV) {
      console.error('axios error', error.response?.status, error.response?.data);
      console.debug('error config headers:', error.config?.headers);
      console.debug('error response headers:', error.response?.headers);
    }
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      localStorage.removeItem('role');
      window.location.href = '/';
    }
    return Promise.reject(error);
  }
);

export default axiosInstance;
