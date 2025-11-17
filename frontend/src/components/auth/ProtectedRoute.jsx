import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import LoadingSpinner from '../ui/LoadingSpinner';

// Simple PageLoader component for this file
const PageLoader = ({ message = "Loading..." }) => (
  <div className="min-h-screen flex items-center justify-center">
    <div className="text-center">
      <LoadingSpinner size="lg" />
      <p className="mt-4 text-gray-600">{message}</p>
    </div>
  </div>
);

// Base Protected Route Component
const ProtectedRoute = ({ 
  children, 
  requireAuth = true,
  requireEmailVerification = false,
  requirePhoneVerification = false,
  redirectTo = '/login',
  fallback = null,
  ...props 
}) => {
  const { 
    isAuthenticated, 
    isInitializing, 
    user, 
    isEmailVerified, 
    isPhoneVerified 
  } = useAuth();
  const location = useLocation();

  // Show loading while initializing authentication
  if (isInitializing) {
    return fallback || <PageLoader message="Checking authentication..." />;
  }

  // If authentication is required but user is not authenticated
  if (requireAuth && !isAuthenticated) {
    // Save the attempted location for redirect after login
    return (
      <Navigate 
        to={redirectTo} 
        state={{ from: location.pathname + location.search }} 
        replace 
      />
    );
  }

  // If no authentication is required but user is authenticated (e.g., login page)
  if (!requireAuth && isAuthenticated) {
    // Redirect to dashboard if user tries to access auth pages while logged in
    const from = location.state?.from || '/dashboard';
    return <Navigate to={from} replace />;
  }

  // Check email verification requirement
  if (requireEmailVerification && !isEmailVerified()) {
    return <Navigate to="/verify-email" replace />;
  }

  // Check phone verification requirement
  if (requirePhoneVerification && !isPhoneVerified()) {
    return <Navigate to="/verify-phone" replace />;
  }

  // All checks passed, render the protected component
  return children;
};

// Role-based Protected Route Component
export const RoleBasedRoute = ({ 
  children, 
  requiredRoles = [],
  requireAuth = true,
  requireEmailVerification = false,
  requirePhoneVerification = false,
  redirectTo = '/unauthorized',
  fallback = null,
  showFallback = true,
  ...props 
}) => {
  const { 
    isAuthenticated, 
    isInitializing, 
    user, 
    hasRole,
    isEmailVerified,
    isPhoneVerified
  } = useAuth();
  const location = useLocation();

  // Show loading while initializing authentication
  if (isInitializing) {
    return fallback || <PageLoader message="Checking permissions..." />;
  }

  // If authentication is required but user is not authenticated
  if (requireAuth && !isAuthenticated) {
    return (
      <Navigate 
        to="/login" 
        state={{ from: location.pathname + location.search }} 
        replace 
      />
    );
  }

  // Check email verification requirement
  if (requireEmailVerification && !isEmailVerified()) {
    return <Navigate to="/verify-email" replace />;
  }

  // Check phone verification requirement
  if (requirePhoneVerification && !isPhoneVerified()) {
    return <Navigate to="/verify-phone" replace />;
  }

  // Check role requirements
  if (requiredRoles.length > 0 && !hasRole(requiredRoles)) {
    if (showFallback) {
      return (
        <UnauthorizedFallback 
          userRole={user?.role}
          requiredRoles={requiredRoles}
          redirectTo={redirectTo}
        />
      );
    }
    return <Navigate to={redirectTo} replace />;
  }

  // All checks passed, render the protected component
  return children;
};

// Admin Route Component (shorthand for admin role)
export const AdminRoute = ({ children, ...props }) => {
  return (
    <RoleBasedRoute
      requiredRoles={['admin']}
      requireEmailVerification={true}
      {...props}
    >
      {children}
    </RoleBasedRoute>
  );
};

// Owner Route Component (for property owners)
export const OwnerRoute = ({ children, ...props }) => {
  return (
    <RoleBasedRoute
      requiredRoles={['owner', 'both', 'admin']}
      requireEmailVerification={true}
      {...props}
    >
      {children}
    </RoleBasedRoute>
  );
};

// Renter Route Component (for renters)
export const RenterRoute = ({ children, ...props }) => {
  return (
    <RoleBasedRoute
      requiredRoles={['renter', 'both', 'admin']}
      requireEmailVerification={true}
      {...props}
    >
      {children}
    </RoleBasedRoute>
  );
};

// Guest Route Component (for non-authenticated users only)
export const GuestRoute = ({ children, redirectTo = '/dashboard', ...props }) => {
  return (
    <ProtectedRoute
      requireAuth={false}
      redirectTo={redirectTo}
      {...props}
    >
      {children}
    </ProtectedRoute>
  );
};

// Email Verification Required Route
export const EmailVerifiedRoute = ({ children, ...props }) => {
  return (
    <ProtectedRoute
      requireAuth={true}
      requireEmailVerification={true}
      {...props}
    >
      {children}
    </ProtectedRoute>
  );
};

// Phone Verification Required Route
export const PhoneVerifiedRoute = ({ children, ...props }) => {
  return (
    <ProtectedRoute
      requireAuth={true}
      requireEmailVerification={true}
      requirePhoneVerification={true}
      {...props}
    >
      {children}
    </ProtectedRoute>
  );
};

// Unauthorized Fallback Component
const UnauthorizedFallback = ({ userRole, requiredRoles, redirectTo }) => {
  const navigate = useLocation();

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="max-w-md w-full bg-white shadow-lg rounded-lg p-8 text-center">
        <div className="mb-6">
          <div className="w-20 h-20 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg 
              className="w-10 h-10 text-red-600" 
              fill="none" 
              viewBox="0 0 24 24" 
              stroke="currentColor"
            >
              <path 
                strokeLinecap="round" 
                strokeLinejoin="round" 
                strokeWidth={2} 
                d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 16.5c-.77.833.192 2.5 1.732 2.5z" 
              />
            </svg>
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">
            Access Denied
          </h2>
          <p className="text-gray-600 mb-4">
            You don't have permission to access this page.
          </p>
        </div>

        <div className="bg-gray-50 rounded-lg p-4 mb-6">
          <div className="text-sm">
            <div className="flex justify-between items-center mb-2">
              <span className="text-gray-500">Your Role:</span>
              <span className="font-medium text-gray-900 capitalize">
                {userRole || 'None'}
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-gray-500">Required Role:</span>
              <span className="font-medium text-gray-900">
                {Array.isArray(requiredRoles) ? requiredRoles.join(' or ') : requiredRoles}
              </span>
            </div>
          </div>
        </div>

        <div className="space-y-3">
          <button
            onClick={() => window.history.back()}
            className="w-full bg-gray-600 text-white py-2 px-4 rounded-lg hover:bg-gray-700 transition-colors"
          >
            Go Back
          </button>
          <button
            onClick={() => window.location.href = '/dashboard'}
            className="w-full bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 transition-colors"
          >
            Go to Dashboard
          </button>
        </div>

        <div className="mt-6 pt-6 border-t border-gray-200">
          <p className="text-xs text-gray-500">
            If you believe this is an error, please contact support.
          </p>
        </div>
      </div>
    </div>
  );
};

// Route Guard Hook - for programmatic route protection
export const useRouteGuard = () => {
  const { isAuthenticated, hasRole, isEmailVerified, isPhoneVerified } = useAuth();
  const location = useLocation();

  const canAccess = (requirements = {}) => {
    const {
      requireAuth = false,
      requiredRoles = [],
      requireEmailVerification = false,
      requirePhoneVerification = false
    } = requirements;

    // Check authentication
    if (requireAuth && !isAuthenticated) {
      return { allowed: false, reason: 'authentication_required', redirectTo: '/login' };
    }

    // Check email verification
    if (requireEmailVerification && !isEmailVerified()) {
      return { allowed: false, reason: 'email_verification_required', redirectTo: '/verify-email' };
    }

    // Check phone verification
    if (requirePhoneVerification && !isPhoneVerified()) {
      return { allowed: false, reason: 'phone_verification_required', redirectTo: '/verify-phone' };
    }

    // Check roles
    if (requiredRoles.length > 0 && !hasRole(requiredRoles)) {
      return { allowed: false, reason: 'insufficient_permissions', redirectTo: '/unauthorized' };
    }

    return { allowed: true };
  };

  const redirectToLogin = (returnTo = location.pathname + location.search) => {
    return `/login?returnTo=${encodeURIComponent(returnTo)}`;
  };

  return {
    canAccess,
    redirectToLogin,
    isAuthenticated,
    hasRole,
    isEmailVerified,
    isPhoneVerified
  };
};

// Higher-Order Component for route protection
export const withRouteProtection = (Component, requirements = {}) => {
  return function ProtectedComponent(props) {
    const { canAccess } = useRouteGuard();
    const result = canAccess(requirements);

    if (!result.allowed) {
      return <Navigate to={result.redirectTo} replace />;
    }

    return <Component {...props} />;
  };
};

// Conditional Render Component based on permissions
export const ConditionalRender = ({ 
  children, 
  requireAuth = false,
  requiredRoles = [],
  requireEmailVerification = false,
  requirePhoneVerification = false,
  fallback = null,
  showFallback = true
}) => {
  const { canAccess } = useRouteGuard();
  const result = canAccess({
    requireAuth,
    requiredRoles,
    requireEmailVerification,
    requirePhoneVerification
  });

  if (!result.allowed) {
    return showFallback ? fallback : null;
  }

  return children;
};

export default ProtectedRoute;