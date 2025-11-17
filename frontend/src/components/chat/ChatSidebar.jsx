import React, { useState, useEffect } from 'react';
import { Search, Plus, Archive, Settings, Filter, X } from 'lucide-react';
import ConversationItem from './ConversationItem';
import OnlineStatus from './OnlineStatus';
import ScrollArea from "../ui/ScrollArea";
import Tooltip from "../ui/Tooltip";
import { useAuth } from "../../contexts/AuthContext";

const ChatSidebar = ({
  conversations = [],
  activeConversationId,
  onConversationSelect,
  onNewChat,
  onArchiveConversation,
  onDeleteConversation,
  onMuteConversation,
  loading = false,
  className = ""
}) => {
  const { user } = useAuth();
  const [searchQuery, setSearchQuery] = useState('');
  const [showArchived, setShowArchived] = useState(false);
  const [filterBy, setFilterBy] = useState('all'); // all, unread, muted
  const [selectedConversations, setSelectedConversations] = useState([]);
  const [isSelectionMode, setIsSelectionMode] = useState(false);

  // Filter conversations based on search and filters
  const filteredConversations = conversations.filter(conversation => {
    // Search filter
    if (searchQuery) {
      const otherParticipant = conversation.participants?.find(
        p => p._id !== user?._id
      );
      const participantName = `${otherParticipant?.first_name} ${otherParticipant?.last_name}`.toLowerCase();
      const lastMessageContent = conversation.last_message?.content?.toLowerCase() || '';
      
      const matchesSearch = participantName.includes(searchQuery.toLowerCase()) ||
                           lastMessageContent.includes(searchQuery.toLowerCase());
      
      if (!matchesSearch) return false;
    }

    // Archive filter
    if (!showArchived && conversation.is_archived) {
      return false;
    }

    // Status filters
    switch (filterBy) {
      case 'unread':
        return conversation.unread_count > 0;
      case 'muted':
        return conversation.is_muted;
      default:
        return true;
    }
  });

  // Sort conversations by last message time
  const sortedConversations = [...filteredConversations].sort((a, b) => {
    return new Date(b.updated_at) - new Date(a.updated_at);
  });

  const handleConversationClick = (conversation) => {
    if (isSelectionMode) {
      toggleConversationSelection(conversation._id);
    } else {
      onConversationSelect?.(conversation);
    }
  };

  const toggleConversationSelection = (conversationId) => {
    setSelectedConversations(prev => 
      prev.includes(conversationId)
        ? prev.filter(id => id !== conversationId)
        : [...prev, conversationId]
    );
  };

  const handleBulkAction = (action) => {
    switch (action) {
      case 'archive':
        selectedConversations.forEach(id => onArchiveConversation?.(id));
        break;
      case 'delete':
        if (window.confirm('Are you sure you want to delete selected conversations?')) {
          selectedConversations.forEach(id => onDeleteConversation?.(id));
        }
        break;
      case 'mute':
        selectedConversations.forEach(id => onMuteConversation?.(id, true));
        break;
      default:
        break;
    }
    
    setSelectedConversations([]);
    setIsSelectionMode(false);
  };

  const clearSelection = () => {
    setSelectedConversations([]);
    setIsSelectionMode(false);
  };

  const getUnreadCount = () => {
    return conversations.reduce((total, conv) => total + (conv.unread_count || 0), 0);
  };

  const getFilterLabel = () => {
    switch (filterBy) {
      case 'unread':
        return 'Unread';
      case 'muted':
        return 'Muted';
      default:
        return showArchived ? 'Archived' : 'All';
    }
  };

  return (
    <div className={`chat-sidebar ${className}`}>
      {/* Header */}
      <div className="sidebar-header">
        <div className="header-top">
          <div className="user-info">
            <div className="user-avatar">
              <img 
                src={user?.profile_image || '/default-avatar.png'} 
                alt={`${user?.first_name} ${user?.last_name}`}
              />
              <OnlineStatus 
                isOnline={user?.online_status} 
                size="sm"
                className="user-status"
              />
            </div>
            <div className="user-details">
              <div className="user-name">
                {user?.first_name} {user?.last_name}
              </div>
              <div className="user-status-text">
                {user?.online_status ? 'Online' : 'Offline'}
              </div>
            </div>
          </div>

          <div className="header-actions">
            <Tooltip content="New chat">
              <button onClick={onNewChat} className="header-button">
                <Plus size={18} />
              </button>
            </Tooltip>
            
            <Tooltip content="Settings">
              <button className="header-button">
                <Settings size={18} />
              </button>
            </Tooltip>
          </div>
        </div>

        {/* Search */}
        <div className="search-container">
          <div className="search-input-wrapper">
            <Search size={16} className="search-icon" />
            <input
              type="text"
              placeholder="Search conversations..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="search-input"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="clear-search"
              >
                <X size={14} />
              </button>
            )}
          </div>
        </div>

        {/* Filters */}
        <div className="filters-container">
          <div className="filter-tabs">
            <button
              onClick={() => {
                setFilterBy('all');
                setShowArchived(false);
              }}
              className={`filter-tab ${filterBy === 'all' && !showArchived ? 'active' : ''}`}
            >
              All
              {getUnreadCount() > 0 && (
                <span className="tab-badge">{getUnreadCount()}</span>
              )}
            </button>
            
            <button
              onClick={() => setFilterBy('unread')}
              className={`filter-tab ${filterBy === 'unread' ? 'active' : ''}`}
            >
              Unread
            </button>
            
            <button
              onClick={() => setShowArchived(true)}
              className={`filter-tab ${showArchived ? 'active' : ''}`}
            >
              <Archive size={14} />
              Archived
            </button>
          </div>
        </div>
      </div>

      {/* Selection mode header */}
      {isSelectionMode && (
        <div className="selection-header">
          <div className="selection-info">
            <span>{selectedConversations.length} selected</span>
          </div>
          <div className="selection-actions">
            <Tooltip content="Archive selected">
              <button
                onClick={() => handleBulkAction('archive')}
                className="selection-button"
              >
                <Archive size={16} />
              </button>
            </Tooltip>
            
            <Tooltip content="Delete selected">
              <button
                onClick={() => handleBulkAction('delete')}
                className="selection-button delete"
              >
                <X size={16} />
              </button>
            </Tooltip>
            
            <button onClick={clearSelection} className="selection-button">
              Cancel
            </button>
          </div>
        </div>
      )}

      {/* Conversations list */}
      <div className="conversations-container">
        <ScrollArea className="conversations-scroll">
          {loading ? (
            <div className="loading-state">
              <div className="loading-spinner" />
              <span>Loading conversations...</span>
            </div>
          ) : sortedConversations.length === 0 ? (
            <div className="empty-state">
              <div className="empty-icon">💬</div>
              <h3>
                {searchQuery ? 'No results found' : 
                 showArchived ? 'No archived conversations' :
                 filterBy === 'unread' ? 'No unread messages' :
                 filterBy === 'muted' ? 'No muted conversations' :
                 'No conversations yet'}
              </h3>
              <p>
                {searchQuery ? 'Try a different search term' :
                 showArchived ? 'Your archived conversations will appear here' :
                 'Start a new conversation to get started'}
              </p>
            </div>
          ) : (
            <div className="conversations-list">
              {sortedConversations.map((conversation) => (
                <ConversationItem
                  key={conversation._id}
                  conversation={conversation}
                  isActive={conversation._id === activeConversationId}
                  isSelected={selectedConversations.includes(conversation._id)}
                  onClick={() => handleConversationClick(conversation)}
                  onArchive={onArchiveConversation}
                  onDelete={onDeleteConversation}
                  onMute={onMuteConversation}
                />
              ))}
            </div>
          )}
        </ScrollArea>
      </div>

      <style jsx>{`
        .chat-sidebar {
          width: 320px;
          height: 100%;
          background: white;
          border-right: 1px solid #e5e7eb;
          display: flex;
          flex-direction: column;
        }

        .sidebar-header {
          padding: 1rem;
          border-bottom: 1px solid #e5e7eb;
          background: white;
          z-index: 10;
        }

        .header-top {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 1rem;
        }

        .user-info {
          display: flex;
          align-items: center;
          gap: 0.75rem;
        }

        .user-avatar {
          position: relative;
          width: 40px;
          height: 40px;
        }

        .user-avatar img {
          width: 100%;
          height: 100%;
          border-radius: 50%;
          object-fit: cover;
        }

        .user-status {
          position: absolute;
          bottom: 0;
          right: 0;
        }

        .user-details {
          flex: 1;
        }

        .user-name {
          font-weight: 600;
          font-size: 0.875rem;
          color: #111827;
        }

        .user-status-text {
          font-size: 0.75rem;
          color: #6b7280;
        }

        .header-actions {
          display: flex;
          gap: 0.5rem;
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

        .search-container {
          margin-bottom: 1rem;
        }

        .search-input-wrapper {
          position: relative;
          display: flex;
          align-items: center;
        }

        .search-icon {
          position: absolute;
          left: 0.75rem;
          color: #9ca3af;
          z-index: 1;
        }

        .search-input {
          width: 100%;
          padding: 0.75rem 0.75rem 0.75rem 2.5rem;
          border: 1px solid #d1d5db;
          border-radius: 0.5rem;
          font-size: 0.875rem;
          background: #f9fafb;
          transition: all 0.2s ease;
        }

        .search-input:focus {
          outline: none;
          border-color: #3b82f6;
          background: white;
          box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
        }

        .clear-search {
          position: absolute;
          right: 0.75rem;
          border: none;
          background: none;
          cursor: pointer;
          color: #9ca3af;
          padding: 0.25rem;
          border-radius: 0.25rem;
          transition: color 0.2s ease;
        }

        .clear-search:hover {
          color: #6b7280;
        }

        .filters-container {
          margin-bottom: 0.5rem;
        }

        .filter-tabs {
          display: flex;
          gap: 0.25rem;
          background: #f9fafb;
          padding: 0.25rem;
          border-radius: 0.5rem;
        }

        .filter-tab {
          flex: 1;
          padding: 0.5rem 0.75rem;
          border: none;
          background: none;
          border-radius: 0.375rem;
          cursor: pointer;
          font-size: 0.8125rem;
          font-weight: 500;
          color: #6b7280;
          transition: all 0.2s ease;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 0.375rem;
        }

        .filter-tab:hover {
          color: #374151;
          background: rgba(255, 255, 255, 0.5);
        }

        .filter-tab.active {
          background: white;
          color: #3b82f6;
          box-shadow: 0 1px 2px rgba(0, 0, 0, 0.05);
        }

        .tab-badge {
          background: #3b82f6;
          color: white;
          border-radius: 10px;
          padding: 0.125rem 0.375rem;
          font-size: 0.6875rem;
          font-weight: 600;
          min-width: 16px;
          height: 16px;
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .selection-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 0.75rem 1rem;
          background: #eff6ff;
          border-bottom: 1px solid #dbeafe;
        }

        .selection-info {
          font-size: 0.875rem;
          font-weight: 500;
          color: #1e40af;
        }

        .selection-actions {
          display: flex;
          gap: 0.5rem;
        }

        .selection-button {
          padding: 0.375rem 0.75rem;
          border: none;
          background: white;
          border-radius: 0.375rem;
          cursor: pointer;
          font-size: 0.8125rem;
          font-weight: 500;
          color: #374151;
          transition: all 0.2s ease;
          display: flex;
          align-items: center;
          gap: 0.375rem;
        }

        .selection-button:hover {
          background: #f3f4f6;
        }

        .selection-button.delete:hover {
          background: #fee2e2;
          color: #dc2626;
        }

        .conversations-container {
          flex: 1;
          min-height: 0;
        }

        .conversations-scroll {
          height: 100%;
        }

        .conversations-list {
          padding: 0.5rem 0;
        }

        .loading-state {
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          padding: 2rem;
          color: #6b7280;
        }

        .loading-spinner {
          width: 24px;
          height: 24px;
          border: 2px solid #e5e7eb;
          border-top: 2px solid #3b82f6;
          border-radius: 50%;
          animation: spin 1s linear infinite;
          margin-bottom: 0.75rem;
        }

        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }

        .empty-state {
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          padding: 3rem 2rem;
          text-align: center;
          color: #6b7280;
        }

        .empty-icon {
          font-size: 3rem;
          margin-bottom: 1rem;
          opacity: 0.5;
        }

        .empty-state h3 {
          margin: 0 0 0.5rem 0;
          font-size: 1.125rem;
          font-weight: 600;
          color: #374151;
        }

        .empty-state p {
          margin: 0;
          font-size: 0.875rem;
          line-height: 1.5;
        }

        /* Dark theme support */
        @media (prefers-color-scheme: dark) {
          .chat-sidebar {
            background: #1f2937;
            border-right-color: #374151;
          }

          .sidebar-header {
            background: #1f2937;
            border-bottom-color: #374151;
          }

          .user-name {
            color: #f9fafb;
          }

          .user-status-text {
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

          .search-input {
            background: #374151;
            border-color: #4b5563;
            color: #f9fafb;
          }

          .search-input:focus {
            background: #374151;
            border-color: #60a5fa;
          }

          .search-input::placeholder {
            color: #9ca3af;
          }

          .filter-tabs {
            background: #374151;
          }

          .filter-tab {
            color: #9ca3af;
          }

          .filter-tab:hover {
            color: #f3f4f6;
            background: rgba(75, 85, 99, 0.5);
          }

          .filter-tab.active {
            background: #1f2937;
            color: #60a5fa;
          }

          .selection-header {
            background: #1e3a8a;
            border-bottom-color: #1e40af;
          }

          .selection-info {
            color: #93c5fd;
          }

          .selection-button {
            background: #1f2937;
            color: #e5e7eb;
          }

          .selection-button:hover {
            background: #374151;
          }

          .empty-state h3 {
            color: #f3f4f6;
          }

          .loading-state {
            color: #9ca3af;
          }

          .loading-spinner {
            border-color: #374151;
            border-top-color: #60a5fa;
          }
        }

        /* Mobile responsiveness */
        @media (max-width: 768px) {
          .chat-sidebar {
            width: 100%;
            max-width: 100%;
          }

          .sidebar-header {
            padding: 0.75rem;
          }

          .user-name {
            font-size: 0.8125rem;
          }

          .filter-tab {
            font-size: 0.75rem;
            padding: 0.375rem 0.5rem;
          }

          .conversations-list {
            padding: 0.25rem 0;
          }
        }
      `}</style>
    </div>
  );
};

export default ChatSidebar;