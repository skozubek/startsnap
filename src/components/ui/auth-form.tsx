/**
 * src/components/ui/auth-form.tsx
 * @description Authentication form component for login and signup
 */

import React, { useState } from "react";
import { Button } from "./button";
import { Input } from "./input";
import { Label } from "./label";
import { supabase } from "../../lib/supabase";

interface AuthFormProps {
  mode: 'login' | 'signup';
  onClose: () => void;
}

/**
 * @description Form component for handling user authentication
 * @param {AuthFormProps} props - Component props
 * @returns {JSX.Element} Authentication form with email/password inputs
 */
export const AuthForm = ({ mode, onClose }: AuthFormProps): JSX.Element => {
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
        const { error } = await supabase.auth.signUp({
          email,
          password,
        });
        
        if (error) {
          if (error.message.includes('already registered')) {
            setError('This email is already registered. Please log in instead.');
          } else {
            setError(error.message);
          }
          return;
        }
        
        onClose();
        alert('Check your email to confirm your account!');
      } else {
        const { error } = await supabase.auth.signInWithPassword({
          email,
          password,
        });

        if (error) {
          if (error.message.includes('Invalid login credentials')) {
            setError('Invalid email or password.');
          } else {
            setError(error.message);
          }
          return;
        }

        onClose();
      }
    } catch (err) {
      setError('An unexpected error occurred. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="email" className="text-startsnap-oxford-blue font-['Space_Grotesk',Helvetica] font-bold">
            Email
          </Label>
          <Input
            id="email"
            type="email"
            value={email}
            onChange={(e) => {
              setEmail(e.target.value);
              setError('');
            }}
            placeholder="you@example.com"
            required
            className="border-2 border-solid border-gray-800 rounded-lg p-4 font-['Roboto',Helvetica] text-startsnap-pale-sky"
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
            onChange={(e) => {
              setPassword(e.target.value);
              setError('');
            }}
            placeholder="••••••••"
            required
            minLength={6}
            className="border-2 border-solid border-gray-800 rounded-lg p-4 font-['Roboto',Helvetica] text-startsnap-pale-sky"
          />
        </div>

        {error && (
          <p className="text-startsnap-french-rose text-sm font-['Roboto',Helvetica]">{error}</p>
        )}
      </div>

      <Button
        type="submit"
        disabled={loading}
        className="w-full startsnap-button bg-startsnap-french-rose text-startsnap-white font-['Roboto',Helvetica] font-bold text-base rounded-lg border-2 border-solid border-gray-800 shadow-[3px_3px_0px_#1f2937] py-6"
      >
        {loading ? (
          <span className="flex items-center justify-center">
            <span className="material-icons animate-spin mr-2">refresh</span>
            {mode === 'login' ? 'Logging in...' : 'Signing up...'}
          </span>
        ) : (
          mode === 'login' ? 'Login' : 'Sign Up'
        )}
      </Button>
    </form>
  );
};