import React from "react";
import { FooterSection } from "./sections/FooterSection/FooterSection";
import { HeaderSection } from "./sections/HeaderSection/HeaderSection";
import { MainContentSection } from "./sections/MainContentSection/MainContentSection";

export const Frame = (): JSX.Element => {
  return (
    <div className="flex flex-col min-h-screen w-full bg-koniakowcomcandlelight">
      <HeaderSection />
      <div className="flex flex-col w-full min-h-screen overflow-y-auto">
        <MainContentSection />
      </div>
      <FooterSection />
    </div>
  );
};
