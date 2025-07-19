// SoulAIService.js - Enhanced with Intelligent AI Engine

import intelligentAIEngine from './intelligentAIEngine';

class SoulAIService {
  constructor() {
    this.baseURL = 'https://your-soulai-backend.com/api'; // Replace with your actual backend URL
    this.websocket = null;
    this.isConnected = false;
    this.messageListeners = [];
    this.connectionListeners = [];
    this.conversationHistory = [];
    this.currentUserId = null;
    this.userProfile = {
      personalityType: null,
      detectedTraits: {},
      interests: [],
      communicationPatterns: {},
      conversationGoals: ['personality_discovery', 'match_finding']
    };
  }

  // Connection Management
  async connect(userId) {
    this.currentUserId = userId;
    
    try {
      // Try WebSocket first, fallback to REST API with intelligent engine
      await this.connectWebSocket(userId);
    } catch (error) {
      console.log('WebSocket failed, using intelligent offline mode:', error);
      this.isConnected = true; // Mark as connected for intelligent local processing
      this.notifyConnectionListeners('connected');
      
      // Initialize with welcome message from intelligent engine
      setTimeout(() => {
        this.processIntelligentResponse(
          "Hello! I'm excited to chat with you.", 
          [], 
          { userId, isWelcome: true }
        );
      }, 1000);
    }
  }

  async connectWebSocket(userId) {
    return new Promise((resolve, reject) => {
      try {
        this.websocket = new WebSocket(`wss://your-soulai-backend.com/ws?userId=${userId}`);
        
        this.websocket.onopen = () => {
          this.isConnected = true;
          this.notifyConnectionListeners('connected');
          resolve();
        };

        this.websocket.onmessage = (event) => {
          try {
            const message = JSON.parse(event.data);
            
            // Process through intelligent engine for enhancement
            if (message.from === 'ai') {
              this.enhanceAIResponse(message);
            } else {
              this.handleIncomingMessage(message);
            }
          } catch (error) {
            console.error('Error parsing WebSocket message:', error);
          }
        };

        this.websocket.onclose = () => {
          this.isConnected = false;
          this.notifyConnectionListeners('disconnected');
        };

        this.websocket.onerror = (error) => {
          this.notifyConnectionListeners('error', error);
          reject(error);
        };

        // Timeout after 5 seconds
        setTimeout(() => {
          if (!this.isConnected) {
            reject(new Error('WebSocket connection timeout'));
          }
        }, 5000);

      } catch (error) {
        reject(error);
      }
    });
  }

  disconnect() {
    if (this.websocket) {
      this.websocket.close();
      this.websocket = null;
    }
    this.isConnected = false;
    this.notifyConnectionListeners('disconnected');
  }

  // Enhanced Message Handling with AI Intelligence
  async sendMessage(message, userContext = {}) {
    if (!message.trim()) return;

    const messageData = {
      id: Date.now().toString(),
      text: message,
      timestamp: new Date().toISOString(),
      userContext: {
        ...userContext,
        userId: this.currentUserId,
        userProfile: this.userProfile
      },
      conversationHistory: this.conversationHistory.slice(-15) // Last 15 messages for context
    };

    // Add user message to history immediately
    const userMessage = {
      id: messageData.id,
      from: 'user',
      text: message,
      timestamp: messageData.timestamp
    };
    
    this.conversationHistory.push(userMessage);

    try {
      if (this.websocket && this.websocket.readyState === WebSocket.OPEN) {
        // Send via WebSocket to backend
        this.websocket.send(JSON.stringify({
          type: 'chat_message',
          data: messageData
        }));
      } else {
        // Process with intelligent local AI engine
        await this.processIntelligentResponse(message, this.conversationHistory, userContext);
      }
    } catch (error) {
      console.error('Error sending message:', error);
      
      // Fallback to intelligent engine
      await this.processIntelligentResponse(message, this.conversationHistory, userContext);
    }
  }

  // Process message through intelligent AI engine
  async processIntelligentResponse(userMessage, history, userContext) {
    try {
      // Show typing indicator
      this.notifyTypingStart();

      // Generate intelligent response
      const aiResponse = await intelligentAIEngine.generateResponse(
        userMessage,
        history,
        {
          ...userContext,
          userProfile: this.userProfile,
          conversationGoals: this.userProfile.conversationGoals
        }
      );

      // Simulate realistic response time (1-3 seconds)
      const responseDelay = Math.random() * 2000 + 1000;
      
      setTimeout(() => {
        // Update user profile based on AI analysis
        this.updateUserProfileFromAI(aiResponse.metadata);

        // Create response message
        const responseMessage = {
          id: (Date.now() + 1).toString(),
          from: 'ai',
          text: aiResponse.text,
          timestamp: new Date().toISOString(),
          metadata: {
            ...aiResponse.metadata,
            source: 'intelligent_engine',
            responseType: aiResponse.type
          }
        };

        // Add coaching tips if available
        if (aiResponse.coaching) {
          responseMessage.coaching = aiResponse.coaching;
        }

        this.handleIncomingMessage(responseMessage);
        
      }, responseDelay);

    } catch (error) {
      console.error('Error in intelligent response processing:', error);
      
      // Fallback to simple response
      const fallbackMessage = {
        id: (Date.now() + 1).toString(),
        from: 'ai',
        text: "I'm having trouble processing that right now, but I'm still here to chat with you. Could you tell me more about what's on your mind?",
        timestamp: new Date().toISOString(),
        metadata: { source: 'fallback' }
      };
      
      setTimeout(() => {
        this.handleIncomingMessage(fallbackMessage);
      }, 1500);
    }
  }

  // Enhance AI responses from backend with local intelligence
  async enhanceAIResponse(backendMessage) {
    try {
      // Use intelligent engine to enhance or validate backend response
      const enhancement = await intelligentAIEngine.enhanceResponse(
        backendMessage.text,
        this.conversationHistory,
        this.userProfile
      );

      const enhancedMessage = {
        ...backendMessage,
        text: enhancement.text || backendMessage.text,
        metadata: {
          ...backendMessage.metadata,
          ...enhancement.metadata,
          enhanced: true
        }
      };

      if (enhancement.coaching) {
        enhancedMessage.coaching = enhancement.coaching;
      }

      this.handleIncomingMessage(enhancedMessage);
      
    } catch (error) {
      console.error('Error enhancing AI response:', error);
      // Fall back to original backend message
      this.handleIncomingMessage(backendMessage);
    }
  }

  // Update user profile based on AI analysis
  updateUserProfileFromAI(metadata) {
    if (!metadata) return;

    // Update detected personality traits
    if (metadata.detectedTraits) {
      for (const [trait, data] of Object.entries(metadata.detectedTraits)) {
        if (!this.userProfile.detectedTraits[trait]) {
          this.userProfile.detectedTraits[trait] = { strength: 0, instances: 0 };
        }
        
        this.userProfile.detectedTraits[trait].strength = Math.max(
          this.userProfile.detectedTraits[trait].strength,
          data.strength
        );
        this.userProfile.detectedTraits[trait].instances++;
      }
    }

    // Update interests
    if (metadata.topics) {
      metadata.topics.forEach(topic => {
        if (!this.userProfile.interests.includes(topic)) {
          this.userProfile.interests.push(topic);
        }
      });
    }

    // Update communication patterns
    if (metadata.emotionalTone) {
      this.userProfile.communicationPatterns.lastEmotionalTone = metadata.emotionalTone;
    }

    // Detect personality type if enough data
    this.inferPersonalityType();
  }

  // Infer MBTI personality type from accumulated data
  inferPersonalityType() {
    const traits = this.userProfile.detectedTraits;
    
    if (Object.keys(traits).length < 3) return; // Need more data

    let typeCode = '';
    
    // Extraversion vs Introversion
    const extraversionScore = traits.extraversion?.strength || 0;
    typeCode += extraversionScore > 0.5 ? 'E' : 'I';
    
    // Sensing vs Intuition (use openness as proxy)
    const opennessScore = traits.openness?.strength || 0;
    typeCode += opennessScore > 0.5 ? 'N' : 'S';
    
    // Thinking vs Feeling (use agreeableness as proxy)
    const agreeablenessScore = traits.agreeableness?.strength || 0;
    typeCode += agreeablenessScore > 0.5 ? 'F' : 'T';
    
    // Judging vs Perceiving (use conscientiousness as proxy)
    const conscientiousnessScore = traits.conscientiousness?.strength || 0;
    typeCode += conscientiousnessScore > 0.5 ? 'J' : 'P';

    if (typeCode.length === 4) {
      this.userProfile.personalityType = typeCode;
      
      // Notify listeners of personality discovery
      this.notifyPersonalityDiscovery(typeCode);
    }
  }

  // Handle incoming messages and add to history
  handleIncomingMessage(message) {
    // Add AI message to history
    if (message.from === 'ai') {
      this.conversationHistory.push({
        id: message.id,
        from: 'ai',
        text: message.text,
        timestamp: message.timestamp,
        metadata: message.metadata
      });
    }

    // Notify all message listeners
    this.messageListeners.forEach(listener => {
      try {
        listener(message);
      } catch (error) {
        console.error('Error in message listener:', error);
      }
    });
  }

  // Typing indicator management
  notifyTypingStart() {
    this.messageListeners.forEach(listener => {
      try {
        listener({ type: 'typing_start' });
      } catch (error) {
        console.error('Error in typing listener:', error);
      }
    });
  }

  notifyTypingStop() {
    this.messageListeners.forEach(listener => {
      try {
        listener({ type: 'typing_stop' });
      } catch (error) {
        console.error('Error in typing listener:', error);
      }
    });
  }

  // Personality discovery notification
  notifyPersonalityDiscovery(personalityType) {
    this.messageListeners.forEach(listener => {
      try {
        listener({
          type: 'personality_discovered',
          personalityType,
          confidence: this.calculatePersonalityConfidence()
        });
      } catch (error) {
        console.error('Error in personality discovery listener:', error);
      }
    });
  }

  calculatePersonalityConfidence() {
    const traits = this.userProfile.detectedTraits;
    const traitCount = Object.keys(traits).length;
    const totalInstances = Object.values(traits).reduce((sum, trait) => sum + trait.instances, 0);
    
    return Math.min(traitCount * totalInstances / 20, 0.95); // Max 95% confidence
  }

  // Event Listeners
  onMessage(callback) {
    this.messageListeners.push(callback);
    
    return () => {
      const index = this.messageListeners.indexOf(callback);
      if (index > -1) {
        this.messageListeners.splice(index, 1);
      }
    };
  }

  onConnectionChange(callback) {
    this.connectionListeners.push(callback);
    
    return () => {
      const index = this.connectionListeners.indexOf(callback);
      if (index > -1) {
        this.connectionListeners.splice(index, 1);
      }
    };
  }

  notifyConnectionListeners(status, error = null) {
    this.connectionListeners.forEach(listener => {
      try {
        listener(status, error);
      } catch (error) {
        console.error('Error in connection listener:', error);
      }
    });
  }

  // Utility Methods
  async getAuthToken() {
    // Implement your authentication logic here
    return 'your-auth-token';
  }

  getConnectionStatus() {
    return this.isConnected ? 'connected' : 'disconnected';
  }

  clearConversationHistory() {
    this.conversationHistory = [];
    this.userProfile = {
      personalityType: null,
      detectedTraits: {},
      interests: [],
      communicationPatterns: {},
      conversationGoals: ['personality_discovery', 'match_finding']
    };
  }

  getConversationHistory() {
    return [...this.conversationHistory];
  }

  getUserProfile() {
    return { ...this.userProfile };
  }

  // Advanced Features
  async generateConversationStarters(context = {}) {
    try {
      return await intelligentAIEngine.generateConversationStarters(
        this.userProfile,
        context
      );
    } catch (error) {
      console.error('Error generating conversation starters:', error);
      return [
        "What's something you're passionate about right now?",
        "Tell me about a moment when you felt most like yourself.",
        "What does emotional connection mean to you?"
      ];
    }
  }

  async getPersonalityInsights() {
    try {
      const response = await fetch(`${this.baseURL}/personality/insights`, {
        headers: {
          'Authorization': `Bearer ${await this.getAuthToken()}`
        }
      });

      if (response.ok) {
        return await response.json();
      } else {
        // Generate insights from local profile
        return this.generateLocalInsights();
      }
    } catch (error) {
      console.error('Error fetching personality insights:', error);
      return this.generateLocalInsights();
    }
  }

  generateLocalInsights() {
    const insights = {
      personalityType: this.userProfile.personalityType,
      confidence: this.calculatePersonalityConfidence(),
      detectedTraits: this.userProfile.detectedTraits,
      interests: this.userProfile.interests,
      communicationStyle: this.userProfile.communicationPatterns,
      conversationQuality: this.assessConversationQuality()
    };

    return insights;
  }

  assessConversationQuality() {
    const messageCount = this.conversationHistory.length;
    const userMessages = this.conversationHistory.filter(m => m.from === 'user').length;
    const avgMessageLength = userMessages > 0 ? 
      this.conversationHistory
        .filter(m => m.from === 'user')
        .reduce((sum, m) => sum + m.text.length, 0) / userMessages : 0;

    return {
      depth: messageCount > 10 ? 'deep' : messageCount > 5 ? 'medium' : 'surface',
      engagement: avgMessageLength > 50 ? 'high' : avgMessageLength > 20 ? 'medium' : 'low',
      messageCount,
      avgMessageLength
    };
  }
}

// Create singleton instance
const soulAIService = new SoulAIService();

export default soulAIService;