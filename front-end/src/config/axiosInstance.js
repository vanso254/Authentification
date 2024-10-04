// axiosInstance.js
import axios from 'axios';
import jwt_decode from 'jwt-decode';
import { logout } from './authContext';

const axiosInstance = axios.create();

axiosInstance.interceptors.request.use((config) => {
  const token = localStorage.getItem('accessToken');
  if (token) {
    const decoded = jwt_decode(token);
    const currentTime = Date.now() / 1000;
    if (decoded.exp < currentTime) {
      logout(); // Call logout if token expired
      window.location.href = '/login'; // Redirect to login page
    } else {
      config.headers['Authorization'] = `Bearer ${token}`;
    }
  }
  return config;
});

export default axiosInstance;
