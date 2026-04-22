import React from "react";
import { motion } from "framer-motion";
import { Pin, Clock, Gift, Tag } from "lucide-react";
import { cn } from "../../utils/cn";

/**
 * Pinned note / quest slip on the opportunity board.
 */
export function QuestCard({ quest, index = 0 }) {
  return (
    <motion.article
      initial={{ opacity: 0, y: 16, rotate: -0.8 }}
      animate={{ opacity: 1, y: 0, rotate: index % 2 === 0 ? 0.6 : -0.4 }}
      transition={{ delay: index * 0.06, type: "spring", stiffness: 260, damping: 24 }}
      whileHover={{ y: -3, scale: 1.01, rotate: 0 }}
      className={cn(
        "relative overflow-hidden rounded-xl border shadow-[var(--shadow-map-soft)]",
        quest.pinned
          ? "border-amber-200/80 bg-gradient-to-br from-amber-50/95 to-white/90"
          : "border-white/60 bg-white/85"
      )}
    >
      {quest.pinned && (
        <div className="absolute right-3 top-3 flex h-8 w-8 items-center justify-center rounded-full bg-amber-400/90 text-white shadow-md">
          <Pin className="h-4 w-4" aria-hidden />
        </div>
      )}
      <div className="p-5 pt-6">
        <p className="text-xs font-semibold uppercase tracking-wider text-map-brown/80">{quest.type}</p>
        <h3 className="mt-2 font-heading text-lg leading-snug text-map-ink">{quest.title}</h3>
        <div className="mt-4 flex flex-wrap gap-2">
          {quest.tags.map((t) => (
            <span
              key={t}
              className="inline-flex items-center gap-1 rounded-full border border-map-brown/15 bg-white/70 px-2 py-0.5 text-[11px] font-medium text-map-ink-muted"
            >
              <Tag className="h-3 w-3 opacity-70" />
              {t}
            </span>
          ))}
        </div>
        <div className="mt-4 flex flex-wrap items-center gap-4 border-t border-map-brown/10 pt-3 text-sm">
          <span className="inline-flex items-center gap-1.5 text-map-ink-muted">
            <Clock className="h-4 w-4 text-map-water-deep" />
            {quest.deadline}
          </span>
          <span className="inline-flex items-center gap-1.5 font-medium text-map-brown">
            <Gift className="h-4 w-4" />
            {quest.reward}
          </span>
        </div>
      </div>
    </motion.article>
  );
}
