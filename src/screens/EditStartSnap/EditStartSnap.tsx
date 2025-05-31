import React, { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { ProjectForm } from "../../components/ui/project-form";
import { supabase } from "../../lib/supabase";

export const EditStartSnap = (): JSX.Element => {
  const navigate = useNavigate();
  const { id } = useParams();
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [initialData, setInitialData] = useState(null);

  useEffect(() => {
    const checkUserAndFetchData = async () => {
      // Get session
      const { data: { session } } = await supabase.auth.getSession();
      if (!session?.user) {
        navigate('/');
        return;
      }
      setUser(session.user);
      
      // Fetch project data
      try {
        const { data, error } = await supabase
          .from('startsnaps')
          .select('*')
          .eq('id', id)
          .single();
        
        if (error) throw error;
        
        if (!data) {
          alert('Project not found');
          navigate('/profile');
          return;
        }
        
        // Verify ownership
        if (data.user_id !== session.user.id) {
          alert('You do not have permission to edit this project');
          navigate('/profile');
          return;
        }
        
        // Transform data to match form state structure
        setInitialData({
          projectType: data.type || 'idea',
          projectName: data.name || '',
          description: data.description || '',
          category: data.category || '',
          liveUrl: data.live_demo_url || '',
          videoUrl: data.demo_video_url || '',
          tagsInput: '',
          tags: data.tags || [],
          isHackathon: data.is_hackathon_entry || false,
          vibeLogType: 'update',
          vibeLogTitle: 'Project Update',
          vibeLogContent: '',
          toolsInput: '',
          toolsUsed: data.tools_used || [],
          feedbackInput: '',
          feedbackAreas: data.feedback_tags || []
        });
        
        setLoading(false);
      } catch (error) {
        console.error('Error fetching project data:', error);
        alert('Error loading project data');
        navigate('/profile');
      }
    };

    checkUserAndFetchData();
  }, [id, navigate]);

  const handleSubmit = async (formData) => {
    // Update the startsnap
    const { error: startsnapError } = await supabase
      .from('startsnaps')
      .update({
        name: formData.projectName,
        description: formData.description,
        category: formData.category,
        type: formData.projectType,
        live_demo_url: formData.liveUrl,
        demo_video_url: formData.videoUrl,
        tools_used: formData.toolsUsed,
        feedback_tags: formData.feedbackAreas,
        is_hackathon_entry: formData.isHackathon,
        tags: formData.tags,
        updated_at: new Date()
      })
      .eq('id', id);

    if (startsnapError) throw startsnapError;

    // Insert a new vibe log if content is provided
    if (formData.vibeLogContent.trim()) {
      const { error: vibeLogError } = await supabase
        .from('vibelogs')
        .insert({
          startsnap_id: id,
          log_type: formData.vibeLogType,
          title: formData.vibeLogTitle,
          content: formData.vibeLogContent
        });

      if (vibeLogError) throw vibeLogError;
    }

    // Redirect to the profile page
    navigate('/profile');
    alert('StartSnap updated successfully!');
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen bg-startsnap-candlelight">
        <p className="text-xl font-bold text-startsnap-ebony-clay">Loading project data...</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col w-full items-center gap-8 pt-8 pb-24 px-8 bg-startsnap-candlelight">
      <h2 className="text-5xl font-bold text-startsnap-ebony-clay text-center font-['Space_Grotesk',Helvetica] leading-[48px]">
        Edit Your Project
      </h2>

      <ProjectForm
        mode="edit"
        projectId={id}
        initialData={initialData}
        onSubmit={handleSubmit}
        onCancel={() => navigate('/profile')}
      />
    </div>
  );
};