/**
 * MagneticButton — primary CTA that subtly pulls toward the cursor on hover.
 *
 * Discipline note: max 8px of pull, no scale change, no glow. The
 * magnetic effect adds polish without compromising DESIGN.md's "no
 * bounce" rule. Falls back to a normal button on touch devices.
 */

import { useRef } from "react";
import { motion, useMotionValue, useSpring, useTransform } from "framer-motion";

export default function MagneticButton({
  children,
  className = "",
  as: Component = "button",
  ...props
}) {
  const ref = useRef(null);
  const x = useMotionValue(0);
  const y = useMotionValue(0);

  // Smooth via spring with low stiffness — subtle, never overshoots
  const springX = useSpring(x, { stiffness: 200, damping: 20, mass: 0.5 });
  const springY = useSpring(y, { stiffness: 200, damping: 20, mass: 0.5 });

  // Cap the pull magnitude
  const pullX = useTransform(springX, (v) => Math.max(-8, Math.min(8, v)));
  const pullY = useTransform(springY, (v) => Math.max(-6, Math.min(6, v)));

  const handleMouse = (e) => {
    if (!ref.current) return;
    const rect = ref.current.getBoundingClientRect();
    const cx = rect.left + rect.width / 2;
    const cy = rect.top + rect.height / 2;
    x.set((e.clientX - cx) * 0.3);
    y.set((e.clientY - cy) * 0.3);
  };

  const handleLeave = () => {
    x.set(0);
    y.set(0);
  };

  const MotionComponent = motion[Component] || motion.button;

  return (
    <MotionComponent
      ref={ref}
      onMouseMove={handleMouse}
      onMouseLeave={handleLeave}
      style={{ x: pullX, y: pullY }}
      className={className}
      {...props}
    >
      {children}
    </MotionComponent>
  );
}
