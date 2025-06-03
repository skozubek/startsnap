/**
 * src/screens/ProjectDetail/components/ProjectInfoSection.tsx
 * @description Component for displaying the main information of a StartSnap project.
 */
import React from 'react';
import { Link } from 'react-router-dom';
import { Button } from '../../../components/ui/button';
import { Badge } from '../../../components/ui/badge';
import { UserAvatar } from '../../../components/ui/user-avatar';
import { getCategoryDisplay } from '../../../config/categories';
import { formatDetailedDate } from '../../../lib/utils';
import type { User } from '@supabase/supabase-js';

// It's good practice to define specific types for complex prop objects
// For simplicity here, using `any` for startsnap and creator, but ideally, these would be typed.
interface StartsnapData {
  id: string;
  name: string;
  category: string;
  type: 'live' | 'idea';
  is_hackathon_entry: boolean;
  live_demo_url?: string;
  demo_video_url?: string;
  description: string;
  tags?: string[];
  tools_used?: string[];
  created_at: string;
  user_id: string;
  // Add other fields from your startsnap object as needed
}

interface CreatorData {
  username: string;
  // Add other fields from your creator object as needed
}

/**
 * @description Props for the ProjectInfoSection component.
 * @param {StartsnapData} startsnap - The main data object for the StartSnap project.
 * @param {CreatorData | null} creator - The profile data of the project creator.
 * @param {boolean} isOwner - Boolean indicating if the current user owns the project.
 * @param {User | null} currentUser - The currently authenticated Supabase user object.
 */
interface ProjectInfoSectionProps {
  startsnap: StartsnapData;
  creator: CreatorData | null;
  isOwner: boolean;
  currentUser: User | null;
  isSupportedByCurrentUser: boolean;
  currentSupportCount: number;
  isSupportActionLoading: boolean;
  onSupportToggle: () => Promise<void>;
}

/**
 * @description Displays the core information about a project, including title, description, links, tags, and creator details.
 * @param {ProjectInfoSectionProps} props - The props for the component.
 * @returns {JSX.Element} The project information section.
 */
export const ProjectInfoSection: React.FC<ProjectInfoSectionProps> = ({
  startsnap,
  creator,
  isOwner,
  currentUser,
  isSupportedByCurrentUser,
  currentSupportCount,
  isSupportActionLoading,
  onSupportToggle
}) => {
  const categoryDisplay = getCategoryDisplay(startsnap.category);

  return (
    <>
      <div className={`${categoryDisplay.bgColor} px-8 py-6 border-b-2 border-gray-800`}>
        <div className="flex justify-between items-center gap-4 mb-4">
          <h1 className={`${categoryDisplay.textColor} font-[var(--startsnap-semantic-heading-3-font-family)] font-black tracking-tight leading-tight flex-1 text-4xl lg:text-5xl`}>
            {startsnap.name}
          </h1>
          <div className="flex items-center gap-3 shrink-0">
            {isOwner ? (
              <Button
                asChild
                className="startsnap-button bg-startsnap-mischka text-startsnap-ebony-clay font-['Roboto',Helvetica] font-bold rounded-lg border-2 border-solid border-gray-800 shadow-[3px_3px_0px_#1f2937] flex items-center gap-1.5 px-3 py-1.5 text-sm hover:bg-startsnap-mischka/90"
              >
                <Link to={`/edit/${startsnap.id}`}>
                  <span className="material-icons text-lg">edit</span>
                  Edit
                </Link>
              </Button>
            ) : currentUser && (
              <Button
                onClick={onSupportToggle}
                disabled={isSupportActionLoading}
                className={`startsnap-button font-['Roboto',Helvetica] font-bold rounded-lg border-2 border-solid border-gray-800 shadow-[3px_3px_0px_#1f2937] flex items-center gap-1.5 px-3 py-1.5 text-sm ${
                  isSupportedByCurrentUser
                    ? 'bg-startsnap-french-rose/80 text-startsnap-white hover:bg-startsnap-french-rose/70'
                    : 'bg-startsnap-french-rose text-startsnap-white hover:bg-startsnap-french-rose/90'
                }`}
              >
                <span className="material-icons text-lg">
                  {isSupportedByCurrentUser ? 'favorite' : 'favorite_border'}
                </span>
                {isSupportActionLoading
                  ? 'Processing...'
                  : isSupportedByCurrentUser
                  ? 'Supported ✔'
                  : 'Support Project'}
              </Button>
            )}
            <div className="flex items-center gap-2 text-sm text-startsnap-oxford-blue">
              <span className="material-icons text-lg">favorite</span>
              {currentSupportCount} Supports
            </div>
          </div>
        </div>
        <div className="flex gap-3 flex-wrap items-center mb-2">
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

      <div className="px-8 pt-6 pb-8 border-b-2 border-gray-800">
        {(startsnap.live_demo_url || startsnap.demo_video_url) && (
          <div className="flex flex-wrap items-center gap-x-4 gap-y-2 mb-4">
            <p className="font-['Space_Grotesk',Helvetica] font-bold text-startsnap-oxford-blue text-lg">
              Project Links:
            </p>
            {startsnap.live_demo_url && (
              <div className="flex items-center">
                <span className="material-icons text-startsnap-oxford-blue mr-1.5">public</span>
                <a href={startsnap.live_demo_url} target="_blank" rel="noopener noreferrer"
                  className="text-startsnap-persian-blue font-['Roboto',Helvetica] flex items-center hover:text-startsnap-french-rose transition-colors">
                  Live Demo
                  <span className="material-icons text-sm ml-1">open_in_new</span>
                </a>
              </div>
            )}
            {startsnap.demo_video_url && (
              <div className="flex items-center">
                <span className="material-icons text-startsnap-oxford-blue mr-1.5">videocam</span>
                <a href={startsnap.demo_video_url} target="_blank" rel="noopener noreferrer"
                  className="text-startsnap-persian-blue font-['Roboto',Helvetica] flex items-center hover:text-startsnap-french-rose transition-colors">
                  Demo Video
                  <span className="material-icons text-sm ml-1">open_in_new</span>
                </a>
              </div>
            )}
          </div>
        )}
        <p className="font-['Roboto',Helvetica] font-normal text-startsnap-river-bed leading-relaxed text-lg mb-6">
          {startsnap.description}
        </p>
        {(startsnap.tags && startsnap.tags.length > 0 || startsnap.tools_used && startsnap.tools_used.length > 0) && (
          <div className="flex flex-wrap items-start gap-x-4 gap-y-3 py-6 mb-6">
            {startsnap.tags && startsnap.tags.length > 0 && (
              <div className="flex flex-wrap items-center gap-3">
                <span className="material-icons text-startsnap-shuttle-gray text-xl">sell</span>
                {startsnap.tags.map((tag: string, index: number) => (
                  <Badge key={`tag-${index}`} variant="outline" className="bg-startsnap-athens-gray text-startsnap-ebony-clay font-['Space_Mono',Helvetica] text-sm rounded-full border border-solid border-gray-800 px-3 py-1">
                    #{tag}
                  </Badge>
                ))}
              </div>
            )}
            {startsnap.tools_used && startsnap.tools_used.length > 0 && (
              <div className="flex flex-wrap items-center gap-3">
                <span className="material-icons text-startsnap-shuttle-gray text-xl">construction</span>
                {startsnap.tools_used.map((tool: string, index: number) => (
                  <Badge key={`tool-${index}`} variant="outline" className="bg-startsnap-french-pass text-startsnap-persian-blue font-['Space_Mono',Helvetica] text-sm rounded-full border border-solid border-blue-700 px-3 py-1">
                    {tool}
                  </Badge>
                ))}
              </div>
            )}
          </div>
        )}
        {creator && (
          <div className="flex items-center pt-6 border-t border-gray-200/80 mb-6">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12">
                <UserAvatar
                  name={creator?.username || 'Anonymous'}
                  size={48}
                  className="w-full h-full"
                />
              </div>
              <div>
                <p className="font-['Space_Grotesk',Helvetica] font-bold text-startsnap-ebony-clay leading-tight">
                  {creator?.username || 'Anonymous'}
                </p>
                <p className="font-['Roboto',Helvetica] text-startsnap-shuttle-gray text-sm">
                  Launched: {formatDetailedDate(startsnap.created_at)}
                </p>
              </div>
            </div>
          </div>
        )}
      </div>
    </>
  );
};