import React, { useState, useEffect } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import LoadingSpinner from '../ui/LoadingSpinner';
import Card from '../ui/Card';
import Button from '../ui/Button';
import Badge from '../ui/Badge';

// Simple PageLoader component for this file
const PageLoader = ({ message = "Loading..." }) => (
  <div className="min-h-screen flex items-center justify-center">
    <div className="text-center">
      <LoadingSpinner size="lg" />
      <p className="mt-4 text-gray-600">{message}</p>
    </div>
  </div>
);

// Authentication Guard Component
const AuthGuard = ({ children, fallback = null }) => {
  const { isAuthenticated, isInitializing, user } = useAuth();
  const location = useLocation();
  const [showTimeout, setShowTimeout] = useState(false);

  // Show timeout message if initialization takes too long
  useEffect(() => {
    const timer = setTimeout(() => {
      if (isInitializing) {
        setShowTimeout(true);
      }
    }, 10000); // 10 seconds

    return () => clearTimeout(timer);
  }, [isInitializing]);

  // Show loading while checking authentication
  if (isInitializing) {
    return fallback || (
      <PageLoader 
        message={showTimeout ? "This is taking longer than usual..." : "Verifying your session..."} 
      />
    );
  }

  // If not authenticated, redirect to login
  if (!isAuthenticated) {
    return (
      <Navigate 
        to="/login" 
        state={{ from: location.pathname + location.search }} 
        replace 
      />
    );
  }

  // User is authenticated, render children
  return children;
};

// Email Verification Guard
export const EmailVerificationGuard = ({ children, strict = true }) => {
  const { user, isEmailVerified, sendEmailVerification, isVerifyingEmail } = useAuth();
  const [dismissed, setDismissed] = useState(false);

  // If email is already verified, render children
  if (isEmailVerified()) {
    return children;
  }

  // If strict mode and email not verified, redirect
  if (strict) {
    return <Navigate to="/verify-email" replace />;
  }

  // If not strict and user dismissed the warning, render children
  if (dismissed) {
    return children;
  }

  // Show email verification warning
  return (
    <>
      <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4 mb-6">
        <div className="flex items-start">
          <div className="flex-shrink-0">
            <svg className="h-5 w-5 text-yellow-400" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
            </svg>
          </div>
          <div className="ml-3 flex-1">
            <h3 className="text-sm font-medium text-yellow-800">
              Email Verification Required
            </h3>
            <div className="mt-2 text-sm text-yellow-700">
              <p>
                Please verify your email address ({user?.email}) to access all features.
              </p>
            </div>
            <div className="mt-4 flex space-x-2">
              <Button
                size="sm"
                onClick={sendEmailVerification}
                loading={isVerifyingEmail}
                loadingText="Sending..."
              >
                Send Verification Email
              </Button>
              <Button
                size="sm"
                variant="secondary-outline"
                onClick={() => setDismissed(true)}
              >
                Dismiss
              </Button>
            </div>
          </div>
        </div>
      </div>
      {children}
    </>
  );
};

// Phone Verification Guard
export const PhoneVerificationGuard = ({ children, strict = false }) => {
  const { user, isPhoneVerified } = useAuth();
  const [dismissed, setDismissed] = useState(false);

  // If phone is already verified, render children
  if (isPhoneVerified()) {
    return children;
  }

  // If strict mode and phone not verified, redirect
  if (strict) {
    return <Navigate to="/verify-phone" replace />;
  }

  // If not strict and user dismissed the warning, render children
  if (dismissed) {
    return children;
  }

  // Show phone verification warning
  return (
    <>
      <div className="bg-blue-50 border-l-4 border-blue-400 p-4 mb-6">
        <div className="flex items-start">
          <div className="flex-shrink-0">
            <svg className="h-5 w-5 text-blue-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <div className="ml-3 flex-1">
            <h3 className="text-sm font-medium text-blue-800">
              Phone Verification Recommended
            </h3>
            <div className="mt-2 text-sm text-blue-700">
              <p>
                Verify your phone number ({user?.phone}) for enhanced security and notifications.
              </p>
            </div>
            <div className="mt-4 flex space-x-2">
              <Button
                size="sm"
                variant="info"
                onClick={() => window.location.href = '/verify-phone'}
              >
                Verify Phone
              </Button>
              <Button
                size="sm"
                variant="secondary-outline"
                onClick={() => setDismissed(true)}
              >
                Later
              </Button>
            </div>
          </div>
        </div>
      </div>
      {children}
    </>
  );
};

// Profile Completion Guard
export const ProfileCompletionGuard = ({ children, requiredFields = [], threshold = 70 }) => {
  const { user } = useAuth();
  const [dismissed, setDismissed] = useState(false);

  if (!user || dismissed) {
    return children;
  }

  // Calculate profile completion percentage
  const calculateCompletion = () => {
    const fields = [
      user.name?.first,
      user.name?.last,
      user.email,
      user.phone,
      user.avatar?.url,
      user.location?.address,
      user.bio
    ];

    const completedFields = fields.filter(field => field && field.toString().trim()).length;
    return Math.round((completedFields / fields.length) * 100);
  };

  const completionPercentage = calculateCompletion();

  // Check if required fields are missing
  const missingRequiredFields = requiredFields.filter(field => {
    const value = field.split('.').reduce((obj, key) => obj?.[key], user);
    return !value || !value.toString().trim();
  });

  // If completion is above threshold and no required fields missing, render children
  if (completionPercentage >= threshold && missingRequiredFields.length === 0) {
    return children;
  }

  // Show profile completion prompt
  return (
    <>
      <div className="bg-indigo-50 border-l-4 border-indigo-400 p-4 mb-6">
        <div className="flex items-start">
          <div className="flex-shrink-0">
            <svg className="h-5 w-5 text-indigo-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
            </svg>
          </div>
          <div className="ml-3 flex-1">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-medium text-indigo-800">
                Complete Your Profile
              </h3>
              <Badge variant="info" size="sm">
                {completionPercentage}% Complete
              </Badge>
            </div>
            <div className="mt-2">
              <div className="w-full bg-indigo-200 rounded-full h-2">
                <div 
                  className="bg-indigo-600 h-2 rounded-full transition-all duration-300"
                  style={{ width: `${completionPercentage}%` }}
                />
              </div>
            </div>
            {missingRequiredFields.length > 0 && (
              <div className="mt-2 text-sm text-indigo-700">
                <p>Required fields missing: {missingRequiredFields.join(', ')}</p>
              </div>
            )}
            <div className="mt-4 flex space-x-2">
              <Button
                size="sm"
                variant="primary"
                onClick={() => window.location.href = '/profile/edit'}
              >
                Complete Profile
              </Button>
              <Button
                size="sm"
                variant="secondary-outline"
                onClick={() => setDismissed(true)}
              >
                Skip for now
              </Button>
            </div>
          </div>
        </div>
      </div>
      {children}
    </>
  );
};

// Session Expiry Guard
export const SessionExpiryGuard = ({ children, warningTime = 5 * 60 * 1000 }) => { // 5 minutes
  const { user, logout, refreshUser } = useAuth();
  const [showWarning, setShowWarning] = useState(false);
  const [timeLeft, setTimeLeft] = useState(0);

  useEffect(() => {
    if (!user) return;

    const checkTokenExpiry = () => {
      const token = localStorage.getItem('auth_token');
      if (!token) return;

      try {
        // Decode JWT to get expiry time (basic implementation)
        const payload = JSON.parse(atob(token.split('.')[1]));
        const expiryTime = payload.exp * 1000; // Convert to milliseconds
        const currentTime = Date.now();
        const timeUntilExpiry = expiryTime - currentTime;

        if (timeUntilExpiry <= warningTime && timeUntilExpiry > 0) {
          setShowWarning(true);
          setTimeLeft(Math.floor(timeUntilExpiry / 1000)); // Convert to seconds
        } else if (timeUntilExpiry <= 0) {
          // Token expired, logout user
          logout();
        }
      } catch (error) {
        console.error('Error checking token expiry:', error);
      }
    };

    const interval = setInterval(checkTokenExpiry, 30000); // Check every 30 seconds
    checkTokenExpiry(); // Check immediately

    return () => clearInterval(interval);
  }, [user, logout, warningTime]);

  // Countdown timer for warning
  useEffect(() => {
    if (showWarning && timeLeft > 0) {
      const timer = setTimeout(() => {
        setTimeLeft(timeLeft - 1);
      }, 1000);

      return () => clearTimeout(timer);
    } else if (timeLeft <= 0) {
      setShowWarning(false);
    }
  }, [showWarning, timeLeft]);

  const handleExtendSession = async () => {
    try {
      await refreshUser();
      setShowWarning(false);
    } catch (error) {
      console.error('Failed to extend session:', error);
      logout();
    }
  };

  const formatTime = (seconds) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
  };

  return (
    <>
      {showWarning && (
        <div className="fixed top-0 left-0 right-0 z-50 bg-red-600 text-white p-4">
          <div className="max-w-7xl mx-auto flex items-center justify-between">
            <div className="flex items-center">
              <svg className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 16.5c-.77.833.192 2.5 1.732 2.5z" />
              </svg>
              <span className="font-medium">
                Session expires in {formatTime(timeLeft)}. Click to extend your session.
              </span>
            </div>
            <div className="flex space-x-2">
              <Button
                size="sm"
                variant="light"
                onClick={handleExtendSession}
              >
                Extend Session
              </Button>
              <Button
                size="sm"
                variant="secondary-outline"
                onClick={() => setShowWarning(false)}
              >
                Dismiss
              </Button>
            </div>
          </div>
        </div>
      )}
      <div className={showWarning ? 'pt-16' : ''}>
        {children}
      </div>
    </>
  );
};

// Maintenance Mode Guard
export const MaintenanceGuard = ({ children, isMaintenanceMode = false }) => {
  const { hasRole } = useAuth();

  if (isMaintenanceMode && !hasRole('admin')) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <Card className="max-w-md w-full text-center">
          <div className="w-16 h-16 bg-yellow-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8 text-yellow-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 7.172V5L8 4z" />
            </svg>
          </div>
          <h3 className="text-xl font-bold text-gray-900 mb-4">Under Maintenance</h3>
          <p className="text-gray-600 mb-4">
            We're currently performing scheduled maintenance to improve your experience. 
            We'll be back shortly!
          </p>
          <div className="space-y-2 text-sm text-gray-500">
            <p>• Estimated time: 30 minutes</p>
            <p>• Follow us on Twitter for updates</p>
            <p>• Emergency support: support@example.com</p>
          </div>
        </Card>
      </div>
    );
  }

  return children;
};

// Combined Security Guard (wraps multiple guards)
export const SecurityGuard = ({ 
  children,
  requireAuth = true,
  requireEmailVerification = false,
  requirePhoneVerification = false,
  strictEmailVerification = false,
  strictPhoneVerification = false,
  profileCompletionThreshold = 0,
  enableSessionWarning = true,
  isMaintenanceMode = false,
  ...props
}) => {
  let content = children;

  // Apply guards in reverse order (innermost first)
  if (enableSessionWarning) {
    content = <SessionExpiryGuard>{content}</SessionExpiryGuard>;
  }

  if (profileCompletionThreshold > 0) {
    content = (
      <ProfileCompletionGuard threshold={profileCompletionThreshold}>
        {content}
      </ProfileCompletionGuard>
    );
  }

  if (requirePhoneVerification) {
    content = (
      <PhoneVerificationGuard strict={strictPhoneVerification}>
        {content}
      </PhoneVerificationGuard>
    );
  }

  if (requireEmailVerification) {
    content = (
      <EmailVerificationGuard strict={strictEmailVerification}>
        {content}
      </EmailVerificationGuard>
    );
  }

  if (requireAuth) {
    content = <AuthGuard>{content}</AuthGuard>;
  }

  if (isMaintenanceMode !== false) {
    content = (
      <MaintenanceGuard isMaintenanceMode={isMaintenanceMode}>
        {content}
      </MaintenanceGuard>
    );
  }

  return content;
};

export default AuthGuard;