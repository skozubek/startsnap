/**
 * src/components/ui/auth-dialog.tsx
 * @description Authentication dialog component for user login and signup
 */

import React, { useState } from "react";
import { Dialog, DialogContent, DialogTitle } from "./dialog";
import { AuthForm } from "./auth-form";
import { supabase } from "../../lib/supabase";

interface AuthDialogProps {
  isOpen: boolean;
  onClose: () => void;
  mode: 'signup' | 'login';
}

/**
 * @description Dialog component for user authentication
 * @param {AuthDialogProps} props - Component props
 * @returns {JSX.Element} Authentication dialog with form
 */
export const AuthDialog = ({ isOpen, onClose, mode: initialMode }: AuthDialogProps): JSX.Element => {
  const [mode, setMode] = useState(initialMode);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  /**
   * @description Handles form submission for authentication
   * @async
   * @param {Object} data - Form data containing email and password
   * @sideEffects Attempts to authenticate user via Supabase
   * @throws {Error} When form validation fails
   */
  const handleSubmit = async (data: { email: string; password: string }) => {
    setError(null);
    setLoading(true);

    try {
      // Validate required fields
      if (!data.email?.trim()) {
        setError('Email is required');
        setLoading(false);
        return;
      }

      if (!data.password?.trim()) {
        setError('Password is required');
        setLoading(false);
        return;
      }

      // Validate email format
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(data.email.trim())) {
        setError('Please enter a valid email address');
        setLoading(false);
        return;
      }

      const credentials = {
        email: data.email.trim(),
        password: data.password
      };

      if (mode === 'signup') {
        const { error } = await supabase.auth.signUp(credentials);

        if (error) {
          if (error.message.includes('already registered')) {
            setError('This email is already registered. Please try logging in instead.');
          } else {
            setError(error.message);
          }
          return;
        }

        onClose();
      } else {
        const { error } = await supabase.auth.signInWithPassword(credentials);

        if (error) {
          setError('Invalid login credentials. Please try again.');
          return;
        }

        onClose();
      }
    } catch (err) {
      setError('An unexpected error occurred. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  /**
   * @description Toggles between login and signup modes
   */
  const toggleMode = () => {
    setMode(mode === 'login' ? 'signup' : 'login');
    setError(null);
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[425px] bg-white p-6 rounded-xl border-2 border-gray-800">
        <DialogTitle className="text-2xl font-bold text-startsnap-ebony-clay mb-6 font-['Space_Grotesk',Helvetica]">
          {mode === 'login' ? 'Welcome Back' : 'Create Account'}
        </DialogTitle>

        <AuthForm
          mode={mode}
          onSubmit={handleSubmit}
          error={error}
          loading={loading}
        />

        <div className="mt-6 text-center">
          <button
            onClick={toggleMode}
            className="text-startsnap-french-rose hover:underline font-['Roboto',Helvetica] text-sm"
          >
            {mode === 'login'
              ? "Don't have an account? Sign up"
              : 'Already have an account? Log in'}
          </button>
        </div>
      </DialogContent>
    </Dialog>
  );
};