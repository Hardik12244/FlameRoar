import React from "react";
import { motion, useScroll, useTransform } from "framer-motion";
import { cn } from "../../utils/cn";

/**
 * Fixed decorative layers behind app content — continuous “game map” feel.
 * Parallax is subtle; does not block interaction (pointer-events-none on layers).
 */
export function MapWorldBackground({ className, parallax = true, children }) {
  const { scrollY } = useScroll();

  const y1 = useTransform(scrollY, [0, 900], [0, parallax ? -24 : 0]);
  const y2 = useTransform(scrollY, [0, 900], [0, parallax ? -12 : 0]);
  const y3 = useTransform(scrollY, [0, 1200], [0, parallax ? -36 : 0]);

  return (
    <div className={cn("relative min-h-screen overflow-x-hidden", className)}>
      <div className="pointer-events-none fixed inset-0 -z-10 map-world-surface" />

      <motion.div
        style={{ y: y3 }}
        className="pointer-events-none fixed inset-x-0 top-0 z-[-9] h-[38vh] map-stars-layer"
        aria-hidden
      />

      <motion.div
        style={{ y: y2 }}
        className="pointer-events-none fixed inset-x-0 top-[20vh] z-[-8] h-[26vh] map-mountain-back"
        aria-hidden
      />

      <motion.div
        style={{ y: y1 }}
        className="pointer-events-none fixed inset-x-0 top-[28vh] z-[-7] h-[28vh] map-mountain-mid"
        aria-hidden
      />

      <motion.div
        style={{ y: y1 }}
        className="pointer-events-none fixed -left-[12%] top-[8%] z-0 h-[84%] w-[38%] map-river map-river-shimmer opacity-55 md:opacity-65"
        aria-hidden
      />

      <motion.div
        style={{ y: y2 }}
        className="pointer-events-none fixed right-[-18%] top-[20%] z-0 h-[55%] w-[22%] rotate-[8deg] map-river opacity-35 blur-[1px]"
        aria-hidden
      />

      <div
        className="pointer-events-none fixed bottom-[12%] left-[6%] z-0 flex gap-3 opacity-45"
        aria-hidden
      >
        <span
          className="map-tree-deco h-10 w-10 rounded-full bg-map-grass-deep/90 shadow-(--shadow-map-soft) ring-2 ring-white/25"
        />
        <span
          className="map-tree-deco h-12 w-12 rounded-full bg-map-grass-deep shadow-(--shadow-map-soft) ring-2 ring-white/30"
          style={{ animationDelay: "0.4s" }}
        />
      </div>
      <div
        className="pointer-events-none fixed right-[8%] top-[18%] z-0 opacity-40"
        aria-hidden
      >
        <span className="map-tree-deco inline-block h-9 w-9 rounded-full bg-map-grass-deep/85 ring-2 ring-white/20" />
      </div>

      <div className="pointer-events-none fixed inset-0 z-0" aria-hidden>
        <span className="map-firefly left-[14%] top-[58%]" />
        <span className="map-firefly left-[34%] top-[66%]" style={{ animationDelay: "0.6s" }} />
        <span className="map-firefly left-[73%] top-[54%]" style={{ animationDelay: "1.2s" }} />
        <span className="map-firefly left-[84%] top-[64%]" style={{ animationDelay: "1.8s" }} />
      </div>

      {children}
    </div>
  );
}
