// src/api/endpoints.js
// Centralized API configuration and endpoints

export const API_CONFIG = {
  // Base URLs
  BASE_URL: process.env.EXPO_PUBLIC_API_URL || 'http://localhost:3001',
  TIMEOUT: 15000,
  
  // Request headers
  HEADERS: {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
  },
  
  // Retry configuration
  RETRY_ATTEMPTS: 3,
  RETRY_DELAY: 1000,
};

export const ENDPOINTS = {
  // Health and system
  HEALTH: '/health',
  STATUS: '/api/status',
  
  // Authentication
  AUTH: {
    LOGIN: '/api/auth/login',
    REGISTER: '/api/auth/register', 
    LOGOUT: '/api/auth/logout',
    REFRESH: '/api/auth/refresh',
    VERIFY: '/api/auth/verify',
  },
  
  // SoulAI chat endpoints
  SOULAI: {
    CHAT: (userId) => `/api/soulai/chat/${userId}`,
    CHAT_STREAM: '/api/soulai/chat/stream',
    PERSONALITY: (userId) => `/api/soulai/personality/${userId}`,
    COMPATIBILITY: (userId1, userId2) => `/api/soulai/compatibility/${userId1}/${userId2}`,
    INSIGHTS: (userId) => `/api/soulai/insights/${userId}`,
  },
  
  // User management
  USER: {
    PROFILE: (userId) => `/api/users/${userId}`,
    UPDATE: (userId) => `/api/users/${userId}`,
    DELETE: (userId) => `/api/users/${userId}`,
    PHOTOS: (userId) => `/api/users/${userId}/photos`,
  },
  
  // Matching system
  MATCHES: {
    LIST: (userId) => `/api/matches/${userId}`,
    POTENTIAL: (userId) => `/api/matches/${userId}/potential`,
    LIKE: (userId, targetId) => `/api/matches/${userId}/like/${targetId}`,
    PASS: (userId, targetId) => `/api/matches/${userId}/pass/${targetId}`,
    DETAILS: (matchId) => `/api/matches/details/${matchId}`,
  },
  
  // Chat and messaging
  CHAT: {
    CONVERSATIONS: (userId) => `/api/chat/${userId}/conversations`,
    MESSAGES: (conversationId) => `/api/chat/conversations/${conversationId}/messages`,
    SEND: (conversationId) => `/api/chat/conversations/${conversationId}/send`,
    MARK_READ: (conversationId) => `/api/chat/conversations/${conversationId}/read`,
  },
  
  // File uploads
  UPLOAD: {
    PHOTO: '/api/upload/photo',
    PROFILE_IMAGE: '/api/upload/profile',
    CHAT_IMAGE: '/api/upload/chat',
  },
  
  // Legacy endpoints (for backward compatibility)
  LEGACY: {
    BASIC_CHAT: '/chat',
    TEST: '/api/test',
  }
};

// Build full URL helper
export const buildUrl = (endpoint, params = {}) => {
  let url = `${API_CONFIG.BASE_URL}${endpoint}`;
  
  // Add query parameters if provided
  if (Object.keys(params).length > 0) {
    const searchParams = new URLSearchParams(params);
    url += `?${searchParams.toString()}`;
  }
  
  return url;
};

// API request helpers
export const createApiRequest = (endpoint, options = {}) => {
  const url = buildUrl(endpoint, options.params);
  
  const config = {
    method: options.method || 'GET',
    headers: {
      ...API_CONFIG.HEADERS,
      ...options.headers,
    },
    timeout: options.timeout || API_CONFIG.TIMEOUT,
  };
  
  // Add body for POST/PUT requests
  if (options.body && ['POST', 'PUT', 'PATCH'].includes(config.method)) {
    config.body = JSON.stringify(options.body);
  }
  
  return { url, config };
};

// Environment-specific configurations
export const getEnvironmentConfig = () => {
  const isDevelopment = __DEV__;
  const isProduction = !isDevelopment;
  
  return {
    isDevelopment,
    isProduction,
    baseUrl: isDevelopment 
      ? 'http://localhost:3001' 
      : process.env.EXPO_PUBLIC_API_URL,
    enableLogging: isDevelopment,
    enableMockMode: isDevelopment && false, // Set to true for offline development
  };
};

export default {
  API_CONFIG,
  ENDPOINTS,
  buildUrl,
  createApiRequest,
  getEnvironmentConfig,
};