import React, { useEffect, useState, useCallback } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import {
  EyeIcon,
  EyeSlashIcon,
  BriefcaseIcon,
  CheckCircleIcon,
  ArrowLeftIcon,
  SparklesIcon,
} from '@heroicons/react/24/outline';
import { useAuth } from '../context/AuthContext';

// login state machine: 'idle' | 'loading' | 'accountNotFound' | 'wrongPassword'

const BENEFITS = [
  { icon: '📋', text: 'Apply to 500+ Gujarat jobs with one click' },
  { icon: '🎯', text: 'Get matched with recruiters actively hiring' },
  { icon: '📊', text: 'Track every application in one place' },
];

const LoginPage = () => {
  const { login, isAuthenticated, user } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [showPassword, setShowPassword] = useState(false);
  const [loginState, setLoginState] = useState('idle'); // idle | loading | accountNotFound | wrongPassword
  const [attemptedEmail, setAttemptedEmail] = useState('');
  const [panelVisible, setPanelVisible] = useState(false);

  const from = location.state?.from || null;

  const { register, handleSubmit, formState: { errors }, setError, clearErrors } = useForm();

  useEffect(() => {
    if (isAuthenticated && user) {
      const dashboardMap = {
        jobseeker: '/dashboard',
        recruiter: '/recruiter/dashboard',
        admin: '/admin/dashboard',
      };
      navigate(from || dashboardMap[user.role] || '/', { replace: true });
    }
  }, [isAuthenticated, user, navigate, from]);

  // Trigger panel entrance animation after state change
  useEffect(() => {
    if (loginState === 'accountNotFound') {
      // small delay lets the form fade out first
      const t = setTimeout(() => setPanelVisible(true), 50);
      return () => clearTimeout(t);
    } else {
      setPanelVisible(false);
    }
  }, [loginState]);

  const onSubmit = useCallback(async (data) => {
    clearErrors();
    setLoginState('loading');
    setAttemptedEmail(data.email);

    const result = await login(data.email, data.password);

    if (result.success) {
      setLoginState('idle');
      return;
    }

    const errorCode = result.errorCode;

    if (errorCode === 'Account Not Found') {
      setLoginState('accountNotFound');
    } else if (errorCode === 'Wrong Password') {
      setLoginState('wrongPassword');
      setError('password', {
        type: 'manual',
        message: "That password doesn't match. Please try again.",
      });
    } else {
      setLoginState('idle');
    }
  }, [login, clearErrors, setError]);

  const handleBackToLogin = () => {
    setPanelVisible(false);
    setTimeout(() => setLoginState('idle'), 250);
  };

  const handleSignUp = () => {
    navigate('/register', { state: { prefillEmail: attemptedEmail } });
  };

  const isFormHidden = loginState === 'accountNotFound';
  const isLoading = loginState === 'loading';

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      {/* Header */}
      <div className="px-6 py-4">
        <Link to="/" className="flex items-center gap-2 w-fit">
          <div className="w-8 h-8 bg-primary-600 rounded-lg flex items-center justify-center">
            <BriefcaseIcon className="h-5 w-5 text-white" />
          </div>
          <span className="font-bold text-xl text-gray-900">
            Gujarat<span className="text-primary-600">Jobs</span>
          </span>
        </Link>
      </div>

      <div className="flex-1 flex items-center justify-center px-4 py-12">
        <div className="w-full max-w-md">

          {/* ── ACCOUNT NOT FOUND PANEL ─────────────────────────────── */}
          <div
            className={[
              'bg-white rounded-2xl shadow-card p-8 transition-all duration-300',
              isFormHidden ? 'block' : 'hidden',
              panelVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4',
            ].join(' ')}
            role="alert"
            aria-live="polite"
          >
            {/* Icon badge */}
            <div className="flex justify-center mb-5">
              <div className="w-16 h-16 rounded-2xl bg-primary-50 flex items-center justify-center">
                <SparklesIcon className="h-8 w-8 text-primary-600" />
              </div>
            </div>

            {/* Headline */}
            <div className="text-center mb-2">
              <h1 className="text-2xl font-bold text-gray-900">Looks like you're new here!</h1>
              <p className="text-gray-500 mt-1 text-sm">
                No account found for{' '}
                <span className="font-semibold text-gray-700 break-all">{attemptedEmail}</span>
              </p>
            </div>

            {/* Friendly nudge */}
            <p className="text-center text-sm text-gray-500 mb-6">
              No worries — it takes less than a minute to get started.
            </p>

            {/* Benefits */}
            <ul className="space-y-3 mb-7">
              {BENEFITS.map((b, i) => (
                <li
                  key={i}
                  className={[
                    'flex items-center gap-3 text-sm text-gray-700 transition-all duration-300',
                    panelVisible
                      ? 'opacity-100 translate-x-0'
                      : 'opacity-0 -translate-x-3',
                  ].join(' ')}
                  style={{ transitionDelay: panelVisible ? `${100 + i * 60}ms` : '0ms' }}
                >
                  <CheckCircleIcon className="h-5 w-5 text-primary-500 shrink-0" />
                  <span>{b.text}</span>
                </li>
              ))}
            </ul>

            {/* Primary CTA */}
            <button
              onClick={handleSignUp}
              className={[
                'w-full py-3 px-4 rounded-xl font-semibold text-white text-base',
                'bg-primary-600 hover:bg-primary-700 active:scale-[0.98]',
                'transition-all duration-200 cursor-pointer',
                'focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2',
                panelVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-2',
              ].join(' ')}
              style={{ transitionDelay: panelVisible ? '280ms' : '0ms' }}
            >
              Create free account →
            </button>

            {/* Secondary — back to login */}
            <button
              onClick={handleBackToLogin}
              className="mt-4 w-full flex items-center justify-center gap-1.5 text-sm text-gray-500 hover:text-gray-700 transition-colors duration-150 cursor-pointer"
            >
              <ArrowLeftIcon className="h-4 w-4" />
              Try a different email
            </button>
          </div>

          {/* ── LOGIN FORM ───────────────────────────────────────────── */}
          <div
            className={[
              'transition-all duration-250',
              isFormHidden ? 'hidden' : 'block',
            ].join(' ')}
          >
            <div className="bg-white rounded-2xl shadow-card p-8">
              <div className="text-center mb-8">
                <h1 className="text-2xl font-bold text-gray-900">Welcome back!</h1>
                <p className="text-gray-500 mt-1">Sign in to your GujaratJobs account</p>
              </div>

              <form onSubmit={handleSubmit(onSubmit)} className="space-y-4" noValidate>
                {/* Email */}
                <div>
                  <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
                    Email Address
                  </label>
                  <input
                    id="email"
                    type="email"
                    {...register('email', {
                      required: 'Email is required',
                      pattern: { value: /^\S+@\S+\.\S+$/, message: 'Enter a valid email' },
                    })}
                    className={[
                      'input',
                      errors.email ? 'border-red-400 focus:ring-red-300' : '',
                    ].join(' ')}
                    placeholder="you@example.com"
                    autoComplete="email"
                    disabled={isLoading}
                  />
                  {errors.email && (
                    <p className="mt-1 text-xs text-red-500" role="alert">{errors.email.message}</p>
                  )}
                </div>

                {/* Password */}
                <div>
                  <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1">
                    Password
                  </label>
                  <div className="relative">
                    <input
                      id="password"
                      type={showPassword ? 'text' : 'password'}
                      {...register('password', { required: 'Password is required' })}
                      className={[
                        'input pr-10',
                        errors.password && loginState === 'wrongPassword'
                          ? 'border-amber-400 focus:ring-amber-300'
                          : errors.password ? 'border-red-400 focus:ring-red-300' : '',
                      ].join(' ')}
                      placeholder="Enter your password"
                      autoComplete="current-password"
                      disabled={isLoading}
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword((v) => !v)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 cursor-pointer"
                      aria-label={showPassword ? 'Hide password' : 'Show password'}
                    >
                      {showPassword ? <EyeSlashIcon className="h-5 w-5" /> : <EyeIcon className="h-5 w-5" />}
                    </button>
                  </div>
                  {errors.password && (
                    <p
                      className={[
                        'mt-1 text-xs',
                        loginState === 'wrongPassword' ? 'text-amber-600' : 'text-red-500',
                      ].join(' ')}
                      role="alert"
                    >
                      {errors.password.message}
                    </p>
                  )}
                </div>

                <div className="flex items-center justify-between">
                  <label className="flex items-center gap-2 cursor-pointer select-none">
                    <input type="checkbox" className="rounded text-primary-600" />
                    <span className="text-sm text-gray-600">Remember me</span>
                  </label>
                  <Link
                    to="/forgot-password"
                    className="text-sm text-primary-600 hover:text-primary-700 font-medium"
                  >
                    Forgot password?
                  </Link>
                </div>

                <button
                  type="submit"
                  disabled={isLoading}
                  className="btn-primary w-full py-3 text-base disabled:opacity-60 disabled:cursor-not-allowed cursor-pointer"
                >
                  {isLoading ? (
                    <span className="flex items-center justify-center gap-2">
                      <span
                        className="animate-spin h-5 w-5 border-2 border-white border-t-transparent rounded-full"
                        aria-hidden="true"
                      />
                      Signing in…
                    </span>
                  ) : (
                    'Sign In'
                  )}
                </button>
              </form>

              <div className="mt-6 text-center">
                <p className="text-sm text-gray-600">
                  Don't have an account?{' '}
                  <Link to="/register" className="text-primary-600 hover:text-primary-700 font-semibold">
                    Sign up for free
                  </Link>
                </p>
              </div>
            </div>

            {/* Demo credentials */}
            <div className="mt-4 bg-blue-50 border border-blue-200 rounded-xl p-4">
              <p className="text-xs font-semibold text-blue-700 mb-2">Demo Credentials</p>
              <div className="space-y-1 text-xs text-blue-600">
                <p>Job Seeker: seeker@demo.com / demo123</p>
                <p>Recruiter: recruiter@demo.com / demo123</p>
                <p>Admin: admin@gujaratjobs.in / Admin@123456</p>
              </div>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
};

export default LoginPage;
