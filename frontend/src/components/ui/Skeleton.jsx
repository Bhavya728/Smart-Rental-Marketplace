import React from 'react';

/**
 * Skeleton Component
 * Loading placeholder with various shapes and animations
 */
const Skeleton = ({ 
  variant = 'rectangular', // rectangular, circular, text, avatar, card
  width,
  height,
  className = '',
  animate = true,
  count = 1,
  spacing = 2
}) => {
  // Base skeleton classes
  const baseClasses = `
    ${animate ? 'animate-pulse' : ''}
    bg-gradient-to-r from-gray-200 via-gray-300 to-gray-200
    ${animate ? 'bg-[length:200%_100%] animate-shimmer' : ''}
  `;

  // Variant-specific classes
  const variantClasses = {
    rectangular: 'rounded-md',
    circular: 'rounded-full',
    text: 'rounded h-4',
    avatar: 'rounded-full',
    card: 'rounded-lg'
  };

  // Default dimensions based on variant
  const defaultDimensions = {
    rectangular: { width: 'w-full', height: 'h-4' },
    circular: { width: 'w-12', height: 'h-12' },
    text: { width: 'w-full', height: 'h-4' },
    avatar: { width: 'w-12', height: 'h-12' },
    card: { width: 'w-full', height: 'h-48' }
  };

  // Get dimensions
  const widthClass = width || defaultDimensions[variant].width;
  const heightClass = height || defaultDimensions[variant].height;

  // Single skeleton element
  const skeletonElement = (key = 0) => (
    <div
      key={key}
      className={`
        ${baseClasses}
        ${variantClasses[variant]}
        ${widthClass}
        ${heightClass}
        ${className}
      `}
      style={{
        width: typeof width === 'number' ? `${width}px` : undefined,
        height: typeof height === 'number' ? `${height}px` : undefined,
      }}
    />
  );

  // Render multiple skeletons if count > 1
  if (count > 1) {
    return (
      <div className={`space-y-${spacing}`}>
        {Array.from({ length: count }, (_, index) => skeletonElement(index))}
      </div>
    );
  }

  return skeletonElement();
};

/**
 * Text Skeleton
 * Multiple text lines with varying widths
 */
export const TextSkeleton = ({ 
  lines = 3, 
  className = '',
  animate = true 
}) => {
  const lineWidths = ['w-full', 'w-5/6', 'w-4/6', 'w-3/4', 'w-2/3'];
  
  return (
    <div className={`space-y-2 ${className}`}>
      {Array.from({ length: lines }, (_, index) => (
        <Skeleton
          key={index}
          variant="text"
          className={lineWidths[index % lineWidths.length]}
          animate={animate}
        />
      ))}
    </div>
  );
};

/**
 * Card Skeleton
 * Complete card layout skeleton
 */
export const CardSkeleton = ({ 
  showAvatar = true,
  showImage = true,
  textLines = 3,
  className = '',
  animate = true 
}) => {
  return (
    <div className={`p-6 border border-gray-200 rounded-lg space-y-4 ${className}`}>
      {/* Header with avatar */}
      {showAvatar && (
        <div className="flex items-center space-x-3">
          <Skeleton variant="avatar" animate={animate} />
          <div className="flex-1 space-y-2">
            <Skeleton variant="text" width="w-24" animate={animate} />
            <Skeleton variant="text" width="w-32" animate={animate} />
          </div>
        </div>
      )}

      {/* Main image */}
      {showImage && (
        <Skeleton 
          variant="rectangular" 
          height="h-48" 
          className="w-full"
          animate={animate}
        />
      )}

      {/* Text content */}
      <TextSkeleton lines={textLines} animate={animate} />

      {/* Footer buttons */}
      <div className="flex space-x-2">
        <Skeleton width="w-20" height="h-8" animate={animate} />
        <Skeleton width="w-16" height="h-8" animate={animate} />
      </div>
    </div>
  );
};

/**
 * List Skeleton
 * Skeleton for list items
 */
export const ListSkeleton = ({ 
  items = 5,
  showAvatar = true,
  className = '',
  animate = true 
}) => {
  return (
    <div className={`space-y-3 ${className}`}>
      {Array.from({ length: items }, (_, index) => (
        <div key={index} className="flex items-center space-x-3 p-3">
          {showAvatar && <Skeleton variant="avatar" animate={animate} />}
          <div className="flex-1 space-y-2">
            <Skeleton variant="text" width="w-3/4" animate={animate} />
            <Skeleton variant="text" width="w-1/2" animate={animate} />
          </div>
          <Skeleton width="w-16" height="h-6" animate={animate} />
        </div>
      ))}
    </div>
  );
};

/**
 * Table Skeleton
 * Skeleton for table layout
 */
export const TableSkeleton = ({ 
  rows = 5,
  columns = 4,
  showHeader = true,
  className = '',
  animate = true 
}) => {
  return (
    <div className={`space-y-2 ${className}`}>
      {/* Table Header */}
      {showHeader && (
        <div className="grid grid-cols-4 gap-4 p-4 bg-gray-50 rounded-lg">
          {Array.from({ length: columns }, (_, index) => (
            <Skeleton 
              key={index} 
              variant="text" 
              width="w-20" 
              animate={animate} 
            />
          ))}
        </div>
      )}

      {/* Table Rows */}
      {Array.from({ length: rows }, (_, rowIndex) => (
        <div key={rowIndex} className="grid grid-cols-4 gap-4 p-4 border-b border-gray-100">
          {Array.from({ length: columns }, (_, colIndex) => (
            <Skeleton 
              key={colIndex} 
              variant="text"
              animate={animate}
            />
          ))}
        </div>
      ))}
    </div>
  );
};

/**
 * Profile Skeleton
 * Skeleton for user profile layout
 */
export const ProfileSkeleton = ({ 
  className = '',
  animate = true 
}) => {
  return (
    <div className={`space-y-6 ${className}`}>
      {/* Profile Header */}
      <div className="flex items-center space-x-6">
        <Skeleton 
          variant="avatar" 
          width="w-24" 
          height="h-24"
          animate={animate}
        />
        <div className="flex-1 space-y-3">
          <Skeleton variant="text" width="w-48" height="h-6" animate={animate} />
          <Skeleton variant="text" width="w-32" animate={animate} />
          <div className="flex space-x-2">
            <Skeleton width="w-20" height="h-8" animate={animate} />
            <Skeleton width="w-24" height="h-8" animate={animate} />
          </div>
        </div>
      </div>

      {/* Profile Stats */}
      <div className="grid grid-cols-3 gap-4">
        {Array.from({ length: 3 }, (_, index) => (
          <div key={index} className="text-center p-4 border border-gray-200 rounded-lg">
            <Skeleton width="w-16" height="h-8" className="mx-auto mb-2" animate={animate} />
            <Skeleton variant="text" width="w-20" className="mx-auto" animate={animate} />
          </div>
        ))}
      </div>

      {/* Profile Content */}
      <div className="grid grid-cols-2 gap-6">
        <div className="space-y-4">
          <Skeleton variant="text" width="w-32" height="h-6" animate={animate} />
          <TextSkeleton lines={4} animate={animate} />
        </div>
        <div className="space-y-4">
          <Skeleton variant="text" width="w-28" height="h-6" animate={animate} />
          <ListSkeleton items={3} showAvatar={false} animate={animate} />
        </div>
      </div>
    </div>
  );
};

/**
 * Form Skeleton
 * Skeleton for form layouts
 */
export const FormSkeleton = ({ 
  fields = 6,
  className = '',
  animate = true 
}) => {
  return (
    <div className={`space-y-4 ${className}`}>
      {Array.from({ length: fields }, (_, index) => (
        <div key={index} className="space-y-2">
          <Skeleton variant="text" width="w-24" animate={animate} />
          <Skeleton 
            variant="rectangular" 
            height="h-10" 
            className="w-full"
            animate={animate}
          />
        </div>
      ))}
      
      {/* Form buttons */}
      <div className="flex space-x-3 pt-4">
        <Skeleton width="w-24" height="h-10" animate={animate} />
        <Skeleton width="w-20" height="h-10" animate={animate} />
      </div>
    </div>
  );
};

// Add shimmer animation to CSS (should be in index.css)
const shimmerStyles = `
  @keyframes shimmer {
    0% { background-position: -200% 0; }
    100% { background-position: 200% 0; }
  }
  .animate-shimmer {
    animation: shimmer 2s infinite linear;
  }
`;

// Inject styles if not present
if (typeof document !== 'undefined') {
  const existingStyle = document.getElementById('skeleton-shimmer');
  if (!existingStyle) {
    const style = document.createElement('style');
    style.id = 'skeleton-shimmer';
    style.textContent = shimmerStyles;
    document.head.appendChild(style);
  }
}

export default Skeleton;