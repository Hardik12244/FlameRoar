import React, { useState } from "react";
import { ScrollText, Filter } from "lucide-react";
import { MapZone } from "../components/world/MapZone";
import { QuestCard } from "../components/world/QuestCard";
import { mockQuests } from "../data/mockWorld";
import { cn } from "../utils/cn";

const filters = ["All", "Pinned", "Competition", "Internship", "Research", "Part-time"];

export default function OpportunitiesPage() {
  const [active, setActive] = useState("All");

  const list = mockQuests.filter((q) => {
    if (active === "All") return true;
    if (active === "Pinned") return q.pinned;
    return q.type.toLowerCase().includes(active.toLowerCase());
  });

  return (
    <div className="space-y-8 pb-12">
      <MapZone
        title="Quest Board"
        subtitle="Hackathons, internships, and programs — pinned notices are time-sensitive."
        icon={ScrollText}
      >
        <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex flex-wrap items-center gap-2">
            <Filter className="h-4 w-4 text-map-brown" />
            {filters.map((f) => (
              <button
                key={f}
                type="button"
                onClick={() => setActive(f)}
                className={cn(
                  "rounded-full px-3 py-1.5 text-xs font-semibold transition-colors",
                  active === f
                    ? "bg-map-brown text-white shadow-sm"
                    : "bg-white/70 text-map-ink-muted ring-1 ring-map-brown/15 hover:ring-map-brown/30"
                )}
              >
                {f}
              </button>
            ))}
          </div>
          <p className="text-sm text-map-ink-muted">
            Add to calendar — export coming soon.
          </p>
        </div>

        <div className="relative rounded-[1.75rem] border-[3px] border-dashed border-map-brown/25 bg-gradient-to-b from-amber-50/40 to-white/60 p-4 shadow-inner md:p-8">
          <div
            className="pointer-events-none absolute inset-4 rounded-lg opacity-[0.12]"
            style={{
              backgroundImage: `repeating-linear-gradient(0deg, transparent, transparent 11px, rgba(139,90,43,0.15) 11px, rgba(139,90,43,0.15) 12px),
                repeating-linear-gradient(90deg, transparent, transparent 11px, rgba(139,90,43,0.15) 11px, rgba(139,90,43,0.15) 12px)`,
            }}
          />
          <div className="relative grid gap-4 md:grid-cols-2">
            {list.map((quest, index) => (
              <QuestCard key={quest.id} quest={quest} index={index} />
            ))}
          </div>
        </div>
      </MapZone>
    </div>
  );
}
