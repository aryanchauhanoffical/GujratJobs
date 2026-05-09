/**
 * Motion tokens — DESIGN.md §7
 *
 * Disciplined: no bouncy springs, no overshoot. Tight, purposeful.
 * Use these everywhere instead of inventing new values per component.
 */

// Curves
export const easeOutCirc = [0.075, 0.82, 0.165, 1];
export const easeOutQuart = [0.25, 1, 0.5, 1];
export const easeStandard = [0.4, 0, 0.2, 1];

// Durations (seconds for Framer Motion)
export const D_PRESS = 0.1;
export const D_HOVER = 0.2;
export const D_REVEAL = 0.25;
export const D_PAGE = 0.35;

// Variants — fade up from 16px below
export const fadeUp = {
  initial: { opacity: 0, y: 16 },
  animate: {
    opacity: 1,
    y: 0,
    transition: { duration: D_REVEAL, ease: easeOutCirc },
  },
};

// Variants — fade in only (no movement)
export const fadeIn = {
  initial: { opacity: 0 },
  animate: {
    opacity: 1,
    transition: { duration: D_REVEAL, ease: easeStandard },
  },
};

// Stagger container — children fade up with 60ms gap (max per DESIGN.md)
export const stagger = {
  initial: {},
  animate: {
    transition: {
      staggerChildren: 0.06,
      delayChildren: 0.05,
    },
  },
};

// Card hover — Starbucks-style whisper of lift, no shadow change
export const cardHover = {
  rest: { y: 0 },
  hover: {
    y: -2,
    transition: { duration: D_HOVER, ease: easeOutQuart },
  },
};

// Button press — BMW-disciplined scale(0.98)
export const buttonPress = {
  rest: { scale: 1 },
  pressed: {
    scale: 0.98,
    transition: { duration: D_PRESS, ease: easeStandard },
  },
};
