import React from 'react';

const OnlineStatus = ({ 
  isOnline, 
  lastSeen, 
  size = 'sm', 
  showText = false,
  className = ""
}) => {
  const formatLastSeen = (lastSeenDate) => {
    if (!lastSeenDate) return 'Last seen a while ago';
    
    const now = new Date();
    const lastSeenTime = new Date(lastSeenDate);
    const diffInMinutes = Math.floor((now - lastSeenTime) / (1000 * 60));
    
    if (diffInMinutes < 1) return 'Just now';
    if (diffInMinutes < 60) return `${diffInMinutes}m ago`;
    
    const diffInHours = Math.floor(diffInMinutes / 60);
    if (diffInHours < 24) return `${diffInHours}h ago`;
    
    const diffInDays = Math.floor(diffInHours / 24);
    if (diffInDays < 7) return `${diffInDays}d ago`;
    
    return lastSeenTime.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric'
    });
  };

  const getSizeClasses = () => {
    switch (size) {
      case 'xs':
        return 'w-2 h-2';
      case 'sm':
        return 'w-3 h-3';
      case 'md':
        return 'w-4 h-4';
      case 'lg':
        return 'w-5 h-5';
      default:
        return 'w-3 h-3';
    }
  };

  const getTextSize = () => {
    switch (size) {
      case 'xs':
      case 'sm':
        return 'text-xs';
      case 'md':
        return 'text-sm';
      case 'lg':
        return 'text-base';
      default:
        return 'text-xs';
    }
  };

  return (
    <div className={`online-status flex items-center gap-1 ${className}`}>
      <div className={`status-indicator ${getSizeClasses()}`}>
        {isOnline ? (
          <div className="online-dot" />
        ) : (
          <div className="offline-dot" />
        )}
      </div>
      
      {showText && (
        <span className={`status-text ${getTextSize()}`}>
          {isOnline ? 'Online' : formatLastSeen(lastSeen)}
        </span>
      )}

      <style jsx>{`
        .status-indicator {
          position: relative;
          border-radius: 50%;
          overflow: hidden;
        }

        .online-dot {
          width: 100%;
          height: 100%;
          background: #10b981;
          border-radius: 50%;
          position: relative;
        }

        .online-dot::after {
          content: '';
          position: absolute;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          border-radius: 50%;
          background: #10b981;
          animation: pulse 2s infinite;
        }

        .offline-dot {
          width: 100%;
          height: 100%;
          background: #6b7280;
          border-radius: 50%;
        }

        .status-text {
          color: #6b7280;
          font-weight: 500;
        }

        .online-status .status-text {
          color: ${isOnline ? '#10b981' : '#6b7280'};
        }

        @keyframes pulse {
          0% {
            transform: scale(1);
            opacity: 1;
          }
          50% {
            transform: scale(1.1);
            opacity: 0.7;
          }
          100% {
            transform: scale(1);
            opacity: 1;
          }
        }

        /* Dark theme support */
        @media (prefers-color-scheme: dark) {
          .offline-dot {
            background: #9ca3af;
          }
          
          .status-text {
            color: #9ca3af;
          }
        }
      `}</style>
    </div>
  );
};

export default OnlineStatus;