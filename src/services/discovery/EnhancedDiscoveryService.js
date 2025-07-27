// SoulAI Enhanced Discovery Service
// Combines Elasticsearch pre-filtering with Psychological Clustering and Harmony Algorithm

import ElasticsearchDiscoveryEngine from './ElasticsearchDiscoveryEngine.js';
import PsychologicalClusteringEngine from './PsychologicalClusteringEngine.js';
import HarmonyAlgorithm from '../compatibility/HarmonyAlgorithm.js';
import HHCPersonalitySystem from '../compatibility/HHCPersonalitySystem.js';

class EnhancedDiscoveryService {
  constructor() {
    this.isInitialized = false;
    this.metrics = {
      searchesPerformed: 0,
      candidatesPreFiltered: 0,
      harmonyCalculations: 0,
      averageSearchTime: 0
    };
  }

  async initialize() {
    try {
      console.log('🚀 Initializing Enhanced Discovery Service...');
      
      // Initialize all subsystems
      await Promise.all([
        ElasticsearchDiscoveryEngine.initialize(),
        PsychologicalClusteringEngine.initialize(),
        HarmonyAlgorithm.initialize()
      ]);

      this.isInitialized = true;
      console.log('✅ Enhanced Discovery Service ready');
      
      return { success: true };
    } catch (error) {
      console.error('❌ Failed to initialize Enhanced Discovery Service:', error);
      return { success: false, error: error.message };
    }
  }

  // Main discovery pipeline: Elasticsearch → Clustering → Harmony Algorithm
  async findMatches(userProfile, preferences = {}) {
    const startTime = Date.now();
    
    try {
      console.log(`🔍 Starting match discovery for user ${userProfile.userId}`);

      // Step 1: Elasticsearch Pre-filtering
      const candidates = await this.preFilterCandidates(userProfile, preferences);
      console.log(`📊 Pre-filtered to ${candidates.length} candidates`);

      if (candidates.length === 0) {
        return { matches: [], metrics: this.getDiscoveryMetrics(startTime) };
      }

      // Step 2: Psychological Clustering Enhancement
      const clusteredCandidates = await this.enhanceWithPsychologicalClustering(
        userProfile, 
        candidates
      );

      // Step 3: Harmony Algorithm Scoring
      const scoredMatches = await this.calculateHarmonyScores(
        userProfile, 
        clusteredCandidates
      );

      // Step 4: Rank and Return Best Matches
      const finalMatches = this.rankAndFilterMatches(scoredMatches, preferences.limit || 10);

      const searchTime = Date.now() - startTime;
      console.log(`✅ Discovery complete in ${searchTime}ms, found ${finalMatches.length} matches`);

      this.updateMetrics(candidates.length, finalMatches.length, searchTime);

      return {
        matches: finalMatches,
        metrics: this.getDiscoveryMetrics(startTime),
        searchTime
      };

    } catch (error) {
      console.error('❌ Discovery pipeline error:', error);
      return {
        matches: [],
        error: error.message,
        metrics: this.getDiscoveryMetrics(startTime)
      };
    }
  }

  // Step 1: Elasticsearch pre-filtering
  async preFilterCandidates(userProfile, preferences) {
    const filters = {
      ageMin: preferences.ageMin || Math.max(18, userProfile.age - 10),
      ageMax: preferences.ageMax || Math.min(99, userProfile.age + 10),
      maxDistance: preferences.maxDistance || 50, // 50km default
      interests: preferences.mustHaveInterests || [],
      occupation: preferences.preferredOccupation,
      relationshipGoals: preferences.relationshipGoals || ['serious_relationship', 'casual_dating']
    };

    const candidates = await ElasticsearchDiscoveryEngine.findCandidates(userProfile, filters);
    this.metrics.candidatesPreFiltered += candidates.length;

    return candidates;
  }

  // Step 2: Enhance with psychological clustering
  async enhanceWithPsychologicalClustering(userProfile, candidates) {
    // Get user's psychological cluster
    const userCluster = userProfile.hhcCluster || 
      PsychologicalClusteringEngine.getUserCluster(userProfile.userId)?.id;

    if (!userCluster) {
      console.log('⚠️ User cluster unknown, using basic filtering');
      return candidates;
    }

    // Get compatible clusters
    const compatibleClusters = PsychologicalClusteringEngine.getCompatibleClusters(userCluster);
    console.log(`🧠 User cluster: ${userCluster}, compatible: ${compatibleClusters.join(', ')}`);

    // Prioritize candidates from compatible clusters
    const enhancedCandidates = candidates.map(candidate => ({
      ...candidate,
      clusterCompatibility: compatibleClusters.includes(candidate.hhcCluster) ? 1.0 : 0.7,
      isFromCompatibleCluster: compatibleClusters.includes(candidate.hhcCluster)
    }));

    // Sort by cluster compatibility first
    return enhancedCandidates.sort((a, b) => b.clusterCompatibility - a.clusterCompatibility);
  }

  // Step 3: Calculate Harmony Algorithm scores
  async calculateHarmonyScores(userProfile, candidates) {
    const scoredMatches = [];

    // Generate user's HHC vector if not exists
    if (!userProfile.hhcVector) {
      userProfile.hhcVector = await HHCPersonalitySystem.generateVector(userProfile);
    }

    for (const candidate of candidates) {
      try {
        // Generate candidate's HHC vector if needed
        if (!candidate.hhcVector) {
          candidate.hhcVector = await HHCPersonalitySystem.generateVector(candidate);
        }

        // Calculate Harmony Score
        const harmonyResult = await HarmonyAlgorithm.calculateHarmony(
          userProfile.hhcVector,
          candidate.hhcVector,
          userProfile,
          candidate
        );

        scoredMatches.push({
          ...candidate,
          harmonyScore: harmonyResult.score,
          harmonyDetails: harmonyResult.details,
          attractionForces: harmonyResult.attractionForces,
          repulsionForces: harmonyResult.repulsionForces,
          // Boost score for cluster compatibility
          finalScore: harmonyResult.score * candidate.clusterCompatibility
        });

        this.metrics.harmonyCalculations++;

      } catch (error) {
        console.error(`❌ Error calculating harmony for candidate ${candidate.userId}:`, error);
        // Include candidate with lower score if harmony calculation fails
        scoredMatches.push({
          ...candidate,
          harmonyScore: 0.5,
          finalScore: 0.5 * candidate.clusterCompatibility,
          error: 'Harmony calculation failed'
        });
      }
    }

    return scoredMatches;
  }

  // Step 4: Rank and filter final matches
  rankAndFilterMatches(scoredMatches, limit) {
    // Sort by final score (harmony + cluster compatibility)
    const ranked = scoredMatches.sort((a, b) => b.finalScore - a.finalScore);

    // Filter out very low scores
    const filtered = ranked.filter(match => match.finalScore > 0.3);

    // Return top matches
    const final = filtered.slice(0, limit);

    return final.map(match => ({
      userId: match.userId,
      harmonyScore: match.harmonyScore,
      finalScore: match.finalScore,
      clusterCompatibility: match.isFromCompatibleCluster,
      attractionFactors: this.extractAttractionFactors(match),
      preview: {
        age: match.age,
        interests: match.interests?.slice(0, 3) || [],
        occupation: match.occupation,
        personalityType: match.personalityType,
        location: match.location
      }
    }));
  }

  extractAttractionFactors(match) {
    const factors = [];
    
    if (match.attractionForces) {
      Object.entries(match.attractionForces).forEach(([factor, strength]) => {
        if (strength > 0.7) {
          factors.push({
            factor,
            strength,
            description: this.getFactorDescription(factor)
          });
        }
      });
    }

    if (match.isFromCompatibleCluster) {
      factors.push({
        factor: 'psychological_compatibility',
        strength: match.clusterCompatibility,
        description: 'Strong psychological compatibility'
      });
    }

    return factors.slice(0, 3); // Top 3 factors
  }

  getFactorDescription(factor) {
    const descriptions = {
      'personality_similarity': 'Similar personality traits',
      'values_alignment': 'Shared core values',
      'interests_overlap': 'Common interests',
      'communication_style': 'Compatible communication styles',
      'lifestyle_compatibility': 'Similar lifestyle preferences',
      'emotional_intelligence': 'Emotional compatibility'
    };

    return descriptions[factor] || factor.replace('_', ' ');
  }

  // Update user profile in discovery system
  async updateUserProfile(userProfile) {
    try {
      // Update in Elasticsearch
      await ElasticsearchDiscoveryEngine.indexUser(userProfile);

      // Update psychological clustering
      if (userProfile.hhcVector) {
        const clusterId = PsychologicalClusteringEngine.assignUserToCluster(
          userProfile.userId,
          userProfile.hhcVector
        );
        userProfile.hhcCluster = clusterId;
      }

      console.log(`✅ Updated discovery profile for user ${userProfile.userId}`);
      return { success: true };

    } catch (error) {
      console.error('❌ Failed to update user profile:', error);
      return { success: false, error: error.message };
    }
  }

  // Analytics and monitoring
  updateMetrics(candidatesFound, finalMatches, searchTime) {
    this.metrics.searchesPerformed++;
    this.metrics.averageSearchTime = 
      (this.metrics.averageSearchTime * (this.metrics.searchesPerformed - 1) + searchTime) / 
      this.metrics.searchesPerformed;
  }

  getDiscoveryMetrics(startTime) {
    return {
      searchesPerformed: this.metrics.searchesPerformed,
      candidatesPreFiltered: this.metrics.candidatesPreFiltered,
      harmonyCalculations: this.metrics.harmonyCalculations,
      averageSearchTime: Math.round(this.metrics.averageSearchTime),
      currentSearchTime: Date.now() - startTime
    };
  }

  // Health checks for monitoring
  async getSystemHealth() {
    const health = {
      discoveryService: { status: this.isInitialized ? 'healthy' : 'initializing' },
      elasticsearch: await ElasticsearchDiscoveryEngine.getHealth(),
      psychologicalClustering: { 
        status: 'healthy', 
        clusters: PsychologicalClusteringEngine.getClusterStats() 
      }
    };

    return health;
  }

  // Development utilities
  async runDiscoveryTest(userId) {
    console.log('🧪 Running discovery test...');
    
    const testProfile = {
      userId,
      age: 28,
      interests: ['technology', 'art', 'travel'],
      occupation: 'designer',
      personalityType: 'ENFP',
      relationshipGoals: ['serious_relationship'],
      location: { latitude: 40.7128, longitude: -74.0060 } // NYC
    };

    const results = await this.findMatches(testProfile, { limit: 5 });
    console.log('🎯 Test results:', JSON.stringify(results, null, 2));
    
    return results;
  }
}

export default new EnhancedDiscoveryService();