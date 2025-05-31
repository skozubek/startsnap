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

  /**
   * @description Handles form submission for authentication
   * @async
   * @param {Object} data - Form data containing email and password
   * @throws {Error} When email or password is missing
   * @sideEffects Attempts to authenticate user via Supabase
   */
  const handleSubmit = async (data: { email: string; password: string }) => {
    try {
      setError(null);

      // Validate required fields
      if (!data.email?.trim()) {
        setError('Email is required');
        return;
      }

      if (!data.password?.trim()) {
        setError('Password is required');
        return;
      }
      
      if (mode === 'signup') {
        const { error } = await supabase.auth.signUp({
          email: data.email.trim(),
          password: data.password.trim(),
        });

        if (error) {
          if (error.message.includes('User already registered')) {
            setError('This email is already registered. Please try logging in instead.');
          } else {
            setError(error.message);
          }
          return;
        }

        onClose();
      } else {
        const { error } = await supabase.auth.signInWithPassword({
          email: data.email.trim(),
          password: data.password.trim(),
        });

        if (error) {
          if (error.message.includes('Invalid login credentials')) {
            setError('Invalid email or password. Please try again.');
          } else {
            setError(error.message);
          }
          return;
        }

        onClose();
      }
    } catch (err) {
      console.error('Authentication error:', err);
      setError('An unexpected error occurred. Please try again.');
    }
  };

  /**
   * @description Toggles between login and signup modes
   */
  const toggleMode = () => {
    setError(null);
    setMode(mode === 'signup' ? 'login' : 'signup');
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[425px] bg-white p-6 rounded-xl border-[3px] border-solid border-gray-800 shadow-[5px_5px_0px_#1f2937]">
        <DialogTitle className="text-2xl font-bold text-startsnap-ebony-clay mb-6 font-['Space_Grotesk',Helvetica]">
          {mode === 'signup' ? 'Create your account' : 'Welcome back!'}
        </DialogTitle>

        <AuthForm
          mode={mode}
          onSubmit={handleSubmit}
          error={error}
          onToggleMode={toggleMode}
        />
      </DialogContent>
    </Dialog>
  );
};