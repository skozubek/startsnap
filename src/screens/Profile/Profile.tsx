/**
 * src/screens/Profile/Profile.tsx
 * @description User profile page component for viewing and editing user information and projects
 */

import React, { useEffect, useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import Avatar from "boring-avatars";
import { AvatarFallback } from "../../components/ui/avatar";
import { Button } from "../../components/ui/button";
import { Card, CardContent } from "../../components/ui/card";
import { Badge } from "../../components/ui/badge";
import { Input } from "../../components/ui/input";
import { Textarea } from "../../components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from "../../components/ui/select";
import { Popover, PopoverTrigger, PopoverContent } from "../../components/ui/popover";
import { supabase } from "../../lib/supabase";
import { FaGithub, FaXTwitter, FaLinkedinIn } from "react-icons/fa6";
import { StartSnapCard } from "../../components/ui/StartSnapCard";
import { getCategoryDisplay, getUserStatusOptions, getUserStatusDisplay } from "../../config/categories";
import { formatDate, validateSocialLinks, LinkValidationErrors, ProfileLinks } from "../../lib/utils";

/**
 * @description User profile page with settings and project management
 * @returns {JSX.Element} Profile page with user info editing and project list
 */
export const Profile = (): JSX.Element => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);
  const [user, setUser] = useState(null);
  const [profile, setProfile] = useState({
    username: "",
    bio: "",
    status: "brainstorming",
    github: "",
    twitter: "",
    linkedin: "",
    website: ""
  });
  const [userStartSnaps, setUserStartSnaps] = useState([]);
  const [loadingStartSnaps, setLoadingStartSnaps] = useState(true);
  const [linkErrors, setLinkErrors] = useState<LinkValidationErrors>({
    github: "",
    twitter: "",
    linkedin: "",
    website: ""
  });
  const [statusPopoverOpen, setStatusPopoverOpen] = useState(false);

  useEffect(() => {
    const fetchUserAndProfile = async () => {
      try {
        // Get current user
        const { data: { session } } = await supabase.auth.getSession();

        if (!session?.user) {
          navigate('/');
          return;
        }

        setUser(session.user);

        // Fetch profile data
        const { data, error } = await supabase
          .from('profiles')
          .select('*')
          .eq('user_id', session.user.id)
          .single();

        if (error && error.code !== 'PGRST116') {
          console.error('Error fetching profile:', error);
          return;
        }

        // If profile exists, use it; otherwise, use default values
        if (data) {
          setProfile({
            username: data.username || session.user.email?.split('@')[0] || '',
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
            username: session.user.email?.split('@')[0] || ''
          }));
        }

        // Fetch user's StartSnaps
        fetchUserStartSnaps(session.user.id);
      } catch (error) {
        console.error('Error:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchUserAndProfile();
  }, [navigate]);

  /**
   * @description Fetches StartSnap projects created by the current user
   * @async
   * @param {string} userId - User ID to fetch projects for
   * @sideEffects Updates state with user's projects
   */
  const fetchUserStartSnaps = async (userId) => {
    try {
      setLoadingStartSnaps(true);

      // Fetch startsnaps for the user
      const { data, error } = await supabase
        .from('startsnaps')
        .select('*')
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
  const handleChange = (e) => {
    const { name, value } = e.target;
    setProfile(prev => ({ ...prev, [name]: value }));

    // Clear error when field is edited
    if (name in linkErrors) {
      setLinkErrors(prev => ({ ...prev, [name]: "" }));
    }
  };

  /**
   * @description Handles status selection change
   * @param {string} value - New status value
   */
  const handleStatusChange = (value) => {
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

      alert('Profile updated successfully!');
    } catch (error) {
      console.error('Error updating profile:', error);
      alert('Error updating profile. Please try again.');
    } finally {
      setUpdating(false);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen bg-startsnap-candlelight">
        <p className="text-xl font-bold text-startsnap-ebony-clay">Loading profile...</p>
      </div>
    );
  }

  /**
   * @description Gets the icon for a status value
   * @param {string} statusValue - Status value to get icon for
   * @returns {string} Material icon name for the status
   */
  const getStatusIcon = (statusValue) => {
    const option = getUserStatusOptions().find(opt => opt.value === statusValue);
    return option ? option.icon : 'lightbulb';
  };

  return (
    <div className="flex flex-col w-full items-center gap-8 pt-8 pb-24 px-8 bg-startsnap-candlelight">
      <h2 className="text-5xl font-bold text-startsnap-ebony-clay text-center font-['Space_Grotesk',Helvetica] leading-[48px]">
        Your Profile
      </h2>

      <div className="w-full max-w-4xl">
        <Card className="bg-startsnap-white rounded-xl overflow-hidden border-[3px] border-solid border-gray-800 shadow-[5px_5px_0px_#1f2937] mb-8">
          <CardContent className="p-8">
            <div className="flex flex-col md:flex-row gap-8">
              <div className="flex flex-col items-center min-w-[250px]">
                <div className="w-32 h-32 border-[3px] border-gray-800 rounded-full overflow-hidden bg-white">
                  <Avatar
                    name={profile.username || user?.email || 'Anonymous'}
                    variant="beam"
                    size={128}
                    colors={["#264653", "#2a9d8f", "#e9c46a", "#f4a261", "#e76f51"]}
                  />
                </div>

                {/* Popover status selector */}
                <Popover open={statusPopoverOpen} onOpenChange={setStatusPopoverOpen}>
                  <PopoverTrigger asChild>
                    <div className="mt-4 text-center cursor-pointer hover:scale-105 transition-transform">
                      <Badge variant="outline" className="bg-startsnap-athens-gray text-startsnap-ebony-clay font-['Space_Mono',Helvetica] text-sm rounded-full border border-solid border-gray-800 px-3 py-1.5">
                        <span className="material-icons text-sm mr-1">{getStatusIcon(profile.status)}</span>
                        {getUserStatusOptions().find(opt => opt.value === profile.status)?.label}
                      </Badge>
                    </div>
                  </PopoverTrigger>
                  <PopoverContent className="w-56 p-0 bg-white border-2 border-gray-800 rounded-lg shadow-[3px_3px_0px_#1f2937]">
                    <div className="p-2">
                      <p className="text-xs text-center text-startsnap-pale-sky mb-2 font-['Roboto',Helvetica]">
                        Select your status
                      </p>
                      {getUserStatusOptions().map((option) => (
                        <div
                          key={option.value}
                          className={`flex items-center p-2 rounded-md cursor-pointer transition-colors ${
                            profile.status === option.value
                              ? 'bg-startsnap-french-pass text-startsnap-persian-blue'
                              : 'hover:bg-startsnap-athens-gray'
                          }`}
                          onClick={() => handleStatusChange(option.value)}
                        >
                          <span className="material-icons text-sm mr-2">{option.icon}</span>
                          <span className="font-['Roboto',Helvetica]">{option.label}</span>
                        </div>
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
                      className="border-2 border-solid border-gray-800 rounded-lg p-4 font-['Roboto',Helvetica] text-startsnap-pale-sky"
                    />
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
                    <div className="space-y-4">
                      {/* GitHub Link */}
                      <div className="space-y-1">
                        <div className="flex items-center">
                          <FaGithub className="text-black mr-2 text-lg" />
                          <label className="block font-['Roboto',Helvetica] text-startsnap-pale-sky">GitHub</label>
                        </div>
                        <Input
                          name="github"
                          value={profile.github}
                          onChange={handleChange}
                          placeholder="https://github.com/username"
                          className={`border-2 border-solid ${linkErrors.github ? 'border-red-500' : 'border-gray-800'} rounded-lg p-3 font-['Roboto',Helvetica] text-startsnap-pale-sky pl-10`}
                        />
                        {linkErrors.github && (
                          <p className="text-red-500 text-xs mt-1">{linkErrors.github}</p>
                        )}
                      </div>

                      {/* Twitter Link */}
                      <div className="space-y-1">
                        <div className="flex items-center">
                          <FaXTwitter className="text-black mr-2 text-lg" />
                          <label className="block font-['Roboto',Helvetica] text-startsnap-pale-sky">Twitter</label>
                        </div>
                        <Input
                          name="twitter"
                          value={profile.twitter}
                          onChange={handleChange}
                          placeholder="https://twitter.com/username"
                          className={`border-2 border-solid ${linkErrors.twitter ? 'border-red-500' : 'border-gray-800'} rounded-lg p-3 font-['Roboto',Helvetica] text-startsnap-pale-sky pl-10`}
                        />
                        {linkErrors.twitter && (
                          <p className="text-red-500 text-xs mt-1">{linkErrors.twitter}</p>
                        )}
                      </div>

                      {/* LinkedIn Link */}
                      <div className="space-y-1">
                        <div className="flex items-center">
                          <FaLinkedinIn className="text-black mr-2 text-lg" />
                          <label className="block font-['Roboto',Helvetica] text-startsnap-pale-sky">LinkedIn</label>
                        </div>
                        <Input
                          name="linkedin"
                          value={profile.linkedin}
                          onChange={handleChange}
                          placeholder="https://linkedin.com/in/username"
                          className={`border-2 border-solid ${linkErrors.linkedin ? 'border-red-500' : 'border-gray-800'} rounded-lg p-3 font-['Roboto',Helvetica] text-startsnap-pale-sky pl-10`}
                        />
                        {linkErrors.linkedin && (
                          <p className="text-red-500 text-xs mt-1">{linkErrors.linkedin}</p>
                        )}
                      </div>

                      {/* Website Link */}
                      <div className="space-y-1">
                        <div className="flex items-center">
                          <span className="material-icons text-black mr-2 text-lg">public</span>
                          <label className="block font-['Roboto',Helvetica] text-startsnap-pale-sky">Website</label>
                        </div>
                        <Input
                          name="website"
                          value={profile.website}
                          onChange={handleChange}
                          placeholder="https://yourwebsite.com"
                          className={`border-2 border-solid ${linkErrors.website ? 'border-red-500' : 'border-gray-800'} rounded-lg p-3 font-['Roboto',Helvetica] text-startsnap-pale-sky pl-10`}
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

        {/* StartSnaps Portfolio Section */}
        <h3 className="text-3xl font-bold text-startsnap-ebony-clay mb-6 font-['Space_Grotesk',Helvetica]">
          Your StartSnaps
        </h3>

        {loadingStartSnaps ? (
          <div className="text-center py-8">
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
                thumbnailStyle="minimalist"
              />
            ))}
          </div>
        ) : (
          <Card className="bg-startsnap-white rounded-xl overflow-hidden border-[3px] border-solid border-gray-800 shadow-[5px_5px_0px_#1f2937] p-8">
            <div className="text-center">
              <p className="text-lg text-startsnap-pale-sky mb-4">You haven't created any StartSnaps yet!</p>
              <Button
                className="startsnap-button bg-startsnap-french-rose text-startsnap-white font-['Roboto',Helvetica] font-bold rounded-lg border-2 border-solid border-gray-800 shadow-[3px_3px_0px_#1f2937]"
                asChild
              >
                <Link to="/create">Create Your First StartSnap</Link>
              </Button>
            </div>
          </Card>
        )}
      </div>
    </div>
  );
};