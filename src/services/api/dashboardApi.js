import apiClient from './axios';
import { API_ENDPOINTS } from '../../constants/apiEndpoints';

export const dashboardApi = {
  /**
   * Get Admin Dashboard Statistics & Overview
   */
  getAdminStats: () => {
    return apiClient.get(API_ENDPOINTS.DASHBOARD.ADMIN_STATS);
  },

  /**
   * Get User Dashboard Overview & summary stats
   */
  getUserStats: () => {
    return apiClient.get(API_ENDPOINTS.DASHBOARD.USER_STATS);
  },
};

export default dashboardApi;
