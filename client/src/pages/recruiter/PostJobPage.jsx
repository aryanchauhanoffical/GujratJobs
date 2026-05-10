/**
 * PostJobPage — DESIGN.md "Disciplined warmth"
 *
 * Multi-step job creation: Basic / Details / Walk-in / Extras.
 * Saffron progress indicator, hairline forms, sharp Submit at the end.
 */

import React, { useState } from "react";
import { useForm } from "react-hook-form";
import { useMutation } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";
import { motion, LayoutGroup } from "framer-motion";
import toast from "react-hot-toast";
import {
  XMarkIcon,
  PaperAirplaneIcon,
  ArrowRightIcon,
  ArrowLeftIcon,
  CheckCircleIcon,
} from "@heroicons/react/24/outline";

import Navbar from "../../components/layout/Navbar";
import Sidebar from "../../components/layout/Sidebar";
import LoadingSpinner from "../../components/layout/LoadingSpinner";
import { jobsAPI } from "../../api/jobs.api";
import {
  GUJARAT_CITIES,
  JOB_TYPES,
  EXPERIENCE_LEVELS,
  JOB_CATEGORIES,
  QUALIFICATIONS,
} from "../../utils/constants";

const SECTIONS = [
  { id: "basic", label: "Basics" },
  { id: "details", label: "Details" },
  { id: "walkin", label: "Walk-in" },
  { id: "extras", label: "Extras" },
];

export default function PostJobPage() {
  const navigate = useNavigate();
  const [skillInput, setSkillInput] = useState("");
  const [skills, setSkills] = useState([]);
  const [requirements, setRequirements] = useState([""]);
  const [benefits, setBenefits] = useState([""]);
  const [isWalkIn, setIsWalkIn] = useState(false);
  const [isGuaranteedHiring, setIsGuaranteedHiring] = useState(false);
  const [fastTrack, setFastTrack] = useState(false);
  const [isFresherFriendly, setIsFresherFriendly] = useState(false);
  const [activeSection, setActiveSection] = useState("basic");

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm({
    defaultValues: {
      type: "full-time",
      experienceLevel: "fresher",
      qualification: "Any",
      openings: 1,
    },
  });

  const createJobMutation = useMutation({
    mutationFn: jobsAPI.create,
    onSuccess: () => {
      toast.success("Job posted");
      navigate("/recruiter/jobs");
    },
    onError: (err) => {
      toast.error(err.response?.data?.message || "Failed to post job");
    },
  });

  const onSubmit = (data) => {
    createJobMutation.mutate({
      ...data,
      skills,
      requirements: requirements.filter(Boolean),
      benefits: benefits.filter(Boolean),
      isWalkIn,
      isGuaranteedHiring,
      fastTrack,
      isFresherFriendly,
      salary: {
        min: parseInt(data.salaryMin) || 0,
        max: parseInt(data.salaryMax) || 0,
        currency: "INR",
        period: "monthly",
        isNegotiable: data.salaryNegotiable || false,
      },
      location: {
        city: data.city,
        state: "Gujarat",
        pincode: data.pincode,
        address: data.address,
      },
    });
  };

  const goNext = (next) => setActiveSection(next);

  return (
    <div className="min-h-screen flex flex-col bg-canvas">
      <Navbar />
      <div className="flex flex-1">
        <Sidebar />
        <main className="flex-1 p-6 lg:p-10 bg-canvas-warm">
          <div className="max-w-3xl">
            <div className="text-[13px] font-bold tracking-[0.15em] uppercase text-saffron mb-3">
              New job
            </div>
            <h1 className="text-3xl lg:text-4xl font-bold tracking-tighter text-ink leading-tight mb-8">
              Post a job.
            </h1>

            {/* Progress tabs */}
            <LayoutGroup>
              <div className="flex gap-1 border-b border-hairline mb-6">
                {SECTIONS.map(({ id, label }) => (
                  <button
                    key={id}
                    type="button"
                    onClick={() => setActiveSection(id)}
                    className={`relative px-5 py-3 text-sm font-bold tracking-tight transition-colors ${
                      activeSection === id ? "text-saffron" : "text-muted-text hover:text-ink"
                    }`}
                  >
                    {label}
                    {activeSection === id && (
                      <motion.div
                        layoutId="post-tab-indicator"
                        className="absolute left-0 right-0 -bottom-px h-[2px] bg-saffron"
                      />
                    )}
                  </button>
                ))}
              </div>
            </LayoutGroup>

            <form onSubmit={handleSubmit(onSubmit)}>
              <div className="bg-canvas border border-hairline rounded-xl p-6 space-y-5">
                {activeSection === "basic" && (
                  <>
                    <Field label="Job title" error={errors.title?.message} required>
                      <input
                        {...register("title", { required: "Job title is required" })}
                        placeholder="e.g. Software Developer, Sales Executive"
                        className={inputClass(!!errors.title)}
                      />
                    </Field>
                    <Field label="Company name" error={errors.company?.message} required>
                      <input
                        {...register("company", { required: "Company name is required" })}
                        placeholder="Your company name"
                        className={inputClass(!!errors.company)}
                      />
                    </Field>
                    <Field label="Job description" error={errors.description?.message} required>
                      <textarea
                        {...register("description", {
                          required: "Description is required",
                          minLength: { value: 50, message: "Description must be at least 50 characters" },
                        })}
                        rows={6}
                        placeholder="Describe the role, responsibilities, and what you're looking for..."
                        className={inputClass(!!errors.description) + " resize-none"}
                      />
                    </Field>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                      <Field label="Category">
                        <select {...register("category")} className={inputClass(false)}>
                          <option value="">Select category</option>
                          {JOB_CATEGORIES.map((c) => (
                            <option key={c.value} value={c.value}>{c.label}</option>
                          ))}
                        </select>
                      </Field>
                      <Field label="Job type" required>
                        <select {...register("type", { required: true })} className={inputClass(false)}>
                          {JOB_TYPES.map((t) => (
                            <option key={t.value} value={t.value}>{t.label}</option>
                          ))}
                        </select>
                      </Field>
                    </div>

                    <NavRow>
                      <span />
                      <NextButton onClick={() => goNext("details")}>Continue</NextButton>
                    </NavRow>
                  </>
                )}

                {activeSection === "details" && (
                  <>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                      <Field label="City" error={errors.city?.message} required>
                        <select
                          {...register("city", { required: "City is required" })}
                          className={inputClass(!!errors.city)}
                        >
                          <option value="">Select city</option>
                          {GUJARAT_CITIES.map((c) => <option key={c} value={c}>{c}</option>)}
                        </select>
                      </Field>
                      <Field label="Pincode">
                        <input {...register("pincode")} placeholder="380001" className={inputClass(false)} />
                      </Field>
                    </div>
                    <Field label="Office address">
                      <input {...register("address")} placeholder="Full office address" className={inputClass(false)} />
                    </Field>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                      <Field label="Min salary (monthly)">
                        <SalaryInput register={register("salaryMin")} placeholder="10000" />
                      </Field>
                      <Field label="Max salary (monthly)">
                        <SalaryInput register={register("salaryMax")} placeholder="30000" />
                      </Field>
                    </div>
                    <label className="inline-flex items-center gap-2.5 cursor-pointer">
                      <input
                        type="checkbox"
                        {...register("salaryNegotiable")}
                        className="rounded text-saffron focus:ring-saffron border-hairline-strong"
                      />
                      <span className="text-sm text-body">Salary is negotiable</span>
                    </label>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                      <Field label="Experience level" required>
                        <select {...register("experienceLevel")} className={inputClass(false)}>
                          {EXPERIENCE_LEVELS.map((l) => (
                            <option key={l.value} value={l.value}>{l.label}</option>
                          ))}
                        </select>
                      </Field>
                      <Field label="Qualification">
                        <select {...register("qualification")} className={inputClass(false)}>
                          {QUALIFICATIONS.map((q) => <option key={q.value} value={q.value}>{q.label}</option>)}
                        </select>
                      </Field>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                      <Field label="Openings">
                        <input type="number" {...register("openings")} min="1" placeholder="1" className={inputClass(false)} />
                      </Field>
                      <Field label="Application deadline">
                        <input type="date" {...register("deadline")} className={inputClass(false)} />
                      </Field>
                    </div>

                    {/* Skills */}
                    <Field label="Required skills">
                      <div className="flex flex-wrap gap-2 mb-2">
                        {skills.map((s) => (
                          <span
                            key={s}
                            className="bg-canvas-warm border border-hairline text-ink px-2.5 py-1 rounded-md text-sm font-bold tracking-tight inline-flex items-center gap-1.5"
                          >
                            {s}
                            <button
                              type="button"
                              onClick={() => setSkills(skills.filter((sk) => sk !== s))}
                              className="text-muted-soft hover:text-error"
                            >
                              <XMarkIcon className="h-3.5 w-3.5" />
                            </button>
                          </span>
                        ))}
                      </div>
                      <div className="flex gap-2">
                        <input
                          type="text"
                          value={skillInput}
                          onChange={(e) => setSkillInput(e.target.value)}
                          onKeyDown={(e) => {
                            if (e.key === "Enter") {
                              e.preventDefault();
                              if (skillInput.trim()) {
                                setSkills([...skills, skillInput.trim()]);
                                setSkillInput("");
                              }
                            }
                          }}
                          placeholder="Add skill (press Enter)"
                          className={inputClass(false) + " flex-1"}
                        />
                        <button
                          type="button"
                          onClick={() => {
                            if (skillInput.trim()) {
                              setSkills([...skills, skillInput.trim()]);
                              setSkillInput("");
                            }
                          }}
                          className="bg-canvas text-ink border border-hairline-strong rounded-lg px-5 text-sm font-bold hover:border-ink transition-colors"
                        >
                          Add
                        </button>
                      </div>
                    </Field>

                    {/* Requirements */}
                    <Field label="Requirements">
                      {requirements.map((req, idx) => (
                        <div key={idx} className="flex gap-2 mb-2">
                          <input
                            value={req}
                            onChange={(e) =>
                              setRequirements(requirements.map((r, i) => (i === idx ? e.target.value : r)))
                            }
                            placeholder={`Requirement ${idx + 1}`}
                            className={inputClass(false) + " flex-1"}
                          />
                          {requirements.length > 1 && (
                            <button
                              type="button"
                              onClick={() => setRequirements(requirements.filter((_, i) => i !== idx))}
                              className="text-muted-soft hover:text-error px-2"
                            >
                              <XMarkIcon className="h-4 w-4" />
                            </button>
                          )}
                        </div>
                      ))}
                      <button
                        type="button"
                        onClick={() => setRequirements([...requirements, ""])}
                        className="text-sm font-bold text-saffron hover:underline"
                      >
                        + Add requirement
                      </button>
                    </Field>

                    <NavRow>
                      <BackButton onClick={() => goNext("basic")} />
                      <NextButton onClick={() => goNext("walkin")}>Continue</NextButton>
                    </NavRow>
                  </>
                )}

                {activeSection === "walkin" && (
                  <>
                    <label
                      className={`flex items-center gap-3 p-5 border-2 rounded-xl cursor-pointer transition-colors ${
                        isWalkIn ? "border-saffron bg-saffron/5" : "border-hairline hover:border-hairline-strong"
                      }`}
                    >
                      <input
                        type="checkbox"
                        checked={isWalkIn}
                        onChange={(e) => setIsWalkIn(e.target.checked)}
                        className="w-5 h-5 rounded text-saffron focus:ring-saffron border-hairline-strong"
                      />
                      <div>
                        <p className="font-bold tracking-tight text-ink text-sm">This is a walk-in interview</p>
                        <p className="text-xs text-body">Candidates can walk in directly to your venue.</p>
                      </div>
                    </label>

                    {isWalkIn && (
                      <div className="space-y-5 bg-saffron/5 border border-saffron/20 rounded-xl p-5">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                          <Field label="Walk-in date">
                            <input
                              type="date"
                              {...register("walkInDate")}
                              min={new Date().toISOString().split("T")[0]}
                              className={inputClass(false)}
                            />
                          </Field>
                          <Field label="Contact person">
                            <input
                              {...register("walkInContact")}
                              placeholder="HR Manager name"
                              className={inputClass(false)}
                            />
                          </Field>
                          <Field label="Start time">
                            <input type="time" {...register("walkInStartTime")} className={inputClass(false)} />
                          </Field>
                          <Field label="End time">
                            <input type="time" {...register("walkInEndTime")} className={inputClass(false)} />
                          </Field>
                        </div>
                        <Field label="Venue address">
                          <textarea
                            {...register("walkInVenue")}
                            rows={2}
                            placeholder="Full venue address for candidates"
                            className={inputClass(false) + " resize-none"}
                          />
                        </Field>
                        <Field label="Contact phone">
                          <input
                            type="tel"
                            {...register("walkInPhone")}
                            placeholder="Contact number for candidates"
                            className={inputClass(false)}
                          />
                        </Field>
                      </div>
                    )}

                    <NavRow>
                      <BackButton onClick={() => goNext("details")} />
                      <NextButton onClick={() => goNext("extras")}>Continue</NextButton>
                    </NavRow>
                  </>
                )}

                {activeSection === "extras" && (
                  <>
                    <div className="space-y-3">
                      {[
                        {
                          state: isGuaranteedHiring,
                          setState: setIsGuaranteedHiring,
                          label: "Guaranteed hiring",
                          desc: "Commit to hiring a certain number of candidates",
                        },
                        {
                          state: fastTrack,
                          setState: setFastTrack,
                          label: "Fast track hiring",
                          desc: "Get hired within 48-72 hours",
                        },
                        {
                          state: isFresherFriendly,
                          setState: setIsFresherFriendly,
                          label: "Fresher friendly",
                          desc: "Open to candidates with 0 experience",
                        },
                      ].map(({ state, setState, label, desc }) => (
                        <label
                          key={label}
                          className={`flex items-center gap-3 p-4 border-2 rounded-xl cursor-pointer transition-colors ${
                            state ? "border-saffron bg-saffron/5" : "border-hairline hover:border-hairline-strong"
                          }`}
                        >
                          <input
                            type="checkbox"
                            checked={state}
                            onChange={(e) => setState(e.target.checked)}
                            className="w-5 h-5 rounded text-saffron focus:ring-saffron border-hairline-strong"
                          />
                          <div className="flex-1">
                            <p className="font-bold tracking-tight text-ink text-sm">{label}</p>
                            <p className="text-xs text-body">{desc}</p>
                          </div>
                          {state && <CheckCircleIcon className="h-5 w-5 text-saffron stroke-[1.5]" />}
                        </label>
                      ))}
                    </div>

                    {isGuaranteedHiring && (
                      <Field label="Mandatory hire count">
                        <input
                          type="number"
                          {...register("mandatoryHireCount")}
                          min="1"
                          placeholder="5"
                          className={inputClass(false) + " w-32"}
                        />
                      </Field>
                    )}

                    <Field label="Benefits / perks">
                      {benefits.map((benefit, idx) => (
                        <div key={idx} className="flex gap-2 mb-2">
                          <input
                            value={benefit}
                            onChange={(e) =>
                              setBenefits(benefits.map((b, i) => (i === idx ? e.target.value : b)))
                            }
                            placeholder="e.g. Health insurance, provident fund"
                            className={inputClass(false) + " flex-1"}
                          />
                          {benefits.length > 1 && (
                            <button
                              type="button"
                              onClick={() => setBenefits(benefits.filter((_, i) => i !== idx))}
                              className="text-muted-soft hover:text-error px-2"
                            >
                              <XMarkIcon className="h-4 w-4" />
                            </button>
                          )}
                        </div>
                      ))}
                      <button
                        type="button"
                        onClick={() => setBenefits([...benefits, ""])}
                        className="text-sm font-bold text-saffron hover:underline"
                      >
                        + Add benefit
                      </button>
                    </Field>

                    <NavRow>
                      <BackButton onClick={() => goNext("walkin")} />
                      <button
                        type="submit"
                        disabled={createJobMutation.isPending}
                        className="bg-saffron text-on-primary uppercase font-bold tracking-[0.05em] text-sm px-8 h-12 inline-flex items-center gap-2 hover:bg-saffron-active active:scale-[0.98] transition-all duration-150 disabled:opacity-60"
                      >
                        {createJobMutation.isPending ? (
                          <>
                            <LoadingSpinner size="sm" className="border-on-primary" />
                            Posting
                          </>
                        ) : (
                          <>
                            <PaperAirplaneIcon className="h-4 w-4" />
                            Post job
                          </>
                        )}
                      </button>
                    </NavRow>
                  </>
                )}
              </div>
            </form>
          </div>
        </main>
      </div>
    </div>
  );
}

function Field({ label, error, required, children }) {
  return (
    <div>
      <label className="block text-[13px] font-bold tracking-[0.15em] uppercase text-ink mb-2">
        {label}
        {required && <span className="text-saffron ml-1">*</span>}
      </label>
      {children}
      {error && <p className="mt-1.5 text-xs text-error">{error}</p>}
    </div>
  );
}

function NavRow({ children }) {
  return <div className="flex justify-between items-center pt-3 border-t border-hairline">{children}</div>;
}

function NextButton({ onClick, children }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="bg-saffron text-on-primary uppercase font-bold tracking-[0.05em] text-sm px-6 h-10 inline-flex items-center gap-2 hover:bg-saffron-active active:scale-[0.98] transition-all duration-150"
    >
      {children}
      <ArrowRightIcon className="h-4 w-4" />
    </button>
  );
}

function BackButton({ onClick }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="bg-canvas text-ink border border-hairline-strong rounded-full px-5 h-10 inline-flex items-center gap-2 text-sm font-bold hover:border-ink transition-colors"
    >
      <ArrowLeftIcon className="h-4 w-4" />
      Back
    </button>
  );
}

function SalaryInput({ register, placeholder }) {
  return (
    <div className="relative">
      <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-muted-soft text-sm">₹</span>
      <input
        type="number"
        {...register}
        placeholder={placeholder}
        min="0"
        className={inputClass(false) + " pl-7"}
      />
    </div>
  );
}

function inputClass(hasError) {
  return `w-full px-3.5 py-2.5 border rounded-lg text-sm bg-canvas focus:outline-none focus:ring-1 transition-all ${
    hasError
      ? "border-error focus:ring-error/30"
      : "border-hairline focus:border-saffron focus:ring-saffron/30"
  }`;
}
