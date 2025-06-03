/**
 * src/screens/Frame/sections/MainContentSection/MainContentSection.tsx
 * @description Main content section of the home page with hero section and StartSnap cards
 */

import React, { useState, useEffect, useRef, useCallback } from "react";
import { Button } from "../../../../components/ui/button";
import { Link } from "react-router-dom";
import { supabase } from "../../../../lib/supabase";
import { StartSnapCard } from "../../../../components/ui/StartSnapCard";
import { SearchAndFilterBar } from "../../../../components/ui/SearchAndFilterBar";
import { CATEGORY_CONFIG } from "../../../../config/categories";
import { getCategoryDisplay } from "../../../../config/categories";
import { formatDate } from "../../../../lib/utils";
import Typed from 'typed.js';
import type { ProjectDiscoveryState, FilterOptions, SortOption } from "../../../../types/projectDiscovery";
import type { StartSnapProject } from "../../../../types/startsnap";
import type { UserProfileData } from "../../../../types/user";

const DEFAULT_DISCOVERY_STATE: ProjectDiscoveryState = {
  searchTerm: '',
  filters: { type: 'all' },
  sort: { field: 'created_at', direction: 'desc' },
};

const categoryOptions = Object.values(CATEGORY_CONFIG).map(config => config.label);

/**
 * @description Renders the main content of the home page including hero section and StartSnap cards
 * @returns {JSX.Element} Main content section with hero and StartSnap cards
 */
export const MainContentSection = (): JSX.Element => {
  const [startSnaps, setStartSnaps] = useState<StartSnapProject[]>([]);
  const [loading, setLoading] = useState(true);
  const [creators, setCreators] = useState<Record<UserProfileData['user_id'], UserProfileData['username']>>({});
  const typedRef = useRef(null);
  const [discoveryState, setDiscoveryState] = useState<ProjectDiscoveryState>(DEFAULT_DISCOVERY_STATE);

  useEffect(() => {
    // Initialize Typed.js
    const typed = new Typed(typedRef.current, {
      strings: ['Startups^1000', 'Start<del class="text-gray-400 text-[0.9em] font-normal">ups</del>snaps'],
      typeSpeed: 50,
      backSpeed: 50,
      startDelay: 500,
      showCursor: true,
      cursorChar: '|',
      autoInsertCss: true,
      loop: false
    });

    // Cleanup
    return () => {
      typed.destroy();
    };
  }, []);

  /**
   * @description Fetches StartSnap projects and their creator information from Supabase
   * based on current discovery state (search, filter, sort).
   * @async
   * @param {ProjectDiscoveryState} currentDiscoveryState - The current parameters for discovery.
   * @sideEffects Updates state with fetched data
   */
  const fetchStartSnaps = useCallback(async (currentDiscoveryState: ProjectDiscoveryState) => {
    try {
      setLoading(true);
      let query = supabase
        .from('startsnaps')
        .select('*, support_count');

      // Apply search term
      if (currentDiscoveryState.searchTerm) {
        const searchTerm = `%${currentDiscoveryState.searchTerm}%`;
        query = query.or(
          `name.ilike.${searchTerm},description.ilike.${searchTerm},tags.cs.{${currentDiscoveryState.searchTerm}},tools_used.cs.{${currentDiscoveryState.searchTerm}}`
        );
      }

      // Apply filters
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

      // Apply sorting
      query = query.order(currentDiscoveryState.sort.field, { ascending: currentDiscoveryState.sort.direction === 'asc' });
      if (currentDiscoveryState.sort.field !== 'created_at') {
          query = query.order('created_at', { ascending: false });
      }

      query = query.limit(12);

      const { data, error } = await query;

      if (error) throw error;

      setStartSnaps(data || []);

      // Fetch creators information
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
    <section className="flex flex-col w-full items-center bg-startsnap-candlelight">
      {/* Hero Section */}
      <div className="w-full bg-[--startsnap-beige]">
        <div className="max-w-screen-2xl mx-auto px-4 sm:px-6 lg:px-8 py-12 md:py-16 lg:py-24 flex flex-col md:flex-row items-center">
          <div className="w-full md:w-[60%] md:pr-8 lg:pr-16 mb-8 md:mb-0 text-center md:text-left">
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-startsnap-ebony-clay mb-4 sm:mb-6 font-['Space_Grotesk',Helvetica] leading-tight">
              We're Vibe Coders,<br />
              We Build <span ref={typedRef}></span>
            </h1>
            <p className="text-base sm:text-lg lg:text-xl text-startsnap-river-bed mb-6 sm:mb-8 font-['Roboto',Helvetica] leading-relaxed">
              Showcase your journey, build in public, get real feedback, and connect with opportunities
            </p>
            <Button asChild className="startsnap-button bg-startsnap-french-rose text-startsnap-white font-['Roboto',Helvetica] font-bold text-base sm:text-lg px-6 sm:px-8 py-4 sm:py-6 rounded-lg border-2 border-solid border-gray-800 shadow-[3px_3px_0px_#1f2937]">
              <Link to="/projects">Browse Projects</Link>
            </Button>
          </div>
          <div className="w-[80%] sm:w-[60%] md:w-[40%] mx-auto md:mx-0">
            <img
              src="https://ik.imagekit.io/craftsnap/startsnap/vibe-coder.png"
              alt="Collaborative team working together"
              className="w-full h-auto"
            />
          </div>
        </div>
      </div>

      {/* StartSnaps Cards Section */}
      <div className="w-full max-w-screen-2xl px-8 py-16">
        <h2 className="text-5xl font-bold text-startsnap-ebony-clay text-center mb-12 font-['Space_Grotesk',Helvetica]">
          Featured StartSnaps
        </h2>

        {loading ? (
          <div className="text-center py-20">
            <p className="text-xl text-startsnap-pale-sky">Loading projects...</p>
          </div>
        ) : startSnaps.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {startSnaps.slice(0, 3).map((startsnap) => {
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
        ) : (
          <div className="text-center py-20">
            <p className="text-xl text-startsnap-pale-sky">No projects match your criteria. Try adjusting your search or filters!</p>
            <Button className="startsnap-button mt-4 bg-startsnap-french-rose text-startsnap-white font-['Roboto',Helvetica] font-bold rounded-lg border-2 border-solid border-gray-800 shadow-[3px_3px_0px_#1f2937]" asChild>
              <Link to="/create">Create StartSnap</Link>
            </Button>
          </div>
        )}
      </div>

      {/* Build in Public Manifesto Section */}
      <div className="w-full bg-startsnap-white border-t-2 border-b-2 border-gray-800">
        <div className="max-w-screen-2xl mx-auto px-8 py-16 lg:py-24">
          <h2 className="text-4xl lg:text-5xl font-bold text-startsnap-ebony-clay text-center mb-12 font-['Space_Grotesk',Helvetica] leading-tight">
            The Vibe Coder's Way:<br />Build, Share, Learn - In Public.
          </h2>

          <div className="flex flex-col md:flex-row gap-12 items-center max-w-6xl mx-auto mb-16">
            <div className="w-full md:w-[40%] flex-shrink-0">
              <img
                src="https://ik.imagekit.io/craftsnap/startsnap/vibe-coder-aha.png?updatedAt=1748985333023"
                alt="Developer having an aha moment"
                className="w-full h-auto rounded-lg border-2 border-gray-800 shadow-[5px_5px_0px_#1f2937] animate-[fade-in_0.5s_ease-in]"
                loading="lazy"
              />
            </div>

            <div className="w-full md:w-[60%]">
              <p className="text-lg lg:text-xl text-startsnap-river-bed mb-6 leading-relaxed font-['Roboto',Helvetica]">
                At startsnap.fun, we believe in the power of transparency and shared learning. Building in public isn't just a trend; it's a mindset. It's about showcasing your process, warts and all, inviting feedback early, and growing with your community.
              </p>
              
              <p className="text-lg lg:text-xl text-startsnap-river-bed mb-12 leading-relaxed font-['Roboto',Helvetica]">
                Your Vibe Log is your space to do just that. Document your breakthroughs, your roadblocks, your 'aha!' moments. Let others learn from your journey, and find collaborators and supporters who resonate with your vision.
              </p>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-8">
                <div className="bg-startsnap-athens-gray p-6 rounded-lg border-2 border-gray-800 shadow-[3px_3px_0px_#1f2937] hover:translate-x-[-2px] hover:translate-y-[-2px] hover:shadow-[5px_5px_0px_#1f2937] transition-all duration-200">
                  <h3 className="text-xl font-bold text-startsnap-ebony-clay mb-4 font-['Space_Grotesk',Helvetica]">
                    Why Build in Public?
                  </h3>
                  <ul className="space-y-3 text-startsnap-river-bed">
                    <li className="flex items-start gap-2">
                      <span className="material-icons text-startsnap-french-rose mt-1">rocket_launch</span>
                      <span><strong>Share Fearlessly:</strong> Your process has value, even the messy parts.</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="material-icons text-startsnap-french-rose mt-1">forum</span>
                      <span><strong>Feedback is Fuel:</strong> Iterate faster with community insights.</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="material-icons text-startsnap-french-rose mt-1">diversity_3</span>
                      <span><strong>Connect & Grow:</strong> Find your tribe and collaborators.</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="material-icons text-startsnap-french-rose mt-1">auto_awesome</span>
                      <span><strong>Inspire Others:</strong> Your journey can spark the next big idea.</span>
                    </li>
                  </ul>
                </div>

                <div className="bg-startsnap-french-pass p-6 rounded-lg border-2 border-gray-800 shadow-[3px_3px_0px_#1f2937] hover:translate-x-[-2px] hover:translate-y-[-2px] hover:shadow-[5px_5px_0px_#1f2937] transition-all duration-200">
                  <h3 className="text-xl font-bold text-startsnap-ebony-clay mb-4 font-['Space_Grotesk',Helvetica]">
                    How We Support You
                  </h3>
                  <ul className="space-y-3 text-startsnap-river-bed">
                    <li className="flex items-start gap-2">
                      <span className="material-icons text-startsnap-persian-blue mt-1">insights</span>
                      <span><strong>Vibe Log:</strong> Document your journey, one update at a time.</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="material-icons text-startsnap-persian-blue mt-1">groups</span>
                      <span><strong>Community Feedback:</strong> Get constructive input from fellow builders.</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="material-icons text-startsnap-persian-blue mt-1">favorite</span>
                      <span><strong>Project Support:</strong> Gain supporters who believe in your vision.</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="material-icons text-startsnap-persian-blue mt-1">work</span>
                      <span><strong>Opportunities:</strong> Connect with potential collaborators and employers.</span>
                    </li>
                  </ul>
                </div>
              </div>
            </div>
          </div>

          <div className="text-center">
            <Button asChild className="startsnap-button bg-startsnap-persian-blue text-startsnap-white font-['Roboto',Helvetica] font-bold text-lg rounded-lg border-2 border-solid border-gray-800 shadow-[3px_3px_0px_#1f2937] px-8 py-4">
              <Link to="/create">Start Your Build Journey</Link>
            </Button>

            <p className="text-sm text-startsnap-pale-sky mt-8 font-['Roboto',Helvetica]">
              Inspired by the global #buildinpublic movement. Join vibrant communities like{' '}
              <a href="https://twitter.com/buildinpublic" target="_blank" rel="noopener noreferrer" className="text-startsnap-french-rose hover:underline">
                #buildinpublic on X
              </a>
              {' '}and the{' '}
              <a href="https://bolt.new" target="_blank" rel="noopener noreferrer" className="text-startsnap-french-rose hover:underline">
                Bolt.new community
              </a>.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
};