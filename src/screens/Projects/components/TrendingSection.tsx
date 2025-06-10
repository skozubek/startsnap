/**
 * src/screens/Projects/components/TrendingSection.tsx
 * @description Component for displaying the top 3 trending StartSnap projects based on support count
 */

import React, { useState, useEffect } from "react";
import { supabase } from "../../../lib/supabase";
import { StartSnapCard } from "../../../components/ui/StartSnapCard";
import { getCategoryDisplay } from "../../../config/categories";
import { formatDate } from "../../../lib/utils";
import type { StartSnapProject } from "../../../types/startsnap";
import type { UserProfileData } from "../../../types/user";

/**
 * @description Component that fetches and displays the top 3 trending projects by support count
 * @returns {JSX.Element} Trending section with top 3 projects in a grid layout
 */
export const TrendingSection = (): JSX.Element => {
  const [trendingProjects, setTrendingProjects] = useState<StartSnapProject[]>([]);
  const [loading, setLoading] = useState(true);
  const [creators, setCreators] = useState<Record<UserProfileData['user_id'], UserProfileData['username']>>({});

  useEffect(() => {
    /**
     * @description Fetches the top 3 projects by support count and their creators' usernames
     * @async
     * @sideEffects Updates trendingProjects and creators state
     */
    const fetchTrendingProjects = async () => {
      try {
        setLoading(true);

        // Fetch top 3 projects by support count
        const { data: projectsData, error: projectsError } = await supabase
          .from('startsnaps')
          .select('*, support_count, screenshot_urls')
          .order('support_count', { ascending: false })
          .limit(3);

        if (projectsError) throw projectsError;

        setTrendingProjects(projectsData || []);

        // Fetch creators' usernames if we have projects
        if (projectsData && projectsData.length > 0) {
          const userIds = [...new Set(projectsData.map(project => project.user_id))];
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
        console.error('Error fetching trending projects:', error);
        setTrendingProjects([]);
        setCreators({});
      } finally {
        setLoading(false);
      }
    };

    fetchTrendingProjects();
  }, []);

  if (loading) {
    return (
      <div className="text-center py-8">
        <p className="text-lg text-startsnap-pale-sky">Loading trending projects...</p>
      </div>
    );
  }

  if (trendingProjects.length === 0) {
    return (
      <div className="text-center py-8">
        <p className="text-lg text-startsnap-pale-sky">No trending projects yet.</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
      {trendingProjects.map((project, index) => {
        const creatorName = creators[project.user_id] || 'Anonymous';
        const rank = index + 1; // 1, 2, 3

        return (
          <StartSnapCard
            key={project.id}
            startsnap={project}
            showCreator={true}
            creatorName={creatorName}
            variant="main-page"
            formatDate={formatDate}
            getCategoryDisplay={getCategoryDisplay}
            rank={rank}
          />
        );
      })}
    </div>
  );
};