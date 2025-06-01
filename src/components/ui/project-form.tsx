/**
 * src/components/ui/project-form.tsx
 * @description Form component for creating and editing StartSnap projects
 */

import React, { useState } from "react";
import { Card, CardContent } from "./card";
import { Input } from "./input";
import { Textarea } from "./textarea";
import { Button } from "./button";
import { Badge } from "./badge";
import { Checkbox } from "./checkbox";
import { Label } from "./label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "./select";
import { Separator } from "./separator";
import { SegmentedControl } from "./segmented-control";
import { getFormOptions, getVibeLogOptions } from "../../config/categories";

interface ProjectFormProps {
  mode: "create" | "edit";
  onSubmit: (formData: any) => void;
  onCancel: () => void;
  projectId?: string;
  initialData?: any;
}

/**
 * @description Form component for creating and editing StartSnap projects
 * @param {ProjectFormProps} props - Component props
 * @returns {JSX.Element} Project form component with appropriate fields
 */
export const ProjectForm = ({
  mode,
  onSubmit,
  onCancel,
  initialData = {},
}: ProjectFormProps): JSX.Element => {
  const [formData, setFormData] = useState({
    projectType: initialData.projectType || "idea",
    projectName: initialData.projectName || "",
    description: initialData.description || "",
    category: initialData.category || "",
    liveUrl: initialData.liveUrl || "",
    videoUrl: initialData.videoUrl || "",
    tagsInput: initialData.tagsInput || "",
    tags: initialData.tags || [],
    isHackathon: initialData.isHackathon || false,
    toolsInput: initialData.toolsInput || "",
    toolsUsed: initialData.toolsUsed || [],
    feedbackInput: initialData.feedbackInput || "",
    feedbackAreas: initialData.feedbackAreas || [],
    vibeLogType: initialData.vibeLogType || "launch",
    vibeLogTitle: initialData.vibeLogTitle || "",
    vibeLogContent: initialData.vibeLogContent || "",
  });

  const [formErrors, setFormErrors] = useState<Record<string, string>>({});

  // Get category options for dropdown
  const categoryOptions = getFormOptions();
  
  // Get vibe log type options for dropdown
  const vibeLogOptions = getVibeLogOptions();

  // Project type options for segmented control
  const projectTypeOptions = [
    { value: "idea", label: "Idea / Concept" },
    { value: "live", label: "Live Project" },
  ];

  /**
   * @description Handles form input changes
   * @param {React.ChangeEvent<HTMLInputElement|HTMLTextAreaElement>} e - Change event
   */
  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value, type } = e.target as HTMLInputElement;
    
    // Handle checkbox
    if (type === "checkbox") {
      const checked = (e.target as HTMLInputElement).checked;
      setFormData((prev) => ({ ...prev, [name]: checked }));
      return;
    }
    
    setFormData((prev) => ({ ...prev, [name]: value }));
    
    // Clear error when field is edited
    if (formErrors[name]) {
      setFormErrors((prev) => ({ ...prev, [name]: "" }));
    }
  };

  /**
   * @description Handles project type selection
   * @param {string} value - Selected project type
   */
  const handleProjectTypeChange = (value: string) => {
    setFormData((prev) => ({ ...prev, projectType: value }));
  };

  /**
   * @description Handles category selection
   * @param {string} value - Selected category
   */
  const handleCategoryChange = (value: string) => {
    setFormData((prev) => ({ ...prev, category: value }));
    
    if (formErrors.category) {
      setFormErrors((prev) => ({ ...prev, category: "" }));
    }
  };

  /**
   * @description Handles vibe log type selection
   * @param {string} value - Selected vibe log type
   */
  const handleVibeLogTypeChange = (value: string) => {
    setFormData((prev) => ({ ...prev, vibeLogType: value }));
  };

  /**
   * @description Adds a tag to the tags array
   */
  const handleAddTag = () => {
    if (!formData.tagsInput.trim()) return;
    
    const newTag = formData.tagsInput.trim();
    if (formData.tags.includes(newTag)) {
      setFormData((prev) => ({ ...prev, tagsInput: "" }));
      return;
    }
    
    setFormData((prev) => ({
      ...prev,
      tags: [...prev.tags, newTag],
      tagsInput: "",
    }));
  };

  /**
   * @description Removes a tag from the tags array
   * @param {string} tag - Tag to remove
   */
  const handleRemoveTag = (tag: string) => {
    setFormData((prev) => ({
      ...prev,
      tags: prev.tags.filter((t) => t !== tag),
    }));
  };

  /**
   * @description Adds a tool to the tools used array
   */
  const handleAddTool = () => {
    if (!formData.toolsInput.trim()) return;
    
    const newTool = formData.toolsInput.trim();
    if (formData.toolsUsed.includes(newTool)) {
      setFormData((prev) => ({ ...prev, toolsInput: "" }));
      return;
    }
    
    setFormData((prev) => ({
      ...prev,
      toolsUsed: [...prev.toolsUsed, newTool],
      toolsInput: "",
    }));
  };

  /**
   * @description Removes a tool from the tools used array
   * @param {string} tool - Tool to remove
   */
  const handleRemoveTool = (tool: string) => {
    setFormData((prev) => ({
      ...prev,
      toolsUsed: prev.toolsUsed.filter((t) => t !== tool),
    }));
  };

  /**
   * @description Adds a feedback area to the feedback areas array
   */
  const handleAddFeedback = () => {
    if (!formData.feedbackInput.trim()) return;
    
    const newFeedback = formData.feedbackInput.trim();
    if (formData.feedbackAreas.includes(newFeedback)) {
      setFormData((prev) => ({ ...prev, feedbackInput: "" }));
      return;
    }
    
    setFormData((prev) => ({
      ...prev,
      feedbackAreas: [...prev.feedbackAreas, newFeedback],
      feedbackInput: "",
    }));
  };

  /**
   * @description Removes a feedback area from the feedback areas array
   * @param {string} feedback - Feedback area to remove
   */
  const handleRemoveFeedback = (feedback: string) => {
    setFormData((prev) => ({
      ...prev,
      feedbackAreas: prev.feedbackAreas.filter((f) => f !== feedback),
    }));
  };

  /**
   * @description Validates the form before submission
   * @returns {boolean} Whether the form is valid
   */
  const validateForm = () => {
    const errors: Record<string, string> = {};
    
    if (!formData.projectName.trim()) {
      errors.projectName = "Project name is required";
    } else if (formData.projectName.length < 3) {
      errors.projectName = "Project name must be at least 3 characters";
    }
    
    if (!formData.description.trim()) {
      errors.description = "Description is required";
    } else if (formData.description.length < 10) {
      errors.description = "Description must be at least 10 characters";
    }
    
    if (!formData.category) {
      errors.category = "Please select a category";
    }
    
    if (mode === "create" && formData.vibeLogTitle && !formData.vibeLogContent) {
      errors.vibeLogContent = "Please add content for your vibe log";
    }
    
    if (mode === "create" && formData.vibeLogContent && !formData.vibeLogTitle) {
      errors.vibeLogTitle = "Please add a title for your vibe log";
    }
    
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  /**
   * @description Handles form submission
   * @param {React.FormEvent} e - Form event
   */
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }
    
    onSubmit(formData);
  };

  /**
   * @description Handles key press events for tags, tools, and feedback inputs
   * @param {React.KeyboardEvent} e - Keyboard event
   * @param {string} type - Input type
   */
  const handleKeyPress = (e: React.KeyboardEvent, type: string) => {
    if (e.key === "Enter") {
      e.preventDefault();
      if (type === "tags") handleAddTag();
      if (type === "tools") handleAddTool();
      if (type === "feedback") handleAddFeedback();
    }
  };

  return (
    <Card className="w-full max-w-3xl bg-startsnap-white rounded-xl overflow-hidden border-[3px] border-solid border-gray-800 shadow-[5px_5px_0px_#1f2937]">
      <CardContent className="p-8">
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Project Type Selection */}
          <div className="space-y-2">
            <Label className="block font-['Space_Grotesk',Helvetica] font-bold text-startsnap-oxford-blue text-lg">
              StartSnap Type
            </Label>
            <SegmentedControl
              options={projectTypeOptions}
              value={formData.projectType}
              onChange={handleProjectTypeChange}
              className="max-w-md"
            />
          </div>

          {/* Hackathon Checkbox */}
          <div className="flex items-center space-x-2">
            <Checkbox
              id="isHackathon"
              name="isHackathon"
              checked={formData.isHackathon}
              onCheckedChange={(checked) =>
                setFormData((prev) => ({ ...prev, isHackathon: checked as boolean }))
              }
            />
            <Label
              htmlFor="isHackathon"
              className="font-['Roboto',Helvetica] text-startsnap-oxford-blue cursor-pointer"
            >
              This is a Hackathon Entry
            </Label>
          </div>

          {/* Project Name */}
          <div className="space-y-2">
            <Label className="block font-['Space_Grotesk',Helvetica] font-bold text-startsnap-oxford-blue text-lg">
              StartSnap Name<span className="text-red-500">*</span>
            </Label>
            <Input
              name="projectName"
              value={formData.projectName}
              onChange={handleChange}
              placeholder="e.g., My Awesome Idea"
              className="border-2 border-solid border-gray-800 rounded-lg p-4 font-['Roboto',Helvetica] text-startsnap-pale-sky"
            />
            {formErrors.projectName && (
              <p className="text-red-500 text-sm mt-1">{formErrors.projectName}</p>
            )}
          </div>

          {/* Description */}
          <div className="space-y-2">
            <Label className="block font-['Space_Grotesk',Helvetica] font-bold text-startsnap-oxford-blue text-lg">
              Description<span className="text-red-500">*</span>
            </Label>
            <Textarea
              name="description"
              value={formData.description}
              onChange={handleChange}
              placeholder="Briefly describe your project..."
              className="border-2 border-solid border-gray-800 rounded-lg p-3.5 min-h-[120px] font-['Roboto',Helvetica] text-startsnap-pale-sky"
            />
            {formErrors.description && (
              <p className="text-red-500 text-sm mt-1">{formErrors.description}</p>
            )}
          </div>

          {/* Category */}
          <div className="space-y-2">
            <Label className="block font-['Space_Grotesk',Helvetica] font-bold text-startsnap-oxford-blue text-lg">
              Category<span className="text-red-500">*</span>
            </Label>
            <Select value={formData.category} onValueChange={handleCategoryChange}>
              <SelectTrigger className="border-2 border-solid border-gray-800 rounded-lg p-4 font-['Roboto',Helvetica] text-startsnap-pale-sky">
                <SelectValue placeholder="Select a category" />
              </SelectTrigger>
              <SelectContent className="bg-white border-2 border-gray-800">
                {categoryOptions.map((option) => (
                  <SelectItem key={option.value} value={option.value}>
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {formErrors.category && (
              <p className="text-red-500 text-sm mt-1">{formErrors.category}</p>
            )}
          </div>

          {/* Tools Used */}
          <div className="space-y-2">
            <Label className="block font-['Space_Grotesk',Helvetica] font-bold text-startsnap-oxford-blue text-lg">
              Tools (press Enter to add)
            </Label>
            <div className="flex gap-2">
              <Input
                name="toolsInput"
                value={formData.toolsInput}
                onChange={handleChange}
                onKeyPress={(e) => handleKeyPress(e, "tools")}
                placeholder="e.g., React, Bolt.new, TypeScript, Supabase"
                className="border-2 border-solid border-gray-800 rounded-lg p-4 font-['Roboto',Helvetica] text-startsnap-pale-sky flex-1"
              />
              <Button
                type="button"
                onClick={handleAddTool}
                className="startsnap-button bg-startsnap-french-pass text-startsnap-persian-blue font-['Roboto',Helvetica] font-bold rounded-lg border-2 border-solid border-gray-800 shadow-[3px_3px_0px_#1f2937]"
              >
                Add
              </Button>
            </div>
            {formData.toolsUsed.length > 0 && (
              <div className="flex flex-wrap gap-2 mt-2">
                {formData.toolsUsed.map((tool, index) => (
                  <Badge
                    key={index}
                    variant="outline"
                    className="bg-startsnap-french-pass text-startsnap-persian-blue font-['Space_Mono',Helvetica] text-sm rounded-full border border-solid border-blue-700 px-3 py-1.5 flex items-center gap-1"
                  >
                    {tool}
                    <button
                      type="button"
                      onClick={() => handleRemoveTool(tool)}
                      className="ml-1 hover:text-red-500"
                    >
                      <span className="material-icons text-sm">close</span>
                    </button>
                  </Badge>
                ))}
              </div>
            )}
          </div>

          {/* Looking For Feedback On */}
          <div className="space-y-2">
            <Label className="block font-['Space_Grotesk',Helvetica] font-bold text-startsnap-oxford-blue text-lg">
              Looking For Feedback On (press Enter to add)
            </Label>
            <div className="flex gap-2">
              <Input
                name="feedbackInput"
                value={formData.feedbackInput}
                onChange={handleChange}
                onKeyPress={(e) => handleKeyPress(e, "feedback")}
                placeholder="e.g., UI/UX, Performance, Features"
                className="border-2 border-solid border-gray-800 rounded-lg p-4 font-['Roboto',Helvetica] text-startsnap-pale-sky flex-1"
              />
              <Button
                type="button"
                onClick={handleAddFeedback}
                className="startsnap-button bg-startsnap-french-pass text-startsnap-persian-blue font-['Roboto',Helvetica] font-bold rounded-lg border-2 border-solid border-gray-800 shadow-[3px_3px_0px_#1f2937]"
              >
                Add
              </Button>
            </div>
            {formData.feedbackAreas.length > 0 && (
              <div className="flex flex-wrap gap-2 mt-2">
                {formData.feedbackAreas.map((feedback, index) => (
                  <Badge
                    key={index}
                    variant="outline"
                    className="bg-startsnap-ice-cold text-startsnap-jewel font-['Space_Mono',Helvetica] text-sm rounded-full border border-solid border-green-700 px-3 py-1.5 flex items-center gap-1"
                  >
                    {feedback}
                    <button
                      type="button"
                      onClick={() => handleRemoveFeedback(feedback)}
                      className="ml-1 hover:text-red-500"
                    >
                      <span className="material-icons text-sm">close</span>
                    </button>
                  </Badge>
                ))}
              </div>
            )}
          </div>

          {/* External Links Section */}
          <div className="space-y-3">
            <Label className="block font-['Space_Grotesk',Helvetica] font-bold text-startsnap-oxford-blue text-lg">
              External Links (Optional)
            </Label>
            <div className="space-y-4">
              {/* Live Demo URL */}
              <div className="space-y-1">
                <Label className="font-['Roboto',Helvetica] text-startsnap-pale-sky">
                  Live Demo URL
                </Label>
                <Input
                  name="liveUrl"
                  value={formData.liveUrl}
                  onChange={handleChange}
                  placeholder="https://yourdemo.com"
                  className="border-2 border-solid border-gray-800 rounded-lg p-3 font-['Roboto',Helvetica] text-startsnap-pale-sky"
                />
              </div>

              {/* Demo Video URL */}
              <div className="space-y-1">
                <Label className="font-['Roboto',Helvetica] text-startsnap-pale-sky">
                  Demo Video URL
                </Label>
                <Input
                  name="videoUrl"
                  value={formData.videoUrl}
                  onChange={handleChange}
                  placeholder="https://youtube.com/watch?v=..."
                  className="border-2 border-solid border-gray-800 rounded-lg p-3 font-['Roboto',Helvetica] text-startsnap-pale-sky"
                />
              </div>
            </div>
          </div>

          {/* Tags Section */}
          <div className="space-y-2">
            <Label className="block font-['Space_Grotesk',Helvetica] font-bold text-startsnap-oxford-blue text-lg">
              Tags (press Enter to add)
            </Label>
            <div className="flex gap-2">
              <Input
                name="tagsInput"
                value={formData.tagsInput}
                onChange={handleChange}
                onKeyPress={(e) => handleKeyPress(e, "tags")}
                placeholder="e.g., web3, mobile, art"
                className="border-2 border-solid border-gray-800 rounded-lg p-4 font-['Roboto',Helvetica] text-startsnap-pale-sky flex-1"
              />
              <Button
                type="button"
                onClick={handleAddTag}
                className="startsnap-button bg-startsnap-french-pass text-startsnap-persian-blue font-['Roboto',Helvetica] font-bold rounded-lg border-2 border-solid border-gray-800 shadow-[3px_3px_0px_#1f2937]"
              >
                Add
              </Button>
            </div>
            {formData.tags.length > 0 && (
              <div className="flex flex-wrap gap-2 mt-2">
                {formData.tags.map((tag, index) => (
                  <Badge
                    key={index}
                    variant="outline"
                    className="bg-startsnap-athens-gray text-startsnap-ebony-clay font-['Space_Mono',Helvetica] text-sm rounded-full border border-solid border-gray-800 px-3 py-1.5 flex items-center gap-1"
                  >
                    #{tag}
                    <button
                      type="button"
                      onClick={() => handleRemoveTag(tag)}
                      className="ml-1 hover:text-red-500"
                    >
                      <span className="material-icons text-sm">close</span>
                    </button>
                  </Badge>
                ))}
              </div>
            )}
          </div>

          {/* Vibe Log Section (only on create) */}
          {mode === "create" && (
            <>
              <Separator className="my-6" />

              <div className="space-y-4">
                <Label className="block font-['Space_Grotesk',Helvetica] font-bold text-startsnap-oxford-blue text-xl">
                  First Vibe Log (Optional)
                </Label>
                <p className="font-['Roboto',Helvetica] text-startsnap-pale-sky text-sm">
                  Share your first update, idea, or milestone with the community.
                </p>

                <div className="space-y-3">
                  {/* Vibe Log Type */}
                  <div className="space-y-1">
                    <Label className="font-['Space_Grotesk',Helvetica] text-startsnap-oxford-blue font-medium">
                      Log Type
                    </Label>
                    <Select
                      value={formData.vibeLogType}
                      onValueChange={handleVibeLogTypeChange}
                    >
                      <SelectTrigger className="border-2 border-solid border-gray-800 rounded-lg p-3 font-['Roboto',Helvetica] text-startsnap-pale-sky">
                        <SelectValue placeholder="Select log type" />
                      </SelectTrigger>
                      <SelectContent className="bg-white border-2 border-gray-800">
                        {vibeLogOptions.map((option) => (
                          <SelectItem key={option.value} value={option.value}>
                            <div className="flex items-center gap-2">
                              <span className="material-icons text-sm">
                                {option.icon}
                              </span>
                              {option.label}
                            </div>
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  {/* Vibe Log Title */}
                  <div className="space-y-1">
                    <Label className="font-['Space_Grotesk',Helvetica] text-startsnap-oxford-blue font-medium">
                      Title
                    </Label>
                    <Input
                      name="vibeLogTitle"
                      value={formData.vibeLogTitle}
                      onChange={handleChange}
                      placeholder="e.g., Project Launch!"
                      className="border-2 border-solid border-gray-800 rounded-lg p-3 font-['Roboto',Helvetica] text-startsnap-pale-sky"
                    />
                    {formErrors.vibeLogTitle && (
                      <p className="text-red-500 text-sm mt-1">
                        {formErrors.vibeLogTitle}
                      </p>
                    )}
                  </div>

                  {/* Vibe Log Content */}
                  <div className="space-y-1">
                    <Label className="font-['Space_Grotesk',Helvetica] text-startsnap-oxford-blue font-medium">
                      Content
                    </Label>
                    <Textarea
                      name="vibeLogContent"
                      value={formData.vibeLogContent}
                      onChange={handleChange}
                      placeholder="Share your thoughts, progress, or what you're excited about..."
                      className="border-2 border-solid border-gray-800 rounded-lg p-3 min-h-[100px] font-['Roboto',Helvetica] text-startsnap-pale-sky"
                    />
                    {formErrors.vibeLogContent && (
                      <p className="text-red-500 text-sm mt-1">
                        {formErrors.vibeLogContent}
                      </p>
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
              variant="outline"
              className="startsnap-button bg-gray-200 text-startsnap-ebony-clay font-['Roboto',Helvetica] font-bold rounded-lg border-2 border-solid border-gray-800 shadow-[3px_3px_0px_#1f2937]"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              className="startsnap-button bg-startsnap-french-rose text-startsnap-white font-['Roboto',Helvetica] font-bold rounded-lg border-2 border-solid border-gray-800 shadow-[3px_3px_0px_#1f2937]"
            >
              {mode === "create" ? "Launch StartSnap" : "Save Changes"}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
};