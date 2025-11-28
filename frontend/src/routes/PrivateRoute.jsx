import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import LoadingSpinner from '../components/ui/LoadingSpinner';

const PrivateRoute = ({ children }) => {
  const { user, loading, isEmailVerified } = useAuth();
  const location = useLocation();

  // Show loading spinner while checking authentication
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <LoadingSpinner size="lg" />
          <p className="mt-4 text-gray-600">Verifying authentication...</p>
        </div>
      </div>
    );
  }

  // If not authenticated, redirect to login with return url
  if (!user) {
    return (
      <Navigate 
        to="/login" 
        state={{ from: location.pathname }}
        replace 
      />
    );
  }

  // If user exists but email is not verified, redirect to email verification
  if (user && !isEmailVerified()) {
    // Allow access to email verification and logout routes
    if (location.pathname === '/verify-email' || location.pathname === '/logout') {
      return children;
    }
    
    return (
      <Navigate 
        to="/verify-email" 
        state={{ from: location.pathname }}
        replace 
      />
    );
  }

  // User is authenticated and verified, render the protected component
  return children;
};

export default PrivateRoute;