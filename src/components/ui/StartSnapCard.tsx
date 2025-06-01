/**
 * src/components/ui/StartSnapCard.tsx
 * @description Reusable card component for displaying StartSnap projects
 */

import React from "react";
import { Link } from "react-router-dom";
import { Badge } from "./badge";
import { Card, CardContent } from "./card";
import { UserAvatar } from "./user-avatar";

interface StartSnapCardProps {
  startsnap: any;
  showCreator: boolean;
  creatorName?: string;
  creatorInitials?: string;
  variant: "main-page" | "profile";
  isOwner: boolean;
  formatDate: (date: string) => string;
  getCategoryDisplay: (category: string) => any;
  onDelete?: (id: string) => void;
  thumbnailStyle?: "minimalist" | "detailed";
}

/**
 * @description Card component that displays a StartSnap project with various display options
 * @param {StartSnapCardProps} props - Component props
 * @returns {JSX.Element} Card component with project details and optional actions
 */
export const StartSnapCard = ({
  startsnap,
  showCreator,
  creatorName,
  creatorInitials,
  variant,
  isOwner,
  formatDate,
  getCategoryDisplay,
  onDelete,
  thumbnailStyle = "minimalist"
}: StartSnapCardProps): JSX.Element => {
  // Get category display properties
  const categoryDisplay = getCategoryDisplay(startsnap.category);

  // Generate thumbnail background with category color hue
  const thumbnailStyle1 = {
    backgroundColor: `hsla(${categoryDisplay.hue || 180}, 70%, 92%, 1)`,
    backgroundImage: `linear-gradient(120deg, hsla(${categoryDisplay.hue || 180}, 70%, 92%, 1) 0%, hsla(${categoryDisplay.hue || 180}, 80%, 85%, 1) 100%)`
  };

  /**
   * @description Handles the click event on the delete button
   * @param {React.MouseEvent} e - Click event
   * @sideEffects Prevents click propagation and calls onDelete callback
   */
  const handleDeleteClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (onDelete) {
      onDelete(startsnap.id);
    }
  };

  return (
    <Card className="bg-startsnap-white rounded-xl overflow-hidden border-[3px] border-solid border-gray-800 shadow-[5px_5px_0px_#1f2937] relative">
      <Link 
        to={`/project/${startsnap.id}`}
        className="flex flex-col h-full transition-transform hover:translate-y-[-2px] hover:shadow-lg"
      >
        {/* Thumbnail area with category color */}
        <div className="w-full aspect-video" style={thumbnailStyle1}>
          <div className="h-full flex justify-center items-center">
            {thumbnailStyle === "minimalist" ? (
              <h3 className={`${categoryDisplay.textColor} font-['Space_Grotesk',Helvetica] font-black tracking-tight leading-tight px-8 py-4 text-2xl text-center`}>
                {startsnap.name}
              </h3>
            ) : (
              <div className="flex flex-col items-center justify-center p-6 text-center">
                <Badge
                  variant="outline"
                  className={`${categoryDisplay.bgColor} ${categoryDisplay.textColor} border ${categoryDisplay.borderColor} rounded-full px-4 py-2 font-['Space_Mono',Helvetica] font-normal mb-4 text-sm`}
                >
                  {categoryDisplay.name}
                </Badge>
                <h3 className={`${categoryDisplay.textColor} font-['Space_Grotesk',Helvetica] font-black tracking-tight leading-tight text-2xl`}>
                  {startsnap.name}
                </h3>
              </div>
            )}
          </div>
        </div>

        <CardContent className="p-0 h-full flex flex-col">
          {/* Card main content area */}
          <div className="flex-1 p-6">
            {/* Category badge */}
            {thumbnailStyle !== "detailed" && (
              <Badge
                variant="outline"
                className={`${categoryDisplay.bgColor} ${categoryDisplay.textColor} border ${categoryDisplay.borderColor} rounded-full px-3 py-1 font-['Space_Mono',Helvetica] font-normal text-xs mb-4`}
              >
                {categoryDisplay.name}
              </Badge>
            )}

            {/* Project title for minimalist style */}
            {thumbnailStyle !== "minimalist" && (
              <h3 className="font-['Space_Grotesk',Helvetica] font-bold text-startsnap-ebony-clay text-xl leading-tight mb-2">
                {startsnap.name}
              </h3>
            )}

            {/* Description */}
            <p className="font-['Roboto',Helvetica] font-normal text-startsnap-river-bed text-sm leading-relaxed mb-4 line-clamp-3">
              {startsnap.description}
            </p>

            {/* Tags section */}
            {startsnap.tags && startsnap.tags.length > 0 && (
              <div className="flex flex-wrap gap-2 mb-2">
                {startsnap.tags.slice(0, 3).map((tag: string, idx: number) => (
                  <Badge
                    key={idx}
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

            {/* Launch date */}
            <p className="font-['Inter',Helvetica] font-normal text-startsnap-pale-sky text-xs leading-tight">
              {formatDate(startsnap.created_at)}
            </p>
          </div>

          {/* Footer with creator info and/or action buttons */}
          <div className="border-t border-gray-200 p-4" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between">
              {showCreator ? (
                <Link 
                  to={`/profile`} 
                  className="flex items-center gap-4 flex-1 transition-colors hover:text-startsnap-french-rose"
                  onClick={(e) => e.stopPropagation()}
                >
                  <div className="w-9 h-9">
                    <UserAvatar
                      name={creatorName || ""}
                      size={36}
                      className="w-full h-full"
                    />
                  </div>
                  <span className="font-['Roboto',Helvetica] font-semibold text-startsnap-oxford-blue text-sm leading-tight">
                    {creatorName}
                  </span>
                </Link>
              ) : (
                <div className="flex items-center gap-2">
                  {/* Project status badge */}
                  {startsnap.type === "live" ? (
                    <Badge variant="outline" className="bg-startsnap-mountain-meadow text-white font-['Space_Mono',Helvetica] text-xs rounded-full border border-solid border-green-700 px-2 py-0.5 flex items-center gap-1">
                      <span className="material-icons text-xs">rocket_launch</span>
                      Live
                    </Badge>
                  ) : (
                    <Badge variant="outline" className="bg-startsnap-corn text-startsnap-ebony-clay font-['Space_Mono',Helvetica] text-xs rounded-full border border-solid border-yellow-700 px-2 py-0.5 flex items-center gap-1">
                      <span className="material-icons text-xs">lightbulb</span>
                      Idea
                    </Badge>
                  )}

                  {/* Hackathon badge if applicable */}
                  {startsnap.is_hackathon_entry && (
                    <Badge variant="outline" className="bg-startsnap-heliotrope text-white font-['Space_Mono',Helvetica] text-xs rounded-full border border-solid border-purple-700 px-2 py-0.5 flex items-center gap-1">
                      <span className="material-icons text-xs">emoji_events</span>
                      Hackathon
                    </Badge>
                  )}
                </div>
              )}

              {/* Edit/Delete buttons for profile variant */}
              {variant === "profile" && isOwner && (
                <div className="flex gap-2" onClick={(e) => e.stopPropagation()}>
                  <Link
                    to={`/edit/${startsnap.id}`}
                    className="text-startsnap-persian-blue transition-colors hover:text-startsnap-french-rose"
                    onClick={(e) => e.stopPropagation()}
                  >
                    <span className="material-icons text-lg">edit</span>
                  </Link>
                  {onDelete && (
                    <button
                      onClick={handleDeleteClick}
                      className="text-startsnap-french-rose transition-colors hover:opacity-80"
                    >
                      <span className="material-icons text-lg">delete</span>
                    </button>
                  )}
                </div>
              )}
            </div>
          </div>
        </CardContent>
      </Link>
    </Card>
  );
};