import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { UploadIcon } from "lucide-react";
import { Button } from "../../components/ui/button";
import { Card, CardContent } from "../../components/ui/card";
import { Input } from "../../components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../../components/ui/select";
import { Textarea } from "../../components/ui/textarea";
import { Badge } from "../../components/ui/badge";
import { Checkbox } from "../../components/ui/checkbox";
import { Separator } from "../../components/ui/separator";
import { supabase } from "../../lib/supabase";

// Form state type for better type safety
type FormState = {
  projectType: string;
  projectName: string;
  description: string;
  category: string;
  liveUrl: string;
  videoUrl: string;
  tags: string;
  isHackathon: boolean;
  vibeLogType: string;
  vibeLogTitle: string;
  vibeLogContent: string;
  toolsInput: string;
  toolsUsed: string[];
  feedbackInput: string;
  feedbackAreas: string[];
};

// Initial form state
const initialFormState: FormState = {
  projectType: "idea",
  projectName: "",
  description: "",
  category: "",
  liveUrl: "",
  videoUrl: "",
  tags: "",
  isHackathon: false,
  vibeLogType: "launch",
  vibeLogTitle: "Initial Launch",
  vibeLogContent: "",
  toolsInput: "",
  toolsUsed: [],
  feedbackInput: "",
  feedbackAreas: []
};

// Function to save form state to localStorage
const saveFormState = (state: FormState) => {
  try {
    localStorage.setItem('createStartSnapForm', JSON.stringify(state));
  } catch (error) {
    console.error('Error saving form state:', error);
  }
};

export const CreateStartSnap = (): JSX.Element => {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(false);
  const [formState, setFormState] = useState<FormState>(() => {
    try {
      const savedForm = localStorage.getItem('createStartSnapForm');
      return savedForm ? JSON.parse(savedForm) : initialFormState;
    } catch (error) {
      console.error('Error loading saved form:', error);
      return initialFormState;
    }
  });

  useEffect(() => {
    // Check if user is logged in
    const checkUser = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session?.user) {
        navigate('/');
        return;
      }
      setUser(session.user);
    };
    checkUser();
  }, [navigate]);

  // Handle form field changes
  const handleChange = (e) => {
    const { name, value } = e.target;
    const newState = { ...formState, [name]: value };
    setFormState(newState);
    saveFormState(newState);
  };

  // Handle checkbox change
  const handleCheckboxChange = (checked) => {
    const newState = { ...formState, isHackathon: checked };
    setFormState(newState);
    saveFormState(newState);
  };

  // Handle tools tag input
  const handleToolsInputKeyDown = (e) => {
    if (e.key === 'Enter' && formState.toolsInput.trim()) {
      e.preventDefault();
      const newTool = formState.toolsInput.trim();
      if (!formState.toolsUsed.includes(newTool)) {
        const newState = {
          ...formState,
          toolsUsed: [...formState.toolsUsed, newTool],
          toolsInput: ''
        };
        setFormState(newState);
        saveFormState(newState);
      }
    }
  };

  // Handle feedback tag input
  const handleFeedbackInputKeyDown = (e) => {
    if (e.key === 'Enter' && formState.feedbackInput.trim()) {
      e.preventDefault();
      const newFeedback = formState.feedbackInput.trim();
      if (!formState.feedbackAreas.includes(newFeedback)) {
        const newState = {
          ...formState,
          feedbackAreas: [...formState.feedbackAreas, newFeedback],
          feedbackInput: ''
        };
        setFormState(newState);
        saveFormState(newState);
      }
    }
  };

  // Remove a tool tag
  const removeTool = (tool) => {
    const newState = {
      ...formState,
      toolsUsed: formState.toolsUsed.filter(t => t !== tool)
    };
    setFormState(newState);
    saveFormState(newState);
  };

  // Remove a feedback tag
  const removeFeedback = (feedback) => {
    const newState = {
      ...formState,
      feedbackAreas: formState.feedbackAreas.filter(f => f !== feedback)
    };
    setFormState(newState);
    saveFormState(newState);
  };

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formState.projectName.trim() || !formState.description.trim() || !formState.category) {
      alert('Please fill in all required fields.');
      return;
    }

    if (!user) {
      alert('You need to be logged in to create a project.');
      return;
    }

    try {
      setLoading(true);

      // Parse general tags
      const generalTags = formState.tags.split(',')
        .map(tag => tag.trim())
        .filter(tag => tag.length > 0);

      // Insert the startsnap
      const { data: startsnap, error: startsnapError } = await supabase
        .from('startsnaps')
        .insert({
          user_id: user.id,
          name: formState.projectName,
          description: formState.description,
          category: formState.category,
          type: formState.projectType,
          live_demo_url: formState.liveUrl,
          demo_video_url: formState.videoUrl,
          tools_used: formState.toolsUsed,
          feedback_tags: formState.feedbackAreas,
          is_hackathon_entry: formState.isHackathon,
          tags: generalTags
        })
        .select();

      if (startsnapError) throw startsnapError;

      // Insert the initial vibe log
      if (formState.vibeLogContent.trim()) {
        const { error: vibeLogError } = await supabase
          .from('vibelogs')
          .insert({
            startsnap_id: startsnap[0].id,
            log_type: formState.vibeLogType,
            title: formState.vibeLogTitle,
            content: formState.vibeLogContent
          });

        if (vibeLogError) throw vibeLogError;
      }

      // Clear saved form data after successful submission
      localStorage.removeItem('createStartSnapForm');

      // Redirect to the project detail page or projects list
      navigate('/');
      alert('StartSnap created successfully!');
    } catch (error) {
      console.error('Error creating StartSnap:', error);
      alert('Error creating StartSnap. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col w-full items-center gap-8 pt-8 pb-24 px-8 bg-startsnap-candlelight">
      <h2 className="text-5xl font-bold text-startsnap-ebony-clay text-center font-['Space_Grotesk',Helvetica] leading-[48px]">
        Launch Your Project
      </h2>

      <Card className="max-w-2xl w-full bg-startsnap-white rounded-xl overflow-hidden border-[3px] border-solid border-gray-800 shadow-[5px_5px_0px_#1f2937]">
        <CardContent className="p-9">
          <form className="space-y-6" onSubmit={handleSubmit}>
            {/* Project Type Selection */}
            <div className="space-y-2">
              <label className="block font-['Space_Grotesk',Helvetica] font-bold text-startsnap-oxford-blue text-lg leading-7">
                Project Type
              </label>
              <div className="flex gap-4">
                <Button
                  type="button"
                  className={`flex-1 startsnap-button ${
                    formState.projectType === "idea" 
                      ? "bg-startsnap-french-rose text-startsnap-white" 
                      : "bg-startsnap-mischka text-startsnap-ebony-clay"
                  } font-['Roboto',Helvetica] font-bold rounded-lg border-2 border-solid border-gray-800 shadow-[3px_3px_0px_#1f2937]`}
                  onClick={() => {
                    const newState = { ...formState, projectType: "idea" };
                    setFormState(newState);
                    saveFormState(newState);
                  }}
                >
                  Idea / Concept
                </Button>
                <Button
                  type="button"
                  className={`flex-1 startsnap-button ${
                    formState.projectType === "live" 
                      ? "bg-startsnap-french-rose text-startsnap-white" 
                      : "bg-startsnap-mischka text-startsnap-ebony-clay"
                  } font-['Roboto',Helvetica] font-bold rounded-lg border-2 border-solid border-gray-800 shadow-[3px_3px_0px_#1f2937]`}
                  onClick={() => {
                    const newState = { ...formState, projectType: "live" };
                    setFormState(newState);
                    saveFormState(newState);
                  }}
                >
                  Live Project
                </Button>
              </div>
            </div>

            <div className="space-y-2">
              <label className="block font-['Space_Grotesk',Helvetica] font-bold text-startsnap-oxford-blue text-lg leading-7">
                Project Name*
              </label>
              <Input
                name="projectName"
                value={formState.projectName}
                onChange={handleChange}
                placeholder="e.g., My Awesome Idea"
                className="border-2 border-solid border-gray-800 rounded-lg p-4 font-['Roboto',Helvetica] text-startsnap-pale-sky"
                required
              />
            </div>

            <div className="space-y-2">
              <label className="block font-['Space_Grotesk',Helvetica] font-bold text-startsnap-oxford-blue text-lg leading-7">
                Description*
              </label>
              <Textarea
                name="description"
                value={formState.description}
                onChange={handleChange}
                placeholder="Briefly describe your project..."
                className="border-2 border-solid border-gray-800 rounded-lg p-3.5 min-h-[107px] font-['Roboto',Helvetica] text-startsnap-pale-sky"
                required
              />
            </div>

            <div className="space-y-2">
              <label className="block font-['Space_Grotesk',Helvetica] font-bold text-startsnap-oxford-blue text-lg leading-7">
                Category*
              </label>
              <Select 
                name="category" 
                value={formState.category}
                onValueChange={(value) => {
                  const newState = { ...formState, category: value };
                  setFormState(newState);
                  saveFormState(newState);
                }}
                required
              >
                <SelectTrigger className="border-2 border-solid border-gray-800 rounded-lg h-[52px] font-['Roboto',Helvetica]">
                  <SelectValue placeholder="Select a category" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="tech">Tech</SelectItem>
                  <SelectItem value="gaming">Gaming</SelectItem>
                  <SelectItem value="community">Community</SelectItem>
                  <SelectItem value="music">Music Tech</SelectItem>
                  <SelectItem value="design">Design</SelectItem>
                  <SelectItem value="education">Education</SelectItem>
                  <SelectItem value="productivity">Productivity</SelectItem>
                  <SelectItem value="other">Other</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Link to Live Demo (optional) */}
            <div className="space-y-2">
              <label className="block font-['Space_Grotesk',Helvetica] font-bold text-startsnap-oxford-blue text-lg leading-7">
                Link to Live Demo/App (optional)
              </label>
              <Input
                name="liveUrl"
                value={formState.liveUrl}
                onChange={handleChange}
                placeholder="https://your-demo-url.com"
                className="border-2 border-solid border-gray-800 rounded-lg p-4 font-['Roboto',Helvetica] text-startsnap-pale-sky"
              />
            </div>

            {/* Link to Demo Video (optional) */}
            <div className="space-y-2">
              <label className="block font-['Space_Grotesk',Helvetica] font-bold text-startsnap-oxford-blue text-lg leading-7">
                Link to Demo Video (optional)
              </label>
              <Input
                name="videoUrl"
                value={formState.videoUrl}
                onChange={handleChange}
                placeholder="https://youtube.com/watch?v=..."
                className="border-2 border-solid border-gray-800 rounded-lg p-4 font-['Roboto',Helvetica] text-startsnap-pale-sky"
              />
            </div>

            <div className="space-y-2">
              <label className="block font-['Space_Grotesk',Helvetica] font-bold text-startsnap-oxford-blue text-lg leading-7">
                Project Thumbnail
              </label>
              <div className="border-2 border-dashed border-gray-800 rounded-lg h-[147px] flex flex-col items-center justify-center text-center p-4">
                <UploadIcon className="w-12 h-12 text-startsnap-gray-chateau mb-2" />
                <div className="flex items-center gap-1">
                  <span className="text-startsnap-cerise text-sm font-['Roboto',Helvetica] font-medium">
                    Upload a file
                  </span>
                  <span className="text-startsnap-river-bed text-sm font-['Roboto',Helvetica]">
                    or drag and drop
                  </span>
                </div>
                <p className="text-startsnap-pale-sky text-xs font-['Roboto',Helvetica] mt-1">
                  PNG, JPG, GIF up to 10MB
                </p>
              </div>
            </div>

            {/* Tools Used Tags */}
            <div className="space-y-2">
              <label className="block font-['Space_Grotesk',Helvetica] font-bold text-startsnap-oxford-blue text-lg leading-7">
                Tools Used (press Enter to add)
              </label>
              <Input
                name="toolsInput"
                value={formState.toolsInput}
                onChange={handleChange}
                onKeyDown={handleToolsInputKeyDown}
                placeholder="e.g., React, Bolt.new, TypeScript, Supabase"
                className="border-2 border-solid border-gray-800 rounded-lg p-4 font-['Roboto',Helvetica] text-startsnap-pale-sky"
              />
              <div className="flex flex-wrap gap-2 mt-2">
                {formState.toolsUsed.map((tool, index) => (
                  <Badge 
                    key={index} 
                    className="bg-startsnap-french-pass text-startsnap-persian-blue font-['Space_Mono',Helvetica] text-sm rounded-full border border-solid border-blue-700 px-[13px] py-[5px] flex items-center gap-1"
                  >
                    {tool}
                    <button 
                      type="button" 
                      onClick={() => removeTool(tool)} 
                      className="ml-1 hover:text-red-500"
                    >
                      ×
                    </button>
                  </Badge>
                ))}
              </div>
            </div>

            {/* Looking For Feedback On Tags */}
            <div className="space-y-2">
              <label className="block font-['Space_Grotesk',Helvetica] font-bold text-startsnap-oxford-blue text-lg leading-7">
                Looking For Feedback On (press Enter to add)
              </label>
              <Input
                name="feedbackInput"
                value={formState.feedbackInput}
                onChange={handleChange}
                onKeyDown={handleFeedbackInputKeyDown}
                placeholder="e.g., UI/UX, Performance, Features"
                className="border-2 border-solid border-gray-800 rounded-lg p-4 font-['Roboto',Helvetica] text-startsnap-pale-sky"
              />
              <div className="flex flex-wrap gap-2 mt-2">
                {formState.feedbackAreas.map((feedback, index) => (
                  <Badge 
                    key={index} 
                    className="bg-startsnap-ice-cold text-startsnap-jewel font-['Space_Mono',Helvetica] text-sm rounded-full border border-solid border-green-700 px-[13px] py-[5px] flex items-center gap-1"
                  >
                    {feedback}
                    <button 
                      type="button" 
                      onClick={() => removeFeedback(feedback)} 
                      className="ml-1 hover:text-red-500"
                    >
                      ×
                    </button>
                  </Badge>
                ))}
              </div>
            </div>

            {/* Is Hackathon Entry Checkbox */}
            <div className="flex items-center space-x-2">
              <Checkbox 
                id="hackathon" 
                checked={formState.isHackathon}
                onCheckedChange={handleCheckboxChange}
              />
              <label
                htmlFor="hackathon"
                className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 font-['Roboto',Helvetica] text-startsnap-oxford-blue"
              >
                This is a Hackathon Entry
              </label>
            </div>

            <div className="space-y-2">
              <label className="block font-['Space_Grotesk',Helvetica] font-bold text-startsnap-oxford-blue text-lg leading-7">
                General Tags (comma separated)
              </label>
              <Input
                name="tags"
                value={formState.tags}
                onChange={handleChange}
                placeholder="e.g., AI, SaaS, Mobile"
                className="border-2 border-solid border-gray-800 rounded-lg p-4 font-['Roboto',Helvetica] text-startsnap-pale-sky"
              />
            </div>

            <Separator className="border-gray-300 my-6" />

            {/* Initial Vibe Log Entry */}
            <div className="space-y-2">
              <div className="flex items-center">
                <h3 className="font-['Space_Grotesk',Helvetica] font-bold text-startsnap-oxford-blue text-lg leading-7">
                  Initial Vibe Log Entry
                </h3>
                <span className="ml-2 text-startsnap-corn text-xl material-icons">
                  insights
                </span>
              </div>

              <div className="space-y-4">
                <div className="space-y-2">
                  <label className="block font-['Roboto',Helvetica] text-startsnap-pale-sky text-sm">
                    Entry Type
                  </label>
                  <Select 
                    name="vibeLogType" 
                    value={formState.vibeLogType}
                    onValueChange={(value) => {
                      const newState = { ...formState, vibeLogType: value };
                      setFormState(newState);
                      saveFormState(newState);
                    }}
                  >
                    <SelectTrigger className="border-2 border-solid border-gray-800 rounded-lg h-[52px] font-['Roboto',Helvetica]">
                      <SelectValue placeholder="Select entry type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="launch">🚀 Launch</SelectItem>
                      <SelectItem value="feature">✨ New Feature</SelectItem>
                      <SelectItem value="update">🔄 Update/Fix</SelectItem>
                      <SelectItem value="idea">💡 Idea</SelectItem>
                      <SelectItem value="feedback">🔍 Seeking Feedback</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <label className="block font-['Roboto',Helvetica] text-startsnap-pale-sky text-sm">
                    Entry Title
                  </label>
                  <Input
                    name="vibeLogTitle"
                    value={formState.vibeLogTitle}
                    onChange={handleChange}
                    placeholder="e.g., Project Launch!"
                    className="border-2 border-solid border-gray-800 rounded-lg p-4 font-['Roboto',Helvetica] text-startsnap-pale-sky"
                  />
                </div>

                <div className="space-y-2">
                  <label className="block font-['Roboto',Helvetica] text-startsnap-pale-sky text-sm">
                    Entry Content
                  </label>
                  <Textarea
                    name="vibeLogContent"
                    value={formState.vibeLogContent}
                    onChange={handleChange}
                    placeholder="Share your thoughts about launching this project..."
                    className="border-2 border-solid border-gray-800 rounded-lg p-3.5 min-h-[107px] font-['Roboto',Helvetica] text-startsnap-pale-sky"
                  />
                </div>
              </div>
            </div>

            <div className="flex justify-center gap-4 pt-4">
              <Button
                type="button"
                variant="outline"
                onClick={() => {
                  localStorage.removeItem('createStartSnapForm');
                  navigate('/');
                }}
                className="startsnap-button bg-startsnap-mischka text-startsnap-ebony-clay font-['Roboto',Helvetica] font-bold rounded-lg border-2 border-solid border-gray-800 shadow-[3px_3px_0px_#1f2937]"
              >
                Cancel
              </Button>
              <Button 
                type="submit"
                disabled={loading}
                className="startsnap-button bg-startsnap-french-rose text-startsnap-white font-['Roboto',Helvetica] font-bold rounded-lg border-2 border-solid border-gray-800 shadow-[3px_3px_0px_#1f2937]"
              >
                {loading ? 'Launching...' : 'Launch Project'}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
};