/**
 * src/components/ui/project-form.tsx
 * @description Form component for creating and editing StartSnap projects
 */

import React, { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { projectFormSchema } from "../../lib/form-schemas";
import * as z from "zod";
import { Button } from "./button";
import { Input } from "./input";
import { Textarea } from "./textarea";
import { Label } from "./label";
import { Badge } from "./badge";
import { Checkbox } from "./checkbox";
import { Card, CardContent } from "./card";
import { Separator } from "./separator";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "./select";
import { getFormOptions, getVibeLogOptions } from "../../config/categories";
import { SegmentedControl } from "./segmented-control";

type ProjectFormValues = z.infer<typeof projectFormSchema>;

interface ProjectFormProps {
  mode: 'create' | 'edit';
  projectId?: string;
  initialData?: any;
  onSubmit: (data: any) => void;
  onCancel: () => void;
}

/**
 * @description Form component for creating and editing StartSnap projects
 * @param {ProjectFormProps} props - Component props
 * @returns {JSX.Element} Project form component
 */
export const ProjectForm = ({
  mode,
  projectId,
  initialData,
  onSubmit,
  onCancel
}: ProjectFormProps): JSX.Element => {
  const [tags, setTags] = useState<string[]>([]);
  const [tagsInput, setTagsInput] = useState('');
  const [toolsUsed, setToolsUsed] = useState<string[]>([]);
  const [toolsInput, setToolsInput] = useState('');
  const [feedbackAreas, setFeedbackAreas] = useState<string[]>([]);
  const [feedbackInput, setFeedbackInput] = useState('');

  const {
    register,
    handleSubmit,
    formState: { errors },
    setValue,
    watch,
    reset
  } = useForm<ProjectFormValues>({
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
      vibeLogType: mode === 'create' ? 'launch' : undefined,
      vibeLogTitle: '',
      vibeLogContent: ''
    }
  });

  // Watch form values
  const projectType = watch('projectType');
  const isHackathon = watch('isHackathon');

  // Initialize form with initial data if provided (for edit mode)
  useEffect(() => {
    if (initialData) {
      reset(initialData);
      setTags(initialData.tags || []);
      setToolsUsed(initialData.toolsUsed || []);
      setFeedbackAreas(initialData.feedbackAreas || []);
    }
  }, [initialData, reset]);

  // Update form values when arrays change
  useEffect(() => {
    setValue('tags', tags);
  }, [tags, setValue]);

  useEffect(() => {
    setValue('toolsUsed', toolsUsed);
  }, [toolsUsed, setValue]);

  useEffect(() => {
    setValue('feedbackAreas', feedbackAreas);
  }, [feedbackAreas, setValue]);

  /**
   * @description Handles adding a tag to the tags array
   * @param {React.KeyboardEvent} e - Keyboard event
   */
  const handleTagKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && tagsInput.trim()) {
      e.preventDefault();
      if (!tags.includes(tagsInput.trim())) {
        setTags([...tags, tagsInput.trim()]);
      }
      setTagsInput('');
      setValue('tagsInput', '');
    }
  };

  /**
   * @description Handles adding a tool to the tools used array
   * @param {React.KeyboardEvent} e - Keyboard event
   */
  const handleToolKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && toolsInput.trim()) {
      e.preventDefault();
      if (!toolsUsed.includes(toolsInput.trim())) {
        setToolsUsed([...toolsUsed, toolsInput.trim()]);
      }
      setToolsInput('');
      setValue('toolsInput', '');
    }
  };

  /**
   * @description Handles adding a feedback area to the feedback areas array
   * @param {React.KeyboardEvent} e - Keyboard event
   */
  const handleFeedbackKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && feedbackInput.trim()) {
      e.preventDefault();
      if (!feedbackAreas.includes(feedbackInput.trim())) {
        setFeedbackAreas([...feedbackAreas, feedbackInput.trim()]);
      }
      setFeedbackInput('');
      setValue('feedbackInput', '');
    }
  };

  /**
   * @description Removes a tag from the tags array
   * @param {string} tag - Tag to remove
   */
  const removeTag = (tag: string) => {
    setTags(tags.filter(t => t !== tag));
  };

  /**
   * @description Removes a tool from the tools used array
   * @param {string} tool - Tool to remove
   */
  const removeTool = (tool: string) => {
    setToolsUsed(toolsUsed.filter(t => t !== tool));
  };

  /**
   * @description Removes a feedback area from the feedback areas array
   * @param {string} area - Feedback area to remove
   */
  const removeFeedbackArea = (area: string) => {
    setFeedbackAreas(feedbackAreas.filter(a => a !== area));
  };

  /**
   * @description Handles form submission
   * @param {ProjectFormValues} data - Form data
   */
  const onFormSubmit = (data: ProjectFormValues) => {
    // Combine form data with array values
    const formData = {
      ...data,
      tags,
      toolsUsed,
      feedbackAreas
    };
    onSubmit(formData);
  };

  return (
    <Card className="w-full max-w-4xl bg-startsnap-white rounded-xl overflow-hidden border-[3px] border-solid border-gray-800 shadow-[5px_5px_0px_#1f2937]">
      <CardContent className="p-8">
        <form onSubmit={handleSubmit(onFormSubmit)} className="space-y-8">
          {/* Project Type Section */}
          <div className="space-y-4">
            <Label className="block font-['Space_Grotesk',Helvetica] font-bold text-startsnap-oxford-blue text-lg leading-7">
              StartSnap Type
            </Label>
            
            <SegmentedControl
              options={[
                { value: 'idea', label: 'Idea / Concept' },
                { value: 'live', label: 'Live Project' }
              ]}
              value={projectType}
              onChange={(value) => setValue('projectType', value)}
              fullWidth
            />

            <div className="flex items-center space-x-2 mt-4">
              <Checkbox
                id="isHackathon"
                checked={isHackathon}
                onCheckedChange={(checked) => setValue('isHackathon', checked as boolean)}
              />
              <label
                htmlFor="isHackathon"
                className="font-['Roboto',Helvetica] text-startsnap-pale-sky cursor-pointer"
              >
                This is a Hackathon Entry
              </label>
            </div>
          </div>

          <Separator className="bg-gray-200" />

          {/* Basic Info Section */}
          <div className="space-y-4">
            <div className="space-y-2">
              <Label className="block font-['Space_Grotesk',Helvetica] font-bold text-startsnap-oxford-blue text-lg leading-7">
                StartSnap Name*
              </Label>
              <Input
                {...register('projectName')}
                placeholder="Give your project a catchy name"
                className="border-2 border-solid border-gray-800 rounded-lg p-4 font-['Roboto',Helvetica] text-startsnap-pale-sky"
              />
              {errors.projectName && (
                <p className="text-red-500 text-sm mt-1">{errors.projectName.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label className="block font-['Space_Grotesk',Helvetica] font-bold text-startsnap-oxford-blue text-lg leading-7">
                Description*
              </Label>
              <Textarea
                {...register('description')}
                placeholder="Describe your project, its purpose, and what makes it special..."
                className="border-2 border-solid border-gray-800 rounded-lg p-3.5 min-h-[120px] font-['Roboto',Helvetica] text-startsnap-pale-sky"
              />
              {errors.description && (
                <p className="text-red-500 text-sm mt-1">{errors.description.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label className="block font-['Space_Grotesk',Helvetica] font-bold text-startsnap-oxford-blue text-lg leading-7">
                Category*
              </Label>
              <Select
                onValueChange={(value) => setValue('category', value)}
                defaultValue={initialData?.category || ''}
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
                <p className="text-red-500 text-sm mt-1">{errors.category.message}</p>
              )}
            </div>
          </div>

          <Separator className="bg-gray-200" />

          {/* Links Section */}
          <div className="space-y-4">
            <Label className="block font-['Space_Grotesk',Helvetica] font-bold text-startsnap-oxford-blue text-lg leading-7">
              Project Links (Optional)
            </Label>
            
            <div className="space-y-2">
              <Label className="block font-['Roboto',Helvetica] text-startsnap-pale-sky">
                Live Demo URL
              </Label>
              <Input
                {...register('liveUrl')}
                placeholder="https://your-project-demo.com"
                className="border-2 border-solid border-gray-800 rounded-lg p-4 font-['Roboto',Helvetica] text-startsnap-pale-sky"
              />
              {errors.liveUrl && (
                <p className="text-red-500 text-sm mt-1">{errors.liveUrl.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label className="block font-['Roboto',Helvetica] text-startsnap-pale-sky">
                Demo Video URL
              </Label>
              <Input
                {...register('videoUrl')}
                placeholder="https://youtube.com/watch?v=..."
                className="border-2 border-solid border-gray-800 rounded-lg p-4 font-['Roboto',Helvetica] text-startsnap-pale-sky"
              />
              {errors.videoUrl && (
                <p className="text-red-500 text-sm mt-1">{errors.videoUrl.message}</p>
              )}
            </div>
          </div>

          <Separator className="bg-gray-200" />

          {/* Tags Section */}
          <div className="space-y-4">
            <Label className="block font-['Space_Grotesk',Helvetica] font-bold text-startsnap-oxford-blue text-lg leading-7">
              Tags (Optional)
            </Label>
            <div className="space-y-2">
              <Input
                value={tagsInput}
                onChange={(e) => setTagsInput(e.target.value)}
                onKeyDown={handleTagKeyDown}
                placeholder="Add tags and press Enter (e.g., web3, productivity, design)"
                className="border-2 border-solid border-gray-800 rounded-lg p-4 font-['Roboto',Helvetica] text-startsnap-pale-sky"
              />
              <p className="text-sm text-startsnap-pale-sky">Press Enter to add a tag</p>
            </div>

            <div className="flex flex-wrap gap-2">
              {tags.map((tag, index) => (
                <Badge
                  key={index}
                  variant="outline"
                  className="bg-startsnap-athens-gray text-startsnap-ebony-clay font-['Space_Mono',Helvetica] text-sm rounded-full border border-solid border-gray-800 px-3 py-1.5 flex items-center gap-1"
                >
                  #{tag}
                  <button
                    type="button"
                    onClick={() => removeTag(tag)}
                    className="ml-1 text-startsnap-pale-sky hover:text-red-500"
                  >
                    <span className="material-icons text-sm">close</span>
                  </button>
                </Badge>
              ))}
            </div>
          </div>

          <Separator className="bg-gray-200" />

          {/* Tools Used Section */}
          <div className="space-y-4">
            <Label className="block font-['Space_Grotesk',Helvetica] font-bold text-startsnap-oxford-blue text-lg leading-7">
              Tools & Technologies Used (Optional)
            </Label>
            <div className="space-y-2">
              <Input
                value={toolsInput}
                onChange={(e) => setToolsInput(e.target.value)}
                onKeyDown={handleToolKeyDown}
                placeholder="Add tools and press Enter (e.g., React, Node.js, Figma)"
                className="border-2 border-solid border-gray-800 rounded-lg p-4 font-['Roboto',Helvetica] text-startsnap-pale-sky"
              />
              <p className="text-sm text-startsnap-pale-sky">Press Enter to add a tool</p>
            </div>

            <div className="flex flex-wrap gap-2">
              {toolsUsed.map((tool, index) => (
                <Badge
                  key={index}
                  variant="outline"
                  className="bg-startsnap-french-pass text-startsnap-persian-blue font-['Space_Mono',Helvetica] text-sm rounded-full border border-solid border-blue-700 px-3 py-1.5 flex items-center gap-1"
                >
                  {tool}
                  <button
                    type="button"
                    onClick={() => removeTool(tool)}
                    className="ml-1 text-startsnap-persian-blue hover:text-red-500"
                  >
                    <span className="material-icons text-sm">close</span>
                  </button>
                </Badge>
              ))}
            </div>
          </div>

          <Separator className="bg-gray-200" />

          {/* Feedback Areas Section */}
          <div className="space-y-4">
            <Label className="block font-['Space_Grotesk',Helvetica] font-bold text-startsnap-oxford-blue text-lg leading-7">
              Looking for Feedback On (Optional)
            </Label>
            <div className="space-y-2">
              <Input
                value={feedbackInput}
                onChange={(e) => setFeedbackInput(e.target.value)}
                onKeyDown={handleFeedbackKeyDown}
                placeholder="Add feedback areas and press Enter (e.g., UI/UX, Performance, Features)"
                className="border-2 border-solid border-gray-800 rounded-lg p-4 font-['Roboto',Helvetica] text-startsnap-pale-sky"
              />
              <p className="text-sm text-startsnap-pale-sky">Press Enter to add a feedback area</p>
            </div>

            <div className="flex flex-wrap gap-2">
              {feedbackAreas.map((area, index) => (
                <Badge
                  key={index}
                  variant="outline"
                  className="bg-startsnap-ice-cold text-startsnap-jewel font-['Space_Mono',Helvetica] text-sm rounded-full border border-solid border-green-700 px-3 py-1.5 flex items-center gap-1"
                >
                  {area}
                  <button
                    type="button"
                    onClick={() => removeFeedbackArea(area)}
                    className="ml-1 text-startsnap-jewel hover:text-red-500"
                  >
                    <span className="material-icons text-sm">close</span>
                  </button>
                </Badge>
              ))}
            </div>
          </div>

          {/* Vibe Log Section - Only show in create mode */}
          {mode === 'create' && (
            <>
              <Separator className="bg-gray-200" />
              
              <div className="space-y-4">
                <Label className="block font-['Space_Grotesk',Helvetica] font-bold text-startsnap-oxford-blue text-lg leading-7">
                  Initial Vibe Log
                </Label>
                <p className="text-sm text-startsnap-pale-sky">
                  Share your first update about this project. This will appear in the project's vibe log.
                </p>

                <div className="space-y-2">
                  <Label className="block font-['Roboto',Helvetica] text-startsnap-pale-sky">
                    Log Type*
                  </Label>
                  <Select
                    onValueChange={(value) => setValue('vibeLogType', value)}
                    defaultValue="launch"
                  >
                    <SelectTrigger className="border-2 border-solid border-gray-800 rounded-lg p-4 font-['Roboto',Helvetica] text-startsnap-pale-sky">
                      <SelectValue placeholder="Select a log type" />
                    </SelectTrigger>
                    <SelectContent>
                      {getVibeLogOptions().map((option) => (
                        <SelectItem key={option.value} value={option.value}>
                          <div className="flex items-center">
                            <span className="material-icons text-sm mr-2">{option.icon}</span>
                            {option.label}
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label className="block font-['Roboto',Helvetica] text-startsnap-pale-sky">
                    Title*
                  </Label>
                  <Input
                    {...register('vibeLogTitle')}
                    placeholder="E.g., 'Just launched my new project!'"
                    className="border-2 border-solid border-gray-800 rounded-lg p-4 font-['Roboto',Helvetica] text-startsnap-pale-sky"
                  />
                  {errors.vibeLogTitle && (
                    <p className="text-red-500 text-sm mt-1">{errors.vibeLogTitle.message}</p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label className="block font-['Roboto',Helvetica] text-startsnap-pale-sky">
                    Content*
                  </Label>
                  <Textarea
                    {...register('vibeLogContent')}
                    placeholder="Share details about your project launch, progress, or what you're looking for..."
                    className="border-2 border-solid border-gray-800 rounded-lg p-3.5 min-h-[120px] font-['Roboto',Helvetica] text-startsnap-pale-sky"
                  />
                  {errors.vibeLogContent && (
                    <p className="text-red-500 text-sm mt-1">{errors.vibeLogContent.message}</p>
                  )}
                </div>
              </div>
            </>
          )}

          {/* Form Actions */}
          <div className="flex justify-end gap-4 pt-4">
            <Button
              type="button"
              onClick={onCancel}
              variant="outline"
              className="startsnap-button bg-gray-200 text-startsnap-ebony-clay font-['Roboto',Helvetica] font-bold text-base rounded-lg border-2 border-solid border-gray-800 shadow-[3px_3px_0px_#1f2937]"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              className="startsnap-button bg-startsnap-french-rose text-startsnap-white font-['Roboto',Helvetica] font-bold text-base rounded-lg border-2 border-solid border-gray-800 shadow-[3px_3px_0px_#1f2937]"
            >
              {mode === 'create' ? 'Create StartSnap' : 'Save Changes'}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
};