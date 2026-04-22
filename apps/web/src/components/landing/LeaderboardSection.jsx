import React, { useState } from "react";
import { motion } from "framer-motion";

const tabs = ["Global", "Friends", "Weekly"];

const board = {
  Global: [
    { rank: 1, name: "AriQuest", xp: 12490 },
    { rank: 2, name: "CodeRider", xp: 11960 },
    { rank: 3, name: "NovaLearner", xp: 11220 },
    { rank: 4, name: "FlameWing", xp: 10410 },
    { rank: 5, name: "BitSmith", xp: 9920 },
  ],
  Friends: [
    { rank: 1, name: "You", xp: 8450 },
    { rank: 2, name: "Riya", xp: 8120 },
    { rank: 3, name: "Kabir", xp: 7850 },
    { rank: 4, name: "Mia", xp: 7420 },
    { rank: 5, name: "Noah", xp: 7310 },
  ],
  Weekly: [
    { rank: 1, name: "SprintFox", xp: 2860 },
    { rank: 2, name: "You", xp: 2740 },
    { rank: 3, name: "GridMage", xp: 2600 },
    { rank: 4, name: "LoopCraft", xp: 2490 },
    { rank: 5, name: "ByteBloom", xp: 2395 },
  ],
};

function topStyle(rank) {
  if (rank === 1) return "bg-[#f0cd67] text-[#573a12] border-[#8e6a30]";
  if (rank === 2) return "bg-[#d6dde7] text-[#364355] border-[#6e7788]";
  if (rank === 3) return "bg-[#d5ad7a] text-[#52351d] border-[#815735]";
  return "bg-[#f5e7c8] text-[#6b5431] border-[#7c5b30]";
}

export function LeaderboardSection() {
  const [activeTab, setActiveTab] = useState("Global");

  return (
    <section id="leaderboard-preview" className="section mx-auto max-w-7xl px-6 py-16 md:px-10 md:py-20">
      <div className="mb-8">
        <p className="font-pixel text-[0.56rem] uppercase tracking-[0.14em] text-[#6f7a3c]">RANKING HALL</p>
        <h2 className="mt-2 text-3xl font-black text-[#304026] md:text-[2.5rem]">Leaderboard</h2>
        <p className="mt-2 text-[#5b694d]">Top adventurers this season.</p>
      </div>

      <div className="pixel-ui-panel p-5 md:p-7">
        <div className="mb-5 flex flex-wrap gap-3">
          {tabs.map((tab) => (
            <button
              key={tab}
              type="button"
              onClick={() => setActiveTab(tab)}
              className={`pixel-ui-tab ${activeTab === tab ? "is-active" : ""}`}
            >
              {tab}
            </button>
          ))}
        </div>

        <div className="space-y-3">
          {board[activeTab].map((p) => (
            <motion.div
              key={`${activeTab}-${p.rank}-${p.name}`}
              whileHover={{ scale: 1.01 }}
              className="pixel-ui-row"
            >
              <span className={`inline-flex min-w-16 items-center justify-center rounded-md border px-2 py-1 text-xs font-black ${topStyle(p.rank)}`}>
                #{p.rank}
              </span>
              <span className="inline-flex h-8 w-8 items-center justify-center rounded-md border-2 border-[#7a5b2f] bg-[#f7e8c8] text-sm">🙂</span>
              <p className="flex-1 text-sm font-bold text-[#334126]">{p.name}</p>
              <p className="font-pixel text-[0.56rem] uppercase tracking-[0.12em] text-[#7c5f33]">{p.xp} XP</p>
              {p.rank <= 3 && <span className="ml-1 text-sm" aria-hidden>{p.rank === 1 ? "👑" : "⭐"}</span>}
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
