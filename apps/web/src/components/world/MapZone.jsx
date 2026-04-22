import React from "react";
import { motion } from "framer-motion";
import { cn } from "../../utils/cn";

/**
 * Semantic section wrapper — reads as a “district” on the world map.
 */
export function MapZone({
  title,
  subtitle,
  icon: Icon,
  children,
  className,
  headerClassName,
  delay = 0,
}) {
  return (
    <motion.section
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35, delay, ease: [0.22, 1, 0.36, 1] }}
      className={cn("relative", className)}
    >
      <header className={cn("mb-6 flex flex-wrap items-end justify-between gap-4", headerClassName)}>
        <div className="flex items-start gap-3">
          {Icon && (
            <span className="mt-0.5 flex h-11 w-11 shrink-0 items-center justify-center rounded-xl border border-map-brown/20 bg-gradient-to-b from-map-sand/90 to-map-sand-deep/80 text-map-brown shadow-sm">
              <Icon className="h-5 w-5" aria-hidden />
            </span>
          )}
          <div>
            <h2 className="font-heading text-2xl text-map-ink md:text-3xl">{title}</h2>
            {subtitle && <p className="mt-1 max-w-2xl text-sm text-map-ink-muted md:text-base">{subtitle}</p>}
          </div>
        </div>
      </header>
      {children}
    </motion.section>
  );
}
