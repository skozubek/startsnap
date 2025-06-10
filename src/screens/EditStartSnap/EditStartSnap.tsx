/**
 * src/screens/EditStartSnap/EditStartSnap.tsx
 * @description Component for editing an existing StartSnap project
 */

import React, { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { ProjectForm } from "../../components/ui/project-form";
import { supabase } from "../../lib/supabase";
import { useAuth } from "../../context/AuthContext";
import { generateSlug } from "../../lib/utils";
import { toast } from "sonner";

/**
 * @description Page component for editing an existing StartSnap project
 * @returns {JSX.Element} EditStartSnap page with project form populated with project data
 */
export const EditStartSnap = (): JSX.Element => {
  const navigate = useNavigate();
  const { id } = useParams();
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [initialData, setInitialData] = useState<any>(null);

  useEffect(() => {
    // If no user is authenticated, redirect to home
    if (!user) {
      navigate('/');
      return;
    }

    const fetchData = async () => {
      // Fetch project data
      try {
        const { data, error } = await supabase
          .from('startsnaps')
          .select('*')
          .eq('id', id)
          .single();

        if (error) throw error;

        if (!data) {
          toast.error('Project Not Found', {
            description: 'The requested project could not be found.'
          });
          navigate('/profile');
          return;
        }

        // Verify ownership
        if (data.user_id !== user.id) {
          toast.error('Access Denied', {
            description: 'You do not have permission to edit this project.'
          });
          navigate('/profile');
          return;
        }

        // Transform data to match form state structure
        setInitialData({
          projectType: data.type || 'idea',
          projectName: data.name || '',
          slug: data.slug || '',
          description: data.description || '',
          category: data.category || '',
          liveUrl: data.live_demo_url || '',
          videoUrl: data.demo_video_url || '',
          tagsInput: '',
          tags: data.tags || [],
          isHackathon: data.is_hackathon_entry || false,
          toolsInput: '',
          toolsUsed: data.tools_used || [],
          feedbackInput: '',
          feedbackAreas: data.feedback_tags || [],
          screenshotUrls: data.screenshot_urls || []
        });

        setLoading(false);
      } catch (error) {
        console.error('Error fetching project data:', error);
        toast.error('Loading Error', {
          description: 'Error loading project data. Please try again.'
        });
        navigate('/profile');
      }
    };

    fetchData();
  }, [id, navigate, user]);

  /**
   * @description Handles form submission to update an existing StartSnap
   * @async
   * @param {Object} formData - Form data containing updated project information
   * @param {string[]} imagesToDelete - Array of image URLs to delete from storage
   * @sideEffects Updates StartSnap in database, deletes removed images, and redirects on success
   */
  const handleSubmit = async (formData: any, imagesToDelete: string[] = []) => {
    if (!id || !initialData) {
      console.error("Project ID or initial data is missing for update.");
      toast.error('Update Failed', {
        description: 'Could not update project. Required data is missing.'
      });
      return;
    }

    let slugToSave = initialData.slug;
    let nameChanged = false;

    if (formData.projectName !== initialData.projectName) {
      nameChanged = true;
      let newPotentialSlug = generateSlug(formData.projectName);

      // Check for slug uniqueness only if the name (and thus potential slug) has changed
      try {
        const { data: existingProject, error: checkError } = await supabase
          .from('startsnaps')
          .select('id')
          .eq('slug', newPotentialSlug)
          .not('id', 'eq', id) // Exclude the current project from the check
          .maybeSingle();

        if (checkError) {
          console.error("Error checking slug uniqueness:", checkError);
          toast.error('Validation Error', {
            description: 'Error checking project name uniqueness. Please try again.'
          });
          return;
        }

        if (existingProject) {
          // Slug collision, make it unique by appending a short part of the ID
          newPotentialSlug = `${newPotentialSlug}-${id.substring(0, 6)}`;
        }
        slugToSave = newPotentialSlug;
      } catch (error) {
        console.error("Error during slug uniqueness check:", error);
        toast.error('Unexpected Error', {
          description: 'An unexpected error occurred while validating project name. Please try again.'
        });
        return;
      }
    }

    const updatePayload: any = {
      name: formData.projectName,
      description: formData.description,
      category: formData.category,
      type: formData.projectType,
      live_demo_url: formData.liveUrl,
      demo_video_url: formData.videoUrl,
      tools_used: formData.toolsUsed,
      is_hackathon_entry: formData.isHackathon,
      tags: formData.tags,
      screenshot_urls: formData.screenshotUrls,
      updated_at: new Date()
    };

    if (nameChanged || slugToSave !== initialData.slug) {
      updatePayload.slug = slugToSave;
    }

    try {
      // CRITICAL: Update database FIRST to prevent race condition
      const { error: startsnapError } = await supabase
        .from('startsnaps')
        .update(updatePayload)
        .eq('id', id);

      if (startsnapError) throw startsnapError;

      // Only delete images from storage AFTER database update succeeds
      if (imagesToDelete.length > 0) {
        for (const url of imagesToDelete) {
          try {
            // Extract file path from URL
            const urlParts = url.split('/');
            const fileName = urlParts[urlParts.length - 1];
            const userId = urlParts[urlParts.length - 2];
            const filePath = `${userId}/${fileName}`;

            const { error: deleteError } = await supabase.storage
              .from('project-screenshots')
              .remove([filePath]);

            if (deleteError) {
              console.warn('Error deleting image from storage:', deleteError);
              // Don't fail the save if image deletion fails - database is already updated correctly
            }
          } catch (error) {
            console.warn('Error processing image deletion:', error);
            // Continue with cleanup even if individual image deletion fails
          }
        }
      }

      toast.success('StartSnap Updated Successfully!', {
        description: 'Your changes have been saved and are now live.'
      });
      navigate(`/projects/${slugToSave}`);

    } catch (error) {
      console.error('Error updating StartSnap:', error);
      toast.error('Update Failed', {
        description: 'Failed to update StartSnap. Please try again.'
      });
    }
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
        Edit your StartSnap
      </h2>

      <ProjectForm
        mode="edit"
        projectId={id}
        initialData={initialData}
        onSubmit={handleSubmit}
        onCancel={() => {
          const projectSlug = initialData?.slug || '';
          if (projectSlug) {
            navigate(`/projects/${projectSlug}`);
          } else {
            navigate('/profile');
            console.warn('Could not determine project slug for cancel navigation during edit.');
          }
        }}
      />
    </div>
  );
};