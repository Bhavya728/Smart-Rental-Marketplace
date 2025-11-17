import React, { useState } from 'react';
import { format } from 'date-fns';
import { MessageCircle, Phone, Video, MoreHorizontal, Archive, Delete, VolumeX } from 'lucide-react';
import OnlineStatus from './OnlineStatus';
import Tooltip from '../ui/Tooltip';

const ConversationItem = ({
  conversation,
  isActive = false,
  isSelected = false,
  onClick,
  onArchive,
  onDelete,
  onMute,
  className = ""
}) => {
  const [showActions, setShowActions] = useState(false);

  const {
    _id,
    participants,
    last_message,
    unread_count = 0,
    is_muted = false,
    is_archived = false,
    updated_at
  } = conversation;

  // Get the other participant (assuming 1-on-1 conversation)
  const otherParticipant = participants?.find(p => p._id !== conversation.current_user_id) || participants?.[0];

  const formatTime = (timestamp) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diffInHours = (now - date) / (1000 * 60 * 60);

    if (diffInHours < 1) {
      return format(date, 'HH:mm');
    } else if (diffInHours < 24) {
      return format(date, 'HH:mm');
    } else if (diffInHours < 7 * 24) {
      return format(date, 'EEE');
    } else {
      return format(date, 'MM/dd');
    }
  };

  const truncateMessage = (message, maxLength = 50) => {
    if (!message) return '';
    if (message.length <= maxLength) return message;
    return message.substring(0, maxLength) + '...';
  };

  const getLastMessagePreview = () => {
    if (!last_message) return 'No messages yet';

    const { content, message_type, sender_id } = last_message;
    const isOwn = sender_id?._id === conversation.current_user_id;
    const prefix = isOwn ? 'You: ' : '';

    switch (message_type) {
      case 'image':
        return `${prefix}📷 Photo`;
      case 'file':
        return `${prefix}📎 File`;
      case 'system':
        return content;
      default:
        return `${prefix}${truncateMessage(content)}`;
    }
  };

  const handleAction = (action, event) => {
    event.stopPropagation();
    
    switch (action) {
      case 'archive':
        onArchive?.(_id);
        break;
      case 'delete':
        onDelete?.(_id);
        break;
      case 'mute':
        onMute?.(_id, !is_muted);
        break;
      default:
        break;
    }
    
    setShowActions(false);
  };

  return (
    <div
      className={`conversation-item ${isActive ? 'active' : ''} ${isSelected ? 'selected' : ''} ${className}`}
      onClick={onClick}
      onMouseEnter={() => setShowActions(true)}
      onMouseLeave={() => setShowActions(false)}
    >
      {/* Avatar */}
      <div className="conversation-avatar">
        <img
          src={otherParticipant?.profile_image || '/default-avatar.png'}
          alt={`${otherParticipant?.first_name} ${otherParticipant?.last_name}`}
        />
        <OnlineStatus
          isOnline={otherParticipant?.online_status}
          size="sm"
          className="avatar-status"
        />
      </div>

      {/* Content */}
      <div className="conversation-content">
        <div className="conversation-header">
          <div className="conversation-name">
            {otherParticipant?.first_name} {otherParticipant?.last_name}
            {is_muted && (
              <Tooltip content="Muted">
                <VolumeX size={12} className="mute-icon" />
              </Tooltip>
            )}
          </div>
          <div className="conversation-time">
            {formatTime(updated_at)}
          </div>
        </div>

        <div className="conversation-footer">
          <div className="last-message">
            {getLastMessagePreview()}
          </div>
          
          <div className="conversation-indicators">
            {unread_count > 0 && (
              <div className="unread-badge">
                {unread_count > 99 ? '99+' : unread_count}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Actions */}
      {showActions && (
        <div className="conversation-actions">
          <Tooltip content="Archive">
            <button
              onClick={(e) => handleAction('archive', e)}
              className="action-button"
            >
              <Archive size={16} />
            </button>
          </Tooltip>
          
          <Tooltip content={is_muted ? "Unmute" : "Mute"}>
            <button
              onClick={(e) => handleAction('mute', e)}
              className={`action-button ${is_muted ? 'active' : ''}`}
            >
              <VolumeX size={16} />
            </button>
          </Tooltip>
          
          <Tooltip content="Delete">
            <button
              onClick={(e) => handleAction('delete', e)}
              className="action-button delete"
            >
              <Delete size={16} />
            </button>
          </Tooltip>
        </div>
      )}

      {/* Archived indicator */}
      {is_archived && (
        <div className="archived-indicator">
          <Archive size={12} />
        </div>
      )}

      <style jsx>{`
        .conversation-item {
          display: flex;
          align-items: center;
          gap: 0.75rem;
          padding: 0.75rem 1rem;
          cursor: pointer;
          transition: all 0.2s ease;
          border-radius: 0.5rem;
          margin: 0 0.5rem 0.25rem;
          position: relative;
          background: transparent;
        }

        .conversation-item:hover {
          background: #f9fafb;
        }

        .conversation-item.active {
          background: #eff6ff;
          border-left: 3px solid #3b82f6;
        }

        .conversation-item.selected {
          background: #dbeafe;
        }

        .conversation-avatar {
          position: relative;
          width: 48px;
          height: 48px;
          flex-shrink: 0;
        }

        .conversation-avatar img {
          width: 100%;
          height: 100%;
          border-radius: 50%;
          object-fit: cover;
        }

        .avatar-status {
          position: absolute;
          bottom: 0;
          right: 0;
        }

        .conversation-content {
          flex: 1;
          min-width: 0;
          display: flex;
          flex-direction: column;
          gap: 0.25rem;
        }

        .conversation-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          gap: 0.5rem;
        }

        .conversation-name {
          font-weight: 600;
          color: #111827;
          font-size: 0.875rem;
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
          display: flex;
          align-items: center;
          gap: 0.375rem;
        }

        .mute-icon {
          color: #6b7280;
          opacity: 0.7;
        }

        .conversation-time {
          font-size: 0.75rem;
          color: #6b7280;
          flex-shrink: 0;
        }

        .conversation-footer {
          display: flex;
          justify-content: space-between;
          align-items: center;
          gap: 0.5rem;
        }

        .last-message {
          font-size: 0.8125rem;
          color: #6b7280;
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
          flex: 1;
        }

        .conversation-indicators {
          display: flex;
          align-items: center;
          gap: 0.375rem;
          flex-shrink: 0;
        }

        .unread-badge {
          background: #3b82f6;
          color: white;
          border-radius: 10px;
          padding: 0.125rem 0.375rem;
          font-size: 0.6875rem;
          font-weight: 600;
          min-width: 18px;
          height: 18px;
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .conversation-actions {
          position: absolute;
          top: 50%;
          right: 0.75rem;
          transform: translateY(-50%);
          display: flex;
          gap: 0.25rem;
          background: white;
          border-radius: 0.375rem;
          box-shadow: 0 2px 8px rgba(0, 0, 0, 0.15);
          padding: 0.25rem;
          z-index: 10;
        }

        .action-button {
          padding: 0.375rem;
          border: none;
          background: transparent;
          border-radius: 0.25rem;
          cursor: pointer;
          color: #6b7280;
          transition: all 0.2s ease;
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .action-button:hover {
          background: #f3f4f6;
          color: #374151;
        }

        .action-button.active {
          background: #3b82f6;
          color: white;
        }

        .action-button.delete:hover {
          background: #fee2e2;
          color: #dc2626;
        }

        .archived-indicator {
          position: absolute;
          top: 0.5rem;
          right: 0.5rem;
          color: #6b7280;
          opacity: 0.7;
        }

        /* Unread conversation styling */
        .conversation-item:has(.unread-badge) .conversation-name {
          font-weight: 700;
        }

        .conversation-item:has(.unread-badge) .last-message {
          color: #374151;
          font-weight: 500;
        }

        /* Dark theme support */
        @media (prefers-color-scheme: dark) {
          .conversation-item:hover {
            background: #374151;
          }

          .conversation-item.active {
            background: #1e40af;
            border-left-color: #60a5fa;
          }

          .conversation-item.selected {
            background: #1e3a8a;
          }

          .conversation-name {
            color: #f9fafb;
          }

          .conversation-time,
          .last-message {
            color: #9ca3af;
          }

          .conversation-item:has(.unread-badge) .last-message {
            color: #e5e7eb;
          }

          .conversation-actions {
            background: #1f2937;
            box-shadow: 0 2px 8px rgba(0, 0, 0, 0.3);
          }

          .action-button {
            color: #9ca3af;
          }

          .action-button:hover {
            background: #374151;
            color: #f3f4f6;
          }

          .archived-indicator,
          .mute-icon {
            color: #9ca3af;
          }
        }

        /* Mobile responsiveness */
        @media (max-width: 640px) {
          .conversation-item {
            padding: 0.625rem 0.75rem;
            margin: 0 0.25rem 0.125rem;
          }

          .conversation-avatar {
            width: 42px;
            height: 42px;
          }

          .conversation-name {
            font-size: 0.8125rem;
          }

          .last-message {
            font-size: 0.75rem;
          }

          .conversation-time {
            font-size: 0.6875rem;
          }

          .conversation-actions {
            position: fixed;
            top: auto;
            bottom: 1rem;
            left: 50%;
            right: auto;
            transform: translateX(-50%);
            box-shadow: 0 4px 12px rgba(0, 0, 0, 0.2);
          }
        }

        /* Accessibility improvements */
        @media (prefers-reduced-motion: reduce) {
          .conversation-item,
          .action-button {
            transition: none;
          }
        }

        /* Focus styles for keyboard navigation */
        .conversation-item:focus {
          outline: 2px solid #3b82f6;
          outline-offset: -2px;
        }

        .action-button:focus {
          outline: 2px solid #3b82f6;
          outline-offset: 2px;
        }
      `}</style>
    </div>
  );
};

export default ConversationItem;