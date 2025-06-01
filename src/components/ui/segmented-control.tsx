/**
 * src/components/ui/segmented-control.tsx
 * @description A segmented control component for toggle selection between multiple options
 */

import React from "react";
import { cn } from "../../lib/utils";

interface SegmentedControlOption {
  value: string;
  label: string;
}

interface SegmentedControlProps {
  options: SegmentedControlOption[];
  value: string;
  onChange: (value: string) => void;
  name?: string;
  className?: string;
}

/**
 * @description Segmented control component for binary or multiple choice selection
 * @param {SegmentedControlProps} props - Component props
 * @returns {JSX.Element} Segmented control component
 */
export const SegmentedControl: React.FC<SegmentedControlProps> = ({
  options,
  value,
  onChange,
  name,
  className,
}) => {
  return (
    <div className={cn("p-1 bg-startsnap-athens-gray border-2 border-solid border-gray-800 rounded-lg flex", className)}>
      {options.map((option) => {
        const isActive = value === option.value;
        return (
          <button
            key={option.value}
            type="button"
            className={cn(
              "flex-1 px-4 py-2 text-center rounded-md transition-all duration-200 font-medium",
              isActive
                ? "bg-startsnap-french-pass text-startsnap-persian-blue"
                : "bg-gray-200 text-startsnap-oxford-blue hover:bg-gray-300"
            )}
            onClick={() => onChange(option.value)}
            aria-pressed={isActive}
          >
            {option.label}
          </button>
        );
      })}
    </div>
  );
};