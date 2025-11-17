import React from 'react';
import { User } from 'lucide-react';

/**
 * Avatar Component
 * Displays user profile picture with fallback to initials or icon
 */
const Avatar = ({ 
  src, 
  alt, 
  size = 'md', 
  name,
  className = '',
  onClick,
  showStatus = false,
  status = 'offline' // online, offline, away, busy
}) => {
  // Size configurations
  const sizeClasses = {
    xs: 'w-8 h-8 text-xs',
    sm: 'w-10 h-10 text-sm', 
    md: 'w-14 h-14 text-base',
    lg: 'w-18 h-18 text-lg',
    xl: 'w-24 h-24 text-xl',
    '2xl': 'w-28 h-28 text-2xl'
  };

  const iconSizes = {
    xs: 14,
    sm: 18,
    md: 24,
    lg: 28,
    xl: 32,
    '2xl': 40
  };

  const statusSizes = {
    xs: 'w-2 h-2',
    sm: 'w-2.5 h-2.5',
    md: 'w-3.5 h-3.5',
    lg: 'w-4 h-4',
    xl: 'w-5 h-5',
    '2xl': 'w-6 h-6'
  };

  const statusColors = {
    online: 'bg-gradient-to-r from-emerald-400 to-green-500 ring-2 ring-white',
    offline: 'bg-gradient-to-r from-gray-400 to-gray-500 ring-2 ring-white',
    away: 'bg-gradient-to-r from-amber-400 to-yellow-500 ring-2 ring-white',
    busy: 'bg-gradient-to-r from-red-400 to-rose-500 ring-2 ring-white'
  };

  // Generate initials from name
  const getInitials = (name) => {
    if (!name) return '';
    const names = name.trim().split(' ');
    if (names.length === 1) return names[0].charAt(0).toUpperCase();
    return (names[0].charAt(0) + names[names.length - 1].charAt(0)).toUpperCase();
  };

  const initials = getInitials(name || alt);

  const handleImageError = (e) => {
    e.target.style.display = 'none';
    e.target.nextSibling.style.display = 'flex';
  };

  const baseClasses = `
    relative inline-flex items-center justify-center
    rounded-full overflow-hidden bg-gradient-to-br 
    from-primary-100 to-primary-200 border-2 border-white
    shadow-lg transition-all duration-200 hover:shadow-xl
    ${onClick ? 'cursor-pointer hover:scale-105' : ''}
    ${sizeClasses[size]}
    ${className}
  `;

  return (
    <div className={baseClasses} onClick={onClick}>
      {/* Profile Image */}
      {src && (
        <img
          src={src}
          alt={alt || name || 'Profile'}
          className="w-full h-full object-cover"
          onError={handleImageError}
        />
      )}
      
      {/* Fallback Content */}
      <div 
        className={`
          absolute inset-0 flex items-center justify-center
          bg-gradient-to-br from-primary-500 to-secondary-500
          text-white font-semibold
          ${src ? 'hidden' : 'flex'}
        `}
        style={{ display: src ? 'none' : 'flex' }}
      >
        {initials ? (
          <span className="select-none">{initials}</span>
        ) : (
          <User size={iconSizes[size]} />
        )}
      </div>

      {/* Status Indicator */}
      {showStatus && (
        <div 
          className={`
            absolute -bottom-0.5 -right-0.5 rounded-full
            border-2 border-white shadow-sm
            ${statusSizes[size]} ${statusColors[status]}
          `}
          title={`Status: ${status}`}
        />
      )}
    </div>
  );
};

/**
 * Avatar Group Component
 * Displays multiple avatars in a group with overflow indicator
 */
export const AvatarGroup = ({ 
  users = [], 
  max = 5, 
  size = 'md',
  className = '' 
}) => {
  const visibleUsers = users.slice(0, max);
  const remainingCount = users.length - max;

  const overlapClasses = {
    xs: '-ml-1',
    sm: '-ml-1.5',
    md: '-ml-2',
    lg: '-ml-2.5',
    xl: '-ml-3',
    '2xl': '-ml-4'
  };

  return (
    <div className={`flex items-center ${className}`}>
      {visibleUsers.map((user, index) => (
        <div 
          key={user.id || index}
          className={`${index > 0 ? overlapClasses[size] : ''} hover:z-10 relative`}
        >
          <Avatar
            src={user.profile_photo?.url}
            name={user.name ? `${user.name.firstName} ${user.name.lastName}` : user.email}
            size={size}
            className="border-2 border-white hover:border-primary-200"
          />
        </div>
      ))}
      
      {remainingCount > 0 && (
        <div 
          className={`
            ${overlapClasses[size]} relative
            ${sizeClasses[size]} rounded-full
            bg-gray-100 border-2 border-white
            flex items-center justify-center
            text-gray-600 font-medium text-sm
          `}
        >
          +{remainingCount}
        </div>
      )}
    </div>
  );
};

/**
 * Avatar Upload Component
 * Avatar with upload functionality
 */
export const AvatarUpload = ({ 
  src, 
  name, 
  size = 'xl',
  onUpload,
  isUploading = false,
  className = '' 
}) => {
  const fileInputRef = React.useRef(null);

  const handleClick = () => {
    if (!isUploading) {
      fileInputRef.current?.click();
    }
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file && onUpload) {
      onUpload(file);
    }
  };

  return (
    <div className={`relative ${className}`}>
      <Avatar
        src={src}
        name={name}
        size={size}
        onClick={handleClick}
        className={`
          ${!isUploading ? 'hover:opacity-80 cursor-pointer' : 'opacity-50'}
          transition-opacity duration-200
        `}
      />
      
      {/* Upload Overlay */}
      <div 
        className={`
          absolute inset-0 rounded-full
          bg-black bg-opacity-50 opacity-0
          flex items-center justify-center
          transition-opacity duration-200
          ${!isUploading ? 'hover:opacity-100 cursor-pointer' : ''}
        `}
        onClick={handleClick}
      >
        {isUploading ? (
          <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-white" />
        ) : (
          <span className="text-white text-sm font-medium">
            Change
          </span>
        )}
      </div>

      {/* Hidden File Input */}
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        onChange={handleFileChange}
        className="hidden"
        disabled={isUploading}
      />
    </div>
  );
};

export default Avatar;