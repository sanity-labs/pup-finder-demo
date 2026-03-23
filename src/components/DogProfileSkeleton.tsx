"use client";

import { getDogColor } from "@/lib/colors";

export function DogProfileSkeleton({ count = 3 }: { count?: number }) {
  return (
    <div className="max-w-3xl mx-auto px-4 mb-6 space-y-4">
      {Array.from({ length: count }).map((_, i) => {
        const color = getDogColor(i);
        return (
          <div
            key={i}
            className="animate-pulse bg-white/95 backdrop-blur rounded-2xl border-3 border-black overflow-hidden"
            style={{
              boxShadow: `4px 4px 0 ${color}, 8px 8px 0 rgba(0,0,0,0.12)`,
              animationDelay: `${i * 150}ms`,
            }}
          >
            <div className="flex flex-col sm:flex-row">
              {/* Image placeholder */}
              <div
                className="w-full sm:w-56 md:w-64 h-56 sm:h-auto shrink-0"
                style={{ backgroundColor: color + "30" }}
              />

              {/* Content placeholder */}
              <div className="flex-1 p-5 md:p-6 space-y-3">
                {/* Name + price */}
                <div className="flex items-center justify-between">
                  <div
                    className="h-7 w-36 rounded-lg"
                    style={{ backgroundColor: color + "40" }}
                  />
                  <div className="h-7 w-16 rounded-full bg-neutral-100" />
                </div>

                {/* Subtitle */}
                <div
                  className="h-4 w-48 rounded"
                  style={{ backgroundColor: color + "25" }}
                />

                {/* Trait lines */}
                <div className="space-y-2 pt-1">
                  <div className="h-4 w-full rounded bg-neutral-100" />
                  <div className="h-4 w-5/6 rounded bg-neutral-100" />
                  <div className="h-4 w-4/6 rounded bg-neutral-100" />
                </div>

                {/* Tagline */}
                <div className="h-3 w-3/4 rounded bg-neutral-50" />

                {/* Button placeholder */}
                <div
                  className="h-10 w-full rounded-xl mt-2"
                  style={{ backgroundColor: color + "30" }}
                />
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}
