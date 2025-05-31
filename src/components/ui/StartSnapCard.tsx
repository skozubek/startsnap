/**
 * src/components/ui/StartSnapCard.tsx
 * @description Reusable StartSnap card component for displaying project information
 */

import React from "react";
import { Link } from "react-router-dom";
import { Avatar, AvatarFallback, AvatarImage } from "./avatar";
import { Badge } from "./badge";
import { Button } from "./button";
import { Card, CardContent, CardFooter } from "./card";
import { MinimalistThumbnail } from "./project-thumbnail";

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
  creatorInitials = 'A',
  variant = 'main-page',
  isOwner = false,
  formatDate,
  getCategoryDisplay
}) => {
  const categoryDisplay = getCategoryDisplay(startsnap.category);

  // Configure dimensions based on variant
  const thumbnailHeight = variant === 'main-page' ? '219px' : '140px';
  const cardPadding = variant === 'main-page' ? 'p-7' : 'p-7';
  const thumbnailPadding = variant === 'main-page' ? 'pt-[219px]' : 'pt-[140px]';

  return (
    <Card className="bg-startsnap-white rounded-xl overflow-hidden border-[3px] border-solid border-gray-800 shadow-[5px_5px_0px_#1f2937]">
      <CardContent className={`${cardPadding} ${thumbnailPadding} relative`}>
        {/* Project thumbnail */}
        <div
          className="absolute top-0 left-0 right-0"
          style={{ height: thumbnailHeight }}
        >
          <MinimalistThumbnail
            projectId={startsnap.id}
            projectType={startsnap.type}
            category={startsnap.category}
          />
        </div>

        {/* Status badges - positioned in the top right corner */}
        <div className="absolute top-3 right-3 flex flex-col gap-2 items-end z-10">
          {/* Project type badge */}
          {startsnap.type === "live" ? (
            <Badge variant="outline" className="bg-startsnap-mountain-meadow text-white font-['Space_Mono',Helvetica] text-xs rounded-full border border-solid border-green-700 px-2 py-0.5 flex items-center gap-1">
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

        <div className="flex justify-between items-start">
          <h3 className={`${variant === 'main-page' ? 'text-[var(--startsnap-semantic-heading-3-font-size)] leading-[var(--startsnap-semantic-heading-3-line-height)]' : 'text-xl leading-7'} font-[var(--startsnap-semantic-heading-3-font-family)] font-[var(--startsnap-semantic-heading-3-font-weight)] tracking-[var(--startsnap-semantic-heading-3-letter-spacing)] text-startsnap-ebony-clay flex-1`}>
            {startsnap.name}
          </h3>
          <Badge
            variant="outline"
            className={`${categoryDisplay.bgColor} ${categoryDisplay.textColor} border ${categoryDisplay.borderColor} rounded-full px-[13px] py-[5px] font-['Space_Mono',Helvetica] font-normal ${variant === 'main-page' ? 'text-sm' : 'text-xs'}`}
          >
            {categoryDisplay.name}
          </Badge>
        </div>

        <p className={`mt-4 font-['Roboto',Helvetica] font-normal text-startsnap-river-bed ${variant === 'main-page' ? 'text-base leading-6 line-clamp-2 h-12' : 'text-sm leading-5 line-clamp-2 h-10'} overflow-hidden`}>
          {startsnap.description}
        </p>

        {/* Creator info - only show if requested */}
        {showCreator && (
          <div className="flex items-center mt-7">
            <Avatar className="w-10 h-10 rounded-full border-2 border-solid border-gray-800">
              <AvatarFallback>
                {creatorInitials}
              </AvatarFallback>
            </Avatar>
            <div className="ml-3">
              <p className="font-['Roboto',Helvetica] font-semibold text-startsnap-oxford-blue text-base leading-6">
                {creatorName}
              </p>
              <p className="font-['Inter',Helvetica] font-normal text-startsnap-pale-sky text-xs leading-4">
                {formatDate(startsnap.created_at)}
              </p>
            </div>
          </div>
        )}

        {/* Date only - for profile variant */}
        {!showCreator && (
          <p className="mt-4 font-['Inter',Helvetica] font-normal text-startsnap-pale-sky text-xs">
            {formatDate(startsnap.created_at)}
          </p>
        )}

        {/* Separated tag sections */}
        <div className={`space-y-${variant === 'main-page' ? '2' : '1'} mt-4`}>
          {/* General Tags Section */}
          {startsnap.tags && startsnap.tags.length > 0 && (
            <div className="flex items-center gap-2">
              <span className={`material-icons text-startsnap-oxford-blue ${variant === 'main-page' ? 'text-sm' : 'text-xs'}`}>tag</span>
              <div className="flex flex-wrap gap-1 flex-1">
                {startsnap.tags.slice(0, 2).map((tag, idx) => (
                  <Badge
                    key={`tag-${idx}`}
                    variant="outline"
                    className="bg-startsnap-athens-gray text-startsnap-ebony-clay font-['Space_Mono',Helvetica] text-xs rounded-full border border-solid border-gray-800 px-2 py-0.5"
                  >
                    #{tag}
                  </Badge>
                ))}
                {startsnap.tags.length > 2 && (
                  <Badge variant="outline" className="bg-startsnap-athens-gray text-startsnap-ebony-clay font-['Space_Mono',Helvetica] text-xs rounded-full border border-solid border-gray-800 px-2 py-0.5">
                    +{startsnap.tags.length - 2} more
                  </Badge>
                )}
              </div>
            </div>
          )}

          {/* Tools Used Section */}
          {startsnap.tools_used && startsnap.tools_used.length > 0 && (
            <div className="flex items-center gap-2">
              <span className={`material-icons text-startsnap-persian-blue ${variant === 'main-page' ? 'text-sm' : 'text-xs'}`}>build</span>
              <div className="flex flex-wrap gap-1 flex-1">
                {startsnap.tools_used.slice(0, 2).map((tool, idx) => (
                  <Badge
                    key={`tool-${idx}`}
                    variant="outline"
                    className="bg-startsnap-french-pass text-startsnap-persian-blue font-['Space_Mono',Helvetica] text-xs rounded-full border border-solid border-blue-700 px-2 py-0.5"
                  >
                    {tool}
                  </Badge>
                ))}
                {startsnap.tools_used.length > 2 && (
                  <Badge variant="outline" className="bg-startsnap-french-pass text-startsnap-persian-blue font-['Space_Mono',Helvetica] text-xs rounded-full border border-solid border-blue-700 px-2 py-0.5">
                    +{startsnap.tools_used.length - 2} more
                  </Badge>
                )}
              </div>
            </div>
          )}

          {/* Looking For Feedback Section */}
          {startsnap.feedback_tags && startsnap.feedback_tags.length > 0 && (
            <div className="flex items-center gap-2">
              <span className={`material-icons text-startsnap-jewel ${variant === 'main-page' ? 'text-sm' : 'text-xs'}`}>forum</span>
              <div className="flex flex-wrap gap-1 flex-1">
                {startsnap.feedback_tags.slice(0, 2).map((feedback, idx) => (
                  <Badge
                    key={`feedback-${idx}`}
                    variant="outline"
                    className="bg-startsnap-ice-cold text-startsnap-jewel font-['Space_Mono',Helvetica] text-xs rounded-full border border-solid border-green-700 px-2 py-0.5"
                  >
                    {feedback}
                  </Badge>
                ))}
                {startsnap.feedback_tags.length > 2 && (
                  <Badge variant="outline" className="bg-startsnap-ice-cold text-startsnap-jewel font-['Space_Mono',Helvetica] text-xs rounded-full border border-solid border-green-700 px-2 py-0.5">
                    +{startsnap.feedback_tags.length - 2} more
                  </Badge>
                )}
              </div>
            </div>
          )}
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