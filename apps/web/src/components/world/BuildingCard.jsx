import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Bookmark, Calendar, MapPin, Sparkles } from "lucide-react";
import { cn } from "../../utils/cn";
import { useWorldUI } from "../../context/WorldUIContext";

const accentRoof = {
  water: "from-map-water/95 to-map-water-deep",
  sand: "from-map-sand to-map-sand-deep",
  brown: "from-map-brown-soft to-map-brown",
};

/**
 * Event “stall” — marketplace booth card with hover preview.
 */
export function BuildingCard({ event }) {
  const { savedEventIds, toggleBookmark } = useWorldUI();
  const saved = savedEventIds.has(event.id);
  const [hover, setHover] = useState(false);
  const roof = accentRoof[event.accent] ?? accentRoof.sand;

  return (
    <motion.article
      layout
      onHoverStart={() => setHover(true)}
      onHoverEnd={() => setHover(false)}
      whileHover={{ y: -4, scale: 1.02 }}
      transition={{ type: "spring", stiffness: 400, damping: 28 }}
      className="group relative flex flex-col overflow-hidden rounded-2xl border border-white/55 bg-map-ui/95 text-map-ink shadow-[var(--shadow-map-soft)] backdrop-blur-sm"
    >
      <div
        className={cn(
          "relative border-b border-black/5 bg-gradient-to-b px-4 py-3",
          roof
        )}
      >
        <div className="flex items-start justify-between gap-2">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wider text-white/90">{event.org}</p>
            <h3 className="mt-1 font-heading text-lg leading-snug text-white drop-shadow-sm">{event.title}</h3>
          </div>
          <button
            type="button"
            onClick={() => toggleBookmark(event.id)}
            className={cn(
              "rounded-lg p-2 transition-colors",
              saved ? "bg-white/25 text-amber-200" : "bg-white/15 text-white/90 hover:bg-white/25"
            )}
            aria-pressed={saved}
            aria-label={saved ? "Remove bookmark" : "Save event"}
          >
            <Bookmark className={cn("h-4 w-4", saved && "fill-current")} />
          </button>
        </div>
      </div>

      <div className="flex flex-1 flex-col gap-3 p-4">
        <div className="flex flex-wrap gap-2 text-xs text-map-ink-muted">
          <span className="inline-flex items-center gap-1 rounded-full bg-white/70 px-2 py-0.5 font-medium text-map-ink">
            <Calendar className="h-3 w-3" /> {event.date}
          </span>
          <span className="inline-flex items-center gap-1 rounded-full bg-white/70 px-2 py-0.5">
            <MapPin className="h-3 w-3" /> {event.college}
          </span>
          <span className="rounded-full bg-map-grass-light/50 px-2 py-0.5 font-medium text-map-ink">{event.category}</span>
        </div>

        <AnimatePresence>
          {hover && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              className="overflow-hidden"
            >
              <p className="flex gap-2 border-l-2 border-map-water/50 pl-3 text-sm leading-relaxed text-map-ink-muted">
                <Sparkles className="mt-0.5 h-4 w-4 shrink-0 text-map-brown" />
                {event.blurb}
              </p>
            </motion.div>
          )}
        </AnimatePresence>

        <div className="mt-auto flex items-center justify-between border-t border-map-brown/10 pt-3 text-xs">
          <span className="text-map-ink-muted">{event.difficulty}</span>
          <span className="font-medium text-map-brown">{event.spots} spots left</span>
        </div>
      </div>
    </motion.article>
  );
}
