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

      // Debug Supabase configuration
      console.log('🔧 Supabase URL:', import.meta.env.VITE_SUPABASE_URL);
      console.log('🔑 Supabase Anon Key (first 10 chars):', import.meta.env.VITE_SUPABASE_ANON_KEY?.substring(0, 10) + '...');

      // Delay focus slightly to ensure input is ready after potential re-renders
      requestAnimationFrame(() => {
        emailInputRef.current?.focus();
      });
    }
  }, [initialMode, isOpen]);

  // Effect to listen for auth state changes and handle Twitter profile extraction
  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      console.log('🔐 Auth state change:', event);
      console.log('📄 Session:', session);
      console.log('👤 User:', session?.user);
      console.log('🔧 App metadata:', session?.user?.app_metadata);
      console.log('📊 User metadata:', session?.user?.user_metadata);

      if (event === 'SIGNED_IN' && session?.user) {
        console.log('✅ User signed in successfully');
        // Check if user signed in with Twitter and extract profile information
        if (session.user.app_metadata?.provider === 'twitter') {
          console.log('🐦 Twitter login detected, extracting profile...');
          await handleTwitterProfileExtraction(session.user);
        } else {
          console.log('📧 Non-Twitter login, provider:', session.user.app_metadata?.provider);
        }
      }

      if (event === 'SIGNED_OUT') {
        console.log('🚪 User signed out');
      }

      if (event === 'TOKEN_REFRESHED') {
        console.log('🔄 Token refreshed');
      }
    });

    return () => subscription.unsubscribe();
  }, []);

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
      console.log('🐦 Starting Twitter OAuth flow...');
      console.log('🌐 Current origin:', window.location.origin);
      console.log('📍 Current URL:', window.location.href);

      setTwitterLoading(true);
      setError(null);

      const { data, error } = await supabase.auth.signInWithOAuth({
        provider: 'twitter'
      });

      console.log('📤 OAuth response data:', data);
      console.log('❌ OAuth error:', error);

      if (error) {
        console.error('💥 OAuth initiation failed:', error);
        throw error;
      }

      if (data?.url) {
        console.log('🔗 OAuth URL received:', data.url);
        console.log('🚀 Redirecting to Twitter...');
      } else {
        console.warn('⚠️ No URL returned from OAuth');
      }

      // The redirect will happen automatically, so we don't need to handle success here
      // The auth state change listener will handle profile extraction
    } catch (error: any) {
      console.error('💥 Error logging in with Twitter:', error);
      console.error('📋 Full error object:', JSON.stringify(error, null, 2));
      setError(error.message || 'An error occurred during Twitter login');
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
            className="w-full startsnap-button bg-black text-white font-['Roboto',Helvetica] font-bold text-base rounded-lg border-2 border-solid border-gray-800 shadow-[3px_3px_0px_#1f2937] flex items-center justify-center gap-3 hover:bg-gray-800"
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

          <div className="flex gap-4 pt-2">
            <Button
              type="button"
              variant="outline"
              onClick={handleClose}
              className="flex-1 startsnap-button bg-gray-200 text-startsnap-ebony-clay font-['Roboto',Helvetica] font-bold text-base rounded-lg border-2 border-solid border-gray-800 shadow-[3px_3px_0px_#1f2937]"
              tabIndex={0}
              disabled={loading || twitterLoading}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={loading || twitterLoading}
              className="flex-1 startsnap-button bg-startsnap-french-rose text-startsnap-white font-['Roboto',Helvetica] font-bold text-base rounded-lg border-2 border-solid border-gray-800 shadow-[3px_3px_0px_#1f2937]"
              tabIndex={0}
            >
              {loading ? (mode === 'login' ? 'Logging In...' : 'Signing Up...') : (mode === 'login' ? 'Log In' : 'Sign Up')}
            </Button>
          </div>

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