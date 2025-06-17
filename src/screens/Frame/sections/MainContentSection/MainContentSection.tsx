/**
 * src/screens/Frame/sections/MainContentSection/MainContentSection.tsx
 * @description Main content section of the home page with hero section and StartSnap cards
 */

import React, { useState, useEffect, useCallback } from "react";
import { Button } from "../../../../components/ui/button";
import { Link } from "react-router-dom";
import { supabase } from "../../../../lib/supabase";
import { StartSnapCard } from "../../../../components/ui/StartSnapCard";
import { SearchAndFilterBar } from "../../../../components/ui/SearchAndFilterBar";
import { CATEGORY_CONFIG } from "../../../../config/categories";
import { getCategoryDisplay } from "../../../../config/categories";
import { formatDate } from "../../../../lib/utils";
import type { FilterOptions, SortOption } from "../../../../types/projectDiscovery";
import type { StartSnapProject } from "../../../../types/startsnap";
import type { UserProfileData } from "../../../../types/user";
import { HeroSection } from "./components/HeroSection";
import { BuildInPublicManifestoSection } from "./components/BuildInPublicManifestoSection";
import { PlatformShowcaseSection } from "./components/PlatformShowcaseSection";
import { ActivityFeedSection } from "../../../../components/ui/ActivityFeedSection";

const categoryOptions = Object.values(CATEGORY_CONFIG).map(config => config.label);

/**
 * @description Renders the main content of the home page including hero section and StartSnap cards
 * @returns {JSX.Element} Main content section with hero and StartSnap cards
 */
export const MainContentSection = (): JSX.Element => {
  const [platformStartSnap, setPlatformStartSnap] = useState<StartSnapProject | null>(null);
  const [platformCreator, setPlatformCreator] = useState<string>('Vibe Coder Team');
  const [loadingPlatformData, setLoadingPlatformData] = useState(true);


  /**
   * @description Fetches the platform's own StartSnap project
   * @async
   * @sideEffects Updates platformStartSnap, platformCreator, and loadingPlatformData state
   */
  const fetchPlatformStartSnap = useCallback(async () => {
    try {
      setLoadingPlatformData(true);
      const platformId = "09d44a11-959b-43a2-b57f-8b2c5e591e5f";

      const { data, error } = await supabase
        .from('startsnaps')
        .select('*, support_count, screenshot_urls')
        .eq('id', platformId)
        .single();

      if (error) throw error;

      setPlatformStartSnap(data);

      // Fetch creator info if needed
      if (data) {
        const { data: creatorData, error: creatorError } = await supabase
          .from('profiles')
          .select('username')
          .eq('user_id', data.user_id)
          .single();

        if (creatorError && creatorError.code !== 'PGRST116') {
          console.error('Error fetching platform creator:', creatorError);
        } else if (creatorData) {
          setPlatformCreator(creatorData.username);
        }
      }
    } catch (error) {
      console.error('Error fetching platform startsnap:', error);
    } finally {
      setLoadingPlatformData(false);
    }
  }, []);

  useEffect(() => {
    fetchPlatformStartSnap();
  }, [fetchPlatformStartSnap]);

  return (
    <section className="flex flex-col w-full items-center bg-startsnap-candlelight">
      {/* Hero Section */}
      <HeroSection />

      {/* Community Pulse Activity Feed */}
      <ActivityFeedSection />

      {/* Build in Public Manifesto Section */}
      <BuildInPublicManifestoSection />

      {/* startsnap.fun Platform Showcase Section */}
      <PlatformShowcaseSection
        loadingPlatformData={loadingPlatformData}
        platformStartSnap={platformStartSnap}
        platformCreator={platformCreator}
        formatDate={formatDate}
        getCategoryDisplay={getCategoryDisplay}
      />
    </section>
  );
};