/**
 * src/components/ui/segmented-control.tsx
 * @description A segmented control component for selection between multiple options
 */

import React from "react";
import { cn } from "../../lib/utils";

export interface SegmentOption {
  value: string;
  label: string;
}

interface SegmentedControlProps {
  options: SegmentOption[];
  value: string;
  onChange: (value: string) => void;
  className?: string;
}

/**
 * @description A segmented control component that allows selection between multiple options
 * @param {SegmentedControlProps} props - Component props
 * @returns {JSX.Element} Segmented control UI component
 */
export function SegmentedControl({
  options,
  value,
  onChange,
  className,
}: SegmentedControlProps): JSX.Element {
  return (
    <div
      className={cn(
        "flex w-full border-2 border-gray-800 rounded-lg overflow-hidden",
        className
      )}
    >
      {options.map((option) => {
        const isSelected = option.value === value;
        return (
          <button
            key={option.value}
            type="button"
            onClick={() => onChange(option.value)}
            className={cn(
              "flex-1 py-3 px-4 text-center transition-colors font-['Roboto',Helvetica] font-bold text-base",
              isSelected 
                ? "bg-startsnap-french-rose text-startsnap-white" 
                : "bg-startsnap-athens-gray text-startsnap-ebony-clay hover:bg-gray-300"
            )}
          >
            {option.label}
          </button>
        );
      })}
    </div>
  );
}