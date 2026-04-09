import axios from 'axios';

const BASE_URL = import.meta.env.VITE_API_URL;

// Safety check — fail loudly at startup if env var is missing
if (!BASE_URL) {
  console.error(
    '[axios] VITE_API_URL is not defined. ' +
    'Set it in Netlify → Site configuration → Environment variables, ' +
    'then trigger a new deploy.'
  );
}

const instance = axios.create({
  baseURL: BASE_URL || 'http://localhost:5000/api',
  timeout: 15000,
});

instance.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

instance.interceptors.response.use(
  (response) => response,
  (error) => {
    // Only redirect to /login on 401 if we are NOT already on /login
    // and NOT on /register — this prevents the infinite redirect loop
    if (error.response?.status === 401) {
      const currentPath = window.location.pathname;
      if (currentPath !== '/login' && currentPath !== '/register') {
        localStorage.removeItem('token');
        window.location.href = '/login';
      }
    }
    return Promise.reject(error);
  }
);

export default instance;