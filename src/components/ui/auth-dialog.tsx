import React, { useState } from "react";
import { Dialog, DialogContent } from "./dialog";
import { AuthForm } from "./auth-form";
import { supabase } from "../../lib/supabase";

interface AuthDialogProps {
  isOpen: boolean;
  onClose: () => void;
  mode: "login" | "signup";
}

export const AuthDialog = ({ isOpen, onClose, mode }: AuthDialogProps): JSX.Element => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  /**
   * @description Handles user authentication (login or signup)
   * @async
   * @param {string} email - User's email
   * @param {string} password - User's password
   * @sideEffects Authenticates user via Supabase auth
   */
  const handleSubmit = async (email: string, password: string) => {
    setLoading(true);
    setError("");

    try {
      if (mode === "login") {
        const { error } = await supabase.auth.signInWithPassword({
          email,
          password,
        });
        if (error) throw error;
      } else {
        const { error } = await supabase.auth.signUp({
          email,
          password,
        });
        if (error) throw error;
      }
    } catch (error: any) {
      console.error('Authentication error:', error);
      setError(error.error_description || error.message || 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="w-full max-w-md bg-white rounded-xl shadow-lg p-8 border-[3px] border-gray-800">
        <h2 className="text-3xl font-bold text-startsnap-ebony-clay mb-8 font-['Space_Grotesk',Helvetica]">
          {mode === "login" ? "Welcome Back" : "Create Account"}
        </h2>
        <AuthForm
          mode={mode}
          onSubmit={handleSubmit}
          isLoading={loading}
        />
        {error && (
          <div className="bg-red-100 text-red-600 p-3 rounded-lg text-sm mt-4">
            {error}
          </div>
        )}
        <div className="text-center mt-6">
          <button
            onClick={() => onClose()}
            className="text-startsnap-pale-sky hover:text-startsnap-french-rose transition-colors"
          >
            {mode === "login"
              ? "Don't have an account? Sign up"
              : "Already have an account? Log in"}
          </button>
        </div>
      </DialogContent>
    </Dialog>
  );
};