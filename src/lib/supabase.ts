/**
 * src/lib/supabase.ts
 * @description Initializes and exports the Supabase client for database interactions
 */

import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase environment variables');
}

// Global error handler for Supabase session issues
type AuthErrorHandler = () => Promise<void>;
let globalAuthErrorHandler: AuthErrorHandler | null = null;

/**
 * @description Registers a function to handle authentication errors
 * @param {AuthErrorHandler} handler - Function to call when an auth error is detected
 */
export const registerAuthErrorHandler = (handler: AuthErrorHandler): void => {
  globalAuthErrorHandler = handler;
};

// Custom fetch implementation to handle auth errors
const customFetch = async (url: RequestInfo | URL, options?: RequestInit): Promise<Response> => {
  const response = await fetch(url, options);
  
  // Check if the response is a 403 error
  if (response.status === 403) {
    try {
      // Clone the response to read its body
      const clonedResponse = response.clone();
      const body = await clonedResponse.text();
      
      // Parse the response body if it's JSON
      try {
        const parsedBody = JSON.parse(body);
        
        // Check if it's a session_not_found error
        if (parsedBody.code === 'session_not_found') {
          console.error('Session not found error detected');
          // Call the global error handler if registered
          if (globalAuthErrorHandler) {
            await globalAuthErrorHandler();
          }
        }
      } catch (e) {
        // Not JSON or other parsing error, continue with original response
      }
    } catch (e) {
      // Error reading body, continue with original response
    }
  }
  
  // Return the original response regardless
  return response;
};

/**
 * @description Supabase client instance configured with environment variables
 * @sideEffects Creates a connection to the Supabase backend
 */
export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  global: {
    fetch: customFetch,
  },
});