/**
 * src/components/ui/add-vibe-log-modal.tsx
 * @description Modal component for adding new vibe log entries
 */

import React from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "./dialog";
import { Button } from "./button";
import { VibeLogEntry } from "./vibe-log-entry";

interface AddVibeLogModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: { log_type: string; title: string; content: string }) => void;
}

/**
 * @description Modal dialog for adding new vibe log entries
 * @param {AddVibeLogModalProps} props - Component props
 * @returns {JSX.Element} Modal with vibe log entry form
 */
export const AddVibeLogModal = ({
  isOpen,
  onClose,
  onSubmit
}: AddVibeLogModalProps): JSX.Element => {
  const handleSubmit = (data: { log_type: string; title: string; content: string }) => {
    onSubmit(data);
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="bg-startsnap-white rounded-xl overflow-hidden border-[3px] border-solid border-gray-800 shadow-[5px_5px_0px_#1f2937] sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold text-startsnap-ebony-clay text-center font-['Space_Grotesk',Helvetica]">
            Add Vibe Log Entry
          </DialogTitle>
        </DialogHeader>
        <div className="p-6">
          <VibeLogEntry
            showAllTypes={true}
            onSubmit={handleSubmit}
            renderButtons={(isValid) => (
              <div className="flex gap-4 justify-end mt-6">
                <Button
                  type="button"
                  variant="outline"
                  onClick={onClose}
                  className="startsnap-button bg-gray-200 text-startsnap-ebony-clay font-['Roboto',Helvetica] font-bold rounded-lg border-2 border-solid border-gray-800 shadow-[3px_3px_0px_#1f2937]"
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  disabled={!isValid}
                  className="startsnap-button bg-startsnap-french-rose text-startsnap-white font-['Roboto',Helvetica] font-bold rounded-lg border-2 border-solid border-gray-800 shadow-[3px_3px_0px_#1f2937]"
                >
                  Add Entry
                </Button>
              </div>
            )}
          />
        </div>
      </DialogContent>
    </Dialog>
  );
};