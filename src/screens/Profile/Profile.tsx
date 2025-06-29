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
import { WalletConnect } from "../../components/ui/WalletConnect";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "../../components/ui/dropdown-menu";
import { MoreHorizontal, Edit, Trash2, Unplug, Link as LinkIcon, X } from "lucide-react";
import { useWallet } from '@txnlab/use-wallet-react';
import { ConfirmationDialog } from "../../components/ui/confirmation-dialog";

/**
 * @description User profile page with settings and project management
 * @returns {JSX.Element} Profile page with user info editing and project list
 */
export const Profile = (): JSX.Element => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);
  const { user } = useAuth();
  const { activeAddress, wallets } = useWallet();
  const [profile, setProfile] = useState({
    username: "",
    bio: "",
    status: "brainstorming",
    github: "",
    twitter: "",
    linkedin: "",
    website: "",
    algorand_wallet_address: ""
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
  const [isChangingWallet, setIsChangingWallet] = useState(false);
  const [isRemoveWalletDialogOpen, setIsRemoveWalletDialogOpen] = useState(false);
  const [isRemovingWallet, setIsRemovingWallet] = useState(false);

  /**
   * @description Checks if the stored wallet address matches the currently connected wallet
   * @returns {boolean} Whether the stored wallet is currently connected
   */
  const isStoredWalletConnected = (): boolean => {
    return activeAddress === profile.algorand_wallet_address;
  };

  /**
   * @description Checks if a different wallet is connected (not the stored one)
   * @returns {boolean} Whether a different wallet is connected
   */
  const isDifferentWalletConnected = (): boolean => {
    // Only show "different wallet" if there's both an active wallet AND a stored wallet address that don't match
    return !!activeAddress && !!profile.algorand_wallet_address && activeAddress !== profile.algorand_wallet_address;
  };

  /**
   * @description Handles removing the tip collection wallet with auto-disconnect
   * @async
   * @sideEffects Disconnects wallet and removes stored address
   */
  const handleRemoveWallet = async () => {
    if (!user) return;

    setIsRemovingWallet(true);

    try {
      // Disconnect wallet first if it's connected
      if (activeAddress) {
        try {
          const activeWallet = wallets.find(w => w.isActive);
          if (activeWallet) {
            await activeWallet.disconnect();
          }
        } catch (error) {
          console.error('Error disconnecting wallet:', error);
          // Continue with removal even if disconnect fails
        }
      }

      // Remove the stored address from database immediately
      const { error } = await supabase
        .from('profiles')
        .update({
          algorand_wallet_address: '',
          updated_at: new Date()
        })
        .eq('user_id', user.id);

      if (error) throw error;

      // Update local state after successful database update
      setProfile(prev => ({ ...prev, algorand_wallet_address: '' }));

      toast.success('Wallet Removed Successfully!', {
        description: 'Wallet disconnected and address removed. Add a new one to receive tips.'
      });
    } catch (error) {
      console.error('Error removing wallet:', error);
      toast.error('Failed to remove wallet', {
        description: 'Please try again or contact support if the issue persists.'
      });
    } finally {
      setIsRemovingWallet(false);
      setIsRemoveWalletDialogOpen(false);
    }
  };

  /**
   * @description Handles disconnecting the current wallet session
   * @async
   * @sideEffects Disconnects wallet but keeps stored address
   */
  const handleDisconnectWallet = async () => {
    try {
      const activeWallet = wallets.find(w => w.isActive);
      if (activeWallet) {
        await activeWallet.disconnect();
        toast.success('Wallet disconnected', {
          description: 'Your tip collection address is still saved.'
        });
      }
    } catch (error) {
      console.error('Disconnect error:', error);
      toast.error('Failed to disconnect wallet');
    }
  };

    /**
   * @description Handles connecting to the stored wallet address with validation
   * @async
   * @sideEffects Connects to wallet and validates address matches stored tip collection wallet
   */
  const handleConnectStoredWallet = async () => {
    try {
      const peraWallet = wallets.find(w => w.id === 'pera');
      if (!peraWallet) {
        toast.error('Pera Wallet not found');
        return;
      }

      await peraWallet.connect();
      peraWallet.setActive();

      toast.success('Wallet Connected', {
        description: 'Check the status indicator above for connection details.'
      });

    } catch (error: any) {
      console.error('Connect error:', error);
      if (error?.message?.includes('cancelled')) {
        // User cancelled - don't show error
        return;
      }
      toast.error('Failed to connect wallet', {
        description: error?.message || 'Unknown error occurred'
      });
    }
  };

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
            website: data.website_url || '',
            algorand_wallet_address: data.algorand_wallet_address || ''
          });
        } else {
          // Set default username from email if no profile exists
          setProfile(prev => ({
            ...prev,
            username: user.email?.split('@')[0] || '',
            algorand_wallet_address: ''
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
          algorand_wallet_address: profile.algorand_wallet_address,
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
            <h2 className="text-5xl font-heading text-startsnap-ebony-clay leading-[48px]">
              Your Profile
            </h2>
                          <p className="text-xl text-startsnap-river-bed font-body mt-4">
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
                        className="rounded-full w-full max-w-xs sm:w-56 flex justify-between items-center px-3 py-2 text-sm bg-startsnap-athens-gray text-startsnap-ebony-clay hover:bg-gray-300 border-gray-800 border-2 shadow-[2px_2px_0px_#1f2937] mt-4"
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
                      <label className="block font-ui text-startsnap-oxford-blue text-lg leading-7">
                        Username
                      </label>
                      <Input
                        name="username"
                        value={profile.username}
                        onChange={handleChange}
                        placeholder="Your username"
                        className={`border-2 border-solid ${usernameError ? 'border-red-500' : 'border-gray-800'} rounded-lg p-4 text-startsnap-pale-sky`}
                      />
                      {usernameError && (
                        <p className="text-red-500 text-sm mt-1">{usernameError}</p>
                      )}
                    </div>

                    <div className="space-y-2">
                      <label className="block font-ui text-startsnap-oxford-blue text-lg leading-7">
                        Bio
                      </label>
                      <Textarea
                        name="bio"
                        value={profile.bio}
                        onChange={handleChange}
                        placeholder="Tell us about yourself, your skills, interests, and what you're working on..."
                        className="border-2 border-solid border-gray-800 rounded-lg p-3.5 min-h-[120px] text-startsnap-pale-sky"
                      />
                    </div>

                    <div className="space-y-2">
                      <label className="block font-ui text-startsnap-oxford-blue text-lg leading-7">
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
                            className={`border-2 border-solid ${linkErrors.github ? 'border-red-500' : 'border-gray-800'} rounded-lg p-3 pl-10 text-startsnap-pale-sky`}
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
                            className={`border-2 border-solid ${linkErrors.twitter ? 'border-red-500' : 'border-gray-800'} rounded-lg p-3 pl-10 text-startsnap-pale-sky`}
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
                            className={`border-2 border-solid ${linkErrors.linkedin ? 'border-red-500' : 'border-gray-800'} rounded-lg p-3 pl-10 text-startsnap-pale-sky`}
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
                            className={`border-2 border-solid ${linkErrors.website ? 'border-red-500' : 'border-gray-800'} rounded-lg p-3 pl-10 text-startsnap-pale-sky`}
                          />
                          {linkErrors.website && (
                            <p className="text-red-500 text-xs mt-1">{linkErrors.website}</p>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Tip Collection Wallet Section */}
                    <div className="space-y-2">
                      <label className="block font-ui text-startsnap-oxford-blue text-lg leading-7">
                        Tip Collection Wallet
                      </label>
                      <p className="text-sm text-gray-600 mb-4">
                        This is where you'll receive tips from your supporters. You can change or remove this wallet anytime.
                      </p>

                      {profile.algorand_wallet_address ? (
                                                <div className="p-4 border-2 rounded-lg bg-gray-50 border-gray-200">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-3">
                                                            <div className="w-10 h-10 rounded-lg flex items-center justify-center bg-gray-200">
                                                                <span className="material-icons text-xl text-gray-500">
                                  account_balance_wallet
                                </span>
                              </div>
                              <div>
                                <div className="flex items-center gap-2 mb-1">
                                                                    <p className="text-sm font-medium text-gray-700">
                                    Tip Collection Wallet
                                  </p>
                                  {isStoredWalletConnected() ? (
                                    <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                                      Connected
                                    </span>
                                  ) : isDifferentWalletConnected() ? (
                                    <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
                                      Different Wallet
                                    </span>
                                  ) : (
                                    <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-600">
                                      Stored
                                    </span>
                                  )}
                                </div>
                                                                <p className="font-mono text-sm px-2 py-1 rounded border text-gray-600 bg-gray-100">
                                  {profile.algorand_wallet_address.slice(0, 8)}...{profile.algorand_wallet_address.slice(-8)}
                                </p>
                              </div>
                            </div>
                            <DropdownMenu>
                              <DropdownMenuTrigger asChild>
                                <Button variant="ghost" className="h-8 w-8 p-0">
                                  <span className="sr-only">Wallet actions</span>
                                  <MoreHorizontal className="h-4 w-4" />
                                </Button>
                              </DropdownMenuTrigger>
                              <DropdownMenuContent align="end">
                                {activeAddress ? (
                                  <DropdownMenuItem
                                    onClick={handleDisconnectWallet}
                                    className="text-startsnap-oxford-blue hover:bg-startsnap-french-rose/10"
                                  >
                                    <Unplug className="mr-2 h-4 w-4" />
                                    Disconnect
                                  </DropdownMenuItem>
                                ) : (
                                  <DropdownMenuItem
                                    onClick={handleConnectStoredWallet}
                                    className="text-startsnap-oxford-blue hover:bg-startsnap-french-rose/10"
                                  >
                                    <LinkIcon className="mr-2 h-4 w-4" />
                                    Connect
                                  </DropdownMenuItem>
                                )}
                                <DropdownMenuItem
                                  onClick={() => setIsChangingWallet(true)}
                                  className="text-startsnap-oxford-blue hover:bg-startsnap-french-rose/10"
                                >
                                  <Edit className="mr-2 h-4 w-4" />
                                  Change Wallet
                                </DropdownMenuItem>
                                <DropdownMenuItem
                                  onClick={() => setIsRemoveWalletDialogOpen(true)}
                                  className="text-red-600 hover:bg-red-50"
                                >
                                  <Trash2 className="mr-2 h-4 w-4" />
                                  Remove Wallet
                                </DropdownMenuItem>
                              </DropdownMenuContent>
                            </DropdownMenu>
                          </div>
                                                    <div className="mt-3 p-2 border rounded text-xs bg-gray-100 border-gray-200 text-gray-600">
                            <span className="material-icons text-sm mr-1 align-middle text-gray-500">
                              {isDifferentWalletConnected() ? 'warning' : 'info'}
                            </span>
                            {isDifferentWalletConnected()
                              ? 'Connected wallet doesn\'t match your tip collection address.'
                              : 'This wallet is only for collecting tips. When tipping others, you can use any wallet you prefer.'
                            }
                          </div>
                        </div>
                      ) : (
                        <div className="border border-gray-200 rounded-lg p-6 bg-gray-50">
                          <div className="text-center">

                            <WalletConnect
                              compact={true}
                              buttonText="Connect Wallet"
                              mode="collection"
                              onWalletConnected={(address: string) => {
                                setProfile(prev => ({ ...prev, algorand_wallet_address: address }));
                                toast.success('Tip collection wallet connected! Don\'t forget to save your profile.');
                              }}
                            />
                          </div>
                        </div>
                      )}

                      {/* Change Wallet Dialog */}
                      {isChangingWallet && (
                        <div
                          className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4"
                          onClick={(e) => {
                            if (e.target === e.currentTarget) {
                              setIsChangingWallet(false);
                            }
                          }}
                          onKeyDown={(e) => {
                            if (e.key === 'Escape') {
                              setIsChangingWallet(false);
                            }
                          }}
                          tabIndex={-1}
                        >
                          <div
                            className="bg-startsnap-white border-2 border-startsnap-ebony-clay rounded-xl shadow-[4px_4px_0px_#1f2937] max-w-md w-full animate-in zoom-in-95 duration-200"
                            role="dialog"
                            aria-modal="true"
                            aria-labelledby="change-wallet-title"
                            aria-describedby="change-wallet-description"
                          >
                            {/* Header Section */}
                            <div className="border-b-2 border-startsnap-ebony-clay p-6">
                              <div className="flex items-center justify-between">
                                <div className="flex items-center gap-3">
                                  <div className="w-8 h-8 bg-startsnap-mountain-meadow rounded-lg border-2 border-startsnap-ebony-clay flex items-center justify-center shadow-[2px_2px_0px_#1f2937]">
                                    <Edit className="h-4 w-4 text-startsnap-ebony-clay" />
                                  </div>
                                  <h3
                                    id="change-wallet-title"
                                    className="font-heading text-startsnap-ebony-clay text-xl uppercase tracking-wider"
                                  >
                                    CHANGE WALLET
                                  </h3>
                                </div>
                                <button
                                  onClick={() => setIsChangingWallet(false)}
                                  className="w-8 h-8 bg-startsnap-beige border-2 border-startsnap-ebony-clay rounded-lg hover:bg-startsnap-beige/90 active:scale-95 transition-all duration-150 flex items-center justify-center shadow-[2px_2px_0px_#1f2937] hover:shadow-[3px_3px_0px_#1f2937] hover:translate-x-[-1px] hover:translate-y-[-1px]"
                                  aria-label="Close dialog"
                                >
                                  <X className="h-4 w-4 text-startsnap-ebony-clay" />
                                </button>
                              </div>
                            </div>

                            {/* Main Content Section */}
                            <div className="p-6">
                              {/* Description */}
                              <div className="bg-startsnap-beige border-2 border-startsnap-ebony-clay rounded-lg p-4 mb-6 shadow-[2px_2px_0px_#1f2937]">
                                <p
                                  id="change-wallet-description"
                                  className="font-medium text-startsnap-ebony-clay text-sm leading-relaxed"
                                >
                                  Connect a different wallet to use as your tip collection wallet. This will update your profile with the new wallet address.
                                </p>
                              </div>

                              {/* Wallet Connect */}
                              <WalletConnect
                                compact={true}
                                buttonText="CONNECT NEW WALLET"
                                mode="collection"
                                onWalletConnected={(address: string) => {
                                  setProfile(prev => ({ ...prev, algorand_wallet_address: address }));
                                  toast.success('Tip collection wallet updated! Don\'t forget to save your profile.');
                                  setIsChangingWallet(false);
                                }}
                              />
                            </div>
                          </div>
                        </div>
                      )}
                    </div>

                    <div className="flex justify-end pt-4">
                      <Button
                        type="button"
                        variant="primary"
                        size="lg"
                        onClick={updateProfile}
                        disabled={updating}
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
            <div className="px-6 py-2 bg-startsnap-ebony-clay text-startsnap-beige font-heading font-bold text-sm rounded-full border-2 border-startsnap-french-rose">
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
                <Button variant="primary" size="lg" asChild>
                  <Link to="/create">Create Your First StartSnap</Link>
                </Button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Remove Wallet Confirmation Dialog */}
      <ConfirmationDialog
        isOpen={isRemoveWalletDialogOpen}
        onClose={() => setIsRemoveWalletDialogOpen(false)}
        onConfirm={handleRemoveWallet}
        title="Remove Tip Collection Wallet"
        description="Are you sure you want to remove your tip collection wallet? This will disconnect your current wallet session, remove the stored wallet address, and prevent you from receiving tips until you add a new wallet."
        confirmText="Remove Wallet"
        type="danger"
        isLoading={isRemovingWallet}
      />
    </div>
  );
};