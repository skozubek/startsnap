/**
 * src/components/ui/auth-dialog.tsx
 * @description Authentication dialog component for login and signup
 */

import React from 'react';
import { Dialog, DialogContent, DialogTitle } from './dialog';
import { AuthForm } from './auth-form';

interface AuthDialogProps {
  isOpen: boolean;
  onClose: () => void;
  mode: 'login' | 'signup';
}

/**
 * @description Dialog component that contains the authentication form
 * @param {AuthDialogProps} props - Component props
 * @returns {JSX.Element} Authentication dialog with form
 */
export const AuthDialog = ({ isOpen, onClose, mode }: AuthDialogProps): JSX.Element => {
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="bg-startsnap-white p-0 border-2 border-gray-800 rounded-xl shadow-[5px_5px_0px_#1f2937] max-w-md w-full">
        <DialogTitle className="sr-only">
          {mode === 'login' ? 'Login to StartSnap' : 'Sign up for StartSnap'}
        </DialogTitle>
        <div className="p-8">
          <h2 className="text-3xl font-bold text-startsnap-ebony-clay mb-8 font-['Space_Grotesk',Helvetica]">
            {mode === 'login' ? 'Welcome Back!' : 'Join StartSnap'}
          </h2>
          <AuthForm mode={mode} onSuccess={onClose} />
        </div>
      </DialogContent>
    </Dialog>
  );
}