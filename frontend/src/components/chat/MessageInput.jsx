import React, { useState, useRef, useEffect } from 'react';
import { Send, Paperclip, Smile, X, Image, FileText } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import Tooltip from '../ui/Tooltip';
import OnlineStatus from './OnlineStatus';

const MessageInput = ({
  onSendMessage,
  onTypingStart,
  onTypingStop,
  replyTo,
  onClearReply,
  placeholder = "Type a message...",
  disabled = false,
  className = ""
}) => {
  const { user } = useAuth();
  const [message, setMessage] = useState('');
  const [files, setFiles] = useState([]);
  const [isUploading, setIsUploading] = useState(false);
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [isDragOver, setIsDragOver] = useState(false);
  
  const textareaRef = useRef(null);
  const fileInputRef = useRef(null);
  const typingTimeoutRef = useRef(null);

  // Common emoji for quick access
  const quickEmojis = ['😀', '😂', '❤️', '👍', '👎', '😊', '😢', '😡', '🎉', '🔥'];

  // Auto-resize textarea
  useEffect(() => {
    const textarea = textareaRef.current;
    if (textarea) {
      textarea.style.height = 'auto';
      const scrollHeight = textarea.scrollHeight;
      textarea.style.height = `${Math.min(scrollHeight, 120)}px`;
    }
  }, [message]);

  // Handle typing indicators
  useEffect(() => {
    if (message.trim()) {
      onTypingStart?.();
      
      // Clear existing timeout
      if (typingTimeoutRef.current) {
        clearTimeout(typingTimeoutRef.current);
      }
      
      // Set new timeout
      typingTimeoutRef.current = setTimeout(() => {
        onTypingStop?.();
      }, 1000);
    } else {
      onTypingStop?.();
    }

    return () => {
      if (typingTimeoutRef.current) {
        clearTimeout(typingTimeoutRef.current);
      }
    };
  }, [message, onTypingStart, onTypingStop]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if ((!message.trim() && files.length === 0) || isUploading || disabled) {
      return;
    }

    const messageData = {
      content: message.trim(),
      files: files,
      reply_to: replyTo?._id
    };

    try {
      await onSendMessage(messageData);
      setMessage('');
      setFiles([]);
      onClearReply?.();
      
      // Stop typing indicator
      onTypingStop?.();
      
      // Reset textarea height
      if (textareaRef.current) {
        textareaRef.current.style.height = 'auto';
      }
    } catch (error) {
      console.error('Failed to send message:', error);
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit(e);
    }
  };

  const handleFileSelect = (e) => {
    const selectedFiles = Array.from(e.target.files || []);
    addFiles(selectedFiles);
  };

  const addFiles = (selectedFiles) => {
    const validFiles = selectedFiles.filter(file => {
      // Check file size (max 10MB)
      if (file.size > 10 * 1024 * 1024) {
        alert(`File ${file.name} is too large. Maximum size is 10MB.`);
        return false;
      }
      return true;
    });

    setFiles(prev => [...prev, ...validFiles].slice(0, 5)); // Max 5 files
  };

  const removeFile = (index) => {
    setFiles(prev => prev.filter((_, i) => i !== index));
  };

  const handleDragEnter = (e) => {
    e.preventDefault();
    setIsDragOver(true);
  };

  const handleDragLeave = (e) => {
    e.preventDefault();
    if (e.currentTarget === e.target) {
      setIsDragOver(false);
    }
  };

  const handleDragOver = (e) => {
    e.preventDefault();
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setIsDragOver(false);
    
    const droppedFiles = Array.from(e.dataTransfer.files);
    addFiles(droppedFiles);
  };

  const insertEmoji = (emoji) => {
    const textarea = textareaRef.current;
    if (textarea) {
      const start = textarea.selectionStart;
      const end = textarea.selectionEnd;
      const newMessage = message.slice(0, start) + emoji + message.slice(end);
      setMessage(newMessage);
      
      // Reset cursor position
      setTimeout(() => {
        textarea.selectionStart = textarea.selectionEnd = start + emoji.length;
        textarea.focus();
      }, 0);
    }
    setShowEmojiPicker(false);
  };

  const getFileIcon = (file) => {
    if (file.type.startsWith('image/')) {
      return <Image size={16} />;
    }
    return <FileText size={16} />;
  };

  const formatFileSize = (bytes) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  return (
    <div className={`message-input-container ${className}`}>
      {/* Reply preview */}
      {replyTo && (
        <div className="reply-preview">
          <div className="reply-content">
            <div className="reply-header">
              <span>Replying to {replyTo.sender_id?.first_name}</span>
              <button onClick={onClearReply} className="clear-reply">
                <X size={14} />
              </button>
            </div>
            <div className="reply-text">
              {replyTo.content?.substring(0, 100)}
              {replyTo.content?.length > 100 ? '...' : ''}
            </div>
          </div>
        </div>
      )}

      {/* File previews */}
      {files.length > 0 && (
        <div className="file-previews">
          {files.map((file, index) => (
            <div key={index} className="file-preview">
              <div className="file-icon">
                {getFileIcon(file)}
              </div>
              <div className="file-info">
                <div className="file-name">{file.name}</div>
                <div className="file-size">{formatFileSize(file.size)}</div>
              </div>
              <button 
                onClick={() => removeFile(index)}
                className="remove-file"
              >
                <X size={14} />
              </button>
            </div>
          ))}
        </div>
      )}

      {/* Drag overlay */}
      {isDragOver && (
        <div className="drag-overlay">
          <div className="drag-content">
            <Paperclip size={32} />
            <p>Drop files here to attach</p>
          </div>
        </div>
      )}

      {/* Main input area */}
      <form onSubmit={handleSubmit} className="input-form">
        <div 
          className={`input-wrapper ${isDragOver ? 'drag-over' : ''}`}
          onDragEnter={handleDragEnter}
          onDragLeave={handleDragLeave}
          onDragOver={handleDragOver}
          onDrop={handleDrop}
        >
          {/* Attachment button */}
          <div className="input-actions">
            <Tooltip content="Attach file">
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="action-button"
                disabled={disabled}
              >
                <Paperclip size={18} />
              </button>
            </Tooltip>
          </div>

          {/* Text input */}
          <textarea
            ref={textareaRef}
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder={disabled ? "Chat is disabled" : placeholder}
            disabled={disabled || isUploading}
            className="message-textarea"
            rows={1}
          />

          {/* Emoji button */}
          <div className="input-actions">
            <Tooltip content="Add emoji">
              <button
                type="button"
                onClick={() => setShowEmojiPicker(!showEmojiPicker)}
                className={`action-button ${showEmojiPicker ? 'active' : ''}`}
                disabled={disabled}
              >
                <Smile size={18} />
              </button>
            </Tooltip>
          </div>

          {/* Send button */}
          <Tooltip content="Send message">
            <button
              type="submit"
              className={`send-button ${message.trim() || files.length > 0 ? 'active' : ''}`}
              disabled={(!message.trim() && files.length === 0) || disabled || isUploading}
            >
              <Send size={18} />
            </button>
          </Tooltip>
        </div>

        {/* Hidden file input */}
        <input
          ref={fileInputRef}
          type="file"
          multiple
          accept="image/*,video/*,.pdf,.doc,.docx,.txt"
          onChange={handleFileSelect}
          className="hidden-file-input"
        />
      </form>

      {/* Emoji picker */}
      {showEmojiPicker && (
        <div className="emoji-picker">
          <div className="emoji-grid">
            {quickEmojis.map(emoji => (
              <button
                key={emoji}
                onClick={() => insertEmoji(emoji)}
                className="emoji-button"
              >
                {emoji}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* User status indicator */}
      <div className="user-status">
        <OnlineStatus 
          isOnline={user?.online_status} 
          size="xs"
        />
        <span className="status-text">
          {user?.online_status ? 'Online' : 'Offline'}
        </span>
      </div>

      <style jsx>{`
        .message-input-container {
          position: relative;
          background: white;
          border-top: 1px solid #e5e7eb;
        }

        .reply-preview {
          padding: 0.75rem 1rem;
          background: #f9fafb;
          border-left: 3px solid #3b82f6;
          margin: 0 1rem;
          border-radius: 0.375rem 0.375rem 0 0;
        }

        .reply-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          font-size: 0.75rem;
          color: #3b82f6;
          font-weight: 600;
          margin-bottom: 0.25rem;
        }

        .clear-reply {
          border: none;
          background: none;
          cursor: pointer;
          color: #6b7280;
          padding: 0.125rem;
          border-radius: 0.125rem;
          transition: background-color 0.2s ease;
        }

        .clear-reply:hover {
          background: #e5e7eb;
        }

        .reply-text {
          font-size: 0.875rem;
          color: #6b7280;
          line-height: 1.4;
        }

        .file-previews {
          padding: 0.75rem 1rem 0;
          display: flex;
          flex-wrap: wrap;
          gap: 0.5rem;
        }

        .file-preview {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          background: #f3f4f6;
          padding: 0.5rem;
          border-radius: 0.375rem;
          max-width: 200px;
        }

        .file-icon {
          color: #6b7280;
          flex-shrink: 0;
        }

        .file-info {
          flex: 1;
          min-width: 0;
        }

        .file-name {
          font-size: 0.75rem;
          font-weight: 500;
          color: #374151;
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
        }

        .file-size {
          font-size: 0.6875rem;
          color: #6b7280;
        }

        .remove-file {
          border: none;
          background: none;
          cursor: pointer;
          color: #6b7280;
          padding: 0.125rem;
          border-radius: 0.125rem;
          transition: background-color 0.2s ease;
          flex-shrink: 0;
        }

        .remove-file:hover {
          background: #e5e7eb;
          color: #dc2626;
        }

        .drag-overlay {
          position: absolute;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background: rgba(59, 130, 246, 0.1);
          border: 2px dashed #3b82f6;
          border-radius: 0.5rem;
          display: flex;
          align-items: center;
          justify-content: center;
          z-index: 10;
        }

        .drag-content {
          text-align: center;
          color: #3b82f6;
        }

        .drag-content p {
          margin: 0.5rem 0 0;
          font-weight: 500;
        }

        .input-form {
          padding: 1rem;
        }

        .input-wrapper {
          display: flex;
          align-items: flex-end;
          gap: 0.5rem;
          background: #f9fafb;
          border: 1px solid #e5e7eb;
          border-radius: 1.5rem;
          padding: 0.5rem 0.75rem;
          transition: all 0.2s ease;
          position: relative;
        }

        .input-wrapper:focus-within {
          border-color: #3b82f6;
          box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
        }

        .input-wrapper.drag-over {
          border-color: #3b82f6;
          background: rgba(59, 130, 246, 0.05);
        }

        .input-actions {
          display: flex;
          align-items: center;
        }

        .action-button {
          border: none;
          background: none;
          cursor: pointer;
          color: #6b7280;
          padding: 0.375rem;
          border-radius: 0.5rem;
          transition: all 0.2s ease;
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .action-button:hover:not(:disabled) {
          background: #e5e7eb;
          color: #374151;
        }

        .action-button.active {
          background: #3b82f6;
          color: white;
        }

        .action-button:disabled {
          opacity: 0.5;
          cursor: not-allowed;
        }

        .message-textarea {
          flex: 1;
          border: none;
          outline: none;
          background: transparent;
          resize: none;
          font-family: inherit;
          font-size: 0.875rem;
          line-height: 1.5;
          color: #111827;
          padding: 0.375rem 0.5rem;
          min-height: 20px;
          max-height: 120px;
          overflow-y: auto;
        }

        .message-textarea::placeholder {
          color: #9ca3af;
        }

        .message-textarea:disabled {
          color: #9ca3af;
        }

        .send-button {
          border: none;
          background: #e5e7eb;
          color: #9ca3af;
          cursor: pointer;
          padding: 0.5rem;
          border-radius: 50%;
          transition: all 0.2s ease;
          display: flex;
          align-items: center;
          justify-content: center;
          width: 36px;
          height: 36px;
        }

        .send-button.active {
          background: #3b82f6;
          color: white;
        }

        .send-button:disabled {
          cursor: not-allowed;
        }

        .hidden-file-input {
          display: none;
        }

        .emoji-picker {
          position: absolute;
          bottom: 100%;
          right: 1rem;
          background: white;
          border: 1px solid #e5e7eb;
          border-radius: 0.5rem;
          box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
          padding: 0.75rem;
          margin-bottom: 0.5rem;
          z-index: 20;
        }

        .emoji-grid {
          display: grid;
          grid-template-columns: repeat(5, 1fr);
          gap: 0.25rem;
        }

        .emoji-button {
          border: none;
          background: none;
          cursor: pointer;
          padding: 0.5rem;
          border-radius: 0.25rem;
          font-size: 1.25rem;
          transition: background-color 0.2s ease;
        }

        .emoji-button:hover {
          background: #f3f4f6;
        }

        .user-status {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          padding: 0 1rem 0.75rem;
          font-size: 0.75rem;
          color: #6b7280;
        }

        .status-text {
          font-weight: 500;
        }

        /* Dark theme support */
        @media (prefers-color-scheme: dark) {
          .message-input-container {
            background: #1f2937;
            border-top-color: #374151;
          }

          .reply-preview {
            background: #374151;
          }

          .reply-text {
            color: #9ca3af;
          }

          .file-preview {
            background: #374151;
          }

          .file-name {
            color: #f3f4f6;
          }

          .input-wrapper {
            background: #374151;
            border-color: #4b5563;
          }

          .input-wrapper:focus-within {
            border-color: #3b82f6;
            box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.2);
          }

          .message-textarea {
            color: #f9fafb;
          }

          .message-textarea::placeholder {
            color: #6b7280;
          }

          .action-button:hover:not(:disabled) {
            background: #4b5563;
            color: #f3f4f6;
          }

          .emoji-picker {
            background: #1f2937;
            border-color: #374151;
          }

          .emoji-button:hover {
            background: #374151;
          }

          .user-status {
            color: #9ca3af;
          }
        }

        /* Mobile responsiveness */
        @media (max-width: 640px) {
          .input-form {
            padding: 0.75rem;
          }

          .file-previews {
            padding: 0.5rem 0.75rem 0;
          }

          .emoji-picker {
            right: 0.75rem;
          }

          .message-textarea {
            font-size: 16px; /* Prevent zoom on iOS */
          }

          .user-status {
            padding: 0 0.75rem 0.5rem;
          }
        }
      `}</style>
    </div>
  );
};

export default MessageInput;