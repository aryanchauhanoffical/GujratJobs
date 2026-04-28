import React, { useState } from 'react';
import { XMarkIcon, PaperAirplaneIcon, BriefcaseIcon } from '@heroicons/react/24/outline';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { applicationsAPI } from '../../api/applications.api';
import toast from 'react-hot-toast';
import { formatSalary } from '../../utils/helpers';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

const ApplyModal = ({ job, onClose }) => {
  const { user } = useAuth();
  const qc = useQueryClient();
  const navigate = useNavigate();
  const [coverLetter, setCoverLetter] = useState('');
  const [expectedSalary, setExpectedSalary] = useState('');

  const applyMutation = useMutation({
    mutationFn: () => applicationsAPI.apply(job._id, {
      coverLetter,
      expectedSalary: expectedSalary ? parseInt(expectedSalary) : undefined,
    }),
    onSuccess: () => {
      toast.success('Application submitted successfully!');
      qc.invalidateQueries(['myApplications']);
      onClose();
    },
    onError: (error) => {
      const msg = error.response?.data?.message || 'Failed to apply';
      toast.error(msg);
    },
  });

  if (!user?.resume?.url) {
    return (
      <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
        <div className="bg-white rounded-xl max-w-md w-full p-6 shadow-2xl">
          <div className="text-center">
            <div className="w-16 h-16 bg-yellow-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <BriefcaseIcon className="h-8 w-8 text-yellow-600" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Resume Required</h3>
            <p className="text-gray-600 text-sm mb-6">
              Please upload your resume before applying to jobs.
            </p>
            <div className="flex gap-3">
              <button onClick={onClose} className="btn-secondary flex-1">Cancel</button>
              <button
                onClick={() => { onClose(); navigate('/profile'); }}
                className="btn-primary flex-1"
              >
                Upload Resume
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4" onClick={onClose}>
      <div
        className="bg-white rounded-xl max-w-lg w-full shadow-2xl animate-slide-up"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
          <div>
            <h3 className="font-semibold text-gray-900">Apply for {job.title}</h3>
            <p className="text-sm text-gray-500">{job.company} • {job.location?.city}</p>
          </div>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 p-1">
            <XMarkIcon className="h-5 w-5" />
          </button>
        </div>

        <div className="p-6 space-y-4">
          {/* Resume preview */}
          <div className="bg-green-50 border border-green-200 rounded-lg p-3 flex items-center gap-2">
            <div className="w-8 h-8 bg-green-100 rounded-lg flex items-center justify-center">
              <span className="text-sm">📄</span>
            </div>
            <div>
              <p className="text-sm font-medium text-green-800">Resume Ready</p>
              <p className="text-xs text-green-600">{user.resume.filename}</p>
            </div>
          </div>

          {/* Expected salary */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Expected Salary (Monthly) <span className="text-gray-400">(optional)</span>
            </label>
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-sm">₹</span>
              <input
                type="number"
                value={expectedSalary}
                onChange={(e) => setExpectedSalary(e.target.value)}
                placeholder={job.salary?.max ? `Up to ${job.salary.max}` : 'Enter amount'}
                className="input pl-7"
              />
            </div>
            {job.salary && (
              <p className="text-xs text-gray-500 mt-1">
                Job offers: {formatSalary(job.salary)}
              </p>
            )}
          </div>

          {/* Cover letter */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Cover Letter <span className="text-gray-400">(optional)</span>
            </label>
            <textarea
              value={coverLetter}
              onChange={(e) => setCoverLetter(e.target.value)}
              placeholder="Tell the recruiter why you're a great fit for this role..."
              rows={4}
              maxLength={1000}
              className="input resize-none text-sm"
            />
            <p className="text-xs text-gray-400 mt-1">{coverLetter.length}/1000</p>
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 pb-6 flex gap-3">
          <button onClick={onClose} className="btn-secondary flex-1">Cancel</button>
          <button
            onClick={() => applyMutation.mutate()}
            disabled={applyMutation.isPending}
            className="btn-primary flex-1 flex items-center justify-center gap-2"
          >
            {applyMutation.isPending ? (
              <>
                <span className="animate-spin h-4 w-4 border-2 border-white border-t-transparent rounded-full" />
                Submitting...
              </>
            ) : (
              <>
                <PaperAirplaneIcon className="h-4 w-4" />
                Submit Application
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

export default ApplyModal;
