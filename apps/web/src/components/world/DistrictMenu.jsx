import React, { useState, useRef, useEffect } from "react";
import { Link, useLocation } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronDown, Store, Users, ScrollText, Castle } from "lucide-react";
import { cn } from "../../utils/cn";

const districts = [
  { to: "/explore", label: "Marketplace", icon: Store, hint: "Events & stalls" },
  { to: "/communities", label: "Guild Hall", icon: Users, hint: "Societies" },
  { to: "/opportunities", label: "Quest Board", icon: ScrollText, hint: "Opportunities" },
  { to: "/mentors", label: "Mentor Tower", icon: Castle, hint: "Sessions" },
];

export function DistrictMenu() {
  const [open, setOpen] = useState(false);
  const ref = useRef(null);
  const location = useLocation();

  useEffect(() => {
    const close = (e) => {
      if (ref.current && !ref.current.contains(e.target)) setOpen(false);
    };
    document.addEventListener("mousedown", close);
    return () => document.removeEventListener("mousedown", close);
  }, []);

  const activeInDistrict = districts.some((d) => d.to === location.pathname);

  return (
    <div className="relative" ref={ref}>
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        className={cn(
          "inline-flex items-center gap-1.5 rounded-xl border px-3 py-2 text-xs font-semibold transition-colors md:text-sm",
          open || activeInDistrict
            ? "border-map-brown/35 bg-white/90 text-map-brown shadow-sm"
            : "border-white/50 bg-white/50 text-map-ink-muted hover:border-map-brown/25 hover:text-map-ink"
        )}
        aria-expanded={open}
        aria-haspopup="true"
      >
        Districts
        <ChevronDown className={cn("h-4 w-4 transition-transform", open && "rotate-180")} />
      </button>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: -6 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -4 }}
            transition={{ duration: 0.18 }}
            className="absolute right-0 top-[calc(100%+6px)] z-50 w-56 overflow-hidden rounded-xl border border-white/60 bg-white/95 py-1 shadow-[var(--shadow-map-lift)] backdrop-blur-md"
          >
            {districts.map((d) => {
              const Icon = d.icon;
              const active = location.pathname === d.to;
              return (
                <Link
                  key={d.to}
                  to={d.to}
                  onClick={() => setOpen(false)}
                  className={cn(
                    "flex items-center gap-3 px-3 py-2.5 text-sm transition-colors",
                    active ? "bg-map-grass-light/50 font-semibold text-map-ink" : "text-map-ink-muted hover:bg-white/80 hover:text-map-ink"
                  )}
                >
                  <Icon className="h-4 w-4 shrink-0 text-map-brown" />
                  <span>
                    {d.label}
                    <span className="block text-[10px] font-normal text-map-ink-muted/90">{d.hint}</span>
                  </span>
                </Link>
              );
            })}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
