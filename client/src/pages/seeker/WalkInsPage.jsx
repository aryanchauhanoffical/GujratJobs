/**
 * WalkInsPage — DESIGN.md "Disciplined warmth"
 *
 * The differentiator page. Charcoal hero band ("Walk-ins, surfaced
 * in time"), city filter, urgency-sorted grid, sharp empty state.
 */

import React, { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { motion } from "framer-motion";
import { CalendarDaysIcon, MapPinIcon } from "@heroicons/react/24/outline";

import Navbar from "../../components/layout/Navbar";
import Footer from "../../components/layout/Footer";
import WalkInCard from "../../components/jobs/WalkInCard";
import LoadingSpinner from "../../components/layout/LoadingSpinner";
import { jobsAPI } from "../../api/jobs.api";
import { GUJARAT_CITIES } from "../../utils/constants";
import { useAuth } from "../../context/AuthContext";
import useWalkInPriority from "../../hooks/useWalkInPriority";
import { stagger, fadeUp, easeOutCirc, D_REVEAL } from "../../lib/motion";

export default function WalkInsPage() {
  const { user } = useAuth();
  const [selectedCity, setSelectedCity] = useState(user?.location?.city || "");
  const [page, setPage] = useState(1);

  const { data, isLoading } = useQuery({
    queryKey: ["walkIns", selectedCity, page],
    queryFn: () =>
      jobsAPI.getWalkIns({ city: selectedCity, page, limit: 12 }),
  });

  const walkIns = useWalkInPriority(data?.jobs || []);
  const pagination = data?.pagination;
  const todayCount = walkIns.filter((j) => j.urgencyScore === 100).length;

  return (
    <div className="min-h-screen flex flex-col bg-canvas">
      <Navbar />

      {/* Charcoal hero band */}
      <section className="bg-surface-dark text-on-dark py-16 px-6 border-b border-on-dark/10 relative overflow-hidden">
        <motion.div
          className="absolute -top-20 -right-20 w-72 h-72 bg-marigold/5 rounded-full blur-3xl"
          animate={{ scale: [1, 1.1, 1] }}
          transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
        />
        <div className="max-w-7xl mx-auto relative">
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: D_REVEAL, ease: easeOutCirc }}
            className="text-[13px] font-bold tracking-[0.15em] uppercase text-marigold mb-4 inline-flex items-center gap-2"
          >
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-marigold opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-marigold"></span>
            </span>
            Live drives
          </motion.div>
          <motion.h1
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, ease: easeOutCirc }}
            className="text-4xl lg:text-5xl font-bold tracking-tighter leading-[1.05]"
          >
            Walk-ins, surfaced{" "}
            <span className="text-marigold">in time.</span>
          </motion.h1>
          <motion.p
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.1, ease: easeOutCirc }}
            className="text-lg text-on-dark/70 mt-6 max-w-xl leading-relaxed"
          >
            Same-day drives. Verified employers only. Show up before the slot
            fills.
            {todayCount > 0 && (
              <>
                {" "}
                <span className="font-bold text-marigold">
                  {todayCount} happening today.
                </span>
              </>
            )}
          </motion.p>
        </div>
      </section>

      <main className="flex-1 py-10 px-6">
        <div className="max-w-7xl mx-auto">
          {/* City filter */}
          <div className="mb-8 flex flex-wrap items-center gap-3">
            <span className="inline-flex items-center gap-2 text-[11px] font-bold tracking-[0.2em] uppercase text-muted-text">
              <MapPinIcon className="h-4 w-4 stroke-[1.5]" />
              City
            </span>
            <div className="flex flex-wrap gap-2">
              <CityChip
                label="All Gujarat"
                active={!selectedCity}
                onClick={() => {
                  setSelectedCity("");
                  setPage(1);
                }}
              />
              {GUJARAT_CITIES.slice(0, 8).map((city) => (
                <CityChip
                  key={city}
                  label={city}
                  active={selectedCity === city}
                  onClick={() => {
                    setSelectedCity(city);
                    setPage(1);
                  }}
                />
              ))}
            </div>
          </div>

          {isLoading ? (
            <div className="flex justify-center py-20">
              <LoadingSpinner size="lg" />
            </div>
          ) : walkIns.length === 0 ? (
            <div className="bg-canvas border border-hairline rounded-xl p-16 text-center">
              <CalendarDaysIcon className="h-14 w-14 text-muted-soft mx-auto mb-5 stroke-[1.5]" />
              <h3 className="text-xl font-bold tracking-tight text-ink mb-2">
                No upcoming walk-ins
              </h3>
              <p className="text-body text-sm max-w-md mx-auto">
                {selectedCity
                  ? `No walk-in drives in ${selectedCity} right now. Try another city.`
                  : "Check back soon for walk-in interviews across Gujarat."}
              </p>
              {selectedCity && (
                <button
                  onClick={() => setSelectedCity("")}
                  className="mt-6 bg-canvas text-ink border border-hairline-strong rounded-full px-5 h-10 inline-flex items-center text-sm font-bold hover:border-ink transition-colors"
                >
                  Show all Gujarat
                </button>
              )}
            </div>
          ) : (
            <>
              <motion.div
                variants={stagger}
                initial="initial"
                animate="animate"
                className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5"
              >
                {walkIns.map((job) => (
                  <motion.div key={job._id} variants={fadeUp}>
                    <WalkInCard job={job} />
                  </motion.div>
                ))}
              </motion.div>

              {pagination && pagination.pages > 1 && (
                <div className="flex items-center justify-center gap-3 mt-12">
                  <button
                    onClick={() => setPage((p) => Math.max(1, p - 1))}
                    disabled={page === 1}
                    className="bg-canvas text-ink border border-hairline-strong rounded-full px-5 h-10 inline-flex items-center text-sm font-bold hover:border-ink transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
                  >
                    Previous
                  </button>
                  <span className="text-sm text-body tabular-nums">
                    Page <span className="font-bold text-ink">{page}</span> of {pagination.pages}
                  </span>
                  <button
                    onClick={() => setPage((p) => Math.min(pagination.pages, p + 1))}
                    disabled={page === pagination.pages}
                    className="bg-canvas text-ink border border-hairline-strong rounded-full px-5 h-10 inline-flex items-center text-sm font-bold hover:border-ink transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
                  >
                    Next
                  </button>
                </div>
              )}
            </>
          )}
        </div>
      </main>

      <Footer />
    </div>
  );
}

function CityChip({ label, active, onClick }) {
  return (
    <button
      onClick={onClick}
      className={`px-4 h-9 rounded-full text-sm font-bold tracking-tight border transition-colors ${
        active
          ? "bg-ink text-on-dark border-ink"
          : "bg-canvas text-ink border-hairline hover:border-ink"
      }`}
    >
      {label}
    </button>
  );
}
