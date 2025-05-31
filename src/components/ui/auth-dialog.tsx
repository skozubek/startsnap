/**
 * src/components/ui/auth-dialog.tsx
 * @description Authentication dialog component for login and signup
 */

import React from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "./dialog";
import { AuthForm } from "./auth-form";

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
      <DialogContent className="bg-startsnap-white rounded-xl overflow-hidden border-[3px] border-solid border-gray-800 shadow-[5px_5px_0px_#1f2937] p-0 gap-0">
        <div className="bg-startsnap-french-pass border-b-[3px] border-gray-800 p-6">
          <DialogHeader>
            <DialogTitle className="text-3xl font-bold text-startsnap-persian-blue text-center font-['Space_Grotesk',Helvetica]">
              {mode === 'login' ? 'Welcome Back!' : 'Join StartSnap'}
            </DialogTitle>
          </DialogHeader>
        </div>
        <div className="p-6">
          <AuthForm mode={mode} onClose={onClose} />
        </div>
      </DialogContent>
    </Dialog>
  );
};