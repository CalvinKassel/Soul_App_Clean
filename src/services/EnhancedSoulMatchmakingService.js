// Enhanced SoulAI Matchmaking Service with Inter-User Capabilities
// Enables real matchmaking between actual users in the system

import InterAICommunicationService from './InterAICommunicationService';
import PhotoAccessManager from './PhotoAccessManager';

class EnhancedSoulMatchmakingService {
  constructor() {
    this.baseUrl = process.env.REACT_NATIVE_API_URL || 'http://localhost:3000';
    this.apiKey = process.env.REACT_NATIVE_API_KEY;
    this.interAI = InterAICommunicationService;
    this.photoManager = PhotoAccessManager;
    this.matchCache = new Map();
    this.userPreferences = new Map();
  }

  // Initialize the service for a user
  async initialize(userId, userProfile = null) {
    try {
      // Get or create user profile
      let profile = userProfile;
      if (!profile) {
        profile = await this.getUserProfile(userId);
      }

      if (!profile) {
        // Create initial profile
        profile = await this.createUserProfile(userId);
      }

      // Initialize user preferences and AI learning
      await this.initializeUserPreferences(userId);
      
      // Generate welcome message with real matchmaking capabilities
      const welcomeMessage = await this.generateWelcomeMessage(userId, profile);
      
      // Find initial recommendations
      const initialRecommendations = await this.findInitialMatches(userId, 3);

      return {
        success: true,
        welcomeMessage,
        recommendations: initialRecommendations,
        userProfile: profile
      };
    } catch (error) {
      console.error('Enhanced matchmaking initialization failed:', error);
      return {
        success: false,
        error: error.message
      };
    }
  }

  // Find and analyze all potential matches for a user
  async findAllPotentialMatches(userId, searchCriteria = {}) {
    try {
      // Get user's profile and preferences
      const userProfile = await this.getUserProfile(userId);
      const userPreferences = await this.getUserPreferences(userId);
      
      if (!userProfile) {
        throw new Error('User profile not found');
      }

      // Query all eligible users from database
      const eligibleUsers = await this.queryEligibleUsers(userId, searchCriteria);
      
      if (eligibleUsers.length === 0) {
        return [];
      }

      console.log(`Found ${eligibleUsers.length} eligible users for ${userId}`);

      // Perform parallel compatibility analysis
      const compatibilityPromises = eligibleUsers.map(async (candidate) => {
        try {
          // Calculate deep compatibility
          const compatibility = await this.calculateDeepCompatibility(userProfile, candidate);
          
          // Request inter-AI analysis
          const aiAnalysis = await this.interAI.requestProfileAnalysis(userId, candidate.user_id, 'compatibility');
          
          // Find mutual interests and values
          const mutualInterests = this.findMutualInterests(userProfile, candidate);
          
          // Generate conversation starters
          const conversationStarters = await this.generateConversationStarters(userProfile, candidate);

          return {
            candidate,
            compatibility_score: compatibility.overall_score,
            compatibility_breakdown: compatibility.factors,
            ai_insights: aiAnalysis,
            mutual_interests: mutualInterests,
            conversation_starters: conversationStarters,
            distance: this.calculateDistance(userProfile.location, candidate.location)
          };
        } catch (error) {
          console.error(`Error analyzing candidate ${candidate.user_id}:`, error);
          return null;
        }
      });

      const results = await Promise.all(compatibilityPromises);
      
      // Filter out failed analyses and apply smart filtering
      const validResults = results
        .filter(match => match !== null && match.compatibility_score > 0.5)
        .sort((a, b) => b.compatibility_score - a.compatibility_score)
        .slice(0, 50); // Return top 50 matches

      console.log(`Processed ${validResults.length} valid matches for ${userId}`);
      return validResults;
    } catch (error) {
      console.error('Error finding potential matches:', error);
      return [];
    }
  }

  // Present match with rich profile data
  async presentMatch(userId, matchData) {
    try {
      const candidate = matchData.candidate;
      
      // Get accessible photos for this user
      const photos = await this.photoManager.selectPhotosForMatch(
        userId, 
        candidate.user_id, 
        matchData
      );

      // Format location based on privacy settings
      const location = this.formatLocationForPrivacy(candidate.location, candidate.privacy_settings);

      const presentation = {
        id: `match_${userId}_${candidate.user_id}_${Date.now()}`,
        from: 'ai',
        type: 'matchmaking',
        timestamp: new Date().toISOString(),
        
        // Candidate profile data
        candidateData: {
          user_id: candidate.user_id,
          name: candidate.display_name,
          age: candidate.age,
          location: location,
          bio: candidate.bio,
          photos: photos.map(photo => photo.secure_url),
          interests: candidate.personality_traits?.interests || [],
          relationship_goals: candidate.personality_traits?.relationship_goals
        },
        
        // Compatibility information
        compatibility: {
          score: matchData.compatibility_score,
          factors: matchData.compatibility_breakdown,
          ai_insights: matchData.ai_insights,
          mutual_interests: matchData.mutual_interests
        },
        
        // Rich text presentation
        text: this.formatMatchText(matchData),
        
        // Interactive options
        quickReplies: [
          "Tell me more!",
          "What do we have in common?",
          "I'm interested",
          "Not my type"
        ]
      };

      return presentation;
    } catch (error) {
      console.error('Error presenting match:', error);
      return null;
    }
  }

  // Process matchmaking message from user
  async processMatchmakingMessage(message, userId = null) {
    try {
      const lowerMessage = message.toLowerCase();
      
      // Detect what the user is asking for
      if (this.isLookingForMatches(lowerMessage)) {
        return await this.handleMatchRequest(userId, message);
      }
      
      if (this.isRequestingMoreInfo(lowerMessage)) {
        return await this.handleInfoRequest(userId, message);
      }
      
      if (this.isExpressingInterest(lowerMessage)) {
        return await this.handleInterestExpression(userId, message);
      }
      
      if (this.isProvidingFeedback(lowerMessage)) {
        return await this.handleUserFeedback(userId, message);
      }
      
      // Default: provide general matchmaking guidance
      return await this.handleGeneralMatchmakingChat(userId, message);
      
    } catch (error) {
      console.error('Error processing matchmaking message:', error);
      return {
        success: false,
        messages: [{
          id: `error_${Date.now()}`,
          from: 'ai',
          text: "I'm having trouble with the matchmaking system right now, but I'm still here to chat about what you're looking for!",
          timestamp: new Date().toISOString()
        }]
      };
    }
  }

  // Handle request for matches
  async handleMatchRequest(userId, message) {
    const matches = await this.findAllPotentialMatches(userId, this.parseSearchCriteria(message));
    
    if (matches.length === 0) {
      return {
        success: true,
        messages: [{
          id: `no_matches_${Date.now()}`,
          from: 'ai',
          text: `I'm being really selective for you right now! Let me learn more about what you're looking for so I can find you someone truly special.

What qualities are most important to you in a partner?`,
          timestamp: new Date().toISOString()
        }]
      };
    }

    // Present top 3 matches
    const topMatches = matches.slice(0, 3);
    const matchPresentations = await Promise.all(
      topMatches.map(match => this.presentMatch(userId, match))
    );

    return {
      success: true,
      messages: matchPresentations.filter(p => p !== null)
    };
  }

  // Calculate deep compatibility between two users
  async calculateDeepCompatibility(userA, userB) {
    try {
      // Personality compatibility (Big Five)
      const personalityScore = this.calculatePersonalityCompatibility(
        userA.personality_traits?.big_five,
        userB.personality_traits?.big_five
      );

      // Values alignment
      const valuesScore = this.calculateValuesAlignment(
        userA.personality_traits?.values,
        userB.personality_traits?.values
      );

      // Interest overlap
      const interestScore = this.calculateInterestOverlap(
        userA.personality_traits?.interests,
        userB.personality_traits?.interests
      );

      // Attachment style compatibility
      const attachmentScore = this.calculateAttachmentCompatibility(
        userA.personality_traits?.attachment_style,
        userB.personality_traits?.attachment_style
      );

      // Love language compatibility
      const loveLanguageScore = this.calculateLoveLanguageCompatibility(
        userA.personality_traits?.love_languages,
        userB.personality_traits?.love_languages
      );

      // Distance factor
      const distanceScore = this.calculateDistanceCompatibility(userA.location, userB.location);

      // Weighted overall score
      const weights = {
        personality: 0.25,
        values: 0.25,
        interests: 0.15,
        attachment: 0.15,
        loveLanguage: 0.1,
        distance: 0.1
      };

      const overall_score = 
        (personalityScore * weights.personality) +
        (valuesScore * weights.values) +
        (interestScore * weights.interests) +
        (attachmentScore * weights.attachment) +
        (loveLanguageScore * weights.loveLanguage) +
        (distanceScore * weights.distance);

      return {
        overall_score,
        factors: {
          personality: personalityScore,
          values: valuesScore,
          interests: interestScore,
          attachment: attachmentScore,
          love_language: loveLanguageScore,
          distance: distanceScore,
          top_factors: this.identifyTopFactors({
            personality: personalityScore,
            values: valuesScore,
            interests: interestScore,
            attachment: attachmentScore,
            love_language: loveLanguageScore
          })
        }
      };
    } catch (error) {
      console.error('Compatibility calculation failed:', error);
      return {overall_score: 0.5, factors: {}};
    }
  }

  // Format match presentation text
  formatMatchText(matchData) {
    const candidate = matchData.candidate;
    const compatibilityScore = Math.round(matchData.compatibility_score * 100);
    const topFactor = matchData.compatibility_breakdown.top_factors?.[0];
    
    let text = `✨ **Meet ${candidate.display_name}, ${candidate.age}**

${candidate.bio}

**Why I think you'd click:**
• ${compatibilityScore}% compatibility score`;

    if (topFactor) {
      text += `\n• ${topFactor.description}`;
    }

    if (matchData.mutual_interests.shared_interests?.length > 0) {
      text += `\n• You both love: ${matchData.mutual_interests.shared_interests.slice(0, 3).join(', ')}`;
    }

    if (matchData.conversation_starters?.length > 0) {
      text += `\n\n**Perfect conversation starter:** "${matchData.conversation_starters[0]}"`;
    }

    text += `\n\nWhat do you think? I have a really good feeling about this one! 💫`;

    return text;
  }

  // Helper methods for compatibility calculations
  calculatePersonalityCompatibility(bigFiveA, bigFiveB) {
    if (!bigFiveA || !bigFiveB) return 0.5;
    
    // Calculate compatibility based on Big Five research
    const similarities = Object.keys(bigFiveA).map(trait => {
      const diff = Math.abs(bigFiveA[trait] - bigFiveB[trait]);
      return 1 - diff; // Higher similarity = lower difference
    });
    
    return similarities.reduce((sum, sim) => sum + sim, 0) / similarities.length;
  }

  calculateValuesAlignment(valuesA, valuesB) {
    if (!valuesA || !valuesB) return 0.5;
    
    const intersection = valuesA.filter(value => valuesB.includes(value));
    const union = [...new Set([...valuesA, ...valuesB])];
    
    return intersection.length / union.length;
  }

  calculateInterestOverlap(interestsA, interestsB) {
    if (!interestsA || !interestsB) return 0.5;
    
    const intersection = interestsA.filter(interest => interestsB.includes(interest));
    const maxLength = Math.max(interestsA.length, interestsB.length);
    
    return intersection.length / maxLength;
  }

  calculateAttachmentCompatibility(attachmentA, attachmentB) {
    if (!attachmentA || !attachmentB) return 0.5;
    
    // Secure attachment is generally compatible with all styles
    if (attachmentA.secure > 0.7 || attachmentB.secure > 0.7) return 0.8;
    
    // Anxious and avoidant can be challenging together
    if (attachmentA.anxious > 0.6 && attachmentB.avoidant > 0.6) return 0.3;
    if (attachmentA.avoidant > 0.6 && attachmentB.anxious > 0.6) return 0.3;
    
    return 0.6; // Default moderate compatibility
  }

  calculateLoveLanguageCompatibility(languagesA, languagesB) {
    if (!languagesA || !languagesB) return 0.5;
    
    // Find the top love language for each person
    const topA = Object.keys(languagesA).reduce((a, b) => languagesA[a] > languagesA[b] ? a : b);
    const topB = Object.keys(languagesB).reduce((a, b) => languagesB[a] > languagesB[b] ? a : b);
    
    // High compatibility if they share top love language
    if (topA === topB) return 0.9;
    
    // Moderate compatibility if one's top is in other's top 2
    const secondA = Object.keys(languagesA).sort((a, b) => languagesB[b] - languagesB[a])[1];
    const secondB = Object.keys(languagesB).sort((a, b) => languagesA[b] - languagesA[a])[1];
    
    if (topA === secondB || topB === secondA) return 0.7;
    
    return 0.5; // Default moderate compatibility
  }

  calculateDistanceCompatibility(locationA, locationB) {
    if (!locationA || !locationB) return 0.5;
    
    const distance = this.calculateDistance(locationA, locationB);
    
    // Distance compatibility decreases with distance
    if (distance < 10) return 1.0;
    if (distance < 25) return 0.8;
    if (distance < 50) return 0.6;
    if (distance < 100) return 0.4;
    return 0.2;
  }

  calculateDistance(locationA, locationB) {
    // Haversine formula for distance calculation
    const R = 3959; // Earth's radius in miles
    const dLat = this.toRadians(locationB.coordinates[0] - locationA.coordinates[0]);
    const dLon = this.toRadians(locationB.coordinates[1] - locationA.coordinates[1]);
    
    const a = Math.sin(dLat/2) * Math.sin(dLat/2) +
      Math.cos(this.toRadians(locationA.coordinates[0])) * Math.cos(this.toRadians(locationB.coordinates[0])) *
      Math.sin(dLon/2) * Math.sin(dLon/2);
    
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
    return R * c;
  }

  toRadians(degrees) {
    return degrees * (Math.PI / 180);
  }

  identifyTopFactors(factors) {
    return Object.entries(factors)
      .sort(([,a], [,b]) => b - a)
      .slice(0, 3)
      .map(([name, score]) => ({
        name,
        score,
        description: this.getFactorDescription(name, score)
      }));
  }

  getFactorDescription(factorName, score) {
    const descriptions = {
      personality: score > 0.8 ? "Your personalities complement each other beautifully" : "You have compatible personality traits",
      values: score > 0.8 ? "You share the same core values" : "Your values align well",
      interests: score > 0.8 ? "You have tons of shared interests" : "You enjoy many of the same activities",
      attachment: score > 0.8 ? "Your attachment styles work perfectly together" : "You have compatible relationship styles",
      love_language: score > 0.8 ? "You speak the same love language" : "You express love in compatible ways"
    };
    
    return descriptions[factorName] || "You're compatible in this area";
  }

  // Message detection helpers
  isLookingForMatches(message) {
    const keywords = ['find', 'show', 'match', 'recommend', 'introduce', 'someone', 'people'];
    return keywords.some(keyword => message.includes(keyword));
  }

  isRequestingMoreInfo(message) {
    const keywords = ['tell me more', 'more info', 'what', 'how', 'why'];
    return keywords.some(keyword => message.includes(keyword));
  }

  isExpressingInterest(message) {
    const keywords = ['interested', 'yes', 'introduce', 'like them', 'sounds good'];
    return keywords.some(keyword => message.includes(keyword));
  }

  isProvidingFeedback(message) {
    const keywords = ['not my type', 'not interested', 'perfect', 'amazing', 'love'];
    return keywords.some(keyword => message.includes(keyword));
  }

  // Placeholder methods (to be implemented)
  async getUserProfile(userId) {
    // Implementation needed
    return null;
  }

  async queryEligibleUsers(userId, criteria) {
    // Implementation needed
    return [];
  }

  async generateConversationStarters(userA, userB) {
    // Implementation needed
    return [];
  }

  findMutualInterests(userA, userB) {
    // Implementation needed
    return {shared_interests: []};
  }

  formatLocationForPrivacy(location, privacySettings) {
    // Implementation needed
    return `${location.city}, ${location.state}`;
  }
}

export default new EnhancedSoulMatchmakingService();