import React from "react";
import { Routes, Route } from "react-router-dom";
import { FooterSection } from "./sections/FooterSection/FooterSection";
import { HeaderSection } from "./sections/HeaderSection/HeaderSection";
import { MainContentSection } from "./sections/MainContentSection/MainContentSection";
import { ProjectDetail } from "../ProjectDetail";
import { CreateStartSnap } from "../CreateStartSnap";

export const Frame = (): JSX.Element => {
  return (
    <div className="flex flex-col min-h-screen w-full bg-startsnap-candlelight">
      <HeaderSection />
      <div className="flex flex-col w-full min-h-screen overflow-y-auto">
        <Routes>
          <Route path="/" element={<MainContentSection />} />
          <Route path="/project/quantum-leap-synthesizer" element={<ProjectDetail />} />
          <Route path="/create" element={<CreateStartSnap />} />
        </Routes>
      </div>
      <FooterSection />
    </div>
  );
};