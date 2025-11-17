import React, { useEffect, useRef, useState } from 'react';
import { ArrowDown } from 'lucide-react';
import MessageBubble from './MessageBubble';
import TypingIndicator from './TypingIndicator';
import ScrollArea from '../ui/ScrollArea';
import { format, isSameDay, isToday, isYesterday } from 'date-fns';

const MessageList = ({
  messages = [],
  typingUsers = [],
  currentUserId,
  loading = false,
  hasMore = false,
  onLoadMore,
  onEditMessage,
  onDeleteMessage,
  onReplyToMessage,
  className = ""
}) => {
  const [showScrollButton, setShowScrollButton] = useState(false);
  const [isAutoScrollEnabled, setIsAutoScrollEnabled] = useState(true);
  const messagesEndRef = useRef(null);
  const scrollAreaRef = useRef(null);
  const lastScrollTop = useRef(0);

  // Group messages by date for date separators
  const groupMessagesByDate = (messages) => {
    const grouped = [];
    let currentDate = null;
    let currentGroup = [];

    messages.forEach((message, index) => {
      const messageDate = new Date(message.created_at);
      const messageDateString = format(messageDate, 'yyyy-MM-dd');

      if (messageDateString !== currentDate) {
        if (currentGroup.length > 0) {
          grouped.push({
            type: 'messages',
            date: currentDate,
            messages: currentGroup
          });
        }

        grouped.push({
          type: 'date-separator',
          date: messageDateString,
          dateObj: messageDate
        });

        currentDate = messageDateString;
        currentGroup = [message];
      } else {
        currentGroup.push(message);
      }

      // Add the last group
      if (index === messages.length - 1 && currentGroup.length > 0) {
        grouped.push({
          type: 'messages',
          date: currentDate,
          messages: currentGroup
        });
      }
    });

    return grouped;
  };

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    if (isAutoScrollEnabled && messages.length > 0) {
      scrollToBottom();
    }
  }, [messages, isAutoScrollEnabled]);

  // Handle scroll events
  const handleScroll = (scrollTop, scrollHeight, clientHeight) => {
    const isAtBottom = scrollHeight - scrollTop - clientHeight < 100;
    
    // Show/hide scroll button
    setShowScrollButton(!isAtBottom);
    
    // Enable/disable auto-scroll based on user position
    if (scrollTop < lastScrollTop.current) {
      // User scrolled up
      setIsAutoScrollEnabled(false);
    } else if (isAtBottom) {
      // User is at bottom
      setIsAutoScrollEnabled(true);
    }
    
    lastScrollTop.current = scrollTop;

    // Load more messages when near top
    if (scrollTop < 200 && hasMore && !loading && onLoadMore) {
      onLoadMore();
    }
  };

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const handleScrollButtonClick = () => {
    setIsAutoScrollEnabled(true);
    scrollToBottom();
  };

  const formatDateSeparator = (date) => {
    if (isToday(date)) {
      return 'Today';
    } else if (isYesterday(date)) {
      return 'Yesterday';
    } else {
      return format(date, 'MMMM d, yyyy');
    }
  };

  const shouldShowAvatar = (message, index, messagesInGroup) => {
    if (index === messagesInGroup.length - 1) return true;
    
    const nextMessage = messagesInGroup[index + 1];
    return nextMessage?.sender_id?._id !== message.sender_id?._id;
  };

  const shouldShowTimestamp = (message, index, messagesInGroup) => {
    if (index === 0) return true;
    
    const prevMessage = messagesInGroup[index - 1];
    const timeDiff = new Date(message.created_at) - new Date(prevMessage.created_at);
    
    // Show timestamp if more than 5 minutes apart or different sender
    return timeDiff > 5 * 60 * 1000 || 
           prevMessage.sender_id?._id !== message.sender_id?._id;
  };

  const groupedMessages = groupMessagesByDate(messages);

  return (
    <div className={`message-list-container ${className}`}>
      <ScrollArea
        ref={scrollAreaRef}
        onScroll={handleScroll}
        className="messages-scroll-area"
      >
        <div className="messages-content">
          {/* Loading indicator at top */}
          {loading && (
            <div className="loading-indicator">
              <div className="loading-spinner" />
              <span>Loading messages...</span>
            </div>
          )}

          {/* Empty state */}
          {!loading && messages.length === 0 && (
            <div className="empty-state">
              <div className="empty-icon">💬</div>
              <h3>No messages yet</h3>
              <p>Start the conversation by sending a message</p>
            </div>
          )}

          {/* Messages */}
          {groupedMessages.map((group, groupIndex) => {
            if (group.type === 'date-separator') {
              return (
                <div key={`date-${group.date}`} className="date-separator">
                  <div className="date-line" />
                  <span className="date-text">
                    {formatDateSeparator(group.dateObj)}
                  </span>
                  <div className="date-line" />
                </div>
              );
            }

            return (
              <div key={`messages-${group.date}`} className="message-group">
                {group.messages.map((message, messageIndex) => {
                  const isOwn = message.sender_id?._id === currentUserId;
                  const showAvatar = shouldShowAvatar(message, messageIndex, group.messages);
                  const showTimestamp = shouldShowTimestamp(message, messageIndex, group.messages);

                  return (
                    <MessageBubble
                      key={message._id}
                      message={message}
                      isOwn={isOwn}
                      showAvatar={showAvatar}
                      showTimestamp={showTimestamp}
                      onEdit={onEditMessage}
                      onDelete={onDeleteMessage}
                      onReply={onReplyToMessage}
                      className={`message-item ${
                        messageIndex === 0 ? 'first-in-group' : ''
                      } ${
                        messageIndex === group.messages.length - 1 ? 'last-in-group' : ''
                      }`}
                    />
                  );
                })}
              </div>
            );
          })}

          {/* Typing indicator */}
          {typingUsers.length > 0 && (
            <div className="typing-container">
              <TypingIndicator users={typingUsers} />
            </div>
          )}

          {/* Scroll anchor */}
          <div ref={messagesEndRef} />
        </div>
      </ScrollArea>

      {/* Scroll to bottom button */}
      {showScrollButton && (
        <button 
          onClick={handleScrollButtonClick}
          className="scroll-button"
          aria-label="Scroll to bottom"
        >
          <ArrowDown size={20} />
        </button>
      )}

      <style jsx>{`
        .message-list-container {
          position: relative;
          height: 100%;
          display: flex;
          flex-direction: column;
        }

        .messages-scroll-area {
          flex: 1;
          min-height: 0;
        }

        .messages-content {
          padding: 1rem;
          display: flex;
          flex-direction: column;
          min-height: 100%;
        }

        .loading-indicator {
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 0.75rem;
          padding: 1.5rem;
          color: #6b7280;
          font-size: 0.875rem;
        }

        .loading-spinner {
          width: 20px;
          height: 20px;
          border: 2px solid #e5e7eb;
          border-top: 2px solid #3b82f6;
          border-radius: 50%;
          animation: spin 1s linear infinite;
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
          flex: 1;
          text-align: center;
          color: #6b7280;
          padding: 2rem;
        }

        .empty-icon {
          font-size: 3rem;
          margin-bottom: 1rem;
          opacity: 0.5;
        }

        .empty-state h3 {
          margin: 0 0 0.5rem 0;
          font-size: 1.25rem;
          font-weight: 600;
          color: #374151;
        }

        .empty-state p {
          margin: 0;
          font-size: 0.875rem;
        }

        .date-separator {
          display: flex;
          align-items: center;
          margin: 1.5rem 0 1rem 0;
          gap: 1rem;
        }

        .date-line {
          flex: 1;
          height: 1px;
          background: #e5e7eb;
        }

        .date-text {
          font-size: 0.75rem;
          font-weight: 600;
          color: #6b7280;
          background: white;
          padding: 0 0.75rem;
          text-transform: uppercase;
          letter-spacing: 0.05em;
        }

        .message-group {
          margin-bottom: 0.5rem;
        }

        .message-item {
          transition: all 0.2s ease;
        }

        .message-item.first-in-group {
          margin-top: 1rem;
        }

        .message-item.last-in-group {
          margin-bottom: 1rem;
        }

        .typing-container {
          margin: 0.5rem 0;
          padding-left: 3rem;
        }

        .scroll-button {
          position: absolute;
          bottom: 1rem;
          right: 1rem;
          width: 40px;
          height: 40px;
          border-radius: 50%;
          border: none;
          background: #3b82f6;
          color: white;
          cursor: pointer;
          display: flex;
          align-items: center;
          justify-content: center;
          box-shadow: 0 4px 12px rgba(59, 130, 246, 0.4);
          transition: all 0.2s ease;
          z-index: 10;
        }

        .scroll-button:hover {
          background: #2563eb;
          transform: translateY(-2px);
          box-shadow: 0 6px 16px rgba(59, 130, 246, 0.5);
        }

        .scroll-button:active {
          transform: translateY(0);
        }

        /* Dark theme support */
        @media (prefers-color-scheme: dark) {
          .empty-state h3 {
            color: #f3f4f6;
          }

          .date-line {
            background: #374151;
          }

          .date-text {
            background: #1f2937;
            color: #9ca3af;
          }

          .loading-indicator {
            color: #9ca3af;
          }

          .loading-spinner {
            border-color: #374151;
            border-top-color: #3b82f6;
          }
        }

        /* Mobile responsiveness */
        @media (max-width: 640px) {
          .messages-content {
            padding: 0.75rem;
          }

          .date-separator {
            margin: 1rem 0 0.75rem 0;
          }

          .typing-container {
            padding-left: 2.5rem;
          }

          .scroll-button {
            width: 36px;
            height: 36px;
            bottom: 0.75rem;
            right: 0.75rem;
          }

          .empty-state {
            padding: 1.5rem;
          }

          .empty-icon {
            font-size: 2.5rem;
          }
        }

        /* Accessibility improvements */
        @media (prefers-reduced-motion: reduce) {
          .message-item,
          .scroll-button {
            transition: none;
          }

          .loading-spinner {
            animation: none;
          }
        }
      `}</style>
    </div>
  );
};

export default MessageList;