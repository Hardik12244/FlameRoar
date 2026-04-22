import React, { useEffect, useMemo, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Search, X, ArrowRight } from "lucide-react";
import { Link } from "react-router-dom";
import { cn } from "../../utils/cn";
import { useWorldUI } from "../../context/WorldUIContext";
import { mockEvents, mockQuests } from "../../data/mockWorld";

export function SearchOverlay() {
  const { searchOpen, setSearchOpen } = useWorldUI();
  const [q, setQ] = useState("");

  useEffect(() => {
    const onKey = (e) => {
      if ((e.metaKey || e.ctrlKey) && e.key === "k") {
        e.preventDefault();
        setSearchOpen((o) => !o);
      }
      if (e.key === "Escape") setSearchOpen(false);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [setSearchOpen]);

  const results = useMemo(() => {
    const s = q.trim().toLowerCase();
    if (!s) return { events: mockEvents.slice(0, 3), quests: mockQuests.slice(0, 2) };
    const events = mockEvents.filter(
      (e) =>
        e.title.toLowerCase().includes(s) ||
        e.org.toLowerCase().includes(s) ||
        e.category.toLowerCase().includes(s)
    );
    const quests = mockQuests.filter(
      (x) => x.title.toLowerCase().includes(s) || x.tags.some((t) => t.toLowerCase().includes(s))
    );
    return { events, quests };
  }, [q]);

  return (
    <AnimatePresence>
      {searchOpen && (
        <motion.div
          role="dialog"
          aria-modal="true"
          aria-label="Search the map"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-[200] flex items-start justify-center bg-map-ink/25 p-4 pt-[12vh] backdrop-blur-sm"
          onClick={() => setSearchOpen(false)}
        >
          <motion.div
            initial={{ opacity: 0, y: -12, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -8, scale: 0.98 }}
            transition={{ duration: 0.22, ease: [0.22, 1, 0.36, 1] }}
            className="w-full max-w-xl overflow-hidden rounded-2xl border border-white/60 bg-white/95 shadow-[var(--shadow-map-lift)]"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center gap-2 border-b border-map-brown/10 px-4 py-3">
              <Search className="h-5 w-5 text-map-ink-muted" />
              <input
                autoFocus
                value={q}
                onChange={(e) => setQ(e.target.value)}
                placeholder="Search events, quests, tags…"
                className="flex-1 border-0 bg-transparent text-map-ink placeholder:text-map-ink-muted/60 focus:outline-none focus:ring-0"
              />
              <button
                type="button"
                onClick={() => setSearchOpen(false)}
                className="rounded-lg p-2 text-map-ink-muted hover:bg-map-ui-muted/80 hover:text-map-ink"
                aria-label="Close search"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
            <div className="max-h-[min(60vh,420px)] overflow-y-auto p-3">
              <p className="mb-2 px-2 text-[11px] font-semibold uppercase tracking-wider text-map-ink-muted">
                Marketplace stalls
              </p>
              <ul className="space-y-1">
                {results.events.map((e) => (
                  <li key={e.id}>
                    <Link
                      to="/explore"
                      onClick={() => setSearchOpen(false)}
                      className="flex items-center justify-between rounded-xl px-3 py-2.5 text-sm transition-colors hover:bg-map-grass-light/40"
                    >
                      <span className="font-medium text-map-ink">{e.title}</span>
                      <ArrowRight className="h-4 w-4 text-map-ink-muted" />
                    </Link>
                  </li>
                ))}
                {results.events.length === 0 && (
                  <li className="px-3 py-2 text-sm text-map-ink-muted">No stalls match.</li>
                )}
              </ul>
              <p className="mb-2 mt-4 px-2 text-[11px] font-semibold uppercase tracking-wider text-map-ink-muted">
                Quest board
              </p>
              <ul className="space-y-1">
                {results.quests.map((x) => (
                  <li key={x.id}>
                    <Link
                      to="/opportunities"
                      onClick={() => setSearchOpen(false)}
                      className="flex items-center justify-between rounded-xl px-3 py-2.5 text-sm transition-colors hover:bg-map-grass-light/40"
                    >
                      <span className="font-medium text-map-ink">{x.title}</span>
                      <ArrowRight className="h-4 w-4 text-map-ink-muted" />
                    </Link>
                  </li>
                ))}
                {results.quests.length === 0 && (
                  <li className="px-3 py-2 text-sm text-map-ink-muted">No quests match.</li>
                )}
              </ul>
            </div>
            <div className="border-t border-map-brown/10 px-4 py-2 text-center text-[11px] text-map-ink-muted">
              <kbd className="rounded border border-map-brown/20 bg-white px-1.5 py-0.5 font-mono">⌘K</kbd> toggle ·{" "}
              <kbd className="rounded border border-map-brown/20 bg-white px-1.5 py-0.5 font-mono">Esc</kbd> close
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
