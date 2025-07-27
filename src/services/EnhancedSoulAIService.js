// Enhanced SoulAI Service - Frontend Integration with NLP-Powered Backend
// Connects to the MIRIX memory system and NLP-enhanced processing
// Provides intelligent conversation with memory persistence and personality insights

import ApiService from '../api/ApiService';

class EnhancedSoulAIService {
  constructor() {
    this.isInitialized = false;
    this.userId = 'default_user'; // In production, get from auth
    this.conversationHistory = [];
    this.memoryInsights = {
      coreMemory: {},
      recentEpisodes: [],
      semanticConcepts: [],
      personalityProfile: null
    };
    
    console.log('🧠 Enhanced SoulAI Service initialized with MIRIX integration');
  }

  // Initialize the enhanced service
  async initialize(userId = null) {
    try {
      if (userId) {
        this.userId = userId;
      }
      
      console.log(`🚀 Initializing Enhanced SoulAI for user: ${this.userId}`);
      
      // Check backend health first
      const healthCheck = await this.checkBackendHealth();
      if (!healthCheck.healthy) {
        console.warn('⚠️ Backend health check failed, continuing with limited functionality');
      }
      
      // Initialize SoulAI for this user
      const initResponse = await ApiService.makeRequest('/api/soulai/initialize', {
        method: 'POST',
        body: { userId: this.userId }
      });
      
      if (initResponse.success) {
        console.log('✅ Enhanced SoulAI initialized successfully');
        this.isInitialized = true;
        
        // Load initial memory insights
        await this.loadMemoryInsights();
        
        return {
          success: true,
          welcomeMessage: initResponse.welcomeMessage || "Hi! I'm your enhanced SoulAI with intelligent memory. I'll remember our conversations and learn about you over time."
        };
      } else {
        throw new Error(initResponse.error || 'Failed to initialize Enhanced SoulAI');
      }
    } catch (error) {
      console.error('❌ Enhanced SoulAI initialization failed:', error);
      return {
        success: false,
        error: error.message,
        fallbackMessage: "I'm your SoulAI assistant. While my enhanced features aren't available right now, I'm still here to chat with you!"
      };
    }
  }

  // Send message with NLP-enhanced processing
  async sendMessage(message, options = {}) {
    const {
      onStart = () => {},
      onToken = () => {},
      onComplete = () => {},
      onError = () => {},
      onMemoryUpdate = () => {} // New callback for memory updates
    } = options;

    try {
      console.log(`💬 Sending enhanced message: "${message.substring(0, 50)}..."`);
      onStart();

      // Send to enhanced backend with MIRIX integration
      const response = await ApiService.makeRequest('/api/soulai/chat', {
        method: 'POST',
        body: {
          userId: this.userId,
          message: message,
          context: {
            conversationLength: this.conversationHistory.length,
            timestamp: new Date().toISOString()
          }
        }
      });

      if (response.success) {
        const aiResponse = response.response;
        
        // Simulate streaming for consistent UX
        await this.simulateStreaming(aiResponse, onToken);
        
        // Update local conversation history
        this.conversationHistory.push(
          { sender: 'user', message, timestamp: new Date().toISOString() },
          { 
            sender: 'assistant', 
            message: aiResponse, 
            timestamp: new Date().toISOString(),
            metadata: response.metadata
          }
        );

        // Load updated memory insights after conversation
        if (response.metadata?.handPuppetArchitecture) {
          const memoryUpdates = await this.loadMemoryInsights();
          onMemoryUpdate(memoryUpdates);
        }

        console.log('✅ Enhanced message processing completed');
        console.log('📊 Response metadata:', response.metadata);

        onComplete(aiResponse, 'enhanced_soulai', response.metadata);
        return aiResponse;

      } else {
        throw new Error(response.error || 'Failed to process message');
      }

    } catch (error) {
      console.error('❌ Enhanced message processing failed:', error);
      onError(error);
      
      // Fallback to simple response
      const fallbackResponse = "I'm having trouble processing that right now, but I'm still listening. Could you tell me more about what's on your mind?";
      onComplete(fallbackResponse, 'enhanced_soulai_fallback');
      return fallbackResponse;
    }
  }

  // Load comprehensive memory insights
  async loadMemoryInsights() {
    try {
      console.log('🧠 Loading memory insights from MIRIX system');

      const [coreMemory, episodes, semanticConcepts, personalityInsights] = await Promise.all([
        this.getCoreMemory(),
        this.getRecentEpisodes(),
        this.getSemanticConcepts(),
        this.getPersonalityInsights()
      ]);

      this.memoryInsights = {
        coreMemory: coreMemory || {},
        recentEpisodes: episodes || [],
        semanticConcepts: semanticConcepts || [],
        personalityProfile: personalityInsights || null,
        lastUpdated: new Date().toISOString()
      };

      console.log('📊 Memory insights loaded:', {
        coreMemoryKeys: Object.keys(this.memoryInsights.coreMemory).length,
        episodeCount: this.memoryInsights.recentEpisodes.length,
        conceptCount: this.memoryInsights.semanticConcepts.length,
        hasPersonalityProfile: !!this.memoryInsights.personalityProfile
      });

      return this.memoryInsights;
    } catch (error) {
      console.error('❌ Failed to load memory insights:', error);
      return this.memoryInsights; // Return cached version
    }
  }

  // Get core memory (persona, preferences, relationship context)
  async getCoreMemory() {
    try {
      const response = await ApiService.makeRequest(`/api/mirix/core/${this.userId}`);
      return response.success ? response.coreMemory : null;
    } catch (error) {
      console.error('Failed to load core memory:', error);
      return null;
    }
  }

  // Get recent episodic memories (conversation summaries)
  async getRecentEpisodes(limit = 10) {
    try {
      const response = await ApiService.makeRequest(`/api/mirix/episodes/${this.userId}?limit=${limit}`);
      return response.success ? response.episodes : [];
    } catch (error) {
      console.error('Failed to load episodes:', error);
      return [];
    }
  }

  // Get semantic concepts (named entities, learned facts)
  async getSemanticConcepts(limit = 20) {
    try {
      const response = await ApiService.makeRequest(`/api/mirix/semantic/${this.userId}?limit=${limit}`);
      return response.success ? response.concepts : [];
    } catch (error) {
      console.error('Failed to load semantic concepts:', error);
      return [];
    }
  }

  // Get personality insights
  async getPersonalityInsights() {
    try {
      const response = await ApiService.makeRequest(`/api/soulai/personality/${this.userId}`);
      return response.success ? response.insights : null;
    } catch (error) {
      console.error('Failed to load personality insights:', error);
      return null;
    }
  }

  // Check backend health
  async checkBackendHealth() {
    try {
      const response = await ApiService.makeRequest('/api/health');
      return {
        healthy: response.status === 'HEALTHY',
        status: response.status,
        details: response.components
      };
    } catch (error) {
      return { healthy: false, error: error.message };
    }
  }

  // Search memories across all types
  async searchMemories(query, options = {}) {
    try {
      const response = await ApiService.makeRequest(`/api/mirix/search/${this.userId}`, {
        method: 'POST',
        body: { query, options }
      });
      return response.success ? response.results : null;
    } catch (error) {
      console.error('Memory search failed:', error);
      return null;
    }
  }

  // Get memory analytics
  async getMemoryAnalytics(days = 30) {
    try {
      const response = await ApiService.makeRequest(`/api/mirix/analytics/${this.userId}?days=${days}`);
      return response.success ? response.analytics : null;
    } catch (error) {
      console.error('Failed to load memory analytics:', error);
      return null;
    }
  }

  // Export all memories
  async exportMemories() {
    try {
      const response = await ApiService.makeRequest(`/api/mirix/export/${this.userId}`);
      return response.success ? response.export : null;
    } catch (error) {
      console.error('Failed to export memories:', error);
      return null;
    }
  }

  // Simulate streaming for consistent UX
  async simulateStreaming(fullResponse, onToken) {
    const words = fullResponse.split(' ');
    let accumulatedResponse = '';
    
    for (let i = 0; i < words.length; i++) {
      const word = words[i] + (i < words.length - 1 ? ' ' : '');
      accumulatedResponse += word;
      
      onToken(word, accumulatedResponse, 'enhanced_soulai');
      
      // Small delay to simulate streaming
      await new Promise(resolve => setTimeout(resolve, 30 + Math.random() * 50));
    }
  }

  // Get conversation statistics
  getConversationStats() {
    return {
      messageCount: this.conversationHistory.length,
      provider: 'enhanced_soulai',
      hasMemoryInsights: Object.keys(this.memoryInsights.coreMemory).length > 0,
      lastMessage: this.conversationHistory.length > 0 ? 
        this.conversationHistory[this.conversationHistory.length - 1] : null,
      memoryInsights: this.memoryInsights
    };
  }

  // Clear conversation history
  clearHistory() {
    this.conversationHistory = [];
    console.log('🗑️ Enhanced SoulAI conversation history cleared');
  }

  // Get current memory insights (cached)
  getCurrentMemoryInsights() {
    return this.memoryInsights;
  }

  // Check if service is initialized
  isServiceInitialized() {
    return this.isInitialized;
  }
}

export default new EnhancedSoulAIService();