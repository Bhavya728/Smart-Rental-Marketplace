import api from './api';

/**
 * User Service - Frontend API calls for user profile management
 */
class UserService {
  
  /**
   * Get current user profile
   */
  async getProfile() {
    try {
      const response = await api.get('/user/profile');
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  /**
   * Get public user profile
   */
  async getPublicProfile(userId) {
    try {
      const response = await api.get(`/user/profile/${userId}`);
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  /**
   * Update user profile
   */
  async updateProfile(profileData) {
    try {
      const response = await api.put('/user/profile', profileData);
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  /**
   * Upload profile photo
   */
  async uploadProfilePhoto(file, onProgress = null) {
    try {
      const formData = new FormData();
      formData.append('profilePhoto', file);

      const config = {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      };

      // Add progress tracking if callback provided
      if (onProgress) {
        config.onUploadProgress = (progressEvent) => {
          const progress = Math.round((progressEvent.loaded * 100) / progressEvent.total);
          onProgress(progress);
        };
      }

      const response = await api.post('/user/profile/photo', formData, config);
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  /**
   * Delete profile photo
   */
  async deleteProfilePhoto() {
    try {
      const response = await api.delete('/user/profile/photo');
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  /**
   * Get user statistics
   */
  async getUserStats() {
    try {
      const response = await api.get('/user/profile/stats');
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  /**
   * Get profile completion status
   */
  async getProfileCompletion() {
    try {
      const response = await api.get('/user/profile/completion');
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  /**
   * Update user preferences
   */
  async updatePreferences(preferences) {
    try {
      const response = await api.put('/user/profile/preferences', { preferences });
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  /**
   * Search users
   */
  async searchUsers(params = {}) {
    try {
      const queryParams = new URLSearchParams();
      
      Object.keys(params).forEach(key => {
        if (params[key] !== undefined && params[key] !== null && params[key] !== '') {
          queryParams.append(key, params[key]);
        }
      });

      const response = await api.get(`/user/search?${queryParams.toString()}`);
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  /**
   * Get Cloudinary upload signature for direct uploads
   */
  async getUploadSignature(folder = 'profile') {
    try {
      const response = await api.get(`/user/upload-signature?folder=${folder}`);
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  /**
   * Get image transformation URL
   */
  async getImageTransformation(publicId, transformations = {}) {
    try {
      const response = await api.post('/user/image/transform', {
        publicId,
        transformations
      });
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  /**
   * Upload file directly to Cloudinary (client-side upload)
   */
  async uploadToCloudinary(file, signature, onProgress = null) {
    try {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('signature', signature.signature);
      formData.append('timestamp', signature.timestamp);
      formData.append('api_key', signature.api_key);
      formData.append('folder', signature.folder);

      const config = {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      };

      // Add progress tracking if callback provided
      if (onProgress) {
        config.onUploadProgress = (progressEvent) => {
          const progress = Math.round((progressEvent.loaded * 100) / progressEvent.total);
          onProgress(progress);
        };
      }

      // Upload directly to Cloudinary
      const cloudinaryUrl = `https://api.cloudinary.com/v1_1/${signature.cloud_name}/image/upload`;
      
      // Use fetch instead of axios for direct Cloudinary upload to avoid CORS issues
      const response = await fetch(cloudinaryUrl, {
        method: 'POST',
        body: formData
      });

      if (!response.ok) {
        throw new Error('Cloudinary upload failed');
      }

      const result = await response.json();
      return result;
    } catch (error) {
      throw new Error(`Cloudinary upload failed: ${error.message}`);
    }
  }

  /**
   * Validate profile data before submission
   */
  validateProfileData(data) {
    const errors = {};

    // Validate required fields
    if (!data.name?.firstName?.trim()) {
      errors.firstName = 'First name is required';
    } else if (data.name.firstName.length < 2) {
      errors.firstName = 'First name must be at least 2 characters';
    }

    if (!data.name?.lastName?.trim()) {
      errors.lastName = 'Last name is required';
    } else if (data.name.lastName.length < 2) {
      errors.lastName = 'Last name must be at least 2 characters';
    }

    // Validate bio length
    if (data.bio && data.bio.length > 500) {
      errors.bio = 'Bio cannot exceed 500 characters';
    }

    // Validate phone format - more flexible for international numbers
    if (data.phone && data.phone.trim()) {
      const phone = data.phone.trim();
      // Allow various phone formats: +1234567890, (555) 123-4567, 555-123-4567, etc.
      if (!/^[\+]?[\d\s\-\(\)]{10,20}$/.test(phone)) {
        errors.phone = 'Please provide a valid phone number';
      }
    }

    // Validate city length
    if (data.location?.address?.city) {
      const city = data.location.address.city.trim();
      if (city && (city.length < 2 || city.length > 100)) {
        errors.city = 'City must be between 2 and 100 characters';
      }
    }

    // Validate state length
    if (data.location?.address?.state) {
      const state = data.location.address.state.trim();
      if (state && (state.length < 2 || state.length > 100)) {
        errors.state = 'State must be between 2 and 100 characters';
      }
    }

    // Validate ZIP/Postal code - more flexible for international codes
    if (data.location?.address?.zipCode) {
      const zipCode = data.location.address.zipCode.trim();
      // Allow various international postal code formats
      if (zipCode && !/^[A-Za-z0-9\s\-]{3,10}$/.test(zipCode)) {
        errors.zipCode = 'Please provide a valid ZIP/postal code';
      }
    }

    // Validate social links
    const urlRegex = /^https?:\/\/.+\..+/;
    if (data.socialLinks) {
      Object.keys(data.socialLinks).forEach(platform => {
        const url = data.socialLinks[platform];
        if (url && !urlRegex.test(url)) {
          errors[`socialLinks.${platform}`] = `Please provide a valid ${platform} URL`;
        }
      });
    }

    return {
      isValid: Object.keys(errors).length === 0,
      errors
    };
  }

  /**
   * Format user data for display
   */
  formatUserData(user) {
    if (!user) return null;

    return {
      ...user,
      fullName: user.name ? `${user.name.firstName} ${user.name.lastName}` : user.email?.split('@')[0],
      initials: user.name 
        ? `${user.name.firstName.charAt(0)}${user.name.lastName.charAt(0)}`.toUpperCase()
        : user.email?.charAt(0).toUpperCase(),
      memberSince: user.createdAt ? new Date(user.createdAt) : null,
      profilePhotoUrl: user.profile_photo?.url || null,
      hasLocation: !!(user.location?.address?.city && user.location?.address?.state),
      locationDisplay: user.location?.address 
        ? `${user.location.address.city}${user.location.address.state ? ', ' + user.location.address.state : ''}`
        : null,
      isVerified: user.verified_status?.email || false,
      socialLinksCount: user.socialLinks 
        ? Object.values(user.socialLinks).filter(link => link && link.trim()).length
        : 0
    };
  }

  /**
   * Calculate profile completion percentage (client-side)
   */
  calculateProfileCompletion(user) {
    if (!user) return 0;

    let completed = 0;
    const total = 10;

    // Required fields (always completed if user exists)
    if (user.email) completed++;
    if (user.name?.firstName && user.name?.lastName) completed++;

    // Optional fields
    if (user.bio && user.bio.length > 10) completed++;
    if (user.phone) completed++;
    if (user.profile_photo?.url) completed++;
    if (user.location?.address?.city && user.location?.address?.state) completed++;
    if (user.verified_status?.email) completed++;
    if (user.verified_status?.phone && user.phone) completed++;
    
    // Social links (at least one)
    if (user.socialLinks && Object.values(user.socialLinks).some(link => link && link.trim())) {
      completed++;
    }

    // Preferences set
    if (user.preferences) completed++;

    return Math.round((completed / total) * 100);
  }

  /**
   * Get missing profile fields
   */
  getMissingProfileFields(user) {
    if (!user) return [];

    const missing = [];

    if (!user.bio || user.bio.length <= 10) missing.push({
      field: 'bio',
      label: 'Bio',
      description: 'Add a description about yourself'
    });

    if (!user.phone) missing.push({
      field: 'phone',
      label: 'Phone Number',
      description: 'Add your phone number for better communication'
    });

    if (!user.profile_photo?.url) missing.push({
      field: 'profile_photo',
      label: 'Profile Photo',
      description: 'Upload a profile picture'
    });

    if (!user.location?.address?.city || !user.location?.address?.state) {
      missing.push({
        field: 'location',
        label: 'Location',
        description: 'Add your city and state'
      });
    }

    if (!user.verified_status?.email) missing.push({
      field: 'email_verification',
      label: 'Email Verification',
      description: 'Verify your email address'
    });

    if (!user.verified_status?.phone && user.phone) {
      missing.push({
        field: 'phone_verification',
        label: 'Phone Verification',
        description: 'Verify your phone number'
      });
    }

    const socialLinks = user.socialLinks || {};
    if (!Object.values(socialLinks).some(link => link && link.trim())) {
      missing.push({
        field: 'social_links',
        label: 'Social Links',
        description: 'Add at least one social media profile'
      });
    }

    return missing;
  }

  /**
   * Handle API errors consistently
   */
  handleError(error) {
    if (error.response) {
      // Server responded with error status
      const { status, data } = error.response;
      
      switch (status) {
        case 400:
          return new Error(data.message || 'Invalid request data');
        case 401:
          return new Error('Authentication required');
        case 403:
          return new Error('Access denied');
        case 404:
          return new Error('User not found');
        case 413:
          return new Error('File too large');
        case 422:
          return new Error('Validation failed: ' + (data.errors?.join(', ') || data.message));
        case 429:
          return new Error('Too many requests. Please try again later');
        case 500:
          return new Error('Server error. Please try again later');
        default:
          return new Error(data.message || 'An unexpected error occurred');
      }
    } else if (error.request) {
      // Network error
      return new Error('Network error. Please check your connection');
    } else {
      // Other error
      return new Error(error.message || 'An unexpected error occurred');
    }
  }
}

export default new UserService();