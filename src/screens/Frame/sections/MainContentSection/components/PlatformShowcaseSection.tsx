/**
 * src/screens/Frame/sections/MainContentSection/components/PlatformShowcaseSection.tsx
 * @description Component showcasing the startsnap.fun platform itself as a StartSnap project.
 */
import React from 'react';
import { Link } from 'react-router-dom';
import { Button } from '../../../../../components/ui/button';
import { StartSnapCard } from '../../../../../components/ui/StartSnapCard';
import type { StartSnapProject } from '../../../../../types/startsnap';

interface PlatformShowcaseSectionProps {
  platformStartSnap: StartSnapProject | null;
  loadingPlatformData: boolean;
  platformCreator: string;
  formatDate: (dateString: string) => string;
  getCategoryDisplay: (categoryKey: string) => {
    name: string;
    bgColor: string;
    textColor: string;
    borderColor: string;
  };
}

/**
 * @description Renders the section that showcases the startsnap.fun platform as its own StartSnap project.
 * It displays the platform's project card and explanatory text with a call to action.
 * @param {PlatformShowcaseSectionProps} props - The props for the component.
 * @param {StartSnapProject | null} props.platformStartSnap - The StartSnap project data for the platform itself.
 * @param {boolean} props.loadingPlatformData - Loading state for the platform project data.
 * @param {string} props.platformCreator - The creator name for the platform's StartSnap.
 * @param {(dateString: string) => string} props.formatDate - Function to format date strings.
 * @param {(categoryKey: string) => { name: string; bgColor: string; textColor: string; borderColor: string; }} props.getCategoryDisplay - Function to get display properties for a category key.
 * @returns {JSX.Element} The PlatformShowcaseSection component.
 */
export const PlatformShowcaseSection = ({
  platformStartSnap,
  loadingPlatformData,
  platformCreator,
  formatDate,
  getCategoryDisplay,
}: PlatformShowcaseSectionProps): JSX.Element => {
  return (
    <div className="w-full bg-startsnap-wisp-pink border-b-2 border-gray-800">
      <div className="max-w-screen-2xl mx-auto px-8 py-16 lg:py-24">
                  <h2 className="text-4xl lg:text-5xl font-heading text-startsnap-ebony-clay text-center mb-12 leading-tight">
          startsnap.fun is... well, a StartSnap!
        </h2>

        <div className="flex flex-col md:flex-row gap-8 lg:gap-12 items-center max-w-6xl mx-auto">
          {/* Platform StartSnap Card */}
          <div className="w-full md:w-[40%] lg:w-[45%]">
            {loadingPlatformData ? (
              <div className="p-12 border-2 border-dashed border-gray-300 bg-white rounded-xl flex items-center justify-center">
                <p className="text-startsnap-pale-sky">Loading platform data...</p>
              </div>
            ) : platformStartSnap ? (
                <StartSnapCard
                  startsnap={platformStartSnap}
                  showCreator={true}
                  creatorName={platformCreator}
                  variant="main-page"
                  formatDate={formatDate}
                  getCategoryDisplay={getCategoryDisplay}
                />
            ) : (
              <div className="p-12 border-2 border-dashed border-gray-300 bg-white rounded-xl flex items-center justify-center">
                <p className="text-startsnap-pale-sky">Platform project unavailable</p>
              </div>
            )}
          </div>

          {/* Explanatory Text & CTA */}
          <div className="w-full md:w-[60%] lg:w-[55%] md:pl-6">
            <div className="space-y-6">
              <h3 className="text-3xl lg:text-4xl font-heading text-startsnap-ebony-clay leading-tight">
                We're Building This With You
              </h3>
              <p className="text-lg lg:text-xl text-startsnap-river-bed leading-relaxed">
                That's right, the platform you're on is our own living StartSnap.
              </p>
              <p className="text-lg lg:text-xl text-startsnap-river-bed leading-relaxed">
                Our Vibe Log for startsnap.fun (check it out on its project page!) is where we'll post updates, share our roadmap thoughts, and most importantly, show how <strong>your feedback</strong> and feature requests are shaping the future of this space. This isn't just our project, it's our shared journey.
              </p>
              <div>
                <Button
                  variant="primary"
                  asChild
                  className="text-lg px-8 py-4"
                >
                  <Link to="/projects/startsnapfun">Follow Our Journey</Link>
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};