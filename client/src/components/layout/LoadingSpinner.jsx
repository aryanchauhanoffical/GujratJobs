/**
 * LoadingSpinner — DESIGN.md "Disciplined warmth"
 *
 * Saffron spinner. No bounce. Single design across the app.
 */

import React from "react";
import clsx from "clsx";

const SIZES = {
  sm: "h-4 w-4 border-2",
  md: "h-8 w-8 border-2",
  lg: "h-12 w-12 border-[3px]",
  xl: "h-16 w-16 border-4",
};

export default function LoadingSpinner({ size = "md", className = "" }) {
  return (
    <div
      role="status"
      aria-label="Loading"
      className={clsx(
        "animate-spin rounded-full border-saffron border-t-transparent",
        SIZES[size],
        className
      )}
    />
  );
}
