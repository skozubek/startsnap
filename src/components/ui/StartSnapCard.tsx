/**
 * src/components/ui/StartSnapCard.tsx
 * @description Reusable StartSnap card component for displaying project information
 */

import React from "react";
import { Link } from "react-router-dom";
import { Badge } from "./badge";
import { Button } from "./button";
import { Card, CardContent, CardFooter } from "./card";
import { UserAvatar } from "./user-avatar";

/**
 * @description Available thumbnail style options for project cards
 */
export type ThumbnailStyle = 'minimalist' | 'grid' | 'chevron' | 'polkaDot';

/**
 * @description Type definition for StartSnap project data
 */
interface StartSnapType {
  id: string;
  name: string;
  description: string;
  category: string;
  type: "live" | "idea";
  is_hackathon_entry?: boolean;
  tags?: string[];
  tools_used?: string[];
  feedback_tags?: string[];
  created_at: string;
  user_id: string;
}

/**
 * @description Props for the StartSnapCard component
 */
interface StartSnapCardProps {
  startsnap: StartSnapType;
  showCreator?: boolean;
  creatorName?: string;
  creatorInitials?: string;
  variant?: 'main-page' | 'profile';
  isOwner?: boolean;
  formatDate: (dateString: string) => string;
  getCategoryDisplay: (category: string) => {
    name: string;
    bgColor: string;
    textColor: string;
    borderColor: string;
  };
  thumbnailStyle?: ThumbnailStyle; // New prop
}

/**
 * @description Reusable StartSnap card component with configurable display options
 * @param {StartSnapCardProps} props - Component props
 * @returns {JSX.Element} StartSnap card with project information
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

  // Simplified layout - no thumbnail, pure content focus
  const cardPadding = variant === 'main-page' ? 'p-7' : 'p-7';

  return (
    <Card className="bg-startsnap-white rounded-xl overflow-hidden border-[3px] border-solid border-gray-800 shadow-[5px_5px_0px_#1f2937]">
      <CardContent className={`${cardPadding} relative`}>
        {/* Header with title and category - clean and direct */}
        <div className={`${categoryDisplay.bgColor} px-6 py-5 -mx-7 -mt-7 mb-6`}>
          <div className="flex justify-between items-start gap-4 mb-4">
            {/* Project Title - Now the hero element */}
            <h3 className={`${categoryDisplay.textColor} font-[var(--startsnap-semantic-heading-3-font-family)] font-black tracking-tight leading-tight flex-1 ${
              variant === 'main-page'
                ? 'text-3xl lg:text-4xl'
                : 'text-2xl lg:text-3xl'
            }`}>
              {startsnap.name}
            </h3>

            {/* Category Badge */}
            <Badge
              variant="outline"
              className={`${categoryDisplay.bgColor} ${categoryDisplay.textColor} border ${categoryDisplay.borderColor} rounded-full px-[13px] py-[5px] font-['Space_Mono',Helvetica] font-normal shrink-0 ${
                variant === 'main-page' ? 'text-sm' : 'text-xs'
              }`}
            >
              {categoryDisplay.name}
            </Badge>
          </div>

          {/* Status badges - now in header */}
          <div className="flex gap-2 flex-wrap">
            {/* Project type badge */}
            {startsnap.type === "live" ? (
              <Badge variant="outline\" className="bg-startsnap-mountain-meadow text-white font-['Space_Mono',Helvetica] text-xs rounded-full border border-solid border-green-700 px-2 py-0.5 flex items-center gap-1">
                <span className="material-icons text-xs">rocket_launch</span>
                Live Project
              </Badge>
            ) : (
              <Badge variant="outline" className="bg-startsnap-corn text-startsnap-ebony-clay font-['Space_Mono',Helvetica] text-xs rounded-full border border-solid border-yellow-700 px-2 py-0.5 flex items-center gap-1">
                <span className="material-icons text-xs">lightbulb</span>
                Idea
              </Badge>
            )}

            {/* Hackathon badge */}
            {startsnap.is_hackathon_entry && (
              <Badge variant="outline" className="bg-startsnap-heliotrope text-white font-['Space_Mono',Helvetica] text-xs rounded-full border border-solid border-purple-700 px-2 py-0.5 flex items-center gap-1">
                <span className="material-icons text-xs">emoji_events</span>
                Hackathon Entry
              </Badge>
            )}
          </div>
        </div>

        {/* Content area - now gets ALL the space */}
        <div className="space-y-6">
          {/* Project Description - hero treatment */}
          <p className={`font-['Roboto',Helvetica] font-normal text-startsnap-river-bed leading-relaxed ${
            variant === 'main-page'
              ? 'text-lg line-clamp-4'
              : 'text-base line-clamp-4'
          } overflow-hidden`}>
            {startsnap.description}
          </p>

          {/* Creator info - da Vinci refined layout */}
          {showCreator && (
            <div className="flex items-center pt-5 mt-1 border-t border-gray-200/80">
              <div className="flex items-center gap-4">
                <div className="w-9 h-9">
                  <UserAvatar
                    name={creatorName}
                    size={36}
                    className="w-full h-full"
                  />
                </div>
                <div className="min-w-0 flex-1">
                  <p className="font-['Roboto',Helvetica] font-semibold text-startsnap-oxford-blue text-sm leading-tight tracking-wide">
                    {creatorName}
                  </p>
                  <p className="font-['Inter',Helvetica] font-normal text-startsnap-pale-sky text-xs leading-relaxed mt-0.5">
                    {formatDate(startsnap.created_at)}
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Date only - for profile variant */}
          {!showCreator && (
            <p className="font-['Inter',Helvetica] font-normal text-startsnap-pale-sky text-xs">
              {formatDate(startsnap.created_at)}
            </p>
          )}

          {/* Separated tag sections - improved spacing and layout */}
          <div className="space-y-4">
            {/* General Tags Section */}
            {startsnap.tags && startsnap.tags.length > 0 && (
              <div className="flex items-start gap-3">
                <span className={`material-icons text-startsnap-oxford-blue ${variant === 'main-page' ? 'text-sm' : 'text-xs'} mt-1 shrink-0`}>tag</span>
                <div className="flex flex-wrap gap-2 flex-1">
                  {startsnap.tags.slice(0, 3).map((tag, idx) => (
                    <Badge
                      key={`tag-${idx}`}
                      variant="outline"
                      className="bg-startsnap-athens-gray text-startsnap-ebony-clay font-['Space_Mono',Helvetica] text-xs rounded-full border border-solid border-gray-800 px-3 py-1"
                    >
                      #{tag}
                    </Badge>
                  ))}
                  {startsnap.tags.length > 3 && (
                    <Badge variant="outline" className="bg-startsnap-athens-gray text-startsnap-ebony-clay font-['Space_Mono',Helvetica] text-xs rounded-full border border-solid border-gray-800 px-3 py-1">
                      +{startsnap.tags.length - 3} more
                    </Badge>
                  )}
                </div>
              </div>
            )}

            {/* Tools Used Section */}
            {startsnap.tools_used && startsnap.tools_used.length > 0 && (
              <div className="flex items-start gap-3">
                <span className={`material-icons text-startsnap-persian-blue ${variant === 'main-page' ? 'text-sm' : 'text-xs'} mt-1 shrink-0`}>build</span>
                <div className="flex flex-wrap gap-2 flex-1">
                  {startsnap.tools_used.slice(0, 3).map((tool, idx) => (
                    <Badge
                      key={`tool-${idx}`}
                      variant="outline"
                      className="bg-startsnap-french-pass text-startsnap-persian-blue font-['Space_Mono',Helvetica] text-xs rounded-full border border-solid border-blue-700 px-3 py-1"
                    >
                      {tool}
                    </Badge>
                  ))}
                  {startsnap.tools_used.length > 3 && (
                    <Badge variant="outline" className="bg-startsnap-french-pass text-startsnap-persian-blue font-['Space_Mono',Helvetica] text-xs rounded-full border border-solid border-blue-700 px-3 py-1">
                      +{startsnap.tools_used.length - 3} more
                    </Badge>
                  )}
                </div>
              </div>
            )}

            {/* Looking For Feedback Section */}
            {startsnap.feedback_tags && startsnap.feedback_tags.length > 0 && (
              <div className="flex items-start gap-3">
                <span className={`material-icons text-startsnap-jewel ${variant === 'main-page' ? 'text-sm' : 'text-xs'} mt-1 shrink-0`}>forum</span>
                <div className="flex flex-wrap gap-2 flex-1">
                  {startsnap.feedback_tags.slice(0, 3).map((feedback, idx) => (
                    <Badge
                      key={`feedback-${idx}`}
                      variant="outline"
                      className="bg-startsnap-ice-cold text-startsnap-jewel font-['Space_Mono',Helvetica] text-xs rounded-full border border-solid border-green-700 px-3 py-1"
                    >
                      {feedback}
                    </Badge>
                  ))}
                  {startsnap.feedback_tags.length > 3 && (
                    <Badge variant="outline" className="bg-startsnap-ice-cold text-startsnap-jewel font-['Space_Mono',Helvetica] text-xs rounded-full border border-solid border-green-700 px-3 py-1">
                      +{startsnap.feedback_tags.length - 3} more
                    </Badge>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      </CardContent>

      <CardFooter className={`${cardPadding} pt-0`}>
        {/* Conditional button layout based on variant and ownership */}
        {variant === 'profile' && isOwner ? (
          <div className="flex gap-2 w-full">
            <Button
              className="startsnap-button flex-1 bg-startsnap-french-rose text-startsnap-white font-['Roboto',Helvetica] font-bold rounded-lg border-2 border-solid border-gray-800 shadow-[3px_3px_0px_#1f2937] text-sm"
              asChild
            >
              <Link to={`/edit/${startsnap.id}`}>Edit Project</Link>
            </Button>
            <Button
              className="startsnap-button flex-1 bg-startsnap-mischka text-startsnap-ebony-clay font-['Roboto',Helvetica] font-bold rounded-lg border-2 border-solid border-gray-800 shadow-[3px_3px_0px_#1f2937] text-sm"
              asChild
            >
              <Link to={`/project/${startsnap.id}`}>View Project</Link>
            </Button>
          </div>
        ) : (
          <Button className="startsnap-button w-full bg-startsnap-french-rose text-startsnap-white font-['Roboto',Helvetica] font-bold rounded-lg border-2 border-solid border-gray-800 shadow-[3px_3px_0px_#1f2937]" asChild>
            <Link to={`/project/${startsnap.id}`}>View Project</Link>
          </Button>
        )}
      </CardFooter>
    </Card>
  );
};