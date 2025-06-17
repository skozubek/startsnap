/**
 * src/components/ui/PulsePanel.tsx
 * @description Slide-over panel component for displaying the Community Pulse activity feed
 */

import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from './button';
import { X } from 'lucide-react';
import { ActivityFeedSection } from './ActivityFeedSection';

/**
 * @description Props for the PulsePanel component
 * @param {boolean} isOpen - Whether the panel is currently open
 * @param {() => void} onClose - Function to call when the panel should be closed
 */
interface PulsePanelProps {
  isOpen: boolean;
  onClose: () => void;
}

/**
 * @description Slide-over panel that displays the Community Pulse activity feed
 * @param {PulsePanelProps} props - Component props
 * @returns {JSX.Element} Animated slide-over panel with activity feed
 */
export const PulsePanel: React.FC<PulsePanelProps> = ({ isOpen, onClose }) => {
  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="fixed inset-0 bg-black/50 z-40"
            onClick={onClose}
          />

          {/* Panel */}
          <motion.div
            initial={{ x: "100%" }}
            animate={{ x: "0%" }}
            exit={{ x: "100%" }}
            transition={{ type: "spring", damping: 30, stiffness: 300 }}
            className="fixed top-0 right-0 bottom-0 w-full max-w-md bg-startsnap-ebony-clay border-l-4 border-startsnap-french-rose z-50 flex flex-col shadow-2xl"
          >
            {/* Header */}
            <div className="flex items-center justify-between p-6 border-b-2 border-startsnap-french-rose bg-startsnap-ebony-clay">
              <div className="flex items-center gap-3">
                <span className="material-icons text-startsnap-mountain-meadow text-2xl">bolt</span>
                <h2 className="text-xl font-bold text-startsnap-beige font-['Space_Grotesk',Helvetica]">
                  Community Pulse
                </h2>
              </div>
              <Button
                variant="ghost"
                size="icon"
                onClick={onClose}
                className="text-startsnap-beige hover:text-startsnap-french-rose hover:bg-startsnap-beige/10 rounded-full"
                aria-label="Close Community Pulse panel"
              >
                <X size={20} />
              </Button>
            </div>

            {/* Content */}
            <div className="flex-1 overflow-y-auto bg-startsnap-beige">
              <div className="p-4">
                <div className="mb-4 p-3 bg-startsnap-wisp-pink border-2 border-gray-800 rounded-lg shadow-[2px_2px_0px_#1f2937]">
                  <p className="text-startsnap-ebony-clay font-['Roboto',Helvetica] text-sm leading-relaxed">
                    <span className="font-bold">Live feed</span> of what's happening in the StartSnap community right now! 
                    New projects, vibe logs, support milestones, and more.
                  </p>
                </div>
                <ActivityFeedSection isInPanel={true} />
              </div>
            </div>

            {/* Footer */}
            <div className="p-4 border-t-2 border-startsnap-french-rose bg-startsnap-ebony-clay">
              <p className="text-startsnap-beige font-['Roboto',Helvetica] text-xs text-center">
                Updates in real-time • Join the conversation!
              </p>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};