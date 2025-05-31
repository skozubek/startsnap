/**
 * src/components/ui/auth-dialog.tsx
 * @description Authentication dialog component that handles user login and signup
 */

import React, { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from './dialog';
import { AuthForm } from './auth-form';

interface AuthDialogProps {
  isOpen: boolean;
  onClose: () => void;
  mode: 'login' | 'signup';
}

/**
 * @description Dialog component for authentication that supports both login and signup
 * @param {AuthDialogProps} props - Component props
 * @returns {JSX.Element} Authentication dialog with form
 */
export const AuthDialog = ({ isOpen, onClose, mode: initialMode }: AuthDialogProps): JSX.Element => {
  const [mode, setMode] = useState(initialMode);

  const toggleMode = () => {
    setMode(mode === 'login' ? 'signup' : 'login');
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[425px] bg-white p-0 gap-0">
        <DialogHeader className="bg-startsnap-french-pass p-6 rounded-t-lg border-b-2 border-gray-800">
          <DialogTitle className="text-2xl font-bold text-startsnap-ebony-clay text-center font-['Space_Grotesk',Helvetica]">
            {mode === 'login' ? 'Welcome Back!' : 'Join StartSnap'}
          </DialogTitle>
        </DialogHeader>
        
        <div className="p-6">
          <AuthForm mode={mode} onSuccess={onClose} />
          
          <div className="mt-4 text-center">
            <button
              onClick={toggleMode}
              className="text-startsnap-persian-blue hover:text-startsnap-french-rose transition-colors font-['Roboto',Helvetica]"
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