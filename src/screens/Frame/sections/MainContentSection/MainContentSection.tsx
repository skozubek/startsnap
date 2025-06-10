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
import type { ProjectDiscoveryState, FilterOptions, SortOption } from "../../../../types/projectDiscovery";
import type { StartSnapProject } from "../../../../types/startsnap";
import type { UserProfileData } from "../../../../types/user";
import { HeroSection } from "./components/HeroSection";
import { FeaturedStartSnapsSection } from "./components/FeaturedStartSnapsSection";
import { BuildInPublicManifestoSection } from "./components/BuildInPublicManifestoSection";
import { PlatformShowcaseSection } from "./components/PlatformShowcaseSection";

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
  const [discoveryState, setDiscoveryState] = useState<ProjectDiscoveryState>(DEFAULT_DISCOVERY_STATE);
  const [platformStartSnap, setPlatformStartSnap] = useState<StartSnapProject | null>(null);
  const [platformCreator, setPlatformCreator] = useState<string>('Vibe Coder Team');
  const [loadingPlatformData, setLoadingPlatformData] = useState(true);

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
    fetchStartSnaps(discoveryState);
    fetchPlatformStartSnap();
  }, [discoveryState, fetchStartSnaps, fetchPlatformStartSnap]);

  const handleDiscoveryChange = (newDiscoveryState: ProjectDiscoveryState) => {
    setDiscoveryState(newDiscoveryState);
  };

  return (
    <section className="flex flex-col w-full items-center bg-startsnap-candlelight">
      {/* Hero Section */}
      <HeroSection />

      {/* StartSnaps Cards Section */}
      <FeaturedStartSnapsSection
        loading={loading}
        startSnaps={startSnaps}
        creators={creators}
        formatDate={formatDate}
        getCategoryDisplay={getCategoryDisplay}
      />

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