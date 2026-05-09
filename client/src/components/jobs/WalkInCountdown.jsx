/**
 * WalkInCountdown — DESIGN.md "Disciplined warmth"
 *
 * Live HH:MM:SS countdown to end of walk-in day. Marigold (urgency)
 * coloring, tabular numbers, animated digit flips on tick.
 */

import React, { useState, useEffect } from "react";
import { AnimatePresence, motion } from "framer-motion";

const Digit = ({ value }) => (
  <AnimatePresence mode="popLayout" initial={false}>
    <motion.span
      key={value}
      initial={{ y: -10, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      exit={{ y: 10, opacity: 0 }}
      transition={{ duration: 0.18, ease: [0.4, 0, 0.2, 1] }}
      className="inline-block tabular-nums"
    >
      {value}
    </motion.span>
  </AnimatePresence>
);

const pad = (n) => String(n).padStart(2, "0");

export default function WalkInCountdown({ targetDate }) {
  const [timeLeft, setTimeLeft] = useState(null);

  useEffect(() => {
    const compute = () => {
      const target = new Date(targetDate);
      target.setHours(23, 59, 59, 999);
      const diff = target - Date.now();

      if (diff <= 0) {
        setTimeLeft(null);
        return;
      }

      const h = Math.floor(diff / 3_600_000);
      const m = Math.floor((diff % 3_600_000) / 60_000);
      const s = Math.floor((diff % 60_000) / 1_000);
      setTimeLeft({ h: pad(h), m: pad(m), s: pad(s) });
    };

    compute();
    const id = setInterval(compute, 1_000);
    return () => clearInterval(id);
  }, [targetDate]);

  if (!timeLeft) {
    return (
      <span className="text-[11px] font-bold text-marigold uppercase tracking-[0.15em]">
        Drive in progress
      </span>
    );
  }

  return (
    <div className="flex items-center gap-1.5 text-marigold font-mono text-xs font-bold">
      <span className="bg-marigold/10 px-2 py-1 rounded-md">
        <Digit value={timeLeft.h} />
      </span>
      <span className="opacity-50">:</span>
      <span className="bg-marigold/10 px-2 py-1 rounded-md">
        <Digit value={timeLeft.m} />
      </span>
      <span className="opacity-50">:</span>
      <span className="bg-marigold/10 px-2 py-1 rounded-md">
        <Digit value={timeLeft.s} />
      </span>
      <span className="text-muted-text font-normal ml-1.5 text-[11px] uppercase tracking-wider">
        left
      </span>
    </div>
  );
}
