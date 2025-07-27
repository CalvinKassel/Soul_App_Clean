// src/services/VertexAIChatService.js
// Vertex AI integration service for SoulAI - replaces ChatGPTService

import * as ApiService from '../api/ApiService';
import Constants from 'expo-constants';

class VertexAIChatService {
  constructor() {
    // Vertex AI Agent endpoint - now configured with your actual agent
    this.vertexAIEndpoint = 'https://us-central1-aiplatform.googleapis.com/v1/projects/soulai-vertex-1753473336/locations/us-central1/agents/3f3a71b6-6245-4121-b373-a87874240afc:executeStreaming';
    this.apiKey = 'YOUR_VERTEX_AI_API_KEY'; // Replace with your actual API key from Google Cloud
    
    // Dynamically construct backend URL using same logic as ApiService
    const { manifest } = Constants;
    const localIp = manifest?.debuggerHost?.split(':').shift();
    this.toolsBackendUrl = localIp ? `http://${localIp}:3001` : 'http://192.168.0.240:3001';
    
    this.conversationHistory = [];
    this.isStreaming = false;
    this.userId = 'default_user'; // In production, get from auth
    
    console.log('VertexAIChatService initialized');
  }

  /**
   * Main method that replaces ChatGPTService.sendMessage()
   * Maintains the same interface for compatibility
   */
  async sendMessage(message, options = {}) {
    const {
      onStart = () => {},
      onToken = () => {},
      onComplete = () => {},
      onError = () => {}
    } = options;

    try {
      onStart();
      this.isStreaming = true;

      // Add user message to history
      const userMessage = { role: 'user', content: message };
      this.conversationHistory.push(userMessage);

      console.log('🤖 Sending message to Vertex AI:', message.substring(0, 100) + '...');

      // For now, use direct tool calls until Vertex AI agent is fully set up
      const response = await this.handleMessageWithTools(message, { onToken, onComplete, onError });
      
      return response;

    } catch (error) {
      console.error('Vertex AI error:', error);
      this.isStreaming = false;
      onError(error);
      
      // Fallback response
      const fallbackResponse = this.generateFallbackResponse(message);
      onComplete(fallbackResponse);
      return fallbackResponse;
    }
  }

  /**
   * Handle message using direct tool calls (for testing/development)
   * This will be replaced with Vertex AI agent calls once configured
   */
  async handleMessageWithTools(message, { onToken, onComplete, onError }) {
    try {
      let response = '';
      const messageLength = message.toLowerCase();

      console.log('🔍 Processing message:', messageLength);
      console.log('🔍 Checking for match keywords:', {
        match: messageLength.includes('match'),
        recommend: messageLength.includes('recommend'),
        compatible: messageLength.includes('compatible')
      });

      // Check if user is asking for matches or compatibility
      if (messageLength.includes('match') || messageLength.includes('recommend') || messageLength.includes('compatible')) {
        console.log('🚀 Triggering matchmaking request');
        response = await this.handleMatchmakingRequest(message, { onToken });
      } 
      // Check if user is asking about personality analysis
      else if (messageLength.includes('personality') || messageLength.includes('analyze') || messageLength.includes('trait')) {
        console.log('🧠 Triggering personality analysis');
        response = await this.handlePersonalityRequest(message, { onToken });
      }
      // General conversation
      else {
        console.log('💬 Using general conversation');
        response = await this.handleGeneralConversation(message, { onToken });
      }

      // Add AI response to history
      this.conversationHistory.push({ role: 'assistant', content: response });
      
      this.isStreaming = false;
      onComplete(response);
      return response;

    } catch (error) {
      console.error('Tool handling error:', error);
      throw error;
    }
  }

  /**
   * Handle matchmaking requests using the harmony tool
   */
  async handleMatchmakingRequest(message, { onToken }) {
    try {
      console.log('🔍 Handling matchmaking request');
      console.log('🔍 Backend URL:', this.toolsBackendUrl);
      
      // Stream the initial response
      const initialResponse = "I'm analyzing potential matches for you using my advanced compatibility system...";
      this.streamResponse(initialResponse, onToken);
      
      // Call the generate-matches tool
      const matchesResponse = await fetch(`${this.toolsBackendUrl}/api/tools/generate-matches`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          userId: this.userId,
          userProfile: {
            hexCode: '#A8E6CF',
            traits: {
              openness: 0.7,
              conscientiousness: 0.6,
              extraversion: 0.5,
              agreeableness: 0.8,
              neuroticism: 0.3
            },
            personalityType: 'INFJ'
          },
          preferences: {
            minAge: 22,
            maxAge: 35,
            location: 'San Francisco'
          },
          poolSize: 3
        })
      });

      const matches = await matchesResponse.json();
      
      if (matches.success && matches.matches.length > 0) {
        let matchResponse = `\n\nI found ${matches.matches.length} highly compatible matches for you:\n\n`;
        
        matches.matches.forEach((match, index) => {
          matchResponse += `**${index + 1}. ${match.name}, ${match.age}**\n`;
          matchResponse += `Compatibility: ${match.compatibility.percentage}\n`;
          matchResponse += `${match.bio}\n`;
          matchResponse += `Interests: ${match.interests.join(', ')}\n`;
          matchResponse += `Why you'd connect: ${match.compatibility.explanation}\n\n`;
        });
        
        matchResponse += `What do you think? Would you like to know more about any of these matches?`;
        
        this.streamResponse(matchResponse, onToken);
        return initialResponse + matchResponse;
      } else {
        const noMatchResponse = "\n\nI'm currently building your compatibility profile. Keep chatting with me so I can better understand your personality and find your perfect matches!";
        this.streamResponse(noMatchResponse, onToken);
        return initialResponse + noMatchResponse;
      }

    } catch (error) {
      console.error('Matchmaking error:', error);
      const errorResponse = "\n\nI'm having trouble accessing my matchmaking system right now, but I'm here to chat and get to know you better!";
      this.streamResponse(errorResponse, onToken);
      return errorResponse;
    }
  }

  /**
   * Handle personality analysis requests
   */
  async handlePersonalityRequest(message, { onToken }) {
    try {
      console.log('🧠 Handling personality analysis request');
      
      const analysisResponse = "Let me analyze your personality based on our conversation...";
      this.streamResponse(analysisResponse, onToken);
      
      // Get recent messages for analysis
      const recentMessages = this.conversationHistory
        .filter(msg => msg.role === 'user')
        .map(msg => msg.content)
        .slice(-10); // Last 10 user messages
      
      if (recentMessages.length === 0) {
        const noDataResponse = "\n\nI need to chat with you more to understand your personality! Tell me about your interests, values, or what you're looking for in a relationship.";
        this.streamResponse(noDataResponse, onToken);
        return analysisResponse + noDataResponse;
      }

      // Call personality analysis tool
      const personalityResponse = await fetch(`${this.toolsBackendUrl}/api/tools/analyze-personality`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          userMessages: recentMessages,
          userId: this.userId,
          context: 'dating'
        })
      });

      const analysis = await personalityResponse.json();
      
      if (analysis.success) {
        let personalityReport = `\n\n**Your Personality Analysis:**\n\n`;
        personalityReport += `🎨 Personality Type: ${analysis.personality.type}\n`;
        personalityReport += `🔮 Your HHC: ${analysis.personality.hexCode}\n\n`;
        
        personalityReport += `**Key Insights:**\n`;
        analysis.personality.insights.forEach(insight => {
          personalityReport += `• ${insight}\n`;
        });
        
        personalityReport += `\n**Communication Style:** ${analysis.personality.communicationStyle}\n\n`;
        
        if (analysis.recommendations && analysis.recommendations.length > 0) {
          personalityReport += `**Recommendations for you:**\n`;
          analysis.recommendations.forEach(rec => {
            personalityReport += `• ${rec.suggestion} - ${rec.reason}\n`;
          });
        }
        
        this.streamResponse(personalityReport, onToken);
        return analysisResponse + personalityReport;
      } else {
        const errorResponse = "\n\nI'm still learning about you! Keep sharing your thoughts and feelings so I can provide better personality insights.";
        this.streamResponse(errorResponse, onToken);
        return analysisResponse + errorResponse;
      }

    } catch (error) {
      console.error('Personality analysis error:', error);
      const errorResponse = "\n\nI'm having trouble with my personality analysis right now, but I'm learning about you with every message!";
      this.streamResponse(errorResponse, onToken);
      return errorResponse;
    }
  }

  /**
   * Handle general conversation
   */
  async handleGeneralConversation(message, { onToken }) {
    // Enhanced conversation responses with personality coaching
    const responses = [
      "That's really interesting! I'm getting to know your personality better with each message. What draws you to that?",
      "I love how thoughtful you are. That tells me a lot about your values. What's most important to you in relationships?",
      "That's a great insight! You seem to have strong emotional intelligence. How do you usually connect with people?",
      "I appreciate you sharing that with me. It helps me understand what kind of person would be a great match for you. Tell me more!",
      "That makes perfect sense given what I'm learning about your personality. What experiences have shaped this perspective?",
      "You have such an interesting way of looking at things! This is exactly the kind of depth I look for when finding compatible matches. What else is important to you?"
    ];
    
    const response = responses[Math.floor(Math.random() * responses.length)];
    this.streamResponse(response, onToken);
    return response;
  }

  /**
   * Simulate streaming response for better UX
   */
  streamResponse(text, onToken) {
    if (!onToken) return;
    
    const words = text.split(' ');
    let currentText = '';
    
    words.forEach((word, index) => {
      setTimeout(() => {
        currentText += (index > 0 ? ' ' : '') + word;
        onToken(word + (index < words.length - 1 ? ' ' : ''), currentText);
      }, index * 50); // 50ms delay between words for natural streaming
    });
  }

  /**
   * Generate fallback response when tools fail
   */
  generateFallbackResponse(message) {
    const fallbacks = [
      "I'm here to help you find meaningful connections. Tell me what you're looking for in a relationship!",
      "I'm fascinated by people and relationships. What's been on your mind lately?",
      "I'm getting to know you better with every conversation. What matters most to you?",
      "That's interesting! I'm building your personality profile to find great matches. Tell me more about yourself!",
      "I love learning about what makes people tick. What drives your relationships?"
    ];
    
    return fallbacks[Math.floor(Math.random() * fallbacks.length)];
  }

  /**
   * Additional utility methods to maintain compatibility with ChatGPTService
   */
  clearHistory() {
    this.conversationHistory = [];
  }

  getConversationHistory() {
    return this.conversationHistory;
  }

  setUserId(userId) {
    this.userId = userId;
  }
}

// Export singleton instance
export default new VertexAIChatService();