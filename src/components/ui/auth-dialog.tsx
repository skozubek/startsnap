/**
 * src/components/ui/auth-dialog.tsx
 * @description Authentication dialog component for user login and signup
 */

import React, { useState, useEffect, useRef } from "react";
import { Button } from "./button";
import { Input } from "./input";
import { Label } from "./label";
import { Dialog, DialogContent, DialogTitle } from "./dialog";
import { supabase } from "../../lib/supabase";
import { FaXTwitter } from "react-icons/fa6";
import { toast } from "sonner";

interface AuthDialogProps {
  isOpen: boolean;
  onClose: () => void;
  mode: 'signup' | 'login';
  onSuccess?: () => void;
}

/**
 * @description Component for handling user authentication (login/signup)
 * @param {AuthDialogProps} props - Component props
 * @returns {JSX.Element} Authentication dialog with form fields
 * @sideEffects Interacts with Supabase auth API for user authentication
 */
export const AuthDialog = ({ isOpen, onClose, mode: initialMode, onSuccess }: AuthDialogProps): JSX.Element => {
  const [mode, setMode] = useState<'signup' | 'login'>(initialMode);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [twitterLoading, setTwitterLoading] = useState(false);
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
    setTwitterLoading(false);
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
   * @description Handles Twitter OAuth login
   * @async
   * @sideEffects Initiates Twitter OAuth flow via Supabase
   */
  const handleTwitterLogin = async () => {
    try {
      setTwitterLoading(true);
      setError(null);

      // Check if we're in a secure context
      if (location.protocol !== 'https:' && location.hostname !== 'localhost' && location.hostname !== '127.0.0.1') {
        console.warn('⚠️ OAuth might fail: not in secure context');
      }

      const { data, error } = await supabase.auth.signInWithOAuth({
        provider: 'twitter',
        options: {
          // Add redirect URL explicitly to ensure it's correct
          redirectTo: window.location.origin
        }
      });

      if (error) {
        console.error('💥 OAuth initiation failed:', error);

        // Provide more specific error messages based on error type
        if (error.message.includes('redirect_uri')) {
          setError('OAuth configuration error: Redirect URI mismatch. Please check your Twitter app settings.');
        } else if (error.message.includes('client_id')) {
          setError('OAuth configuration error: Invalid client ID. Please check your environment variables.');
        } else if (error.message.includes('rate_limit')) {
          setError('Too many OAuth attempts. Please wait a moment and try again.');
        } else {
          setError(error.message || 'An error occurred during Twitter login');
        }

        setTwitterLoading(false);
        return;
      }

      if (data?.url) {
        // The redirect will happen automatically
      } else {
        console.warn('⚠️ No URL returned from OAuth');
        setError('OAuth initialization failed: No redirect URL received');
        setTwitterLoading(false);
      }

      // The redirect will happen automatically, so we don't need to handle success here
      // The auth state change listener will handle profile extraction
    } catch (error: any) {
      console.error('💥 Error logging in with Twitter:', error);

      // Enhanced error reporting
      const errorMessage = error.message || 'An error occurred during Twitter login';

      if (error.name === 'TypeError' && error.message.includes('fetch')) {
        setError('Network error: Unable to connect to authentication service. Please check your internet connection.');
      } else if (error.message.includes('timeout')) {
        setError('Request timeout: Authentication service is taking too long to respond. Please try again.');
      } else {
        setError(errorMessage);
      }

      setTwitterLoading(false);
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

      if (onSuccess) {
        onSuccess();
      }
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

      if (onSuccess) {
        onSuccess();
      }
      handleClose();
      toast.success('Account Created Successfully!', {
        description: 'Welcome to StartSnap! Enjoy the ride!'
      });
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
        className="max-w-xs p-6 sm:max-w-md sm:p-8 bg-white rounded-lg border-3 border-solid border-gray-800 shadow-[5px_5px_0px_#1f2937]"
      >
        <DialogTitle className="text-3xl sm:text-4xl font-bold text-startsnap-ebony-clay text-center font-['Space_Grotesk',Helvetica] leading-tight mb-6 sm:mb-8">
          {mode === 'login' ? 'Welcome Back' : 'Create Your Account'}
        </DialogTitle>

        <form onSubmit={handleSubmit} className="space-y-4 sm:space-y-6">
          {/* Twitter Login Button */}
          <Button
            type="button"
            onClick={handleTwitterLogin}
            disabled={twitterLoading || loading}
            variant="primary"
            size="lg"
            className="w-full bg-black text-white hover:bg-gray-800 flex items-center justify-center gap-3"
          >
            {React.createElement(FaXTwitter as any, { size: 20 })}
            {twitterLoading ? 'Connecting...' : `${mode === 'login' ? 'Login' : 'Sign up'} with Twitter`}
          </Button>

          {/* Divider */}
          <div className="flex items-center my-4">
            <div className="flex-1 border-t border-gray-300"></div>
            <span className="px-4 text-gray-500 font-['Roboto',Helvetica]">or</span>
            <div className="flex-1 border-t border-gray-300"></div>
          </div>

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
              disabled={twitterLoading}
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
              disabled={twitterLoading}
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

          <Button
            type="submit"
            disabled={loading || twitterLoading}
            variant="primary"
            size="lg"
            className="w-full"
            tabIndex={0}
          >
            {loading ? (mode === 'login' ? 'Logging In...' : 'Signing Up...') : (mode === 'login' ? 'Log In' : 'Sign Up')}
          </Button>

          <div className="text-center text-startsnap-french-rose hover:underline cursor-pointer mt-6">
            <span onClick={toggleMode} role="button" tabIndex={0} onKeyDown={(e) => e.key === 'Enter' && toggleMode()}>
              {mode === 'login' ? "Don't have an account? Sign up" : "Already have an account? Log in"}
            </span>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};