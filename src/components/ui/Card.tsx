import { cn } from "@/lib/utils";

interface CardProps {
  children: React.ReactNode;
  className?: string;
}

export function Card({ children, className }: CardProps) {
  return (
    <div
      className={cn(
        "rounded-2xl border border-cosmic-border/60 bg-cosmic-surface p-4 transition-colors duration-200",
        className,
      )}
    >
      {children}
    </div>
  );
}

export function CardHeader({ children, className }: CardProps) {
  return <div className={cn("flex flex-col gap-1 mb-3", className)}>{children}</div>;
}

export function CardTitle({ children, className }: CardProps) {
  return <h3 className={cn("text-lg font-semibold text-cosmic-text", className)}>{children}</h3>;
}

export function CardDescription({ children, className }: CardProps) {
  return <p className={cn("text-sm text-cosmic-muted", className)}>{children}</p>;
}

export function CardContent({ children, className }: CardProps) {
  return <div className={cn("", className)}>{children}</div>;
}
