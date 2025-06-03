/**
 * src/components/ui/auth-dialog.tsx
 * @description Authentication dialog component for user login and signup
 */

import React, { useState, useEffect, useRef } from "react";
import { Button } from "./button";
import { Input } from "./input";
import { Label } from "./label";
import { Dialog, DialogContent, DialogTitle, DialogDescription } from "./dialog";
import { supabase } from "../../lib/supabase";

interface AuthDialogProps {
  isOpen: boolean;
  onClose: () => void;
  mode: 'signup' | 'login';
}

/**
 * @description Component for handling user authentication (login/signup)
 * @param {AuthDialogProps} props - Component props
 * @returns {JSX.Element} Authentication dialog with form fields
 * @sideEffects Interacts with Supabase auth API for user authentication
 */
export const AuthDialog = ({ isOpen, onClose, mode: initialMode }: AuthDialogProps): JSX.Element => {
  const [mode, setMode] = useState<'signup' | 'login'>(initialMode);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [emailError, setEmailError] = useState<string | null>(null);
  const [passwordError, setPasswordError] = useState<string | null>(null);

  const emailInputRef = useRef<HTMLInputElement>(null);
  const passwordInputRef = useRef<HTMLInputElement>(null);

  // Effect to update mode and set initial focus
  useEffect(() => {
    if (isOpen) {
      setMode(initialMode);
      setError(null);
      setEmailError(null);
      setPasswordError(null);
      // Delay focus slightly to ensure input is ready after potential re-renders
      requestAnimationFrame(() => {
        emailInputRef.current?.focus();
      });
    }
  }, [initialMode, isOpen]);

  /**
   * @description Toggles between login and signup modes
   */
  const toggleMode = () => {
    setMode(mode === 'login' ? 'signup' : 'login');
    setError(null);
    setEmailError(null);
    setPasswordError(null);
    requestAnimationFrame(() => { // Ensure DOM is updated before focusing
      emailInputRef.current?.focus();
    });
  };

  /**
   * @description Clears the dialog state and closes it
   */
  const handleClose = () => {
    setEmail('');
    setPassword('');
    setError(null);
    setEmailError(null);
    setPasswordError(null);
    setLoading(false);
    onClose();
  };

  /**
   * @description Validates the email format
   * @param {string} email - Email to validate
   * @returns {boolean} Whether the email is valid
   */
  const validateEmail = (email: string): boolean => {
    if (!email.trim()) {
      setEmailError('Email is required');
      return false;
    }

    // More comprehensive email validation
    const emailRegex = /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
    if (!emailRegex.test(email)) {
      setEmailError('Please enter a valid email address');
      return false;
    }

    setEmailError(null);
    return true;
  };

  /**
   * @description Validates the password
   * @param {string} password - Password to validate
   * @returns {boolean} Whether the password is valid
   */
  const validatePassword = (password: string): boolean => {
    if (!password) {
      setPasswordError('Password is required');
      return false;
    }

    if (password.length < 6) {
      setPasswordError('Password must be at least 6 characters');
      return false;
    }

    setPasswordError(null);
    return true;
  };

  /**
   * @description Handles form submission (login or signup)
   * @param {React.FormEvent<HTMLFormElement>} e - The form event
   * @async
   */
  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (mode === 'login') {
      await handleLogin();
    } else {
      await handleSignUp();
    }
  };

  /**
   * @description Handles the login submission
   * @async
   * @sideEffects Attempts to sign in the user via Supabase auth
   */
  const handleLogin = async () => {
    // Validate inputs first
    const isEmailValid = validateEmail(email);
    const isPasswordValid = validatePassword(password);

    if (!isEmailValid || !isPasswordValid) {
      return;
    }

    try {
      setLoading(true);
      setError(null);

      const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) throw error;

      handleClose();
    } catch (error: any) {
      console.error('Error logging in:', error);
      setError(error.message || 'Invalid login credentials');
    } finally {
      setLoading(false);
    }
  };

  /**
   * @description Handles the signup submission
   * @async
   * @sideEffects Creates a new user account via Supabase auth
   */
  const handleSignUp = async () => {
    // Validate inputs first
    const isEmailValid = validateEmail(email);
    const isPasswordValid = validatePassword(password);

    if (!isEmailValid || !isPasswordValid) {
      return;
    }

    try {
      setLoading(true);
      setError(null);

      const { error } = await supabase.auth.signUp({
        email,
        password,
      });

      if (error) throw error;

      handleClose();
      alert('Account created, enjoy the ride!');
    } catch (error: any) {
      console.error('Error signing up:', error);
      setError(error.message || 'An error occurred during sign up');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent
        className="sm:max-w-md bg-white p-8 rounded-lg border-3 border-solid border-gray-800 shadow-[5px_5px_0px_#1f2937]"
      >
        <DialogTitle className="text-4xl font-bold text-startsnap-ebony-clay text-center font-['Space_Grotesk',Helvetica] leading-tight mb-8">
          {mode === 'login' ? 'Welcome Back' : 'Create Your Account'}
        </DialogTitle>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-2">
            <Label
              htmlFor="email"
              className="block font-['Space_Grotesk',Helvetica] font-bold text-startsnap-oxford-blue text-xl leading-7"
            >
              Email
            </Label>
            <Input
              ref={emailInputRef}
              id="email"
              type="email"
              value={email}
              onClick={(e) => e.currentTarget.focus()}
              onChange={(e) => {
                setEmail(e.target.value);
                setEmailError(null);
                setError(null);
              }}
              className={`w-full border-2 border-solid ${emailError ? 'border-red-500' : 'border-gray-800'} rounded-lg p-4 font-['Roboto',Helvetica] text-startsnap-pale-sky`}
              placeholder="your.email@example.com"
              tabIndex={0}
            />
            {emailError && (
              <p className="text-red-500 text-sm mt-1">{emailError}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label
              htmlFor="password"
              className="block font-['Space_Grotesk',Helvetica] font-bold text-startsnap-oxford-blue text-xl leading-7"
            >
              Password
            </Label>
            <Input
              ref={passwordInputRef}
              id="password"
              type="password"
              value={password}
              onClick={(e) => e.currentTarget.focus()}
              onChange={(e) => {
                setPassword(e.target.value);
                setPasswordError(null);
                setError(null);
              }}
              className={`w-full border-2 border-solid ${passwordError ? 'border-red-500' : 'border-gray-800'} rounded-lg p-4 font-['Roboto',Helvetica] text-startsnap-pale-sky`}
              tabIndex={0}
            />
            {passwordError && (
              <p className="text-red-500 text-sm mt-1">{passwordError}</p>
            )}
          </div>

          {error && (
            <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded-md">
              {error}
            </div>
          )}

          <div className="flex gap-4 pt-2">
            <Button
              type="button"
              variant="outline"
              onClick={handleClose}
              className="flex-1 startsnap-button bg-gray-200 text-startsnap-ebony-clay font-['Roboto',Helvetica] font-bold text-base rounded-lg border-2 border-solid border-gray-800 shadow-[3px_3px_0px_#1f2937]"
              tabIndex={0}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={loading}
              className="flex-1 startsnap-button bg-startsnap-french-rose text-startsnap-white font-['Roboto',Helvetica] font-bold text-base rounded-lg border-2 border-solid border-gray-800 shadow-[3px_3px_0px_#1f2937]"
              tabIndex={0}
            >
              {loading ? (mode === 'login' ? 'Logging In...' : 'Signing Up...') : (mode === 'login' ? 'Log In' : 'Sign Up')}
            </Button>
          </div>

          <div className="text-center text-startsnap-french-rose hover:underline cursor-pointer mt-6">
            <span onClick={toggleMode}>
              {mode === 'login' ? "Don't have an account? Sign up" : "Already have an account? Log in"}
            </span>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};