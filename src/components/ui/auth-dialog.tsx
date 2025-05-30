import React, { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogTitle,
} from "@radix-ui/react-dialog";
import { Button } from "./button";
import { Input } from "./input";
import { Label } from "./label";
import { supabase } from "../../lib/supabase";

interface AuthDialogProps {
  isOpen: boolean;
  onClose: () => void;
  mode: 'signup' | 'login';
}

export function AuthDialog({ isOpen, onClose, mode: initialMode }: AuthDialogProps) {
  const [mode, setMode] = useState(initialMode);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      if (mode === 'login') {
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
      onClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[425px] bg-white rounded-xl border-[3px] border-solid border-gray-800 shadow-[5px_5px_0px_#1f2937]">
        <div className="text-center">
          <DialogTitle className="text-3xl font-bold text-startsnap-ebony-clay font-['Space_Grotesk',Helvetica] text-center">
            {mode === 'login' ? 'Welcome back' : 'Create Account'}
          </DialogTitle>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="border-2 border-solid border-gray-800 rounded-lg p-4 font-['Roboto',Helvetica] text-startsnap-pale-sky w-full"
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="password">Password</Label>
            <Input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="border-2 border-solid border-gray-800 rounded-lg p-4 font-['Roboto',Helvetica] text-startsnap-pale-sky w-full"
              required
            />
          </div>

          {error && (
            <p className="text-red-500 text-sm">{error}</p>
          )}

          <div className="space-y-2">
            <Button
              type="submit"
              disabled={loading}
              className="w-full bg-startsnap-french-rose hover:bg-startsnap-cerise text-white font-bold py-2 px-4 rounded-lg"
            >
              {loading ? 'Loading...' : mode === 'login' ? 'Sign In' : 'Sign Up'}
            </Button>

            <div className="flex justify-center mt-6">
              <Button
                type="button"
                onClick={() => setMode(mode === 'login' ? 'signup' : 'login')}
                variant="link"
                className="text-startsnap-french-rose hover:text-startsnap-cerise"
              >
                {mode === 'login'
                  ? "Don't have an account? Sign up"
                  : 'Already have an account? Sign in'}
              </Button>
            </div>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}