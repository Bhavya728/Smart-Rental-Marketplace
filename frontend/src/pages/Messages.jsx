import React, { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useSocket } from '../hooks/useSocket';
import ChatSidebar from '../components/chat/ChatSidebar';
import ChatWindow from '../components/chat/ChatWindow';
import { messageService } from '../services/messageService';

const Messages = () => {
  const { user } = useAuth();
  const location = useLocation();
  const { 
    socket, 
    isConnected, 
    conversations, 
    messages, 
    typingUsers,
    fetchConversations,
    fetchMessages,
    sendMessage,
    editMessage,
    deleteMessage
  } = useSocket();

  const [activeConversation, setActiveConversation] = useState(null);
  const [loading, setLoading] = useState(false);
  const [hasMoreMessages, setHasMoreMessages] = useState(false);
  const [isMobile, setIsMobile] = useState(window.innerWidth <= 768);

  // Handle responsive design
  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth <= 768);
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Handle opening specific conversation from navigation state
  useEffect(() => {
    if (location.state?.openConversation && location.state?.fromBooking) {
      const conversation = location.state.openConversation;
      setActiveConversation(conversation);
      
      // Clear navigation state after using it
      window.history.replaceState({}, document.title);
    }
  }, [location.state]);

  // Fetch initial conversations on component mount
  useEffect(() => {
    if (user && isConnected) {
      fetchConversations();
    }
  }, [user, isConnected, fetchConversations]);

  // Fetch messages when active conversation changes
  useEffect(() => {
    if (activeConversation?._id) {
      fetchMessages(activeConversation._id);
    }
  }, [activeConversation?._id, fetchMessages]);

  const handleConversationSelect = (conversation) => {
    setActiveConversation(conversation);
    
    // Mark conversation as read
    if (conversation.unread_count > 0) {
      messageService.markAsRead(conversation._id).catch(console.error);
    }
  };

  const handleNewChat = () => {
    // This would typically open a user selection modal
    // For now, we'll just show an alert
    alert('New chat functionality would be implemented here');
  };

  const handleSendMessage = async (messageData) => {
    if (!activeConversation?._id) return;

    try {
      await sendMessage({
        ...messageData,
        conversation_id: activeConversation._id,
        receiver_id: activeConversation.participants?.find(p => p._id !== user?._id)?._id
      });
    } catch (error) {
      console.error('Failed to send message:', error);
      throw error;
    }
  };

  const handleEditMessage = async (messageId, newContent) => {
    try {
      await editMessage(messageId, newContent);
    } catch (error) {
      console.error('Failed to edit message:', error);
    }
  };

  const handleDeleteMessage = async (messageId) => {
    if (!window.confirm('Are you sure you want to delete this message?')) {
      return;
    }

    try {
      await deleteMessage(messageId);
    } catch (error) {
      console.error('Failed to delete message:', error);
    }
  };

  const handleReplyToMessage = (message) => {
    // This would set the reply-to message in the input
    console.log('Reply to message:', message);
  };

  const handleLoadMoreMessages = async () => {
    if (!activeConversation?._id || loading || !hasMoreMessages) return;

    setLoading(true);
    try {
      const currentMessages = messages[activeConversation._id] || [];
      const offset = currentMessages.length;
      
      const response = await messageService.getMessages(activeConversation._id, {
        limit: 20,
        offset
      });

      if (response.data.messages.length < 20) {
        setHasMoreMessages(false);
      }
    } catch (error) {
      console.error('Failed to load more messages:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleArchiveConversation = async (conversationId) => {
    try {
      await messageService.archiveConversation(conversationId);
      
      // Update local state
      if (activeConversation?._id === conversationId) {
        setActiveConversation(null);
      }
      
      // Refresh conversations
      fetchConversations();
    } catch (error) {
      console.error('Failed to archive conversation:', error);
    }
  };

  const handleDeleteConversation = async (conversationId) => {
    if (!window.confirm('Are you sure you want to delete this conversation? This action cannot be undone.')) {
      return;
    }

    try {
      await messageService.deleteConversation(conversationId);
      
      // Update local state
      if (activeConversation?._id === conversationId) {
        setActiveConversation(null);
      }
      
      // Refresh conversations
      fetchConversations();
    } catch (error) {
      console.error('Failed to delete conversation:', error);
    }
  };

  const handleMuteConversation = async (conversationId, muted) => {
    try {
      await messageService.muteConversation(conversationId, muted);
      
      // Refresh conversations
      fetchConversations();
    } catch (error) {
      console.error('Failed to mute/unmute conversation:', error);
    }
  };

  // Get current conversation messages and typing users
  const currentMessages = activeConversation?._id ? 
    (messages[activeConversation._id] || []) : [];
  const currentTypingUsers = activeConversation?._id ? 
    (typingUsers[activeConversation._id] || []) : [];

  if (!user) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-50 via-blue-50 to-indigo-100 flex items-center justify-center">
        <div className="bg-white/60 backdrop-blur-lg rounded-2xl p-12 shadow-xl border border-white/20 text-center max-w-md">
          <div className="text-6xl mb-4">🔒</div>
          <h2 className="text-2xl font-black bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent mb-4">
            Authentication Required
          </h2>
          <p className="text-gray-600 font-medium">
            Please log in to access your messages.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-blue-50 to-indigo-100 relative overflow-hidden">
      {/* Background Decoration */}
      <div className="absolute inset-0 bg-gradient-to-br from-purple-400/10 via-blue-400/10 to-indigo-400/10" />
      <div className="absolute top-0 left-0 w-96 h-96 bg-gradient-to-br from-purple-300/20 to-pink-300/20 rounded-full -translate-x-48 -translate-y-48 blur-3xl" />
      <div className="absolute bottom-0 right-0 w-96 h-96 bg-gradient-to-tl from-blue-300/20 to-indigo-300/20 rounded-full translate-x-48 translate-y-48 blur-3xl" />
      
      <div className="h-screen flex relative z-10">
        {/* Sidebar - always visible on desktop, conditionally on mobile */}
        <div className={`w-80 bg-white/70 backdrop-blur-lg border-r border-white/20 shadow-xl ${isMobile && activeConversation ? 'hidden' : 'block'} lg:block`}>
          <ChatSidebar
            conversations={conversations}
            activeConversationId={activeConversation?._id}
            onConversationSelect={handleConversationSelect}
            onNewChat={handleNewChat}
            onArchiveConversation={handleArchiveConversation}
            onDeleteConversation={handleDeleteConversation}
            onMuteConversation={handleMuteConversation}
            loading={loading}
          />
        </div>

        {/* Chat Window - always visible on desktop, conditionally on mobile */}
        <div className={`flex-1 bg-white/60 backdrop-blur-lg ${isMobile && !activeConversation ? 'hidden' : 'block'} lg:block`}>
          <ChatWindow
            conversation={activeConversation}
            messages={currentMessages}
            typingUsers={currentTypingUsers}
            onSendMessage={handleSendMessage}
            onEditMessage={handleEditMessage}
            onDeleteMessage={handleDeleteMessage}
            onReplyToMessage={handleReplyToMessage}
            onLoadMoreMessages={handleLoadMoreMessages}
            onArchiveConversation={handleArchiveConversation}
            onMuteConversation={handleMuteConversation}
            hasMoreMessages={hasMoreMessages}
            loading={loading}
          />
        </div>

        {/* Mobile back button */}
        {isMobile && activeConversation && (
          <button 
            className="absolute top-4 left-4 z-20 bg-white/80 backdrop-blur-sm px-4 py-2 rounded-full shadow-lg border border-white/30 text-gray-700 hover:bg-white/90 transition-all duration-200 font-semibold"
            onClick={() => setActiveConversation(null)}
            aria-label="Back to conversations"
          >
            ← Back
          </button>
        )}
      </div>

      {/* Connection status indicator */}
      {!isConnected && (
        <div className="fixed bottom-4 right-4 z-30">
          <div className="bg-yellow-100/90 backdrop-blur-sm border border-yellow-200 rounded-full px-4 py-2 shadow-lg flex items-center gap-2">
            <div className="w-2 h-2 bg-yellow-500 rounded-full animate-pulse" />
            <span className="text-yellow-800 text-sm font-medium">Connecting to chat server...</span>
          </div>
        </div>
      )}
    </div>
  );
};

export default Messages;