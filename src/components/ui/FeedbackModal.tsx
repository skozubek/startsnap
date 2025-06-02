/**
 * src/components/ui/FeedbackModal.tsx
 * @description Modal component for adding and editing feedback on StartSnap projects
 */

import React, { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
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
 * @description Modal component for adding or editing feedback on StartSnap projects
 * @param {FeedbackModalProps} props - Component props
 * @param {boolean} props.isOpen - Whether the modal is open
 * @param {() => void} props.onClose - Function to call when closing the modal
 * @param {(data: { content: string }) => void} props.onSubmit - Function to call when submitting the form
 * @param {boolean} props.isEditMode - Whether the modal is in edit mode
 * @param {string} props.initialContent - Initial content for the feedback (used in edit mode)
 * @returns {JSX.Element} Modal component with feedback form
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

  useEffect(() => {
    // Reset form when modal opens or initialContent changes
    if (isOpen) {
      setContent(initialContent || "");
      setError("");
    }
  }, [isOpen, initialContent]);

  /**
   * @description Handles form submission
   * @param {React.FormEvent} e - Form event
   * @sideEffects Prevents default form submission and calls onSubmit with form data
   */
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validate content
    if (!content.trim()) {
      setError("Feedback content is required");
      return;
    }

    onSubmit({ content });
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-[550px] p-0 bg-startsnap-white border-[3px] border-solid border-gray-800 shadow-[5px_5px_0px_#1f2937] rounded-xl overflow-hidden">
        <DialogHeader className="bg-startsnap-french-pass p-6 border-b-2 border-gray-800">
          <DialogTitle className="text-2xl font-bold text-startsnap-ebony-clay font-['Space_Grotesk',Helvetica]">
            {isEditMode ? "Edit Feedback" : "Share Your Feedback"}
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          <div className="space-y-2">
            <p className="font-['Roboto',Helvetica] text-startsnap-river-bed text-base leading-6">
              {isEditMode 
                ? "Update your feedback on this project."
                : "Share your thoughts, suggestions, or bug reports with the creator."}
            </p>
            <Textarea
              value={content}
              onChange={(e) => {
                setContent(e.target.value);
                if (e.target.value.trim()) setError("");
              }}
              placeholder="Share your thoughts, suggestions, or bug reports..."
              className={`border-2 border-solid ${
                error ? "border-red-500" : "border-gray-800"
              } rounded-lg p-3.5 min-h-[150px] font-['Roboto',Helvetica] text-startsnap-pale-sky`}
            />
            {error && (
              <p className="text-red-500 text-sm">{error}</p>
            )}
          </div>

          <div className="flex justify-end gap-4 pt-4">
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
              className="startsnap-button bg-startsnap-french-rose text-startsnap-white font-['Roboto',Helvetica] font-bold rounded-lg border-2 border-solid border-gray-800 shadow-[3px_3px_0px_#1f2937]"
            >
              {isEditMode ? "Update Feedback" : "Submit Feedback"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};