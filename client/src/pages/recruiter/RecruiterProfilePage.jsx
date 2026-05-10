/**
 * RecruiterProfilePage — DESIGN.md "Disciplined warmth"
 */

import React, { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import toast from "react-hot-toast";
import {
  BuildingOfficeIcon,
  GlobeAltIcon,
  MapPinIcon,
  PencilIcon,
  CheckIcon,
  XMarkIcon,
  CheckBadgeIcon,
} from "@heroicons/react/24/outline";

import Navbar from "../../components/layout/Navbar";
import Sidebar from "../../components/layout/Sidebar";
import LoadingSpinner from "../../components/layout/LoadingSpinner";
import StatsCard from "../../components/dashboard/StatsCard";
import { Badge } from "@/components/ui/badge";
import axiosInstance from "../../api/axios";
import { GUJARAT_CITIES } from "../../utils/constants";

const INDUSTRIES = [
  "Information Technology",
  "Manufacturing",
  "Finance & Banking",
  "Healthcare",
  "Retail & E-Commerce",
  "Education",
  "Logistics & Supply Chain",
  "Construction",
  "Textiles",
  "Pharmaceuticals",
  "Automotive",
  "Agriculture",
  "Media & Entertainment",
  "Other",
];

const SIZES = ["1–10", "11–50", "51–200", "201–500", "501–1000", "1000+"];

export default function RecruiterProfilePage() {
  const qc = useQueryClient();
  const [isEditing, setIsEditing] = useState(false);

  const { data, isLoading } = useQuery({
    queryKey: ["recruiterProfile"],
    queryFn: async () => {
      const { data } = await axiosInstance.get("/recruiter/profile");
      return data.data;
    },
    retry: false,
  });

  const profile = data || {
    companyName: "",
    industry: "",
    companySize: "",
    website: "",
    description: "",
    location: { city: "", state: "Gujarat", address: "" },
    contactEmail: "",
    contactPhone: "",
    isVerified: false,
    totalHired: 0,
    jobsPosted: 0,
  };

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm({ defaultValues: profile });

  const updateMutation = useMutation({
    mutationFn: (formData) => axiosInstance.put("/recruiter/profile", formData),
    onSuccess: () => {
      qc.invalidateQueries(["recruiterProfile"]);
      toast.success("Profile updated");
      setIsEditing(false);
    },
    onError: () => toast.error("Failed to update profile"),
  });

  if (isLoading) {
    return (
      <div className="min-h-screen flex flex-col bg-canvas">
        <Navbar />
        <div className="flex flex-1 items-center justify-center">
          <LoadingSpinner size="lg" />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-canvas">
      <Navbar />
      <div className="flex flex-1">
        <Sidebar />
        <main className="flex-1 p-6 lg:p-10 bg-canvas-warm">
          <div className="max-w-4xl">
            <div className="text-[13px] font-bold tracking-[0.15em] uppercase text-saffron mb-3">
              Company profile
            </div>
            <h1 className="text-3xl lg:text-4xl font-bold tracking-tighter text-ink leading-tight mb-8">
              Tell candidates who you are.
            </h1>

            {/* Header card */}
            <div className="bg-canvas border border-hairline rounded-xl p-6 mb-6">
              <div className="flex items-center gap-5">
                <div className="w-16 h-16 rounded-xl bg-saffron text-on-primary flex items-center justify-center">
                  <BuildingOfficeIcon className="h-8 w-8 stroke-[1.5]" />
                </div>
                <div className="flex-1 min-w-0">
                  <h2 className="text-xl font-bold tracking-tight text-ink truncate">
                    {profile.companyName || "Your Company"}
                  </h2>
                  <p className="text-sm text-body">{profile.industry}</p>
                  <div className="flex items-center gap-3 mt-1.5 flex-wrap">
                    {profile.location?.city && (
                      <span className="text-xs text-saffron font-bold uppercase tracking-wider inline-flex items-center gap-1">
                        <MapPinIcon className="h-3.5 w-3.5" />
                        {profile.location.city}
                      </span>
                    )}
                    {profile.isVerified && (
                      <Badge className="bg-success/10 text-success border-success/20 rounded-full text-[10px] uppercase font-bold tracking-wider">
                        <CheckBadgeIcon className="h-3 w-3 mr-1" />
                        Verified
                      </Badge>
                    )}
                  </div>
                </div>
                {!isEditing && (
                  <button
                    onClick={() => setIsEditing(true)}
                    className="bg-canvas text-ink border border-hairline-strong rounded-full px-5 h-10 inline-flex items-center gap-1.5 text-sm font-bold hover:border-ink transition-colors"
                  >
                    <PencilIcon className="h-3.5 w-3.5" />
                    Edit
                  </button>
                )}
              </div>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-6">
              <StatsCard title="Jobs posted" value={profile.jobsPosted || 0} icon={BuildingOfficeIcon} />
              <StatsCard title="Total hired" value={profile.totalHired || 0} icon={CheckBadgeIcon} accent />
              <StatsCard
                title="Verification"
                value={profile.isVerified ? "Verified" : "Pending"}
                icon={CheckBadgeIcon}
              />
            </div>

            {/* Form / display */}
            <div className="bg-canvas border border-hairline rounded-xl p-6">
              {!isEditing ? (
                <div className="space-y-5">
                  <ReadField label="About">
                    <p className="text-sm text-body leading-relaxed">
                      {profile.description || "No description added yet."}
                    </p>
                  </ReadField>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                    <ReadField label="Industry">{profile.industry || "—"}</ReadField>
                    <ReadField label="Company size">{profile.companySize || "—"}</ReadField>
                    <ReadField label="Website">
                      {profile.website ? (
                        <a
                          href={profile.website}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-saffron font-bold hover:underline inline-flex items-center gap-1.5"
                        >
                          <GlobeAltIcon className="h-4 w-4" />
                          {profile.website}
                        </a>
                      ) : (
                        "—"
                      )}
                    </ReadField>
                    <ReadField label="Contact email">{profile.contactEmail || "—"}</ReadField>
                    <ReadField label="Contact phone">{profile.contactPhone || "—"}</ReadField>
                    <ReadField label="Location">
                      {profile.location?.city
                        ? `${profile.location.city}, Gujarat`
                        : "—"}
                    </ReadField>
                  </div>
                  {profile.location?.address && (
                    <ReadField label="Address">{profile.location.address}</ReadField>
                  )}
                </div>
              ) : (
                <form
                  onSubmit={handleSubmit((d) => updateMutation.mutate(d))}
                  className="space-y-5"
                >
                  <Field label="Company name" error={errors.companyName?.message} required>
                    <input
                      {...register("companyName", { required: "Company name is required" })}
                      placeholder="Your company name"
                      className={inputClass(!!errors.companyName)}
                    />
                  </Field>
                  <Field label="About">
                    <textarea
                      {...register("description")}
                      rows={4}
                      placeholder="Tell candidates about your company, mission, culture..."
                      className={inputClass(false) + " resize-none"}
                    />
                  </Field>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                    <Field label="Industry">
                      <select {...register("industry")} className={inputClass(false)}>
                        <option value="">Select</option>
                        {INDUSTRIES.map((i) => (
                          <option key={i} value={i}>{i}</option>
                        ))}
                      </select>
                    </Field>
                    <Field label="Company size">
                      <select {...register("companySize")} className={inputClass(false)}>
                        <option value="">Select</option>
                        {SIZES.map((s) => (
                          <option key={s} value={s}>{s}</option>
                        ))}
                      </select>
                    </Field>
                    <Field label="Website">
                      <input
                        {...register("website")}
                        placeholder="https://yourcompany.com"
                        className={inputClass(false)}
                      />
                    </Field>
                    <Field label="City">
                      <select
                        {...register("location.city")}
                        className={inputClass(false)}
                      >
                        <option value="">Select</option>
                        {GUJARAT_CITIES.map((c) => <option key={c} value={c}>{c}</option>)}
                      </select>
                    </Field>
                    <Field label="Contact email">
                      <input
                        type="email"
                        {...register("contactEmail")}
                        placeholder="hr@yourcompany.com"
                        className={inputClass(false)}
                      />
                    </Field>
                    <Field label="Contact phone">
                      <input
                        type="tel"
                        {...register("contactPhone")}
                        placeholder="9876543210"
                        className={inputClass(false)}
                      />
                    </Field>
                  </div>
                  <Field label="Office address">
                    <input
                      {...register("location.address")}
                      placeholder="Full office address"
                      className={inputClass(false)}
                    />
                  </Field>

                  <div className="flex items-center gap-3 pt-3 border-t border-hairline">
                    <button
                      type="submit"
                      disabled={updateMutation.isPending}
                      className="bg-saffron text-on-primary uppercase font-bold tracking-[0.05em] text-sm px-6 h-10 inline-flex items-center gap-2 hover:bg-saffron-active active:scale-[0.98] transition-all duration-150 disabled:opacity-60"
                    >
                      {updateMutation.isPending ? (
                        <LoadingSpinner size="sm" className="border-on-primary" />
                      ) : (
                        <CheckIcon className="h-4 w-4" />
                      )}
                      Save changes
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        reset(profile);
                        setIsEditing(false);
                      }}
                      className="bg-canvas text-ink border border-hairline-strong rounded-full px-5 h-10 inline-flex items-center gap-2 text-sm font-bold hover:border-ink transition-colors"
                    >
                      <XMarkIcon className="h-4 w-4" />
                      Cancel
                    </button>
                  </div>
                </form>
              )}
            </div>
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

function ReadField({ label, children }) {
  return (
    <div>
      <p className="text-[11px] font-bold tracking-[0.15em] uppercase text-muted-text mb-1.5">
        {label}
      </p>
      <div className="text-sm text-ink">{children}</div>
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
