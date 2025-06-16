/**
 * src/screens/Profile/Profile.tsx
 * @description User profile page component for viewing and editing user information and projects
 */

import React, { useEffect, useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { Button } from "../../components/ui/button";
import { Card, CardContent } from "../../components/ui/card";
import { Badge } from "../../components/ui/badge";
import { Input } from "../../components/ui/input";
import { Textarea } from "../../components/ui/textarea";
import { Popover, PopoverTrigger, PopoverContent } from "../../components/ui/popover";
import { supabase } from "../../lib/supabase";
import { FaGithub, FaXTwitter, FaLinkedinIn } from "react-icons/fa6";
import { StartSnapCard } from "../../components/ui/StartSnapCard";
import { getCategoryDisplay, getUserStatusOptions} from "../../config/categories";
import { formatDate, validateSocialLinks, LinkValidationErrors, ProfileLinks } from "../../lib/utils";
import { useAuth } from "../../context/AuthContext";
import { UserAvatar, getAvatarName } from "../../components/ui/user-avatar";
import type { UserProfileData } from "../../types/user";
import { toast } from "sonner";

/**
 * @description User profile page with settings and project management
 * @returns {JSX.Element} Profile page with user info editing and project list
 */
export const Profile = (): JSX.Element => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);
  const { user } = useAuth();
  const [profile, setProfile] = useState({
    username: "",
    bio: "",
    status: "brainstorming",
    github: "",
    twitter: "",
    linkedin: "",
    website: ""
  });
  const [userStartSnaps, setUserStartSnaps] = useState<any[]>([]);
  const [loadingStartSnaps, setLoadingStartSnaps] = useState(true);
  const [linkErrors, setLinkErrors] = useState<LinkValidationErrors>({
    github: "",
    twitter: "",
    linkedin: "",
    website: ""
  });
  const [usernameError, setUsernameError] = useState<string>("");
  const [statusPopoverOpen, setStatusPopoverOpen] = useState(false);

  useEffect(() => {
    // If no user is authenticated, redirect to home
    if (!user) {
      navigate('/');
      return;
    }

    const fetchProfile = async () => {
      try {
        // Fetch profile data
        const { data, error }: { data: UserProfileData | null, error: any } = await supabase
          .from('profiles')
          .select('*')
          .eq('user_id', user.id)
          .single();

        if (error && error.code !== 'PGRST116') {
          console.error('Error fetching profile:', error);
          return;
        }

        // If profile exists, use it; otherwise, use default values
        if (data) {
          setProfile({
            username: data.username || user.email?.split('@')[0] || '',
            bio: data.bio || '',
            status: data.status || 'brainstorming',
            github: data.github_url || '',
            twitter: data.twitter_url || '',
            linkedin: data.linkedin_url || '',
            website: data.website_url || ''
          });
        } else {
          // Set default username from email if no profile exists
          setProfile(prev => ({
            ...prev,
            username: user.email?.split('@')[0] || ''
          }));
        }

        // Fetch user's StartSnaps
        fetchUserStartSnaps(user.id);
      } catch (error) {
        console.error('Error:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchProfile();
  }, [user, navigate]);

  /**
   * @description Fetches StartSnap projects created by the current user
   * @async
   * @param {string} userId - User ID to fetch projects for
   * @sideEffects Updates state with user's projects
   */
  const fetchUserStartSnaps = async (userId: string) => {
    try {
      setLoadingStartSnaps(true);

      // Fetch startsnaps for the user
      const { data, error } = await supabase
        .from('startsnaps')
        .select('*, screenshot_urls')
        .eq('user_id', userId)
        .order('created_at', { ascending: false });

      if (error) {
        throw error;
      }

      setUserStartSnaps(data || []);
    } catch (error) {
      console.error('Error fetching user StartSnaps:', error);
    } finally {
      setLoadingStartSnaps(false);
    }
  };

  /**
   * @description Handles input changes for profile form fields
   * @param {React.ChangeEvent<HTMLInputElement|HTMLTextAreaElement>} e - Change event
   */
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setProfile(prev => ({ ...prev, [name]: value }));

    // Clear username error when field is edited
    if (name === 'username') {
      setUsernameError("");
    }

    // Clear error when field is edited
    if (name in linkErrors) {
      setLinkErrors(prev => ({ ...prev, [name]: "" }));
    }
  };

  /**
   * @description Handles status selection change
   * @param {string} value - New status value
   */
  const handleStatusChange = (value: string) => {
    setProfile(prev => ({ ...prev, status: value }));
    setStatusPopoverOpen(false); // Close popover after selection
  };

  /**
   * @description Validates all external links using centralized validation
   * @returns {boolean} Whether all links are valid
   */
  const validateLinks = () => {
    const profileLinks: ProfileLinks = {
      github: profile.github,
      twitter: profile.twitter,
      linkedin: profile.linkedin,
      website: profile.website
    };

    const { isValid, errors } = validateSocialLinks(profileLinks);
    setLinkErrors(errors);
    return isValid;
  };

  /**
   * @description Updates the user profile in the database
   * @async
   * @sideEffects Updates profile information in Supabase
   */
  const updateProfile = async () => {
    if (!user) return;

    // --- START NEW VALIDATION LOGIC ---
    if (profile.username.length < 3) {
      setUsernameError("Username must be at least 3 characters.");
      return; // Stop the update process
    }

    // Check if the username is taken by another user
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('user_id')
        .eq('username', profile.username)
        .neq('user_id', user.id) // IMPORTANT: Exclude the current user from the check
        .limit(1);

      if (error) throw error; // Let the main catch block handle Supabase errors

      if (data && data.length > 0) {
        setUsernameError("This username is already taken. Please choose another.");
        return; // Stop the update process
      }
    } catch (error) {
      console.error('Error checking username uniqueness:', error);
      toast.error('Username Validation Failed', {
        description: 'Could not verify username. Please try again.'
      });
      return;
    }
    // --- END NEW VALIDATION LOGIC ---

    // Validate links before updating
    if (!validateLinks()) {
      return;
    }

    try {
      setUpdating(true);

      const { error } = await supabase
        .from('profiles')
        .upsert({
          user_id: user.id,
          username: profile.username,
          bio: profile.bio,
          status: profile.status,
          github_url: profile.github,
          twitter_url: profile.twitter,
          linkedin_url: profile.linkedin,
          website_url: profile.website,
          updated_at: new Date()
        }, {
          onConflict: 'user_id'
        });

      if (error) throw error;

      toast.success('Profile Updated Successfully!', {
        description: 'Your profile changes have been saved.'
      });
    } catch (error) {
      console.error('Error updating profile:', error);
      toast.error('Update Failed', {
        description: 'Error updating profile. Please try again.'
      });
    } finally {
      setUpdating(false);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen bg-startsnap-candlelight">
        <div className="bg-startsnap-ebony-clay p-8 rounded-xl border-4 border-startsnap-french-rose shadow-[8px_8px_0px_#ef4444]">
          <p className="text-xl font-bold text-startsnap-beige">Loading profile...</p>
        </div>
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
    <div className="flex flex-col w-full items-center bg-white">
      {/* Hero Background with Gradient */}
      <div className="w-full bg-startsnap-candlelight">
        <div className="w-full max-w-4xl px-8 py-16 mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-5xl font-bold text-startsnap-ebony-clay font-['Space_Grotesk',Helvetica] leading-[48px]">
              Your Profile
            </h2>
            <p className="text-xl text-startsnap-river-bed font-['Roboto',Helvetica] mt-4">
              Manage your profile and showcase your StartSnaps
            </p>
          </div>

          {/* Profile Edit Card */}
          <Card className="bg-startsnap-white rounded-xl overflow-hidden border-[3px] border-solid border-gray-800 shadow-[5px_5px_0px_#1f2937]">
            {/* Header strip */}
            <div className="h-4 bg-startsnap-french-rose border-b-4 border-black"></div>

            <CardContent className="p-8">
              <div className="flex flex-col md:flex-row gap-8">
                <div className="flex flex-col items-center min-w-[250px]">
                  <div className="w-24 h-24">
                    <UserAvatar
                      name={getAvatarName(user, profile.username)}
                      size={96}
                      className="w-full h-full"
                    />
                  </div>

                  {/* Popover status selector */}
                  <Popover open={statusPopoverOpen} onOpenChange={setStatusPopoverOpen}>
                    <PopoverTrigger asChild>
                      <Button
                        variant="outline"
                        className="rounded-full w-full max-w-xs sm:w-56 flex justify-between items-center px-3 py-2 text-sm font-['Roboto',Helvetica] bg-startsnap-athens-gray text-startsnap-ebony-clay hover:bg-gray-300 border-gray-800 border-2 shadow-[2px_2px_0px_#1f2937] mt-4"
                      >
                        <div className="flex items-center">
                          <span className="material-icons text-sm mr-2">{getStatusIcon(profile.status)}</span>
                          <span>{getUserStatusOptions().find(opt => opt.value === profile.status)?.label}</span>
                        </div>
                        <span className="material-icons text-startsnap-ebony-clay">keyboard_arrow_down</span>
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-64 p-2 bg-startsnap-white border-2 border-gray-800 rounded-lg shadow-[4px_4px_0px_#1f2937]">
                      <div className="space-y-1">
                        {getUserStatusOptions().map((option) => (
                          <button
                            key={option.value}
                            onClick={() => handleStatusChange(option.value)}
                            className="w-full text-left px-3 py-2 rounded-md hover:bg-startsnap-athens-gray flex items-center text-sm font-medium"
                          >
                            <span className="material-icons text-sm mr-2">{option.icon}</span>
                            {option.label}
                          </button>
                        ))}
                      </div>
                    </PopoverContent>
                  </Popover>
                </div>

                <div className="flex-1">
                  <form className="space-y-6">
                    <div className="space-y-2">
                      <label className="block font-['Space_Grotesk',Helvetica] font-bold text-startsnap-oxford-blue text-lg leading-7">
                        Username
                      </label>
                      <Input
                        name="username"
                        value={profile.username}
                        onChange={handleChange}
                        placeholder="Your username"
                        className={`border-2 border-solid ${usernameError ? 'border-red-500' : 'border-gray-800'} rounded-lg p-4 font-['Roboto',Helvetica] text-startsnap-pale-sky`}
                      />
                      {usernameError && (
                        <p className="text-red-500 text-sm mt-1">{usernameError}</p>
                      )}
                    </div>

                    <div className="space-y-2">
                      <label className="block font-['Space_Grotesk',Helvetica] font-bold text-startsnap-oxford-blue text-lg leading-7">
                        Bio
                      </label>
                      <Textarea
                        name="bio"
                        value={profile.bio}
                        onChange={handleChange}
                        placeholder="Tell us about yourself, your skills, interests, and what you're working on..."
                        className="border-2 border-solid border-gray-800 rounded-lg p-3.5 min-h-[120px] font-['Roboto',Helvetica] text-startsnap-pale-sky"
                      />
                    </div>

                    <div className="space-y-2">
                      <label className="block font-['Space_Grotesk',Helvetica] font-bold text-startsnap-oxford-blue text-lg leading-7">
                        External Links
                      </label>
                      <div className="space-y-3">
                        {/* GitHub Link - Compact Design */}
                        <div className="relative">
                          <div className="absolute left-3 top-1/2 transform -translate-y-1/2 z-10">
                            {React.createElement(FaGithub as any, { className: "text-gray-600 text-lg" })}
                          </div>
                          <Input
                            name="github"
                            value={profile.github}
                            onChange={handleChange}
                            placeholder="https://github.com/username"
                            className={`border-2 border-solid ${linkErrors.github ? 'border-red-500' : 'border-gray-800'} rounded-lg p-3 pl-10 font-['Roboto',Helvetica] text-startsnap-pale-sky`}
                          />
                          {linkErrors.github && (
                            <p className="text-red-500 text-xs mt-1">{linkErrors.github}</p>
                          )}
                        </div>

                        {/* Twitter Link - Compact Design */}
                        <div className="relative">
                          <div className="absolute left-3 top-1/2 transform -translate-y-1/2 z-10">
                            {React.createElement(FaXTwitter as any, { className: "text-gray-600 text-lg" })}
                          </div>
                          <Input
                            name="twitter"
                            value={profile.twitter}
                            onChange={handleChange}
                            placeholder="https://twitter.com/username"
                            className={`border-2 border-solid ${linkErrors.twitter ? 'border-red-500' : 'border-gray-800'} rounded-lg p-3 pl-10 font-['Roboto',Helvetica] text-startsnap-pale-sky`}
                          />
                          {linkErrors.twitter && (
                            <p className="text-red-500 text-xs mt-1">{linkErrors.twitter}</p>
                          )}
                        </div>

                        {/* LinkedIn Link - Compact Design */}
                        <div className="relative">
                          <div className="absolute left-3 top-1/2 transform -translate-y-1/2 z-10">
                            {React.createElement(FaLinkedinIn as any, { className: "text-gray-600 text-lg" })}
                          </div>
                          <Input
                            name="linkedin"
                            value={profile.linkedin}
                            onChange={handleChange}
                            placeholder="https://linkedin.com/in/username"
                            className={`border-2 border-solid ${linkErrors.linkedin ? 'border-red-500' : 'border-gray-800'} rounded-lg p-3 pl-10 font-['Roboto',Helvetica] text-startsnap-pale-sky`}
                          />
                          {linkErrors.linkedin && (
                            <p className="text-red-500 text-xs mt-1">{linkErrors.linkedin}</p>
                          )}
                        </div>

                        {/* Website Link - Compact Design */}
                        <div className="relative">
                          <div className="absolute left-3 top-1/2 transform -translate-y-1/2 z-10">
                            <span className="material-icons text-gray-600 text-lg">public</span>
                          </div>
                          <Input
                            name="website"
                            value={profile.website}
                            onChange={handleChange}
                            placeholder="https://yourwebsite.com"
                            className={`border-2 border-solid ${linkErrors.website ? 'border-red-500' : 'border-gray-800'} rounded-lg p-3 pl-10 font-['Roboto',Helvetica] text-startsnap-pale-sky`}
                          />
                          {linkErrors.website && (
                            <p className="text-red-500 text-xs mt-1">{linkErrors.website}</p>
                          )}
                        </div>
                      </div>
                    </div>

                    <div className="flex justify-end pt-4">
                      <Button
                        type="button"
                        onClick={updateProfile}
                        disabled={updating}
                        className="startsnap-button bg-startsnap-french-rose text-startsnap-white font-['Roboto',Helvetica] font-bold rounded-lg border-2 border-solid border-gray-800 shadow-[3px_3px_0px_#1f2937]"
                      >
                        {updating ? 'Saving...' : 'Save Profile'}
                      </Button>
                    </div>
                  </form>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Dynamic Separator */}
      <div className="w-full bg-startsnap-beige relative">
        <div className="absolute inset-0 bg-[repeating-linear-gradient(45deg,transparent,transparent_10px,rgba(0,0,0,0.03)_10px,rgba(0,0,0,0.03)_20px)]"></div>
        <div className="w-full max-w-4xl px-8 py-8 mx-auto relative">
          <div className="flex items-center justify-center">
            <div className="flex-1 h-2 bg-startsnap-french-rose transform -skew-x-12"></div>
            <div className="px-6 py-2 bg-startsnap-ebony-clay text-startsnap-beige font-bold text-sm rounded-full border-2 border-startsnap-french-rose">
              YOUR STARTSNAPS
            </div>
            <div className="flex-1 h-2 bg-startsnap-french-rose transform skew-x-12"></div>
          </div>
        </div>
      </div>

      {/* Content Zone - White Background */}
      <div className="w-full bg-white pb-24 pt-8">
        <div className="flex flex-col w-full items-center px-8">
          <div className="w-full max-w-4xl">
            {loadingStartSnaps ? (
              <div className="text-center py-20 bg-startsnap-candlelight/20 rounded-lg border-2 border-dashed border-gray-300">
                <p className="text-lg text-startsnap-pale-sky">Loading your StartSnaps...</p>
              </div>
            ) : userStartSnaps.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {userStartSnaps.map((startsnap) => (
                  <StartSnapCard
                    key={startsnap.id}
                    startsnap={startsnap}
                    showCreator={false}
                    variant="profile"
                    isOwner={true}
                    formatDate={formatDate}
                    getCategoryDisplay={getCategoryDisplay}
                  />
                ))}
              </div>
            ) : (
              <div className="text-center py-20 bg-startsnap-candlelight/20 rounded-lg border-2 border-dashed border-gray-300">
                <p className="text-lg text-startsnap-pale-sky mb-4">You haven't created any StartSnaps yet!</p>
                <Button
                  className="startsnap-button bg-startsnap-french-rose text-startsnap-white font-['Roboto',Helvetica] font-bold rounded-lg border-2 border-solid border-gray-800 shadow-[3px_3px_0px_#1f2937]"
                  asChild
                >
                  <Link to="/create">Create Your First StartSnap</Link>
                </Button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};