import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import RegisterForm from '../components/auth/RegisterForm';
import { FormContainer } from '../components/layout/Container';
import Card from '../components/ui/Card';

const Register = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50/80 via-white to-indigo-50/80 flex flex-col justify-center py-12 sm:py-16 px-4 sm:px-6 lg:px-8 relative overflow-hidden">
      {/* Background decoration */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -left-40 w-96 h-96 bg-gradient-to-br from-purple-400/20 to-blue-500/15 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute -bottom-40 -right-40 w-96 h-96 bg-gradient-to-tr from-blue-400/20 to-indigo-400/15 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1s' }}></div>
      </div>
      
      <FormContainer className="relative z-10">
        <div className="sm:mx-auto sm:w-full sm:max-w-lg">
          {/* Back to Home */}
          <Link 
            to="/" 
            className="inline-flex items-center text-sm sm:text-base font-semibold text-gray-600 hover:text-blue-700 mb-6 sm:mb-8 transition-all duration-300 group min-h-[44px] touch-manipulation"
          >
            <ArrowLeft size={18} className="mr-2 group-hover:-translate-x-1 transition-transform flex-shrink-0" />
            Back to Home
          </Link>

          {/* Header */}
          <div className="text-center mb-8 sm:mb-10">
            <div className="flex items-center justify-center space-x-3 mb-6 sm:mb-8">
              <div className="w-12 h-12 sm:w-14 sm:h-14 bg-gradient-to-br from-blue-600 via-purple-600 to-indigo-700 rounded-xl sm:rounded-2xl flex items-center justify-center shadow-xl shadow-blue-500/30">
                <span className="text-white font-black text-lg sm:text-xl">SR</span>
              </div>
              <div className="flex flex-col items-start">
                <h1 className="text-2xl sm:text-3xl font-black text-gray-900 tracking-tight leading-none">Smart Rental</h1>
                <span className="text-xs sm:text-sm font-medium text-gray-600">Join the community</span>
              </div>
            </div>
            
            <h2 className="text-4xl md:text-5xl font-black text-gray-900 mb-4 tracking-tight">
              Get Started
            </h2>
            <p className="text-xl text-gray-700/90 font-medium leading-relaxed max-w-lg mx-auto">
              Join thousands of users sharing and renting items in their community
            </p>
          </div>
        </div>

        <div className="mt-12 sm:mx-auto sm:w-full sm:max-w-lg">
          <Card variant="elevated" className="py-12 px-8 shadow-2xl shadow-gray-300/25 sm:px-12 backdrop-blur-sm border border-white/60">
            <RegisterForm />
            
            {/* Login Link */}
            <div className="mt-8">
              <div className="relative">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-gray-300/60" />
                </div>
                <div className="relative flex justify-center text-sm">
                  <span className="px-4 bg-white text-gray-600 font-medium">Already have an account?</span>
                </div>
              </div>

              <div className="mt-8 text-center">
                <Link
                  to="/login"
                  className="inline-flex items-center px-6 py-3 rounded-xl font-semibold text-blue-700 bg-gradient-to-r from-blue-50 to-indigo-50 hover:from-blue-100 hover:to-indigo-100 transition-all duration-300 shadow-md hover:shadow-lg border border-blue-200/60"
                >
                  Sign in to your account
                </Link>
              </div>
            </div>
          </Card>

          {/* Terms */}
          <p className="mt-8 text-center text-xs text-gray-500">
            By creating an account, you agree to our{' '}
            <Link to="/terms" className="text-primary hover:text-primary-dark">
              Terms of Service
            </Link>{' '}
            and{' '}
            <Link to="/privacy" className="text-primary hover:text-primary-dark">
              Privacy Policy
            </Link>
          </p>
        </div>
      </FormContainer>
    </div>
  );
};

export default Register;