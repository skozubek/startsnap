/**
 * src/context/AuthContext.tsx
 * @description Authentication context provider for managing global auth state with robust error handling
 */

import React, { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { User, Session, AuthChangeEvent } from '@supabase/supabase-js';
import { supabase } from '../lib/supabase';
import { toast } from 'sonner';

interface AuthContextType {
  user: User | null;
  loading: boolean;
  session: Session | null;
  /**
   * @description Call this function when a Supabase API call fails due to a session issue (e.g., 403 "session_not_found").
   * It will sign the user out, triggering an auth state change that should update the UI to a logged-out state.
   * @async
   * @returns {Promise<void>}
   * @sideEffects Calls `supabase.auth.signOut()`, which in turn triggers an `onAuthStateChange` event.
   */
  handleAuthErrorAndSignOut: () => Promise<void>;
  /**
   * @description Force logout that clears all local state and storage, used when normal logout fails
   * @async
   * @returns {Promise<void>}
   * @sideEffects Clears localStorage and forces auth state reset
   */
  forceLogout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

interface AuthProviderProps {
  children: ReactNode;
}

/**
 * @description Provider component that manages authentication state globally with robust error handling.
 * It initializes the session state on load, listens to Supabase auth state changes,
 * and provides functions to handle authentication errors by signing the user out.
 * @param {AuthProviderProps} props - Component props containing children
 * @returns {JSX.Element} AuthContext provider wrapping children
 * @sideEffects Listens to Supabase auth state changes and updates global state.
 */
export const AuthProvider = ({ children }: AuthProviderProps): JSX.Element => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [session, setSession] = useState<Session | null>(null);

  /**
   * @description Clears all local authentication data from localStorage and sessionStorage
   * @sideEffects Removes Supabase auth tokens from browser storage
   */
  const clearLocalAuthData = (): void => {
    try {
      // Clear Supabase auth data from localStorage
      const keysToRemove = [];
      for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        if (key && key.startsWith('sb-')) {
          keysToRemove.push(key);
        }
      }
      keysToRemove.forEach(key => localStorage.removeItem(key));

      // Clear from sessionStorage as well
      const sessionKeysToRemove = [];
      for (let i = 0; i < sessionStorage.length; i++) {
        const key = sessionStorage.key(i);
        if (key && key.startsWith('sb-')) {
          sessionKeysToRemove.push(key);
        }
      }
      sessionKeysToRemove.forEach(key => sessionStorage.removeItem(key));

      console.log('🧹 Cleared local auth data');
    } catch (error) {
      console.error('❌ Error clearing local auth data:', error);
    }
  };

    /**
   * @description Force logout that clears all local state and storage, used when normal logout fails
   * @async
   * @returns {Promise<void>}
   * @sideEffects Clears localStorage, forces auth state reset, and shows user notification
   */
  const forceLogout = async (): Promise<void> => {
    console.log('🚨 Force logout initiated');

    // Don't wait for any API calls - just force clear everything
    try {
      // Try one quick logout attempt with short timeout
      const quickLogout = supabase.auth.signOut();
      const quickTimeout = new Promise<never>((_, reject) =>
        setTimeout(() => reject(new Error('Quick logout timeout')), 1000)
      );

      await Promise.race([quickLogout, quickTimeout]);
    } catch (error) {
      console.warn('⚠️ Quick logout failed, proceeding with force cleanup:', error);
    }

    // Clear all local auth data regardless of API success
    clearLocalAuthData();

    // Force update local state immediately
    setUser(null);
    setSession(null);
    setLoading(false);

    // Show user notification
    toast.warning('Session Reset', {
      description: 'Your session was reset due to authentication issues. Please log in again.'
    });

    // Force page reload to ensure clean state (nuclear option)
    setTimeout(() => {
      window.location.href = '/';
    }, 500);
  };

    /**
   * @description Validates current session health by making a test API call with timeout
   * @async
   * @returns {Promise<boolean>} Whether session is healthy
   */
  const validateSessionHealth = async (): Promise<boolean> => {
    if (!session) return false;

    try {
      // Create a timeout promise
      const timeoutPromise = new Promise<never>((_, reject) =>
        setTimeout(() => reject(new Error('Session health check timeout')), 5000) // Increased timeout
      );

      // Race between the API call and timeout
      const healthCheckPromise = supabase.from('profiles').select('user_id').limit(1);

      const { error } = await Promise.race([healthCheckPromise, timeoutPromise]);

      if (error) {
        console.warn('🚨 Health check error details:', error);

        // Be more specific about what constitutes a session failure
        // Don't immediately fail on network or temporary errors
        if (error.code === 'PGRST301' && error.message.includes('JWT expired')) {
          console.warn('🚨 JWT expired detected in health check');
          return false;
        }

        if (error.message.includes('invalid JWT') || error.message.includes('session not found')) {
          console.warn('🚨 Invalid session detected in health check');
          return false;
        }

        // For other errors (network issues, etc.), assume session is healthy
        // This prevents unnecessary logouts due to temporary network issues
        console.warn('🟡 Non-critical health check error, assuming session is healthy:', error);
        return true;
      }
      return true;
    } catch (error: any) {
      console.warn('🚨 Session health check exception:', error);

      // If it's a timeout or network error, don't assume session is corrupted
      if (error.message.includes('timeout') || error.message.includes('network')) {
        console.warn('🟡 Network/timeout error in health check, assuming session is healthy');
        return true;
      }

      return false;
    }
  };

  /**
   * @description Extracts Twitter profile information and updates user profile
   * @async
   * @param {any} user - Supabase user object
   * @sideEffects Updates user profile with Twitter profile URL if available
   */
  const handleTwitterProfileExtraction = async (user: any) => {
    try {
      // Extract Twitter username from user metadata
      const twitterUsername = user.user_metadata?.user_name || user.user_metadata?.preferred_username;

      if (twitterUsername) {
        const twitterUrl = `https://twitter.com/${twitterUsername}`;

        // Add timeout and retry logic for the profile update
        const updateProfile = async (retryCount = 0) => {
          try {
            const { error } = await supabase
              .from('profiles')
              .upsert({
                user_id: user.id,
                twitter_url: twitterUrl,
                updated_at: new Date()
              }, {
                onConflict: 'user_id'
              });

            if (error) {
              // Check for auth-related errors that might indicate session corruption
              if (error.code === 'PGRST301' || error.message.includes('JWT') || error.message.includes('session')) {
                console.error('❌ Auth error during Twitter profile update:', error);
                // Don't trigger logout here as it might be during initial auth flow
                return;
              }
              throw error;
            }


          } catch (retryError) {
            if (retryCount < 2) {
              console.warn(`⚠️ Profile update failed, retrying... (${retryCount + 1}/3)`, retryError);
              // Wait a bit before retrying
              await new Promise(resolve => setTimeout(resolve, 1000));
              return updateProfile(retryCount + 1);
            }
            console.error('❌ Final retry failed for Twitter profile update:', retryError);
          }
        };

        // Run profile update without blocking the auth flow
        updateProfile().catch(error => {
          console.warn('⚠️ Twitter profile extraction failed but auth flow continues:', error);
        });
              }
    } catch (error) {
      console.error('💥 Error extracting Twitter profile information:', error);
      // Don't throw - let auth flow continue
    }
  };

  useEffect(() => {
    setLoading(true);

        // Check current session on mount
    supabase.auth.getSession().then(({ data: { session: initialSession } }) => {
      setUser(initialSession?.user ?? null);
      setSession(initialSession);
      setLoading(false);
    }).catch(async (error) => {
      console.error('❌ Error getting initial session:', error);
      // Clear potentially corrupted session data - but don't wait for it
      clearLocalAuthData();
      setUser(null);
      setSession(null);
      setLoading(false);
    });

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event: AuthChangeEvent, currentSession: Session | null) => {


        // Handle sign out events
        if (event === 'SIGNED_OUT') {
          clearLocalAuthData(); // Ensure local data is cleared
        }

        setUser(currentSession?.user ?? null);
        setSession(currentSession);
        if (loading) {
          setLoading(false);
        }

        // --- START IMPROVED TWITTER LOGIC ---
        if (event === "SIGNED_IN" && currentSession?.user.app_metadata.provider === 'twitter') {
          // Delay profile extraction to allow auth flow to complete
          // This prevents interference with session establishment
          setTimeout(async () => {
            try {
              await handleTwitterProfileExtraction(currentSession.user);
            } catch (error) {
              console.warn('⚠️ Delayed Twitter profile extraction failed:', error);
              // Don't propagate error - auth flow should continue
            }
          }, 2000); // 2 second delay to allow auth to stabilize
        }
        // --- END IMPROVED TWITTER LOGIC ---
      }
    );

    // Set up periodic session health checks (every 10 minutes instead of 5)
    const healthCheckInterval = setInterval(async () => {
      if (session && user) {
        const isHealthy = await validateSessionHealth();
        if (!isHealthy) {
          console.warn('🚨 Periodic health check failed, forcing logout');
          await forceLogout();
        }
      }
    }, 10 * 60 * 1000); // 10 minutes instead of 5

    return () => {
      subscription?.unsubscribe();
      clearInterval(healthCheckInterval);
    };
  }, []); // Empty dependency array: runs once on mount, cleans up on unmount.

    /**
   * @description Enhanced logout with retry logic and fallback to force logout
   * @async
   * @returns {Promise<void>}
   * @sideEffects Attempts normal logout, falls back to force logout if needed
   */
  const handleAuthErrorAndSignOut = async (): Promise<void> => {

    try {
      // Try normal logout first with timeout
      const logoutPromise = supabase.auth.signOut();
      const timeoutPromise = new Promise<never>((_, reject) =>
        setTimeout(() => reject(new Error('Logout timeout')), 5000)
      );

      const { error } = await Promise.race([logoutPromise, timeoutPromise]);

      if (error) {
        console.warn('⚠️ Normal logout failed, trying force logout:', error);
        await forceLogout();
      } else {
        // Clear local data as backup
        clearLocalAuthData();
      }
    } catch (error) {
      console.error('❌ Logout completely failed, forcing logout:', error);
      await forceLogout();
    }
  };

  const value = {
    user,
    loading,
    session,
    handleAuthErrorAndSignOut,
    forceLogout,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

/**
 * @description Custom hook to consume authentication context.
 * Provides access to the current authentication state (user, session, loading)
 * and functions to handle authentication errors by signing out.
 * @returns {AuthContextType} Current authentication state and error handling utilities.
 * @throws {Error} When used outside of an AuthProvider.
 */
export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};