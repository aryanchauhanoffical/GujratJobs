/**
 * ScrollProgress — thin saffron bar pinned to top of page, fills as user
 * scrolls. Reading-progress signal without dominating the UI.
 *
 * 2px tall, no animation curve (linear scroll-bound), saffron only.
 * Sits above sticky navbar (z-50).
 */

import { motion, useScroll, useSpring } from "framer-motion";

export default function ScrollProgress() {
  const { scrollYProgress } = useScroll();
  const scaleX = useSpring(scrollYProgress, {
    stiffness: 100,
    damping: 30,
    restDelta: 0.001,
  });

  return (
    <motion.div
      className="fixed top-0 left-0 right-0 h-[2px] bg-saffron origin-left z-50"
      style={{ scaleX }}
    />
  );
}
