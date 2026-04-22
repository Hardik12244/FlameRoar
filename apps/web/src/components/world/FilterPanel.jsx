import React from "react";
import { motion } from "framer-motion";
import { SlidersHorizontal } from "lucide-react";
import { cn } from "../../utils/cn";

export function FilterPanel({
  categories,
  colleges,
  activeCategory,
  activeCollege,
  onCategoryChange,
  onCollegeChange,
  className,
}) {
  return (
    <div
      className={cn(
        "rounded-2xl border border-white/55 bg-white/70 p-4 shadow-[var(--shadow-map-soft)] backdrop-blur-md",
        className
      )}
    >
      <div className="mb-3 flex items-center gap-2 text-sm font-semibold text-map-ink">
        <SlidersHorizontal className="h-4 w-4 text-map-brown" />
        Filters
      </div>
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
        <div className="flex-1">
          <label className="mb-1.5 block text-xs font-medium text-map-ink-muted">Category</label>
          <div className="flex flex-wrap gap-2">
            {categories.map((c) => (
              <motion.button
                key={c}
                type="button"
                whileTap={{ scale: 0.97 }}
                onClick={() => onCategoryChange(c)}
                className={cn(
                  "rounded-full px-3 py-1.5 text-xs font-semibold transition-colors",
                  activeCategory === c
                    ? "bg-map-brown text-white shadow-sm"
                    : "bg-white/80 text-map-ink-muted ring-1 ring-map-brown/15 hover:ring-map-brown/30"
                )}
              >
                {c}
              </motion.button>
            ))}
          </div>
        </div>
        <div className="sm:w-56">
          <label htmlFor="college-filter" className="mb-1.5 block text-xs font-medium text-map-ink-muted">
            College
          </label>
          <select
            id="college-filter"
            value={activeCollege}
            onChange={(e) => onCollegeChange(e.target.value)}
            className="input-field w-full cursor-pointer py-2 text-sm"
          >
            {colleges.map((col) => (
              <option key={col} value={col}>
                {col}
              </option>
            ))}
          </select>
        </div>
      </div>
    </div>
  );
}
