/**
 * src/screens/Frame/Frame.tsx
 * @description Main application frame component that handles routing and authentication state
 */

import React from "react";
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
import { useState } from "react";

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
 * @description Main application container that manages routes and auth state
 * @returns {JSX.Element} The application frame with header, content area, and footer
 */
export const Frame = (): JSX.Element => {
  const [isPulsePanelOpen, setIsPulsePanelOpen] = useState(false);
  const [hasNewActivity, setHasNewActivity] = useState(false);

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
  const closePulsePanel = () => setIsPulsePanelOpen(false);

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
          onNewActivityDetected={() => setHasNewActivity(true)}
        />
      </AuthProvider>
    </div>
  );
};