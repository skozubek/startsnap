/**
 * src/components/ui/auth-dialog.tsx
 * @description Authentication dialog component for login and signup functionality
 */

import React, { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { authFormSchema } from "../../lib/form-schemas";
import * as z from "zod";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "./dialog";
import { Label } from "./label";
import { Input } from "./input";
import { Button } from "./button";
import { supabase } from "../../lib/supabase";

type AuthFormValues = z.infer<typeof authFormSchema>;

interface AuthDialogProps {
  isOpen: boolean;
  onClose: () => void;
  mode: "login" | "signup";
}

/**
 * @description Authentication dialog component for user login and signup
 * @param {AuthDialogProps} props - Component props
 * @returns {JSX.Element} Dialog with authentication form
 */
export const AuthDialog = ({ isOpen, onClose, mode: initialMode }: AuthDialogProps): JSX.Element => {
  const [mode, setMode] = useState<"login" | "signup">(initialMode);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

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

  /**
   * @description Handles form submission for both login and signup
   * @async
   * @param {AuthFormValues} data - Form data with email and password
   * @sideEffects Authenticates user with Supabase and closes dialog on success
   */
  const onSubmit = async (data: AuthFormValues) => {
    setLoading(true);
    setError(null);

    try {
      if (mode === "login") {
        const { error } = await supabase.auth.signInWithPassword({
          email: data.email,
          password: data.password,
        });

        if (error) throw error;
      } else {
        const { error } = await supabase.auth.signUp({
          email: data.email,
          password: data.password,
        });

        if (error) throw error;
      }

      reset();
      onClose();
    } catch (err: any) {
      console.error("Authentication error:", err);
      setError(err.message || "An error occurred during authentication");
    } finally {
      setLoading(false);
    }
  };

  /**
   * @description Toggles between login and signup modes
   */
  const toggleMode = () => {
    setMode(prevMode => prevMode === "login" ? "signup" : "login");
    setError(null);
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md p-0 border-2 border-solid border-gray-800 rounded-lg overflow-hidden">
        <DialogHeader className="bg-[#d6e5fa] p-6 border-b border-gray-300">
          <DialogTitle className="text-2xl font-bold text-startsnap-ebony-clay">
            {mode === "login" ? "Login" : "Sign Up"}
          </DialogTitle>
        </DialogHeader>
        <div className="p-6">
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="email" className="text-lg font-medium text-startsnap-oxford-blue">
                Email
              </Label>
              <Input
                id="email"
                type="email"
                placeholder="Your email"
                className="border-2 border-solid border-gray-800 rounded-lg p-3 w-full"
                {...register("email")}
              />
              {errors.email && (
                <p className="text-red-500 text-sm mt-1">{errors.email.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="password" className="text-lg font-medium text-startsnap-oxford-blue">
                Password
              </Label>
              <Input
                id="password"
                type="password"
                placeholder="Your password"
                className="border-2 border-solid border-gray-800 rounded-lg p-3 w-full"
                {...register("password")}
              />
              {errors.password && (
                <p className="text-red-500 text-sm mt-1">{errors.password.message}</p>
              )}
            </div>

            {error && (
              <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative">
                {error}
              </div>
            )}

            <Button
              type="submit"
              disabled={loading}
              className="w-full bg-startsnap-french-rose text-white rounded-lg py-3 border-2 border-solid border-gray-800"
            >
              {loading ? "Loading..." : mode === "login" ? "Login" : "Sign Up"}
            </Button>

            <div className="text-center mt-4">
              <button
                type="button"
                onClick={toggleMode}
                className="text-blue-600 hover:underline font-medium"
              >
                {mode === "login" ? "Don't have an account? Sign Up" : "Already have an account? Login"}
              </button>
            </div>
          </form>
        </div>
      </DialogContent>
    </Dialog>
  );
};