/**
 * src/components/ui/add-vibe-log-modal.tsx
 * @description Modal component for adding or editing vibe log entries
 */

import React, { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "./dialog";
import { Button } from "./button";
import { Input } from "./input";
import { Textarea } from "./textarea";
import { Label } from "./label";
import { Select } from "./select";
import { getVibeLogOptions } from "../../config/categories";

/**
 * @description Interface for AddVibeLogModal component props
 */
interface AddVibeLogModalProps {
  /** Whether the modal is open */
  isOpen: boolean;
  /** Callback function when the modal is closed */
  onClose: () => void;
  /** Callback function when the form is submitted */
  onSubmit: (data: { log_type: string; title: string; content: string }) => void;
  /** Initial data for editing mode (null for create mode) */
  initialData?: {
    id: string;
    log_type: string;
    title: string;
    content: string;
  } | null;
}

/**
 * @description Modal component for adding or editing vibe log entries
 * @param {AddVibeLogModalProps} props - Component props
 * @returns {JSX.Element} Modal dialog with form for vibe log entries
 */
export const AddVibeLogModal = ({
  isOpen,
  onClose,
  onSubmit,
  initialData = null
}: AddVibeLogModalProps): JSX.Element => {
  const [logType, setLogType] = useState<string>("update");
  const [title, setTitle] = useState<string>("");
  const [content, setContent] = useState<string>("");
  const [contentPlaceholder, setContentPlaceholder] = useState<string>("");
  
  const vibeLogOptions = getVibeLogOptions();
  
  // Reset form or populate with initial data when opened/closed
  useEffect(() => {
    if (isOpen) {
      if (initialData) {
        // Edit mode - populate form with existing data
        setLogType(initialData.log_type);
        setTitle(initialData.title);
        setContent(initialData.content);
      } else {
        // Create mode - reset form
        setLogType("update");
        setTitle("");
        setContent("");
      }
    }
  }, [isOpen, initialData]);
  
  // Update content placeholder when log type changes
  useEffect(() => {
    const selectedOption = vibeLogOptions.find(option => option.value === logType);
    setContentPlaceholder(selectedOption?.contentPlaceholder || "");
  }, [logType, vibeLogOptions]);

  /**
   * @description Handles form submission
   * @param {React.FormEvent} e - Form event
   * @sideEffects Prevents default form submission and calls onSubmit with form data
   */
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!title.trim()) {
      alert("Please enter a title for your vibe log entry");
      return;
    }
    
    if (!content.trim()) {
      alert("Please enter content for your vibe log entry");
      return;
    }
    
    onSubmit({
      log_type: logType,
      title,
      content,
    });
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="bg-white border-2 border-gray-800 rounded-xl shadow-[5px_5px_0px_#1f2937] p-6 max-w-md w-full">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold text-startsnap-ebony-clay font-['Space_Grotesk',Helvetica]">
            {initialData ? "Edit Vibe Log Entry" : "Add Vibe Log Entry"}
          </DialogTitle>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-4 mt-4">
          <div className="space-y-2">
            <Label htmlFor="log-type" className="font-['Space_Grotesk',Helvetica] font-bold text-startsnap-oxford-blue">
              Entry Type
            </Label>
            <Select
              id="log-type"
              value={logType}
              onChange={(e) => setLogType(e.target.value)}
              className="border-2 border-solid border-gray-800 rounded-lg p-2.5 font-['Roboto',Helvetica] text-startsnap-pale-sky w-full"
            >
              {vibeLogOptions.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </Select>
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="title" className="font-['Space_Grotesk',Helvetica] font-bold text-startsnap-oxford-blue">
              Title
            </Label>
            <Input
              id="title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Enter a title for this update"
              className="border-2 border-solid border-gray-800 rounded-lg p-2.5 font-['Roboto',Helvetica] text-startsnap-pale-sky"
              maxLength={100}
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="content" className="font-['Space_Grotesk',Helvetica] font-bold text-startsnap-oxford-blue">
              Content
            </Label>
            <Textarea
              id="content"
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder={contentPlaceholder || "Share details about your project update..."}
              className="border-2 border-solid border-gray-800 rounded-lg p-2.5 min-h-[150px] font-['Roboto',Helvetica] text-startsnap-pale-sky"
              maxLength={2000}
            />
          </div>
          
          <div className="flex justify-end gap-2 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              className="startsnap-button bg-startsnap-athens-gray text-startsnap-ebony-clay font-['Roboto',Helvetica] font-bold rounded-lg border-2 border-solid border-gray-800 shadow-[3px_3px_0px_#1f2937]"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              className="startsnap-button bg-startsnap-french-rose text-startsnap-white font-['Roboto',Helvetica] font-bold rounded-lg border-2 border-solid border-gray-800 shadow-[3px_3px_0px_#1f2937]"
            >
              {initialData ? "Update" : "Post"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};