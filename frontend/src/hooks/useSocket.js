import { useEffect, useState, useCallback, useRef } from 'react';
import { useAuth } from '../contexts/AuthContext';
import socketService from '../services/socketService';

// Main socket hook
export const useSocket = () => {
  const { user, token } = useAuth();
  const [isConnected, setIsConnected] = useState(false);
  const [connectionError, setConnectionError] = useState(null);
  const [isConnecting, setIsConnecting] = useState(false);

  useEffect(() => {
    if (user && token) {
      connectSocket();
    } else {
      disconnectSocket();
    }

    return () => {
      disconnectSocket();
    };
  }, [user, token]);

  const connectSocket = useCallback(async () => {
    if (isConnecting || isConnected) return;

    try {
      setIsConnecting(true);
      setConnectionError(null);
      
      await socketService.connect(token);
      setIsConnected(true);
    } catch (error) {
      console.error('Failed to connect socket:', error);
      setConnectionError(error.message);
      setIsConnected(false);
    } finally {
      setIsConnecting(false);
    }
  }, [token, isConnecting, isConnected]);

  const disconnectSocket = useCallback(() => {
    socketService.disconnect();
    setIsConnected(false);
    setConnectionError(null);
    setIsConnecting(false);
  }, []);

  // Setup connection status listeners
  useEffect(() => {
    const handleConnectionStatus = (data) => {
      setIsConnected(data.connected);
      if (!data.connected && data.reason) {
        setConnectionError(`Disconnected: ${data.reason}`);
      }
    };

    const handleConnectionError = (error) => {
      setConnectionError(error.message);
      setIsConnected(false);
    };

    const unsubscribeStatus = socketService.on('connection_status', handleConnectionStatus);
    const unsubscribeError = socketService.on('connection_error', handleConnectionError);

    return () => {
      unsubscribeStatus();
      unsubscribeError();
    };
  }, []);

  return {
    isConnected,
    isConnecting,
    connectionError,
    connect: connectSocket,
    disconnect: disconnectSocket,
    socket: socketService
  };
};

// Hook for managing conversation connection
export const useConversation = (conversationId) => {
  const { isConnected } = useSocket();
  const [isJoined, setIsJoined] = useState(false);
  const conversationIdRef = useRef(conversationId);

  useEffect(() => {
    conversationIdRef.current = conversationId;
  }, [conversationId]);

  useEffect(() => {
    if (isConnected && conversationId) {
      socketService.joinConversation(conversationId);
      setIsJoined(true);

      return () => {
        if (conversationIdRef.current) {
          socketService.leaveConversation(conversationIdRef.current);
        }
        setIsJoined(false);
      };
    } else {
      setIsJoined(false);
    }
  }, [isConnected, conversationId]);

  const sendMessage = useCallback((messageData) => {
    if (conversationId) {
      socketService.sendMessage(conversationId, messageData);
    }
  }, [conversationId]);

  const markAsRead = useCallback(() => {
    if (conversationId) {
      socketService.markMessagesAsRead(conversationId);
    }
  }, [conversationId]);

  return {
    isJoined,
    sendMessage,
    markAsRead
  };
};

// Hook for real-time messages
export const useMessages = (conversationId) => {
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!conversationId) {
      setMessages([]);
      return;
    }

    const handleNewMessage = (message) => {
      if (message.conversation_id === conversationId) {
        setMessages(prev => {
          // Avoid duplicates
          const exists = prev.some(m => m._id === message._id);
          if (exists) return prev;
          
          // Insert in chronological order
          const newMessages = [...prev, message];
          return newMessages.sort((a, b) => new Date(a.created_at) - new Date(b.created_at));
        });
      }
    };

    const handleMessageEdited = (message) => {
      if (message.conversation_id === conversationId) {
        setMessages(prev => 
          prev.map(m => m._id === message._id ? message : m)
        );
      }
    };

    const handleMessagesRead = (data) => {
      if (data.conversationId === conversationId) {
        setMessages(prev => 
          prev.map(m => ({
            ...m,
            is_read: m.receiver_id === data.readBy ? true : m.is_read
          }))
        );
      }
    };

    const unsubscribeNew = socketService.on('new_message', handleNewMessage);
    const unsubscribeEdited = socketService.on('message_edited', handleMessageEdited);
    const unsubscribeRead = socketService.on('messages_read', handleMessagesRead);

    return () => {
      unsubscribeNew();
      unsubscribeEdited();
      unsubscribeRead();
    };
  }, [conversationId]);

  const addMessage = useCallback((message) => {
    setMessages(prev => {
      const exists = prev.some(m => m._id === message._id);
      if (exists) return prev;
      
      const newMessages = [...prev, message];
      return newMessages.sort((a, b) => new Date(a.created_at) - new Date(b.created_at));
    });
  }, []);

  const updateMessage = useCallback((messageId, updates) => {
    setMessages(prev => 
      prev.map(m => m._id === messageId ? { ...m, ...updates } : m)
    );
  }, []);

  const removeMessage = useCallback((messageId) => {
    setMessages(prev => prev.filter(m => m._id !== messageId));
  }, []);

  return {
    messages,
    loading,
    setMessages,
    addMessage,
    updateMessage,
    removeMessage
  };
};

// Hook for typing indicators
export const useTyping = (conversationId) => {
  const [typingUsers, setTypingUsers] = useState([]);
  const { user } = useAuth();
  const typingTimeoutRef = useRef(null);

  useEffect(() => {
    if (!conversationId) {
      setTypingUsers([]);
      return;
    }

    const handleTypingChange = (data) => {
      if (data.conversationId === conversationId) {
        // Filter out current user from typing indicators
        const otherTypingUsers = data.typingUsers
          .filter(userId => userId !== user?.id)
          .map(userId => ({ userId, conversationId }));
        
        setTypingUsers(otherTypingUsers);
      }
    };

    const unsubscribe = socketService.on('typing_users_changed', handleTypingChange);

    return () => {
      unsubscribe();
      if (typingTimeoutRef.current) {
        clearTimeout(typingTimeoutRef.current);
      }
    };
  }, [conversationId, user?.id]);

  const startTyping = useCallback(() => {
    if (conversationId) {
      socketService.startTyping(conversationId);
      
      // Auto-stop typing after 3 seconds
      if (typingTimeoutRef.current) {
        clearTimeout(typingTimeoutRef.current);
      }
      
      typingTimeoutRef.current = setTimeout(() => {
        socketService.stopTyping(conversationId);
      }, 3000);
    }
  }, [conversationId]);

  const stopTyping = useCallback(() => {
    if (conversationId) {
      socketService.stopTyping(conversationId);
      
      if (typingTimeoutRef.current) {
        clearTimeout(typingTimeoutRef.current);
        typingTimeoutRef.current = null;
      }
    }
  }, [conversationId]);

  const handleTyping = useCallback(() => {
    startTyping();
  }, [startTyping]);

  return {
    typingUsers,
    startTyping,
    stopTyping,
    handleTyping
  };
};

// Hook for user presence
export const useUserPresence = () => {
  const [onlineUsers, setOnlineUsers] = useState(new Set());
  const [userStatuses, setUserStatuses] = useState(new Map());

  useEffect(() => {
    const handleUserStatusChange = (data) => {
      const { userId, isOnline, lastSeen } = data;
      
      setOnlineUsers(prev => {
        const newSet = new Set(prev);
        if (isOnline) {
          newSet.add(userId);
        } else {
          newSet.delete(userId);
        }
        return newSet;
      });
      
      setUserStatuses(prev => {
        const newMap = new Map(prev);
        newMap.set(userId, { isOnline, lastSeen });
        return newMap;
      });
    };

    const unsubscribe = socketService.on('user_status_changed', handleUserStatusChange);

    return () => {
      unsubscribe();
    };
  }, []);

  const isUserOnline = useCallback((userId) => {
    return onlineUsers.has(userId);
  }, [onlineUsers]);

  const getUserStatus = useCallback((userId) => {
    return userStatuses.get(userId) || { isOnline: false, lastSeen: null };
  }, [userStatuses]);

  return {
    onlineUsers: Array.from(onlineUsers),
    isUserOnline,
    getUserStatus
  };
};

// Hook for connection management with retry logic
export const useSocketConnection = () => {
  const { user, token } = useAuth();
  const [connectionState, setConnectionState] = useState({
    status: 'disconnected', // 'disconnected', 'connecting', 'connected', 'reconnecting', 'error'
    error: null,
    attempts: 0
  });

  useEffect(() => {
    if (!user || !token) {
      setConnectionState({
        status: 'disconnected',
        error: null,
        attempts: 0
      });
      socketService.disconnect();
      return;
    }

    let isMounted = true;

    const connect = async () => {
      if (!isMounted) return;
      
      setConnectionState(prev => ({
        ...prev,
        status: prev.attempts > 0 ? 'reconnecting' : 'connecting'
      }));

      try {
        await socketService.connect(token);
        
        if (isMounted) {
          setConnectionState({
            status: 'connected',
            error: null,
            attempts: 0
          });
        }
      } catch (error) {
        if (isMounted) {
          setConnectionState(prev => ({
            status: 'error',
            error: error.message,
            attempts: prev.attempts + 1
          }));
        }
      }
    };

    // Initial connection
    connect();

    // Setup event listeners
    const unsubscribeStatus = socketService.on('connection_status', (data) => {
      if (!isMounted) return;
      
      setConnectionState(prev => ({
        ...prev,
        status: data.connected ? 'connected' : 'disconnected',
        error: data.connected ? null : `Disconnected: ${data.reason}`
      }));
    });

    const unsubscribeError = socketService.on('connection_error', (error) => {
      if (!isMounted) return;
      
      setConnectionState(prev => ({
        status: 'error',
        error: error.message,
        attempts: prev.attempts + 1
      }));
    });

    const unsubscribeReconnectFailed = socketService.on('reconnection_failed', () => {
      if (!isMounted) return;
      
      setConnectionState(prev => ({
        ...prev,
        status: 'error',
        error: 'Failed to reconnect after multiple attempts'
      }));
    });

    return () => {
      isMounted = false;
      unsubscribeStatus();
      unsubscribeError();
      unsubscribeReconnectFailed();
      socketService.disconnect();
    };
  }, [user, token]);

  const retry = useCallback(async () => {
    if (token) {
      try {
        await socketService.connect(token);
      } catch (error) {
        console.error('Manual retry failed:', error);
      }
    }
  }, [token]);

  return {
    ...connectionState,
    retry,
    isConnected: connectionState.status === 'connected',
    isConnecting: ['connecting', 'reconnecting'].includes(connectionState.status)
  };
};

export default useSocket;