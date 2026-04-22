import React from "react";
import { AnimatePresence, motion } from "framer-motion";
import { X, CheckCircle, Info } from "lucide-react";
import { useWorldUI } from "../../context/WorldUIContext";
import { cn } from "../../utils/cn";

export function NotificationToast() {
  const { toasts, dismissToast } = useWorldUI();

  return (
    <div className="pointer-events-none fixed bottom-24 left-4 z-[190] flex max-w-sm flex-col gap-2 md:bottom-8 md:left-[5.5rem]">
      <AnimatePresence>
        {toasts.map((t) => (
          <motion.div
            key={t.id}
            layout
            initial={{ opacity: 0, x: -24 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -16 }}
            transition={{ type: "spring", stiffness: 420, damping: 32 }}
            className={cn(
              "pointer-events-auto flex items-start gap-3 rounded-xl border px-4 py-3 shadow-[var(--shadow-map-lift)] backdrop-blur-md",
              t.variant === "success"
                ? "border-emerald-200/80 bg-emerald-50/95 text-emerald-950"
                : "border-white/60 bg-white/90 text-map-ink"
            )}
            role="status"
          >
            {t.variant === "success" ? (
              <CheckCircle className="mt-0.5 h-5 w-5 shrink-0 text-emerald-600" />
            ) : (
              <Info className="mt-0.5 h-5 w-5 shrink-0 text-map-water-deep" />
            )}
            <p className="flex-1 text-sm font-medium leading-snug">{t.message}</p>
            <button
              type="button"
              onClick={() => dismissToast(t.id)}
              className="rounded-lg p-1 text-map-ink-muted hover:bg-black/5 hover:text-map-ink"
              aria-label="Dismiss"
            >
              <X className="h-4 w-4" />
            </button>
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  );
}
