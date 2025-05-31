/**
 * src/components/ui/auth-dialog.tsx
 * @description Authentication dialog component for user login and signup
 */

import React, { useState, useEffect } from "react";
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle,
  DialogTrigger
} from "./dialog";
import { Label } from "./label";
import { Input } from "./input";
import { Button } from "./button";
import { supabase } from "../../lib/supabase";

interface AuthDialogProps {
  isOpen: boolean;
  onClose: () => void;
  mode: 'login' | 'signup';
}

/**
 * @description Dialog component for user authentication (login and signup)
 * @param {AuthDialogProps} props - Component props including open state, close handler, and auth mode
 * @returns {JSX.Element} Dialog with auth forms and validation
 */
export const AuthDialog = ({ isOpen, onClose, mode: initialMode }: AuthDialogProps): JSX.Element => {
  const [mode, setMode] = useState<'login' | 'signup'>(initialMode);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  // Validation error states
  const [emailError, setEmailError] = useState<string | null>(null);
  const [passwordError, setPasswordError] = useState<string | null>(null);

  // Reset form when dialog is opened/closed or mode changes
  useEffect(() => {
    setEmail("");
    setPassword("");
    setError(null);
    setEmailError(null);
    setPasswordError(null);
    setMode(initialMode);
  }, [isOpen, initialMode]);

  /**
   * @description Validates email format
   * @param {string} email - Email to validate
   * @returns {boolean} Whether the email is valid
   */
  const validateEmail = (email: string): boolean => {
    if (!email.trim()) {
      setEmailError("Email is required");
      return false;
    }
    
    // Basic email validation regex
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      setEmailError("Invalid email format");
      return false;
    }
    
    setEmailError(null);
    return true;
  };

  /**
   * @description Validates password
   * @param {string} password - Password to validate
   * @returns {boolean} Whether the password is valid
   */
  const validatePassword = (password: string): boolean => {
    if (!password.trim()) {
      setPasswordError("Password is required");
      return false;
    }
    
    if (password.length < 6) {
      setPasswordError("Password must be at least 6 characters");
      return false;
    }
    
    setPasswordError(null);
    return true;
  };

  /**
   * @description Handles login form submission
   * @async
   * @param {React.FormEvent} e - Form event
   * @sideEffects Authenticates user via Supabase, updates UI state
   */
  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Clear previous errors
    setError(null);
    
    // Validate inputs
    const isEmailValid = validateEmail(email);
    const isPasswordValid = validatePassword(password);
    
    // If validation fails, don't proceed with login
    if (!isEmailValid || !isPasswordValid) {
      return;
    }
    
    try {
      setLoading(true);
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) {
        throw error;
      }
      
      // Close the dialog on successful login
      onClose();
    } catch (err: any) {
      setError(err?.message || "Invalid login credentials");
    } finally {
      setLoading(false);
    }
  };

  /**
   * @description Handles signup form submission
   * @async
   * @param {React.FormEvent} e - Form event
   * @sideEffects Creates new user via Supabase, updates UI state
   */
  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Clear previous errors
    setError(null);
    
    // Validate inputs
    const isEmailValid = validateEmail(email);
    const isPasswordValid = validatePassword(password);
    
    // If validation fails, don't proceed with signup
    if (!isEmailValid || !isPasswordValid) {
      return;
    }
    
    try {
      setLoading(true);
      const { error } = await supabase.auth.signUp({
        email,
        password,
      });

      if (error) {
        throw error;
      }

      // Show success message and close dialog
      alert("Check your email for the confirmation link!");
      onClose();
    } catch (err: any) {
      setError(err?.message || "Error creating account");
    } finally {
      setLoading(false);
    }
  };

  /**
   * @description Handles input change for email field
   * @param {React.ChangeEvent<HTMLInputElement>} e - Input change event
   */
  const handleEmailChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setEmail(e.target.value);
    // Clear error when user starts typing
    if (emailError) setEmailError(null);
    if (error) setError(null);
  };

  /**
   * @description Handles input change for password field
   * @param {React.ChangeEvent<HTMLInputElement>} e - Input change event
   */
  const handlePasswordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setPassword(e.target.value);
    // Clear error when user starts typing
    if (passwordError) setPasswordError(null);
    if (error) setError(null);
  };

  /**
   * @description Switches between login and signup modes
   */
  const toggleMode = () => {
    setMode(mode === 'login' ? 'signup' : 'login');
    setEmail("");
    setPassword("");
    setError(null);
    setEmailError(null);
    setPasswordError(null);
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="bg-startsnap-white rounded-xl border-2 border-solid border-gray-800 shadow-[5px_5px_0px_#1f2937] p-0 overflow-hidden">
        <DialogHeader className="p-8 pb-4">
          <DialogTitle className="text-3xl font-bold text-startsnap-ebony-clay text-center font-['Space_Grotesk',Helvetica]">
            {mode === 'login' ? 'Welcome Back' : 'Create Your Account'}
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={mode === 'login' ? handleLogin : handleSignUp} className="p-8 pt-4 space-y-6">
          <div className="space-y-2">
            <Label htmlFor="email" className="block font-['Space_Grotesk',Helvetica] font-bold text-startsnap-oxford-blue text-lg">
              Email
            </Label>
            <Input
              id="email"
              type="email"
              value={email}
              onChange={handleEmailChange}
              className={`border-2 border-solid ${emailError ? 'border-red-500' : 'border-gray-800'} rounded-lg p-4 font-['Roboto',Helvetica] text-startsnap-pale-sky w-full`}
              placeholder="your.email@example.com"
              disabled={loading}
            />
            {emailError && (
              <p className="text-red-500 text-sm mt-1">{emailError}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="password" className="block font-['Space_Grotesk',Helvetica] font-bold text-startsnap-oxford-blue text-lg">
              Password
            </Label>
            <Input
              id="password"
              type="password"
              value={password}
              onChange={handlePasswordChange}
              className={`border-2 border-solid ${passwordError ? 'border-red-500' : 'border-gray-800'} rounded-lg p-4 font-['Roboto',Helvetica] text-startsnap-pale-sky w-full`}
              placeholder="••••••"
              disabled={loading}
            />
            {passwordError && (
              <p className="text-red-500 text-sm mt-1">{passwordError}</p>
            )}
          </div>

          {/* Display general error message */}
          {error && (
            <div className="bg-red-100 border border-red-300 text-red-700 px-4 py-3 rounded">
              {error}
            </div>
          )}

          <div className="flex gap-4">
            <Button
              type="button"
              onClick={onClose}
              disabled={loading}
              className="flex-1 startsnap-button bg-gray-200 text-startsnap-ebony-clay font-['Roboto',Helvetica] font-bold text-base rounded-lg border-2 border-solid border-gray-800 shadow-[3px_3px_0px_#1f2937]"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={loading}
              className="flex-1 startsnap-button bg-startsnap-french-rose text-startsnap-white font-['Roboto',Helvetica] font-bold text-base rounded-lg border-2 border-solid border-gray-800 shadow-[3px_3px_0px_#1f2937]"
            >
              {loading ? (
                "Processing..."
              ) : mode === 'login' ? (
                "Log In"
              ) : (
                "Sign Up"
              )}
            </Button>
          </div>

          <div className="text-center">
            <button
              type="button"
              onClick={toggleMode}
              className="text-startsnap-french-rose hover:underline font-['Roboto',Helvetica]"
            >
              {mode === 'login' ? (
                "Don't have an account? Sign up"
              ) : (
                "Already have an account? Log in"
              )}
            </button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};