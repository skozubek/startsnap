/**
 * src/components/ui/popover.tsx
 * @description Popover component based on Radix UI's Popover primitive
 */

import * as React from "react"
import * as PopoverPrimitive from "@radix-ui/react-popover"

import { cn } from "../../lib/utils"

/**
 * @description Root component for the Popover
 */
const Popover = PopoverPrimitive.Root

/**
 * @description Trigger component for the Popover
 */
const PopoverTrigger = PopoverPrimitive.Trigger

/**
 * @description Content component for the Popover with styling
 * @param {Object} props - Component props
 * @param {React.ReactNode} props.children - Content to display in the popover
 * @param {string} [props.className] - Additional CSS classes
 * @param {React.ComponentPropsWithoutRef<typeof PopoverPrimitive.Content>} props.props - Other props
 * @returns {JSX.Element} Styled popover content
 */
const PopoverContent = React.forwardRef<
  React.ElementRef<typeof PopoverPrimitive.Content>,
  React.ComponentPropsWithoutRef<typeof PopoverPrimitive.Content>
>(({ className, align = "center", sideOffset = 4, ...props }, ref) => (
  <PopoverPrimitive.Portal>
    <PopoverPrimitive.Content
      ref={ref}
      align={align}
      sideOffset={sideOffset}
      className={cn(
        "z-50 w-72 rounded-md border bg-popover p-4 text-popover-foreground shadow-md outline-none data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95 data-[side=bottom]:slide-in-from-top-2 data-[side=left]:slide-in-from-right-2 data-[side=right]:slide-in-from-left-2 data-[side=top]:slide-in-from-bottom-2",
        className
      )}
      {...props}
    />
  </PopoverPrimitive.Portal>
))
PopoverContent.displayName = PopoverPrimitive.Content.displayName

export { Popover, PopoverTrigger, PopoverContent }