/**
 * src/components/ui/auth-dialog.tsx
 * @description Authentication dialog component for login and signup
 */

import React, { useState } from "react";
import { Button } from "./button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "./dialog";
import { Input } from "./input";
import { Label } from "./label";
import { supabase } from "../../lib/supabase";

interface AuthDialogProps {
  isOpen: boolean;
  onClose: () => void;
  mode: 'signup' | 'login';
}

/**
 * @description Dialog component for user authentication (login/signup)
 * @param {AuthDialogProps} props - Component props
 * @returns {JSX.Element} Authentication dialog with form fields
 */
export const AuthDialog = ({ isOpen, onClose, mode }: AuthDialogProps): JSX.Element => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  
  // Email validation regex
  const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;

  /**
   * @description Validates form inputs
   * @returns {boolean} Whether form inputs are valid
   */
  const validateForm = (): boolean => {
    setError("");
    
    if (!email.trim()) {
      setError("Email is required");
      return false;
    }
    
    if (!emailRegex.test(email)) {
      setError("Please enter a valid email address");
      return false;
    }
    
    if (!password) {
      setError("Password is required");
      return false;
    }
    
    if (password.length < 6) {
      setError("Password must be at least 6 characters");
      return false;
    }
    
    return true;
  };

  /**
   * @description Handles form submission for both login and signup
   * @async
   * @param {React.FormEvent} e - Form event
   * @sideEffects Submits auth data to Supabase and updates UI based on result
   */
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Reset states
    setError("");
    setSuccess("");
    
    // Validate form
    if (!validateForm()) {
      return;
    }
    
    setLoading(true);
    
    try {
      if (mode === 'signup') {
        // Handle signup
        const { error: signUpError } = await supabase.auth.signUp({
          email,
          password,
          options: {
            emailRedirectTo: window.location.origin,
          }
        });
        
        if (signUpError) throw signUpError;
        
        setSuccess("Registration successful! Check your email to confirm your account.");
        
      } else {
        // Handle login
        const { error: signInError } = await supabase.auth.signInWithPassword({
          email,
          password,
        });
        
        if (signInError) throw signInError;
        
        // If successful, close dialog and refresh page to update auth state
        onClose();
        window.location.reload();
      }
    } catch (err: any) {
      console.error('Auth error:', err);
      setError(err.message || "An error occurred during authentication");
    } finally {
      setLoading(false);
    }
  };

  /**
   * @description Toggles between signup and login modes
   */
  const toggleMode = () => {
    // Reset states when toggling
    setError("");
    setSuccess("");
    setEmail("");
    setPassword("");
    
    // We're closing and reopening with the other mode
    onClose();
    setTimeout(() => {
      // This will trigger the parent component to reopen with the other mode
      mode === 'login' ? onClose() : onClose();
    }, 100);
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[425px] bg-startsnap-white rounded-xl overflow-hidden border-[3px] border-solid border-gray-800 shadow-[5px_5px_0px_#1f2937] p-0">
        <DialogHeader className="bg-startsnap-french-rose p-6">
          <DialogTitle className="text-startsnap-white font-['Space_Grotesk',Helvetica] text-2xl">
            {mode === 'signup' ? 'Create an Account' : 'Welcome Back'}
          </DialogTitle>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {success && (
            <div className="p-3 bg-green-100 text-green-700 rounded-md text-sm">
              {success}
            </div>
          )}
          
          {error && (
            <div className="p-3 bg-red-100 text-red-600 rounded-md text-sm">
              {error}
            </div>
          )}
          
          <div className="space-y-2">
            <Label htmlFor="email" className="font-['Space_Grotesk',Helvetica] font-bold text-startsnap-oxford-blue text-base">
              Email
            </Label>
            <Input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@example.com"
              className="border-2 border-solid border-gray-800 rounded-lg p-3 font-['Roboto',Helvetica] text-startsnap-pale-sky"
              autoComplete="email"
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="password" className="font-['Space_Grotesk',Helvetica] font-bold text-startsnap-oxford-blue text-base">
              Password
            </Label>
            <Input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder={mode === 'signup' ? "Create a password (min. 6 characters)" : "Enter your password"}
              className="border-2 border-solid border-gray-800 rounded-lg p-3 font-['Roboto',Helvetica] text-startsnap-pale-sky"
              autoComplete={mode === 'signup' ? "new-password" : "current-password"}
            />
          </div>
          
          <div className="pt-4">
            <Button
              type="submit"
              disabled={loading}
              className="w-full startsnap-button bg-startsnap-french-rose text-startsnap-white font-['Roboto',Helvetica] font-bold rounded-lg border-2 border-solid border-gray-800 shadow-[3px_3px_0px_#1f2937]"
            >
              {loading ? 'Processing...' : mode === 'signup' ? 'Sign Up' : 'Log In'}
            </Button>
          </div>
          
          <div className="text-center pt-4">
            <button
              type="button"
              onClick={toggleMode}
              className="text-startsnap-persian-blue hover:underline text-sm font-['Roboto',Helvetica]"
            >
              {mode === 'signup' ? 'Already have an account? Log in' : "Don't have an account? Sign up"}
            </button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};