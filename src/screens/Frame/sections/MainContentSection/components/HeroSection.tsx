/**
 * src/screens/Frame/sections/MainContentSection/components/HeroSection.tsx
 * @description Hero section component for the main content area, featuring a dynamic headline and call to action.
 */
import React, { useRef, useEffect } from 'react';
import Typed from 'typed.js';
import { Button } from '../../../../../components/ui/button';
import { Link } from 'react-router-dom';

/**
 * @description Renders the hero section of the main content page.
 * It includes a dynamic headline animated with Typed.js, a brief description,
 * and a call-to-action button linking to the projects page.
 * @returns {JSX.Element} The HeroSection component.
 */
export const HeroSection = (): JSX.Element => {
  const typedRef = useRef(null);

  useEffect(() => {
    const typed = new Typed(typedRef.current, {
      strings: ['Startups^1000', 'Start<del class="text-gray-400 text-[0.9em] font-normal">ups</del>snaps'],
      typeSpeed: 50,
      backSpeed: 50,
      startDelay: 500,
      showCursor: true,
      cursorChar: '|',
      autoInsertCss: true,
      loop: false,
    });

    return () => {
      typed.destroy();
    };
  }, []);

  return (
    <div className="w-full bg-[--startsnap-beige]">
      <div className="max-w-screen-2xl mx-auto px-4 sm:px-6 lg:px-8 py-12 md:py-16 lg:py-24 flex flex-col md:flex-row items-center">
        {/* Bolt.new Badge - Fixed positioning with responsive behavior */}
      <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 z-10">
        <a 
          href="https://bolt.new" 
          target="_blank" 
          rel="noopener noreferrer" 
          className="block transition-all duration-300 hover:scale-110 bolt-badge"
        >
          <img 
            src="https://storage.bolt.army/white_circle_360x360.png" 
            alt="Built with Bolt.new badge" 
            className="w-24 h-24 md:w-32 md:h-32 rounded-full shadow-lg bolt-badge-intro"
            onAnimationEnd={(e) => e.currentTarget.classList.add('animated')}
          />
        </a>
      </div>
        <div className="w-full md:w-[60%] md:pr-8 lg:pr-16 mb-8 md:mb-0 text-center md:text-left">
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-startsnap-ebony-clay mb-4 sm:mb-6 font-['Space_Grotesk',Helvetica] leading-tight">
            We're Vibe Coders,<br />
            We Build <span ref={typedRef}></span>
          </h1>
          <p className="text-base sm:text-lg lg:text-xl text-startsnap-river-bed mb-6 sm:mb-8 font-['Roboto',Helvetica] leading-relaxed">
            Showcase your journey, build in public, get real feedback, and connect with opportunities
          </p>
          <Button asChild className="startsnap-button bg-startsnap-french-rose text-startsnap-white font-['Roboto',Helvetica] font-bold text-base sm:text-lg px-6 sm:px-8 py-4 sm:py-6 rounded-lg border-2 border-solid border-gray-800 shadow-[3px_3px_0px_#1f2937]">
            <Link to="/projects">Browse Projects</Link>
          </Button>
        </div>
        <div className="w-[80%] sm:w-[60%] md:w-[40%] mx-auto md:mx-0">
          <img
            src="https://ik.imagekit.io/craftsnap/startsnap/vibe-coder.png"
            alt="Collaborative team working together"
            className="w-full h-auto"
          />
        </div>
      </div>
    </div>
  );
};