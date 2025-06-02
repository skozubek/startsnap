/**
 * src/components/ui/add-vibe-log-modal.tsx
 * @description Modal dialog for adding new Vibe Log entries, styled to match auth dialog
 */

import React, { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "./dialog";
import { Button } from "./button";
import { Input } from "./input";
import { Textarea } from "./textarea";
import { Label } from "./label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "./select";
import { getVibeLogOptions } from "../../config/categories";
import { VibeLogEntry } from "./vibe-log-entry";

interface AddVibeLogModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: { log_type: string; title: string; content: string }) => void;
  isEditMode?: boolean;
  initialData?: { log_type: string; title: string; content: string };
}

/**
 * @description Modal component for adding or editing Vibe Log entries.
 * @param {AddVibeLogModalProps} props - Component props
 * @returns {JSX.Element} Modal dialog with form for adding or editing Vibe Log entries
 */
export const AddVibeLogModal = ({
  isOpen,
  onClose,
  onSubmit,
  isEditMode = false,
  initialData,
}: AddVibeLogModalProps): JSX.Element => {
  const [logType, setLogType] = useState(initialData?.log_type || "update");
  const [title, setTitle] = useState(initialData?.title || "");
  const [content, setContent] = useState(initialData?.content || "");
  const [error, setError] = useState("");

  useEffect(() => {
    if (isOpen) {
      if (isEditMode && initialData) {
        setLogType(initialData.log_type);
        setTitle(initialData.title);
        setContent(initialData.content);
        setError("");
      } else {
        setLogType("update");
        setTitle("");
        setContent("");
        setError("");
      }
    }
  }, [isOpen, isEditMode, initialData]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (!title.trim() || !content.trim()) {
      setError("Please fill in all fields");
      return;
    }

    onSubmit({
      log_type: logType,
      title: title.trim(),
      content: content.trim(),
    });

    // Reset form only if not in edit mode
    if (!isEditMode) {
      setLogType("update");
      setTitle("");
      setContent("");
    }
    // onClose(); // Typically handled by the parent after successful submission
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="bg-white sm:max-w-md rounded-lg border-3 border-solid border-gray-800 shadow-[5px_5px_0px_#1f2937] gap-0">
        <DialogHeader className="px-8 pt-8">
          <DialogTitle className="font-['Space_Grotesk',Helvetica] font-bold text-startsnap-ebony-clay text-4xl text-center leading-tight mb-8">
            {isEditMode ? "Edit Vibe Log Entry" : "Add Vibe Log Entry"}
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6 px-8 pb-8">
          <VibeLogEntry
            title={title}
            content={content}
            type={logType}
            onTitleChange={setTitle}
            onContentChange={setContent}
            onTypeChange={setLogType}
            showAllTypes={true}
          />

          {error && (
            <p className="text-red-500 text-sm font-['Roboto',Helvetica] mt-2">
              {error}
            </p>
          )}

          <div className="flex gap-4 pt-2">
            <Button
              type="button"
              onClick={onClose}
              variant="outline"
              className="startsnap-button bg-gray-200 text-startsnap-ebony-clay font-['Roboto',Helvetica] font-bold text-base rounded-lg border-2 border-solid border-gray-800 shadow-[3px_3px_0px_#1f2937] flex-1"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              className="startsnap-button bg-startsnap-french-rose text-startsnap-white font-['Roboto',Helvetica] font-bold text-base rounded-lg border-2 border-solid border-gray-800 shadow-[3px_3px_0px_#1f2937] flex-1"
            >
              Submit Entry
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};