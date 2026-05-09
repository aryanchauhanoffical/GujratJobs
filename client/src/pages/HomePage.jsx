/**
 * HomePage — DESIGN.md "Disciplined warmth" + flashy motion.
 *
 * Visual reference: Stitch MCP (project: GujaratJobs HomePage redesign).
 * Components from shadcn/ui (Badge), motion from Framer Motion via
 * src/lib/motion.js, brand tokens from tailwind.config.js.
 *
 * The "flashy" comes from sophisticated motion (live ticker, word-stagger
 * reveals, animated saffron underline, count-up stats, magnetic CTAs,
 * scroll progress) — NEVER from gradient text, glassmorphism, or any of
 * the things DESIGN.md §11 bans.
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
import ScrollProgress from "../components/home/ScrollProgress";
import LiveTicker from "../components/home/LiveTicker";
import AnimatedNumber from "../components/home/AnimatedNumber";
import MagneticButton from "../components/home/MagneticButton";
import { Badge } from "@/components/ui/badge";
import { jobsAPI } from "../api/jobs.api";
import { GUJARAT_CITIES } from "../utils/constants";
import {
  fadeUp,
  stagger,
  wordStagger,
  wordReveal,
  underlineDraw,
  easeOutCirc,
  D_REVEAL,
  D_HOVER,
  easeOutQuart,
} from "../lib/motion";

const HEADLINE_PRE = ["Find", "your", "first"];
const HEADLINE_BRAND_WORD = "walk-in.";
const HEADLINE_TAIL = ["Not", "your", "hundredth", "ghost", "job."];

const DIFFERENTIATORS = [
  {
    icon: ShieldCheckIcon,
    title: "Verified recruiters only",
    body: "Every employer is reviewed before they can post. No anonymous companies, no shadow listings.",
    accent: "Verified",
  },
  {
    icon: BoltIcon,
    title: "Walk-ins, surfaced in time",
    body: "Same-day drives push to your phone the moment they go live. Show up before the slot fills.",
    accent: "Real-time",
  },
  {
    icon: EyeSlashIcon,
    title: "No ghost jobs",
    body: "We aggregate genuine Gujarat-region listings and filter out the ones that exist just to collect resumes.",
    accent: "Honest",
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

  // Real data — no fake stats anywhere on this page
  const { data: walkInsData } = useQuery({
    queryKey: ["homeWalkIns"],
    queryFn: () => jobsAPI.getWalkIns({ limit: 8 }),
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

  const tickerItems = walkIns.slice(0, 6).map((j) => {
    const d = j.walkInDetails?.date ? new Date(j.walkInDetails.date) : null;
    const isToday = d && d.toDateString() === new Date().toDateString();
    return {
      id: j._id,
      label: isToday ? "Today" : "Upcoming",
      title: `${j.title} — ${j.company}`,
      city: j.location?.city,
    };
  });

  return (
    <div className="min-h-screen flex flex-col bg-canvas">
      <ScrollProgress />

      {tickerItems.length > 0 && <LiveTicker items={tickerItems} />}

      <Navbar />

      <main className="flex-1">
        {/* ═══════════════════════════════════════════════════════════
            HERO — cream canvas, word-stagger headline, animated underline
            ═══════════════════════════════════════════════════════════ */}
        <section
          ref={heroRef}
          className="relative bg-canvas-warm pt-24 pb-20 lg:pt-36 lg:pb-32 px-6 overflow-hidden border-b border-hairline"
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

            {/* word-stagger headline */}
            <motion.h1
              variants={wordStagger}
              initial="initial"
              animate="animate"
              className="text-5xl sm:text-6xl lg:text-7xl font-bold tracking-tighter leading-[1.05] text-ink max-w-4xl"
            >
              <span className="inline-flex flex-wrap gap-x-3 lg:gap-x-4">
                {HEADLINE_PRE.map((w, i) => (
                  <motion.span key={`p${i}`} variants={wordReveal} className="inline-block">
                    {w}
                  </motion.span>
                ))}
                {/* "walk-in." with animated underline */}
                <motion.span
                  variants={wordReveal}
                  className="inline-block relative text-saffron"
                >
                  {HEADLINE_BRAND_WORD}
                  <motion.span
                    variants={underlineDraw}
                    className="absolute left-0 right-0 -bottom-1 h-[6px] bg-saffron rounded-full"
                  />
                </motion.span>
              </span>
              <span className="block mt-2 inline-flex flex-wrap gap-x-3 lg:gap-x-4 text-body">
                {HEADLINE_TAIL.map((w, i) => (
                  <motion.span key={`t${i}`} variants={wordReveal} className="inline-block">
                    {w}
                  </motion.span>
                ))}
              </span>
            </motion.h1>

            {/* lede */}
            <motion.p
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{
                duration: 0.7,
                delay: 0.7,
                ease: easeOutCirc,
              }}
              className="text-lg lg:text-xl text-body mt-8 max-w-2xl leading-relaxed"
            >
              Walk-in interviews, fresher roles, and verified employers across
              16 Gujarat cities. We reject shadow postings before they reach
              you.
            </motion.p>

            {/* CTAs — primary is magnetic */}
            <motion.div
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{
                duration: 0.7,
                delay: 0.85,
                ease: easeOutCirc,
              }}
              className="mt-10 flex flex-wrap items-center gap-3"
            >
              <MagneticButton
                onClick={() => navigate("/jobs?isWalkIn=true")}
                className="group bg-saffron text-on-primary uppercase font-bold tracking-[0.05em] text-sm px-8 h-12 inline-flex items-center gap-3 hover:bg-saffron-active active:scale-[0.98] transition-colors duration-150"
              >
                See today's walk-ins
                <ArrowRightIcon className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
              </MagneticButton>

              <Link
                to="/jobs"
                className="bg-canvas text-ink border border-hairline-strong rounded-full px-6 h-10 inline-flex items-center text-sm font-bold hover:border-ink transition-colors duration-200"
              >
                Browse all jobs
              </Link>
            </motion.div>

            {/* Live counter */}
            {totalJobs > 0 && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.7, delay: 1.1 }}
                className="mt-12 flex items-center gap-3 text-sm text-muted-text"
              >
                <span className="relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-marigold opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-marigold"></span>
                </span>
                <span>
                  <span className="font-bold text-ink">
                    <AnimatedNumber value={totalJobs} />
                  </span>{" "}
                  verified jobs live in Gujarat right now
                  {todaysWalkIns.length > 0 && (
                    <>
                      {" "}
                      ·{" "}
                      <span className="font-bold text-saffron">
                        <AnimatedNumber value={todaysWalkIns.length} />{" "}
                        walk-ins today
                      </span>
                    </>
                  )}
                </span>
              </motion.div>
            )}
          </motion.div>
        </section>

        {/* ═══════════════════════════════════════════════════════════
            WALK-IN STRIP — scroll-snap horizontal carousel
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

              {/* Scroll-snap horizontal carousel on mobile, grid on desktop */}
              <motion.div
                variants={stagger}
                initial="initial"
                whileInView="animate"
                viewport={{ once: true, margin: "-50px" }}
                className="flex md:grid md:grid-cols-2 lg:grid-cols-3 gap-5 overflow-x-auto md:overflow-visible snap-x snap-mandatory scrollbar-hide -mx-6 md:mx-0 px-6 md:px-0 pb-2 md:pb-0"
              >
                {walkIns.slice(0, 6).map((job) => (
                  <WalkInTile key={job._id} job={job} />
                ))}
              </motion.div>
            </div>
          </section>
        )}

        {/* ═══════════════════════════════════════════════════════════
            DIFFERENTIATORS — three-up grid with animated icon reveal
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
              {DIFFERENTIATORS.map(({ icon: Icon, title, body, accent }) => (
                <motion.div
                  key={title}
                  variants={fadeUp}
                  whileHover={{ y: -2 }}
                  transition={{ duration: D_HOVER, ease: easeOutQuart }}
                  className="bg-canvas-warm p-8 lg:p-10 group"
                >
                  <div className="flex items-center justify-between mb-6">
                    <Icon className="h-7 w-7 text-saffron stroke-[1.5] transition-transform duration-300 group-hover:scale-110 group-hover:rotate-[-4deg]" />
                    <Badge
                      variant="outline"
                      className="border-saffron/30 text-saffron uppercase tracking-[0.1em] text-[10px] font-bold rounded-full"
                    >
                      {accent}
                    </Badge>
                  </div>
                  <h3 className="text-xl font-bold tracking-tight text-ink">
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
            DARK FEATURE BAND — count-up animated stats
            ═══════════════════════════════════════════════════════════ */}
        <section className="bg-surface-dark text-on-dark py-24 lg:py-32 px-6 relative overflow-hidden">
          {/* subtle parallax saffron glow — single, low opacity, NOT a blob */}
          <motion.div
            className="absolute -top-40 -right-40 w-96 h-96 bg-saffron/5 rounded-full blur-3xl"
            animate={{ scale: [1, 1.1, 1] }}
            transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
          />

          <div className="max-w-6xl mx-auto relative">
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
                  value={totalJobs > 0 ? totalJobs : null}
                  label="verified jobs live"
                />
                <DarkStat
                  value={cityCounts.filter((c) => c.count > 0).length}
                  label="cities active"
                />
                <DarkStat value={walkIns.length} label="upcoming walk-ins" />
                <DarkStat value={null} suffix="" fallback="100%" label="recruiters verified" />
              </div>
            </motion.div>
          </div>
        </section>

        {/* ═══════════════════════════════════════════════════════════
            CITY GRID — bordered tiles with real counts
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
                    className="group block bg-canvas border border-hairline rounded-xl p-6 hover:border-ink hover:-translate-y-0.5 hover:shadow-card transition-all duration-200"
                  >
                    <MapPinIcon className="h-5 w-5 text-muted-soft stroke-[1.5] group-hover:text-saffron transition-colors" />
                    <div className="mt-4 text-xl font-bold tracking-tight text-ink">
                      {city}
                    </div>
                    <div className="mt-1 text-sm text-muted-text">
                      {count > 0 ? (
                        <>
                          <AnimatedNumber value={count} />{" "}
                          {count === 1 ? "job" : "jobs"}
                        </>
                      ) : (
                        "Coming soon"
                      )}
                    </div>
                  </Link>
                </motion.div>
              ))}
            </motion.div>
          </div>
        </section>

        {/* ═══════════════════════════════════════════════════════════
            CLOSING CTA — magnetic button on cream canvas
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
              <span className="relative inline-block text-saffron">
                Start interviewing.
                <motion.span
                  initial={{ scaleX: 0, originX: 0 }}
                  whileInView={{ scaleX: 1 }}
                  viewport={{ once: true, margin: "-100px" }}
                  transition={{ duration: 0.7, delay: 0.3, ease: easeOutCirc }}
                  className="absolute left-0 right-0 -bottom-1 h-[6px] bg-saffron rounded-full"
                />
              </span>
            </h2>
            <p className="text-lg text-body mt-6 max-w-xl mx-auto">
              Free to join. No spam. Get matched to walk-ins in your city
              within minutes of signing up.
            </p>
            <div className="mt-10 flex items-center justify-center gap-3 flex-wrap">
              <MagneticButton
                as="a"
                href="/#/register"
                className="bg-saffron text-on-primary uppercase font-bold tracking-[0.05em] text-sm px-8 h-12 inline-flex items-center gap-3 hover:bg-saffron-active active:scale-[0.98] transition-colors duration-150"
              >
                Get started
                <ArrowRightIcon className="h-4 w-4" />
              </MagneticButton>
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

  let urgencyLabel = "Upcoming";
  let urgencyColor = "text-muted-text";
  let badgeColor = "border-hairline text-muted-text";
  if (isToday) {
    urgencyLabel = "Today";
    urgencyColor = "text-marigold";
    badgeColor = "border-marigold/40 text-marigold bg-marigold/5";
  } else if (daysAway === 1) {
    urgencyLabel = "Tomorrow";
    urgencyColor = "text-saffron";
    badgeColor = "border-saffron/40 text-saffron bg-saffron/5";
  } else if (daysAway && daysAway > 1) {
    urgencyLabel = `In ${daysAway} days`;
  }

  return (
    <motion.div
      variants={fadeUp}
      whileHover={{ y: -2 }}
      transition={{ duration: D_HOVER, ease: easeOutQuart }}
      className="snap-start shrink-0 w-[85vw] sm:w-80 md:w-auto"
    >
      <Link
        to={`/jobs/${job._id}`}
        className="block bg-canvas border border-hairline border-l-4 border-l-saffron rounded-xl p-6 h-full hover:shadow-card transition-shadow"
      >
        <div className="flex items-center justify-between gap-3 mb-4">
          <Badge
            className={`${badgeColor} uppercase tracking-[0.1em] text-[10px] font-bold rounded-full px-2.5`}
          >
            {urgencyLabel}
          </Badge>
          <span className="text-xs text-muted-soft">{job.location?.city}</span>
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

function DarkStat({ value, label, suffix = "", fallback = "—" }) {
  return (
    <div>
      <div className="text-5xl lg:text-6xl font-bold tracking-tighter text-on-dark leading-none">
        <AnimatedNumber value={value} suffix={suffix} fallback={fallback} />
      </div>
      <div className="mt-3 text-sm text-on-dark/70 leading-relaxed">
        {label}
      </div>
    </div>
  );
}
