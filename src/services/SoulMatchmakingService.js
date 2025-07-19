/**
 * Soul Matchmaking Service
 * 
 * Integration layer that connects the new chat-based matchmaking system
 * with the existing SoulAI infrastructure, providing a seamless interface
 * for the React Native app to use advanced compatibility features.
 */

import { ChatRecommendationEngine } from './compatibility/ChatRecommendationEngine.js';
import { HHCPersonalityVector, HHCUtils } from './compatibility/HHCPersonalitySystem.js';
import { HarmonyAlgorithm } from './compatibility/HarmonyAlgorithm.js';
import { initializeDemoMatchmaking } from './compatibility/DemoData.js';
import ChatGPTService from './ChatGPTService.js';

export class SoulMatchmakingService {
  constructor() {
    this.recommendationEngine = new ChatRecommendationEngine();
    this.harmonyAlgorithm = new HarmonyAlgorithm();
    this.isInitialized = false;
    this.userProfile = null;
    this.activeConversations = new Map();
  }

  /**
   * Initialize the matchmaking service for a user
   */
  async initialize(userId, userProfileData) {
    try {
      this.userProfile = {
        id: userId,
        ...userProfileData
      };

      // Initialize the recommendation engine
      const initResult = await this.recommendationEngine.initializeForUser(userId, userProfileData);
      
      // Load demo data for demonstration
      await initializeDemoMatchmaking(this);
      
      this.isInitialized = true;
      
      return {
        success: true,
        profileCompleteness: initResult.profileCompleteness,
        welcomeMessage: initResult.initialMessage,
        recommendations: await this.getInitialRecommendations()
      };
    } catch (error) {
      console.error('Error initializing SoulMatchmakingService:', error);
      return {
        success: false,
        error: error.message,
        fallbackMessage: "I'm getting to know you better. Let's start with what kind of connection you're looking for!"
      };
    }
  }

  /**
   * Process user message in the matchmaking conversation
   */
  async processMatchmakingMessage(message, conversationId = 'main') {
    if (!this.isInitialized) {
      return this.getFallbackResponse();
    }

    try {
      // Process the message through our recommendation engine
      const engineResponse = await this.recommendationEngine.processUserMessage(message);
      
      // Convert engine response to chat format
      const chatMessages = await this.convertToSoulChatFormat(engineResponse);
      
      // Store conversation state
      this.activeConversations.set(conversationId, {
        lastUpdate: Date.now(),
        state: this.recommendationEngine.getConversationState()
      });

      return {
        success: true,
        messages: chatMessages,
        hasNewRecommendation: engineResponse.candidateUpdate !== null,
        learningUpdate: engineResponse.learningUpdate,
        actionSuggestions: this.extractActionSuggestions(engineResponse)
      };
    } catch (error) {
      console.error('Error processing matchmaking message:', error);
      return this.getErrorResponse(error);
    }
  }

  /**
   * Get initial recommendations when starting
   */
  async getInitialRecommendations() {
    try {
      if (!this.recommendationEngine.conversationState.currentCandidate) {
        await this.recommendationEngine.refreshCandidateQueue();
      }

      const messages = await this.recommendationEngine.presentCurrentCandidate();
      return this.convertToSoulChatFormat({ messages });
    } catch (error) {
      console.error('Error getting initial recommendations:', error);
      return [{
        id: 'fallback_' + Date.now(),
        from: 'ai',
        text: "Let me find some amazing people for you to meet! What qualities are most important to you in a partner?",
        timestamp: new Date().toISOString(),
        type: 'matchmaking'
      }];
    }
  }

  /**
   * Convert recommendation engine responses to Soul chat format
   */
  async convertToSoulChatFormat(engineResponse) {
    const chatMessages = [];

    for (const message of engineResponse.messages) {
      const chatMessage = {
        id: 'match_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9),
        from: 'ai',
        timestamp: new Date(message.timestamp).toISOString(),
        type: 'matchmaking'
      };

      switch (message.type) {
        case 'profile_presentation':
          chatMessage.text = message.content;
          chatMessage.candidateData = message.candidate;
          chatMessage.compatibility = message.compatibility;
          chatMessage.matchmakingType = 'profile_presentation';
          break;

        case 'compatibility_explanation':
          chatMessage.text = message.content;
          chatMessage.compatibility = message.compatibility;
          chatMessage.matchmakingType = 'explanation';
          break;

        case 'follow_up_question':
          chatMessage.text = message.content;
          chatMessage.matchmakingType = 'question';
          if (message.options) {
            chatMessage.quickReplies = message.options;
          }
          break;

        case 'suggestion':
          chatMessage.text = message.content;
          chatMessage.matchmakingType = 'suggestion';
          if (message.options) {
            chatMessage.quickReplies = message.options;
          }
          break;

        default:
          chatMessage.text = message.content;
          chatMessage.matchmakingType = 'general';
      }

      chatMessages.push(chatMessage);
    }

    return chatMessages;
  }

  /**
   * Calculate compatibility between user and a specific profile
   */
  async calculateCompatibility(targetProfileId, targetProfileData) {
    try {
      // Create HHC vector for target profile
      const targetHHC = new HHCPersonalityVector();
      if (targetProfileData.hhcVector) {
        targetHHC.loadFromVector(targetProfileData.hhcVector);
      } else {
        await this.buildHHCFromProfile(targetHHC, targetProfileData);
      }

      // Calculate compatibility using Harmony Algorithm
      const userHHC = this.recommendationEngine.conversationState.userHHC;
      const compatibility = this.harmonyAlgorithm.calculateCompatibility(
        userHHC,
        targetHHC,
        this.userProfile.id
      );

      return {
        success: true,
        compatibility: {
          overall: compatibility.overall,
          confidence: compatibility.confidence,
          breakdown: compatibility.breakdown,
          factors: compatibility.factors,
          explanation: this.harmonyAlgorithm.explainCompatibility(compatibility)
        }
      };
    } catch (error) {
      console.error('Error calculating compatibility:', error);
      return {
        success: false,
        error: error.message,
        fallbackScore: 0.5
      };
    }
  }

  /**
   * Get personalized match recommendations
   */
  async getPersonalizedRecommendations(count = 10, filters = {}) {
    try {
      if (!this.isInitialized) {
        await this.initialize(this.userProfile?.id, this.userProfile);
      }

      // Refresh candidate queue with any new filters
      await this.recommendationEngine.refreshCandidateQueue();
      
      const recommendations = [];
      const candidates = this.recommendationEngine.conversationState.candidateQueue.slice(0, count);

      for (const candidate of candidates) {
        const compatibility = await this.calculateCompatibility(candidate.id, candidate);
        
        recommendations.push({
          id: candidate.id,
          profile: this.sanitizeProfileForDisplay(candidate),
          compatibility: compatibility.success ? compatibility.compatibility : null,
          recommendationReason: this.generateRecommendationReason(candidate, compatibility),
          timestamp: Date.now()
        });
      }

      return {
        success: true,
        recommendations,
        totalAvailable: this.recommendationEngine.candidateDatabase.size,
        userPreferences: this.getUserPreferenceSummary()
      };
    } catch (error) {
      console.error('Error getting personalized recommendations:', error);
      return {
        success: false,
        error: error.message,
        recommendations: []
      };
    }
  }

  /**
   * Update user preferences from explicit feedback
   */
  async updateUserPreferences(preferences) {
    try {
      const userHHC = this.recommendationEngine.conversationState.userHHC;
      
      // Convert preferences to HHC adjustments
      const hhcAdjustments = {};
      
      if (preferences.personality) {
        Object.assign(hhcAdjustments, HHCUtils.bigFiveToHHC(preferences.personality));
      }
      
      if (preferences.values) {
        this.applyValuesToHHC(preferences.values, hhcAdjustments);
      }
      
      if (preferences.lifestyle) {
        this.applyLifestyleToHHC(preferences.lifestyle, hhcAdjustments);
      }

      // Update the personality vector
      userHHC.updateDimensions(hhcAdjustments);
      
      // Refresh recommendations with updated preferences
      await this.recommendationEngine.refreshCandidateQueue();

      return {
        success: true,
        updatedPreferences: this.getUserPreferenceSummary(),
        message: "Your preferences have been updated! I'll find better matches based on what you've told me."
      };
    } catch (error) {
      console.error('Error updating user preferences:', error);
      return {
        success: false,
        error: error.message
      };
    }
  }

  /**
   * Provide feedback on a specific match
   */
  async provideFeedback(matchId, feedback) {
    try {
      const candidate = this.recommendationEngine.candidateDatabase.get(matchId);
      if (!candidate) {
        throw new Error('Match not found');
      }

      // Update the Harmony Algorithm with feedback
      const userHHC = this.recommendationEngine.conversationState.userHHC;
      const learningUpdate = this.harmonyAlgorithm.updateFromFeedback(
        this.userProfile.id,
        matchId,
        userHHC,
        candidate.hhcVector,
        feedback
      );

      // Process feedback to improve future recommendations
      if (feedback.text) {
        const response = await this.processMatchmakingMessage(feedback.text);
        return {
          success: true,
          learningUpdate,
          followUpMessages: response.messages,
          message: "Thanks for the feedback! This helps me understand your preferences better."
        };
      }

      return {
        success: true,
        learningUpdate,
        message: "Feedback received! I'll use this to improve your future matches."
      };
    } catch (error) {
      console.error('Error providing feedback:', error);
      return {
        success: false,
        error: error.message
      };
    }
  }

  /**
   * Get explanation for why a specific match was recommended
   */
  async explainMatch(matchId) {
    try {
      const candidate = this.recommendationEngine.candidateDatabase.get(matchId);
      if (!candidate) {
        return { success: false, error: 'Match not found' };
      }

      const compatibility = await this.calculateCompatibility(matchId, candidate);
      
      if (!compatibility.success) {
        return compatibility;
      }

      const explanation = {
        compatibilityScore: Math.round(compatibility.compatibility.overall * 100),
        confidence: compatibility.compatibility.confidence,
        keyFactors: compatibility.compatibility.factors.slice(0, 5),
        detailedExplanation: compatibility.compatibility.explanation,
        personalityAlignment: this.explainPersonalityAlignment(candidate),
        suggestions: this.generateRelationshipSuggestions(compatibility.compatibility)
      };

      return {
        success: true,
        explanation,
        conversationalExplanation: this.generateConversationalExplanation(explanation)
      };
    } catch (error) {
      console.error('Error explaining match:', error);
      return {
        success: false,
        error: error.message
      };
    }
  }

  /**
   * Build HHC vector from profile data
   */
  async buildHHCFromProfile(hhcVector, profileData) {
    const adjustments = {};

    // Apply MBTI if available
    if (profileData.mbtiType) {
      Object.assign(adjustments, HHCUtils.mbtiToHHC(profileData.mbtiType));
    }

    // Apply Big Five if available
    if (profileData.bigFive) {
      Object.assign(adjustments, HHCUtils.bigFiveToHHC(profileData.bigFive));
    }

    // Apply interests, values, and lifestyle
    if (profileData.interests) {
      this.applyInterestsToHHC(profileData.interests, adjustments);
    }

    if (profileData.values) {
      this.applyValuesToHHC(profileData.values, adjustments);
    }

    hhcVector.updateDimensions(adjustments);
  }

  /**
   * Get fallback response when system isn't initialized
   */
  getFallbackResponse() {
    return {
      success: true,
      messages: [{
        id: 'fallback_' + Date.now(),
        from: 'ai',
        text: "I'm still learning about you! Tell me more about what you're looking for in a relationship, and I'll help you find amazing connections.",
        timestamp: new Date().toISOString(),
        type: 'matchmaking'
      }],
      needsInitialization: true
    };
  }

  /**
   * Get error response
   */
  getErrorResponse(error) {
    return {
      success: false,
      error: error.message,
      messages: [{
        id: 'error_' + Date.now(),
        from: 'ai',
        text: "I'm having trouble processing that right now, but I'm still here to help you find great connections! What would you like to explore?",
        timestamp: new Date().toISOString(),
        type: 'error'
      }]
    };
  }

  /**
   * Extract action suggestions from engine response
   */
  extractActionSuggestions(engineResponse) {
    const suggestions = [];
    
    for (const message of engineResponse.messages) {
      if (message.options) {
        suggestions.push({
          type: 'quick_replies',
          options: message.options
        });
      }
      
      if (message.type === 'suggestion') {
        suggestions.push({
          type: 'action_suggestion',
          content: message.content
        });
      }
    }
    
    return suggestions;
  }

  /**
   * Get user preference summary
   */
  getUserPreferenceSummary() {
    if (!this.recommendationEngine.conversationState.userHHC) {
      return null;
    }

    const summary = this.recommendationEngine.conversationState.userHHC.getPersonalitySummary();
    return {
      personality: summary.bigFive,
      topValues: summary.topValues,
      communication: summary.communication,
      completeness: this.recommendationEngine.calculateProfileCompleteness()
    };
  }

  /**
   * Sanitize profile data for display
   */
  sanitizeProfileForDisplay(profile) {
    return {
      id: profile.id,
      name: profile.name,
      age: profile.age,
      photos: profile.photos || [],
      bio: profile.bio || '',
      interests: profile.interests || [],
      location: profile.location,
      // Don't expose raw HHC vector or sensitive data
      personalityInsights: HHCUtils.generateInsights(profile.hhcVector).slice(0, 3)
    };
  }

  /**
   * Generate recommendation reason
   */
  generateRecommendationReason(candidate, compatibility) {
    if (!compatibility.success) {
      return "This person caught my attention for you!";
    }

    const topFactor = compatibility.compatibility.factors[0];
    if (topFactor) {
      return `Great match because: ${topFactor.description.toLowerCase()}`;
    }

    const score = Math.round(compatibility.compatibility.overall * 100);
    return `${score}% compatibility - I think you two would connect well!`;
  }

  /**
   * Generate conversational explanation
   */
  generateConversationalExplanation(explanation) {
    let text = `Here's why I think you two are a ${explanation.compatibilityScore}% match:\n\n`;
    
    explanation.keyFactors.slice(0, 3).forEach((factor, index) => {
      text += `${index + 1}. ${factor.description}\n`;
    });
    
    if (explanation.suggestions.length > 0) {
      text += `\nMy suggestion: ${explanation.suggestions[0]}`;
    }
    
    return text;
  }

  // Additional helper methods for HHC integration...
  applyInterestsToHHC(interests, adjustments) {
    // Map interests to HHC dimensions
    const interestMapping = {
      'art': { dimension: 0xC0, value: 0.8 },
      'sports': { dimension: 0xC1, value: 0.8 },
      'technology': { dimension: 0xC2, value: 0.8 },
      'travel': { dimension: 0xC4, value: 0.8 },
      'reading': { dimension: 0xC5, value: 0.8 },
      'music': { dimension: 0xC6, value: 0.8 }
    };

    for (const interest of interests) {
      const mapping = interestMapping[interest.toLowerCase()];
      if (mapping) {
        adjustments[mapping.dimension] = mapping.value;
      }
    }
  }

  applyValuesToHHC(values, adjustments) {
    // Map values to HHC dimensions
    const valueMapping = {
      'family': { dimension: 0x45, value: 0.9 },
      'career': { dimension: 0x41, value: 0.8 },
      'spirituality': { dimension: 0x44, value: 0.8 },
      'adventure': { dimension: 0x43, value: 0.8 },
      'security': { dimension: 0x42, value: 0.7 }
    };

    for (const value of values) {
      const mapping = valueMapping[value.toLowerCase()];
      if (mapping) {
        adjustments[mapping.dimension] = mapping.value;
      }
    }
  }

  applyLifestyleToHHC(lifestyle, adjustments) {
    // Map lifestyle preferences to HHC dimensions
    if (lifestyle.activityLevel) {
      adjustments[0xA0] = lifestyle.activityLevel / 100;
    }
    if (lifestyle.socialFrequency) {
      adjustments[0xA1] = lifestyle.socialFrequency / 100;
    }
    if (lifestyle.routinePreference) {
      adjustments[0xA2] = lifestyle.routinePreference / 100;
    }
  }
}

// Create singleton instance
const soulMatchmakingService = new SoulMatchmakingService();
export default soulMatchmakingService;