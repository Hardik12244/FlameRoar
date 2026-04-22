import React from "react";
import { motion } from "framer-motion";
import { Flame, GitBranch, MessageCircle } from "lucide-react";

export function MinimalFooter() {
  return (
    <motion.footer
      initial={{ opacity: 0 }}
      whileInView={{ opacity: 1 }}
      viewport={{ once: true }}
      className="relative mt-8 overflow-hidden border-t-2 border-[#4b6131]/45 bg-linear-to-b from-transparent via-[#89b06f]/18 to-[#5d7b46]/38 px-6 py-12 md:py-14"
    >
      <div className="pointer-events-none absolute inset-x-0 bottom-0 h-8 border-t-2 border-[#3e5528]/55 bg-linear-to-b from-[#6d944f] to-[#4f6f39]" aria-hidden />
      <div className="pointer-events-none absolute inset-x-0 bottom-8 h-4 bg-[radial-gradient(circle_at_1px_1px,rgba(52,79,37,0.22)_1px,transparent_0)] bg-size-[6px_6px]" aria-hidden />

      <div className="pointer-events-none absolute left-5 top-6 h-3 w-3 bg-[#79ab53] shadow-[3px_0_0_#79ab53,0_3px_0_#79ab53,3px_3px_0_#4e7333]" aria-hidden />
      <div className="pointer-events-none absolute right-12 top-8 h-2.5 w-2.5 bg-[#8fc062] shadow-[2px_0_0_#8fc062,0_2px_0_#8fc062,2px_2px_0_#5c7f3b]" aria-hidden />
      <div className="pointer-events-none absolute right-28 bottom-11 h-2 w-2 bg-[#d2a34c] shadow-[2px_0_0_#d2a34c,0_2px_0_#d2a34c,2px_2px_0_#8c6325]" aria-hidden />

      <img
        src="/assets/pikachu.svg"
        alt=""
        aria-hidden
        className="pointer-events-none absolute bottom-5 right-5 h-12 w-12 opacity-90 [image-rendering:pixelated] md:h-14 md:w-14"
      />

      <div className="relative mx-auto grid max-w-7xl gap-8 text-center md:grid-cols-3 md:items-start md:text-left">
        <div className="flex items-center gap-3 md:justify-start">
          <span className="flex h-9 w-9 items-center justify-center rounded-md border-2 border-[#7f5a2c] bg-[#ecc06b] shadow-[0_2px_0_#9f742d,0_4px_0_#614220]">
            <Flame className="h-4 w-4 text-[#6b3f13]" />
          </span>
          <div>
            <p className="font-pixel text-[0.58rem] uppercase tracking-[0.12em] text-[#f5df99]">FlameRoar</p>
            <p className="mt-1 text-xs text-[#d7e1cc]">A world where learning becomes adventure</p>
          </div>
        </div>

        <nav className="flex flex-wrap items-center justify-center gap-5 md:justify-center">
          <a href="#" className="font-pixel text-[0.55rem] uppercase tracking-widest text-[#e9f1db] transition hover:text-[#fff2a8]">About</a>
          <a href="#features" className="font-pixel text-[0.55rem] uppercase tracking-widest text-[#e9f1db] transition hover:text-[#fff2a8]">Features</a>
          <a href="/leaderboard" className="font-pixel text-[0.55rem] uppercase tracking-widest text-[#e9f1db] transition hover:text-[#fff2a8]">Leaderboard</a>
          <a href="/communities" className="font-pixel text-[0.55rem] uppercase tracking-widest text-[#e9f1db] transition hover:text-[#fff2a8]">Community</a>
        </nav>

        <div className="flex items-center justify-center gap-3 md:justify-end">
          <a
            href="https://github.com"
            target="_blank"
            rel="noreferrer"
            className="inline-flex h-9 w-9 items-center justify-center rounded-md border-2 border-[#5f6d81] bg-[#c0cde0] text-[#2f455f] shadow-[0_2px_0_#627289,0_4px_0_#455468] transition hover:-translate-y-0.5"
            aria-label="GitHub"
          >
            <GitBranch className="h-4 w-4" />
          </a>
          <a
            href="https://discord.com"
            target="_blank"
            rel="noreferrer"
            className="inline-flex h-9 w-9 items-center justify-center rounded-md border-2 border-[#5f6d81] bg-[#c0cde0] text-[#2f455f] shadow-[0_2px_0_#627289,0_4px_0_#455468] transition hover:-translate-y-0.5"
            aria-label="Discord"
          >
            <MessageCircle className="h-4 w-4" />
          </a>
        </div>
      </div>
    </motion.footer>
  );
}
