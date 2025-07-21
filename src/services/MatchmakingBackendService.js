/**
 * Matchmaking Backend Service
 * 
 * Enhanced service that connects the SoulAI matchmaking frontend
 * to the comprehensive backend API system for interactions, recommendations,
 * and HHC-based compatibility matching.
 */

const API_BASE_URL = 'http://localhost:3001/api';

export class MatchmakingBackendService {
  constructor() {
    this.isInitialized = false;
    this.currentUserId = null;
    this.cache = new Map();
    this.recommendationQueues = new Map(); // userId -> recommendation queue
    this.servedRecommendations = new Map(); // userId -> Set of served userIds
    this.queueLastUpdated = new Map(); // userId -> timestamp
    this.userInteractions = new Map(); // userId -> Map(recommendedUserId -> {action, timestamp})
    this.queuePopulationInProgress = new Set(); // Track ongoing queue population to prevent duplicates
    this.userPreferences = new Map(); // userId -> learned preferences from interactions
  }

  /**
   * Initialize the service for a user
   * @param {string} userId - Current user ID
   * @param {Object} userProfile - User profile data
   */
  async initialize(userId, userProfile) {
    try {
      console.log('🚀 Initializing MatchmakingBackendService for user:', userId);
      
      this.currentUserId = userId;
      
      // Create or update user in backend if needed
      await this.ensureUserExists(userId, userProfile);
      
      // Generate initial HHC vector if not present
      await this.ensureHHCVector(userId, userProfile);
      
      this.isInitialized = true;
      
      // Get count of available recommendations but don't load them yet
      const recommendationCount = await this.getRecommendationCount(userId);
      
      // Get queue status for context-aware welcome message
      const queueStatus = await this.getQueueStatus(userId);
      
      return {
        success: true,
        userId,
        recommendationCount,
        welcomeMessage: this.generateProgressiveWelcomeMessage(recommendationCount, queueStatus),
        queueStatus,
        isReady: true
      };
      
    } catch (error) {
      console.error('❌ Error initializing MatchmakingBackendService:', error);
      return {
        success: false,
        error: error.message,
        fallbackMode: true
      };
    }
  }

  /**
   * Ensure user exists in backend system
   * @param {string} userId - User ID
   * @param {Object} userProfile - User profile data
   */
  async ensureUserExists(userId, userProfile) {
    try {
      // Check if user exists
      const response = await fetch(`${API_BASE_URL}/users/profile/${userId}`, {
        method: 'GET',
        headers: { 'Content-Type': 'application/json' }
      });
      
      if (response.status === 404) {
        // User doesn't exist, create them
        console.log('👤 Creating new user in backend:', userId);
        
        const createResponse = await fetch(`${API_BASE_URL}/users`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            userData: {
              email: `${userId}@soulai.app`, // Mock email
              name: userProfile.name || 'User',
              age: userProfile.age || 25,
              location: userProfile.location || 'Unknown',
              photos: userProfile.photos || [],
              ...userProfile
            }
          })
        });
        
        if (!createResponse.ok) {
          throw new Error('Failed to create user in backend');
        }
        
        console.log('✅ User created successfully');
      } else if (!response.ok) {
        throw new Error('Failed to check user existence');
      } else {
        console.log('✅ User already exists in backend');
      }
      
    } catch (error) {
      console.error('Error ensuring user exists:', error);
      // Continue anyway - we can work with cached data
    }
  }

  /**
   * Ensure user has an HHC vector
   * @param {string} userId - User ID
   * @param {Object} userProfile - User profile data
   */
  async ensureHHCVector(userId, userProfile) {
    try {
      console.log('🔢 Checking HHC vector for user:', userId);
      
      const response = await fetch(`${API_BASE_URL}/users/profile/${userId}/hhc/generate`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          initialData: {
            bigFive: userProfile.bigFive,
            interests: userProfile.interests,
            values: userProfile.values,
            personalityType: userProfile.mbtiType
          }
        })
      });
      
      if (response.ok) {
        const result = await response.json();
        console.log('✅ HHC vector generated/updated');
        return result.hhc_vector;
      } else {
        console.log('⚠️ HHC vector generation failed, continuing without it');
        return null;
      }
      
    } catch (error) {
      console.error('Error ensuring HHC vector:', error);
      return null;
    }
  }

  /**
   * Get personalized recommendations for user
   * @param {string} userId - User ID
   * @param {number} count - Number of recommendations
   */
  async getRecommendations(userId, count = 5) {
    try {
      console.log(`🎯 Getting ${count} recommendations for user:`, userId);
      
      const response = await fetch(`${API_BASE_URL}/recommendations/${userId}?count=${count}`, {
        method: 'GET',
        headers: { 'Content-Type': 'application/json' }
      });
      
      if (!response.ok) {
        console.log('⚠️ Recommendations API not available, using fallback');
        return this.getFallbackRecommendations(count);
      }
      
      const data = await response.json();
      
      if (data.success && data.recommendations) {
        console.log(`✅ Got ${data.recommendations.length} recommendations from backend`);
        return this.formatRecommendationsForChat(data.recommendations);
      } else {
        return this.getFallbackRecommendations(count);
      }
      
    } catch (error) {
      console.error('Error getting recommendations:', error);
      return this.getFallbackRecommendations(count);
    }
  }

  /**
   * Handle user like action (with reversibility support)
   * @param {string} likedUserId - ID of user being liked
   * @param {Object} metadata - Additional metadata
   */
  async handleLike(likedUserId, metadata = {}) {
    try {
      console.log('💕 Processing like:', this.currentUserId, '->', likedUserId);
      
      // Check if user previously passed on this person
      const previousInteraction = this.getUserInteraction(this.currentUserId, likedUserId);
      
      if (previousInteraction && previousInteraction.action === 'pass') {
        console.log('🔄 User is changing their mind from pass to like!');
        metadata.reversibility = true;
        metadata.previousAction = 'pass';
        metadata.changeOfMind = true;
      }
      
      const response = await fetch(`${API_BASE_URL}/interactions/like`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          likingUserId: this.currentUserId,
          likedUserId: likedUserId,
          metadata: {
            ...metadata,
            source: 'chat_interface',
            timestamp: new Date().toISOString()
          }
        })
      });
      
      if (!response.ok) {
        throw new Error('Like API request failed');
      }
      
      const result = await response.json();
      
      if (result.success) {
        console.log('✅ Like processed successfully');
        
        // Update local interaction tracking for immediate UI updates
        this.updateUserInteraction(this.currentUserId, likedUserId, 'like', JSON.stringify(metadata));
        
        // Determine response message based on reversibility
        let responseMessage;
        if (metadata.changeOfMind) {
          responseMessage = result.match 
            ? "🎉 Great decision! It's a match! You both liked each other!" 
            : "👍 Second thoughts worked out! Like sent successfully.";
        } else {
          responseMessage = result.match 
            ? "🎉 It's a match! You both liked each other!" 
            : "👍 Like sent! I'll let you know if they like you back.";
        }
        
        return {
          success: true,
          isMatch: result.match,
          isPending: result.pending,
          message: responseMessage,
          changeOfMind: metadata.changeOfMind || false
        };
      } else {
        throw new Error(result.error || 'Like processing failed');
      }
      
    } catch (error) {
      console.error('Error processing like:', error);
      return {
        success: false,
        error: error.message,
        fallbackMessage: "I've noted your interest! Let me continue finding great matches for you."
      };
    }
  }

  /**
   * Handle user pass action
   * @param {string} passedUserId - ID of user being passed
   * @param {Object} metadata - Additional metadata
   */
  async handlePass(passedUserId, metadata = {}) {
    try {
      console.log('👎 Processing pass:', this.currentUserId, '->', passedUserId);
      
      const response = await fetch(`${API_BASE_URL}/interactions/pass`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          passingUserId: this.currentUserId,
          passedUserId: passedUserId,
          metadata: {
            ...metadata,
            source: 'chat_interface',
            timestamp: new Date().toISOString()
          }
        })
      });
      
      if (!response.ok) {
        throw new Error('Pass API request failed');
      }
      
      const result = await response.json();
      
      if (result.success) {
        console.log('✅ Pass processed successfully');
        
        return {
          success: true,
          message: "👌 No worries! I'll find someone more compatible for you."
        };
      } else {
        throw new Error(result.error || 'Pass processing failed');
      }
      
    } catch (error) {
      console.error('Error processing pass:', error);
      return {
        success: false,
        error: error.message,
        fallbackMessage: "Got it! Let me keep looking for better matches for you."
      };
    }
  }

  /**
   * Get user's matches
   * @param {string} userId - User ID
   */
  async getMatches(userId) {
    try {
      const response = await fetch(`${API_BASE_URL}/interactions/matches/${userId}`, {
        method: 'GET',
        headers: { 'Content-Type': 'application/json' }
      });
      
      if (!response.ok) {
        return [];
      }
      
      const data = await response.json();
      return data.success ? data.matches : [];
      
    } catch (error) {
      console.error('Error getting matches:', error);
      return [];
    }
  }

  /**
   * Get user profile for display
   * @param {string} userId - User ID
   */
  async getUserProfile(userId) {
    try {
      const cacheKey = `profile_${userId}`;
      
      // Check cache first
      if (this.cache.has(cacheKey)) {
        const cached = this.cache.get(cacheKey);
        // Use cache if less than 5 minutes old
        if (Date.now() - cached.timestamp < 5 * 60 * 1000) {
          return cached.data;
        }
      }
      
      const response = await fetch(`${API_BASE_URL}/users/profile/${userId}/public`, {
        method: 'GET',
        headers: { 'Content-Type': 'application/json' }
      });
      
      if (!response.ok) {
        return null;
      }
      
      const data = await response.json();
      
      if (data.success && data.profile) {
        // Cache the profile
        this.cache.set(cacheKey, {
          data: data.profile,
          timestamp: Date.now()
        });
        
        return data.profile;
      }
      
      return null;
      
    } catch (error) {
      console.error('Error getting user profile:', error);
      return null;
    }
  }

  /**
   * Process matchmaking conversation message
   * @param {string} message - User message
   * @param {Array} conversationHistory - Previous messages
   */
  async processMatchmakingMessage(message, conversationHistory = []) {
    try {
      console.log('💬 Processing matchmaking message:', message.substring(0, 50) + '...');
      
      // Check queue status for context-aware responses
      const queueStatus = await this.getQueueStatus(this.currentUserId);
      console.log(`📊 Queue status: ${queueStatus.queueSize} remaining, ${queueStatus.totalServed} served`);
      
      // Check for like/pass responses
      const lowerMessage = message.toLowerCase();
      
      // Extract user ID if present in conversation context
      const lastRecommendation = conversationHistory
        .slice()
        .reverse()
        .find(msg => msg.type === 'recommendation' && msg.candidateUserId);
      
      if (lastRecommendation) {
        const candidateUserId = lastRecommendation.candidateUserId;
        
        // Handle explicit responses
        if (lowerMessage.includes('yes') || lowerMessage.includes('like') || 
            lowerMessage.includes('interested') || lowerMessage.includes('👍')) {
          
          const result = await this.handleLike(candidateUserId, {
            conversation_context: message,
            response_type: 'explicit_like'
          });
          
          // Track the interaction for state management
          this.trackUserInteraction(this.currentUserId, candidateUserId, 'like', message);
          
          if (result.success) {
            // Get next recommendation from queue
            const dequeueResult = await this.dequeueRecommendation(this.currentUserId);
            
            let responseMessages = [{
              id: 'like_response_' + Date.now(),
              from: 'ai',
              text: result.message,
              timestamp: new Date().toISOString(),
              type: 'like_response'
            }];
            
            if (dequeueResult.success && dequeueResult.hasMore && dequeueResult.recommendation) {
              const formattedRecommendation = this.formatRecommendationsForChat([dequeueResult.recommendation]);
              const recommendationCard = {
                ...formattedRecommendation[0],
                type: 'recommendation_card'
              };
              
              const followUpText = dequeueResult.remainingCount > 0 
                ? `Great! Here's another person I think you'll love (${dequeueResult.remainingCount} more in queue):`
                : "Perfect! Here's one more amazing person for you:";
              
              responseMessages.push({
                id: 'followup_' + Date.now(),
                from: 'ai',
                text: followUpText,
                timestamp: new Date().toISOString(),
                type: 'followup_intro'
              });
              
              responseMessages.push(recommendationCard);
            }
            
            return {
              success: true,
              messages: responseMessages
            };
          }
        }
        
        else if (lowerMessage.includes('no') || lowerMessage.includes('pass') || 
                 lowerMessage.includes('not interested') || lowerMessage.includes('👎')) {
          
          const result = await this.handlePass(candidateUserId, {
            conversation_context: message,
            response_type: 'explicit_pass'
          });
          
          // Track the interaction for state management
          this.trackUserInteraction(this.currentUserId, candidateUserId, 'pass', message);
          
          if (result.success) {
            // Get next recommendation from queue
            const dequeueResult = await this.dequeueRecommendation(this.currentUserId);
            
            let responseMessages = [{
              id: 'pass_response_' + Date.now(),
              from: 'ai',
              text: result.message,
              timestamp: new Date().toISOString(),
              type: 'pass_response'
            }];
            
            if (dequeueResult.success && dequeueResult.hasMore && dequeueResult.recommendation) {
              const formattedRecommendation = this.formatRecommendationsForChat([dequeueResult.recommendation]);
              const recommendationCard = {
                ...formattedRecommendation[0],
                type: 'recommendation_card'
              };
              
              const followUpText = dequeueResult.remainingCount > 0 
                ? `No problem! Here's someone else who might be perfect (${dequeueResult.remainingCount} more in queue):`
                : "That's okay! Here's another great person for you:";
              
              responseMessages.push({
                id: 'followup_' + Date.now(),
                from: 'ai',
                text: followUpText,
                timestamp: new Date().toISOString(),
                type: 'followup_intro'
              });
              
              responseMessages.push(recommendationCard);
            }
            
            return {
              success: true,
              messages: responseMessages
            };
          }
        }
      }
      
      // Handle showing recommendations - now using queue system
      if (lowerMessage.includes('yes, show me') || lowerMessage.includes('show me') || 
          lowerMessage.includes('more matches') || lowerMessage.includes('recommendations') || 
          lowerMessage.includes('who else') || lowerMessage.includes('yes')) {
        
        // Use the new queue-based recommendation system
        const dequeueResult = await this.dequeueRecommendation(this.currentUserId);
        
        if (!dequeueResult.success) {
          return {
            success: true,
            messages: [{
              id: 'no_recs_' + Date.now(),
              from: 'ai',
              text: dequeueResult.message || "I don't have any new recommendations right now, but I'm always working to find great matches for you!",
              timestamp: new Date().toISOString(),
              type: 'no_recommendations'
            }]
          };
        }
        
        if (!dequeueResult.hasMore) {
          // Queue-aware message based on how many they've seen
          let noMoreMessage = "That's all the recommendations I have for now! ";
          
          if (queueStatus.totalServed === 0) {
            noMoreMessage += "I'm still learning about your preferences. Keep chatting with me and I'll find more matches for you!";
          } else if (queueStatus.totalServed < 3) {
            noMoreMessage += "I'm working on finding more compatible matches based on your preferences.";
          } else {
            noMoreMessage += `You've seen ${queueStatus.totalServed} recommendations so far. I'm continuously finding new matches for you!`;
          }
          
          return {
            success: true,
            messages: [{
              id: 'no_more_recs_' + Date.now(),
              from: 'ai',
              text: dequeueResult.message || noMoreMessage,
              timestamp: new Date().toISOString(),
              type: 'no_more_recommendations',
              quickReplies: ['Tell me about your preferences', 'How does matching work?']
            }]
          };
        }
        
        // Format the single recommendation as a card
        const formattedRecommendation = this.formatRecommendationsForChat([dequeueResult.recommendation]);
        const recommendationCard = {
          ...formattedRecommendation[0],
          type: 'recommendation_card'
        };
        
        // Queue-aware messaging based on remaining count and total served
        let introText = "Perfect! Here's someone amazing I think you'd connect with";
        let remainingText = "";
        
        if (dequeueResult.remainingCount > 0) {
          if (dequeueResult.remainingCount === 1) {
            remainingText = ". I have 1 more great match after this!";
          } else if (dequeueResult.remainingCount <= 3) {
            remainingText = `. I have ${dequeueResult.remainingCount} more carefully selected matches for you!`;
          } else {
            remainingText = `. I have ${dequeueResult.remainingCount} more amazing people lined up!`;
          }
        } else {
          if (queueStatus.totalServed < 2) {
            remainingText = ". This is my current top pick for you!";
          } else {
            remainingText = ". This is my last recommendation for now, but I'm always finding new matches!";
          }
        }
        
        return {
          success: true,
          messages: [
            {
              id: 'intro_response_' + Date.now(),
              from: 'ai',
              text: `${introText}${remainingText}`,
              timestamp: new Date().toISOString(),
              type: 'intro_response'
            },
            recommendationCard
          ]
        };
      }
      
      // Smart conversation triggers for presenting recommendations
      const shouldShowRecommendation = this.shouldTriggerRecommendation(message, conversationHistory, queueStatus);
      
      if (shouldShowRecommendation) {
        const dequeueResult = await this.dequeueRecommendation(this.currentUserId);
        
        if (dequeueResult.success && dequeueResult.hasMore && dequeueResult.recommendation) {
          const formattedRecommendation = this.formatRecommendationsForChat([dequeueResult.recommendation]);
          const recommendationCard = {
            ...formattedRecommendation[0],
            type: 'recommendation_card'
          };
          
          // Generate contextual bridge message based on what triggered the recommendation
          const bridgeMessage = this.getContextualBridgeMessage(message, queueStatus);
          
          return {
            success: true,
            messages: [
              {
                id: 'conversation_response_' + Date.now(),
                from: 'ai',
                text: bridgeMessage,
                timestamp: new Date().toISOString(),
                type: 'conversation_bridge'
              },
              recommendationCard
            ]
          };
        }
      }
      
      // Let regular chat handle this
      return { success: false, reason: 'not_matchmaking_related' };
      
    } catch (error) {
      console.error('Error processing matchmaking message:', error);
      return { success: false, error: error.message };
    }
  }

  /**
   * Format recommendations for chat display
   * @param {Array} recommendations - Raw recommendation data
   */
  formatRecommendationsForChat(recommendations) {
    return recommendations.map((rec, index) => ({
      id: `recommendation_${rec.userId}_${Date.now()}_${index}`,
      from: 'ai',
      text: this.generateRecommendationText(rec),
      timestamp: new Date().toISOString(),
      type: 'recommendation',
      candidateUserId: rec.userId,
      candidateData: rec,
      compatibilityScore: rec.compatibilityScore
    }));
  }

  /**
   * Generate text for a recommendation
   * @param {Object} recommendation - Recommendation data
   */
  generateRecommendationText(recommendation) {
    const compatibility = Math.round(recommendation.compatibilityScore * 100);
    const name = recommendation.fullProfile?.name || recommendation.displayName || 'Someone special';
    const age = recommendation.fullProfile?.age || recommendation.age || '??';
    
    const compatibilityText = compatibility >= 85 ? "amazing" :
                            compatibility >= 75 ? "great" :
                            compatibility >= 65 ? "good" : "interesting";
    
    return `✨ I found ${name}, ${age}, who could be an ${compatibilityText} match for you (${compatibility}% compatibility)!\n\n` +
           `${this.getHighlightText(recommendation)}\n\n` +
           `What do you think? 💕 Like or 👎 Pass?`;
  }

  /**
   * Get highlight text for recommendation
   * @param {Object} recommendation - Recommendation data
   */
  getHighlightText(recommendation) {
    const factors = recommendation.compatibilityFactors;
    
    if (factors?.interests?.overlap && factors.interests.overlap.length > 0) {
      const sharedInterests = factors.interests.overlap.slice(0, 2).join(' and ');
      return `You both love ${sharedInterests}!`;
    }
    
    if (factors?.values?.overlap && factors.values.overlap.length > 0) {
      const sharedValues = factors.values.overlap.slice(0, 2).join(' and ');
      return `You share important values like ${sharedValues}.`;
    }
    
    return "You have a lot in common based on your personality profiles!";
  }

  /**
   * Get count of available recommendations without loading them
   * @param {string} userId - User ID
   */
  async getRecommendationCount(userId) {
    try {
      const response = await fetch(`${API_BASE_URL}/recommendations/${userId}/preview?count=10`, {
        method: 'GET',
        headers: { 'Content-Type': 'application/json' }
      });
      
      if (!response.ok) {
        return 3; // Fallback count
      }
      
      const data = await response.json();
      return data.success ? data.total_queue_size || data.count || 0 : 3;
      
    } catch (error) {
      console.error('Error getting recommendation count:', error);
      return 3; // Fallback count
    }
  }

  /**
   * Generate progressive welcome message with match count
   * @param {number} recommendationCount - Number of available recommendations
   * @param {Object} queueStatus - Current queue status for context
   */
  generateProgressiveWelcomeMessage(recommendationCount, queueStatus = null) {
    let welcomeText;
    
    if (recommendationCount > 0) {
      if (queueStatus && queueStatus.totalServed > 0) {
        // Returning user with history
        if (recommendationCount === 1) {
          welcomeText = `Welcome back! I have 1 new match for you based on your preferences. Ready to see them?`;
        } else if (recommendationCount <= 3) {
          welcomeText = `Welcome back! I've carefully selected ${recommendationCount} new potential matches for you. Want to check them out?`;
        } else {
          welcomeText = `Welcome back! I've found ${recommendationCount} exciting new matches for you! Ready to explore?`;
        }
      } else {
        // First-time user
        if (recommendationCount === 1) {
          welcomeText = `Hey! I'm excited to help you find meaningful connections. I have 1 carefully selected potential match to start with! Would you like to see them?`;
        } else if (recommendationCount <= 5) {
          welcomeText = `Hey! I'm excited to help you find meaningful connections. I've found ${recommendationCount} potential matches to get us started! Would you like to see them?`;
        } else {
          welcomeText = `Hey! I'm excited to help you find meaningful connections. I've curated ${recommendationCount} amazing potential matches for you! Ready to explore?`;
        }
      }
    } else {
      if (queueStatus && queueStatus.totalServed > 0) {
        welcomeText = `Welcome back! I'm working on finding new matches based on your preferences. In the meantime, let's chat about what you're looking for in a connection!`;
      } else {
        welcomeText = "Hey! I'm your personal matchmaker. I'm here to help you find amazing connections. Let me learn more about what you're looking for!";
      }
    }
    
    const message = {
      id: 'welcome_' + Date.now(),
      from: 'ai',
      text: welcomeText,
      timestamp: new Date().toISOString(),
      type: 'welcome'
    };

    // Add quick replies if there are recommendations
    if (recommendationCount > 0) {
      message.quickReplies = ['Yes, show me', 'Tell me about them first'];
      message.hasRecommendations = true;
      message.recommendationCount = recommendationCount;
    } else if (queueStatus && queueStatus.totalServed > 0) {
      message.quickReplies = ['Find more matches', 'Update my preferences'];
    } else {
      message.quickReplies = ['Tell me how this works', 'Start matching'];
    }

    return message;
  }

  /**
   * Get fallback recommendations when backend is unavailable
   * @param {number} count - Number of recommendations
   */
  getFallbackRecommendations(count) {
    console.log('📋 Using fallback recommendations');
    
    const fallbackProfiles = [
      {
        userId: 'demo_user_1',
        displayName: 'Jordan',
        name: 'Jordan',
        age: 26,
        photos: ['https://i.pravatar.cc/400?img=32', 'https://i.pravatar.cc/400?img=33'],
        compatibilityScore: 0.87,
        bio: 'Artist and coffee enthusiast who loves deep conversations.',
        location: 'Brooklyn, NY',
        interests: ['Art', 'Coffee', 'Photography', 'Literature']
      },
      {
        userId: 'demo_user_2', 
        displayName: 'Alex',
        name: 'Alex',
        age: 28,
        photos: ['https://i.pravatar.cc/400?img=45', 'https://i.pravatar.cc/400?img=46'],
        compatibilityScore: 0.82,
        bio: 'Tech professional with a passion for hiking and photography.',
        location: 'San Francisco, CA',
        interests: ['Technology', 'Hiking', 'Photography', 'Startups']
      },
      {
        userId: 'demo_user_3',
        displayName: 'Casey',
        name: 'Casey',
        age: 24,
        photos: ['https://i.pravatar.cc/400?img=38', 'https://i.pravatar.cc/400?img=39'],
        compatibilityScore: 0.79,
        bio: 'Writer and traveler always looking for the next adventure.',
        location: 'Austin, TX',
        interests: ['Writing', 'Travel', 'Music', 'Food']
      }
    ];
    
    return this.formatRecommendationsForChat(
      fallbackProfiles.slice(0, count)
    );
  }

  /**
   * Handle like action (simplified wrapper for UI)
   * @param {string} likedUserId - ID of user being liked
   * @param {Object} metadata - Additional metadata
   */
  async likeUser(likedUserId, metadata = {}) {
    return await this.handleLike(likedUserId, metadata);
  }

  /**
   * Handle pass action (simplified wrapper for UI)  
   * @param {string} passedUserId - ID of user being passed
   * @param {Object} metadata - Additional metadata
   */
  async passUser(passedUserId, metadata = {}) {
    return await this.handlePass(passedUserId, metadata);
  }

  /**
   * Simulate the backend cron job - populate recommendation queue for a user
   * In production, this would be called by a server-side job
   * @param {string} userId - User ID
   */
  async populateRecommendationQueue(userId) {
    try {
      console.log('🔄 Populating recommendation queue for user:', userId);
      
      // Simulate backend matchmaking logic - this would normally be done server-side
      const availableProfiles = [
        {
          userId: 'demo_user_1',
          displayName: 'Jordan',
          name: 'Jordan',
          age: 26,
          photos: ['https://i.pravatar.cc/400?img=32', 'https://i.pravatar.cc/400?img=33'],
          compatibilityScore: 0.87,
          bio: 'Artist and coffee enthusiast who loves deep conversations.',
          location: 'Brooklyn, NY',
          interests: ['Art', 'Coffee', 'Photography', 'Literature'],
          aiGeneratedContent: {
            personalitySummary: 'Creative and introspective with a passion for meaningful connections.',
            relationshipStyle: 'Values deep emotional intimacy and authentic expression.'
          }
        },
        {
          userId: 'demo_user_2', 
          displayName: 'Alex',
          name: 'Alex',
          age: 28,
          photos: ['https://i.pravatar.cc/400?img=45', 'https://i.pravatar.cc/400?img=46'],
          compatibilityScore: 0.82,
          bio: 'Tech professional with a passion for hiking and photography.',
          location: 'San Francisco, CA',
          interests: ['Technology', 'Hiking', 'Photography', 'Startups'],
          aiGeneratedContent: {
            personalitySummary: 'Analytical yet adventurous, seeks balance between innovation and nature.',
            relationshipStyle: 'Appreciates intellectual stimulation and shared adventures.'
          }
        },
        {
          userId: 'demo_user_3',
          displayName: 'Casey',
          name: 'Casey',
          age: 24,
          photos: ['https://i.pravatar.cc/400?img=38', 'https://i.pravatar.cc/400?img=39'],
          compatibilityScore: 0.79,
          bio: 'Writer and traveler always looking for the next adventure.',
          location: 'Austin, TX',
          interests: ['Writing', 'Travel', 'Music', 'Food'],
          aiGeneratedContent: {
            personalitySummary: 'Free-spirited storyteller with boundless curiosity about the world.',
            relationshipStyle: 'Seeks a partner for life\'s adventures and creative collaboration.'
          }
        },
        {
          userId: 'demo_user_4',
          displayName: 'Riley',
          name: 'Riley',
          age: 27,
          photos: ['https://i.pravatar.cc/400?img=51', 'https://i.pravatar.cc/400?img=52'],
          compatibilityScore: 0.85,
          bio: 'Yoga instructor and mindfulness coach who believes in authentic living.',
          location: 'Portland, OR',
          interests: ['Yoga', 'Meditation', 'Nature', 'Wellness'],
          aiGeneratedContent: {
            personalitySummary: 'Centered and compassionate, radiates inner peace and emotional wisdom.',
            relationshipStyle: 'Values mindful communication and mutual growth.'
          }
        },
        {
          userId: 'demo_user_5',
          displayName: 'Sam',
          name: 'Sam',
          age: 25,
          photos: ['https://i.pravatar.cc/400?img=43', 'https://i.pravatar.cc/400?img=44'],
          compatibilityScore: 0.81,
          bio: 'Chef and food blogger who finds joy in creating culinary experiences.',
          location: 'Los Angeles, CA',
          interests: ['Cooking', 'Food', 'Travel', 'Culture'],
          aiGeneratedContent: {
            personalitySummary: 'Passionate creator who expresses love through culinary artistry.',
            relationshipStyle: 'Believes relationships are nourished through shared experiences and care.'
          }
        }
      ];

      // Filter out any users that have already been served
      const served = this.servedRecommendations.get(userId) || new Set();
      const unservedProfiles = availableProfiles.filter(profile => !served.has(profile.userId));
      
      // Sort by compatibility score (highest first)
      unservedProfiles.sort((a, b) => b.compatibilityScore - a.compatibilityScore);
      
      // Store the queue
      this.recommendationQueues.set(userId, unservedProfiles);
      this.queueLastUpdated.set(userId, Date.now());
      
      console.log(`✅ Queue populated with ${unservedProfiles.length} recommendations for user ${userId}`);
      
      return {
        success: true,
        queueSize: unservedProfiles.length,
        recommendations: unservedProfiles
      };
      
    } catch (error) {
      console.error('Error populating recommendation queue:', error);
      return {
        success: false,
        error: error.message,
        queueSize: 0
      };
    }
  }

  /**
   * Dequeue the next recommendation for a user (core functionality)
   * @param {string} userId - User ID
   */
  async dequeueRecommendation(userId) {
    try {
      console.log('🎯 Dequeuing recommendation for user:', userId);
      
      // Check if we have a queue for this user
      let queue = this.recommendationQueues.get(userId);
      
      // If no queue exists or it's empty, populate it
      if (!queue || queue.length === 0) {
        console.log('📋 No queue found, populating recommendations...');
        const populateResult = await this.populateRecommendationQueue(userId);
        if (!populateResult.success) {
          return { success: false, error: 'Failed to populate recommendations' };
        }
        queue = this.recommendationQueues.get(userId);
      }
      
      // If still no recommendations available
      if (!queue || queue.length === 0) {
        return {
          success: true,
          hasMore: false,
          message: "I don't have any new recommendations right now, but I'm always working to find great matches for you!"
        };
      }
      
      // Get the next recommendation (first in queue)
      const nextRecommendation = queue.shift(); // Remove from front of queue
      
      // Update the queue
      this.recommendationQueues.set(userId, queue);
      
      // Mark as served to prevent duplicates
      const served = this.servedRecommendations.get(userId) || new Set();
      served.add(nextRecommendation.userId);
      this.servedRecommendations.set(userId, served);
      
      console.log(`✅ Dequeued recommendation: ${nextRecommendation.name} (${queue.length} remaining)`);
      
      return {
        success: true,
        hasMore: queue.length > 0,
        remainingCount: queue.length,
        recommendation: nextRecommendation,
        message: `Here's ${nextRecommendation.name} - I think you two could have a great connection!`
      };
      
    } catch (error) {
      console.error('Error dequeuing recommendation:', error);
      return {
        success: false,
        error: error.message
      };
    }
  }

  /**
   * Get queue status without dequeuing
   * @param {string} userId - User ID
   */
  async getQueueStatus(userId) {
    try {
      const queue = this.recommendationQueues.get(userId) || [];
      const served = this.servedRecommendations.get(userId) || new Set();
      const lastUpdated = this.queueLastUpdated.get(userId);
      
      return {
        success: true,
        queueSize: queue.length,
        totalServed: served.size,
        hasRecommendations: queue.length > 0,
        lastUpdated: lastUpdated
      };
    } catch (error) {
      return {
        success: false,
        error: error.message,
        queueSize: 0,
        hasRecommendations: false
      };
    }
  }

  /**
   * Reset queue and served recommendations (for testing)
   * @param {string} userId - User ID
   */
  async resetUserQueue(userId) {
    this.recommendationQueues.delete(userId);
    this.servedRecommendations.delete(userId);
    this.queueLastUpdated.delete(userId);
    console.log(`🔄 Reset queue for user: ${userId}`);
    return { success: true };
  }

  /**
   * Track user interaction with a recommendation for state management
   * @param {string} userId - Current user ID
   * @param {string} recommendedUserId - ID of recommended user
   * @param {string} action - 'like', 'pass', 'view', etc.
   * @param {string} context - Additional context about the interaction
   */
  trackUserInteraction(userId, recommendedUserId, action, context = '') {
    if (!this.userInteractions.has(userId)) {
      this.userInteractions.set(userId, new Map());
    }
    
    const userInteractionMap = this.userInteractions.get(userId);
    userInteractionMap.set(recommendedUserId, {
      action,
      timestamp: new Date().toISOString(),
      context: context.substring(0, 100) // Store first 100 chars for context
    });
    
    console.log(`📊 Tracked ${action} interaction: ${userId} -> ${recommendedUserId}`);
  }

  /**
   * Get all served recommendations for a user (recommendations that have been shown)
   * @param {string} userId - User ID
   * @returns {Array} Array of served recommendation data with interaction history
   */
  async getServedRecommendations(userId) {
    try {
      const served = this.servedRecommendations.get(userId) || new Set();
      const interactions = this.userInteractions.get(userId) || new Map();
      
      if (served.size === 0) {
        return [];
      }
      
      const servedRecommendations = [];
      
      // Get profile data for each served recommendation
      for (const recommendedUserId of served) {
        try {
          // Try to get from our demo data first, then fallback to API
          const demoProfiles = [
            {
              userId: 'demo_user_1',
              displayName: 'Jordan',
              name: 'Jordan',
              age: 26,
              photos: ['https://i.pravatar.cc/400?img=32'],
              location: 'Brooklyn, NY',
              bio: 'Artist and coffee enthusiast who loves deep conversations.'
            },
            {
              userId: 'demo_user_2', 
              displayName: 'Alex',
              name: 'Alex',
              age: 28,
              photos: ['https://i.pravatar.cc/400?img=45'],
              location: 'San Francisco, CA',
              bio: 'Tech professional with a passion for hiking and photography.'
            },
            {
              userId: 'demo_user_3',
              displayName: 'Casey',
              name: 'Casey',
              age: 24,
              photos: ['https://i.pravatar.cc/400?img=38'],
              location: 'Austin, TX',
              bio: 'Writer and traveler always looking for the next adventure.'
            },
            {
              userId: 'demo_user_4',
              displayName: 'Riley',
              name: 'Riley',
              age: 27,
              photos: ['https://i.pravatar.cc/400?img=51'],
              location: 'Portland, OR',
              bio: 'Yoga instructor and mindfulness coach who believes in authentic living.'
            },
            {
              userId: 'demo_user_5',
              displayName: 'Sam',
              name: 'Sam',
              age: 25,
              photos: ['https://i.pravatar.cc/400?img=43'],
              location: 'Los Angeles, CA',
              bio: 'Chef and food blogger who finds joy in creating culinary experiences.'
            }
          ];
          
          const profileData = demoProfiles.find(p => p.userId === recommendedUserId) || {
            userId: recommendedUserId,
            displayName: 'Unknown User',
            name: 'Unknown User',
            age: 25,
            photos: ['https://i.pravatar.cc/400?img=1'],
            location: 'Unknown',
            bio: 'Profile information not available.'
          };
          
          const interaction = interactions.get(recommendedUserId);
          
          servedRecommendations.push({
            ...profileData,
            servedAt: this.queueLastUpdated.get(userId) || new Date().toISOString(),
            interaction: interaction ? {
              action: interaction.action,
              timestamp: interaction.timestamp,
              context: interaction.context
            } : null,
            source: 'soulai_recommendation'
          });
          
        } catch (error) {
          console.error(`Error getting profile for ${recommendedUserId}:`, error);
        }
      }
      
      // Sort by most recently served
      servedRecommendations.sort((a, b) => new Date(b.servedAt) - new Date(a.servedAt));
      
      console.log(`📋 Retrieved ${servedRecommendations.length} served recommendations for ${userId}`);
      return servedRecommendations;
      
    } catch (error) {
      console.error('Error getting served recommendations:', error);
      return [];
    }
  }

  /**
   * Smart conversation trigger analysis for presenting recommendations
   * @param {string} message - Current user message
   * @param {Array} conversationHistory - Previous messages
   * @param {Object} queueStatus - Current queue status
   * @returns {boolean} Whether to trigger a recommendation
   */
  shouldTriggerRecommendation(message, conversationHistory = [], queueStatus = {}) {
    try {
      const lowerMessage = message.toLowerCase();
      
      // Don't show if queue is empty
      if (!queueStatus.hasRecommendations) {
        return false;
      }
      
      // Don't show too frequently - check recent history
      const recentRecommendations = conversationHistory
        .slice(-10)
        .filter(msg => msg.type === 'recommendation_card' || msg.type === 'recommendation');
      
      if (recentRecommendations.length > 0) {
        // If we showed a recommendation in the last 5 messages, don't show another
        const lastRecIndex = conversationHistory.findIndex(msg => 
          msg.type === 'recommendation_card' || msg.type === 'recommendation');
        if (lastRecIndex >= conversationHistory.length - 5) {
          return false;
        }
      }
      
      // High-priority triggers (70% chance)
      const highPriorityTriggers = [
        'lonely', 'single', 'looking for someone', 'want to meet', 'ready to date',
        'find love', 'relationship', 'partner', 'soulmate', 'the one',
        'tired of being alone', 'ready for love', 'looking for connection'
      ];
      
      if (highPriorityTriggers.some(trigger => lowerMessage.includes(trigger))) {
        return Math.random() < 0.7;
      }
      
      // Medium-priority triggers (40% chance) - interest and personality sharing
      const mediumPriorityTriggers = [
        'i love', 'i enjoy', 'my passion', 'i\'m into', 'favorite',
        'hobby', 'interests', 'what i like', 'makes me happy',
        'personality', 'who i am', 'describe myself', 'about me'
      ];
      
      if (mediumPriorityTriggers.some(trigger => lowerMessage.includes(trigger))) {
        return Math.random() < 0.4;
      }
      
      // Context-based triggers (30% chance) - questions about the process
      const processTriggers = [
        'how does this work', 'how do you match', 'find matches',
        'matching process', 'algorithm', 'compatibility',
        'what happens next', 'how many people', 'who will i meet'
      ];
      
      if (processTriggers.some(trigger => lowerMessage.includes(trigger))) {
        return Math.random() < 0.3;
      }
      
      // Positive engagement triggers (25% chance)
      const positiveEngagementTriggers = [
        'that\'s interesting', 'cool', 'awesome', 'great', 'amazing',
        'i like that', 'sounds good', 'perfect', 'exactly',
        'yes', 'definitely', 'absolutely', 'for sure'
      ];
      
      if (positiveEngagementTriggers.some(trigger => lowerMessage.includes(trigger))) {
        return Math.random() < 0.25;
      }
      
      // Long message trigger (20% chance) - user is opening up
      if (message.length > 100) {
        return Math.random() < 0.2;
      }
      
      // Default random chance (10%)
      return Math.random() < 0.1;
      
    } catch (error) {
      console.error('Error in shouldTriggerRecommendation:', error);
      return Math.random() < 0.1; // Fallback to low random chance
    }
  }

  /**
   * Generate contextual bridge message for presenting recommendations
   * @param {string} message - User message that triggered the recommendation
   * @param {Object} queueStatus - Current queue status
   * @returns {string} Appropriate bridge message
   */
  getContextualBridgeMessage(message, queueStatus = {}) {
    const lowerMessage = message.toLowerCase();
    
    // High-priority relationship seeking messages
    if (lowerMessage.includes('lonely') || lowerMessage.includes('single')) {
      return "I understand that feeling. Actually, I think I have someone who could really brighten your day:";
    }
    
    if (lowerMessage.includes('looking for someone') || lowerMessage.includes('want to meet')) {
      return "Perfect timing! I've found someone who I think you'd really connect with:";
    }
    
    if (lowerMessage.includes('ready to date') || lowerMessage.includes('ready for love')) {
      return "That's wonderful to hear! I have someone in mind who might be exactly what you're looking for:";
    }
    
    // Interest and personality sharing
    if (lowerMessage.includes('i love') || lowerMessage.includes('i enjoy') || lowerMessage.includes('my passion')) {
      return "That's amazing! Speaking of shared interests, I know someone who has a similar passion:";
    }
    
    if (lowerMessage.includes('hobby') || lowerMessage.includes('favorite')) {
      return "I love learning about what makes you tick! Actually, I found someone with some fascinating hobbies too:";
    }
    
    // Process questions
    if (lowerMessage.includes('how does this work') || lowerMessage.includes('matching process')) {
      return "Great question! Let me show you how it works with a real example. Here's someone I matched for you:";
    }
    
    if (lowerMessage.includes('compatibility') || lowerMessage.includes('algorithm')) {
      return "I analyze hundreds of compatibility factors! For instance, here's someone with great compatibility with you:";
    }
    
    // Positive engagement
    if (lowerMessage.includes('awesome') || lowerMessage.includes('amazing') || lowerMessage.includes('great')) {
      return "I'm so glad you're excited! That positive energy reminds me of someone I think you'd love to meet:";
    }
    
    if (lowerMessage.includes('perfect') || lowerMessage.includes('exactly')) {
      return "Exactly! And speaking of perfect matches, I have someone who might be just that:";
    }
    
    // Long message (user opening up)
    if (message.length > 100) {
      return "Thank you for sharing so much about yourself! It helps me understand you better. Actually, based on what you've told me, I think you'd really connect with:";
    }
    
    // Default contextual messages
    const defaultMessages = [
      "That's interesting! Speaking of connections, I found someone who might be a great match for you:",
      "I love our conversation! By the way, I have someone I think you'd really enjoy meeting:",
      "You know what? This reminds me of someone I think you'd have amazing chemistry with:",
      "Speaking of meaningful connections, I found someone who shares your perspective:",
      "That's wonderful to learn about you! I actually know someone with a similar outlook:"
    ];
    
    return defaultMessages[Math.floor(Math.random() * defaultMessages.length)];
  }

  /**
   * Get user interaction history for reversibility checks
   * @param {string} userId - Current user ID
   * @param {string} targetUserId - Target user ID
   * @returns {Object|null} Interaction data or null
   */
  getUserInteraction(userId, targetUserId) {
    const userInteractions = this.userInteractions.get(userId);
    if (!userInteractions) return null;
    
    return userInteractions.get(targetUserId) || null;
  }

  /**
   * Update user interaction (for reversibility)
   * @param {string} userId - Current user ID  
   * @param {string} targetUserId - Target user ID
   * @param {string} newAction - New action (like, pass)
   * @param {string} context - Context information
   */
  updateUserInteraction(userId, targetUserId, newAction, context = '') {
    if (!this.userInteractions.has(userId)) {
      this.userInteractions.set(userId, new Map());
    }
    
    const userInteractionMap = this.userInteractions.get(userId);
    const existingInteraction = userInteractionMap.get(targetUserId);
    
    userInteractionMap.set(targetUserId, {
      action: newAction,
      timestamp: new Date().toISOString(),
      context: context.substring(0, 100),
      previousAction: existingInteraction?.action || null,
      changedMind: existingInteraction && existingInteraction.action !== newAction
    });
    
    console.log(`🔄 Updated interaction: ${userId} ${newAction}s ${targetUserId} (was: ${existingInteraction?.action || 'none'})`);
  }

  /**
   * Get matches for ListScreen (people who have been liked and potentially matched)
   * @param {string} userId - User ID
   * @returns {Array} Array of match objects
   */
  async getUserMatches(userId) {
    try {
      const interactions = this.userInteractions.get(userId) || new Map();
      const matches = [];
      
      // Get all users this user has liked
      for (const [targetUserId, interaction] of interactions) {
        if (interaction.action === 'like') {
          try {
            // Get profile data for the match
            const demoProfiles = [
              {
                userId: 'demo_user_1',
                displayName: 'Jordan',
                name: 'Jordan',
                age: 26,
                photos: ['https://i.pravatar.cc/400?img=32'],
                location: 'Brooklyn, NY',
                bio: 'Artist and coffee enthusiast who loves deep conversations.'
              },
              {
                userId: 'demo_user_2', 
                displayName: 'Alex',
                name: 'Alex',
                age: 28,
                photos: ['https://i.pravatar.cc/400?img=45'],
                location: 'San Francisco, CA',
                bio: 'Tech professional with a passion for hiking and photography.'
              },
              {
                userId: 'demo_user_3',
                displayName: 'Casey',
                name: 'Casey',
                age: 24,
                photos: ['https://i.pravatar.cc/400?img=38'],
                location: 'Austin, TX',
                bio: 'Writer and traveler always looking for the next adventure.'
              },
              {
                userId: 'demo_user_4',
                displayName: 'Riley',
                name: 'Riley',
                age: 27,
                photos: ['https://i.pravatar.cc/400?img=51'],
                location: 'Portland, OR',
                bio: 'Yoga instructor and mindfulness coach.'
              },
              {
                userId: 'demo_user_5',
                displayName: 'Sam',
                name: 'Sam',
                age: 25,
                photos: ['https://i.pravatar.cc/400?img=43'],
                location: 'Los Angeles, CA',
                bio: 'Chef and food blogger.'
              }
            ];
            
            const profileData = demoProfiles.find(p => p.userId === targetUserId);
            
            if (profileData) {
              matches.push({
                id: targetUserId,
                ...profileData,
                photo: profileData.photos[0],
                lastMessage: "You liked this person",
                timestamp: this.formatTimestamp(interaction.timestamp),
                unreadCount: 0,
                category: 'pending', // Will be 'active' once they match back
                likedAt: interaction.timestamp,
                isMatch: Math.random() > 0.5, // Simulate match status
                source: 'soulai_like'
              });
            }
          } catch (error) {
            console.error(`Error getting match profile for ${targetUserId}:`, error);
          }
        }
      }
      
      // Sort by most recently liked
      matches.sort((a, b) => new Date(b.likedAt) - new Date(a.likedAt));
      
      console.log(`📋 Retrieved ${matches.length} matches for ${userId}`);
      return matches;
      
    } catch (error) {
      console.error('Error getting user matches:', error);
      return [];
    }
  }

  formatTimestamp(timestamp) {
    const date = new Date(timestamp);
    const now = new Date();
    const diffInHours = (now - date) / (1000 * 60 * 60);
    
    if (diffInHours < 1) return 'Just now';
    if (diffInHours < 24) return `${Math.floor(diffInHours)}h ago`;
    if (diffInHours < 72) return `${Math.floor(diffInHours / 24)}d ago`;
    return date.toLocaleDateString();
  }

  /**
   * Clear cache
   */
  clearCache() {
    this.cache.clear();
    console.log('🗑️ MatchmakingBackendService cache cleared');
  }
}

// Create singleton instance
const matchmakingBackendService = new MatchmakingBackendService();

export default matchmakingBackendService;