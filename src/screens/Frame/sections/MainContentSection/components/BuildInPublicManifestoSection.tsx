/**
 * src/screens/Frame/sections/MainContentSection/components/BuildInPublicManifestoSection.tsx
 * @description Component for the 'Build in Public Manifesto' section, explaining the Vibe Coder philosophy.
 */
import React, { useState } from 'react';
import { Button } from '../../../../../components/ui/button';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../../../../context/AuthContext';
import { AuthDialog } from '../../../../../components/ui/auth-dialog';

/**
 * @description Renders the 'Build in Public Manifesto' section, also known as 'This Is How We Vibe'.
 * It includes informational text, an image, and calls to action related to the platform's ethos.
 * @returns {JSX.Element} The BuildInPublicManifestoSection component.
 */
export const BuildInPublicManifestoSection = (): JSX.Element => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [isAuthDialogOpen, setIsAuthDialogOpen] = useState(false);
  const [authMode, setAuthMode] = useState<'login' | 'signup'>('login');

  const handleStartJourneyClick = () => {
    if (user) {
      navigate('/create');
    } else {
      setAuthMode('login');
      setIsAuthDialogOpen(true);
    }
  };

  const handleLoginSuccess = () => {
    navigate('/create');
    setIsAuthDialogOpen(false);
  };

  return (
    <>
      <div className="w-full bg-startsnap-white border-t-2 border-b-2 border-gray-800">
        <div className="max-w-screen-2xl mx-auto px-8 py-16 lg:py-24">
          <h2 className="text-4xl lg:text-5xl font-heading text-startsnap-ebony-clay text-center mb-12 leading-tight">
            This Is How We Vibe
          </h2>

          {/* Text and Image Row */}
          <div className="flex flex-col-reverse md:flex-row gap-12 items-center max-w-6xl mx-auto mb-16">
            <div className="w-full md:w-[60%]">
              <p className="text-lg lg:text-xl text-startsnap-river-bed mb-6 leading-relaxed font-body">
                We build in public - sharing ideas, wins, and lessons as we go.
              </p>
              <p className="text-lg lg:text-xl text-startsnap-river-bed mb-6 leading-relaxed font-body">
                We learn from each other, with feedback that helps us get better.
              </p>
              <p className="text-lg lg:text-xl text-startsnap-river-bed mb-6 leading-relaxed font-body">
                StartSnap.fun is a place to connect, share your progress, or just see what others are up to.
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
              <h3 className="text-xl font-heading text-startsnap-ebony-clay mb-4">
                Why Build in Public?
              </h3>
              <ul className="space-y-4 text-startsnap-river-bed">
                <li className="flex items-start gap-2">
                  <span className="material-icons text-startsnap-french-rose mt-1">rocket_launch</span>
                  <span><strong>Show your process.</strong> Every step counts, even the rough ones.</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="material-icons text-startsnap-french-rose mt-1">forum</span>
                  <span><strong>Get real feedback.</strong> Honest thoughts help you improve.</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="material-icons text-startsnap-french-rose mt-1">diversity_3</span>
                  <span><strong>Meet others.</strong> Builders, mentors, and friends are here too.</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="material-icons text-startsnap-french-rose mt-1">auto_awesome</span>
                  <span><strong>Inspire someone.</strong> Your story might help someone else start.</span>
                </li>
              </ul>
            </div>

            <div className="bg-startsnap-french-pass p-6 rounded-lg border-2 border-gray-800 shadow-[3px_3px_0px_#1f2937] hover:translate-x-[-2px] hover:translate-y-[-2px] hover:shadow-[5px_5px_0px_#1f2937] transition-all duration-200">
              <h3 className="text-xl font-heading text-startsnap-ebony-clay mb-4">
                How We Support You
              </h3>
              <ul className="space-y-4 text-startsnap-river-bed">
                <li className="flex items-start gap-2">
                  <span className="material-icons text-startsnap-persian-blue mt-1">insights</span>
                  <span><strong>Vibe Log:</strong> Share updates - big or small, as they happen.</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="material-icons text-startsnap-persian-blue mt-1">groups</span>
                  <span><strong>Community Feedback:</strong> Get advice and ideas from others.</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="material-icons text-startsnap-persian-blue mt-1">favorite</span>
                  <span><strong>Project Support:</strong> See who's cheering you on.</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="material-icons text-startsnap-persian-blue mt-1">work</span>
                  <span><strong>Opportunities:</strong> Let people know if you're open to new things.</span>
                </li>
              </ul>
            </div>
          </div>

          <div className="text-center">
            <Button
              variant="primary"
              onClick={handleStartJourneyClick}
              className="text-startsnap-white text-lg px-8 py-4"
            >
              Start Your Journey
            </Button>
          </div>
        </div>
      </div>
      <AuthDialog
        isOpen={isAuthDialogOpen}
        onClose={() => setIsAuthDialogOpen(false)}
        mode={authMode}
        onSuccess={handleLoginSuccess}
      />
    </>
  );
};