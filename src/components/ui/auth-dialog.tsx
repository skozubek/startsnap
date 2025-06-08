/**
 * src/components/ui/auth-dialog.tsx
 * @description Authentication dialog component for user login and signup
 */

import React, { useState } from "react";
import { Button } from "./button";
import { Input } from "./input";
import { Label } from "./label";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "./dialog";
import { supabase } from "../../lib/supabase";

interface AuthDialogProps {
  isOpen: boolean;
  onClose: () => void;
  mode: 'login' | 'signup';
  onSuccess?: () => void;
}

/**
 * @description Authentication dialog component that handles both login and signup
 * @param {AuthDialogProps} props - Component props
 * @param {boolean} props.isOpen - Whether the dialog is open
 * @param {() => void} props.onClose - Function to close the dialog
 * @param {'login' | 'signup'} props.mode - Authentication mode
 * @param {() => void} [props.onSuccess] - Optional callback on successful authentication
 * @returns {JSX.Element} Authentication dialog component
 */
export const AuthDialog = ({ isOpen, onClose, mode, onSuccess }: AuthDialogProps): JSX.Element => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  /**
   * @description Handles form submission for authentication
   * @async
   * @param {React.FormEvent} e - Form event
   * @sideEffects Authenticates user via Supabase and closes dialog on success
   */
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      if (mode === 'signup') {
        const { error } = await supabase.auth.signUp({
          email,
          password,
        });
        if (error) throw error;
        alert('Check your email for the confirmation link!');
      } else {
        const { error } = await supabase.auth.signInWithPassword({
          email,
          password,
        });
        if (error) throw error;
      }
      
      onClose();
      if (onSuccess) {
        onSuccess();
      }
    } catch (error: any) {
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  /**
   * @description Handles Twitter OAuth authentication
   * @async
   * @sideEffects Initiates Twitter OAuth flow via Supabase
   */
  const handleTwitterAuth = async () => {
    try {
      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'twitter',
        options: {
          redirectTo: `${window.location.origin}`
        }
      });
      if (error) throw error;
    } catch (error: any) {
      setError(error.message);
    }
  };

  /**
   * @description Resets form state when dialog closes
   */
  const handleClose = () => {
    setEmail('');
    setPassword('');
    setError(null);
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-md bg-startsnap-white border-2 border-gray-800 rounded-lg shadow-[3px_3px_0px_#1f2937]">
        <DialogHeader>
          <DialogTitle className="font-['Space_Grotesk',Helvetica] font-bold text-startsnap-ebony-clay text-2xl">
            {mode === 'login' ? 'Welcome Back!' : 'Join the Vibe Coders'}
          </DialogTitle>
          <DialogDescription className="font-['Roboto',Helvetica] text-startsnap-river-bed">
            {mode === 'login' 
              ? 'Sign in to your account to continue building in public'
              : 'Create your account and start sharing your StartSnaps'
            }
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="email" className="font-['Space_Grotesk',Helvetica] font-bold text-startsnap-oxford-blue">
              Email
            </Label>
            <Input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="border-2 border-solid border-gray-800 rounded-lg p-3 font-['Roboto',Helvetica] text-startsnap-pale-sky"
              placeholder="your@email.com"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="password" className="font-['Space_Grotesk',Helvetica] font-bold text-startsnap-oxford-blue">
              Password
            </Label>
            <Input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              className="border-2 border-solid border-gray-800 rounded-lg p-3 font-['Roboto',Helvetica] text-startsnap-pale-sky"
              placeholder="Enter your password"
            />
          </div>

          {error && (
            <div className="text-red-600 text-sm font-['Roboto',Helvetica]">
              {error}
            </div>
          )}

          <Button
            type="submit"
            disabled={loading}
            className="w-full startsnap-button bg-startsnap-french-rose text-startsnap-white font-['Roboto',Helvetica] font-bold rounded-lg border-2 border-solid border-gray-800 shadow-[3px_3px_0px_#1f2937]"
          >
            {loading ? 'Processing...' : (mode === 'login' ? 'Sign In' : 'Create Account')}
          </Button>
        </form>

        <div className="relative">
          <div className="absolute inset-0 flex items-center">
            <span className="w-full border-t border-gray-300" />
          </div>
          <div className="relative flex justify-center text-xs uppercase">
            <span className="bg-startsnap-white px-2 text-startsnap-pale-sky font-['Roboto',Helvetica]">
              Or continue with
            </span>
          </div>
        </div>

        <Button
          type="button"
          variant="outline"
          onClick={handleTwitterAuth}
          className="w-full startsnap-button bg-gray-200 text-startsnap-ebony-clay font-['Roboto',Helvetica] font-bold rounded-lg border-2 border-solid border-gray-800 shadow-[3px_3px_0px_#1f2937] flex items-center justify-center gap-2"
        >
          <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
            <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
          </svg>
          Continue with X (Twitter)
        </Button>
      </DialogContent>
    </Dialog>
  );
};