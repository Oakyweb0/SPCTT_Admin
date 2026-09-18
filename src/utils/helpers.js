/**
 * General Utility Helpers
 */

/**
 * Extract clean error message from API response / Axios error
 * @param {Error|Object|string} error
 * @returns {string}
 */
export const getErrorMessage = (error) => {
  if (typeof error === 'string') return error;

  if (error?.response?.data?.message) {
    return error.response.data.message;
  }

  if (error?.response?.data?.error) {
    return error.response.data.error;
  }

  if (error?.message) {
    return error.message;
  }

  return 'An unexpected error occurred. Please try again.';
};

/**
 * Format query params object into a URL search string
 * @param {Object} params
 * @returns {string}
 */
export const buildQueryString = (params = {}) => {
  const query = new URLSearchParams();
  Object.entries(params).forEach(([key, value]) => {
    if (value !== undefined && value !== null && value !== '') {
      query.append(key, value);
    }
  });
  const queryString = query.toString();
  return queryString ? `?${queryString}` : '';
};

/**
 * Formats date into readable string
 * @param {string|Date} date
 * @returns {string}
 */
export const formatDate = (date) => {
  if (!date) return '-';
  const d = new Date(date);
  if (isNaN(d.getTime())) return String(date);
  return d.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });
};

/**
 * Currency formatter
 * @param {number|string} amount
 * @param {string} currency
 * @returns {string}
 */
export const formatCurrency = (amount, currency = 'USD') => {
  const num = Number(amount);
  if (isNaN(num)) return `${currency} 0.00`;
  return `${currency} ${num.toFixed(2)}`;
};
