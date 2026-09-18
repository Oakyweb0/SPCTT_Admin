import { useState, useEffect, useCallback } from 'react';
import { getErrorMessage } from '../utils/helpers';

/**
 * Custom hook for managing API calls, loading, and error states
 * 
 * @param {Function} apiFunc - Async function that performs the API call
 * @param {Object} options - Configuration options
 * @param {boolean} options.immediate - Whether to execute the API call immediately on mount (default: false)
 * @param {Array} options.params - Initial parameters for immediate execution
 * @param {any} options.initialData - Initial data state (default: null)
 * @param {Function} options.onSuccess - Callback on successful call
 * @param {Function} options.onError - Callback on error
 * 
 * @returns {Object} { data, loading, error, execute, reset, setData }
 */
export const useApi = (apiFunc, options = {}) => {
  const {
    immediate = false,
    params = [],
    initialData = null,
    onSuccess,
    onError,
  } = options;

  const [data, setData] = useState(initialData);
  const [loading, setLoading] = useState(immediate);
  const [error, setError] = useState(null);

  const execute = useCallback(
    async (...args) => {
      setLoading(true);
      setError(null);

      try {
        const result = await apiFunc(...args);
        setData(result);
        if (onSuccess) {
          onSuccess(result);
        }
        return { data: result, error: null };
      } catch (err) {
        const message = getErrorMessage(err);
        setError(message);
        if (onError) {
          onError(err, message);
        }
        return { data: null, error: message };
      } finally {
        setLoading(false);
      }
    },
    [apiFunc, onSuccess, onError]
  );

  const reset = useCallback(() => {
    setData(initialData);
    setLoading(false);
    setError(null);
  }, [initialData]);

  useEffect(() => {
    if (immediate) {
      execute(...params);
    }
  }, [immediate]);

  return {
    data,
    loading,
    error,
    execute,
    reset,
    setData,
  };
};

export default useApi;
