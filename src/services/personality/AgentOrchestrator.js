/**
 * AgentOrchestrator.js
 * 
 * The brain of SoulAI's personality adaptation system.
 * Orchestrates HHC retrieval, interaction styling, and dynamic prompt engineering
 * to create truly personalized AI interactions.
 */

import { InteractionStyler } from './InteractionStyler';
import { HHCPersonalitySystem } from '../compatibility/HHCPersonalitySystem';
import { HarmonyAlgorithm } from '../compatibility/HarmonyAlgorithm';
import { userControlManager } from './UserControlManager';

export class AgentOrchestrator {
  constructor() {
    this.profileCache = new Map(); // In-memory cache for session-based profiles
    this.cacheTimeout = 2 * 60 * 60 * 1000; // 2 hours in milliseconds
  }

  /**
   * Main orchestration method - processes user input and returns contextualized prompt
   * @param {Object} params - Orchestration parameters
   * @returns {Object} Complete context for AI interaction
   */
  async orchestrateInteraction({
    userId,
    userMessage,
    userName = null,
    requestType = 'chat', // 'chat', 'recommendation', 'analysis'
    includeMatches = false,
    conversationHistory = [],
    userPreferences = {}
  }) {
    try {
      console.log(`🎭 Orchestrating interaction for user ${userId}, type: ${requestType}`);

      // Step 1: Retrieve user's complete profile including HHC
      const userProfile = await this.getUserProfile(userId);
      
      // Step 2: Create or retrieve cached interaction profile
      const interactionProfile = this.getInteractionProfile(userId, userProfile.hhc);
      
      // Step 3: Generate matches if requested (using same HHC)
      let matches = [];
      if (includeMatches && userProfile.hhc) {
        matches = await this.generateMatches(userProfile, userPreferences);
      }

      // Step 4: Build comprehensive context
      const context = this.buildAgentContext({
        userProfile,
        interactionProfile,
        userMessage,
        userName,
        requestType,
        matches,
        conversationHistory
      });

      // Step 5: Generate dynamic system prompt
      const systemPrompt = this.generateSystemPrompt(interactionProfile, context);

      console.log(`✨ Generated personalized context for ${interactionProfile.tone} interaction style`);

      return {
        systemPrompt,
        context,
        interactionProfile,
        matches,
        userProfile: {
          id: userProfile.id,
          name: userProfile.name,
          hhcSummary: this.summarizeHHC(userProfile.hhc)
        }
      };

    } catch (error) {
      console.error('❌ Error in AgentOrchestrator:', error);
      
      // Fallback to neutral interaction
      return this.createFallbackContext(userMessage, userName);
    }
  }

  /**
   * Retrieves user profile with HHC data
   * In production, this would query your database
   */
  async getUserProfile(userId) {
    // TODO: Replace with actual database query
    // For now, using demo data or localStorage
    
    try {
      // Try to get from localStorage first (development)
      const stored = localStorage.getItem(`user_profile_${userId}`);
      if (stored) {
        return JSON.parse(stored);
      }

      // Generate demo profile for development
      console.log('🔄 Generating demo profile for user:', userId);
      return this.generateDemoProfile(userId);

    } catch (error) {
      console.error('Error retrieving user profile:', error);
      return this.generateDemoProfile(userId);
    }
  }

  /**
   * Gets interaction profile from cache or creates new one
   * Now includes user control filtering
   */
  getInteractionProfile(userId, hhc) {
    const cacheKey = InteractionStyler.getCacheKey(userId);
    const cached = this.profileCache.get(cacheKey);

    // Return cached profile if still valid
    if (cached && Date.now() - cached.timestamp < this.cacheTimeout) {
      console.log('📋 Using cached interaction profile for user:', userId);
      return cached.profile;
    }

    // Generate new interaction profile from HHC
    console.log('🎨 Creating new interaction profile for user:', userId);
    const baseProfile = InteractionStyler.createInteractionProfile(hhc);
    
    // 🎛️ Apply user control filters - THIS IS KEY!
    const controlledProfile = userControlManager.applyUserControl(userId, baseProfile);
    
    // Cache the controlled profile
    this.profileCache.set(cacheKey, {
      profile: controlledProfile,
      timestamp: Date.now()
    });

    console.log('🎛️ Applied user control settings:', {
      baseStyle: baseProfile.tone,
      finalStyle: controlledProfile.tone,
      userHasOverrides: baseProfile.tone !== controlledProfile.tone
    });

    return controlledProfile;
  }

  /**
   * Generates compatible matches using Harmony Algorithm
   */
  async generateMatches(userProfile, preferences = {}) {
    try {
      console.log('💕 Generating matches using Harmony Algorithm');
      
      // TODO: Replace with actual user database query
      const candidatePool = this.getDemoCandidates();
      
      const matches = [];
      for (const candidate of candidatePool) {
        const compatibilityScore = HarmonyAlgorithm.calculateHarmony(
          userProfile.hhc,
          candidate.hhc,
          preferences
        );

        if (compatibilityScore > 0.7) { // High compatibility threshold
          matches.push({
            ...candidate,
            compatibilityScore,
            reasons: this.generateCompatibilityReasons(userProfile.hhc, candidate.hhc)
          });
        }
      }

      // Sort by compatibility score
      return matches.sort((a, b) => b.compatibilityScore - a.compatibilityScore).slice(0, 5);

    } catch (error) {
      console.error('Error generating matches:', error);
      return [];
    }
  }

  /**
   * Builds comprehensive agent context
   */
  buildAgentContext({
    userProfile,
    interactionProfile,
    userMessage,
    userName,
    requestType,
    matches,
    conversationHistory
  }) {
    const context = {
      user: {
        name: userName || userProfile.name || 'there',
        personalityType: this.getPersonalityDescription(userProfile.hhc),
        interactionStyle: InteractionStyler.describeProfile(interactionProfile),
        currentMood: this.inferMoodFromMessage(userMessage)
      },
      interaction: {
        type: requestType,
        style: interactionProfile,
        hasMatches: matches.length > 0,
        isNewConversation: conversationHistory.length === 0
      },
      content: {
        message: userMessage,
        matches: matches.slice(0, 3), // Include top 3 matches in context
        recentHistory: conversationHistory.slice(-5) // Last 5 messages for context
      }
    };

    return context;
  }

  /**
   * Generates dynamic system prompt based on interaction profile and context
   */
  generateSystemPrompt(interactionProfile, context) {
    // Base personality prompt
    let prompt = InteractionStyler.generateSystemPrompt(interactionProfile, context.user.name);

    // Add context-specific instructions
    if (context.interaction.type === 'recommendation' && context.content.matches.length > 0) {
      prompt += `\n\nYou have ${context.content.matches.length} compatible matches to discuss. Present them in a way that matches your personality style, focusing on genuine compatibility and connection potential.`;
    }

    if (context.user.currentMood !== 'neutral') {
      prompt += `\n\nThe user seems to be feeling ${context.user.currentMood}. Adjust your response appropriately while maintaining your personality style.`;
    }

    if (context.interaction.isNewConversation) {
      prompt += `\n\nThis is the beginning of your conversation with ${context.user.name}. Make a great first impression that aligns with their personality preferences.`;
    }

    // Add conversation context if available
    if (context.content.recentHistory.length > 0) {
      prompt += `\n\nRecent conversation context: The user has been discussing ${this.summarizeConversationTopic(context.content.recentHistory)}. Keep this context in mind.`;
    }

    return prompt;
  }

  /**
   * Creates fallback context for error cases
   */
  createFallbackContext(userMessage, userName) {
    console.log('🔄 Creating fallback interaction context');
    
    const defaultProfile = InteractionStyler.createInteractionProfile(null);
    const context = {
      user: { name: userName || 'there' },
      interaction: { type: 'chat', style: defaultProfile },
      content: { message: userMessage }
    };

    return {
      systemPrompt: InteractionStyler.generateSystemPrompt(defaultProfile, userName),
      context,
      interactionProfile: defaultProfile,
      matches: [],
      userProfile: null
    };
  }

  /**
   * Helper methods for context building
   */
  
  generateDemoProfile(userId) {
    // Generate random but consistent HHC for demo
    const hhc = HHCPersonalitySystem.generateRandomHHC();
    
    return {
      id: userId,
      name: `User${userId.slice(-4)}`,
      hhc: hhc,
      preferences: {
        ageRange: [25, 35],
        distance: 25,
        interests: ['music', 'travel', 'fitness']
      },
      createdAt: new Date().toISOString()
    };
  }

  getDemoCandidates() {
    // Return demo candidate pool
    return [
      {
        id: 'demo1',
        name: 'Alex',
        age: 28,
        hhc: HHCPersonalitySystem.generateRandomHHC(),
        interests: ['music', 'art', 'hiking'],
        bio: 'Creative soul who loves adventures'
      },
      {
        id: 'demo2', 
        name: 'Jordan',
        age: 30,
        hhc: HHCPersonalitySystem.generateRandomHHC(),
        interests: ['reading', 'cooking', 'yoga'],
        bio: 'Thoughtful and caring, enjoys deep conversations'
      },
      {
        id: 'demo3',
        name: 'Taylor',
        age: 26,
        hhc: HHCPersonalitySystem.generateRandomHHC(),
        interests: ['fitness', 'travel', 'photography'],
        bio: 'Active lifestyle, always up for new experiences'
      }
    ];
  }

  getPersonalityDescription(hhc) {
    if (!hhc || !hhc.personality) return 'Balanced personality';
    
    const { personality } = hhc;
    const traits = [];
    
    if (personality.openness > 0.7) traits.push('creative');
    if (personality.conscientiousness > 0.7) traits.push('organized');
    if (personality.extraversion > 0.7) traits.push('social');
    if (personality.agreeableness > 0.7) traits.push('caring');
    if (personality.neuroticism < 0.3) traits.push('calm');
    
    return traits.length > 0 ? traits.join(', ') : 'balanced personality';
  }

  inferMoodFromMessage(message) {
    if (!message) return 'neutral';
    
    const lowerMessage = message.toLowerCase();
    
    if (lowerMessage.includes('excited') || lowerMessage.includes('amazing') || lowerMessage.includes('great')) {
      return 'excited';
    }
    if (lowerMessage.includes('sad') || lowerMessage.includes('down') || lowerMessage.includes('upset')) {
      return 'sad';
    }
    if (lowerMessage.includes('stressed') || lowerMessage.includes('anxious') || lowerMessage.includes('worried')) {
      return 'anxious';
    }
    if (lowerMessage.includes('frustrated') || lowerMessage.includes('angry')) {
      return 'frustrated';
    }
    
    return 'neutral';
  }

  summarizeConversationTopic(history) {
    if (!history.length) return 'general topics';
    
    // Simple topic extraction - could be enhanced with NLP
    const recentMessages = history.slice(-3).map(msg => msg.content).join(' ').toLowerCase();
    
    if (recentMessages.includes('relationship') || recentMessages.includes('dating')) {
      return 'relationships and dating';
    }
    if (recentMessages.includes('work') || recentMessages.includes('job')) {
      return 'work and career';
    }
    if (recentMessages.includes('family') || recentMessages.includes('friend')) {
      return 'family and friendships';
    }
    
    return 'personal topics';
  }

  generateCompatibilityReasons(userHHC, candidateHHC) {
    const reasons = [];
    
    if (!userHHC || !candidateHHC) return ['Personality compatibility'];
    
    const userP = userHHC.personality;
    const candidateP = candidateHHC.personality;
    
    // Similar openness
    if (Math.abs(userP.openness - candidateP.openness) < 0.3) {
      reasons.push('Similar adventurous spirit');
    }
    
    // Complementary extraversion
    if (Math.abs(userP.extraversion - candidateP.extraversion) < 0.4) {
      reasons.push('Compatible social energy');
    }
    
    // High agreeableness match
    if (userP.agreeableness > 0.6 && candidateP.agreeableness > 0.6) {
      reasons.push('Both caring and understanding');
    }
    
    return reasons.length > 0 ? reasons : ['Strong personality compatibility'];
  }

  summarizeHHC(hhc) {
    if (!hhc || !hhc.personality) return 'Profile developing';
    
    const p = hhc.personality;
    return `${Math.round(p.openness * 100)}% open, ${Math.round(p.conscientiousness * 100)}% organized, ${Math.round(p.extraversion * 100)}% social`;
  }

  /**
   * Public method to update interaction profile based on feedback
   */
  updateInteractionProfile(userId, feedback) {
    const cacheKey = InteractionStyler.getCacheKey(userId);
    const cached = this.profileCache.get(cacheKey);
    
    if (cached) {
      const updatedProfile = InteractionStyler.updateProfileFromFeedback(cached.profile, feedback);
      this.profileCache.set(cacheKey, {
        profile: updatedProfile,
        timestamp: Date.now()
      });
      
      console.log('📝 Updated interaction profile based on feedback');
      return updatedProfile;
    }
    
    return null;
  }

  /**
   * Clear cache for user (useful for testing or profile resets)
   */
  clearUserCache(userId) {
    const cacheKey = InteractionStyler.getCacheKey(userId);
    this.profileCache.delete(cacheKey);
    console.log('🗑️ Cleared interaction profile cache for user:', userId);
  }
}

// Singleton instance for app-wide use
export const agentOrchestrator = new AgentOrchestrator();
export default AgentOrchestrator;