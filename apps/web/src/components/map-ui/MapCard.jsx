import React from "react";
import { motion } from "framer-motion";
import { cn } from "../../utils/cn";

const roofAccent = {
  default: "from-map-brown/90 to-map-brown",
  water: "from-map-water/90 to-map-water-deep",
  sand: "from-map-sand to-map-sand-deep",
};

/**
 * “Building on the map” — roof strip + soft card body.
 */
export function MapCard({
  title,
  subtitle,
  icon: Icon,
  variant = "default",
  className,
  children,
  roofClassName,
  contentClassName,
  ...motionProps
}) {
  const roof = roofClassName ?? roofAccent[variant] ?? roofAccent.default;

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ scale: 1.02, y: -2 }}
      transition={{ type: "spring", stiffness: 380, damping: 28 }}
      className={cn(
        "group flex flex-col overflow-hidden rounded-2xl border border-white/55 bg-map-ui/90 text-map-ink shadow-[var(--shadow-map-soft)] backdrop-blur-md",
        "hover:shadow-[var(--shadow-map-lift)]",
        className
      )}
      {...motionProps}
    >
      <div
        className={cn(
          "flex items-center gap-3 border-b border-black/5 bg-gradient-to-b px-4 py-3",
          roof
        )}
      >
        {Icon && (
          <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-white/25 text-white shadow-inner ring-1 ring-white/30">
            <Icon className="h-4 w-4" aria-hidden />
          </span>
        )}
        <div className="min-w-0 flex-1">
          {title && (
            <h3 className="truncate font-heading text-sm text-white drop-shadow-sm md:text-base">
              {title}
            </h3>
          )}
          {subtitle && (
            <p className="truncate text-xs text-white/85">{subtitle}</p>
          )}
        </div>
      </div>
      <div className={cn("flex flex-1 flex-col p-4 md:p-5", contentClassName)}>
        {children}
      </div>
    </motion.div>
  );
}
