// services/WebSocketClient.js - Fixed Frontend WebSocket Client
// Save in: frontend/src/services/WebSocketClient.js

import { io } from 'socket.io-client';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Platform } from 'react-native';

class WebSocketClient {
  constructor() {
    this.socket = null;
    this.isConnected = false;
    this.reconnectAttempts = 0;
    this.maxReconnectAttempts = 5;
    this.listeners = new Map();
    this.messageQueue = [];
    
    console.log('🔗 WebSocket Client initialized');
  }

  async connect(userId, token) {
    try {
      const serverURL = __DEV__ 
        ? Platform.OS === 'ios' ? 'http://localhost:3000' : 'http://10.0.2.2:3000'
        : 'https://your-production-url.com';

      this.socket = io(serverURL, {
        auth: { token },
        query: { userId },
        transports: ['websocket', 'polling'],
        timeout: 20000,
        forceNew: true,
        autoConnect: true
      });

      this.setupEventHandlers();
      
      return new Promise((resolve, reject) => {
        const timeout = setTimeout(() => {
          reject(new Error('Connection timeout'));
        }, 10000);

        this.socket.on('connect', () => {
          clearTimeout(timeout);
          this.isConnected = true;
          this.reconnectAttempts = 0;
          console.log('✅ WebSocket connected successfully');
          
          // Process queued messages
          this.processMessageQueue();
          
          resolve();
        });

        this.socket.on('connect_error', (error) => {
          clearTimeout(timeout);
          console.error('❌ WebSocket connection error:', error);
          reject(error);
        });
      });
    } catch (error) {
      console.error('❌ Failed to connect to WebSocket:', error);
      throw error;
    }
  }

  setupEventHandlers() {
    if (!this.socket) return;

    // Connection events
    this.socket.on('connect', () => {
      this.isConnected = true;
      this.reconnectAttempts = 0;
      console.log('🔌 Connected to WebSocket server');
      this.emit('connection:established');
    });

    this.socket.on('disconnect', (reason) => {
      this.isConnected = false;
      console.log('📴 Disconnected from WebSocket server:', reason);
      this.emit('connection:lost', { reason });
      
      if (reason === 'io server disconnect') {
        // Server initiated disconnect, don't auto-reconnect
        return;
      }
      
      this.handleReconnection();
    });

    this.socket.on('connect_error', (error) => {
      console.error('❌ Connection error:', error);
      this.emit('connection:error', { error });
      this.handleReconnection();
    });

    // Match events
    this.socket.on('match:new_match', (data) => {
      console.log('💕 New match received:', data);
      this.emit('match:new_match', data);
      this.showLocalNotification('New Match!', 'You have a new match! 💕');
    });

    this.socket.on('match:received_like', (data) => {
      console.log('👍 Received like:', data);
      this.emit('match:received_like', data);
      if (data.isSuperLike) {
        this.showLocalNotification('Super Like!', 'Someone super liked you! ⭐');
      }
    });

    this.socket.on('match:unmatched', (data) => {
      console.log('💔 Match ended:', data);
      this.emit('match:unmatched', data);
    });

    // Chat events
    this.socket.on('chat:new_message', (data) => {
      console.log('💬 New message:', data);
      this.emit('chat:new_message', data);
    });

    this.socket.on('chat:new_message_notification', (data) => {
      console.log('🔔 Message notification:', data);
      this.emit('chat:new_message_notification', data);
      this.showLocalNotification(`${data.fromUser}`, data.message);
    });

    this.socket.on('chat:user_typing', (data) => {
      this.emit('chat:user_typing', data);
    });

    this.socket.on('chat:user_stopped_typing', (data) => {
      this.emit('chat:user_stopped_typing', data);
    });

    this.socket.on('chat:messages_read', (data) => {
      this.emit('chat:messages_read', data);
    });

    this.socket.on('chat:message_deleted', (data) => {
      this.emit('chat:message_deleted', data);
    });

    this.socket.on('chat:conversation_ended', (data) => {
      this.emit('chat:conversation_ended', data);
    });

    // SoulAI events
    this.socket.on('soulai:message_response', (data) => {
      console.log('🧠 SoulAI response:', data);
      this.emit('soulai:message_response', data);
    });

    this.socket.on('soulai:ready_for_matches', (data) => {
      console.log('🎯 Ready for matches:', data);
      this.emit('soulai:ready_for_matches', data);
      this.showLocalNotification('Profile Complete!', data.message);
    });

    this.socket.on('soulai:match_suggestions', (data) => {
      this.emit('soulai:match_suggestions', data);
    });

    this.socket.on('soulai:coaching_response', (data) => {
      this.emit('soulai:coaching_response', data);
    });

    // User events
    this.socket.on('user:status_changed', (data) => {
      this.emit('user:status_changed', data);
    });

    // System events
    this.socket.on('system:message', (data) => {
      console.log('📢 System message:', data);
      this.emit('system:message', data);
    });

    this.socket.on('admin:kicked', (data) => {
      console.log('⚠️ Kicked by admin:', data);
      this.emit('admin:kicked', data);
      this.disconnect();
    });

    // Error handling
    this.socket.on('error', (error) => {
      console.error('❌ Socket error:', error);
      this.emit('error', error);
    });
  }

  // Connection management
  async handleReconnection() {
    if (this.reconnectAttempts >= this.maxReconnectAttempts) {
      console.log('❌ Max reconnection attempts reached');
      this.emit('connection:failed');
      return;
    }

    this.reconnectAttempts++;
    const delay = Math.min(1000 * Math.pow(2, this.reconnectAttempts), 30000);
    
    console.log(`🔄 Attempting reconnection ${this.reconnectAttempts}/${this.maxReconnectAttempts} in ${delay}ms`);
    
    setTimeout(() => {
      if (!this.isConnected && this.socket) {
        this.socket.connect();
      }
    }, delay);
  }

  // Event system
  on(event, callback) {
    if (!this.listeners.has(event)) {
      this.listeners.set(event, []);
    }
    this.listeners.get(event).push(callback);
  }

  off(event, callback) {
    if (this.listeners.has(event)) {
      const callbacks = this.listeners.get(event);
      const index = callbacks.indexOf(callback);
      if (index !== -1) {
        callbacks.splice(index, 1);
      }
    }
  }

  emit(event, data) {
    if (this.listeners.has(event)) {
      this.listeners.get(event).forEach(callback => {
        try {
          callback(data);
        } catch (error) {
          console.error('❌ Error in event callback:', error);
        }
      });
    }
  }

  // Message queuing for offline scenarios
  queueMessage(event, data) {
    this.messageQueue.push({ event, data, timestamp: Date.now() });
  }

  processMessageQueue() {
    while (this.messageQueue.length > 0) {
      const { event, data } = this.messageQueue.shift();
      this.sendMessage(event, data);
    }
  }

  sendMessage(event, data) {
    if (this.isConnected && this.socket) {
      this.socket.emit(event, data);
    } else {
      console.log('📦 Queuing message for later:', event);
      this.queueMessage(event, data);
    }
  }

  // Match actions
  likeUser(userId, isSuperLike = false) {
    this.sendMessage('match:like_user', { likedUserId: userId, isSuperLike });
  }

  passUser(userId) {
    this.sendMessage('match:pass_user', { passedUserId: userId });
  }

  unmatchUser(matchId) {
    this.sendMessage('match:unmatch', { matchId });
  }

  // Chat actions
  joinConversation(matchId) {
    this.sendMessage('match:join_conversation', { matchId });
  }

  leaveConversation(matchId) {
    this.sendMessage('match:leave_conversation', { matchId });
  }

  sendChatMessage(matchId, content, messageType = 'text', attachments = []) {
    this.sendMessage('chat:send_message', {
      matchId,
      content,
      messageType,
      attachments
    });
  }

  startTyping(matchId) {
    this.sendMessage('chat:typing_start', { matchId });
  }

  stopTyping(matchId) {
    this.sendMessage('chat:typing_stop', { matchId });
  }

  markMessagesAsRead(matchId, messageIds) {
    this.sendMessage('chat:mark_read', { matchId, messageIds });
  }

  deleteMessage(messageId, matchId) {
    this.sendMessage('chat:delete_message', { messageId, matchId });
  }

  // SoulAI actions
  sendSoulAIMessage(message) {
    this.sendMessage('soulai:send_message', { message });
  }

  requestMatches() {
    this.sendMessage('soulai:request_matches');
  }

  requestCoaching(matchId, messageContent) {
    this.sendMessage('soulai:request_coaching', { matchId, messageContent });
  }

  // User actions
  updateStatus(isOnline) {
    this.sendMessage('user:update_status', { isOnline });
  }

  updateLocation(longitude, latitude, city, state) {
    this.sendMessage('user:update_location', {
      longitude,
      latitude,
      city,
      state
    });
  }

  // Notifications
  async showLocalNotification(title, body) {
    try {
      console.log('🔔 Local notification:', title, body);
      
      // For React Native, you would integrate with Expo Notifications
      // await Notifications.scheduleNotificationAsync({
      //   content: { title, body },
      //   trigger: null,
      // });
    } catch (error) {
      console.error('❌ Error showing notification:', error);
    }
  }

  // Connection status
  getConnectionStatus() {
    return {
      connected: this.isConnected,
      reconnectAttempts: this.reconnectAttempts,
      queuedMessages: this.messageQueue.length
    };
  }

  // Disconnect
  disconnect() {
    if (this.socket) {
      this.socket.disconnect();
      this.socket = null;
    }
    this.isConnected = false;
    this.listeners.clear();
    this.messageQueue = [];
    console.log('📴 WebSocket client disconnected');
  }

  // Cleanup
  cleanup() {
    this.disconnect();
    this.listeners.clear();
    this.messageQueue = [];
  }
}

// Singleton instance
const webSocketClient = new WebSocketClient();

export default webSocketClient;

// ==========================================

// hooks/useWebSocket.js - Fixed React Hook for WebSocket
// Save in: frontend/src/hooks/useWebSocket.js

import { useEffect, useContext, useCallback } from 'react';
import webSocketClient from '../services/WebSocketClient';

export const useWebSocket = () => {
  const connectWebSocket = useCallback(async (userId, token) => {
    try {
      await webSocketClient.connect(userId, token);
    } catch (error) {
      console.error('❌ Failed to connect WebSocket:', error);
    }
  }, []);

  const sendMessage = useCallback((event, data) => {
    webSocketClient.sendMessage(event, data);
  }, []);

  const addEventListener = useCallback((event, callback) => {
    webSocketClient.on(event, callback);
    return () => webSocketClient.off(event, callback);
  }, []);

  useEffect(() => {
    return () => {
      webSocketClient.cleanup();
    };
  }, []);

  return {
    connect: connectWebSocket,
    sendMessage,
    addEventListener,
    connectionStatus: webSocketClient.getConnectionStatus(),
    // Match actions
    likeUser: webSocketClient.likeUser.bind(webSocketClient),
    passUser: webSocketClient.passUser.bind(webSocketClient),
    unmatchUser: webSocketClient.unmatchUser.bind(webSocketClient),
    // Chat actions
    joinConversation: webSocketClient.joinConversation.bind(webSocketClient),
    leaveConversation: webSocketClient.leaveConversation.bind(webSocketClient),
    sendChatMessage: webSocketClient.sendChatMessage.bind(webSocketClient),
    startTyping: webSocketClient.startTyping.bind(webSocketClient),
    stopTyping: webSocketClient.stopTyping.bind(webSocketClient),
    markMessagesAsRead: webSocketClient.markMessagesAsRead.bind(webSocketClient),
    deleteMessage: webSocketClient.deleteMessage.bind(webSocketClient),
    // SoulAI actions
    sendSoulAIMessage: webSocketClient.sendSoulAIMessage.bind(webSocketClient),
    requestMatches: webSocketClient.requestMatches.bind(webSocketClient),
    requestCoaching: webSocketClient.requestCoaching.bind(webSocketClient),
    // User actions
    updateStatus: webSocketClient.updateStatus.bind(webSocketClient),
    updateLocation: webSocketClient.updateLocation.bind(webSocketClient)
  };
};