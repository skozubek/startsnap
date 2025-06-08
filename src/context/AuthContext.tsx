/**
 * src/context/AuthContext.tsx
 * @description Authentication context provider for managing global auth state
 */

import React, { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { User, Session, AuthChangeEvent } from '@supabase/supabase-js';
import { supabase } from '../lib/supabase';

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
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

interface AuthProviderProps {
  children: ReactNode;
}

/**
 * @description Provider component that manages authentication state globally.
 * It initializes the session state on load, listens to Supabase auth state changes,
 * and provides a function to handle authentication errors by signing the user out.
 * @param {AuthProviderProps} props - Component props containing children
 * @returns {JSX.Element} AuthContext provider wrapping children
 * @sideEffects Listens to Supabase auth state changes and updates global state.
 */
export const AuthProvider = ({ children }: AuthProviderProps): JSX.Element => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [session, setSession] = useState<Session | null>(null);

  /**
   * @description Extracts Twitter profile information and updates user profile
   * @async
   * @param {any} user - Supabase user object
   * @sideEffects Updates user profile with Twitter profile URL if available
   */
  const handleTwitterProfileExtraction = async (user: any) => {
    try {
      console.log('🔍 Extracting Twitter profile from user:', user);

      // Extract Twitter username from user metadata
      const twitterUsername = user.user_metadata?.user_name || user.user_metadata?.preferred_username;
      console.log('📝 Extracted Twitter username:', twitterUsername);
      console.log('🔍 Available metadata keys:', Object.keys(user.user_metadata || {}));

      if (twitterUsername) {
        const twitterUrl = `https://twitter.com/${twitterUsername}`;
        console.log('🔗 Generated Twitter URL:', twitterUrl);

        // Update the profile with Twitter URL
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
          console.error('❌ Error updating profile with Twitter URL:', error);
        } else {
          console.log('✅ Successfully updated profile with Twitter URL:', twitterUrl);
        }
      } else {
        console.warn('⚠️ No Twitter username found in user metadata');
        console.log('📋 Full user_metadata:', JSON.stringify(user.user_metadata, null, 2));
      }
    } catch (error) {
      console.error('💥 Error extracting Twitter profile information:', error);
    }
  };

  useEffect(() => {
    setLoading(true);
    // Check current session on mount
    supabase.auth.getSession().then(({ data: { session: initialSession } }) => {
      setUser(initialSession?.user ?? null);
      setSession(initialSession);
      setLoading(false); // Finish loading after initial session check
    }).catch(() => {
      // Handle potential errors during getSession, though unlikely to be critical here
      setUser(null);
      setSession(null);
      setLoading(false);
    });

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event: AuthChangeEvent, currentSession: Session | null) => {
        setUser(currentSession?.user ?? null);
        setSession(currentSession);
        if (loading) {
            setLoading(false);
        }

        // --- START NEW LOGIC ---
        if (event === "SIGNED_IN" && currentSession?.user.app_metadata.provider === 'twitter') {
          // This is the correct, persistent place to handle the post-login action.
          await handleTwitterProfileExtraction(currentSession.user);
        }
        // --- END NEW LOGIC ---
      }
    );

    return () => {
      subscription?.unsubscribe();
    };
  }, []); // Empty dependency array: runs once on mount, cleans up on unmount.

  /**
   * @description Signs the user out. Intended to be called when an API error indicates an invalid session.
   * This will trigger the `onAuthStateChange` listener, which will then update the user and session state.
   * @async
   * @returns {Promise<void>}
   * @sideEffects Calls `supabase.auth.signOut()`.
   */
  const handleAuthErrorAndSignOut = async (): Promise<void> => {
    const { error } = await supabase.auth.signOut();
    if (error) {
      // onAuthStateChange will still be triggered to clear local session state
    }
    // The onAuthStateChange listener handles setting user and session to null.
  };

  const value = {
    user,
    loading,
    session,
    handleAuthErrorAndSignOut,
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
 * and a function to handle authentication errors by signing out.
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