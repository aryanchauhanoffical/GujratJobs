import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import toast from 'react-hot-toast';
import {
  UserIcon, DocumentTextIcon, MapPinIcon, BriefcaseIcon,
  CameraIcon, PencilIcon, CheckIcon,
} from '@heroicons/react/24/outline';
import Navbar from '../../components/layout/Navbar';
import Sidebar from '../../components/layout/Sidebar';
import LoadingSpinner from '../../components/layout/LoadingSpinner';
import { userAPI } from '../../api/user.api';
import { useAuth } from '../../context/AuthContext';
import { GUJARAT_CITIES, QUALIFICATIONS } from '../../utils/constants';
import { getInitials } from '../../utils/helpers';

const SeekerProfile = () => {
  const { user, updateUser } = useAuth();
  const qc = useQueryClient();
  const [activeTab, setActiveTab] = useState('personal');
  const [isEditingSkills, setIsEditingSkills] = useState(false);
  const [skillInput, setSkillInput] = useState('');
  const [skills, setSkills] = useState(user?.skills || []);

  const { register, handleSubmit, formState: { errors }, reset } = useForm({
    defaultValues: {
      name: user?.name || '',
      phone: user?.phone || '',
      bio: user?.bio || '',
      experience: user?.experience || 0,
      qualification: user?.qualification || '',
      expectedSalary: user?.expectedSalary || '',
    },
  });

  const { register: locationRegister, handleSubmit: handleLocationSubmit } = useForm({
    defaultValues: {
      city: user?.location?.city || '',
      state: 'Gujarat',
      pincode: user?.location?.pincode || '',
    },
  });

  const updateProfileMutation = useMutation({
    mutationFn: userAPI.updateProfile,
    onSuccess: (data) => {
      updateUser(data.user);
      qc.invalidateQueries(['profile']);
      toast.success('Profile updated!');
    },
    onError: () => toast.error('Failed to update profile'),
  });

  const updateLocationMutation = useMutation({
    mutationFn: userAPI.updateLocation,
    onSuccess: (data) => {
      updateUser({ location: data.location });
      toast.success('Location updated!');
    },
    onError: () => toast.error('Failed to update location'),
  });

  const uploadResumeMutation = useMutation({
    mutationFn: userAPI.uploadResume,
    onSuccess: (data) => {
      updateUser({ resume: data.resume });
      toast.success('Resume uploaded!');
    },
    onError: () => toast.error('Failed to upload resume'),
  });

  const uploadPicMutation = useMutation({
    mutationFn: userAPI.uploadProfilePic,
    onSuccess: (data) => {
      updateUser({ profilePic: data.profilePic });
      toast.success('Profile picture updated!');
    },
    onError: () => toast.error('Failed to upload picture'),
  });

  const handleAddSkill = () => {
    const trimmed = skillInput.trim();
    if (trimmed && !skills.includes(trimmed)) {
      setSkills([...skills, trimmed]);
      setSkillInput('');
    }
  };

  const handleRemoveSkill = (skill) => {
    setSkills(skills.filter((s) => s !== skill));
  };

  const handleSaveSkills = () => {
    updateProfileMutation.mutate({ skills });
    setIsEditingSkills(false);
  };

  const onProfileSubmit = (data) => {
    updateProfileMutation.mutate({ ...data, skills });
  };

  const tabs = [
    { id: 'personal', label: 'Personal Info', icon: UserIcon },
    { id: 'resume', label: 'Resume', icon: DocumentTextIcon },
    { id: 'location', label: 'Location', icon: MapPinIcon },
    { id: 'skills', label: 'Skills', icon: BriefcaseIcon },
  ];

  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      <Navbar />
      <div className="flex flex-1">
        <Sidebar />

        <main className="flex-1 p-6">
          <div className="max-w-3xl">
            <h1 className="text-2xl font-bold text-gray-900 mb-6">My Profile</h1>

            {/* Profile header */}
            <div className="bg-white rounded-xl border border-gray-200 p-6 mb-6">
              <div className="flex items-center gap-5">
                <div className="relative">
                  <div className="w-20 h-20 rounded-2xl bg-primary-100 text-primary-700 flex items-center justify-center text-2xl font-bold overflow-hidden">
                    {user?.profilePic ? (
                      <img src={user.profilePic} alt={user.name} className="w-full h-full object-cover" />
                    ) : (
                      getInitials(user?.name)
                    )}
                  </div>
                  <label className="absolute -bottom-1 -right-1 w-7 h-7 bg-primary-600 text-white rounded-full flex items-center justify-center cursor-pointer hover:bg-primary-700 transition-colors">
                    <CameraIcon className="h-4 w-4" />
                    <input
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={(e) => {
                        if (e.target.files[0]) uploadPicMutation.mutate(e.target.files[0]);
                      }}
                    />
                  </label>
                </div>
                <div>
                  <h2 className="text-xl font-bold text-gray-900">{user?.name}</h2>
                  <p className="text-gray-500">{user?.email}</p>
                  <div className="flex items-center gap-2 mt-1">
                    {user?.location?.city && (
                      <span className="text-sm text-primary-600 flex items-center gap-1">
                        <MapPinIcon className="h-3.5 w-3.5" />
                        {user.location.city}, Gujarat
                      </span>
                    )}
                    {user?.isVerified && (
                      <span className="text-xs bg-green-100 text-green-700 px-2 py-0.5 rounded-full">✓ Verified</span>
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* Tabs */}
            <div className="flex gap-1 bg-gray-100 p-1 rounded-xl mb-6">
              {tabs.map(({ id, label, icon: Icon }) => (
                <button
                  key={id}
                  onClick={() => setActiveTab(id)}
                  className={`flex items-center gap-1.5 px-4 py-2 rounded-lg text-sm font-medium flex-1 justify-center transition-colors ${
                    activeTab === id
                      ? 'bg-white text-primary-700 shadow-sm'
                      : 'text-gray-600 hover:text-gray-900'
                  }`}
                >
                  <Icon className="h-4 w-4" />
                  <span className="hidden sm:inline">{label}</span>
                </button>
              ))}
            </div>

            {/* Tab content */}
            <div className="bg-white rounded-xl border border-gray-200 p-6">
              {activeTab === 'personal' && (
                <form onSubmit={handleSubmit(onProfileSubmit)} className="space-y-4">
                  <h3 className="font-semibold text-gray-900 mb-4">Personal Information</h3>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Full Name</label>
                      <input
                        {...register('name', { required: 'Name is required' })}
                        className="input"
                        placeholder="Your full name"
                      />
                      {errors.name && <p className="text-xs text-red-500 mt-1">{errors.name.message}</p>}
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Phone Number</label>
                      <input
                        {...register('phone')}
                        className="input"
                        placeholder="9876543210"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Experience (years)</label>
                      <input
                        type="number"
                        min="0"
                        max="50"
                        {...register('experience')}
                        className="input"
                        placeholder="0"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Qualification</label>
                      <select {...register('qualification')} className="input">
                        <option value="">Select qualification</option>
                        {QUALIFICATIONS.map((q) => (
                          <option key={q.value} value={q.value}>{q.label}</option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Expected Salary (monthly)</label>
                      <div className="relative">
                        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">₹</span>
                        <input
                          type="number"
                          {...register('expectedSalary')}
                          className="input pl-7"
                          placeholder="25000"
                        />
                      </div>
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Bio / Summary</label>
                    <textarea
                      {...register('bio')}
                      rows={4}
                      className="input resize-none"
                      placeholder="Tell recruiters about yourself, your experience, and what you're looking for..."
                      maxLength={500}
                    />
                  </div>

                  <button
                    type="submit"
                    disabled={updateProfileMutation.isPending}
                    className="btn-primary flex items-center gap-2"
                  >
                    {updateProfileMutation.isPending ? (
                      <LoadingSpinner size="sm" className="border-white" />
                    ) : (
                      <CheckIcon className="h-4 w-4" />
                    )}
                    Save Changes
                  </button>
                </form>
              )}

              {activeTab === 'resume' && (
                <div>
                  <h3 className="font-semibold text-gray-900 mb-4">Resume</h3>

                  {user?.resume?.url ? (
                    <div className="bg-green-50 border border-green-200 rounded-xl p-4 mb-4">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 bg-red-100 rounded-lg flex items-center justify-center text-red-600">
                            📄
                          </div>
                          <div>
                            <p className="font-medium text-gray-900 text-sm">{user.resume.filename}</p>
                            <p className="text-xs text-gray-500">
                              Uploaded: {new Date(user.resume.uploadedAt).toLocaleDateString('en-IN')}
                            </p>
                          </div>
                        </div>
                        <a
                          href={user.resume.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-sm text-primary-600 hover:text-primary-700 font-medium"
                        >
                          Preview
                        </a>
                      </div>
                    </div>
                  ) : (
                    <div className="border-2 border-dashed border-gray-300 rounded-xl p-8 text-center mb-4">
                      <DocumentTextIcon className="h-12 w-12 text-gray-300 mx-auto mb-3" />
                      <p className="text-gray-500 font-medium mb-1">No resume uploaded</p>
                      <p className="text-sm text-gray-400">Upload your resume to apply to jobs</p>
                    </div>
                  )}

                  <label className="cursor-pointer">
                    <div className={`btn-primary inline-flex items-center gap-2 ${uploadResumeMutation.isPending ? 'opacity-50 cursor-wait' : ''}`}>
                      {uploadResumeMutation.isPending ? (
                        <LoadingSpinner size="sm" className="border-white" />
                      ) : (
                        <DocumentTextIcon className="h-4 w-4" />
                      )}
                      {user?.resume?.url ? 'Replace Resume' : 'Upload Resume'}
                    </div>
                    <input
                      type="file"
                      accept=".pdf,.doc,.docx"
                      className="hidden"
                      onChange={(e) => {
                        if (e.target.files[0]) uploadResumeMutation.mutate(e.target.files[0]);
                      }}
                      disabled={uploadResumeMutation.isPending}
                    />
                  </label>
                  <p className="text-xs text-gray-400 mt-2">Supported: PDF, DOC, DOCX. Max size: 5MB</p>
                </div>
              )}

              {activeTab === 'location' && (
                <form onSubmit={handleLocationSubmit((data) => updateLocationMutation.mutate(data))} className="space-y-4">
                  <h3 className="font-semibold text-gray-900 mb-4">Location</h3>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">City in Gujarat</label>
                      <select {...locationRegister('city', { required: 'City is required' })} className="input">
                        <option value="">Select your city</option>
                        {GUJARAT_CITIES.map((city) => (
                          <option key={city} value={city}>{city}</option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Pincode</label>
                      <input
                        {...locationRegister('pincode')}
                        className="input"
                        placeholder="380001"
                      />
                    </div>
                  </div>

                  <div className="bg-blue-50 border border-blue-200 rounded-xl p-3">
                    <p className="text-xs text-blue-700">
                      <strong>Note:</strong> GujaratJobs currently serves job seekers in Gujarat only.
                      Setting your city helps us show relevant local jobs.
                    </p>
                  </div>

                  <button
                    type="submit"
                    disabled={updateLocationMutation.isPending}
                    className="btn-primary flex items-center gap-2"
                  >
                    {updateLocationMutation.isPending ? <LoadingSpinner size="sm" className="border-white" /> : <CheckIcon className="h-4 w-4" />}
                    Save Location
                  </button>
                </form>
              )}

              {activeTab === 'skills' && (
                <div>
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="font-semibold text-gray-900">Skills</h3>
                    {!isEditingSkills ? (
                      <button
                        onClick={() => setIsEditingSkills(true)}
                        className="text-sm text-primary-600 font-medium flex items-center gap-1"
                      >
                        <PencilIcon className="h-4 w-4" />
                        Edit
                      </button>
                    ) : (
                      <button onClick={handleSaveSkills} className="btn-primary text-sm">
                        Save Skills
                      </button>
                    )}
                  </div>

                  {/* Skills display */}
                  <div className="flex flex-wrap gap-2 mb-4">
                    {skills.map((skill) => (
                      <span
                        key={skill}
                        className={`bg-primary-50 text-primary-700 px-3 py-1 rounded-lg text-sm font-medium ${
                          isEditingSkills ? 'pr-1' : ''
                        }`}
                      >
                        {skill}
                        {isEditingSkills && (
                          <button
                            onClick={() => handleRemoveSkill(skill)}
                            className="ml-2 text-primary-400 hover:text-red-500 font-bold"
                          >
                            ×
                          </button>
                        )}
                      </span>
                    ))}
                    {skills.length === 0 && (
                      <p className="text-gray-400 text-sm">No skills added yet. Add skills to improve visibility.</p>
                    )}
                  </div>

                  {isEditingSkills && (
                    <div className="flex gap-2">
                      <input
                        type="text"
                        value={skillInput}
                        onChange={(e) => setSkillInput(e.target.value)}
                        onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), handleAddSkill())}
                        placeholder="Add a skill (e.g. React, Excel, Sales)"
                        className="input flex-1"
                      />
                      <button onClick={handleAddSkill} className="btn-primary">
                        Add
                      </button>
                    </div>
                  )}

                  {!isEditingSkills && (
                    <button
                      onClick={() => setIsEditingSkills(true)}
                      className="btn-outline text-sm mt-2"
                    >
                      + Add Skills
                    </button>
                  )}
                </div>
              )}
            </div>
          </div>
        </main>
      </div>
    </div>
  );
};

export default SeekerProfile;
