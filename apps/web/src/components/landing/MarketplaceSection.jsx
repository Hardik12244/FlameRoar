import React from "react";
import { motion } from "framer-motion";

const shopItems = [
  { id: "scroll", name: "Quest Scroll", desc: "Reveals hidden tasks in nearby zones.", price: 120, currency: "XP" },
  { id: "blade", name: "Logic Blade", desc: "Boosts challenge streak rewards.", price: 180, currency: "Coins" },
  { id: "potion", name: "Focus Potion", desc: "Doubles XP for your next session.", price: 90, currency: "Coins" },
  { id: "book", name: "Skill Tome", desc: "Unlocks one bonus practice set.", price: 220, currency: "XP" },
];

function PixelItemIcon({ id }) {
  const map = {
    scroll: "📜",
    blade: "🗡️",
    potion: "🧪",
    book: "📘",
  };

  return (
    <span className="pixel-ui-icon-tile" aria-hidden>
      {map[id] ?? "⭐"}
    </span>
  );
}

export function MarketplaceSection() {
  return (
    <section id="marketplace" className="section mx-auto max-w-7xl px-6 py-16 md:px-10 md:py-20">
      <div className="mb-10 flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="font-pixel text-[0.56rem] uppercase tracking-[0.14em] text-[#6f7a3c]">SHOP DISTRICT</p>
          <h2 className="mt-2 text-3xl font-black text-[#304026] md:text-[2.5rem]">Marketplace</h2>
          <p className="mt-2 text-[#5b694d]">Buy upgrades, tools, and boosters.</p>
        </div>

        <div className="pixel-ui-chip">
          <span aria-hidden>🪙</span>
          1,240 Coins
        </div>
      </div>

      <div className="pixel-ui-panel relative overflow-hidden p-5 md:p-7">
        <div className="pixel-ui-texture" />
        <img
          src="/assets/pam.png"
          alt=""
          aria-hidden
          className="pointer-events-none absolute bottom-4 right-4 h-16 w-16 opacity-90 [image-rendering:pixelated] md:h-20 md:w-20"
        />

        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {shopItems.map((item) => (
            <motion.button
              key={item.id}
              type="button"
              whileHover={{ y: -4 }}
              whileTap={{ scale: 0.97 }}
              className="pixel-ui-card text-left"
            >
              <PixelItemIcon id={item.id} />
              <h3 className="mt-4 text-lg font-black text-[#2f3f25]">{item.name}</h3>
              <p className="mt-2 text-sm text-[#5b634c]">{item.desc}</p>
              <p className="mt-4 font-pixel text-[0.55rem] uppercase tracking-[0.12em] text-[#7c5f33]">
                {item.price} {item.currency}
              </p>
            </motion.button>
          ))}
        </div>

        <span className="pixel-ui-coin left-[18%] top-[24%]" />
        <span className="pixel-ui-grass right-[26%] bottom-[18%]" />
        <span className="pixel-ui-rock left-[45%] bottom-[16%]" />
      </div>
    </section>
  );
}
