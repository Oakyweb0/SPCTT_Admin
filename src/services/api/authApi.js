import apiClient from './axios';
import { API_ENDPOINTS } from '../../constants/apiEndpoints';

export const authApi = {
  /**
   * User Registration
   * @param {Object} userData - { name, email, password, affiliation, country, phone, etc. }
   */
  userRegister: (userData) => {
    return apiClient.post(API_ENDPOINTS.AUTH.USER_REGISTER, userData);
  },

  /**
   * User Login
   * @param {Object} credentials - { email, password }
   */
  userLogin: (credentials) => {
    return apiClient.post(API_ENDPOINTS.AUTH.USER_LOGIN, credentials);
  },

  /**
   * Admin Login
   * @param {Object} credentials - { email, password }
   */
  adminLogin: (credentials) => {
    return apiClient.post(API_ENDPOINTS.AUTH.ADMIN_LOGIN, credentials);
  },

  /**
   * Logout (if backend supports token invalidation)
   */
  logout: () => {
    return apiClient.post(API_ENDPOINTS.AUTH.LOGOUT);
  },

  /**
   * Verify Active Token / Session
   */
  verifyToken: () => {
    return apiClient.get(API_ENDPOINTS.AUTH.VERIFY_TOKEN);
  },

  /**
   * Request Password Reset Token (Forgot Password)
   * @param {string} email
   */
  forgotPassword: (email) => {
    return apiClient.post(API_ENDPOINTS.AUTH.FORGOT_PASSWORD, { email });
  },

  /**
   * Verify Password Reset Token
   * @param {string} token
   */
  verifyResetToken: (token) => {
    return apiClient.post(API_ENDPOINTS.AUTH.VERIFY_RESET_TOKEN, { token });
  },

  /**
   * Reset Password
   * @param {Object} payload - { token, newPassword, confirmPassword }
   */
  resetPassword: (payload) => {
    return apiClient.post(API_ENDPOINTS.AUTH.RESET_PASSWORD, payload);
  },

  /**
   * Change Password (for logged in user)
   * @param {Object} data - { currentPassword, newPassword, confirmPassword }
   */
  changePassword: (data) => {
    return apiClient.post(API_ENDPOINTS.AUTH.CHANGE_PASSWORD, data);
  },
};

export default authApi;
