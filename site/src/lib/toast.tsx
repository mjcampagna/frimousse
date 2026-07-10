"use client";

import type { Emoji } from "@slithy/frimousse";
import { toast as sonnerToast } from "sonner";

export function toast({ emoji, label }: Emoji) {
  return sonnerToast.custom(() => (
    <div className="elevation relative isolate flex w-full min-w-0 items-center rounded-xl bg-background p-2.5 pr-4 shadow-elevation after:pointer-events-none after:absolute after:inset-0 after:z-10 after:rounded-[inherit] md:w-[320px] dark:after:shadow-[inset_0_0_0_1px_rgba(255_255_255_/_10%)]">
      <span
        aria-hidden
        className="absolute inset-0 z-0 flex items-center overflow-hidden rounded-[inherit] [mask-image:linear-gradient(to_right,#000,transparent_75%)]"
      >
        <span className="origin-left translate-x-[-75%] scale-800 text-[2em] opacity-10 blur-xs saturate-150">
          {emoji}
        </span>
      </span>
      <div className="relative flex min-w-0 select-none items-center gap-1">
        <span className="flex size-8 flex-none items-center justify-center text-xl">
          {emoji}
        </span>
        <span className="truncate font-medium text-secondary-foreground text-sm">
          {label}
        </span>
      </div>
    </div>
  ));
}
