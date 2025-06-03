/**
 * src/screens/Frame/sections/MainContentSection/MainContentSection.tsx
 * @description Main content section of the home page with hero section and StartSnap cards
 */

import React, { useState, useEffect, useRef } from "react";
import { Button } from "../../../../components/ui/button";
import { Link } from "react-router-dom";
import { supabase } from "../../../../lib/supabase";
import { StartSnapCard } from "../../../../components/ui/StartSnapCard";
import { getCategoryDisplay } from "../../../../config/categories";
import { formatDate } from "../../../../lib/utils";
import Typed from 'typed.js';

/**
 * @description Type definition for StartSnap project data
 */
interface StartSnapType {
  id: string;
  name: string;
  description: string;
  category: string;
  type: "live" | "idea";
  is_hackathon_entry?: boolean;
  tags?: string[];
  tools_used?: string[];
  created_at: string;
  user_id: string;
}

/**
 * @description Type definition for creators mapping object
 */
interface CreatorsMap {
  [userId: string]: string;
}

/**
 * @description Renders the main content of the home page including hero section and StartSnap cards
 * @returns {JSX.Element} Main content section with hero and StartSnap cards
 */
export const MainContentSection = (): JSX.Element => {
  const [startSnaps, setStartSnaps] = useState<StartSnapType[]>([]);
  const [loading, setLoading] = useState(true);
  const [creators, setCreators] = useState<CreatorsMap>({});
  const typedRef = useRef(null);
  const [sortBy, setSortBy] = useState<'newest' | 'supported'>('newest');

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

  useEffect(() => {
    fetchStartSnaps();
  }, []);

  /**
   * @description Fetches StartSnap projects and their creator information from Supabase
   * @async
   * @sideEffects Updates state with fetched data
   */
  const fetchStartSnaps = async () => {
    try {
      setLoading(true);

      const { data, error } = await supabase
        .from('startsnaps')
        .select('*, profiles(username)')
        .order(sortBy === 'supported' ? 'support_count' : 'created_at', { ascending: sortBy === 'supported' ? false : false })
        .limit(6);

      if (error) throw error;
      
      // Transform the data to match the expected format
      const transformedData = data?.map(snap => ({
        ...snap,
        username: snap.profiles?.username
      })) || [];
      
      setStartSnaps(transformedData);
      
      // Create creators map from the joined data
      const creatorsMap = data?.reduce((acc, snap) => ({
        ...acc,
        [snap.user_id]: snap.profiles?.username || 'Anonymous'
      }), {});
      
      setCreators(creatorsMap || {});
    } catch (error) {
      console.error('Error fetching startsnaps:', error);
    } finally {
      setLoading(false);
    }
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
            <Button className="startsnap-button bg-startsnap-french-rose text-startsnap-white font-['Roboto',Helvetica] font-bold text-base sm:text-lg px-6 sm:px-8 py-4 sm:py-6 rounded-lg border-2 border-solid border-gray-800 shadow-[3px_3px_0px_#1f2937]">
              Start Building Today
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
        <h2 className="text-5xl font-bold text-startsnap-ebony-clay text-center mb-20 font-['Space_Grotesk',Helvetica]">
          StartSnaps
        </h2>
        
        <div className="flex justify-end mb-6">
          <div className="flex gap-4">
            <Button
              onClick={() => {
                setSortBy('newest');
                fetchStartSnaps();
              }}
              className={`startsnap-button font-['Roboto',Helvetica] font-bold rounded-lg border-2 border-solid border-gray-800 shadow-[2px_2px_0px_#1f2937] py-2 px-4 text-sm ${
                sortBy === 'newest'
                  ? 'bg-startsnap-french-rose text-startsnap-white'
                  : 'bg-gray-200 text-startsnap-ebony-clay'
              }`}
            >
              <span className="material-icons text-sm mr-1">schedule</span>
              Newest
            </Button>
            <Button
              onClick={() => {
                setSortBy('supported');
                fetchStartSnaps();
              }}
              className={`startsnap-button font-['Roboto',Helvetica] font-bold rounded-lg border-2 border-solid border-gray-800 shadow-[2px_2px_0px_#1f2937] py-2 px-4 text-sm ${
                sortBy === 'supported'
                  ? 'bg-startsnap-french-rose text-startsnap-white'
                  : 'bg-gray-200 text-startsnap-ebony-clay'
              }`}
            >
              <span className="material-icons text-sm mr-1">favorite</span>
              Most Supported
            </Button>
          </div>
        </div>

        {loading ? (
          <div className="text-center py-20">
            <p className="text-xl text-startsnap-pale-sky">Loading projects...</p>
          </div>
        ) : startSnaps.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {startSnaps.map((startsnap) => {
              const creatorName = creators[startsnap.user_id] || 'Anonymous';
              const creatorInitials = creatorName.substring(0, 2).toUpperCase();

              return (
                <StartSnapCard
                  key={startsnap.id}
                  startsnap={startsnap}
                  showCreator={true}
                  creatorName={creatorName}
                  creatorInitials={creatorInitials}
                  variant="main-page"
                  isOwner={false}
                  formatDate={formatDate}
                  getCategoryDisplay={getCategoryDisplay}
                  thumbnailStyle="minimalist"
                />
              );
            })}
          </div>
        ) : (
          <div className="text-center py-20">
            <p className="text-xl text-startsnap-pale-sky">No projects found. Be the first to share your idea!</p>
            <Button className="startsnap-button mt-4 bg-startsnap-french-rose text-startsnap-white font-['Roboto',Helvetica] font-bold rounded-lg border-2 border-solid border-gray-800 shadow-[3px_3px_0px_#1f2937]" asChild>
              <Link to="/create">Create StartSnap</Link>
            </Button>
          </div>
        )}
      </div>
    </section>
  );
};