"use client";

import * as React from "react"
import { Slot } from "@radix-ui/react-slot"
import { cva } from "class-variance-authority";

import { cn } from "@/lib/utils"

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-sm text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0",
  {
    variants: {
      variant: {
        default:
          "bg-primary text-primary-foreground shadow hover:bg-primary/90",
        destructive:
          "bg-destructive text-destructive-foreground shadow-sm hover:bg-destructive/90",
        outline:
          "border border-input bg-transparent hover:bg-secondary hover:text-secondary-foreground",
        secondary:
          "bg-secondary text-secondary-foreground hover:bg-secondary/70",
        ghost: "hover:bg-secondary hover:text-secondary-foreground",
        link: "text-primary underline-offset-4 hover:underline",
        /* Editorial: solid charcoal, uppercase label, generous tracking */
        editorial:
          "bg-primary text-primary-foreground font-label text-xs tracking-[0.16em] hover:bg-accent transition-colors duration-500",
        /* Ghost outline for use on light surfaces */
        line:
          "border border-foreground/40 bg-transparent text-foreground font-label text-xs tracking-[0.16em] hover:bg-foreground hover:text-background transition-colors duration-500",
        /* For use on dark charcoal bands */
        ivory:
          "border border-charcoal-foreground/40 bg-transparent text-charcoal-foreground font-label text-xs tracking-[0.16em] hover:bg-charcoal-foreground hover:text-charcoal transition-colors duration-500",
        accent:
          "bg-accent text-accent-foreground font-label text-xs tracking-[0.16em] hover:bg-accent/90",
      },
      size: {
        default: "h-9 px-4 py-2",
        sm: "h-8 rounded-sm px-3 text-xs",
        lg: "h-11 rounded-sm px-8",
        xl: "h-14 rounded-sm px-12",
        icon: "h-9 w-9",
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
      {...props} />
  );
})
Button.displayName = "Button"

export { Button, buttonVariants }
