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
};

export default userApi;
