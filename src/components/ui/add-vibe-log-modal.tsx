/**
 * src/components/ui/add-vibe-log-modal.tsx
 * @description Modal dialog for adding new vibe log entries, styled to match auth dialog
 */

import React from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "./dialog";
import { Button } from "./button";
import { VibeLogEntry } from "./vibe-log-entry";

interface AddVibeLogModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: { log_type: string; title: string; content: string }) => void;
}

/**
 * @description Modal component for adding new vibe log entries
 * @param {AddVibeLogModalProps} props - Component props
 * @returns {JSX.Element} Modal dialog with vibe log entry form
 */
export const AddVibeLogModal = ({
  isOpen,
  onClose,
  onSubmit
}: AddVibeLogModalProps): JSX.Element => {
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-[425px] p-0 bg-startsnap-white border-[3px] border-solid border-gray-800 shadow-[5px_5px_0px_#1f2937] rounded-xl overflow-hidden">
        <DialogHeader className="p-6 border-b border-gray-200">
          <DialogTitle className="text-2xl font-bold text-startsnap-ebony-clay font-['Space_Grotesk',Helvetica]">
            Add Vibe Log Entry
          </DialogTitle>
        </DialogHeader>
        <div className="p-6">
          <VibeLogEntry
            showAllTypes={true}
            onSubmit={onSubmit}
            onCancel={onClose}
            submitButtonText="Add Entry"
          />
        </div>
      </DialogContent>
    </Dialog>
  );
};