/**
 * src/screens/Frame/sections/MainContentSection/components/BuildInPublicManifestoSection.tsx
 * @description Component for the 'Build in Public Manifesto' section, explaining the Vibe Coder philosophy.
 */
import React from 'react';
import { Button } from '../../../../../components/ui/button';
import { Link } from 'react-router-dom';

/**
 * @description Renders the 'Build in Public Manifesto' section, also known as 'This Is How We Vibe'.
 * It includes informational text, an image, and calls to action related to the platform's ethos.
 * @returns {JSX.Element} The BuildInPublicManifestoSection component.
 */
export const BuildInPublicManifestoSection = (): JSX.Element => {
  return (
    <div className="w-full bg-startsnap-white border-t-2 border-b-2 border-gray-800">
      <div className="max-w-screen-2xl mx-auto px-8 py-16 lg:py-24">
        <h2 className="text-4xl lg:text-5xl font-bold text-startsnap-ebony-clay text-center mb-12 font-['Space_Grotesk',Helvetica] leading-tight">
          This Is How We Vibe
        </h2>

        {/* Text and Image Row */}
        <div className="flex flex-col-reverse md:flex-row gap-12 items-center max-w-6xl mx-auto mb-16">
          <div className="w-full md:w-[60%]">
            <p className="text-lg lg:text-xl text-startsnap-river-bed mb-6 leading-relaxed font-['Roboto',Helvetica]">
              We're running on coffee, AI prompts, and the thrill of making cool stuff — out loud, in real time. Those rough edges? They just mean we're moving fast.
            </p>
            <p className="text-lg lg:text-xl text-startsnap-river-bed mb-6 leading-relaxed font-['Roboto',Helvetica]">Getting <strong>real feedback</strong> before it's "done" is just smart. That's the Vibe Log story: every wild swing, every small win.</p>
            <p className="text-lg lg:text-xl text-startsnap-river-bed mb-6 leading-relaxed font-['Roboto',Helvetica]">
              <strong>Startsnap.fun</strong> is where these stories live. Explore raw projects, find your crew, share your own StartSnap. Build <strong>your thing, your way</strong>, and show it off!
            </p>
          </div>

          <div className="w-full md:w-[40%] flex-shrink-0">
            <img
              src="https://ik.imagekit.io/craftsnap/startsnap/vibe-coder-aha.png?updatedAt=1748985333023"
              alt="Developer having an aha moment"
              className="w-full h-auto animate-[fade-in_0.5s_ease-in]"
              loading="lazy"
            />
          </div>
        </div>

        {/* Cards Row */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-8 max-w-6xl mx-auto mb-16">
          <div className="bg-startsnap-athens-gray p-6 rounded-lg border-2 border-gray-800 shadow-[3px_3px_0px_#1f2937] hover:translate-x-[-2px] hover:translate-y-[-2px] hover:shadow-[5px_5px_0px_#1f2937] transition-all duration-200">
            <h3 className="text-xl font-bold text-startsnap-ebony-clay mb-4 font-['Space_Grotesk',Helvetica]">
              Why Build in Public?
            </h3>
            <ul className="space-y-4 text-startsnap-river-bed">
              <li className="flex items-start gap-2">
                <span className="material-icons text-startsnap-french-rose mt-1">rocket_launch</span>
                <span><strong>Share Fearlessly. No Shame.</strong> Your process? Pure gold. Every stumble, every detour - it's a lesson for the next Vibe Coder.</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="material-icons text-startsnap-french-rose mt-1">forum</span>
                <span><strong>Feedback is Fuel. The Real Kind.</strong> No sugar-coating here. Get the honest takes that actually help you build better, faster.</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="material-icons text-startsnap-french-rose mt-1">diversity_3</span>
                <span><strong>Connect & Grow. Your Tribe Awaits.</strong> Ditch the echo chamber. Find your collaborators, your mentors, your future co-founders. They're here.</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="material-icons text-startsnap-french-rose mt-1">auto_awesome</span>
                <span><strong>Inspire Others. Be the Spark.</strong> Your journey - the grind, the wins, the "what ifs" - it's the kickstart someone else needs. Pass it on.</span>
              </li>
            </ul>
          </div>

          <div className="bg-startsnap-french-pass p-6 rounded-lg border-2 border-gray-800 shadow-[3px_3px_0px_#1f2937] hover:translate-x-[-2px] hover:translate-y-[-2px] hover:shadow-[5px_5px_0px_#1f2937] transition-all duration-200">
            <h3 className="text-xl font-bold text-startsnap-ebony-clay mb-4 font-['Space_Grotesk',Helvetica]">
              How We Support You
            </h3>
            <ul className="space-y-4 text-startsnap-river-bed">
              <li className="flex items-start gap-2">
                <span className="material-icons text-startsnap-persian-blue mt-1">insights</span>
                <span><strong>Vibe Log: Your Uncut Journey.</strong> Document it all - the genius prompt, the "why won't this work?!" moment, the late-night breakthroughs. One raw update at a time.</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="material-icons text-startsnap-persian-blue mt-1">groups</span>
                <span><strong>Community Feedback: Straight Up, No Chaser.</strong> Get real insights from fellow builders. The kind that actually makes your StartSnap better, not just boosts your ego.</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="material-icons text-startsnap-persian-blue mt-1">favorite</span>
                <span><strong>Project Support: Rally Your Believers.</strong> Let folks show some love for your vision. That support count? It's pure Vibe Coder fuel.</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="material-icons text-startsnap-persian-blue mt-1">work</span>
                <span><strong>Opportunities: Connect & Conquer.</strong> Ready for what's next? Signal it. Let collaborators, employers, or your next adventure find you right here.</span>
              </li>
            </ul>
          </div>
        </div>

        <div className="text-center">
          <Button asChild className="startsnap-button bg-startsnap-persian-blue text-startsnap-white font-['Roboto',Helvetica] font-bold text-lg rounded-lg border-2 border-solid border-gray-800 shadow-[3px_3px_0px_#1f2937] px-8 py-4">
            <Link to="/create" className="startsnap-button bg-startsnap-candlelight text-startsnap-ebony-clay font-['Roboto',Helvetica] font-bold text-lg rounded-lg border-2 border-solid border-gray-800 shadow-[3px_3px_0px_#1f2937] px-8 py-4">Start Your Journey</Link>
          </Button>
        </div>
      </div>
    </div>
  );
};