import React from "react";
import { motion } from "framer-motion";
import { Users, ArrowRight } from "lucide-react";
import { Link } from "react-router-dom";
import { MapZone } from "../components/world/MapZone";
import { mockCommunities } from "../data/mockWorld";
import { cn } from "../utils/cn";

export default function CommunitiesPage() {
  return (
    <div className="space-y-8 pb-12">
      <MapZone
        title="Guild Hall"
        subtitle="Societies and clubs — each building hosts members, chatter, and upcoming meets."
        icon={Users}
      >
        <div className="grid gap-6 md:grid-cols-3">
          {mockCommunities.map((c, i) => (
            <motion.div
              key={c.id}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.08 }}
              whileHover={{ y: -4 }}
              className={cn(
                "flex flex-col overflow-hidden rounded-2xl border border-white/55 bg-white/85 shadow-[var(--shadow-map-soft)]",
                c.accent === "water" && "ring-1 ring-map-water/30",
                c.accent === "sand" && "ring-1 ring-amber-200/50",
                c.accent === "brown" && "ring-1 ring-map-brown/20"
              )}
            >
              <div
                className={cn(
                  "h-24 bg-gradient-to-br px-4 py-3",
                  c.accent === "water" && "from-map-water/80 to-map-water-deep",
                  c.accent === "sand" && "from-map-sand to-map-sand-deep",
                  c.accent === "brown" && "from-map-brown-soft to-map-brown"
                )}
              >
                <h3 className="font-heading text-lg text-white drop-shadow-sm">{c.name}</h3>
                <p className="text-sm text-white/85">{c.members} members</p>
              </div>
              <div className="flex flex-1 flex-col p-4">
                <p className="flex-1 text-sm text-map-ink-muted">{c.tagline}</p>
                <Link
                  to="/explore"
                  className="mt-4 inline-flex items-center gap-1 text-sm font-semibold text-map-brown hover:underline"
                >
                  Enter hall <ArrowRight className="h-4 w-4" />
                </Link>
              </div>
            </motion.div>
          ))}
        </div>
        <p className="mt-6 text-center text-sm text-map-ink-muted">
          Full posts & member lists wire to your backend — this is the hall layout.
        </p>
      </MapZone>
    </div>
  );
}
