import React, { useState, useRef } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import {
  motion,
  useScroll,
  useTransform,
  useSpring,
  AnimatePresence,
} from "framer-motion";
import {
  MagnifyingGlassIcon,
  MapPinIcon,
  BriefcaseIcon,
  ArrowRightIcon,
  UserGroupIcon,
  BuildingOfficeIcon,
  CalendarDaysIcon,
  CheckBadgeIcon,
} from "@heroicons/react/24/outline";
import { StarIcon } from "@heroicons/react/24/solid";
import Navbar from "../components/layout/Navbar";
import Footer from "../components/layout/Footer";
import JobCard from "../components/jobs/JobCard";
import WalkInCard from "../components/jobs/WalkInCard";
import LoadingSpinner from "../components/layout/LoadingSpinner";
import { jobsAPI } from "../api/jobs.api";
import { JOB_CATEGORIES, GUJARAT_CITIES } from "../utils/constants";

// --- DATA ---
const STATS = [
  {
    label: "Jobs Posted",
    value: "12,500+",
    icon: BriefcaseIcon,
    color: "text-indigo-600",
    bg: "bg-indigo-100",
  },
  {
    label: "Companies Hiring",
    value: "2,400+",
    icon: BuildingOfficeIcon,
    color: "text-emerald-600",
    bg: "bg-emerald-100",
  },
  {
    label: "Walk-ins Weekly",
    value: "350+",
    icon: CalendarDaysIcon,
    color: "text-amber-500",
    bg: "bg-amber-100",
  },
  {
    label: "Candidates Hired",
    value: "8,900+",
    icon: UserGroupIcon,
    color: "text-violet-600",
    bg: "bg-violet-100",
  },
];

const HOW_IT_WORKS = [
  {
    step: 1,
    title: "Create Your Profile",
    description:
      "Sign up and upload your resume. Set your preferred city in Gujarat.",
    icon: "👤",
  },
  {
    step: 2,
    title: "Find Matching Jobs",
    description:
      "Browse thousands of jobs near you. Filter by city, salary, walk-ins, and more.",
    icon: "🔍",
  },
  {
    step: 3,
    title: "Apply & Get Hired",
    description: "Apply instantly. Track your application status. Get hired!",
    icon: "🚀",
  },
];

const TESTIMONIALS = [
  {
    name: "Priya Patel",
    city: "Ahmedabad",
    role: "Software Developer",
    company: "TechSol India",
    review:
      "Found my dream job at an Ahmedabad startup within 2 weeks! The walk-in feature helped me get hired faster.",
    rating: 5,
  },
  {
    name: "Ravi Shah",
    city: "Surat",
    role: "Sales Executive",
    company: "Diamond Corp",
    review:
      "GujaratJobs is amazing for finding local opportunities. The guaranteed hiring badge gives confidence.",
    rating: 5,
  },
  {
    name: "Meera Desai",
    city: "Vadodara",
    role: "HR Manager",
    company: "Reliance Petro",
    review:
      "As a recruiter, I found highly qualified local candidates quickly. The platform truly understands Gujarat.",
    rating: 5,
  },
];

// --- MOTION VARIANTS ---
const staggerContainer = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: { staggerChildren: 0.15 },
  },
};

const fadeUp = {
  hidden: { opacity: 0, y: 40 },
  show: {
    opacity: 1,
    y: 0,
    transition: { type: "spring", bounce: 0.4, duration: 0.8 },
  },
};

const scaleIn = {
  hidden: { opacity: 0, scale: 0.9 },
  show: {
    opacity: 1,
    scale: 1,
    transition: { type: "spring", bounce: 0.5, duration: 0.6 },
  },
};

const HomePage = () => {
  const navigate = useNavigate();
  const [heroSearch, setHeroSearch] = useState("");
  const [heroCity, setHeroCity] = useState("");

  const heroRef = useRef(null);
  const { scrollYProgress } = useScroll({
    target: heroRef,
    offset: ["start start", "end start"],
  });
  const yHeroText = useTransform(scrollYProgress, [0, 1], [0, 150]);
  const yHeroBlobs = useTransform(scrollYProgress, [0, 1], [0, 300]);
  const opacityHero = useTransform(scrollYProgress, [0, 0.8], [1, 0]);

  const { data: featuredJobsData, isLoading: jobsLoading } = useQuery({
    queryKey: ["featuredJobs"],
    queryFn: () => jobsAPI.getAll({ limit: 6, sort: "-createdAt" }),
  });

  const { data: walkInsData, isLoading: walkInsLoading } = useQuery({
    queryKey: ["featuredWalkIns"],
    queryFn: () => jobsAPI.getWalkIns({ limit: 4 }),
  });

  const handleHeroSearch = () => {
    const params = new URLSearchParams();
    if (heroSearch) params.set("search", heroSearch);
    if (heroCity) params.set("city", heroCity);
    navigate(`/jobs?${params.toString()}`);
  };

  return (
    <div className="min-h-screen flex flex-col bg-slate-50 selection:bg-indigo-500 selection:text-white">
      <Navbar />

      <main className="flex-1">
        {/* HERO SECTION */}
        <section
          ref={heroRef}
          className="relative bg-white pt-32 pb-20 lg:pt-48 lg:pb-32 overflow-hidden border-b border-slate-200"
        >
          <motion.div
            className="absolute top-0 right-0 -mr-32 -mt-32 w-96 h-96 rounded-full bg-indigo-100 blur-[80px] opacity-70"
            style={{ y: yHeroBlobs }}
          />
          <motion.div
            className="absolute bottom-0 left-0 -ml-32 -mb-32 w-96 h-96 rounded-full bg-rose-100 blur-[80px] opacity-70"
            style={{ y: useTransform(scrollYProgress, [0, 1], [0, -200]) }}
          />
          <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-[0.03] mix-blend-overlay pointer-events-none"></div>

          <motion.div
            style={{ y: yHeroText, opacity: opacityHero }}
            className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center"
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.5 }}
              className="inline-flex items-center gap-2 bg-indigo-50 border border-indigo-100 text-indigo-700 text-sm font-medium px-4 py-2 rounded-full mb-8 shadow-sm"
            >
              <CheckBadgeIcon className="h-5 w-5 text-indigo-600" />
              <span>Trusted by 2,400+ Companies in Gujarat</span>
            </motion.div>

            <motion.h1
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7, delay: 0.1 }}
              className="text-5xl md:text-7xl font-extrabold text-slate-900 tracking-tight leading-[1.1] mb-6"
            >
              Find Your Dream Job <br className="hidden md:block" />
              in{" "}
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 to-rose-500">
                Gujarat
              </span>{" "}
              Today.
            </motion.h1>

            <motion.p
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7, delay: 0.2 }}
              className="text-lg md:text-xl text-slate-600 mb-10 max-w-2xl mx-auto leading-relaxed"
            >
              Discover thousands of opportunities across Ahmedabad, Surat,
              Vadodara, and more. Direct contacts, walk-ins, and verified
              recruiters.
            </motion.p>

            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.3 }}
              className="bg-white/80 backdrop-blur-xl border border-slate-200/60 rounded-2xl shadow-xl shadow-slate-200/50 p-3 flex flex-col md:flex-row gap-3 max-w-3xl mx-auto ring-1 ring-slate-100 relative z-10"
            >
              <div className="relative flex-1 flex items-center bg-slate-50 rounded-xl px-4 py-3 border border-slate-200 focus-within:ring-2 focus-within:ring-indigo-500 transition-shadow">
                <MagnifyingGlassIcon className="h-5 w-5 text-slate-400 mr-3 flex-shrink-0" />
                <input
                  type="text"
                  value={heroSearch}
                  onChange={(e) => setHeroSearch(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && handleHeroSearch()}
                  placeholder="Job title, skill, company..."
                  className="w-full bg-transparent border-none focus:outline-none text-slate-900 placeholder:text-slate-400"
                />
              </div>
              <div className="w-[1px] bg-slate-200 hidden md:block self-stretch my-2"></div>
              <div className="relative md:w-56 flex items-center bg-slate-50 rounded-xl px-4 py-3 border border-slate-200 focus-within:ring-2 focus-within:ring-indigo-500 transition-shadow">
                <MapPinIcon className="h-5 w-5 text-slate-400 mr-3 flex-shrink-0" />
                <select
                  value={heroCity}
                  onChange={(e) => setHeroCity(e.target.value)}
                  className="w-full bg-transparent border-none focus:outline-none text-slate-900 appearance-none cursor-pointer"
                >
                  <option value="">All Gujarat</option>
                  {GUJARAT_CITIES.slice(0, 10).map((c) => (
                    <option key={c} value={c}>
                      {c}
                    </option>
                  ))}
                </select>
              </div>
              <button
                onClick={handleHeroSearch}
                className="bg-indigo-600 hover:bg-indigo-700 text-white font-medium px-8 py-3.5 rounded-xl shadow-md transition-all hover:shadow-lg hover:-translate-y-0.5 active:scale-95 whitespace-nowrap"
              >
                Search
              </button>
            </motion.div>

            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.8, duration: 1 }}
              className="flex flex-wrap justify-center items-center gap-3 mt-8"
            >
              <span className="text-slate-500 text-sm font-medium">
                Trending:
              </span>
              {["Fresher Jobs", "Walk-in Today", "IT Jobs", "Ahmedabad"].map(
                (term) => (
                  <button
                    key={term}
                    onClick={() =>
                      navigate(`/jobs?search=${encodeURIComponent(term)}`)
                    }
                    className="text-xs font-medium text-slate-600 bg-white border border-slate-200 hover:border-indigo-300 hover:text-indigo-600 px-3 py-1.5 rounded-full transition-colors shadow-sm"
                  >
                    {term}
                  </button>
                ),
              )}
            </motion.div>
          </motion.div>
        </section>

        {/* STATS BENTO GRID */}
        <section className="relative z-10 -mt-10 mb-16 mx-4">
          <motion.div
            variants={staggerContainer}
            initial="hidden"
            whileInView="show"
            viewport={{ once: true, margin: "-50px" }}
            className="max-w-7xl mx-auto grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6"
          >
            {STATS.map(({ label, value, icon: Icon, color, bg }) => (
              <motion.div
                key={label}
                variants={fadeUp}
                className="bg-white/80 backdrop-blur-xl border border-slate-200/60 p-6 rounded-3xl shadow-xl shadow-slate-200/50 flex flex-col items-center text-center transform-gpu hover:-translate-y-1 transition-transform duration-300"
              >
                <div
                  className={`w-12 h-12 rounded-2xl ${bg} flex items-center justify-center mb-4`}
                >
                  <Icon className={`h-6 w-6 ${color}`} />
                </div>
                <div className="text-3xl font-extrabold text-slate-900 tracking-tight mb-1">
                  {value}
                </div>
                <div className="text-sm font-medium text-slate-500">
                  {label}
                </div>
              </motion.div>
            ))}
          </motion.div>
        </section>

        {/* WALK-INS */}
        <section className="py-20 bg-slate-50">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex flex-col md:flex-row md:items-end justify-between mb-12">
              <motion.div
                initial={{ opacity: 0, x: -30 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6 }}
              >
                <span className="text-amber-600 font-bold text-sm tracking-wider uppercase flex items-center gap-2 mb-2">
                  <span className="relative flex h-2.5 w-2.5">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-amber-500"></span>
                  </span>
                  Live Opportunities
                </span>
                <h2 className="text-4xl font-extrabold text-slate-900 tracking-tight">
                  Today's Walk-in Drives
                </h2>
                <p className="text-slate-500 mt-3 text-lg">
                  Skip the queue. Go direct to interview.
                </p>
              </motion.div>
              <motion.div
                initial={{ opacity: 0, x: 30 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                className="mt-6 md:mt-0"
              >
                <Link
                  to="/jobs?isWalkIn=true"
                  className="group inline-flex items-center gap-2 font-semibold text-amber-600 hover:text-amber-700 transition-colors"
                >
                  View All Walk-ins
                  <ArrowRightIcon className="h-4 w-4 group-hover:translate-x-1 transition-transform" />
                </Link>
              </motion.div>
            </div>

            {walkInsLoading ? (
              <div className="flex justify-center py-12">
                <LoadingSpinner size="lg" />
              </div>
            ) : (
              <motion.div
                variants={staggerContainer}
                initial="hidden"
                whileInView="show"
                viewport={{ once: true, margin: "-100px" }}
                className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6"
              >
                {walkInsData?.jobs?.slice(0, 4).map((job) => (
                  <motion.div key={job._id} variants={scaleIn}>
                    <WalkInCard job={job} />
                  </motion.div>
                ))}
              </motion.div>
            )}
          </div>
        </section>

        {/* FEATURED LATEST JOBS */}
        <section className="py-24 bg-white border-y border-slate-200">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center max-w-2xl mx-auto mb-16">
              <motion.h2
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6 }}
                className="text-4xl font-extrabold text-slate-900 tracking-tight mb-4"
              >
                Premium Job Listings
              </motion.h2>
              <motion.p
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6, delay: 0.1 }}
                className="text-lg text-slate-500"
              >
                Verified companies actively hiring across Gujarat. Handpicked to
                match your skills.
              </motion.p>
            </div>

            {jobsLoading ? (
              <div className="flex justify-center py-12">
                <LoadingSpinner size="lg" />
              </div>
            ) : (
              <motion.div
                variants={staggerContainer}
                initial="hidden"
                whileInView="show"
                viewport={{ once: true, margin: "-100px" }}
                className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-12"
              >
                {featuredJobsData?.jobs?.slice(0, 6).map((job) => (
                  <motion.div key={job._id} variants={fadeUp} className="group">
                    <JobCard job={job} />
                  </motion.div>
                ))}
              </motion.div>
            )}

            <motion.div
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              viewport={{ once: true }}
              className="flex justify-center"
            >
              <Link
                to="/jobs"
                className="inline-flex items-center gap-2 bg-slate-900 hover:bg-slate-800 text-white font-semibold px-8 py-4 rounded-xl shadow-xl shadow-slate-900/20 transition-all hover:shadow-2xl hover:-translate-y-1 active:scale-95"
              >
                Explore All Jobs
                <ArrowRightIcon className="h-5 w-5" />
              </Link>
            </motion.div>
          </div>
        </section>

        {/* HOW IT WORKS */}
        <section className="py-24 bg-slate-50 overflow-hidden relative">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="text-center mb-20"
            >
              <h2 className="text-4xl font-extrabold text-slate-900 tracking-tight">
                How to Get Hired
              </h2>
              <p className="text-slate-500 mt-4 text-lg">
                Three simple steps to secure your dream role
              </p>
            </motion.div>

            <motion.div
              variants={staggerContainer}
              initial="hidden"
              whileInView="show"
              viewport={{ once: true, margin: "-100px" }}
              className="grid grid-cols-1 md:grid-cols-3 gap-12 relative"
            >
              {/* Connector line for desktop */}
              <div className="hidden md:block absolute top-[52px] left-[15%] right-[15%] h-[2px] bg-gradient-to-r from-indigo-100 via-indigo-300 to-indigo-100 z-0"></div>

              {HOW_IT_WORKS.map(({ step, title, description, icon }) => (
                <motion.div
                  key={step}
                  variants={fadeUp}
                  className="relative z-10 text-center flex flex-col items-center"
                >
                  <div className="w-28 h-28 bg-white border-4 border-indigo-50 rounded-full shadow-xl shadow-indigo-100 flex items-center justify-center text-5xl mb-6 relative hover:scale-105 transition-transform">
                    {icon}
                    <div className="absolute -bottom-3 -right-3 w-10 h-10 bg-indigo-600 text-white rounded-full flex items-center justify-center font-bold border-4 border-slate-50 shadow-md">
                      {step}
                    </div>
                  </div>
                  <h3 className="text-2xl font-bold text-slate-900 mb-3">
                    {title}
                  </h3>
                  <p className="text-slate-600 leading-relaxed max-w-sm">
                    {description}
                  </p>
                </motion.div>
              ))}
            </motion.div>
          </div>
        </section>

        {/* CTA */}
        <section className="relative py-24 overflow-hidden">
          <div className="absolute inset-0 bg-slate-900"></div>
          <motion.div
            initial={{ scale: 1.2, opacity: 0 }}
            whileInView={{ scale: 1, opacity: 0.4 }}
            viewport={{ once: true }}
            transition={{ duration: 1.5 }}
            className="absolute inset-0 bg-[radial-gradient(ellipse_at_bottom_right,_var(--tw-gradient-stops))] from-indigo-600 via-rose-500/20 to-transparent"
          ></motion.div>

          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
            className="relative z-10 max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center"
          >
            <h2 className="text-4xl md:text-5xl font-extrabold text-white tracking-tight mb-6">
              Your Professional Journey <br /> Starts Here.
            </h2>
            <p className="text-xl text-slate-300 mb-10 max-w-2xl mx-auto leading-relaxed">
              Join over 50,000 professionals who transformed their careers
              through GujaratJobs.
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <Link
                to="/register"
                className="bg-white text-slate-900 hover:bg-slate-100 font-bold px-8 py-4 rounded-xl shadow-xl transition-all hover:scale-105 hover:shadow-white/20 active:scale-95 w-full sm:w-auto"
              >
                Create Free Account
              </Link>
              <Link
                to="/jobs"
                className="bg-white/10 backdrop-blur border border-white/20 text-white hover:bg-white/20 font-bold px-8 py-4 rounded-xl transition-all hover:scale-105 active:scale-95 w-full sm:w-auto"
              >
                Browse Jobs Instead
              </Link>
            </div>
          </motion.div>
        </section>
      </main>

      <Footer />
    </div>
  );
};

export default HomePage;
