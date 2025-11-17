import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft, Mail } from 'lucide-react';
import ForgotPasswordForm from '../components/auth/ForgotPasswordForm';
import { FormContainer } from '../components/layout/Container';
import Card from '../components/ui/Card';

const ForgotPassword = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <FormContainer>
        <div className="sm:mx-auto sm:w-full sm:max-w-md">
          {/* Back to Login */}
          <Link 
            to="/login" 
            className="inline-flex items-center text-sm font-medium text-gray-500 hover:text-gray-700 mb-6 transition-colors duration-200"
          >
            <ArrowLeft size={16} className="mr-1" />
            Back to Login
          </Link>

          {/* Header */}
          <div className="text-center">
            <div className="w-16 h-16 bg-gradient-to-br from-primary to-primary-dark rounded-full flex items-center justify-center mx-auto mb-6">
              <Mail className="w-8 h-8 text-white" />
            </div>
            
            <h2 className="text-3xl font-bold text-gray-900 mb-2">
              Forgot your password?
            </h2>
            <p className="text-gray-600">
              No worries! Enter your email address and we'll send you a link to reset your password.
            </p>
          </div>
        </div>

        <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
          <Card className="py-8 px-4 shadow-xl sm:px-10">
            <ForgotPasswordForm />
            
            {/* Back to Login */}
            <div className="mt-6">
              <div className="relative">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-gray-300" />
                </div>
                <div className="relative flex justify-center text-sm">
                  <span className="px-2 bg-white text-gray-500">Remember your password?</span>
                </div>
              </div>

              <div className="mt-6 text-center">
                <Link
                  to="/login"
                  className="font-medium text-primary hover:text-primary-dark transition-colors duration-200"
                >
                  Back to sign in
                </Link>
              </div>
            </div>
          </Card>

          {/* Help Text */}
          <div className="mt-8 text-center">
            <p className="text-sm text-gray-500">
              Still having trouble?{' '}
              <Link 
                to="/contact" 
                className="text-primary hover:text-primary-dark transition-colors duration-200"
              >
                Contact our support team
              </Link>
            </p>
          </div>
        </div>
      </FormContainer>
    </div>
  );
};

export default ForgotPassword;