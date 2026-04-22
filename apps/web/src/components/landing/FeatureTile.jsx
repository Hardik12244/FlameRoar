import React from "react";
import { motion } from "framer-motion";
import { cn } from "../../utils/cn";

const variants = {
  stall: "border-[#5a472f]/35",
  building: "border-[#4e4b34]/35",
  home: "border-[#4a5231]/35",
};

const pixelPatterns = {
  stall: [
    "0000100000",
    "0001111000",
    "0001111000",
    "0000100000",
    "0000100000",
    "0011111110",
    "0011111110",
    "0000100000",
    "0000100000",
    "0001110000",
  ],
  building: [
    "0011111100",
    "0110000110",
    "1111011111",
    "1100010011",
    "1111111111",
    "1101101011",
    "1100000011",
    "1101111011",
    "0110000110",
    "0011111100",
  ],
  home: [
    "0000110000",
    "0001111000",
    "0011111100",
    "0111111110",
    "0011001100",
    "0011111100",
    "0011001100",
    "0011011100",
    "0011001100",
    "0011111100",
  ],
};

function PixelIcon({ type = "stall" }) {
  const pattern = pixelPatterns[type] ?? pixelPatterns.stall;
  const px = 3;

  return (
    <div className="relative h-7.5 w-7.5" aria-hidden>
      {pattern.map((row, y) =>
        row.split("").map((cell, x) => {
          if (cell === "0") return null;
          const isHighlight = y <= 2 || (x + y) % 5 === 0;
          return (
            <span
              key={`${type}-${x}-${y}`}
              className="absolute"
              style={{
                width: px,
                height: px,
                left: x * px,
                top: y * px,
                background: isHighlight ? "#f8e18a" : "#9f6a1f",
                boxShadow: "1px 1px 0 rgba(51,30,11,0.45)",
              }}
            />
          );
        })
      )}
    </div>
  );
}

/**
 * Feature as a “placed object” on implied terrain — not a loud game HUD.
 */
export function FeatureTile({ title, text, type = "stall", delay = 0 }) {
  return (
    <motion.article
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.2 }}
      transition={{ delay, duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
      whileHover={{ y: -6 }}
      className={cn(
        "group relative flex flex-col overflow-hidden rounded-xl border-2 bg-linear-to-b from-[#fff8e8] via-[#f5ead0] to-[#ead6ab] p-7 shadow-[0_4px_0_#7e613a,0_9px_0_#5a4328,0_14px_18px_rgba(31,22,10,0.24)] transition-all duration-200 hover:-translate-y-1 hover:shadow-[0_6px_0_#7e613a,0_12px_0_#5a4328,0_18px_24px_rgba(31,22,10,0.3)]",
        variants[type] ?? variants.stall
      )}
    >
      <div className="pointer-events-none absolute inset-x-0 top-0 h-2 bg-[#fff3cd]/85" />
      <div className="pointer-events-none absolute inset-x-0 bottom-0 h-2 bg-[#8b6c41]/55" />
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_1px_1px,rgba(69,58,36,0.12)_1px,transparent_0)] bg-size-[6px_6px] opacity-35" />
      <div className="pointer-events-none absolute inset-0 bg-linear-to-b from-white/25 via-transparent to-black/8" />
      <motion.div
        animate={{ y: [0, -1, 0] }}
        transition={{ duration: 1.7, repeat: Infinity, ease: "easeInOut" }}
        className="relative flex h-13 w-13 items-center justify-center rounded-lg border-2 border-[#6f5734]/70 bg-linear-to-b from-[#fff4d8] to-[#ecd8ac] shadow-[0_2px_0_#735833,0_4px_0_#4d3a22] group-hover:shadow-[0_3px_0_#735833,0_6px_0_#4d3a22]"
      >
        <PixelIcon type={type} />
      </motion.div>
      <h3 className="relative mt-5 font-sans text-xl font-extrabold tracking-tight text-[#2e3e25]">{title}</h3>
      <p className="relative mt-3 text-sm leading-relaxed text-[#546048] md:text-[15px]">{text}</p>
    </motion.article>
  );
}
