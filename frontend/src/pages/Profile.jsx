import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowLeft, Settings, Share, MessageCircle, Flag } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { useToast } from '../components/ui/Toast';
import userService from '../services/userService';

// Profile Components
import ProfileHeader from '../components/profile/ProfileHeader';
import ProfileStats from '../components/profile/ProfileStats';
import RatingDisplay from '../components/profile/RatingDisplay';
import { ProfileSkeleton } from '../components/ui/Skeleton';
import Button from '../components/ui/Button';
import Card from '../components/ui/Card';
import Container from '../components/layout/Container';

/**
 * Profile Page Component
 * Displays user profile information (both own and public profiles)
 */
const Profile = () => {
  const { userId } = useParams(); // If userId exists, it's a public profile view
  const navigate = useNavigate();
  const { user: currentUser } = useAuth();
  const { showSuccess, showError, showInfo } = useToast();

  // State management
  const [user, setUser] = useState(null);
  const [stats, setStats] = useState(null);
  const [completion, setCompletion] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isPhotoUploading, setIsPhotoUploading] = useState(false);
  const [photoUploadProgress, setPhotoUploadProgress] = useState(0);
  const [error, setError] = useState(null);

  // Determine if this is the current user's profile
  const isOwnProfile = !userId || userId === currentUser?.id;

  // Ref to prevent duplicate loads across Strict Mode double-invoke
  const loadStartedRef = useRef(false);

  // Load profile data
  useEffect(() => {
    let mounted = true;
    const hasStarted = loadStartedRef.current;
    
    const loadProfileData = async () => {
      try {
        // Don't load if user is not authenticated and this is their own profile
        if (isOwnProfile && !currentUser) {
          console.log('User not authenticated, skipping profile load');
          if (mounted) {
            setIsLoading(false);
          }
          return;
        }

        // Prevent multiple simultaneous requests (handles Strict Mode double-invoke)
        if (loadStartedRef.current) {
          console.log('Already loading (ref), skipping duplicate request');
          return;
        }
        loadStartedRef.current = true;

        console.log('Starting profile data load...');
        setIsLoading(true);
        setError(null);

        let profileData;
        if (isOwnProfile) {
          // Load current user's complete profile
          const [profileResponse, statsResponse, completionResponse] = await Promise.all([
            userService.getProfile(),
            userService.getUserStats(),
            userService.getProfileCompletion()
          ]);

          profileData = profileResponse.data;
          setStats(statsResponse.data);
          setCompletion(completionResponse.data);
        } else {
          // Load public profile
          const response = await userService.getPublicProfile(userId);
          profileData = response.data;
          
          // Get basic stats for public profile
          setStats({
            totalListings: 0,
            totalBookings: 0,
            completedBookings: 0,
            totalEarnings: 0
          });
        }

        setUser(userService.formatUserData(profileData));
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
    }, [userId, isOwnProfile, currentUser?.id]); // Only depend on currentUser.id to prevent unnecessary re-renders

  // Handle profile photo upload
  const handlePhotoUpload = async (file) => {
    try {
      setIsPhotoUploading(true);
      setPhotoUploadProgress(0);

      const response = await userService.uploadProfilePhoto(file, (progress) => {
        setPhotoUploadProgress(progress);
      });

      // Update user state with new photo
      setUser(prev => ({
        ...prev,
        profile_photo: response.data.photo,
        profilePhotoUrl: response.data.photo.url
      }));

      showSuccess('Profile photo updated successfully!');
    } catch (error) {
      console.error('Photo upload failed:', error);
      showError(error.message || 'Failed to upload photo');
    } finally {
      setIsPhotoUploading(false);
      setPhotoUploadProgress(0);
    }
  };

  // Handle profile photo deletion
  const handlePhotoDelete = async () => {
    try {
      await userService.deleteProfilePhoto();
      
      setUser(prev => ({
        ...prev,
        profile_photo: null,
        profilePhotoUrl: null
      }));

      showSuccess('Profile photo removed successfully');
    } catch (error) {
      console.error('Photo deletion failed:', error);
      showError(error.message || 'Failed to remove photo');
    }
  };

  // Handle edit profile navigation
  const handleEditProfile = () => {
    navigate('/profile/edit');
  };

  // Handle share profile
  const handleShareProfile = async () => {
    try {
      const url = window.location.href;
      
      if (navigator.share) {
        await navigator.share({
          title: `${user?.fullName || 'User'}'s Profile`,
          text: `Check out ${user?.fullName || 'User'}'s profile on Smart Rental`,
          url: url
        });
      } else {
        // Fallback: copy to clipboard
        await navigator.clipboard.writeText(url);
        showSuccess('Profile link copied to clipboard!');
      }
    } catch (error) {
      console.error('Share failed:', error);
    }
  };

  // Handle contact user
  const handleContactUser = () => {
    // This will be implemented when messaging is added
    showInfo('Messaging feature coming soon!');
  };

  // Handle report user
  const handleReportUser = () => {
    // This will be implemented when reporting is added
    showInfo('Report feature coming soon!');
  };

  // Loading state
  if (isLoading) {
    return (
      <Container className="py-8">
        <ProfileSkeleton />
      </Container>
    );
  }

  // No user data state (still loading or authentication issue)
  if (!user && !error) {
    return (
      <Container className="py-8">
        <ProfileSkeleton />
      </Container>
    );
  }

  // Error state
  if (error) {
    return (
      <Container className="py-8">
        <div className="text-center">
          <div className="text-6xl mb-4">😕</div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Profile Not Found</h2>
          <p className="text-gray-600 mb-6">{error}</p>
          <Button onClick={() => navigate('/dashboard')}>
            <ArrowLeft size={16} className="mr-2" />
            Back to Dashboard
          </Button>
        </div>
      </Container>
    );
  }

  // Generate sample reviews for demonstration
  const sampleReviews = [
    {
      id: 1,
      rating: 5,
      reviewer: { name: 'John Smith' },
      comment: 'Excellent host! Very responsive and helpful throughout the entire rental process.',
      createdAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
      tags: ['Responsive', 'Helpful']
    },
    {
      id: 2,
      rating: 4,
      reviewer: { name: 'Sarah Johnson' },
      comment: 'Great experience overall. The property was exactly as described and the communication was clear.',
      createdAt: new Date(Date.now() - 14 * 24 * 60 * 60 * 1000).toISOString(),
      tags: ['Accurate', 'Clear Communication']
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50/30 to-purple-50/30">
      {/* Background Decoration */}
      <div className="fixed inset-0 -z-10 overflow-hidden">
        <div className="absolute -top-40 -right-40 w-80 h-80 rounded-full bg-gradient-to-br from-blue-400/20 to-purple-600/20 blur-3xl"></div>
        <div className="absolute -bottom-40 -left-40 w-80 h-80 rounded-full bg-gradient-to-tr from-pink-400/20 to-orange-600/20 blur-3xl"></div>
      </div>
      
      <Container className="py-6 sm:py-8 lg:py-12">
        <div className="space-y-6 sm:space-y-8 lg:space-y-12">
        {/* Enhanced Mobile-Responsive Navigation */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <button
            onClick={() => navigate(-1)}
            className="group flex items-center space-x-2 text-gray-600 hover:text-gray-800 px-4 py-3 rounded-xl hover:bg-white/80 backdrop-blur-sm border border-transparent hover:border-white/20 hover:shadow-lg transition-all duration-300 min-h-[44px] touch-manipulation self-start"
          >
            <ArrowLeft className="w-4 h-4 sm:w-5 sm:h-5 group-hover:-translate-x-1 transition-transform duration-300" />
            <span className="font-semibold text-sm sm:text-base">Back</span>
          </button>

          {/* Enhanced Mobile Action Buttons */}
          <div className="flex items-center gap-2 sm:gap-3 flex-wrap">
            <button
              onClick={handleShareProfile}
              className="group flex items-center space-x-2 px-4 sm:px-6 py-2.5 sm:py-3 bg-white/80 backdrop-blur-sm border border-white/20 rounded-xl hover:bg-white hover:shadow-lg transition-all duration-300 hover:scale-105 min-h-[44px] touch-manipulation"
            >
              <Share className="w-4 h-4 group-hover:rotate-12 transition-transform duration-300" />
              <span className="font-medium sm:font-semibold text-gray-700 text-sm sm:text-base">Share</span>
            </button>

            {!isOwnProfile && (
              <>
                <button
                  onClick={handleContactUser}
                  className="group flex items-center space-x-2 px-4 sm:px-6 py-2.5 sm:py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-xl hover:from-blue-700 hover:to-purple-700 transition-all duration-300 shadow-lg hover:shadow-blue-500/25 hover:scale-105 min-h-[44px] touch-manipulation"
                >
                  <MessageCircle className="w-4 h-4 group-hover:rotate-12 transition-transform duration-300" />
                  <span className="font-medium sm:font-semibold text-sm sm:text-base">Contact</span>
                </button>

                <button
                  onClick={handleReportUser}
                  className="group flex items-center space-x-1 sm:space-x-2 px-3 sm:px-6 py-2.5 sm:py-3 bg-red-50 border border-red-200 rounded-xl hover:bg-red-100 text-red-600 hover:text-red-700 transition-all duration-300 hover:scale-105 min-h-[44px] touch-manipulation"
                >
                  <Flag className="w-4 h-4 group-hover:rotate-12 transition-transform duration-300" />
                  <span className="hidden sm:inline font-semibold">Report</span>
                </button>
              </>
            )}

            {isOwnProfile && (
              <button
                onClick={handleEditProfile}
                className="group flex items-center space-x-2 px-4 sm:px-6 py-2.5 sm:py-3 bg-gradient-to-r from-green-600 to-emerald-600 text-white rounded-xl hover:from-green-700 hover:to-emerald-700 transition-all duration-300 shadow-lg hover:shadow-green-500/25 hover:scale-105 min-h-[44px] touch-manipulation"
              >
                <Settings className="w-4 h-4 group-hover:rotate-12 transition-transform duration-300" />
                <span className="font-medium sm:font-semibold text-sm sm:text-base">Edit Profile</span>
              </button>
            )}
          </div>
        </div>

        {/* Profile Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <ProfileHeader
            user={user}
            isOwner={isOwnProfile}
            onEditProfile={handleEditProfile}
            onUploadPhoto={handlePhotoUpload}
            onUploadCover={() => showInfo('Cover photo upload coming soon!')}
            isUploading={isPhotoUploading}
            coverPhoto={null} // Will implement cover photos in future
          />
        </motion.div>

        {/* Profile Completion (Own Profile Only) */}
        {isOwnProfile && completion && completion.percentage < 100 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
          >
            <Card className="p-6 bg-gradient-to-r from-primary-50 to-secondary-50 border-primary-200">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">
                    Complete Your Profile
                  </h3>
                  <p className="text-gray-600 mb-4">
                    Your profile is {completion.percentage}% complete. 
                    Add more information to build trust with other users.
                  </p>
                  
                  {/* Missing Fields */}
                  <div className="flex flex-wrap gap-2">
                    {completion.missingFields?.slice(0, 3).map((field) => (
                      <span
                        key={field}
                        className="px-3 py-1 bg-white text-primary-700 text-sm rounded-full border border-primary-200"
                      >
                        Add {field.replace(/_/g, ' ')}
                      </span>
                    ))}
                    {completion.missingFields?.length > 3 && (
                      <span className="px-3 py-1 bg-white text-primary-700 text-sm rounded-full border border-primary-200">
                        +{completion.missingFields.length - 3} more
                      </span>
                    )}
                  </div>
                </div>

                <Button
                  onClick={handleEditProfile}
                  className="shrink-0"
                >
                  Complete Profile
                </Button>
              </div>
            </Card>
          </motion.div>
        )}

        {/* Profile Content */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-8">
            {/* Profile Statistics */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.2 }}
            >
              <ProfileStats user={user} stats={stats} />
            </motion.div>

            {/* Reviews Section */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.3 }}
            >
              <Card className="p-6">
                <h3 className="text-xl font-semibold text-gray-900 mb-6">
                  Reviews & Ratings
                </h3>
                
                <RatingDisplay
                  rating={user?.rating_avg || 0}
                  totalReviews={user?.rating_count || 0}
                  ratingBreakdown={{
                    5: Math.floor((user?.rating_count || 0) * 0.6),
                    4: Math.floor((user?.rating_count || 0) * 0.2),
                    3: Math.floor((user?.rating_count || 0) * 0.1),
                    2: Math.floor((user?.rating_count || 0) * 0.05),
                    1: Math.floor((user?.rating_count || 0) * 0.05)
                  }}
                  reviews={(user?.rating_count || 0) > 0 ? sampleReviews : []}
                  onViewAllReviews={() => showInfo('Full reviews page coming soon!')}
                />
              </Card>
            </motion.div>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Quick Info */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5, delay: 0.4 }}
            >
              <Card className="p-6">
                <h4 className="font-semibold text-gray-900 mb-4">Quick Info</h4>
                
                <div className="space-y-3 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Member since:</span>
                    <span className="font-medium">
                      {user?.memberSince?.getFullYear() || 'Recently'}
                    </span>
                  </div>
                  
                  <div className="flex justify-between">
                    <span className="text-gray-600">Response rate:</span>
                    <span className="font-medium">New user</span>
                  </div>
                  
                  <div className="flex justify-between">
                    <span className="text-gray-600">Languages:</span>
                    <span className="font-medium">English</span>
                  </div>
                  
                  <div className="flex justify-between">
                    <span className="text-gray-600">Verified:</span>
                    <span className={`font-medium ${user?.isVerified ? 'text-green-600' : 'text-gray-500'}`}>
                      {user?.isVerified ? '✓ Email' : 'Pending'}
                    </span>
                  </div>
                </div>
              </Card>
            </motion.div>

            {/* Contact Info (Own Profile or Privacy Settings Allow) */}
            {(isOwnProfile || user?.preferences?.privacy?.showEmail || user?.preferences?.privacy?.showPhone) && (
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.5, delay: 0.5 }}
              >
                <Card className="p-6">
                  <h4 className="font-semibold text-gray-900 mb-4">Contact</h4>
                  
                  <div className="space-y-3 text-sm">
                    {(isOwnProfile || user?.preferences?.privacy?.showEmail) && (
                      <div className="flex items-center justify-between">
                        <span className="text-gray-600">Email:</span>
                        <span className="font-medium truncate ml-2">
                          {user?.email}
                        </span>
                      </div>
                    )}
                    
                    {(isOwnProfile || user?.preferences?.privacy?.showPhone) && user?.phone && (
                      <div className="flex items-center justify-between">
                        <span className="text-gray-600">Phone:</span>
                        <span className="font-medium">
                          {user?.phone}
                        </span>
                      </div>
                    )}
                  </div>
                </Card>
              </motion.div>
            )}

            {/* Placeholder for Future Features */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5, delay: 0.6 }}
            >
              <Card className="p-6">
                <h4 className="font-semibold text-gray-900 mb-4">Listings</h4>
                
                <div className="text-center py-6 text-gray-500">
                  <div className="text-3xl mb-2">🏠</div>
                  <p className="text-sm">No listings yet</p>
                  <p className="text-xs mt-1">
                    {isOwnProfile ? 'Create your first listing!' : 'Check back later'}
                  </p>
                </div>
              </Card>
            </motion.div>
          </div>
        </div>
      </div>
    </Container>
    </div>
  );
};

export default Profile;