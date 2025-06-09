/**
 * src/components/ui/StartSnapCard.tsx
 * @description Reusable card component for displaying StartSnap projects with consistent styling
 */

import React from "react";
import { Link } from "react-router-dom";
import { Card, CardContent } from "./card";
import { Badge } from "./badge";
import { UserAvatar, getAvatarName } from "./user-avatar";
import { Button } from "./button";
import { Pencil } from "lucide-react";
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
  rank?: number; // NEW: Optional rank prop for trending display
}

/**
 * @description Card component for displaying StartSnap project information
 * @param {StartSnapCardProps} props - Component props
 * @returns {JSX.Element} Styled card with project information
 */
export const StartSnapCard: React.FC<StartSnapCardProps> = ({
  startsnap,
  showCreator = false,
  creatorName,
  variant = 'main-page',
  isOwner = false,
  formatDate,
  getCategoryDisplay,
  rank // NEW: Destructure rank prop
}) => {
  const categoryDisplay = getCategoryDisplay(startsnap.category);

  return (
    <Card className="bg-startsnap-white rounded-xl overflow-hidden border-[3px] border-solid border-gray-800 shadow-[5px_5px_0px_#1f2937] hover:-translate-y-1 transition-transform duration-200">
      <CardContent className="p-0">
        <div className={`${categoryDisplay.bgColor} px-6 py-4 border-b-2 border-gray-800 relative`}>
          {/* NEW: Rank badge - only addition, positioned in top-right */}
          {rank && rank <= 3 && (
            <div className="absolute top-2 right-2">
              <Badge 
                variant="outline" 
                className={`
                  font-['Space_Mono',Helvetica] text-xs rounded-full border-2 border-solid border-gray-800 px-2 py-1 flex items-center gap-1
                  ${rank === 1 ? 'bg-yellow-400 text-yellow-900' : ''}
                  ${rank === 2 ? 'bg-gray-300 text-gray-800' : ''}
                  ${rank === 3 ? 'bg-orange-400 text-orange-900' : ''}
                `}
              >
                {rank === 1 && '🏆 #1'}
                {rank === 2 && '🥈 #2'}
                {rank === 3 && '🥉 #3'}
              </Badge>
            </div>
          )}
          
          <div className="flex gap-3 flex-wrap items-center">
            <Badge
              variant="outline"
              className={`${categoryDisplay.bgColor} ${categoryDisplay.textColor} border ${categoryDisplay.borderColor} rounded-full px-4 py-2 font-['Space_Mono',Helvetica] font-normal text-sm`}
            >
              {categoryDisplay.name}
            </Badge>
            {startsnap.type === "live" ? (
              <Badge variant="outline" className="bg-startsnap-mountain-meadow text-white font-['Space_Mono',Helvetica] text-sm rounded-full border border-solid border-green-700 px-3 py-1 flex items-center gap-1">
                <span className="material-icons text-sm">rocket_launch</span>
                Live Project
              </Badge>
            ) : (
              <Badge variant="outline" className="bg-startsnap-corn text-startsnap-ebony-clay font-['Space_Mono',Helvetica] text-sm rounded-full border border-solid border-yellow-700 px-3 py-1 flex items-center gap-1">
                <span className="material-icons text-sm">lightbulb</span>
                Idea / Concept
              </Badge>
            )}
            {startsnap.is_hackathon_entry && (
              <Badge variant="outline" className="bg-startsnap-heliotrope text-white font-['Space_Mono',Helvetica] text-sm rounded-full border border-solid border-purple-700 px-3 py-1 flex items-center gap-1">
                <span className="material-icons text-sm">emoji_events</span>
                Hackathon Entry
              </Badge>
            )}
          </div>
        </div>

        <Link to={`/projects/${startsnap.slug}`} className="block">
          <div className="p-6">
            <h3 className="font-['Space_Grotesk',Helvetica] font-bold text-startsnap-ebony-clay text-xl leading-7 mb-3 line-clamp-2">
              {startsnap.name}
            </h3>
            <p className="font-['Roboto',Helvetica] font-normal text-startsnap-river-bed text-sm leading-5 mb-4 line-clamp-3">
              {startsnap.description}
            </p>
            {(startsnap.tags && startsnap.tags.length > 0 || startsnap.tools_used && startsnap.tools_used.length > 0) && (
              <div className="flex flex-wrap items-start gap-x-4 gap-y-3 py-4 mb-4">
                {startsnap.tags && startsnap.tags.length > 0 && (
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="material-icons text-startsnap-shuttle-gray text-lg">sell</span>
                    {startsnap.tags.slice(0, 3).map((tag: string, index: number) => (
                      <Badge key={`tag-${index}`} variant="outline" className="bg-startsnap-athens-gray text-startsnap-ebony-clay font-['Space_Mono',Helvetica] text-xs rounded-full border border-solid border-gray-800 px-2 py-1">
                        #{tag}
                      </Badge>
                    ))}
                    {startsnap.tags.length > 3 && (
                      <span className="text-xs text-startsnap-pale-sky">+{startsnap.tags.length - 3} more</span>
                    )}
                  </div>
                )}
                {startsnap.tools_used && startsnap.tools_used.length > 0 && (
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="material-icons text-startsnap-persian-blue text-lg">build</span>
                    {startsnap.tools_used.slice(0, 3).map((tool: string, index: number) => (
                      <Badge key={`tool-${index}`} variant="outline" className="bg-startsnap-french-pass text-startsnap-persian-blue font-['Space_Mono',Helvetica] text-xs rounded-full border border-solid border-blue-700 px-2 py-1">
                        {tool}
                      </Badge>
                    ))}
                    {startsnap.tools_used.length > 3 && (
                      <span className="text-xs text-startsnap-pale-sky">+{startsnap.tools_used.length - 3} more</span>
                    )}
                  </div>
                )}
              </div>
            )}
            {showCreator && creatorName && (
              <div className="flex items-center justify-between pt-4 border-t border-gray-200/80">
                {creatorName !== 'Anonymous' ? (
                  <Link to={`/profiles/${creatorName}`} className="flex items-center gap-3 group hover:text-startsnap-french-rose transition-colors duration-150 focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-startsnap-french-rose">
                    <div className="w-8 h-8">
                      <UserAvatar
                        name={getAvatarName(null, creatorName)}
                        size={32}
                        className="w-full h-full"
                      />
                    </div>
                    <div>
                      <p className="font-['Space_Grotesk',Helvetica] font-bold text-startsnap-ebony-clay text-sm leading-tight group-hover:text-startsnap-french-rose">
                        {creatorName}
                      </p>
                      <p className="font-['Roboto',Helvetica] text-startsnap-shuttle-gray text-xs group-hover:text-startsnap-french-rose">
                        {formatDate(startsnap.created_at)}
                      </p>
                    </div>
                  </Link>
                ) : (
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
                )}
                <div className="flex items-center gap-1 text-sm text-startsnap-french-rose">
                  <span className="material-icons text-lg">favorite</span>
                  {startsnap.support_count || 0}
                </div>
              </div>
            )}
          </div>
        </Link>

        {isOwner && variant === 'profile' && (
          <div className="px-6 pb-6">
            <Button
              asChild
              className="w-full startsnap-button bg-startsnap-french-rose text-startsnap-white font-['Roboto',Helvetica] font-bold rounded-lg border-2 border-solid border-gray-800 shadow-[3px_3px_0px_#1f2937] flex items-center justify-center gap-2"
            >
              <Link to={`/edit/${startsnap.id}`}>
                <Pencil size={16} />
                Edit Project
              </Link>
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
};