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

/**
 * @description Interface for profile summary data displayed in the directory
 */
interface ProfileSummary {
  user_id: string;
  username: string;
  bio: string | null;
  status: string;
}

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
    <div className="flex flex-col w-full items-center gap-8 pt-8 pb-24 px-8 bg-startsnap-candlelight">
      <div className="w-full max-w-6xl">
        <div className="text-center mb-12">
          <h1 className="text-5xl font-bold text-startsnap-ebony-clay font-['Space_Grotesk',Helvetica]">Vibe Coders Directory</h1>
          <p className="mt-4 text-lg text-startsnap-river-bed">Discover talented developers, designers, and creators in the community.</p>
        </div>
        
        <div className="mb-8 max-w-sm mx-auto">
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="border-2 border-solid border-gray-800 rounded-lg p-4 font-['Roboto',Helvetica]">
              <SelectValue placeholder="Filter by status..." />
            </SelectTrigger>
            <SelectContent>
              {statusOptions.map(option => (
                <SelectItem key={option.value} value={option.value}>
                  <div className="flex items-center gap-2">
                    {option.value !== 'all' && <span className="material-icons text-base">{option.icon}</span>}
                    <span>{option.label}</span>
                  </div>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {loading ? (
          <div className="text-center py-10">
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
                      <span className="material-icons text-sm">{statusOptions.find(opt => opt.value === profile.status)?.icon || 'lightbulb'}</span>
                      {statusOptions.find(opt => opt.value === profile.status)?.label || 'Vibing'}
                    </div>
                  </CardContent>
                </Card>
              </Link>
            ))}
          </div>
        ) : (
          <div className="text-center py-10">
            <p className="text-xl text-startsnap-pale-sky">No Vibe Coders found for this filter.</p>
          </div>
        )}
      </div>
    </div>
  );
};