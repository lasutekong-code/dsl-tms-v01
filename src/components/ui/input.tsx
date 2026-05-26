import * as React from "react";
import { cn } from "@/lib/utils";

const Input = React.forwardRef<HTMLInputElement, React.ComponentProps<"input">>(
  ({ className, type, ...props }, ref) => {
    return (
      <input
        type={type}
        className={cn(
          "flex h-10 w-full rounded-lg border border-[#e5e5e5] bg-white px-3 py-2 text-base text-[#171717] shadow-sm transition-colors placeholder:text-[#737373] focus-visible:outline-none focus-visible:border-[#2196f3] focus-visible:ring-2 focus-visible:ring-[#e3f2fd] disabled:cursor-not-allowed disabled:opacity-50 md:text-sm",
          className
        )}
        ref={ref}
        {...props}
      />
    );
  }
);
Input.displayName = "Input";

export { Input };
