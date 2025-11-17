import React, { useState, useEffect, forwardRef, useImperativeHandle } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Save, X, MapPin, Phone, Mail, Globe, User, Edit3, Check } from 'lucide-react';
import Input from '../ui/Input';
import Button from '../ui/Button';
import Card from '../ui/Card';

/**
 * ProfileEditForm Component
 * Inline editing form for user profile with autosave functionality
 */
const ProfileEditForm = forwardRef(({
  user,
  onSave,
  onCancel,
  isLoading = false,
  autoSave = true,
  onDataChange,
  className = ''
}, ref) => {
  const [formData, setFormData] = useState({
    name: {
      firstName: user?.name?.firstName || '',
      lastName: user?.name?.lastName || ''
    },
    bio: user?.bio || '',
    phone: user?.phone || '',
    location: {
      address: {
        street: user?.location?.address?.street || '',
        city: user?.location?.address?.city || '',
        state: user?.location?.address?.state || '',
        zipCode: user?.location?.address?.zipCode || '',
        country: user?.location?.address?.country || 'US'
      }
    },
    socialLinks: {
      facebook: user?.socialLinks?.facebook || '',
      twitter: user?.socialLinks?.twitter || '',
      instagram: user?.socialLinks?.instagram || '',
      linkedin: user?.socialLinks?.linkedin || ''
    },
    preferences: {
      notifications: {
        email: user?.preferences?.notifications?.email ?? true,
        sms: user?.preferences?.notifications?.sms ?? false,
        push: user?.preferences?.notifications?.push ?? true
      },
      privacy: {
        showEmail: user?.preferences?.privacy?.showEmail ?? false,
        showPhone: user?.preferences?.privacy?.showPhone ?? false,
        showLocation: user?.preferences?.privacy?.showLocation ?? true
      }
    }
  });

  const [editingFields, setEditingFields] = useState(new Set());
  const [hasChanges, setHasChanges] = useState(false);
  const [saveStatus, setSaveStatus] = useState(null); // 'saving', 'saved', 'error'

  // Expose methods to parent component
  useImperativeHandle(ref, () => ({
    triggerSave: () => {
      if (hasChanges) {
        handleSave();
      }
    },
    getFormData: () => formData,
    hasUnsavedChanges: () => hasChanges
  }), [hasChanges, formData]);

  // Check if form has changes
  useEffect(() => {
    const hasAnyChanges = JSON.stringify(formData) !== JSON.stringify({
      name: {
        firstName: user?.name?.firstName || '',
        lastName: user?.name?.lastName || ''
      },
      bio: user?.bio || '',
      phone: user?.phone || '',
      location: {
        address: {
          street: user?.location?.address?.street || '',
          city: user?.location?.address?.city || '',
          state: user?.location?.address?.state || '',
          zipCode: user?.location?.address?.zipCode || '',
          country: user?.location?.address?.country || 'US'
        }
      },
      socialLinks: {
        facebook: user?.socialLinks?.facebook || '',
        twitter: user?.socialLinks?.twitter || '',
        instagram: user?.socialLinks?.instagram || '',
        linkedin: user?.socialLinks?.linkedin || ''
      },
      preferences: {
        notifications: {
          email: user?.preferences?.notifications?.email ?? true,
          sms: user?.preferences?.notifications?.sms ?? false,
          push: user?.preferences?.notifications?.push ?? true
        },
        privacy: {
          showEmail: user?.preferences?.privacy?.showEmail ?? false,
          showPhone: user?.preferences?.privacy?.showPhone ?? false,
          showLocation: user?.preferences?.privacy?.showLocation ?? true
        }
      }
    });

    setHasChanges(hasAnyChanges);
    
    // Notify parent about changes
    if (onDataChange) {
      onDataChange(hasAnyChanges);
    }
  }, [formData, user, onDataChange]);

  // Auto-save functionality
  useEffect(() => {
    if (autoSave && hasChanges && editingFields.size === 0) {
      const saveTimer = setTimeout(() => {
        handleSave();
      }, 2000); // Auto-save after 2 seconds of inactivity

      return () => clearTimeout(saveTimer);
    }
  }, [formData, hasChanges, editingFields.size, autoSave]);

  // Handle input changes
  const handleInputChange = (field, value, nested = null) => {
    setFormData(prev => {
      if (nested) {
        return {
          ...prev,
          [nested]: {
            ...prev[nested],
            [field]: value
          }
        };
      }
      
      if (field.includes('.')) {
        const keys = field.split('.');
        const newData = { ...prev };
        let current = newData;
        
        for (let i = 0; i < keys.length - 1; i++) {
          if (!current[keys[i]]) current[keys[i]] = {};
          current = current[keys[i]];
        }
        
        current[keys[keys.length - 1]] = value;
        return newData;
      }
      
      return {
        ...prev,
        [field]: value
      };
    });
  };

  // Handle field focus (start editing)
  const handleFieldFocus = (field) => {
    setEditingFields(prev => new Set([...prev, field]));
  };

  // Handle field blur (stop editing)
  const handleFieldBlur = (field) => {
    setEditingFields(prev => {
      const newSet = new Set(prev);
      newSet.delete(field);
      return newSet;
    });
  };

  // Clean form data before sending
  const cleanFormData = (data) => {
    const cleaned = JSON.parse(JSON.stringify(data)); // Deep clone
    
    // Clean empty strings and convert to null/undefined for optional fields
    if (cleaned.phone === '') cleaned.phone = undefined;
    
    if (cleaned.location?.address) {
      if (cleaned.location.address.street === '') cleaned.location.address.street = undefined;
      if (cleaned.location.address.city === '') cleaned.location.address.city = undefined;
      if (cleaned.location.address.state === '') cleaned.location.address.state = undefined;
      if (cleaned.location.address.zipCode === '') cleaned.location.address.zipCode = undefined;
    }
    
    if (cleaned.socialLinks) {
      Object.keys(cleaned.socialLinks).forEach(key => {
        if (cleaned.socialLinks[key] === '') {
          cleaned.socialLinks[key] = undefined;
        }
      });
    }
    
    return cleaned;
  };

  // Handle save
  const handleSave = async () => {
    if (!hasChanges) return;

    setSaveStatus('saving');
    try {
      const cleanedData = cleanFormData(formData);
      await onSave(cleanedData);
      setSaveStatus('saved');
      setTimeout(() => setSaveStatus(null), 2000);
    } catch (error) {
      setSaveStatus('error');
      setTimeout(() => setSaveStatus(null), 3000);
    }
  };

  // Handle cancel
  const handleCancel = () => {
    setFormData({
      name: {
        firstName: user?.name?.firstName || '',
        lastName: user?.name?.lastName || ''
      },
      bio: user?.bio || '',
      phone: user?.phone || '',
      location: {
        address: {
          street: user?.location?.address?.street || '',
          city: user?.location?.address?.city || '',
          state: user?.location?.address?.state || '',
          zipCode: user?.location?.address?.zipCode || '',
          country: user?.location?.address?.country || 'US'
        }
      },
      socialLinks: {
        facebook: user?.socialLinks?.facebook || '',
        twitter: user?.socialLinks?.twitter || '',
        instagram: user?.socialLinks?.instagram || '',
        linkedin: user?.socialLinks?.linkedin || ''
      },
      preferences: {
        notifications: {
          email: user?.preferences?.notifications?.email ?? true,
          sms: user?.preferences?.notifications?.sms ?? false,
          push: user?.preferences?.notifications?.push ?? true
        },
        privacy: {
          showEmail: user?.preferences?.privacy?.showEmail ?? false,
          showPhone: user?.preferences?.privacy?.showPhone ?? false,
          showLocation: user?.preferences?.privacy?.showLocation ?? true
        }
      }
    });
    setEditingFields(new Set());
    setHasChanges(false);
    if (onCancel) onCancel();
  };

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Save Status Indicator */}
      <AnimatePresence>
        {saveStatus && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className={`
              flex items-center justify-center p-3 rounded-lg text-sm font-medium
              ${saveStatus === 'saving' ? 'bg-blue-50 text-blue-700' : ''}
              ${saveStatus === 'saved' ? 'bg-green-50 text-green-700' : ''}
              ${saveStatus === 'error' ? 'bg-red-50 text-red-700' : ''}
            `}
          >
            {saveStatus === 'saving' && (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600 mr-2" />
                Saving changes...
              </>
            )}
            {saveStatus === 'saved' && (
              <>
                <Check size={16} className="mr-2" />
                Changes saved successfully!
              </>
            )}
            {saveStatus === 'error' && (
              <>
                <X size={16} className="mr-2" />
                Error saving changes. Please try again.
              </>
            )}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Basic Information */}
      <Card className="p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
          <User size={20} className="mr-2 text-gray-600" />
          Basic Information
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Input
            id="profile-first-name"
            name="firstName"
            label="First Name"
            value={formData.name.firstName}
            onChange={(e) => handleInputChange('firstName', e.target.value, 'name')}
            onFocus={() => handleFieldFocus('name.firstName')}
            onBlur={() => handleFieldBlur('name.firstName')}
            required
          />

          <Input
            id="profile-last-name"
            name="lastName"
            label="Last Name"
            value={formData.name.lastName}
            onChange={(e) => handleInputChange('lastName', e.target.value, 'name')}
            onFocus={() => handleFieldFocus('name.lastName')}
            onBlur={() => handleFieldBlur('name.lastName')}
            required
          />
        </div>

        <div className="mt-4">
          <label htmlFor="profile-bio" className="block text-sm font-medium text-gray-700 mb-2">
            Bio
          </label>
          <textarea
            id="profile-bio"
            name="bio"
            value={formData.bio}
            onChange={(e) => handleInputChange('bio', e.target.value)}
            onFocus={() => handleFieldFocus('bio')}
            onBlur={() => handleFieldBlur('bio')}
            placeholder="Tell people a little about yourself..."
            rows={4}
            maxLength={500}
            className="
              w-full px-3 py-2 border border-gray-300 rounded-lg
              focus:ring-2 focus:ring-primary-500 focus:border-transparent
              resize-none transition-all duration-200
            "
          />
          <div className="text-right text-xs text-gray-500 mt-1">
            {formData.bio.length}/500 characters
          </div>
        </div>
      </Card>

      {/* Contact Information */}
      <Card className="p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
          <Phone size={20} className="mr-2 text-gray-600" />
          Contact Information
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Input
            id="profile-phone"
            name="phone"
            label="Phone Number"
            type="tel"
            value={formData.phone}
            onChange={(e) => handleInputChange('phone', e.target.value)}
            onFocus={() => handleFieldFocus('phone')}
            onBlur={() => handleFieldBlur('phone')}
            placeholder="e.g., +1 (555) 123-4567 or 555-123-4567"
            helperText="Optional - Enter your phone number in any standard format"
          />

          <div>
            <label htmlFor="profile-email" className="block text-sm font-medium text-gray-700 mb-2">
              Email (read-only)
            </label>
            <div id="profile-email" className="flex items-center px-3 py-2 bg-gray-50 border border-gray-300 rounded-lg" role="textbox" aria-readonly="true">
              <Mail size={16} className="mr-2 text-gray-400" />
              <span className="text-gray-600">{user?.email}</span>
            </div>
          </div>
        </div>
      </Card>

      {/* Location */}
      <Card className="p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
          <MapPin size={20} className="mr-2 text-gray-600" />
          Location
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Input
            id="profile-street-address"
            name="streetAddress"
            label="Street Address"
            value={formData.location.address.street}
            onChange={(e) => handleInputChange('location.address.street', e.target.value)}
            onFocus={() => handleFieldFocus('location.address.street')}
            onBlur={() => handleFieldBlur('location.address.street')}
            placeholder="123 Main Street"
          />

          <Input
            id="profile-city"
            name="city"
            label="City"
            value={formData.location.address.city}
            onChange={(e) => handleInputChange('location.address.city', e.target.value)}
            onFocus={() => handleFieldFocus('location.address.city')}
            onBlur={() => handleFieldBlur('location.address.city')}
            placeholder="e.g., New York, London, Paris"
            helperText="Optional - Must be 2-100 characters if provided"
          />

          <Input
            id="profile-state"
            name="state"
            label="State/Province"
            value={formData.location.address.state}
            onChange={(e) => handleInputChange('location.address.state', e.target.value)}
            onFocus={() => handleFieldFocus('location.address.state')}
            onBlur={() => handleFieldBlur('location.address.state')}
            placeholder="e.g., NY, California, Ontario"
            helperText="Optional - Must be 2-100 characters if provided"
          />

          <Input
            id="profile-zip-code"
            name="zipCode"
            label="ZIP/Postal Code"
            value={formData.location.address.zipCode}
            onChange={(e) => handleInputChange('location.address.zipCode', e.target.value)}
            onFocus={() => handleFieldFocus('location.address.zipCode')}
            onBlur={() => handleFieldBlur('location.address.zipCode')}
            placeholder="e.g., 10001, SW1A 1AA, K1A-0A6"
            helperText="Optional - 3-10 characters, letters, numbers, spaces, and hyphens"
          />
        </div>
      </Card>

      {/* Social Links */}
      <Card className="p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
          <Globe size={20} className="mr-2 text-gray-600" />
          Social Links
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Input
            id="profile-facebook"
            name="facebook"
            label="Facebook"
            value={formData.socialLinks.facebook}
            onChange={(e) => handleInputChange('facebook', e.target.value, 'socialLinks')}
            onFocus={() => handleFieldFocus('socialLinks.facebook')}
            onBlur={() => handleFieldBlur('socialLinks.facebook')}
            placeholder="https://facebook.com/username"
          />

          <Input
            id="profile-twitter"
            name="twitter"
            label="Twitter"
            value={formData.socialLinks.twitter}
            onChange={(e) => handleInputChange('twitter', e.target.value, 'socialLinks')}
            onFocus={() => handleFieldFocus('socialLinks.twitter')}
            onBlur={() => handleFieldBlur('socialLinks.twitter')}
            placeholder="https://twitter.com/username"
          />

          <Input
            id="profile-instagram"
            name="instagram"
            label="Instagram"
            value={formData.socialLinks.instagram}
            onChange={(e) => handleInputChange('instagram', e.target.value, 'socialLinks')}
            onFocus={() => handleFieldFocus('socialLinks.instagram')}
            onBlur={() => handleFieldBlur('socialLinks.instagram')}
            placeholder="https://instagram.com/username"
          />

          <Input
            id="profile-linkedin"
            name="linkedin"
            label="LinkedIn"
            value={formData.socialLinks.linkedin}
            onChange={(e) => handleInputChange('linkedin', e.target.value, 'socialLinks')}
            onFocus={() => handleFieldFocus('socialLinks.linkedin')}
            onBlur={() => handleFieldBlur('socialLinks.linkedin')}
            placeholder="https://linkedin.com/in/username"
          />
        </div>
      </Card>

      {/* Privacy Settings */}
      <Card className="p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">
          Privacy Settings
        </h3>

        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <label htmlFor="privacy-show-email" className="text-sm font-medium text-gray-700">
                Show email publicly
              </label>
              <p className="text-xs text-gray-500">
                Other users can see your email address
              </p>
            </div>
            <input
              id="privacy-show-email"
              name="showEmail"
              type="checkbox"
              checked={formData.preferences.privacy.showEmail}
              onChange={(e) => handleInputChange('preferences.privacy.showEmail', e.target.checked)}
              className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
            />
          </div>

          <div className="flex items-center justify-between">
            <div>
              <label htmlFor="privacy-show-phone" className="text-sm font-medium text-gray-700">
                Show phone publicly
              </label>
              <p className="text-xs text-gray-500">
                Other users can see your phone number
              </p>
            </div>
            <input
              id="privacy-show-phone"
              name="showPhone"
              type="checkbox"
              checked={formData.preferences.privacy.showPhone}
              onChange={(e) => handleInputChange('preferences.privacy.showPhone', e.target.checked)}
              className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
            />
          </div>

          <div className="flex items-center justify-between">
            <div>
              <label htmlFor="privacy-show-location" className="text-sm font-medium text-gray-700">
                Show location publicly
              </label>
              <p className="text-xs text-gray-500">
                Other users can see your general location
              </p>
            </div>
            <input
              id="privacy-show-location"
              name="showLocation"
              type="checkbox"
              checked={formData.preferences.privacy.showLocation}
              onChange={(e) => handleInputChange('preferences.privacy.showLocation', e.target.checked)}
              className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
            />
          </div>
        </div>
      </Card>

      {/* Form Actions */}
      {(!autoSave || (hasChanges && editingFields.size === 0)) && (
        <div className="flex items-center justify-between pt-6 border-t border-gray-200">
          <div className="flex items-center space-x-4">
            {hasChanges && (
              <span className="text-sm text-gray-600 flex items-center">
                <Edit3 size={16} className="mr-1" />
                You have unsaved changes
                {autoSave && (
                  <span className="ml-2 text-xs bg-blue-100 text-blue-700 px-2 py-1 rounded">
                    Auto-save enabled
                  </span>
                )}
              </span>
            )}
          </div>

          <div className="flex space-x-3">
            <Button
              variant="outline"
              onClick={handleCancel}
              disabled={isLoading}
            >
              Cancel
            </Button>
            
            <Button
              onClick={handleSave}
              loading={isLoading}
              disabled={!hasChanges}
            >
              <Save size={16} className="mr-2" />
              {autoSave ? 'Save Now' : 'Save Changes'}
            </Button>
          </div>
        </div>
      )}
    </div>
  );
});

ProfileEditForm.displayName = 'ProfileEditForm';

export default ProfileEditForm;