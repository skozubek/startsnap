/**
 * src/components/ui/segmented-control.tsx
 * @description A segmented control component for mutually exclusive selection options
 */

import React from "react";
import { cn } from "../../lib/utils";

export interface SegmentedControlOption {
  value: string;
  label: React.ReactNode;
}

interface SegmentedControlProps {
  options: SegmentedControlOption[];
  value: string;
  onChange: (value: string) => void;
  className?: string;
  fullWidth?: boolean;
}

/**
 * @description A segmented control component for selecting from mutually exclusive options
 * @param {SegmentedControlProps} props - Component props
 * @returns {JSX.Element} Segmented control component
 */
export function SegmentedControl({
  options,
  value,
  onChange,
  className,
  fullWidth = false,
}: SegmentedControlProps): JSX.Element {
  return (
    <div
      className={cn(
        "flex p-1 bg-gray-100 rounded-lg border-2 border-gray-800",
        fullWidth ? "w-full" : "w-fit",
        className
      )}
    >
      {options.map((option) => (
        <button
          key={option.value}
          type="button"
          onClick={() => onChange(option.value)}
          className={cn(
            "relative px-4 py-2 text-base font-medium transition-all duration-200 rounded-md",
            fullWidth ? "flex-1" : "",
            value === option.value
              ? "bg-startsnap-french-rose text-white shadow-sm"
              : "bg-transparent text-startsnap-ebony-clay hover:bg-gray-200"
          )}
        >
          {option.label}
        </button>
      ))}
    </div>
  );
}