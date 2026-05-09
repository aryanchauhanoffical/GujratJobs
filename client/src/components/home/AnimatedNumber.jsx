/**
 * AnimatedNumber — counts from 0 to `value` when scrolled into view.
 *
 * Used on dark feature band stats. Disciplined: one ease curve, no
 * bounce. Respects prefers-reduced-motion. Only animates once per mount.
 */

import { useEffect, useRef, useState } from "react";
import { useInView, useMotionValue, useSpring, animate } from "framer-motion";

export default function AnimatedNumber({
  value,
  duration = 1.6,
  suffix = "",
  fallback = "—",
}) {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-50px" });
  const [display, setDisplay] = useState(0);

  // If the value isn't a finite number, show fallback (e.g. "—" or "100%")
  const numericValue = typeof value === "number" && isFinite(value) ? value : null;

  useEffect(() => {
    if (!isInView || numericValue === null) return;

    const controls = animate(0, numericValue, {
      duration,
      ease: [0.075, 0.82, 0.165, 1],
      onUpdate: (latest) => setDisplay(Math.floor(latest)),
    });

    return () => controls.stop();
  }, [isInView, numericValue, duration]);

  return (
    <span ref={ref}>
      {numericValue === null ? fallback : display}
      {numericValue !== null && suffix}
    </span>
  );
}
