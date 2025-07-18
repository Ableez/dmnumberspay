import * as React from "react";

import { cn } from "#/lib/utils";

function Input({ className, type, ...props }: React.ComponentProps<"input">) {
  return (
    <input
      type={type}
      data-slot="input"
      className={cn(
        "flex h-14 w-full min-w-0 rounded-2xl bg-transparent px-4 py-1 text-base font-medium shadow-xs transition-all duration-100 ease-in-out outline-none selection:bg-neutral-900 selection:text-neutral-50 file:inline-flex file:h-7 file:border-0 file:bg-transparent file:text-sm file:font-medium file:text-neutral-950 placeholder:text-neutral-500 active:scale-[0.99] disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-50 md:text-sm dark:bg-neutral-800/30 dark:selection:bg-neutral-50 dark:selection:text-neutral-900 dark:file:text-neutral-50 dark:placeholder:text-neutral-400",
        "focus-visible:border-neutral-950 focus-visible:ring-[3px] focus-visible:ring-neutral-950/50 dark:focus-visible:border-neutral-300 dark:focus-visible:ring-neutral-300/50",
        "will-change-transform aria-invalid:border-red-500 aria-invalid:ring-red-500/20 dark:aria-invalid:border-red-900 dark:aria-invalid:ring-red-500/40 dark:aria-invalid:ring-red-900/20 dark:aria-invalid:ring-red-900/40",
        className,
      )}
      {...props}
    />
  );
}

export { Input };
