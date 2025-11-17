import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Camera, Edit2, Settings, MapPin, Calendar, Shield } from 'lucide-react';
import Avatar, { AvatarUpload } from '../ui/Avatar';
import Button from '../ui/Button';
import Badge from '../ui/Badge';

/**
 * ProfileHeader Component
 * User profile header with cover photo, avatar, and basic info
 */
const ProfileHeader = ({
  user,
  isOwner = false,
  onEditProfile,
  onUploadPhoto,
  onUploadCover,
  isUploading = false,
  coverPhoto,
  className = ''
}) => {
  const [showFullBio, setShowFullBio] = useState(false);

  const fullName = user?.name 
    ? `${user?.name?.firstName || ''} ${user?.name?.lastName || ''}`.trim() 
    : user?.email?.split('@')[0] || 'User';

  const memberSince = user?.createdAt 
    ? new Date(user?.createdAt).toLocaleDateString('en-US', { 
        year: 'numeric', 
        month: 'long' 
      })
    : null;

  const location = user?.location?.address 
    ? `${user?.location?.address?.city || ''}${user?.location?.address?.state ? ', ' + user.location.address.state : ''}`
    : null;

  const bio = user?.bio || '';
  const shouldTruncateBio = bio.length > 150;
  const displayBio = shouldTruncateBio && !showFullBio 
    ? bio.substring(0, 150) + '...' 
    : bio;

  return (
    <div className={`relative bg-white rounded-2xl shadow-lg overflow-hidden ${className}`}>
      {/* Cover Photo */}
      <div className="relative h-48 md:h-64 bg-gradient-to-r from-primary-400 to-secondary-400">
        {coverPhoto && (
          <img
            src={coverPhoto}
            alt="Cover"
            className="w-full h-full object-cover"
          />
        )}
        
        {/* Cover photo overlay */}
        <div className="absolute inset-0 bg-black bg-opacity-20" />
        
        {/* Cover photo upload button (owner only) */}
        {isOwner && (
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={onUploadCover}
            className="absolute top-4 right-4 p-2 bg-black bg-opacity-50 text-white rounded-lg hover:bg-opacity-70 transition-all duration-200"
            disabled={isUploading}
          >
            <Camera size={20} />
          </motion.button>
        )}

        {/* Settings button (owner only) */}
        {isOwner && (
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={onEditProfile}
            className="absolute top-4 left-4 p-2 bg-black bg-opacity-50 text-white rounded-lg hover:bg-opacity-70 transition-all duration-200"
          >
            <Settings size={20} />
          </motion.button>
        )}
      </div>

      {/* Profile Content */}
      <div className="relative px-6 pb-6">
        {/* Profile Picture */}
        <div className="absolute -top-16 left-6">
          {isOwner ? (
            <AvatarUpload
              src={user?.profile_photo?.url}
              name={fullName}
              size="2xl"
              onUpload={onUploadPhoto}
              isUploading={isUploading}
              className="border-4 border-white shadow-lg"
            />
          ) : (
            <Avatar
              src={user?.profile_photo?.url}
              name={fullName}
              size="2xl"
              className="border-4 border-white shadow-lg"
              showStatus={true}
              status="online"
            />
          )}
        </div>

        {/* Profile Actions (top right) */}
        {isOwner && (
          <div className="absolute -top-6 right-6">
            <Button
              variant="outline"
              size="sm"
              onClick={onEditProfile}
              className="bg-white shadow-lg hover:shadow-xl"
            >
              <Edit2 size={16} className="mr-2" />
              Edit Profile
            </Button>
          </div>
        )}

        {/* Profile Info */}
        <div className="pt-20">
          <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between">
            {/* Basic Info */}
            <div className="flex-1">
              {/* Name and Role */}
              <div className="flex items-center flex-wrap gap-3 mb-3">
                <h1 className="text-2xl md:text-3xl font-bold text-gray-900">
                  {fullName}
                </h1>
                
                {/* Role Badge */}
                <Badge 
                  variant={user?.role === 'owner' ? 'success' : user?.role === 'both' ? 'info' : 'primary'}
                  size="lg"
                >
                  {user?.role === 'both' ? 'Owner & Renter' : 
                   user?.role === 'owner' ? 'Owner' : 'Renter'}
                </Badge>

                {/* Verification Badges */}
                {user?.verified_status?.email && (
                  <Badge variant="success" size="sm">
                    <Shield size={12} className="mr-1" />
                    Verified
                  </Badge>
                )}
              </div>

              {/* Bio */}
              {bio && (
                <div className="mb-4">
                  <p className="text-gray-600 leading-relaxed">
                    {displayBio}
                  </p>
                  {shouldTruncateBio && (
                    <button
                      onClick={() => setShowFullBio(!showFullBio)}
                      className="text-primary-600 hover:text-primary-700 text-sm font-medium mt-1"
                    >
                      {showFullBio ? 'Show less' : 'Show more'}
                    </button>
                  )}
                </div>
              )}

              {/* Location and Member Since */}
              <div className="flex flex-wrap items-center gap-4 text-gray-500 text-sm">
                {location && (
                  <div className="flex items-center">
                    <MapPin size={16} className="mr-1" />
                    <span>{location}</span>
                  </div>
                )}
                
                {memberSince && (
                  <div className="flex items-center">
                    <Calendar size={16} className="mr-1" />
                    <span>Member since {memberSince}</span>
                  </div>
                )}
              </div>
            </div>

            {/* Quick Stats */}
            <div className="mt-6 lg:mt-0 lg:ml-8">
              <div className="flex flex-row lg:flex-col gap-4">
                {/* Rating */}
                <div className="text-center">
                  <div className="text-2xl font-bold text-gray-900">
                    {user?.rating_avg ? user.rating_avg.toFixed(1) : '0.0'}
                  </div>
                  <div className="text-sm text-gray-500">
                    ⭐ ({user?.rating_count || 0} reviews)
                  </div>
                </div>

                {/* Listings Count (placeholder for future) */}
                <div className="text-center">
                  <div className="text-2xl font-bold text-gray-900">0</div>
                  <div className="text-sm text-gray-500">Listings</div>
                </div>

                {/* Response Rate (placeholder for future) */}
                <div className="text-center">
                  <div className="text-2xl font-bold text-gray-900">--</div>
                  <div className="text-sm text-gray-500">Response Rate</div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Social Links */}
        {user?.socialLinks && Object.values(user.socialLinks).some(link => link) && (
          <div className="mt-6 pt-6 border-t border-gray-200">
            <div className="flex items-center space-x-4">
              <span className="text-sm font-medium text-gray-700">Connect:</span>
              {user?.socialLinks?.facebook && (
                <a
                  href={user?.socialLinks?.facebook}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-blue-600 hover:text-blue-700 transition-colors"
                >
                  Facebook
                </a>
              )}
              {user?.socialLinks?.twitter && (
                <a
                  href={user?.socialLinks?.twitter}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-blue-400 hover:text-blue-500 transition-colors"
                >
                  Twitter
                </a>
              )}
              {user?.socialLinks?.instagram && (
                <a
                  href={user?.socialLinks?.instagram}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-pink-600 hover:text-pink-700 transition-colors"
                >
                  Instagram
                </a>
              )}
              {user?.socialLinks?.linkedin && (
                <a
                  href={user?.socialLinks?.linkedin}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-blue-700 hover:text-blue-800 transition-colors"
                >
                  LinkedIn
                </a>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ProfileHeader;