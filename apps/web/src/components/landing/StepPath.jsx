import React from "react";
import { motion } from "framer-motion";
import { Footprints, Compass, Sprout } from "lucide-react";

const steps = [
  {
    n: 1,
    title: "Enter the world",
    text: "Sign in and set your path — your map remembers progress.",
    icon: Footprints,
  },
  {
    n: 2,
    title: "Explore zones",
    text: "Move through stalls, halls, and boards tailored to your goals.",
    icon: Compass,
  },
  {
    n: 3,
    title: "Join & grow",
    text: "Bookmark events, track quests, and level up skills with clarity.",
    icon: Sprout,
  },
];

export function StepPath() {
  return (
    <div className="relative mx-auto max-w-4xl py-4 md:py-8">
      {/* Trail — desktop */}
      <div
        className="pointer-events-none absolute left-9 top-14 hidden h-[calc(100%-5rem)] w-0 border-l-2 border-dashed border-[#7f6a43]/45 md:block"
        aria-hidden
      />
      <ul className="relative space-y-10 md:space-y-14">
        {steps.map((step, i) => {
          const Icon = step.icon;
          return (
            <motion.li
              key={step.n}
              initial={{ opacity: 0, x: -16 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true, amount: 0.4 }}
              transition={{ delay: i * 0.12, duration: 0.5 }}
              className="relative flex gap-5 md:gap-8"
            >
              <div className="flex shrink-0 flex-col items-center md:w-20">
                <span className="flex h-14 w-14 items-center justify-center rounded-xl border-2 border-[#76572d] bg-[#f3e3bc] text-[#744920] shadow-[0_2px_0_#9a7641,0_5px_0_#624523] ring-1 ring-[#f8ebce]">
                  <Icon className="h-6 w-6" />
                </span>
                <span className="mt-2 flex h-7 w-7 items-center justify-center rounded-full border border-[#6a4b24] bg-[#a56f2f] text-xs font-bold text-[#fff1cf] md:hidden">
                  {step.n}
                </span>
              </div>
              <div className="relative flex-1 overflow-hidden rounded-xl border-2 border-[#735329] bg-[#f8ecd2] p-6 shadow-[0_3px_0_#9a7642,0_7px_0_#694a25,0_12px_0_rgba(58,40,20,0.22)] md:p-8">
                <div className="pointer-events-none absolute inset-x-0 top-0 h-2 bg-[#fff8e4]" />
                <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_1px_1px,rgba(97,74,38,0.12)_1px,transparent_0)] bg-size-[6px_6px] opacity-40" />
                <div className="mb-1 hidden items-center gap-2 md:flex">
                  <span className="font-pixel text-[0.55rem] uppercase tracking-[0.15em] text-[#7e5f32]">Step {step.n}</span>
                </div>
                <h3 className="font-sans text-xl font-black text-[#334028] md:text-2xl">{step.title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-[#586246] md:text-base">{step.text}</p>
              </div>
            </motion.li>
          );
        })}
      </ul>
    </div>
  );
}
