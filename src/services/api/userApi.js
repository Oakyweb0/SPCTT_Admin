import apiClient from './axios';
import { API_ENDPOINTS } from '../../constants/apiEndpoints';

export const userApi = {
  /**
   * Fetch current user profile
   */
  getProfile: () => {
    return apiClient.get(API_ENDPOINTS.USER.PROFILE);
  },

  /**
   * Update current user profile
   * @param {Object} profileData
   */
  updateProfile: (profileData) => {
    return apiClient.put(API_ENDPOINTS.USER.UPDATE_PROFILE, profileData);
  },

  /**
   * Change user password
   * @param {Object} passwordData - { currentPassword, newPassword }
   */
  changePassword: (passwordData) => {
    return apiClient.post(API_ENDPOINTS.USER.CHANGE_PASSWORD, passwordData);
  },

  /**
   * Delete authenticated user profile
   */
  deleteAccount: () => {
    return apiClient.delete(API_ENDPOINTS.USER.DELETE_ACCOUNT);
  },
};

export default userApi;
