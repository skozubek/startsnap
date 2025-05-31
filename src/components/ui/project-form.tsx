import React, { useState, useEffect } from "react";
import { Button } from "./button";
import { Input } from "./input";
import { Textarea } from "./textarea";
import { Label } from "./label";
import { Badge } from "./badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "./select";
import { Checkbox } from "./checkbox";
import { VibeLogEntry } from "./vibe-log-entry";
import { supabase } from "../../lib/supabase";

type ProjectFormProps = {
  mode: 'create' | 'edit';
  projectId?: string;
  initialData?: any;
  onSubmit: (formData: any) => void;
  onCancel: () => void;
  defaultVibeLogType?: string | boolean;
};

export const ProjectForm = ({
  mode,
  projectId,
  initialData,
  onSubmit,
  onCancel,
  defaultVibeLogType = 'idea'
}: ProjectFormProps): JSX.Element => {
  // Form state
  const [formData, setFormData] = useState({
    projectType: 'idea',
    projectName: '',
    description: '',
    category: '',
    liveUrl: '',
    videoUrl: '',
    tagsInput: '',
    tags: [],
    isHackathon: false,
    toolsInput: '',
    toolsUsed: [],
    feedbackInput: '',
    feedbackAreas: [],
    vibeLogType: typeof defaultVibeLogType === 'string' ? defaultVibeLogType : 'idea',
    vibeLogTitle: '',
    vibeLogContent: ''
  });

  // Existing vibe logs (for edit mode)
  const [existingVibeLogs, setExistingVibeLogs] = useState([]);
  const [loading, setLoading] = useState(mode === 'edit');

  useEffect(() => {
    // If in edit mode and we have a projectId, fetch existing vibe logs
    if (mode === 'edit' && projectId) {
      fetchVibeLogs();
    }
  }, [mode, projectId]);

  useEffect(() => {
    // If initial data is provided, populate the form
    if (initialData) {
      setFormData({
        ...formData,
        ...initialData,
        vibeLogTitle: '',
        vibeLogContent: ''
      });
    }
  }, [initialData]);

  // Update vibeLogType when projectType changes
  useEffect(() => {
    if (typeof defaultVibeLogType === 'boolean' && defaultVibeLogType) {
      setFormData(prev => ({
        ...prev,
        vibeLogType: prev.projectType === 'live' ? 'launch' : 'idea'
      }));
    }
  }, [formData.projectType, defaultVibeLogType]);

  const fetchVibeLogs = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('vibelogs')
        .select('*')
        .eq('startsnap_id', projectId)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setExistingVibeLogs(data || []);
    } catch (error) {
      console.error('Error fetching vibe logs:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSelectChange = (name, value) => {
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleCheckboxChange = (name, checked) => {
    setFormData(prev => ({ ...prev, [name]: checked }));
  };

  const handleTagAdd = () => {
    if (formData.tagsInput.trim()) {
      const newTag = formData.tagsInput.trim().toLowerCase();
      if (!formData.tags.includes(newTag)) {
        setFormData(prev => ({
          ...prev,
          tags: [...prev.tags, newTag],
          tagsInput: ''
        }));
      } else {
        setFormData(prev => ({ ...prev, tagsInput: '' }));
      }
    }
  };

  const handleTagRemove = (tagToRemove) => {
    setFormData(prev => ({
      ...prev,
      tags: prev.tags.filter(tag => tag !== tagToRemove)
    }));
  };

  const handleToolAdd = () => {
    if (formData.toolsInput.trim()) {
      const newTool = formData.toolsInput.trim();
      if (!formData.toolsUsed.includes(newTool)) {
        setFormData(prev => ({
          ...prev,
          toolsUsed: [...prev.toolsUsed, newTool],
          toolsInput: ''
        }));
      } else {
        setFormData(prev => ({ ...prev, toolsInput: '' }));
      }
    }
  };

  const handleToolRemove = (toolToRemove) => {
    setFormData(prev => ({
      ...prev,
      toolsUsed: prev.toolsUsed.filter(tool => tool !== toolToRemove)
    }));
  };

  const handleFeedbackAdd = () => {
    if (formData.feedbackInput.trim()) {
      const newFeedback = formData.feedbackInput.trim();
      if (!formData.feedbackAreas.includes(newFeedback)) {
        setFormData(prev => ({
          ...prev,
          feedbackAreas: [...prev.feedbackAreas, newFeedback],
          feedbackInput: ''
        }));
      } else {
        setFormData(prev => ({ ...prev, feedbackInput: '' }));
      }
    }
  };

  const handleFeedbackRemove = (feedbackToRemove) => {
    setFormData(prev => ({
      ...prev,
      feedbackAreas: prev.feedbackAreas.filter(feedback => feedback !== feedbackToRemove)
    }));
  };

  const handleVibeLogChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit(formData);
  };

  return (
    <form onSubmit={handleSubmit} className="w-full max-w-3xl bg-startsnap-white rounded-xl overflow-hidden border-[3px] border-solid border-gray-800 shadow-[5px_5px_0px_#1f2937] p-8">
      {/* Project Type */}
      <div className="mb-8">
        <Label 
          htmlFor="projectType" 
          className="block font-['Space_Grotesk',Helvetica] font-bold text-startsnap-oxford-blue text-lg leading-7 mb-2"
        >
          Project Type
        </Label>
        <Select 
          value={formData.projectType} 
          onValueChange={(value) => handleSelectChange('projectType', value)}
        >
          <SelectTrigger 
            className="border-2 border-solid border-gray-800 rounded-lg h-[52px] font-['Roboto',Helvetica]"
          >
            <SelectValue placeholder="Select project type" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="idea">💡 Idea / Concept</SelectItem>
            <SelectItem value="live">🚀 Live Project</SelectItem>
          </SelectContent>
        </Select>
        <p className="mt-2 font-['Roboto',Helvetica] text-startsnap-pale-sky text-sm">
          {formData.projectType === 'idea' 
            ? "Share an idea or concept you're thinking about building" 
            : "Share a project you've already launched"}
        </p>
      </div>

      {/* Project Name */}
      <div className="mb-8">
        <Label 
          htmlFor="projectName" 
          className="block font-['Space_Grotesk',Helvetica] font-bold text-startsnap-oxford-blue text-lg leading-7 mb-2"
        >
          Project Name
        </Label>
        <Input
          id="projectName"
          name="projectName"
          value={formData.projectName}
          onChange={handleChange}
          placeholder="Give your project a name"
          className="border-2 border-solid border-gray-800 rounded-lg p-4 font-['Roboto',Helvetica] text-startsnap-pale-sky"
          required
        />
      </div>

      {/* Description */}
      <div className="mb-8">
        <Label 
          htmlFor="description" 
          className="block font-['Space_Grotesk',Helvetica] font-bold text-startsnap-oxford-blue text-lg leading-7 mb-2"
        >
          Description
        </Label>
        <Textarea
          id="description"
          name="description"
          value={formData.description}
          onChange={handleChange}
          placeholder="Describe your project in a few sentences..."
          className="border-2 border-solid border-gray-800 rounded-lg p-3.5 min-h-[120px] font-['Roboto',Helvetica] text-startsnap-pale-sky"
          required
        />
      </div>

      {/* Category */}
      <div className="mb-8">
        <Label 
          htmlFor="category" 
          className="block font-['Space_Grotesk',Helvetica] font-bold text-startsnap-oxford-blue text-lg leading-7 mb-2"
        >
          Category
        </Label>
        <Select 
          value={formData.category} 
          onValueChange={(value) => handleSelectChange('category', value)}
        >
          <SelectTrigger 
            className="border-2 border-solid border-gray-800 rounded-lg h-[52px] font-['Roboto',Helvetica]"
          >
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

      {/* URLs - only show if project type is "live" */}
      {formData.projectType === 'live' && (
        <div className="space-y-8 mb-8">
          <div className="space-y-2">
            <Label 
              htmlFor="liveUrl" 
              className="block font-['Space_Grotesk',Helvetica] font-bold text-startsnap-oxford-blue text-lg leading-7"
            >
              Live URL (optional)
            </Label>
            <Input
              id="liveUrl"
              name="liveUrl"
              value={formData.liveUrl}
              onChange={handleChange}
              placeholder="https://your-project.com"
              className="border-2 border-solid border-gray-800 rounded-lg p-4 font-['Roboto',Helvetica] text-startsnap-pale-sky"
            />
          </div>

          <div className="space-y-2">
            <Label 
              htmlFor="videoUrl" 
              className="block font-['Space_Grotesk',Helvetica] font-bold text-startsnap-oxford-blue text-lg leading-7"
            >
              Demo Video URL (optional)
            </Label>
            <Input
              id="videoUrl"
              name="videoUrl"
              value={formData.videoUrl}
              onChange={handleChange}
              placeholder="https://youtube.com/watch?v=..."
              className="border-2 border-solid border-gray-800 rounded-lg p-4 font-['Roboto',Helvetica] text-startsnap-pale-sky"
            />
          </div>
        </div>
      )}

      {/* Tags */}
      <div className="mb-8">
        <Label 
          htmlFor="tags" 
          className="block font-['Space_Grotesk',Helvetica] font-bold text-startsnap-oxford-blue text-lg leading-7 mb-2"
        >
          Tags
        </Label>
        <div className="flex space-x-2">
          <Input
            id="tagsInput"
            name="tagsInput"
            value={formData.tagsInput}
            onChange={handleChange}
            placeholder="Add tags (e.g., react, beginner-friendly)"
            className="flex-1 border-2 border-solid border-gray-800 rounded-lg p-4 font-['Roboto',Helvetica] text-startsnap-pale-sky"
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                e.preventDefault();
                handleTagAdd();
              }
            }}
          />
          <Button 
            type="button" 
            onClick={handleTagAdd}
            className="startsnap-button bg-startsnap-mischka text-startsnap-ebony-clay font-['Roboto',Helvetica] font-bold rounded-lg border-2 border-solid border-gray-800 shadow-[3px_3px_0px_#1f2937]"
          >
            Add
          </Button>
        </div>
        {formData.tags.length > 0 && (
          <div className="flex flex-wrap gap-2 mt-3">
            {formData.tags.map((tag, index) => (
              <Badge 
                key={index}
                className="bg-startsnap-athens-gray text-startsnap-ebony-clay font-['Space_Mono',Helvetica] text-sm rounded-full border border-solid border-gray-800 px-3 py-1.5 flex items-center gap-1"
              >
                #{tag}
                <button 
                  type="button" 
                  onClick={() => handleTagRemove(tag)}
                  className="text-startsnap-ebony-clay hover:text-startsnap-french-rose transition-colors"
                >
                  <span className="material-icons text-sm">close</span>
                </button>
              </Badge>
            ))}
          </div>
        )}
      </div>

      {/* Hackathon Entry */}
      <div className="flex items-center space-x-2 mb-8">
        <Checkbox 
          id="isHackathon" 
          checked={formData.isHackathon}
          onCheckedChange={(checked) => handleCheckboxChange('isHackathon', checked)}
          className="border-2 border-solid border-gray-800"
        />
        <Label 
          htmlFor="isHackathon" 
          className="font-['Roboto',Helvetica] font-normal text-startsnap-river-bed text-base leading-6"
        >
          This is a hackathon entry
        </Label>
      </div>

      {/* Tools Used */}
      <div className="mb-8">
        <Label 
          htmlFor="toolsUsed" 
          className="block font-['Space_Grotesk',Helvetica] font-bold text-startsnap-oxford-blue text-lg leading-7 mb-2"
        >
          Tools & Technologies Used
        </Label>
        <div className="flex space-x-2">
          <Input
            id="toolsInput"
            name="toolsInput"
            value={formData.toolsInput}
            onChange={handleChange}
            placeholder="Add tools (e.g., React, Node.js, Tailwind)"
            className="flex-1 border-2 border-solid border-gray-800 rounded-lg p-4 font-['Roboto',Helvetica] text-startsnap-pale-sky"
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                e.preventDefault();
                handleToolAdd();
              }
            }}
          />
          <Button 
            type="button" 
            onClick={handleToolAdd}
            className="startsnap-button bg-startsnap-mischka text-startsnap-ebony-clay font-['Roboto',Helvetica] font-bold rounded-lg border-2 border-solid border-gray-800 shadow-[3px_3px_0px_#1f2937]"
          >
            Add
          </Button>
        </div>
        {formData.toolsUsed.length > 0 && (
          <div className="flex flex-wrap gap-2 mt-3">
            {formData.toolsUsed.map((tool, index) => (
              <Badge 
                key={index}
                className="bg-startsnap-french-pass text-startsnap-persian-blue font-['Space_Mono',Helvetica] text-sm rounded-full border border-solid border-blue-700 px-3 py-1.5 flex items-center gap-1"
              >
                {tool}
                <button 
                  type="button" 
                  onClick={() => handleToolRemove(tool)}
                  className="text-startsnap-persian-blue hover:text-startsnap-french-rose transition-colors"
                >
                  <span className="material-icons text-sm">close</span>
                </button>
              </Badge>
            ))}
          </div>
        )}
      </div>

      {/* Looking for Feedback */}
      <div className="mb-8">
        <Label 
          htmlFor="feedbackAreas" 
          className="block font-['Space_Grotesk',Helvetica] font-bold text-startsnap-oxford-blue text-lg leading-7 mb-2"
        >
          Looking for Feedback On
        </Label>
        <div className="flex space-x-2">
          <Input
            id="feedbackInput"
            name="feedbackInput"
            value={formData.feedbackInput}
            onChange={handleChange}
            placeholder="Add feedback areas (e.g., UX, Performance)"
            className="flex-1 border-2 border-solid border-gray-800 rounded-lg p-4 font-['Roboto',Helvetica] text-startsnap-pale-sky"
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                e.preventDefault();
                handleFeedbackAdd();
              }
            }}
          />
          <Button 
            type="button" 
            onClick={handleFeedbackAdd}
            className="startsnap-button bg-startsnap-mischka text-startsnap-ebony-clay font-['Roboto',Helvetica] font-bold rounded-lg border-2 border-solid border-gray-800 shadow-[3px_3px_0px_#1f2937]"
          >
            Add
          </Button>
        </div>
        {formData.feedbackAreas.length > 0 && (
          <div className="flex flex-wrap gap-2 mt-3">
            {formData.feedbackAreas.map((feedback, index) => (
              <Badge 
                key={index}
                className="bg-startsnap-ice-cold text-startsnap-jewel font-['Space_Mono',Helvetica] text-sm rounded-full border border-solid border-green-700 px-3 py-1.5 flex items-center gap-1"
              >
                {feedback}
                <button 
                  type="button" 
                  onClick={() => handleFeedbackRemove(feedback)}
                  className="text-startsnap-jewel hover:text-startsnap-french-rose transition-colors"
                >
                  <span className="material-icons text-sm">close</span>
                </button>
              </Badge>
            ))}
          </div>
        )}
      </div>

      {/* Initial Vibe Log Entry */}
      <div className="mb-8">
        <VibeLogEntry
          title={formData.vibeLogTitle}
          content={formData.vibeLogContent}
          type={formData.vibeLogType}
          onTitleChange={(value) => handleVibeLogChange('vibeLogTitle', value)}
          onContentChange={(value) => handleVibeLogChange('vibeLogContent', value)}
          onTypeChange={(value) => handleVibeLogChange('vibeLogType', value)}
          showOnlyType={typeof defaultVibeLogType === 'boolean' && defaultVibeLogType ? (formData.projectType === 'live' ? 'launch' : 'idea') : null}
        />
      </div>

      {/* Existing Vibe Logs (Edit mode only) */}
      {mode === 'edit' && existingVibeLogs.length > 0 && (
        <div className="mb-8">
          <h3 className="font-['Space_Grotesk',Helvetica] font-bold text-startsnap-oxford-blue text-lg leading-7 mb-4">
            Existing Vibe Log Entries
          </h3>
          <div className="space-y-4">
            {existingVibeLogs.map((log) => (
              <div key={log.id} className="border-2 border-solid border-gray-200 rounded-lg p-4">
                <div className="flex justify-between items-center mb-2">
                  <h4 className="font-['Roboto',Helvetica] font-semibold text-startsnap-oxford-blue">
                    {log.title}
                  </h4>
                  <Badge 
                    className="bg-startsnap-athens-gray text-startsnap-ebony-clay font-['Space_Mono',Helvetica] text-xs rounded-full border border-solid border-gray-800 px-2 py-0.5"
                  >
                    {log.log_type}
                  </Badge>
                </div>
                <p className="font-['Roboto',Helvetica] text-startsnap-river-bed text-sm line-clamp-2">
                  {log.content}
                </p>
                <p className="font-['Inter',Helvetica] text-startsnap-pale-sky text-xs mt-2">
                  {new Date(log.created_at).toLocaleString()}
                </p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Submit & Cancel Buttons */}
      <div className="flex gap-4 justify-center">
        <Button 
          type="button" 
          onClick={onCancel}
          className="startsnap-button bg-startsnap-mischka text-startsnap-ebony-clay font-['Roboto',Helvetica] font-bold rounded-lg border-2 border-solid border-gray-800 shadow-[3px_3px_0px_#1f2937]"
        >
          Cancel
        </Button>
        <Button 
          type="submit"
          className="startsnap-button bg-startsnap-french-rose text-startsnap-white font-['Roboto',Helvetica] font-bold rounded-lg border-2 border-solid border-gray-800 shadow-[3px_3px_0px_#1f2937]"
        >
          {mode === 'create' ? 'Create StartSnap' : 'Update StartSnap'}
        </Button>
      </div>
    </form>
  );
};