/**
 * src/components/ui/add-vibe-log-modal.tsx
 * @description Modal dialog for adding new Vibe Log entries, styled consistently with AuthDialog
 */

import React, { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "./dialog";
import { Button } from "./button";
import { Input } from "./input";
import { Textarea } from "./textarea";
import { Select } from "./select";
import { getVibeLogOptions } from "../../config/categories";

interface AddVibeLogModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: { log_type: string; title: string; content: string }) => void;
}

/**
 * @description Modal component for adding new Vibe Log entries
 * @param {AddVibeLogModalProps} props - Component props
 * @returns {JSX.Element} Modal dialog with form for adding Vibe Log entries
 */
export const AddVibeLogModal = ({
  isOpen,
  onClose,
  onSubmit,
}: AddVibeLogModalProps): JSX.Element => {
  const [logType, setLogType] = useState("update");
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [error, setError] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (!title.trim()) {
      setError("Please enter a title");
      return;
    }

    if (!content.trim()) {
      setError("Please enter some content");
      return;
    }

    onSubmit({
      log_type: logType,
      title: title.trim(),
      content: content.trim(),
    });

    // Reset form
    setLogType("update");
    setTitle("");
    setContent("");
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="bg-startsnap-white sm:max-w-[425px] rounded-xl border-[3px] border-solid border-gray-800 shadow-[5px_5px_0px_#1f2937] p-0">
        <DialogHeader className="bg-startsnap-french-pass border-b-[3px] border-gray-800 p-6">
          <DialogTitle className="font-['Space_Grotesk',Helvetica] font-bold text-startsnap-ebony-clay text-2xl leading-8">
            Add Vibe Log Entry
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6 p-6">
          {error && (
            <div className="bg-red-100 border-2 border-red-400 text-red-700 px-4 py-3 rounded-lg">
              {error}
            </div>
          )}

          <div className="space-y-2">
            <label className="block font-['Space_Grotesk',Helvetica] font-bold text-startsnap-oxford-blue text-base">
              Entry Type
            </label>
            <Select
              value={logType}
              onValueChange={setLogType}
              className="w-full border-2 border-solid border-gray-800 rounded-lg font-['Roboto',Helvetica]"
            >
              {getVibeLogOptions().map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </Select>
          </div>

          <div className="space-y-2">
            <label className="block font-['Space_Grotesk',Helvetica] font-bold text-startsnap-oxford-blue text-base">
              Title
            </label>
            <Input
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="What's new with your project?"
              className="w-full border-2 border-solid border-gray-800 rounded-lg p-3 font-['Roboto',Helvetica]"
            />
          </div>

          <div className="space-y-2">
            <label className="block font-['Space_Grotesk',Helvetica] font-bold text-startsnap-oxford-blue text-base">
              Content
            </label>
            <Textarea
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder="Share your progress, updates, or thoughts..."
              className="w-full min-h-[120px] border-2 border-solid border-gray-800 rounded-lg p-3 font-['Roboto',Helvetica]"
            />
          </div>

          <div className="flex gap-4 pt-4">
            <Button
              type="button"
              onClick={onClose}
              className="flex-1 startsnap-button bg-startsnap-mischka text-startsnap-ebony-clay font-['Roboto',Helvetica] font-bold rounded-lg border-2 border-solid border-gray-800 shadow-[3px_3px_0px_#1f2937]"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              className="flex-1 startsnap-button bg-startsnap-french-rose text-startsnap-white font-['Roboto',Helvetica] font-bold rounded-lg border-2 border-solid border-gray-800 shadow-[3px_3px_0px_#1f2937]"
            >
              Add Entry
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};