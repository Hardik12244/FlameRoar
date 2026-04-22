import React from "react";
import { motion } from "framer-motion";
import { cn } from "../../utils/cn";

/**
 * Semi-transparent top / overlay chrome — glass only on UI, not on the whole page.
 */
export function FloatingPanel({
  children,
  className,
  position = "top",
  ...props
}) {
  const positionClasses =
    position === "top"
      ? "left-3 right-3 top-3 md:left-[5.5rem] md:right-6"
      : position === "bottom"
        ? "bottom-4 left-3 right-3"
        : "left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2";

  return (
    <motion.div
      initial={{ opacity: 0, y: -8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
      className={cn(
        "pointer-events-auto fixed z-40 rounded-2xl border border-white/55 bg-white/78 px-4 py-3 shadow-[var(--shadow-map-soft)] backdrop-blur-md md:px-6",
        positionClasses,
        className
      )}
      {...props}
    >
      {children}
    </motion.div>
  );
}
