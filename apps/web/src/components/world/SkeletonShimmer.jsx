import React from "react";
import { cn } from "../../utils/cn";

export function SkeletonShimmer({ className }) {
  return (
    <div
      className={cn(
        "relative overflow-hidden rounded-xl bg-map-ui-muted/80",
        className
      )}
    >
      <div className="absolute inset-0 animate-map-skeleton-shimmer bg-gradient-to-r from-transparent via-white/70 to-transparent" />
    </div>
  );
}
