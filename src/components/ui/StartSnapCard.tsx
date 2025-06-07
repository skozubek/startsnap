/**
 * src/components/ui/StartSnapCard.tsx
 * @description Reusable card component for displaying StartSnap projects with consistent styling
 */

import React from "react";
import { Link } from "react-router-dom";
import { Card, CardContent } from "./card";
import { Badge } from "./badge";
import { UserAvatar } from "./user-avatar";
import { Button } from "./button";
import { Pencil } from "lucide-react";

/**
 * @description Props for the StartSnapCard component
 * @param startsnap - The StartSnap project data to display
 * @param showCreator - Whether to show creator information
 * @param creatorName - Name of the project creator (optional)
 * @param variant - Display variant for different contexts
 * @param isOwner - Whether the current user owns this project (optional)
 * @param formatDate - Function to format dates
 * @param getCategoryDisplay - Function to get category display properties
 */
interface StartSnapCardProps {
  startsnap: any;
  showCreator?: boolean;
  creatorName?: string;
  variant?: 'main-page' | 'profile';
  isOwner?: boolean;
  formatDate: (dateString: string) => string;
  getCategoryDisplay: (category: string) => {
    name: string;
    bgColor: string;
    textColor: string;
    borderColor: string;
  };
}

/**
 * @description Card component for displaying StartSnap project information
 * @param {StartSnapCardProps} props - Component props
 * @returns {JSX.Element} Styled card with project information
 */
export const StartSnapCard: React.FC<StartSnapCardProps> = ({
  startsnap,
  showCreator = false,
  creatorName = 'Anonymous',
  variant = 'main-page',
  isOwner = false,
  formatDate,
  getCategoryDisplay,
}) => {
  const categoryDisplay = getCategoryDisplay(startsnap.category);

  return (
    <Card className="group bg-startsnap-white rounded-xl overflow-hidden border-[3px] border-solid border-gray-800 shadow-[5px_5px_0px_#1f2937] hover:translate-x-[-2px] hover:translate-y-[-2px] hover:shadow-[7px_7px_0px_#1f2937] transition-all duration-200 h-full flex flex-col">
      <div className={`${categoryDisplay.bgColor} px-6 py-4 border-b-2 border-gray-800`}>
        <div className="flex justify-between items-start gap-3 mb-3">
          <h3 className={`${categoryDisplay.textColor} font-[var(--startsnap-semantic-heading-3-font-family)] font-black tracking-tight leading-tight flex-1 text-xl lg:text-2xl line-clamp-2`}>
            {startsnap.name}
          </h3>
          {isOwner && (
            <Link
              to={`/edit/${startsnap.id}`}
              className="flex-shrink-0 p-2 rounded-full hover:bg-black/10 transition-colors"
              onClick={(e) => e.stopPropagation()}
            >
              <Pencil size={16} className={categoryDisplay.textColor} />
            </Link>
          )}
        </div>
        <div className="flex gap-2 flex-wrap items-center">
          <Badge
            variant="outline"
            className={`${categoryDisplay.bgColor} ${categoryDisplay.textColor} border ${categoryDisplay.borderColor} rounded-full px-3 py-1 font-['Space_Mono',Helvetica] font-normal text-xs`}
          >
            {categoryDisplay.name}
          </Badge>
          {startsnap.type === "live" ? (
            <Badge variant="outline" className="bg-startsnap-mountain-meadow text-white font-['Space_Mono',Helvetica] text-xs rounded-full border border-solid border-green-700 px-2 py-1 flex items-center gap-1">
              <span className="material-icons text-xs">rocket_launch</span>
              Live
            </Badge>
          ) : (
            <Badge variant="outline" className="bg-startsnap-corn text-startsnap-ebony-clay font-['Space_Mono',Helvetica] text-xs rounded-full border border-solid border-yellow-700 px-2 py-1 flex items-center gap-1">
              <span className="material-icons text-xs">lightbulb</span>
              Idea
            </Badge>
          )}
          {startsnap.is_hackathon_entry && (
            <Badge variant="outline" className="bg-startsnap-heliotrope text-white font-['Space_Mono',Helvetica] text-xs rounded-full border border-solid border-purple-700 px-2 py-1 flex items-center gap-1">
              <span className="material-icons text-xs">emoji_events</span>
              Hackathon
            </Badge>
          )}
        </div>
      </div>

      <Link to={`/projects/${startsnap.slug}`} className="flex-1 flex flex-col">
        <CardContent className="p-6 flex-1 flex flex-col">
          <p className="font-['Roboto',Helvetica] font-normal text-startsnap-river-bed text-base leading-relaxed line-clamp-3 flex-1 mb-4">
            {startsnap.description}
          </p>

          {(startsnap.tags && startsnap.tags.length > 0 || startsnap.tools_used && startsnap.tools_used.length > 0) && (
            <div className="flex flex-wrap items-center gap-2 mb-4">
              {startsnap.tags && startsnap.tags.slice(0, 2).map((tag: string, index: number) => (
                <Badge key={`tag-${index}`} variant="outline" className="bg-startsnap-athens-gray text-startsnap-ebony-clay font-['Space_Mono',Helvetica] text-xs rounded-full border border-solid border-gray-800 px-2 py-1">
                  #{tag}
                </Badge>
              ))}
              {startsnap.tools_used && startsnap.tools_used.slice(0, 2).map((tool: string, index: number) => (
                <Badge key={`tool-${index}`} variant="outline" className="bg-startsnap-french-pass text-startsnap-persian-blue font-['Space_Mono',Helvetica] text-xs rounded-full border border-solid border-blue-700 px-2 py-1">
                  {tool}
                </Badge>
              ))}
            </div>
          )}

          {showCreator && (
            <div className="mt-auto pt-4 border-t border-gray-200/80">
              <Link 
                to={`/profiles/${creatorName}`} 
                className="group inline-block" 
                onClick={(e) => e.stopPropagation()}
              >
                <div className="flex items-center gap-4">
                  <div className="w-9 h-9">
                    <UserAvatar name={creatorName} size={36} className="w-full h-full" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="font-['Roboto',Helvetica] font-semibold text-startsnap-oxford-blue text-sm leading-tight tracking-wide group-hover:text-startsnap-french-rose transition-colors">
                      {creatorName}
                    </p>
                    <p className="font-['Inter',Helvetica] font-normal text-startsnap-pale-sky text-xs leading-relaxed mt-0.5">
                      {formatDate(startsnap.created_at)}
                    </p>
                  </div>
                </div>
              </Link>
            </div>
          )}

          {startsnap.support_count !== undefined && (
            <div className="flex items-center justify-end gap-1 mt-2 text-sm text-startsnap-french-rose">
              <span className="material-icons text-base">favorite</span>
              {startsnap.support_count}
            </div>
          )}
        </CardContent>
      </Link>
    </Card>
  );
};