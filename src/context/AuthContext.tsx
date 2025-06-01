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
  signOut: () => Promise<void>;
  refreshSession: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

interface AuthProviderProps {
  children: ReactNode;
}

/**
 * @description Provider component that manages authentication state globally
 * @param {AuthProviderProps} props - Component props containing children
 * @returns {JSX.Element} AuthContext provider wrapping children
 * @sideEffects Listens to Supabase auth state changes and updates global state
 */
export const AuthProvider = ({ children }: AuthProviderProps): JSX.Element => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [session, setSession] = useState<Session | null>(null);

  /**
   * @description Signs out the user from all devices
   * @async
   * @sideEffects Clears auth state and redirects to home page
   */
  const signOut = async (): Promise<void> => {
    try {
      await supabase.auth.signOut({ scope: 'global' });
      setUser(null);
      setSession(null);
      // Force reload the page to ensure all state is cleared
      window.location.href = '/';
    } catch (error) {
      console.error('Error signing out:', error);
    }
  };

  /**
   * @description Refreshes the current session
   * @async
   * @sideEffects Updates auth state with fresh session data
   */
  const refreshSession = async (): Promise<void> => {
    try {
      setLoading(true);
      const { data, error } = await supabase.auth.getSession();
      
      if (error) {
        throw error;
      }
      
      if (data && data.session) {
        setUser(data.session.user);
        setSession(data.session);
      } else {
        // No valid session found
        setUser(null);
        setSession(null);
      }
    } catch (error) {
      console.error('Error refreshing session:', error);
      // On error, clear session state
      setUser(null);
      setSession(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    // Initial session check
    const initializeAuth = async () => {
      try {
        // First, check if we have a valid session
        const { data, error } = await supabase.auth.getSession();
        
        if (error) {
          throw error;
        }
        
        // Update state based on session data
        if (data && data.session) {
          setUser(data.session.user);
          setSession(data.session);
        }
      } catch (error) {
        console.error('Error initializing auth:', error);
      } finally {
        setLoading(false);
      }
    };

    initializeAuth();

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event: AuthChangeEvent, currentSession) => {
        console.log('Auth event:', event);
        
        // Handle different auth events
        if (event === 'SIGNED_IN' || event === 'TOKEN_REFRESHED') {
          setUser(currentSession?.user || null);
          setSession(currentSession);
        }
        else if (event === 'SIGNED_OUT') {
          setUser(null);
          setSession(null);
        }
        else if (event === 'USER_UPDATED') {
          setUser(currentSession?.user || null);
          setSession(currentSession);
        }
        else if (event === 'INITIAL_SESSION') {
          if (!currentSession) {
            // Clear any potentially invalid tokens
            await supabase.auth.signOut();
            setUser(null);
            setSession(null);
          } else {
            setUser(currentSession.user);
            setSession(currentSession);
          }
        }
        
        setLoading(false);
      }
    );

    return () => subscription.unsubscribe();
  }, []);

  const value = {
    user,
    loading,
    session,
    signOut,
    refreshSession
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

/**
 * @description Custom hook to consume authentication context
 * @returns {AuthContextType} Current authentication state including user, loading, and session
 * @throws {Error} When used outside of AuthProvider
 */
export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};