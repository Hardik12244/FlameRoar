import React, { useState } from "react";
import { motion } from "framer-motion";

const hotspots = [
  { id: "arrays", name: "Arrays Forest", hint: "Loops, indexing, windows", x: 22, y: 63 },
  { id: "graphs", name: "Graph Mountains", hint: "Traversal, shortest paths", x: 73, y: 29 },
  { id: "hash", name: "Hashmap Town", hint: "Keys, collisions, lookups", x: 47, y: 49 },
  { id: "dp", name: "DP River", hint: "Choices and state transitions", x: 36, y: 39 },
];

export function MapPreviewStrip() {
  const [activeId, setActiveId] = useState(null);

  return (
    <section className="section relative overflow-hidden py-14 md:py-20">
      <div className="pointer-events-none absolute inset-0 -z-10 bg-linear-to-b from-transparent via-transparent to-[#f2e7c3]/38" />

      <div className="relative mx-auto grid max-w-7xl gap-8 px-6 md:grid-cols-5 md:items-center lg:px-10">
        <motion.div
          initial={{ opacity: 0, x: -18 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: true, amount: 0.25 }}
          transition={{ duration: 0.6 }}
          className="md:col-span-3"
        >
          <div className="group relative overflow-hidden rounded-xl border-2 border-[#69788c]/55 bg-linear-to-b from-[#dbe6f2] via-[#c6d4e4] to-[#a6b8cc] p-3 shadow-[0_4px_0_#637387,0_8px_0_#4f6074,0_14px_20px_rgba(22,30,42,0.24)]">
            <div className="pointer-events-none absolute inset-x-0 top-0 h-2 bg-white/35" />
            <div className="mb-2 inline-flex items-center rounded-md border border-[#6f7e92]/45 bg-[#edf3fb] px-2.5 py-1 text-[11px] font-bold tracking-[0.16em] text-[#415b76] shadow-[0_2px_0_#6d7f95]">
              WORLD MAP
            </div>

            <div className="relative h-[52vh] min-h-96 w-full rounded-lg bg-[#efe4c1]">
              <motion.img
                src="/assets/map.png"
                alt="Pixel-art world map preview"
                whileHover={{ scale: 1.02 }}
                transition={{ duration: 0.35, ease: "easeOut" }}
                className="absolute left-[-7%] top-[-12%] h-[124%] w-[126%] max-w-none object-cover object-[24%_66%] [image-rendering:pixelated]"
              />

              <div className="pointer-events-none absolute inset-x-0 top-0 h-3 bg-linear-to-b from-[#efe4c1]/88 to-transparent" />
              <div className="pointer-events-none absolute bottom-0 right-0 top-0 w-3 bg-linear-to-l from-[#efe4c1]/88 to-transparent" />

              <div className="pointer-events-none absolute inset-0 rounded-lg bg-radial-[ellipse_at_center] from-transparent via-transparent to-black/12" />

              {hotspots.map((spot) => {
                const isActive = activeId === spot.id;
                return (
                  <button
                    key={spot.id}
                    type="button"
                    onMouseEnter={() => setActiveId(spot.id)}
                    onMouseLeave={() => setActiveId(null)}
                    onFocus={() => setActiveId(spot.id)}
                    onBlur={() => setActiveId(null)}
                    className="absolute z-20 -translate-x-1/2 -translate-y-1/2 rounded-full p-1.5 outline-none focus-visible:ring-2 focus-visible:ring-white/85"
                    style={{ left: `${spot.x}%`, top: `${spot.y}%` }}
                    aria-label={`${spot.name}: ${spot.hint}`}
                  >
                    <span className="block h-3.5 w-3.5 rounded-full border border-[#103d15] bg-[#f5e46f] shadow-[0_0_0_2px_rgba(8,42,17,0.42),0_2px_0_#25463a]" />
                    <span className="pointer-events-none absolute inset-0 animate-ping rounded-full bg-[#ffe97f]/50" />

                    <span
                      className={[
                        "pointer-events-none absolute left-1/2 top-[-0.9rem] w-max -translate-x-1/2 -translate-y-full rounded-md border border-black/15 bg-[#fff6dc]/95 px-2.5 py-1 text-[11px] font-semibold text-[#4a3820] shadow-md transition-all duration-150",
                        isActive ? "scale-100 opacity-100" : "scale-95 opacity-0",
                      ].join(" ")}
                    >
                      {spot.name}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, x: 20 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: true, amount: 0.3 }}
          transition={{ duration: 0.6, delay: 0.08 }}
          className="md:col-span-2"
        >
          <p className="text-[11px] font-extrabold uppercase tracking-[0.22em] text-[#80551f]">
            NEW ADVENTURE
          </p>
          <h3 className="mt-2 text-3xl font-black leading-tight text-[#304026] sm:text-4xl">
            Enter the World of Flameroar
          </h3>
          <h4 className="mt-2 text-xl font-black leading-tight text-[#7f5320] [text-shadow:1px_1px_0_rgba(255,236,171,0.72)] md:text-2xl">
            Welcome to world of gamified learning
          </h4>
          <p className="mt-4 text-base leading-8 text-[#52614b] md:text-lg">
            Explore a living world where every region represents a new concept to
            master. From forests to towns, every step forward builds your knowledge.
          </p>
        </motion.div>
      </div>
    </section>
  );
}
