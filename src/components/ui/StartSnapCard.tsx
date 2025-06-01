/**
 * src/components/ui/StartSnapCard.tsx
 * @description Reusable card component for displaying StartSnap projects
 */

import React from "react";
import { Badge } from "./badge";
import { Link } from "react-router-dom";
import { UserAvatar } from "./user-avatar";

/**
 * @description Props for the StartSnapCard component
 */
interface StartSnapCardProps {
  startsnap: any;
  showCreator?: boolean;
  creatorName?: string;
  creatorInitials?: string;
  variant?: "main-page" | "profile";
  isOwner?: boolean;
  formatDate: (date: string) => string;
  getCategoryDisplay: (category: string) => any;
  thumbnailStyle?: "minimalist" | "vibrant";
}

/**
 * @description Renders a card for a StartSnap project with consistent styling
 * @param {StartSnapCardProps} props - Component props
 * @returns {JSX.Element} StartSnap card component
 */
export const StartSnapCard = ({
  startsnap,
  showCreator = false,
  creatorName = "Anonymous",
  creatorInitials = "AN",
  variant = "main-page",
  isOwner = false,
  formatDate,
  getCategoryDisplay,
  thumbnailStyle = "minimalist"
}: StartSnapCardProps): JSX.Element => {
  const categoryDisplay = getCategoryDisplay(startsnap.category);
  const cardBackgroundColor = thumbnailStyle === "minimalist" ? "bg-startsnap-white" : `${categoryDisplay.bgColor}`;
  
  return (
    <div className={`rounded-xl overflow-hidden border-[3px] border-solid border-gray-800 shadow-[5px_5px_0px_#1f2937] ${cardBackgroundColor}`}>
      {/* Thumbnail/Header Section - Styling stays intact but varies based on thumbnail style */}
      <div className={`${thumbnailStyle === "minimalist" ? `${categoryDisplay.bgColor}` : "bg-startsnap-white"} px-6 py-4 border-b-2 border-gray-800`}>
        <div className="flex items-center justify-between mb-3">
          <Badge
            variant="outline"
            className={`${categoryDisplay.bgColor} ${categoryDisplay.textColor} border ${categoryDisplay.borderColor} rounded-full px-3 py-1 font-['Space_Mono',Helvetica] font-normal text-xs`}
          >
            {categoryDisplay.name}
          </Badge>

          {startsnap.type === "live" ? (
            <Badge variant="outline" className="bg-startsnap-mountain-meadow text-white font-['Space_Mono',Helvetica] text-xs rounded-full border border-solid border-green-700 px-3 py-1 flex items-center gap-1">
              <span className="material-icons text-xs">rocket_launch</span>
              Live
            </Badge>
          ) : (
            <Badge variant="outline" className="bg-startsnap-corn text-startsnap-ebony-clay font-['Space_Mono',Helvetica] text-xs rounded-full border border-solid border-yellow-700 px-3 py-1 flex items-center gap-1">
              <span className="material-icons text-xs">lightbulb</span>
              Idea
            </Badge>
          )}
        </div>

        {/* Card Title - Now clickable */}
        <Link to={`/project/${startsnap.id}`} className="block hover:opacity-90 transition-opacity">
          <h3 className={`font-[var(--startsnap-semantic-heading-3-font-family)] font-black tracking-tight leading-tight ${categoryDisplay.textColor} text-xl`}>
            {startsnap.name}
          </h3>
        </Link>
      </div>

      {/* Card Description & Details */}
      <div className="p-6">
        {/* Description - Now clickable */}
        <Link to={`/project/${startsnap.id}`} className="block hover:opacity-90 transition-opacity">
          <p className="font-['Roboto',Helvetica] font-normal text-startsnap-river-bed text-base leading-6 mb-6 line-clamp-3">
            {startsnap.description}
          </p>
        </Link>

        {/* Tags if available */}
        {startsnap.tags && startsnap.tags.length > 0 && (
          <div className="mb-4 flex flex-wrap gap-2">
            {startsnap.tags.slice(0, 3).map((tag: string, idx: number) => (
              <Badge
                key={idx}
                variant="outline"
                className="bg-startsnap-athens-gray text-startsnap-ebony-clay font-['Space_Mono',Helvetica] text-xs rounded-full border border-solid border-gray-800 px-3 py-1"
              >
                #{tag}
              </Badge>
            ))}
            {startsnap.tags.length > 3 && (
              <Badge
                variant="outline"
                className="bg-startsnap-athens-gray text-startsnap-pale-sky font-['Space_Mono',Helvetica] text-xs rounded-full border border-solid border-gray-800 px-3 py-1"
              >
                +{startsnap.tags.length - 3} more
              </Badge>
            )}
          </div>
        )}

        {/* Creator Info / Date Line */}
        <div className="flex items-center justify-between mt-4 pt-4 border-t border-gray-200/80">
          {showCreator && (
            <div className="flex items-center gap-3">
              <div className="w-8 h-8">
                <UserAvatar
                  name={creatorName}
                  size={32}
                  className="w-full h-full"
                />
              </div>
              <span className="font-['Roboto',Helvetica] font-semibold text-startsnap-oxford-blue text-sm leading-tight tracking-wide">
                {creatorName}
              </span>
            </div>
          )}

          <div className="flex items-center gap-2 ml-auto">
            {isOwner && variant === "profile" && (
              <Link 
                to={`/edit/${startsnap.id}`}
                className="startsnap-button bg-startsnap-mischka text-startsnap-ebony-clay font-['Roboto',Helvetica] font-semibold text-sm rounded-lg border-2 border-solid border-gray-800 shadow-[2px_2px_0px_#1f2937] py-1 px-3"
              >
                Edit
              </Link>
            )}
            <span className="font-['Inter',Helvetica] font-normal text-startsnap-pale-sky text-xs leading-relaxed">
              {formatDate(startsnap.created_at)}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};