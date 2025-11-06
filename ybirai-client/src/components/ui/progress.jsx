import * as React from "react"
import * as ProgressPrimitive from "@radix-ui/react-progress"
import { cn } from "../../lib/utils"

const getProgressColor = (value) => {
  if (value >= 100) return "bg-green-500"
  if (value >= 75) return "bg-emerald-500"
  if (value >= 50) return "bg-blue-500"
  if (value >= 25) return "bg-yellow-500"
  return "bg-red-500"
}

const Progress = React.forwardRef(({ className, value, ...props }, ref) => (
  <ProgressPrimitive.Root
    ref={ref}
    className={cn(
      "relative h-2 w-full overflow-hidden rounded-full bg-muted",
      className
    )}
    {...props}
  >
    <ProgressPrimitive.Indicator
      className={cn(
        "h-full w-full flex-1 transition-all duration-300",
        getProgressColor(value)
      )}
      style={{ transform: `translateX(-${100 - (value || 0)}%)` }}
    />
  </ProgressPrimitive.Root>
))
Progress.displayName = ProgressPrimitive.Root.displayName

export { Progress }
