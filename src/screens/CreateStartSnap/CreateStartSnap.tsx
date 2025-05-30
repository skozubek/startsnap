import React from "react";
import { UploadIcon } from "lucide-react";
import { Button } from "../../components/ui/button";
import { Card, CardContent } from "../../components/ui/card";
import { Input } from "../../components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../../components/ui/select";
import { Textarea } from "../../components/ui/textarea";

export const CreateStartSnap = (): JSX.Element => {
  return (
    <div className="flex flex-col w-full items-center gap-8 pt-8 pb-24 px-8 bg-startsnap-candlelight">
      <h2 className="text-5xl font-bold text-startsnap-ebony-clay text-center font-['Space_Grotesk',Helvetica] leading-[48px]">
        Launch Your Project
      </h2>

      <Card className="max-w-2xl w-full bg-startsnap-white rounded-xl overflow-hidden border-[3px] border-solid border-gray-800 shadow-[5px_5px_0px_#1f2937]">
        <CardContent className="p-9">
          <form className="space-y-6">
            <div className="space-y-2">
              <label className="block font-['Space_Grotesk',Helvetica] font-bold text-startsnap-oxford-blue text-lg leading-7">
                Project Name
              </label>
              <Input
                placeholder="e.g., My Awesome Idea"
                className="border-2 border-solid border-gray-800 rounded-lg p-4 font-['Roboto',Helvetica] text-startsnap-pale-sky"
              />
            </div>

            <div className="space-y-2">
              <label className="block font-['Space_Grotesk',Helvetica] font-bold text-startsnap-oxford-blue text-lg leading-7">
                Short Description
              </label>
              <Textarea
                placeholder="Briefly describe your project..."
                className="border-2 border-solid border-gray-800 rounded-lg p-3.5 min-h-[107px] font-['Roboto',Helvetica] text-startsnap-pale-sky"
              />
            </div>

            <div className="space-y-2">
              <label className="block font-['Space_Grotesk',Helvetica] font-bold text-startsnap-oxford-blue text-lg leading-7">
                Category
              </label>
              <Select defaultValue="tech">
                <SelectTrigger className="border-2 border-solid border-gray-800 rounded-lg h-[52px] font-['Roboto',Helvetica]">
                  <SelectValue placeholder="Select a category" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="tech">Tech</SelectItem>
                  <SelectItem value="gaming">Gaming</SelectItem>
                  <SelectItem value="community">Community</SelectItem>
                  <SelectItem value="music">Music Tech</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <label className="block font-['Space_Grotesk',Helvetica] font-bold text-startsnap-oxford-blue text-lg leading-7">
                Project Thumbnail
              </label>
              <div className="border-2 border-dashed border-gray-800 rounded-lg h-[147px] flex flex-col items-center justify-center text-center p-4">
                <UploadIcon className="w-12 h-12 text-startsnap-gray-chateau mb-2" />
                <div className="flex items-center gap-1">
                  <span className="text-startsnap-cerise text-sm font-['Roboto',Helvetica] font-medium">
                    Upload a file
                  </span>
                  <span className="text-startsnap-river-bed text-sm font-['Roboto',Helvetica]">
                    or drag and drop
                  </span>
                </div>
                <p className="text-startsnap-pale-sky text-xs font-['Roboto',Helvetica] mt-1">
                  PNG, JPG, GIF up to 10MB
                </p>
              </div>
            </div>

            <div className="space-y-2">
              <label className="block font-['Space_Grotesk',Helvetica] font-bold text-startsnap-oxford-blue text-lg leading-7">
                Tags (comma separated)
              </label>
              <Input
                placeholder="e.g., AI, SaaS, Mobile"
                className="border-2 border-solid border-gray-800 rounded-lg p-4 font-['Roboto',Helvetica] text-startsnap-pale-sky"
              />
            </div>

            <div className="flex justify-center gap-4 pt-4">
              <Button
                variant="outline"
                className="startsnap-button bg-startsnap-mischka text-startsnap-ebony-clay font-['Roboto',Helvetica] font-bold rounded-lg border-2 border-solid border-gray-800 shadow-[3px_3px_0px_#1f2937]"
              >
                Save Draft
              </Button>
              <Button className="startsnap-button bg-startsnap-french-rose text-startsnap-white font-['Roboto',Helvetica] font-bold rounded-lg border-2 border-solid border-gray-800 shadow-[3px_3px_0px_#1f2937]">
                Launch Project
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
};