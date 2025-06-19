/**
 * src/components/ui/segmented-control.tsx
 * @description A segmented control component for selecting between two options (idea/concept vs live project)
 */

import React from "react";
import { cn } from "../../lib/utils";

interface SegmentedControlProps {
  value: "idea" | "live";
  onChange: (value: "idea" | "live") => void;
  className?: string;
}

/**
 * @description A segmented control component that allows selecting between idea/concept and live project
 * @param {SegmentedControlProps} props - Component props including current value and change handler
 * @returns {JSX.Element} Segmented control with two selectable options
 */
export const SegmentedControl = ({
  value,
  onChange,
  className,
}: SegmentedControlProps): JSX.Element => {
  return (
    <div
      className={cn(
        "flex w-full border-0 bg-gray-50 rounded-xl overflow-hidden md:border-2 md:border-solid md:border-gray-800 md:rounded-lg md:bg-white",
        className
      )}
    >
      <button
        type="button"
        onClick={() => onChange("idea")}
        className={cn(
          "flex items-center justify-center flex-1 py-3 px-3 min-h-[44px] text-center font-medium transition-all duration-200 text-sm",
          value === "idea"
            ? "bg-startsnap-corn text-startsnap-ebony-clay rounded-lg mx-1 my-1 shadow-sm"
            : "text-startsnap-ebony-clay hover:bg-gray-100 md:hover:bg-gray-100"
        )}
      >
        {value === "idea" && (
          <span className="material-icons text-sm mr-1">check</span>
        )}
        Idea / Concept
      </button>
      <button
        type="button"
        onClick={() => onChange("live")}
        className={cn(
          "flex items-center justify-center flex-1 py-3 px-3 min-h-[44px] text-center font-medium transition-all duration-200 text-sm",
          value === "live"
            ? "bg-startsnap-mountain-meadow text-white rounded-lg mx-1 my-1 shadow-sm"
            : "text-startsnap-ebony-clay hover:bg-gray-100 md:hover:bg-gray-100"
        )}
      >
        {value === "live" && (
          <span className="material-icons text-sm mr-1">check</span>
        )}
        Live Project
      </button>
    </div>
  );
};