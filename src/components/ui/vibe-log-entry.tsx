/**
 * src/components/ui/vibe-log-entry.tsx
 *
 * @description VibeLogEntry component for creating and editing vibe log entries.
 * Provides form fields for title, content, and type selection with support for
 * both single-option and multi-option type selection modes.
 */

import React, { useState, useCallback } from "react";
import { Label } from "./label";
import { Input } from "./input";
import { Textarea } from "./textarea";
import { Button } from "./button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "./select";
import { getVibeLogOptions, getVibeLogDisplay } from "../../config/categories";

import { supabase } from "../../lib/supabase";
import { toast } from "sonner";

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

/**
 * @description VibeLogEntry component for creating and editing vibe log entries
 * @param {VibeLogEntryProps} props - Component props
 * @returns {JSX.Element} The rendered VibeLogEntry component
 */
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
  const [isFormatting, setIsFormatting] = useState(false);
  const vibeLogOptions = getVibeLogOptions();
  const currentTypeConfig = vibeLogOptions.find(option => option.value === type);

  const placeholderText = showAllTypes
    ? currentTypeConfig?.contentPlaceholder || "Share your progress, thoughts, or what you\'re working on..."
    : singleOptionType === 'launch'
    ? vibeLogOptions.find(o => o.value === 'launch')?.contentPlaceholder || "Share details about your project, key features, what problems it solves, and what makes it special..."
    : vibeLogOptions.find(o => o.value === 'idea')?.contentPlaceholder || "Share your idea, what inspired it, the problem you want to solve, and your vision for the solution...";

  /**
   * @description Handles AI formatting of the vibe log content by invoking the Supabase Edge Function.
   * @async
   * @returns {Promise<void>}
   * @sideEffects Calls Supabase Edge Function, updates content, and shows toast notifications.
   */
  const handleAiFormat = useCallback(async () => {
    setIsFormatting(true);
    try {
      const { data, error } = await supabase.functions.invoke('ai-vibe-log-formatter', {
        body: { rawContent: content, logType: type },
      });
      if (error) {
        toast.error("AI formatting failed: " + (error.message || error.description || "Unknown error"));
        return;
      }
      if (data && data.formattedLog) {
        onContentChange(data.formattedLog);
        toast.success('Vibe Log polished with AI!');
      } else {
        toast.error("AI formatting failed: No formatted log returned.");
      }
    } catch (err: any) {
      toast.error("AI formatting failed: " + (err?.message || "Unknown error"));
    } finally {
      setIsFormatting(false);
    }
  }, [content, type, onContentChange]);

  return (
    <div className="space-y-5">
      <div className="startsnap-form-group">
        <label className="startsnap-form-label">
          Entry Type
        </label>
        {showAllTypes ? (
          <Select value={type} onValueChange={onTypeChange}>
            <SelectTrigger className="startsnap-form-input">
              <SelectValue placeholder="Select entry type" />
            </SelectTrigger>
            <SelectContent>
              {getVibeLogOptions().map((option) => (
                <SelectItem key={option.value} value={option.value}>
                  <div className="flex items-center gap-2">
                    <span className="material-icons text-base leading-none">{option.icon}</span>
                    <span>{option.label}</span>
                  </div>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        ) : (
          <div className="startsnap-form-input flex items-center">
            {(() => {
              const displayData = getVibeLogDisplay(singleOptionType);
              return (
                <>
                  <span className={`material-icons text-base mr-3 leading-none ${displayData.iconColor}`}>{displayData.icon}</span>
                  <span className="font-medium text-gray-900">{displayData.label}</span>
                </>
              );
            })()}
          </div>
        )}
      </div>

      <div className="startsnap-form-group">
        <label className="startsnap-form-label">
          Entry Title
        </label>
        <Input
          value={title}
          onChange={(e) => onTitleChange(e.target.value)}
          placeholder="Give your entry a title"
          className="startsnap-form-input"
        />
      </div>

      <div className="startsnap-form-group">
        <div className="flex items-center justify-between mb-2">
          <label className="startsnap-form-label mb-0">
            Entry Content
          </label>
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={handleAiFormat}
            disabled={isFormatting || !content.trim()}
            className="startsnap-mobile-btn-small bg-purple-50 text-purple-700 border-purple-200 hover:bg-purple-100 focus:ring-purple-500 md:startsnap-button md:bg-startsnap-wisp-pink md:text-startsnap-purple-heart md:font-bold md:border-2 md:border-solid md:border-gray-800 md:shadow-[2px_2px_0px_#1f2937]"
          >
            <span className={`material-icons text-sm md:text-base ${isFormatting ? 'animate-spin' : ''}`}>
              auto_awesome
            </span>
            <span className="ml-1.5 hidden sm:inline">{isFormatting ? 'Formatting...' : 'AI Magic'}</span>
          </Button>
        </div>
        <Textarea
          value={content}
          onChange={(e) => onContentChange(e.target.value)}
          placeholder={placeholderText}
          className="startsnap-form-textarea"
        />
        <p className="text-xs text-gray-500 mt-1.5">Markdown formatting is supported.</p>
      </div>
    </div>
  );
};