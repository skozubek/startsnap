/**
 * src/components/ui/PulsePanel.tsx
 * @description Sliding panel component for displaying the Community Pulse activity feed
 */

import React, { useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X } from 'lucide-react';
import { Button } from './button';
import { ActivityFeedSection } from './ActivityFeedSection';

/**
 * @description Props for the PulsePanel component
 * @param {boolean} isOpen - Whether the panel is currently open
 * @param {() => void} onClose - Function to call when the panel should be closed
 * @param {string | null} latestActivityTimestamp - Timestamp of the latest activity for triggering refreshes
 */
interface PulsePanelProps {
  isOpen: boolean;
  onClose: () => void;
  latestActivityTimestamp: string | null;
}

/**
 * @description Sliding panel component that displays the Community Pulse activity feed
 * @param {PulsePanelProps} props - Component props
 * @returns {JSX.Element} Animated sliding panel with activity feed
 */
export const PulsePanel: React.FC<PulsePanelProps> = ({
  isOpen,
  onClose,
  latestActivityTimestamp
}) => {
  /**
   * @description Handles escape key press to close the panel
   * @param {KeyboardEvent} event - Keyboard event
   */
  const handleEscapeKey = (event: KeyboardEvent) => {
    if (event.key === 'Escape') {
      onClose();
    }
  };

  useEffect(() => {
    if (isOpen) {
      document.addEventListener('keydown', handleEscapeKey);
      // Prevent body scroll when panel is open
      document.body.style.overflow = 'hidden';
    } else {
      document.removeEventListener('keydown', handleEscapeKey);
      // Restore body scroll when panel is closed
      document.body.style.overflow = 'unset';
    }

    return () => {
      document.removeEventListener('keydown', handleEscapeKey);
      document.body.style.overflow = 'unset';
    };
  }, [isOpen]);

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
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{
              type: 'spring',
              damping: 25,
              stiffness: 200,
              duration: 0.4
            }}
            className="fixed top-0 right-0 h-full w-full max-w-md bg-white shadow-2xl z-50 border-l-4 border-startsnap-french-rose"
            data-pulse-panel-open="true"
          >
            {/* Panel Header */}
            <div className="flex items-center justify-between p-6 border-b-2 border-gray-800 bg-startsnap-beige">
              <div className="flex items-center gap-3">
                <span className="material-icons text-startsnap-mountain-meadow text-2xl">bolt</span>
                <h2 className="text-xl font-bold text-startsnap-ebony-clay font-['Space_Grotesk',Helvetica]">
                  Community Pulse
                </h2>
              </div>
              <Button
                variant="ghost"
                size="icon"
                onClick={onClose}
                className="text-startsnap-ebony-clay hover:text-startsnap-french-rose hover:bg-startsnap-mischka/50 rounded-full"
                aria-label="Close Community Pulse"
              >
                <X size={24} />
              </Button>
            </div>

            {/* Panel Content */}
            <div className="flex-1 overflow-hidden">
              <ActivityFeedSection
                isInPanel={true}
                latestActivityTimestamp={latestActivityTimestamp}
              />
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};