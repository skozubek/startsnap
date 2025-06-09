/**
 * src/components/ui/StartSnapCard.tsx
 * @description Reusable card component for displaying StartSnap projects with consistent styling
 */

import React from "react";
import { Link } from "react-router-dom";
import { Card, CardContent } from "./card";
import { Badge } from "./badge";
import { Button } from "./button";
import { UserAvatar, getAvatarName } from "./user-avatar";
import type { StartSnapProject } from "../../types/startsnap";

/**
 * @description Props for the StartSnapCard component
 */
interface StartSnapCardProps {
  startsnap: StartSnapProject;
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
 * @returns {JSX.Element} Styled card with project details and optional creator info
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
   * @description Gets the appropriate styling for rank badges
   * @param {number} rank - The rank number (1, 2, or 3)
   * @returns {Object} Badge styling configuration
   */
  const getRankBadgeStyle = (rank: number) => {
    switch (rank) {
      case 1:
        return {
          emoji: "🏆",
          text: "#1",
          bgColor: "bg-yellow-200",
          textColor: "text-yellow-800",
          borderColor: "border-yellow-700"
        };
      case 2:
        return {
          emoji: "🥈",
          text: "#2",
          bgColor: "bg-gray-200",
          textColor: "text-gray-800",
          borderColor: "border-gray-700"
        };
      case 3:
        return {
          emoji: "🥉",
          text: "#3",
          bgColor: "bg-orange-200",
          textColor: "text-orange-800",
          borderColor: "border-orange-700"
        };
      default:
        return null;
    }
  };

  const rankStyle = rank ? getRankBadgeStyle(rank) : null;

  return (
    <Link to={`/projects/${startsnap.slug}`} className="block group">
      <Card className="h-full bg-startsnap-white rounded-xl overflow-hidden border-[3px] border-solid border-gray-800 shadow-[5px_5px_0px_#1f2937] group-hover:-translate-y-1 transition-transform duration-200">
        <CardContent className="p-0 h-full flex flex-col">
          <div className={`${categoryDisplay.bgColor} px-6 py-4 border-b-2 border-gray-800 relative`}>
            {/* Rank Badge - Only show for ranks 1, 2, 3 */}
            {rankStyle && (
              <div className="absolute top-2 right-2">
                <Badge
                  variant="outline"
                  className={`${rankStyle.bgColor} ${rankStyle.textColor} border ${rankStyle.borderColor} rounded-full px-2 py-1 font-['Space_Mono',Helvetica] font-bold text-xs flex items-center gap-1`}
                >
                  <span>{rankStyle.emoji}</span>
                  <span>{rankStyle.text}</span>
                </Badge>
              </div>
            )}
            
            <h3 className={`${categoryDisplay.textColor} font-[var(--startsnap-semantic-heading-3-font-family)] font-black tracking-tight leading-tight text-xl mb-2 pr-16`}>
              {startsnap.name}
            </h3>
            <div className="flex gap-2 flex-wrap">
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
          <div className="p-6 flex-1 flex flex-col">
            <p className="font-['Roboto',Helvetica] font-normal text-startsnap-river-bed text-sm leading-relaxed mb-4 line-clamp-3 flex-1">
              {startsnap.description}
            </p>
            {(startsnap.tags && startsnap.tags.length > 0 || startsnap.tools_used && startsnap.tools_used.length > 0) && (
              <div className="flex flex-wrap items-center gap-2 mb-4">
                {startsnap.tags && startsnap.tags.slice(0, 3).map((tag: string, index: number) => (
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
            {/* Support count display */}
            {startsnap.support_count !== undefined && (
              <div className="flex items-center gap-1 text-sm text-startsnap-french-rose mb-4">
                <span className="material-icons text-base">favorite</span>
                <span className="font-['Roboto',Helvetica] font-medium">{startsnap.support_count}</span>
              </div>
            )}
            {showCreator && creatorName && (
              <div className="flex items-center justify-between pt-4 border-t border-gray-200/80">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8">
                    <UserAvatar
                      name={getAvatarName(null, creatorName)}
                      size={32}
                      className="w-full h-full"
                    />
                  </div>
                  <div>
                    <p className="font-['Space_Grotesk',Helvetica] font-bold text-startsnap-ebony-clay text-sm leading-tight">
                      {creatorName}
                    </p>
                    <p className="font-['Roboto',Helvetica] text-startsnap-shuttle-gray text-xs">
                      {formatDate(startsnap.created_at)}
                    </p>
                  </div>
                </div>
              </div>
            )}
            {variant === 'profile' && isOwner && (
              <div className="flex gap-2 pt-4 border-t border-gray-200/80">
                <Button
                  asChild
                  size="sm"
                  className="startsnap-button bg-startsnap-french-rose text-startsnap-white font-['Roboto',Helvetica] font-bold rounded-lg border-2 border-solid border-gray-800 shadow-[3px_3px_0px_#1f2937] flex-1"
                >
                  <Link to={`/edit/${startsnap.id}`}>Edit</Link>
                </Button>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </Link>
  );
};