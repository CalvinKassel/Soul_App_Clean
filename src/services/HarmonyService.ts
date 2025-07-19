// Harmony Service - Main Integration Layer
// Orchestrates all Harmony Algorithm components for the SoulAI application

import AsyncStorage from '@react-native-async-storage/async-storage';
import {
  HarmonyUserProfile,
  ConversationMessage,
  CompatibilityMatch,
  MatchingOptions,
  MatchingResult,
  GeneratedQuestion,
  InferencePhase,
  MatchType,
  HarmonyZone,
  HarmonyConfig,
  HarmonySystemStats,
  HarmonyError,
  HarmonyErrorType,
  ParameterData
} from '../types/HarmonyTypes';
import {
  generateHarmonySignature,
  hexCodeToDimensions,
  getArchetypeFromHue,
  generateSignatureDescription,
  calculateRarityScore,
  validateHexCode
} from './HarmonyCore';
import HarmonyInferenceEngine from './HarmonyInferenceEngine';
import HarmonyMatchingEngine from './HarmonyMatchingEngine';

/**
 * Main Harmony Service Class
 * Provides a unified interface for all Harmony Algorithm functionality
 */
export class HarmonyService {
  private static instance: HarmonyService;
  private inferenceEngine: HarmonyInferenceEngine;
  private matchingEngine: HarmonyMatchingEngine;
  private config: HarmonyConfig;
  private initialized = false;
  private userProfiles: Map<string, HarmonyUserProfile> = new Map();
  
  // Storage keys
  private static readonly STORAGE_KEYS = {
    USER_PROFILES: 'harmony_user_profiles',
    SYSTEM_CONFIG: 'harmony_system_config',
    CONVERSATION_HISTORY: 'harmony_conversation_history',
    MATCHING_CACHE: 'harmony_matching_cache'
  };

  private constructor() {
    this.config = this.getDefaultConfig();
    this.inferenceEngine = new HarmonyInferenceEngine();
    this.matchingEngine = new HarmonyMatchingEngine();
  }

  /**
   * Get singleton instance
   */
  static getInstance(): HarmonyService {
    if (!HarmonyService.instance) {
      HarmonyService.instance = new HarmonyService();
    }
    return HarmonyService.instance;
  }

  /**
   * Initialize the Harmony Service
   */
  async initialize(): Promise<void> {
    if (this.initialized) return;

    try {
      // Load saved configuration
      await this.loadConfiguration();
      
      // Initialize engines
      await this.inferenceEngine.initialize();
      await this.matchingEngine.initialize();
      
      // Load user profiles
      await this.loadUserProfiles();
      
      this.initialized = true;
      console.log('Harmony Service initialized successfully');
    } catch (error) {
      throw new HarmonyError(
        HarmonyErrorType.INFERENCE_FAILED,
        'Failed to initialize Harmony Service',
        error
      );
    }
  }

  /**
   * Create a new user profile
   */
  async createUserProfile(
    userId: string,
    initialConversation: ConversationMessage[] = []
  ): Promise<HarmonyUserProfile> {
    if (!this.initialized) {
      await this.initialize();
    }

    try {
      // Create empty profile structure
      const profile: HarmonyUserProfile = {
        userId,
        signatureCode: '#808080', // Default middle value
        overallConfidence: 0,
        rarityScore: 0,
        dimensions: {
          metaphysicalCore: {
            value: 128,
            degree: 0,
            primaryArchetype: 'Cognitive',
            archetypeTitle: 'The Analyst',
            archetypeDistance: 0,
            confidence: 0,
            probRange: [0, 360],
            anchorWeights: {},
            paramBreakdown: {}
          },
          manifestedSelf: {
            value: 128,
            confidence: 0,
            probRange: [0, 255],
            paramBreakdown: {}
          },
          humanSoul: {
            value: 128,
            confidence: 0,
            probRange: [0, 255],
            paramBreakdown: {}
          }
        },
        rawDimensions: {
          hue: 0,
          manifested: 128,
          soul: 128
        },
        inferenceHistory: [],
        inferenceJourney: {
          currentPhase: InferencePhase.SURFACE,
          messageCount: 0,
          questionsAsked: 0,
          parametersInferred: 0,
          overallProgress: 0,
          nextTargets: [],
          confidenceGrowth: []
        },
        conversationHistory: initialConversation,
        metadata: {
          createdAt: new Date().toISOString(),
          lastUpdated: new Date().toISOString(),
          version: '1.0.0',
          privacySettings: {
            dataRetention: 'permanent',
            analyticsOptIn: true,
            profileVisibility: 'private',
            matchingOptIn: true
          }
        }
      };

      // Analyze initial conversation if provided
      if (initialConversation.length > 0) {
        const updatedProfile = await this.inferenceEngine.analyzeConversation(
          profile,
          initialConversation
        );
        Object.assign(profile, updatedProfile);
      }

      // Store profile
      this.userProfiles.set(userId, profile);
      await this.saveUserProfiles();

      return profile;
    } catch (error) {
      throw new HarmonyError(
        HarmonyErrorType.INFERENCE_FAILED,
        'Failed to create user profile',
        error
      );
    }
  }

  /**
   * Get user profile
   */
  async getUserProfile(userId: string): Promise<HarmonyUserProfile | null> {
    if (!this.initialized) {
      await this.initialize();
    }

    return this.userProfiles.get(userId) || null;
  }

  /**
   * Update user profile with new conversation
   */
  async updateUserProfile(
    userId: string,
    newMessages: ConversationMessage[]
  ): Promise<HarmonyUserProfile> {
    if (!this.initialized) {
      await this.initialize();
    }

    const profile = this.userProfiles.get(userId);
    if (!profile) {
      throw new HarmonyError(
        HarmonyErrorType.INSUFFICIENT_DATA,
        'User profile not found',
        { userId }
      );
    }

    try {
      // Update profile with new messages
      const updatedProfile = await this.inferenceEngine.analyzeConversation(
        profile,
        newMessages
      );

      // Update stored profile
      this.userProfiles.set(userId, updatedProfile);
      await this.saveUserProfiles();

      return updatedProfile;
    } catch (error) {
      throw new HarmonyError(
        HarmonyErrorType.INFERENCE_FAILED,
        'Failed to update user profile',
        error
      );
    }
  }

  /**
   * Generate next question for user
   */
  async generateNextQuestion(userId: string): Promise<GeneratedQuestion> {
    if (!this.initialized) {
      await this.initialize();
    }

    const profile = this.userProfiles.get(userId);
    if (!profile) {
      throw new HarmonyError(
        HarmonyErrorType.INSUFFICIENT_DATA,
        'User profile not found',
        { userId }
      );
    }

    try {
      return await this.inferenceEngine.generateNextQuestion(profile);
    } catch (error) {
      throw new HarmonyError(
        HarmonyErrorType.INFERENCE_FAILED,
        'Failed to generate next question',
        error
      );
    }
  }

  /**
   * Find compatible matches for user
   */
  async findCompatibleMatches(
    userId: string,
    options: Partial<MatchingOptions> = {}
  ): Promise<MatchingResult> {
    if (!this.initialized) {
      await this.initialize();
    }

    const profile = this.userProfiles.get(userId);
    if (!profile) {
      throw new HarmonyError(
        HarmonyErrorType.INSUFFICIENT_DATA,
        'User profile not found',
        { userId }
      );
    }

    try {
      // Set default options
      const defaultOptions: MatchingOptions = {
        minCompatibility: 60,
        maxResults: 50,
        includeComplementary: true,
        includeGrowthOriented: false,
        preferredArchetypes: [],
        excludedArchetypes: [],
        soulDepthRange: [0, 255],
        manifestedRange: [0, 255],
        harmonyZones: [HarmonyZone.INNER, HarmonyZone.MIDDLE]
      };

      const finalOptions = { ...defaultOptions, ...options };

      // Find matches
      const result = await this.matchingEngine.findCompatibleMatches(
        profile,
        finalOptions
      );

      // Add user to matching pool if not already there
      await this.matchingEngine.addUserToPool(profile);

      return result;
    } catch (error) {
      throw new HarmonyError(
        HarmonyErrorType.COMPATIBILITY_ERROR,
        'Failed to find compatible matches',
        error
      );
    }
  }

  /**
   * Get detailed profile analysis
   */
  async getProfileAnalysis(userId: string): Promise<{
    profile: HarmonyUserProfile;
    analysis: {
      signatureDescription: any;
      strengths: string[];
      challenges: string[];
      recommendations: string[];
      developmentAreas: string[];
    };
  }> {
    if (!this.initialized) {
      await this.initialize();
    }

    const profile = this.userProfiles.get(userId);
    if (!profile) {
      throw new HarmonyError(
        HarmonyErrorType.INSUFFICIENT_DATA,
        'User profile not found',
        { userId }
      );
    }

    try {
      const signatureDescription = generateSignatureDescription(profile.signatureCode);
      const archetype = getArchetypeFromHue(profile.rawDimensions.hue);
      
      const analysis = {
        signatureDescription,
        strengths: this.getArchetypeStrengths(archetype.name),
        challenges: this.getArchetypeChallenges(archetype.name),
        recommendations: this.getPersonalizedRecommendations(profile),
        developmentAreas: this.getDevelopmentAreas(profile)
      };

      return { profile, analysis };
    } catch (error) {
      throw new HarmonyError(
        HarmonyErrorType.VALIDATION_ERROR,
        'Failed to generate profile analysis',
        error
      );
    }
  }

  /**
   * Get system statistics
   */
  async getSystemStats(): Promise<HarmonySystemStats> {
    if (!this.initialized) {
      await this.initialize();
    }

    const profiles = Array.from(this.userProfiles.values());
    const totalProfiles = profiles.length;
    
    if (totalProfiles === 0) {
      return {
        totalProfiles: 0,
        averageConfidence: 0,
        archetypeDistribution: {},
        compatibilityMetrics: {
          averageScore: 0,
          topScorePairings: []
        },
        inferenceMetrics: {
          averageQuestionsToConvergence: 0,
          mostDifficultParameters: [],
          averageSessionLength: 0
        },
        performanceMetrics: {
          averageInferenceTime: 0,
          averageMatchingTime: 0,
          cacheHitRate: 0
        }
      };
    }

    // Calculate statistics
    const averageConfidence = profiles.reduce((sum, p) => sum + p.overallConfidence, 0) / totalProfiles;
    
    const archetypeDistribution: { [key: string]: number } = {};
    profiles.forEach(profile => {
      const archetype = getArchetypeFromHue(profile.rawDimensions.hue);
      archetypeDistribution[archetype.name] = (archetypeDistribution[archetype.name] || 0) + 1;
    });

    const averageQuestionsToConvergence = profiles.reduce((sum, p) => sum + p.inferenceJourney.questionsAsked, 0) / totalProfiles;
    const averageSessionLength = profiles.reduce((sum, p) => sum + p.conversationHistory.length, 0) / totalProfiles;

    return {
      totalProfiles,
      averageConfidence,
      archetypeDistribution,
      compatibilityMetrics: {
        averageScore: 75, // Would be calculated from actual matching data
        topScorePairings: []
      },
      inferenceMetrics: {
        averageQuestionsToConvergence,
        mostDifficultParameters: this.getMostDifficultParameters(),
        averageSessionLength
      },
      performanceMetrics: {
        averageInferenceTime: 150, // Would be measured
        averageMatchingTime: 50,   // Would be measured
        cacheHitRate: 0.85        // Would be calculated
      }
    };
  }

  /**
   * Validate signature code
   */
  validateSignatureCode(signatureCode: string): boolean {
    return validateHexCode(signatureCode);
  }

  /**
   * Convert signature code to readable format
   */
  parseSignatureCode(signatureCode: string): {
    valid: boolean;
    dimensions?: {
      hue: number;
      manifested: number;
      soul: number;
    };
    archetype?: string;
    description?: string;
  } {
    if (!this.validateSignatureCode(signatureCode)) {
      return { valid: false };
    }

    try {
      const dimensions = hexCodeToDimensions(signatureCode);
      const archetype = getArchetypeFromHue(dimensions.hue);
      const description = generateSignatureDescription(signatureCode);

      return {
        valid: true,
        dimensions,
        archetype: archetype.name,
        description: description.fullDescription
      };
    } catch (error) {
      return { valid: false };
    }
  }

  /**
   * Export user data
   */
  async exportUserData(userId: string): Promise<{
    profile: HarmonyUserProfile;
    conversationHistory: ConversationMessage[];
    inferenceHistory: any[];
    metadata: any;
  }> {
    if (!this.initialized) {
      await this.initialize();
    }

    const profile = this.userProfiles.get(userId);
    if (!profile) {
      throw new HarmonyError(
        HarmonyErrorType.INSUFFICIENT_DATA,
        'User profile not found',
        { userId }
      );
    }

    return {
      profile,
      conversationHistory: profile.conversationHistory,
      inferenceHistory: profile.inferenceHistory,
      metadata: {
        exportDate: new Date().toISOString(),
        version: '1.0.0',
        dataRetention: profile.metadata.privacySettings.dataRetention
      }
    };
  }

  /**
   * Delete user data
   */
  async deleteUserData(userId: string): Promise<void> {
    if (!this.initialized) {
      await this.initialize();
    }

    this.userProfiles.delete(userId);
    await this.saveUserProfiles();
    await this.matchingEngine.removeUserFromPool(userId);
  }

  /**
   * Update configuration
   */
  async updateConfiguration(newConfig: Partial<HarmonyConfig>): Promise<void> {
    this.config = { ...this.config, ...newConfig };
    await this.saveConfiguration();
  }

  /**
   * Private helper methods
   */
  private getDefaultConfig(): HarmonyConfig {
    return {
      dimensions: {
        hue: {
          weight: 0.4,
          circularDistance: true
        },
        manifested: {
          weight: 0.3,
          scalingFunction: 'linear'
        },
        soul: {
          weight: 0.3,
          scalingFunction: 'sqrt'
        }
      },
      compatibility: {
        proximityThreshold: 0.6,
        complementarityBonus: 1.2,
        maxDistance: 500
      },
      inference: {
        minConfidenceThreshold: 0.3,
        maxInferenceIterations: 1000,
        questionCooldown: 5000,
        phaseTransitionThreshold: 0.7,
        inconsistencyTolerance: 0.2,
        temporalDecay: 0.95
      }
    };
  }

  private getArchetypeStrengths(archetypeName: string): string[] {
    const strengthsMap: { [key: string]: string[] } = {
      'Cognitive': ['Analytical thinking', 'Logical reasoning', 'Problem-solving'],
      'Visionary': ['Creative innovation', 'Future-oriented thinking', 'Inspirational leadership'],
      'Relational': ['Emotional intelligence', 'Deep connections', 'Empathetic understanding'],
      'Nurturing': ['Compassionate care', 'Harmony creation', 'Supportive presence'],
      'Purposeful': ['Values-driven action', 'Meaningful contribution', 'Ethical leadership'],
      'Driven': ['Goal achievement', 'Persistent determination', 'Results orientation'],
      'Experiential': ['Present-moment awareness', 'Adventurous spirit', 'Sensory engagement'],
      'Analytical': ['Systematic approach', 'Detail orientation', 'Organizational skills']
    };

    return strengthsMap[archetypeName] || [];
  }

  private getArchetypeChallenges(archetypeName: string): string[] {
    const challengesMap: { [key: string]: string[] } = {
      'Cognitive': ['Emotional disconnect', 'Over-analysis', 'Perfectionism'],
      'Visionary': ['Impractical ideas', 'Scattered focus', 'Unrealistic expectations'],
      'Relational': ['Boundary issues', 'Emotional overwhelm', 'Codependency'],
      'Nurturing': ['Self-neglect', 'Conflict avoidance', 'Over-giving'],
      'Purposeful': ['Rigid thinking', 'Judgmental attitudes', 'Burnout'],
      'Driven': ['Workaholism', 'Impatience', 'Relationship neglect'],
      'Experiential': ['Lack of planning', 'Impulsiveness', 'Difficulty with routine'],
      'Analytical': ['Inflexibility', 'Micro-management', 'Slow decision-making']
    };

    return challengesMap[archetypeName] || [];
  }

  private getPersonalizedRecommendations(profile: HarmonyUserProfile): string[] {
    const recommendations: string[] = [];
    
    // Based on confidence levels
    if (profile.overallConfidence < 0.5) {
      recommendations.push('Continue engaging in conversations to build a more complete profile');
    }

    // Based on archetype
    const archetype = getArchetypeFromHue(profile.rawDimensions.hue);
    recommendations.push(`Explore ${archetype.name} archetype development exercises`);

    // Based on dimensional values
    if (profile.rawDimensions.manifested < 100) {
      recommendations.push('Focus on self-expression and confidence building');
    }

    if (profile.rawDimensions.soul < 100) {
      recommendations.push('Engage in practices that deepen self-awareness and spiritual connection');
    }

    return recommendations;
  }

  private getDevelopmentAreas(profile: HarmonyUserProfile): string[] {
    const areas: string[] = [];
    
    // Analyze parameter breakdown for low confidence areas
    for (const dimension of Object.values(profile.dimensions)) {
      for (const [paramId, paramData] of Object.entries(dimension.paramBreakdown)) {
        if (paramData.confidence < 0.5) {
          areas.push(paramId.replace(/_/g, ' '));
        }
      }
    }

    return areas.slice(0, 5); // Return top 5 development areas
  }

  private getMostDifficultParameters(): string[] {
    // This would be calculated from historical data
    return [
      'existential_awareness',
      'transcendence_capacity',
      'authentic_core_access',
      'moral_integration',
      'wisdom_integration'
    ];
  }

  private async loadConfiguration(): Promise<void> {
    try {
      const stored = await AsyncStorage.getItem(HarmonyService.STORAGE_KEYS.SYSTEM_CONFIG);
      if (stored) {
        const savedConfig = JSON.parse(stored);
        this.config = { ...this.config, ...savedConfig };
      }
    } catch (error) {
      console.error('Error loading configuration:', error);
    }
  }

  private async saveConfiguration(): Promise<void> {
    try {
      await AsyncStorage.setItem(
        HarmonyService.STORAGE_KEYS.SYSTEM_CONFIG,
        JSON.stringify(this.config)
      );
    } catch (error) {
      console.error('Error saving configuration:', error);
    }
  }

  private async loadUserProfiles(): Promise<void> {
    try {
      const stored = await AsyncStorage.getItem(HarmonyService.STORAGE_KEYS.USER_PROFILES);
      if (stored) {
        const profiles = JSON.parse(stored);
        this.userProfiles = new Map(profiles);
      }
    } catch (error) {
      console.error('Error loading user profiles:', error);
    }
  }

  private async saveUserProfiles(): Promise<void> {
    try {
      const profiles = Array.from(this.userProfiles.entries());
      await AsyncStorage.setItem(
        HarmonyService.STORAGE_KEYS.USER_PROFILES,
        JSON.stringify(profiles)
      );
    } catch (error) {
      console.error('Error saving user profiles:', error);
    }
  }
}

// Export singleton instance
export default HarmonyService.getInstance();