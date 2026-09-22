import apiClient from './axios';
import { API_ENDPOINTS } from '../../constants/apiEndpoints';
import { buildQueryString } from '../../utils/helpers';

/**
 * Helper to trigger browser download of a blob file (e.g. Excel spreadsheet)
 */
export const downloadBlobFile = (blobData, defaultFilename = 'export.xlsx') => {
  const blob = blobData instanceof Blob 
    ? blobData 
    : new Blob([blobData], { 
        type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' 
      });
  const url = window.URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.setAttribute('download', defaultFilename);
  document.body.appendChild(link);
  link.click();
  link.remove();
  window.URL.revokeObjectURL(url);
};

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

  exportRegistrations: async (params = {}) => {
    const query = buildQueryString(params);
    const response = await apiClient.get(`${API_ENDPOINTS.ADMIN.EXPORT_REGISTRATIONS}${query}`, {
      responseType: 'blob'
    });
    return response;
  },

  updateRegistrationStatus: (id, statusData) => {
    return apiClient.put(API_ENDPOINTS.ADMIN.UPDATE_REGISTRATION_STATUS(id), statusData);
  },

  /**
   * 3. Abstracts Management
   */
  getAbstracts: (params = {}) => {
    const query = buildQueryString(params);
    return apiClient.get(`${API_ENDPOINTS.ADMIN.ABSTRACTS}${query}`);
  },

  exportAbstracts: async (params = {}) => {
    const query = buildQueryString(params);
    const response = await apiClient.get(`${API_ENDPOINTS.ADMIN.EXPORT_ABSTRACTS}${query}`, {
      responseType: 'blob'
    });
    return response;
  },

  updateAbstractStatus: (id, statusData) => {
    return apiClient.put(API_ENDPOINTS.ADMIN.UPDATE_ABSTRACT_STATUS(id), statusData);
  },

  sendAbstractEmail: (id, emailData = {}) => {
    return apiClient.post(API_ENDPOINTS.ADMIN.SEND_ABSTRACT_EMAIL(id), emailData);
  },

  getAbstractEmailLogs: (id) => {
    return apiClient.get(API_ENDPOINTS.ADMIN.GET_ABSTRACT_EMAIL_LOGS(id));
  },

  deleteAbstract: (id) => {
    return apiClient.delete(API_ENDPOINTS.ADMIN.DELETE_ABSTRACT(id));
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
  getUsers: (params = {}) => {
    const query = buildQueryString(params);
    return apiClient.get(`${API_ENDPOINTS.ADMIN.USERS}${query}`);
  },

  exportUsers: async (params = {}) => {
    const query = buildQueryString(params);
    const response = await apiClient.get(`${API_ENDPOINTS.ADMIN.EXPORT_USERS}${query}`, {
      responseType: 'blob'
    });
    return response;
  },

  createUser: (userData) => {
    return apiClient.post(API_ENDPOINTS.ADMIN.USERS, userData);
  },

  getUserById: (id) => {
    return apiClient.get(API_ENDPOINTS.ADMIN.USER_BY_ID(id));
  },

  updateUser: (id, userData) => {
    return apiClient.put(API_ENDPOINTS.ADMIN.UPDATE_USER(id), userData);
  },

  /**
   * Delete User by ID
   * @param {number|string} id
   */
  deleteUser: (id) => {
    return apiClient.delete(API_ENDPOINTS.ADMIN.DELETE_USER(id));
  },
};

export default adminApi;
