import axios from 'axios';
import { getToken, clearAuthSession, clearUserAuth } from '../../utils/storage';

const API_BASE_URL = import.meta.env.VITE_API_URL || (import.meta.env.DEV ? 'http://localhost:5000/api' : 'https://api.spctt.org/api');

/**
 * Custom Axios Instance
 */
const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 30000,
});

/**
 * Request Interceptor - Attach Auth Bearer Token
 */
apiClient.interceptors.request.use(
  (config) => {
    const token = getToken();
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

/**
 * Response Interceptor - Uniform data unwrapping & error handling
 */
apiClient.interceptors.response.use(
  (response) => {
    // Return response payload directly
    return response.data;
  },
  (error) => {
    if (error.response) {
      const { status, data } = error.response;

      // Handle Unauthorized (401)
      if (status === 401) {
        console.warn('Session expired or unauthorized request. Clearing session.');
        // Optionally notify or clear session if not on login page
        // clearAuthSession();
        // clearUserAuth();
      }

      const customError = new Error(data?.message || `Request failed with status ${status}`);
      customError.status = status;
      customError.data = data;
      return Promise.reject(customError);
    } else if (error.request) {
      const networkError = new Error('Network error. Unable to connect to server. Please check your connection or backend server.');
      networkError.status = 0;
      return Promise.reject(networkError);
    } else {
      return Promise.reject(error);
    }
  }
);

export default apiClient;
