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
    <div className="project-form-container w-full max-w-4xl bg-transparent border-0 shadow-none rounded-none overflow-visible md:bg-startsnap-white md:rounded-xl md:overflow-hidden md:border-[3px] md:border-solid md:border-gray-800 md:shadow-[5px_5px_0px_#1f2937]">
      <div className="p-4 md:p-8">
        <form onSubmit={handleSubmit} className="space-y-6 md:space-y-8">
          {/* Project Type */}
          <div className="startsnap-form-group">
            <label className="startsnap-form-label">
              Project Type
            </label>
            <SegmentedControl
              value={formState.projectType}
              onChange={(value) => handleInputChange('projectType', value)}
            />
          </div>

          {/* Project Name */}
          <div className="startsnap-form-group">
            <label htmlFor="projectName" className="startsnap-form-label">
              Project Name *
            </label>
            <Input
              id="projectName"
              value={formState.projectName}
              onChange={(e) => handleInputChange('projectName', e.target.value)}
              placeholder="Enter your project name"
              className="startsnap-form-input"
            />
            {errors.projectName && (
              <p className="text-red-500 text-sm">{errors.projectName}</p>
            )}
          </div>

          {/* Description */}
          <div className="startsnap-form-group">
            <label htmlFor="description" className="startsnap-form-label">
              Description *
            </label>
            <Textarea
              id="description"
              value={formState.description}
              onChange={(e) => handleInputChange('description', e.target.value)}
              placeholder="Describe your project, what it does, and what makes it special..."
              className="startsnap-form-textarea"
            />
            {errors.description && (
              <p className="text-red-500 text-sm">{errors.description}</p>
            )}
          </div>

          {/* Category */}
          <div className="startsnap-form-group">
            <label className="startsnap-form-label">
              Category *
            </label>
            <Select value={formState.category} onValueChange={(value) => handleInputChange('category', value)}>
              <SelectTrigger className="startsnap-form-input">
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

          {/* Hackathon Entry */}
          <div className="flex items-center space-x-3 p-4 bg-startsnap-french-pass rounded-lg border-2 border-solid border-blue-700">
            <Checkbox
              id="isHackathon"
              checked={formState.isHackathon}
              onCheckedChange={(checked) => handleInputChange('isHackathon', checked)}
              className="border-2 border-solid border-blue-700"
            />
            <div className="flex-1">
              <Label htmlFor="isHackathon" className="font-ui text-startsnap-persian-blue text-base leading-6 cursor-pointer">
                This is a hackathon entry
              </Label>
              <p className="text-sm text-startsnap-persian-blue/80 font-body mt-1">
                Mark this project if it was created for a hackathon or competition
              </p>
            </div>
          </div>

          {/* Project Links */}
          <div className="startsnap-form-group">
            <h3 className="startsnap-form-label mb-4">
              Project Links
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="startsnap-form-group">
                <label htmlFor="liveUrl" className="startsnap-form-label">
                  Live Demo URL
                </label>
                <Input
                  id="liveUrl"
                  value={formState.liveUrl}
                  onChange={(e) => handleInputChange('liveUrl', e.target.value)}
                  placeholder="https://your-project.com"
                  className="startsnap-form-input"
                />
                {errors.liveUrl && (
                  <p className="text-red-500 text-sm">{errors.liveUrl}</p>
                )}
              </div>

              <div className="startsnap-form-group">
                <label htmlFor="videoUrl" className="startsnap-form-label">
                  Demo Video URL
                </label>
                <Input
                  id="videoUrl"
                  value={formState.videoUrl}
                  onChange={(e) => handleInputChange('videoUrl', e.target.value)}
                  placeholder="https://youtube.com/watch?v=..."
                  className="startsnap-form-input"
                />
                {errors.videoUrl && (
                  <p className="text-red-500 text-sm">{errors.videoUrl}</p>
                )}
              </div>
            </div>
          </div>

          {/* Project Screenshots */}
          <div className="startsnap-form-group">
            <div className="flex items-center justify-between">
              <label className="startsnap-form-label">
                Project Screenshots
              </label>
              <span className="text-sm font-body text-startsnap-pale-sky">
                {formState.screenshotUrls.length}/3 uploaded
              </span>
            </div>
            <p className="text-sm text-startsnap-pale-sky font-body">
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
          <div className="startsnap-form-group">
            <label className="startsnap-form-label">
              Tags
            </label>
            <div className="space-y-3">
              <Input
                value={formState.tagsInput}
                onChange={(e) => handleInputChange('tagsInput', e.target.value)}
                onKeyPress={(e) => handleKeyPress(e, addTag, formState.tagsInput)}
                placeholder="Add tags (press Enter to add)"
                className="startsnap-form-input"
              />
              {formState.tags.length > 0 && (
                <div className="flex flex-wrap gap-2">
                  {formState.tags.map((tag, index) => (
                    <Badge
                      key={index}
                      variant="outline"
                      className="bg-startsnap-athens-gray text-startsnap-ebony-clay font-mono text-sm rounded-full border border-solid border-gray-800 px-3 py-1 flex items-center gap-2"
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
          <div className="startsnap-form-group">
            <label className="startsnap-form-label">
              Tools Used
            </label>
            <div className="space-y-3">
              <Input
                value={formState.toolsInput}
                onChange={(e) => handleInputChange('toolsInput', e.target.value)}
                onKeyPress={(e) => handleKeyPress(e, addTool, formState.toolsInput)}
                placeholder="Add tools and technologies (press Enter to add)"
                className="startsnap-form-input"
              />
              {formState.toolsUsed.length > 0 && (
                <div className="flex flex-wrap gap-2">
                  {formState.toolsUsed.map((tool, index) => (
                    <Badge
                      key={index}
                      variant="outline"
                      className="bg-startsnap-french-pass text-startsnap-persian-blue font-mono text-sm rounded-full border border-solid border-blue-700 px-3 py-1 flex items-center gap-2"
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

          {/* Initial Vibe Log (Create mode only) */}
          {mode === 'create' && (
            <div className="startsnap-form-group border-t-0 md:border-t-2 md:border-gray-200 pt-4 md:pt-8">
              <h3 className="startsnap-form-label text-xl mb-4">
                Initial Vibe Log Entry *
              </h3>
              <p className="text-sm text-startsnap-pale-sky font-body mb-4">
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
          <div className="startsnap-form-actions">
            <Button
              type="button"
              variant="secondary"
              size="lg"
              onClick={onCancel}
              disabled={isSubmitting}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              variant="primary"
              size="lg"
              disabled={isSubmitting}
            >
              {isSubmitting ? (mode === 'create' ? 'Creating...' : 'Updating...') : (mode === 'create' ? 'Create StartSnap' : 'Update StartSnap')}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};