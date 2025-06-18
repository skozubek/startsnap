/**
 * src/screens/Frame/Frame.tsx
 * @description Main application frame component that handles routing and authentication state with real-time activity detection
 */

import React, { useState, useEffect } from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import { FooterSection } from "./sections/FooterSection/FooterSection";
import { HeaderSection } from "./sections/HeaderSection/HeaderSection";
import { Subheader } from "../../components/ui/Subheader";
import { MainContentSection } from "./sections/MainContentSection/MainContentSection";
import { Projects } from "../Projects";
import { ProjectDetail } from "../ProjectDetail";
import { CreateStartSnap } from "../CreateStartSnap";
import { EditStartSnap } from "../EditStartSnap";
import { Profile } from "../Profile";
import { PublicProfile } from "../PublicProfile";
import { Profiles } from "../Profiles";
import { Terms } from "../Terms";
import { Privacy } from "../Privacy";
import { AuthProvider, useAuth } from "../../context/AuthContext";
import { ScrollToTop } from "../../components/utils/ScrollToTop";
import { ToastProvider } from "../../components/providers/ToastProvider";
import { PulsePanel } from "../../components/ui/PulsePanel";
import { supabase } from "../../lib/supabase";

/**
 * @description Component that protects routes requiring authentication
 * @param {Object} props - Component props
 * @param {React.ReactNode} props.children - Child components to render when authenticated
 * @returns {JSX.Element} The children when authenticated, or a redirect to home
 */
const ProtectedRoute = ({ children }: { children: React.ReactNode }): JSX.Element => {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <p className="text-xl font-bold text-startsnap-ebony-clay">Loading...</p>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/" replace />;
  }

  return <>{children}</>;
};

/**
 * @description Main application container that manages routes, auth state, and real-time activity detection
 * @returns {JSX.Element} The application frame with header, content area, and footer
 */
export const Frame = (): JSX.Element => {
  const [isPulsePanelOpen, setIsPulsePanelOpen] = useState(false);
  const [hasNewActivity, setHasNewActivity] = useState(false);
  const [latestActivityTimestamp, setLatestActivityTimestamp] = useState<string | null>(null);

  /**
   * @description Sets up real-time subscription to activity_log table for new activity detection
   * @async
   * @sideEffects Creates Supabase realtime subscription and updates activity state
   */
  useEffect(() => {
    // Get initial latest activity timestamp
    const getInitialActivityTimestamp = async () => {
      try {
        const { data, error } = await supabase
          .from('activity_log')
          .select('created_at')
          .eq('visibility', 'public')
          .order('created_at', { ascending: false })
          .limit(1)
          .single();

        if (error && error.code !== 'PGRST116') {
          console.error('Error fetching initial activity timestamp:', error);
          return;
        }

        if (data) {
          setLatestActivityTimestamp(data.created_at);
        }
      } catch (error) {
        console.error('Error in getInitialActivityTimestamp:', error);
      }
    };

    getInitialActivityTimestamp();

    // Set up real-time subscription for new activity
    const subscription = supabase
      .channel('activity_log_changes')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'activity_log',
          filter: 'visibility=eq.public'
        },
        (payload) => {
          console.log('New activity detected:', payload);
          
          if (payload.new && payload.new.created_at) {
            setLatestActivityTimestamp(payload.new.created_at);
            
            // Only trigger pulse animation if panel is closed
            if (!isPulsePanelOpen) {
              setHasNewActivity(true);
            }
          }
        }
      )
      .subscribe((status) => {
        console.log('Activity subscription status:', status);
      });

    // Cleanup subscription on unmount
    return () => {
      subscription.unsubscribe();
    };
  }, [isPulsePanelOpen]);

  /**
   * @description Opens the Community Pulse panel and stops the pulsing effect
   */
  const openPulsePanel = () => {
    setIsPulsePanelOpen(true);
    setHasNewActivity(false); // Stop pulsing when panel is opened
  };

  /**
   * @description Closes the Community Pulse panel
   */
  const closePulsePanel = () => {
    setIsPulsePanelOpen(false);
  };

  return (
    <div className="flex flex-col min-h-screen w-full bg-white">
      <AuthProvider>
        <ToastProvider />
        <ScrollToTop />
        <HeaderSection 
          onPulseButtonClick={openPulsePanel} 
          hasNewActivity={hasNewActivity}
        />
        <Subheader />
        <div className="flex flex-col w-full min-h-screen overflow-y-auto">
          <Routes>
            <Route path="/" element={<MainContentSection />} />
            <Route path="/projects" element={<Projects />} />
            <Route path="/projects/:slug" element={<ProjectDetail />} />
            <Route path="/profiles" element={<Profiles />} />
            <Route path="/profiles/:username" element={<PublicProfile />} />
            <Route path="/terms" element={<Terms />} />
            <Route path="/privacy" element={<Privacy />} />
            <Route
              path="/create"
              element={
                <ProtectedRoute>
                  <CreateStartSnap />
                </ProtectedRoute>
              }
            />
            <Route
              path="/edit/:id"
              element={
                <ProtectedRoute>
                  <EditStartSnap />
                </ProtectedRoute>
              }
            />
            <Route
              path="/profile"
              element={
                <ProtectedRoute>
                  <Profile />
                </ProtectedRoute>
              }
            />
          </Routes>
        </div>
        <FooterSection />
        <PulsePanel 
          isOpen={isPulsePanelOpen} 
          onClose={closePulsePanel}
          latestActivityTimestamp={latestActivityTimestamp}
        />
      </AuthProvider>
    </div>
  );
};