import React from "react";
import { Textarea } from "./textarea";
import { Input } from "./input";
import { Label } from "./label";
import { Badge } from "./badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "./select";

type VibeLogEntryProps = {
  title: string;
  content: string;
  type: string;
  onTitleChange: (value: string) => void;
  onContentChange: (value: string) => void;
  onTypeChange: (value: string) => void;
  showOnlyType?: 'launch' | 'idea' | null;
};

export const VibeLogEntry = ({
  title,
  content,
  type,
  onTitleChange,
  onContentChange,
  onTypeChange,
  showOnlyType = null
}: VibeLogEntryProps): JSX.Element => {
  // Vibe log type icons and styles mapping
  const vibeLogTypes = {
    launch: {
      label: "🚀 Launch Announcement",
      description: "Announce your project launch",
      icon: "rocket_launch",
      iconBg: "bg-startsnap-wisp-pink",
      iconColor: "text-startsnap-french-rose",
      iconBorder: "border-pink-500",
    },
    feature: {
      label: "✨ Feature Update",
      description: "Share a new feature",
      icon: "auto_awesome",
      iconBg: "bg-startsnap-blue-chalk",
      iconColor: "text-startsnap-heliotrope",
      iconBorder: "border-purple-500",
    },
    update: {
      label: "🛠️ Progress Update",
      description: "Share your latest progress",
      icon: "construction",
      iconBg: "bg-startsnap-blue-chalk",
      iconColor: "text-startsnap-heliotrope",
      iconBorder: "border-purple-500",
    },
    idea: {
      label: "💡 Idea/Concept",
      description: "Share your initial concept",
      icon: "lightbulb",
      iconBg: "bg-yellow-100",
      iconColor: "text-yellow-600",
      iconBorder: "border-yellow-500",
    },
    feedback: {
      label: "💬 Feedback Request",
      description: "Ask for specific feedback",
      icon: "forum",
      iconBg: "bg-startsnap-french-pass",
      iconColor: "text-startsnap-persian-blue",
      iconBorder: "border-blue-500",
    },
  };

  // Filter vibe log types if showOnlyType is specified
  const getVibeLogTypeOptions = () => {
    if (showOnlyType) {
      return [showOnlyType];
    }
    return Object.keys(vibeLogTypes);
  };

  const vibeLogTypeOptions = getVibeLogTypeOptions();

  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <Label 
            htmlFor="vibeLogType" 
            className="font-['Space_Grotesk',Helvetica] font-bold text-startsnap-oxford-blue text-lg leading-7"
          >
            Vibe Log Entry
          </Label>
          
          {vibeLogTypeOptions.length > 1 && (
            <Select value={type} onValueChange={onTypeChange}>
              <SelectTrigger 
                className="w-[240px] border-2 border-solid border-gray-800 rounded-lg h-[42px] font-['Roboto',Helvetica]"
              >
                <SelectValue placeholder="Select entry type" />
              </SelectTrigger>
              <SelectContent>
                {vibeLogTypeOptions.map((typeKey) => (
                  <SelectItem key={typeKey} value={typeKey}>
                    {vibeLogTypes[typeKey].label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          )}
          
          {vibeLogTypeOptions.length === 1 && (
            <Badge 
              className={`${vibeLogTypes[vibeLogTypeOptions[0]].iconBg} ${vibeLogTypes[vibeLogTypeOptions[0]].iconColor} border ${vibeLogTypes[vibeLogTypeOptions[0]].iconBorder} rounded-full px-3 py-1.5 font-['Space_Mono',Helvetica] text-sm flex items-center gap-1`}
            >
              <span className="material-icons text-sm">{vibeLogTypes[vibeLogTypeOptions[0]].icon}</span>
              {vibeLogTypes[vibeLogTypeOptions[0]].label}
            </Badge>
          )}
        </div>
        
        <p className="font-['Roboto',Helvetica] text-startsnap-pale-sky text-sm">
          {vibeLogTypes[type]?.description || "Share your thoughts with the community"}
        </p>
      </div>
      
      <div className="space-y-2">
        <Label 
          htmlFor="vibeLogTitle" 
          className="block font-['Roboto',Helvetica] font-medium text-startsnap-pale-sky text-sm"
        >
          Title
        </Label>
        <Input
          id="vibeLogTitle"
          value={title}
          onChange={(e) => onTitleChange(e.target.value)}
          placeholder="Give your entry a title"
          className="border-2 border-solid border-gray-800 rounded-lg p-3 font-['Roboto',Helvetica] text-startsnap-pale-sky"
        />
      </div>
      
      <div className="space-y-2">
        <Label 
          htmlFor="vibeLogContent" 
          className="block font-['Roboto',Helvetica] font-medium text-startsnap-pale-sky text-sm"
        >
          Content
        </Label>
        <Textarea
          id="vibeLogContent"
          value={content}
          onChange={(e) => onContentChange(e.target.value)}
          placeholder="Share your thoughts, progress, or plans..."
          className="border-2 border-solid border-gray-800 rounded-lg p-3.5 min-h-[120px] font-['Roboto',Helvetica] text-startsnap-pale-sky"
        />
      </div>
    </div>
  );
};