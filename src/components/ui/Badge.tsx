import { cn } from "@/lib/utils";

interface BadgeProps {
  children: React.ReactNode;
  variant?: "default" | "success" | "violet" | "muted";
  className?: string;
}

export function Badge({ children, variant = "default", className }: BadgeProps) {
  const variants = {
    default: "bg-cosmic-surface-elevated text-cosmic-text border-cosmic-border",
    success: "bg-cosmic-green/20 text-cosmic-green border-cosmic-green/30",
    violet: "bg-cosmic-violet/20 text-cosmic-violet-light border-cosmic-violet/30",
    muted: "bg-cosmic-muted/10 text-cosmic-muted border-cosmic-muted/20",
  };

  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-medium",
        variants[variant],
        className,
      )}
    >
      {children}
    </span>
  );
}
