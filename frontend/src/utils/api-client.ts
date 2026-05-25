/**
 * API client utilities and interceptors
 */

import axios, { AxiosInstance, AxiosError, AxiosResponse } from 'axios';

const API_BASE_URL = process.env.REACT_APP_API_URL || '/api/v1';

// Create axios instance with default config
const axiosInstance: AxiosInstance = axios.create({
  baseURL: API_BASE_URL,
  timeout: 30000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Response interceptor for error handling
axiosInstance.interceptors.response.use(
  (response: AxiosResponse) => response,
  (error: AxiosError) => {
    if (error.response?.status === 401) {
      // Handle unauthorized
      console.error('Unauthorized request');
    }
    return Promise.reject(error);
  }
);

export default axiosInstance;
