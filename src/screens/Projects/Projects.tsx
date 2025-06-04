/**
 * src/screens/Projects/Projects.tsx
 * @description Projects gallery page showing all StartSnaps with search and filtering
 */

import React, { useState, useEffect } from "react";
import { SearchAndFilterBar } from "../../components/ui/SearchAndFilterBar";
import { StartSnapCard } from "../../components/ui/StartSnapCard";
import { Button } from "../../components/ui/button";
import { Link } from "react-router-dom";
import { supabase } from "../../lib/supabase";
import { CATEGORY_CONFIG, getCategoryDisplay } from "../../config/categories";
import { formatDate } from "../../lib/utils";
import { useCallback } from "react";
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
        .select('*, support_count');

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

      query = query.limit(12);

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

  // Scroll to top when component mounts
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  const handleDiscoveryChange = (newDiscoveryState: ProjectDiscoveryState) => {
    setDiscoveryState(newDiscoveryState);
  };

  return (
    <div className="flex flex-col w-full items-center bg-startsnap-candlelight">
      <div className="w-full max-w-screen-2xl px-8 py-16">
        <h1 className="text-5xl font-bold text-startsnap-ebony-clay text-center mb-12 font-['Space_Grotesk',Helvetica]">
          Explore StartSnaps Gallery
        </h1>

        <SearchAndFilterBar
          initialSearchTerm={discoveryState.searchTerm}
          initialFilters={discoveryState.filters}
          initialSort={discoveryState.sort}
          categories={categoryOptions}
          onDiscoveryChange={handleDiscoveryChange}
        />

        {loading ? (
          <div className="text-center py-20">
            <p className="text-xl text-startsnap-pale-sky">Loading projects...</p>
          </div>
        ) : startSnaps.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mt-8">
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
          <div className="text-center py-20">
            <p className="text-xl text-startsnap-pale-sky">No projects match your criteria. Try adjusting your search or filters!</p>
            <Button
              onClick={() => setDiscoveryState(DEFAULT_DISCOVERY_STATE)}
              className="startsnap-button mt-4 bg-startsnap-french-rose text-startsnap-white font-['Roboto',Helvetica] font-bold rounded-lg border-2 border-solid border-gray-800 shadow-[3px_3px_0px_#1f2937]"
            >
              Clear Search & Filters
            </Button>
          </div>
        ) : (
          <div className="text-center py-20">
            <p className="text-xl text-startsnap-pale-sky">No projects found yet. Why not be the first to add one?</p>
            <Button className="startsnap-button mt-4 bg-startsnap-french-rose text-startsnap-white font-['Roboto',Helvetica] font-bold rounded-lg border-2 border-solid border-gray-800 shadow-[3px_3px_0px_#1f2937]" asChild>
              <Link to="/create">Create StartSnap</Link>
            </Button>
          </div>
        )}
      </div>
    </div>
  );
};