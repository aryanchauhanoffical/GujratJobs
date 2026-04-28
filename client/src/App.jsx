import React from 'react';
import { HashRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import ProtectedRoute from './components/layout/ProtectedRoute';

// Public pages
import HomePage from './pages/HomePage';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import JobsPage from './pages/JobsPage';
import JobDetailPage from './pages/JobDetailPage';

// Seeker pages
import SeekerDashboard from './pages/seeker/SeekerDashboard';
import SeekerProfile from './pages/seeker/SeekerProfile';
import MyApplicationsPage from './pages/seeker/MyApplicationsPage';
import WalkInsPage from './pages/seeker/WalkInsPage';

// Recruiter pages
import RecruiterDashboard from './pages/recruiter/RecruiterDashboard';
import PostJobPage from './pages/recruiter/PostJobPage';
import ManageJobsPage from './pages/recruiter/ManageJobsPage';
import ViewApplicantsPage from './pages/recruiter/ViewApplicantsPage';
import RecruiterProfilePage from './pages/recruiter/RecruiterProfilePage';

// Admin pages
import AdminDashboard from './pages/admin/AdminDashboard';
import ManageUsersPage from './pages/admin/ManageUsersPage';
import ManageRecruitersPage from './pages/admin/ManageRecruitersPage';
import ScrapedJobsPage from './pages/admin/ScrapedJobsPage';

export default function App() {
  return (
    <Router>
      <AuthProvider>
        <Routes>
          {/* Public routes */}
          <Route path="/" element={<HomePage />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />
          <Route path="/jobs" element={<JobsPage />} />
          <Route path="/jobs/:id" element={<JobDetailPage />} />

          {/* Job Seeker routes */}
          <Route
            path="/dashboard"
            element={
              <ProtectedRoute roles={['jobseeker']}>
                <SeekerDashboard />
              </ProtectedRoute>
            }
          />
          <Route
            path="/profile"
            element={
              <ProtectedRoute roles={['jobseeker']}>
                <SeekerProfile />
              </ProtectedRoute>
            }
          />
          <Route
            path="/applications"
            element={
              <ProtectedRoute roles={['jobseeker']}>
                <MyApplicationsPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/walk-ins"
            element={
              <ProtectedRoute roles={['jobseeker']}>
                <WalkInsPage />
              </ProtectedRoute>
            }
          />

          {/* Recruiter routes */}
          <Route
            path="/recruiter/dashboard"
            element={
              <ProtectedRoute roles={['recruiter']}>
                <RecruiterDashboard />
              </ProtectedRoute>
            }
          />
          <Route
            path="/recruiter/post-job"
            element={
              <ProtectedRoute roles={['recruiter']}>
                <PostJobPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/recruiter/jobs"
            element={
              <ProtectedRoute roles={['recruiter']}>
                <ManageJobsPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/recruiter/jobs/:jobId/applicants"
            element={
              <ProtectedRoute roles={['recruiter']}>
                <ViewApplicantsPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/recruiter/profile"
            element={
              <ProtectedRoute roles={['recruiter']}>
                <RecruiterProfilePage />
              </ProtectedRoute>
            }
          />

          {/* Admin routes */}
          <Route
            path="/admin/dashboard"
            element={
              <ProtectedRoute roles={['admin']}>
                <AdminDashboard />
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin/users"
            element={
              <ProtectedRoute roles={['admin']}>
                <ManageUsersPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin/recruiters"
            element={
              <ProtectedRoute roles={['admin']}>
                <ManageRecruitersPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin/scraped-jobs"
            element={
              <ProtectedRoute roles={['admin']}>
                <ScrapedJobsPage />
              </ProtectedRoute>
            }
          />

          {/* Fallback */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </AuthProvider>
    </Router>
  );
}
