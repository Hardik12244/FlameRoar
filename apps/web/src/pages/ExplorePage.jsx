import React, { useMemo, useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Store, Sparkles } from "lucide-react";
import { MapZone } from "../components/world/MapZone";
import { BuildingCard } from "../components/world/BuildingCard";
import { FilterPanel } from "../components/world/FilterPanel";
import { SkeletonShimmer } from "../components/world/SkeletonShimmer";
import { EVENT_CATEGORIES, COLLEGES, mockEvents } from "../data/mockWorld";
import { useWorldUI } from "../context/WorldUIContext";

export default function ExplorePage() {
  const [category, setCategory] = useState("All");
  const [college, setCollege] = useState(COLLEGES[0]);
  const [loading, setLoading] = useState(true);
  const { pushToast } = useWorldUI();

  useEffect(() => {
    const t = window.setTimeout(() => setLoading(false), 480);
    return () => window.clearTimeout(t);
  }, []);

  const filtered = useMemo(() => {
    return mockEvents.filter((e) => {
      const catOk = category === "All" || e.category === category;
      const colOk = college === "All colleges" || e.college === college;
      return catOk && colOk;
    });
  }, [category, college]);

  return (
    <div className="space-y-8 pb-12">
      <MapZone
        title="Marketplace"
        subtitle="College events and competitions — each stall is a live opportunity. Hover a booth to peek details."
        icon={Store}
      >
        <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
          <p className="flex items-center gap-2 text-sm text-map-ink-muted">
            <Sparkles className="h-4 w-4 text-amber-500" />
            Smart sort: nearest deadlines & saved interests first (demo).
          </p>
          <button
            type="button"
            onClick={() => pushToast("Recommendations refresh nightly (demo).", "info")}
            className="text-sm font-semibold text-map-water-deep underline-offset-2 hover:underline"
          >
            Refresh picks
          </button>
        </div>

        <FilterPanel
          categories={EVENT_CATEGORIES}
          colleges={COLLEGES}
          activeCategory={category}
          activeCollege={college}
          onCategoryChange={setCategory}
          onCollegeChange={setCollege}
          className="mb-8"
        />

        {loading ? (
          <div className="grid gap-6 sm:grid-cols-2 xl:grid-cols-3">
            {[1, 2, 3].map((i) => (
              <div key={i} className="space-y-3 rounded-2xl border border-white/50 bg-white/50 p-4">
                <SkeletonShimmer className="h-24 w-full rounded-xl" />
                <SkeletonShimmer className="h-4 w-3/4" />
                <SkeletonShimmer className="h-4 w-1/2" />
              </div>
            ))}
          </div>
        ) : (
          <motion.div
            layout
            className="grid gap-6 sm:grid-cols-2 xl:grid-cols-3"
          >
            {filtered.map((event, i) => (
              <motion.div
                key={event.id}
                initial={{ opacity: 0, y: 14 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.05 }}
              >
                <BuildingCard event={event} />
              </motion.div>
            ))}
          </motion.div>
        )}

        {!loading && filtered.length === 0 && (
          <p className="rounded-xl border border-dashed border-map-brown/25 bg-white/50 py-12 text-center text-map-ink-muted">
            No stalls match these filters — try widening the area.
          </p>
        )}
      </MapZone>
    </div>
  );
}
