import React, { useState, useEffect, useRef } from 'react';
import { Phone, Video, MoreHorizontal, Search, Archive, VolumeX, UserPlus, Info } from 'lucide-react';
import MessageList from './MessageList';
import MessageInput from './MessageInput';
import TypingIndicator from './TypingIndicator';
import OnlineStatus from "./OnlineStatus";
import Tooltip from "../ui/Tooltip";
import { useAuth } from "../../contexts/AuthContext";
import { useSocket } from '../../hooks/useSocket';

const ChatWindow = ({
  conversation,
  messages = [],
  typingUsers = [],
  onSendMessage,
  onEditMessage,
  onDeleteMessage,
  onReplyToMessage,
  onLoadMoreMessages,
  onArchiveConversation,
  onMuteConversation,
  hasMoreMessages = false,
  loading = false,
  className = ""
}) => {
  const { user } = useAuth();
  const { socket, sendTyping, stopTyping } = useSocket();
  const [replyTo, setReplyTo] = useState(null);
  const [showInfo, setShowInfo] = useState(false);
  const [showSearch, setShowSearch] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  // Get other participant info
  const otherParticipant = conversation?.participants?.find(p => p._id !== user?._id);

  const handleSendMessage = async (messageData) => {
    try {
      await onSendMessage({
        ...messageData,
        conversation_id: conversation._id
      });
      setReplyTo(null);
    } catch (error) {
      console.error('Failed to send message:', error);
    }
  };

  const handleReply = (message) => {
    setReplyTo(message);
  };

  const clearReply = () => {
    setReplyTo(null);
  };

  const handleTypingStart = () => {
    if (conversation?._id) {
      sendTyping(conversation._id);
    }
  };

  const handleTypingStop = () => {
    if (conversation?._id) {
      stopTyping(conversation._id);
    }
  };

  const handleArchive = () => {
    onArchiveConversation?.(conversation._id);
  };

  const handleMute = () => {
    onMuteConversation?.(conversation._id, !conversation.is_muted);
  };

  // Filter messages based on search
  const filteredMessages = messages.filter(message => {
    if (!searchQuery) return true;
    return message.content?.toLowerCase().includes(searchQuery.toLowerCase());
  });

  if (!conversation) {
    return (
      <div className="chat-window-empty">
        <div className="empty-content">
          <div className="empty-icon">💬</div>
          <h2>Select a conversation</h2>
          <p>Choose a conversation from the sidebar to start messaging</p>
        </div>

        <style jsx>{`
          .chat-window-empty {
            flex: 1;
            display: flex;
            align-items: center;
            justify-content: center;
            background: #f9fafb;
            border-left: 1px solid #e5e7eb;
          }

          .empty-content {
            text-align: center;
            color: #6b7280;
            max-width: 300px;
          }

          .empty-icon {
            font-size: 4rem;
            margin-bottom: 1rem;
            opacity: 0.5;
          }

          .empty-content h2 {
            margin: 0 0 0.5rem 0;
            font-size: 1.5rem;
            font-weight: 600;
            color: #374151;
          }

          .empty-content p {
            margin: 0;
            font-size: 0.875rem;
            line-height: 1.5;
          }

          /* Dark theme support */
          @media (prefers-color-scheme: dark) {
            .chat-window-empty {
              background: #111827;
              border-left-color: #374151;
            }

            .empty-content h2 {
              color: #f3f4f6;
            }

            .empty-content {
              color: #9ca3af;
            }
          }
        `}</style>
      </div>
    );
  }

  return (
    <div className={`chat-window ${className}`}>
      {/* Header */}
      <div className="chat-header">
        <div className="participant-info">
          <div className="participant-avatar">
            <img 
              src={otherParticipant?.profile_image || '/default-avatar.png'}
              alt={`${otherParticipant?.first_name} ${otherParticipant?.last_name}`}
            />
            <OnlineStatus 
              isOnline={otherParticipant?.online_status}
              size="sm"
              className="participant-status"
            />
          </div>
          
          <div className="participant-details">
            <div className="participant-name">
              {otherParticipant?.first_name} {otherParticipant?.last_name}
              {conversation.is_muted && (
                <Tooltip content="Muted">
                  <VolumeX size={14} className="mute-indicator" />
                </Tooltip>
              )}
            </div>
            <div className="participant-status-text">
              {otherParticipant?.online_status ? (
                'Online'
              ) : otherParticipant?.last_seen ? (
                `Last seen ${new Date(otherParticipant.last_seen).toLocaleString()}`
              ) : (
                'Offline'
              )}
            </div>
          </div>
        </div>

        <div className="header-actions">
          {showSearch && (
            <div className="header-search">
              <input
                type="text"
                placeholder="Search messages..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="search-input"
                autoFocus
              />
            </div>
          )}

          <Tooltip content="Voice call">
            <button className="header-button">
              <Phone size={18} />
            </button>
          </Tooltip>

          <Tooltip content="Video call">
            <button className="header-button">
              <Video size={18} />
            </button>
          </Tooltip>

          <Tooltip content="Search messages">
            <button 
              className={`header-button ${showSearch ? 'active' : ''}`}
              onClick={() => {
                setShowSearch(!showSearch);
                if (showSearch) {
                  setSearchQuery('');
                }
              }}
            >
              <Search size={18} />
            </button>
          </Tooltip>

          <div className="header-menu">
            <Tooltip content="More options">
              <button className="header-button">
                <MoreHorizontal size={18} />
              </button>
            </Tooltip>

            <div className="dropdown-menu">
              <button onClick={() => setShowInfo(!showInfo)} className="menu-item">
                <Info size={16} />
                Conversation Info
              </button>
              
              <button onClick={handleMute} className="menu-item">
                <VolumeX size={16} />
                {conversation.is_muted ? 'Unmute' : 'Mute'} Conversation
              </button>
              
              <button onClick={handleArchive} className="menu-item">
                <Archive size={16} />
                Archive Conversation
              </button>
              
              <div className="menu-divider" />
              
              <button className="menu-item">
                <UserPlus size={16} />
                Add Participants
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Messages */}
      <div className="messages-container">
        <MessageList
          messages={filteredMessages}
          typingUsers={typingUsers}
          currentUserId={user?._id}
          loading={loading}
          hasMore={hasMoreMessages}
          onLoadMore={onLoadMoreMessages}
          onEditMessage={onEditMessage}
          onDeleteMessage={onDeleteMessage}
          onReplyToMessage={handleReply}
        />
      </div>

      {/* Message Input */}
      <div className="message-input-container">
        <MessageInput
          onSendMessage={handleSendMessage}
          onTypingStart={handleTypingStart}
          onTypingStop={handleTypingStop}
          replyTo={replyTo}
          onClearReply={clearReply}
          disabled={conversation.is_archived}
          placeholder={
            conversation.is_archived 
              ? "This conversation is archived"
              : `Message ${otherParticipant?.first_name}...`
          }
        />
      </div>

      {/* Conversation Info Panel */}
      {showInfo && (
        <div className="info-panel">
          <div className="info-header">
            <h3>Conversation Info</h3>
            <button 
              onClick={() => setShowInfo(false)}
              className="close-info"
            >
              ×
            </button>
          </div>
          
          <div className="info-content">
            <div className="participant-section">
              <div className="section-title">Participant</div>
              <div className="participant-card">
                <img 
                  src={otherParticipant?.profile_image || '/default-avatar.png'}
                  alt={`${otherParticipant?.first_name} ${otherParticipant?.last_name}`}
                />
                <div className="participant-info-details">
                  <div className="name">
                    {otherParticipant?.first_name} {otherParticipant?.last_name}
                  </div>
                  <div className="email">{otherParticipant?.email}</div>
                  <div className="status">
                    <OnlineStatus isOnline={otherParticipant?.online_status} size="xs" />
                    {otherParticipant?.online_status ? 'Online' : 'Offline'}
                  </div>
                </div>
              </div>
            </div>

            <div className="conversation-section">
              <div className="section-title">Conversation</div>
              <div className="conversation-stats">
                <div className="stat-item">
                  <span className="stat-label">Messages:</span>
                  <span className="stat-value">{messages.length}</span>
                </div>
                <div className="stat-item">
                  <span className="stat-label">Created:</span>
                  <span className="stat-value">
                    {new Date(conversation.created_at).toLocaleDateString()}
                  </span>
                </div>
                <div className="stat-item">
                  <span className="stat-label">Status:</span>
                  <span className="stat-value">
                    {conversation.is_archived ? 'Archived' : 
                     conversation.is_muted ? 'Muted' : 'Active'}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      <style jsx>{`
        .chat-window {
          flex: 1;
          display: flex;
          flex-direction: column;
          height: 100%;
          background: white;
          position: relative;
        }

        .chat-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 1rem 1.5rem;
          border-bottom: 1px solid #e5e7eb;
          background: white;
          z-index: 20;
        }

        .participant-info {
          display: flex;
          align-items: center;
          gap: 0.75rem;
        }

        .participant-avatar {
          position: relative;
          width: 40px;
          height: 40px;
        }

        .participant-avatar img {
          width: 100%;
          height: 100%;
          border-radius: 50%;
          object-fit: cover;
        }

        .participant-status {
          position: absolute;
          bottom: 0;
          right: 0;
        }

        .participant-details {
          flex: 1;
        }

        .participant-name {
          font-weight: 600;
          font-size: 0.875rem;
          color: #111827;
          display: flex;
          align-items: center;
          gap: 0.5rem;
        }

        .mute-indicator {
          color: #6b7280;
          opacity: 0.7;
        }

        .participant-status-text {
          font-size: 0.75rem;
          color: #6b7280;
        }

        .header-actions {
          display: flex;
          align-items: center;
          gap: 0.5rem;
        }

        .header-search {
          margin-right: 0.5rem;
        }

        .search-input {
          padding: 0.5rem 0.75rem;
          border: 1px solid #d1d5db;
          border-radius: 0.375rem;
          font-size: 0.875rem;
          width: 200px;
          transition: all 0.2s ease;
        }

        .search-input:focus {
          outline: none;
          border-color: #3b82f6;
          box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
        }

        .header-button {
          padding: 0.5rem;
          border: none;
          background: #f9fafb;
          border-radius: 0.5rem;
          cursor: pointer;
          color: #6b7280;
          transition: all 0.2s ease;
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .header-button:hover {
          background: #f3f4f6;
          color: #374151;
        }

        .header-button.active {
          background: #3b82f6;
          color: white;
        }

        .header-menu {
          position: relative;
        }

        .dropdown-menu {
          position: absolute;
          top: 100%;
          right: 0;
          background: white;
          border: 1px solid #e5e7eb;
          border-radius: 0.5rem;
          box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
          padding: 0.5rem 0;
          min-width: 200px;
          z-index: 30;
          opacity: 0;
          visibility: hidden;
          transition: all 0.2s ease;
        }

        .header-menu:hover .dropdown-menu {
          opacity: 1;
          visibility: visible;
        }

        .menu-item {
          width: 100%;
          padding: 0.75rem 1rem;
          border: none;
          background: none;
          text-align: left;
          cursor: pointer;
          font-size: 0.875rem;
          color: #374151;
          display: flex;
          align-items: center;
          gap: 0.75rem;
          transition: background-color 0.2s ease;
        }

        .menu-item:hover {
          background: #f9fafb;
        }

        .menu-divider {
          height: 1px;
          background: #e5e7eb;
          margin: 0.5rem 0;
        }

        .messages-container {
          flex: 1;
          min-height: 0;
          background: #f9fafb;
        }

        .message-input-container {
          background: white;
          border-top: 1px solid #e5e7eb;
        }

        .info-panel {
          position: absolute;
          top: 0;
          right: 0;
          width: 300px;
          height: 100%;
          background: white;
          border-left: 1px solid #e5e7eb;
          z-index: 25;
          display: flex;
          flex-direction: column;
        }

        .info-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 1rem;
          border-bottom: 1px solid #e5e7eb;
        }

        .info-header h3 {
          margin: 0;
          font-size: 1rem;
          font-weight: 600;
          color: #111827;
        }

        .close-info {
          border: none;
          background: none;
          cursor: pointer;
          font-size: 1.5rem;
          color: #6b7280;
          padding: 0;
          width: 24px;
          height: 24px;
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .info-content {
          flex: 1;
          padding: 1rem;
          overflow-y: auto;
        }

        .section-title {
          font-size: 0.75rem;
          font-weight: 600;
          color: #6b7280;
          text-transform: uppercase;
          letter-spacing: 0.05em;
          margin-bottom: 0.75rem;
        }

        .participant-section {
          margin-bottom: 2rem;
        }

        .participant-card {
          display: flex;
          align-items: center;
          gap: 0.75rem;
          padding: 1rem;
          background: #f9fafb;
          border-radius: 0.5rem;
        }

        .participant-card img {
          width: 48px;
          height: 48px;
          border-radius: 50%;
          object-fit: cover;
        }

        .participant-info-details .name {
          font-weight: 600;
          color: #111827;
          margin-bottom: 0.25rem;
        }

        .participant-info-details .email {
          font-size: 0.875rem;
          color: #6b7280;
          margin-bottom: 0.25rem;
        }

        .participant-info-details .status {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          font-size: 0.75rem;
          color: #6b7280;
        }

        .conversation-stats {
          display: flex;
          flex-direction: column;
          gap: 0.75rem;
        }

        .stat-item {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 0.75rem;
          background: #f9fafb;
          border-radius: 0.375rem;
        }

        .stat-label {
          font-size: 0.875rem;
          color: #6b7280;
        }

        .stat-value {
          font-size: 0.875rem;
          font-weight: 500;
          color: #111827;
        }

        /* Dark theme support */
        @media (prefers-color-scheme: dark) {
          .chat-window {
            background: #111827;
          }

          .chat-header {
            background: #1f2937;
            border-bottom-color: #374151;
          }

          .participant-name {
            color: #f9fafb;
          }

          .participant-status-text {
            color: #9ca3af;
          }

          .header-button {
            background: #374151;
            color: #9ca3af;
          }

          .header-button:hover {
            background: #4b5563;
            color: #f3f4f6;
          }

          .header-button.active {
            background: #3b82f6;
            color: white;
          }

          .search-input {
            background: #374151;
            border-color: #4b5563;
            color: #f9fafb;
          }

          .search-input::placeholder {
            color: #9ca3af;
          }

          .dropdown-menu {
            background: #1f2937;
            border-color: #374151;
          }

          .menu-item {
            color: #e5e7eb;
          }

          .menu-item:hover {
            background: #374151;
          }

          .menu-divider {
            background: #374151;
          }

          .message-input-container {
            background: #1f2937;
            border-top-color: #374151;
          }

          .messages-container {
            background: #111827;
          }

          .info-panel {
            background: #1f2937;
            border-left-color: #374151;
          }

          .info-header {
            border-bottom-color: #374151;
          }

          .info-header h3 {
            color: #f9fafb;
          }

          .close-info {
            color: #9ca3af;
          }

          .section-title {
            color: #9ca3af;
          }

          .participant-card {
            background: #374151;
          }

          .participant-info-details .name {
            color: #f9fafb;
          }

          .participant-info-details .email {
            color: #9ca3af;
          }

          .participant-info-details .status {
            color: #9ca3af;
          }

          .stat-item {
            background: #374151;
          }

          .stat-label {
            color: #9ca3af;
          }

          .stat-value {
            color: #f9fafb;
          }
        }

        /* Mobile responsiveness */
        @media (max-width: 768px) {
          .chat-header {
            padding: 0.75rem 1rem;
          }

          .header-search .search-input {
            width: 150px;
          }

          .info-panel {
            width: 100%;
            right: 0;
          }

          .participant-card {
            padding: 0.75rem;
          }

          .stat-item {
            padding: 0.625rem;
          }
        }

        @media (max-width: 640px) {
          .header-actions {
            gap: 0.25rem;
          }

          .header-button {
            padding: 0.375rem;
          }

          .header-search {
            display: none;
          }
        }
      `}</style>
    </div>
  );
};

export default ChatWindow;