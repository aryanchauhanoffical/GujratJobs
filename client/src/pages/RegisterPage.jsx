/**
 * RegisterPage — DESIGN.md "Disciplined warmth"
 *
 * Mirror of LoginPage layout: form left, value-prop right. Role
 * selector with sharp-cornered animated cards.
 */

import React, { useState } from "react";
import { Link, useNavigate, useSearchParams, useLocation } from "react-router-dom";
import { useForm } from "react-hook-form";
import { motion, LayoutGroup } from "framer-motion";
import {
  EyeIcon,
  EyeSlashIcon,
  UserIcon,
  BuildingOfficeIcon,
  CheckCircleIcon,
} from "@heroicons/react/24/outline";

import { useAuth } from "../context/AuthContext";
import { easeOutCirc } from "../lib/motion";

const SEEKER_BENEFITS = [
  "Apply to verified Gujarat jobs in one click",
  "Real-time alerts for walk-in drives in your city",
  "Track every application status",
];
const RECRUITER_BENEFITS = [
  "Reach freshers actively looking in your city",
  "Verified-recruiter badge on every listing",
  "Built-in shortlisting and applicant tracking",
];

export default function RegisterPage() {
  const { register: authRegister } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [searchParams] = useSearchParams();
  const defaultRole = searchParams.get("role") || "jobseeker";
  const prefillEmail = location.state?.prefillEmail || "";

  const [role, setRole] = useState(defaultRole);
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm({
    defaultValues: { role: defaultRole, email: prefillEmail },
  });

  const onSubmit = async (data) => {
    setIsLoading(true);
    const result = await authRegister({ ...data, role });
    if (result.success) {
      const map = {
        jobseeker: "/dashboard",
        recruiter: "/recruiter/dashboard",
      };
      navigate(map[role] || "/");
    } else {
      setIsLoading(false);
    }
  };

  const benefits = role === "recruiter" ? RECRUITER_BENEFITS : SEEKER_BENEFITS;

  return (
    <div className="min-h-screen bg-canvas flex flex-col">
      <header className="px-6 py-5 border-b border-hairline">
        <Link
          to="/"
          className="font-bold text-lg tracking-tight text-ink hover:text-saffron transition-colors"
        >
          Gujarat<span className="text-saffron">Jobs</span>
        </Link>
      </header>

      <div className="flex-1 grid grid-cols-1 lg:grid-cols-2">
        {/* Form column */}
        <div className="flex items-start lg:items-center justify-center px-6 py-10 lg:py-16 order-2 lg:order-1">
          <div className="w-full max-w-md">
            <div className="text-[13px] font-bold tracking-[0.15em] uppercase text-saffron mb-3">
              Create account
            </div>
            <h1 className="text-3xl lg:text-4xl font-bold tracking-tighter text-ink leading-[1.1]">
              Get started in under a minute.
            </h1>
            <p className="text-body mt-4">
              Already have an account?{" "}
              <Link to="/login" className="text-saffron font-bold hover:underline">
                Sign in
              </Link>
            </p>

            {/* Role selector */}
            <LayoutGroup>
              <div className="mt-7 grid grid-cols-2 gap-3">
                <RoleCard
                  active={role === "jobseeker"}
                  onClick={() => setRole("jobseeker")}
                  icon={UserIcon}
                  title="Job seeker"
                  subtitle="Find jobs"
                />
                <RoleCard
                  active={role === "recruiter"}
                  onClick={() => setRole("recruiter")}
                  icon={BuildingOfficeIcon}
                  title="Recruiter"
                  subtitle="Hire talent"
                />
              </div>
            </LayoutGroup>

            <form onSubmit={handleSubmit(onSubmit)} className="mt-7 space-y-4" noValidate>
              <Field label="Full name" error={errors.name?.message}>
                <input
                  type="text"
                  {...register("name", {
                    required: "Name is required",
                    minLength: { value: 2, message: "Name must be at least 2 characters" },
                  })}
                  placeholder="Your full name"
                  className={inputClass(!!errors.name)}
                />
              </Field>

              <Field label="Email" error={errors.email?.message}>
                <input
                  type="email"
                  {...register("email", {
                    required: "Email is required",
                    pattern: { value: /^\S+@\S+\.\S+$/, message: "Enter a valid email" },
                  })}
                  placeholder="you@example.com"
                  className={inputClass(!!errors.email)}
                />
              </Field>

              <Field label="Phone" error={errors.phone?.message}>
                <input
                  type="tel"
                  {...register("phone", {
                    pattern: { value: /^[6-9]\d{9}$/, message: "Enter a valid 10-digit number" },
                  })}
                  placeholder="9876543210"
                  className={inputClass(!!errors.phone)}
                />
              </Field>

              {role === "recruiter" && (
                <Field label="Company name" error={errors.companyName?.message}>
                  <input
                    type="text"
                    {...register("companyName", {
                      required: role === "recruiter" ? "Company name is required" : false,
                    })}
                    placeholder="Your company name"
                    className={inputClass(!!errors.companyName)}
                  />
                </Field>
              )}

              <Field label="Password" error={errors.password?.message}>
                <div className="relative">
                  <input
                    type={showPassword ? "text" : "password"}
                    {...register("password", {
                      required: "Password is required",
                      minLength: { value: 6, message: "Password must be at least 6 characters" },
                    })}
                    placeholder="Min 6 characters"
                    className={inputClass(!!errors.password) + " pr-10"}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-soft hover:text-ink transition-colors"
                  >
                    {showPassword ? (
                      <EyeSlashIcon className="h-5 w-5" />
                    ) : (
                      <EyeIcon className="h-5 w-5" />
                    )}
                  </button>
                </div>
              </Field>

              <div className="flex items-start gap-2.5 pt-2">
                <input
                  type="checkbox"
                  id="terms"
                  {...register("terms", { required: "You must accept the terms" })}
                  className="mt-1 rounded text-saffron focus:ring-saffron border-hairline-strong"
                />
                <label htmlFor="terms" className="text-sm text-body">
                  I agree to the{" "}
                  <a href="#" className="text-saffron font-bold hover:underline">
                    Terms
                  </a>{" "}
                  and{" "}
                  <a href="#" className="text-saffron font-bold hover:underline">
                    Privacy Policy
                  </a>
                </label>
              </div>
              {errors.terms && (
                <p className="text-xs text-error" role="alert">
                  {errors.terms.message}
                </p>
              )}

              <button
                type="submit"
                disabled={isLoading}
                className="w-full bg-saffron text-on-primary uppercase font-bold tracking-[0.05em] text-sm py-3.5 hover:bg-saffron-active active:scale-[0.98] transition-all duration-150 disabled:opacity-60 disabled:cursor-not-allowed inline-flex items-center justify-center gap-2"
              >
                {isLoading ? (
                  <>
                    <span className="animate-spin h-4 w-4 border-2 border-on-primary/40 border-t-on-primary rounded-full" />
                    Creating account
                  </>
                ) : (
                  `Create ${role === "recruiter" ? "recruiter" : "job seeker"} account`
                )}
              </button>
            </form>
          </div>
        </div>

        {/* Value-prop column */}
        <div className="bg-canvas-warm flex items-center justify-center px-6 py-16 order-1 lg:order-2 border-b lg:border-b-0 lg:border-l border-hairline">
          <motion.div
            key={role}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, ease: easeOutCirc }}
            className="max-w-md"
          >
            <div className="text-[13px] font-bold tracking-[0.15em] uppercase text-saffron mb-4">
              {role === "recruiter" ? "For recruiters" : "For freshers"}
            </div>
            <h2 className="text-3xl lg:text-4xl font-bold tracking-tighter leading-[1.1] text-ink">
              {role === "recruiter" ? (
                <>
                  Reach the right talent in{" "}
                  <span className="text-saffron">your city.</span>
                </>
              ) : (
                <>
                  Stop applying.{" "}
                  <span className="text-saffron">Start interviewing.</span>
                </>
              )}
            </h2>
            <p className="text-body mt-6 leading-relaxed">
              {role === "recruiter"
                ? "Post your job and reach verified Gujarat candidates within minutes. No noise from other regions, no inflated funnels."
                : "Walk-in drives in your city, pushed to your phone the moment they go live. Real recruiters. Real interviews."}
            </p>
            <ul className="mt-8 space-y-3">
              {benefits.map((b, i) => (
                <li key={i} className="flex items-center gap-3 text-sm text-body">
                  <CheckCircleIcon className="h-5 w-5 text-saffron stroke-[1.5] shrink-0" />
                  {b}
                </li>
              ))}
            </ul>
          </motion.div>
        </div>
      </div>
    </div>
  );
}

function RoleCard({ active, onClick, icon: Icon, title, subtitle }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`relative p-5 rounded-xl border-2 transition-colors text-left ${
        active
          ? "border-saffron bg-saffron/5"
          : "border-hairline bg-canvas hover:border-hairline-strong"
      }`}
    >
      {active && (
        <motion.div
          layoutId="role-indicator"
          className="absolute top-3 right-3 w-2 h-2 rounded-full bg-saffron"
        />
      )}
      <Icon
        className={`h-6 w-6 stroke-[1.5] ${
          active ? "text-saffron" : "text-muted-soft"
        }`}
      />
      <p className="mt-3 font-bold tracking-tight text-sm text-ink">{title}</p>
      <p className="text-xs text-muted-text mt-0.5">{subtitle}</p>
    </button>
  );
}

function Field({ label, error, children }) {
  return (
    <div>
      <label className="block text-[13px] font-bold tracking-[0.15em] uppercase text-ink mb-2">
        {label}
      </label>
      {children}
      {error && (
        <p className="mt-1.5 text-xs text-error" role="alert">
          {error}
        </p>
      )}
    </div>
  );
}

function inputClass(hasError) {
  return `w-full px-3.5 py-3 border rounded-lg text-sm bg-canvas focus:outline-none focus:ring-1 transition-all ${
    hasError
      ? "border-error focus:ring-error/30"
      : "border-hairline focus:border-saffron focus:ring-saffron/30"
  }`;
}
