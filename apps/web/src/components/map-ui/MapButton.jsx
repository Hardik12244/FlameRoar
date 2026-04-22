import React from "react";
import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { cn } from "../../utils/cn";

const variantClasses = {
  primary:
    "border-[#5a6678] bg-linear-to-b from-[#c9d5e4] via-[#9fb2c8] to-[#8196ad] text-[#2c3f57] shadow-[inset_0_1px_0_rgba(248,252,255,0.9),0_3px_0_#526377,0_6px_0_#3f4f62,0_10px_18px_rgba(28,36,48,0.34)] hover:shadow-[inset_0_1px_0_rgba(248,252,255,0.95),0_4px_0_#526377,0_8px_0_#3f4f62,0_14px_22px_rgba(28,36,48,0.42)]",
  secondary:
    "border-[#5d6673] bg-linear-to-b from-[#dde5ef] via-[#c8d4e2] to-[#abbacc] text-[#34465e] shadow-[inset_0_1px_0_rgba(248,252,255,0.9),0_3px_0_#5e6b7c,0_6px_0_#49576a,0_9px_16px_rgba(27,34,46,0.28)] hover:shadow-[inset_0_1px_0_rgba(248,252,255,0.95),0_4px_0_#5e6b7c,0_8px_0_#49576a,0_13px_20px_rgba(27,34,46,0.34)]",
  ghost:
    "border-[#617089]/70 bg-linear-to-b from-[#c0cfdf]/80 to-[#9db1c9]/80 text-[#385172] shadow-[inset_0_1px_0_rgba(255,255,255,0.55),0_2px_0_#52657d,0_5px_10px_rgba(28,36,48,0.22)] hover:shadow-[inset_0_1px_0_rgba(255,255,255,0.65),0_3px_0_#52657d,0_7px_14px_rgba(28,36,48,0.3)]",
};

export function MapButton({
  variant = "primary",
  className,
  children,
  to,
  type = "button",
  ...props
}) {
  const classes = cn(
    "inline-flex items-center justify-center gap-2 rounded-[0.7rem] border-2 px-4 py-2.5 text-sm font-black uppercase tracking-[0.08em] transition-all duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#7f96b0]/65 focus-visible:ring-offset-2 focus-visible:ring-offset-map-grass active:translate-y-[2px] active:shadow-[inset_0_1px_0_rgba(248,252,255,0.85),0_1px_0_#4c5e74,0_3px_8px_rgba(24,31,43,0.3)]",
    variantClasses[variant] ?? variantClasses.primary,
    className
  );

  const motionProps = {
    whileHover: { scale: 1.03 },
    whileTap: { scale: 0.98 },
  };

  if (to) {
    return (
      <motion.span {...motionProps} className="inline-flex">
        <Link to={to} className={classes} {...props}>
          {children}
        </Link>
      </motion.span>
    );
  }

  return (
    <motion.button type={type} className={classes} {...motionProps} {...props}>
      {children}
    </motion.button>
  );
}
