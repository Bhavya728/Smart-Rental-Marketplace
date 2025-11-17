import React, { useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useAuth } from '../../contexts/AuthContext';
import Input, { EmailInput } from '../ui/Input';
import Button from '../ui/Button';
import Card, { CardHeader, CardTitle, CardContent, CardFooter } from '../ui/Card';
import { cn } from '../../utils/cn';

const ForgotPasswordForm = ({ className, onSuccess, ...props }) => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { forgotPassword, isResettingPassword, error, clearError } = useAuth();
  
  const [email, setEmail] = useState(searchParams.get('email') || '');
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [emailError, setEmailError] = useState('');

  // Handle email change
  const handleEmailChange = (e) => {
    setEmail(e.target.value);
    
    // Clear errors when user starts typing
    if (emailError) {
      setEmailError('');
    }
    if (error) {
      clearError();
    }
  };

  // Validate email
  const validateEmail = () => {
    if (!email.trim()) {
      setEmailError('Email is required');
      return false;
    }
    
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      setEmailError('Please enter a valid email address');
      return false;
    }
    
    return true;
  };

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateEmail()) {
      return;
    }

    try {
      await forgotPassword(email.trim().toLowerCase());
      setIsSubmitted(true);
      
      // Call success callback if provided
      if (onSuccess) {
        onSuccess(email);
      }
    } catch (err) {
      // Error is handled by the auth context
      console.error('Forgot password failed:', err);
    }
  };

  // Handle resend email
  const handleResendEmail = async () => {
    try {
      await forgotPassword(email.trim().toLowerCase());
    } catch (err) {
      console.error('Resend email failed:', err);
    }
  };

  // Success state - show confirmation
  if (isSubmitted) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className={className}
        {...props}
      >
        <Card className="w-full max-w-md mx-auto">
          <CardHeader>
            <div className="flex justify-center mb-4">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center">
                <svg 
                  className="w-8 h-8 text-green-600" 
                  fill="none" 
                  viewBox="0 0 24 24" 
                  stroke="currentColor"
                >
                  <path 
                    strokeLinecap="round" 
                    strokeLinejoin="round" 
                    strokeWidth={2} 
                    d="M3 8l7.89 4.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" 
                  />
                </svg>
              </div>
            </div>
            <CardTitle className="text-center text-2xl">
              Check Your Email
            </CardTitle>
            <p className="text-center text-gray-600 mt-2">
              We've sent password reset instructions to
            </p>
            <p className="text-center text-gray-900 font-medium">
              {email}
            </p>
          </CardHeader>

          <CardContent>
            <div className="space-y-4">
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <h4 className="text-sm font-medium text-blue-800 mb-2">
                  What to do next:
                </h4>
                <ol className="text-sm text-blue-700 space-y-1 list-decimal list-inside">
                  <li>Check your email inbox</li>
                  <li>Look for an email from us (check spam folder too)</li>
                  <li>Click the reset link in the email</li>
                  <li>Create your new password</li>
                </ol>
              </div>

              <div className="text-center">
                <p className="text-sm text-gray-600 mb-3">
                  Didn't receive the email?
                </p>
                <Button
                  variant="secondary-outline"
                  onClick={handleResendEmail}
                  loading={isResettingPassword}
                  loadingText="Sending..."
                  disabled={isResettingPassword}
                  className="w-full"
                >
                  Resend Email
                </Button>
              </div>
            </div>
          </CardContent>

          <CardFooter>
            <div className="w-full text-center space-y-2">
              <Link 
                to="/login"
                className="text-blue-600 hover:text-blue-800 text-sm font-medium focus:outline-none focus:underline"
              >
                Back to Sign In
              </Link>
              <div className="text-sm text-gray-500">
                Remember your password?{' '}
                <Link 
                  to="/login"
                  className="text-blue-600 hover:text-blue-800 font-medium focus:outline-none focus:underline"
                >
                  Sign in instead
                </Link>
              </div>
            </div>
          </CardFooter>
        </Card>
      </motion.div>
    );
  }

  // Form state - show email input
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className={className}
      {...props}
    >
      <Card className="w-full max-w-md mx-auto">
        <CardHeader>
          <div className="flex justify-center mb-4">
            <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center">
              <svg 
                className="w-8 h-8 text-blue-600" 
                fill="none" 
                viewBox="0 0 24 24" 
                stroke="currentColor"
              >
                <path 
                  strokeLinecap="round" 
                  strokeLinejoin="round" 
                  strokeWidth={2} 
                  d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 1121 9z" 
                />
              </svg>
            </div>
          </div>
          <CardTitle className="text-center text-2xl">
            Forgot Password?
          </CardTitle>
          <p className="text-center text-gray-600 mt-2">
            No worries! Enter your email and we'll send you reset instructions.
          </p>
        </CardHeader>

        <CardContent>
          {/* Error Display */}
          {error && (
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg"
            >
              <p className="text-sm text-red-600">{error}</p>
            </motion.div>
          )}

          {/* Forgot Password Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            <EmailInput
              name="email"
              label="Email Address"
              value={email}
              onChange={handleEmailChange}
              error={emailError}
              placeholder="Enter your email address"
              autoComplete="email"
              autoFocus
              required
              disabled={isResettingPassword}
            />

            {/* Submit Button */}
            <Button
              type="submit"
              className="w-full"
              loading={isResettingPassword}
              loadingText="Sending instructions..."
              disabled={isResettingPassword}
            >
              Send Reset Instructions
            </Button>
          </form>
        </CardContent>

        <CardFooter>
          <div className="w-full text-center space-y-2">
            <Link 
              to="/login"
              className="text-blue-600 hover:text-blue-800 text-sm font-medium focus:outline-none focus:underline"
            >
              Back to Sign In
            </Link>
            <div className="text-sm text-gray-500">
              Don't have an account?{' '}
              <Link 
                to="/register"
                className="text-blue-600 hover:text-blue-800 font-medium focus:outline-none focus:underline"
              >
                Create one here
              </Link>
            </div>
          </div>
        </CardFooter>
      </Card>
    </motion.div>
  );
};

export default ForgotPasswordForm;