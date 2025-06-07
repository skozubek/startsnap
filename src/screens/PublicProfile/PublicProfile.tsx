/**
 * src/screens/PublicProfile/PublicProfile.tsx
 * @description Publicly viewable user profile page.
 */

import React, { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { Card, CardContent } from "../../components/ui/card";
import { Badge } from "../../components/ui/badge";
import { supabase } from "../../lib/supabase";
import { FaGithub, FaXTwitter, FaLinkedinIn } from "react-icons/fa6";
import { StartSnapCard } from "../../components/ui/StartSnapCard";
import { getCategoryDisplay, getUserStatusOptions } from "../../config/categories";
import { formatDate } from "../../lib/utils";
import { UserAvatar, getAvatarName } from "../../components/ui/user-avatar";
import type { UserProfileData } from "../../types/user";

/**
 * @description Public profile page component for viewing any user's profile and StartSnaps
 * @returns {JSX.Element} Public profile page with user info and project portfolio
 */
export const PublicProfile = (): JSX.Element => {
  const { username } = useParams<{ username: string }>();
  const [loading, setLoading] = useState(true);
  const [profile, setProfile] = useState<UserProfileData | null>(null);
  const [userStartSnaps, setUserStartSnaps] = useState<any[]>([]);

  useEffect(() => {
    if (!username) return;
    
    const fetchProfileData = async () => {
      setLoading(true);
      try {
        // Fetch profile by unique username
        const { data: profileData, error: profileError } = await supabase
          .from('profiles')
          .select('*')
          .eq('username', username)
          .single();

        if (profileError) throw profileError;
        setProfile(profileData);

        // Fetch this user's StartSnaps
        const { data: snapsData, error: snapsError } = await supabase
          .from('startsnaps')
          .select('*')
          .eq('user_id', profileData.user_id)
          .order('created_at', { ascending: false });
        
        if (snapsError) throw snapsError;
        setUserStartSnaps(snapsData || []);

      } catch (error) {
        console.error("Error fetching public profile:", error);
        setProfile(null); // Ensure profile is null on error
      } finally {
        setLoading(false);
      }
    };

    fetchProfileData();
  }, [username]);

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen bg-startsnap-candlelight">
        <p className="text-xl font-bold text-startsnap-ebony-clay">Loading Profile...</p>
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="flex justify-center items-center min-h-screen bg-startsnap-candlelight">
        <p className="text-xl font-bold text-startsnap-ebony-clay">Vibe Coder not found.</p>
      </div>
    );
  }
  
  /**
   * @description Gets the icon for a status value
   * @param {string} statusValue - Status value to get icon for
   * @returns {string} Material icon name for the status
   */
  const getStatusIcon = (statusValue: string) => {
    const option = getUserStatusOptions().find(opt => opt.value === statusValue);
    return option ? option.icon : 'lightbulb';
  };

  return (
    <div className="flex flex-col w-full items-center gap-8 pt-8 pb-24 px-8 bg-startsnap-candlelight">
      <div className="w-full max-w-4xl">
        <Card className="bg-startsnap-white rounded-xl overflow-hidden border-[3px] border-solid border-gray-800 shadow-[5px_5px_0px_#1f2937] mb-8">
          <CardContent className="p-8">
            <div className="flex flex-col md:flex-row gap-8">
              <div className="flex flex-col items-center min-w-[250px]">
                <div className="w-24 h-24">
                  <UserAvatar name={getAvatarName(null, profile.username)} size={96} className="w-full h-full" />
                </div>
                <div className="mt-4 text-center">
                  <h2 className="text-3xl font-bold text-startsnap-ebony-clay font-['Space_Grotesk',Helvetica]">
                    {profile.username}
                  </h2>
                  <Badge variant="outline" className="bg-startsnap-athens-gray text-startsnap-ebony-clay font-['Space_Mono',Helvetica] text-sm rounded-full border border-solid border-gray-800 px-3 py-1.5 mt-2">
                    <span className="material-icons text-sm mr-1">{getStatusIcon(profile.status)}</span>
                    {getUserStatusOptions().find(opt => opt.value === profile.status)?.label || 'Vibing'}
                  </Badge>
                </div>
              </div>
              <div className="flex-1">
                <div className="space-y-4">
                  <div>
                    <h3 className="block font-['Space_Grotesk',Helvetica] font-bold text-startsnap-oxford-blue text-lg leading-7">Bio</h3>
                    <p className="font-['Roboto',Helvetica] text-startsnap-river-bed mt-1">{profile.bio || 'No bio yet.'}</p>
                  </div>
                  {(profile.github_url || profile.twitter_url || profile.linkedin_url || profile.website_url) && (
                    <div>
                      <h3 className="block font-['Space_Grotesk',Helvetica] font-bold text-startsnap-oxford-blue text-lg leading-7">Links</h3>
                      <div className="flex flex-wrap items-center gap-4 mt-2">
                        {profile.github_url && <a href={profile.github_url} target="_blank" rel="noopener noreferrer"><FaGithub size={24} className="text-gray-700 hover:text-black" /></a>}
                        {profile.twitter_url && <a href={profile.twitter_url} target="_blank" rel="noopener noreferrer"><FaXTwitter size={24} className="text-gray-700 hover:text-black" /></a>}
                        {profile.linkedin_url && <a href={profile.linkedin_url} target="_blank" rel="noopener noreferrer"><FaLinkedinIn size={24} className="text-gray-700 hover:text-blue-700" /></a>}
                        {profile.website_url && <a href={profile.website_url} target="_blank" rel="noopener noreferrer"><span className="material-icons text-gray-700 hover:text-black">public</span></a>}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <h3 className="text-3xl font-bold text-startsnap-ebony-clay mb-6 font-['Space_Grotesk',Helvetica]">
          {profile.username}'s StartSnaps
        </h3>

        {userStartSnaps.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {userStartSnaps.map((startsnap) => (
              <StartSnapCard
                key={startsnap.id}
                startsnap={startsnap}
                showCreator={false}
                variant="profile"
                isOwner={false} // This is a public, read-only view
                formatDate={formatDate}
                getCategoryDisplay={getCategoryDisplay}
              />
            ))}
          </div>
        ) : (
          <p className="text-lg text-startsnap-pale-sky">This Vibe Coder hasn't posted any StartSnaps yet!</p>
        )}
      </div>
    </div>
  );
};