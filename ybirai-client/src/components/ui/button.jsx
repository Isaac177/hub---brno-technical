import * as React from "react"
import { Slot } from "@radix-ui/react-slot"
import { cva } from "class-variance-authority"
import { cn } from "../../lib/utils"

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-lg text-sm font-medium transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0",
  {
    variants: {
      variant: {
        default:
          "bg-gradient-to-r from-blue-600 to-blue-700 text-white shadow-lg shadow-blue-500/25 hover:shadow-xl hover:shadow-blue-500/30 hover:from-blue-700 hover:to-blue-800 focus-visible:ring-blue-500",
        destructive:
          "bg-gradient-to-r from-red-600 to-red-700 text-white shadow-lg shadow-red-500/25 hover:shadow-xl hover:shadow-red-500/30 hover:from-red-700 hover:to-red-800 focus-visible:ring-red-500",
        outline:
          "border-2 border-slate-200 bg-white text-slate-700 shadow-sm hover:bg-slate-50 hover:border-slate-300 hover:shadow-md focus-visible:ring-slate-500 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-300 dark:hover:bg-slate-800 dark:hover:border-slate-600",
        secondary:
          "bg-slate-100 text-slate-900 shadow-sm hover:bg-slate-200 hover:shadow-md focus-visible:ring-slate-500 dark:bg-slate-800 dark:text-slate-100 dark:hover:bg-slate-700",
        ghost:
          "text-slate-700 hover:bg-slate-100 hover:text-slate-900 focus-visible:ring-slate-500 dark:text-slate-300 dark:hover:bg-slate-800 dark:hover:text-slate-100",
        link: "text-blue-600 underline-offset-4 hover:underline hover:text-blue-700 focus-visible:ring-blue-500 dark:text-blue-400 dark:hover:text-blue-300",
        success:
          "bg-gradient-to-r from-green-600 to-green-700 text-white shadow-lg shadow-green-500/25 hover:shadow-xl hover:shadow-green-500/30 hover:from-green-700 hover:to-green-800 focus-visible:ring-green-500",
        warning:
          "bg-gradient-to-r from-amber-500 to-amber-600 text-white shadow-lg shadow-amber-500/25 hover:shadow-xl hover:shadow-amber-500/30 hover:from-amber-600 hover:to-amber-700 focus-visible:ring-amber-500",
      },
      size: {
        default: "h-10 px-4 py-2",
        sm: "h-8 rounded-md px-3 text-xs",
        lg: "h-12 rounded-lg px-8 text-base",
        xl: "h-14 rounded-xl px-10 text-lg",
        icon: "h-10 w-10",
        "icon-sm": "h-8 w-8 rounded-md",
        "icon-lg": "h-12 w-12 rounded-lg",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
)

const Button = React.forwardRef(({ className, variant, size, asChild = false, ...props }, ref) => {
  const Comp = asChild ? Slot : "button"
  return (
    <Comp
      className={cn(buttonVariants({ variant, size, className }))}
      ref={ref}
      {...props}
    />
  )
})
Button.displayName = "Button"

export { Button, buttonVariants }
