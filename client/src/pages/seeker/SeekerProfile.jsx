/**
 * SeekerProfile — DESIGN.md "Disciplined warmth"
 *
 * Profile editing with tabs: Personal / Resume / Location / Skills.
 * Saffron primary CTAs, hairline tab indicator, BMW field labels.
 */

import React, { useState } from "react";
import { useForm } from "react-hook-form";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { motion, LayoutGroup } from "framer-motion";
import toast from "react-hot-toast";
import {
  UserIcon,
  DocumentTextIcon,
  MapPinIcon,
  BriefcaseIcon,
  CameraIcon,
  PencilIcon,
  CheckIcon,
  XMarkIcon,
  CheckBadgeIcon,
  ArrowTopRightOnSquareIcon,
} from "@heroicons/react/24/outline";

import Navbar from "../../components/layout/Navbar";
import Sidebar from "../../components/layout/Sidebar";
import LoadingSpinner from "../../components/layout/LoadingSpinner";
import { userAPI } from "../../api/user.api";
import { useAuth } from "../../context/AuthContext";
import { GUJARAT_CITIES, QUALIFICATIONS } from "../../utils/constants";
import { getInitials } from "../../utils/helpers";

const TABS = [
  { id: "personal", label: "Personal", icon: UserIcon },
  { id: "resume", label: "Resume", icon: DocumentTextIcon },
  { id: "location", label: "Location", icon: MapPinIcon },
  { id: "skills", label: "Skills", icon: BriefcaseIcon },
];

export default function SeekerProfile() {
  const { user, updateUser } = useAuth();
  const qc = useQueryClient();
  const [activeTab, setActiveTab] = useState("personal");
  const [isEditingSkills, setIsEditingSkills] = useState(false);
  const [skillInput, setSkillInput] = useState("");
  const [skills, setSkills] = useState(user?.skills || []);

  const {
    register: rPersonal,
    handleSubmit: submitPersonal,
    formState: { errors: errorsP },
  } = useForm({
    defaultValues: {
      name: user?.name || "",
      phone: user?.phone || "",
      bio: user?.bio || "",
      experience: user?.experience || 0,
      qualification: user?.qualification || "",
      expectedSalary: user?.expectedSalary || "",
    },
  });

  const { register: rLocation, handleSubmit: submitLocation } = useForm({
    defaultValues: {
      city: user?.location?.city || "",
      state: "Gujarat",
      pincode: user?.location?.pincode || "",
    },
  });

  const updateProfile = useMutation({
    mutationFn: userAPI.updateProfile,
    onSuccess: (data) => {
      updateUser(data.user);
      qc.invalidateQueries(["profile"]);
      toast.success("Profile updated");
    },
    onError: () => toast.error("Failed to update profile"),
  });

  const updateLocation = useMutation({
    mutationFn: userAPI.updateLocation,
    onSuccess: (data) => {
      updateUser({ location: data.location });
      toast.success("Location updated");
    },
    onError: () => toast.error("Failed to update location"),
  });

  const uploadResume = useMutation({
    mutationFn: userAPI.uploadResume,
    onSuccess: (data) => {
      updateUser({ resume: data.resume });
      toast.success("Resume uploaded");
    },
    onError: () => toast.error("Failed to upload resume"),
  });

  const uploadPic = useMutation({
    mutationFn: userAPI.uploadProfilePic,
    onSuccess: (data) => {
      updateUser({ profilePic: data.profilePic });
      toast.success("Profile picture updated");
    },
    onError: () => toast.error("Failed to upload picture"),
  });

  const handleAddSkill = () => {
    const trimmed = skillInput.trim();
    if (trimmed && !skills.includes(trimmed)) {
      setSkills([...skills, trimmed]);
      setSkillInput("");
    }
  };

  const handleSaveSkills = () => {
    updateProfile.mutate({ skills });
    setIsEditingSkills(false);
  };

  return (
    <div className="min-h-screen flex flex-col bg-canvas">
      <Navbar />
      <div className="flex flex-1">
        <Sidebar />
        <main className="flex-1 p-6 lg:p-10 bg-canvas-warm">
          <div className="max-w-3xl">
            <div className="text-[13px] font-bold tracking-[0.15em] uppercase text-saffron mb-3">
              Profile
            </div>
            <h1 className="text-3xl lg:text-4xl font-bold tracking-tighter text-ink leading-tight mb-8">
              Tell recruiters who you are.
            </h1>

            {/* Profile header card */}
            <div className="bg-canvas border border-hairline rounded-xl p-6 mb-6">
              <div className="flex items-center gap-5">
                <div className="relative">
                  <div className="w-20 h-20 rounded-xl bg-saffron text-on-primary flex items-center justify-center text-2xl font-bold overflow-hidden">
                    {user?.profilePic ? (
                      <img src={user.profilePic} alt={user.name} className="w-full h-full object-cover" />
                    ) : (
                      getInitials(user?.name)
                    )}
                  </div>
                  <label className="absolute -bottom-1 -right-1 w-7 h-7 bg-ink text-on-dark rounded-full flex items-center justify-center cursor-pointer hover:bg-saffron transition-colors">
                    <CameraIcon className="h-3.5 w-3.5 stroke-[1.5]" />
                    <input
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={(e) => {
                        if (e.target.files[0]) uploadPic.mutate(e.target.files[0]);
                      }}
                    />
                  </label>
                </div>
                <div className="flex-1 min-w-0">
                  <h2 className="text-xl font-bold tracking-tight text-ink">{user?.name}</h2>
                  <p className="text-sm text-body truncate">{user?.email}</p>
                  <div className="flex items-center gap-3 mt-1.5 flex-wrap">
                    {user?.location?.city && (
                      <span className="text-xs text-saffron font-bold uppercase tracking-wider inline-flex items-center gap-1">
                        <MapPinIcon className="h-3.5 w-3.5" />
                        {user.location.city}
                      </span>
                    )}
                    {user?.isVerified && (
                      <span className="text-xs text-success font-bold uppercase tracking-wider inline-flex items-center gap-1">
                        <CheckBadgeIcon className="h-3.5 w-3.5" />
                        Verified
                      </span>
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* Tabs */}
            <LayoutGroup>
              <div className="flex gap-1 border-b border-hairline mb-6 overflow-x-auto scrollbar-hide">
                {TABS.map(({ id, label, icon: Icon }) => (
                  <button
                    key={id}
                    onClick={() => setActiveTab(id)}
                    className={`relative px-5 py-3 text-sm font-bold tracking-tight inline-flex items-center gap-2 whitespace-nowrap transition-colors ${
                      activeTab === id ? "text-saffron" : "text-muted-text hover:text-ink"
                    }`}
                  >
                    <Icon className="h-4 w-4 stroke-[1.5]" />
                    {label}
                    {activeTab === id && (
                      <motion.div
                        layoutId="profile-tab-indicator"
                        className="absolute left-0 right-0 -bottom-px h-[2px] bg-saffron"
                      />
                    )}
                  </button>
                ))}
              </div>
            </LayoutGroup>

            {/* Tab content */}
            <div className="bg-canvas border border-hairline rounded-xl p-6">
              {activeTab === "personal" && (
                <form onSubmit={submitPersonal((d) => updateProfile.mutate({ ...d, skills }))} className="space-y-5">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                    <Field label="Full name" error={errorsP.name?.message}>
                      <input
                        {...rPersonal("name", { required: "Name is required" })}
                        placeholder="Your full name"
                        className={inputClass(!!errorsP.name)}
                      />
                    </Field>
                    <Field label="Phone">
                      <input
                        {...rPersonal("phone")}
                        placeholder="9876543210"
                        className={inputClass(false)}
                      />
                    </Field>
                    <Field label="Experience (years)">
                      <input
                        type="number"
                        min="0"
                        max="50"
                        {...rPersonal("experience")}
                        placeholder="0"
                        className={inputClass(false)}
                      />
                    </Field>
                    <Field label="Qualification">
                      <select {...rPersonal("qualification")} className={inputClass(false)}>
                        <option value="">Select</option>
                        {QUALIFICATIONS.map((q) => (
                          <option key={q.value} value={q.value}>{q.label}</option>
                        ))}
                      </select>
                    </Field>
                    <Field label="Expected salary (monthly)">
                      <div className="relative">
                        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-soft text-sm">₹</span>
                        <input
                          type="number"
                          {...rPersonal("expectedSalary")}
                          placeholder="25000"
                          className={inputClass(false) + " pl-7"}
                        />
                      </div>
                    </Field>
                  </div>
                  <Field label="Bio / summary">
                    <textarea
                      {...rPersonal("bio")}
                      rows={4}
                      placeholder="Tell recruiters about yourself..."
                      maxLength={500}
                      className={inputClass(false) + " resize-none"}
                    />
                  </Field>
                  <SubmitButton pending={updateProfile.isPending}>Save changes</SubmitButton>
                </form>
              )}

              {activeTab === "resume" && (
                <div>
                  {user?.resume?.url ? (
                    <div className="bg-success-soft border border-success/20 rounded-lg p-4 mb-5 flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <DocumentTextIcon className="h-6 w-6 text-success stroke-[1.5]" />
                        <div>
                          <p className="font-bold tracking-tight text-ink text-sm">{user.resume.filename}</p>
                          <p className="text-xs text-success">
                            Uploaded {new Date(user.resume.uploadedAt).toLocaleDateString("en-IN")}
                          </p>
                        </div>
                      </div>
                      <a
                        href={user.resume.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-sm font-bold text-saffron hover:underline inline-flex items-center gap-1.5"
                      >
                        Preview
                        <ArrowTopRightOnSquareIcon className="h-3.5 w-3.5" />
                      </a>
                    </div>
                  ) : (
                    <div className="border-2 border-dashed border-hairline-strong rounded-xl p-10 text-center mb-5">
                      <DocumentTextIcon className="h-12 w-12 text-muted-soft stroke-[1.5] mx-auto mb-4" />
                      <p className="text-ink font-bold tracking-tight">No resume uploaded</p>
                      <p className="text-sm text-body mt-1">Upload your resume to apply to jobs</p>
                    </div>
                  )}
                  <label className={`inline-flex items-center gap-2 ${uploadResume.isPending ? "opacity-50 cursor-wait" : "cursor-pointer"}`}>
                    <span className="bg-saffron text-on-primary uppercase font-bold tracking-[0.05em] text-xs px-5 h-10 inline-flex items-center gap-2 hover:bg-saffron-active transition-colors">
                      {uploadResume.isPending ? (
                        <LoadingSpinner size="sm" className="border-on-primary" />
                      ) : (
                        <DocumentTextIcon className="h-3.5 w-3.5" />
                      )}
                      {user?.resume?.url ? "Replace resume" : "Upload resume"}
                    </span>
                    <input
                      type="file"
                      accept=".pdf,.doc,.docx"
                      className="hidden"
                      onChange={(e) => {
                        if (e.target.files[0]) uploadResume.mutate(e.target.files[0]);
                      }}
                      disabled={uploadResume.isPending}
                    />
                  </label>
                  <p className="text-xs text-muted-text mt-3">
                    Supported: PDF, DOC, DOCX. Max size: 5MB.
                  </p>
                </div>
              )}

              {activeTab === "location" && (
                <form onSubmit={submitLocation((d) => updateLocation.mutate(d))} className="space-y-5">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                    <Field label="City in Gujarat">
                      <select
                        {...rLocation("city", { required: "City is required" })}
                        className={inputClass(false)}
                      >
                        <option value="">Select your city</option>
                        {GUJARAT_CITIES.map((city) => (
                          <option key={city} value={city}>{city}</option>
                        ))}
                      </select>
                    </Field>
                    <Field label="Pincode">
                      <input
                        {...rLocation("pincode")}
                        placeholder="380001"
                        className={inputClass(false)}
                      />
                    </Field>
                  </div>
                  <p className="text-sm text-body bg-canvas-warm border border-hairline rounded-lg p-3">
                    GujaratJobs currently serves Gujarat only. Setting your city
                    helps us show local walk-ins and jobs.
                  </p>
                  <SubmitButton pending={updateLocation.isPending}>Save location</SubmitButton>
                </form>
              )}

              {activeTab === "skills" && (
                <div>
                  <div className="flex items-center justify-between mb-5">
                    <p className="text-sm text-body">
                      Add skills to improve your visibility to recruiters.
                    </p>
                    {!isEditingSkills ? (
                      <button
                        onClick={() => setIsEditingSkills(true)}
                        className="text-sm font-bold text-saffron hover:underline inline-flex items-center gap-1.5"
                      >
                        <PencilIcon className="h-4 w-4" />
                        Edit
                      </button>
                    ) : (
                      <button
                        onClick={handleSaveSkills}
                        className="bg-saffron text-on-primary uppercase font-bold tracking-[0.05em] text-xs px-4 h-9 inline-flex items-center gap-1.5 hover:bg-saffron-active transition-colors"
                      >
                        <CheckIcon className="h-3.5 w-3.5" />
                        Save
                      </button>
                    )}
                  </div>

                  <div className="flex flex-wrap gap-2 mb-5">
                    {skills.map((skill) => (
                      <span
                        key={skill}
                        className="bg-canvas-warm border border-hairline text-ink px-3 py-1.5 rounded-md text-sm font-bold tracking-tight inline-flex items-center gap-2"
                      >
                        {skill}
                        {isEditingSkills && (
                          <button
                            onClick={() => setSkills(skills.filter((s) => s !== skill))}
                            className="text-muted-soft hover:text-error transition-colors"
                          >
                            <XMarkIcon className="h-3.5 w-3.5" />
                          </button>
                        )}
                      </span>
                    ))}
                    {skills.length === 0 && (
                      <p className="text-muted-text text-sm">No skills added yet.</p>
                    )}
                  </div>

                  {isEditingSkills && (
                    <div className="flex gap-2">
                      <input
                        type="text"
                        value={skillInput}
                        onChange={(e) => setSkillInput(e.target.value)}
                        onKeyDown={(e) => e.key === "Enter" && (e.preventDefault(), handleAddSkill())}
                        placeholder="Add a skill (e.g. React, Excel, Sales)"
                        className={inputClass(false) + " flex-1"}
                      />
                      <button
                        onClick={handleAddSkill}
                        className="bg-ink text-on-dark uppercase font-bold tracking-[0.05em] text-xs px-5 hover:bg-ink/90 active:scale-[0.98] transition-all"
                      >
                        Add
                      </button>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}

function Field({ label, error, children }) {
  return (
    <div>
      <label className="block text-[13px] font-bold tracking-[0.15em] uppercase text-ink mb-2">
        {label}
      </label>
      {children}
      {error && <p className="mt-1.5 text-xs text-error">{error}</p>}
    </div>
  );
}

function SubmitButton({ pending, children }) {
  return (
    <button
      type="submit"
      disabled={pending}
      className="bg-saffron text-on-primary uppercase font-bold tracking-[0.05em] text-sm px-6 h-10 inline-flex items-center gap-2 hover:bg-saffron-active active:scale-[0.98] transition-all duration-150 disabled:opacity-60"
    >
      {pending ? (
        <LoadingSpinner size="sm" className="border-on-primary" />
      ) : (
        <CheckIcon className="h-4 w-4" />
      )}
      {children}
    </button>
  );
}

function inputClass(hasError) {
  return `w-full px-3.5 py-2.5 border rounded-lg text-sm bg-canvas focus:outline-none focus:ring-1 transition-all ${
    hasError
      ? "border-error focus:ring-error/30"
      : "border-hairline focus:border-saffron focus:ring-saffron/30"
  }`;
}
