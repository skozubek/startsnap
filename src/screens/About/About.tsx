/**
 * src/screens/About/About.tsx
 * @description About page component that tells the StartSnap.fun story and mission
 */

import React from "react";
import { Card, CardContent } from "../../components/ui/card";
import { Button } from "../../components/ui/button";
import { Link } from "react-router-dom";

/**
 * @description Renders the About page with brand story, mission, and values
 * @returns {JSX.Element} About page content
 */
export const About = (): JSX.Element => {
  return (
    <div className="flex flex-col w-full bg-white">
      {/* Hero Section */}
      <div className="w-full bg-startsnap-candlelight border-b-2 border-gray-800">
        <div className="max-w-4xl mx-auto px-8 py-16">
          <h1 className="text-4xl lg:text-5xl font-bold text-startsnap-ebony-clay text-center font-heading leading-tight">
            About StartSnap.fun
          </h1>
          <div className="text-center mt-6">
            <div className="inline-block bg-startsnap-white px-6 py-3 rounded-lg border-2 border-gray-800 shadow-[3px_3px_0px_#1f2937]">
              <span className="text-lg text-startsnap-river-bed font-medium">
                Where Vibe Coders Build Together
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Content Sections with Alternating Backgrounds */}
      <div className="w-full">
        {/* Our Story - White Background */}
        <section className="w-full bg-white border-b-2 border-gray-800">
          <div className="max-w-4xl mx-auto px-8 py-12">
            <h2 className="text-2xl font-bold text-startsnap-ebony-clay font-heading mb-6">
              Our Story
            </h2>
            <p className="text-startsnap-river-bed leading-relaxed text-lg mb-6">
              StartSnap.fun was born from a simple observation: the most exciting projects happen when builders share 
              their journey openly. We watched creators struggle in isolation, launching into the void without feedback, 
              connection, or community support.
            </p>
            <p className="text-startsnap-river-bed leading-relaxed text-lg">
              So we built what we needed—a space where "Vibe Coders" can showcase their projects, document their building 
              process through Vibe Logs, and get real feedback from fellow creators. We're not just talking about building 
              in public; we're actually doing it. StartSnap.fun itself is our own StartSnap, and every feature you see 
              was shaped by our community's feedback.
            </p>
          </div>
        </section>

        {/* Mission & Values - Light Background */}
        <section className="w-full bg-startsnap-athens-gray border-b-2 border-gray-800">
          <div className="max-w-4xl mx-auto px-8 py-12">
            <h2 className="text-2xl font-bold text-startsnap-ebony-clay font-heading mb-8">
              What We Believe
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div className="bg-startsnap-white p-6 rounded-lg border-2 border-gray-800 shadow-[3px_3px_0px_#1f2937]">
                <h3 className="text-lg font-bold text-startsnap-oxford-blue mb-4 flex items-center">
                  <span className="material-icons text-startsnap-french-rose mr-2">rocket_launch</span>
                  Progress Over Perfection
                </h3>
                <p className="text-startsnap-river-bed leading-relaxed">
                  Every step forward matters, even the messy ones. We celebrate the journey, the iterations, 
                  and the lessons learned along the way.
                </p>
              </div>

              <div className="bg-startsnap-white p-6 rounded-lg border-2 border-gray-800 shadow-[3px_3px_0px_#1f2937]">
                <h3 className="text-lg font-bold text-startsnap-oxford-blue mb-4 flex items-center">
                  <span className="material-icons text-startsnap-mountain-meadow mr-2">diversity_3</span>
                  Community First
                </h3>
                <p className="text-startsnap-river-bed leading-relaxed">
                  Great ideas get better when shared. We foster a supportive environment where builders 
                  help builders grow and succeed together.
                </p>
              </div>

              <div className="bg-startsnap-white p-6 rounded-lg border-2 border-gray-800 shadow-[3px_3px_0px_#1f2937]">
                <h3 className="text-lg font-bold text-startsnap-oxford-blue mb-4 flex items-center">
                  <span className="material-icons text-startsnap-persian-blue mr-2">auto_awesome</span>
                  AI-Powered Future
                </h3>
                <p className="text-startsnap-river-bed leading-relaxed">
                  We embrace AI as a creative partner. Modern builders use every tool available, 
                  and we celebrate the incredible things possible with AI assistance.
                </p>
              </div>

              <div className="bg-startsnap-white p-6 rounded-lg border-2 border-gray-800 shadow-[3px_3px_0px_#1f2937]">
                <h3 className="text-lg font-bold text-startsnap-oxford-blue mb-4 flex items-center">
                  <span className="material-icons text-startsnap-corn mr-2">insights</span>
                  Transparent Growth
                </h3>
                <p className="text-startsnap-river-bed leading-relaxed">
                  Building in public isn't just a trend—it's how we learn, improve, and inspire others. 
                  Transparency creates trust and accelerates innovation.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* The Vision - White Background */}
        <section className="w-full bg-white border-b-2 border-gray-800">
          <div className="max-w-4xl mx-auto px-8 py-12">
            <h2 className="text-2xl font-bold text-startsnap-ebony-clay font-heading mb-6">
              Our Vision
            </h2>
            <p className="text-startsnap-river-bed leading-relaxed text-lg mb-6">
              We envision a world where every builder has a community cheering them on, providing honest feedback, 
              and celebrating their wins. Where sharing your process is as natural as sharing your final product. 
              Where the next breakthrough comes from someone who felt supported enough to share their "crazy" idea.
            </p>
            <p className="text-startsnap-river-bed leading-relaxed text-lg">
              StartSnap.fun is more than a platform—it's a movement. A place where builders become better builders 
              through community, feedback, and the courage to build in public.
            </p>
          </div>
        </section>

        {/* Call to Action - Final Section */}
        <section className="w-full bg-startsnap-french-pass">
          <div className="max-w-4xl mx-auto px-8 py-16">
            <div className="text-center">
              <h2 className="text-2xl font-bold text-startsnap-ebony-clay font-heading mb-6">
                Ready to Join the Vibe?
              </h2>
              <p className="text-startsnap-river-bed leading-relaxed mb-8 text-lg max-w-2xl mx-auto">
                Whether you're just starting out or you're a seasoned builder, there's a place for you here. 
                Share your journey, get feedback, and help others grow. Let's build something amazing together.
              </p>

              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Button
                  variant="primary"
                  size="lg"
                  asChild
                  className="text-lg px-8 py-4"
                >
                  <Link to="/create">Share Your StartSnap</Link>
                </Button>
                <Button
                  variant="secondary"
                  size="lg"
                  asChild
                  className="text-lg px-8 py-4"
                >
                  <Link to="/projects">Explore Projects</Link>
                </Button>
              </div>

              <div className="mt-8 bg-startsnap-white p-6 rounded-lg border-2 border-gray-800 shadow-[3px_3px_0px_#1f2937] max-w-2xl mx-auto">
                <p className="text-sm text-startsnap-river-bed">
                  <strong>Fun fact:</strong> This entire platform was built in public. Check out our own StartSnap 
                  to see how community feedback shaped every feature you're using right now.
                </p>
                <Button
                  variant="ghost"
                  size="sm"
                  asChild
                  className="mt-3"
                >
                  <Link to="/projects/startsnapfun">See Our Journey →</Link>
                </Button>
              </div>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
};