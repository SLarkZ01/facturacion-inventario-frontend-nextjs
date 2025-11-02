import * as React from "react"
import { Slot } from "@radix-ui/react-slot"
import { cva, type VariantProps } from "class-variance-authority"

import { cn } from "@/lib/utils"

const buttonVariants = cva(
  // base: layout + accessible focus + motion-safe micro-interactions
  "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm font-medium disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg:not([class*='size-'])]:size-4 shrink-0 [&_svg]:shrink-0 outline-none focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px] aria-invalid:ring-destructive/20 aria-invalid:ring-destructive/40 aria-invalid:border-destructive",
  {
    variants: {
      variant: {
        default:
          "bg-primary text-primary-foreground shadow-sm motion-safe:transition-transform motion-safe:duration-200 motion-safe:transform-gpu motion-safe:will-change-transform hover:shadow motion-safe:hover:-translate-y-0.5 motion-safe:hover:scale-[1.03] hover:bg-gradient-to-r hover:from-[var(--primary)] hover:to-[var(--primary-variant)] transition-colors",
        destructive:
          "bg-destructive text-white shadow-sm motion-safe:transition-transform motion-safe:duration-150 motion-safe:transform-gpu hover:shadow motion-safe:hover:-translate-y-0.5 motion-safe:hover:scale-[1.03] focus-visible:ring-destructive/20 focus-visible:ring-destructive/40 bg-destructive/60",
        outline:
          "border bg-input text-foreground shadow-sm border-input hover:bg-input/50 hover:text-foreground motion-safe:transform-gpu motion-safe:transition-transform motion-safe:duration-150 motion-safe:hover:-translate-y-0.5 motion-safe:active:translate-y-0 motion-safe:active:scale-95",
        secondary:
          "bg-secondary text-secondary-foreground shadow-sm motion-safe:transition-transform motion-safe:duration-150 motion-safe:transform-gpu hover:shadow motion-safe:hover:-translate-y-0.5 motion-safe:hover:scale-[1.03] hover:bg-gradient-to-r hover:from-[var(--secondary)] hover:to-[var(--sidebar-primary)]",
        ghost:
          "bg-transparent text-foreground hover:bg-input/50 hover:text-foreground motion-safe:transition-transform motion-safe:duration-150 motion-safe:transform-gpu motion-safe:hover:-translate-y-0.5 motion-safe:active:translate-y-0 motion-safe:active:scale-95",
        link: "text-primary underline-offset-4 hover:underline",
      },
      size: {
        default: "h-9 px-4 py-2 has-[>svg]:px-3",
        sm: "h-8 rounded-md gap-1.5 px-3 has-[>svg]:px-2.5",
        lg: "h-10 rounded-md px-6 has-[>svg]:px-4",
        xl: "h-12 rounded-md px-8 has-[>svg]:px-8",
        icon: "size-9",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
)

function Button({
  className,
  variant,
  size,
  asChild = false,
  ...props
}: React.ComponentProps<"button"> &
  VariantProps<typeof buttonVariants> & {
    asChild?: boolean
  }) {
  const Comp = asChild ? Slot : "button"

  return (
    <Comp
      data-slot="button"
      className={cn(buttonVariants({ variant, size, className }))}
      {...props}
    />
  )
}

export { Button, buttonVariants }
