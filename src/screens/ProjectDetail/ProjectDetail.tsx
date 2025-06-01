/**
 * src/screens/ProjectDetail/ProjectDetail.tsx
 * @description Component for displaying detailed information about a StartSnap project
 */

import React, { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import { Button } from "../../components/ui/button";
import { Badge } from "../../components/ui/badge";
import { Card, CardContent } from "../../components/ui/card";
import { Textarea } from "../../components/ui/textarea";
import { supabase } from "../../lib/supabase";
import { getCategoryDisplay, getVibeLogDisplay } from "../../config/categories";
import { formatDetailedDate } from "../../lib/utils";
import { useAuth } from "../../context/AuthContext";
import { UserAvatar, getAvatarName } from "../../components/ui/user-avatar";

/**
 * @description Page component that displays detailed project information
 * @returns {JSX.Element} Project detail page with project info, vibe log, and feedback
 */
export const ProjectDetail = (): JSX.Element => {
  const { id } = useParams();
  const [loading, setLoading] = useState(true);
  const [startsnap, setStartsnap] = useState<any>(null);
  const [creator, setCreator] = useState<any>(null);
  const [vibeLogEntries, setVibeLogEntries] = useState<any[]>([]);
  const [feedbackEntries, setFeedbackEntries] = useState<any[]>([]);
  const [feedbackContent, setFeedbackContent] = useState("");
  const { user: currentUser } = useAuth();

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  useEffect(() => {
    fetchProjectData();
  }, [id]);

  /**
   * @description Fetches project data, creator profile, and vibe logs from Supabase
   * @async
   * @sideEffects Updates state with fetched project data and related information
   */
  const fetchProjectData = async () => {
    try {
      setLoading(true);

      // Fetch startsnap details
      const { data: projectData, error: projectError } = await supabase
        .from('startsnaps')
        .select('*')
        .eq('id', id)
        .single();

      if (projectError) throw projectError;

      setStartsnap(projectData);

      // Fetch creator profile
      const { data: creatorData, error: creatorError } = await supabase
        .from('profiles')
        .select('*')
        .eq('user_id', projectData.user_id)
        .single();

      if (creatorError && creatorError.code !== 'PGRST116') {
        console.error('Error fetching creator:', creatorError);
      } else {
        setCreator(creatorData);
      }

      // Fetch vibe logs
      const { data: vibeLogsData, error: vibeLogsError } = await supabase
        .from('vibelogs')
        .select('*')
        .eq('startsnap_id', id)
        .order('created_at', { ascending: false });

      if (vibeLogsError) throw vibeLogsError;

      setVibeLogEntries(vibeLogsData || []);

      // For now, use mock feedback entries
      // In a real implementation, you would fetch feedback from a separate table
      setFeedbackEntries([
        {
          username: "AudioGeek_77",
          avatarSrc: "/user-avatar.png",
          date: "July 22, 2024 - 11:15 AM",
          content:
            "Love the concept! The main oscillator section is a bit crowded. Maybe group the waveform selectors differently? The filter sounds amazing though!",
        },
        {
          username: "UX_Wizard",
          avatarSrc: "/user-avatar-1.png",
          date: "July 22, 2024 - 1:05 PM",
          content:
            "Great start! Consider adding tooltips for less common parameters. The color scheme is cool and retro. One minor bug: the LFO rate knob sometimes jumps values.",
        },
      ]);

    } catch (error) {
      console.error('Error fetching project data:', error);
    } finally {
      setLoading(false);
    }
  };

  /**
   * @description Handles feedback submission
   * @sideEffects Shows alert for now (placeholder for actual submission)
   */
  const handleSubmitFeedback = () => {
    if (!feedbackContent.trim()) {
      alert('Please enter some feedback');
      return;
    }

    if (!currentUser) {
      alert('You need to be logged in to submit feedback');
      return;
    }

    // In a real implementation, you would save the feedback to the database
    alert('Feedback submission functionality will be implemented soon!');
    setFeedbackContent('');
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen bg-startsnap-candlelight">
        <p className="text-xl font-bold text-startsnap-ebony-clay">Loading project...</p>
      </div>
    );
  }

  if (!startsnap) {
    return (
      <div className="flex justify-center items-center min-h-screen bg-startsnap-candlelight">
        <p className="text-xl font-bold text-startsnap-ebony-clay">Project not found</p>
      </div>
    );
  }

  const categoryDisplay = getCategoryDisplay(startsnap.category);
  const creatorName = creator?.username || 'Anonymous';
  const creatorInitials = creatorName.substring(0, 2).toUpperCase();
  const isOwner = currentUser && currentUser.id === startsnap.user_id;

  return (
    <div className="flex flex-col w-full items-center gap-16 pt-8 pb-24 px-8 bg-startsnap-candlelight">
      <Card className="max-w-4xl w-full bg-startsnap-white rounded-xl overflow-hidden border-[3px] border-solid border-gray-800 shadow-[5px_5px_0px_#1f2937]">
        <CardContent className="p-0">
          {/* Project Header Section - Category-colored header like cards */}
          <div className={`${categoryDisplay.bgColor} px-8 py-6 border-b-2 border-gray-800`}>
            <div className="flex justify-between items-start gap-6 mb-4">
              {/* Project Title - Hero element */}
              <h1 className={`${categoryDisplay.textColor} font-[var(--startsnap-semantic-heading-3-font-family)] font-black tracking-tight leading-tight flex-1 text-4xl lg:text-5xl`}>
                {startsnap.name}
              </h1>

              {/* Category Badge */}
              <Badge
                variant="outline"
                className={`${categoryDisplay.bgColor} ${categoryDisplay.textColor} border ${categoryDisplay.borderColor} rounded-full px-4 py-2 font-['Space_Mono',Helvetica] font-normal shrink-0 text-sm`}
              >
                {categoryDisplay.name}
              </Badge>
            </div>

            {/* Status badges - now in header */}
            <div className="flex gap-3 flex-wrap">
              {/* Project type badge */}
              {startsnap.type === "live" ? (
                <Badge variant="outline" className="bg-startsnap-mountain-meadow text-white font-['Space_Mono',Helvetica] text-sm rounded-full border border-solid border-green-700 px-3 py-1 flex items-center gap-1">
                  <span className="material-icons text-sm">rocket_launch</span>
                  Live Project
                </Badge>
              ) : (
                <Badge variant="outline" className="bg-startsnap-corn text-startsnap-ebony-clay font-['Space_Mono',Helvetica] text-sm rounded-full border border-solid border-yellow-700 px-3 py-1 flex items-center gap-1">
                  <span className="material-icons text-sm">lightbulb</span>
                  Idea / Concept
                </Badge>
              )}

              {/* Hackathon badge */}
              {startsnap.is_hackathon_entry && (
                <Badge variant="outline" className="bg-startsnap-heliotrope text-white font-['Space_Mono',Helvetica] text-sm rounded-full border border-solid border-purple-700 px-3 py-1 flex items-center gap-1">
                  <span className="material-icons text-sm">emoji_events</span>
                  Hackathon Entry
                </Badge>
              )}
            </div>
          </div>

          {/* Main Content Section - Clean and spacious */}
          <div className="p-8 space-y-8">
            {/* Project Description - Hero treatment */}
            <p className="font-['Roboto',Helvetica] font-normal text-startsnap-river-bed leading-relaxed text-lg">
              {startsnap.description}
            </p>

            {/* Creator info - consistent with cards */}
            <div className="flex items-center pt-6 mt-2 border-t border-gray-200/80">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12">
                  <UserAvatar
                    name={creator?.username || 'Anonymous'}
                    size={48}
                    className="w-full h-full"
                  />
                </div>
                <div className="min-w-0 flex-1">
                  <p className="font-['Roboto',Helvetica] font-semibold text-startsnap-oxford-blue text-base leading-tight tracking-wide">
                    {creatorName}
                  </p>
                  <p className="font-['Inter',Helvetica] font-normal text-startsnap-pale-sky text-sm leading-relaxed mt-0.5">
                    Launched: {new Date(startsnap.created_at).toLocaleDateString()}
                  </p>
                </div>
              </div>
            </div>

            {/* Separated tag sections - improved spacing like cards */}
            <div className="space-y-6">
              {/* General Tags Section */}
              {startsnap.tags && startsnap.tags.length > 0 && (
                <div className="flex items-start gap-3">
                  <span className="material-icons text-startsnap-oxford-blue text-lg mt-1 shrink-0">tag</span>
                  <div className="flex flex-wrap gap-2 flex-1">
                    {startsnap.tags.map((tag: string, idx: number) => (
                      <Badge
                        key={`tag-${idx}`}
                        variant="outline"
                        className="bg-startsnap-athens-gray text-startsnap-ebony-clay font-['Space_Mono',Helvetica] text-sm rounded-full border border-solid border-gray-800 px-3 py-1"
                      >
                        #{tag}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}

              {/* Tools Used Section */}
              {startsnap.tools_used && startsnap.tools_used.length > 0 && (
                <div className="flex items-start gap-3">
                  <span className="material-icons text-startsnap-persian-blue text-lg mt-1 shrink-0">build</span>
                  <div className="flex flex-wrap gap-2 flex-1">
                    {startsnap.tools_used.map((tool: string, idx: number) => (
                      <Badge
                        key={`tool-${idx}`}
                        variant="outline"
                        className="bg-startsnap-french-pass text-startsnap-persian-blue font-['Space_Mono',Helvetica] text-sm rounded-full border border-solid border-blue-700 px-3 py-1"
                      >
                        {tool}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}

              {/* Looking For Feedback Section */}
              {startsnap.feedback_tags && startsnap.feedback_tags.length > 0 && (
                <div className="flex items-start gap-3">
                  <span className="material-icons text-startsnap-jewel text-lg mt-1 shrink-0">forum</span>
                  <div className="flex flex-wrap gap-2 flex-1">
                    {startsnap.feedback_tags.map((feedback: string, idx: number) => (
                      <Badge
                        key={`feedback-${idx}`}
                        variant="outline"
                        className="bg-startsnap-ice-cold text-startsnap-jewel font-['Space_Mono',Helvetica] text-sm rounded-full border border-solid border-green-700 px-3 py-1"
                      >
                        {feedback}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Action buttons */}
            <div className="flex flex-wrap gap-4 pt-4">
              {isOwner ? (
                <>
                  <Button className="startsnap-button bg-startsnap-french-rose text-startsnap-white font-['Roboto',Helvetica] font-bold rounded-lg border-2 border-solid border-gray-800 shadow-[3px_3px_0px_#1f2937] flex items-center gap-2">
                    <span className="material-icons text-xl">add_circle</span>
                    Add Vibe Log Entry
                  </Button>
                  <Button className="startsnap-button bg-startsnap-mischka text-startsnap-ebony-clay font-['Roboto',Helvetica] font-bold rounded-lg border-2 border-solid border-gray-800 shadow-[3px_3px_0px_#1f2937] flex items-center gap-2" asChild>
                    <Link to={`/edit/${startsnap.id}`}>
                      <span className="material-icons text-xl">edit</span>
                      Edit Project
                    </Link>
                  </Button>
                </>
              ) : (
                <>
                  <Button className="startsnap-button bg-startsnap-french-rose text-startsnap-white font-['Roboto',Helvetica] font-bold rounded-lg border-2 border-solid border-gray-800 shadow-[3px_3px_0px_#1f2937] flex items-center gap-2">
                    <span className="material-icons text-xl">thumb_up</span>
                    Support Project
                  </Button>
                  <Button className="startsnap-button bg-startsnap-mountain-meadow text-startsnap-white font-['Roboto',Helvetica] font-bold rounded-lg border-2 border-solid border-gray-800 shadow-[3px_3px_0px_#1f2937] flex items-center gap-2">
                    <span className="material-icons text-xl">forum</span>
                    Give Feedback
                </Button>
                </>
              )}
            </div>

            {/* Links section */}
            {(startsnap.live_demo_url || startsnap.demo_video_url) && (
              <div className="space-y-3 pt-4 border-t border-gray-200/80">
                <h3 className="font-['Space_Grotesk',Helvetica] font-bold text-startsnap-oxford-blue text-lg">
                  Project Links
                </h3>
                <div className="space-y-2">
                  {startsnap.live_demo_url && (
                    <div className="flex items-center">
                      <span className="material-icons text-startsnap-oxford-blue mr-3">public</span>
                      <a href={startsnap.live_demo_url} target="_blank" rel="noopener noreferrer"
                        className="text-startsnap-persian-blue hover:underline font-['Roboto',Helvetica]">
                        Live Demo: {startsnap.live_demo_url}
                      </a>
                    </div>
                  )}
                  {startsnap.demo_video_url && (
                    <div className="flex items-center">
                      <span className="material-icons text-startsnap-oxford-blue mr-3">videocam</span>
                      <a href={startsnap.demo_video_url} target="_blank" rel="noopener noreferrer"
                        className="text-startsnap-persian-blue hover:underline font-['Roboto',Helvetica]">
                        Demo Video: {startsnap.demo_video_url}
                      </a>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>

          {/* Vibe Log Section */}
          <div className="border-b-2 border-gray-800 p-8">
            <div className="flex items-center mb-6">
              <h2 className="font-['Space_Grotesk',Helvetica] font-bold text-startsnap-ebony-clay text-2xl leading-8">
                Vibe Log
              </h2>
              <span className="ml-1 text-startsnap-corn text-2xl material-icons">
                insights
              </span>
            </div>

            {vibeLogEntries.length > 0 ? (
              vibeLogEntries.map((entry: any, index: number) => {
                const logType = entry.log_type || 'update';
                const iconData = getVibeLogDisplay(logType);

                return (
                  <div key={index} className="mb-8 last:mb-0">
                    <div className="flex items-start">
                      <div
                        className={`p-2.5 ${iconData.iconBg} rounded-full border-2 border-solid ${iconData.iconBorder} ${iconData.iconColor} text-3xl flex items-center justify-center`}
                      >
                        <span className="material-icons text-3xl">{iconData.icon}</span>
                      </div>
                      <div className="ml-4">
                        <p className="font-['Inter',Helvetica] font-normal text-startsnap-pale-sky text-xs leading-4">
                          {formatDetailedDate(entry.created_at)}
                        </p>
                        <h3 className="font-['Space_Grotesk',Helvetica] font-bold text-startsnap-oxford-blue text-lg leading-7 mt-1">
                          {entry.title}
                        </h3>
                        <p className="font-['Roboto',Helvetica] font-normal text-startsnap-river-bed text-base leading-6">
                          {entry.content}
                        </p>
                      </div>
                    </div>
                  </div>
                );
              })
            ) : (
              <p className="font-['Roboto',Helvetica] font-normal text-startsnap-pale-sky text-base leading-6">
                No vibe log entries yet. Check back soon for updates!
              </p>
            )}
          </div>

          {/* Community Feedback Section */}
          <div className="p-8">
            <div className="flex items-center mb-6">
              <h2 className="font-['Space_Grotesk',Helvetica] font-bold text-startsnap-ebony-clay text-2xl leading-8">
                Community Feedback
              </h2>
              <span className="ml-1 text-startsnap-mountain-meadow text-2xl material-icons">
                groups
              </span>
            </div>

            {feedbackEntries.map((feedback: any, index: number) => (
              <Card
                key={index}
                className="mb-6 shadow-[0px_2px_4px_-2px_#0000001a,0px_4px_6px_-1px_#0000001a] bg-startsnap-white rounded-xl overflow-hidden border-[3px] border-solid border-gray-800"
              >
                <CardContent className="p-5">
                  <div className="flex items-start">
                    <div className="w-10 h-10">
                      <UserAvatar
                        name={feedback.username}
                        size={40}
                        className="w-full h-full"
                      />
                    </div>
                    <div className="ml-4">
                      <div className="flex items-center">
                        <p className="font-['Roboto',Helvetica] font-semibold text-startsnap-oxford-blue text-base leading-6">
                          {feedback.username}
                        </p>
                        <p className="ml-3 font-['Inter',Helvetica] font-normal text-startsnap-pale-sky text-xs leading-4">
                          {feedback.date}
                        </p>
                      </div>
                      <p className="font-['Roboto',Helvetica] font-normal text-startsnap-river-bed text-base leading-6 mt-1">
                        {feedback.content}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}

            <div className="mt-8">
              <h3 className="font-['Space_Grotesk',Helvetica] font-bold text-startsnap-oxford-blue text-lg leading-7 mb-4">
                Leave Your Feedback
              </h3>
              <Textarea
                placeholder="Share your thoughts, suggestions, or bug reports..."
                className="border-2 border-solid border-gray-800 rounded-lg p-3.5 min-h-[120px] font-['Roboto',Helvetica] text-startsnap-pale-sky mb-4"
                value={feedbackContent}
                onChange={(e) => setFeedbackContent(e.target.value)}
              />
              <Button
                className="startsnap-button bg-startsnap-french-rose text-startsnap-white font-['Roboto',Helvetica] font-bold rounded-lg border-2 border-solid border-gray-800 shadow-[3px_3px_0px_#1f2937]"
                onClick={handleSubmitFeedback}
                disabled={!currentUser}
              >
                {currentUser ? 'Submit Feedback' : 'Login to Submit Feedback'}
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};