import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useForm } from 'react-hook-form';
import {
  BuildingOfficeIcon,
  GlobeAltIcon,
  MapPinIcon,
  PencilIcon,
  CheckIcon,
  XMarkIcon,
  BriefcaseIcon,
  UserGroupIcon,
  ChartBarIcon,
} from '@heroicons/react/24/outline';
import Navbar from '../../components/layout/Navbar';
import Sidebar from '../../components/layout/Sidebar';
import LoadingSpinner from '../../components/layout/LoadingSpinner';
import toast from 'react-hot-toast';
import axiosInstance from '../../api/axios';
import { Link } from 'react-router-dom';

const RECRUITER_SIDEBAR_LINKS = [
  { label: 'Dashboard', href: '/recruiter/dashboard', icon: ChartBarIcon },
  { label: 'Post a Job', href: '/recruiter/post-job', icon: BriefcaseIcon },
  { label: 'Manage Jobs', href: '/recruiter/jobs', icon: BriefcaseIcon },
  { label: 'Company Profile', href: '/recruiter/profile', icon: BuildingOfficeIcon },
];

const INDUSTRY_OPTIONS = [
  'Information Technology', 'Manufacturing', 'Finance & Banking', 'Healthcare',
  'Retail & E-Commerce', 'Education', 'Logistics & Supply Chain', 'Construction',
  'Textiles', 'Pharmaceuticals', 'Automotive', 'Agriculture', 'Media & Entertainment', 'Other',
];

const COMPANY_SIZE_OPTIONS = [
  '1–10', '11–50', '51–200', '201–500', '501–1000', '1000+',
];

const GUJARAT_CITIES = [
  'Ahmedabad', 'Surat', 'Vadodara', 'Rajkot', 'Gandhinagar', 'Bhavnagar',
  'Jamnagar', 'Junagadh', 'Anand', 'Navsari', 'Morbi', 'Surendranagar',
  'Mehsana', 'Bharuch', 'Porbandar', 'Amreli', 'Kutch / Bhuj',
];

export default function RecruiterProfilePage() {
  const queryClient = useQueryClient();
  const [isEditing, setIsEditing] = useState(false);

  const { data, isLoading } = useQuery({
    queryKey: ['recruiterProfile'],
    queryFn: async () => {
      const { data } = await axiosInstance.get('/recruiter/profile');
      return data.data;
    },
    retry: false,
  });

  const profile = data || {
    companyName: 'Your Company Name',
    industry: 'Information Technology',
    companySize: '11–50',
    website: '',
    description: '',
    location: { city: 'Ahmedabad', state: 'Gujarat', address: '' },
    contactEmail: '',
    contactPhone: '',
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
    mutationFn: (formData) => axiosInstance.put('/recruiter/profile', formData),
    onSuccess: (res) => {
      queryClient.invalidateQueries(['recruiterProfile']);
      toast.success('Company profile updated!');
      setIsEditing(false);
    },
    onError: () => toast.error('Failed to update profile'),
  });

  const onSubmit = (formData) => updateMutation.mutate(formData);

  const handleCancel = () => {
    reset(profile);
    setIsEditing(false);
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Navbar />
        <div className="flex justify-center items-center h-96"><LoadingSpinner /></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <div className="flex">
        <Sidebar links={RECRUITER_SIDEBAR_LINKS} />
        <main className="flex-1 p-6 lg:p-8">
          <div className="max-w-3xl mx-auto">
            {/* Header */}
            <div className="mb-6 flex items-center justify-between">
              <div>
                <h1 className="text-2xl font-bold text-gray-900">Company Profile</h1>
                <p className="text-gray-500 mt-1">Your company info shown to job seekers</p>
              </div>
              {!isEditing && (
                <button
                  onClick={() => setIsEditing(true)}
                  className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-xl font-medium text-sm transition-colors"
                >
                  <PencilIcon className="h-4 w-4" />
                  Edit Profile
                </button>
              )}
            </div>

            {/* Verification badge */}
            {!profile.isVerified && (
              <div className="mb-6 bg-amber-50 border border-amber-200 rounded-xl p-4 text-sm text-amber-800">
                Your company profile is <strong>pending verification</strong>. Complete your profile to get verified and unlock full recruiting features.
              </div>
            )}

            {/* Stats row */}
            <div className="grid grid-cols-3 gap-4 mb-6">
              {[
                { label: 'Jobs Posted', value: profile.jobsPosted || 0, icon: '📋' },
                { label: 'Total Hired', value: profile.totalHired || 0, icon: '✅' },
                { label: 'Profile Status', value: profile.isVerified ? 'Verified' : 'Pending', icon: '🏷️' },
              ].map((s) => (
                <div key={s.label} className="bg-white rounded-xl shadow-sm border border-gray-100 p-4 text-center">
                  <div className="text-2xl mb-1">{s.icon}</div>
                  <div className="text-xl font-bold text-gray-900">{s.value}</div>
                  <div className="text-xs text-gray-500">{s.label}</div>
                </div>
              ))}
            </div>

            {/* Profile card */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
              {/* Company banner */}
              <div className="h-24 bg-gradient-to-r from-indigo-600 to-purple-600" />

              <div className="px-6 pb-6">
                {/* Company logo placeholder */}
                <div className="-mt-8 mb-4">
                  <div className="h-16 w-16 rounded-xl bg-white shadow-md border-2 border-white flex items-center justify-center">
                    <BuildingOfficeIcon className="h-8 w-8 text-indigo-600" />
                  </div>
                </div>

                {isEditing ? (
                  <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Company Name *</label>
                        <input
                          {...register('companyName', { required: 'Company name is required' })}
                          className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                          placeholder="e.g. Acme Technologies"
                        />
                        {errors.companyName && <p className="text-red-500 text-xs mt-1">{errors.companyName.message}</p>}
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Industry *</label>
                        <select
                          {...register('industry', { required: true })}
                          className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                        >
                          {INDUSTRY_OPTIONS.map((i) => (
                            <option key={i} value={i}>{i}</option>
                          ))}
                        </select>
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Company Size</label>
                        <select
                          {...register('companySize')}
                          className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                        >
                          {COMPANY_SIZE_OPTIONS.map((s) => (
                            <option key={s} value={s}>{s} employees</option>
                          ))}
                        </select>
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">City (Gujarat) *</label>
                        <select
                          {...register('location.city', { required: true })}
                          className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                        >
                          {GUJARAT_CITIES.map((c) => (
                            <option key={c} value={c}>{c}</option>
                          ))}
                        </select>
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Website</label>
                        <input
                          {...register('website')}
                          className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                          placeholder="yourcompany.com"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Contact Email</label>
                        <input
                          {...register('contactEmail')}
                          type="email"
                          className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                          placeholder="hr@yourcompany.com"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Company Address</label>
                      <input
                        {...register('location.address')}
                        className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                        placeholder="Full address (for walk-in interview directions)"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">About Company</label>
                      <textarea
                        {...register('description')}
                        rows={4}
                        className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:ring-2 focus:ring-indigo-500 focus:border-transparent resize-none"
                        placeholder="Describe your company, culture, and what makes it a great place to work..."
                      />
                    </div>

                    <div className="flex gap-3">
                      <button
                        type="submit"
                        disabled={updateMutation.isPending}
                        className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white px-5 py-2.5 rounded-xl font-medium text-sm transition-colors disabled:opacity-50"
                      >
                        <CheckIcon className="h-4 w-4" />
                        {updateMutation.isPending ? 'Saving...' : 'Save Changes'}
                      </button>
                      <button
                        type="button"
                        onClick={handleCancel}
                        className="flex items-center gap-2 border border-gray-200 text-gray-600 hover:bg-gray-50 px-5 py-2.5 rounded-xl font-medium text-sm transition-colors"
                      >
                        <XMarkIcon className="h-4 w-4" />
                        Cancel
                      </button>
                    </div>
                  </form>
                ) : (
                  <div className="space-y-4">
                    <div>
                      <h2 className="text-xl font-bold text-gray-900">{profile.companyName}</h2>
                      <p className="text-gray-500 text-sm mt-0.5">{profile.industry} · {profile.companySize} employees</p>
                    </div>

                    <div className="flex flex-wrap gap-4 text-sm text-gray-600">
                      <span className="flex items-center gap-1.5">
                        <MapPinIcon className="h-4 w-4 text-gray-400" />
                        {profile.location?.city}, Gujarat
                      </span>
                      {profile.website && (
                        <a href={`https://${profile.website}`} target="_blank" rel="noopener noreferrer" className="flex items-center gap-1.5 text-indigo-600 hover:underline">
                          <GlobeAltIcon className="h-4 w-4" />
                          {profile.website}
                        </a>
                      )}
                      {profile.contactEmail && (
                        <span>📧 {profile.contactEmail}</span>
                      )}
                    </div>

                    {profile.location?.address && (
                      <p className="text-sm text-gray-500">📍 {profile.location.address}</p>
                    )}

                    {profile.description ? (
                      <p className="text-sm text-gray-700 leading-relaxed">{profile.description}</p>
                    ) : (
                      <p className="text-sm text-gray-400 italic">No company description added yet. Click Edit Profile to add one.</p>
                    )}

                    <div className="pt-2 border-t border-gray-100">
                      <Link
                        to="/recruiter/post-job"
                        className="inline-flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-xl text-sm font-medium transition-colors"
                      >
                        <BriefcaseIcon className="h-4 w-4" />
                        Post a New Job
                      </Link>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
