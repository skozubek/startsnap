import React, { useEffect, useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { Avatar, AvatarFallback, AvatarImage } from "../../components/ui/avatar";
import { Button } from "../../components/ui/button";
import { Card, CardContent } from "../../components/ui/card";
import { Badge } from "../../components/ui/badge";
import { Input } from "../../components/ui/input";
import { Textarea } from "../../components/ui/textarea";
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "../../components/ui/select";
import { supabase } from "../../lib/supabase";

export const Profile = (): JSX.Element => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);
  const [user, setUser] = useState(null);
  const [profile, setProfile] = useState({
    username: "",
    bio: "",
    status: "brainstorming",
    github: "",
    twitter: "",
    linkedin: "",
    website: ""
  });
  const [userStartSnaps, setUserStartSnaps] = useState([]);
  const [loadingStartSnaps, setLoadingStartSnaps] = useState(true);

  // Status options with emojis
  const statusOptions = [
    { value: "building", label: "🚀 Actively Building" },
    { value: "brainstorming", label: "💡 Brainstorming New Ideas" },
    { value: "collaborating", label: "🤝 Open to Collaboration" },
    { value: "feedback", label: "🔍 Seeking Feedback" },
    { value: "job_ready", label: "💼 Looking for Work / Job Ready" },
    { value: "break", label: "⏳ Taking a Break" }
  ];

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
    const fetchUserAndProfile = async () => {
      try {
        // Get current user
        const { data: { session } } = await supabase.auth.getSession();
        
        if (!session?.user) {
          navigate('/');
          return;
        }
        
        setUser(session.user);
        
        // Fetch profile data
        const { data, error } = await supabase
          .from('profiles')
          .select('*')
          .eq('user_id', session.user.id)
          .single();
        
        if (error && error.code !== 'PGRST116') {
          console.error('Error fetching profile:', error);
          return;
        }
        
        // If profile exists, use it; otherwise, use default values
        if (data) {
          setProfile({
            username: data.username || session.user.email?.split('@')[0] || '',
            bio: data.bio || '',
            status: data.status || 'brainstorming',
            github: data.github_url || '',
            twitter: data.twitter_url || '',
            linkedin: data.linkedin_url || '',
            website: data.website_url || ''
          });
        } else {
          // Set default username from email if no profile exists
          setProfile(prev => ({
            ...prev,
            username: session.user.email?.split('@')[0] || ''
          }));
        }

        // Fetch user's StartSnaps
        fetchUserStartSnaps(session.user.id);
      } catch (error) {
        console.error('Error:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchUserAndProfile();
  }, [navigate]);

  const fetchUserStartSnaps = async (userId) => {
    try {
      setLoadingStartSnaps(true);
      
      // Fetch startsnaps for the user
      const { data, error } = await supabase
        .from('startsnaps')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false });
      
      if (error) {
        throw error;
      }
      
      setUserStartSnaps(data || []);
    } catch (error) {
      console.error('Error fetching user StartSnaps:', error);
    } finally {
      setLoadingStartSnaps(false);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setProfile(prev => ({ ...prev, [name]: value }));
  };

  const handleStatusChange = (value) => {
    setProfile(prev => ({ ...prev, status: value }));
  };

  const updateProfile = async () => {
    if (!user) return;
    
    try {
      setUpdating(true);
      
      const { error } = await supabase
        .from('profiles')
        .upsert({
          user_id: user.id,
          username: profile.username,
          bio: profile.bio,
          status: profile.status,
          github_url: profile.github,
          twitter_url: profile.twitter,
          linkedin_url: profile.linkedin,
          website_url: profile.website,
          updated_at: new Date()
        }, { 
          onConflict: 'user_id' 
        });
      
      if (error) throw error;
      
      alert('Profile updated successfully!');
    } catch (error) {
      console.error('Error updating profile:', error);
      alert('Error updating profile. Please try again.');
    } finally {
      setUpdating(false);
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

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen bg-startsnap-candlelight">
        <p className="text-xl font-bold text-startsnap-ebony-clay">Loading profile...</p>
      </div>
    );
  }

  // Get status emoji
  const getStatusEmoji = (statusValue) => {
    const option = statusOptions.find(opt => opt.value === statusValue);
    return option ? option.label.split(' ')[0] : '💡';
  };

  return (
    <div className="flex flex-col w-full items-center gap-8 pt-8 pb-24 px-8 bg-startsnap-candlelight">
      <h2 className="text-5xl font-bold text-startsnap-ebony-clay text-center font-['Space_Grotesk',Helvetica] leading-[48px]">
        Your Profile
      </h2>
      
      <div className="w-full max-w-4xl">
        <Card className="bg-startsnap-white rounded-xl overflow-hidden border-[3px] border-solid border-gray-800 shadow-[5px_5px_0px_#1f2937] mb-8">
          <CardContent className="p-8">
            <div className="flex flex-col md:flex-row gap-8">
              <div className="flex flex-col items-center">
                <Avatar className="w-32 h-32 border-3 border-gray-800">
                  <AvatarImage src={user?.user_metadata?.avatar_url} />
                  <AvatarFallback className="text-4xl">
                    {profile.username.charAt(0).toUpperCase()}
                  </AvatarFallback>
                </Avatar>
                <div className="mt-4 text-center">
                  <Badge className="bg-startsnap-athens-gray text-startsnap-ebony-clay font-['Space_Mono',Helvetica] text-sm rounded-full border border-solid border-gray-800 px-3 py-1.5">
                    {getStatusEmoji(profile.status)} {statusOptions.find(opt => opt.value === profile.status)?.label.split(' ').slice(1).join(' ')}
                  </Badge>
                </div>
              </div>
              
              <div className="flex-1">
                <form className="space-y-6">
                  <div className="space-y-2">
                    <label className="block font-['Space_Grotesk',Helvetica] font-bold text-startsnap-oxford-blue text-lg leading-7">
                      Username
                    </label>
                    <Input
                      name="username"
                      value={profile.username}
                      onChange={handleChange}
                      placeholder="Your username"
                      className="border-2 border-solid border-gray-800 rounded-lg p-4 font-['Roboto',Helvetica] text-startsnap-pale-sky"
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <label className="block font-['Space_Grotesk',Helvetica] font-bold text-startsnap-oxford-blue text-lg leading-7">
                      Bio
                    </label>
                    <Textarea
                      name="bio"
                      value={profile.bio}
                      onChange={handleChange}
                      placeholder="Tell us about yourself, your skills, interests, and what you're working on..."
                      className="border-2 border-solid border-gray-800 rounded-lg p-3.5 min-h-[120px] font-['Roboto',Helvetica] text-startsnap-pale-sky"
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <label className="block font-['Space_Grotesk',Helvetica] font-bold text-startsnap-oxford-blue text-lg leading-7">
                      Status
                    </label>
                    <Select value={profile.status} onValueChange={handleStatusChange}>
                      <SelectTrigger className="border-2 border-solid border-gray-800 rounded-lg h-[52px] font-['Roboto',Helvetica]">
                        <SelectValue placeholder="Set your status" />
                      </SelectTrigger>
                      <SelectContent>
                        {statusOptions.map((option) => (
                          <SelectItem key={option.value} value={option.value}>
                            {option.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <div className="space-y-2">
                    <label className="block font-['Space_Grotesk',Helvetica] font-bold text-startsnap-oxford-blue text-lg leading-7">
                      External Links
                    </label>
                    <div className="grid gap-4 md:grid-cols-2">
                      <div className="space-y-1">
                        <label className="block font-['Roboto',Helvetica] text-startsnap-pale-sky text-sm">GitHub</label>
                        <Input
                          name="github"
                          value={profile.github}
                          onChange={handleChange}
                          placeholder="https://github.com/username"
                          className="border-2 border-solid border-gray-800 rounded-lg p-3 font-['Roboto',Helvetica] text-startsnap-pale-sky"
                        />
                      </div>
                      <div className="space-y-1">
                        <label className="block font-['Roboto',Helvetica] text-startsnap-pale-sky text-sm">Twitter</label>
                        <Input
                          name="twitter"
                          value={profile.twitter}
                          onChange={handleChange}
                          placeholder="https://twitter.com/username"
                          className="border-2 border-solid border-gray-800 rounded-lg p-3 font-['Roboto',Helvetica] text-startsnap-pale-sky"
                        />
                      </div>
                      <div className="space-y-1">
                        <label className="block font-['Roboto',Helvetica] text-startsnap-pale-sky text-sm">LinkedIn</label>
                        <Input
                          name="linkedin"
                          value={profile.linkedin}
                          onChange={handleChange}
                          placeholder="https://linkedin.com/in/username"
                          className="border-2 border-solid border-gray-800 rounded-lg p-3 font-['Roboto',Helvetica] text-startsnap-pale-sky"
                        />
                      </div>
                      <div className="space-y-1">
                        <label className="block font-['Roboto',Helvetica] text-startsnap-pale-sky text-sm">Website</label>
                        <Input
                          name="website"
                          value={profile.website}
                          onChange={handleChange}
                          placeholder="https://yourwebsite.com"
                          className="border-2 border-solid border-gray-800 rounded-lg p-3 font-['Roboto',Helvetica] text-startsnap-pale-sky"
                        />
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex justify-center pt-4">
                    <Button 
                      type="button"
                      onClick={updateProfile}
                      disabled={updating}
                      className="startsnap-button bg-startsnap-french-rose text-startsnap-white font-['Roboto',Helvetica] font-bold rounded-lg border-2 border-solid border-gray-800 shadow-[3px_3px_0px_#1f2937]"
                    >
                      {updating ? 'Saving...' : 'Save Profile'}
                    </Button>
                  </div>
                </form>
              </div>
            </div>
          </CardContent>
        </Card>
        
        {/* StartSnaps Portfolio Section */}
        <h3 className="text-3xl font-bold text-startsnap-ebony-clay mb-6 font-['Space_Grotesk',Helvetica]">
          Your StartSnaps
        </h3>
        
        {loadingStartSnaps ? (
          <div className="text-center py-8">
            <p className="text-lg text-startsnap-pale-sky">Loading your StartSnaps...</p>
          </div>
        ) : userStartSnaps.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {userStartSnaps.map((startsnap) => {
              const categoryDisplay = getCategoryDisplay(startsnap.category);
              
              return (
                <Card
                  key={startsnap.id}
                  className="bg-startsnap-white rounded-xl overflow-hidden border-[3px] border-solid border-gray-800 shadow-[5px_5px_0px_#1f2937]"
                >
                  <CardContent className="p-7 pt-[140px] relative">
                    {/* Status badges - positioned in the top right corner */}
                    <div className="absolute top-3 right-3 flex flex-col gap-2 items-end">
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
                      <h3 className="font-['Space_Grotesk',Helvetica] font-bold text-startsnap-ebony-clay text-xl leading-7">
                        {startsnap.name}
                      </h3>
                      <Badge
                        className={`${categoryDisplay.bgColor} ${categoryDisplay.textColor} border ${categoryDisplay.borderColor} rounded-full px-3 py-1 font-['Space_Mono',Helvetica] text-xs`}
                      >
                        {categoryDisplay.name}
                      </Badge>
                    </div>

                    <p className="mt-3 font-['Roboto',Helvetica] font-normal text-startsnap-river-bed text-sm leading-5 line-clamp-2 h-10 overflow-hidden">
                      {startsnap.description}
                      <span className="text-startsnap-french-rose text-xs italic ml-1">see more</span>
                    </p>

                    <p className="mt-4 font-['Inter',Helvetica] font-normal text-startsnap-pale-sky text-xs">
                      {formatDate(startsnap.created_at)}
                    </p>

                    {/* Separated tag sections */}
                    <div className="space-y-1 mt-3">
                      {/* General Tags Section */}
                      {startsnap.tags && startsnap.tags.length > 0 && (
                        <div className="flex items-center gap-1">
                          <span className="material-icons text-startsnap-oxford-blue text-xs">tag</span>
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
                        <div className="flex items-center gap-1">
                          <span className="material-icons text-startsnap-persian-blue text-xs">build</span>
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
                        <div className="flex items-center gap-1">
                          <span className="material-icons text-startsnap-jewel text-xs">forum</span>
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

                    <div className="flex gap-2 mt-4">
                      <Button 
                        className="startsnap-button flex-1 bg-startsnap-french-rose text-startsnap-white font-['Roboto',Helvetica] font-bold rounded-lg border-2 border-solid border-gray-800 shadow-[3px_3px_0px_#1f2937] text-sm" 
                        asChild
                      >
                        <Link to={`/edit/${startsnap.id}`}>Edit Project</Link>
                      </Button>
                      <Button 
                        className="startsnap-button flex-1 bg-startsnap-mischka text-startsnap-ebony-clay font-['Roboto',Helvetica] font-bold rounded-lg border-2 border-solid border-gray-800 shadow-[3px_3px_0px_#1f2937] text-sm" 
                        asChild
                      >
                        <Link to={`/project/${startsnap.id}`}>View Project</Link>
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        ) : (
          <Card className="bg-startsnap-white rounded-xl overflow-hidden border-[3px] border-solid border-gray-800 shadow-[5px_5px_0px_#1f2937] p-8">
            <div className="text-center">
              <p className="text-lg text-startsnap-pale-sky mb-4">You haven't created any StartSnaps yet!</p>
              <Button 
                className="startsnap-button bg-startsnap-french-rose text-startsnap-white font-['Roboto',Helvetica] font-bold rounded-lg border-2 border-solid border-gray-800 shadow-[3px_3px_0px_#1f2937]" 
                asChild
              >
                <Link to="/create">Create Your First StartSnap</Link>
              </Button>
            </div>
          </Card>
        )}
      </div>
    </div>
  );
};