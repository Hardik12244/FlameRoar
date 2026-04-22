import React from "react";
import { motion } from "framer-motion";

const badges = [
  { id: "pathfinder", label: "Pathfinder", unlocked: true },
  { id: "streak", label: "7-day Streak", unlocked: true },
  { id: "guild", label: "Guild Mate", unlocked: true },
  { id: "duelist", label: "Duel Master", unlocked: false },
  { id: "scholar", label: "Scholar", unlocked: true },
  { id: "legend", label: "Legend", unlocked: false },
];

export function ProfileSection() {
  const xp = 72;

  return (
    <section id="profile-preview" className="section mx-auto max-w-7xl px-6 py-16 md:px-10 md:py-20">
      <div className="mb-8">
        <p className="font-pixel text-[0.56rem] uppercase tracking-[0.14em] text-[#6f7a3c]">CHARACTER SCREEN</p>
        <h2 className="mt-2 text-3xl font-black text-[#304026] md:text-[2.5rem]">Adventurer Profile</h2>
      </div>

      <div className="grid gap-6 lg:grid-cols-5">
        <div className="pixel-ui-panel p-5 lg:col-span-2">
          <div className="flex items-center gap-4">
            <img
              src="/assets/you.png"
              alt="Player avatar"
              className="h-20 w-20 rounded-md border-2 border-[#6f522b] bg-[#e9d8b2] [image-rendering:pixelated]"
            />
            <div>
              <p className="text-xl font-black text-[#2f3f25]">Hardik</p>
              <p className="mt-1 font-pixel text-[0.55rem] uppercase tracking-[0.12em] text-[#7c5f33]">Level 24 Ranger</p>
            </div>
          </div>

          <div className="mt-6 space-y-3 text-sm text-[#4e5840]">
            <p>Quests Completed: <strong className="text-[#2f3f25]">138</strong></p>
            <p>Achievements: <strong className="text-[#2f3f25]">24</strong></p>
          </div>
        </div>

        <div className="pixel-ui-panel p-5 lg:col-span-3">
          <p className="font-pixel text-[0.55rem] uppercase tracking-[0.12em] text-[#7c5f33]">Progress Tracker</p>
          <p className="mt-3 text-sm font-semibold text-[#435139]">XP: 7,240 / 10,000</p>
          <div className="mt-2 h-4 rounded-sm border-2 border-[#6f522b] bg-[#ead7ad] p-0.5">
            <motion.div
              initial={{ width: 0 }}
              whileInView={{ width: `${xp}%` }}
              viewport={{ once: true }}
              transition={{ duration: 1.1, ease: "easeOut" }}
              className="h-full rounded-[1px] bg-linear-to-r from-[#59a7ff] to-[#6fd06f]"
            />
          </div>

          <div className="mt-6 grid grid-cols-2 gap-3 sm:grid-cols-3">
            {badges.map((b) => (
              <div
                key={b.id}
                className={`rounded-md border-2 p-3 text-center ${b.unlocked ? "border-[#75572d] bg-[#f5e5be]" : "border-[#8d8b7e] bg-[#d8d5cb] opacity-70"}`}
              >
                <div className="text-lg" aria-hidden>{b.unlocked ? "🏅" : "🔒"}</div>
                <p className="mt-1 text-xs font-semibold text-[#4f5a40]">{b.label}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
