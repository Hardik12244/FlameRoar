import React from "react";
import { motion, AnimatePresence } from "framer-motion";
import { MessageCircle, X, Sparkles } from "lucide-react";
import { Link } from "react-router-dom";
import { useWorldUI } from "../../context/WorldUIContext";

const tips = [
  "Try ⌘K to search stalls and quests.",
  "Bookmark events — they sync to your profile pouch.",
  "Guild Hall lists societies; Quest Board tracks deadlines.",
];

export function FloatingAssistant() {
  const { assistantOpen, setAssistantOpen, pushToast } = useWorldUI();
  const [tip, setTip] = React.useState(0);

  React.useEffect(() => {
    if (!assistantOpen) return;
    const id = window.setInterval(() => setTip((i) => (i + 1) % tips.length), 8000);
    return () => window.clearInterval(id);
  }, [assistantOpen]);

  return (
    <>
      <motion.button
        type="button"
        whileHover={{ scale: 1.06 }}
        whileTap={{ scale: 0.95 }}
        onClick={() => setAssistantOpen((o) => !o)}
        className="fixed bottom-24 right-4 z-[120] flex h-14 w-14 items-center justify-center rounded-full border-2 border-white/70 bg-gradient-to-br from-map-water to-map-water-deep text-white shadow-[var(--shadow-map-lift)] md:bottom-8"
        aria-expanded={assistantOpen}
        aria-label={assistantOpen ? "Close guide" : "Open map guide"}
      >
        <AnimatePresence mode="wait">
          {assistantOpen ? (
            <motion.span key="x" initial={{ rotate: -90, opacity: 0 }} animate={{ rotate: 0, opacity: 1 }} exit={{ opacity: 0 }}>
              <X className="h-6 w-6" />
            </motion.span>
          ) : (
            <motion.span key="msg" initial={{ scale: 0.8, opacity: 0 }} animate={{ scale: 1, opacity: 1 }}>
              <MessageCircle className="h-6 w-6" />
            </motion.span>
          )}
        </AnimatePresence>
      </motion.button>

      <AnimatePresence>
        {assistantOpen && (
          <motion.div
            initial={{ opacity: 0, y: 12, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 8, scale: 0.98 }}
            transition={{ duration: 0.25 }}
            className="fixed bottom-40 right-4 z-[120] w-[min(100vw-2rem,320px)] rounded-2xl border border-white/60 bg-white/92 p-4 shadow-[var(--shadow-map-lift)] backdrop-blur-md md:bottom-28"
            role="dialog"
            aria-label="Guide"
          >
            <div className="flex items-center gap-2 border-b border-map-brown/10 pb-3">
              <Sparkles className="h-5 w-5 text-map-water-deep" />
              <span className="font-heading text-sm text-map-ink">Realm guide</span>
            </div>
            <p className="mt-3 text-sm leading-relaxed text-map-ink-muted">{tips[tip]}</p>
            <div className="mt-4 flex flex-col gap-2">
              <Link
                to="/explore"
                onClick={() => setAssistantOpen(false)}
                className="rounded-xl bg-map-grass-light/50 px-3 py-2 text-sm font-medium text-map-ink transition hover:bg-map-grass-light"
              >
                → Browse marketplace
              </Link>
              <Link
                to="/opportunities"
                onClick={() => setAssistantOpen(false)}
                className="rounded-xl bg-map-grass-light/50 px-3 py-2 text-sm font-medium text-map-ink transition hover:bg-map-grass-light"
              >
                → View quest board
              </Link>
              <button
                type="button"
                onClick={() => {
                  pushToast("We’ll nudge you about upcoming deadlines (demo).", "info");
                }}
                className="rounded-xl border border-map-brown/20 px-3 py-2 text-left text-sm font-medium text-map-brown transition hover:bg-white"
              >
                Enable gentle reminders (demo)
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
