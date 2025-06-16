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
import type { ProjectDiscoveryState, FilterOptions } from "../../types/projectDiscovery";
import type { StartSnapProject } from "../../types/startsnap";
import type { UserProfileData } from "../../types/user";

const DEFAULT_DISCOVERY_STATE: ProjectDiscoveryState = {
  searchTerm: '',
  filters: { type: 'all', category: undefined, isHackathonEntry: false },
  sort: { field: 'created_at', direction: 'desc' },
};

const categoryOptions = Object.values(CATEGORY_CONFIG).map(config => config.label);

/**
 * @description Helper function to check if any search term or filters are active.
 * @param {ProjectDiscoveryState} currentState - The current discovery state.
 * @returns {boolean} True if search term or filters are active, false otherwise.
 */
const areFiltersOrSearchActive = (currentState: ProjectDiscoveryState): boolean => {
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
  const [discoveryState, setDiscoveryState] = useState<ProjectDiscoveryState>(DEFAULT_DISCOVERY_STATE);

  const fetchStartSnaps = useCallback(async (currentDiscoveryState: ProjectDiscoveryState) => {
    try {
      setLoading(true);
      let query = supabase
        .from('startsnaps')
        .select('*, support_count, screenshot_urls');

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

      const { data, error } = await query;

      if (error) throw error;

      setStartSnaps(data || []);

      if (data && data.length > 0) {
        const userIds = [...new Set(data.map(snap => snap.user_id))];
        const { data: profilesData, error: profilesError } = await supabase
          .from('profiles')
          .select('user_id, username')
          .in('user_id', userIds);

        if (profilesError) throw profilesError;

        const creatorsMap: Record<UserProfileData['user_id'], UserProfileData['username']> = {};
        profilesData?.forEach(profile => {
          creatorsMap[profile.user_id] = profile.username;
        });

        setCreators(creatorsMap);
      } else {
        setCreators({});
      }
    } catch (error) {
      console.error('Error fetching startsnaps:', error);
      setStartSnaps([]);
      setCreators({});
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchStartSnaps(discoveryState);
  }, [discoveryState, fetchStartSnaps]);

  const handleDiscoveryChange = (newDiscoveryState: ProjectDiscoveryState) => {
    setDiscoveryState(newDiscoveryState);
  };

  return (
    <div className="flex flex-col w-full items-center bg-startsnap-candlelight">
      {/* Hero Section with Gradient */}
      <div className="w-full bg-gradient-to-b from-startsnap-beige to-startsnap-candlelight">
        <div className="w-full max-w-screen-2xl px-8 py-16 mx-auto">
          <h1 className="text-5xl font-bold text-startsnap-ebony-clay text-center mb-16 font-['Space_Grotesk',Helvetica]">
            Explore StartSnaps Gallery
          </h1>

          {/* Trending Zone - Now with Bold Contrast */}
          <div className="bg-startsnap-ebony-clay p-8 md:p-12 rounded-xl border-4 border-startsnap-french-rose shadow-[8px_8px_0px_#ef4444] transform rotate-[-0.5deg] hover:rotate-0 transition-transform duration-300">
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
          {loading ? (
            <div className="text-center py-20 bg-startsnap-candlelight/20 rounded-lg border-2 border-dashed border-gray-300">
              <p className="text-xl text-startsnap-pale-sky">Loading projects...</p>
            </div>
          ) : startSnaps.length > 0 ? (
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