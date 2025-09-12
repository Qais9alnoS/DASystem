import * as React from "react";
import { Slot } from "@radix-ui/react-slot";
import { cva, type VariantProps } from "class-variance-authority";

import { cn } from "@/lib/utils";

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-2xl text-sm font-semibold ring-offset-background transition-all duration-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0 btn-ripple",
  {
    variants: {
      variant: {
        default: "bg-gradient-primary text-primary-foreground shadow-elevation-2 hover:shadow-elevation-3 hover:-translate-y-0.5 hover:scale-105",
        destructive: "bg-destructive text-destructive-foreground shadow-elevation-2 hover:shadow-elevation-3 hover:-translate-y-0.5",
        outline: "border border-border bg-background hover:bg-card-hover hover:shadow-card hover:-translate-y-0.5",
        secondary: "bg-gradient-secondary text-secondary-foreground shadow-elevation-2 hover:shadow-elevation-3 hover:-translate-y-0.5 hover:scale-105",
        ghost: "hover:bg-card-hover hover:text-accent-foreground hover:-translate-y-0.5",
        link: "text-primary underline-offset-4 hover:underline",
        hero: "bg-gradient-hero text-white shadow-glow hover:shadow-elevation-3 hover:-translate-y-1 hover:scale-110 transform transition-all duration-300 animate-pulse-glow",
        glass: "glass text-foreground backdrop-blur-md hover:backdrop-blur-lg hover:-translate-y-0.5",
        accent: "bg-gradient-accent text-accent-foreground shadow-elevation-2 hover:shadow-elevation-3 hover:-translate-y-0.5 hover:scale-105",
        premium: "bg-gradient-primary text-primary-foreground shadow-glow hover:shadow-elevation-3 hover:-translate-y-1 hover:scale-110 border border-primary-glow/30",
      },
      size: {
        default: "h-10 px-4 py-2",
        sm: "h-9 rounded-xl px-3",
        lg: "h-12 rounded-2xl px-8 text-base",
        xl: "h-16 rounded-3xl px-12 text-lg font-bold",
        icon: "h-10 w-10",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  },
);

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean;
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, asChild = false, ...props }, ref) => {
    const Comp = asChild ? Slot : "button";
    return <Comp className={cn(buttonVariants({ variant, size, className }))} ref={ref} {...props} />;
  },
);
Button.displayName = "Button";

export { Button, buttonVariants };
