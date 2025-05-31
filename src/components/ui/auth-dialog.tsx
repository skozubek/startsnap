/**
 * src/components/ui/auth-dialog.tsx
 * @description Authentication dialog component for login and signup functionality
 */

import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from './dialog';
import { Button } from './button';
import { Input } from './input';
import { Label } from './label';
import { supabase } from '../../lib/supabase';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { authFormSchema } from '../../lib/form-schemas';
import * as z from 'zod';

interface AuthDialogProps {
  isOpen: boolean;
  onClose: () => void;
  mode: 'login' | 'signup';
}

/**
 * @description Authentication dialog component for handling user login and signup
 * @param {AuthDialogProps} props - Component props containing dialog state and mode
 * @returns {JSX.Element} Authentication dialog with form fields and submit button
 */
export const AuthDialog = ({ isOpen, onClose, mode }: AuthDialogProps): JSX.Element => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset
  } = useForm<z.infer<typeof authFormSchema>>({
    resolver: zodResolver(authFormSchema),
    defaultValues: {
      email: '',
      password: ''
    }
  });

  /**
   * @description Handles form submission for both login and signup flows
   * @param {Object} data - Form data with email and password
   * @async
   * @sideEffects Authenticates user with Supabase and updates auth state
   */
  const onSubmit = async (data: z.infer<typeof authFormSchema>) => {
    setIsLoading(true);
    setError(null);

    try {
      if (mode === 'signup') {
        const { error: signUpError } = await supabase.auth.signUp({
          email: data.email,
          password: data.password,
        });

        if (signUpError) throw signUpError;
        
        // Close the dialog on successful signup
        onClose();
        reset();
        alert('Check your email for the confirmation link!');
      } else {
        const { error: signInError } = await supabase.auth.signInWithPassword({
          email: data.email,
          password: data.password,
        });

        if (signInError) throw signInError;
        
        // Close the dialog on successful login
        onClose();
        reset();
      }
    } catch (error: any) {
      console.error('Authentication error:', error);
      setError(error.message || 'An error occurred during authentication');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => {
      if (!open) {
        onClose();
        reset();
        setError(null);
      }
    }}>
      <DialogContent className="sm:max-w-[425px] bg-startsnap-white rounded-xl overflow-hidden border-[3px] border-solid border-gray-800 shadow-[5px_5px_0px_#1f2937]">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold text-startsnap-ebony-clay font-['Space_Grotesk',Helvetica]">
            {mode === 'login' ? 'Log In' : 'Sign Up'}
          </DialogTitle>
        </DialogHeader>
        
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 py-4">
          <div className="space-y-2">
            <Label htmlFor="email" className="font-['Space_Grotesk',Helvetica] font-bold text-startsnap-oxford-blue">
              Email
            </Label>
            <Input
              id="email"
              {...register('email')}
              placeholder="your.email@example.com"
              className="border-2 border-solid border-gray-800 rounded-lg p-4 font-['Roboto',Helvetica] text-startsnap-pale-sky"
            />
            {errors.email && (
              <p className="text-red-500 text-sm mt-1">{errors.email.message}</p>
            )}
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="password" className="font-['Space_Grotesk',Helvetica] font-bold text-startsnap-oxford-blue">
              Password
            </Label>
            <Input
              id="password"
              type="password"
              {...register('password')}
              placeholder="Your password"
              className="border-2 border-solid border-gray-800 rounded-lg p-4 font-['Roboto',Helvetica] text-startsnap-pale-sky"
            />
            {errors.password && (
              <p className="text-red-500 text-sm mt-1">{errors.password.message}</p>
            )}
          </div>
          
          {error && (
            <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative">
              <span className="block sm:inline">{error}</span>
            </div>
          )}
          
          <div className="flex justify-end mt-6">
            <Button
              type="submit"
              disabled={isLoading}
              className="startsnap-button bg-startsnap-french-rose text-startsnap-white font-['Roboto',Helvetica] font-bold rounded-lg border-2 border-solid border-gray-800 shadow-[3px_3px_0px_#1f2937]"
            >
              {isLoading ? 'Processing...' : mode === 'login' ? 'Log In' : 'Sign Up'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};