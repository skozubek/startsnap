/**
 * src/components/ui/add-vibe-log-modal.tsx
 * @description Modal component for adding new Vibe Log entries
 */

import React, { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from './dialog';
import { Button } from './button';
import { Input } from './input';
import { Textarea } from './textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './select';
import { getVibeLogOptions } from '../../config/categories';

interface AddVibeLogModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: { log_type: string; title: string; content: string }) => void;
}

/**
 * @description Modal component for adding new Vibe Log entries
 * @param {AddVibeLogModalProps} props - Component props
 * @returns {JSX.Element} Modal with form for adding Vibe Log entries
 */
export const AddVibeLogModal = ({ isOpen, onClose, onSubmit }: AddVibeLogModalProps): JSX.Element => {
  const [logType, setLogType] = useState('update');
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = () => {
    // Validate form
    if (!title.trim()) {
      setError('Please enter a title');
      return;
    }
    if (!content.trim()) {
      setError('Please enter some content');
      return;
    }

    // Submit form
    onSubmit({
      log_type: logType,
      title: title.trim(),
      content: content.trim()
    });

    // Reset form
    setLogType('update');
    setTitle('');
    setContent('');
    setError('');
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="bg-startsnap-white rounded-xl border-[3px] border-solid border-gray-800 shadow-[5px_5px_0px_#1f2937] sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold text-startsnap-ebony-clay font-['Space_Grotesk',Helvetica]">
            Add Vibe Log Entry
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6 py-4">
          <div className="space-y-2">
            <label className="font-['Space_Grotesk',Helvetica] font-bold text-startsnap-oxford-blue text-sm">
              Entry Type
            </label>
            <Select value={logType} onValueChange={setLogType}>
              <SelectTrigger className="w-full border-2 border-solid border-gray-800 rounded-lg">
                <SelectValue placeholder="Select type" />
              </SelectTrigger>
              <SelectContent>
                {getVibeLogOptions().map((option) => (
                  <SelectItem key={option.value} value={option.value}>
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
            <label className="font-['Space_Grotesk',Helvetica] font-bold text-startsnap-oxford-blue text-sm">
              Title
            </label>
            <Input
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="What's new with your project?"
              className="border-2 border-solid border-gray-800 rounded-lg p-3 font-['Roboto',Helvetica]"
            />
          </div>

          <div className="space-y-2">
            <label className="font-['Space_Grotesk',Helvetica] font-bold text-startsnap-oxford-blue text-sm">
              Content
            </label>
            <Textarea
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder="Share your progress, updates, or thoughts..."
              className="border-2 border-solid border-gray-800 rounded-lg p-3 min-h-[120px] font-['Roboto',Helvetica]"
            />
          </div>

          {error && (
            <p className="text-red-500 text-sm">{error}</p>
          )}

          <div className="flex justify-end gap-4 pt-4">
            <Button
              variant="outline"
              onClick={onClose}
              className="startsnap-button bg-startsnap-mischka text-startsnap-ebony-clay font-['Roboto',Helvetica] font-bold rounded-lg border-2 border-solid border-gray-800 shadow-[3px_3px_0px_#1f2937]"
            >
              Cancel
            </Button>
            <Button
              onClick={handleSubmit}
              className="startsnap-button bg-startsnap-french-rose text-startsnap-white font-['Roboto',Helvetica] font-bold rounded-lg border-2 border-solid border-gray-800 shadow-[3px_3px_0px_#1f2937]"
            >
              Add Entry
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};