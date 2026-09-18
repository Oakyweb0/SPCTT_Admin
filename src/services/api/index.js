export { default as apiClient } from './axios';
export { default as authApi } from './authApi';
export { default as userApi } from './userApi';
export { default as dashboardApi } from './dashboardApi';
export { default as registrationApi } from './registrationApi';
export { default as paymentApi } from './paymentApi';
export { default as abstractApi } from './abstractApi';
export { default as adminApi } from './adminApi';

// Re-export storage helpers for convenience
export {
  getUserAuth,
  saveUserAuth,
  clearUserAuth,
  getStoredAuth,
  saveAuthSession,
  clearAuthSession,
  getToken,
  setToken,
  removeToken,
} from '../../utils/storage';

import apiClient from './axios';
import authApi from './authApi';
import userApi from './userApi';
import dashboardApi from './dashboardApi';
import registrationApi from './registrationApi';
import paymentApi from './paymentApi';
import abstractApi from './abstractApi';
import adminApi from './adminApi';
import {
  getUserAuth,
  saveUserAuth,
  clearUserAuth,
  getStoredAuth,
  saveAuthSession,
  clearAuthSession,
  getToken,
  setToken,
  removeToken,
} from '../../utils/storage';

export default {
  apiClient,
  authApi,
  userApi,
  dashboardApi,
  registrationApi,
  paymentApi,
  abstractApi,
  adminApi,
  getUserAuth,
  saveUserAuth,
  clearUserAuth,
  getStoredAuth,
  saveAuthSession,
  clearAuthSession,
  getToken,
  setToken,
  removeToken,
};
