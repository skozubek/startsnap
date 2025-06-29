/**
 * src/screens/Profiles/Profiles.tsx
 * @description A page to discover and filter Vibe Coders on the platform.
 */

import React, { useEffect, useState, useCallback } from "react";
import { Link } from "react-router-dom";
import { supabase } from "../../lib/supabase";
import { getUserStatusOptions } from "../../config/categories";
import { UserAvatar, getAvatarName } from "../../components/ui/user-avatar";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../../components/ui/select";
import { Card, CardContent } from "../../components/ui/card";
import { Input } from "../../components/ui/input";
import { Button } from "../../components/ui/button";
import { Popover, PopoverContent, PopoverTrigger } from "../../components/ui/popover";
import { Label } from "../../components/ui/label";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuLabel,
  DropdownMenuSeparator,
} from "../../components/ui/dropdown-menu";
import { FaGithub, FaXTwitter, FaLinkedinIn } from "react-icons/fa6";
import type { UserProfileData, ProfileSummary, PaginatedProfileDiscoveryState } from "../../types/user";

const DEFAULT_DISCOVERY_STATE: PaginatedProfileDiscoveryState = {
  searchTerm: '',
  filters: { status: undefined },
  sort: { field: 'username', direction: 'asc' },
  page: 1,
  pageSize: 6,
};

const statusOptions = [{ value: "all", label: "All Statuses" }, ...getUserStatusOptions()];

/**
 * @description Helper function to check if any search term or filters are active.
 * @param {PaginatedProfileDiscoveryState} currentState - The current discovery state.
 * @returns {boolean} True if search term or filters are active, false otherwise.
 */
const areFiltersOrSearchActive = (currentState: PaginatedProfileDiscoveryState): boolean => {
  const { searchTerm, filters } = currentState;
  return (
    searchTerm !== '' ||
    filters.status !== undefined
  );
};

/**
 * @description Directory page component for discovering and filtering Vibe Coders
 * @returns {JSX.Element} Profiles directory page with filterable user cards
 */
export const Profiles = (): JSX.Element => {
  const [loading, setLoading] = useState(true);
  const [profiles, setProfiles] = useState<ProfileSummary[]>([]);
  const [discoveryState, setDiscoveryState] = useState<PaginatedProfileDiscoveryState>(DEFAULT_DISCOVERY_STATE);
  const [totalProfilesCount, setTotalProfilesCount] = useState<number>(0);
  const [isFilterPopoverOpen, setIsFilterPopoverOpen] = useState<boolean>(false);

  /**
   * @description Fetches paginated profiles from Supabase with search, filtering, and sorting
   * @async
   * @param {PaginatedProfileDiscoveryState} currentDiscoveryState - Current discovery state including pagination
   * @sideEffects Updates profiles, totalProfilesCount, and loading state
   */
  const fetchPaginatedProfiles = useCallback(async (currentDiscoveryState: PaginatedProfileDiscoveryState) => {
    try {
      setLoading(true);

      // Calculate range for pagination (zero-based indices)
      const startIndex = (currentDiscoveryState.page - 1) * currentDiscoveryState.pageSize;
      const endIndex = startIndex + currentDiscoveryState.pageSize - 1;

      let query = supabase
        .from('profiles')
        .select('user_id, username, bio, status, github_url, twitter_url, linkedin_url, website_url, created_at', { count: 'exact' })
        .range(startIndex, endIndex);

      // Apply search filter
      if (currentDiscoveryState.searchTerm.trim()) {
        query = query.or(`username.ilike.%${currentDiscoveryState.searchTerm}%,bio.ilike.%${currentDiscoveryState.searchTerm}%`);
      }

      // Apply status filter
      if (currentDiscoveryState.filters.status && currentDiscoveryState.filters.status !== "all") {
        query = query.eq('status', currentDiscoveryState.filters.status);
      }

      // Apply sorting
      query = query.order(currentDiscoveryState.sort.field, { ascending: currentDiscoveryState.sort.direction === 'asc' });
      if (currentDiscoveryState.sort.field !== 'created_at') {
        query = query.order('created_at', { ascending: false });
      }

      const { data, error, count } = await query;

      if (error) throw error;

      // Update total count
      setTotalProfilesCount(count || 0);

      // For page 1, replace the array; for subsequent pages, append
      if (currentDiscoveryState.page === 1) {
        setProfiles(data || []);
      } else {
        setProfiles(prevProfiles => [...prevProfiles, ...(data || [])]);
      }
    } catch (error) {
      console.error("Error fetching profiles:", error);
      if (currentDiscoveryState.page === 1) {
        setProfiles([]);
        setTotalProfilesCount(0);
      }
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    // Debounce search
    const handler = setTimeout(() => {
      fetchPaginatedProfiles(discoveryState);
    }, 300);

    return () => {
      clearTimeout(handler);
    };
  }, [discoveryState, fetchPaginatedProfiles]);

  /**
   * @description Handles changes to discovery state and resets pagination to page 1
   * @param {Omit<PaginatedProfileDiscoveryState, 'page' | 'pageSize'>} newDiscoveryState - New discovery state without pagination
   * @sideEffects Updates discoveryState and resets to page 1
   */
  const handleDiscoveryChange = (newDiscoveryState: Omit<PaginatedProfileDiscoveryState, 'page' | 'pageSize'>) => {
    setDiscoveryState({
      ...newDiscoveryState,
      page: 1,
      pageSize: DEFAULT_DISCOVERY_STATE.pageSize
    });
  };

  /**
   * @description Loads the next page of profiles
   * @sideEffects Increments the page number in discoveryState
   */
  const handleLoadMore = () => {
    setDiscoveryState(prevState => ({
      ...prevState,
      page: prevState.page + 1
    }));
  };

  const handleSearchChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    handleDiscoveryChange({
      searchTerm: event.target.value,
      filters: discoveryState.filters,
      sort: discoveryState.sort
    });
  };

  const handleStatusChange = (value: string) => {
    const statusValue = value === "all" ? undefined : value;
    handleDiscoveryChange({
      searchTerm: discoveryState.searchTerm,
      filters: { status: statusValue },
      sort: discoveryState.sort
    });
  };

  const handleSortChange = (sort: string) => {
    let field: 'username' | 'created_at' = 'username';
    let direction: 'asc' | 'desc' = 'asc';

    switch (sort) {
      case "name_asc":
        field = 'username';
        direction = 'asc';
        break;
      case "name_desc":
        field = 'username';
        direction = 'desc';
        break;
      case "newest":
        field = 'created_at';
        direction = 'desc';
        break;
      case "oldest":
        field = 'created_at';
        direction = 'asc';
        break;
    }

    handleDiscoveryChange({
      searchTerm: discoveryState.searchTerm,
      filters: discoveryState.filters,
      sort: { field, direction }
    });
  };

  const handleFilterClear = () => {
    handleDiscoveryChange({
      searchTerm: discoveryState.searchTerm,
      filters: { status: undefined },
      sort: discoveryState.sort
    });
    setIsFilterPopoverOpen(false);
  };

  const getSortLabel = (): string => {
    const { field, direction } = discoveryState.sort;
    if (field === 'username' && direction === 'asc') return "Name (A-Z)";
    if (field === 'username' && direction === 'desc') return "Name (Z-A)";
    if (field === 'created_at' && direction === 'desc') return "Newest";
    if (field === 'created_at' && direction === 'asc') return "Oldest";
    return "Sort by";
  };

  const getCurrentSortValue = (): string => {
    const { field, direction } = discoveryState.sort;
    if (field === 'username' && direction === 'asc') return "name_asc";
    if (field === 'username' && direction === 'desc') return "name_desc";
    if (field === 'created_at' && direction === 'desc') return "newest";
    if (field === 'created_at' && direction === 'asc') return "oldest";
    return "name_asc";
  };

  const getSortLabelFromValue = (sort: string): string => {
    switch (sort) {
      case "name_asc": return "Name (A-Z)";
      case "name_desc": return "Name (Z-A)";
      case "newest": return "Newest";
      case "oldest": return "Oldest";
      default: return "Sort by";
    }
  };

  // Check if there are more profiles to load
  const hasMoreProfiles = profiles.length < totalProfilesCount;

  return (
    <div className="flex flex-col w-full items-center bg-white">
      {/* Hero Section with Gradient */}
      <div className="w-full bg-startsnap-candlelight">
        <div className="w-full max-w-6xl px-8 py-16 mx-auto">
          <div className="text-center">
            <h1 className="text-5xl font-heading text-startsnap-ebony-clay mb-4">
              Vibe Coders Directory
            </h1>
            <p className="text-xl text-startsnap-river-bed font-body">
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
            {/* BRUTAL Profile Search Bar */}
            <div className="mb-12">
              <div className="bg-startsnap-ebony-clay p-6 rounded-xl border-2 border-startsnap-french-rose shadow-[3px_3px_0px_#ef4444] transform rotate-[-0.25deg] hover:rotate-0 transition-all duration-300">
                {/* Search Section */}
                <div className="flex flex-col lg:flex-row gap-4 items-center">
                  {/* Main Search Input - Takes Most Space */}
                  <div className="relative flex-1 w-full">
                    <span className="material-icons absolute left-4 top-1/2 -translate-y-1/2 text-startsnap-ebony-clay text-xl z-10 pointer-events-none">search</span>
                    <Input
                      type="text"
                      placeholder="Search vibe coders by username or bio..."
                      value={discoveryState.searchTerm}
                      onChange={handleSearchChange}
                      onKeyDown={(e) => e.key === 'Enter' && e.preventDefault()}
                      className="w-full bg-startsnap-beige text-startsnap-ebony-clay placeholder:text-startsnap-ebony-clay/60 border-2 border-startsnap-ebony-clay rounded-lg pl-12 pr-4 py-3 text-base font-medium shadow-[3px_3px_0px_#1f2937] focus:shadow-[5px_5px_0px_#1f2937] focus:translate-x-[-2px] focus:translate-y-[-2px] transition-all duration-200"
                    />
                  </div>

                  {/* Compact Filter & Sort Controls */}
                  <div className="flex gap-3 shrink-0">
                    {/* Filter Popover */}
                    <Popover open={isFilterPopoverOpen} onOpenChange={setIsFilterPopoverOpen}>
                      <PopoverTrigger asChild>
                        <Button className="bg-startsnap-beige text-startsnap-ebony-clay border-2 border-startsnap-ebony-clay rounded-lg px-4 py-3 font-bold shadow-[3px_3px_0px_#1f2937] hover:bg-startsnap-beige hover:shadow-[4px_4px_0px_#1f2937] hover:translate-x-[-1px] hover:translate-y-[-1px] transition-all duration-200 flex items-center gap-2">
                          <span className="material-icons text-lg">tune</span>
                          <span className="hidden sm:inline">Filter</span>
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent align="start">
                        <div className="space-y-4">
                          <h3 className="font-semibold text-startsnap-ebony-clay">Filter Vibe Coders</h3>

                          {/* Status Filter */}
                          <div>
                            <Label className="font-medium text-startsnap-ebony-clay block mb-2">Status</Label>
                            <Select value={discoveryState.filters.status || "all"} onValueChange={handleStatusChange}>
                              <SelectTrigger className="w-full border border-gray-800 rounded-md p-2">
                                <SelectValue placeholder="All Statuses" />
                              </SelectTrigger>
                              <SelectContent className="bg-startsnap-white border border-gray-800 rounded-md">
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

                          {/* Clear Button */}
                          <Button
                            onClick={handleFilterClear}
                            variant="outline"
                            size="sm"
                            className="w-full"
                          >
                            Clear All Filters
                          </Button>
                        </div>
                      </PopoverContent>
                    </Popover>

                    {/* Sort Dropdown */}
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button className="bg-startsnap-beige text-startsnap-ebony-clay border-2 border-startsnap-ebony-clay rounded-lg px-4 py-3 font-bold shadow-[3px_3px_0px_#1f2937] hover:bg-startsnap-beige hover:shadow-[4px_4px_0px_#1f2937] hover:translate-x-[-1px] hover:translate-y-[-1px] transition-all duration-200 flex items-center gap-2">
                          <span className="material-icons text-lg">sort</span>
                          <span className="hidden sm:inline">{getSortLabel()}</span>
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuLabel>Sort By</DropdownMenuLabel>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem onClick={() => handleSortChange('newest')}>
                          {getSortLabelFromValue('newest')}
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => handleSortChange('oldest')}>
                          {getSortLabelFromValue('oldest')}
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => handleSortChange('name_asc')}>
                          {getSortLabelFromValue('name_asc')}
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => handleSortChange('name_desc')}>
                          {getSortLabelFromValue('name_desc')}
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                </div>
              </div>
            </div>

            {/* Results Section */}
            {loading && discoveryState.page === 1 ? (
              <div className="text-center py-20 bg-startsnap-candlelight/20 rounded-lg border-2 border-dashed border-gray-300">
                <p className="text-xl font-bold text-startsnap-ebony-clay">Loading Vibe Coders...</p>
              </div>
            ) : profiles.length > 0 ? (
              <>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                  {profiles.map(profile => (
                    <Link to={`/profiles/${profile.username}`} key={profile.user_id} className="block group">
                      <Card className="h-full bg-startsnap-white rounded-xl overflow-hidden border-[3px] border-solid border-gray-800 shadow-[5px_5px_0px_#1f2937] hover:opacity-90 transition-opacity duration-200">
                        {/* Header strip */}
                        <div className="h-3 bg-startsnap-french-rose border-b-4 border-black"></div>

                        <CardContent className="p-6 flex flex-col items-center text-center">
                          <div className="w-20 h-20 mb-4 relative">
                            <UserAvatar name={getAvatarName(null, profile.username)} size={80} className="w-full h-full" />
                            {/* Status indicator dot */}
                            <div className="absolute -bottom-1 -right-1 w-6 h-6 bg-white border-2 border-gray-800 rounded-full flex items-center justify-center shadow-[2px_2px_0px_#1f2937]">
                              <span className="material-icons text-xs text-gray-700">
                                {(() => {
                                  const foundOption = statusOptions.find(opt => opt.value === profile.status);
                                  return (foundOption && 'icon' in foundOption) ? foundOption.icon : 'lightbulb';
                                })()}
                              </span>
                            </div>
                          </div>

                                          <h3 className="text-xl font-ui text-startsnap-ebony-clay mb-2">{profile.username}</h3>
                <p className="text-sm text-startsnap-river-bed font-body line-clamp-3 leading-relaxed mb-3">{profile.bio || 'No bio yet.'}</p>

                          {/* Social Icons */}
                          {(profile.github_url || profile.twitter_url || profile.linkedin_url || profile.website_url) && (
                            <div className="flex items-center justify-center gap-3 mt-auto">
                              {profile.github_url && (
                                <a href={profile.github_url} target="_blank" rel="noopener noreferrer" className="transition-opacity hover:opacity-70">
                                  {React.createElement(FaGithub as any, { size: 16, className: "text-gray-600" })}
                                </a>
                              )}
                              {profile.twitter_url && (
                                <a href={profile.twitter_url} target="_blank" rel="noopener noreferrer" className="transition-opacity hover:opacity-70">
                                  {React.createElement(FaXTwitter as any, { size: 16, className: "text-gray-600" })}
                                </a>
                              )}
                              {profile.linkedin_url && (
                                <a href={profile.linkedin_url} target="_blank" rel="noopener noreferrer" className="transition-opacity hover:opacity-70">
                                  {React.createElement(FaLinkedinIn as any, { size: 16, className: "text-gray-600" })}
                                </a>
                              )}
                              {profile.website_url && (
                                <a href={profile.website_url} target="_blank" rel="noopener noreferrer" className="transition-opacity hover:opacity-70">
                                  <span className="material-icons text-base text-gray-600">public</span>
                                </a>
                              )}
                            </div>
                          )}
                        </CardContent>
                      </Card>
                    </Link>
                  ))}
                </div>

                {/* Load More Button */}
                {hasMoreProfiles && (
                  <div className="text-center mt-12">
                    <Button
                      onClick={handleLoadMore}
                      disabled={loading && discoveryState.page > 1}
                      variant="secondary"
                      size="lg"
                    >
                      {loading && discoveryState.page > 1 ? 'Loading More...' : 'Load More Vibe Coders'}
                    </Button>
                  </div>
                )}
              </>
            ) : areFiltersOrSearchActive(discoveryState) ? (
              <div className="text-center py-20 bg-startsnap-candlelight/20 rounded-lg border-2 border-dashed border-gray-300">
                <p className="text-xl text-startsnap-pale-sky">No Vibe Coders match your criteria. Try adjusting your search or filters!</p>
                <Button
                  onClick={() => setDiscoveryState(DEFAULT_DISCOVERY_STATE)}
                  variant="primary"
                  size="lg"
                  className="mt-4"
                >
                  Clear Search & Filters
                </Button>
              </div>
            ) : (
              <div className="text-center py-20 bg-startsnap-candlelight/20 rounded-lg border-2 border-dashed border-gray-300">
                <p className="text-xl text-startsnap-pale-sky">No Vibe Coders found for this filter.</p>
              </div>
            )}

            {/* Loading indicator for subsequent pages */}
            {loading && discoveryState.page > 1 && (
              <div className="text-center py-8">
                <p className="text-xl text-startsnap-pale-sky">Loading more Vibe Coders...</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};