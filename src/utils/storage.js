/**
 * Local Storage Utilities for Tokens and Session Data
 */

export const STORAGE_KEYS = {
  TOKEN: 'spctt_token',
  USER_AUTH: 'spctt_user_auth',
  ADMIN_AUTH: 'spctt_admin_auth',
};

// Safe JSON parser helper
export const storage = {
  get: (key, defaultValue = null) => {
    try {
      const item = localStorage.getItem(key);
      return item ? JSON.parse(item) : defaultValue;
    } catch (err) {
      console.error(`Error reading key "${key}" from localStorage:`, err);
      return defaultValue;
    }
  },

  set: (key, value) => {
    try {
      localStorage.setItem(key, JSON.stringify(value));
    } catch (err) {
      console.error(`Error setting key "${key}" in localStorage:`, err);
    }
  },

  remove: (key) => {
    try {
      localStorage.removeItem(key);
    } catch (err) {
      console.error(`Error removing key "${key}" from localStorage:`, err);
    }
  },

  clear: () => {
    try {
      localStorage.clear();
    } catch (err) {
      console.error('Error clearing localStorage:', err);
    }
  },
};

/**
 * Get active JWT token (checks admin first, then user, then generic token)
 */
export const getToken = () => {
  const adminAuth = getStoredAuth();
  const userAuth = getUserAuth();
  return adminAuth?.token || userAuth?.token || storage.get(STORAGE_KEYS.TOKEN);
};

export const setToken = (token) => {
  storage.set(STORAGE_KEYS.TOKEN, token);
};

export const removeToken = () => {
  storage.remove(STORAGE_KEYS.TOKEN);
};

// User Auth Session Helpers
export const getUserAuth = () => {
  return storage.get(STORAGE_KEYS.USER_AUTH);
};

export const saveUserAuth = (payload) => {
  storage.set(STORAGE_KEYS.USER_AUTH, payload);
};

export const clearUserAuth = () => {
  storage.remove(STORAGE_KEYS.USER_AUTH);
};

// Admin Auth Session Helpers
export const getStoredAuth = () => {
  return storage.get(STORAGE_KEYS.ADMIN_AUTH);
};

export const saveAuthSession = (authPayload) => {
  storage.set(STORAGE_KEYS.ADMIN_AUTH, authPayload);
};

export const clearAuthSession = () => {
  storage.remove(STORAGE_KEYS.ADMIN_AUTH);
};

export default storage;
