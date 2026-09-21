/**
 * Centralized API Endpoints Configuration
 */

export const API_ENDPOINTS = {
  // Authentication
  AUTH: {
    USER_REGISTER: '/auth/register',
    USER_LOGIN: '/auth/login',
    ADMIN_LOGIN: '/auth/admin/login',
    LOGOUT: '/auth/logout',
    VERIFY_TOKEN: '/auth/verify',
    FORGOT_PASSWORD: '/auth/forgot-password',
    VERIFY_RESET_TOKEN: '/auth/verify-reset-token',
    RESET_PASSWORD: '/auth/reset-password',
  },

  // User Profile
  USER: {
    PROFILE: '/user/profile',
    UPDATE_PROFILE: '/user/profile',
  },

  // Dashboard
  DASHBOARD: {
    ADMIN_STATS: '/admin/dashboard-stats',
    USER_STATS: '/user/dashboard-stats',
  },

  // Registration & Wizard
  REGISTRATION: {
    CATEGORIES: '/registration/categories',
    CURRENT: '/registration/current',
    STEP1_CATEGORY: '/registration/step1-category',
    STEP2_ATTENDEE: '/registration/step2-attendee',
    STEP3_ACCOMPANYING: '/registration/step3-accompanying',
    STEP4_BILLING: '/registration/step4-billing',
    PAYMENT: '/registration/payment',
    INVOICES: '/registration/invoices',
    INVOICE_BY_ID: (id) => `/registration/invoices/${id}`,
  },

  // Payment & Transactions
  PAYMENT: {
    CREATE_ORDER: '/payment/create-order',
    PROCESS: '/payment/process',
    VERIFY: '/payment/verify',
    STATUS: '/payment/status',
    HISTORY: '/payment/history',
    DETAILS: (registrationId) => `/payment/details/${registrationId}`,
  },

  // Abstracts
  ABSTRACTS: {
    SUBMIT: '/abstracts',
    MY_ABSTRACTS: '/abstracts/my',
    BY_ID: (id) => `/abstracts/${id}`,
    DELETE: (id) => `/abstracts/${id}`,
  },

  // Admin Operations
  ADMIN: {
    STATS: '/admin/dashboard-stats',
    REGISTRATIONS: '/admin/registrations',
    UPDATE_REGISTRATION_STATUS: (id) => `/admin/registrations/${id}/status`,
    ABSTRACTS: '/admin/abstracts',
    UPDATE_ABSTRACT_STATUS: (id) => `/admin/abstracts/${id}/status`,
    DELETE_ABSTRACT: (id) => `/admin/abstracts/${id}`,
    INVOICES: '/admin/invoices',
    USERS: '/admin/users',
    CREATE_USER: '/admin/users',
    USER_BY_ID: (id) => `/admin/users/${id}`,
    UPDATE_USER: (id) => `/admin/users/${id}`,
    DELETE_USER: (id) => `/admin/users/${id}`,
  },
};

export default API_ENDPOINTS;
