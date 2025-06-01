/**
 * src/components/ui/project-form.tsx
 * @description Form component for creating and editing StartSnap projects
 */

import React, { useState, useEffect } from "react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "./select";
import { Separator } from "./separator";
import { Card, CardContent } from "./card";
import { Label } from "./label";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { projectFormSchema } from "src/lib/form-schemas";
import { Button } from "./button";
import { Input } from "./input";
import { Textarea } from "./textarea";
import { Badge } from "./badge";
import { getFormOptions, getVibeLogOptions, VibeLogValue } from "../../config/categories";
import { Checkbox } from "./checkbox";

// Component props interface
interface ProjectFormProps {
  mode: 'create' | 'edit';
  projectId?: string;
  initialData?: any;
  onSubmit: (data: any) => void;
  onCancel: () => void;
}

/**
 * @description Form component for creating or editing StartSnap projects
 * @param {ProjectFormProps} props - Component properties
 * @returns {JSX.Element} Project form with fields for all project data
 */
export const ProjectForm = ({
  mode,
  projectId,
  initialData,
  onSubmit,
  onCancel
}: ProjectFormProps): JSX.Element => {
  // Form state for arrays that need manual management
  const [tags, setTags] = useState<string[]>([]);
  const [toolsUsed, setToolsUsed] = useState<string[]>([]);
  const [feedbackAreas, setFeedbackAreas] = useState<string[]>([]);
  const [selectedType, setSelectedType] = useState<'idea' | 'live'>('idea');

  // React Hook Form setup
  const {
    register,
    handleSubmit,
    formState: { errors },
    setValue,
    watch,
    reset
  } = useForm({
    resolver: zodResolver(projectFormSchema),
    defaultValues: {
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
      vibeLogType: '',
      vibeLogTitle: '',
      vibeLogContent: ''
    }
  });

  // Initialize form with data if in edit mode
  useEffect(() => {
    if (mode === 'edit' && initialData) {
      reset(initialData);
      setTags(initialData.tags || []);
      setToolsUsed(initialData.toolsUsed || []);
      setFeedbackAreas(initialData.feedbackAreas || []);
      setSelectedType(initialData.projectType || 'idea');
    }
  }, [mode, initialData, reset]);

  // Watch for form input changes
  const tagsInput = watch('tagsInput');
  const toolsInput = watch('toolsInput');
  const feedbackInput = watch('feedbackInput');
  const projectType = watch('projectType');

  // Update project type when changed
  useEffect(() => {
    setSelectedType(projectType as 'idea' | 'live');
  }, [projectType]);

  // Tag management functions
  const handleAddTag = () => {
    if (tagsInput && !tags.includes(tagsInput)) {
      const newTags = [...tags, tagsInput];
      setTags(newTags);
      setValue('tags', newTags);
      setValue('tagsInput', '');
    }
  };

  const handleRemoveTag = (tag: string) => {
    const newTags = tags.filter(t => t !== tag);
    setTags(newTags);
    setValue('tags', newTags);
  };

  // Tools management functions
  const handleAddTool = () => {
    if (toolsInput && !toolsUsed.includes(toolsInput)) {
      const newTools = [...toolsUsed, toolsInput];
      setToolsUsed(newTools);
      setValue('toolsUsed', newTools);
      setValue('toolsInput', '');
    }
  };

  const handleRemoveTool = (tool: string) => {
    const newTools = toolsUsed.filter(t => t !== tool);
    setToolsUsed(newTools);
    setValue('toolsUsed', newTools);
  };

  // Feedback areas management functions
  const handleAddFeedback = () => {
    if (feedbackInput && !feedbackAreas.includes(feedbackInput)) {
      const newFeedback = [...feedbackAreas, feedbackInput];
      setFeedbackAreas(newFeedback);
      setValue('feedbackAreas', newFeedback);
      setValue('feedbackInput', '');
    }
  };

  const handleRemoveFeedback = (feedback: string) => {
    const newFeedback = feedbackAreas.filter(f => f !== feedback);
    setFeedbackAreas(newFeedback);
    setValue('feedbackAreas', newFeedback);
  };

  // Form submission
  const onFormSubmit = (data: any) => {
    // Ensure arrays are properly set
    data.tags = tags;
    data.toolsUsed = toolsUsed;
    data.feedbackAreas = feedbackAreas;
    
    onSubmit(data);
  };

  // Handle keyboard input for array fields
  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>, addFn: () => void) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      addFn();
    }
  };

  // Configuration for different project types
  const projectTypeConfig = {
    idea: {
      title: "Idea / Concept",
      color: "bg-startsnap-french-rose text-white"
    },
    live: {
      title: "Live Project",
      color: "bg-startsnap-mischka text-startsnap-ebony-clay"
    }
  };

  return (
    <div className="w-full max-w-4xl">
      <Card className="bg-startsnap-white rounded-xl overflow-hidden border-[3px] border-solid border-gray-800 shadow-[5px_5px_0px_#1f2937]">
        <CardContent className="p-8">
          <form className="space-y-8" onSubmit={handleSubmit(onFormSubmit)}>
            {/* Project Type Selection */}
            <div className="space-y-4">
              <Label className="block font-['Space_Grotesk',Helvetica] font-bold text-startsnap-oxford-blue text-lg leading-7">
                StartSnap Type
              </Label>
              
              <div className="flex gap-4">
                {Object.entries(projectTypeConfig).map(([type, config]) => (
                  <button
                    key={type}
                    type="button"
                    className={`flex-1 py-3 px-6 rounded-lg border-2 border-solid border-gray-800 shadow-[3px_3px_0px_#1f2937] font-['Roboto',Helvetica] font-bold ${
                      selectedType === type ? config.color : "bg-gray-100 text-startsnap-ebony-clay"
                    } transition-all duration-200`}
                    onClick={() => {
                      setValue('projectType', type as 'idea' | 'live');
                      setSelectedType(type as 'idea' | 'live');
                    }}
                  >
                    {config.title}
                  </button>
                ))}
              </div>
              <input type="hidden" {...register('projectType')} />
            </div>

            <div className="flex items-center">
              <Checkbox
                id="isHackathon"
                {...register('isHackathon')}
                className="border-2 border-solid border-gray-800 h-5 w-5"
              />
              <label
                htmlFor="isHackathon"
                className="ml-2 font-['Roboto',Helvetica] text-startsnap-oxford-blue text-base"
              >
                This is a Hackathon Entry
              </label>
            </div>

            <Separator className="bg-gray-200" />

            {/* Project Name */}
            <div className="space-y-2">
              <Label className="block font-['Space_Grotesk',Helvetica] font-bold text-startsnap-oxford-blue text-lg leading-7" htmlFor="projectName">
                StartSnap Name<span className="text-startsnap-french-rose">*</span>
              </Label>
              <Input
                id="projectName"
                {...register('projectName')}
                placeholder="Give your project a catchy name"
                className="border-2 border-solid border-gray-800 rounded-lg p-4 font-['Roboto',Helvetica] text-startsnap-pale-sky"
              />
              {errors.projectName && (
                <p className="text-red-500 text-sm mt-1">{errors.projectName.message as string}</p>
              )}
            </div>

            {/* Project Description */}
            <div className="space-y-2">
              <Label className="block font-['Space_Grotesk',Helvetica] font-bold text-startsnap-oxford-blue text-lg leading-7" htmlFor="description">
                Description<span className="text-startsnap-french-rose">*</span>
              </Label>
              <Textarea
                id="description"
                {...register('description')}
                placeholder="Share what your project does, what problem it solves, and why you're building it"
                className="border-2 border-solid border-gray-800 rounded-lg p-3.5 min-h-[120px] font-['Roboto',Helvetica] text-startsnap-pale-sky"
              />
              {errors.description && (
                <p className="text-red-500 text-sm mt-1">{errors.description.message as string}</p>
              )}
            </div>

            {/* Category Selection */}
            <div className="space-y-2">
              <Label className="block font-['Space_Grotesk',Helvetica] font-bold text-startsnap-oxford-blue text-lg leading-7" htmlFor="category">
                Category<span className="text-startsnap-french-rose">*</span>
              </Label>
              <Select
                {...register('category')}
                onValueChange={(value) => setValue('category', value)}
                value={watch('category')}
              >
                <SelectTrigger className="border-2 border-solid border-gray-800 rounded-lg p-4 font-['Roboto',Helvetica] text-startsnap-pale-sky">
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
              {errors.category && (
                <p className="text-red-500 text-sm mt-1">{errors.category.message as string}</p>
              )}
            </div>

            <Separator className="bg-gray-200" />

            {/* Project Links */}
            <div className="space-y-6">
              <h3 className="font-['Space_Grotesk',Helvetica] font-bold text-startsnap-oxford-blue text-lg leading-7">
                Project Links
              </h3>

              {/* Live Demo URL */}
              <div className="space-y-2">
                <Label className="block font-['Roboto',Helvetica] text-startsnap-oxford-blue text-base" htmlFor="liveUrl">
                  Live Demo URL
                </Label>
                <Input
                  id="liveUrl"
                  {...register('liveUrl')}
                  placeholder="https://your-demo-site.com"
                  className="border-2 border-solid border-gray-800 rounded-lg p-4 font-['Roboto',Helvetica] text-startsnap-pale-sky"
                />
                {errors.liveUrl && (
                  <p className="text-red-500 text-sm mt-1">{errors.liveUrl.message as string}</p>
                )}
              </div>

              {/* Demo Video URL */}
              <div className="space-y-2">
                <Label className="block font-['Roboto',Helvetica] text-startsnap-oxford-blue text-base" htmlFor="videoUrl">
                  Demo Video URL
                </Label>
                <Input
                  id="videoUrl"
                  {...register('videoUrl')}
                  placeholder="https://youtube.com/watch?v=your-video"
                  className="border-2 border-solid border-gray-800 rounded-lg p-4 font-['Roboto',Helvetica] text-startsnap-pale-sky"
                />
                {errors.videoUrl && (
                  <p className="text-red-500 text-sm mt-1">{errors.videoUrl.message as string}</p>
                )}
              </div>
            </div>

            <Separator className="bg-gray-200" />

            {/* Tags */}
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <Label className="block font-['Space_Grotesk',Helvetica] font-bold text-startsnap-oxford-blue text-lg leading-7" htmlFor="tagsInput">
                  Tags
                </Label>
                <p className="text-xs text-startsnap-pale-sky">Help others discover your project</p>
              </div>

              <div className="flex gap-2">
                <Input
                  id="tagsInput"
                  {...register('tagsInput')}
                  placeholder="Add tags (e.g., web3, mobile)"
                  className="border-2 border-solid border-gray-800 rounded-lg p-4 font-['Roboto',Helvetica] text-startsnap-pale-sky flex-1"
                  onKeyDown={(e) => handleKeyDown(e, handleAddTag)}
                />
                <Button
                  type="button"
                  onClick={handleAddTag}
                  className="startsnap-button bg-startsnap-french-rose text-startsnap-white font-['Roboto',Helvetica] font-bold rounded-lg border-2 border-solid border-gray-800 shadow-[3px_3px_0px_#1f2937]"
                >
                  Add
                </Button>
              </div>

              <div className="flex flex-wrap gap-2 mt-2">
                {tags.map((tag, index) => (
                  <Badge
                    key={index}
                    variant="outline"
                    className="bg-startsnap-athens-gray text-startsnap-ebony-clay font-['Space_Mono',Helvetica] text-sm rounded-full border border-solid border-gray-800 px-3 py-1.5 flex items-center gap-1"
                  >
                    #{tag}
                    <button
                      type="button"
                      onClick={() => handleRemoveTag(tag)}
                      className="ml-1 hover:text-startsnap-french-rose"
                    >
                      ×
                    </button>
                  </Badge>
                ))}
              </div>
            </div>

            {/* Tools Used */}
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <Label className="block font-['Space_Grotesk',Helvetica] font-bold text-startsnap-oxford-blue text-lg leading-7" htmlFor="toolsInput">
                  Tools Used
                </Label>
                <p className="text-xs text-startsnap-pale-sky">What technologies/frameworks are you using?</p>
              </div>

              <div className="flex gap-2">
                <Input
                  id="toolsInput"
                  {...register('toolsInput')}
                  placeholder="Add tools (e.g., React, Node.js)"
                  className="border-2 border-solid border-gray-800 rounded-lg p-4 font-['Roboto',Helvetica] text-startsnap-pale-sky flex-1"
                  onKeyDown={(e) => handleKeyDown(e, handleAddTool)}
                />
                <Button
                  type="button"
                  onClick={handleAddTool}
                  className="startsnap-button bg-startsnap-french-rose text-startsnap-white font-['Roboto',Helvetica] font-bold rounded-lg border-2 border-solid border-gray-800 shadow-[3px_3px_0px_#1f2937]"
                >
                  Add
                </Button>
              </div>

              <div className="flex flex-wrap gap-2 mt-2">
                {toolsUsed.map((tool, index) => (
                  <Badge
                    key={index}
                    variant="outline"
                    className="bg-startsnap-french-pass text-startsnap-persian-blue font-['Space_Mono',Helvetica] text-sm rounded-full border border-solid border-blue-700 px-3 py-1.5 flex items-center gap-1"
                  >
                    {tool}
                    <button
                      type="button"
                      onClick={() => handleRemoveTool(tool)}
                      className="ml-1 hover:text-startsnap-french-rose"
                    >
                      ×
                    </button>
                  </Badge>
                ))}
              </div>
            </div>

            {/* Looking for Feedback */}
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <Label className="block font-['Space_Grotesk',Helvetica] font-bold text-startsnap-oxford-blue text-lg leading-7" htmlFor="feedbackInput">
                  Looking for Feedback On
                </Label>
                <p className="text-xs text-startsnap-pale-sky">What specific areas do you want community feedback on?</p>
              </div>

              <div className="flex gap-2">
                <Input
                  id="feedbackInput"
                  {...register('feedbackInput')}
                  placeholder="Add feedback areas (e.g., UI/UX, Performance)"
                  className="border-2 border-solid border-gray-800 rounded-lg p-4 font-['Roboto',Helvetica] text-startsnap-pale-sky flex-1"
                  onKeyDown={(e) => handleKeyDown(e, handleAddFeedback)}
                />
                <Button
                  type="button"
                  onClick={handleAddFeedback}
                  className="startsnap-button bg-startsnap-french-rose text-startsnap-white font-['Roboto',Helvetica] font-bold rounded-lg border-2 border-solid border-gray-800 shadow-[3px_3px_0px_#1f2937]"
                >
                  Add
                </Button>
              </div>

              <div className="flex flex-wrap gap-2 mt-2">
                {feedbackAreas.map((feedback, index) => (
                  <Badge
                    key={index}
                    variant="outline"
                    className="bg-startsnap-ice-cold text-startsnap-jewel font-['Space_Mono',Helvetica] text-sm rounded-full border border-solid border-green-700 px-3 py-1.5 flex items-center gap-1"
                  >
                    {feedback}
                    <button
                      type="button"
                      onClick={() => handleRemoveFeedback(feedback)}
                      className="ml-1 hover:text-startsnap-french-rose"
                    >
                      ×
                    </button>
                  </Badge>
                ))}
              </div>
            </div>

            {/* Vibe Log (only for create mode) */}
            {mode === 'create' && (
              <>
                <Separator className="bg-gray-200" />

                <div className="space-y-6">
                  <div className="flex items-center gap-2">
                    <h3 className="font-['Space_Grotesk',Helvetica] font-bold text-startsnap-oxford-blue text-lg leading-7">
                      Initial Vibe Log
                    </h3>
                    <span className="ml-1 text-startsnap-french-rose text-lg material-icons">
                      auto_awesome
                    </span>
                  </div>
                  <p className="text-startsnap-pale-sky">
                    Share the first update about your project. What inspired you? What are your plans?
                  </p>

                  <div className="space-y-4">
                    <div className="space-y-2">
                      <Label className="block font-['Space_Grotesk',Helvetica] font-bold text-startsnap-oxford-blue text-base" htmlFor="vibeLogType">
                        Log Type<span className="text-startsnap-french-rose">*</span>
                      </Label>
                      <Select
                        {...register('vibeLogType')}
                        onValueChange={(value) => setValue('vibeLogType', value)}
                        value={watch('vibeLogType')}
                      >
                        <SelectTrigger className="border-2 border-solid border-gray-800 rounded-lg p-4 font-['Roboto',Helvetica] text-startsnap-pale-sky">
                          <SelectValue placeholder="Select a log type" />
                        </SelectTrigger>
                        <SelectContent>
                          {getVibeLogOptions().map((option) => (
                            <SelectItem key={option.value} value={option.value}>
                              <div className="flex items-center gap-2">
                                <span className="material-icons text-sm">{option.icon}</span>
                                <span>{option.label}</span>
                              </div>
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      {errors.vibeLogType && (
                        <p className="text-red-500 text-sm mt-1">{errors.vibeLogType.message as string}</p>
                      )}
                    </div>

                    <div className="space-y-2">
                      <Label className="block font-['Space_Grotesk',Helvetica] font-bold text-startsnap-oxford-blue text-base" htmlFor="vibeLogTitle">
                        Title<span className="text-startsnap-french-rose">*</span>
                      </Label>
                      <Input
                        id="vibeLogTitle"
                        {...register('vibeLogTitle')}
                        placeholder="Title for your log entry"
                        className="border-2 border-solid border-gray-800 rounded-lg p-4 font-['Roboto',Helvetica] text-startsnap-pale-sky"
                      />
                      {errors.vibeLogTitle && (
                        <p className="text-red-500 text-sm mt-1">{errors.vibeLogTitle.message as string}</p>
                      )}
                    </div>

                    <div className="space-y-2">
                      <Label className="block font-['Space_Grotesk',Helvetica] font-bold text-startsnap-oxford-blue text-base" htmlFor="vibeLogContent">
                        Content<span className="text-startsnap-french-rose">*</span>
                      </Label>
                      <Textarea
                        id="vibeLogContent"
                        {...register('vibeLogContent')}
                        placeholder="What's on your mind about this project?"
                        className="border-2 border-solid border-gray-800 rounded-lg p-3.5 min-h-[120px] font-['Roboto',Helvetica] text-startsnap-pale-sky"
                      />
                      {errors.vibeLogContent && (
                        <p className="text-red-500 text-sm mt-1">{errors.vibeLogContent.message as string}</p>
                      )}
                    </div>
                  </div>
                </div>
              </>
            )}

            {/* Form Actions */}
            <div className="flex justify-end gap-4 pt-4">
              <Button
                type="button"
                onClick={onCancel}
                className="startsnap-button bg-gray-200 text-startsnap-ebony-clay font-['Roboto',Helvetica] font-bold rounded-lg border-2 border-solid border-gray-800 shadow-[3px_3px_0px_#1f2937]"
              >
                Cancel
              </Button>
              <Button
                type="submit"
                className="startsnap-button bg-startsnap-french-rose text-startsnap-white font-['Roboto',Helvetica] font-bold rounded-lg border-2 border-solid border-gray-800 shadow-[3px_3px_0px_#1f2937]"
              >
                {mode === 'create' ? 'Launch StartSnap' : 'Save Changes'}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
};