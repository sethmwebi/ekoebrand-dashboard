import * as React from "react";
import type { LucideIcon } from "lucide-react";
import { cn } from "~/lib/utils";

export interface InputProps
  extends React.InputHTMLAttributes<HTMLInputElement> {
  startIcon?: LucideIcon;
  endIcon?: LucideIcon;
  onStartIconClick?: () => void;
  onEndIconClick?: () => void;
}

const Input = React.forwardRef<HTMLInputElement, InputProps>(
  (
    {
      className,
      type,
      startIcon,
      endIcon,
      onStartIconClick,
      onEndIconClick,
      ...props
    },
    ref
  ) => {
    const StartIcon = startIcon;
    const EndIcon = endIcon;

    return (
      <div className="w-full relative">
        {StartIcon && (
          <button
            type="button"
            className="absolute left-1.5 top-1/2 transform -translate-y-1/2"
            onClick={onStartIconClick}
          >
            <StartIcon size={18} className="text-muted-foreground" />
          </button>
        )}
        <input
          type={type}
          className={cn(
            "flex h-10 w-full rounded-md border border-input !bg-background py-2 px-4 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring focus-visible:ring-offset-0 disabled:cursor-not-allowed disabled:opacity-50",
            startIcon ? "pl-8" : "",
            endIcon ? "pr-8" : "",
            className
          )}
          ref={ref}
          {...props}
        />
        {EndIcon && (
          <button
            type="button"
            className="absolute right-3 top-1/2 transform -translate-y-1/2 cursor-pointer"
            onClick={onEndIconClick}
          >
            <EndIcon className="text-muted-foreground" size={18} />
          </button>
        )}
      </div>
    );
  }
);
Input.displayName = "Input";

export { Input };
