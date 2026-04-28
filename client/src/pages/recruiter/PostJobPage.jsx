import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { useMutation } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import Navbar from '../../components/layout/Navbar';
import Sidebar from '../../components/layout/Sidebar';
import LoadingSpinner from '../../components/layout/LoadingSpinner';
import { jobsAPI } from '../../api/jobs.api';
import { GUJARAT_CITIES, JOB_TYPES, EXPERIENCE_LEVELS, JOB_CATEGORIES, QUALIFICATIONS } from '../../utils/constants';

const PostJobPage = () => {
  const navigate = useNavigate();
  const [skillInput, setSkillInput] = useState('');
  const [skills, setSkills] = useState([]);
  const [requirements, setRequirements] = useState(['']);
  const [benefits, setBenefits] = useState(['']);
  const [isWalkIn, setIsWalkIn] = useState(false);
  const [isGuaranteedHiring, setIsGuaranteedHiring] = useState(false);
  const [fastTrack, setFastTrack] = useState(false);
  const [isFresherFriendly, setIsFresherFriendly] = useState(false);
  const [activeSection, setActiveSection] = useState('basic');

  const { register, handleSubmit, formState: { errors }, watch } = useForm({
    defaultValues: {
      type: 'full-time',
      experienceLevel: 'fresher',
      qualification: 'Any',
      'salary.currency': 'INR',
      'salary.period': 'monthly',
      openings: 1,
    },
  });

  const createJobMutation = useMutation({
    mutationFn: jobsAPI.create,
    onSuccess: (data) => {
      toast.success('Job posted successfully!');
      navigate('/recruiter/jobs');
    },
    onError: (err) => {
      toast.error(err.response?.data?.message || 'Failed to post job');
    },
  });

  const onSubmit = (data) => {
    const jobData = {
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
        currency: 'INR',
        period: data.salaryPeriod || 'monthly',
        isNegotiable: data.salaryNegotiable || false,
      },
      location: {
        city: data.city,
        state: 'Gujarat',
        pincode: data.pincode,
        address: data.address,
      },
    };

    createJobMutation.mutate(jobData);
  };

  const addRequirement = () => setRequirements([...requirements, '']);
  const removeRequirement = (idx) => setRequirements(requirements.filter((_, i) => i !== idx));
  const updateRequirement = (idx, val) => setRequirements(requirements.map((r, i) => i === idx ? val : r));

  const addBenefit = () => setBenefits([...benefits, '']);
  const removeBenefit = (idx) => setBenefits(benefits.filter((_, i) => i !== idx));
  const updateBenefit = (idx, val) => setBenefits(benefits.map((b, i) => i === idx ? val : b));

  const sections = [
    { id: 'basic', label: 'Basic Info' },
    { id: 'details', label: 'Details' },
    { id: 'walkin', label: 'Walk-in' },
    { id: 'extras', label: 'Extras' },
  ];

  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      <Navbar />
      <div className="flex flex-1">
        <Sidebar />
        <main className="flex-1 p-6">
          <div className="max-w-3xl">
            <h1 className="text-2xl font-bold text-gray-900 mb-6">Post a New Job</h1>

            {/* Section tabs */}
            <div className="flex gap-1 bg-gray-100 p-1 rounded-xl mb-6">
              {sections.map(({ id, label }) => (
                <button
                  key={id}
                  type="button"
                  onClick={() => setActiveSection(id)}
                  className={`flex-1 py-2 px-3 rounded-lg text-sm font-medium transition-colors ${
                    activeSection === id ? 'bg-white text-primary-700 shadow-sm' : 'text-gray-600 hover:text-gray-900'
                  }`}
                >
                  {label}
                </button>
              ))}
            </div>

            <form onSubmit={handleSubmit(onSubmit)}>
              {/* Basic Info */}
              {activeSection === 'basic' && (
                <div className="bg-white rounded-xl border border-gray-200 p-6 space-y-4">
                  <h2 className="font-semibold text-gray-900">Basic Information</h2>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Job Title *</label>
                    <input
                      {...register('title', { required: 'Job title is required' })}
                      className="input"
                      placeholder="e.g. Software Developer, Sales Executive"
                    />
                    {errors.title && <p className="text-xs text-red-500 mt-1">{errors.title.message}</p>}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Company Name *</label>
                    <input
                      {...register('company', { required: 'Company name is required' })}
                      className="input"
                      placeholder="Your company name"
                    />
                    {errors.company && <p className="text-xs text-red-500 mt-1">{errors.company.message}</p>}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Job Description *</label>
                    <textarea
                      {...register('description', { required: 'Description is required', minLength: { value: 50, message: 'Description must be at least 50 characters' } })}
                      rows={6}
                      className="input resize-none"
                      placeholder="Describe the role, responsibilities, and what you're looking for..."
                    />
                    {errors.description && <p className="text-xs text-red-500 mt-1">{errors.description.message}</p>}
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Category</label>
                      <select {...register('category')} className="input">
                        <option value="">Select category</option>
                        {JOB_CATEGORIES.map((c) => (
                          <option key={c.value} value={c.value}>{c.icon} {c.label}</option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Job Type *</label>
                      <select {...register('type', { required: true })} className="input">
                        {JOB_TYPES.map((t) => (
                          <option key={t.value} value={t.value}>{t.label}</option>
                        ))}
                      </select>
                    </div>
                  </div>

                  <div className="flex justify-end">
                    <button type="button" onClick={() => setActiveSection('details')} className="btn-primary">
                      Next: Details
                    </button>
                  </div>
                </div>
              )}

              {/* Details */}
              {activeSection === 'details' && (
                <div className="bg-white rounded-xl border border-gray-200 p-6 space-y-4">
                  <h2 className="font-semibold text-gray-900">Location & Compensation</h2>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">City *</label>
                      <select {...register('city', { required: 'City is required' })} className="input">
                        <option value="">Select city</option>
                        {GUJARAT_CITIES.map((c) => <option key={c} value={c}>{c}</option>)}
                      </select>
                      {errors.city && <p className="text-xs text-red-500 mt-1">{errors.city.message}</p>}
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Pincode</label>
                      <input {...register('pincode')} className="input" placeholder="380001" />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Office Address</label>
                    <input {...register('address')} className="input" placeholder="Full office address" />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Min Salary (monthly)</label>
                      <div className="relative">
                        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">₹</span>
                        <input type="number" {...register('salaryMin')} className="input pl-7" placeholder="10000" min="0" />
                      </div>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Max Salary (monthly)</label>
                      <div className="relative">
                        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">₹</span>
                        <input type="number" {...register('salaryMax')} className="input pl-7" placeholder="30000" min="0" />
                      </div>
                    </div>
                  </div>

                  <label className="flex items-center gap-2 cursor-pointer">
                    <input type="checkbox" {...register('salaryNegotiable')} className="rounded text-primary-600" />
                    <span className="text-sm text-gray-700">Salary is negotiable</span>
                  </label>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Experience Level *</label>
                      <select {...register('experienceLevel')} className="input">
                        {EXPERIENCE_LEVELS.map((l) => <option key={l.value} value={l.value}>{l.label}</option>)}
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Qualification</label>
                      <select {...register('qualification')} className="input">
                        {QUALIFICATIONS.map((q) => <option key={q.value} value={q.value}>{q.label}</option>)}
                      </select>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">No. of Openings</label>
                      <input type="number" {...register('openings')} className="input" placeholder="1" min="1" />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Application Deadline</label>
                      <input type="date" {...register('deadline')} className="input" />
                    </div>
                  </div>

                  {/* Skills */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Required Skills</label>
                    <div className="flex flex-wrap gap-2 mb-2">
                      {skills.map((s) => (
                        <span key={s} className="bg-primary-50 text-primary-700 px-2.5 py-0.5 rounded-lg text-sm">
                          {s}
                          <button type="button" onClick={() => setSkills(skills.filter((sk) => sk !== s))} className="ml-1.5 text-primary-400 hover:text-red-500">×</button>
                        </span>
                      ))}
                    </div>
                    <div className="flex gap-2">
                      <input
                        type="text"
                        value={skillInput}
                        onChange={(e) => setSkillInput(e.target.value)}
                        onKeyDown={(e) => {
                          if (e.key === 'Enter') {
                            e.preventDefault();
                            if (skillInput.trim()) { setSkills([...skills, skillInput.trim()]); setSkillInput(''); }
                          }
                        }}
                        placeholder="Add skill (press Enter)"
                        className="input flex-1"
                      />
                      <button type="button" onClick={() => { if (skillInput.trim()) { setSkills([...skills, skillInput.trim()]); setSkillInput(''); } }} className="btn-secondary">Add</button>
                    </div>
                  </div>

                  {/* Requirements */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Requirements</label>
                    {requirements.map((req, idx) => (
                      <div key={idx} className="flex gap-2 mb-2">
                        <input
                          value={req}
                          onChange={(e) => updateRequirement(idx, e.target.value)}
                          placeholder={`Requirement ${idx + 1}`}
                          className="input flex-1"
                        />
                        {requirements.length > 1 && (
                          <button type="button" onClick={() => removeRequirement(idx)} className="text-red-400 hover:text-red-600 px-2">×</button>
                        )}
                      </div>
                    ))}
                    <button type="button" onClick={addRequirement} className="text-sm text-primary-600 font-medium">+ Add Requirement</button>
                  </div>

                  <div className="flex justify-between">
                    <button type="button" onClick={() => setActiveSection('basic')} className="btn-secondary">Back</button>
                    <button type="button" onClick={() => setActiveSection('walkin')} className="btn-primary">Next: Walk-in</button>
                  </div>
                </div>
              )}

              {/* Walk-in */}
              {activeSection === 'walkin' && (
                <div className="bg-white rounded-xl border border-gray-200 p-6 space-y-4">
                  <h2 className="font-semibold text-gray-900">Walk-in Interview Details</h2>

                  <label className="flex items-center gap-3 p-4 border-2 rounded-xl cursor-pointer transition-colors hover:border-orange-300 hover:bg-orange-50">
                    <input
                      type="checkbox"
                      checked={isWalkIn}
                      onChange={(e) => setIsWalkIn(e.target.checked)}
                      className="w-5 h-5 rounded text-orange-500 focus:ring-orange-400"
                    />
                    <div>
                      <p className="font-semibold text-gray-900">This is a Walk-in Interview</p>
                      <p className="text-sm text-gray-500">Candidates can walk in directly to your venue</p>
                    </div>
                  </label>

                  {isWalkIn && (
                    <div className="space-y-4 bg-orange-50 border border-orange-200 rounded-xl p-4">
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">Walk-in Date</label>
                          <input type="date" {...register('walkInDate')} className="input" min={new Date().toISOString().split('T')[0]} />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">Start Time</label>
                          <input type="time" {...register('walkInStartTime')} className="input" />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">End Time</label>
                          <input type="time" {...register('walkInEndTime')} className="input" />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">Contact Person</label>
                          <input {...register('walkInContact')} className="input" placeholder="HR Manager name" />
                        </div>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Venue Address</label>
                        <textarea {...register('walkInVenue')} rows={2} className="input resize-none" placeholder="Full venue address for candidates to visit" />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Contact Phone</label>
                        <input type="tel" {...register('walkInPhone')} className="input" placeholder="Contact number for candidates" />
                      </div>
                    </div>
                  )}

                  <div className="flex justify-between">
                    <button type="button" onClick={() => setActiveSection('details')} className="btn-secondary">Back</button>
                    <button type="button" onClick={() => setActiveSection('extras')} className="btn-primary">Next: Extras</button>
                  </div>
                </div>
              )}

              {/* Extras */}
              {activeSection === 'extras' && (
                <div className="bg-white rounded-xl border border-gray-200 p-6 space-y-5">
                  <h2 className="font-semibold text-gray-900">Job Features & Benefits</h2>

                  <div className="space-y-3">
                    {[
                      { key: 'isGuaranteedHiring', state: isGuaranteedHiring, setState: setIsGuaranteedHiring, label: '✅ Guaranteed Hiring', desc: 'Commit to hiring a certain number of candidates' },
                      { key: 'fastTrack', state: fastTrack, setState: setFastTrack, label: '⚡ Fast Track Hiring', desc: 'Get hired within 48-72 hours' },
                      { key: 'isFresherFriendly', state: isFresherFriendly, setState: setIsFresherFriendly, label: '🌱 Fresher Friendly', desc: 'Open to candidates with 0 experience' },
                    ].map(({ key, state, setState, label, desc }) => (
                      <label key={key} className={`flex items-center gap-3 p-4 border-2 rounded-xl cursor-pointer transition-colors ${state ? 'border-primary-300 bg-primary-50' : 'border-gray-200 hover:border-gray-300'}`}>
                        <input
                          type="checkbox"
                          checked={state}
                          onChange={(e) => setState(e.target.checked)}
                          className="w-5 h-5 rounded text-primary-600"
                        />
                        <div>
                          <p className="font-semibold text-gray-900 text-sm">{label}</p>
                          <p className="text-xs text-gray-500">{desc}</p>
                        </div>
                      </label>
                    ))}
                  </div>

                  {isGuaranteedHiring && (
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Mandatory Hire Count</label>
                      <input type="number" {...register('mandatoryHireCount')} className="input w-32" placeholder="5" min="1" />
                    </div>
                  )}

                  {/* Benefits */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Benefits / Perks</label>
                    {benefits.map((benefit, idx) => (
                      <div key={idx} className="flex gap-2 mb-2">
                        <input
                          value={benefit}
                          onChange={(e) => updateBenefit(idx, e.target.value)}
                          placeholder={`e.g. Health Insurance, Provident Fund`}
                          className="input flex-1"
                        />
                        {benefits.length > 1 && (
                          <button type="button" onClick={() => removeBenefit(idx)} className="text-red-400 hover:text-red-600 px-2">×</button>
                        )}
                      </div>
                    ))}
                    <button type="button" onClick={addBenefit} className="text-sm text-primary-600 font-medium">+ Add Benefit</button>
                  </div>

                  <div className="flex justify-between">
                    <button type="button" onClick={() => setActiveSection('walkin')} className="btn-secondary">Back</button>
                    <button
                      type="submit"
                      disabled={createJobMutation.isPending}
                      className="btn-primary px-8 flex items-center gap-2"
                    >
                      {createJobMutation.isPending ? (
                        <><LoadingSpinner size="sm" className="border-white" /> Posting...</>
                      ) : (
                        '🚀 Post Job'
                      )}
                    </button>
                  </div>
                </div>
              )}
            </form>
          </div>
        </main>
      </div>
    </div>
  );
};

export default PostJobPage;
