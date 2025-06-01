/**
 * src/components/ui/segmented-control.tsx
 * @description A segmented control component for switching between project types
 */

import React from "react";
import { cn } from "../../lib/utils";

interface SegmentedControlProps {
  value: 'idea' | 'live';
  onChange: (value: 'idea' | 'live') => void;
  className?: string;
}

/**
 * @description A segmented control component for switching between project types
 * @param {SegmentedControlProps} props - Component props
 * @returns {JSX.Element} Segmented control component
 */
export const SegmentedControl = ({
  value,
  onChange,
  className
}: SegmentedControlProps): JSX.Element => {
  return (
    <div 
      className={cn(
        "flex overflow-hidden rounded-lg border-2 border-solid border-gray-800 w-full max-w-xs", 
        className
      )}
    >
      <button
        type="button"
        onClick={() => onChange('idea')}
        className={cn(
          "flex-1 py-2 px-4 font-['Space_Mono',Helvetica] text-sm transition-colors flex items-center justify-center",
          value === 'idea'
            ? "bg-startsnap-corn text-startsnap-ebony-clay"
            : "bg-startsnap-white text-startsnap-oxford-blue hover:bg-startsnap-athens-gray"
        )}
      >
        {value === 'idea' && (
          <span className="material-icons text-sm mr-1">check</span>
        )}
        Idea / Concept
      </button>
      <button
        type="button"
        onClick={() => onChange('live')}
        className={cn(
          "flex-1 py-2 px-4 font-['Space_Mono',Helvetica] text-sm transition-colors flex items-center justify-center",
          value === 'live'
            ? "bg-startsnap-mountain-meadow text-white"
            : "bg-startsnap-white text-startsnap-oxford-blue hover:bg-startsnap-athens-gray"
        )}
      >
        {value === 'live' && (
          <span className="material-icons text-sm mr-1">check</span>
        )}
        Live Project
      </button>
    </div>
  );
};