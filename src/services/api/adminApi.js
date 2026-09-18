import apiClient from './axios';
import { API_ENDPOINTS } from '../../constants/apiEndpoints';
import { buildQueryString } from '../../utils/helpers';

export const adminApi = {
  /**
   * 1. Dashboard Statistics
   */
  getDashboardStats: () => {
    return apiClient.get(API_ENDPOINTS.ADMIN.STATS);
  },

  /**
   * 2. Registrations Management
   * @param {Object} params - Query params e.g. { status, search, page, limit }
   */
  getRegistrations: (params = {}) => {
    const query = buildQueryString(params);
    return apiClient.get(`${API_ENDPOINTS.ADMIN.REGISTRATIONS}${query}`);
  },

  updateRegistrationStatus: (id, statusData) => {
    return apiClient.put(API_ENDPOINTS.ADMIN.UPDATE_REGISTRATION_STATUS(id), statusData);
  },

  /**
   * 3. Abstracts Management
   */
  getAbstracts: () => {
    return apiClient.get(API_ENDPOINTS.ADMIN.ABSTRACTS);
  },

  updateAbstractStatus: (id, statusData) => {
    return apiClient.put(API_ENDPOINTS.ADMIN.UPDATE_ABSTRACT_STATUS(id), statusData);
  },

  /**
   * 4. Invoices Management
   */
  getInvoices: () => {
    return apiClient.get(API_ENDPOINTS.ADMIN.INVOICES);
  },

  /**
   * 5. Users Management
   */
  getUsers: () => {
    return apiClient.get(API_ENDPOINTS.ADMIN.USERS);
  },
};

export default adminApi;
