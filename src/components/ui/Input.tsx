import { cn } from "@/lib/utils";

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
}

export function Input({ label, className, ...props }: InputProps) {
  return (
    <div className="flex flex-col gap-1.5">
      {label ? <label className="text-sm text-cosmic-muted">{label}</label> : null}
      <input
        className={cn(
          "h-10 w-full rounded-xl border border-cosmic-border bg-cosmic-bg px-3 text-cosmic-text placeholder:text-cosmic-muted/60 outline-none transition-colors duration-200 focus:border-cosmic-violet focus:ring-1 focus:ring-cosmic-violet/50",
          className,
        )}
        {...props}
      />
    </div>
  );
}
