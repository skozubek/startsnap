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
        "flex w-full border-2 border-solid border-gray-800 rounded-lg overflow-hidden",
        className
      )}
    >
      <button
        type="button"
        onClick={() => onChange("idea")}
        className={cn(
          "flex items-center justify-center flex-1 py-2.5 px-4 min-w-[160px] text-center font-medium transition-colors whitespace-nowrap",
          value === "idea"
            ? "bg-startsnap-corn text-startsnap-ebony-clay"
            : "bg-white text-startsnap-ebony-clay hover:bg-gray-100"
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
          "flex items-center justify-center flex-1 py-2.5 px-4 min-w-[160px] text-center font-medium transition-colors whitespace-nowrap",
          value === "live"
            ? "bg-startsnap-mountain-meadow text-white"
            : "bg-white text-startsnap-ebony-clay hover:bg-gray-100"
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