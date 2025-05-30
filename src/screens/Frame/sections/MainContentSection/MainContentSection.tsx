import React from "react";
import { UploadIcon } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "../../../../components/ui/avatar";
import { Badge } from "../../../../components/ui/badge";
import { Button } from "../../../../components/ui/button";
import { Card, CardContent, CardFooter } from "../../../../components/ui/card";
import { Input } from "../../../../components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../../../../components/ui/select";
import { Textarea } from "../../../../components/ui/textarea";
import { Link } from "react-router-dom";

export const MainContentSection = (): JSX.Element => {
  // Project card data
  const projectCards = [
    {
      title: "Quantum Leap Synthesizer",
      description:
        "A retro-futuristic audio plugin for otherworldly soundscapes. Help us fine-tune the UI!",
      category: {
        name: "Music Tech",
        bgColor: "bg-purple-200",
        textColor: "text-startsnap-purple-heart",
        borderColor: "border-purple-700",
      },
      creator: "SynthLord69",
      launchTime: "Launched: 2 days ago",
      avatarSrc: "/creator-avatar.png",
      tags: ["#Synth", "#Audio", "#Feedback"],
      link: "/project/quantum-leap-synthesizer"
    },
    {
      title: "Pixel Pet Planet",
      description:
        "A nostalgic pixel art virtual pet game. We need testers for our new pet evolution system.",
      category: {
        name: "Gaming",
        bgColor: "bg-startsnap-ice-cold",
        textColor: "text-startsnap-jewel",
        borderColor: "border-green-700",
      },
      creator: "PixelPioneer",
      launchTime: "Launched: 5 days ago",
      avatarSrc: "/creator-avatar-1.png",
      tags: ["#PixelArt", "#GameDev", "#Playtest"],
      link: "#"
    },
    {
      title: "Creative Collab Hub",
      description:
        "A platform for creators to connect, share ideas, and get feedback on their projects. Seeking alpha testers!",
      category: {
        name: "Community",
        bgColor: "bg-startsnap-french-pass",
        textColor: "text-startsnap-persian-blue",
        borderColor: "border-blue-700",
      },
      creator: "IdeaSparker",
      launchTime: "Launched: 1 week ago",
      avatarSrc: "/creator-avatar-2.png",
      tags: ["#Collaboration", "#Community", "#Feedback"],
      link: "#"
    },
  ];

  return (
    <section className="flex flex-col w-full items-center gap-16 pt-8 pb-24 px-8 bg-startsnap-candlelight">
      {/* StartSnaps Cards Section */}
      <div className="w-full max-w-screen-2xl">
        <h2 className="text-5xl font-bold text-startsnap-ebony-clay text-center mb-20 font-['Space_Grotesk',Helvetica]">
          StartSnaps
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {projectCards.map((project, index) => (
            <Card
              key={index}
              className="bg-startsnap-white rounded-xl overflow-hidden border-[3px] border-solid border-gray-800 shadow-[5px_5px_0px_#1f2937]"
            >
              <CardContent className="p-7 pt-[219px]">
                <div className="flex justify-between items-start">
                  <h3 className="font-['Space_Grotesk',Helvetica] font-bold text-startsnap-ebony-clay text-2xl leading-8">
                    {project.title}
                  </h3>
                  <Badge
                    className={`${project.category.bgColor} ${project.category.textColor} border ${project.category.borderColor} rounded-full px-[13px] py-[5px] font-['Space_Mono',Helvetica] font-normal text-sm`}
                  >
                    {project.category.name}
                  </Badge>
                </div>

                <p className="mt-4 font-['Roboto',Helvetica] font-normal text-startsnap-river-bed text-base leading-6">
                  {project.description}
                </p>

                <div className="flex items-center mt-7">
                  <Avatar className="w-10 h-10 rounded-full border-2 border-solid border-gray-800">
                    <AvatarImage
                      src={project.avatarSrc}
                      alt={project.creator}
                    />
                    <AvatarFallback>
                      {project.creator.substring(0, 2)}
                    </AvatarFallback>
                  </Avatar>
                  <div className="ml-3">
                    <p className="font-['Roboto',Helvetica] font-semibold text-startsnap-oxford-blue text-base leading-6">
                      {project.creator}
                    </p>
                    <p className="font-['Inter',Helvetica] font-normal text-startsnap-pale-sky text-xs leading-4">
                      {project.launchTime}
                    </p>
                  </div>
                </div>

                <div className="flex flex-wrap gap-2 mt-4">
                  {project.tags.map((tag, idx) => (
                    <Badge
                      key={idx}
                      className="bg-startsnap-athens-gray text-startsnap-ebony-clay font-['Space_Mono',Helvetica] font-normal text-sm rounded-full border border-solid border-gray-800 px-[13px] py-[5px]"
                    >
                      {tag}
                    </Badge>
                  ))}
                </div>
              </CardContent>

              <CardFooter className="p-7 pt-0">
                <Button className="startsnap-button w-full bg-startsnap-french-rose text-startsnap-white font-['Roboto',Helvetica] font-bold rounded-lg border-2 border-solid border-gray-800 shadow-[3px_3px_0px_#1f2937]" asChild>
                  <Link to={project.link}>View Project</Link>
                </Button>
              </CardFooter>
            </Card>
          ))}
        </div>
      </div>

      {/* Submit Your StartSnap Section */}
      <div className="flex flex-col items-center gap-8 w-full">
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
    </section>
  );
};