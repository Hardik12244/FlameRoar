import React, { useEffect, useRef, useState } from "react";
import { motion, useInView, useSpring, useMotionValue } from "framer-motion";

function AnimatedNumber({ value, suffix = "" }) {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, amount: 0.6 });
  const mv = useMotionValue(0);
  const spring = useSpring(mv, { stiffness: 95, damping: 30 });
  const [display, setDisplay] = useState(0);

  useEffect(() => {
    if (!isInView) return;
    mv.set(value);
  }, [isInView, value, mv]);

  useEffect(() => {
    return spring.on("change", (v) => setDisplay(Math.round(v)));
  }, [spring]);

  return (
    <span ref={ref} className="tabular-nums">
      {display}
      {suffix}
    </span>
  );
}

export function FloatingStatCard({ label, value, suffix = "", sub }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.5 }}
      whileHover={{ y: -4 }}
      transition={{ type: "spring", stiffness: 320, damping: 28 }}
      className="group relative overflow-hidden rounded-lg border-2 border-[#6f522b] bg-[#f6e8c7] p-6 shadow-[0_3px_0_#9a7642,0_7px_0_#694a25,0_11px_0_rgba(58,40,20,0.25)]"
    >
      <div className="pointer-events-none absolute inset-x-0 top-0 h-2 bg-[#fff4da]" />
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_1px_1px,rgba(110,85,45,0.14)_1px,transparent_0)] bg-size-[6px_6px] opacity-45" />
      <div className="pointer-events-none absolute right-2 top-2 h-2 w-2 bg-[#e5b74f] shadow-[2px_0_0_#e5b74f,0_2px_0_#e5b74f,2px_2px_0_#8d6123]" />

      <p className="font-pixel text-[0.56rem] uppercase tracking-[0.12em] text-[#7b5d31]">{label}</p>
      <p className="mt-3 font-sans text-3xl font-black text-[#2f3d28] transition-all duration-200 group-hover:text-[#1f7d3f] group-hover:[text-shadow:0_0_10px_rgba(116,255,152,0.35)] md:text-4xl">
        <AnimatedNumber value={value} suffix={suffix} />
      </p>
      {sub && <p className="mt-2 text-xs text-[#5b634c]">{sub}</p>}
    </motion.div>
  );
}
