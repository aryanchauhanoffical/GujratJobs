import React, { useState } from 'react';
import { Link, useNavigate, useSearchParams, useLocation } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { EyeIcon, EyeSlashIcon, BriefcaseIcon, UserIcon, BuildingOfficeIcon } from '@heroicons/react/24/outline';
import { useAuth } from '../context/AuthContext';

const RegisterPage = () => {
  const { register: authRegister, isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [searchParams] = useSearchParams();
  const defaultRole = searchParams.get('role') || 'jobseeker';
  const prefillEmail = location.state?.prefillEmail || '';

  const [role, setRole] = useState(defaultRole);
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const { register, handleSubmit, formState: { errors }, watch } = useForm({
    defaultValues: { role: defaultRole, email: prefillEmail },
  });

  const onSubmit = async (data) => {
    setIsLoading(true);
    const result = await authRegister({ ...data, role });
    if (result.success) {
      const dashboardMap = {
        jobseeker: '/dashboard',
        recruiter: '/recruiter/dashboard',
      };
      navigate(dashboardMap[role] || '/');
    } else {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
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

      <div className="flex-1 flex items-center justify-center px-4 py-8">
        <div className="w-full max-w-md">
          <div className="bg-white rounded-2xl shadow-card p-8">
            <div className="text-center mb-6">
              <h1 className="text-2xl font-bold text-gray-900">Create Account</h1>
              <p className="text-gray-500 mt-1">Join Gujarat's #1 job platform</p>
            </div>

            {/* Role selector */}
            <div className="grid grid-cols-2 gap-3 mb-6">
              <button
                type="button"
                onClick={() => setRole('jobseeker')}
                className={`flex flex-col items-center gap-2 p-4 rounded-xl border-2 transition-all ${
                  role === 'jobseeker'
                    ? 'border-primary-600 bg-primary-50 text-primary-700'
                    : 'border-gray-200 text-gray-600 hover:border-gray-300'
                }`}
              >
                <UserIcon className="h-7 w-7" />
                <div>
                  <p className="font-semibold text-sm">Job Seeker</p>
                  <p className="text-xs opacity-70">Find jobs</p>
                </div>
              </button>

              <button
                type="button"
                onClick={() => setRole('recruiter')}
                className={`flex flex-col items-center gap-2 p-4 rounded-xl border-2 transition-all ${
                  role === 'recruiter'
                    ? 'border-primary-600 bg-primary-50 text-primary-700'
                    : 'border-gray-200 text-gray-600 hover:border-gray-300'
                }`}
              >
                <BuildingOfficeIcon className="h-7 w-7" />
                <div>
                  <p className="font-semibold text-sm">Recruiter</p>
                  <p className="text-xs opacity-70">Hire talent</p>
                </div>
              </button>
            </div>

            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Full Name</label>
                <input
                  type="text"
                  {...register('name', {
                    required: 'Name is required',
                    minLength: { value: 2, message: 'Name must be at least 2 characters' },
                  })}
                  className="input"
                  placeholder="Your full name"
                />
                {errors.name && <p className="mt-1 text-xs text-red-500">{errors.name.message}</p>}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Email Address</label>
                <input
                  type="email"
                  {...register('email', {
                    required: 'Email is required',
                    pattern: { value: /^\S+@\S+\.\S+$/, message: 'Invalid email' },
                  })}
                  className="input"
                  placeholder="you@example.com"
                />
                {errors.email && <p className="mt-1 text-xs text-red-500">{errors.email.message}</p>}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Phone Number</label>
                <input
                  type="tel"
                  {...register('phone', {
                    pattern: { value: /^[6-9]\d{9}$/, message: 'Invalid phone number (10 digits)' },
                  })}
                  className="input"
                  placeholder="9876543210"
                />
                {errors.phone && <p className="mt-1 text-xs text-red-500">{errors.phone.message}</p>}
              </div>

              {role === 'recruiter' && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Company Name</label>
                  <input
                    type="text"
                    {...register('companyName', {
                      required: role === 'recruiter' ? 'Company name is required' : false,
                    })}
                    className="input"
                    placeholder="Your company name"
                  />
                  {errors.companyName && <p className="mt-1 text-xs text-red-500">{errors.companyName.message}</p>}
                </div>
              )}

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Password</label>
                <div className="relative">
                  <input
                    type={showPassword ? 'text' : 'password'}
                    {...register('password', {
                      required: 'Password is required',
                      minLength: { value: 6, message: 'Password must be at least 6 characters' },
                    })}
                    className="input pr-10"
                    placeholder="Min 6 characters"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                  >
                    {showPassword ? <EyeSlashIcon className="h-5 w-5" /> : <EyeIcon className="h-5 w-5" />}
                  </button>
                </div>
                {errors.password && <p className="mt-1 text-xs text-red-500">{errors.password.message}</p>}
              </div>

              <div className="flex items-start gap-2">
                <input
                  type="checkbox"
                  id="terms"
                  {...register('terms', { required: 'You must accept the terms' })}
                  className="mt-0.5 rounded text-primary-600"
                />
                <label htmlFor="terms" className="text-sm text-gray-600">
                  I agree to the{' '}
                  <a href="#" className="text-primary-600 hover:underline">Terms of Service</a>
                  {' '}and{' '}
                  <a href="#" className="text-primary-600 hover:underline">Privacy Policy</a>
                </label>
              </div>
              {errors.terms && <p className="text-xs text-red-500">{errors.terms.message}</p>}

              <button
                type="submit"
                disabled={isLoading}
                className="btn-primary w-full py-3 text-base"
              >
                {isLoading ? (
                  <span className="flex items-center justify-center gap-2">
                    <span className="animate-spin h-5 w-5 border-2 border-white border-t-transparent rounded-full" />
                    Creating account...
                  </span>
                ) : (
                  `Create ${role === 'recruiter' ? 'Recruiter' : 'Job Seeker'} Account`
                )}
              </button>
            </form>

            <div className="mt-6 text-center">
              <p className="text-sm text-gray-600">
                Already have an account?{' '}
                <Link to="/login" className="text-primary-600 hover:text-primary-700 font-semibold">
                  Sign in
                </Link>
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RegisterPage;
