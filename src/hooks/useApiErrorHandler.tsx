/**
 * src/hooks/useApiErrorHandler.tsx
 * @description Custom hook for handling API errors with automatic auth error detection and logout
 */

import { useAuth } from '../context/AuthContext';

/**
 * @description Hook that provides error handling utilities for API calls, with automatic auth error detection
 * @returns Object containing error handler function
 */
export const useApiErrorHandler = () => {
  const { handleAuthErrorAndSignOut } = useAuth();

  /**
   * @description Handles API errors and automatically logs out user if auth-related errors are detected
   * @async
   * @param {any} error - The error object from an API call
   * @param {string} [context] - Optional context for logging
   * @returns {Promise<boolean>} Returns true if it was an auth error and logout was triggered
   * @sideEffects May trigger logout if auth error is detected
   */
  const handleApiError = async (error: any, context?: string): Promise<boolean> => {
    // Enhanced auth error detection
    const isAuthError =
      error?.status === 401 ||
      error?.status === 403 ||
      error?.code === 'PGRST301' ||
      error?.code === 'PGRST116' || // Row not found - could indicate auth issues
      error?.message?.includes('JWT') ||
      error?.message?.includes('session') ||
      error?.message?.includes('unauthorized') ||
      error?.message?.includes('not authenticated') ||
      error?.message?.includes('invalid_grant') || // OAuth specific
      error?.message?.includes('token_expired') || // OAuth specific
      error?.message?.includes('access_denied'); // OAuth specific

    // Special handling for Twitter-specific errors
    const isTwitterAuthError =
      error?.message?.includes('twitter') ||
      error?.message?.includes('oauth') ||
      (error?.details && typeof error.details === 'string' && error.details.includes('provider'));

    if (isAuthError || isTwitterAuthError) {
      console.warn(`🚨 Auth error detected${context ? ` in ${context}` : ''}:`, {
        error,
        isTwitterSpecific: isTwitterAuthError,
        errorCode: error?.code,
        errorStatus: error?.status,
        errorMessage: error?.message
      });

      // For Twitter-specific errors, add additional logging
      if (isTwitterAuthError) {
        console.warn('🐦 Twitter OAuth error detected, this might be a token refresh issue');
      }

      await handleAuthErrorAndSignOut();
      return true;
    }

    // Check for network errors that might indicate connectivity issues
    const isNetworkError =
      error?.message?.includes('fetch') ||
      error?.message?.includes('network') ||
      error?.message?.includes('timeout') ||
      error?.code === 'NETWORK_ERROR';

    if (isNetworkError) {
      console.warn(`🌐 Network error detected${context ? ` in ${context}` : ''}:`, error);
      // Don't trigger logout for network errors
      return false;
    }

    return false;
  };

  /**
   * @description Enhanced error handler specifically for auth-critical operations
   * @async
   * @param {any} error - The error object from an API call
   * @param {string} [context] - Optional context for logging
   * @returns {Promise<boolean>} Returns true if it was handled
   */
  const handleCriticalApiError = async (error: any, context?: string): Promise<boolean> => {
    // For critical operations, be more aggressive about session validation
    if (error?.status === 403 || error?.code === 'PGRST301') {
      console.error(`🚨 Critical auth error detected${context ? ` in ${context}` : ''}:`, error);

      // Immediate logout for critical auth failures
      await handleAuthErrorAndSignOut();
      return true;
    }

    return handleApiError(error, context);
  };

  return {
    handleApiError,
    handleCriticalApiError
  };
};