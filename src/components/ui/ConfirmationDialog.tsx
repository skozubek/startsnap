/**
 * src/components/ui/ConfirmationDialog.tsx
 * @description Reusable dialog component for user confirmation.
 */
import React from 'react';
import { Button } from './button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from './dialog'; // Removed DialogClose

interface ConfirmationDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  description: string;
  confirmButtonText?: string;
  cancelButtonText?: string;
  confirmButtonVariant?: 'default' | 'destructive' | 'outline' | 'secondary' | 'ghost' | 'link';
}

/**
 * @description A reusable dialog to confirm user actions.
 * @param {ConfirmationDialogProps} props - Component props.
 * @returns {JSX.Element} The confirmation dialog.
 */
export const ConfirmationDialog: React.FC<ConfirmationDialogProps> = ({
  isOpen,
  onClose, // This will be called by the Dialog's onOpenChange
  onConfirm,
  title,
  description,
  confirmButtonText = 'Confirm',
  cancelButtonText = 'Cancel',
  confirmButtonVariant = 'destructive',
}) => {
  if (!isOpen) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}> {/* onOpenChange handles closing via Esc or overlay click */}
      <DialogContent className="sm:max-w-md bg-white p-0 rounded-lg border-3 border-solid border-gray-800 shadow-[5px_5px_0px_#1f2937]">
        <DialogHeader className="p-6 pb-4">
          <DialogTitle className="text-2xl font-bold text-startsnap-ebony-clay font-['Space_Grotesk',Helvetica]">{title}</DialogTitle>
          <DialogDescription className="text-startsnap-river-bed font-['Roboto',Helvetica] pt-2">
            {description}
          </DialogDescription>
        </DialogHeader>
        <DialogFooter className="p-6 pt-4 bg-startsnap-athens-gray/50 rounded-b-lg flex flex-row justify-end gap-3">
          <Button
            type="button"
            variant="outline"
            onClick={onClose} // Cancel button directly calls onClose
            className="startsnap-button border-gray-800 text-startsnap-ebony-clay hover:bg-startsnap-mischka"
          >
            {cancelButtonText}
          </Button>
          <Button
            type="button"
            variant={confirmButtonVariant}
            onClick={onConfirm}
            className={`startsnap-button ${confirmButtonVariant === 'destructive' ? 'bg-red-600 hover:bg-red-700 text-white' : 'bg-startsnap-persian-blue hover:bg-startsnap-persian-blue/90 text-white'}`}
          >
            {confirmButtonText}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};