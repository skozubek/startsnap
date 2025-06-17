/**
 * src/components/ui/PulsePanel.tsx
 * @description Community Pulse slide-over panel that displays live activity feed with neobrutalist styling
 */

import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from './button';
import { X } from 'lucide-react';

/**
 * @description Props for the PulsePanel component
 * @param {boolean} isOpen - Whether the panel is open
 * @param {() => void} onClose - Function to call when closing the panel
 */
interface PulsePanelProps {
  isOpen: boolean;
  onClose: () => void;
}

/**
 * @description Community Pulse slide-over panel component with neobrutalist design
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
            transition={{ 
              type: "spring", 
              damping: 25, 
              stiffness: 200,
              duration: 0.4 
            }}
            className="fixed top-0 right-0 bottom-0 w-full max-w-md bg-startsnap-ebony-clay border-l-4 border-startsnap-french-rose shadow-[-8px_0px_32px_rgba(0,0,0,0.3)] z-50 flex flex-col"
          >
            {/* Header */}
            <div className="flex items-center justify-between p-6 border-b-2 border-startsnap-french-rose bg-startsnap-ebony-clay">
              <div className="flex items-center gap-3">
                <span className="text-2xl">⚡️</span>
                <h2 className="font-['Space_Grotesk',Helvetica] font-bold text-startsnap-white text-xl">
                  Community Pulse
                </h2>
              </div>
              <Button
                variant="ghost"
                size="icon"
                onClick={onClose}
                className="text-startsnap-white hover:bg-startsnap-white/10 rounded-lg border-2 border-transparent hover:border-startsnap-french-rose transition-all duration-200"
                aria-label="Close Community Pulse panel"
              >
                <X size={20} />
              </Button>
            </div>

            {/* Content */}
            <div className="flex-1 overflow-y-auto bg-startsnap-white">
              <div className="p-6">
                {/* Placeholder content - will be replaced with ActivityFeedSection */}
                <div className="space-y-4">
                  <div className="text-center py-8">
                    <div className="w-16 h-16 mx-auto mb-4 bg-startsnap-candlelight rounded-full border-2 border-gray-800 shadow-[3px_3px_0px_#1f2937] flex items-center justify-center">
                      <span className="material-icons text-startsnap-ebony-clay text-2xl">bolt</span>
                    </div>
                    <h3 className="font-['Space_Grotesk',Helvetica] font-bold text-startsnap-ebony-clay text-lg mb-2">
                      Live Activity Feed
                    </h3>
                    <p className="text-startsnap-river-bed font-['Roboto',Helvetica] text-sm">
                      Real-time updates from the StartSnap community will appear here.
                    </p>
                  </div>

                  {/* Sample activity items for demonstration */}
                  <div className="space-y-3">
                    {[
                      { icon: 'rocket_launch', text: 'Alice just launched a new AI project', time: '2m ago' },
                      { icon: 'favorite', text: 'Bob supported "Weather App"', time: '5m ago' },
                      { icon: 'forum', text: 'Charlie left feedback on "Task Manager"', time: '8m ago' },
                      { icon: 'person_add', text: 'Diana joined the community', time: '12m ago' },
                    ].map((item, index) => (
                      <div key={index} className="flex items-start gap-3 p-3 bg-startsnap-athens-gray rounded-lg border-2 border-gray-800 shadow-[2px_2px_0px_#1f2937]">
                        <div className="w-8 h-8 bg-startsnap-french-rose rounded-full border-2 border-gray-800 flex items-center justify-center flex-shrink-0">
                          <span className="material-icons text-white text-sm">{item.icon}</span>
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="font-['Roboto',Helvetica] text-startsnap-ebony-clay text-sm leading-relaxed">
                            {item.text}
                          </p>
                          <p className="font-['Inter',Helvetica] text-startsnap-pale-sky text-xs mt-1">
                            {item.time}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            {/* Footer */}
            <div className="p-4 border-t-2 border-gray-800 bg-startsnap-athens-gray">
              <p className="text-center text-startsnap-river-bed font-['Roboto',Helvetica] text-xs">
                Stay connected with the community's latest updates
              </p>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};