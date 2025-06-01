import React, { useState, useEffect } from "react";
import { Button } from "./button";
import { Card, CardContent } from "./card";
import { Label } from "./label";
import { Input } from "./input";
import { Textarea } from "./textarea";
import { VibeLogEntry } from "./vibe-log-entry";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from "./select";
import { Badge } from "./badge";
import { Checkbox } from "./checkbox";
import { Separator } from "./separator";
import { getFormOptions } from "../../config/categories";

interface ProjectFormProps {
  mode: 'create' | 'edit';
  projectId?: string;
  initialData?: any;
  onSubmit: (formData: any) => void;
  onCancel: () => void;
}

export const ProjectForm = ({ mode, projectId, initialData, onSubmit, onCancel }: ProjectFormProps): JSX.Element => {
  const [formState, setFormState] = useState({
    projectType: "idea",
    projectName: "",
    description: "",
    category: "",
    liveUrl: "",
    videoUrl: "",
    tagsInput: "",
    tags: [] as string[],
    isHackathon: false,
    vibeLogType: mode === 'create' ? "idea" : "update",
    vibeLogTitle: mode === 'create' ? "Initial Idea" : "Project Update",
    vibeLogContent: "",
    toolsInput: "",
    toolsUsed: [] as string[],
    feedbackInput: "",
    feedbackAreas: [] as string[]
  });

  // Load initial data for edit mode
  useEffect(() => {
    if (mode === 'edit' && initialData) {
      setFormState(initialData);
    }
  }, [mode, initialData]);

  // Save form state to localStorage in create mode
  useEffect(() => {
    if (mode === 'create') {
      const savedState = localStorage.getItem('createProjectFormState');
      if (savedState) {
        setFormState(JSON.parse(savedState));
      }
    }
  }, [mode]);

  // Update localStorage when form state changes in create mode
  useEffect(() => {
    if (mode === 'create') {
      localStorage.setItem('createProjectFormState', JSON.stringify(formState));
    }
  }, [formState, mode]);

  // Handle form field changes
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormState(prev => ({ ...prev, [name]: value }));
  };

  // Handle checkbox change
  const handleCheckboxChange = (checked: boolean) => {
    setFormState(prev => ({ ...prev, isHackathon: checked }));
  };

  // Handle tools tag input
  const handleToolsInputKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && formState.toolsInput.trim()) {
      e.preventDefault();
      const newTool = formState.toolsInput.trim();
      if (!formState.toolsUsed.includes(newTool)) {
        setFormState(prev => ({
          ...prev,
          toolsUsed: [...prev.toolsUsed, newTool],
          toolsInput: ''
        }));
      }
    }
  };

  // Handle feedback tag input
  const handleFeedbackInputKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && formState.feedbackInput.trim()) {
      e.preventDefault();
      const newFeedback = formState.feedbackInput.trim();
      if (!formState.feedbackAreas.includes(newFeedback)) {
        setFormState(prev => ({
          ...prev,
          feedbackAreas: [...prev.feedbackAreas, newFeedback],
          feedbackInput: ''
        }));
      }
    }
  };

  // Handle general tags input
  const handleTagsInputKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && formState.tagsInput.trim()) {
      e.preventDefault();
      const newTag = formState.tagsInput.trim();
      if (!formState.tags.includes(newTag)) {
        setFormState(prev => ({
          ...prev,
          tags: [...prev.tags, newTag],
          tagsInput: ''
        }));
      }
    }
  };

  // Remove a tool tag
  const removeTool = (tool: string) => {
    setFormState(prev => ({
      ...prev,
      toolsUsed: prev.toolsUsed.filter(t => t !== tool)
    }));
  };

  // Remove a feedback tag
  const removeFeedback = (feedback: string) => {
    setFormState(prev => ({
      ...prev,
      feedbackAreas: prev.feedbackAreas.filter(f => f !== feedback)
    }));
  };

  // Remove a general tag
  const removeTag = (tag: string) => {
    setFormState(prev => ({
      ...prev,
      tags: prev.tags.filter(t => t !== tag)
    }));
  };

  // Handle vibe log changes
  const handleVibeLogTitleChange = (value: string) => {
    setFormState(prev => ({ ...prev, vibeLogTitle: value }));
  };

  const handleVibeLogContentChange = (value: string) => {
    setFormState(prev => ({ ...prev, vibeLogContent: value }));
  };

  const handleVibeLogTypeChange = (value: string) => {
    setFormState(prev => ({ ...prev, vibeLogType: value }));
  };

  // Update vibe log type and title when project type changes
  const handleProjectTypeChange = (newProjectType: string) => {
    setFormState(prev => ({
      ...prev,
      projectType: newProjectType,
      vibeLogType: newProjectType === 'live' ? 'launch' : 'idea',
      vibeLogTitle: mode === 'create' ? (newProjectType === 'live' ? 'Initial Launch' : 'Initial Idea') : prev.vibeLogTitle
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formState.projectName.trim() || !formState.description.trim() || !formState.category) {
      alert('Please fill in all required fields.');
      return;
    }
    onSubmit(formState);
    if (mode === 'create') {
      localStorage.removeItem('createProjectFormState');
    }
  };

  return (
    <Card className="max-w-2xl w-full bg-startsnap-white rounded-xl overflow-hidden border-[3px] border-solid border-gray-800 shadow-[5px_5px_0px_#1f2937]">
      <CardContent className="p-9">
        <form className="space-y-6" onSubmit={handleSubmit}>
          {/* Project Type Selection */}
          <div className="space-y-2">
            <label className="block font-['Space_Grotesk',Helvetica] font-bold text-startsnap-oxford-blue text-lg leading-7">
              StartSnap Type
            </label>
            <div className="flex gap-4">
              <Button
                type="button"
                className={`flex-1 startsnap-button ${
                  formState.projectType === "idea"
                    ? "bg-startsnap-french-rose text-startsnap-white"
                    : "bg-startsnap-mischka text-startsnap-ebony-clay"
                } font-['Roboto',Helvetica] font-bold rounded-lg border-2 border-solid border-gray-800 shadow-[3px_3px_0px_#1f2937]`}
                onClick={() => handleProjectTypeChange("idea")}
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
                onClick={() => handleProjectTypeChange("live")}
              >
                Live Project
              </Button>
            </div>
          </div>

          {/* Hackathon Entry Checkbox */}
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
              StartSnap Name*
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
              onValueChange={(value) => setFormState(prev => ({ ...prev, category: value }))}
              required
            >
              <SelectTrigger className="border-2 border-solid border-gray-800 rounded-lg h-[52px] font-['Roboto',Helvetica]">
                <SelectValue placeholder="Select a category" />
              </SelectTrigger>
              <SelectContent>
                {getFormOptions().map((option) => (
                  <SelectItem key={option.value} value={option.value}>
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Live Demo and Video URLs - Only show for live projects */}
          {formState.projectType === "live" && (
            <>
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
            </>
          )}

          {/* Tools Used Tags */}
          <div className="space-y-2">
            <label className="block font-['Space_Grotesk',Helvetica] font-bold text-startsnap-oxford-blue text-lg leading-7">
              Tools (press Enter to add)
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
                  variant="outline"
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
                  variant="outline"
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

          <div className="space-y-2">
            <label className="block font-['Space_Grotesk',Helvetica] font-bold text-startsnap-oxford-blue text-lg leading-7">
              General Tags (press Enter to add)
            </label>
            <Input
              name="tagsInput"
              value={formState.tagsInput}
              onChange={handleChange}
              onKeyDown={handleTagsInputKeyDown}
              placeholder="e.g., AI, SaaS, Mobile"
              className="border-2 border-solid border-gray-800 rounded-lg p-4 font-['Roboto',Helvetica] text-startsnap-pale-sky"
            />
            <div className="flex flex-wrap gap-2 mt-2">
              {formState.tags.map((tag, index) => (
                <Badge
                  key={index}
                  variant="outline"
                  className="bg-startsnap-athens-gray text-startsnap-ebony-clay font-['Space_Mono',Helvetica] text-sm rounded-full border border-solid border-gray-800 px-[13px] py-[5px] flex items-center gap-1"
                >
                  {tag}
                  <button
                    type="button"
                    onClick={() => removeTag(tag)}
                    className="ml-1 hover:text-red-500"
                  >
                    ×
                  </button>
                </Badge>
              ))}
            </div>
          </div>

          <Separator className="border-gray-300 my-6" />

          {/* Initial Vibe Log Entry Section */}
          {mode === "create" && (
            <div className="space-y-6">
              <h3 className="font-['Space_Grotesk',Helvetica] font-bold text-startsnap-ebony-clay text-2xl leading-8 flex items-center gap-2 mb-6">
                Initial Vibe Log Entry
                <span className="text-startsnap-corn text-2xl material-icons">
                  insights
                </span>
              </h3>

              <VibeLogEntry
                title={formState.vibeLogTitle}
                content={formState.vibeLogContent}
                type={formState.vibeLogType}
                onTitleChange={handleVibeLogTitleChange}
                onContentChange={handleVibeLogContentChange}
                onTypeChange={handleVibeLogTypeChange}
                showAllTypes={false}
                singleOptionType={formState.projectType === 'live' ? 'launch' : 'idea'}
              />
            </div>
          )}

          <div className="flex justify-center gap-4 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={onCancel}
              className="startsnap-button bg-startsnap-mischka text-startsnap-ebony-clay font-['Roboto',Helvetica] font-bold rounded-lg border-2 border-solid border-gray-800 shadow-[3px_3px_0px_#1f2937]"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              className="startsnap-button bg-startsnap-french-rose text-startsnap-white font-['Roboto',Helvetica] font-bold rounded-lg border-2 border-solid border-gray-800 shadow-[3px_3px_0px_#1f2937]"
            >
              {mode === 'create'
                ? (formState.projectType === 'live' ? 'Launch StartSnap' : 'Publish Idea')
                : 'Save Changes'
              }
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
};