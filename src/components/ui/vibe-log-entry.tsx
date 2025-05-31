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
import { getVibeLogOptions, getVibeLogDisplay } from "../../config/categories";

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
              {getVibeLogOptions().map((option) => (
                <SelectItem key={option.value} value={option.value} className="flex items-center">
                  <span className="material-icons text-base mr-2 leading-none">{option.icon}</span>
                  <span>{option.label}</span>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        ) : (
          <div className="border-2 border-solid border-gray-800 rounded-lg h-[52px] font-['Roboto',Helvetica] bg-startsnap-athens-gray flex items-center px-4">
            <div className="flex items-center text-startsnap-ebony-clay">
              {(() => {
                const displayData = getVibeLogDisplay(singleOptionType);
                return (
                  <>
                    <span className={`material-icons text-base mr-3 leading-none ${displayData.iconColor}`}>{displayData.icon}</span>
                    <span className="font-medium">{displayData.label}</span>
                  </>
                );
              })()}
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