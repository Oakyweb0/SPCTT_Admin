import apiClient from './axios';
import { API_ENDPOINTS } from '../../constants/apiEndpoints';

export const registrationApi = {
  /**
   * Get registration categories with pricing
   */
  getCategories: (params = {}) => {
    return apiClient.get(API_ENDPOINTS.REGISTRATION.CATEGORIES, { params });
  },

  /**
   * Get currently logged-in user's active registration
   */
  getCurrentRegistration: () => {
    return apiClient.get(API_ENDPOINTS.REGISTRATION.CURRENT);
  },

  /**
   * Step 1: Save Category & Delegate Type
   */
  saveStep1Category: (payload) => {
    return apiClient.post(API_ENDPOINTS.REGISTRATION.STEP1_CATEGORY, payload);
  },

  /**
   * Step 2: Save Attendee Details
   */
  saveStep2Attendee: (payload) => {
    return apiClient.post(API_ENDPOINTS.REGISTRATION.STEP2_ATTENDEE, payload);
  },

  /**
   * Step 3: Save Accompanying Persons
   */
  saveStep3Accompanying: (payload) => {
    return apiClient.post(API_ENDPOINTS.REGISTRATION.STEP3_ACCOMPANYING, payload);
  },

  /**
   * Step 4: Save Billing Information
   */
  saveStep4Billing: (payload) => {
    return apiClient.post(API_ENDPOINTS.REGISTRATION.STEP4_BILLING, payload);
  },

  /**
   * Process / Confirm Payment
   */
  makePayment: (payload) => {
    return apiClient.post(API_ENDPOINTS.REGISTRATION.PAYMENT, payload);
  },

  /**
   * Get invoices for current user
   */
  getInvoices: () => {
    return apiClient.get(API_ENDPOINTS.REGISTRATION.INVOICES);
  },

  /**
   * Get specific invoice by ID
   */
  getInvoiceById: (id) => {
    return apiClient.get(API_ENDPOINTS.REGISTRATION.INVOICE_BY_ID(id));
  },

  /**
   * Download Invoice / Receipt PDF
   */
  downloadInvoicePdf: async (id, filename = 'invoice.pdf') => {
    const response = await apiClient.get(API_ENDPOINTS.REGISTRATION.INVOICE_DOWNLOAD(id), {
      responseType: 'blob'
    });
    const blob = new Blob([response.data], { type: 'application/pdf' });
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', filename);
    document.body.appendChild(link);
    link.click();
    link.remove();
    window.URL.revokeObjectURL(url);
    return true;
  }
};

export default registrationApi;
