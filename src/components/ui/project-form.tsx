/**
 * src/components/ui/project-form.tsx
 * @description Form component for creating and editing StartSnap projects
 */

import React, { useState, useEffect } from "react";
import { Button } from "./button";
import { Input } from "./input";
import { Textarea } from "./textarea";
import { Card, CardContent } from "./card";
import { Badge } from "./badge";
import { Label } from "./label";
import { getFormOptions, getVibeLogOptions } from "../../config/categories";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { projectFormSchema } from "../../lib/form-schemas";
import * as z from "zod";

interface ProjectFormProps {
  mode: "create" | "edit";
  onSubmit: (data: any) => void;
  onCancel: () => void;
  projectId?: string;
  initialData?: any;
}

type ProjectFormValues = z.infer<typeof projectFormSchema>;

/**
 * @description Form component for creating and editing StartSnap projects
 * @param {ProjectFormProps} props - Component props containing form mode and handlers
 * @returns {JSX.Element} Form with fields for project data
 */
export const ProjectForm = ({
  mode,
  onSubmit,
  onCancel,
  initialData
}: ProjectFormProps): JSX.Element => {
  const [tagsInput, setTagsInput] = useState("");
  const [toolsInput, setToolsInput] = useState("");
  const [feedbackInput, setFeedbackInput] = useState("");

  // Get category and vibe log type options
  const categoryOptions = getFormOptions();
  const vibeLogOptions = getVibeLogOptions();

  const {
    register,
    handleSubmit,
    control,
    setValue,
    watch,
    formState: { errors }
  } = useForm<ProjectFormValues>({
    resolver: zodResolver(projectFormSchema),
    defaultValues: {
      projectType: initialData?.projectType || "idea",
      projectName: initialData?.projectName || "",
      description: initialData?.description || "",
      category: initialData?.category || "",
      liveUrl: initialData?.liveUrl || "",
      videoUrl: initialData?.videoUrl || "",
      tags: initialData?.tags || [],
      isHackathon: initialData?.isHackathon || false,
      toolsUsed: initialData?.toolsUsed || [],
      feedbackAreas: initialData?.feedbackAreas || [],
      vibeLogType: "launch",
      vibeLogTitle: "",
      vibeLogContent: ""
    }
  });

  // Watch values for dynamic UI updates
  const tags = watch("tags");
  const toolsUsed = watch("toolsUsed");
  const feedbackAreas = watch("feedbackAreas");
  const projectType = watch("projectType");

  /**
   * @description Handles adding a new tag from input
   * @param {React.KeyboardEvent} e - Keyboard event
   */
  const handleAddTag = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && tagsInput.trim()) {
      e.preventDefault();
      if (!tags.includes(tagsInput.trim())) {
        setValue("tags", [...tags, tagsInput.trim()]);
      }
      setTagsInput("");
    }
  };

  /**
   * @description Handles adding a new tool from input
   * @param {React.KeyboardEvent} e - Keyboard event
   */
  const handleAddTool = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && toolsInput.trim()) {
      e.preventDefault();
      if (!toolsUsed.includes(toolsInput.trim())) {
        setValue("toolsUsed", [...toolsUsed, toolsInput.trim()]);
      }
      setToolsInput("");
    }
  };

  /**
   * @description Handles adding a new feedback area from input
   * @param {React.KeyboardEvent} e - Keyboard event
   */
  const handleAddFeedback = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && feedbackInput.trim()) {
      e.preventDefault();
      if (!feedbackAreas.includes(feedbackInput.trim())) {
        setValue("feedbackAreas", [...feedbackAreas, feedbackInput.trim()]);
      }
      setFeedbackInput("");
    }
  };

  /**
   * @description Removes a tag from the list
   * @param {string} tag - Tag to remove
   */
  const removeTag = (tag: string) => {
    setValue("tags", tags.filter(t => t !== tag));
  };

  /**
   * @description Removes a tool from the list
   * @param {string} tool - Tool to remove
   */
  const removeTool = (tool: string) => {
    setValue("toolsUsed", toolsUsed.filter(t => t !== tool));
  };

  /**
   * @description Removes a feedback area from the list
   * @param {string} area - Feedback area to remove
   */
  const removeFeedback = (area: string) => {
    setValue("feedbackAreas", feedbackAreas.filter(a => a !== area));
  };

  /**
   * @description Handles form submission with validated data
   * @param {ProjectFormValues} data - Validated form data
   */
  const handleFormSubmit = (data: ProjectFormValues) => {
    onSubmit(data);
  };

  return (
    <Card className="w-full max-w-4xl bg-startsnap-white rounded-xl overflow-hidden border-[3px] border-solid border-gray-800 shadow-[5px_5px_0px_#1f2937]">
      <CardContent className="p-8">
        <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-8">
          {/* Project Type Selection */}
          <div className="space-y-4">
            <Label className="block font-['Space_Grotesk',Helvetica] font-bold text-startsnap-oxford-blue text-lg">
              Project Type
            </Label>
            <div className="flex gap-4">
              <label className={`flex items-center gap-2 p-4 rounded-lg border-2 cursor-pointer transition-colors ${
                projectType === "idea" 
                  ? "bg-startsnap-corn/20 border-startsnap-corn" 
                  : "border-gray-300 hover:bg-gray-100"
              }`}>
                <input
                  type="radio"
                  {...register("projectType")}
                  value="idea"
                  className="sr-only"
                />
                <span className="material-icons text-2xl text-startsnap-ebony-clay">lightbulb</span>
                <span className="font-medium">Idea / Concept</span>
              </label>
              
              <label className={`flex items-center gap-2 p-4 rounded-lg border-2 cursor-pointer transition-colors ${
                projectType === "live" 
                  ? "bg-startsnap-mountain-meadow/20 border-startsnap-mountain-meadow" 
                  : "border-gray-300 hover:bg-gray-100"
              }`}>
                <input
                  type="radio"
                  {...register("projectType")}
                  value="live"
                  className="sr-only"
                />
                <span className="material-icons text-2xl text-startsnap-ebony-clay">rocket_launch</span>
                <span className="font-medium">Live Project</span>
              </label>
            </div>
          </div>

          {/* Project Name */}
          <div className="space-y-2">
            <Label htmlFor="projectName" className="block font-['Space_Grotesk',Helvetica] font-bold text-startsnap-oxford-blue text-lg">
              Project Name
            </Label>
            <Input
              id="projectName"
              {...register("projectName")}
              placeholder="Give your project a catchy name"
              className="border-2 border-solid border-gray-800 rounded-lg p-4 font-['Roboto',Helvetica] text-startsnap-pale-sky"
            />
            {errors.projectName && (
              <p className="text-red-500 text-sm mt-1">{errors.projectName.message}</p>
            )}
          </div>

          {/* Project Description */}
          <div className="space-y-2">
            <Label htmlFor="description" className="block font-['Space_Grotesk',Helvetica] font-bold text-startsnap-oxford-blue text-lg">
              Description
            </Label>
            <Textarea
              id="description"
              {...register("description")}
              placeholder="Describe your project, its purpose, and what problem it solves..."
              className="border-2 border-solid border-gray-800 rounded-lg p-3.5 min-h-[120px] font-['Roboto',Helvetica] text-startsnap-pale-sky"
            />
            {errors.description && (
              <p className="text-red-500 text-sm mt-1">{errors.description.message}</p>
            )}
          </div>

          {/* Category Selection */}
          <div className="space-y-2">
            <Label htmlFor="category" className="block font-['Space_Grotesk',Helvetica] font-bold text-startsnap-oxford-blue text-lg">
              Category
            </Label>
            <Controller
              name="category"
              control={control}
              render={({ field }) => (
                <select
                  id="category"
                  {...field}
                  className="w-full border-2 border-solid border-gray-800 rounded-lg p-4 font-['Roboto',Helvetica] text-startsnap-pale-sky bg-white"
                >
                  <option value="">Select a category</option>
                  {categoryOptions.map((option) => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
              )}
            />
            {errors.category && (
              <p className="text-red-500 text-sm mt-1">{errors.category.message}</p>
            )}
          </div>

          {/* Project URLs */}
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="liveUrl" className="block font-['Space_Grotesk',Helvetica] font-bold text-startsnap-oxford-blue text-lg">
                Live Demo URL (optional)
              </Label>
              <Input
                id="liveUrl"
                {...register("liveUrl")}
                placeholder="https://your-project-demo.com"
                className="border-2 border-solid border-gray-800 rounded-lg p-4 font-['Roboto',Helvetica] text-startsnap-pale-sky"
              />
              {errors.liveUrl && (
                <p className="text-red-500 text-sm mt-1">{errors.liveUrl.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="videoUrl" className="block font-['Space_Grotesk',Helvetica] font-bold text-startsnap-oxford-blue text-lg">
                Demo Video URL (optional)
              </Label>
              <Input
                id="videoUrl"
                {...register("videoUrl")}
                placeholder="https://youtube.com/your-demo-video"
                className="border-2 border-solid border-gray-800 rounded-lg p-4 font-['Roboto',Helvetica] text-startsnap-pale-sky"
              />
              {errors.videoUrl && (
                <p className="text-red-500 text-sm mt-1">{errors.videoUrl.message}</p>
              )}
            </div>
          </div>

          {/* Tags */}
          <div className="space-y-2">
            <Label htmlFor="tagsInput" className="block font-['Space_Grotesk',Helvetica] font-bold text-startsnap-oxford-blue text-lg">
              Tags
            </Label>
            <div className="flex items-center">
              <Input
                id="tagsInput"
                value={tagsInput}
                onChange={(e) => setTagsInput(e.target.value)}
                onKeyDown={handleAddTag}
                placeholder="Add tags and press Enter"
                className="border-2 border-solid border-gray-800 rounded-lg p-4 font-['Roboto',Helvetica] text-startsnap-pale-sky"
              />
            </div>
            <p className="text-sm text-startsnap-pale-sky mt-1">
              Press Enter to add each tag
            </p>

            <div className="flex flex-wrap gap-2 mt-3">
              {tags.map((tag, index) => (
                <Badge
                  key={index}
                  variant="outline"
                  className="bg-startsnap-athens-gray text-startsnap-ebony-clay font-['Space_Mono',Helvetica] text-sm rounded-full border border-solid border-gray-800 px-3 py-1 flex items-center gap-1"
                >
                  #{tag}
                  <button
                    type="button"
                    onClick={() => removeTag(tag)}
                    className="ml-1 text-startsnap-ebony-clay hover:text-red-500"
                  >
                    <span className="material-icons text-sm">close</span>
                  </button>
                </Badge>
              ))}
            </div>
          </div>

          {/* Hackathon Entry */}
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                id="isHackathon"
                {...register("isHackathon")}
                className="w-5 h-5 rounded border-2 border-gray-800"
              />
              <Label htmlFor="isHackathon" className="font-['Space_Grotesk',Helvetica] font-bold text-startsnap-oxford-blue text-lg">
                This is a hackathon entry
              </Label>
            </div>
          </div>

          {/* Tools Used */}
          <div className="space-y-2">
            <Label htmlFor="toolsInput" className="block font-['Space_Grotesk',Helvetica] font-bold text-startsnap-oxford-blue text-lg">
              Tools Used
            </Label>
            <div className="flex items-center">
              <Input
                id="toolsInput"
                value={toolsInput}
                onChange={(e) => setToolsInput(e.target.value)}
                onKeyDown={handleAddTool}
                placeholder="Add tools/technologies and press Enter"
                className="border-2 border-solid border-gray-800 rounded-lg p-4 font-['Roboto',Helvetica] text-startsnap-pale-sky"
              />
            </div>
            <p className="text-sm text-startsnap-pale-sky mt-1">
              E.g., React, Node.js, TailwindCSS, etc.
            </p>

            <div className="flex flex-wrap gap-2 mt-3">
              {toolsUsed.map((tool, index) => (
                <Badge
                  key={index}
                  variant="outline"
                  className="bg-startsnap-french-pass text-startsnap-persian-blue font-['Space_Mono',Helvetica] text-sm rounded-full border border-solid border-blue-700 px-3 py-1 flex items-center gap-1"
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

          {/* Looking for feedback */}
          <div className="space-y-2">
            <Label htmlFor="feedbackInput" className="block font-['Space_Grotesk',Helvetica] font-bold text-startsnap-oxford-blue text-lg">
              Looking for feedback on...
            </Label>
            <div className="flex items-center">
              <Input
                id="feedbackInput"
                value={feedbackInput}
                onChange={(e) => setFeedbackInput(e.target.value)}
                onKeyDown={handleAddFeedback}
                placeholder="Add areas you want feedback on and press Enter"
                className="border-2 border-solid border-gray-800 rounded-lg p-4 font-['Roboto',Helvetica] text-startsnap-pale-sky"
              />
            </div>
            <p className="text-sm text-startsnap-pale-sky mt-1">
              E.g., UI/UX, Performance, Features, etc.
            </p>

            <div className="flex flex-wrap gap-2 mt-3">
              {feedbackAreas.map((area, index) => (
                <Badge
                  key={index}
                  variant="outline"
                  className="bg-startsnap-ice-cold text-startsnap-jewel font-['Space_Mono',Helvetica] text-sm rounded-full border border-solid border-green-700 px-3 py-1 flex items-center gap-1"
                >
                  {area}
                  <button
                    type="button"
                    onClick={() => removeFeedback(area)}
                    className="ml-1 text-startsnap-jewel hover:text-red-500"
                  >
                    <span className="material-icons text-sm">close</span>
                  </button>
                </Badge>
              ))}
            </div>
          </div>

          {/* Vibe Log (only for create mode) */}
          {mode === "create" && (
            <div className="space-y-6 pt-4 border-t border-gray-200">
              <h3 className="font-['Space_Grotesk',Helvetica] font-bold text-startsnap-oxford-blue text-xl">
                Initial Vibe Log Entry
              </h3>
              
              <div className="space-y-2">
                <Label htmlFor="vibeLogType" className="block font-['Space_Grotesk',Helvetica] font-bold text-startsnap-oxford-blue text-lg">
                  Entry Type
                </Label>
                <Controller
                  name="vibeLogType"
                  control={control}
                  render={({ field }) => (
                    <select
                      id="vibeLogType"
                      {...field}
                      className="w-full border-2 border-solid border-gray-800 rounded-lg p-4 font-['Roboto',Helvetica] text-startsnap-pale-sky bg-white"
                    >
                      {vibeLogOptions.map((option) => (
                        <option key={option.value} value={option.value}>
                          {option.label}
                        </option>
                      ))}
                    </select>
                  )}
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="vibeLogTitle" className="block font-['Space_Grotesk',Helvetica] font-bold text-startsnap-oxford-blue text-lg">
                  Entry Title
                </Label>
                <Input
                  id="vibeLogTitle"
                  {...register("vibeLogTitle")}
                  placeholder="E.g., Initial launch, First prototype, etc."
                  className="border-2 border-solid border-gray-800 rounded-lg p-4 font-['Roboto',Helvetica] text-startsnap-pale-sky"
                />
                {errors.vibeLogTitle && (
                  <p className="text-red-500 text-sm mt-1">{errors.vibeLogTitle.message}</p>
                )}
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="vibeLogContent" className="block font-['Space_Grotesk',Helvetica] font-bold text-startsnap-oxford-blue text-lg">
                  Entry Content
                </Label>
                <Textarea
                  id="vibeLogContent"
                  {...register("vibeLogContent")}
                  placeholder="Share your thoughts, progress, and journey..."
                  className="border-2 border-solid border-gray-800 rounded-lg p-3.5 min-h-[120px] font-['Roboto',Helvetica] text-startsnap-pale-sky"
                />
                {errors.vibeLogContent && (
                  <p className="text-red-500 text-sm mt-1">{errors.vibeLogContent.message}</p>
                )}
              </div>
            </div>
          )}

          {/* Form Actions */}
          <div className="flex justify-end gap-4 pt-6">
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
              {mode === "create" ? "Create StartSnap" : "Update StartSnap"}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
};