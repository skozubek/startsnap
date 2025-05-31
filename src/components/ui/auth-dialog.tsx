/**
 * src/components/ui/auth-dialog.tsx
 * @description Authentication dialog component that handles user login and signup
 */

import React from "react";
import { Dialog, DialogContent, DialogTitle } from "./dialog";
import { AuthForm } from "./auth-form";

interface AuthDialogProps {
  isOpen: boolean;
  onClose: () => void;
  mode: 'signup' | 'login';
}

/**
 * @description Dialog component for user authentication
 * @param {AuthDialogProps} props - Component props
 * @returns {JSX.Element} Authentication dialog with form
 */
export const AuthDialog = ({ isOpen, onClose, mode: initialMode }: AuthDialogProps): JSX.Element => {
  const [mode, setMode] = React.useState(initialMode);

  // Update mode when initialMode prop changes
  React.useEffect(() => {
    setMode(initialMode);
  }, [initialMode]);

  const toggleMode = () => {
    setMode(mode === 'login' ? 'signup' : 'login');
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[425px] bg-white p-0 gap-0">
        <DialogTitle className="text-2xl font-bold text-startsnap-ebony-clay text-center p-6 border-b border-gray-200">
          {mode === 'login' ? 'Welcome Back' : 'Join StartSnap'}
        </DialogTitle>
        <div className="p-6">
          <AuthForm mode={mode} onClose={onClose} />
          <div className="mt-4 text-center">
            <button
              onClick={toggleMode}
              className="text-startsnap-persian-blue hover:text-startsnap-french-rose transition-colors text-sm"
            >
              {mode === 'login' 
                ? "Don't have an account? Sign up" 
                : "Already have an account? Log in"}
            </button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};