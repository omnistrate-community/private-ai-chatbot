import * as React from "react"
import { Slot } from "@radix-ui/react-slot"
import { cva, type VariantProps } from "class-variance-authority"

import { cn } from "@/lib/utils"

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap text-sm font-medium transition-all duration-200 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0",
  {
    variants: {
      variant: {
        default:
          "bg-primary text-primary-foreground shadow-apple hover:shadow-apple-md hover:bg-primary/90 active:scale-[0.98] active:shadow-apple-sm",
        destructive:
          "bg-destructive text-destructive-foreground shadow-apple hover:shadow-apple-md hover:bg-destructive/90 active:scale-[0.98] active:shadow-apple-sm",
        outline:
          "border border-input bg-background/80 backdrop-blur-sm shadow-apple hover:shadow-apple-md hover:bg-accent/30 hover:text-accent-foreground active:scale-[0.98] active:shadow-apple-sm",
        secondary:
          "bg-secondary text-secondary-foreground shadow-apple hover:shadow-apple-md hover:bg-secondary/80 active:scale-[0.98] active:shadow-apple-sm",
        ghost: "hover:bg-accent/30 hover:text-accent-foreground active:scale-[0.98]",
        link: "text-primary underline-offset-4 hover:underline",
        pill: "bg-primary/10 text-primary hover:bg-primary/20 rounded-full shadow-none",
      },
      size: {
        default: "h-10 px-5 py-2 rounded-xl",
        sm: "h-9 px-4 py-2 rounded-xl text-xs",
        lg: "h-11 px-8 py-3 rounded-xl text-base",
        icon: "h-9 w-9 rounded-full",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
)

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, asChild = false, ...props }, ref) => {
    const Comp = asChild ? Slot : "button"
    return (
      <Comp
        className={cn(buttonVariants({ variant, size, className }))}
        ref={ref}
        {...props}
      />
    )
  }
)
Button.displayName = "Button"

export { Button, buttonVariants }
