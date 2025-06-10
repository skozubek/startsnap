/**
 * src/components/ui/project-form.tsx
 * @description Reusable form component for creating and editing StartSnap projects
 */

import React, { useState, useEffect } from "react";
import { Button } from "./button";
import { Input } from "./input";
import { Label } from "./label";
import { Textarea } from "./textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "./select";
import { Checkbox } from "./checkbox";
import { Card, CardContent } from "./card";
import { Badge } from "./badge";
import { SegmentedControl } from "./segmented-control";
import { VibeLogEntry } from "./vibe-log-entry";
import { ImageUploader } from "./ImageUploader";
import { getFormOptions, getVibeLogOptions } from "../../config/categories";
import { isValidUrl } from "../../lib/utils";
import { X } from "lucide-react";
import { toast } from "sonner";

/**
 * @description Interface for the form state data
 */
interface FormState {
  projectType: 'idea' | 'live';
  projectName: string;
  description: string;
  category: string;
  liveUrl: string;
  videoUrl: string;
  tagsInput: string;
  tags: string[];
  isHackathon: boolean;
  toolsInput: string;
  toolsUsed: string[];
  feedbackInput: string;
  feedbackAreas: string[];
  vibeLogType: string;
  vibeLogTitle: string;
  vibeLogContent: string;
  screenshotUrls: string[];
}

/**
 * @description Props for the ProjectForm component
 */
interface ProjectFormProps {
  mode: 'create' | 'edit';
  projectId?: string;
  initialData?: Partial<FormState>;
  onSubmit: (data: FormState, imagesToDelete?: string[]) => Promise<void>;
  onCancel: () => void;
}

/**
 * @description Reusable form component for creating and editing StartSnap projects
 * @param {ProjectFormProps} props - Component props
 * @returns {JSX.Element} Project form with all necessary fields and validation
 */
export const ProjectForm = ({ mode, projectId, initialData, onSubmit, onCancel }: ProjectFormProps): JSX.Element => {
  const [formState, setFormState] = useState<FormState>({
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
    vibeLogType: 'launch',
    vibeLogTitle: '',
    vibeLogContent: '',
    screenshotUrls: [],
  });

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [imagesToDelete, setImagesToDelete] = useState<string[]>([]);

  // Populate form with initial data when editing
  useEffect(() => {
    if (mode === 'edit' && initialData) {
      setFormState(prev => ({
        ...prev,
        ...initialData,
        screenshotUrls: initialData.screenshotUrls || [],
      }));
    }
  }, [mode, initialData]);

  /**
   * @description Handles input changes for form fields
   * @param {string} field - Field name to update
   * @param {any} value - New value for the field
   */
  const handleInputChange = (field: string, value: any) => {
    setFormState(prev => ({ ...prev, [field]: value }));
    // Clear error when field is edited
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  /**
   * @description Adds a tag to the tags array
   * @param {string} tag - Tag to add
   */
  const addTag = (tag: string) => {
    const trimmedTag = tag.trim();
    if (trimmedTag && !formState.tags.includes(trimmedTag)) {
      setFormState(prev => ({
        ...prev,
        tags: [...prev.tags, trimmedTag],
        tagsInput: ''
      }));
    }
  };

  /**
   * @description Removes a tag from the tags array
   * @param {string} tagToRemove - Tag to remove
   */
  const removeTag = (tagToRemove: string) => {
    setFormState(prev => ({
      ...prev,
      tags: prev.tags.filter(tag => tag !== tagToRemove)
    }));
  };

  /**
   * @description Adds a tool to the tools array
   * @param {string} tool - Tool to add
   */
  const addTool = (tool: string) => {
    const trimmedTool = tool.trim();
    if (trimmedTool && !formState.toolsUsed.includes(trimmedTool)) {
      setFormState(prev => ({
        ...prev,
        toolsUsed: [...prev.toolsUsed, trimmedTool],
        toolsInput: ''
      }));
    }
  };

  /**
   * @description Removes a tool from the tools array
   * @param {string} toolToRemove - Tool to remove
   */
  const removeTool = (toolToRemove: string) => {
    setFormState(prev => ({
      ...prev,
      toolsUsed: prev.toolsUsed.filter(tool => tool !== toolToRemove)
    }));
  };

  /**
   * @description Adds a feedback area to the feedback areas array
   * @param {string} area - Feedback area to add
   */
  const addFeedbackArea = (area: string) => {
    const trimmedArea = area.trim();
    if (trimmedArea && !formState.feedbackAreas.includes(trimmedArea)) {
      setFormState(prev => ({
        ...prev,
        feedbackAreas: [...prev.feedbackAreas, trimmedArea],
        feedbackInput: ''
      }));
    }
  };

  /**
   * @description Removes a feedback area from the feedback areas array
   * @param {string} areaToRemove - Feedback area to remove
   */
  const removeFeedbackArea = (areaToRemove: string) => {
    setFormState(prev => ({
      ...prev,
      feedbackAreas: prev.feedbackAreas.filter(area => area !== areaToRemove)
    }));
  };

  /**
   * @description Handles screenshot upload completion
   * @param {string} url - URL of the uploaded screenshot
   */
  const handleScreenshotUploadComplete = (url: string) => {
    setFormState(prev => ({
      ...prev,
      screenshotUrls: [...prev.screenshotUrls, url]
    }));
  };

  /**
   * @description Handles screenshot removal
   * @param {string} url - URL of the screenshot to remove
   * @sideEffects Updates form state and tracks images for deletion in edit mode
   */
  const handleScreenshotRemove = (url: string) => {
    setFormState(prev => ({
      ...prev,
      screenshotUrls: prev.screenshotUrls.filter(screenshotUrl => screenshotUrl !== url)
    }));

    // Track image for deletion in edit mode
    if (mode === 'edit') {
      setImagesToDelete(prev => [...prev, url]);
    }
  };

  /**
   * @description Validates the form and returns validation errors
   * @returns {Record<string, string>} Object containing validation errors
   */
  const validateForm = (): Record<string, string> => {
    const newErrors: Record<string, string> = {};

    if (!formState.projectName.trim()) {
      newErrors.projectName = 'Project name is required';
    }

    if (!formState.description.trim()) {
      newErrors.description = 'Description is required';
    }

    if (!formState.category) {
      newErrors.category = 'Category is required';
    }

    if (formState.liveUrl && !isValidUrl(formState.liveUrl)) {
      newErrors.liveUrl = 'Please enter a valid URL';
    }

    if (formState.videoUrl && !isValidUrl(formState.videoUrl)) {
      newErrors.videoUrl = 'Please enter a valid URL';
    }

    // Validate screenshot count (max 3)
    if (formState.screenshotUrls.length > 3) {
      newErrors.screenshots = 'Maximum 3 screenshots allowed per project';
    }

    // Only validate vibe log for create mode
    if (mode === 'create') {
      if (!formState.vibeLogTitle.trim()) {
        newErrors.vibeLogTitle = 'Vibe log title is required';
      }

      if (!formState.vibeLogContent.trim()) {
        newErrors.vibeLogContent = 'Vibe log content is required';
      }
    }

    return newErrors;
  };

  /**
   * @description Scrolls to the top of the form to show validation errors
   */
  const scrollToTop = () => {
    const formElement = document.querySelector('.project-form-container');
    if (formElement) {
      formElement.scrollIntoView({
        behavior: 'smooth',
        block: 'start'
      });
    } else {
      // Fallback: scroll to top of page
      window.scrollTo({
        top: 0,
        behavior: 'smooth'
      });
    }
  };

  /**
   * @description Handles form submission
   * @async
   * @sideEffects Calls onSubmit prop with form data and images to delete
   */
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const validationErrors = validateForm();

    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      scrollToTop(); // Scroll to show validation errors
      return;
    }

    setIsSubmitting(true);
    try {
      await onSubmit(formState, imagesToDelete);
    } catch (error) {
      console.error('❌ Form submission error:', error);
      // Add user-friendly error toast if one isn't already shown
      const errorMessage = error instanceof Error ? error.message : '';
      if (!errorMessage.includes('toast') && !errorMessage.includes('error')) {
        toast.error('Submission Failed', {
          description: 'An unexpected error occurred. Please try again.'
        });
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  /**
   * @description Handles key press events for tag/tool inputs
   * @param {React.KeyboardEvent} e - Keyboard event
   * @param {Function} addFunction - Function to call when Enter is pressed
   * @param {string} inputValue - Current input value
   */
  const handleKeyPress = (e: React.KeyboardEvent, addFunction: (value: string) => void, inputValue: string) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      addFunction(inputValue);
    }
  };

  const categoryOptions = getFormOptions();
  const vibeLogOptions = getVibeLogOptions();

  return (
    <Card className="project-form-container w-full max-w-4xl bg-startsnap-white rounded-xl overflow-hidden border-[3px] border-solid border-gray-800 shadow-[5px_5px_0px_#1f2937]">
      <CardContent className="p-8">
        <form onSubmit={handleSubmit} className="space-y-8">
          {/* Project Type */}
          <div className="space-y-3">
            <Label className="font-['Space_Grotesk',Helvetica] font-bold text-startsnap-oxford-blue text-lg leading-7">
              Project Type
            </Label>
            <SegmentedControl
              value={formState.projectType}
              onChange={(value) => handleInputChange('projectType', value)}
            />
          </div>

          {/* Project Name */}
          <div className="space-y-3">
            <Label htmlFor="projectName" className="font-['Space_Grotesk',Helvetica] font-bold text-startsnap-oxford-blue text-lg leading-7">
              Project Name *
            </Label>
            <Input
              id="projectName"
              value={formState.projectName}
              onChange={(e) => handleInputChange('projectName', e.target.value)}
              placeholder="Enter your project name"
              className={`border-2 border-solid ${errors.projectName ? 'border-red-500' : 'border-gray-800'} rounded-lg p-4 font-['Roboto',Helvetica] text-startsnap-pale-sky`}
            />
            {errors.projectName && (
              <p className="text-red-500 text-sm">{errors.projectName}</p>
            )}
          </div>

          {/* Description */}
          <div className="space-y-3">
            <Label htmlFor="description" className="font-['Space_Grotesk',Helvetica] font-bold text-startsnap-oxford-blue text-lg leading-7">
              Description *
            </Label>
            <Textarea
              id="description"
              value={formState.description}
              onChange={(e) => handleInputChange('description', e.target.value)}
              placeholder="Describe your project, what it does, and what makes it special..."
              className={`border-2 border-solid ${errors.description ? 'border-red-500' : 'border-gray-800'} rounded-lg p-3.5 min-h-[120px] font-['Roboto',Helvetica] text-startsnap-pale-sky`}
            />
            {errors.description && (
              <p className="text-red-500 text-sm">{errors.description}</p>
            )}
          </div>

          {/* Category */}
          <div className="space-y-3">
            <Label className="font-['Space_Grotesk',Helvetica] font-bold text-startsnap-oxford-blue text-lg leading-7">
              Category *
            </Label>
            <Select value={formState.category} onValueChange={(value) => handleInputChange('category', value)}>
              <SelectTrigger className={`border-2 border-solid ${errors.category ? 'border-red-500' : 'border-gray-800'} rounded-lg p-4 font-['Roboto',Helvetica]`}>
                <SelectValue placeholder="Select a category" />
              </SelectTrigger>
              <SelectContent>
                {categoryOptions.map((option) => (
                  <SelectItem key={option.value} value={option.value}>
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {errors.category && (
              <p className="text-red-500 text-sm">{errors.category}</p>
            )}
          </div>

          {/* Project Links */}
          <div className="space-y-6">
            <h3 className="font-['Space_Grotesk',Helvetica] font-bold text-startsnap-oxford-blue text-lg leading-7">
              Project Links
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-3">
                <Label htmlFor="liveUrl" className="font-['Space_Grotesk',Helvetica] font-bold text-startsnap-oxford-blue text-base leading-6">
                  Live Demo URL
                </Label>
                <Input
                  id="liveUrl"
                  value={formState.liveUrl}
                  onChange={(e) => handleInputChange('liveUrl', e.target.value)}
                  placeholder="https://your-project.com"
                  className={`border-2 border-solid ${errors.liveUrl ? 'border-red-500' : 'border-gray-800'} rounded-lg p-3 font-['Roboto',Helvetica] text-startsnap-pale-sky`}
                />
                {errors.liveUrl && (
                  <p className="text-red-500 text-sm">{errors.liveUrl}</p>
                )}
              </div>

              <div className="space-y-3">
                <Label htmlFor="videoUrl" className="font-['Space_Grotesk',Helvetica] font-bold text-startsnap-oxford-blue text-base leading-6">
                  Demo Video URL
                </Label>
                <Input
                  id="videoUrl"
                  value={formState.videoUrl}
                  onChange={(e) => handleInputChange('videoUrl', e.target.value)}
                  placeholder="https://youtube.com/watch?v=..."
                  className={`border-2 border-solid ${errors.videoUrl ? 'border-red-500' : 'border-gray-800'} rounded-lg p-3 font-['Roboto',Helvetica] text-startsnap-pale-sky`}
                />
                {errors.videoUrl && (
                  <p className="text-red-500 text-sm">{errors.videoUrl}</p>
                )}
              </div>
            </div>
          </div>

          {/* Project Screenshots */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <Label className="font-['Space_Grotesk',Helvetica] font-bold text-startsnap-oxford-blue text-lg leading-7">
                Project Screenshots
              </Label>
              <span className="text-sm font-['Roboto',Helvetica] text-startsnap-pale-sky">
                {formState.screenshotUrls.length}/3 uploaded
              </span>
            </div>
            <p className="text-sm text-startsnap-pale-sky font-['Roboto',Helvetica]">
              Upload screenshots to showcase your project visually. Maximum 3 images allowed.
            </p>
            <ImageUploader
              onUploadComplete={handleScreenshotUploadComplete}
              onRemove={handleScreenshotRemove}
              existingImageUrls={formState.screenshotUrls}
              mode={mode}
            />
            {errors.screenshots && (
              <p className="text-red-500 text-sm">{errors.screenshots}</p>
            )}
          </div>

          {/* Tags */}
          <div className="space-y-3">
            <Label className="font-['Space_Grotesk',Helvetica] font-bold text-startsnap-oxford-blue text-lg leading-7">
              Tags
            </Label>
            <div className="space-y-3">
              <Input
                value={formState.tagsInput}
                onChange={(e) => handleInputChange('tagsInput', e.target.value)}
                onKeyPress={(e) => handleKeyPress(e, addTag, formState.tagsInput)}
                placeholder="Add tags (press Enter to add)"
                className="border-2 border-solid border-gray-800 rounded-lg p-3 font-['Roboto',Helvetica] text-startsnap-pale-sky"
              />
              {formState.tags.length > 0 && (
                <div className="flex flex-wrap gap-2">
                  {formState.tags.map((tag, index) => (
                    <Badge
                      key={index}
                      variant="outline"
                      className="bg-startsnap-athens-gray text-startsnap-ebony-clay font-['Space_Mono',Helvetica] text-sm rounded-full border border-solid border-gray-800 px-3 py-1 flex items-center gap-2"
                    >
                      #{tag}
                      <button
                        type="button"
                        onClick={() => removeTag(tag)}
                        className="hover:text-red-500"
                      >
                        <X size={14} />
                      </button>
                    </Badge>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Tools Used */}
          <div className="space-y-3">
            <Label className="font-['Space_Grotesk',Helvetica] font-bold text-startsnap-oxford-blue text-lg leading-7">
              Tools Used
            </Label>
            <div className="space-y-3">
              <Input
                value={formState.toolsInput}
                onChange={(e) => handleInputChange('toolsInput', e.target.value)}
                onKeyPress={(e) => handleKeyPress(e, addTool, formState.toolsInput)}
                placeholder="Add tools and technologies (press Enter to add)"
                className="border-2 border-solid border-gray-800 rounded-lg p-3 font-['Roboto',Helvetica] text-startsnap-pale-sky"
              />
              {formState.toolsUsed.length > 0 && (
                <div className="flex flex-wrap gap-2">
                  {formState.toolsUsed.map((tool, index) => (
                    <Badge
                      key={index}
                      variant="outline"
                      className="bg-startsnap-french-pass text-startsnap-persian-blue font-['Space_Mono',Helvetica] text-sm rounded-full border border-solid border-blue-700 px-3 py-1 flex items-center gap-2"
                    >
                      {tool}
                      <button
                        type="button"
                        onClick={() => removeTool(tool)}
                        className="hover:text-red-500"
                      >
                        <X size={14} />
                      </button>
                    </Badge>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Feedback Areas */}
          <div className="space-y-3">
            <Label className="font-['Space_Grotesk',Helvetica] font-bold text-startsnap-oxford-blue text-lg leading-7">
              Feedback Areas
            </Label>
            <p className="text-sm text-startsnap-pale-sky font-['Roboto',Helvetica]">
              What specific aspects would you like feedback on?
            </p>
            <div className="space-y-3">
              <Input
                value={formState.feedbackInput}
                onChange={(e) => handleInputChange('feedbackInput', e.target.value)}
                onKeyPress={(e) => handleKeyPress(e, addFeedbackArea, formState.feedbackInput)}
                placeholder="Add feedback areas (press Enter to add)"
                className="border-2 border-solid border-gray-800 rounded-lg p-3 font-['Roboto',Helvetica] text-startsnap-pale-sky"
              />
              {formState.feedbackAreas.length > 0 && (
                <div className="flex flex-wrap gap-2">
                  {formState.feedbackAreas.map((area, index) => (
                    <Badge
                      key={index}
                      variant="outline"
                      className="bg-startsnap-ice-cold text-startsnap-jewel font-['Space_Mono',Helvetica] text-sm rounded-full border border-solid border-green-700 px-3 py-1 flex items-center gap-2"
                    >
                      {area}
                      <button
                        type="button"
                        onClick={() => removeFeedbackArea(area)}
                        className="hover:text-red-500"
                      >
                        <X size={14} />
                      </button>
                    </Badge>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Hackathon Entry */}
          <div className="flex items-center space-x-3">
            <Checkbox
              id="isHackathon"
              checked={formState.isHackathon}
              onCheckedChange={(checked) => handleInputChange('isHackathon', checked)}
              className="border-2 border-solid border-gray-800"
            />
            <Label htmlFor="isHackathon" className="font-['Roboto',Helvetica] font-medium text-startsnap-oxford-blue text-base leading-6">
              This is a hackathon entry
            </Label>
          </div>

                    {/* Initial Vibe Log (Create mode only) */}
          {mode === 'create' && (
            <div className="space-y-6 border-t-2 border-gray-200 pt-8">
              <h3 className="font-['Space_Grotesk',Helvetica] font-bold text-startsnap-oxford-blue text-xl leading-7">
                Initial Vibe Log Entry *
              </h3>
              <p className="text-sm text-startsnap-pale-sky font-['Roboto',Helvetica]">
                Start documenting your journey with your first vibe log entry.
              </p>

              <VibeLogEntry
                type={formState.vibeLogType}
                title={formState.vibeLogTitle}
                content={formState.vibeLogContent}
                onTypeChange={(type) => handleInputChange('vibeLogType', type)}
                onTitleChange={(title) => handleInputChange('vibeLogTitle', title)}
                onContentChange={(content) => handleInputChange('vibeLogContent', content)}
                showAllTypes={false}
              />

              {/* Display validation errors for vibe log fields */}
              {(errors.vibeLogTitle || errors.vibeLogContent) && (
                <div className="space-y-2">
                  {errors.vibeLogTitle && (
                    <p className="text-red-500 text-sm">• {errors.vibeLogTitle}</p>
                  )}
                  {errors.vibeLogContent && (
                    <p className="text-red-500 text-sm">• {errors.vibeLogContent}</p>
                  )}
                </div>
              )}
            </div>
          )}

          {/* Form Actions */}
          <div className="flex flex-col sm:flex-row gap-4 justify-end pt-6 border-t-2 border-gray-200">
            <Button
              type="button"
              variant="outline"
              onClick={onCancel}
              className="startsnap-button bg-gray-200 text-startsnap-ebony-clay font-['Roboto',Helvetica] font-bold rounded-lg border-2 border-solid border-gray-800 shadow-[3px_3px_0px_#1f2937] order-2 sm:order-1"
              disabled={isSubmitting}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              className="startsnap-button bg-startsnap-french-rose text-startsnap-white font-['Roboto',Helvetica] font-bold rounded-lg border-2 border-solid border-gray-800 shadow-[3px_3px_0px_#1f2937] order-1 sm:order-2"
              disabled={isSubmitting}
            >
              {isSubmitting ? (mode === 'create' ? 'Creating...' : 'Updating...') : (mode === 'create' ? 'Create StartSnap' : 'Update StartSnap')}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
};