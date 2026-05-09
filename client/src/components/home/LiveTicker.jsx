/**
 * LiveTicker — infinite horizontal marquee of live walk-ins / activity.
 *
 * "Live drives" eyebrow + content scrolling continuously. Items pulled
 * from real walk-in data. Hides if no live items (no fake content).
 *
 * Pure Framer Motion — duplicates the content array twice and animates
 * a -50% translateX with linear loop. Pauses on hover so users can read.
 */

import { motion } from "framer-motion";
import { MapPinIcon } from "@heroicons/react/24/outline";

export default function LiveTicker({ items }) {
  if (!items || items.length === 0) return null;

  // Duplicate for seamless loop
  const duplicated = [...items, ...items];

  return (
    <div className="bg-surface-dark text-on-dark border-b border-on-dark/10 overflow-hidden">
      <div className="max-w-7xl mx-auto px-6 h-12 flex items-center gap-6 group">
        <div className="flex items-center gap-2 shrink-0">
          <span className="relative flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-marigold opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2 w-2 bg-marigold"></span>
          </span>
          <span className="text-[11px] font-bold tracking-[0.2em] uppercase text-on-dark">
            Live
          </span>
        </div>

        <div className="flex-1 overflow-hidden">
          <motion.div
            className="flex items-center gap-10 whitespace-nowrap group-hover:[animation-play-state:paused]"
            animate={{ x: ["0%", "-50%"] }}
            transition={{
              duration: Math.max(20, items.length * 8),
              repeat: Infinity,
              ease: "linear",
            }}
          >
            {duplicated.map((item, i) => (
              <span
                key={`${item.id || i}-${i}`}
                className="inline-flex items-center gap-2 text-sm text-on-dark/80"
              >
                <span className="font-bold text-marigold">{item.label}</span>
                <span>·</span>
                <span>{item.title}</span>
                {item.city && (
                  <>
                    <MapPinIcon className="h-3 w-3 text-on-dark/50" />
                    <span className="text-on-dark/60">{item.city}</span>
                  </>
                )}
              </span>
            ))}
          </motion.div>
        </div>
      </div>
    </div>
  );
}
