/**
 * src/components/ui/auth-dialog.tsx
 * @description Authentication dialog component for user login and signup
 */

import React, { useState, useEffect, useRef } from "react";
import { Button } from "./button";
import { Input } from "./input";
import { Label } from "./label";
import { supabase } from "../../lib/supabase";
import { FaXTwitter } from "react-icons/fa6";
import { toast } from "sonner";
import { X, User, UserPlus } from "lucide-react";

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

  if (!isOpen) return <></>;

  /**
   * @description Handles backdrop click to close dialog
   * @param {React.MouseEvent} e - Mouse event
   */
  const handleBackdropClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) {
      handleClose();
    }
  };

  /**
   * @description Handles escape key press to close dialog
   * @param {React.KeyboardEvent} e - Keyboard event
   */
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Escape') {
      handleClose();
    }
  };

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
    <div
      className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4"
      onClick={handleBackdropClick}
      onKeyDown={handleKeyDown}
      tabIndex={-1}
    >
      <div
        className="bg-startsnap-white border-2 border-startsnap-ebony-clay rounded-xl shadow-[4px_4px_0px_#1f2937] max-w-md w-full animate-in zoom-in-95 duration-200"
        role="dialog"
        aria-modal="true"
        aria-labelledby="auth-title"
        aria-describedby="auth-description"
      >
        {/* Header Section */}
        <div className="border-b-2 border-startsnap-ebony-clay p-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 bg-startsnap-mountain-meadow rounded-lg border-2 border-startsnap-ebony-clay flex items-center justify-center shadow-[2px_2px_0px_#1f2937]">
                {mode === 'login' ? (
                  <User className="h-4 w-4 text-startsnap-ebony-clay" />
                ) : (
                  <UserPlus className="h-4 w-4 text-startsnap-ebony-clay" />
                )}
              </div>
              <h2
                id="auth-title"
                className="font-['Space_Grotesk',Helvetica] font-black text-startsnap-ebony-clay text-xl uppercase tracking-wider"
              >
                {mode === 'login' ? 'WELCOME BACK' : 'JOIN STARTSNAP'}
              </h2>
            </div>
            <button
              onClick={handleClose}
              className="w-8 h-8 bg-startsnap-beige border-2 border-startsnap-ebony-clay rounded-lg hover:bg-startsnap-beige/90 active:scale-95 transition-all duration-150 flex items-center justify-center shadow-[2px_2px_0px_#1f2937] hover:shadow-[3px_3px_0px_#1f2937] hover:translate-x-[-1px] hover:translate-y-[-1px]"
              aria-label="Close dialog"
            >
              <X className="h-4 w-4 text-startsnap-ebony-clay" />
            </button>
          </div>
        </div>

        {/* Main Content Section */}
        <div className="p-6">
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Twitter Login Button */}
            <Button
              type="button"
              onClick={handleTwitterLogin}
              disabled={twitterLoading || loading}
              variant="primary"
              size="lg"
              className="w-full bg-startsnap-ebony-clay text-startsnap-beige hover:bg-startsnap-ebony-clay/90 flex items-center justify-center gap-3"
            >
              {React.createElement(FaXTwitter as any, { size: 20 })}
              {twitterLoading ? 'CONNECTING...' : `${mode === 'login' ? 'LOGIN' : 'SIGN UP'} WITH TWITTER`}
            </Button>

            {/* Divider */}
            <div className="flex items-center my-6">
              <div className="flex-1 h-0.5 bg-startsnap-ebony-clay"></div>
              <span className="px-4 text-startsnap-ebony-clay font-['Space_Grotesk',Helvetica] font-bold text-sm uppercase tracking-wider">OR</span>
              <div className="flex-1 h-0.5 bg-startsnap-ebony-clay"></div>
            </div>

            {/* Email Field */}
            <div className="space-y-3">
              <Label
                htmlFor="email"
                className="block font-['Space_Grotesk',Helvetica] font-black text-startsnap-ebony-clay text-sm uppercase tracking-wider"
              >
                EMAIL ADDRESS
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
                className={`w-full border-2 ${emailError ? 'border-startsnap-french-rose' : 'border-startsnap-ebony-clay'} rounded-lg bg-startsnap-white font-medium text-startsnap-ebony-clay placeholder-startsnap-river-bed shadow-[2px_2px_0px_#1f2937] focus:shadow-[3px_3px_0px_#1f2937] focus:translate-x-[-1px] focus:translate-y-[-1px] transition-all duration-200`}
                placeholder="your.email@example.com"
                tabIndex={0}
                disabled={twitterLoading}
              />
              {emailError && (
                <p className="text-startsnap-french-rose text-sm font-medium">{emailError}</p>
              )}
            </div>

            {/* Password Field */}
            <div className="space-y-3">
              <Label
                htmlFor="password"
                className="block font-['Space_Grotesk',Helvetica] font-black text-startsnap-ebony-clay text-sm uppercase tracking-wider"
              >
                PASSWORD
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
                className={`w-full border-2 ${passwordError ? 'border-startsnap-french-rose' : 'border-startsnap-ebony-clay'} rounded-lg bg-startsnap-white font-medium text-startsnap-ebony-clay placeholder-startsnap-river-bed shadow-[2px_2px_0px_#1f2937] focus:shadow-[3px_3px_0px_#1f2937] focus:translate-x-[-1px] focus:translate-y-[-1px] transition-all duration-200`}
                placeholder={mode === 'signup' ? 'Create a strong password' : 'Enter your password'}
                tabIndex={0}
                disabled={twitterLoading}
              />
              {passwordError && (
                <p className="text-startsnap-french-rose text-sm font-medium">{passwordError}</p>
              )}
            </div>

            {/* Error Message */}
            {error && (
              <div className="bg-startsnap-french-rose/10 border-2 border-startsnap-french-rose rounded-lg p-4 shadow-[2px_2px_0px_#ef4444]">
                <p className="text-startsnap-french-rose text-sm font-medium">{error}</p>
              </div>
            )}

            {/* Submit Button */}
            <Button
              type="submit"
              disabled={loading || twitterLoading}
              variant="primary"
              size="lg"
              className="w-full"
              tabIndex={0}
            >
              {loading ? (mode === 'login' ? 'LOGGING IN...' : 'SIGNING UP...') : (mode === 'login' ? 'LOG IN' : 'SIGN UP')}
            </Button>

            {/* Mode Toggle */}
            <div className="text-center pt-4">
              <button
                type="button"
                onClick={toggleMode}
                className="text-startsnap-ebony-clay hover:text-startsnap-french-rose font-['Space_Grotesk',Helvetica] font-bold text-sm uppercase tracking-wide transition-colors duration-200"
                tabIndex={0}
              >
                {mode === 'login' ? "DON'T HAVE AN ACCOUNT? SIGN UP" : "ALREADY HAVE AN ACCOUNT? LOG IN"}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};