import apiClient from './axios';
import { API_ENDPOINTS } from '../../constants/apiEndpoints';

export const abstractApi = {
  /**
   * Submit a new abstract
   * @param {Object} abstractData
   */
  submitAbstract: (abstractData) => {
    return apiClient.post(API_ENDPOINTS.ABSTRACTS.SUBMIT, abstractData);
  },

  /**
   * Get list of abstracts submitted by current user
   */
  getMyAbstracts: () => {
    return apiClient.get(API_ENDPOINTS.ABSTRACTS.MY_ABSTRACTS);
  },

  /**
   * Get single abstract details by ID
   * @param {string|number} id
   */
  getAbstractById: (id) => {
    return apiClient.get(API_ENDPOINTS.ABSTRACTS.BY_ID(id));
  },
};

export default abstractApi;
