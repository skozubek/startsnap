/**
 * src/screens/CreateStartSnap/CreateStartSnap.tsx
 * @description Component for creating a new StartSnap project
 */

import React, { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { ProjectForm } from "../../components/ui/project-form";
import { supabase } from "../../lib/supabase";
import { useAuth } from "../../context/AuthContext";

/**
 * @description Page component for creating a new StartSnap project
 * @returns {JSX.Element} CreateStartSnap page with project form
 */
export const CreateStartSnap = (): JSX.Element => {
  const navigate = useNavigate();
  const { user } = useAuth();

  // Scroll to top when component mounts
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  /**
   * @description Handles form submission to create a new StartSnap
   * @async
   * @param {Object} formData - Form data containing project information
   * @sideEffects Inserts new StartSnap into database and redirects on success
   */
  const handleSubmit = async (formData: any) => {
    if (!user) {
      alert('You need to be logged in to create a project.');
      return;
    }

    // Insert the startsnap
    const { data: startsnap, error: startsnapError } = await supabase
      .from('startsnaps')
      .insert({
        user_id: user.id,
        name: formData.projectName,
        description: formData.description,
        category: formData.category,
        type: formData.projectType,
        live_demo_url: formData.liveUrl,
        demo_video_url: formData.videoUrl,
        tools_used: formData.toolsUsed,
        feedback_tags: formData.feedbackAreas,
        is_hackathon_entry: formData.isHackathon,
        tags: formData.tags
      })
      .select();

    if (startsnapError) throw startsnapError;

    // Insert the initial vibe log
    if (formData.vibeLogContent.trim()) {
      const { error: vibeLogError } = await supabase
        .from('vibelogs')
        .insert({
          startsnap_id: startsnap[0].id,
          log_type: formData.vibeLogType,
          title: formData.vibeLogTitle,
          content: formData.vibeLogContent
        });

      if (vibeLogError) throw vibeLogError;
    }

    // Redirect to the project detail page
    navigate('/');
    alert('StartSnap created successfully!');
  };

  return (
    <div className="flex flex-col w-full items-center gap-8 pt-8 pb-24 px-8 bg-startsnap-candlelight">
      <h2 className="text-5xl font-bold text-startsnap-ebony-clay text-center font-['Space_Grotesk',Helvetica] leading-[48px]">
        Launch your StartSnap
      </h2>

      <ProjectForm
        mode="create"
        onSubmit={handleSubmit}
        onCancel={() => navigate('/')}
      />
    </div>
  );
};