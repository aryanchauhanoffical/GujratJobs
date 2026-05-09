/**
 * LoginPage — DESIGN.md "Disciplined warmth"
 *
 * Split layout: form left, value-prop right (cream canvas). BMW-clean
 * with state machine for account-not-found / wrong-password.
 */

import React, { useEffect, useState, useCallback } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { useForm } from "react-hook-form";
import { motion, AnimatePresence } from "framer-motion";
import {
  EyeIcon,
  EyeSlashIcon,
  CheckCircleIcon,
  ArrowLeftIcon,
} from "@heroicons/react/24/outline";

import { useAuth } from "../context/AuthContext";
import { easeOutCirc } from "../lib/motion";

const BENEFITS = [
  "Apply to verified Gujarat jobs with one click",
  "Get matched with recruiters actively hiring",
  "Track every application in one place",
];

export default function LoginPage() {
  const { login, isAuthenticated, user } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [showPassword, setShowPassword] = useState(false);
  const [loginState, setLoginState] = useState("idle");
  const [attemptedEmail, setAttemptedEmail] = useState("");

  const from = location.state?.from || null;

  const {
    register,
    handleSubmit,
    formState: { errors },
    setError,
    clearErrors,
  } = useForm();

  useEffect(() => {
    if (isAuthenticated && user) {
      const dashboardMap = {
        jobseeker: "/dashboard",
        recruiter: "/recruiter/dashboard",
        admin: "/admin/dashboard",
      };
      navigate(from || dashboardMap[user.role] || "/", { replace: true });
    }
  }, [isAuthenticated, user, navigate, from]);

  const onSubmit = useCallback(
    async (data) => {
      clearErrors();
      setLoginState("loading");
      setAttemptedEmail(data.email);

      const result = await login(data.email, data.password);
      if (result.success) {
        setLoginState("idle");
        return;
      }

      const errorCode = result.errorCode;
      if (errorCode === "Account Not Found") {
        setLoginState("accountNotFound");
      } else if (errorCode === "Wrong Password") {
        setLoginState("wrongPassword");
        setError("password", {
          type: "manual",
          message: "That password doesn't match. Please try again.",
        });
      } else {
        setLoginState("idle");
      }
    },
    [login, clearErrors, setError],
  );

  const isLoading = loginState === "loading";
  const isAccountNotFound = loginState === "accountNotFound";

  return (
    <div className="min-h-screen bg-canvas flex flex-col">
      {/* Top bar */}
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
        <div className="flex items-center justify-center px-6 py-16 order-2 lg:order-1">
          <div className="w-full max-w-md">
            <AnimatePresence mode="wait">
              {isAccountNotFound ? (
                <motion.div
                  key="not-found"
                  initial={{ opacity: 0, y: 16 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -8 }}
                  transition={{ duration: 0.25, ease: easeOutCirc }}
                  className="bg-canvas border border-hairline rounded-xl p-8"
                >
                  <div className="text-[13px] font-bold tracking-[0.15em] uppercase text-saffron mb-3">
                    New here?
                  </div>
                  <h1 className="text-3xl font-bold tracking-tight text-ink leading-tight">
                    Looks like you don't have an account yet.
                  </h1>
                  <p className="text-body mt-4 leading-relaxed">
                    No account found for{" "}
                    <span className="font-bold text-ink">{attemptedEmail}</span>.
                    It takes less than a minute to get started.
                  </p>

                  <ul className="mt-7 space-y-3">
                    {BENEFITS.map((b, i) => (
                      <motion.li
                        key={i}
                        initial={{ opacity: 0, x: -8 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ duration: 0.25, delay: 0.1 + i * 0.06 }}
                        className="flex items-center gap-3 text-sm text-body"
                      >
                        <CheckCircleIcon className="h-5 w-5 text-success stroke-[1.5] shrink-0" />
                        {b}
                      </motion.li>
                    ))}
                  </ul>

                  <button
                    onClick={() =>
                      navigate("/register", {
                        state: { prefillEmail: attemptedEmail },
                      })
                    }
                    className="mt-8 w-full bg-saffron text-on-primary uppercase font-bold tracking-[0.05em] text-sm py-3.5 hover:bg-saffron-active active:scale-[0.98] transition-all duration-150"
                  >
                    Create free account
                  </button>
                  <button
                    onClick={() => setLoginState("idle")}
                    className="mt-4 w-full inline-flex items-center justify-center gap-1.5 text-sm font-bold text-muted-text hover:text-ink transition-colors"
                  >
                    <ArrowLeftIcon className="h-4 w-4" />
                    Try a different email
                  </button>
                </motion.div>
              ) : (
                <motion.div
                  key="login"
                  initial={{ opacity: 0, y: 16 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -8 }}
                  transition={{ duration: 0.25, ease: easeOutCirc }}
                >
                  <div className="text-[13px] font-bold tracking-[0.15em] uppercase text-saffron mb-3">
                    Welcome back
                  </div>
                  <h1 className="text-3xl lg:text-4xl font-bold tracking-tighter text-ink leading-[1.1]">
                    Sign in to find your next walk-in.
                  </h1>
                  <p className="text-body mt-4">
                    Don't have an account?{" "}
                    <Link
                      to="/register"
                      className="text-saffron font-bold hover:underline"
                    >
                      Sign up free
                    </Link>
                  </p>

                  <form onSubmit={handleSubmit(onSubmit)} className="mt-8 space-y-5" noValidate>
                    <FormField
                      label="Email"
                      htmlFor="email"
                      error={errors.email?.message}
                    >
                      <input
                        id="email"
                        type="email"
                        {...register("email", {
                          required: "Email is required",
                          pattern: { value: /^\S+@\S+\.\S+$/, message: "Enter a valid email" },
                        })}
                        placeholder="you@example.com"
                        autoComplete="email"
                        disabled={isLoading}
                        className={`w-full px-3.5 py-3 border rounded-lg text-sm bg-canvas focus:outline-none focus:ring-1 transition-all ${
                          errors.email
                            ? "border-error focus:ring-error/30"
                            : "border-hairline focus:border-saffron focus:ring-saffron/30"
                        }`}
                      />
                    </FormField>

                    <FormField
                      label="Password"
                      htmlFor="password"
                      error={errors.password?.message}
                      errorTone={loginState === "wrongPassword" ? "warning" : "error"}
                      action={
                        <Link
                          to="/forgot-password"
                          className="text-xs font-bold text-saffron hover:underline"
                        >
                          Forgot?
                        </Link>
                      }
                    >
                      <div className="relative">
                        <input
                          id="password"
                          type={showPassword ? "text" : "password"}
                          {...register("password", { required: "Password is required" })}
                          placeholder="Enter your password"
                          autoComplete="current-password"
                          disabled={isLoading}
                          className={`w-full pl-3.5 pr-10 py-3 border rounded-lg text-sm bg-canvas focus:outline-none focus:ring-1 transition-all ${
                            errors.password
                              ? loginState === "wrongPassword"
                                ? "border-marigold focus:ring-marigold/30"
                                : "border-error focus:ring-error/30"
                              : "border-hairline focus:border-saffron focus:ring-saffron/30"
                          }`}
                        />
                        <button
                          type="button"
                          onClick={() => setShowPassword((v) => !v)}
                          className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-soft hover:text-ink transition-colors"
                          aria-label={showPassword ? "Hide password" : "Show password"}
                        >
                          {showPassword ? (
                            <EyeSlashIcon className="h-5 w-5" />
                          ) : (
                            <EyeIcon className="h-5 w-5" />
                          )}
                        </button>
                      </div>
                    </FormField>

                    <button
                      type="submit"
                      disabled={isLoading}
                      className="w-full bg-saffron text-on-primary uppercase font-bold tracking-[0.05em] text-sm py-3.5 hover:bg-saffron-active active:scale-[0.98] transition-all duration-150 disabled:opacity-60 disabled:cursor-not-allowed inline-flex items-center justify-center gap-2"
                    >
                      {isLoading ? (
                        <>
                          <span className="animate-spin h-4 w-4 border-2 border-on-primary/40 border-t-on-primary rounded-full" />
                          Signing in
                        </>
                      ) : (
                        "Sign in"
                      )}
                    </button>
                  </form>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>

        {/* Value-prop column (cream canvas) */}
        <div className="bg-canvas-warm flex items-center justify-center px-6 py-16 order-1 lg:order-2 border-b lg:border-b-0 lg:border-l border-hairline">
          <div className="max-w-md">
            <div className="text-[13px] font-bold tracking-[0.15em] uppercase text-saffron mb-4">
              Built for Gujarat freshers
            </div>
            <h2 className="text-3xl lg:text-4xl font-bold tracking-tighter leading-[1.1] text-ink">
              No ghost jobs.
              <br />
              <span className="text-saffron">Just walk-ins that work.</span>
            </h2>
            <p className="text-body text-base mt-6 leading-relaxed">
              We verify every recruiter before they post. We surface walk-in
              drives in real time. We started with Gujarat because trust is
              built locally.
            </p>
            <ul className="mt-8 space-y-3">
              {BENEFITS.map((b, i) => (
                <li key={i} className="flex items-center gap-3 text-sm text-body">
                  <CheckCircleIcon className="h-5 w-5 text-saffron stroke-[1.5] shrink-0" />
                  {b}
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}

function FormField({ label, htmlFor, error, errorTone = "error", action, children }) {
  return (
    <div>
      <div className="flex items-center justify-between mb-2">
        <label
          htmlFor={htmlFor}
          className="text-[13px] font-bold tracking-[0.15em] uppercase text-ink"
        >
          {label}
        </label>
        {action}
      </div>
      {children}
      {error && (
        <p
          role="alert"
          className={`mt-1.5 text-xs ${
            errorTone === "warning" ? "text-marigold" : "text-error"
          }`}
        >
          {error}
        </p>
      )}
    </div>
  );
}
