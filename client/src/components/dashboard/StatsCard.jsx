/**
 * StatsCard — DESIGN.md "Disciplined warmth"
 *
 * Dashboard stat tile. Hairline border, no color-coded variants
 * (DESIGN.md §11 — limit colors per page). Saffron icon accent for
 * emphasis only when a stat needs to draw the eye.
 */

import React from "react";
import clsx from "clsx";
import AnimatedNumber from "../home/AnimatedNumber";

export default function StatsCard({
  title,
  value,
  icon: Icon,
  accent = false,
  change,
  changeLabel,
}) {
  const numericValue = typeof value === "number" ? value : null;

  return (
    <div
      className={clsx(
        "rounded-xl p-6 border bg-canvas transition-all duration-200 hover:-translate-y-0.5 hover:shadow-card",
        accent ? "border-saffron/30" : "border-hairline"
      )}
    >
      <div className="flex items-start justify-between">
        <div>
          <p className="text-[11px] font-bold tracking-[0.2em] uppercase text-muted-text">
            {title}
          </p>
          <p className="text-3xl font-bold tracking-tighter text-ink mt-3">
            {numericValue !== null ? (
              <AnimatedNumber value={numericValue} />
            ) : (
              value
            )}
          </p>
          {change !== undefined && (
            <p className="text-xs text-muted-text mt-2">
              <span
                className={
                  change >= 0 ? "text-success font-bold" : "text-error font-bold"
                }
              >
                {change >= 0 ? "+" : ""}
                {change}
              </span>{" "}
              {changeLabel || "this week"}
            </p>
          )}
        </div>
        {Icon && (
          <div
            className={clsx(
              "w-10 h-10 rounded-lg flex items-center justify-center",
              accent
                ? "bg-saffron/10 text-saffron"
                : "bg-canvas-warm text-muted-soft"
            )}
          >
            <Icon className="h-5 w-5 stroke-[1.5]" />
          </div>
        )}
      </div>
    </div>
  );
}
