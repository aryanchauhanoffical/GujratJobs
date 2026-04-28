import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import LoadingSpinner from './LoadingSpinner';

const ProtectedRoute = ({ children, roles = [] }) => {
  const { user, isLoading, isAuthenticated } = useAuth();
  const location = useLocation();

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location.pathname }} replace />;
  }

  if (roles.length > 0 && !roles.includes(user?.role)) {
    // Redirect to appropriate dashboard
    const dashboardMap = {
      jobseeker: '/dashboard',
      recruiter: '/recruiter/dashboard',
      admin: '/admin/dashboard',
    };
    return <Navigate to={dashboardMap[user?.role] || '/'} replace />;
  }

  return children;
};

export default ProtectedRoute;
