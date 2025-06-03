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

    return () => {
      typed.destroy();
    };
  }, []);

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
            This Is How We Vibe
          </h2>

          {/* Text and Image Row */}
          <div className="flex flex-col-reverse md:flex-row gap-12 items-center max-w-6xl mx-auto mb-16">
            <div className="w-full md:w-[60%]">
              <p className="text-lg lg:text-xl text-startsnap-river-bed mb-6 leading-relaxed font-['Roboto',Helvetica]">
                We're running on coffee, AI prompts, and the thrill of making cool stuff — out loud, in real time. Those rough edges? They just mean we're moving fast. Getting real feedback before it's "done" is just smart. That's the Vibe Log story: every wild swing, every small win.
              </p>
              
              <p className="text-lg lg:text-xl text-startsnap-river-bed mb-6 leading-relaxed font-['Roboto',Helvetica]">
                Startsnap.fun is where these stories live. Explore raw projects, find your crew, share your own StartSnap. Build your thing, your way, and show it off!
              </p>
            </div>

            <div className="w-full md:w-[40%] flex-shrink-0">
              <img
                src="https://ik.imagekit.io/craftsnap/startsnap/vibe-coder-aha.png?updatedAt=1748985333023"
                alt="Developer having an aha moment"
                className="w-full h-auto animate-[fade-in_0.5s_ease-in]"
                loading="lazy"
              />
            </div>
          </div>

          {/* Cards Row */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-8 max-w-6xl mx-auto mb-16">
            <div className="bg-startsnap-athens-gray p-6 rounded-lg border-2 border-gray-800 shadow-[3px_3px_0px_#1f2937] hover:translate-x-[-2px] hover:translate-y-[-2px] hover:shadow-[5px_5px_0px_#1f2937] transition-all duration-200">
              <h3 className="text-xl font-bold text-startsnap-ebony-clay mb-4 font-['Space_Grotesk',Helvetica]">
                Why Build in Public?
              </h3>
              <ul className="space-y-4 text-startsnap-river-bed">
                <li className="flex items-start gap-2">
                  <span className="material-icons text-startsnap-french-rose mt-1">rocket_launch</span>
                  <span><strong>Share Fearlessly. No Shame.</strong> Your process? Pure gold. Every stumble, every detour - it's a lesson for the next Vibe Coder.</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="material-icons text-startsnap-french-rose mt-1">forum</span>
                  <span><strong>Feedback is Fuel. The Real Kind.</strong> No sugar-coating here. Get the honest takes that actually help you build better, faster.</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="material-icons text-startsnap-french-rose mt-1">diversity_3</span>
                  <span><strong>Connect & Grow. Your Tribe Awaits.</strong> Ditch the echo chamber. Find your collaborators, your mentors, your future co-founders. They're here.</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="material-icons text-startsnap-french-rose mt-1">auto_awesome</span>
                  <span><strong>Inspire Others. Be the Spark.</strong> Your journey - the grind, the wins, the "what ifs" - it's the kickstart someone else needs. Pass it on.</span>
                </li>
              </ul>
            </div>

            <div className="bg-startsnap-french-pass p-6 rounded-lg border-2 border-gray-800 shadow-[3px_3px_0px_#1f2937] hover:translate-x-[-2px] hover:translate-y-[-2px] hover:shadow-[5px_5px_0px_#1f2937] transition-all duration-200">
              <h3 className="text-xl font-bold text-startsnap-ebony-clay mb-4 font-['Space_Grotesk',Helvetica]">
                How We Support You
              </h3>
              <ul className="space-y-4 text-startsnap-river-bed">
                <li className="flex items-start gap-2">
                  <span className="material-icons text-startsnap-persian-blue mt-1">insights</span>
                  <span><strong>Vibe Log: Your Uncut Journey.</strong> Document it all - the genius prompt, the "why won't this work?!" moment, the late-night breakthroughs. One raw update at a time.</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="material-icons text-startsnap-persian-blue mt-1">groups</span>
                  <span><strong>Community Feedback: Straight Up, No Chaser.</strong> Get real insights from fellow builders. The kind that actually makes your StartSnap better, not just boosts your ego.</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="material-icons text-startsnap-persian-blue mt-1">favorite</span>
                  <span><strong>Project Support: Rally Your Believers.</strong> Let folks show some love for your vision. That support count? It's pure Vibe Coder fuel.</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="material-icons text-startsnap-persian-blue mt-1">work</span>
                  <span><strong>Opportunities: Connect & Conquer.</strong> Ready for what's next? Signal it. Let collaborators, employers, or your next adventure find you right here.</span>
                </li>
              </ul>
            </div>
          </div>

          <div className="text-center">
            <Button asChild className="startsnap-button bg-startsnap-persian-blue text-startsnap-white font-['Roboto',Helvetica] font-bold text-lg rounded-lg border-2 border-solid border-gray-800 shadow-[3px_3px_0px_#1f2937] px-8 py-4">
              <Link to="/create">Start Your Journey</Link>
            </Button>
          </div>
        </div>
      </div>
    </section>
  );
};