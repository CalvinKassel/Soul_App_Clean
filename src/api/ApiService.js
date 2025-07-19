import { Platform } from 'react-native';

// Configuration object for easy updates
const CONFIG = {
  // For development with ngrok (replace with your ngrok URL)
  // In src/services/ApiService.js, update this line:
NGROK_URL: 'https://abc123.ngrok.io', // Your ngrok URL from step 3
  
  // For production deployment
  PRODUCTION_URL: 'https://your-production-api.com',
  
  // Current local IP (update this when your IP changes)
  CURRENT_LOCAL_IP: '10.0.0.13', // Your current IP
  
  // Port your backend runs on
  PORT: '3000'
};

// Dynamic IP detection for local development
const getLocalBackendURL = () => {
  if (Platform.OS === 'android') {
    // Android emulator uses this special IP
    return 'http://10.0.2.2:' + CONFIG.PORT;
  }
  
  if (Platform.OS === 'ios') {
    // iOS simulator can use localhost
    return 'http://localhost:' + CONFIG.PORT;
  }
  
  // For physical devices, use your current IP
  return `http://${CONFIG.CURRENT_LOCAL_IP}:${CONFIG.PORT}`;
};

// Smart URL selection
const API_BASE_URL = (() => {
  if (__DEV__) {
    // Development mode
    if (CONFIG.NGROK_URL && CONFIG.NGROK_URL.startsWith('https://')) {
      console.log('🌐 Using ngrok tunnel for development');
      return CONFIG.NGROK_URL;
    }
    
    const localURL = getLocalBackendURL();
    console.log('🏠 Using local development server');
    return localURL;
  }
  
  // Production mode
  console.log('☁️ Using production server');
  return CONFIG.PRODUCTION_URL;
})();

class ApiService {
  constructor() {
    this.baseURL = API_BASE_URL;
    console.log(`🌐 API Base URL: ${this.baseURL}`);
    console.log(`📱 Platform: ${Platform.OS}`);
    console.log(`🚀 Environment: ${__DEV__ ? 'Development' : 'Production'}`);
  }

  async request(endpoint, options = {}) {
    const url = `${this.baseURL}${endpoint}`;
    
    const config = {
      headers: {
        'Content-Type': 'application/json',
        ...options.headers,
      },
      ...options,
    };

    try {
      console.log(`🌐 API Request: ${config.method || 'GET'} ${url}`);
      
      const response = await fetch(url, config);
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const data = await response.json();
      console.log(`✅ API Response received`);
      
      return data;
    } catch (error) {
      console.error(`❌ API Error for ${endpoint}:`, error.message);
      
      // Enhanced error handling with suggestions
      if (error.message.includes('Network request failed')) {
        console.log('💡 Network Error Suggestions:');
        console.log('1. Check if backend is running: npm run dev');
        console.log('2. Verify IP address in CONFIG.CURRENT_LOCAL_IP');
        console.log('3. Try using ngrok for tunneling');
        console.log(`4. Current base URL: ${this.baseURL}`);
      }
      
      throw error;
    }
  }

  // Test connection method
  async testConnection() {
    try {
      console.log('🔍 Testing backend connection...');
      const response = await this.checkHealth();
      console.log('✅ Backend connection successful!', response);
      return true;
    } catch (error) {
      console.error('❌ Backend connection failed:', error.message);
      return false;
    }
  }

  // Health check
  async checkHealth() {
    return this.request('/health');
  }

  // Compatibility Analysis
  async analyzeCompatibility(user1Profile, user2Profile) {
    return this.request('/api/compatibility/analyze', {
      method: 'POST',
      body: JSON.stringify({
        user1Profile,
        user2Profile
      }),
    });
  }

  // Chat response suggestions
  async suggestChatResponse(userProfile, matchProfile, conversationHistory = [], lastMessage = '') {
    return this.request('/api/chat/suggest-response', {
      method: 'POST',
      body: JSON.stringify({
        userProfile,
        matchProfile,
        conversationHistory,
        lastMessage
      }),
    });
  }

  // New V2 endpoint for enhanced conversations
  async soulConversationV2(userInput, conversationHistory, userProfile, matchingStatus) {
    return this.request('/api/chat/soul-conversation-v2', {
      method: 'POST',
      body: JSON.stringify({
        userInput,
        conversationHistory,
        userProfile,
        matchingStatus
      }),
    });
  }

  // V3 endpoint for the latest multi-agent system
  async soulConversationV3(userInput, conversationHistory, userProfile, currentStage) {
    return this.request('/api/chat/soul-conversation-v3', {
      method: 'POST',
      body: JSON.stringify({
        userInput,
        conversationHistory,
        userProfile,
        currentStage
      }),
    });
  }

  // Profile learning endpoints
  async analyzeConversation(conversationHistory, currentProfile) {
    return this.request('/api/learning/analyze-conversation', {
      method: 'POST',
      body: JSON.stringify({
        conversationHistory,
        currentProfile
      }),
    });
  }

  async suggestQuestions(currentProfile, conversationHistory) {
    return this.request('/api/learning/suggest-questions', {
      method: 'POST',
      body: JSON.stringify({
        currentProfile,
        conversationHistory
      }),
    });
  }
}

export default new ApiService();