import * as React from "react"
import { cn } from "../../lib/utils"

const Input = React.forwardRef(({ className, type, ...props }, ref) => {
  return (
    <input
      type={type}
      className={cn(
        "flex h-10 w-full rounded-lg border-2 border-slate-200 bg-white px-3 py-2 text-sm text-slate-900 placeholder:text-slate-500 transition-all duration-200",
        "focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 focus:outline-none",
        "hover:border-slate-300",
        "disabled:cursor-not-allowed disabled:opacity-50 disabled:bg-slate-50",
        "dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100 dark:placeholder:text-slate-400",
        "dark:focus:border-blue-400 dark:focus:ring-blue-400/20",
        "dark:hover:border-slate-600 dark:disabled:bg-slate-800",
        className
      )}
      ref={ref}
      {...props}
    />
  )
})

Input.displayName = "Input"

export { Input }
