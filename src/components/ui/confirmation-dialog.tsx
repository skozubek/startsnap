/**
 * src/components/ui/confirmation-dialog.tsx
 * @description Reusable confirmation dialog component for destructive actions with neobrutalist styling
 */

import React from 'react';
import { Button } from './button';
import { AlertTriangle, Trash2, X } from 'lucide-react';

interface ConfirmationDialogProps {
  /** Whether the dialog is open */
  isOpen: boolean;
  /** Function to close the dialog */
  onClose: () => void;
  /** Function called when user confirms the action */
  onConfirm: () => void;
  /** Title of the confirmation dialog */
  title: string;
  /** Description/warning message */
  description: string;
  /** Text for the confirm button (default: "Delete") */
  confirmText?: string;
  /** Whether the action is loading */
  isLoading?: boolean;
  /** Type of confirmation - affects styling */
  type?: 'danger' | 'warning';
}

/**
 * @description Confirmation dialog for destructive actions with neobrutalist styling
 * @param {ConfirmationDialogProps} props - Component props
 * @returns {JSX.Element | null} Confirmation dialog or null if not open
 */
export const ConfirmationDialog: React.FC<ConfirmationDialogProps> = ({
  isOpen,
  onClose,
  onConfirm,
  title,
  description,
  confirmText = 'Delete',
  isLoading = false,
  type = 'danger'
}) => {
  if (!isOpen) return null;

  /**
   * @description Handles backdrop click to close dialog
   * @param {React.MouseEvent} e - Mouse event
   */
  const handleBackdropClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  /**
   * @description Handles escape key press to close dialog
   * @param {React.KeyboardEvent} e - Keyboard event
   */
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Escape') {
      onClose();
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4"
      onClick={handleBackdropClick}
      onKeyDown={handleKeyDown}
      tabIndex={-1}
    >
      <div
        className="bg-startsnap-white border-2 border-startsnap-ebony-clay rounded-xl shadow-[4px_4px_0px_#1f2937] max-w-sm w-full animate-in zoom-in-95 duration-200"
        role="dialog"
        aria-modal="true"
        aria-labelledby="confirmation-title"
        aria-describedby="confirmation-description"
      >
          {/* Header Section */}
          <div className="border-b-2 border-startsnap-ebony-clay p-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className={`w-8 h-8 rounded-lg border-2 border-startsnap-ebony-clay flex items-center justify-center shadow-[2px_2px_0px_#1f2937] ${
                  type === 'danger'
                    ? 'bg-startsnap-french-rose'
                    : 'bg-startsnap-candlelight'
                }`}>
                  {type === 'danger' ? (
                    <Trash2 className="h-4 w-4 text-startsnap-ebony-clay" />
                  ) : (
                    <AlertTriangle className="h-4 w-4 text-startsnap-ebony-clay" />
                  )}
                </div>
                <h2
                  id="confirmation-title"
                  className="font-heading text-startsnap-ebony-clay text-xl uppercase tracking-wider"
                >
                  {title}
                </h2>
              </div>
              <button
                onClick={onClose}
                className="w-8 h-8 bg-startsnap-beige border-2 border-startsnap-ebony-clay rounded-lg hover:bg-startsnap-beige/90 active:scale-95 transition-all duration-150 flex items-center justify-center shadow-[2px_2px_0px_#1f2937] hover:shadow-[3px_3px_0px_#1f2937] hover:translate-x-[-1px] hover:translate-y-[-1px]"
                aria-label="Close dialog"
              >
                <X className="h-4 w-4 text-startsnap-ebony-clay" />
              </button>
            </div>
          </div>

          {/* Main Content Section */}
          <div className="p-6">
            {/* Warning Message */}
            <div className={`border-2 border-startsnap-ebony-clay rounded-lg p-4 mb-6 shadow-[2px_2px_0px_#1f2937] ${
              type === 'danger'
                ? 'bg-startsnap-french-rose/10'
                : 'bg-startsnap-candlelight/20'
            }`}>
              <p
                id="confirmation-description"
                className="font-medium text-startsnap-ebony-clay text-sm leading-relaxed"
              >
                {description}
              </p>
            </div>

            {/* Actions */}
            <div className="space-y-3">
              <Button
                onClick={onConfirm}
                disabled={isLoading}
                variant={type === 'danger' ? 'danger' : 'warning'}
                size="lg"
                className="w-full"
              >
                {isLoading ? 'PROCESSING...' : confirmText.toUpperCase()}
              </Button>
            </div>
          </div>
        </div>
    </div>
  );
};