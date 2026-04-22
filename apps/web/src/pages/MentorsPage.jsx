import React from "react";
import { motion } from "framer-motion";
import { Castle, CalendarClock } from "lucide-react";
import { MapZone } from "../components/world/MapZone";
import { mockMentors } from "../data/mockWorld";
import { useWorldUI } from "../context/WorldUIContext";

export default function MentorsPage() {
  const { pushToast } = useWorldUI();

  return (
    <div className="space-y-8 pb-12">
      <MapZone
        title="Mentor Tower"
        subtitle="Quiet, premium space for 1:1 sessions — book without leaving the map."
        icon={Castle}
      >
        <div className="grid gap-6 lg:grid-cols-3">
          {mockMentors.map((m, i) => (
            <motion.article
              key={m.id}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.06 }}
              whileHover={{ y: -3 }}
              className="flex flex-col rounded-2xl border border-white/60 bg-gradient-to-b from-white/95 to-map-ui/90 p-6 shadow-[var(--shadow-map-soft)]"
            >
              <div className="mb-4 h-px w-12 bg-gradient-to-r from-map-water/60 to-transparent" />
              <h3 className="font-heading text-xl text-map-ink">{m.name}</h3>
              <p className="text-sm font-medium text-map-ink-muted">{m.role}</p>
              <p className="mt-3 text-sm leading-relaxed text-map-ink">{m.focus}</p>
              <div className="mt-4 flex items-center gap-2 text-xs font-medium text-map-brown">
                <CalendarClock className="h-4 w-4" />
                {m.slots}
              </div>
              <button
                type="button"
                onClick={() => pushToast(`Booking request sent to ${m.name} (demo).`, "success")}
                className="btn-primary mt-6 w-full py-2.5 text-sm"
              >
                Request session
              </button>
            </motion.article>
          ))}
        </div>
      </MapZone>
    </div>
  );
}
