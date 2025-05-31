/**
 * src/components/ui/auth-form.tsx
 * @description Authentication form component for login and signup
 */

import React, { useState } from 'react';
import { Button } from './button';
import { Input } from './input';
import { Label } from './label';
import { supabase } from '../../lib/supabase';

interface AuthFormProps {
  mode: 'login' | 'signup';
  onSuccess: () => void;
}

/**
 * @description Form component for handling user authentication
 * @param {AuthFormProps} props - Component props
 * @returns {JSX.Element} Authentication form with email/password fields
 */
export const AuthForm = ({ mode, onSuccess }: AuthFormProps): JSX.Element => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  /**
   * @description Handles form submission for both login and signup
   * @async
   * @param {React.FormEvent} e - Form submission event
   * @sideEffects Authenticates user via Supabase auth
   */
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      if (mode === 'signup') {
        const { error: signUpError } = await supabase.auth.signUp({
          email,
          password,
          options: {
            emailRedirectTo: window.location.origin
          }
        });

        if (signUpError) {
          if (signUpError.message.includes('already registered')) {
            setError('This email is already registered. Please try logging in instead.');
          } else {
            throw signUpError;
          }
        } else {
          alert('Please check your email to confirm your account!');
          onSuccess();
        }
      } else {
        const { error: signInError } = await supabase.auth.signInWithPassword({
          email,
          password
        });

        if (signInError) {
          if (signInError.message.includes('Invalid login credentials')) {
            setError('Invalid email or password. Please try again.');
          } else {
            throw signInError;
          }
        } else {
          onSuccess();
        }
      }
    } catch (err) {
      console.error('Auth error:', err);
      setError('An unexpected error occurred. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="space-y-2">
        <Label htmlFor="email" className="text-startsnap-oxford-blue font-['Space_Grotesk',Helvetica] font-bold">
          Email
        </Label>
        <Input
          id="email"
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
          className="border-2 border-solid border-gray-800 rounded-lg p-4 font-['Roboto',Helvetica] text-startsnap-pale-sky"
          placeholder="Enter your email"
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="password" className="text-startsnap-oxford-blue font-['Space_Grotesk',Helvetica] font-bold">
          Password
        </Label>
        <Input
          id="password"
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
          className="border-2 border-solid border-gray-800 rounded-lg p-4 font-['Roboto',Helvetica] text-startsnap-pale-sky"
          placeholder="Enter your password"
        />
      </div>

      {error && (
        <p className="text-startsnap-french-rose text-sm">{error}</p>
      )}

      <Button
        type="submit"
        disabled={loading}
        className="w-full startsnap-button bg-startsnap-french-rose text-startsnap-white font-['Roboto',Helvetica] font-bold text-base rounded-lg border-2 border-solid border-gray-800 shadow-[3px_3px_0px_#1f2937] flex items-center justify-center gap-2"
      >
        {loading ? (
          <>
            <span className="material-icons animate-spin">refresh</span>
            {mode === 'login' ? 'Logging in...' : 'Signing up...'}
          </>
        ) : (
          mode === 'login' ? 'Login' : 'Sign Up'
        )}
      </Button>
    </form>
  );
}