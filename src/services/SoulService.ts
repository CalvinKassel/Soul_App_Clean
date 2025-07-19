// Soul Service - Main orchestration layer for the advanced hybrid matchmaking system
// Integrates all Soul components: Core, Interaction Engine, and Math Engine

import AsyncStorage from '@react-native-async-storage/async-storage';
import {
  SoulUserProfile,
  SoulCompatibilityScore,
  SoulMatchingResult,
  SoulMatch,
  SoulMatchingOptions,
  SoulInteractionSignal,
  GuessWhoSession,
  SoulConfig,
  SoulSystemStatus,
  SoulError,
  SoulErrorType,
  FactualProfile,
  PartnerPreferences,
  PersonalityInsights,
  ConnectionPotential
} from '../types/SoulTypes';
import { HarmonyUserProfile, GeneratedQuestion, InferencePhase } from '../types/HarmonyTypes';
import { SoulCore } from './SoulCore';
import SoulInteractionEngine from './SoulInteractionEngine';
import SoulMathEngine from './SoulMathEngine';
import { getArchetypeFromHue } from './HarmonyCore';
import HarmonyService from './HarmonyService';

/**
 * Soul Service - Main Integration Layer
 * 
 * The Soul Service orchestrates the advanced hybrid matchmaking system by:
 * 1. Managing user profiles that combine HHC personality with factual data
 * 2. Facilitating "Guess Who" learning interactions
 * 3. Performing sophisticated compatibility calculations
 * 4. Providing comprehensive matching results with insights
 * 5. Continuously learning and adapting to user preferences
 */
export class SoulService {
  private static instance: SoulService;
  private soulCore: SoulCore;
  private interactionEngine: SoulInteractionEngine;
  private mathEngine: SoulMathEngine;
  private harmonyService: any;
  private config: SoulConfig;
  private initialized = false;

  // Performance metrics
  private performanceMetrics = {
    matchingTime: [] as number[],
    questionGenerationTime: [] as number[],
    learningUpdateTime: [] as number[],
    cacheHitRate: 0
  };

  private constructor() {
    this.config = this.getDefaultConfig();
    this.soulCore = SoulCore.getInstance();
    this.interactionEngine = new SoulInteractionEngine(this.config);
    this.mathEngine = new SoulMathEngine({
      hhcWeight: this.config.weights.hhcWeight,
      factualWeight: this.config.weights.factualWeight,
      distanceMetric: 'euclidean',
      normalizationMethod: 'minmax'
    });
    this.harmonyService = HarmonyService;
  }

  /**
   * Get singleton instance
   */
  static getInstance(): SoulService {
    if (!SoulService.instance) {
      SoulService.instance = new SoulService();
    }
    return SoulService.instance;
  }

  /**
   * Initialize the Soul Service
   */
  async initialize(): Promise<void> {
    if (this.initialized) return;

    try {
      // Initialize all components
      await this.soulCore.initialize();
      await this.harmonyService.getInstance().initialize();
      
      this.initialized = true;
      console.log('Soul Service initialized successfully');
    } catch (error) {
      throw new SoulError(
        SoulErrorType.CONFIGURATION_ERROR,
        'Failed to initialize Soul Service',
        error
      );
    }
  }

  /**
   * Create a comprehensive Soul profile
   * Combines HHC personality analysis with explicit factual data
   */
  async createSoulProfile(
    userId: string,
    factualProfile: FactualProfile,
    partnerPreferences: PartnerPreferences,
    initialConversation: any[] = []
  ): Promise<SoulUserProfile> {
    if (!this.initialized) {
      await this.initialize();
    }

    try {
      // Create or get HHC profile through Harmony Service
      let hhcProfile = await this.harmonyService.getInstance().getUserProfile(userId);
      
      if (!hhcProfile) {
        // Create HHC profile from initial conversation
        hhcProfile = await this.harmonyService.getInstance().createUserProfile(userId, initialConversation);
      }

      // Create comprehensive Soul profile
      const soulProfile = await this.soulCore.createSoulProfile(
        userId,
        hhcProfile,
        factualProfile,
        partnerPreferences
      );

      return soulProfile;
    } catch (error) {
      throw new SoulError(
        SoulErrorType.PROFILE_NOT_FOUND,
        'Failed to create Soul profile',
        error
      );
    }
  }

  /**
   * Update Soul profile with new conversation data
   */
  async updateSoulProfile(
    userId: string,
    newConversation: any[] = [],
    factualUpdates: Partial<FactualProfile> = {},
    preferenceUpdates: Partial<PartnerPreferences> = {}
  ): Promise<SoulUserProfile> {
    if (!this.initialized) {
      await this.initialize();
    }

    try {
      // Update HHC profile with new conversation
      if (newConversation.length > 0) {
        await this.harmonyService.getInstance().updateUserProfile(userId, newConversation);
      }

      // Get updated Soul profile
      const soulProfile = await this.soulCore.getUserProfile(userId);
      if (!soulProfile) {
        throw new SoulError(
          SoulErrorType.PROFILE_NOT_FOUND,
          'Soul profile not found'
        );
      }

      // Update factual profile
      if (Object.keys(factualUpdates).length > 0) {
        Object.assign(soulProfile.factualProfile, factualUpdates);
      }

      // Update partner preferences
      if (Object.keys(preferenceUpdates).length > 0) {
        Object.assign(soulProfile.partnerPreferences, preferenceUpdates);
      }

      // Update metadata
      soulProfile.metadata.lastUpdated = new Date().toISOString();
      
      return soulProfile;
    } catch (error) {
      throw new SoulError(
        SoulErrorType.INSUFFICIENT_DATA,
        'Failed to update Soul profile',
        error
      );
    }
  }

  /**
   * Start a "Guess Who" learning session
   */
  async startGuessWhoSession(
    userId: string,
    candidateId: string
  ): Promise<GuessWhoSession> {
    if (!this.initialized) {
      await this.initialize();
    }

    const userProfile = await this.soulCore.getUserProfile(userId);
    if (!userProfile) {
      throw new SoulError(
        SoulErrorType.PROFILE_NOT_FOUND,
        'User profile not found'
      );
    }

    try {
      const session = await this.interactionEngine.startGuessWhoSession(
        userId,
        candidateId,
        userProfile
      );

      return session;
    } catch (error) {
      throw new SoulError(
        SoulErrorType.INTERACTION_FAILED,
        'Failed to start Guess Who session',
        error
      );
    }
  }

  /**
   * Generate next question for Guess Who session
   */
  async generateNextQuestion(
    userId: string,
    candidateId: string
  ): Promise<GeneratedQuestion> {
    if (!this.initialized) {
      await this.initialize();
    }

    const startTime = Date.now();

    try {
      const userProfile = await this.soulCore.getUserProfile(userId);
      if (!userProfile) {
        throw new SoulError(
          SoulErrorType.PROFILE_NOT_FOUND,
          'User profile not found'
        );
      }

      const session = this.interactionEngine.getActiveSession(userId, candidateId);
      if (!session) {
        throw new SoulError(
          SoulErrorType.INTERACTION_FAILED,
          'No active session found'
        );
      }

      const question = await this.interactionEngine.generateAdaptiveQuestion(
        userProfile,
        candidateId,
        session
      );

      // Convert to expected format
      const generatedQuestion: GeneratedQuestion = {
        question: question.question,
        targetParameters: [question.attributeTarget],
        expectedResponses: ['positive', 'negative', 'neutral'],
        questionType: 'preference',
        priority: 0.8,
        followUp: `How important is ${question.attributeTarget} to you?`
      };

      // Record performance
      this.performanceMetrics.questionGenerationTime.push(Date.now() - startTime);

      return generatedQuestion;
    } catch (error) {
      throw new SoulError(
        SoulErrorType.INTERACTION_FAILED,
        'Failed to generate next question',
        error
      );
    }
  }

  /**
   * Process user response to a Guess Who question
   */
  async processGuessWhoResponse(
    userId: string,
    sessionId: string,
    questionId: string,
    response: string,
    reaction: 'positive' | 'negative' | 'neutral'
  ): Promise<SoulInteractionSignal> {
    if (!this.initialized) {
      await this.initialize();
    }

    const startTime = Date.now();

    try {
      const userProfile = await this.soulCore.getUserProfile(userId);
      if (!userProfile) {
        throw new SoulError(
          SoulErrorType.PROFILE_NOT_FOUND,
          'User profile not found'
        );
      }

      const signal = await this.interactionEngine.processUserResponse(
        sessionId,
        questionId,
        response,
        reaction,
        userProfile
      );

      // Record performance
      this.performanceMetrics.learningUpdateTime.push(Date.now() - startTime);

      return signal;
    } catch (error) {
      throw new SoulError(
        SoulErrorType.LEARNING_FAILED,
        'Failed to process user response',
        error
      );
    }
  }

  /**
   * Find Soul matches using advanced hybrid compatibility
   */
  async findSoulMatches(
    userId: string,
    options: Partial<SoulMatchingOptions> = {}
  ): Promise<SoulMatchingResult> {
    if (!this.initialized) {
      await this.initialize();
    }

    const startTime = Date.now();

    try {
      const userProfile = await this.soulCore.getUserProfile(userId);
      if (!userProfile) {
        throw new SoulError(
          SoulErrorType.PROFILE_NOT_FOUND,
          'User profile not found'
        );
      }

      // Get all potential candidates
      const candidates = await this.getAllCandidates(userId);
      
      // Calculate compatibility scores for all candidates
      const scoredMatches = await Promise.all(
        candidates.map(async (candidate) => {
          const compatibility = this.mathEngine.calculateTotalCompatibility(
            userProfile,
            candidate
          );

          const connectionPotential = this.mathEngine.calculateConnectionPotential(
            userProfile,
            candidate,
            compatibility
          );

          const personalityInsights = this.generatePersonalityInsights(
            userProfile,
            candidate,
            compatibility
          );

          const suggestedStarters = this.generateConversationStarters(
            userProfile,
            candidate,
            compatibility
          );

          return {
            candidate,
            compatibility,
            soulFitScore: compatibility.totalScore,
            personalityInsights,
            connectionPotential,
            suggestedConversationStarters: suggestedStarters
          };
        })
      );

      // Apply filters and sorting
      const filteredMatches = this.applyMatchingFilters(scoredMatches, options);
      const sortedMatches = this.sortMatches(filteredMatches, options);
      
      // Limit results
      const maxResults = options.maxResults || 50;
      const finalMatches = sortedMatches.slice(0, maxResults);

      // Generate system insights
      const systemInsights = this.generateSystemInsights(finalMatches, userProfile);

      // Record performance
      this.performanceMetrics.matchingTime.push(Date.now() - startTime);

      return {
        totalMatches: finalMatches.length,
        matches: finalMatches,
        searchCriteria: {
          minCompatibility: options.minCompatibility || 0.6,
          maxResults,
          hhcWeight: this.config.weights.hhcWeight,
          factualWeight: this.config.weights.factualWeight,
          searchRadius: options.searchRadius,
          preferredArchetypes: options.preferredArchetypes,
          excludedArchetypes: options.excludedArchetypes
        },
        systemInsights
      };
    } catch (error) {
      throw new SoulError(
        SoulErrorType.MATCHING_FAILED,
        'Failed to find Soul matches',
        error
      );
    }
  }

  /**
   * Get comprehensive profile analysis
   */
  async getSoulProfileAnalysis(userId: string): Promise<{
    soulProfile: SoulUserProfile;
    harmonyAnalysis: any;
    learningInsights: any;
    matchingPotential: any;
  }> {
    if (!this.initialized) {
      await this.initialize();
    }

    const soulProfile = await this.soulCore.getUserProfile(userId);
    if (!soulProfile) {
      throw new SoulError(
        SoulErrorType.PROFILE_NOT_FOUND,
        'Soul profile not found'
      );
    }

    const harmonyAnalysis = await this.harmonyService.getInstance().getProfileAnalysis(userId);
    
    const learningInsights = this.generateLearningInsights(soulProfile);
    const matchingPotential = this.generateMatchingPotential(soulProfile);

    return {
      soulProfile,
      harmonyAnalysis,
      learningInsights,
      matchingPotential
    };
  }

  /**
   * Get system status and performance metrics
   */
  async getSystemStatus(): Promise<SoulSystemStatus> {
    if (!this.initialized) {
      await this.initialize();
    }

    // Get basic stats from core components
    const harmonyStats = await this.harmonyService.getInstance().getSystemStats();
    const interactionStats = this.interactionEngine.getSessionStatistics();

    return {
      isInitialized: this.initialized,
      totalUsers: harmonyStats.totalProfiles,
      totalInteractions: interactionStats.totalQuestions,
      averageLearningProgress: harmonyStats.averageConfidence,
      systemHealth: this.calculateSystemHealth(),
      performanceMetrics: {
        averageMatchingTime: this.calculateAverageTime(this.performanceMetrics.matchingTime),
        averageQuestionGenerationTime: this.calculateAverageTime(this.performanceMetrics.questionGenerationTime),
        cacheHitRate: this.performanceMetrics.cacheHitRate,
        learningAccuracy: this.calculateLearningAccuracy()
      }
    };
  }

  /**
   * Update system configuration
   */
  async updateConfiguration(newConfig: Partial<SoulConfig>): Promise<void> {
    this.config = { ...this.config, ...newConfig };
    
    // Update component configurations
    this.mathEngine = new SoulMathEngine({
      hhcWeight: this.config.weights.hhcWeight,
      factualWeight: this.config.weights.factualWeight,
      distanceMetric: 'euclidean',
      normalizationMethod: 'minmax'
    });

    // Save configuration
    await AsyncStorage.setItem('soul_config', JSON.stringify(this.config));
  }

  // Private helper methods

  private async getAllCandidates(excludeUserId: string): Promise<SoulUserProfile[]> {
    // This would typically query a database
    // For now, we'll use the core's getUserProfiles method when available
    // This is a placeholder implementation
    return [];
  }

  private applyMatchingFilters(
    matches: SoulMatch[],
    options: Partial<SoulMatchingOptions>
  ): SoulMatch[] {
    let filtered = matches;

    // Apply minimum compatibility filter
    if (options.minCompatibility) {
      filtered = filtered.filter(match => 
        match.compatibility.totalScore >= options.minCompatibility!
      );
    }

    // Apply archetype filters
    if (options.preferredArchetypes && options.preferredArchetypes.length > 0) {
      filtered = filtered.filter(match => {
        const archetype = getArchetypeFromHue(match.candidate.hhcProfile.rawDimensions.hue);
        return options.preferredArchetypes!.includes(archetype.name);
      });
    }

    if (options.excludedArchetypes && options.excludedArchetypes.length > 0) {
      filtered = filtered.filter(match => {
        const archetype = getArchetypeFromHue(match.candidate.hhcProfile.rawDimensions.hue);
        return !options.excludedArchetypes!.includes(archetype.name);
      });
    }

    return filtered;
  }

  private sortMatches(
    matches: SoulMatch[],
    options: Partial<SoulMatchingOptions>
  ): SoulMatch[] {
    return matches.sort((a, b) => {
      // Primary sort by total compatibility
      if (a.compatibility.totalScore !== b.compatibility.totalScore) {
        return b.compatibility.totalScore - a.compatibility.totalScore;
      }

      // Secondary sort by connection potential
      const aConnection = (a.connectionPotential.shortTermCompatibility + 
                          a.connectionPotential.longTermCompatibility) / 2;
      const bConnection = (b.connectionPotential.shortTermCompatibility + 
                          b.connectionPotential.longTermCompatibility) / 2;
      
      return bConnection - aConnection;
    });
  }

  private generatePersonalityInsights(
    userProfile: SoulUserProfile,
    candidateProfile: SoulUserProfile,
    compatibility: SoulCompatibilityScore
  ): PersonalityInsights {
    const userArchetype = getArchetypeFromHue(userProfile.hhcProfile.rawDimensions.hue);
    const candidateArchetype = getArchetypeFromHue(candidateProfile.hhcProfile.rawDimensions.hue);

    return {
      complementaryTraits: this.identifyComplementaryTraits(userArchetype, candidateArchetype),
      sharedStrengths: this.identifySharedStrengths(userArchetype, candidateArchetype),
      potentialChallenges: this.identifyPotentialChallenges(userArchetype, candidateArchetype),
      growthOpportunities: this.identifyGrowthOpportunities(userArchetype, candidateArchetype),
      communicationStyle: this.predictCommunicationStyle(userArchetype, candidateArchetype),
      conflictStyle: this.predictConflictStyle(userArchetype, candidateArchetype)
    };
  }

  private generateConversationStarters(
    userProfile: SoulUserProfile,
    candidateProfile: SoulUserProfile,
    compatibility: SoulCompatibilityScore
  ): string[] {
    const starters: string[] = [];

    // Based on shared interests
    const sharedInterests = this.findSharedInterests(userProfile, candidateProfile);
    if (sharedInterests.length > 0) {
      starters.push(`I noticed you're into ${sharedInterests[0]} - what got you started with that?`);
    }

    // Based on personality insights
    const userArchetype = getArchetypeFromHue(userProfile.hhcProfile.rawDimensions.hue);
    const candidateArchetype = getArchetypeFromHue(candidateProfile.hhcProfile.rawDimensions.hue);
    
    starters.push(this.generateArchetypeBasedStarter(userArchetype, candidateArchetype));

    // Based on compatibility strengths
    if (compatibility.breakdown.personalityAlignment > 0.8) {
      starters.push("We seem to have a really similar outlook on life - what's been shaping your perspective lately?");
    }

    return starters.slice(0, 3);
  }

  private generateSystemInsights(
    matches: SoulMatch[],
    userProfile: SoulUserProfile
  ): any {
    const totalMatches = matches.length;
    const averageCompatibility = totalMatches > 0 
      ? matches.reduce((sum, match) => sum + match.compatibility.totalScore, 0) / totalMatches
      : 0;

    const archetypeDistribution = this.calculateArchetypeDistribution(matches);
    const personalityDiversityScore = this.calculatePersonalityDiversity(matches);

    return {
      averageCompatibility,
      topArchetypeMatches: Object.keys(archetypeDistribution).slice(0, 3),
      personalityDiversityScore,
      factsVsPersonalityBalance: this.calculateFactsVsPersonalityBalance(matches),
      learningRecommendations: this.generateLearningRecommendations(userProfile, matches)
    };
  }

  private generateLearningInsights(profile: SoulUserProfile): any {
    const totalInteractions = profile.learningHistory.totalInteractions;
    const attributeExploration = Array.from(profile.learningHistory.attributeQuestions.entries());
    const recentSignals = profile.learningHistory.preferenceSignals.slice(-10);

    return {
      explorationProgress: Math.min(1, totalInteractions / 50),
      mostExploredAttributes: attributeExploration
        .sort(([, a], [, b]) => b - a)
        .slice(0, 5)
        .map(([attr, count]) => ({ attribute: attr, count })),
      recentLearningTrends: this.analyzeRecentLearningTrends(recentSignals),
      confidenceGrowth: this.calculateConfidenceGrowth(profile),
      learningMilestones: profile.learningHistory.learningMilestones.length
    };
  }

  private generateMatchingPotential(profile: SoulUserProfile): any {
    const profileCompleteness = profile.metadata.profileCompleteness;
    const learningDepth = Math.min(1, profile.learningHistory.totalInteractions / 50);
    const weightStabilization = this.calculateWeightStabilization(profile);

    return {
      overallReadiness: (profileCompleteness + learningDepth + weightStabilization) / 3,
      profileCompleteness,
      learningDepth,
      weightStabilization,
      recommendedNextSteps: this.generateRecommendedNextSteps(profile)
    };
  }

  private getDefaultConfig(): SoulConfig {
    return {
      weights: {
        hhcWeight: 0.6,
        factualWeight: 0.4
      },
      learning: {
        learningRate: 0.1,
        attractionDecay: 0.95,
        repulsionDecay: 0.9,
        confidenceThreshold: 0.3,
        maxInteractionsPerSession: 10,
        weightStabilizationThreshold: 0.05
      },
      matching: {
        minCompatibility: 0.6,
        maxCandidates: 1000,
        diversityBonus: 0.1,
        distanceWeightDecay: 0.1
      },
      guessWho: {
        maxQuestionsPerSession: 5,
        sessionTimeoutMinutes: 30,
        adaptiveQuestionGeneration: true,
        personalizedQuestionTemplates: true
      }
    };
  }

  // Additional helper methods (implementations would be expanded in full system)

  private identifyComplementaryTraits(archetype1: any, archetype2: any): string[] {
    // Placeholder implementation
    return ['Analytical thinking complements creative intuition'];
  }

  private identifySharedStrengths(archetype1: any, archetype2: any): string[] {
    return ['Empathy', 'Communication'];
  }

  private identifyPotentialChallenges(archetype1: any, archetype2: any): string[] {
    return ['Different decision-making styles'];
  }

  private identifyGrowthOpportunities(archetype1: any, archetype2: any): string[] {
    return ['Learning from different perspectives'];
  }

  private predictCommunicationStyle(archetype1: any, archetype2: any): string {
    return 'Direct and empathetic';
  }

  private predictConflictStyle(archetype1: any, archetype2: any): string {
    return 'Collaborative problem-solving';
  }

  private findSharedInterests(profile1: SoulUserProfile, profile2: SoulUserProfile): string[] {
    const interests1 = new Set(profile1.factualProfile.interests || []);
    const interests2 = new Set(profile2.factualProfile.interests || []);
    return Array.from(new Set([...interests1].filter(x => interests2.has(x))));
  }

  private generateArchetypeBasedStarter(archetype1: any, archetype2: any): string {
    return "What's been inspiring you lately?";
  }

  private calculateArchetypeDistribution(matches: SoulMatch[]): Record<string, number> {
    const distribution: Record<string, number> = {};
    matches.forEach(match => {
      const archetype = getArchetypeFromHue(match.candidate.hhcProfile.rawDimensions.hue);
      distribution[archetype.name] = (distribution[archetype.name] || 0) + 1;
    });
    return distribution;
  }

  private calculatePersonalityDiversity(matches: SoulMatch[]): number {
    const archetypes = new Set(matches.map(match => 
      getArchetypeFromHue(match.candidate.hhcProfile.rawDimensions.hue).name
    ));
    return archetypes.size / 8; // Normalize by max possible archetypes
  }

  private calculateFactsVsPersonalityBalance(matches: SoulMatch[]): number {
    const avgHHCScore = matches.reduce((sum, match) => sum + match.compatibility.hhcScore, 0) / matches.length;
    const avgFactualScore = matches.reduce((sum, match) => sum + match.compatibility.factualScore, 0) / matches.length;
    return avgHHCScore / (avgHHCScore + avgFactualScore);
  }

  private generateLearningRecommendations(profile: SoulUserProfile, matches: SoulMatch[]): string[] {
    const recommendations: string[] = [];
    
    if (profile.learningHistory.totalInteractions < 20) {
      recommendations.push('Continue exploring preferences through more interactions');
    }
    
    if (profile.metadata.profileCompleteness < 0.8) {
      recommendations.push('Complete more profile sections for better matches');
    }
    
    return recommendations;
  }

  private analyzeRecentLearningTrends(signals: any[]): any {
    return {
      dominantTrend: 'increasing_preference_clarity',
      trendStrength: 0.7
    };
  }

  private calculateConfidenceGrowth(profile: SoulUserProfile): number {
    return Math.min(1, profile.learningHistory.totalInteractions / 100);
  }

  private calculateWeightStabilization(profile: SoulUserProfile): number {
    const weights = Object.values(profile.dynamicPreferenceWeights);
    const variance = this.calculateVariance(weights);
    return Math.max(0, 1 - variance);
  }

  private generateRecommendedNextSteps(profile: SoulUserProfile): string[] {
    const steps: string[] = [];
    
    if (profile.learningHistory.totalInteractions < 10) {
      steps.push('Engage in more "Guess Who" sessions to refine preferences');
    }
    
    if (profile.metadata.profileCompleteness < 0.7) {
      steps.push('Complete additional profile sections');
    }
    
    return steps;
  }

  private calculateSystemHealth(): 'excellent' | 'good' | 'fair' | 'poor' {
    // Placeholder implementation
    return 'excellent';
  }

  private calculateAverageTime(times: number[]): number {
    return times.length > 0 ? times.reduce((sum, time) => sum + time, 0) / times.length : 0;
  }

  private calculateLearningAccuracy(): number {
    return 0.85; // Placeholder
  }

  private calculateVariance(values: number[]): number {
    const mean = values.reduce((sum, val) => sum + val, 0) / values.length;
    return values.reduce((sum, val) => sum + Math.pow(val - mean, 2), 0) / values.length;
  }
}

// Export singleton instance
export default SoulService.getInstance();