import React, { useState } from 'react';
import { format } from 'date-fns';
import { Edit2, Trash2, Reply, MoreHorizontal, Check, CheckCheck } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import OnlineStatus from './OnlineStatus';
import Tooltip from '../ui/Tooltip';

const MessageBubble = ({
  message,
  isOwn,
  showAvatar = true,
  showTimestamp = true,
  onEdit,
  onDelete,
  onReply,
  className = ""
}) => {
  const { user } = useAuth();
  const [showActions, setShowActions] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editContent, setEditContent] = useState(message.content || '');

  const handleEdit = () => {
    if (isEditing) {
      if (editContent.trim() !== message.content) {
        onEdit?.(message._id, editContent.trim());
      }
      setIsEditing(false);
    } else {
      setIsEditing(true);
      setEditContent(message.content || '');
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleEdit();
    } else if (e.key === 'Escape') {
      setIsEditing(false);
      setEditContent(message.content || '');
    }
  };

  const formatTime = (timestamp) => {
    return format(new Date(timestamp), 'HH:mm');
  };

  const formatDate = (timestamp) => {
    const messageDate = new Date(timestamp);
    const now = new Date();
    const diffInHours = (now - messageDate) / (1000 * 60 * 60);

    if (diffInHours < 24) {
      return formatTime(timestamp);
    } else if (diffInHours < 7 * 24) {
      return format(messageDate, 'EEE HH:mm');
    } else {
      return format(messageDate, 'MMM d, HH:mm');
    }
  };

  const getMessageTypeIcon = () => {
    switch (message.message_type) {
      case 'image':
        return '🖼️';
      case 'file':
        return '📎';
      case 'system':
        return 'ℹ️';
      default:
        return null;
    }
  };

  const renderMessageContent = () => {
    if (isEditing) {
      return (
        <textarea
          value={editContent}
          onChange={(e) => setEditContent(e.target.value)}
          onKeyDown={handleKeyPress}
          onBlur={handleEdit}
          className="edit-textarea"
          autoFocus
          rows={Math.min(Math.max(editContent.split('\n').length, 1), 4)}
        />
      );
    }

    switch (message.message_type) {
      case 'text':
        return (
          <div className="message-text">
            {message.content?.split('\n').map((line, index) => (
              <React.Fragment key={index}>
                {line}
                {index < message.content.split('\n').length - 1 && <br />}
              </React.Fragment>
            ))}
          </div>
        );
      
      case 'image':
        return (
          <div className="message-image">
            <img 
              src={message.file_url} 
              alt="Shared image"
              loading="lazy"
            />
            {message.content && (
              <div className="image-caption">{message.content}</div>
            )}
          </div>
        );
      
      case 'file':
        return (
          <div className="message-file">
            <div className="file-info">
              <span className="file-icon">{getMessageTypeIcon()}</span>
              <div className="file-details">
                <div className="file-name">{message.file_name}</div>
                <div className="file-size">
                  {message.file_size ? `${(message.file_size / 1024).toFixed(1)} KB` : 'File'}
                </div>
              </div>
            </div>
            <a 
              href={message.file_url} 
              target="_blank" 
              rel="noopener noreferrer"
              className="file-download"
            >
              Download
            </a>
          </div>
        );
      
      case 'system':
        return (
          <div className="system-message">
            <span className="system-icon">{getMessageTypeIcon()}</span>
            {message.content}
          </div>
        );
      
      default:
        return <div className="message-text">{message.content}</div>;
    }
  };

  const canEdit = isOwn && message.message_type === 'text' && !message.is_system;
  const canDelete = isOwn && !message.is_system;

  if (message.message_type === 'system') {
    return (
      <div className={`system-message-container ${className}`}>
        <div className="system-message-bubble">
          {renderMessageContent()}
        </div>
        {showTimestamp && (
          <div className="system-timestamp">
            {formatDate(message.created_at)}
          </div>
        )}

        <style jsx>{`
          .system-message-container {
            display: flex;
            flex-direction: column;
            align-items: center;
            margin: 1rem 0;
          }

          .system-message-bubble {
            background: #f3f4f6;
            color: #6b7280;
            padding: 0.5rem 1rem;
            border-radius: 1rem;
            font-size: 0.875rem;
            text-align: center;
            max-width: 80%;
          }

          .system-timestamp {
            font-size: 0.75rem;
            color: #9ca3af;
            margin-top: 0.25rem;
          }

          .system-message {
            display: flex;
            align-items: center;
            gap: 0.5rem;
          }

          .system-icon {
            font-size: 0.875rem;
          }
        `}</style>
      </div>
    );
  }

  return (
    <div 
      className={`message-bubble-container ${isOwn ? 'own' : 'other'} ${className}`}
      onMouseEnter={() => setShowActions(true)}
      onMouseLeave={() => setShowActions(false)}
    >
      <div className="message-row">
        {!isOwn && showAvatar && (
          <div className="message-avatar">
            <img 
              src={message.sender_id?.profile_image || '/default-avatar.png'} 
              alt={`${message.sender_id?.first_name} ${message.sender_id?.last_name}`}
            />
            <OnlineStatus 
              isOnline={message.sender_id?.online_status} 
              size="xs"
              className="avatar-status"
            />
          </div>
        )}

        <div className="message-content">
          {!isOwn && (
            <div className="message-sender">
              {message.sender_id?.first_name} {message.sender_id?.last_name}
            </div>
          )}

          <div className={`message-bubble ${isOwn ? 'own-bubble' : 'other-bubble'}`}>
            {message.reply_to && (
              <div className="reply-to">
                <div className="reply-bar" />
                <div className="reply-content">
                  <div className="reply-sender">
                    {message.reply_to.sender_id?.first_name} {message.reply_to.sender_id?.last_name}
                  </div>
                  <div className="reply-text">
                    {message.reply_to.content?.substring(0, 50)}
                    {message.reply_to.content?.length > 50 ? '...' : ''}
                  </div>
                </div>
              </div>
            )}

            {renderMessageContent()}

            <div className="message-meta">
              {showTimestamp && (
                <span className="message-time">
                  {formatDate(message.created_at)}
                </span>
              )}
              
              {message.is_edited && (
                <Tooltip content="Edited">
                  <span className="edited-indicator">edited</span>
                </Tooltip>
              )}
              
              {isOwn && (
                <div className="read-status">
                  {message.is_read ? (
                    <Tooltip content="Read">
                      <CheckCheck size={14} className="read-icon" />
                    </Tooltip>
                  ) : (
                    <Tooltip content="Delivered">
                      <Check size={14} className="delivered-icon" />
                    </Tooltip>
                  )}
                </div>
              )}
            </div>
          </div>

          {(showActions || isEditing) && (canEdit || canDelete || onReply) && (
            <div className={`message-actions ${isOwn ? 'own-actions' : 'other-actions'}`}>
              {onReply && (
                <Tooltip content="Reply">
                  <button 
                    onClick={() => onReply(message)}
                    className="action-button"
                  >
                    <Reply size={14} />
                  </button>
                </Tooltip>
              )}
              
              {canEdit && (
                <Tooltip content={isEditing ? "Save" : "Edit"}>
                  <button 
                    onClick={handleEdit}
                    className={`action-button ${isEditing ? 'active' : ''}`}
                  >
                    <Edit2 size={14} />
                  </button>
                </Tooltip>
              )}
              
              {canDelete && (
                <Tooltip content="Delete">
                  <button 
                    onClick={() => onDelete?.(message._id)}
                    className="action-button delete"
                  >
                    <Trash2 size={14} />
                  </button>
                </Tooltip>
              )}
            </div>
          )}
        </div>
      </div>

      <style jsx>{`
        .message-bubble-container {
          margin: 0.5rem 0;
          max-width: 100%;
        }

        .message-bubble-container.own {
          display: flex;
          justify-content: flex-end;
        }

        .message-row {
          display: flex;
          align-items: flex-end;
          gap: 0.75rem;
          max-width: 70%;
          position: relative;
        }

        .message-bubble-container.own .message-row {
          flex-direction: row-reverse;
        }

        .message-avatar {
          position: relative;
          width: 32px;
          height: 32px;
          flex-shrink: 0;
        }

        .message-avatar img {
          width: 100%;
          height: 100%;
          border-radius: 50%;
          object-fit: cover;
        }

        .avatar-status {
          position: absolute;
          bottom: -2px;
          right: -2px;
        }

        .message-content {
          flex: 1;
          min-width: 0;
          position: relative;
        }

        .message-sender {
          font-size: 0.75rem;
          color: #6b7280;
          margin-bottom: 0.25rem;
          padding-left: 0.75rem;
        }

        .message-bubble {
          padding: 0.75rem 1rem;
          border-radius: 1.125rem;
          position: relative;
          word-wrap: break-word;
          overflow-wrap: break-word;
        }

        .own-bubble {
          background: #3b82f6;
          color: white;
          border-bottom-right-radius: 0.375rem;
        }

        .other-bubble {
          background: #f3f4f6;
          color: #111827;
          border-bottom-left-radius: 0.375rem;
        }

        .reply-to {
          display: flex;
          gap: 0.5rem;
          margin-bottom: 0.5rem;
          padding: 0.5rem;
          background: rgba(0, 0, 0, 0.1);
          border-radius: 0.5rem;
          font-size: 0.875rem;
        }

        .reply-bar {
          width: 3px;
          background: currentColor;
          border-radius: 1.5px;
          opacity: 0.6;
        }

        .reply-sender {
          font-weight: 600;
          font-size: 0.75rem;
          opacity: 0.8;
        }

        .reply-text {
          opacity: 0.7;
          font-size: 0.8125rem;
        }

        .message-text {
          line-height: 1.4;
        }

        .message-image img {
          max-width: 100%;
          max-height: 300px;
          border-radius: 0.5rem;
          cursor: pointer;
        }

        .image-caption {
          margin-top: 0.5rem;
          font-size: 0.875rem;
          opacity: 0.9;
        }

        .message-file {
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 1rem;
          background: rgba(0, 0, 0, 0.1);
          padding: 0.75rem;
          border-radius: 0.5rem;
        }

        .file-info {
          display: flex;
          align-items: center;
          gap: 0.75rem;
        }

        .file-icon {
          font-size: 1.25rem;
        }

        .file-name {
          font-weight: 600;
          font-size: 0.875rem;
        }

        .file-size {
          font-size: 0.75rem;
          opacity: 0.7;
        }

        .file-download {
          padding: 0.375rem 0.75rem;
          background: rgba(255, 255, 255, 0.2);
          border-radius: 0.375rem;
          text-decoration: none;
          font-size: 0.875rem;
          font-weight: 500;
          transition: background-color 0.2s ease;
        }

        .file-download:hover {
          background: rgba(255, 255, 255, 0.3);
        }

        .message-meta {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          margin-top: 0.25rem;
          font-size: 0.75rem;
          opacity: 0.7;
        }

        .message-time {
          font-size: 0.6875rem;
        }

        .edited-indicator {
          font-size: 0.6875rem;
          font-style: italic;
          cursor: help;
        }

        .read-status {
          margin-left: auto;
        }

        .read-icon {
          color: #10b981;
        }

        .delivered-icon {
          color: #6b7280;
        }

        .message-actions {
          position: absolute;
          top: 0;
          display: flex;
          gap: 0.25rem;
          background: white;
          border-radius: 0.375rem;
          box-shadow: 0 2px 8px rgba(0, 0, 0, 0.15);
          padding: 0.25rem;
          z-index: 10;
        }

        .own-actions {
          right: -60px;
        }

        .other-actions {
          left: -60px;
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

        .edit-textarea {
          width: 100%;
          border: none;
          outline: none;
          background: transparent;
          resize: none;
          font-family: inherit;
          font-size: inherit;
          line-height: inherit;
          color: inherit;
          padding: 0;
        }

        /* Dark theme support */
        @media (prefers-color-scheme: dark) {
          .other-bubble {
            background: #374151;
            color: #f9fafb;
          }

          .message-sender {
            color: #9ca3af;
          }

          .message-actions {
            background: #1f2937;
          }

          .action-button {
            color: #9ca3af;
          }

          .action-button:hover {
            background: #374151;
            color: #f3f4f6;
          }
        }

        /* Mobile responsiveness */
        @media (max-width: 640px) {
          .message-row {
            max-width: 85%;
          }

          .message-bubble {
            padding: 0.625rem 0.875rem;
            border-radius: 1rem;
          }

          .message-actions {
            position: fixed;
            bottom: 1rem;
            left: 50%;
            transform: translateX(-50%);
            right: auto;
          }
        }
      `}</style>
    </div>
  );
};

export default MessageBubble;