"use client";

import { forwardRef, useState } from "react";
import { cn } from "@/lib/utils";

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "secondary" | "ghost" | "danger" | "success";
  size?: "sm" | "md" | "lg" | "icon";
}

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = "primary", size = "md", children, onClick, ...props }, ref) => {
    const [ripples, setRipples] = useState<Array<{ x: number; y: number; id: number }>>([]);

    const handleClick = (e: React.MouseEvent<HTMLButtonElement>) => {
      const rect = e.currentTarget.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;
      const id = Date.now();

      setRipples((prev) => [...prev, { x, y, id }]);
      setTimeout(() => {
        setRipples((prev) => prev.filter((r) => r.id !== id));
      }, 600);

      onClick?.(e);
    };

    const variants = {
      primary: "bg-cosmic-violet text-cosmic-violet-light hover:bg-cosmic-violet/90",
      secondary: "bg-cosmic-surface-elevated text-cosmic-text border border-cosmic-border hover:bg-cosmic-border/50",
      ghost: "bg-transparent text-cosmic-muted hover:bg-cosmic-surface-elevated hover:text-cosmic-text",
      danger: "bg-cosmic-red text-white hover:bg-cosmic-red/90",
      success: "bg-cosmic-green text-white hover:bg-cosmic-green-dark",
    };

    const sizes = {
      sm: "h-8 px-3 text-sm rounded-lg",
      md: "h-10 px-4 text-sm rounded-xl",
      lg: "h-12 px-6 text-base rounded-xl",
      icon: "size-10 rounded-full",
    };

    return (
      <button
        ref={ref}
        className={cn(
          "relative overflow-hidden inline-flex items-center justify-center gap-2 font-medium transition-all duration-200 active:scale-95 disabled:opacity-50 disabled:pointer-events-none",
          variants[variant],
          sizes[size],
          className,
        )}
        onClick={handleClick}
        {...props}
      >
        {ripples.map((ripple) => (
          <span
            key={ripple.id}
            className="absolute size-4 rounded-full bg-white/30 animate-ripple pointer-events-none"
            style={{ left: ripple.x - 8, top: ripple.y - 8 }}
          />
        ))}
        {children}
      </button>
    );
  },
);

Button.displayName = "Button";
