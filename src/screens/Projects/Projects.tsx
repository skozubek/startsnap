/**
 * src/screens/Projects/Projects.tsx
 * @description Projects gallery page showing all StartSnaps with search and filtering
 */

import React, { useState, useEffect, useCallback } from "react";
import { SearchAndFilterBar } from "../../components/ui/SearchAndFilterBar";
import { StartSnapCard } from "../../components/ui/StartSnapCard";
import { Button } from "../../components/ui/button";
import { Link } from "react-router-dom";
import { supabase } from "../../lib/supabase";
import { CATEGORY_CONFIG, getCategoryDisplay } from "../../config/categories";
import { formatDate } from "../../lib/utils";
import { TrendingSection } from "./components/TrendingSection";
import type { PaginatedProjectDiscoveryState, FilterOptions } from "../../types/projectDiscovery";
import type { StartSnapProject } from "../../types/startsnap";
import type { UserProfileData } from "../../types/user";

const DEFAULT_DISCOVERY_STATE: PaginatedProjectDiscoveryState = {
  searchTerm: '',
  filters: { type: 'all', category: undefined, isHackathonEntry: false },
  sort: { field: 'created_at', direction: 'desc' },
  page: 1,
  pageSize: 6,
};

const categoryOptions = Object.values(CATEGORY_CONFIG).map(config => config.label);

/**
 * @description Helper function to check if any search term or filters are active.
 * @param {PaginatedProjectDiscoveryState} currentState - The current discovery state.
 * @returns {boolean} True if search term or filters are active, false otherwise.
 */
const areFiltersOrSearchActive = (currentState: PaginatedProjectDiscoveryState): boolean => {
  const { searchTerm, filters } = currentState;
  return (
    searchTerm !== '' ||
    filters.category !== undefined ||
    filters.type !== 'all' ||
    filters.isHackathonEntry === true
  );
};

/**
 * @description Page component that displays the projects gallery
 * @returns {JSX.Element} Projects gallery page with search, filters, and StartSnap cards
 */
export const Projects = (): JSX.Element => {
  const [startSnaps, setStartSnaps] = useState<StartSnapProject[]>([]);
  const [loading, setLoading] = useState(true);
  const [creators, setCreators] = useState<Record<UserProfileData['user_id'], UserProfileData['username']>>({});
  const [discoveryState, setDiscoveryState] = useState<PaginatedProjectDiscoveryState>(DEFAULT_DISCOVERY_STATE);
  const [totalProjectsCount, setTotalProjectsCount] = useState<number>(0);

  /**
   * @description Fetches paginated StartSnaps from Supabase with search, filtering, and sorting
   * @async
   * @param {PaginatedProjectDiscoveryState} currentDiscoveryState - Current discovery state including pagination
   * @sideEffects Updates startSnaps, creators, totalProjectsCount, and loading state
   */
  const fetchPaginatedStartSnaps = useCallback(async (currentDiscoveryState: PaginatedProjectDiscoveryState) => {
    try {
      setLoading(true);
      
      // Calculate range for pagination (zero-based indices)
      const startIndex = (currentDiscoveryState.page - 1) * currentDiscoveryState.pageSize;
      const endIndex = startIndex + currentDiscoveryState.pageSize - 1;
      
      let query = supabase
        .from('startsnaps')
        .select('*, support_count, screenshot_urls', { count: 'exact' })
        .range(startIndex, endIndex);

      if (currentDiscoveryState.searchTerm) {
        const searchTerm = `%${currentDiscoveryState.searchTerm}%`;
        query = query.or(
          `name.ilike.${searchTerm},description.ilike.${searchTerm},tags.cs.{${currentDiscoveryState.searchTerm}},tools_used.cs.{${currentDiscoveryState.searchTerm}}`
        );
      }

      if (currentDiscoveryState.filters.category) {
        const categoryKey = Object.keys(CATEGORY_CONFIG).find(
          key => CATEGORY_CONFIG[key as keyof typeof CATEGORY_CONFIG].label === currentDiscoveryState.filters.category
        );
        if (categoryKey) {
          query = query.eq('category', categoryKey);
        }
      }
      if (currentDiscoveryState.filters.type && currentDiscoveryState.filters.type !== 'all') {
        query = query.eq('type', currentDiscoveryState.filters.type);
      }
      if (currentDiscoveryState.filters.isHackathonEntry) {
        query = query.eq('is_hackathon_entry', true);
      }

      query = query.order(currentDiscoveryState.sort.field, { ascending: currentDiscoveryState.sort.direction === 'asc' });
      if (currentDiscoveryState.sort.field !== 'created_at') {
          query = query.order('created_at', { ascending: false });
      }

      const { data, error, count } = await query;

      if (error) throw error;

      // Update total count
      setTotalProjectsCount(count || 0);

      // For page 1, replace the array; for subsequent pages, append
      if (currentDiscoveryState.page === 1) {
        setStartSnaps(data || []);
      } else {
        setStartSnaps(prevStartSnaps => [...prevStartSnaps, ...(data || [])]);
      }

      if (data && data.length > 0) {
        // Get user IDs from new data only
        const newUserIds = [...new Set(data.map(snap => snap.user_id))];
        const { data: profilesData, error: profilesError } = await supabase
          .from('profiles')
          .select('user_id, username')
          .in('user_id', newUserIds);

        if (profilesError) throw profilesError;

        const newCreatorsMap: Record<UserProfileData['user_id'], UserProfileData['username']> = {};
        profilesData?.forEach(profile => {
          newCreatorsMap[profile.user_id] = profile.username;
        });

        // For page 1, replace creators; for subsequent pages, merge
        if (currentDiscoveryState.page === 1) {
          setCreators(newCreatorsMap);
        } else {
          setCreators(prevCreators => ({ ...prevCreators, ...newCreatorsMap }));
        }
      } else {
        if (currentDiscoveryState.page === 1) {
          setCreators({});
        }
      }
    } catch (error) {
      console.error('Error fetching startsnaps:', error);
      if (currentDiscoveryState.page === 1) {
        setStartSnaps([]);
        setCreators({});
        setTotalProjectsCount(0);
      }
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchPaginatedStartSnaps(discoveryState);
  }, [discoveryState, fetchPaginatedStartSnaps]);

  /**
   * @description Handles changes to discovery state and resets pagination to page 1
   * @param {Omit<PaginatedProjectDiscoveryState, 'page' | 'pageSize'>} newDiscoveryState - New discovery state without pagination
   * @sideEffects Updates discoveryState and resets to page 1
   */
  const handleDiscoveryChange = (newDiscoveryState: Omit<PaginatedProjectDiscoveryState, 'page' | 'pageSize'>) => {
    setDiscoveryState({
      ...newDiscoveryState,
      page: 1,
      pageSize: DEFAULT_DISCOVERY_STATE.pageSize
    });
  };

  /**
   * @description Loads the next page of projects
   * @sideEffects Increments the page number in discoveryState
   */
  const handleLoadMore = () => {
    setDiscoveryState(prevState => ({
      ...prevState,
      page: prevState.page + 1
    }));
  };

  // Check if there are more projects to load
  const hasMoreProjects = startSnaps.length < totalProjectsCount;

  return (
    <div className="flex flex-col w-full items-center bg-startsnap-candlelight">
      {/* Hero Section with Gradient */}
      <div className="w-full bg-startsnap-candlelight">
        <div className="w-full max-w-screen-2xl px-8 py-16 mx-auto">
          <h1 className="text-5xl font-bold text-startsnap-ebony-clay text-center mb-16 font-['Space_Grotesk',Helvetica]">
            Explore StartSnaps Gallery
          </h1>

          {/* Trending Zone - Now with Bold Contrast */}
          <div className="bg-startsnap-ebony-clay p-8 md:p-12 rounded-xl border-4 border-startsnap-french-rose shadow-[8px_8px_0px_#ef4444] transform rotate-[0.5deg] hover:rotate-0 transition-transform duration-300">
            <h2 className="text-3xl font-bold text-startsnap-beige text-center mb-8 font-['Space_Grotesk',Helvetica]">
              🔥 Trending StartSnaps
            </h2>
            <TrendingSection />
          </div>
        </div>
      </div>

      {/* Dynamic Separator */}
      <div className="w-full bg-startsnap-beige relative">
        <div className="absolute inset-0 bg-[repeating-linear-gradient(45deg,transparent,transparent_10px,rgba(0,0,0,0.03)_10px,rgba(0,0,0,0.03)_20px)]"></div>
        <div className="w-full max-w-screen-2xl px-8 py-8 mx-auto relative">
          <div className="flex items-center justify-center">
            <div className="flex-1 h-2 bg-startsnap-french-rose transform -skew-x-12"></div>
            <div className="px-6 py-2 bg-startsnap-ebony-clay text-startsnap-beige font-bold text-sm rounded-full border-2 border-startsnap-french-rose">
              BROWSE ALL
            </div>
            <div className="flex-1 h-2 bg-startsnap-french-rose transform skew-x-12"></div>
          </div>
        </div>
      </div>

      {/* Browse Section - White Background for Contrast */}
      <div className="w-full bg-white">
        <div className="w-full max-w-screen-2xl px-8 py-16 mx-auto">
          {/* Streamlined Search Bar */}
          <div className="mb-12">
            <SearchAndFilterBar
              initialSearchTerm={discoveryState.searchTerm}
              initialFilters={discoveryState.filters}
              initialSort={discoveryState.sort}
              categories={categoryOptions}
              onDiscoveryChange={handleDiscoveryChange}
            />
          </div>

          {/* Projects Grid */}
          {loading && discoveryState.page === 1 ? (
            <div className="text-center py-20 bg-startsnap-candlelight/20 rounded-lg border-2 border-dashed border-gray-300">
              <p className="text-xl text-startsnap-pale-sky">Loading projects...</p>
            </div>
          ) : startSnaps.length > 0 ? (
            <>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                {startSnaps.map((startsnap) => {
                  const creatorName = creators[startsnap.user_id] || 'Anonymous';

                  return (
                    <StartSnapCard
                      key={startsnap.id}
                      startsnap={startsnap}
                      showCreator={true}
                      creatorName={creatorName}
                      variant="main-page"
                      formatDate={formatDate}
                      getCategoryDisplay={getCategoryDisplay}
                    />
                  );
                })}
              </div>
              
              {/* Load More Button */}
              {hasMoreProjects && (
                <div className="text-center mt-12">
                  <Button
                    onClick={handleLoadMore}
                    disabled={loading && discoveryState.page > 1}
                    className="startsnap-button bg-startsnap-persian-blue text-startsnap-white font-['Roboto',Helvetica] font-bold text-lg px-8 py-4 rounded-lg border-2 border-solid border-gray-800 shadow-[3px_3px_0px_#1f2937]"
                  >
                    {loading && discoveryState.page > 1 ? 'Loading More...' : 'Load More Projects'}
                  </Button>
                </div>
              )}
            </>
          ) : areFiltersOrSearchActive(discoveryState) ? (
            <div className="text-center py-20 bg-startsnap-candlelight/20 rounded-lg border-2 border-dashed border-gray-300">
              <p className="text-xl text-startsnap-pale-sky">No projects match your criteria. Try adjusting your search or filters!</p>
              <Button
                onClick={() => setDiscoveryState(DEFAULT_DISCOVERY_STATE)}
                className="startsnap-button mt-4 bg-startsnap-french-rose text-startsnap-white font-['Roboto',Helvetica] font-bold rounded-lg border-2 border-solid border-gray-800 shadow-[3px_3px_0px_#1f2937]"
              >
                Clear Search & Filters
              </Button>
            </div>
          ) : (
            <div className="text-center py-20 bg-startsnap-candlelight/20 rounded-lg border-2 border-dashed border-gray-300">
              <p className="text-xl text-startsnap-pale-sky">No projects found yet. Why not be the first to add one?</p>
              <Button className="startsnap-button mt-4 bg-startsnap-french-rose text-startsnap-white font-['Roboto',Helvetica] font-bold rounded-lg border-2 border-solid border-gray-800 shadow-[3px_3px_0px_#1f2937]" asChild>
                <Link to="/new">Create Your First StartSnap</Link>
              </Button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};