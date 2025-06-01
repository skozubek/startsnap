/**
 * src/components/ui/StartSnapCard.tsx
 * @description Component for displaying a StartSnap project card in various contexts
 */

import React from "react";
import { Link } from "react-router-dom";
import { Badge } from "./badge";
import { UserAvatar } from "./user-avatar";
import { cn } from "../../lib/utils";

/**
 * @description Props for the StartSnapCard component
 */
interface StartSnapCardProps {
  startsnap: any;
  showCreator?: boolean;
  creatorName?: string;
  creatorInitials?: string;
  variant?: 'main-page' | 'profile';
  isOwner?: boolean;
  formatDate: (date: string) => string;
  getCategoryDisplay: (category: string) => any;
  thumbnailStyle?: 'minimalist' | 'gradient' | 'abstract';
}

/**
 * @description Component for displaying a StartSnap project in a card format
 * @param {StartSnapCardProps} props - Component props
 * @returns {JSX.Element} Card component displaying project information
 */
export const StartSnapCard = ({
  startsnap,
  showCreator = false,
  creatorName = "Anonymous",
  creatorInitials = "AN",
  variant = 'main-page',
  isOwner = false,
  formatDate,
  getCategoryDisplay,
  thumbnailStyle = 'minimalist'
}: StartSnapCardProps): JSX.Element => {
  const categoryDisplay = getCategoryDisplay(startsnap.category);
  const formattedDate = formatDate(startsnap.created_at);
  
  // Get random color hue based on category for thumbnail
  const hue = categoryDisplay.hue || 210;
  
  return (
    <div className="relative h-full">
      <div className="h-full bg-startsnap-white rounded-xl overflow-hidden border-[3px] border-solid border-gray-800 shadow-[5px_5px_0px_#1f2937] flex flex-col">
        {/* Card content as link to project detail (excluding creator section) */}
        <Link 
          to={`/project/${startsnap.id}`} 
          className="flex-1 flex flex-col"
        >
          {/* Card header with thumbnail */}
          <div className="relative">
            {/* Generate thumbnail based on style */}
            {thumbnailStyle === 'minimalist' ? (
              <div 
                className="w-full h-[120px]"
                style={{
                  background: `linear-gradient(135deg, hsl(${hue}, 80%, 80%), hsl(${hue}, 70%, 60%))`
                }}
              >
                <div className="absolute inset-0 flex items-center justify-center">
                  <span className="material-icons text-white text-5xl opacity-50">
                    {startsnap.type === 'live' ? 'rocket_launch' : 'lightbulb'}
                  </span>
                </div>
              </div>
            ) : (
              <div 
                className="w-full h-[120px]"
                style={{
                  background: `linear-gradient(135deg, hsl(${hue}, 80%, 85%), hsl(${hue}, 70%, 65%))`
                }}
              ></div>
            )}
            
            {/* Category badge positioned on thumbnail */}
            <div className="absolute top-3 right-3">
              <Badge
                variant="outline"
                className={`${categoryDisplay.bgColor} ${categoryDisplay.textColor} border ${categoryDisplay.borderColor} rounded-full px-3 py-1 font-['Space_Mono',Helvetica] font-normal text-xs`}
              >
                {categoryDisplay.name}
              </Badge>
            </div>
          </div>
          
          {/* Card content */}
          <div className="flex-1 p-5 flex flex-col">
            {/* Project type and date */}
            <div className="flex items-center justify-between mb-3">
              {startsnap.type === "live" ? (
                <Badge variant="outline" className="bg-startsnap-mountain-meadow text-white font-['Space_Mono',Helvetica] text-xs rounded-full border border-solid border-green-700 px-2 py-0.5 flex items-center gap-1">
                  <span className="material-icons text-xs">rocket_launch</span>
                  Live Project
                </Badge>
              ) : (
                <Badge variant="outline" className="bg-startsnap-corn text-startsnap-ebony-clay font-['Space_Mono',Helvetica] text-xs rounded-full border border-solid border-yellow-700 px-2 py-0.5 flex items-center gap-1">
                  <span className="material-icons text-xs">lightbulb</span>
                  Idea / Concept
                </Badge>
              )}
              
              <span className="font-['Inter',Helvetica] font-normal text-startsnap-pale-sky text-xs">
                {formattedDate}
              </span>
            </div>
            
            {/* Project title */}
            <h3 className={`font-['Space_Grotesk',Helvetica] font-bold text-startsnap-oxford-blue ${showCreator ? 'text-xl' : 'text-lg'} leading-tight mb-2`}>
              {startsnap.name}
            </h3>
            
            {/* Project description (truncated) */}
            <p className="font-['Roboto',Helvetica] font-normal text-startsnap-river-bed text-sm line-clamp-3 mb-4 flex-grow">
              {startsnap.description}
            </p>
            
            {/* Tags */}
            {startsnap.tags && startsnap.tags.length > 0 && (
              <div className="flex flex-wrap gap-1.5 mt-auto mb-2">
                {startsnap.tags.slice(0, 3).map((tag: string, idx: number) => (
                  <Badge
                    key={`tag-${idx}`}
                    variant="outline"
                    className="bg-startsnap-athens-gray text-startsnap-ebony-clay font-['Space_Mono',Helvetica] text-xs rounded-full border border-solid border-gray-800 px-2 py-0.5"
                  >
                    #{tag}
                  </Badge>
                ))}
                {startsnap.tags.length > 3 && (
                  <Badge
                    variant="outline"
                    className="bg-startsnap-athens-gray text-startsnap-ebony-clay font-['Space_Mono',Helvetica] text-xs rounded-full border border-solid border-gray-800 px-2 py-0.5"
                  >
                    +{startsnap.tags.length - 3} more
                  </Badge>
                )}
              </div>
            )}
          </div>
        </Link>
        
        {/* Creator section (not wrapped in the Link) */}
        {showCreator && (
          <div className="border-t border-gray-200/80 p-4">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8">
                <UserAvatar
                  name={creatorName}
                  size={32}
                  className="w-full h-full"
                />
              </div>
              <span className="font-['Roboto',Helvetica] font-semibold text-startsnap-oxford-blue text-sm">
                {creatorName}
              </span>
            </div>
          </div>
        )}
        
        {/* Admin controls for profile page */}
        {variant === 'profile' && isOwner && (
          <div className="border-t border-gray-200/80 p-4 flex gap-2 justify-end">
            <Link
              to={`/edit/${startsnap.id}`}
              className="startsnap-button inline-flex items-center justify-center font-['Roboto',Helvetica] font-bold px-3 py-1.5 text-xs bg-startsnap-mischka text-startsnap-ebony-clay rounded-lg border-2 border-solid border-gray-800 shadow-[2px_2px_0px_#1f2937]"
              onClick={(e) => e.stopPropagation()}
            >
              <span className="material-icons text-sm mr-1">edit</span>
              Edit
            </Link>
          </div>
        )}
      </div>
    </div>
  );
};