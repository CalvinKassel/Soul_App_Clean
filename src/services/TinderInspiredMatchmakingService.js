// SoulAI Tinder-Inspired Matchmaking Service
// Main orchestrator that combines all Tinder-inspired architectural components

import EnhancedDiscoveryService from './discovery/EnhancedDiscoveryService.js';
import PsychologicalClusteringEngine from './discovery/PsychologicalClusteringEngine.js';
import PrometheusMetrics from './monitoring/PrometheusMetrics.js';
import SoulMatchmakingService from './SoulMatchmakingService.js';
import HHCPersonalitySystem from './compatibility/HHCPersonalitySystem.js';

class TinderInspiredMatchmakingService {
  constructor() {
    this.isInitialized = false;
    this.fallbackToOriginal = false;
  }

  async initialize() {
    try {
      console.log('🚀 Initializing Tinder-Inspired Matchmaking Service...');

      // Initialize monitoring first
      await PrometheusMetrics.initialize();
      PrometheusMetrics.startResourceMonitoring();

      // Initialize discovery engine
      const discoveryResult = await EnhancedDiscoveryService.initialize();
      if (!discoveryResult.success) {
        console.log('⚠️ Discovery service failed, enabling fallback mode');
        this.fallbackToOriginal = true;
      }

      // Initialize original service as fallback
      await SoulMatchmakingService.initialize();

      this.isInitialized = true;
      console.log('✅ Tinder-Inspired Matchmaking Service ready');

      // Record initialization
      PrometheusMetrics.recordUserSession('system', 'initialization');

      return { success: true, fallbackMode: this.fallbackToOriginal };

    } catch (error) {
      console.error('❌ Failed to initialize Tinder-Inspired Matchmaking:', error);
      PrometheusMetrics.recordError('matchmaking', 'initialization_failed', 'high');
      
      // Enable fallback mode
      this.fallbackToOriginal = true;
      await SoulMatchmakingService.initialize();
      
      return { success: true, fallbackMode: true, error: error.message };
    }
  }

  // Main matchmaking interface - enhanced with Tinder architecture
  async findMatches(userId, userProfile, preferences = {}) {
    const startTime = PrometheusMetrics.startTimer();
    
    try {
      console.log(`🔍 Finding matches for user ${userId}`);

      // Record user session
      const userCluster = userProfile.hhcCluster || 'unknown';
      PrometheusMetrics.recordUserSession(userCluster, 'matchmaking_request');

      let result;

      if (!this.fallbackToOriginal) {
        // Use enhanced Tinder-inspired pipeline
        result = await this.enhancedMatchmaking(userId, userProfile, preferences);
      } else {
        // Fallback to original system
        console.log('🔄 Using fallback matchmaking system');
        result = await this.fallbackMatchmaking(userId, userProfile, preferences);
      }

      const duration = PrometheusMetrics.endTimer(startTime);
      
      // Record metrics
      PrometheusMetrics.recordDiscoveryPipeline(
        'success',
        userCluster,
        result.candidatesAnalyzed || 0,
        result.matches.length
      );

      console.log(`✅ Found ${result.matches.length} matches in ${duration}ms`);

      return {
        ...result,
        processingTime: duration,
        systemUsed: this.fallbackToOriginal ? 'fallback' : 'enhanced',
        timestamp: new Date().toISOString()
      };

    } catch (error) {
      const duration = PrometheusMetrics.endTimer(startTime);
      console.error('❌ Matchmaking error:', error);

      PrometheusMetrics.recordError('matchmaking', 'find_matches_failed', 'medium');
      PrometheusMetrics.recordDiscoveryPipeline('error', userProfile.hhcCluster || 'unknown', 0, 0);

      return {
        matches: [],
        error: error.message,
        processingTime: duration,
        systemUsed: 'error'
      };
    }
  }

  // Enhanced matchmaking using Tinder-inspired architecture
  async enhancedMatchmaking(userId, userProfile, preferences) {
    // Step 1: Ensure user profile is in discovery system
    await this.ensureUserInDiscoverySystem(userId, userProfile);

    // Step 2: Use enhanced discovery pipeline
    const discoveryResult = await EnhancedDiscoveryService.findMatches(userProfile, preferences);

    // Step 3: Enrich matches with conversation suggestions
    const enrichedMatches = await this.enrichMatchesWithConversationStarters(
      discoveryResult.matches,
      userProfile
    );

    return {
      matches: enrichedMatches,
      candidatesAnalyzed: discoveryResult.metrics?.candidatesPreFiltered || 0,
      systemMetrics: discoveryResult.metrics,
      discoveryTime: discoveryResult.searchTime,
      source: 'enhanced_discovery'
    };
  }

  // Fallback to original system
  async fallbackMatchmaking(userId, userProfile, preferences) {
    const matches = await SoulMatchmakingService.getMatchRecommendations(userId, preferences);
    
    return {
      matches: matches.slice(0, preferences.limit || 10),
      candidatesAnalyzed: matches.length,
      source: 'original_system'
    };
  }

  // Ensure user is properly indexed in the discovery system
  async ensureUserInDiscoverySystem(userId, userProfile) {
    try {
      // Generate HHC vector if not exists
      if (!userProfile.hhcVector) {
        userProfile.hhcVector = await HHCPersonalitySystem.generateVector(userProfile);
      }

      // Assign to psychological cluster
      if (!userProfile.hhcCluster) {
        userProfile.hhcCluster = PsychologicalClusteringEngine.assignUserToCluster(
          userId,
          userProfile.hhcVector
        );
      }

      // Update in discovery system
      await EnhancedDiscoveryService.updateUserProfile({
        userId,
        ...userProfile
      });

      console.log(`✅ User ${userId} indexed in discovery system (cluster: ${userProfile.hhcCluster})`);

    } catch (error) {
      console.error(`❌ Failed to index user ${userId}:`, error);
      PrometheusMetrics.recordError('discovery', 'user_indexing_failed', 'medium');
    }
  }

  // Enrich matches with AI-generated conversation starters
  async enrichMatchesWithConversationStarters(matches, userProfile) {
    const enriched = [];

    for (const match of matches) {
      try {
        const conversationStarters = await this.generateConversationStarters(match, userProfile);
        
        enriched.push({
          ...match,
          conversationStarters,
          compatibilityInsight: this.generateCompatibilityInsight(match),
          recommendationReason: this.generateRecommendationReason(match, userProfile)
        });

      } catch (error) {
        console.error(`❌ Error enriching match ${match.userId}:`, error);
        enriched.push(match); // Include without enrichment
      }
    }

    return enriched;
  }

  async generateConversationStarters(match, userProfile) {
    // Generate contextual conversation starters based on compatibility factors
    const starters = [];

    if (match.attractionFactors) {
      match.attractionFactors.forEach(factor => {
        switch (factor.factor) {
          case 'interests_overlap':
            starters.push(`I see we both love ${match.preview.interests[0]}! What got you into it?`);
            break;
          case 'personality_similarity':
            starters.push(`Fellow ${match.preview.personalityType}! How do you think that shapes your approach to relationships?`);
            break;
          case 'values_alignment':
            starters.push(`I noticed we share similar values. What's most important to you in life right now?`);
            break;
          case 'psychological_compatibility':
            starters.push(`Our personalities seem really compatible! What's your favorite way to connect with someone new?`);
            break;
        }
      });
    }

    // Default starters if none generated
    if (starters.length === 0) {
      starters.push(
        `Hi! I'd love to know more about your experience with ${match.preview.occupation}.`,
        `What's been the highlight of your year so far?`,
        `I'm curious - what's something you're passionate about that might surprise people?`
      );
    }

    return starters.slice(0, 3); // Return top 3
  }

  generateCompatibilityInsight(match) {
    const insights = [];

    if (match.harmonyScore > 0.8) {
      insights.push('Exceptionally high compatibility');
    } else if (match.harmonyScore > 0.6) {
      insights.push('Strong compatibility potential');
    }

    if (match.clusterCompatibility) {
      insights.push('Great psychological match');
    }

    if (match.attractionFactors && match.attractionFactors.length > 2) {
      insights.push(`${match.attractionFactors.length} strong connection points`);
    }

    return insights.join(' • ') || 'Interesting potential match';
  }

  generateRecommendationReason(match, userProfile) {
    if (match.attractionFactors && match.attractionFactors.length > 0) {
      const topFactor = match.attractionFactors[0];
      return `Recommended because: ${topFactor.description}`;
    }

    if (match.clusterCompatibility) {
      return 'Recommended because: Strong psychological compatibility';
    }

    return 'Recommended because: Good overall compatibility';
  }

  // Update user profile after chat interactions
  async updateUserFromConversation(userId, conversationData) {
    try {
      // Analyze conversation for personality insights
      const insights = await this.analyzeConversationForInsights(conversationData);

      // Update user profile
      if (insights.personalityUpdates) {
        await this.updateUserPersonalityProfile(userId, insights.personalityUpdates);
      }

      // Re-index in discovery system
      const updatedProfile = await this.getUserProfile(userId);
      await this.ensureUserInDiscoverySystem(userId, updatedProfile);

      console.log(`✅ Updated user ${userId} from conversation insights`);

    } catch (error) {
      console.error('❌ Error updating user from conversation:', error);
      PrometheusMetrics.recordError('matchmaking', 'conversation_update_failed', 'low');
    }
  }

  // Analytics and monitoring
  async getSystemHealth() {
    return {
      matchmakingService: {
        initialized: this.isInitialized,
        fallbackMode: this.fallbackToOriginal
      },
      discoveryService: await EnhancedDiscoveryService.getSystemHealth(),
      psychologicalClusters: PsychologicalClusteringEngine.getClusterStats(),
      metrics: PrometheusMetrics.getHealthMetrics()
    };
  }

  async getMatchmakingAnalytics() {
    return {
      systemHealth: await this.getSystemHealth(),
      recentMetrics: PrometheusMetrics.getMetrics(),
      clusterDistribution: PsychologicalClusteringEngine.getClusterStats()
    };
  }

  // Development and testing utilities
  async runSystemTest() {
    console.log('🧪 Running Tinder-inspired system test...');

    try {
      // Test user profile
      const testProfile = {
        userId: 'test_user_001',
        age: 28,
        interests: ['technology', 'art', 'travel'],
        occupation: 'designer',
        personalityType: 'ENFP',
        bio: 'Creative technologist who loves exploring new places and ideas'
      };

      // Test matchmaking pipeline
      const result = await this.findMatches('test_user_001', testProfile, { limit: 3 });

      console.log('🎯 System test results:');
      console.log(`- Matches found: ${result.matches.length}`);
      console.log(`- Processing time: ${result.processingTime}ms`);
      console.log(`- System used: ${result.systemUsed}`);
      console.log(`- Fallback mode: ${this.fallbackToOriginal}`);

      if (result.matches.length > 0) {
        console.log('- Sample match:', JSON.stringify(result.matches[0], null, 2));
      }

      return { success: true, results: result };

    } catch (error) {
      console.error('❌ System test failed:', error);
      return { success: false, error: error.message };
    }
  }

  // Utility methods
  async getUserProfile(userId) {
    // This would fetch from your user database
    // For now, return mock data
    return {
      userId,
      age: 28,
      interests: ['technology', 'art'],
      occupation: 'designer',
      personalityType: 'ENFP'
    };
  }

  async analyzeConversationForInsights(conversationData) {
    // This would use AI to analyze conversation patterns
    // Return mock insights for now
    return {
      personalityUpdates: {
        communicationStyle: 'warm',
        topicsOfInterest: conversationData.topics || []
      }
    };
  }

  async updateUserPersonalityProfile(userId, updates) {
    console.log(`📝 Would update personality profile for ${userId}:`, updates);
  }
}

export default new TinderInspiredMatchmakingService();