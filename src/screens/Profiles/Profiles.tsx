/**
 * src/screens/Profiles/Profiles.tsx
 * @description A page to discover and filter Vibe Coders on the platform.
 */

import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { supabase } from "../../lib/supabase";
import { getUserStatusOptions } from "../../config/categories";
import { UserAvatar, getAvatarName } from "../../components/ui/user-avatar";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../../components/ui/select";
import { Card, CardContent } from "../../components/ui/card";
import type { UserProfileData, ProfileSummary } from "../../types/user";

/**
 * @description Directory page component for discovering and filtering Vibe Coders
 * @returns {JSX.Element} Profiles directory page with filterable user cards
 */
export const Profiles = (): JSX.Element => {
  const [loading, setLoading] = useState(true);
  const [profiles, setProfiles] = useState<ProfileSummary[]>([]);
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const statusOptions = [{ value: "all", label: "All Statuses" }, ...getUserStatusOptions()];

  useEffect(() => {
    /**
     * @description Fetches profiles from the database with optional status filtering
     * @async
     * @sideEffects Updates profiles state with filtered results
     */
    const fetchProfiles = async () => {
      setLoading(true);
      try {
        let query = supabase
          .from('profiles')
          .select('user_id, username, bio, status')
          .order('username', { ascending: true });

        if (statusFilter !== "all") {
          query = query.eq('status', statusFilter);
        }

        const { data, error } = await query;

        if (error) throw error;
        setProfiles(data || []);

      } catch (error) {
        console.error("Error fetching profiles:", error);
        setProfiles([]);
      } finally {
        setLoading(false);
      }
    };

    fetchProfiles();
  }, [statusFilter]);

  return (
    <div className="flex flex-col w-full items-center bg-white">
      {/* Hero Section with Gradient */}
      <div className="w-full bg-gradient-to-b from-startsnap-beige to-startsnap-candlelight">
        <div className="w-full max-w-6xl px-8 py-16 mx-auto">
          <div className="text-center">
            <h1 className="text-5xl font-bold text-startsnap-ebony-clay font-['Space_Grotesk',Helvetica] mb-4">
              Vibe Coders Directory
            </h1>
            <p className="text-xl text-startsnap-river-bed font-['Roboto',Helvetica]">
              Discover talented developers, designers, and creators in the community
            </p>
          </div>
        </div>
      </div>

      {/* Dynamic Separator */}
      <div className="w-full bg-startsnap-beige relative">
        <div className="absolute inset-0 bg-[repeating-linear-gradient(45deg,transparent,transparent_10px,rgba(0,0,0,0.03)_10px,rgba(0,0,0,0.03)_20px)]"></div>
        <div className="w-full max-w-6xl px-8 py-8 mx-auto relative">
          <div className="flex items-center justify-center">
            <div className="flex-1 h-2 bg-startsnap-french-rose transform -skew-x-12"></div>
            <div className="px-6 py-2 bg-startsnap-ebony-clay text-startsnap-beige font-bold text-sm rounded-full border-2 border-startsnap-french-rose">
              DISCOVER CODERS
            </div>
            <div className="flex-1 h-2 bg-startsnap-french-rose transform skew-x-12"></div>
          </div>
        </div>
      </div>

      {/* Content Zone - White Background */}
      <div className="w-full bg-white pb-24 pt-8">
        <div className="flex flex-col w-full items-center px-8">
          <div className="w-full max-w-6xl">
            {/* Filter Section */}
            <div className="mb-8 max-w-sm mx-auto">
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="border-2 border-solid border-gray-800 rounded-lg p-4 font-['Roboto',Helvetica]">
                  <SelectValue placeholder="Filter by status..." />
                </SelectTrigger>
                <SelectContent>
                  {statusOptions.map(option => (
                    <SelectItem key={option.value} value={option.value}>
                      <div className="flex items-center gap-2">
                        {option.value !== 'all' && 'icon' in option && <span className="material-icons text-base">{option.icon}</span>}
                        <span>{option.label}</span>
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Results Section */}
            {loading ? (
              <div className="text-center py-20 bg-startsnap-candlelight/20 rounded-lg border-2 border-dashed border-gray-300">
                <p className="text-xl font-bold text-startsnap-ebony-clay">Loading Vibe Coders...</p>
              </div>
            ) : profiles.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {profiles.map(profile => (
                  <Link to={`/profiles/${profile.username}`} key={profile.user_id} className="block group">
                    <Card className="h-full bg-startsnap-white rounded-xl overflow-hidden border-[3px] border-solid border-gray-800 shadow-[5px_5px_0px_#1f2937] group-hover:-translate-y-1 transition-transform duration-200">
                      <CardContent className="p-6 flex flex-col items-center text-center">
                        <div className="w-20 h-20 mb-4">
                          <UserAvatar name={getAvatarName(null, profile.username)} size={80} className="w-full h-full" />
                        </div>
                        <h3 className="text-xl font-bold text-startsnap-ebony-clay font-['Space_Grotesk',Helvetica]">{profile.username}</h3>
                        <p className="text-sm text-startsnap-pale-sky font-['Roboto',Helvetica] line-clamp-2 h-10 mt-2">{profile.bio || 'No bio yet.'}</p>
                        <div className="mt-4 text-xs font-['Space_Mono',Helvetica] text-startsnap-ebony-clay bg-startsnap-athens-gray px-3 py-1 rounded-full border border-solid border-gray-800 flex items-center gap-1">
                          <span className="material-icons text-sm">
                            {(() => {
                              const foundOption = statusOptions.find(opt => opt.value === profile.status);
                              return (foundOption && 'icon' in foundOption) ? foundOption.icon : 'lightbulb';
                            })()}
                          </span>
                          {statusOptions.find(opt => opt.value === profile.status)?.label || 'Vibing'}
                        </div>
                      </CardContent>
                    </Card>
                  </Link>
                ))}
              </div>
            ) : (
              <div className="text-center py-20 bg-startsnap-candlelight/20 rounded-lg border-2 border-dashed border-gray-300">
                <p className="text-xl text-startsnap-pale-sky">No Vibe Coders found for this filter.</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};