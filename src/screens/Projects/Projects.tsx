/**
 * src/screens/Projects/Projects.tsx
 * @description Projects gallery page showing all StartSnaps with search and filtering
 */

import React from "react";
import { MainContentSection } from "../Frame/sections/MainContentSection/MainContentSection";

/**
 * @description Page component that displays the projects gallery
 * @returns {JSX.Element} Projects gallery page with search, filters, and StartSnap cards
 */
export const Projects = (): JSX.Element => {
  return (
    <>
      <title>Explore StartSnaps Gallery | startsnap.fun</title>
      <div className="flex flex-col w-full items-center bg-startsnap-candlelight">
        <div className="w-full max-w-screen-2xl px-8 py-16">
          <h1 className="text-5xl font-bold text-startsnap-ebony-clay text-center mb-12 font-['Space_Grotesk',Helvetica]">
            Explore StartSnaps Gallery
          </h1>
          <MainContentSection />
        </div>
      </div>
    </>
  );
};