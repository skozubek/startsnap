import * as React from "react";
import { CheckIcon } from "lucide-react";
import { cn } from "../../lib/utils";

export interface CheckboxProps extends React.ComponentPropsWithoutRef<"input"> {
  checked?: boolean;
  onCheckedChange?: (checked: boolean) => void;
}

const Checkbox = React.forwardRef<HTMLInputElement, CheckboxProps>(
  ({ className, checked, onCheckedChange, ...props }, ref) => {
    const [isChecked, setIsChecked] = React.useState(checked || false);

    React.useEffect(() => {
      setIsChecked(!!checked);
    }, [checked]);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      const newChecked = e.target.checked;
      setIsChecked(newChecked);
      onCheckedChange?.(newChecked);
    };

    return (
      <div className="relative">
        <input
          type="checkbox"
          className="absolute h-0 w-0 opacity-0"
          checked={isChecked}
          onChange={handleChange}
          ref={ref}
          {...props}
        />
        <div
          className={cn(
            "flex h-5 w-5 items-center justify-center rounded border-2 border-solid border-gray-800 transition-colors",
            isChecked ? "bg-startsnap-french-rose" : "bg-white",
            className
          )}
          onClick={() => {
            setIsChecked(!isChecked);
            onCheckedChange?.(!isChecked);
          }}
        >
          {isChecked && <CheckIcon className="h-3 w-3 text-white" />}
        </div>
      </div>
    );
  }
);

Checkbox.displayName = "Checkbox";

export { Checkbox };