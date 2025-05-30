import React from "react";
import { Button } from "../../components/ui/button";
import { Badge } from "../../components/ui/badge";
import { Card, CardContent } from "../../components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "../../components/ui/avatar";
import { Textarea } from "../../components/ui/textarea";

export const ProjectDetail = (): JSX.Element => {
  // Vibe log entries
  const vibeLogEntries = [
    {
      icon: "campaign",
      iconBg: "bg-startsnap-wisp-pink",
      iconColor: "text-startsnap-french-rose",
      iconBorder: "border-pink-500",
      date: "July 22, 2024 - 10:00 AM",
      title: "Initial Launch & Call for UI Feedback!",
      content:
        "Super excited to finally launch QLS v0.1! The core engine is humming, but the UI feels a bit clunky. What are your first impressions? Any specific knobs or sections confusing? Let me know!",
    },
    {
      icon: "construction",
      iconBg: "bg-startsnap-blue-chalk",
      iconColor: "text-startsnap-heliotrope",
      iconBorder: "border-purple-500",
      date: "July 21, 2024 - 3:30 PM",
      title: "Oscillator Tweaks & Filter Update",
      content:
        "Spent the afternoon refining the wavetable oscillators and added a new resonant filter mode. The sounds are getting FAT. Tomorrow, focusing on the modulation matrix. Stay tuned!",
    },
  ];

  // Community feedback entries
  const feedbackEntries = [
    {
      username: "AudioGeek_77",
      avatarSrc: "/user-avatar.png",
      date: "July 22, 2024 - 11:15 AM",
      content:
        "Love the concept! The main oscillator section is a bit crowded. Maybe group the waveform selectors differently? The filter sounds amazing though!",
    },
    {
      username: "UX_Wizard",
      avatarSrc: "/user-avatar-1.png",
      date: "July 22, 2024 - 1:05 PM",
      content:
        "Great start! Consider adding tooltips for less common parameters. The color scheme is cool and retro. One minor bug: the LFO rate knob sometimes jumps values.",
    },
  ];

  return (
    <div className="flex flex-col w-full items-center gap-16 pt-8 pb-24 px-8 bg-startsnap-candlelight">
      <Card className="max-w-4xl w-full bg-startsnap-white rounded-xl overflow-hidden border-[3px] border-solid border-gray-800 shadow-[5px_5px_0px_#1f2937]">
        <CardContent className="p-0">
          {/* Project Header Section */}
          <div className="border-b-2 border-gray-800 p-8">
            <div className="h-64 rounded-lg border-2 border-solid border-gray-800 mb-6"></div>

            <div className="flex justify-between items-start mb-4">
              <h1 className="font-['Space_Grotesk',Helvetica] font-bold text-startsnap-ebony-clay text-4xl leading-10">
                Quantum Leap Synthesizer
              </h1>
              <Badge className="bg-purple-200 text-startsnap-purple-heart border border-purple-700 rounded-full px-[13px] py-[5px] font-['Space_Mono',Helvetica]">
                Music Tech
              </Badge>
            </div>

            <p className="font-['Roboto',Helvetica] font-normal text-startsnap-river-bed text-base leading-6 mb-6">
              A retro-futuristic audio plugin designed to transport your
              listeners to otherworldly dimensions. We're looking for
              <br />
              feedback on the user interface flow and overall sonic character.
              Does it inspire you? Is it intuitive?
            </p>

            <div className="flex items-start mb-6">
              <Avatar className="w-12 h-12 rounded-full border-2 border-solid border-gray-800">
                <AvatarImage src="/creator-avatar-3.png" alt="SynthLord69" />
                <AvatarFallback>SL</AvatarFallback>
              </Avatar>
              <div className="ml-4">
                <p className="font-['Roboto',Helvetica] font-semibold text-startsnap-oxford-blue text-base leading-7">
                  SynthLord69
                </p>
                <p className="font-['Inter',Helvetica] font-normal text-startsnap-pale-sky text-xs leading-5">
                  Launched: July 20, 2024
                </p>
              </div>
            </div>

            <div className="flex flex-wrap gap-2 mb-8">
              <Badge className="bg-startsnap-athens-gray text-startsnap-ebony-clay font-['Space_Mono',Helvetica] font-normal text-sm rounded-full border border-solid border-gray-800 px-[13px] py-[5px]">
                #Synth
              </Badge>
              <Badge className="bg-startsnap-athens-gray text-startsnap-ebony-clay font-['Space_Mono',Helvetica] font-normal text-sm rounded-full border border-solid border-gray-800 px-[13px] py-[5px]">
                #AudioPlugin
              </Badge>
              <Badge className="bg-startsnap-athens-gray text-startsnap-ebony-clay font-['Space_Mono',Helvetica] font-normal text-sm rounded-full border border-solid border-gray-800 px-[13px] py-[5px]">
                #MusicProduction
              </Badge>
              <Badge className="bg-startsnap-athens-gray text-startsnap-ebony-clay font-['Space_Mono',Helvetica] font-normal text-sm rounded-full border border-solid border-gray-800 px-[13px] py-[5px]">
                #SoundDesign
              </Badge>
              <Badge className="bg-startsnap-athens-gray text-startsnap-ebony-clay font-['Space_Mono',Helvetica] font-normal text-sm rounded-full border border-solid border-gray-800 px-[13px] py-[5px]">
                #UIUX
              </Badge>
              <Badge className="bg-startsnap-athens-gray text-startsnap-ebony-clay font-['Space_Mono',Helvetica] font-normal text-sm rounded-full border border-solid border-gray-800 px-[13px] py-[5px]">
                #FeedbackNeeded
              </Badge>
            </div>

            <div className="flex gap-4">
              <Button className="startsnap-button bg-startsnap-french-rose text-startsnap-white font-['Roboto',Helvetica] font-bold rounded-lg border-2 border-solid border-gray-800 shadow-[3px_3px_0px_#1f2937] flex items-center gap-2">
                <span className="material-icons text-xl">thumb_up</span>
                Support Project
              </Button>
              <Button className="startsnap-button bg-startsnap-mountain-meadow text-startsnap-white font-['Roboto',Helvetica] font-bold rounded-lg border-2 border-solid border-gray-800 shadow-[3px_3px_0px_#1f2937] flex items-center gap-2">
                <span className="material-icons text-xl">forum</span>
                Give Feedback
              </Button>
            </div>
          </div>

          {/* Vibe Log Section */}
          <div className="border-b-2 border-gray-800 p-8">
            <div className="flex items-center mb-6">
              <h2 className="font-['Space_Grotesk',Helvetica] font-bold text-startsnap-ebony-clay text-2xl leading-8">
                Vibe Log
              </h2>
              <span className="ml-1 text-startsnap-corn text-2xl material-icons">
                insights
              </span>
            </div>

            {vibeLogEntries.map((entry, index) => (
              <div key={index} className="mb-8 last:mb-0">
                <div className="flex items-start">
                  <div
                    className={`p-2.5 ${entry.iconBg} rounded-full border-2 border-solid ${entry.iconBorder} ${entry.iconColor} text-3xl flex items-center justify-center`}
                  >
                    <span className="material-icons text-3xl">{entry.icon}</span>
                  </div>
                  <div className="ml-4">
                    <p className="font-['Inter',Helvetica] font-normal text-startsnap-pale-sky text-xs leading-4">
                      {entry.date}
                    </p>
                    <h3 className="font-['Space_Grotesk',Helvetica] font-bold text-startsnap-oxford-blue text-lg leading-7 mt-1">
                      {entry.title}
                    </h3>
                    <p className="font-['Roboto',Helvetica] font-normal text-startsnap-river-bed text-base leading-6">
                      {entry.content}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Community Feedback Section */}
          <div className="p-8">
            <div className="flex items-center mb-6">
              <h2 className="font-['Space_Grotesk',Helvetica] font-bold text-startsnap-ebony-clay text-2xl leading-8">
                Community Feedback
              </h2>
              <span className="ml-1 text-startsnap-mountain-meadow text-2xl material-icons">
                groups
              </span>
            </div>

            {feedbackEntries.map((feedback, index) => (
              <Card
                key={index}
                className="mb-6 shadow-[0px_2px_4px_-2px_#0000001a,0px_4px_6px_-1px_#0000001a] bg-startsnap-white rounded-xl overflow-hidden border-[3px] border-solid border-gray-800"
              >
                <CardContent className="p-5">
                  <div className="flex items-start">
                    <Avatar className="w-10 h-10 rounded-full border-2 border-solid border-gray-800">
                      <AvatarImage
                        src={feedback.avatarSrc}
                        alt={feedback.username}
                      />
                      <AvatarFallback>
                        {feedback.username.substring(0, 2)}
                      </AvatarFallback>
                    </Avatar>
                    <div className="ml-4">
                      <div className="flex items-center">
                        <p className="font-['Roboto',Helvetica] font-semibold text-startsnap-oxford-blue text-base leading-6">
                          {feedback.username}
                        </p>
                        <p className="ml-3 font-['Inter',Helvetica] font-normal text-startsnap-pale-sky text-xs leading-4">
                          {feedback.date}
                        </p>
                      </div>
                      <p className="font-['Roboto',Helvetica] font-normal text-startsnap-river-bed text-base leading-6 mt-1">
                        {feedback.content}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}

            <div className="mt-8">
              <h3 className="font-['Space_Grotesk',Helvetica] font-bold text-startsnap-oxford-blue text-lg leading-7 mb-4">
                Leave Your Feedback
              </h3>
              <Textarea
                placeholder="Share your thoughts, suggestions, or bug reports..."
                className="border-2 border-solid border-gray-800 rounded-lg p-3.5 min-h-[120px] font-['Roboto',Helvetica] text-startsnap-pale-sky mb-4"
              />
              <Button className="startsnap-button bg-startsnap-french-rose text-startsnap-white font-['Roboto',Helvetica] font-bold rounded-lg border-2 border-solid border-gray-800 shadow-[3px_3px_0px_#1f2937]">
                Submit Feedback
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};