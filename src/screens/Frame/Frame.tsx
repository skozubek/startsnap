/**
 * src/screens/Frame/Frame.tsx
 * @description Main application frame component that handles routing and authentication state
 */

import React, { useEffect, useState } from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import { FooterSection } from "./sections/FooterSection/FooterSection";
import { HeaderSection } from "./sections/HeaderSection/HeaderSection";
import { MainContentSection } from "./sections/MainContentSection/MainContentSection";
import { ProjectDetail } from "../ProjectDetail";
import { CreateStartSnap } from "../CreateStartSnap";
import { EditStartSnap } from "../EditStartSnap";
import { Profile } from "../Profile";
import { supabase } from "../../lib/supabase";
import { AuthProvider } from "../../context/AuthContext";

/**
 * @description Main application container that manages routes and auth state
 * @returns {JSX.Element} The application frame with header, content area, and footer
 */
export const Frame = (): JSX.Element => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Check current session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user || null);
      setLoading(false);
    });

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user || null);
    });

    return () => subscription.unsubscribe();
  }, []);

  /**
   * @description Component that protects routes requiring authentication
   * @param {Object} props - Component props
   * @param {React.ReactNode} props.children - Child components to render when authenticated
   * @returns {JSX.Element} The children when authenticated, or a redirect to home
   */
  const ProtectedRoute = ({ children }) => {
    if (loading) return <div className="flex justify-center items-center min-h-screen">Loading...</div>;
    
    if (!user) {
      return <Navigate to="/" replace />;
    }
    
    return children;
  };

  return (
    <div className="flex flex-col min-h-screen w-full bg-startsnap-candlelight">
      <AuthProvider>
        <HeaderSection />
        <div className="flex flex-col w-full min-h-screen overflow-y-auto">
          <Routes>
            <Route path="/" element={<MainContentSection />} />
            <Route path="/project/:id" element={<ProjectDetail />} />
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
      </AuthProvider>
    </div>
  );
};