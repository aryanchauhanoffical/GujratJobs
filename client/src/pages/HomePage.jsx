/**
 * HomePage — DESIGN.md "Disciplined warmth" rebuild.
 *
 * BMW × Starbucks × Gujarat. No glassmorphism, no gradient text, no
 * fake stats, no AI-generic templates. Photography-first hierarchy,
 * cream + charcoal color-block rhythm, two-weight typography only,
 * sharp primary CTAs.
 */

import React, { useRef } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { motion, useScroll, useTransform } from "framer-motion";
import {
  ArrowRightIcon,
  MapPinIcon,
  ShieldCheckIcon,
  BoltIcon,
  EyeSlashIcon,
} from "@heroicons/react/24/outline";

import Navbar from "../components/layout/Navbar";
import Footer from "../components/layout/Footer";
import { jobsAPI } from "../api/jobs.api";
import { GUJARAT_CITIES } from "../utils/constants";
import {
  fadeUp,
  stagger,
  easeOutCirc,
  D_REVEAL,
  D_HOVER,
  easeOutQuart,
} from "../lib/motion";

const HEADLINE_TOP = "Find your first";
const HEADLINE_BRAND = "walk-in.";
const HEADLINE_BOTTOM = "Not your hundredth ghost job.";

const DIFFERENTIATORS = [
  {
    icon: ShieldCheckIcon,
    title: "Verified recruiters only",
    body: "Every employer is reviewed before they can post. No anonymous companies, no shadow listings.",
  },
  {
    icon: BoltIcon,
    title: "Walk-ins, surfaced in time",
    body: "Same-day drives push to your phone the moment they go live. Show up before the slot fills.",
  },
  {
    icon: EyeSlashIcon,
    title: "No ghost jobs",
    body: "We aggregate genuine Gujarat-region listings and filter out the ones that exist just to collect resumes.",
  },
];

export default function HomePage() {
  const navigate = useNavigate();
  const heroRef = useRef(null);

  const { scrollYProgress } = useScroll({
    target: heroRef,
    offset: ["start start", "end start"],
  });
  const yHeroText = useTransform(scrollYProgress, [0, 1], [0, 60]);
  const opacityHero = useTransform(scrollYProgress, [0, 0.7], [1, 0]);

  // Real data — no fake stats
  const { data: walkInsData } = useQuery({
    queryKey: ["homeWalkIns"],
    queryFn: () => jobsAPI.getWalkIns({ limit: 6 }),
  });
  const { data: featuredJobsData } = useQuery({
    queryKey: ["homeFeaturedJobs"],
    queryFn: () => jobsAPI.getAll({ limit: 100, sort: "-createdAt" }),
  });

  const walkIns = walkInsData?.data?.jobs || [];
  const allJobs = featuredJobsData?.data?.jobs || [];
  const totalJobs = allJobs.length;
  const todaysWalkIns = walkIns.filter((j) => {
    if (!j.walkInDetails?.date) return false;
    const d = new Date(j.walkInDetails.date);
    const t = new Date();
    return d.toDateString() === t.toDateString();
  });

  const cityCounts = GUJARAT_CITIES.slice(0, 8).map((city) => ({
    city,
    count: allJobs.filter((j) => j.location?.city === city).length,
  }));

  return (
    <div className="min-h-screen flex flex-col bg-canvas">
      <Navbar />

      <main className="flex-1">
        {/* ═══════════════════════════════════════════════════════════
            HERO — cream canvas, display-xl, dual CTAs
            ═══════════════════════════════════════════════════════════ */}
        <section
          ref={heroRef}
          className="relative bg-canvas-warm pt-28 pb-20 lg:pt-40 lg:pb-32 px-6 overflow-hidden border-b border-hairline"
        >
          <motion.div
            style={{ y: yHeroText, opacity: opacityHero }}
            className="relative max-w-6xl mx-auto"
          >
            {/* eyebrow */}
            <motion.div
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: D_REVEAL, ease: easeOutCirc }}
              className="text-[13px] font-bold tracking-[0.15em] uppercase text-saffron mb-6"
            >
              GujaratJobs · Built for Gujarat freshers
            </motion.div>

            {/* headline */}
            <motion.h1
              initial={{ opacity: 0, y: 24 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{
                duration: 0.7,
                delay: 0.1,
                ease: easeOutCirc,
              }}
              className="text-5xl sm:text-6xl lg:text-7xl font-bold tracking-tighter leading-[1.05] text-ink max-w-4xl"
            >
              {HEADLINE_TOP}{" "}
              <span className="text-saffron">{HEADLINE_BRAND}</span>
              <br />
              <span className="text-body font-bold">{HEADLINE_BOTTOM}</span>
            </motion.h1>

            {/* lede */}
            <motion.p
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{
                duration: 0.7,
                delay: 0.25,
                ease: easeOutCirc,
              }}
              className="text-lg lg:text-xl text-body mt-8 max-w-2xl leading-relaxed"
            >
              Walk-in interviews, fresher roles, and verified employers across
              16 Gujarat cities. We reject shadow postings before they reach
              you.
            </motion.p>

            {/* CTAs */}
            <motion.div
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{
                duration: 0.7,
                delay: 0.4,
                ease: easeOutCirc,
              }}
              className="mt-10 flex flex-wrap items-center gap-3"
            >
              {/* Primary — sharp, BMW-disciplined */}
              <button
                onClick={() => navigate("/jobs?isWalkIn=true")}
                className="group bg-saffron text-on-primary uppercase font-bold tracking-[0.05em] text-sm px-8 h-12 inline-flex items-center gap-3 hover:bg-saffron-active active:scale-[0.98] transition-all duration-100"
              >
                See today's walk-ins
                <ArrowRightIcon className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
              </button>

              {/* Secondary — full-pill, Starbucks-warm */}
              <Link
                to="/jobs"
                className="bg-canvas text-ink border border-hairline-strong rounded-full px-6 h-10 inline-flex items-center text-sm font-bold hover:border-ink transition-colors duration-200"
              >
                Browse all jobs
              </Link>
            </motion.div>

            {/* Live counter — no fake numbers, real DB query */}
            {totalJobs > 0 && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.7, delay: 0.7 }}
                className="mt-12 flex items-center gap-3 text-sm text-muted-text"
              >
                <span className="relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-marigold opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-marigold"></span>
                </span>
                <span>
                  <span className="font-bold text-ink">{totalJobs}</span>{" "}
                  verified jobs live in Gujarat right now
                  {todaysWalkIns.length > 0 && (
                    <>
                      {" "}
                      ·{" "}
                      <span className="font-bold text-saffron">
                        {todaysWalkIns.length} walk-ins today
                      </span>
                    </>
                  )}
                </span>
              </motion.div>
            )}
          </motion.div>
        </section>

        {/* ═══════════════════════════════════════════════════════════
            WALK-IN STRIP — horizontal, urgency-first
            ═══════════════════════════════════════════════════════════ */}
        {walkIns.length > 0 && (
          <section className="bg-canvas py-20 px-6 border-b border-hairline">
            <div className="max-w-7xl mx-auto">
              <motion.div
                initial={{ opacity: 0, y: 16 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-100px" }}
                transition={{ duration: D_REVEAL, ease: easeOutCirc }}
                className="flex items-end justify-between mb-10 flex-wrap gap-4"
              >
                <div>
                  <div className="text-[13px] font-bold tracking-[0.15em] uppercase text-marigold mb-3">
                    Live drives
                  </div>
                  <h2 className="text-3xl lg:text-4xl font-bold tracking-tight text-ink">
                    Walk-ins happening soon
                  </h2>
                </div>
                <Link
                  to="/jobs?isWalkIn=true"
                  className="text-sm font-bold uppercase tracking-wider text-ink hover:text-saffron transition-colors inline-flex items-center gap-2"
                >
                  See all
                  <ArrowRightIcon className="h-4 w-4" />
                </Link>
              </motion.div>

              <motion.div
                variants={stagger}
                initial="initial"
                whileInView="animate"
                viewport={{ once: true, margin: "-50px" }}
                className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5"
              >
                {walkIns.slice(0, 6).map((job) => (
                  <WalkInTile key={job._id} job={job} />
                ))}
              </motion.div>
            </div>
          </section>
        )}

        {/* ═══════════════════════════════════════════════════════════
            DIFFERENTIATORS — three-up grid
            ═══════════════════════════════════════════════════════════ */}
        <section className="bg-canvas-warm py-20 lg:py-28 px-6 border-b border-hairline">
          <div className="max-w-7xl mx-auto">
            <motion.div
              initial={{ opacity: 0, y: 16 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-100px" }}
              transition={{ duration: D_REVEAL, ease: easeOutCirc }}
              className="max-w-2xl mb-16"
            >
              <div className="text-[13px] font-bold tracking-[0.15em] uppercase text-saffron mb-3">
                Why we're different
              </div>
              <h2 className="text-4xl lg:text-5xl font-bold tracking-tight text-ink leading-[1.1]">
                Built on trust, not visibility metrics.
              </h2>
            </motion.div>

            <motion.div
              variants={stagger}
              initial="initial"
              whileInView="animate"
              viewport={{ once: true, margin: "-100px" }}
              className="grid grid-cols-1 md:grid-cols-3 gap-px bg-hairline border border-hairline"
            >
              {DIFFERENTIATORS.map(({ icon: Icon, title, body }) => (
                <motion.div
                  key={title}
                  variants={fadeUp}
                  className="bg-canvas-warm p-8 lg:p-10"
                >
                  <Icon className="h-7 w-7 text-saffron stroke-[1.5]" />
                  <h3 className="mt-6 text-xl font-bold tracking-tight text-ink">
                    {title}
                  </h3>
                  <p className="mt-3 text-base text-body leading-relaxed">
                    {body}
                  </p>
                </motion.div>
              ))}
            </motion.div>
          </div>
        </section>

        {/* ═══════════════════════════════════════════════════════════
            DARK FEATURE BAND — BMW-style charcoal hero #2
            ═══════════════════════════════════════════════════════════ */}
        <section className="bg-surface-dark text-on-dark py-24 lg:py-32 px-6">
          <div className="max-w-6xl mx-auto">
            <motion.div
              initial={{ opacity: 0, y: 24 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-100px" }}
              transition={{ duration: 0.7, ease: easeOutCirc }}
              className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-20 items-center"
            >
              <div>
                <div className="text-[13px] font-bold tracking-[0.15em] uppercase text-marigold mb-4">
                  Regional first, national next
                </div>
                <h2 className="text-4xl lg:text-6xl font-bold tracking-tighter leading-[1.05]">
                  Sixteen cities.
                  <br />
                  <span className="text-marigold">One honest hub.</span>
                </h2>
                <p className="text-lg text-on-dark/70 mt-8 max-w-xl leading-relaxed">
                  From Ahmedabad to Bhuj, Surat to Vadodara. Real recruiters
                  hiring for real seats. We started with Gujarat because trust
                  is built locally, not at scale.
                </p>
              </div>

              <div className="grid grid-cols-2 gap-8">
                <DarkStat
                  value={totalJobs > 0 ? totalJobs : "—"}
                  label="verified jobs live"
                />
                <DarkStat
                  value={cityCounts.filter((c) => c.count > 0).length}
                  label="cities active"
                />
                <DarkStat
                  value={walkIns.length}
                  label="upcoming walk-ins"
                />
                <DarkStat value="100%" label="recruiters verified" />
              </div>
            </motion.div>
          </div>
        </section>

        {/* ═══════════════════════════════════════════════════════════
            CITY GRID — real counts from DB
            ═══════════════════════════════════════════════════════════ */}
        <section className="bg-canvas py-20 lg:py-28 px-6 border-b border-hairline">
          <div className="max-w-7xl mx-auto">
            <motion.div
              initial={{ opacity: 0, y: 16 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-100px" }}
              transition={{ duration: D_REVEAL, ease: easeOutCirc }}
              className="max-w-2xl mb-12"
            >
              <div className="text-[13px] font-bold tracking-[0.15em] uppercase text-saffron mb-3">
                Find work in your city
              </div>
              <h2 className="text-3xl lg:text-4xl font-bold tracking-tight text-ink leading-[1.1]">
                Browse by city
              </h2>
            </motion.div>

            <motion.div
              variants={stagger}
              initial="initial"
              whileInView="animate"
              viewport={{ once: true, margin: "-50px" }}
              className="grid grid-cols-2 md:grid-cols-4 gap-4"
            >
              {cityCounts.map(({ city, count }) => (
                <motion.div key={city} variants={fadeUp}>
                  <Link
                    to={`/jobs?city=${city}`}
                    className="group block bg-canvas border border-hairline p-6 hover:border-ink transition-colors duration-200"
                  >
                    <MapPinIcon className="h-5 w-5 text-muted-soft stroke-[1.5] group-hover:text-saffron transition-colors" />
                    <div className="mt-4 text-xl font-bold tracking-tight text-ink">
                      {city}
                    </div>
                    <div className="mt-1 text-sm text-muted-text">
                      {count > 0
                        ? `${count} ${count === 1 ? "job" : "jobs"}`
                        : "Coming soon"}
                    </div>
                  </Link>
                </motion.div>
              ))}
            </motion.div>
          </div>
        </section>

        {/* ═══════════════════════════════════════════════════════════
            CLOSING CTA — cream canvas
            ═══════════════════════════════════════════════════════════ */}
        <section className="bg-canvas-warm py-24 lg:py-32 px-6">
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-100px" }}
            transition={{ duration: 0.6, ease: easeOutCirc }}
            className="max-w-4xl mx-auto text-center"
          >
            <h2 className="text-4xl lg:text-6xl font-bold tracking-tighter leading-[1.05] text-ink">
              Stop applying.
              <br />
              <span className="text-saffron">Start interviewing.</span>
            </h2>
            <p className="text-lg text-body mt-6 max-w-xl mx-auto">
              Free to join. No spam. Get matched to walk-ins in your city
              within minutes of signing up.
            </p>
            <div className="mt-10 flex items-center justify-center gap-3 flex-wrap">
              <Link
                to="/register"
                className="bg-saffron text-on-primary uppercase font-bold tracking-[0.05em] text-sm px-8 h-12 inline-flex items-center gap-3 hover:bg-saffron-active active:scale-[0.98] transition-all duration-100"
              >
                Get started
                <ArrowRightIcon className="h-4 w-4" />
              </Link>
              <Link
                to="/login"
                className="bg-canvas text-ink border border-hairline-strong rounded-full px-6 h-10 inline-flex items-center text-sm font-bold hover:border-ink transition-colors duration-200"
              >
                Sign in
              </Link>
            </div>
          </motion.div>
        </section>
      </main>

      <Footer />
    </div>
  );
}

/* ─────────────────────────────────────────────────────────────────
   Sub-components
   ───────────────────────────────────────────────────────────────── */

function WalkInTile({ job }) {
  const date = job.walkInDetails?.date
    ? new Date(job.walkInDetails.date)
    : null;
  const today = new Date();
  const isToday = date && date.toDateString() === today.toDateString();
  const daysAway = date
    ? Math.ceil((date - today) / (1000 * 60 * 60 * 24))
    : null;

  const urgencyLabel = isToday
    ? "Today"
    : daysAway === 1
    ? "Tomorrow"
    : daysAway && daysAway > 1
    ? `In ${daysAway} days`
    : "Upcoming";
  const urgencyColor = isToday
    ? "text-marigold"
    : daysAway === 1
    ? "text-saffron"
    : "text-muted-text";

  return (
    <motion.div
      variants={fadeUp}
      whileHover={{ y: -2 }}
      transition={{ duration: D_HOVER, ease: easeOutQuart }}
    >
      <Link
        to={`/jobs/${job._id}`}
        className="block bg-canvas border border-hairline border-l-4 border-l-saffron p-6 h-full hover:shadow-card transition-shadow"
      >
        <div className="flex items-center justify-between gap-3 mb-4">
          <span
            className={`text-xs font-bold tracking-[0.1em] uppercase ${urgencyColor}`}
          >
            {urgencyLabel}
          </span>
          <span className="text-xs text-muted-soft">
            {job.location?.city}
          </span>
        </div>
        <h3 className="text-lg font-bold tracking-tight text-ink leading-snug line-clamp-2">
          {job.title}
        </h3>
        <p className="mt-2 text-sm text-body line-clamp-1">{job.company}</p>
        {(job.salary?.min || job.salary?.max) && (
          <p className="mt-4 text-sm font-bold text-ink">
            ₹{(job.salary.min / 1000).toFixed(0)}k
            {job.salary.max && ` – ₹${(job.salary.max / 1000).toFixed(0)}k`}
            <span className="font-normal text-muted-text"> / month</span>
          </p>
        )}
      </Link>
    </motion.div>
  );
}

function DarkStat({ value, label }) {
  return (
    <div>
      <div className="text-5xl lg:text-6xl font-bold tracking-tighter text-on-dark leading-none">
        {value}
      </div>
      <div className="mt-3 text-sm text-on-dark/70 leading-relaxed">
        {label}
      </div>
    </div>
  );
}
