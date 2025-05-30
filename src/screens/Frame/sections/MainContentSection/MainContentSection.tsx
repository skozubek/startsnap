import React, { useState, useEffect } from "react";
import { Avatar, AvatarFallback, AvatarImage } from "../../../../components/ui/avatar";
import { Badge } from "../../../../components/ui/badge";
import { Button } from "../../../../components/ui/button";
import { Card, CardContent, CardFooter } from "../../../../components/ui/card";
import { Link } from "react-router-dom";
import { supabase } from "../../../../lib/supabase";

export const MainContentSection = (): JSX.Element => {
  const [startSnaps, setStartSnaps] = useState([]);
  const [loading, setLoading] = useState(true);
  const [creators, setCreators] = useState({});

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

  // Create combined tags array
  const getAllTags = (startsnap) => {
    const tags = [...(startsnap.tags || [])];
    
    // Add some tools as tags
    if (startsnap.tools_used && startsnap.tools_used.length > 0) {
      startsnap.tools_used.slice(0, 2).forEach(tool => {
        tags.push(tool);
      });
    }
    
    // Add some feedback areas as tags
    if (startsnap.feedback_tags && startsnap.feedback_tags.length > 0) {
      tags.push("Feedback");
    }
    
    return tags.map(tag => tag.startsWith('#') ? tag : `#${tag}`);
  };

  return (
    <section className="flex flex-col w-full items-center gap-16 pt-8 pb-24 px-8 bg-startsnap-candlelight">
      {/* StartSnaps Cards Section */}
      <div className="w-full max-w-screen-2xl">
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
              const tags = getAllTags(startsnap);
              const creatorName = creators[startsnap.user_id] || 'Anonymous';
              const creatorInitials = creatorName.substring(0, 2).toUpperCase();
              
              return (
                <Card
                  key={startsnap.id}
                  className="bg-startsnap-white rounded-xl overflow-hidden border-[3px] border-solid border-gray-800 shadow-[5px_5px_0px_#1f2937]"
                >
                  <CardContent className="p-7 pt-[219px]">
                    <div className="flex justify-between items-start">
                      <h3 className="font-['Space_Grotesk',Helvetica] font-bold text-startsnap-ebony-clay text-2xl leading-8">
                        {startsnap.name}
                      </h3>
                      <Badge
                        className={`${categoryDisplay.bgColor} ${categoryDisplay.textColor} border ${categoryDisplay.borderColor} rounded-full px-[13px] py-[5px] font-['Space_Mono',Helvetica] font-normal text-sm`}
                      >
                        {categoryDisplay.name}
                      </Badge>
                    </div>

                    <p className="mt-4 font-['Roboto',Helvetica] font-normal text-startsnap-river-bed text-base leading-6 line-clamp-2 h-12 overflow-hidden">
                      {startsnap.description}
                      <span className="text-startsnap-french-rose text-xs italic ml-1">see more</span>
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

                    <div className="flex flex-wrap gap-2 mt-4">
                      {tags.slice(0, 3).map((tag, idx) => (
                        <Badge
                          key={idx}
                          className="bg-startsnap-athens-gray text-startsnap-ebony-clay font-['Space_Mono',Helvetica] font-normal text-sm rounded-full border border-solid border-gray-800 px-[13px] py-[5px]"
                        >
                          {tag}
                        </Badge>
                      ))}
                      {tags.length > 3 && (
                        <Badge
                          className="bg-startsnap-athens-gray text-startsnap-ebony-clay font-['Space_Mono',Helvetica] font-normal text-sm rounded-full border border-solid border-gray-800 px-[13px] py-[5px]"
                        >
                          +{tags.length - 3} more
                        </Badge>
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