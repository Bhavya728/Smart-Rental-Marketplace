import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useAuth } from '../../contexts/AuthContext';
import Input, { EmailInput } from '../ui/Input';
import Button from '../ui/Button';
import Card, { CardHeader, CardTitle, CardContent, CardFooter } from '../ui/Card';
import { GoogleButton, FacebookButton } from '../ui/Button';
import { cn } from '../../utils/cn';

const LoginForm = ({ className, onSuccess, redirectTo = '/dashboard', ...props }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const { login, isLoggingIn, error, clearError, user } = useAuth();
  
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    rememberMe: false
  });
  
  const [fieldErrors, setFieldErrors] = useState({});

  // Handle input changes
  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
    
    // Clear field error when user starts typing
    if (fieldErrors[name]) {
      setFieldErrors(prev => ({ ...prev, [name]: '' }));
    }
    
    // Clear global error when user starts typing
    if (error) {
      clearError();
    }
  };

  // Validate form
  const validateForm = () => {
    const errors = {};
    
    if (!formData.email) {
      errors.email = 'Email is required';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      errors.email = 'Please enter a valid email address';
    }
    
    if (!formData.password) {
      errors.password = 'Password is required';
    } else if (formData.password.length < 6) {
      errors.password = 'Password must be at least 6 characters';
    }
    
    setFieldErrors(errors);
    return Object.keys(errors).length === 0;
  };

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    try {
      const response = await login({
        email: formData.email,
        password: formData.password,
        rememberMe: formData.rememberMe
      });

      console.log('Login successful, response:', response);

      // Call success callback if provided
      if (onSuccess) {
        onSuccess();
      } else {
        // Simple redirect to dashboard after successful login
        console.log('Redirecting to dashboard...');
        navigate('/dashboard', { replace: true });
      }
    } catch (err) {
      // Error is handled by the auth context
      console.error('Login failed:', err);
    }
  };

  // Handle social login (placeholder)
  const handleSocialLogin = (provider) => {
    // This would typically redirect to OAuth provider
    console.log(`Social login with ${provider}`);
    // For now, just show a message
    alert(`${provider} login integration coming soon!`);
  };

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
          <CardTitle className="text-center text-2xl">
            Welcome Back
          </CardTitle>
          <p className="text-center text-gray-600 mt-2">
            Sign in to your account to continue
          </p>
        </CardHeader>

        <CardContent>
          {/* Social Login Buttons */}
          <div className="space-y-3 mb-6">
            <GoogleButton 
              onClick={() => handleSocialLogin('Google')}
              className="w-full"
            />
            <FacebookButton 
              onClick={() => handleSocialLogin('Facebook')}
              className="w-full"
            />
          </div>

          {/* Divider */}
          <div className="relative mb-6">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-gray-300" />
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="px-2 bg-white text-gray-500">Or continue with email</span>
            </div>
          </div>

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

          {/* Login Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            <EmailInput
              name="email"
              label="Email Address"
              value={formData.email}
              onChange={handleChange}
              error={fieldErrors.email}
              placeholder="Enter your email"
              autoComplete="email"
              required
              disabled={isLoggingIn}
            />

            <Input
              type="password"
              name="password"
              label="Password"
              value={formData.password}
              onChange={handleChange}
              error={fieldErrors.password}
              placeholder="Enter your password"
              autoComplete="current-password"
              required
              disabled={isLoggingIn}
            />

            {/* Remember Me & Forgot Password */}
            <div className="flex items-center justify-between">
              <label className="flex items-center">
                <input
                  type="checkbox"
                  name="rememberMe"
                  checked={formData.rememberMe}
                  onChange={handleChange}
                  disabled={isLoggingIn}
                  className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                />
                <span className="ml-2 text-sm text-gray-600">Remember me</span>
              </label>
              
              <Link 
                to="/forgot-password"
                className="text-sm text-blue-600 hover:text-blue-800 focus:outline-none focus:underline"
              >
                Forgot password?
              </Link>
            </div>

            {/* Submit Button */}
            <Button
              type="submit"
              className="w-full"
              loading={isLoggingIn}
              loadingText="Signing in..."
              disabled={isLoggingIn}
            >
              Sign In
            </Button>
          </form>
        </CardContent>

        <CardFooter>
          <p className="text-center text-sm text-gray-600 w-full">
            Don't have an account?{' '}
            <Link 
              to="/register"
              className="text-blue-600 hover:text-blue-800 font-medium focus:outline-none focus:underline"
            >
              Create one here
            </Link>
          </p>
        </CardFooter>
      </Card>
    </motion.div>
  );
};

export default LoginForm;