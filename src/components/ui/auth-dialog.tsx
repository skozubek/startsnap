/**
 * src/components/ui/auth-dialog.tsx
 * @description Authentication dialog component for user login and signup
 */

import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from './dialog';
import { Button } from './button';
import { Input } from './input';
import { Label } from './label';
import { supabase } from '../../lib/supabase';
import { FaXTwitter } from 'react-icons/fa6';

interface AuthDialogProps {
  isOpen: boolean;
  onClose: () => void;
  mode: 'login' | 'signup';
  onSuccess?: () => void;
}

/**
 * @description Authentication dialog component with email/password and Twitter OAuth options
 * @param {AuthDialogProps} props - Component props
 * @returns {JSX.Element} Auth dialog with login/signup forms and Twitter OAuth
 */
export const AuthDialog: React.FC<AuthDialogProps> = ({ isOpen, onClose, mode, onSuccess }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  /**
   * @description Handles Twitter OAuth authentication
   * @async
   * @sideEffects Initiates OAuth flow with Twitter provider via Supabase
   */
  const handleTwitterAuth = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'twitter',
        options: {
          redirectTo: window.location.origin + window.location.pathname,
        }
      });
      
      if (error) throw error;
      
      // OAuth will redirect, so we don't need to handle success here
      // The auth state change will be handled by the AuthProvider
      
    } catch (error: any) {
      console.error('Twitter auth error:', error);
      setError(error.message || 'Failed to authenticate with Twitter');
    } finally {
      setLoading(false);
    }
  };

  /**
   * @description Handles email/password authentication
   * @async
   * @param {React.FormEvent} e - Form submission event
   * @sideEffects Authenticates user via Supabase auth
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

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md bg-startsnap-white border-2 border-gray-800 rounded-lg shadow-[5px_5px_0px_#1f2937]">
        <DialogHeader>
          <DialogTitle className="font-['Space_Grotesk',Helvetica] font-bold text-startsnap-ebony-clay text-2xl text-center">
            {mode === 'login' ? 'Welcome Back!' : 'Join the Vibe!'}
          </DialogTitle>
        </DialogHeader>
        
        <div className="space-y-6 p-6">
          {/* Twitter OAuth Button */}
          <Button
            onClick={handleTwitterAuth}
            disabled={loading}
            className="w-full startsnap-button bg-startsnap-ebony-clay text-startsnap-white font-['Roboto',Helvetica] font-bold text-base rounded-lg border-2 border-solid border-gray-800 shadow-[3px_3px_0px_#1f2937] flex items-center justify-center gap-3 py-3"
          >
            <FaXTwitter size={20} />
            {mode === 'login' ? 'Continue with Twitter' : 'Sign up with Twitter'}
          </Button>
          
          {/* Divider */}
          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <span className="w-full border-t border-gray-300" />
            </div>
            <div className="relative flex justify-center text-xs uppercase">
              <span className="bg-startsnap-white px-2 text-startsnap-pale-sky font-['Roboto',Helvetica]">
                Or continue with email
              </span>
            </div>
          </div>

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
                className="border-2 border-solid border-gray-800 rounded-lg p-3 font-['Roboto',Helvetica]"
                placeholder="Enter your email"
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
                className="border-2 border-solid border-gray-800 rounded-lg p-3 font-['Roboto',Helvetica]"
                placeholder="Enter your password"
              />
            </div>
            
            {error && (
              <div className="text-red-500 text-sm font-['Roboto',Helvetica]">
                {error}
              </div>
            )}
            
            <Button
              type="submit"
              disabled={loading}
              className="w-full startsnap-button bg-startsnap-french-rose text-startsnap-white font-['Roboto',Helvetica] font-bold text-base rounded-lg border-2 border-solid border-gray-800 shadow-[3px_3px_0px_#1f2937]"
            >
              {loading ? 'Loading...' : (mode === 'login' ? 'Sign In' : 'Sign Up')}
            </Button>
          </form>
        </div>
      </DialogContent>
    </Dialog>
  );
};