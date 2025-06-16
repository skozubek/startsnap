/**
 * src/components/ui/StartSnapCard.tsx
 * @description Reusable card component for displaying StartSnap projects with consistent styling
 */

import React from "react";
import { Link } from "react-router-dom";
import { Card, CardContent } from "./card";
import { Badge } from "./badge";
import { UserAvatar, getAvatarName } from "./user-avatar";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "./tooltip";
import { getTransformedImageUrl } from "../../lib/utils";

/**
 * @description Props interface for the StartSnapCard component
 */
interface StartSnapCardProps {
  startsnap: any;
  showCreator?: boolean;
  creatorName?: string;
  variant?: 'main-page' | 'profile';
  isOwner?: boolean;
  formatDate: (dateString: string) => string;
  getCategoryDisplay: (categoryKey: string) => {
    name: string;
    bgColor: string;
    textColor: string;
    borderColor: string;
  };
  rank?: number; // Optional rank for trending projects (1, 2, 3)
}

/**
 * @description Card component for displaying StartSnap project information
 * @param {StartSnapCardProps} props - Component props
 * @returns {JSX.Element} Styled project card with category header and project details
 */
export const StartSnapCard: React.FC<StartSnapCardProps> = ({
  startsnap,
  showCreator = false,
  creatorName,
  variant = 'main-page',
  isOwner = false,
  formatDate,
  getCategoryDisplay,
  rank
}) => {
  const categoryDisplay = getCategoryDisplay(startsnap.category);

  /**
   * @description Gets the optimized thumbnail URL for the card header
   * @returns {string | null} Optimized image URL or null if no screenshot available
   */
  const getCardThumbnail = (): string | null => {
    if (!startsnap.screenshot_urls || !startsnap.screenshot_urls.length) {
      return null;
    }

    try {
      const firstScreenshot = startsnap.screenshot_urls[0];
      if (firstScreenshot.includes('supabase.co/storage')) {
        return getTransformedImageUrl(firstScreenshot, {
          width: 600,
          height: 300,
          quality: 80,
          resize: 'contain'
        });
      }
      return firstScreenshot;
    } catch (error) {
      return null;
    }
  };

  /**
   * @description Gets the appropriate styling for rank badges
   * @param {number} rank - The rank number (1, 2, or 3)
   * @returns {string} CSS classes for the rank badge
   */
  const getRankBadgeStyle = (rank: number): string => {
    switch (rank) {
      case 1:
        return "bg-yellow-400 text-yellow-900 border-yellow-600"; // Gold
      case 2:
        return "bg-gray-300 text-gray-800 border-gray-600"; // Silver
      case 3:
        return "bg-orange-400 text-orange-900 border-orange-600"; // Bronze
      default:
        return "";
    }
  };

  /**
   * @description Gets the emoji for the rank
   * @param {number} rank - The rank number (1, 2, or 3)
   * @returns {string} Emoji for the rank
   */
  const getRankEmoji = (rank: number): string => {
    switch (rank) {
      case 1:
        return "🏆";
      case 2:
        return "🥈";
      case 3:
        return "🥉";
      default:
        return "";
    }
  };

  const thumbnailUrl = getCardThumbnail();

  // Check if this project is featured by our scout account
  const isScouted = creatorName === 'VibeScout';

  const cardContent = (
    <Card className="h-full bg-startsnap-white rounded-xl overflow-hidden border-[3px] border-solid border-gray-800 shadow-[5px_5px_0px_#1f2937] group-hover:-translate-y-1 transition-transform duration-200">
      <CardContent className="p-0 h-full flex flex-col">
        {/* Category Header with optional screenshot background */}
        <div
          className={`${thumbnailUrl ? 'relative min-h-[250px]' : categoryDisplay.bgColor} px-6 ${thumbnailUrl ? 'pt-6 pb-6' : 'py-4'} border-b-2 border-gray-800 relative ${thumbnailUrl ? 'flex flex-col' : 'flex items-center'}`}
          style={thumbnailUrl ? {
            backgroundImage: `url(${thumbnailUrl})`,
            backgroundSize: 'cover',
            backgroundPosition: 'center',
            backgroundRepeat: 'no-repeat'
          } : undefined}
        >
          {/* Dark overlay for readability when using image background */}
          {thumbnailUrl && (
            <div className="absolute inset-0 bg-black/40"></div>
          )}

          <div className="flex justify-between items-center relative z-10 w-full">
            <Badge
              variant="outline"
              className={`${thumbnailUrl ? 'bg-white/90 text-gray-900 border-white/50' : `${categoryDisplay.bgColor} ${categoryDisplay.textColor} border ${categoryDisplay.borderColor}`} rounded-full px-3 py-1 font-['Space_Mono',Helvetica] font-normal text-xs`}
            >
              {categoryDisplay.name}
            </Badge>

            {/* Rank badge - only show for ranks 1, 2, 3 */}
            {rank && rank <= 3 && (
              <Badge
                variant="outline"
                className={`${getRankBadgeStyle(rank)} rounded-full px-2 py-1 font-['Space_Mono',Helvetica] font-bold text-xs border-2 ${thumbnailUrl ? 'bg-white/90' : ''}`}
              >
                {getRankEmoji(rank)} #{rank}
              </Badge>
            )}
          </div>
        </div>

        {/* Project Content */}
        <div className="p-6 flex-1 flex flex-col">
          <h3 className="font-['Space_Grotesk',Helvetica] font-bold text-startsnap-ebony-clay text-xl leading-tight mb-3 line-clamp-2">
            {startsnap.name}
          </h3>

          <p className="font-['Roboto',Helvetica] font-normal text-startsnap-river-bed text-sm leading-relaxed mb-4 line-clamp-3 flex-1">
            {startsnap.description}
          </p>

          {/* Project Type and Hackathon badges */}
          <div className="flex gap-2 flex-wrap items-center mb-4">
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

          {/* Tags */}
          {startsnap.tags && startsnap.tags.length > 0 && (
            <div className="flex flex-wrap gap-2 mb-4">
              {startsnap.tags.slice(0, 3).map((tag: string, index: number) => (
                <Badge key={`tag-${index}`} variant="outline" className="bg-startsnap-athens-gray text-startsnap-ebony-clay font-['Space_Mono',Helvetica] text-xs rounded-full border border-solid border-gray-800 px-2 py-1">
                  #{tag}
                </Badge>
              ))}
              {startsnap.tags.length > 3 && (
                <Badge variant="outline" className="bg-startsnap-athens-gray text-startsnap-ebony-clay font-['Space_Mono',Helvetica] text-xs rounded-full border border-solid border-gray-800 px-2 py-1">
                  +{startsnap.tags.length - 3}
                </Badge>
              )}
            </div>
          )}

          {/* Tools Used */}
          {startsnap.tools_used && startsnap.tools_used.length > 0 && (
            <div className="flex flex-wrap gap-2 mb-4">
              {startsnap.tools_used.slice(0, 3).map((tool: string, index: number) => (
                <Badge key={`tool-${index}`} variant="outline" className="bg-startsnap-french-pass text-startsnap-persian-blue font-['Space_Mono',Helvetica] text-xs rounded-full border border-solid border-blue-700 px-2 py-1">
                  {tool}
                </Badge>
              ))}
              {startsnap.tools_used.length > 3 && (
                <Badge variant="outline" className="bg-startsnap-french-pass text-startsnap-persian-blue font-['Space_Mono',Helvetica] text-xs rounded-full border border-solid border-blue-700 px-2 py-1">
                  +{startsnap.tools_used.length - 3}
                </Badge>
              )}
            </div>
          )}

          {/* Footer with creator info/featured badge and support count */}
          <div className="flex items-center justify-between mt-auto pt-4 border-t border-gray-200/80">
            {isScouted ? (
              <Tooltip>
                <TooltipTrigger asChild>
                  <div className="cursor-help">
                    <Badge variant="outline" className="bg-gray-800 text-white font-['Space_Mono',Helvetica] text-xs rounded-full border-none px-3 py-1.5 flex items-center gap-1 hover:bg-gray-700 transition-colors duration-150">
                      ✨ Featured by StartSnap
                      <span className="material-icons text-xs ml-1 opacity-70">info</span>
                    </Badge>
                  </div>
                </TooltipTrigger>
                <TooltipContent>
                  <div className="text-center">
                    <p className="font-medium mb-1">Featured Project!</p>
                    <p className="text-gray-300">Own this? DM <span className="font-semibold text-white">@startsnapfun</span> to claim it</p>
                  </div>
                </TooltipContent>
              </Tooltip>
            ) : (
              showCreator && creatorName && (
                <div className="flex items-center">
                  {creatorName !== 'Anonymous' ? (
                    <Link to={`/profiles/${creatorName}`} className="flex items-center gap-2 group/creator hover:text-startsnap-french-rose transition-colors duration-150 focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-startsnap-french-rose">
                      <div className="w-6 h-6">
                        <UserAvatar
                          name={getAvatarName(null, creatorName)}
                          size={24}
                          className="w-full h-full"
                        />
                      </div>
                      <span className="font-['Roboto',Helvetica] font-medium text-startsnap-oxford-blue text-sm group-hover/creator:text-startsnap-french-rose">
                        {creatorName}
                      </span>
                    </Link>
                  ) : (
                    <div className="flex items-center gap-2">
                      <div className="w-6 h-6">
                        <UserAvatar
                          name={getAvatarName(null, creatorName)}
                          size={24}
                          className="w-full h-full"
                        />
                      </div>
                      <span className="font-['Roboto',Helvetica] font-medium text-startsnap-oxford-blue text-sm">
                        {creatorName}
                      </span>
                    </div>
                  )}
                </div>
              )
            )}

            {variant === 'profile' && isOwner && (
              <div className="flex items-center gap-2">
                <Link
                  to={`/edit/${startsnap.id}`}
                  className="text-startsnap-oxford-blue hover:text-startsnap-french-rose transition-colors"
                  onClick={(e) => e.stopPropagation()}
                >
                  <span className="material-icons text-lg">edit</span>
                </Link>
              </div>
            )}

            {/* Support count with heart icon */}
            <div className="flex items-center gap-1 text-sm text-startsnap-french-rose ml-auto">
              <span className="material-icons text-lg">favorite</span>
              {startsnap.support_count || 0}
            </div>
          </div>

          {/* Launch date for main-page variant - only show if not scouted */}
          {variant === 'main-page' && !isScouted && (
            <p className="font-['Inter',Helvetica] font-normal text-startsnap-pale-sky text-xs leading-4 mt-2">
              {formatDate(startsnap.created_at)}
            </p>
          )}
        </div>
      </CardContent>
    </Card>
  );

  return (
    <TooltipProvider>
      <Link to={`/projects/${startsnap.slug}`} className="block group">
        {cardContent}
      </Link>
    </TooltipProvider>
  );
};