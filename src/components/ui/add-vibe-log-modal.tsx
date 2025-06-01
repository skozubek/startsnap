/**
 * src/components/ui/add-vibe-log-modal.tsx
 * @description Modal dialog for adding new Vibe Log entries, styled to match auth dialog
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
import { Label } from "./label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "./select";
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

    if (!title.trim() || !content.trim()) {
      setError("Please fill in all fields");
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
      <DialogContent className="bg-startsnap-white sm:max-w-[425px] border-2 border-gray-800 shadow-[5px_5px_0px_#1f2937] rounded-xl gap-0">
        <DialogHeader className="border-b-2 border-gray-800 p-6">
          <DialogTitle className="font-['Space_Grotesk',Helvetica] font-bold text-startsnap-ebony-clay text-2xl text-center">
            Add Vibe Log Entry
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6 p-6">
          <div className="space-y-2">
            <Label className="font-['Space_Grotesk',Helvetica] font-bold text-startsnap-oxford-blue text-base">
              Entry Type
            </Label>
            <Select value={logType} onValueChange={setLogType}>
              <SelectTrigger className="w-full border-2 border-gray-800 rounded-lg p-3 font-['Roboto',Helvetica] text-startsnap-pale-sky bg-white">
                <SelectValue placeholder="Select entry type" />
              </SelectTrigger>
              <SelectContent className="border-2 border-gray-800 rounded-lg shadow-[3px_3px_0px_#1f2937]">
                {getVibeLogOptions().map((option) => (
                  <SelectItem
                    key={option.value}
                    value={option.value}
                    className="font-['Roboto',Helvetica] cursor-pointer"
                  >
                    <div className="flex items-center gap-2">
                      <span className="material-icons text-lg">{option.icon}</span>
                      {option.label}
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label className="font-['Space_Grotesk',Helvetica] font-bold text-startsnap-oxford-blue text-base">
              Title
            </Label>
            <Input
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Enter a title for your update"
              className="border-2 border-gray-800 rounded-lg p-3 font-['Roboto',Helvetica] text-startsnap-pale-sky"
            />
          </div>

          <div className="space-y-2">
            <Label className="font-['Space_Grotesk',Helvetica] font-bold text-startsnap-oxford-blue text-base">
              Content
            </Label>
            <Textarea
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder="Share your progress, updates, or thoughts..."
              className="min-h-[120px] border-2 border-gray-800 rounded-lg p-3 font-['Roboto',Helvetica] text-startsnap-pale-sky"
            />
          </div>

          {error && (
            <p className="text-red-500 text-sm font-['Roboto',Helvetica] mt-2">
              {error}
            </p>
          )}

          <div className="flex flex-col gap-4 pt-2">
            <Button
              type="submit"
              className="startsnap-button bg-startsnap-french-rose text-startsnap-white font-['Roboto',Helvetica] font-bold text-base rounded-lg border-2 border-solid border-gray-800 shadow-[3px_3px_0px_#1f2937] w-full"
            >
              Submit Entry
            </Button>
            <Button
              type="button"
              onClick={onClose}
              variant="outline"
              className="startsnap-button bg-gray-200 text-startsnap-ebony-clay font-['Roboto',Helvetica] font-bold text-base rounded-lg border-2 border-solid border-gray-800 shadow-[3px_3px_0px_#1f2937] w-full"
            >
              Cancel
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};