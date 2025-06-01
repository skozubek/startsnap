/**
 * src/components/ui/project-form.tsx
 * @description Form component for creating and editing StartSnap projects
 */

import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import * as z from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { projectFormSchema } from "../../../lib/form-schemas";
import { Button } from "./button";
import { Input } from "./input";
import { Textarea } from "./textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "./select";
import { Separator } from "./separator";
import { Badge } from "./badge";
import { Card, CardContent } from "./card";
import { Label } from "./label";
import { Checkbox } from "./checkbox";
import { getFormOptions, getVibeLogOptions } from "../../../config/categories";

interface ProjectFormProps {
  mode: "create" | "edit";
  projectId?: string;
  initialData?: any;
  onSubmit: (data: any) => void;
  onCancel: () => void;
}

type FormValues = z.infer<typeof projectFormSchema>;

/**
 * @description Form component for creating and editing StartSnap projects
 * @param {ProjectFormProps} props - Component props containing mode, projectId, initialData, onSubmit, and onCancel
 * @returns {JSX.Element} Form component with fields for project details
 */
export const ProjectForm = ({ mode, initialData, onSubmit, onCancel }: ProjectFormProps): JSX.Element => {
  const [tags, setTags] = useState<string[]>([]);
  const [tagsInput, setTagsInput] = useState("");
  const [toolsUsed, setToolsUsed] = useState<string[]>([]);
  const [toolsInput, setToolsInput] = useState("");
  const [feedbackAreas, setFeedbackAreas] = useState<string[]>([]);
  const [feedbackInput, setFeedbackInput] = useState("");
  const [showVibeLogSection, setShowVibeLogSection] = useState(mode === 'create');

  const {
    register,
    handleSubmit,
    formState: { errors },
    setValue,
    watch,
    reset,
  } = useForm<FormValues>({
    resolver: zodResolver(projectFormSchema),
    defaultValues: mode === "edit" && initialData
      ? initialData
      : {
          projectType: "idea",
          projectName: "",
          description: "",
          category: "",
          liveUrl: "",
          videoUrl: "",
          tagsInput: "",
          tags: [],
          isHackathon: false,
          toolsInput: "",
          toolsUsed: [],
          feedbackInput: "",
          feedbackAreas: [],
          vibeLogType: "launch",
          vibeLogTitle: "",
          vibeLogContent: "",
        },
  });

  // Watch form values for conditional rendering
  const projectType = watch("projectType");
  const isHackathon = watch("isHackathon");

  // Initialize state values from form when in edit mode
  useEffect(() => {
    if (mode === "edit" && initialData) {
      setTags(initialData.tags || []);
      setToolsUsed(initialData.toolsUsed || []);
      setFeedbackAreas(initialData.feedbackAreas || []);
    }
  }, [mode, initialData]);

  /**
   * @description Handles adding a tag to the tags array
   * @param {React.KeyboardEvent<HTMLInputElement>} e - Keyboard event
   */
  const handleTagKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" && tagsInput.trim()) {
      e.preventDefault();
      if (!tags.includes(tagsInput.trim())) {
        const newTags = [...tags, tagsInput.trim()];
        setTags(newTags);
        setValue("tags", newTags);
      }
      setTagsInput("");
      setValue("tagsInput", "");
    }
  };

  /**
   * @description Handles removing a tag from the tags array
   * @param {string} tag - Tag to remove
   */
  const handleRemoveTag = (tag: string) => {
    const newTags = tags.filter((t) => t !== tag);
    setTags(newTags);
    setValue("tags", newTags);
  };

  /**
   * @description Handles adding a tool to the tools array
   * @param {React.KeyboardEvent<HTMLInputElement>} e - Keyboard event
   */
  const handleToolKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" && toolsInput.trim()) {
      e.preventDefault();
      if (!toolsUsed.includes(toolsInput.trim())) {
        const newTools = [...toolsUsed, toolsInput.trim()];
        setToolsUsed(newTools);
        setValue("toolsUsed", newTools);
      }
      setToolsInput("");
      setValue("toolsInput", "");
    }
  };

  /**
   * @description Handles removing a tool from the tools array
   * @param {string} tool - Tool to remove
   */
  const handleRemoveTool = (tool: string) => {
    const newTools = toolsUsed.filter((t) => t !== tool);
    setToolsUsed(newTools);
    setValue("toolsUsed", newTools);
  };

  /**
   * @description Handles adding a feedback area to the feedback areas array
   * @param {React.KeyboardEvent<HTMLInputElement>} e - Keyboard event
   */
  const handleFeedbackKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" && feedbackInput.trim()) {
      e.preventDefault();
      if (!feedbackAreas.includes(feedbackInput.trim())) {
        const newFeedback = [...feedbackAreas, feedbackInput.trim()];
        setFeedbackAreas(newFeedback);
        setValue("feedbackAreas", newFeedback);
      }
      setFeedbackInput("");
      setValue("feedbackInput", "");
    }
  };

  /**
   * @description Handles removing a feedback area from the feedback areas array
   * @param {string} feedback - Feedback area to remove
   */
  const handleRemoveFeedback = (feedback: string) => {
    const newFeedback = feedbackAreas.filter((f) => f !== feedback);
    setFeedbackAreas(newFeedback);
    setValue("feedbackAreas", newFeedback);
  };

  /**
   * @description Updates form data and invokes onSubmit callback
   * @param {FormValues} data - Validated form data
   */
  const onFormSubmit = (data: FormValues) => {
    // Ensure arrays are properly set
    data.tags = tags;
    data.toolsUsed = toolsUsed;
    data.feedbackAreas = feedbackAreas;

    // Call the passed onSubmit handler
    onSubmit(data);
  };

  return (
    <Card className="w-full max-w-4xl bg-startsnap-white rounded-xl overflow-hidden border-[3px] border-solid border-gray-800 shadow-[5px_5px_0px_#1f2937]">
      <CardContent className="p-8">
        <form onSubmit={handleSubmit(onFormSubmit)} className="space-y-8">
          {/* Project Type Section */}
          <div className="space-y-4">
            <h3 className="font-['Space_Grotesk',Helvetica] font-bold text-startsnap-oxford-blue text-xl">
              StartSnap Type
            </h3>
            <div className="flex gap-4">
              <Button
                type="button"
                className={`flex-1 ${
                  projectType === "idea"
                    ? "bg-startsnap-french-rose text-white"
                    : "bg-gray-200 text-startsnap-ebony-clay"
                } font-['Roboto',Helvetica] font-bold rounded-lg border-2 border-solid border-gray-800 shadow-[3px_3px_0px_#1f2937]`}
                onClick={() => setValue("projectType", "idea")}
              >
                Idea / Concept
              </Button>
              <Button
                type="button"
                className={`flex-1 ${
                  projectType === "live"
                    ? "bg-startsnap-mountain-meadow text-white"
                    : "bg-gray-200 text-startsnap-ebony-clay"
                } font-['Roboto',Helvetica] font-bold rounded-lg border-2 border-solid border-gray-800 shadow-[3px_3px_0px_#1f2937]`}
                onClick={() => setValue("projectType", "live")}
              >
                Live Project
              </Button>
            </div>

            <div className="flex items-center space-x-2">
              <Checkbox
                id="isHackathon"
                checked={isHackathon}
                onCheckedChange={(checked) => setValue("isHackathon", !!checked)}
              />
              <Label
                htmlFor="isHackathon"
                className="font-['Roboto',Helvetica] text-startsnap-pale-sky text-base cursor-pointer"
              >
                This is a Hackathon Entry
              </Label>
            </div>
          </div>

          <Separator className="my-6 bg-gray-200" />

          {/* Basic Info Section */}
          <div className="space-y-4">
            <div className="space-y-2">
              <Label
                htmlFor="projectName"
                className="block font-['Space_Grotesk',Helvetica] font-bold text-startsnap-oxford-blue text-lg leading-7"
              >
                StartSnap Name*
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

            <div className="space-y-2">
              <Label
                htmlFor="description"
                className="block font-['Space_Grotesk',Helvetica] font-bold text-startsnap-oxford-blue text-lg leading-7"
              >
                Description*
              </Label>
              <Textarea
                id="description"
                {...register("description")}
                placeholder="Describe your StartSnap. What problem does it solve? What makes it unique?"
                className="border-2 border-solid border-gray-800 rounded-lg p-3.5 min-h-[120px] font-['Roboto',Helvetica] text-startsnap-pale-sky"
              />
              {errors.description && (
                <p className="text-red-500 text-sm mt-1">{errors.description.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label
                htmlFor="category"
                className="block font-['Space_Grotesk',Helvetica] font-bold text-startsnap-oxford-blue text-lg leading-7"
              >
                Category*
              </Label>
              <Select
                defaultValue={watch("category")}
                onValueChange={(value) => setValue("category", value)}
              >
                <SelectTrigger
                  id="category"
                  className="border-2 border-solid border-gray-800 rounded-lg p-4 font-['Roboto',Helvetica] text-startsnap-pale-sky"
                >
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

            <div className="space-y-2">
              <Label
                htmlFor="tags"
                className="block font-['Space_Grotesk',Helvetica] font-bold text-startsnap-oxford-blue text-lg leading-7"
              >
                Tags
              </Label>
              <div className="space-y-2">
                <Input
                  id="tagsInput"
                  value={tagsInput}
                  onChange={(e) => setTagsInput(e.target.value)}
                  onKeyDown={handleTagKeyDown}
                  placeholder="Add tags (press Enter after each tag)"
                  className="border-2 border-solid border-gray-800 rounded-lg p-4 font-['Roboto',Helvetica] text-startsnap-pale-sky"
                />
                <div className="flex flex-wrap gap-2 mt-2">
                  {tags.map((tag, index) => (
                    <Badge
                      key={index}
                      variant="outline"
                      className="bg-startsnap-athens-gray text-startsnap-ebony-clay font-['Space_Mono',Helvetica] text-sm rounded-full border border-solid border-gray-800 px-3 py-1 flex items-center gap-1"
                    >
                      #{tag}
                      <button
                        type="button"
                        onClick={() => handleRemoveTag(tag)}
                        className="text-startsnap-pale-sky hover:text-red-500 ml-1 focus:outline-none"
                      >
                        ×
                      </button>
                    </Badge>
                  ))}
                </div>
              </div>
            </div>
          </div>

          <Separator className="my-6 bg-gray-200" />

          {/* Project Links Section */}
          <div className="space-y-4">
            <h3 className="font-['Space_Grotesk',Helvetica] font-bold text-startsnap-oxford-blue text-xl">
              Project Links
            </h3>
            <div className="space-y-2">
              <Label
                htmlFor="liveUrl"
                className="block font-['Roboto',Helvetica] font-bold text-startsnap-oxford-blue text-base leading-7"
              >
                Live Demo URL
              </Label>
              <Input
                id="liveUrl"
                {...register("liveUrl")}
                placeholder="https://your-project-url.com"
                className="border-2 border-solid border-gray-800 rounded-lg p-4 font-['Roboto',Helvetica] text-startsnap-pale-sky"
              />
              {errors.liveUrl && (
                <p className="text-red-500 text-sm mt-1">{errors.liveUrl.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label
                htmlFor="videoUrl"
                className="block font-['Roboto',Helvetica] font-bold text-startsnap-oxford-blue text-base leading-7"
              >
                Demo Video URL
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

          <Separator className="my-6 bg-gray-200" />

          {/* Tools & Feedback Section */}
          <div className="space-y-4">
            <h3 className="font-['Space_Grotesk',Helvetica] font-bold text-startsnap-oxford-blue text-xl">
              Tools & Feedback
            </h3>
            <div className="space-y-2">
              <Label
                htmlFor="toolsUsed"
                className="block font-['Roboto',Helvetica] font-bold text-startsnap-oxford-blue text-base leading-7"
              >
                Tools & Technologies Used
              </Label>
              <div className="space-y-2">
                <Input
                  id="toolsInput"
                  value={toolsInput}
                  onChange={(e) => setToolsInput(e.target.value)}
                  onKeyDown={handleToolKeyDown}
                  placeholder="Add tools (press Enter after each tool)"
                  className="border-2 border-solid border-gray-800 rounded-lg p-4 font-['Roboto',Helvetica] text-startsnap-pale-sky"
                />
                <div className="flex flex-wrap gap-2 mt-2">
                  {toolsUsed.map((tool, index) => (
                    <Badge
                      key={index}
                      variant="outline"
                      className="bg-startsnap-french-pass text-startsnap-persian-blue font-['Space_Mono',Helvetica] text-sm rounded-full border border-solid border-blue-700 px-3 py-1 flex items-center gap-1"
                    >
                      {tool}
                      <button
                        type="button"
                        onClick={() => handleRemoveTool(tool)}
                        className="text-startsnap-pale-sky hover:text-red-500 ml-1 focus:outline-none"
                      >
                        ×
                      </button>
                    </Badge>
                  ))}
                </div>
              </div>
            </div>

            <div className="space-y-2">
              <Label
                htmlFor="feedbackAreas"
                className="block font-['Roboto',Helvetica] font-bold text-startsnap-oxford-blue text-base leading-7"
              >
                Looking for Feedback On
              </Label>
              <div className="space-y-2">
                <Input
                  id="feedbackInput"
                  value={feedbackInput}
                  onChange={(e) => setFeedbackInput(e.target.value)}
                  onKeyDown={handleFeedbackKeyDown}
                  placeholder="Add feedback areas (press Enter after each area)"
                  className="border-2 border-solid border-gray-800 rounded-lg p-4 font-['Roboto',Helvetica] text-startsnap-pale-sky"
                />
                <div className="flex flex-wrap gap-2 mt-2">
                  {feedbackAreas.map((feedback, index) => (
                    <Badge
                      key={index}
                      variant="outline"
                      className="bg-startsnap-ice-cold text-startsnap-jewel font-['Space_Mono',Helvetica] text-sm rounded-full border border-solid border-green-700 px-3 py-1 flex items-center gap-1"
                    >
                      {feedback}
                      <button
                        type="button"
                        onClick={() => handleRemoveFeedback(feedback)}
                        className="text-startsnap-pale-sky hover:text-red-500 ml-1 focus:outline-none"
                      >
                        ×
                      </button>
                    </Badge>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Vibe Log Section - Only show in Create mode */}
          {mode === "create" && (
            <>
              <Separator className="my-6 bg-gray-200" />

              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="font-['Space_Grotesk',Helvetica] font-bold text-startsnap-oxford-blue text-xl">
                    Launch Vibe Log
                  </h3>
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setShowVibeLogSection(!showVibeLogSection)}
                    className="font-['Roboto',Helvetica] font-normal text-sm rounded-lg border border-solid border-gray-300"
                  >
                    {showVibeLogSection ? "Hide" : "Show"}
                  </Button>
                </div>

                {showVibeLogSection && (
                  <div className="space-y-4 animate-in slide-in-from-top duration-300">
                    <div className="space-y-2">
                      <Label
                        htmlFor="vibeLogType"
                        className="block font-['Roboto',Helvetica] font-bold text-startsnap-oxford-blue text-base leading-7"
                      >
                        Log Type
                      </Label>
                      <Select
                        defaultValue={watch("vibeLogType") || "launch"}
                        onValueChange={(value) => setValue("vibeLogType", value)}
                      >
                        <SelectTrigger
                          id="vibeLogType"
                          className="border-2 border-solid border-gray-800 rounded-lg p-4 font-['Roboto',Helvetica] text-startsnap-pale-sky"
                        >
                          <SelectValue placeholder="Select a log type" />
                        </SelectTrigger>
                        <SelectContent>
                          {getVibeLogOptions().map((option) => (
                            <SelectItem key={option.value} value={option.value}>
                              <div className="flex items-center">
                                <span className="material-icons mr-2 text-sm">{option.icon}</span>
                                {option.label}
                              </div>
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="space-y-2">
                      <Label
                        htmlFor="vibeLogTitle"
                        className="block font-['Roboto',Helvetica] font-bold text-startsnap-oxford-blue text-base leading-7"
                      >
                        Log Title
                      </Label>
                      <Input
                        id="vibeLogTitle"
                        {...register("vibeLogTitle")}
                        placeholder="A title for your launch post"
                        className="border-2 border-solid border-gray-800 rounded-lg p-4 font-['Roboto',Helvetica] text-startsnap-pale-sky"
                      />
                      {errors.vibeLogTitle && (
                        <p className="text-red-500 text-sm mt-1">{errors.vibeLogTitle.message}</p>
                      )}
                    </div>

                    <div className="space-y-2">
                      <Label
                        htmlFor="vibeLogContent"
                        className="block font-['Roboto',Helvetica] font-bold text-startsnap-oxford-blue text-base leading-7"
                      >
                        Log Content
                      </Label>
                      <Textarea
                        id="vibeLogContent"
                        {...register("vibeLogContent")}
                        placeholder="Share the story behind your project, what inspired you, or what you're hoping to accomplish"
                        className="border-2 border-solid border-gray-800 rounded-lg p-3.5 min-h-[120px] font-['Roboto',Helvetica] text-startsnap-pale-sky"
                      />
                      {errors.vibeLogContent && (
                        <p className="text-red-500 text-sm mt-1">{errors.vibeLogContent.message}</p>
                      )}
                    </div>
                  </div>
                )}
              </div>
            </>
          )}

          {/* Form Actions */}
          <div className="flex justify-end gap-4 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={onCancel}
              className="bg-gray-200 text-startsnap-ebony-clay font-['Roboto',Helvetica] font-bold text-base rounded-lg border-2 border-solid border-gray-800 shadow-[3px_3px_0px_#1f2937]"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              className="bg-startsnap-french-rose text-startsnap-white font-['Roboto',Helvetica] font-bold text-base rounded-lg border-2 border-solid border-gray-800 shadow-[3px_3px_0px_#1f2937]"
            >
              {mode === "create" ? "Create StartSnap" : "Update StartSnap"}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
};