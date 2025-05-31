import React, { useState, useEffect, useRef } from "react";
import { Avatar, AvatarFallback, AvatarImage } from "../../../../components/ui/avatar";
import { Badge } from "../../../../components/ui/badge";
import { Button } from "../../../../components/ui/button";
import { Card, CardContent, CardFooter } from "../../../../components/ui/card";
import { Link } from "react-router-dom";
import { supabase } from "../../../../lib/supabase";
import { MinimalistThumbnail } from "../../../../components/ui/project-thumbnail";
import Typed from 'typed.js';

export const MainContentSection = (): JSX.Element => {
  const [startSnaps, setStartSnaps] = useState([]);
  const [loading, setLoading] = useState(true);
  const [creators, setCreators] = useState({});
  const typedRef = useRef(null);

  useEffect(() => {
    // Initialize Typed.js
    const typed = new Typed(typedRef.current, {
      strings: ['Startups^1000', 'Start<del class="text-gray-400 text-[0.9em] font-normal">ups</del>snaps'],
      typeSpeed: 50,
      backSpeed: 50,
      startDelay: 500,
      showCursor: true,
      cursorChar: '|',
      autoInsertCss: true,
      loop: false
    });

    // Cleanup
    return () => {
      typed.destroy();
    };
  }, []);

  useEffect(() => {
    fetchStartSnaps();
  }, []);

  const fetchStartSnaps = async () => {
    try {
      setLoading(true);
      
      // Fetch startsnaps
      const { data, error } = await supabase
        .from('startsnaps')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(6);
      
      if (error) throw error;
      
      setStartSnaps(data || []);
      
      // Fetch creators information
      if (data && data.length > 0) {
        const userIds = [...new Set(data.map(snap => snap.user_id))];
        const { data: profilesData, error: profilesError } = await supabase
          .from('profiles')
          .select('user_id, username')
          .in('user_id', userIds);
        
        if (profilesError) throw profilesError;
        
        const creatorsMap = {};
        profilesData.forEach(profile => {
          creatorsMap[profile.user_id] = profile.username;
        });
        
        setCreators(creatorsMap);
      }
    } catch (error) {
      console.error('Error fetching startsnaps:', error);
    } finally {
      setLoading(false);
    }
  };

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

  // Helper function to get category display info
  const getCategoryDisplay = (category) => {
    return categoryColorMap[category] || categoryColorMap.other;
  };

  // Helper function to format date
  const formatDate = (dateString) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInDays = Math.floor((now - date) / (1000 * 60 * 60 * 24));
    
    if (diffInDays === 0) {
      return "Launched: Today";
    } else if (diffInDays === 1) {
      return "Launched: Yesterday";
    } else if (diffInDays < 7) {
      return `Launched: ${diffInDays} days ago`;
    } else if (diffInDays < 30) {
      const weeks = Math.floor(diffInDays / 7);
      return `Launched: ${weeks} ${weeks === 1 ? 'week' : 'weeks'} ago`;
    } else {
      return `Launched: ${date.toLocaleDateString()}`;
    }
  };

  return (
    <section className="flex flex-col w-full items-center bg-startsnap-candlelight">
      {/* Hero Section */}
      <div className="w-full bg-[--startsnap-beige]">
        <div className="max-w-screen-2xl mx-auto px-8 py-24 flex items-center">
          <div className="w-[60%] pr-16">
            <h1 className="text-6xl font-bold text-startsnap-ebony-clay mb-6 font-['Space_Grotesk',Helvetica] leading-tight">
              We're Vibe Coding,<br />
              We Build <span ref={typedRef}></span>
            </h1>
            <p className="text-xl text-startsnap-river-bed mb-8 font-['Roboto',Helvetica] leading-relaxed">
              Vibe Coders! Showcase your journey, build in public, get real feedback, and find your creative tribe here
            </p>
            <Button className="startsnap-button bg-startsnap-french-rose text-startsnap-white font-['Roboto',Helvetica] font-bold text-lg px-8 py-6 rounded-lg border-2 border-solid border-gray-800 shadow-[3px_3px_0px_#1f2937]">
              Start Building Today
            </Button>
          </div>
          <div className="w-[40%]">
            <img 
              src="https://ik.imagekit.io/craftsnap/startsnap/vibe-coder.png" 
              alt="Collaborative team working together" 
              className="w-full h-auto"
            />
          </div>
        </div>
      </div>

      {/* StartSnaps Cards Section */}
      <div className="w-full max-w-screen-2xl px-8 py-16">
        <h2 className="text-5xl font-bold text-startsnap-ebony-clay text-center mb-20 font-['Space_Grotesk',Helvetica]">
          StartSnaps
        </h2>

        {loading ? (
          <div className="text-center py-20">
            <p className="text-xl text-startsnap-pale-sky">Loading projects...</p>
          </div>
        ) : startSnaps.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {startSnaps.map((startsnap) => {
              const categoryDisplay = getCategoryDisplay(startsnap.category);
              const creatorName = creators[startsnap.user_id] || 'Anonymous';
              const creatorInitials = creatorName.substring(0, 2).toUpperCase();
              
              return (
                <Card
                  key={startsnap.id}
                  className="bg-startsnap-white rounded-xl overflow-hidden border-[3px] border-solid border-gray-800 shadow-[5px_5px_0px_#1f2937]"
                >
                  <CardContent className="p-7 pt-[219px] relative">
                    {/* Project thumbnail */}
                    <div className="absolute top-0 left-0 right-0 h-[200px] p-7 pb-0">
                      <MinimalistThumbnail 
                        projectId={startsnap.id} 
                        projectType={startsnap.type} 
                        category={startsnap.category}
                      />
                    </div>
                  
                    {/* Status badges - positioned in the top right corner */}
                    <div className="absolute top-3 right-3 flex flex-col gap-2 items-end z-10">
                      {/* Project type badge */}
                      {startsnap.type === "live" ? (
                        <Badge className="bg-startsnap-mountain-meadow text-white font-['Space_Mono',Helvetica] text-xs rounded-full border border-solid border-green-700 px-2 py-0.5 flex items-center gap-1">
                          <span className="material-icons text-xs">rocket_launch</span>
                          Live Project
                        </Badge>
                      ) : (
                        <Badge className="bg-startsnap-corn text-startsnap-ebony-clay font-['Space_Mono',Helvetica] text-xs rounded-full border border-solid border-yellow-700 px-2 py-0.5 flex items-center gap-1">
                          <span className="material-icons text-xs">lightbulb</span>
                          Idea
                        </Badge>
                      )}
                      
                      {/* Hackathon badge */}
                      {startsnap.is_hackathon_entry && (
                        <Badge className="bg-startsnap-heliotrope text-white font-['Space_Mono',Helvetica] text-xs rounded-full border border-solid border-purple-700 px-2 py-0.5 flex items-center gap-1">
                          <span className="material-icons text-xs">emoji_events</span>
                          Hackathon Entry
                        </Badge>
                      )}
                    </div>

                    <div className="flex justify-between items-start">
                      <h3 className="font-['Space_Grotesk',Helvetica] font-bold text-startsnap-ebony-clay text-2xl leading-8 flex-1">
                        {startsnap.name}
                      </h3>
                      <Badge
                        className={`${categoryDisplay.bgColor} ${categoryDisplay.textColor} border ${categoryDisplay.borderColor} rounded-full px-[13px] py-[5px] font-['Space_Mono',Helvetica] font-normal text-sm`}
                      >
                        {categoryDisplay.name}
                      </Badge>
                    </div>

                    <p className="mt-4 font-['Roboto',Helvetica] font-normal text-startsnap-river-bed text-base leading-6 line-clamp-2 h-12 overflow-hidden">
                      <span className="material-icons text-base mr-2 leading-none">campaign</span>
                      {startsnap.description}
                    </p>

                    <div className="flex items-center mt-7">
                      <Avatar className="w-10 h-10 rounded-full border-2 border-solid border-gray-800">
                        <AvatarFallback>
                          {creatorInitials}
                        </AvatarFallback>
                      </Avatar>
                      <div className="ml-3">
                        <p className="font-['Roboto',Helvetica] font-semibold text-startsnap-oxford-blue text-base leading-6">
                          {creatorName}
                        </p>
                        <p className="font-['Inter',Helvetica] font-normal text-startsnap-pale-sky text-xs leading-4">
                          {formatDate(startsnap.created_at)}
                        </p>
                      </div>
                    </div>

                    {/* Separated tag sections */}
                    <div className="space-y-2 mt-4">
                      {/* General Tags Section */}
                      {startsnap.tags && startsnap.tags.length > 0 && (
                        <div className="flex items-center gap-2">
                          <span className="material-icons text-startsnap-oxford-blue text-sm">tag</span>
                          <div className="flex flex-wrap gap-1 flex-1">
                            {startsnap.tags.slice(0, 2).map((tag, idx) => (
                              <Badge 
                                key={`tag-${idx}`}
                                className="bg-startsnap-athens-gray text-startsnap-ebony-clay font-['Space_Mono',Helvetica] text-xs rounded-full border border-solid border-gray-800 px-2 py-0.5"
                              >
                                #{tag}
                              </Badge>
                            ))}
                            {startsnap.tags.length > 2 && (
                              <Badge className="bg-startsnap-athens-gray text-startsnap-ebony-clay font-['Space_Mono',Helvetica] text-xs rounded-full border border-solid border-gray-800 px-2 py-0.5">
                                +{startsnap.tags.length - 2} more
                              </Badge>
                            )}
                          </div>
                        </div>
                      )}
                      
                      {/* Tools Used Section */}
                      {startsnap.tools_used && startsnap.tools_used.length > 0 && (
                        <div className="flex items-center gap-2">
                          <span className="material-icons text-startsnap-persian-blue text-sm">build</span>
                          <div className="flex flex-wrap gap-1 flex-1">
                            {startsnap.tools_used.slice(0, 2).map((tool, idx) => (
                              <Badge 
                                key={`tool-${idx}`}
                                className="bg-startsnap-french-pass text-startsnap-persian-blue font-['Space_Mono',Helvetica] text-xs rounded-full border border-solid border-blue-700 px-2 py-0.5"
                              >
                                {tool}
                              </Badge>
                            ))}
                            {startsnap.tools_used.length > 2 && (
                              <Badge className="bg-startsnap-french-pass text-startsnap-persian-blue font-['Space_Mono',Helvetica] text-xs rounded-full border border-solid border-blue-700 px-2 py-0.5">
                                +{startsnap.tools_used.length - 2} more
                              </Badge>
                            )}
                          </div>
                        </div>
                      )}
                      
                      {/* Looking For Feedback Section */}
                      {startsnap.feedback_tags && startsnap.feedback_tags.length > 0 && (
                        <div className="flex items-center gap-2">
                          <span className="material-icons text-startsnap-jewel text-sm">forum</span>
                          <div className="flex flex-wrap gap-1 flex-1">
                            {startsnap.feedback_tags.slice(0, 2).map((feedback, idx) => (
                              <Badge 
                                key={`feedback-${idx}`}
                                className="bg-startsnap-ice-cold text-startsnap-jewel font-['Space_Mono',Helvetica] text-xs rounded-full border border-solid border-green-700 px-2 py-0.5"
                              >
                                {feedback}
                              </Badge>
                            ))}
                            {startsnap.feedback_tags.length > 2 && (
                              <Badge className="bg-startsnap-ice-cold text-startsnap-jewel font-['Space_Mono',Helvetica] text-xs rounded-full border border-solid border-green-700 px-2 py-0.5">
                                +{startsnap.feedback_tags.length - 2} more
                              </Badge>
                            )}
                          </div>
                        </div>
                      )}
                    </div>
                  </CardContent>

                  <CardFooter className="p-7 pt-0">
                    <Button className="startsnap-button w-full bg-startsnap-french-rose text-startsnap-white font-['Roboto',Helvetica] font-bold rounded-lg border-2 border-solid border-gray-800 shadow-[3px_3px_0px_#1f2937]" asChild>
                      <Link to={`/project/${startsnap.id}`}>View Project</Link>
                    </Button>
                  </CardFooter>
                </Card>
              );
            })}
          </div>
        ) : (
          <div className="text-center py-20">
            <p className="text-xl text-startsnap-pale-sky">No projects found. Be the first to share your idea!</p>
            <Button className="startsnap-button mt-4 bg-startsnap-french-rose text-startsnap-white font-['Roboto',Helvetica] font-bold rounded-lg border-2 border-solid border-gray-800 shadow-[3px_3px_0px_#1f2937]" asChild>
              <Link to="/create">Create StartSnap</Link>
            </Button>
          </div>
        )}
      </div>
    </section>
  );
};