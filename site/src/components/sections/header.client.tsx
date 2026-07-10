"use client";

import { useRef } from "react";
import { useIsMounted } from "@/hooks/use-mounted";
import { useIsSticky } from "@/hooks/use-sticky";
import { cn } from "@/lib/utils";
import { Logo } from "../logo";
import { buttonVariants } from "../ui/button";

export function StickyHeader({ version }: { version: string }) {
  const stickyRef = useRef<HTMLDivElement>(null!);
  const isSticky = useIsSticky(stickyRef);
  const isMounted = useIsMounted();

  return (
    <>
      <div
        className={cn(
          "pointer-events-none inset-x-0 z-60 h-14 w-full md:h-18",
          isMounted ? "fixed" : "absolute",
        )}
      >
        <div
          className={cn(
            "absolute inset-0 border-b border-dotted bg-background transition-opacity duration-100 ease-out",
            isSticky ? "opacity-100" : "opacity-0",
          )}
        >
          <div className="container relative h-full before:pointer-events-none before:absolute before:inset-x-4 before:inset-y-0 before:h-full before:border-x before:border-dotted md:before:inset-x-0" />
        </div>
        <div className="container relative h-full">
          <div className="pointer-events-auto absolute inset-x-4 inset-y-0 md:inset-x-0">
            <div className="absolute top-3 right-4 md:top-5 md:right-8">
              <a
                className={cn(
                  buttonVariants({ variant: "outline" }),
                  "w-8 xs:w-fit rounded-full outline-offset-2",
                )}
                href="https://github.com/mjcampagna/frimousse"
                rel="noreferrer"
                target="_blank"
              >
                <svg
                  aria-hidden="true"
                  className="size-3.5"
                  fill="currentColor"
                  role="img"
                  viewBox="0 0 24 24"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path d="M12 .297c-6.63 0-12 5.373-12 12 0 5.303 3.438 9.8 8.205 11.385.6.113.82-.258.82-.577 0-.285-.01-1.04-.015-2.04-3.338.724-4.042-1.61-4.042-1.61C4.422 18.07 3.633 17.7 3.633 17.7c-1.087-.744.084-.729.084-.729 1.205.084 1.838 1.236 1.838 1.236 1.07 1.835 2.809 1.305 3.495.998.108-.776.417-1.305.76-1.605-2.665-.3-5.466-1.332-5.466-5.93 0-1.31.465-2.38 1.235-3.22-.135-.303-.54-1.523.105-3.176 0 0 1.005-.322 3.3 1.23.96-.267 1.98-.399 3-.405 1.02.006 2.04.138 3 .405 2.28-1.552 3.285-1.23 3.285-1.23.645 1.653.24 2.873.12 3.176.765.84 1.23 1.91 1.23 3.22 0 4.61-2.805 5.625-5.475 5.92.42.36.81 1.096.81 2.22 0 1.606-.015 2.896-.015 3.286 0 .315.21.69.825.57C20.565 22.092 24 17.592 24 12.297c0-6.627-5.373-12-12-12" />
                </svg>
                <span className="xs:inline hidden">mjcampagna/frimousse</span>
              </a>
            </div>
          </div>
        </div>
      </div>
      <div
        className={cn(
          "pointer-events-none mt-30 pt-4 will-change-transform md:mt-40 md:pt-6",
          isMounted ? "-top-px sticky" : "relative",
          isSticky ? "z-60" : "z-0",
        )}
        ref={stickyRef}
      >
        <span className="pointer-events-auto flex w-fit items-center gap-2 pt-px">
          <a
            className="flex items-center gap-2 rounded-sm outline-offset-2 transition duration-200 ease-out hover:opacity-60 focus-visible:opacity-60"
            // biome-ignore lint/a11y/useValidAnchor: This link only exists to scroll to the top of the page
            href="#"
          >
            <Logo className="flex-none" />
            <h1 className="font-medium">Frimousse</h1>
          </a>
          <a
            className={cn(
              buttonVariants({ variant: "outline", size: "sm" }),
              "outline-offset-2",
            )}
            href="https://github.com/mjcampagna/frimousse/releases"
            rel="noreferrer"
            target="_blank"
          >
            v{version}
          </a>
        </span>
      </div>
    </>
  );
}
