/**
 * src/components/ui/FeedbackModal.tsx
 * @description Modal component for adding or editing feedback
 */

import React, { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "./dialog";
import { Button } from "./button";
import { Textarea } from "./textarea";

interface FeedbackModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: { content: string }) => void;
  isEditMode?: boolean;
  initialContent?: string;
}

/**
 * @description Modal for adding or editing feedback
 * @param {FeedbackModalProps} props - Component props
 * @returns {JSX.Element} Modal dialog with feedback form
 */
export const FeedbackModal = ({
  isOpen,
  onClose,
  onSubmit,
  isEditMode = false,
  initialContent = "",
}: FeedbackModalProps): JSX.Element => {
  const [content, setContent] = useState(initialContent);
  const [error, setError] = useState("");

  // Reset form when opening/changing initialContent
  useEffect(() => {
    if (isOpen) {
      setContent(initialContent);
      setError("");
    }
  }, [isOpen, initialContent]);

  /**
   * @description Handles form submission after validation
   * @param {React.FormEvent<HTMLFormElement>} e - Form event
   */
  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (!content.trim()) {
      setError("Please enter your feedback");
      return;
    }

    onSubmit({ content });
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="bg-startsnap-white rounded-xl overflow-hidden border-[3px] border-solid border-gray-800 shadow-[5px_5px_0px_#1f2937] p-0">
        <DialogHeader className="bg-startsnap-mountain-meadow p-4 border-b-2 border-gray-800">
          <DialogTitle className="text-white text-xl font-bold font-['Space_Grotesk',Helvetica]">
            {isEditMode ? "Edit Feedback" : "Add Feedback"}
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div className="space-y-2">
            <label className="block font-['Space_Grotesk',Helvetica] font-bold text-startsnap-oxford-blue text-lg leading-7">
              Your Feedback
            </label>
            <Textarea
              value={content}
              onChange={(e) => {
                setContent(e.target.value);
                setError("");
              }}
              placeholder="Share your thoughts, suggestions, or bug reports..."
              className="border-2 border-solid border-gray-800 rounded-lg p-3.5 min-h-[120px] font-['Roboto',Helvetica] text-startsnap-pale-sky"
            />
            {error && (
              <p className="text-red-500 text-sm mt-1">{error}</p>
            )}
          </div>

          <DialogFooter className="flex justify-end pt-4 gap-3">
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              className="startsnap-button bg-startsnap-mischka text-startsnap-ebony-clay font-['Roboto',Helvetica] font-bold rounded-lg border-2 border-solid border-gray-800 shadow-[3px_3px_0px_#1f2937]"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              className="startsnap-button bg-startsnap-french-rose text-startsnap-white font-['Roboto',Helvetica] font-bold rounded-lg border-2 border-solid border-gray-800 shadow-[3px_3px_0px_#1f2937]"
            >
              {isEditMode ? "Update Feedback" : "Submit Feedback"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};