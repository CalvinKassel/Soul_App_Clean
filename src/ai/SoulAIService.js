// src/services/SoulAIFrontendService.js
// Enhanced version with streaming support and ChatGPT-like behavior

class SoulAIFrontendService {
  constructor() {
    this.baseUrl = process.env.EXPO_PUBLIC_API_URL || 'http://localhost:3001';
    this.conversationHistory = [];
    this.isConnected = false;
    this.mode = 'connected'; // 'connected', 'offline', 'basic'
  }

  // Enhanced processMessage with streaming support
  async processMessage(message, options = {}) {
    const {
      onThinking = () => {},
      onPartialResponse = () => {},
      onComplete = () => {},
      onError = () => {}
    } = options;

    try {
      // Show thinking state
      onThinking(true);

      // Try different connection modes
      if (this.mode === 'connected') {
        return await this.tryConnectedMode(message, {
          onThinking,
          onPartialResponse,
          onComplete,
          onError
        });
      } else {
        return await this.getOfflineResponse(message, { onComplete, onError });
      }
    } catch (error) {
      console.error('SoulAI ProcessMessage Error:', error);
      onThinking(false);
      onError(error);
      
      // Fallback to offline mode
      this.mode = 'offline';
      return this.getOfflineResponse(message, { onComplete, onError });
    }
  }

  // Try connected mode with backend
  async tryConnectedMode(message, callbacks) {
    const { onThinking, onPartialResponse, onComplete, onError } = callbacks;

    try {
      // First try streaming endpoint
      if (await this.checkStreamingSupport()) {
        return await this.sendStreamingRequest(message, callbacks);
      } else {
        // Fallback to regular endpoint
        return await this.sendRegularRequest(message, callbacks);
      }
    } catch (error) {
      console.log('Connected mode failed, switching to offline:', error.message);
      this.mode = 'offline';
      throw error;
    }
  }

  // Streaming request implementation
  async sendStreamingRequest(message, callbacks) {
    const { onThinking, onPartialResponse, onComplete, onError } = callbacks;

    return new Promise((resolve, reject) => {
      // Simulate streaming for now (can be replaced with real EventSource)
      const simulateStreaming = async () => {
        onThinking(false); // Stop thinking indicator

        // Get response from backend
        const response = await this.callBackendAPI(message);
        
        // Simulate word-by-word streaming
        const words = response.split(' ');
        let currentText = '';
        
        for (let i = 0; i < words.length; i++) {
          currentText += (i > 0 ? ' ' : '') + words[i];
          onPartialResponse(currentText);
          
          // Add delay for realistic streaming
          await new Promise(resolve => setTimeout(resolve, 50 + Math.random() * 100));
        }
        
        // Complete the response
        const finalResponse = {
          text: response,
          type: 'streaming',
          timestamp: new Date().toISOString()
        };
        
        onComplete(finalResponse);
        resolve(finalResponse);
      };

      simulateStreaming().catch(reject);
    });
  }

  // Regular request implementation
  async sendRegularRequest(message, callbacks) {
    const { onThinking, onComplete, onError } = callbacks;

    try {
      const response = await this.callBackendAPI(message);
      
      onThinking(false);
      
      const finalResponse = {
        text: response,
        type: 'regular',
        timestamp: new Date().toISOString()
      };
      
      onComplete(finalResponse);
      return finalResponse;
      
    } catch (error) {
      onThinking(false);
      onError(error);
      throw error;
    }
  }

  // Call your backend API
  async callBackendAPI(message) {
    try {
      const response = await fetch(`${this.baseUrl}/api/soulai/chat/user123`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          message,
          conversationHistory: this.conversationHistory.slice(-10),
          timestamp: new Date().toISOString()
        }),
        timeout: 15000
      });

      if (!response.ok) {
        throw new Error(`API error: ${response.status}`);
      }

      const data = await response.json();
      
      // Store in conversation history
      this.addToHistory('user', message);
      this.addToHistory('ai', data.response);
      
      this.isConnected = true;
      return data.response;
      
    } catch (error) {
      console.error('Backend API call failed:', error);
      this.isConnected = false;
      throw error;
    }
  }

  // Check if backend supports streaming
  async checkStreamingSupport() {
    try {
      const response = await fetch(`${this.baseUrl}/health`, {
        method: 'GET',
        timeout: 5000
      });
      
      if (response.ok) {
        const data = await response.json();
        return data.features?.streaming === true;
      }
      return false;
    } catch {
      return false;
    }
  }

  // Offline/fallback responses
  async getOfflineResponse(message, callbacks) {
    const { onComplete, onError } = callbacks;
    
    try {
      const response = this.generateIntelligentFallback(message);
      
      const finalResponse = {
        text: response,
        type: 'offline',
        timestamp: new Date().toISOString()
      };
      
      onComplete(finalResponse);
      return finalResponse;
      
    } catch (error) {
      onError(error);
      throw error;
    }
  }

  // Intelligent fallback responses based on message analysis
  generateIntelligentFallback(message) {
    const msg = message.toLowerCase();
    
    // Analyze message content for appropriate response
    if (msg.includes('relationship') || msg.includes('dating')) {
      return "Relationships are such a beautiful part of the human experience. I'd love to explore what authentic connection means to you. What qualities do you value most in the people you're drawn to?";
    }
    
    if (msg.includes('feel') || msg.includes('emotion') || msg.includes('sad') || msg.includes('happy')) {
      return "Thank you for sharing something so personal with me. Our emotions are such valuable guides to understanding ourselves. What's been stirring in your heart lately?";
    }
    
    if (msg.includes('personality') || msg.includes('type') || msg.includes('who am i')) {
      return "Self-discovery is one of the most rewarding journeys we can take. I sense you're someone who thinks deeply about identity and growth. What aspects of yourself are you most curious about right now?";
    }
    
    if (msg.includes('compatible') || msg.includes('match') || msg.includes('perfect')) {
      return "True compatibility goes so much deeper than surface-level similarities. It's about values, communication styles, and how two people bring out the best in each other. What does compatibility mean to you?";
    }
    
    if (msg.includes('love') || msg.includes('connection')) {
      return "Love and connection are what make us most human. There's something beautiful about how you're exploring these deeper questions. What kind of love or connection are you hoping to cultivate in your life?";
    }
    
    if (msg.includes('hello') || msg.includes('hi') || msg.includes('hey')) {
      return "Hello! It's wonderful to connect with you. I'm here to understand you deeply and help you discover meaningful connections. What's been on your mind about relationships or personal growth lately?";
    }
    
    // Default thoughtful response
    return "I can sense there's something meaningful behind what you're sharing. While I gather my thoughts, I'm curious - what's really at the heart of what you're thinking about right now?";
  }

  // Conversation memory management
  addToHistory(sender, message) {
    this.conversationHistory.push({
      sender,
      message,
      timestamp: new Date().toISOString()
    });

    // Keep only last 20 messages to prevent memory issues
    if (this.conversationHistory.length > 20) {
      this.conversationHistory = this.conversationHistory.slice(-20);
    }
  }

  // Legacy methods for compatibility with existing code
  async generateResponse(message) {
    try {
      const response = await this.processMessage(message);
      return response.text || response;
    } catch (error) {
      return this.generateIntelligentFallback(message);
    }
  }

  async analyzePersonality(conversationData) {
    // Mock personality analysis
    return {
      primaryType: 'ENFP',
      traits: ['Empathetic', 'Curious', 'Authentic'],
      compatibilityInsights: 'Values deep connection and meaningful conversation',
      confidence: 0.75
    };
  }

  async getCompatibilityScore(user1, user2) {
    // Mock compatibility scoring
    return {
      overallScore: 0.82,
      dimensions: {
        personality: 0.85,
        values: 0.80,
        communication: 0.79,
        lifestyle: 0.84
      },
      insights: 'Strong potential for meaningful connection'
    };
  }

  // Service status and insights
  getServiceStatus() {
    return {
      mode: this.mode,
      isConnected: this.isConnected,
      conversationLength: this.conversationHistory.length,
      lastActivity: this.conversationHistory.length > 0 
        ? this.conversationHistory[this.conversationHistory.length - 1].timestamp 
        : null
    };
  }

  // Reset conversation
  clearHistory() {
    this.conversationHistory = [];
  }

  // Force reconnection attempt
  async reconnect() {
    this.mode = 'connected';
    this.isConnected = false;
    
    try {
      await this.checkStreamingSupport();
      console.log('✅ SoulAI reconnected successfully');
    } catch (error) {
      console.log('❌ SoulAI reconnection failed, staying in offline mode');
      this.mode = 'offline';
    }
  }
}

// Export singleton instance
export default new SoulAIFrontendService();