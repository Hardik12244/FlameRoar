import React from "react";
import { motion } from "framer-motion";
import { cn } from "../../utils/cn";

const reveal = {
  hidden: { opacity: 0, y: 18 },
  show: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.55, ease: [0.22, 1, 0.36, 1] },
  },
};

/**
 * Consistent section shell: optional eyebrow + title + description, then children.
 */
export function SectionWrapper({
  id,
  eyebrow,
  title,
  titleAccent,
  description,
  children,
  className,
  headerClassName,
  contentClassName,
  headerAdornment,
  eyebrowClassName,
  titleClassName,
  accentClassName,
  descriptionClassName,
}) {
  return (
    <section id={id} className={cn("relative mx-auto max-w-7xl px-6 lg:px-10", className)}>
      {(title || description || eyebrow) && (
        <motion.div
          variants={reveal}
          initial="hidden"
          whileInView="show"
          viewport={{ once: true, amount: 0.25 }}
          className={cn("mb-12 md:mb-16", headerClassName)}
        >
          {eyebrow && (
            <p className={cn("mb-3 text-[11px] font-semibold uppercase tracking-[0.22em] text-map-brown/90", eyebrowClassName)}>
              {eyebrow}
            </p>
          )}
          {headerAdornment && <div className="mb-3">{headerAdornment}</div>}
          {title && (
            <h2 className={cn("max-w-3xl font-heading text-3xl font-bold tracking-tight text-map-ink md:text-4xl lg:text-[2.65rem] lg:leading-[1.15]", titleClassName)}>
              {title}
              {titleAccent && (
                <span className={cn("mt-1 block bg-linear-to-r from-map-brown to-map-water-deep bg-clip-text text-transparent md:mt-2", accentClassName)}>
                  {titleAccent}
                </span>
              )}
            </h2>
          )}
          {description && (
            <p className={cn("mt-4 max-w-2xl text-base leading-relaxed text-map-ink-muted md:text-lg", descriptionClassName)}>
              {description}
            </p>
          )}
        </motion.div>
      )}
      <div className={contentClassName}>{children}</div>
    </section>
  );
}
