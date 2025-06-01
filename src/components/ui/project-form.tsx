/**
 * src/components/ui/project-form.tsx
 * @description Form component for creating and editing StartSnap projects
 */

import React, { useState, useEffect } from "react";
import { Card, CardContent } from "./card";
import { Button } from "./button";
import { Input } from "./input";
import { Textarea } from "./textarea";
import { Badge } from "./badge";
import { Separator } from "./separator";
import { Checkbox } from "./checkbox";
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "./select";
import { getFormOptions, getVibeLogOptions } from "../../config/categories";
import { SegmentedControl } from "./segmented-control";

interface ProjectFormProps {
  mode: "create" | "edit";
  onSubmit: (data: any) => void;
  onCancel: () => void;
  initialData?: any;
  projectId?: string;
}

/**
 * @description Form component for creating and editing StartSnap projects
 * @param {ProjectFormProps} props - Component props
 * @returns {JSX.Element} Project form UI component
 */
export function ProjectForm({
  mode,
  onSubmit,
  onCancel,
  initialData,
  projectId,
}: ProjectFormProps): JSX.Element {
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
    toolsInput: "",
    toolsUsed: [] as string[],
    feedbackInput: "",
    feedbackAreas: [] as string[],
    vibeLogType: "launch",
    vibeLogTitle: "",
    vibeLogContent: ""
  });

  const [errors, setErrors] = useState({
    projectName: "",
    description: "",
    category: "",
    liveUrl: "",
    videoUrl: "",
    vibeLogTitle: "",
    vibeLogContent: ""
  });

  // Initialize form with initial data if editing
  useEffect(() => {
    if (mode === "edit" && initialData) {
      setFormState(initialData);
    } else if (mode === "create") {
      // For create mode, set default vibe log title based on project type
      setFormState(prev => ({
        ...prev,
        vibeLogTitle: "Initial Launch",
        vibeLogContent: "Just getting started with my project! More updates coming soon."
      }));
    }
  }, [mode, initialData]);

  // Form validation
  const validateForm = () => {
    const newErrors = {
      projectName: "",
      description: "",
      category: "",
      liveUrl: "",
      videoUrl: "",
      vibeLogTitle: "",
      vibeLogContent: ""
    };

    let isValid = true;

    // Required fields
    if (!formState.projectName.trim() || formState.projectName.length < 3) {
      newErrors.projectName = "Project name must be at least 3 characters";
      isValid = false;
    }

    if (!formState.description.trim() || formState.description.length < 10) {
      newErrors.description = "Description must be at least 10 characters";
      isValid = false;
    }

    if (!formState.category) {
      newErrors.category = "Please select a category";
      isValid = false;
    }

    // URL validation
    const urlRegex = /^(https?:\/\/)?([\da-z.-]+)\.([a-z.]{2,6})([/\w .-]*)*\/?$/;
    
    if (formState.liveUrl && !urlRegex.test(formState.liveUrl)) {
      newErrors.liveUrl = "Please enter a valid URL";
      isValid = false;
    }

    if (formState.videoUrl && !urlRegex.test(formState.videoUrl)) {
      newErrors.videoUrl = "Please enter a valid URL";
      isValid = false;
    }

    // Vibe log validation (only for create mode)
    if (mode === "create" && formState.vibeLogContent.trim()) {
      if (formState.vibeLogTitle.length < 3) {
        newErrors.vibeLogTitle = "Title must be at least 3 characters";
        isValid = false;
      }
      
      if (formState.vibeLogContent.length < 10) {
        newErrors.vibeLogContent = "Content must be at least 10 characters";
        isValid = false;
      }
    }

    setErrors(newErrors);
    return isValid;
  };

  // Handle input changes
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormState(prev => ({ ...prev, [name]: value }));
    
    // Clear error for the field being edited
    if (name in errors && errors[name as keyof typeof errors]) {
      setErrors(prev => ({ ...prev, [name]: "" }));
    }
  };

  // Handle checkbox changes
  const handleCheckboxChange = (checked: boolean) => {
    setFormState(prev => ({ ...prev, isHackathon: checked }));
  };

  // Handle project type changes
  const handleProjectTypeChange = (value: string) => {
    setFormState(prev => ({ ...prev, projectType: value }));
  };

  // Handle select changes
  const handleSelectChange = (name: string, value: string) => {
    setFormState(prev => ({ ...prev, [name]: value }));
    
    // Clear error for the field being edited
    if (name in errors && errors[name as keyof typeof errors]) {
      setErrors(prev => ({ ...prev, [name]: "" }));
    }
  };

  // Handle tag-like inputs (tags, tools, feedback areas)
  const handleTagInput = (type: "tags" | "toolsUsed" | "feedbackAreas", inputName: string) => {
    const inputValue = formState[`${inputName}Input`].trim();
    
    if (inputValue && !formState[type].includes(inputValue)) {
      setFormState(prev => ({
        ...prev,
        [type]: [...prev[type], inputValue],
        [`${inputName}Input`]: ""
      }));
    }
  };

  // Handle tag-like input key press (Enter)
  const handleTagInputKeyPress = (e: React.KeyboardEvent, type: "tags" | "toolsUsed" | "feedbackAreas", inputName: string) => {
    if (e.key === "Enter") {
      e.preventDefault();
      handleTagInput(type, inputName);
    }
  };

  // Remove tag-like item
  const removeItem = (type: "tags" | "toolsUsed" | "feedbackAreas", index: number) => {
    setFormState(prev => ({
      ...prev,
      [type]: prev[type].filter((_, i) => i !== index)
    }));
  };

  // Form submission
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (validateForm()) {
      onSubmit(formState);
    }
  };

  return (
    <Card className="w-full max-w-3xl bg-startsnap-white rounded-xl overflow-hidden border-[3px] border-solid border-gray-800 shadow-[5px_5px_0px_#1f2937]">
      <CardContent className="p-8">
        <form onSubmit={handleSubmit} className="space-y-8">
          {/* Project Type Section */}
          <div className="space-y-4">
            <label className="block font-['Space_Grotesk',Helvetica] font-bold text-startsnap-oxford-blue text-lg leading-7">
              StartSnap Type
            </label>
            
            <SegmentedControl
              options={[
                { value: "idea", label: "Idea / Concept" },
                { value: "live", label: "Live Project" }
              ]}
              value={formState.projectType}
              onChange={handleProjectTypeChange}
            />

            <div className="flex items-center space-x-2 mt-4">
              <Checkbox
                id="hackathon"
                checked={formState.isHackathon}
                onCheckedChange={handleCheckboxChange}
              />
              <label
                htmlFor="hackathon"
                className="font-['Roboto',Helvetica] text-startsnap-oxford-blue cursor-pointer"
              >
                This is a Hackathon Entry
              </label>
            </div>
          </div>

          <Separator className="bg-gray-200" />

          {/* Basic Information Section */}
          <div className="space-y-4">
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
              />
              {errors.projectName && (
                <p className="text-red-500 text-sm mt-1">{errors.projectName}</p>
              )}
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
                className="border-2 border-solid border-gray-800 rounded-lg p-3.5 min-h-[120px] font-['Roboto',Helvetica] text-startsnap-pale-sky"
              />
              {errors.description && (
                <p className="text-red-500 text-sm mt-1">{errors.description}</p>
              )}
            </div>

            <div className="space-y-2">
              <label className="block font-['Space_Grotesk',Helvetica] font-bold text-startsnap-oxford-blue text-lg leading-7">
                Category*
              </label>
              <Select
                value={formState.category}
                onValueChange={(value) => handleSelectChange("category", value)}
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
                <p className="text-red-500 text-sm mt-1">{errors.category}</p>
              )}
            </div>
          </div>

          <Separator className="bg-gray-200" />

          {/* Links Section */}
          <div className="space-y-4">
            <h3 className="font-['Space_Grotesk',Helvetica] font-bold text-startsnap-oxford-blue text-lg leading-7">
              Project Links
            </h3>

            <div className="space-y-2">
              <label className="block font-['Roboto',Helvetica] text-startsnap-pale-sky">
                Live Demo URL
              </label>
              <Input
                name="liveUrl"
                value={formState.liveUrl}
                onChange={handleChange}
                placeholder="https://myproject.com"
                className="border-2 border-solid border-gray-800 rounded-lg p-4 font-['Roboto',Helvetica] text-startsnap-pale-sky"
              />
              {errors.liveUrl && (
                <p className="text-red-500 text-sm mt-1">{errors.liveUrl}</p>
              )}
            </div>

            <div className="space-y-2">
              <label className="block font-['Roboto',Helvetica] text-startsnap-pale-sky">
                Video Demo URL
              </label>
              <Input
                name="videoUrl"
                value={formState.videoUrl}
                onChange={handleChange}
                placeholder="https://youtube.com/watch?v=..."
                className="border-2 border-solid border-gray-800 rounded-lg p-4 font-['Roboto',Helvetica] text-startsnap-pale-sky"
              />
              {errors.videoUrl && (
                <p className="text-red-500 text-sm mt-1">{errors.videoUrl}</p>
              )}
            </div>
          </div>

          <Separator className="bg-gray-200" />

          {/* Tags Section */}
          <div className="space-y-4">
            <div className="space-y-2">
              <label className="block font-['Space_Grotesk',Helvetica] font-bold text-startsnap-oxford-blue text-lg leading-7">
                Tags (press Enter to add)
              </label>
              <Input
                name="tagsInput"
                value={formState.tagsInput}
                onChange={handleChange}
                onKeyPress={(e) => handleTagInputKeyPress(e, "tags", "tags")}
                placeholder="e.g., React, Bolt.new, TypeScript, Supabase"
                className="border-2 border-solid border-gray-800 rounded-lg p-4 font-['Roboto',Helvetica] text-startsnap-pale-sky"
              />
              <div className="flex flex-wrap gap-2 mt-2">
                {formState.tags.map((tag, index) => (
                  <Badge
                    key={`tag-${index}`}
                    variant="outline"
                    className="bg-startsnap-athens-gray text-startsnap-ebony-clay font-['Space_Mono',Helvetica] text-sm rounded-full border border-solid border-gray-800 px-3 py-1 flex items-center gap-2"
                  >
                    #{tag}
                    <button
                      type="button"
                      onClick={() => removeItem("tags", index)}
                      className="text-startsnap-ebony-clay hover:text-startsnap-french-rose"
                    >
                      <span className="material-icons text-sm">close</span>
                    </button>
                  </Badge>
                ))}
              </div>
            </div>

            <div className="space-y-2">
              <label className="block font-['Space_Grotesk',Helvetica] font-bold text-startsnap-oxford-blue text-lg leading-7">
                Tools (press Enter to add)
              </label>
              <Input
                name="toolsInput"
                value={formState.toolsInput}
                onChange={handleChange}
                onKeyPress={(e) => handleTagInputKeyPress(e, "toolsUsed", "tools")}
                placeholder="e.g., React, Bolt.new, TypeScript, Supabase"
                className="border-2 border-solid border-gray-800 rounded-lg p-4 font-['Roboto',Helvetica] text-startsnap-pale-sky"
              />
              <div className="flex flex-wrap gap-2 mt-2">
                {formState.toolsUsed.map((tool, index) => (
                  <Badge
                    key={`tool-${index}`}
                    variant="outline"
                    className="bg-startsnap-french-pass text-startsnap-persian-blue font-['Space_Mono',Helvetica] text-sm rounded-full border border-solid border-blue-700 px-3 py-1 flex items-center gap-2"
                  >
                    {tool}
                    <button
                      type="button"
                      onClick={() => removeItem("toolsUsed", index)}
                      className="text-startsnap-persian-blue hover:text-startsnap-french-rose"
                    >
                      <span className="material-icons text-sm">close</span>
                    </button>
                  </Badge>
                ))}
              </div>
            </div>

            <div className="space-y-2">
              <label className="block font-['Space_Grotesk',Helvetica] font-bold text-startsnap-oxford-blue text-lg leading-7">
                Looking For Feedback On (press Enter to add)
              </label>
              <Input
                name="feedbackInput"
                value={formState.feedbackInput}
                onChange={handleChange}
                onKeyPress={(e) => handleTagInputKeyPress(e, "feedbackAreas", "feedback")}
                placeholder="e.g., UI/UX, Performance, Features"
                className="border-2 border-solid border-gray-800 rounded-lg p-4 font-['Roboto',Helvetica] text-startsnap-pale-sky"
              />
              <div className="flex flex-wrap gap-2 mt-2">
                {formState.feedbackAreas.map((feedback, index) => (
                  <Badge
                    key={`feedback-${index}`}
                    variant="outline"
                    className="bg-startsnap-ice-cold text-startsnap-jewel font-['Space_Mono',Helvetica] text-sm rounded-full border border-solid border-green-700 px-3 py-1 flex items-center gap-2"
                  >
                    {feedback}
                    <button
                      type="button"
                      onClick={() => removeItem("feedbackAreas", index)}
                      className="text-startsnap-jewel hover:text-startsnap-french-rose"
                    >
                      <span className="material-icons text-sm">close</span>
                    </button>
                  </Badge>
                ))}
              </div>
            </div>
          </div>

          {/* Vibe Log Section - Only for create mode */}
          {mode === "create" && (
            <>
              <Separator className="bg-gray-200" />
              <div className="space-y-4">
                <h3 className="font-['Space_Grotesk',Helvetica] font-bold text-startsnap-oxford-blue text-lg leading-7">
                  Initial Vibe Log Entry
                </h3>

                <div className="space-y-2">
                  <label className="block font-['Roboto',Helvetica] text-startsnap-pale-sky">
                    Log Type
                  </label>
                  <Select
                    value={formState.vibeLogType}
                    onValueChange={(value) => handleSelectChange("vibeLogType", value)}
                  >
                    <SelectTrigger className="border-2 border-solid border-gray-800 rounded-lg p-4 font-['Roboto',Helvetica] text-startsnap-pale-sky">
                      <SelectValue placeholder="Select log type" />
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
                </div>

                <div className="space-y-2">
                  <label className="block font-['Roboto',Helvetica] text-startsnap-pale-sky">
                    Title
                  </label>
                  <Input
                    name="vibeLogTitle"
                    value={formState.vibeLogTitle}
                    onChange={handleChange}
                    placeholder="e.g., Just Started Working on This!"
                    className="border-2 border-solid border-gray-800 rounded-lg p-4 font-['Roboto',Helvetica] text-startsnap-pale-sky"
                  />
                  {errors.vibeLogTitle && (
                    <p className="text-red-500 text-sm mt-1">{errors.vibeLogTitle}</p>
                  )}
                </div>

                <div className="space-y-2">
                  <label className="block font-['Roboto',Helvetica] text-startsnap-pale-sky">
                    Content
                  </label>
                  <Textarea
                    name="vibeLogContent"
                    value={formState.vibeLogContent}
                    onChange={handleChange}
                    placeholder="Share your thoughts about starting this project..."
                    className="border-2 border-solid border-gray-800 rounded-lg p-3.5 min-h-[120px] font-['Roboto',Helvetica] text-startsnap-pale-sky"
                  />
                  {errors.vibeLogContent && (
                    <p className="text-red-500 text-sm mt-1">{errors.vibeLogContent}</p>
                  )}
                </div>
              </div>
            </>
          )}

          {/* Form Actions */}
          <div className="flex justify-end space-x-4 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={onCancel}
              className="startsnap-button bg-gray-200 text-startsnap-ebony-clay font-['Roboto',Helvetica] font-bold text-base rounded-lg border-2 border-solid border-gray-800 shadow-[3px_3px_0px_#1f2937]"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              className="startsnap-button bg-startsnap-french-rose text-startsnap-white font-['Roboto',Helvetica] font-bold text-base rounded-lg border-2 border-solid border-gray-800 shadow-[3px_3px_0px_#1f2937]"
            >
              {mode === "create" ? "Launch StartSnap" : "Update StartSnap"}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}