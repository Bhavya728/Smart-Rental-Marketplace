import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useAuth } from '../../contexts/AuthContext';
import Input from '../ui/Input';
import Button from '../ui/Button';
import Card, { CardHeader, CardTitle, CardContent, CardFooter } from '../ui/Card';
import Badge from '../ui/Badge';
import { cn } from '../../utils/cn';

const EmailVerificationForm = ({ className, onSuccess, ...props }) => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { 
    user, 
    verifyEmail, 
    verifyEmailOTP, 
    sendEmailVerification, 
    sendEmailOTP,
    refreshUser,
    isVerifyingEmail, 
    error, 
    clearError 
  } = useAuth();
  
  const [verificationMethod, setVerificationMethod] = useState('link'); // 'link' or 'otp'
  const [token, setToken] = useState(searchParams.get('token') || '');
  const [otp, setOTP] = useState('');
  const [otpError, setOTPError] = useState('');
  const [isVerified, setIsVerified] = useState(false);
  const [countdown, setCountdown] = useState(0);
  const [redirectCountdown, setRedirectCountdown] = useState(0);

  // Check if user is already verified
  useEffect(() => {
    if (user?.verified_status?.email) {
      setIsVerified(true);
      // Start redirect countdown for already verified users
      if (!onSuccess) {
        setRedirectCountdown(3);
      }
    }
  }, [user, onSuccess]);

  // Handle token verification on mount
  useEffect(() => {
    if (token && !isVerified) {
      handleTokenVerification();
    }
  }, [token, isVerified]);

  // Countdown timer for resend button
  useEffect(() => {
    if (countdown > 0) {
      const timer = setTimeout(() => setCountdown(countdown - 1), 1000);
      return () => clearTimeout(timer);
    }
  }, [countdown]);

  // Redirect countdown timer for success state
  useEffect(() => {
    if (redirectCountdown > 0) {
      const timer = setTimeout(() => {
        if (redirectCountdown === 1) {
          console.log('Redirect countdown complete, navigating to dashboard');
          navigate('/dashboard', { replace: true });
        } else {
          setRedirectCountdown(redirectCountdown - 1);
        }
      }, 1000);
      return () => clearTimeout(timer);
    }
  }, [redirectCountdown, navigate]);

  // Handle token-based verification
  const handleTokenVerification = async () => {
    if (!token) return;

    try {
      await verifyEmail(token);
      await refreshUser(); // Refresh user data to get updated verification status
      setIsVerified(true);
      
      console.log('Email verification successful, user state updated');
      
      if (onSuccess) {
        onSuccess();
      } else {
        // Start redirect countdown if no custom onSuccess handler
        console.log('Starting redirect countdown to dashboard');
        setRedirectCountdown(5);
      }
    } catch (err) {
      console.error('Token verification failed:', err);
      // Allow user to try OTP method instead
      setVerificationMethod('otp');
    }
  };

  // Handle OTP input change
  const handleOTPChange = (e) => {
    const value = e.target.value.replace(/\D/g, '').slice(0, 6); // Only numbers, max 6 digits
    setOTP(value);
    
    if (otpError) {
      setOTPError('');
    }
    if (error) {
      clearError();
    }

    // Auto-submit when 6 digits are entered
    if (value.length === 6) {
      handleOTPVerification(value);
    }
  };

  // Handle OTP verification
  const handleOTPVerification = async (otpValue = otp) => {
    if (!otpValue || otpValue.length !== 6) {
      setOTPError('Please enter a valid 6-digit code');
      return;
    }

    try {
      await verifyEmailOTP(otpValue);
      await refreshUser(); // Refresh user data to get updated verification status
      setIsVerified(true);
      
      console.log('Email OTP verification successful, user state updated');
      
      if (onSuccess) {
        onSuccess();
      } else {
        // Start redirect countdown if no custom onSuccess handler
        console.log('Starting redirect countdown to dashboard');
        setRedirectCountdown(5);
      }
    } catch (err) {
      console.error('OTP verification failed:', err);
      setOTPError('Invalid verification code. Please try again.');
    }
  };

  // Handle sending verification email
  const handleSendVerificationEmail = async () => {
    try {
      await sendEmailVerification();
      setCountdown(60); // 60 second cooldown
    } catch (err) {
      console.error('Failed to send verification email:', err);
    }
  };

  // Handle sending OTP
  const handleSendOTP = async () => {
    try {
      await sendEmailOTP();
      setCountdown(60); // 60 second cooldown
    } catch (err) {
      console.error('Failed to send OTP:', err);
    }
  };

  // Success state - email verified
  if (isVerified) {
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
                    d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" 
                  />
                </svg>
              </div>
            </div>
            <CardTitle className="text-center text-2xl">
              Email Verified Successfully!
            </CardTitle>
            <p className="text-center text-gray-600 mt-2">
              Your email address has been verified. You now have full access to your account.
            </p>
          </CardHeader>

          <CardContent>
            <div className="space-y-4">
              <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                <div className="flex items-center">
                  <Badge variant="success" className="mr-2">Verified</Badge>
                  <span className="text-sm text-green-800">
                    {user?.email}
                  </span>
                </div>
              </div>

              <div className="text-center">
                <p className="text-sm text-gray-600 mb-4">
                  You can now enjoy all features of the platform!
                </p>
                {redirectCountdown > 0 ? (
                  <div className="space-y-3">
                    <p className="text-sm text-blue-600">
                      Redirecting to dashboard in {redirectCountdown} seconds...
                    </p>
                    <Button
                      onClick={() => {
                        setRedirectCountdown(0);
                        navigate('/dashboard');
                      }}
                      className="w-full"
                    >
                      Continue Now
                    </Button>
                  </div>
                ) : (
                  <Button
                    onClick={() => navigate('/dashboard')}
                    className="w-full"
                  >
                    Continue to Dashboard
                  </Button>
                )}
              </div>
            </div>
          </CardContent>
        </Card>
      </motion.div>
    );
  }

  // Verification form state
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
                  d="M3 8l7.89 4.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" 
                />
              </svg>
            </div>
          </div>
          <CardTitle className="text-center text-2xl">
            Verify Your Email
          </CardTitle>
          <p className="text-center text-gray-600 mt-2">
            We need to verify your email address to complete your registration
          </p>
          {user?.email && (
            <div className="text-center mt-2">
              <Badge variant="info" className="inline-flex items-center">
                <svg className="w-3 h-3 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 12a4 4 0 10-8 0 4 4 0 008 0zm0 0v1.5a2.5 2.5 0 005 0V12a9 9 0 10-9 9m4.5-1.206a8.959 8.959 0 01-4.5 1.207" />
                </svg>
                {user.email}
              </Badge>
            </div>
          )}
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

          {/* Verification Method Tabs */}
          <div className="flex mb-6 p-1 bg-gray-100 rounded-lg">
            <button
              onClick={() => setVerificationMethod('link')}
              className={cn(
                'flex-1 py-2 px-4 text-sm font-medium rounded-md transition-colors',
                verificationMethod === 'link'
                  ? 'bg-white text-blue-600 shadow-sm'
                  : 'text-gray-600 hover:text-gray-900'
              )}
            >
              Email Link
            </button>
            <button
              onClick={() => setVerificationMethod('otp')}
              className={cn(
                'flex-1 py-2 px-4 text-sm font-medium rounded-md transition-colors',
                verificationMethod === 'otp'
                  ? 'bg-white text-blue-600 shadow-sm'
                  : 'text-gray-600 hover:text-gray-900'
              )}
            >
              6-Digit Code
            </button>
          </div>

          {/* Email Link Method */}
          {verificationMethod === 'link' && (
            <div className="space-y-4">
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <h4 className="text-sm font-medium text-blue-800 mb-2">
                  Check your email for verification link
                </h4>
                <ol className="text-sm text-blue-700 space-y-1 list-decimal list-inside">
                  <li>Check your email inbox</li>
                  <li>Look for our verification email</li>
                  <li>Click the "Verify Email" button</li>
                </ol>
              </div>

              <div className="text-center">
                <p className="text-sm text-gray-600 mb-3">
                  Didn't receive the email?
                </p>
                <Button
                  variant="secondary-outline"
                  onClick={handleSendVerificationEmail}
                  loading={isVerifyingEmail}
                  loadingText="Sending..."
                  disabled={isVerifyingEmail || countdown > 0}
                  className="w-full"
                >
                  {countdown > 0 ? `Resend in ${countdown}s` : 'Resend Verification Email'}
                </Button>
              </div>
            </div>
          )}

          {/* OTP Method */}
          {verificationMethod === 'otp' && (
            <div className="space-y-4">
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <p className="text-sm text-blue-800">
                  Enter the 6-digit verification code sent to your email
                </p>
              </div>

              <div>
                <Input
                  label="Verification Code"
                  value={otp}
                  onChange={handleOTPChange}
                  error={otpError}
                  placeholder="000000"
                  maxLength={6}
                  className="text-center text-2xl font-mono tracking-widest"
                  disabled={isVerifyingEmail}
                  autoFocus
                />
                <p className="text-xs text-gray-500 mt-1 text-center">
                  Code will be automatically verified when complete
                </p>
              </div>

              <div className="flex space-x-3">
                <Button
                  variant="secondary-outline"
                  onClick={handleSendOTP}
                  loading={isVerifyingEmail && !otp}
                  loadingText="Sending..."
                  disabled={isVerifyingEmail || countdown > 0}
                  className="flex-1"
                >
                  {countdown > 0 ? `${countdown}s` : 'Send Code'}
                </Button>
                <Button
                  onClick={() => handleOTPVerification()}
                  loading={isVerifyingEmail && otp}
                  loadingText="Verifying..."
                  disabled={otp.length !== 6 || isVerifyingEmail}
                  className="flex-1"
                >
                  Verify
                </Button>
              </div>
            </div>
          )}
        </CardContent>

        <CardFooter>
          <div className="w-full text-center space-y-2">
            <Link 
              to="/dashboard"
              className="text-gray-600 hover:text-gray-800 text-sm focus:outline-none focus:underline"
            >
              Skip for now
            </Link>
            <div className="text-xs text-gray-500">
              You can verify your email later from your profile settings
            </div>
          </div>
        </CardFooter>
      </Card>
    </motion.div>
  );
};

export default EmailVerificationForm;