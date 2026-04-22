import React from "react";
import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { Sparkles } from "lucide-react";

export function CTAHub() {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.35 }}
      transition={{ duration: 0.55, ease: [0.22, 1, 0.36, 1] }}
      className="relative mx-auto max-w-4xl overflow-hidden rounded-xl border-2 border-[#6d5129] bg-[#f5e6c2] px-7 py-12 text-center shadow-[0_4px_0_#9a7642,0_9px_0_#684a24,0_14px_0_rgba(56,39,19,0.24)] md:px-12 md:py-14"
    >
      <div className="pointer-events-none absolute inset-x-0 top-0 h-2 bg-[#fff4d8]" />
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_1px_1px,rgba(95,72,35,0.12)_1px,transparent_0)] bg-size-[6px_6px] opacity-40" />
      <div className="pointer-events-none absolute -bottom-6 left-1/2 h-20 w-[88%] -translate-x-1/2 rounded-lg bg-[#5f8a3a]/25 blur-sm" />
      <motion.div
        animate={{ opacity: [0.45, 0.75, 0.45] }}
        transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
        className="pointer-events-none absolute left-1/2 top-8 h-28 w-28 -translate-x-1/2 rounded-full bg-[#ffe47f]/28 blur-xl"
      />

      <motion.img
        src="/assets/pikachu.svg"
        alt=""
        aria-hidden
        animate={{ y: [0, -2, 0] }}
        transition={{ duration: 1.6, repeat: Infinity, ease: "easeInOut" }}
        className="pointer-events-none absolute bottom-3 left-8 h-14 w-14 [image-rendering:pixelated] md:bottom-5 md:left-10 md:h-16 md:w-16"
      />
      <span
        aria-hidden
        className="pointer-events-none absolute bottom-8 right-11 h-5 w-5 rounded-full border-2 border-[#2f2f2f] bg-linear-to-b from-[#e95f5f] to-[#f8f3e5] shadow-[0_2px_0_#333]"
      >
        <span className="absolute -inset-x-0.5 top-[46%] h-0.5 bg-[#2f2f2f]" />
        <span className="absolute left-1/2 top-1/2 h-2.5 w-2.5 -translate-x-1/2 -translate-y-1/2 rounded-full border border-[#2f2f2f] bg-[#f8f3e5]" />
      </span>

      <div className="relative z-10">
        <p className="inline-flex items-center justify-center gap-2 font-pixel text-[0.55rem] uppercase tracking-[0.14em] text-[#775b30]">
          <Sparkles className="h-3.5 w-3.5" />
          FINAL CHECKPOINT
        </p>
        <h2 className="mt-4 font-sans text-3xl font-black tracking-tight text-[#304026] md:text-4xl lg:text-[2.65rem]">
          Begin Your Adventure
        </h2>
        <p className="mx-auto mt-3 max-w-xl text-base leading-relaxed text-[#5a6448] md:text-lg">
          Step into the world and begin your quest.
        </p>
        <div className="mt-10 flex flex-wrap items-center justify-center gap-4">
          <motion.div whileHover={{ y: -2 }} whileTap={{ scale: 0.95 }}>
            <Link
              to="/auth"
              className="inline-flex items-center justify-center rounded-md border-2 border-[#4f6d23] bg-[#82b44f] px-8 py-3 font-pixel text-[0.66rem] uppercase tracking-[0.12em] text-[#f3ffe1] shadow-[inset_0_1px_0_rgba(228,255,186,0.5),0_3px_0_#648834,0_6px_0_#43611f,0_10px_0_rgba(24,38,9,0.24)] transition-all duration-150 hover:brightness-105 hover:[text-shadow:0_0_8px_rgba(237,255,173,0.45)]"
            >
              ▶ START QUEST
            </Link>
          </motion.div>
        </div>
      </div>
    </motion.div>
  );
}
