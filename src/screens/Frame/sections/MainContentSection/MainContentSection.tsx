/**
 * src/screens/Frame/sections/MainContentSection/MainContentSection.tsx
 * @description Main content section of the home page with hero section and StartSnap cards
 */

import React, { useState, useEffect, useRef } from "react";
import { Button } from "../../../../components/ui/button";
import { Link } from "react-router-dom";
import { supabase } from "../../../../lib/supabase";
import { StartSnapCard } from "../../../../components/ui/StartSnapCard";
import Typed from 'typed.js';

/**
 * @description Renders the main content of the home page including hero section and StartSnap cards
 * @returns {JSX.Element} Main content section with hero and StartSnap cards
 */
export const MainContentSection = (): JSX.Element => {
  const [startSnaps, setStartSnaps] = useState([]);
  const [loading, setLoading] = useState(true);
  const [creators, setCreators] = useState({});
  const typedRef = useRef(null);

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

      // Fetch startsnaps
      const { data, error } = await supabase
        .from('startsnaps')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(6);

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

        const creatorsMap = {};
        profilesData.forEach(profile => {
          creatorsMap[profile.user_id] = profile.username;
        });

        setCreators(creatorsMap);
      }
    } catch (error) {
      console.error('Error fetching startsnaps:', error);
    } finally {
      setLoading(false);
    }
  };

  // Category to color mapping
  const categoryColorMap = {
    tech: {
      name: "Tech",
      bgColor: "bg-blue-200",
      textColor: "text-blue-700",
      borderColor: "border-blue-700",
    },
    gaming: {
      name: "Gaming",
      bgColor: "bg-startsnap-ice-cold",
      textColor: "text-startsnap-jewel",
      borderColor: "border-green-700",
    },
    community: {
      name: "Community",
      bgColor: "bg-startsnap-french-pass",
      textColor: "text-startsnap-persian-blue",
      borderColor: "border-blue-700",
    },
    music: {
      name: "Music Tech",
      bgColor: "bg-purple-200",
      textColor: "text-startsnap-purple-heart",
      borderColor: "border-purple-700",
    },
    design: {
      name: "Design",
      bgColor: "bg-pink-200",
      textColor: "text-pink-700",
      borderColor: "border-pink-700",
    },
    education: {
      name: "Education",
      bgColor: "bg-yellow-200",
      textColor: "text-yellow-700",
      borderColor: "border-yellow-700",
    },
    productivity: {
      name: "Productivity",
      bgColor: "bg-orange-200",
      textColor: "text-orange-700",
      borderColor: "border-orange-700",
    },
    other: {
      name: "Other",
      bgColor: "bg-gray-200",
      textColor: "text-gray-700",
      borderColor: "border-gray-700",
    },
  };

  /**
   * @description Returns the display information for a given category
   * @param {string} category - The category identifier
   * @returns {Object} Display information including name, colors, etc.
   */
  const getCategoryDisplay = (category) => {
    return categoryColorMap[category] || categoryColorMap.other;
  };

  /**
   * @description Formats a date string into a human-readable relative time
   * @param {string} dateString - ISO date string to format
   * @returns {string} Formatted relative time string (e.g., "Today", "2 days ago")
   */
  const formatDate = (dateString) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInDays = Math.floor((now - date) / (1000 * 60 * 60 * 24));

    if (diffInDays === 0) {
      return "Launched: Today";
    } else if (diffInDays === 1) {
      return "Launched: Yesterday";
    } else if (diffInDays < 7) {
      return `Launched: ${diffInDays} days ago`;
    } else if (diffInDays < 30) {
      const weeks = Math.floor(diffInDays / 7);
      return `Launched: ${weeks} ${weeks === 1 ? 'week' : 'weeks'} ago`;
    } else {
      return `Launched: ${date.toLocaleDateString()}`;
    }
  };

  return (
    <section className="flex flex-col w-full items-center bg-startsnap-candlelight">
      {/* Hero Section */}
      <div className="w-full bg-[--startsnap-beige]">
        <div className="max-w-screen-2xl mx-auto px-8 py-24 flex items-center">
          <div className="w-[60%] pr-16">
            <h1 className="text-6xl font-bold text-startsnap-ebony-clay mb-6 font-['Space_Grotesk',Helvetica] leading-tight">
              We're Vibe Coding,<br />
              We Build <span ref={typedRef}></span>
            </h1>
            <p className="text-xl text-startsnap-river-bed mb-8 font-['Roboto',Helvetica] leading-relaxed">
              Vibe Coders! Showcase your journey, build in public, get real feedback, and find your creative tribe here
            </p>
            <Button className="startsnap-button bg-startsnap-french-rose text-startsnap-white font-['Roboto',Helvetica] font-bold text-lg px-8 py-6 rounded-lg border-2 border-solid border-gray-800 shadow-[3px_3px_0px_#1f2937]">
              Start Building Today
            </Button>
          </div>
          <div className="w-[40%]">
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