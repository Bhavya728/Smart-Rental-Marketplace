import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowLeft, Save, X, Check, AlertCircle } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { useToast } from '../components/ui/Toast';
import userService from '../services/userService';

// Components
import ProfileEditForm from '../components/profile/ProfileEditForm';
import PhotoUpload from '../components/profile/PhotoUpload';
import ProgressBar, { CircularProgress } from '../components/ui/ProgressBar';
import { FormSkeleton } from '../components/ui/Skeleton';
import Button from '../components/ui/Button';
import Card from '../components/ui/Card';
import Container from '../components/layout/Container';

/**
 * EditProfile Page Component
 * Comprehensive profile editing with auto-save and progress tracking
 */
const EditProfile = () => {
  const navigate = useNavigate();
  const { user: currentUser, refreshUser } = useAuth();
  const { showSuccess, showError, showInfo } = useToast();

  // State management
  const [user, setUser] = useState(null);
  const [completion, setCompletion] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [isPhotoUploading, setIsPhotoUploading] = useState(false);
  const [photoUploadProgress, setPhotoUploadProgress] = useState(0);
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
  const [lastSaved, setLastSaved] = useState(null);
  const [error, setError] = useState(null);

  // Ref to prevent duplicate loads
  const loadStartedRef = useRef(false);
  
  // Ref to trigger save from parent component
  const formRef = useRef(null);

  // Load profile data
  useEffect(() => {
    let mounted = true;
    
    const loadProfileData = async () => {
      try {
        // Don't load if user is not authenticated
        if (!currentUser) {
          console.log('User not authenticated, skipping profile load');
          if (mounted) {
            setIsLoading(false);
          }
          return;
        }

        // Prevent multiple simultaneous requests using ref
        if (loadStartedRef.current) {
          console.log('Already loading (ref check), skipping duplicate request');
          return;
        }
        loadStartedRef.current = true;

        console.log('Starting profile data load...');
        setIsLoading(true);
        setError(null);

        console.log('Making API calls...');
        const [profileResponse, completionResponse] = await Promise.all([
          userService.getProfile(),
          userService.getProfileCompletion()
        ]);

        console.log('API calls successful, setting data...');
        setUser(profileResponse.data);
        setCompletion(completionResponse.data);
      } catch (error) {
        console.error('Failed to load profile:', error);
        if (mounted) {
          setError(error.message);
          showError('Failed to load profile data');
        }
      } finally {
        if (mounted) {
          setIsLoading(false);
        }
      }
    };

    // Debounce the request to prevent infinite loops
    const timeoutId = setTimeout(() => {
      if (mounted) {
        loadProfileData();
      }
    }, 100);

    return () => {
      mounted = false;
      clearTimeout(timeoutId);
    };
  }, [currentUser?.id, showError]); // Only depend on currentUser.id to prevent unnecessary re-renders

  // Handle profile save
  const handleProfileSave = async (profileData) => {
    try {
      setIsSaving(true);
      setError(null);

      // Validate data
      const validation = userService.validateProfileData(profileData);
      if (!validation.isValid) {
        const errorMessage = Object.values(validation.errors)[0];
        throw new Error(errorMessage);
      }

      // Update profile
      const response = await userService.updateProfile(profileData);
      
      // Update local state
      setUser(response.data);
      setHasUnsavedChanges(false);
      setLastSaved(new Date());
      
      // Update auth context
      await refreshUser();

      // Refresh completion
      const completionResponse = await userService.getProfileCompletion();
      setCompletion(completionResponse.data);

      showSuccess('Profile updated successfully!');
    } catch (error) {
      console.error('Profile save failed:', error);
      setError(error.message);
      showError(error.message || 'Failed to update profile');
      throw error; // Re-throw so the form can handle it
    } finally {
      setIsSaving(false);
    }
  };

  // Handle photo upload
  const handlePhotoUpload = async (file) => {
    try {
      setIsPhotoUploading(true);
      setPhotoUploadProgress(0);

      const response = await userService.uploadProfilePhoto(file, (progress) => {
        setPhotoUploadProgress(progress);
      });

      // Update user state
      setUser(prev => ({
        ...prev,
        profile_photo: response.data.photo
      }));

      // Update auth context
      await refreshUser();

      // Refresh completion
      const completionResponse = await userService.getProfileCompletion();
      setCompletion(completionResponse.data);

      showSuccess('Profile photo updated successfully!');
    } catch (error) {
      console.error('Photo upload failed:', error);
      showError(error.message || 'Failed to upload photo');
    } finally {
      setIsPhotoUploading(false);
      setPhotoUploadProgress(0);
    }
  };

  // Handle photo deletion
  const handlePhotoDelete = async () => {
    try {
      await userService.deleteProfilePhoto();
      
      setUser(prev => ({
        ...prev,
        profile_photo: null
      }));

      // Update auth context
      await refreshUser();

      // Refresh completion
      const completionResponse = await userService.getProfileCompletion();
      setCompletion(completionResponse.data);

      showSuccess('Profile photo removed successfully');
    } catch (error) {
      console.error('Photo deletion failed:', error);
      showError(error.message || 'Failed to remove photo');
    }
  };

  // Handle navigation with unsaved changes warning
  const handleNavigation = (path) => {
    if (hasUnsavedChanges) {
      const confirmed = window.confirm(
        'You have unsaved changes. Are you sure you want to leave this page?'
      );
      if (!confirmed) return;
    }
    navigate(path);
  };

  // Prevent accidental navigation with unsaved changes and add keyboard shortcut
  useEffect(() => {
    const handleBeforeUnload = (e) => {
      if (hasUnsavedChanges) {
        e.preventDefault();
        e.returnValue = 'You have unsaved changes. Are you sure you want to leave?';
      }
    };

    const handleKeyDown = (e) => {
      // Ctrl+S or Cmd+S to save
      if ((e.ctrlKey || e.metaKey) && e.key === 's') {
        e.preventDefault();
        if (hasUnsavedChanges && formRef.current) {
          formRef.current.triggerSave();
        }
      }
    };

    window.addEventListener('beforeunload', handleBeforeUnload);
    window.addEventListener('keydown', handleKeyDown);
    
    return () => {
      window.removeEventListener('beforeunload', handleBeforeUnload);
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [hasUnsavedChanges]);

  // Loading state
  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-50 via-blue-50 to-indigo-100">
        <Container className="py-8">
          <div className="max-w-4xl mx-auto">
            <div className="mb-8 bg-white/60 backdrop-blur-lg rounded-3xl p-8 border border-white/20">
              <div className="flex items-center space-x-4 mb-4">
                <div className="w-8 h-8 bg-gray-200 rounded animate-pulse" />
                <div className="h-6 w-32 bg-gray-200 rounded animate-pulse" />
              </div>
            </div>
            <FormSkeleton fields={8} />
          </div>
        </Container>
      </div>
    );
  }

  // Error state
  if (error && !user) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-50 via-blue-50 to-indigo-100">
        <Container className="py-8">
          <div className="text-center bg-white/60 backdrop-blur-lg rounded-3xl p-12 border border-white/20 max-w-lg mx-auto">
            <div className="text-6xl mb-4">😕</div>
            <h2 className="text-2xl font-bold text-gray-900 mb-2">Failed to Load Profile</h2>
            <p className="text-gray-600 mb-6">{error}</p>
            <Button 
              onClick={() => navigate('/profile')}
              className="bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700"
            >
              <ArrowLeft size={16} className="mr-2" />
              Back to Profile
            </Button>
          </div>
        </Container>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-blue-50 to-indigo-100 relative overflow-hidden">
      {/* Background Decoration */}
      <div className="absolute inset-0 bg-gradient-to-br from-purple-400/20 via-blue-400/20 to-indigo-400/20" />
      <div className="absolute top-0 left-0 w-96 h-96 bg-gradient-to-br from-purple-300/30 to-pink-300/30 rounded-full -translate-x-48 -translate-y-48 blur-3xl" />
      <div className="absolute bottom-0 right-0 w-96 h-96 bg-gradient-to-tl from-blue-300/30 to-indigo-300/30 rounded-full translate-x-48 translate-y-48 blur-3xl" />

      <Container className="py-8 relative z-10">
        <div className="max-w-4xl mx-auto space-y-8">
        {/* Header */}
        <div className="bg-white/70 backdrop-blur-lg rounded-3xl border border-white/20 p-8 shadow-xl">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <Button
                variant="outline"
                onClick={() => handleNavigation('/profile')}
                className="flex items-center bg-white/60 backdrop-blur-sm border-white/30 hover:bg-white/80 hover:shadow-lg transition-all duration-300"
              >
                <ArrowLeft size={16} className="mr-2" />
                Back to Profile
              </Button>

              <div>
                <h1 className="text-3xl font-black bg-gradient-to-r from-purple-600 via-blue-600 to-indigo-600 bg-clip-text text-transparent">
                  Edit Profile
                </h1>
                <p className="text-gray-600 font-medium">
                  Update your information and preferences
                </p>
              </div>
            </div>

            {/* Save Status & Actions */}
            <div className="flex items-center space-x-4">
              {lastSaved && (
                <div className="text-sm text-gray-500 bg-white/40 px-3 py-1 rounded-full">
                  Last saved: {lastSaved.toLocaleTimeString()}
                </div>
              )}

              {hasUnsavedChanges && (
                <div className="flex items-center text-sm text-amber-600 bg-amber-50/80 px-3 py-2 rounded-full border border-amber-200/50">
                  <AlertCircle size={16} className="mr-1" />
                  Unsaved changes
                  <span className="ml-2 text-xs bg-amber-100/80 text-amber-700 px-2 py-1 rounded-full border border-amber-300/50">
                    Press Ctrl+S to save
                  </span>
                </div>
              )}

              {isSaving && (
                <div className="flex items-center text-sm text-blue-600 bg-blue-50/80 px-3 py-2 rounded-full border border-blue-200/50">
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600 mr-2" />
                  Saving...
                </div>
              )}

              {/* Manual Save Button */}
              <Button
                onClick={() => formRef.current?.triggerSave()}
                loading={isSaving}
                disabled={!hasUnsavedChanges}
                variant="primary"
                className="flex items-center bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105"
              >
                <Save size={16} className="mr-2" />
                Save Changes
              </Button>
            </div>
          </div>
        </div>

        {/* Progress Section */}
        {completion && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="grid grid-cols-1 md:grid-cols-3 gap-6"
          >
            {/* Profile Completion */}
            <Card className="p-6 text-center bg-white/60 backdrop-blur-lg border border-white/20 shadow-xl hover:shadow-2xl transition-all duration-300">
              <h3 className="font-bold text-gray-900 mb-4">Profile Completion</h3>
              
              <CircularProgress
                value={completion.percentage}
                size={80}
                strokeWidth={6}
                variant={completion.percentage >= 80 ? 'success' : completion.percentage >= 50 ? 'warning' : 'default'}
                showPercentage={true}
                className="mx-auto mb-4"
              />
              
              <p className="text-sm text-gray-600">
                {completion.percentage === 100 
                  ? 'Perfect! Your profile is complete.'
                  : `${completion.completedFields}/${completion.totalFields} sections complete`
                }
              </p>
            </Card>

            {/* Quick Stats */}
            <Card className="p-6 bg-white/60 backdrop-blur-lg border border-white/20 shadow-xl hover:shadow-2xl transition-all duration-300">
              <h3 className="font-bold text-gray-900 mb-4">Profile Stats</h3>
              
              <div className="space-y-3">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Profile Views:</span>
                  <span className="font-medium">0</span>
                </div>
                
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Connections:</span>
                  <span className="font-medium">{user?.socialLinksCount || 0}</span>
                </div>
                
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Verified:</span>
                  <span className={`font-medium ${user?.verified_status?.email ? 'text-green-600' : 'text-gray-500'}`}>
                    {user?.verified_status?.email ? '✓ Email' : 'Pending'}
                  </span>
                </div>
              </div>
            </Card>

            {/* Missing Fields */}
            <Card className="p-6 bg-white/60 backdrop-blur-lg border border-white/20 shadow-xl hover:shadow-2xl transition-all duration-300">
              <h3 className="font-bold text-gray-900 mb-4">To Complete</h3>
              
              {completion.percentage === 100 ? (
                <div className="text-center text-green-600">
                  <Check size={32} className="mx-auto mb-2" />
                  <p className="text-sm font-medium">All done!</p>
                </div>
              ) : (
                <div className="space-y-2">
                  {completion.missingFields?.slice(0, 3).map((field, index) => (
                    <div key={index} className="text-xs text-gray-600 flex items-center">
                      <div className="w-2 h-2 bg-amber-400 rounded-full mr-2" />
                      {field.charAt(0).toUpperCase() + field.slice(1).replace(/_/g, ' ')}
                    </div>
                  ))}
                  {completion.missingFields?.length > 3 && (
                    <div className="text-xs text-gray-500">
                      +{completion.missingFields.length - 3} more items
                    </div>
                  )}
                </div>
              )}
            </Card>
          </motion.div>
        )}

        {/* Main Content */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Profile Form */}
          <div className="lg:col-span-2">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
            >
              <ProfileEditForm
                ref={formRef}
                user={user}
                onSave={handleProfileSave}
                isLoading={isSaving}
                autoSave={true}
                onDataChange={(hasChanges) => setHasUnsavedChanges(hasChanges)}
              />
            </motion.div>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Profile Photo */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.3 }}
            >
              <Card className="p-6 bg-white/60 backdrop-blur-lg border border-white/20 shadow-xl hover:shadow-2xl transition-all duration-300">
                <h3 className="font-bold text-gray-900 mb-4">Profile Photo</h3>
                
                <PhotoUpload
                  currentPhoto={user?.profile_photo?.url}
                  onUpload={handlePhotoUpload}
                  onDelete={user?.profile_photo?.url ? handlePhotoDelete : null}
                  isUploading={isPhotoUploading}
                  uploadProgress={photoUploadProgress}
                />

                {/* Photo Guidelines */}
                <div className="mt-4 p-4 bg-gradient-to-r from-blue-50/80 to-indigo-50/80 border border-blue-200/50 rounded-xl backdrop-blur-sm">
                  <h4 className="font-bold text-blue-900 mb-2 text-sm">
                    📸 Photo Tips
                  </h4>
                  <ul className="text-xs text-blue-700 space-y-1">
                    <li>• Use a clear, recent photo</li>
                    <li>• Square photos work best</li>
                    <li>• Good lighting is important</li>
                    <li>• Smile and look friendly!</li>
                  </ul>
                </div>
              </Card>
            </motion.div>

            {/* Profile Tips */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.4 }}
            >
              <Card className="p-6 bg-white/60 backdrop-blur-lg border border-white/20 shadow-xl hover:shadow-2xl transition-all duration-300">
                <h3 className="font-bold text-gray-900 mb-4">💡 Profile Tips</h3>
                
                <div className="space-y-4 text-sm">
                  <div className="flex items-start space-x-3">
                    <div className="w-2 h-2 bg-green-500 rounded-full mt-2 flex-shrink-0" />
                    <div>
                      <p className="font-medium text-gray-900">Complete your bio</p>
                      <p className="text-gray-600">Tell others about yourself and your interests</p>
                    </div>
                  </div>

                  <div className="flex items-start space-x-3">
                    <div className="w-2 h-2 bg-blue-500 rounded-full mt-2 flex-shrink-0" />
                    <div>
                      <p className="font-medium text-gray-900">Add contact info</p>
                      <p className="text-gray-600">Help others reach out to you</p>
                    </div>
                  </div>

                  <div className="flex items-start space-x-3">
                    <div className="w-2 h-2 bg-purple-500 rounded-full mt-2 flex-shrink-0" />
                    <div>
                      <p className="font-medium text-gray-900">Verify your email</p>
                      <p className="text-gray-600">Build trust with other users</p>
                    </div>
                  </div>

                  <div className="flex items-start space-x-3">
                    <div className="w-2 h-2 bg-yellow-500 rounded-full mt-2 flex-shrink-0" />
                    <div>
                      <p className="font-medium text-gray-900">Connect social accounts</p>
                      <p className="text-gray-600">Show your online presence</p>
                    </div>
                  </div>
                </div>
              </Card>
            </motion.div>

            {/* Quick Actions */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.5 }}
            >
              <Card className="p-6 bg-white/60 backdrop-blur-lg border border-white/20 shadow-xl hover:shadow-2xl transition-all duration-300">
                <h3 className="font-bold text-gray-900 mb-4">⚡ Quick Actions</h3>
                
                <div className="space-y-3">
                  <Button
                    variant="outline"
                    size="sm"
                    className="w-full justify-start bg-white/40 border-white/30 hover:bg-white/60 hover:shadow-lg transition-all duration-300"
                    onClick={() => handleNavigation('/profile')}
                  >
                    👁️ Preview Profile
                  </Button>

                  <Button
                    variant="outline"
                    size="sm"
                    className="w-full justify-start bg-white/40 border-white/30 hover:bg-white/60 hover:shadow-lg transition-all duration-300"
                    onClick={() => showInfo('Privacy settings coming soon!')}
                  >
                    🔒 Privacy Settings
                  </Button>

                  <Button
                    variant="outline"
                    size="sm"
                    className="w-full justify-start bg-white/40 border-white/30 hover:bg-white/60 hover:shadow-lg transition-all duration-300"
                    onClick={() => showInfo('Account settings coming soon!')}
                  >
                    ⚙️ Account Settings
                  </Button>

                  <Button
                    variant="outline"
                    size="sm"
                    className="w-full justify-start text-red-600 bg-red-50/50 border-red-200/50 hover:bg-red-100/80 hover:shadow-lg transition-all duration-300"
                    onClick={() => showInfo('Account deletion coming soon!')}
                  >
                    🗑️ Delete Account
                  </Button>
                </div>
              </Card>
            </motion.div>
          </div>
        </div>

        {/* Floating Save Button */}
        <AnimatePresence>
          {hasUnsavedChanges && (
            <motion.div
              initial={{ opacity: 0, y: 100 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 100 }}
              className="fixed bottom-6 right-6 z-50"
            >
              <Button
                onClick={() => formRef.current?.triggerSave()}
                loading={isSaving}
                size="lg"
                variant="primary"
                className="bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 shadow-2xl hover:shadow-3xl transition-all duration-300 transform hover:scale-110 backdrop-blur-lg"
              >
                <Save size={20} className="mr-2" />
                Save Changes
              </Button>
            </motion.div>
          )}
        </AnimatePresence>
        </div>
      </Container>
    </div>
  );
};

export default EditProfile;