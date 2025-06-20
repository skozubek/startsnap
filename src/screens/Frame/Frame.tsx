/**
 * src/screens/Frame/Frame.tsx
 * @description Main application frame component that handles routing and authentication state with real-time activity detection
 */

import React, { useState, useEffect, useCallback, useRef } from "react";
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
 * @description Inner frame component that has access to auth context
 * @returns {JSX.Element} The main application content with real-time activity detection
 */
const FrameContent = (): JSX.Element => {
  const [isPulsePanelOpen, setIsPulsePanelOpen] = useState(false);
  const [hasNewActivity, setHasNewActivity] = useState(false);
  const [latestActivityTimestamp, setLatestActivityTimestamp] = useState<string | null>(null);
  const { user } = useAuth(); // Now this is safely inside AuthProvider

  // Use ref to create stable callback reference and prevent infinite subscription loops
  const userRef = useRef(user);
  userRef.current = user;

  /**
   * @description Handles new activity detection with spam prevention and own-activity filtering
   * @param {any} payload - Real-time payload from Supabase
   */
  const handleNewActivity = useCallback((payload: any) => {
    // Filter out own activities
    if (userRef.current && payload.new?.actor_user_id === userRef.current.id) {
      return;
    }

    if (payload.new && payload.new.created_at) {
      setLatestActivityTimestamp(payload.new.created_at);

      // Only trigger pulse animation if panel is closed
      setHasNewActivity(prevHasActivity => {
        const panelElement = document.querySelector('[data-pulse-panel-open="true"]');
        const panelIsClosed = !panelElement;

        if (panelIsClosed) {
          return true;
        } else {
          return prevHasActivity;
        }
      });
    }
  }, []); // Empty dependency array - callback is now stable

  /**
   * @description Sets up real-time subscription to activity_log table for new activity detection
   * @async
   * @sideEffects Creates Supabase realtime subscription and updates activity state
   */
  useEffect(() => {
    let subscription: any = null;

    const setupSubscription = async () => {
      try {
        // Get initial latest activity timestamp
        const { data, error } = await supabase
          .from('activity_log')
          .select('created_at')
          .eq('visibility', 'public')
          .order('created_at', { ascending: false })
          .limit(1)
          .single();

        if (error && error.code !== 'PGRST116') {
          console.error('Error fetching initial activity timestamp:', error);
        } else if (data) {
          setLatestActivityTimestamp(data.created_at);
        }

        // Set up real-time subscription for new activity
        subscription = supabase
          .channel('activity_log_changes')
          .on(
            'postgres_changes',
            {
              event: 'INSERT',
              schema: 'public',
              table: 'activity_log',
              filter: 'visibility=eq.public'
            },
            handleNewActivity
          )
          .subscribe((status, err) => {
            if (err) {
              console.error('❌ Failed to subscribe to activity changes:', err);
            }
          });

      } catch (error) {
        console.error('Error setting up activity subscription:', error);
      }
    };

    setupSubscription();

    // Critical Fix #1: Proper cleanup to prevent memory leaks
    return () => {
      if (subscription) {
        subscription.unsubscribe();
      }
    };
  }, [handleNewActivity]); // Dependency on handleNewActivity ensures proper cleanup

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
    <>
      <HeaderSection
        onPulseButtonClick={openPulsePanel}
        hasNewActivity={hasNewActivity}
      />

      <Subheader />

      {/* Bolt.new Badge - Fixed positioning with responsive behavior */}
      <div className="fixed top-20 left-1/2 transform -translate-x-1/2 z-40 md:top-24 md:right-8 md:left-auto md:transform-none">
        <a 
          href="https://bolt.new/?rid=os72mi" 
          target="_blank" 
          rel="noopener noreferrer" 
          className="block transition-all duration-300 hover:shadow-2xl bolt-badge"
        >
          <img 
            src="https://storage.bolt.army/white_circle_360x360.png" 
            alt="Built with Bolt.new badge" 
            className="w-24 h-24 md:w-32 md:h-32 rounded-full shadow-lg bolt-badge-intro"
            onAnimationEnd={(e) => e.currentTarget.classList.add('animated')}
          />
        </a>
      </div>

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
    </>
  );
};

/**
 * @description Main application container that wraps everything with providers
 * @returns {JSX.Element} The application frame with header, content area, and footer
 */
export const Frame = (): JSX.Element => {
  return (
    <div className="flex flex-col min-h-screen w-full bg-white">
      <AuthProvider>
        <ToastProvider />
        <ScrollToTop />
        <FrameContent />
      </AuthProvider>
    </div>
  );
};