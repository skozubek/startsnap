import React, { useEffect, useState } from "react";
import { Checkbox } from "./checkbox";
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
import { formatDetailedDate } from "../../lib/utils";
import Avatar from "boring-avatars";
import { FaXTwitter } from "react-icons/fa6";
import { useAuth } from "../../context/AuthContext";
import { supabase } from "../../lib/supabase";

interface VibeLogEntryProps {
  title: string;
  content: string;
  type: string;
  shareOnTwitter?: boolean;
  shareOnTwitter?: boolean;
  onTypeChange: (type: string) => void;
  onTitleChange: (title: string) => void;
  onContentChange: (content: string) => void;
  onShareOnTwitterChange?: (shareOnTwitter: boolean) => void;
  onShareOnTwitterChange?: (share: boolean) => void;
  showAllTypes?: boolean;
  singleOptionType?: 'launch' | 'idea';
}

export const VibeLogEntry = ({
  title,
  content,
  type,
  shareOnTwitter = false,
  shareOnTwitter = false,
  onTypeChange,
  onTitleChange,
  onContentChange,
  onShareOnTwitterChange,
  onShareOnTwitterChange,
  showAllTypes = false,
  singleOptionType = 'launch',
}: VibeLogEntryProps): JSX.Element => {
  const [selectedType, setSelectedType] = useState(type);
  const { user } = useAuth();
  const [userProfile, setUserProfile] = useState<any>(null);

  useEffect(() => {
    if (user) {
      const fetchUserProfile = async () => {
        const { data, error } = await supabase
          .from('profiles')
          .select('twitter_url')
          .eq('user_id', user.id)
          .single();

        if (!error && data) {
          setUserProfile(data);
        }
      };
      fetchUserProfile();
    }
  }, [user]);

  const hasTwitterConnected = userProfile?.twitter_url;

  const vibeLogOptions = getVibeLogOptions();
  const currentTypeConfig = vibeLogOptions.find(option => option.value === type);

  const placeholderText = showAllTypes
    ? currentTypeConfig?.contentPlaceholder || "Share your progress, thoughts, or what you\'re working on..."
    : singleOptionType === 'launch'
    ? vibeLogOptions.find(o => o.value === 'launch')?.contentPlaceholder || "Share details about your project, key features, what problems it solves, and what makes it special..."
    : vibeLogOptions.find(o => o.value === 'idea')?.contentPlaceholder || "Share your idea, what inspired it, the problem you want to solve, and your vision for the solution...";
  const [hasTwitterConnected, setHasTwitterConnected] = useState(false);

  useEffect(() => {
    if (user) {
      const checkTwitterConnection = async () => {
        const { data, error } = await supabase
          .from('profiles')
          .select('twitter_url')
          .eq('user_id', user.id)
          .single();

        if (error && error.code !== 'PGRST116') {
          console.error('Error checking Twitter connection:', error);
          return;
        }

        setHasTwitterConnected(!!data?.twitter_url);
      };

      checkTwitterConnection();
    }
  }, [user]);

  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <Label className="block font-['Space_Grotesk',Helvetica] font-bold text-startsnap-oxford-blue text-lg leading-7">
          Entry Type
        </Label>
        {showAllTypes ? (
          <Select value={type} onValueChange={onTypeChange}>
            <SelectTrigger className="w-full border-2 border-solid border-gray-800 rounded-lg p-4 font-['Roboto',Helvetica] text-base">
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
          <div className="w-full border-2 border-solid border-gray-800 rounded-lg p-4 font-['Roboto',Helvetica] bg-startsnap-athens-gray flex items-center">
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
          className="border-2 border-solid border-gray-800 rounded-lg p-4 font-['Roboto',Helvetica] text-startsnap-pale-sky text-base"
        />
      </div>

      <div className="space-y-2">
        <Label className="block font-['Space_Grotesk',Helvetica] font-bold text-startsnap-oxford-blue text-lg leading-7">
          Entry Content
        </Label>
        <Textarea
          value={content}
          onChange={(e) => onContentChange(e.target.value)}
          placeholder={placeholderText}
          className="border-2 border-solid border-gray-800 rounded-lg p-3.5 min-h-[120px] font-['Roboto',Helvetica] text-startsnap-pale-sky text-base"
        />
        <p className="text-xs text-gray-500 mt-1">Markdown formatting is supported.</p>
        {hasTwitterConnected && (
          <div className="flex items-center gap-2 mt-4">
            <input
              type="checkbox"
              id="shareOnTwitter"
              checked={shareOnTwitter}
              onChange={(e) => onShareOnTwitterChange?.(e.target.checked)}
              className="w-4 h-4 rounded border-2 border-gray-800"
            />
            <label
              htmlFor="shareOnTwitter"
              className="text-sm text-startsnap-river-bed flex items-center gap-1 cursor-pointer"
            >
              Share on
              <FaXTwitter className="text-black" />
            </label>
          </div>
        )}
      </div>
      {hasTwitterConnected && onShareOnTwitterChange && (
        <div className="flex items-center gap-2">
          <Checkbox
            id="share-on-twitter"
            checked={shareOnTwitter}
            onCheckedChange={(checked) => onShareOnTwitterChange(checked as boolean)}
            className="border-2 border-gray-800 data-[state=checked]:bg-startsnap-french-rose data-[state=checked]:border-startsnap-french-rose"
          />
          <Label
            htmlFor="share-on-twitter"
            className="flex items-center gap-2 cursor-pointer text-startsnap-river-bed"
          >
            <FaXTwitter className="text-black" />
            Share on X
          </Label>
        </div>
      )}
    </div>
  );
};