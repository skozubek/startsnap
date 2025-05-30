import React, { useEffect, useState } from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import { FooterSection } from "./sections/FooterSection/FooterSection";
import { HeaderSection } from "./sections/HeaderSection/HeaderSection";
import { MainContentSection } from "./sections/MainContentSection/MainContentSection";
import { ProjectDetail } from "../ProjectDetail";
import { CreateStartSnap } from "../CreateStartSnap";
import { supabase } from "../../lib/supabase";

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

  // Protected route component
  const ProtectedRoute = ({ children }) => {
    if (loading) return <div className="flex justify-center items-center min-h-screen">Loading...</div>;
    
    if (!user) {
      return <Navigate to="/" replace />;
    }
    
    return children;
  };

  return (
    <div className="flex flex-col min-h-screen w-full bg-startsnap-candlelight">
      <HeaderSection />
      <div className="flex flex-col w-full min-h-screen overflow-y-auto">
        <Routes>
          <Route path="/" element={<MainContentSection />} />
          <Route path="/project/quantum-leap-synthesizer" element={<ProjectDetail />} />
          <Route 
            path="/create" 
            element={
              <ProtectedRoute>
                <CreateStartSnap />
              </ProtectedRoute>
            } 
          />
        </Routes>
      </div>
      <FooterSection />
    </div>
  );
};