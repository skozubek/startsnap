/**
 * src/components/ui/auth-dialog.tsx
 * @description Authentication dialog component for user login and registration
 */

import React, { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "./dialog";
import { Input } from "./input";
import { Button } from "./button";
import { Label } from "./label";
import { supabase } from "../../lib/supabase";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { authFormSchema } from "../../lib/form-schemas";
import * as z from "zod";

interface AuthDialogProps {
  isOpen: boolean;
  onClose: () => void;
  mode: 'signup' | 'login';
}

type AuthFormValues = z.infer<typeof authFormSchema>;

/**
 * @description Dialog component for user authentication (signup/login)
 * @param {AuthDialogProps} props - Component props
 * @returns {JSX.Element} Authentication dialog with form
 */
export const AuthDialog = ({ isOpen, onClose, mode }: AuthDialogProps): JSX.Element => {
  const [isLoading, setIsLoading] = useState(false);
  const [authMode, setAuthMode] = useState<'signup' | 'login'>(mode);
  const [authError, setAuthError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset
  } = useForm<AuthFormValues>({
    resolver: zodResolver(authFormSchema),
    defaultValues: {
      email: "",
      password: ""
    }
  });

  const handleClose = () => {
    reset();
    setAuthError(null);
    onClose();
  };

  /**
   * @description Toggles between signup and login modes
   */
  const toggleAuthMode = () => {
    setAuthMode(authMode === 'login' ? 'signup' : 'login');
    setAuthError(null);
  };

  /**
   * @description Handles form submission for both signup and login
   * @async
   * @param {AuthFormValues} data - Form data containing email and password
   * @sideEffects Attempts authentication with Supabase and closes dialog on success
   */
  const onSubmit = async (data: AuthFormValues) => {
    try {
      setIsLoading(true);
      setAuthError(null);

      if (authMode === 'signup') {
        // Sign up with email
        const { error } = await supabase.auth.signUp({
          email: data.email,
          password: data.password,
        });

        if (error) throw error;

        alert('Signup successful! Please check your email for a confirmation link.');
        handleClose();
      } else {
        // Sign in with email
        const { error } = await supabase.auth.signInWithPassword({
          email: data.email,
          password: data.password,
        });

        if (error) throw error;

        handleClose();
      }
    } catch (error: any) {
      console.error('Authentication error:', error);
      setAuthError(error.message || 'An error occurred during authentication');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="bg-startsnap-white rounded-xl overflow-hidden border-[3px] border-solid border-gray-800 shadow-[5px_5px_0px_#1f2937] p-0 w-[450px]">
        <DialogHeader className="bg-startsnap-french-pass border-b-2 border-gray-800 p-6">
          <DialogTitle className="font-['Space_Grotesk',Helvetica] font-bold text-startsnap-oxford-blue text-2xl">
            {authMode === 'signup' ? 'Sign Up' : 'Login'}
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="p-6 space-y-6">
          {authError && (
            <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
              {authError}
            </div>
          )}

          <div className="space-y-4">
            <div className="space-y-2">
              <Label
                htmlFor="email"
                className="font-['Space_Grotesk',Helvetica] font-bold text-startsnap-oxford-blue text-base"
              >
                Email
              </Label>
              <Input
                id="email"
                type="email"
                placeholder="Your email"
                className="border-2 border-solid border-gray-800 rounded-lg p-3 font-['Roboto',Helvetica] text-startsnap-pale-sky"
                {...register("email")}
              />
              {errors.email && (
                <p className="text-red-500 text-sm mt-1">{errors.email.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label
                htmlFor="password"
                className="font-['Space_Grotesk',Helvetica] font-bold text-startsnap-oxford-blue text-base"
              >
                Password
              </Label>
              <Input
                id="password"
                type="password"
                placeholder="Your password"
                className="border-2 border-solid border-gray-800 rounded-lg p-3 font-['Roboto',Helvetica] text-startsnap-pale-sky"
                {...register("password")}
              />
              {errors.password && (
                <p className="text-red-500 text-sm mt-1">{errors.password.message}</p>
              )}
            </div>
          </div>

          <div className="space-y-4">
            <Button
              type="submit"
              disabled={isLoading}
              className="w-full startsnap-button bg-startsnap-french-rose text-startsnap-white font-['Roboto',Helvetica] font-bold rounded-lg border-2 border-solid border-gray-800 shadow-[3px_3px_0px_#1f2937]"
            >
              {isLoading
                ? 'Processing...'
                : authMode === 'signup'
                  ? 'Sign Up'
                  : 'Login'}
            </Button>

            <div className="text-center">
              <button
                type="button"
                onClick={toggleAuthMode}
                className="font-['Roboto',Helvetica] text-startsnap-persian-blue hover:underline text-sm"
              >
                {authMode === 'signup'
                  ? 'Already have an account? Login'
                  : "Don't have an account? Sign Up"}
              </button>
            </div>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};