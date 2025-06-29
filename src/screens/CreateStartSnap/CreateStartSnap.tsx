/**
 * src/screens/CreateStartSnap/CreateStartSnap.tsx
 * @description Component for creating a new StartSnap project
 */

import React, { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { ProjectForm } from "../../components/ui/project-form";
import { supabase } from "../../lib/supabase";
import { useAuth } from "../../context/AuthContext";
import { generateSlug } from "../../lib/utils";
import { toast } from "sonner";

/**
 * @description Page component for creating a new StartSnap project
 * @returns {JSX.Element} CreateStartSnap page with project form
 */
export const CreateStartSnap = (): JSX.Element => {
  const navigate = useNavigate();
  const { user } = useAuth();

  /**
   * @description Handles form submission to create a new StartSnap
   * @async
   * @param {Object} formData - Form data containing project information
   * @param {string[]} imagesToDelete - Array of image URLs to delete (unused in create mode)
   * @sideEffects Inserts new StartSnap into database and redirects on success
   */
  const handleSubmit = async (formData: any, imagesToDelete?: string[]) => {
    // Note: imagesToDelete is not used in create mode since images are deleted immediately

    if (!user) {
      toast.error('Authentication Required', {
        description: 'You need to be logged in to create a project.'
      });
      return;
    }

    // 1. Generate the slug from the project name
    const newPotentialSlug = generateSlug(formData.projectName);

    if (!newPotentialSlug) {
      toast.error('Invalid Project Name', {
        description: 'Project name cannot be empty or invalid.'
      });
      return;
    }

    // 2. Check for slug uniqueness
    try {
      const { data: existingProject, error: checkError } = await supabase
        .from('startsnaps')
        .select('slug')
        .eq('slug', newPotentialSlug)
        .maybeSingle();

      if (checkError) {
        console.error("Error checking slug uniqueness:", checkError);
        toast.error('Validation Error', {
          description: 'Error checking project name uniqueness. Please try again.'
        });
        return;
      }

      if (existingProject) {
        toast.error('Name Already Exists', {
          description: 'A project with a similar name already exists. Please try a different name.'
        });
        return;
      }

    } catch (error) {
      console.error("Error during slug uniqueness check:", error);
      toast.error('Unexpected Error', {
        description: 'An unexpected error occurred while validating project name. Please try again.'
      });
      return;
    }

    // 3. Insert the startsnap with the slug and screenshot URLs
    try {
      const { data: startsnap, error: startsnapError } = await supabase
        .from('startsnaps')
        .insert({
          user_id: user.id,
          name: formData.projectName,
          slug: newPotentialSlug,
          description: formData.description,
          category: formData.category,
          type: formData.projectType,
          live_demo_url: formData.liveUrl,
          demo_video_url: formData.videoUrl,
          tools_used: formData.toolsUsed,
          feedback_tags: formData.feedbackAreas,
          is_hackathon_entry: formData.isHackathon,
          tags: formData.tags,
          screenshot_urls: formData.screenshotUrls
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

      // 4. Redirect to the project detail page using the new slug
      if (startsnap && startsnap.length > 0 && startsnap[0].slug) {
        toast.success('StartSnap Created Successfully!', {
          description: 'Your project is now live on startsnap.fun'
        });
        navigate(`/projects/${startsnap[0].slug}`);
      } else {
        // Fallback, though ideally startsnap[0].slug should always exist
        console.error("Failed to get slug from created startsnap:", startsnap);
        toast.warning('StartSnap Created', {
          description: 'Project created but there was an issue with the redirect.'
        });
        navigate('/');
      }
    } catch (error) {
      console.error('Error creating StartSnap:', error);
      toast.error('Creation Failed', {
        description: 'Failed to create StartSnap. Please try again.'
      });
    }
  };

  return (
    <div className="flex flex-col w-full items-center bg-startsnap-candlelight">
      {/* Hero Section with Gradient */}
      <div className="w-full bg-startsnap-candlelight">
        <div className="w-full max-w-screen-xl px-8 py-16 mx-auto">
          <div className="text-center">
            <h2 className="text-5xl font-heading text-startsnap-ebony-clay mb-4 leading-[48px]">
              Launch your StartSnap
            </h2>
                          <p className="text-xl text-startsnap-river-bed font-body mb-8">
              Share your project with the world and get valuable feedback
            </p>
          </div>
        </div>
      </div>

      {/* Dynamic Separator */}
      <div className="w-full bg-startsnap-beige relative">
        <div className="absolute inset-0 bg-[repeating-linear-gradient(45deg,transparent,transparent_10px,rgba(0,0,0,0.03)_10px,rgba(0,0,0,0.03)_20px)]"></div>
        <div className="w-full max-w-screen-xl px-8 py-8 mx-auto relative">
          <div className="flex items-center justify-center">
            <div className="flex-1 h-2 bg-startsnap-french-rose transform -skew-x-12"></div>
            <div className="px-6 py-2 bg-startsnap-ebony-clay text-startsnap-beige font-bold text-sm rounded-full border-2 border-startsnap-french-rose">
              CREATE PROJECT
            </div>
            <div className="flex-1 h-2 bg-startsnap-french-rose transform skew-x-12"></div>
          </div>
        </div>
      </div>

      {/* Form Zone - Clean White Background */}
      <div className="w-full bg-white pb-24 pt-8">
        <div className="flex flex-col w-full items-center px-8">
          <div className="w-full max-w-4xl">
            <ProjectForm
              mode="create"
              onSubmit={handleSubmit}
              onCancel={() => navigate(-1)}
            />
          </div>
        </div>
      </div>
    </div>
  );
};