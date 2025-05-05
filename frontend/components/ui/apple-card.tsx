import * as React from "react"
import { cn } from "@/lib/utils"

interface AppleCardProps extends React.HTMLAttributes<HTMLDivElement> {
  gradient?: boolean
  hover?: boolean
}

const AppleCard = React.forwardRef<HTMLDivElement, AppleCardProps>(
  ({ className, gradient = false, hover = false, ...props }, ref) => {
    return (
      <div
        ref={ref}
        className={cn(
          "rounded-2xl bg-card p-6 text-card-foreground shadow-apple backdrop-blur-sm border border-border/40",
          hover && "card-apple-hover",
          gradient && "bg-gradient-to-b from-card to-card/80",
          className
        )}
        {...props}
      />
    )
  }
)
AppleCard.displayName = "AppleCard"

export { AppleCard }