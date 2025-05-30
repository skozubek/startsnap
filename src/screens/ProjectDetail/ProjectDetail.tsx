import React, { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import { Button } from "../../components/ui/button";
import { Badge } from "../../components/ui/badge";
import { Card, CardContent } from "../../components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "../../components/ui/avatar";
import { Textarea } from "../../components/ui/textarea";
import { supabase } from "../../lib/supabase";
import { GridThumbnail } from "../../components/ui/project-thumbnail";

export const ProjectDetail = (): JSX.Element => {
  const { id } = useParams();
  const [loading, setLoading] = useState(true);
  const [startsnap, setStartsnap] = useState(null);
  const [creator, setCreator] = useState(null);
  const [vibeLogEntries, setVibeLogEntries] = useState([]);
  const [feedbackEntries, setFeedbackEntries] = useState([]);
  const [feedbackContent, setFeedbackContent] = useState("");
  const [currentUser, setCurrentUser] = useState(null);
  
  // Category to color mapping
  const categoryColorMap = {
    tech: {
      name: "Tech",
      bgColor: "bg-blue-200",
      textColor: "text-blue-700",
      borderColor: "border-blue-700",
    },
    gaming: {
      name: "Gaming",
      bgColor: "bg-startsnap-ice-cold",
      textColor: "text-startsnap-jewel",
      borderColor: "border-green-700",
    },
    community: {
      name: "Community",
      bgColor: "bg-startsnap-french-pass",
      textColor: "text-startsnap-persian-blue",
      borderColor: "border-blue-700",
    },
    music: {
      name: "Music Tech",
      bgColor: "bg-purple-200",
      textColor: "text-startsnap-purple-heart",
      borderColor: "border-purple-700",
    },
    design: {
      name: "Design",
      bgColor: "bg-pink-200",
      textColor: "text-pink-700",
      borderColor: "border-pink-700",
    },
    education: {
      name: "Education",
      bgColor: "bg-yellow-200",
      textColor: "text-yellow-700",
      borderColor: "border-yellow-700",
    },
    productivity: {
      name: "Productivity",
      bgColor: "bg-orange-200",
      textColor: "text-orange-700",
      borderColor: "border-orange-700",
    },
    other: {
      name: "Other",
      bgColor: "bg-gray-200",
      textColor: "text-gray-700",
      borderColor: "border-gray-700",
    },
  };

  // Vibe log type to icon mapping
  const vibeLogTypeIcons = {
    launch: {
      icon: "campaign",
      iconBg: "bg-startsnap-wisp-pink",
      iconColor: "text-startsnap-french-rose",
      iconBorder: "border-pink-500",
    },
    feature: {
      icon: "auto_awesome",
      iconBg: "bg-startsnap-blue-chalk",
      iconColor: "text-startsnap-heliotrope",
      iconBorder: "border-purple-500",
    },
    update: {
      icon: "construction",
      iconBg: "bg-startsnap-blue-chalk",
      iconColor: "text-startsnap-heliotrope",
      iconBorder: "border-purple-500",
    },
    idea: {
      icon: "lightbulb",
      iconBg: "bg-yellow-100",
      iconColor: "text-yellow-600",
      iconBorder: "border-yellow-500",
    },
    feedback: {
      icon: "search",
      iconBg: "bg-startsnap-french-pass",
      iconColor: "text-startsnap-persian-blue",
      iconBorder: "border-blue-500",
    },
  };

  useEffect(() => {
    // Check current user
    supabase.auth.getSession().then(({ data: { session } }) => {
      setCurrentUser(session?.user || null);
    });
    
    fetchProjectData();
  }, [id]);

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

  // Helper function to format date
  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleString('en-US', {
      month: 'long',
      day: 'numeric',
      year: 'numeric',
      hour: 'numeric',
      minute: '2-digit',
      hour12: true
    });
  };

  // Helper function to get category display
  const getCategoryDisplay = (category) => {
    return categoryColorMap[category] || categoryColorMap.other;
  };

  // Handle feedback submission
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
          {/* Project Header Section */}
          <div className="border-b-2 border-gray-800 p-8 relative">
            {/* Status badges - positioned in the top right corner */}
            <div className="absolute top-3 right-3 flex flex-col gap-2 items-end">
              {/* Project type badge */}
              {startsnap.type === "live" ? (
                <Badge className="bg-startsnap-mountain-meadow text-white font-['Space_Mono',Helvetica] text-sm rounded-full border border-solid border-green-700 px-3 py-1 flex items-center gap-1">
                  <span className="material-icons text-sm">rocket_launch</span>
                  Live Project
                </Badge>
              ) : (
                <Badge className="bg-startsnap-corn text-startsnap-ebony-clay font-['Space_Mono',Helvetica] text-sm rounded-full border border-solid border-yellow-700 px-3 py-1 flex items-center gap-1">
                  <span className="material-icons text-sm">lightbulb</span>
                  Idea / Concept
                </Badge>
              )}
              
              {/* Hackathon badge */}
              {startsnap.is_hackathon_entry && (
                <Badge className="bg-startsnap-heliotrope text-white font-['Space_Mono',Helvetica] text-sm rounded-full border border-solid border-purple-700 px-3 py-1 flex items-center gap-1">
                  <span className="material-icons text-sm">emoji_events</span>
                  Hackathon Entry
                </Badge>
              )}
            </div>

            <div className="h-64 rounded-lg border-2 border-solid border-gray-800 mb-6">
              <GridThumbnail 
                projectId={startsnap.id} 
                projectType={startsnap.type} 
                category={startsnap.category}
              />
            </div>

            <div className="flex justify-between items-start mb-4">
              <h1 className="font-['Space_Grotesk',Helvetica] font-bold text-startsnap-ebony-clay text-4xl leading-10">
                {startsnap.name}
              </h1>
              <Badge className={`${categoryDisplay.bgColor} ${categoryDisplay.textColor} border ${categoryDisplay.borderColor} rounded-full px-[13px] py-[5px] font-['Space_Mono',Helvetica]`}>
                {categoryDisplay.name}
              </Badge>
            </div>

            <p className="font-['Roboto',Helvetica] font-normal text-startsnap-river-bed text-base leading-6 mb-6">
              {startsnap.description}
            </p>

            <div className="flex items-start mb-6">
              <Avatar className="w-12 h-12 rounded-full border-2 border-solid border-gray-800">
                <AvatarFallback>{creatorInitials}</AvatarFallback>
              </Avatar>
              <div className="ml-4">
                <p className="font-['Roboto',Helvetica] font-semibold text-startsnap-oxford-blue text-base leading-7">
                  {creatorName}
                </p>
                <p className="font-['Inter',Helvetica] font-normal text-startsnap-pale-sky text-xs leading-5">
                  Launched: {new Date(startsnap.created_at).toLocaleDateString()}
                </p>
              </div>
            </div>

            {/* Separated tag sections */}
            <div className="space-y-4 mb-8">
              {/* General Tags Section */}
              {startsnap.tags && startsnap.tags.length > 0 && (
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <span className="material-icons text-startsnap-oxford-blue text-lg">tag</span>
                    <h3 className="font-['Space_Grotesk',Helvetica] font-bold text-startsnap-oxford-blue text-sm">
                      Tags
                    </h3>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {startsnap.tags.map((tag, idx) => (
                      <Badge 
                        key={`tag-${idx}`}
                        className="bg-startsnap-athens-gray text-startsnap-ebony-clay font-['Space_Mono',Helvetica] font-normal text-sm rounded-full border border-solid border-gray-800 px-[13px] py-[5px]"
                      >
                        #{tag}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}
              
              {/* Tools Used Section */}
              {startsnap.tools_used && startsnap.tools_used.length > 0 && (
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <span className="material-icons text-startsnap-persian-blue text-lg">build</span>
                    <h3 className="font-['Space_Grotesk',Helvetica] font-bold text-startsnap-oxford-blue text-sm">
                      Tools Used
                    </h3>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {startsnap.tools_used.map((tool, idx) => (
                      <Badge 
                        key={`tool-${idx}`}
                        className="bg-startsnap-french-pass text-startsnap-persian-blue font-['Space_Mono',Helvetica] text-sm rounded-full border border-solid border-blue-700 px-[13px] py-[5px]"
                      >
                        {tool}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}
              
              {/* Looking For Feedback Section */}
              {startsnap.feedback_tags && startsnap.feedback_tags.length > 0 && (
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <span className="material-icons text-startsnap-jewel text-lg">forum</span>
                    <h3 className="font-['Space_Grotesk',Helvetica] font-bold text-startsnap-oxford-blue text-sm">
                      Looking For Feedback On
                    </h3>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {startsnap.feedback_tags.map((feedback, idx) => (
                      <Badge 
                        key={`feedback-${idx}`}
                        className="bg-startsnap-ice-cold text-startsnap-jewel font-['Space_Mono',Helvetica] text-sm rounded-full border border-solid border-green-700 px-[13px] py-[5px]"
                      >
                        {feedback}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}
            </div>

            <div className="flex gap-4">
              <Button className="startsnap-button bg-startsnap-french-rose text-startsnap-white font-['Roboto',Helvetica] font-bold rounded-lg border-2 border-solid border-gray-800 shadow-[3px_3px_0px_#1f2937] flex items-center gap-2">
                <span className="material-icons text-xl">thumb_up</span>
                Support Project
              </Button>
              <Button className="startsnap-button bg-startsnap-mountain-meadow text-startsnap-white font-['Roboto',Helvetica] font-bold rounded-lg border-2 border-solid border-gray-800 shadow-[3px_3px_0px_#1f2937] flex items-center gap-2">
                <span className="material-icons text-xl">forum</span>
                Give Feedback
              </Button>
              {isOwner && (
                <Button className="startsnap-button bg-startsnap-mischka text-startsnap-ebony-clay font-['Roboto',Helvetica] font-bold rounded-lg border-2 border-solid border-gray-800 shadow-[3px_3px_0px_#1f2937] flex items-center gap-2" asChild>
                  <Link to={`/edit/${startsnap.id}`}>
                    <span className="material-icons text-xl">edit</span>
                    Edit Project
                  </Link>
                </Button>
              )}
            </div>

            {/* Links section */}
            {(startsnap.live_demo_url || startsnap.demo_video_url) && (
              <div className="mt-6 space-y-2">
                {startsnap.live_demo_url && (
                  <div className="flex items-center">
                    <span className="material-icons text-startsnap-oxford-blue mr-2">public</span>
                    <a href={startsnap.live_demo_url} target="_blank" rel="noopener noreferrer" 
                      className="text-startsnap-persian-blue hover:underline">
                      Live Demo: {startsnap.live_demo_url}
                    </a>
                  </div>
                )}
                {startsnap.demo_video_url && (
                  <div className="flex items-center">
                    <span className="material-icons text-startsnap-oxford-blue mr-2">videocam</span>
                    <a href={startsnap.demo_video_url} target="_blank" rel="noopener noreferrer"
                      className="text-startsnap-persian-blue hover:underline">
                      Demo Video: {startsnap.demo_video_url}
                    </a>
                  </div>
                )}
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
              vibeLogEntries.map((entry, index) => {
                const logType = entry.log_type || 'update';
                const iconData = vibeLogTypeIcons[logType] || vibeLogTypeIcons.update;
                
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
                          {formatDate(entry.created_at)}
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

            {feedbackEntries.map((feedback, index) => (
              <Card
                key={index}
                className="mb-6 shadow-[0px_2px_4px_-2px_#0000001a,0px_4px_6px_-1px_#0000001a] bg-startsnap-white rounded-xl overflow-hidden border-[3px] border-solid border-gray-800"
              >
                <CardContent className="p-5">
                  <div className="flex items-start">
                    <Avatar className="w-10 h-10 rounded-full border-2 border-solid border-gray-800">
                      <AvatarImage
                        src={feedback.avatarSrc}
                        alt={feedback.username}
                      />
                      <AvatarFallback>
                        {feedback.username.substring(0, 2)}
                      </AvatarFallback>
                    </Avatar>
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