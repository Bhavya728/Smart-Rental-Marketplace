import React, { createContext, useContext, useReducer, useEffect, useCallback } from 'react';
import authService from '../services/authService';
import api, { apiRequest } from '../services/api';

// Authentication context
const AuthContext = createContext(null);

// Auth action types
const AUTH_ACTIONS = {
  // Authentication state
  LOGIN_START: 'LOGIN_START',
  LOGIN_SUCCESS: 'LOGIN_SUCCESS',
  LOGIN_FAILURE: 'LOGIN_FAILURE',
  
  REGISTER_START: 'REGISTER_START',
  REGISTER_SUCCESS: 'REGISTER_SUCCESS',
  REGISTER_FAILURE: 'REGISTER_FAILURE',
  
  LOGOUT: 'LOGOUT',
  
  // User data
  UPDATE_USER: 'UPDATE_USER',
  CLEAR_USER: 'CLEAR_USER',
  
  // Loading states
  SET_LOADING: 'SET_LOADING',
  SET_INITIALIZING: 'SET_INITIALIZING',
  
  // Email verification
  EMAIL_VERIFICATION_START: 'EMAIL_VERIFICATION_START',
  EMAIL_VERIFICATION_SUCCESS: 'EMAIL_VERIFICATION_SUCCESS',
  EMAIL_VERIFICATION_FAILURE: 'EMAIL_VERIFICATION_FAILURE',
  
  // Password reset
  PASSWORD_RESET_START: 'PASSWORD_RESET_START',
  PASSWORD_RESET_SUCCESS: 'PASSWORD_RESET_SUCCESS',
  PASSWORD_RESET_FAILURE: 'PASSWORD_RESET_FAILURE',
  
  // Profile update
  PROFILE_UPDATE_START: 'PROFILE_UPDATE_START',
  PROFILE_UPDATE_SUCCESS: 'PROFILE_UPDATE_SUCCESS',
  PROFILE_UPDATE_FAILURE: 'PROFILE_UPDATE_FAILURE',
  
  // Error handling
  SET_ERROR: 'SET_ERROR',
  CLEAR_ERROR: 'CLEAR_ERROR',
};

// Initial auth state
const initialAuthState = {
  // User data
  user: null,
  isAuthenticated: false,
  
  // Loading states
  isLoading: false,
  isInitializing: true,
  
  // Operation states
  isLoggingIn: false,
  isRegistering: false,
  isUpdatingProfile: false,
  isVerifyingEmail: false,
  isResettingPassword: false,
  
  // Error handling
  error: null,
  lastError: null,
  
  // Success states
  lastAction: null,
  successMessage: null,
};

// Auth reducer
function authReducer(state, action) {
  switch (action.type) {
    // Login actions
    case AUTH_ACTIONS.LOGIN_START:
      return {
        ...state,
        isLoggingIn: true,
        error: null,
        lastError: null,
      };
      
    case AUTH_ACTIONS.LOGIN_SUCCESS:
      console.log('AuthReducer: LOGIN_SUCCESS - setting user:', action.payload.user);
      return {
        ...state,
        user: action.payload.user,
        isAuthenticated: true,
        isLoggingIn: false,
        error: null,
        lastError: null,
        lastAction: 'login',
        successMessage: action.payload.message,
      };
      
    case AUTH_ACTIONS.LOGIN_FAILURE:
      return {
        ...state,
        user: null,
        isAuthenticated: false,
        isLoggingIn: false,
        error: action.payload.error,
        lastError: action.payload.error,
        lastAction: 'login_error',
      };

    // Register actions
    case AUTH_ACTIONS.REGISTER_START:
      return {
        ...state,
        isRegistering: true,
        error: null,
        lastError: null,
      };
      
    case AUTH_ACTIONS.REGISTER_SUCCESS:
      return {
        ...state,
        user: action.payload.user,
        isAuthenticated: true,
        isRegistering: false,
        error: null,
        lastError: null,
        lastAction: 'register',
        successMessage: action.payload.message,
      };
      
    case AUTH_ACTIONS.REGISTER_FAILURE:
      return {
        ...state,
        user: null,
        isAuthenticated: false,
        isRegistering: false,
        error: action.payload.error,
        lastError: action.payload.error,
        lastAction: 'register_error',
      };

    // Logout
    case AUTH_ACTIONS.LOGOUT:
      return {
        ...initialAuthState,
        isInitializing: false,
        lastAction: 'logout',
        successMessage: 'Logged out successfully',
      };

    // User data updates
    case AUTH_ACTIONS.UPDATE_USER:
      return {
        ...state,
        user: { ...state.user, ...action.payload.user },
        lastAction: 'user_update',
        successMessage: action.payload.message,
      };
      
    case AUTH_ACTIONS.CLEAR_USER:
      return {
        ...state,
        user: null,
        isAuthenticated: false,
      };

    // Loading states
    case AUTH_ACTIONS.SET_LOADING:
      return {
        ...state,
        isLoading: action.payload.loading,
      };
      
    case AUTH_ACTIONS.SET_INITIALIZING:
      return {
        ...state,
        isInitializing: action.payload.initializing,
      };

    // Email verification
    case AUTH_ACTIONS.EMAIL_VERIFICATION_START:
      return {
        ...state,
        isVerifyingEmail: true,
        error: null,
      };
      
    case AUTH_ACTIONS.EMAIL_VERIFICATION_SUCCESS:
      return {
        ...state,
        isVerifyingEmail: false,
        user: { ...state.user, verified_status: { ...state.user.verified_status, email: true } },
        lastAction: 'email_verified',
        successMessage: action.payload.message,
      };
      
    case AUTH_ACTIONS.EMAIL_VERIFICATION_FAILURE:
      return {
        ...state,
        isVerifyingEmail: false,
        error: action.payload.error,
        lastError: action.payload.error,
      };

    // Password reset
    case AUTH_ACTIONS.PASSWORD_RESET_START:
      return {
        ...state,
        isResettingPassword: true,
        error: null,
      };
      
    case AUTH_ACTIONS.PASSWORD_RESET_SUCCESS:
      return {
        ...state,
        isResettingPassword: false,
        lastAction: 'password_reset',
        successMessage: action.payload.message,
      };
      
    case AUTH_ACTIONS.PASSWORD_RESET_FAILURE:
      return {
        ...state,
        isResettingPassword: false,
        error: action.payload.error,
        lastError: action.payload.error,
      };

    // Profile update
    case AUTH_ACTIONS.PROFILE_UPDATE_START:
      return {
        ...state,
        isUpdatingProfile: true,
        error: null,
      };
      
    case AUTH_ACTIONS.PROFILE_UPDATE_SUCCESS:
      return {
        ...state,
        isUpdatingProfile: false,
        user: action.payload.user,
        lastAction: 'profile_update',
        successMessage: action.payload.message,
      };
      
    case AUTH_ACTIONS.PROFILE_UPDATE_FAILURE:
      return {
        ...state,
        isUpdatingProfile: false,
        error: action.payload.error,
        lastError: action.payload.error,
      };

    // Error handling
    case AUTH_ACTIONS.SET_ERROR:
      return {
        ...state,
        error: action.payload.error,
        lastError: action.payload.error,
      };
      
    case AUTH_ACTIONS.CLEAR_ERROR:
      return {
        ...state,
        error: null,
        successMessage: null,
      };

    default:
      return state;
  }
}

// Auth Provider Component
export function AuthProvider({ children }) {
  const [state, dispatch] = useReducer(authReducer, initialAuthState);

  // Initialize authentication on app start
  const initializeAuth = useCallback(async () => {
    dispatch({ type: AUTH_ACTIONS.SET_INITIALIZING, payload: { initializing: true } });

    try {
      const isInitialized = await authService.initializeAuth();
      
      if (isInitialized) {
        const user = authService.getStoredUser();
        if (user) {
          dispatch({
            type: AUTH_ACTIONS.LOGIN_SUCCESS,
            payload: {
              user,
              message: 'Welcome back!',
            },
          });
        }
      }
    } catch (error) {
      console.error('Auth initialization failed:', error);
      dispatch({
        type: AUTH_ACTIONS.SET_ERROR,
        payload: { error: 'Failed to initialize authentication' },
      });
    } finally {
      dispatch({ type: AUTH_ACTIONS.SET_INITIALIZING, payload: { initializing: false } });
    }
  }, []);

  // Login function
  const login = useCallback(async (credentials) => {
    console.log('AuthContext: Login started');
    dispatch({ type: AUTH_ACTIONS.LOGIN_START });

    try {
      const response = await authService.login(credentials);
      console.log('AuthContext: Login response received:', response);
      
      dispatch({
        type: AUTH_ACTIONS.LOGIN_SUCCESS,
        payload: {
          user: response.data.user,
          message: response.message,
        },
      });

      console.log('AuthContext: Login success dispatch completed');
      return response;
    } catch (error) {
      console.error('AuthContext: Login failed:', error);
      dispatch({
        type: AUTH_ACTIONS.LOGIN_FAILURE,
        payload: { error: error.message },
      });
      throw error;
    }
  }, []);

  // Register function
  const register = useCallback(async (userData) => {
    dispatch({ type: AUTH_ACTIONS.REGISTER_START });

    try {
      const response = await authService.register(userData);
      
      dispatch({
        type: AUTH_ACTIONS.REGISTER_SUCCESS,
        payload: {
          user: response.data.user,
          message: response.message,
        },
      });

      return response;
    } catch (error) {
      dispatch({
        type: AUTH_ACTIONS.REGISTER_FAILURE,
        payload: { error: error.message },
      });
      throw error;
    }
  }, []);

  // Logout function
  const logout = useCallback(async () => {
    try {
      await authService.logout();
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      dispatch({ type: AUTH_ACTIONS.LOGOUT });
    }
  }, []);

  // Update profile function
  const updateProfile = useCallback(async (updateData) => {
    dispatch({ type: AUTH_ACTIONS.PROFILE_UPDATE_START });

    try {
      const updatedUser = await authService.updateProfile(updateData);
      
      dispatch({
        type: AUTH_ACTIONS.PROFILE_UPDATE_SUCCESS,
        payload: {
          user: updatedUser,
          message: 'Profile updated successfully',
        },
      });

      return updatedUser;
    } catch (error) {
      dispatch({
        type: AUTH_ACTIONS.PROFILE_UPDATE_FAILURE,
        payload: { error: error.message },
      });
      throw error;
    }
  }, []);

  // Send email verification
  const sendEmailVerification = useCallback(async () => {
    dispatch({ type: AUTH_ACTIONS.EMAIL_VERIFICATION_START });

    try {
      const response = await authService.sendEmailVerification();
      
      dispatch({
        type: AUTH_ACTIONS.EMAIL_VERIFICATION_SUCCESS,
        payload: { message: response.message },
      });

      return response;
    } catch (error) {
      dispatch({
        type: AUTH_ACTIONS.EMAIL_VERIFICATION_FAILURE,
        payload: { error: error.message },
      });
      throw error;
    }
  }, []);

  // Verify email with token
  const verifyEmail = useCallback(async (token) => {
    dispatch({ type: AUTH_ACTIONS.EMAIL_VERIFICATION_START });

    try {
      const response = await authService.verifyEmail(token);
      
      dispatch({
        type: AUTH_ACTIONS.EMAIL_VERIFICATION_SUCCESS,
        payload: { message: response.message },
      });

      return response;
    } catch (error) {
      dispatch({
        type: AUTH_ACTIONS.EMAIL_VERIFICATION_FAILURE,
        payload: { error: error.message },
      });
      throw error;
    }
  }, []);

  // Send OTP for email verification
  const sendEmailOTP = useCallback(async () => {
    dispatch({ type: AUTH_ACTIONS.EMAIL_VERIFICATION_START });

    try {
      const response = await authService.sendEmailOTP();
      
      dispatch({
        type: AUTH_ACTIONS.EMAIL_VERIFICATION_SUCCESS,
        payload: { message: response.message },
      });

      return response;
    } catch (error) {
      dispatch({
        type: AUTH_ACTIONS.EMAIL_VERIFICATION_FAILURE,
        payload: { error: error.message },
      });
      throw error;
    }
  }, []);

  // Verify email with OTP
  const verifyEmailOTP = useCallback(async (otp) => {
    dispatch({ type: AUTH_ACTIONS.EMAIL_VERIFICATION_START });

    try {
      const response = await authService.verifyEmailOTP(otp);
      
      dispatch({
        type: AUTH_ACTIONS.EMAIL_VERIFICATION_SUCCESS,
        payload: { message: response.message },
      });

      return response;
    } catch (error) {
      dispatch({
        type: AUTH_ACTIONS.EMAIL_VERIFICATION_FAILURE,
        payload: { error: error.message },
      });
      throw error;
    }
  }, []);

  // Forgot password
  const forgotPassword = useCallback(async (email) => {
    dispatch({ type: AUTH_ACTIONS.PASSWORD_RESET_START });

    try {
      const response = await authService.forgotPassword(email);
      
      dispatch({
        type: AUTH_ACTIONS.PASSWORD_RESET_SUCCESS,
        payload: { message: response.message },
      });

      return response;
    } catch (error) {
      dispatch({
        type: AUTH_ACTIONS.PASSWORD_RESET_FAILURE,
        payload: { error: error.message },
      });
      throw error;
    }
  }, []);

  // Reset password
  const resetPassword = useCallback(async (token, password) => {
    dispatch({ type: AUTH_ACTIONS.PASSWORD_RESET_START });

    try {
      const response = await authService.resetPassword(token, password);
      
      dispatch({
        type: AUTH_ACTIONS.LOGIN_SUCCESS,
        payload: {
          user: response.data.user,
          message: response.message,
        },
      });

      return response;
    } catch (error) {
      dispatch({
        type: AUTH_ACTIONS.PASSWORD_RESET_FAILURE,
        payload: { error: error.message },
      });
      throw error;
    }
  }, []);

  // Change password
  const changePassword = useCallback(async (currentPassword, newPassword, confirmNewPassword) => {
    dispatch({ type: AUTH_ACTIONS.SET_LOADING, payload: { loading: true } });

    try {
      const response = await authService.changePassword(currentPassword, newPassword, confirmNewPassword);
      
      dispatch({
        type: AUTH_ACTIONS.UPDATE_USER,
        payload: {
          user: response.data.user,
          message: response.message,
        },
      });

      return response;
    } catch (error) {
      dispatch({
        type: AUTH_ACTIONS.SET_ERROR,
        payload: { error: error.message },
      });
      throw error;
    } finally {
      dispatch({ type: AUTH_ACTIONS.SET_LOADING, payload: { loading: false } });
    }
  }, []);

  // Refresh user data
  const refreshUser = useCallback(async () => {
    try {
      const user = await authService.getCurrentUser();
      
      dispatch({
        type: AUTH_ACTIONS.UPDATE_USER,
        payload: {
          user,
          message: 'User data refreshed',
        },
      });

      return user;
    } catch (error) {
      console.error('Failed to refresh user data:', error);
      throw error;
    }
  }, []);

  // Clear errors
  const clearError = useCallback(() => {
    dispatch({ type: AUTH_ACTIONS.CLEAR_ERROR });
  }, []);

  // Helper functions
  const isEmailVerified = useCallback(() => {
    return state.user?.verified_status?.email || false;
  }, [state.user]);

  const isPhoneVerified = useCallback(() => {
    return state.user?.verified_status?.phone || false;
  }, [state.user]);

  const hasRole = useCallback((role) => {
    if (!state.user) return false;
    
    if (Array.isArray(role)) {
      return role.includes(state.user.role);
    }
    
    return state.user.role === role;
  }, [state.user]);

  const getUserFullName = useCallback(() => {
    if (!state.user) return '';
    return `${state.user.name?.first || ''} ${state.user.name?.last || ''}`.trim();
  }, [state.user]);

  const getUserAvatar = useCallback(() => {
    return state.user?.avatar?.url || null;
  }, [state.user]);

  // Initialize auth on mount
  useEffect(() => {
    initializeAuth();
  }, [initializeAuth]);

  // Axios interceptor for automatic token refresh
  useEffect(() => {
    const interceptor = api.interceptors.response.use(
      (response) => response,
      async (error) => {
        // Handle cases where error or error.config might be undefined
        if (!error || !error.config) {
          return Promise.reject(error);
        }

        const originalRequest = error.config;

        if (error.response?.status === 401 && !originalRequest._retry) {
          originalRequest._retry = true;

          try {
            await authService.refreshToken();
            return api(originalRequest);
          } catch (refreshError) {
            console.error('Token refresh failed:', refreshError);
            dispatch({ type: AUTH_ACTIONS.LOGOUT });
            return Promise.reject(refreshError);
          }
        }

        return Promise.reject(error);
      }
    );

    return () => {
      api.interceptors.response.eject(interceptor);
    };
  }, []);

  // Context value
  const contextValue = {
    // State
    ...state,
    
    // Actions
    login,
    register,
    logout,
    updateProfile,
    
    // Email verification
    sendEmailVerification,
    verifyEmail,
    sendEmailOTP,
    verifyEmailOTP,
    
    // Password management
    forgotPassword,
    resetPassword,
    changePassword,
    
    // Utility functions
    refreshUser,
    clearError,
    
    // Helper functions
    isEmailVerified,
    isPhoneVerified,
    hasRole,
    getUserFullName,
    getUserAvatar,
  };

  return (
    <AuthContext.Provider value={contextValue}>
      {children}
    </AuthContext.Provider>
  );
}

// Custom hook to use auth context
export function useAuth() {
  const context = useContext(AuthContext);
  
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  
  return context;
}

// HOC for protected routes
export function withAuth(Component) {
  return function AuthenticatedComponent(props) {
    const { isAuthenticated, isInitializing } = useAuth();
    
    if (isInitializing) {
      return <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>;
    }
    
    if (!isAuthenticated) {
      return <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <h2 className="text-xl font-semibold text-gray-900 mb-2">Authentication Required</h2>
          <p className="text-gray-600">Please log in to access this page.</p>
        </div>
      </div>;
    }
    
    return <Component {...props} />;
  };
}

// HOC for role-based access
export function withRole(Component, requiredRole) {
  return function RoleProtectedComponent(props) {
    const { hasRole, isAuthenticated, isInitializing, user } = useAuth();
    
    if (isInitializing) {
      return <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>;
    }
    
    if (!isAuthenticated) {
      return <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <h2 className="text-xl font-semibold text-gray-900 mb-2">Authentication Required</h2>
          <p className="text-gray-600">Please log in to access this page.</p>
        </div>
      </div>;
    }
    
    if (!hasRole(requiredRole)) {
      return <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <h2 className="text-xl font-semibold text-gray-900 mb-2">Access Denied</h2>
          <p className="text-gray-600">You don't have permission to access this page.</p>
          <p className="text-sm text-gray-500 mt-2">Required role: {Array.isArray(requiredRole) ? requiredRole.join(' or ') : requiredRole}</p>
        </div>
      </div>;
    }
    
    return <Component {...props} />;
  };
}

export default AuthContext;