import React from "react";
import { Label } from "./label";
import { Input } from "./input";
import { Textarea } from "./textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "./select";

interface VibeLogEntryProps {
  title: string;
  content: string;
  type: string;
  onTitleChange: (value: string) => void;
  onContentChange: (value: string) => void;
  onTypeChange: (value: string) => void;
  showAllTypes?: boolean;
  singleOptionType?: 'launch' | 'idea';
}

export const VibeLogEntry = ({
  title,
  content,
  type,
  onTitleChange,
  onContentChange,
  onTypeChange,
  showAllTypes = false,
  singleOptionType = 'launch',
}: VibeLogEntryProps): JSX.Element => {
  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <Label className="block font-['Space_Grotesk',Helvetica] font-bold text-startsnap-oxford-blue text-lg leading-7">
          Entry Type
        </Label>
        {showAllTypes ? (
          <Select value={type} onValueChange={onTypeChange}>
            <SelectTrigger className="border-2 border-solid border-gray-800 rounded-lg h-[52px] font-['Roboto',Helvetica]">
              <SelectValue placeholder="Select entry type" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="launch" className="flex items-center">
                <span className="material-icons text-base mr-2 leading-none">rocket_launch</span>
                <span>Launch</span>
              </SelectItem>
              <SelectItem value="update" className="flex items-center">
                <span className="material-icons text-base mr-2 leading-none">construction</span>
                <span>General Update</span>
              </SelectItem>
              <SelectItem value="feature" className="flex items-center">
                <span className="material-icons text-base mr-2 leading-none">auto_awesome</span>
                <span>Fix / New Feature</span>
              </SelectItem>
              <SelectItem value="idea" className="flex items-center">
                <span className="material-icons text-base mr-2 leading-none">lightbulb</span>
                <span>Idea</span>
              </SelectItem>
              <SelectItem value="feedback" className="flex items-center">
                <span className="material-icons text-base mr-2 leading-none">forum</span>
                <span>Seeking Feedback</span>
              </SelectItem>
            </SelectContent>
          </Select>
        ) : (
          <div className="border-2 border-solid border-gray-800 rounded-lg h-[52px] font-['Roboto',Helvetica] bg-startsnap-athens-gray flex items-center px-4">
            <div className="flex items-center text-startsnap-ebony-clay">
              {singleOptionType === 'launch' ? (
                <>
                  <span className="material-icons text-base mr-3 leading-none text-startsnap-french-rose">rocket_launch</span>
                  <span className="font-medium">Launch</span>
                </>
              ) : (
                <>
                  <span className="material-icons text-base mr-3 leading-none text-startsnap-corn">lightbulb</span>
                  <span className="font-medium">Idea</span>
                </>
              )}
            </div>
          </div>
        )}
      </div>

      <div className="space-y-2">
        <Label className="block font-['Space_Grotesk',Helvetica] font-bold text-startsnap-oxford-blue text-lg leading-7">
          Entry Title
        </Label>
        <Input
          value={title}
          onChange={(e) => onTitleChange(e.target.value)}
          placeholder="Give your entry a title"
          className="border-2 border-solid border-gray-800 rounded-lg p-4 font-['Roboto',Helvetica] text-startsnap-pale-sky"
        />
      </div>

      <div className="space-y-2">
        <Label className="block font-['Space_Grotesk',Helvetica] font-bold text-startsnap-oxford-blue text-lg leading-7">
          Entry Content
        </Label>
        <Textarea
          value={content}
          onChange={(e) => onContentChange(e.target.value)}
          placeholder={
            showAllTypes
              ? "Share your progress, thoughts, or what you're working on..."
              : singleOptionType === 'launch'
              ? "Share details about your project, key features, what problems it solves, and what makes it special..."
              : "Share your idea, what inspired it, the problem you want to solve, and your vision for the solution..."
          }
          className="border-2 border-solid border-gray-800 rounded-lg p-3.5 min-h-[120px] font-['Roboto',Helvetica] text-startsnap-pale-sky"
        />
      </div>
    </div>
  );
};