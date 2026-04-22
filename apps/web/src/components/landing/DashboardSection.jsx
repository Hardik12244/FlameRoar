import React from "react";
import { motion } from "framer-motion";

export function DashboardSection() {
  return (
    <section id="dashboard-preview" className="section mx-auto max-w-7xl px-6 py-16 md:px-10 md:py-20">
      <div className="mb-8">
        <p className="font-pixel text-[0.56rem] uppercase tracking-[0.14em] text-[#6f7a3c]">MAIN HUB</p>
        <h2 className="mt-2 text-3xl font-black text-[#304026] md:text-[2.5rem]">Welcome back, Adventurer</h2>
      </div>

      <div className="grid gap-6 lg:grid-cols-6">
        <motion.div whileHover={{ y: -4 }} className="pixel-ui-panel relative p-5 lg:col-span-2">
          <span className="pixel-ui-pulse-marker" />
          <p className="font-pixel text-[0.55rem] uppercase tracking-[0.12em] text-[#7c5f33]">Current Quest</p>
          <h3 className="mt-3 text-lg font-black text-[#2f3f25]">The Binary Bridge</h3>
          <p className="mt-2 text-sm text-[#5b634c]">Solve 3 sorting challenges to unlock the mountain gate.</p>
          <button type="button" className="pixel-ui-button mt-5">Continue</button>
        </motion.div>

        <motion.button whileHover={{ y: -4 }} whileTap={{ scale: 0.98 }} type="button" className="pixel-ui-panel p-3 text-left lg:col-span-2">
          <p className="mb-2 px-2 font-pixel text-[0.55rem] uppercase tracking-[0.12em] text-[#7c5f33]">Map Preview</p>
          <img
            src="/assets/map.png"
            alt="Map preview"
            className="h-44 w-full rounded-md border-2 border-[#6f522b] object-cover object-[28%_62%] [image-rendering:pixelated]"
          />
        </motion.button>

        <motion.div whileHover={{ y: -4 }} className="pixel-ui-panel relative overflow-hidden p-5 lg:col-span-2">
          <div className="pixel-ui-particles" aria-hidden />
          <p className="font-pixel text-[0.55rem] uppercase tracking-[0.12em] text-[#7c5f33]">Progress Tracker</p>
          <p className="mt-3 text-sm font-semibold text-[#435139]">XP: 7,240 / 10,000</p>
          <div className="mt-2 h-4 rounded-sm border-2 border-[#6f522b] bg-[#ead7ad] p-0.5">
            <div className="h-full w-[72%] rounded-[1px] bg-linear-to-r from-[#59a7ff] to-[#6fd06f]" />
          </div>
          <p className="mt-4 text-sm text-[#5b634c]">🔥 7 day streak · +15% quest reward bonus</p>
        </motion.div>
      </div>
    </section>
  );
}
