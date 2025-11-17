import React from 'react';

const TypingIndicator = ({ 
  users = [], 
  className = "",
  maxUsers = 3,
  compact = false
}) => {
  if (!users || users.length === 0) {
    return null;
  }

  const formatTypingText = () => {
    if (users.length === 1) {
      return `${users[0].first_name || 'Someone'} is typing`;
    } else if (users.length === 2) {
      return `${users[0].first_name || 'Someone'} and ${users[1].first_name || 'Someone'} are typing`;
    } else if (users.length <= maxUsers) {
      const names = users.slice(0, -1).map(u => u.first_name || 'Someone').join(', ');
      const lastName = users[users.length - 1].first_name || 'Someone';
      return `${names}, and ${lastName} are typing`;
    } else {
      return `${users.length} people are typing`;
    }
  };

  return (
    <div className={`typing-indicator ${compact ? 'compact' : ''} ${className}`}>
      <div className="typing-content">
        <div className="typing-animation">
          <div className="typing-dot dot-1" />
          <div className="typing-dot dot-2" />
          <div className="typing-dot dot-3" />
        </div>
        
        {!compact && (
          <span className="typing-text">
            {formatTypingText()}
          </span>
        )}
      </div>

      <style jsx>{`
        .typing-indicator {
          display: flex;
          align-items: center;
          padding: 0.5rem 1rem;
          background: #f3f4f6;
          border-radius: 1rem;
          margin: 0.25rem 0;
          animation: fadeInUp 0.3s ease-out;
        }

        .typing-indicator.compact {
          padding: 0.25rem 0.75rem;
          background: transparent;
        }

        .typing-content {
          display: flex;
          align-items: center;
          gap: 0.75rem;
        }

        .typing-animation {
          display: flex;
          align-items: center;
          gap: 0.25rem;
        }

        .typing-dot {
          width: 6px;
          height: 6px;
          border-radius: 50%;
          background: #6b7280;
          animation: typingBounce 1.5s infinite ease-in-out;
        }

        .typing-dot.dot-1 {
          animation-delay: 0s;
        }

        .typing-dot.dot-2 {
          animation-delay: 0.2s;
        }

        .typing-dot.dot-3 {
          animation-delay: 0.4s;
        }

        .typing-text {
          font-size: 0.875rem;
          color: #6b7280;
          font-style: italic;
        }

        @keyframes typingBounce {
          0%, 60%, 100% {
            transform: translateY(0);
            opacity: 0.4;
          }
          30% {
            transform: translateY(-8px);
            opacity: 1;
          }
        }

        @keyframes fadeInUp {
          from {
            opacity: 0;
            transform: translateY(10px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        /* Enhanced animation for better visual feedback */
        .typing-indicator {
          transition: all 0.3s ease;
        }

        .typing-indicator:hover .typing-dot {
          background: #374151;
        }

        /* Dark theme support */
        @media (prefers-color-scheme: dark) {
          .typing-indicator {
            background: #374151;
          }

          .typing-dot {
            background: #9ca3af;
          }

          .typing-text {
            color: #d1d5db;
          }

          .typing-indicator:hover .typing-dot {
            background: #f3f4f6;
          }
        }

        /* Responsive adjustments */
        @media (max-width: 640px) {
          .typing-indicator {
            padding: 0.375rem 0.75rem;
          }

          .typing-text {
            font-size: 0.8125rem;
          }

          .typing-dot {
            width: 5px;
            height: 5px;
          }

          @keyframes typingBounce {
            0%, 60%, 100% {
              transform: translateY(0);
              opacity: 0.4;
            }
            30% {
              transform: translateY(-6px);
              opacity: 1;
            }
          }
        }
      `}</style>
    </div>
  );
};

export default TypingIndicator;