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

  const iconColor = type === 'danger' ? 'text-red-600' : 'text-yellow-600';
  const confirmButtonStyle = type === 'danger'
    ? 'startsnap-button bg-red-600 hover:bg-red-700 text-white font-[\'Roboto\',Helvetica] font-bold rounded-lg border-2 border-solid border-gray-800 shadow-[3px_3px_0px_#1f2937]'
    : 'startsnap-button bg-yellow-600 hover:bg-yellow-700 text-white font-[\'Roboto\',Helvetica] font-bold rounded-lg border-2 border-solid border-gray-800 shadow-[3px_3px_0px_#1f2937]';

  return (
    <div
      className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4"
      onClick={handleBackdropClick}
      onKeyDown={handleKeyDown}
      tabIndex={-1}
    >
      <div
        className="bg-startsnap-white border-2 border-gray-800 rounded-xl shadow-[3px_3px_0px_#1f2937] md:border-4 md:shadow-[6px_6px_0px_#1f2937] max-w-xs p-6 sm:max-w-md sm:p-8 w-full animate-in zoom-in-95 duration-200"
        role="dialog"
        aria-modal="true"
        aria-labelledby="confirmation-title"
        aria-describedby="confirmation-description"
      >
        {/* Header */}
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-center gap-3">
            {type === 'danger' ? (
              <Trash2 className={`h-6 w-6 ${iconColor}`} />
            ) : (
              <AlertTriangle className={`h-6 w-6 ${iconColor}`} />
            )}
            <h2
              id="confirmation-title"
              className="font-['Space_Grotesk',Helvetica] font-bold text-startsnap-ebony-clay text-xl leading-7"
            >
              {title}
            </h2>
          </div>
          <Button
            variant="ghost"
            size="icon"
            onClick={onClose}
            className="h-8 w-8 p-0 hover:bg-startsnap-mischka/20"
            aria-label="Close dialog"
          >
            <X className="h-4 w-4" />
          </Button>
        </div>

        {/* Content */}
        <p
          id="confirmation-description"
          className="font-['Roboto',Helvetica] text-startsnap-river-bed text-base leading-6 mb-6"
        >
          {description}
        </p>

        {/* Actions */}
        <Button
          onClick={onConfirm}
          disabled={isLoading}
          className={`w-full ${confirmButtonStyle} py-3 text-base`}
        >
          {isLoading ? 'Deleting...' : confirmText}
        </Button>
      </div>
    </div>
  );
};