import React, { useState, useEffect } from 'react';
import { AnimatePresence, motion } from 'framer-motion';

const Digit = ({ value }) => (
  <AnimatePresence mode="popLayout" initial={false}>
    <motion.span
      key={value}
      initial={{ y: -12, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      exit={{ y: 12, opacity: 0 }}
      transition={{ duration: 0.18, ease: 'easeOut' }}
      className="inline-block tabular-nums"
    >
      {value}
    </motion.span>
  </AnimatePresence>
);

const pad = (n) => String(n).padStart(2, '0');

const WalkInCountdown = ({ targetDate }) => {
  const [timeLeft, setTimeLeft] = useState(null);

  useEffect(() => {
    const compute = () => {
      // Count down to end-of-day of the walk-in date
      const target = new Date(targetDate);
      target.setHours(23, 59, 59, 999);
      const diff = target - Date.now();

      if (diff <= 0) {
        setTimeLeft(null); // triggers "Drive in progress"
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
      <span className="text-xs font-bold text-rose-600 bg-rose-50 px-2 py-1 rounded-md">
        Drive in progress
      </span>
    );
  }

  return (
    <div className="flex items-center gap-1 text-rose-600 font-mono text-xs font-bold">
      <span className="bg-rose-50 px-1.5 py-0.5 rounded">
        <Digit value={timeLeft.h} />
      </span>
      <span className="opacity-60">:</span>
      <span className="bg-rose-50 px-1.5 py-0.5 rounded">
        <Digit value={timeLeft.m} />
      </span>
      <span className="opacity-60">:</span>
      <span className="bg-rose-50 px-1.5 py-0.5 rounded">
        <Digit value={timeLeft.s} />
      </span>
      <span className="text-rose-400 font-normal ml-1">left today</span>
    </div>
  );
};

export default WalkInCountdown;
