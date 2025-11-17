import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import LoadingSpinner from '../components/ui/LoadingSpinner';

const PublicRoute = ({ children, redirectIfAuthenticated = true }) => {
  const { user, loading } = useAuth();
  const location = useLocation();

  // Show loading spinner while checking authentication
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <LoadingSpinner size="lg" />
          <p className="mt-4 text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  // If user is authenticated and we should redirect authenticated users
  if (user && redirectIfAuthenticated) {
    // Check email verification status using the correct field
    const isEmailVerified = user.verified_status?.email || user.isEmailVerified || false;
    
    // If user's email is not verified, allow access to verification pages
    if (!isEmailVerified && 
        (location.pathname === '/verify-email' || 
         location.pathname === '/register')) {
      return children;
    }

    // Get the intended destination from location state or default to dashboard
    const from = location.state?.from || '/dashboard';
    
    // If user is verified, redirect to intended destination
    if (isEmailVerified) {
      return <Navigate to={from} replace />;
    }

    // If user exists but not verified, redirect to email verification
    return <Navigate to="/verify-email" replace />;
  }

  // User is not authenticated or we allow authenticated users, render the public component
  return children;
};

// Specific component for authentication pages (login, register, forgot password)
export const AuthRoute = ({ children }) => {
  return (
    <PublicRoute redirectIfAuthenticated={true}>
      {children}
    </PublicRoute>
  );
};

// Component for pages that can be accessed by both authenticated and unauthenticated users
export const MixedRoute = ({ children }) => {
  return (
    <PublicRoute redirectIfAuthenticated={false}>
      {children}
    </PublicRoute>
  );
};

export default PublicRoute;