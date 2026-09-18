import apiClient from './axios';
import { API_ENDPOINTS } from '../../constants/apiEndpoints';

export const paymentApi = {
  /**
   * Create / Initialize payment order
   */
  createOrder: (payload = {}) => {
    return apiClient.post(API_ENDPOINTS.PAYMENT.CREATE_ORDER, payload);
  },

  /**
   * Process and confirm payment
   */
  processPayment: (payload = {}) => {
    return apiClient.post(API_ENDPOINTS.PAYMENT.PROCESS, payload);
  },

  /**
   * Verify gateway transaction signature
   */
  verifyPayment: (payload = {}) => {
    return apiClient.post(API_ENDPOINTS.PAYMENT.VERIFY, payload);
  },

  /**
   * Get current user payment status
   */
  getStatus: () => {
    return apiClient.get(API_ENDPOINTS.PAYMENT.STATUS);
  },

  /**
   * Get payment & invoice history
   */
  getHistory: () => {
    return apiClient.get(API_ENDPOINTS.PAYMENT.HISTORY);
  },

  /**
   * Get registration payment breakdown details
   */
  getDetails: (registrationId) => {
    return apiClient.get(API_ENDPOINTS.PAYMENT.DETAILS(registrationId));
  }
};

export default paymentApi;
