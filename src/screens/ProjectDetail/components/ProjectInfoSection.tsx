/**
 * src/screens/ProjectDetail/components/ProjectInfoSection.tsx
 * @description Component for displaying the main information of a StartSnap project.
 */
import React from 'react';
import { Link } from 'react-router-dom';
import { Button } from '../../../components/ui/button';
import { Badge } from '../../../components/ui/badge';
import { UserAvatar } from '../../../components/ui/user-avatar';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '../../../components/ui/tooltip';
import { getCategoryDisplay } from '../../../config/categories';
import { formatDetailedDate } from '../../../lib/utils';
import { Pencil, Trash2, MoreHorizontal } from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "../../../components/ui/dropdown-menu";
import type { User } from '@supabase/supabase-js';
import type { StartSnapProject } from '../../../types/startsnap'; // Import centralized type
import type { UserProfileData } from '../../../types/user'; // Import UserProfileData

// Removed local StartsnapData interface

/**
 * @description Props for the ProjectInfoSection component.
 * @param {StartSnapProject} startsnap - The main data object for the StartSnap project.
 * @param {UserProfileData | null} creator - The profile data of the project creator.
 * @param {boolean} isOwner - Boolean indicating if the current user owns the project.
 * @param {User | null} currentUser - The currently authenticated Supabase user object.
 * @param {boolean} isSupportedByCurrentUser - Boolean indicating if the current user supports the project.
 * @param {number} currentSupportCount - The current count of supports for the project.
 * @param {boolean} isSupportActionLoading - Boolean indicating if the support action is in progress.
 * @param {() => Promise<void>} onSupportToggle - The function to toggle support for the project.
 * @param {(name: string) => void} onDeleteProjectRequest - The function to handle project deletion.
 */
interface ProjectInfoSectionProps {
  startsnap: StartSnapProject; // Use StartSnapProject
  creator: UserProfileData | null; // Use UserProfileData
  isOwner: boolean;
  currentUser: User | null;
  isSupportedByCurrentUser: boolean;
  currentSupportCount: number;
  isSupportActionLoading: boolean;
  onSupportToggle: () => Promise<void>;
  onDeleteProjectRequest: (name: string) => void; // Added onDeleteProjectRequest prop
  onTipCreator: () => void; // Added onTipCreator prop for opening tipping dialog
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
  onSupportToggle,
  onDeleteProjectRequest, // Destructure the new prop
  onTipCreator, // Destructure the new prop
}) => {
  const categoryDisplay = getCategoryDisplay(startsnap.category);
  const isScouted = creator?.username === 'VibeScout';

  const handleDeleteClick = () => {
    // Call the handler passed from the parent (ProjectDetail.tsx)
    onDeleteProjectRequest(startsnap.name);
  };

  return (
    <>
      {/* BRUTAL Category Strip - Raw & Uncompromising! */}
      <div className={`h-4 ${categoryDisplay.bgColor} border-b-4 border-black`}></div>

                  <div className="bg-white px-5 py-6 border-b-2 border-gray-800 md:px-8">
        {/* Title and Actions - Adaptive Layout */}
        <div className="flex flex-col gap-6 mb-4 md:gap-5">
          {/* Title Row */}
          <div className="flex flex-col lg:flex-row lg:justify-between lg:items-start lg:gap-6">
            <h1 className="text-startsnap-oxford-blue font-heading font-black tracking-tight leading-relaxed text-2xl md:text-3xl lg:text-3xl lg:leading-tight xl:text-4xl lg:flex-1 lg:min-w-0 lg:pr-4">
              {startsnap.name}
            </h1>

            {/* Actions - Always in separate visual block for long titles */}
            <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:gap-3 lg:shrink-0 lg:min-w-fit">
              {isOwner ? (
                <div className="flex items-center justify-between lg:justify-end lg:gap-3">
                  {/* Support Count for Owner */}
                  <div className="flex items-center gap-2 text-base text-startsnap-french-rose lg:text-sm lg:gap-1">
                    <span className="material-icons text-xl lg:text-lg">favorite</span>
                    <span className="font-medium">{currentSupportCount}</span>
                  </div>

                  {/* Owner Actions */}
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <button
                        type="button"
                        className="h-8 w-8 flex items-center justify-center rounded-full text-gray-600 hover:bg-gray-100 data-[state=open]:bg-gray-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                        aria-label="Project actions"
                      >
                        <MoreHorizontal size={20} />
                      </button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem
                        asChild
                        className="text-startsnap-oxford-blue hover:bg-startsnap-french-rose/10"
                      >
                        <Link to={`/edit/${startsnap.id}`} className="w-full">
                          <Pencil className="mr-2 h-4 w-4" />
                          Edit Project
                        </Link>
                      </DropdownMenuItem>
                      <DropdownMenuItem
                        onClick={handleDeleteClick}
                        className="text-red-600 hover:bg-red-50"
                        aria-label="Delete project"
                      >
                        <Trash2 className="mr-2 h-4 w-4" />
                        Delete Project
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              ) : currentUser ? (
                <>
                                    {/* User Action Buttons */}
                  <div className="flex gap-4 lg:gap-3">
                    {/* Tip Creator Button - Only show if creator has wallet address */}
                    {creator?.algorand_wallet_address && (
                      <Button
                        onClick={onTipCreator}
                        variant="success"
                        size="lg"
                        className="flex-1 lg:flex-none tap-target lg:px-3 lg:py-1.5"
                        aria-label="Tip the creator with Algorand"
                      >
                        <span className="material-icons text-lg mr-3 lg:text-base lg:mr-1">
                          monetization_on
                        </span>
                        <span className="lg:text-sm">Tip Creator</span>
                      </Button>
                    )}

                    {/* Support Project Button */}
                    <Button
                      onClick={onSupportToggle}
                      disabled={isSupportActionLoading}
                      variant="primary"
                      size="lg"
                      className="flex-1 lg:flex-none tap-target lg:px-3 lg:py-1.5"
                      aria-label={isSupportedByCurrentUser ? 'Unsupport this project' : 'Support this project'}
                    >
                      <span className="material-icons text-lg mr-3 lg:text-base lg:mr-1">
                        {isSupportedByCurrentUser ? 'favorite' : 'favorite_border'}
                      </span>
                      <span className="lg:text-sm">
                        {isSupportActionLoading
                          ? 'Processing...'
                          : isSupportedByCurrentUser
                          ? 'Supported ✔'
                          : 'Support Project'}
                      </span>
                    </Button>
                  </div>

                  {/* Support Count for Users */}
                  <div className="flex items-center justify-center gap-2 text-base text-startsnap-french-rose lg:text-sm lg:gap-1">
                    <span className="material-icons text-xl lg:text-lg">favorite</span>
                    <span className="font-medium">{currentSupportCount}</span>
                  </div>
                </>
              ) : (
                /* Support Count for Non-logged Users */
                <div className="flex items-center justify-center gap-2 text-base text-startsnap-french-rose lg:justify-end lg:gap-1">
                  <span className="material-icons text-xl">favorite</span>
                  <span className="font-medium">{currentSupportCount}</span>
                </div>
              )}
            </div>
                    </div>
        </div>
        <div className="flex gap-3 flex-wrap items-center mb-2">
          <Badge
            variant="outline"
            className={`${categoryDisplay.bgColor} ${categoryDisplay.textColor} border ${categoryDisplay.borderColor} rounded-full px-4 py-2 font-mono text-sm`}
          >
            {categoryDisplay.name}
          </Badge>
          {startsnap.type === "live" ? (
            <Badge variant="outline" className="bg-startsnap-mountain-meadow text-white font-mono text-sm rounded-full border border-solid border-green-700 px-3 py-1 flex items-center gap-1">
              <span className="material-icons text-sm">rocket_launch</span>
              Live Project
            </Badge>
          ) : (
            <Badge variant="outline" className="bg-startsnap-corn text-startsnap-ebony-clay font-mono text-sm rounded-full border border-solid border-yellow-700 px-3 py-1 flex items-center gap-1">
              <span className="material-icons text-sm">lightbulb</span>
              Idea / Concept
            </Badge>
          )}
          {startsnap.is_hackathon_entry && (
            <Badge variant="outline" className="bg-startsnap-heliotrope text-white font-mono text-sm rounded-full border border-solid border-purple-700 px-3 py-1 flex items-center gap-1">
              <span className="material-icons text-sm">emoji_events</span>
              Hackathon Entry
            </Badge>
          )}
        </div>
      </div>

              <div className="px-4 pt-6 pb-8 border-b-2 border-gray-800 md:px-8">
        {(startsnap.live_demo_url || startsnap.demo_video_url) && (
          <div className="flex flex-wrap items-center gap-x-4 gap-y-2 mb-4">
            <p className="font-ui text-startsnap-oxford-blue text-lg">
              Project Links:
            </p>
            {startsnap.live_demo_url && (
              <div className="flex items-center">
                <span className="material-icons text-startsnap-oxford-blue mr-1.5">public</span>
                <a href={startsnap.live_demo_url} target="_blank" rel="noopener noreferrer"
                  className="text-startsnap-persian-blue font-body flex items-center hover:text-startsnap-french-rose transition-colors">
                  Live Demo
                  <span className="material-icons text-sm ml-1">open_in_new</span>
                </a>
              </div>
            )}
            {startsnap.demo_video_url && (
              <div className="flex items-center">
                <span className="material-icons text-startsnap-oxford-blue mr-1.5">videocam</span>
                <a href={startsnap.demo_video_url} target="_blank" rel="noopener noreferrer"
                  className="text-startsnap-persian-blue font-body flex items-center hover:text-startsnap-french-rose transition-colors">
                  Demo Video
                  <span className="material-icons text-sm ml-1">open_in_new</span>
                </a>
              </div>
            )}
          </div>
        )}
                        <p className="font-body text-startsnap-river-bed leading-relaxed text-lg mb-6">
                  {startsnap.description}
                </p>
        {(startsnap.tags && startsnap.tags.length > 0 || startsnap.tools_used && startsnap.tools_used.length > 0) && (
          <div className="flex flex-wrap items-start gap-x-4 gap-y-3 py-6 mb-6">
            {startsnap.tags && startsnap.tags.length > 0 && (
              <div className="flex flex-wrap items-center gap-3">
                <span className="material-icons text-startsnap-shuttle-gray text-xl">sell</span>
                {startsnap.tags.map((tag: string, index: number) => (
                  <Badge key={`tag-${index}`} variant="outline" className="bg-startsnap-athens-gray text-startsnap-ebony-clay font-mono text-sm rounded-full border border-solid border-gray-800 px-3 py-1">
                    #{tag}
                  </Badge>
                ))}
              </div>
            )}
            {startsnap.tools_used && startsnap.tools_used.length > 0 && (
              <div className="flex flex-wrap items-center gap-3">
                <span className="material-icons text-startsnap-persian-blue text-xl">build</span>
                {startsnap.tools_used.map((tool: string, index: number) => (
                  <Badge key={`tool-${index}`} variant="outline" className="bg-startsnap-french-pass text-startsnap-persian-blue font-mono text-sm rounded-full border border-solid border-blue-700 px-3 py-1">
                    {tool}
                  </Badge>
                ))}
              </div>
            )}
          </div>
        )}
        {creator && (
          <div className="flex items-center pt-6 border-t border-gray-200/80 mb-6">
                                    {isScouted ? (
              <TooltipProvider>
                <Link
                  to="/profiles/VibeScout"
                  className="group hover:text-startsnap-french-rose transition-colors duration-150 focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-startsnap-french-rose"
                >
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <div className="cursor-help">
                        <Badge variant="outline" className="bg-gray-800 text-white font-mono text-sm rounded-full border-none px-4 py-2 flex items-center gap-1 hover:bg-gray-700 transition-colors duration-150 shadow-[3px_3px_0px_#1f2937]">
                          ✨ Featured by StartSnap
                          <span className="material-icons text-sm ml-1 opacity-70">info</span>
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
                </Link>
              </TooltipProvider>
            ) : creator.username && creator.username !== 'Anonymous' ? (
              <Link to={`/profiles/${creator.username}`} className="flex items-center gap-4 group hover:text-startsnap-french-rose transition-colors duration-150 focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-startsnap-french-rose">
                <div className="w-12 h-12">
                  <UserAvatar
                    name={creator.username}
                    size={48}
                    className="w-full h-full"
                  />
                </div>
                <div>
                  <p className="font-ui text-startsnap-ebony-clay leading-tight group-hover:text-startsnap-french-rose">
                    {creator.username}
                  </p>
                  <p className="font-body text-startsnap-shuttle-gray text-sm group-hover:text-startsnap-french-rose">
                    Launched: {formatDetailedDate(startsnap.created_at)}
                  </p>
                </div>
              </Link>
            ) : (
              <div className="flex items-center gap-4">
                <div className="w-12 h-12">
                  <UserAvatar
                    name={creator?.username || 'Anonymous'}
                    size={48}
                    className="w-full h-full"
                  />
                </div>
                <div>
                  <p className="font-ui text-startsnap-ebony-clay leading-tight">
                    {creator?.username || 'Anonymous'}
                  </p>
                  <p className="font-body text-startsnap-shuttle-gray text-sm">
                    Launched: {formatDetailedDate(startsnap.created_at)}
                  </p>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </>
  );
};