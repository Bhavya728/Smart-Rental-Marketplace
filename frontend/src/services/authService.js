import { apiRequest } from './api';
import { API_ENDPOINTS } from '@config/api';
import toast from 'react-hot-toast';

class AuthService {
  // Register new user
  async register(userData) {
    try {
      const response = await apiRequest.post(API_ENDPOINTS.auth.register, userData);
      
      if (response.data.success) {
        const { user, token, refreshToken } = response.data.data;
        
        // Store authentication data
        this.setAuthData(user, token, refreshToken);
        
        toast.success(response.data.message || 'Registration successful!');
        return response.data;
      }
    } catch (error) {
      console.error('Registration failed:', error);
      throw this.handleAuthError(error);
    }
  }

  // Login user
  async login(credentials) {
    try {
      const response = await apiRequest.post(API_ENDPOINTS.auth.login, credentials);
      
      if (response.data.success) {
        const { user, token, refreshToken } = response.data.data;
        
        // Store authentication data
        this.setAuthData(user, token, refreshToken);
        
        toast.success(response.data.message || 'Login successful!');
        return response.data;
      }
    } catch (error) {
      console.error('Login failed:', error);
      throw this.handleAuthError(error);
    }
  }

  // Logout user
  async logout() {
    try {
      await apiRequest.post(API_ENDPOINTS.auth.logout);
    } catch (error) {
      console.error('Logout error:', error);
      // Continue with logout even if API call fails
    } finally {
      // Always clear local auth data
      this.clearAuthData();
      toast.success('Logged out successfully');
    }
  }

  // Get current user
  async getCurrentUser() {
    try {
      // Check if we have a token first
      const token = localStorage.getItem('auth_token');
      if (!token) {
        throw new Error('No authentication token found');
      }

      const response = await apiRequest.get(API_ENDPOINTS.auth.me);
      
      if (response.data.success) {
        const user = response.data.data.user;
        
        // Update stored user data
        localStorage.setItem('user_data', JSON.stringify(user));
        
        return user;
      }
    } catch (error) {
      console.error('Failed to get current user:', error);
      
      // If it's a network error or auth error, clear the auth data
      if (error.message === 'No authentication token found' || 
          error.response?.status === 401 || 
          error.code === 'NETWORK_ERROR') {
        this.clearAuthData();
      }
      
      throw error;
    }
  }

  // Update user profile
  async updateProfile(updateData) {
    try {
      const response = await apiRequest.put(API_ENDPOINTS.auth.me, updateData);
      
      if (response.data.success) {
        const user = response.data.data.user;
        
        // Update stored user data
        localStorage.setItem('user_data', JSON.stringify(user));
        
        toast.success(response.data.message || 'Profile updated successfully');
        return user;
      }
    } catch (error) {
      console.error('Profile update failed:', error);
      throw this.handleAuthError(error);
    }
  }

  // Send email verification
  async sendEmailVerification() {
    try {
      const response = await apiRequest.post(API_ENDPOINTS.auth.sendVerification);
      
      if (response.data.success) {
        toast.success(response.data.message || 'Verification email sent');
        return response.data;
      }
    } catch (error) {
      console.error('Failed to send verification email:', error);
      throw this.handleAuthError(error);
    }
  }

  // Verify email with token
  async verifyEmail(token) {
    try {
      const response = await apiRequest.post(API_ENDPOINTS.auth.verifyEmail, { token });
      
      if (response.data.success) {
        toast.success(response.data.message || 'Email verified successfully');
        
        // Refresh user data
        await this.getCurrentUser();
        
        return response.data;
      }
    } catch (error) {
      console.error('Email verification failed:', error);
      throw this.handleAuthError(error);
    }
  }

  // Send OTP for email verification
  async sendEmailOTP() {
    try {
      const response = await apiRequest.post(API_ENDPOINTS.auth.sendVerificationCode);
      
      if (response.data.success) {
        toast.success(response.data.message || 'Verification code sent to your email');
        return response.data;
      }
    } catch (error) {
      console.error('Failed to send verification code:', error);
      throw this.handleAuthError(error);
    }
  }

  // Verify email with OTP
  async verifyEmailOTP(otp) {
    try {
      const response = await apiRequest.post(API_ENDPOINTS.auth.verifyEmailCode, { code: otp });
      
      if (response.data.success) {
        toast.success(response.data.message || 'Email verified successfully');
        
        // Refresh user data
        await this.getCurrentUser();
        
        return response.data;
      }
    } catch (error) {
      console.error('OTP verification failed:', error);
      throw this.handleAuthError(error);
    }
  }

  // Forgot password
  async forgotPassword(email) {
    try {
      const response = await apiRequest.post(API_ENDPOINTS.auth.forgotPassword, { email });
      
      if (response.data.success) {
        toast.success(response.data.message || 'Password reset email sent');
        return response.data;
      }
    } catch (error) {
      console.error('Forgot password failed:', error);
      throw this.handleAuthError(error);
    }
  }

  // Reset password
  async resetPassword(token, password) {
    try {
      const response = await apiRequest.post(API_ENDPOINTS.auth.resetPassword, {
        token,
        password,
      });
      
      if (response.data.success) {
        const { user, token: authToken, refreshToken } = response.data.data;
        
        // Store new authentication data
        this.setAuthData(user, authToken, refreshToken);
        
        toast.success(response.data.message || 'Password reset successful');
        return response.data;
      }
    } catch (error) {
      console.error('Password reset failed:', error);
      throw this.handleAuthError(error);
    }
  }

  // Change password
  async changePassword(currentPassword, newPassword, confirmNewPassword) {
    try {
      const response = await apiRequest.put('/auth/change-password', {
        currentPassword,
        newPassword,
        confirmNewPassword,
      });
      
      if (response.data.success) {
        const { user, token, refreshToken } = response.data.data;
        
        // Update authentication data
        this.setAuthData(user, token, refreshToken);
        
        toast.success(response.data.message || 'Password changed successfully');
        return response.data;
      }
    } catch (error) {
      console.error('Password change failed:', error);
      throw this.handleAuthError(error);
    }
  }

  // Refresh authentication token
  async refreshToken() {
    try {
      const refreshToken = localStorage.getItem('refresh_token');
      
      if (!refreshToken) {
        throw new Error('No refresh token available');
      }

      const response = await apiRequest.post(API_ENDPOINTS.auth.refreshToken, {
        refreshToken,
      });
      
      if (response.data.success) {
        const { token, refreshToken: newRefreshToken } = response.data.data;
        
        // Update stored tokens
        localStorage.setItem('auth_token', token);
        localStorage.setItem('refresh_token', newRefreshToken);
        
        return response.data;
      }
    } catch (error) {
      console.error('Token refresh failed:', error);
      this.clearAuthData();
      throw error;
    }
  }

  // Delete account
  async deleteAccount(password) {
    try {
      const response = await apiRequest.delete('/auth/delete-account', {
        data: { password },
      });
      
      if (response.data.success) {
        this.clearAuthData();
        toast.success(response.data.message || 'Account deleted successfully');
        return response.data;
      }
    } catch (error) {
      console.error('Account deletion failed:', error);
      throw this.handleAuthError(error);
    }
  }

  // Check authentication status
  async checkAuth() {
    try {
      const response = await apiRequest.get(API_ENDPOINTS.auth.check);
      return response.data.data;
    } catch (error) {
      console.error('Auth check failed:', error);
      return { isAuthenticated: false, user: null };
    }
  }

  // Helper method to set authentication data
  setAuthData(user, token, refreshToken) {
    localStorage.setItem('auth_token', token);
    localStorage.setItem('refresh_token', refreshToken);
    localStorage.setItem('user_data', JSON.stringify(user));
  }

  // Helper method to clear authentication data
  clearAuthData() {
    localStorage.removeItem('auth_token');
    localStorage.removeItem('refresh_token');
    localStorage.removeItem('user_data');
  }

  // Get stored user data
  getStoredUser() {
    try {
      const userData = localStorage.getItem('user_data');
      return userData ? JSON.parse(userData) : null;
    } catch (error) {
      console.error('Failed to parse stored user data:', error);
      return null;
    }
  }

  // Get stored auth token
  getStoredToken() {
    return localStorage.getItem('auth_token');
  }

  // Check if user is authenticated (has valid token)
  isAuthenticated() {
    const token = this.getStoredToken();
    const user = this.getStoredUser();
    return !!(token && user);
  }

  // Check if user's email is verified
  isEmailVerified() {
    const user = this.getStoredUser();
    return user?.verified_status?.email || false;
  }

  // Check if user's phone is verified
  isPhoneVerified() {
    const user = this.getStoredUser();
    return user?.verified_status?.phone || false;
  }

  // Check user role
  hasRole(role) {
    const user = this.getStoredUser();
    if (!user) return false;
    
    if (Array.isArray(role)) {
      return role.includes(user.role);
    }
    
    return user.role === role;
  }

  // Handle authentication errors
  handleAuthError(error) {
    if (error.response?.data?.errors) {
      // Validation errors
      const errors = error.response.data.errors;
      const errorMessages = errors.map(err => err.message).join(', ');
      toast.error(errorMessages);
      return new Error(errorMessages);
    }
    
    const message = error.response?.data?.message || error.message || 'Authentication failed';
    toast.error(message);
    return new Error(message);
  }

  // Auto-login on app start
  async initializeAuth() {
    try {
      // First check if we have a token
      const token = localStorage.getItem('auth_token');
      if (!token) {
        console.log('No auth token found, user not logged in');
        return false;
      }

      if (this.isAuthenticated()) {
        // Try to get current user to validate token
        await this.getCurrentUser();
        console.log('Auth initialization successful');
        return true;
      }
    } catch (error) {
      console.error('Auth initialization failed:', error);
      this.clearAuthData();
    }
    return false;
  }
}

// Create and export singleton instance
const authService = new AuthService();
export default authService;