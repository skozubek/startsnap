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

  useEffect(() => {
    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event: AuthChangeEvent, session) => {
        try {
          // Clear auth state for session errors, sign out, or no initial session
          if (event === 'SIGNED_OUT' || event === 'TOKEN_REFRESHED' || (event === 'INITIAL_SESSION' && !session)) {
            setUser(null);
            setSession(null);
            if (event !== 'SIGNED_OUT') {
              await supabase.auth.signOut(); // Clear any stale tokens
            }
          } else {
            setUser(session?.user || null);
            setSession(session);
          }
        } catch (error) {
          console.error('Auth state change error:', error);
          // On any auth error, clear state and force re-login
          setUser(null);
          setSession(null);
          try {
            await supabase.auth.signOut();
          } catch (signOutError) {
            console.error('Error during forced sign out:', signOutError);
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
    session
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