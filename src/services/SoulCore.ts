// Soul Core - The Heart of the Hybrid HHC & Factual Matchmaking System
// Integrates HHC personality mapping with explicit factual preferences and dynamic learning

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
import { SoulUserProfile, SoulCompatibilityScore, SoulMatchingResult, SoulPreferenceWeights, SoulInteractionSignal, SoulLearningHistory } from '../types/SoulTypes';
import {
  generateHarmonySignature,
  hexCodeToDimensions,
  getArchetypeFromHue,
  generateSignatureDescription,
  calculateRarityScore,
  validateHexCode,
  calculateHarmonyDistance
} from './HarmonyCore';

/**
 * Soul Core - Advanced Hybrid Matchmaking Engine
 * 
 * Combines:
 * 1. HHC (Human Hex Code) personality inference for deep compatibility
 * 2. Explicit factual profile data and preferences
 * 3. Dynamic "Guess Who" learning for evolving user preferences
 * 4. Mathematical compatibility scoring with attraction/repulsion forces
 */
export class SoulCore {
  private static instance: SoulCore;
  private initialized = false;
  private userProfiles: Map<string, SoulUserProfile> = new Map();
  private learningHistory: Map<string, SoulLearningHistory> = new Map();
  private config: SoulConfig;
  
  // Storage keys
  private static readonly STORAGE_KEYS = {
    SOUL_USER_PROFILES: 'soul_user_profiles',
    SOUL_LEARNING_HISTORY: 'soul_learning_history',
    SOUL_SYSTEM_CONFIG: 'soul_system_config',
    SOUL_INTERACTION_CACHE: 'soul_interaction_cache'
  };

  private constructor() {
    this.config = this.getDefaultConfig();
  }

  static getInstance(): SoulCore {
    if (!SoulCore.instance) {
      SoulCore.instance = new SoulCore();
    }
    return SoulCore.instance;
  }

  /**
   * Initialize the Soul Core system
   */
  async initialize(): Promise<void> {
    if (this.initialized) return;

    try {
      await this.loadConfiguration();
      await this.loadUserProfiles();
      await this.loadLearningHistory();
      
      this.initialized = true;
      console.log('Soul Core initialized successfully');
    } catch (error) {
      throw new HarmonyError(
        HarmonyErrorType.INFERENCE_FAILED,
        'Failed to initialize Soul Core',
        error
      );
    }
  }

  /**
   * Create a comprehensive Soul user profile
   * Integrates HHC with explicit factual data
   */
  async createSoulProfile(
    userId: string,
    hhcProfile: HarmonyUserProfile,
    factualProfile: FactualProfile,
    partnerPreferences: PartnerPreferences
  ): Promise<SoulUserProfile> {
    if (!this.initialized) {
      await this.initialize();
    }

    const soulProfile: SoulUserProfile = {
      userId,
      
      // Core HHC personality data
      hhcProfile,
      
      // Explicit factual profile
      factualProfile,
      
      // Partner preferences with dynamic weights
      partnerPreferences,
      
      // Dynamic preference weights (learned over time)
      dynamicPreferenceWeights: this.initializeDefaultWeights(),
      
      // Learning and interaction history
      learningHistory: {
        totalInteractions: 0,
        attributeQuestions: new Map(),
        preferenceSignals: [],
        guessWhoSessions: [],
        learningMilestones: []
      },
      
      // Compatibility scoring cache
      compatibilityCache: new Map(),
      
      // Metadata
      metadata: {
        createdAt: new Date().toISOString(),
        lastUpdated: new Date().toISOString(),
        version: '1.0.0',
        soulfitScore: 0,
        profileCompleteness: this.calculateProfileCompleteness(factualProfile),
        learningProgress: 0,
        privacySettings: {
          dataRetention: 'permanent',
          analyticsOptIn: true,
          profileVisibility: 'private',
          matchingOptIn: true,
          guessWhoOptIn: true,
          learningOptIn: true,
          shareInsights: true
        },
        verificationStatus: {
          profileVerified: false,
          photosVerified: false,
          phoneVerified: false,
          emailVerified: false,
          identityVerified: false,
          verificationScore: 0
        }
      }
    };

    // Store profile
    this.userProfiles.set(userId, soulProfile);
    await this.saveUserProfiles();

    return soulProfile;
  }

  /**
   * Get user profile by ID
   */
  async getUserProfile(userId: string): Promise<SoulUserProfile | null> {
    if (!this.initialized) {
      await this.initialize();
    }
    
    return this.userProfiles.get(userId) || null;
  }

  /**
   * Calculate total compatibility score using hybrid approach
   * Combines HHC personality compatibility with factual alignment
   */
  calculateTotalCompatibility(
    seekerProfile: SoulUserProfile,
    candidateProfile: SoulUserProfile
  ): SoulCompatibilityScore {
    // Step 1: Calculate HHC compatibility score
    const hhcScore = this.calculateHHCCompatibility(
      seekerProfile.hhcProfile,
      candidateProfile.hhcProfile
    );

    // Step 2: Apply veto filters (hard requirements)
    const vetoFactor = this.calculateVetoFactor(
      seekerProfile.partnerPreferences,
      candidateProfile.factualProfile
    );

    if (vetoFactor === 0) {
      return {
        totalScore: 0,
        hhcScore,
        factualScore: 0,
        vetoFactor,
        breakdown: {
          personalityAlignment: hhcScore,
          factualAlignment: 0,
          interestOverlap: 0,
          preferenceMatch: 0,
          vetoViolation: true
        },
        confidenceLevel: 0,
        explanation: 'Candidate violates hard requirements (veto criteria)'
      };
    }

    // Step 3: Calculate factual compatibility score
    const factualScore = this.calculateFactualCompatibility(
      seekerProfile,
      candidateProfile
    );

    // Step 4: Combine scores using weighted formula
    const totalScore = vetoFactor * (
      this.config.weights.hhcWeight * hhcScore +
      this.config.weights.factualWeight * factualScore
    );

    return {
      totalScore,
      hhcScore,
      factualScore,
      vetoFactor,
      breakdown: {
        personalityAlignment: hhcScore,
        factualAlignment: factualScore,
        interestOverlap: this.calculateInterestOverlap(seekerProfile, candidateProfile),
        preferenceMatch: this.calculatePreferenceMatch(seekerProfile, candidateProfile),
        vetoViolation: false
      },
      confidenceLevel: this.calculateConfidenceLevel(seekerProfile, candidateProfile),
      explanation: this.generateCompatibilityExplanation(hhcScore, factualScore, totalScore)
    };
  }

  /**
   * Calculate HHC compatibility using 3D personality space distance
   */
  private calculateHHCCompatibility(
    profileA: HarmonyUserProfile,
    profileB: HarmonyUserProfile
  ): number {
    const distance = calculateHarmonyDistance(
      profileA.signatureCode,
      profileB.signatureCode
    );

    // Normalize distance to [0, 1] where 1 is perfect compatibility
    const maxDistance = Math.sqrt(360*360 + 255*255 + 255*255); // Max possible distance
    const normalizedDistance = distance / maxDistance;
    
    // Invert to compatibility score (closer = more compatible)
    return 1 - normalizedDistance;
  }

  /**
   * Calculate veto factor - binary filter for hard requirements
   */
  private calculateVetoFactor(
    preferences: PartnerPreferences,
    candidateProfile: FactualProfile
  ): number {
    // Age range check
    if (preferences.desiredAgeRange && candidateProfile.age) {
      const [minAge, maxAge] = preferences.desiredAgeRange;
      if (candidateProfile.age < minAge || candidateProfile.age > maxAge) {
        return 0;
      }
    }

    // Gender interest check
    if (preferences.interestedInGenders && candidateProfile.genderIdentity) {
      if (!preferences.interestedInGenders.includes(candidateProfile.genderIdentity)) {
        return 0;
      }
    }

    // Height preferences
    if (preferences.desiredPartnerHeight && candidateProfile.heightCm) {
      const { min, max } = preferences.desiredPartnerHeight;
      if (candidateProfile.heightCm < min || candidateProfile.heightCm > max) {
        return 0;
      }
    }

    // Hard veto criteria
    if (preferences.vetoCriteria) {
      // Non-smoker requirement
      if (preferences.vetoCriteria.nonSmokerOnly && 
          candidateProfile.smokingHabits !== 'never') {
        return 0;
      }

      // Family plans alignment
      if (preferences.vetoCriteria.mustWantChildren && 
          candidateProfile.familyPlans !== 'wants children') {
        return 0;
      }

      // Other hard requirements...
    }

    return 1; // Passes all veto criteria
  }

  /**
   * Calculate factual compatibility using weighted scoring
   */
  private calculateFactualCompatibility(
    seekerProfile: SoulUserProfile,
    candidateProfile: SoulUserProfile
  ): number {
    const weights = seekerProfile.dynamicPreferenceWeights;
    const preferences = seekerProfile.partnerPreferences;
    const candidateFactual = candidateProfile.factualProfile;

    let totalScore = 0;
    let totalWeight = 0;

    // Age compatibility (if not veto'd)
    if (weights.age > 0 && preferences.desiredAgeRange && candidateFactual.age) {
      const ageScore = this.calculateAgeCompatibility(
        preferences.desiredAgeRange,
        candidateFactual.age
      );
      totalScore += weights.age * ageScore;
      totalWeight += weights.age;
    }

    // Height compatibility
    if (weights.height > 0 && preferences.desiredPartnerHeight && candidateFactual.heightCm) {
      const heightScore = this.calculateHeightCompatibility(
        preferences.desiredPartnerHeight,
        candidateFactual.heightCm
      );
      totalScore += weights.height * heightScore;
      totalWeight += weights.height;
    }

    // Relationship goal alignment
    if (weights.relationshipGoal > 0 && candidateFactual.relationshipGoal) {
      const goalScore = this.calculateRelationshipGoalCompatibility(
        preferences.relationshipGoal,
        candidateFactual.relationshipGoal
      );
      totalScore += weights.relationshipGoal * goalScore;
      totalWeight += weights.relationshipGoal;
    }

    // Family plans compatibility
    if (weights.familyPlans > 0 && candidateFactual.familyPlans) {
      const familyScore = this.calculateFamilyPlansCompatibility(
        preferences.familyPlans,
        candidateFactual.familyPlans
      );
      totalScore += weights.familyPlans * familyScore;
      totalWeight += weights.familyPlans;
    }

    // Interest overlap
    if (weights.interests > 0 && candidateFactual.interests) {
      const interestScore = this.calculateInterestOverlap(seekerProfile, candidateProfile);
      totalScore += weights.interests * interestScore;
      totalWeight += weights.interests;
    }

    // Lifestyle compatibility (exercise, sleeping, etc.)
    if (weights.lifestyle > 0) {
      const lifestyleScore = this.calculateLifestyleCompatibility(
        seekerProfile.factualProfile,
        candidateFactual
      );
      totalScore += weights.lifestyle * lifestyleScore;
      totalWeight += weights.lifestyle;
    }

    // Normalize by total weight
    return totalWeight > 0 ? totalScore / totalWeight : 0;
  }

  /**
   * Process "Guess Who" interaction and update preference weights
   */
  async processGuessWhoInteraction(
    userId: string,
    candidateId: string,
    question: string,
    userReaction: 'positive' | 'negative' | 'neutral',
    attributeInvolved: string
  ): Promise<SoulInteractionSignal> {
    const profile = this.userProfiles.get(userId);
    if (!profile) {
      throw new Error('User profile not found');
    }

    // Create interaction signal
    const signal: SoulInteractionSignal = {
      timestamp: new Date().toISOString(),
      candidateId,
      question,
      attributeInvolved,
      userReaction,
      attractionForce: this.calculateAttractionForce(userReaction, attributeInvolved),
      repulsionForce: this.calculateRepulsionForce(userReaction, attributeInvolved),
      confidenceLevel: this.calculateInteractionConfidence(question, userReaction)
    };

    // Update preference weights using attraction/repulsion dynamics
    await this.updatePreferenceWeights(userId, signal);

    // Store interaction in learning history
    profile.learningHistory.preferenceSignals.push(signal);
    profile.learningHistory.totalInteractions++;

    // Update attribute question tracking
    const currentCount = profile.learningHistory.attributeQuestions.get(attributeInvolved) || 0;
    profile.learningHistory.attributeQuestions.set(attributeInvolved, currentCount + 1);

    await this.saveUserProfiles();

    return signal;
  }

  /**
   * Update preference weights using attraction/repulsion forces
   */
  private async updatePreferenceWeights(
    userId: string,
    signal: SoulInteractionSignal
  ): Promise<void> {
    const profile = this.userProfiles.get(userId);
    if (!profile) return;

    const attribute = signal.attributeInvolved;
    const currentWeight = profile.dynamicPreferenceWeights[attribute] || 0;

    // Calculate weight change using attraction/repulsion dynamics
    const forceNet = signal.attractionForce - signal.repulsionForce;
    const weightChange = this.config.learning.learningRate * forceNet;

    // Update weight with bounds
    const newWeight = Math.max(0, Math.min(1, currentWeight + weightChange));
    profile.dynamicPreferenceWeights[attribute] = newWeight;

    // Normalize all weights to maintain balance
    this.normalizePreferenceWeights(profile);

    profile.metadata.lastUpdated = new Date().toISOString();
  }

  /**
   * Generate personalized questions for "Guess Who" interactions
   */
  async generateGuessWhoQuestion(
    userId: string,
    candidateId: string
  ): Promise<GeneratedQuestion> {
    const profile = this.userProfiles.get(userId);
    if (!profile) {
      throw new Error('User profile not found');
    }

    // Analyze which attributes need more exploration
    const unexploredAttributes = this.identifyUnexploredAttributes(profile);
    const lowConfidenceAttributes = this.identifyLowConfidenceAttributes(profile);

    // Prioritize attributes based on importance and exploration needs
    const targetAttribute = this.selectTargetAttribute(
      unexploredAttributes,
      lowConfidenceAttributes,
      profile.dynamicPreferenceWeights
    );

    // Generate contextual question
    const question = this.generateContextualQuestion(targetAttribute, candidateId);

    return {
      id: `guess_who_${Date.now()}`,
      question,
      targetAttribute,
      phase: InferencePhase.CORE_EXCAVATION,
      priority: 0.8,
      context: {
        candidateId,
        interactionType: 'guess_who',
        learningObjective: `Explore user's preference for ${targetAttribute}`
      }
    };
  }

  /**
   * Find compatible matches using hybrid scoring
   */
  async findSoulMatches(
    userId: string,
    options: Partial<SoulMatchingOptions> = {}
  ): Promise<SoulMatchingResult> {
    const profile = this.userProfiles.get(userId);
    if (!profile) {
      throw new Error('User profile not found');
    }

    // Get all potential candidates
    const candidates = Array.from(this.userProfiles.values())
      .filter(p => p.userId !== userId);

    // Score all candidates
    const scoredMatches = candidates.map(candidate => {
      const compatibility = this.calculateTotalCompatibility(profile, candidate);
      return {
        candidate,
        compatibility,
        soulFitScore: compatibility.totalScore,
        personalityInsights: {
          complementaryTraits: [],
          sharedStrengths: [],
          potentialChallenges: [],
          growthOpportunities: [],
          communicationStyle: 'compatible',
          conflictStyle: 'collaborative'
        },
        connectionPotential: {
          shortTermCompatibility: compatibility.totalScore,
          longTermCompatibility: compatibility.totalScore,
          growthPotential: 0.7,
          passionAlignment: 0.8,
          stabilityFactor: 0.75,
          adventureCompatibility: 0.6
        },
        suggestedConversationStarters: [
          'What\'s been inspiring you lately?',
          'Tell me about something you\'re passionate about'
        ]
      };
    });

    // Filter by minimum compatibility threshold
    const minThreshold = options.minCompatibility || 0.6;
    const qualifiedMatches = scoredMatches.filter(
      match => match.compatibility.totalScore >= minThreshold
    );

    // Sort by compatibility score
    qualifiedMatches.sort((a, b) => b.compatibility.totalScore - a.compatibility.totalScore);

    // Limit results
    const maxResults = options.maxResults || 50;
    const finalMatches = qualifiedMatches.slice(0, maxResults);

    return {
      totalMatches: finalMatches.length,
      matches: finalMatches,
      searchCriteria: {
        minCompatibility: minThreshold,
        maxResults,
        hhcWeight: this.config.weights.hhcWeight,
        factualWeight: this.config.weights.factualWeight
      },
      systemInsights: {
        averageCompatibility: this.calculateAverageCompatibility(finalMatches),
        topArchetypeMatches: this.analyzeTopArchetypes(finalMatches),
        personalityDiversityScore: this.calculatePersonalityDiversity(finalMatches),
        factsVsPersonalityBalance: 0.6,
        learningRecommendations: ['Continue exploring preferences through more interactions']
      }
    };
  }

  // Private helper methods...

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
        confidenceThreshold: 0.3
      },
      matching: {
        minCompatibility: 0.6,
        maxCandidates: 1000,
        diversityBonus: 0.1
      }
    };
  }

  private initializeDefaultWeights(): SoulPreferenceWeights {
    return {
      age: 0.15,
      height: 0.05,
      genderIdentity: 0.05,
      relationshipGoal: 0.25,
      familyPlans: 0.20,
      lifestyle: 0.10,
      exerciseHabits: 0.03,
      smokingHabits: 0.02,
      drinkingHabits: 0.02,
      dietaryPreferences: 0.02,
      interests: 0.15,
      communicationStyle: 0.05,
      loveLanguage: 0.03,
      educationLevel: 0.02,
      values: 0.05,
      religion: 0.02,
      politicalViews: 0.02,
      socialEnergy: 0.03,
      culturalBackground: 0.02
    };
  }

  private calculateProfileCompleteness(profile: FactualProfile): number {
    const totalFields = Object.keys(profile).length;
    const completedFields = Object.values(profile).filter(v => v !== null && v !== undefined).length;
    return completedFields / totalFields;
  }

  private calculateInterestOverlap(
    profileA: SoulUserProfile,
    profileB: SoulUserProfile
  ): number {
    const interestsA = new Set(profileA.factualProfile.interests || []);
    const interestsB = new Set(profileB.factualProfile.interests || []);
    
    const intersection = new Set([...interestsA].filter(x => interestsB.has(x)));
    const union = new Set([...interestsA, ...interestsB]);
    
    return union.size > 0 ? intersection.size / union.size : 0;
  }

  private calculateAttractionForce(
    reaction: 'positive' | 'negative' | 'neutral',
    attribute: string
  ): number {
    switch (reaction) {
      case 'positive': return 0.2;
      case 'neutral': return 0.05;
      case 'negative': return 0;
      default: return 0;
    }
  }

  private calculateRepulsionForce(
    reaction: 'positive' | 'negative' | 'neutral',
    attribute: string
  ): number {
    switch (reaction) {
      case 'negative': return 0.15;
      case 'neutral': return 0;
      case 'positive': return 0;
      default: return 0;
    }
  }

  private normalizePreferenceWeights(profile: SoulUserProfile): void {
    const weights = profile.dynamicPreferenceWeights;
    const totalWeight = Object.values(weights).reduce((sum, w) => sum + w, 0);
    
    if (totalWeight > 0) {
      for (const key in weights) {
        weights[key] = weights[key] / totalWeight;
      }
    }
  }

  // Additional helper methods for compatibility calculations...
  
  private calculateAgeCompatibility(preferredRange: [number, number], candidateAge: number): number {
    const [min, max] = preferredRange;
    if (candidateAge >= min && candidateAge <= max) {
      return 1.0;
    }
    // Gaussian decay outside preferred range
    const center = (min + max) / 2;
    const sigma = (max - min) / 4;
    return Math.exp(-Math.pow(candidateAge - center, 2) / (2 * sigma * sigma));
  }

  private calculateHeightCompatibility(
    preferredHeight: { min: number; max: number },
    candidateHeight: number
  ): number {
    const { min, max } = preferredHeight;
    if (candidateHeight >= min && candidateHeight <= max) {
      return 1.0;
    }
    // Linear decay outside range
    const deviation = candidateHeight < min ? min - candidateHeight : candidateHeight - max;
    return Math.max(0, 1 - deviation / 20); // 20cm tolerance
  }

  private calculateRelationshipGoalCompatibility(
    preferredGoal: string | string[],
    candidateGoal: string
  ): number {
    const preferred = Array.isArray(preferredGoal) ? preferredGoal : [preferredGoal];
    return preferred.includes(candidateGoal) ? 1.0 : 0.0;
  }

  private calculateFamilyPlansCompatibility(
    preferredPlans: string | string[],
    candidatePlans: string
  ): number {
    const preferred = Array.isArray(preferredPlans) ? preferredPlans : [preferredPlans];
    return preferred.includes(candidatePlans) ? 1.0 : 0.0;
  }

  private calculateLifestyleCompatibility(
    seekerProfile: FactualProfile,
    candidateProfile: FactualProfile
  ): number {
    let score = 0;
    let factors = 0;

    // Exercise habits
    if (seekerProfile.exerciseHabits && candidateProfile.exerciseHabits) {
      score += this.calculateCategoricalCompatibility(
        seekerProfile.exerciseHabits,
        candidateProfile.exerciseHabits
      );
      factors++;
    }

    // Sleeping habits
    if (seekerProfile.sleepingHabits && candidateProfile.sleepingHabits) {
      score += this.calculateCategoricalCompatibility(
        seekerProfile.sleepingHabits,
        candidateProfile.sleepingHabits
      );
      factors++;
    }

    // Dietary preferences
    if (seekerProfile.dietaryPreferences && candidateProfile.dietaryPreferences) {
      score += this.calculateCategoricalCompatibility(
        seekerProfile.dietaryPreferences,
        candidateProfile.dietaryPreferences
      );
      factors++;
    }

    return factors > 0 ? score / factors : 0;
  }

  private calculateCategoricalCompatibility(valueA: string, valueB: string): number {
    return valueA === valueB ? 1.0 : 0.0;
  }

  private calculatePreferenceMatch(
    seekerProfile: SoulUserProfile,
    candidateProfile: SoulUserProfile
  ): number {
    // This would calculate how well the candidate matches the seeker's explicit preferences
    // Implementation would depend on the specific preference structure
    return 0.8; // Placeholder
  }

  private calculateConfidenceLevel(
    seekerProfile: SoulUserProfile,
    candidateProfile: SoulUserProfile
  ): number {
    // Base confidence on profile completeness and interaction history
    const seekerCompleteness = seekerProfile.metadata.profileCompleteness;
    const candidateCompleteness = candidateProfile.metadata.profileCompleteness;
    const interactionDepth = seekerProfile.learningHistory.totalInteractions / 100;
    
    return Math.min(1.0, (seekerCompleteness + candidateCompleteness) / 2 + interactionDepth);
  }

  private generateCompatibilityExplanation(
    hhcScore: number,
    factualScore: number,
    totalScore: number
  ): string {
    if (totalScore >= 0.8) {
      return 'Exceptional compatibility across personality and lifestyle dimensions';
    } else if (totalScore >= 0.6) {
      return 'Strong compatibility with good potential for connection';
    } else if (totalScore >= 0.4) {
      return 'Moderate compatibility with some alignment areas';
    } else {
      return 'Limited compatibility - significant differences in core areas';
    }
  }

  private calculateInteractionConfidence(question: string, reaction: string): number {
    // Calculate confidence based on question specificity and reaction strength
    return 0.7; // Placeholder
  }

  private identifyUnexploredAttributes(profile: SoulUserProfile): string[] {
    const allAttributes = Object.keys(profile.dynamicPreferenceWeights);
    const exploredAttributes = Array.from(profile.learningHistory.attributeQuestions.keys());
    return allAttributes.filter(attr => !exploredAttributes.includes(attr));
  }

  private identifyLowConfidenceAttributes(profile: SoulUserProfile): string[] {
    // Identify attributes with low confidence scores
    return Object.entries(profile.dynamicPreferenceWeights)
      .filter(([_, weight]) => weight < 0.3)
      .map(([attr, _]) => attr);
  }

  private selectTargetAttribute(
    unexplored: string[],
    lowConfidence: string[],
    weights: SoulPreferenceWeights
  ): string {
    // Prioritize unexplored attributes first
    if (unexplored.length > 0) {
      return unexplored[0];
    }
    
    // Then low confidence attributes
    if (lowConfidence.length > 0) {
      return lowConfidence[0];
    }
    
    // Finally, pick highest weighted attribute for refinement
    return Object.entries(weights)
      .sort(([_, a], [__, b]) => b - a)[0][0];
  }

  private generateContextualQuestion(attribute: string, candidateId: string): string {
    const questions = {
      age: "What age range feels right for you?",
      height: "Do you have height preferences?",
      interests: "What hobbies or interests caught your attention?",
      familyPlans: "Are family plans important to you?",
      lifestyle: "How important is lifestyle compatibility?",
      // Add more contextual questions...
    };
    
    return questions[attribute] || `Tell me about your preferences for ${attribute}`;
  }

  private calculateAverageCompatibility(matches: any[]): number {
    if (matches.length === 0) return 0;
    const total = matches.reduce((sum, match) => sum + match.compatibility.totalScore, 0);
    return total / matches.length;
  }

  private analyzeTopArchetypes(matches: any[]): string[] {
    // Analyze the most common archetypes in top matches
    const archetypes = matches.map(match => 
      getArchetypeFromHue(match.candidate.hhcProfile.rawDimensions.hue).name
    );
    
    const counts = archetypes.reduce((acc, archetype) => {
      acc[archetype] = (acc[archetype] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);
    
    return Object.entries(counts)
      .sort(([_, a], [__, b]) => b - a)
      .slice(0, 3)
      .map(([archetype, _]) => archetype);
  }

  private calculatePersonalityDiversity(matches: any[]): number {
    // Calculate diversity of personality types in matches
    const archetypes = new Set(matches.map(match => 
      getArchetypeFromHue(match.candidate.hhcProfile.rawDimensions.hue).name
    ));
    
    return archetypes.size / 8; // Normalize by max possible archetypes
  }

  // Storage methods
  private async loadConfiguration(): Promise<void> {
    try {
      const stored = await AsyncStorage.getItem(SoulCore.STORAGE_KEYS.SOUL_SYSTEM_CONFIG);
      if (stored) {
        const savedConfig = JSON.parse(stored);
        this.config = { ...this.config, ...savedConfig };
      }
    } catch (error) {
      console.error('Error loading Soul configuration:', error);
    }
  }

  private async loadUserProfiles(): Promise<void> {
    try {
      const stored = await AsyncStorage.getItem(SoulCore.STORAGE_KEYS.SOUL_USER_PROFILES);
      if (stored) {
        const profiles = JSON.parse(stored);
        this.userProfiles = new Map(profiles);
      }
    } catch (error) {
      console.error('Error loading Soul user profiles:', error);
    }
  }

  private async loadLearningHistory(): Promise<void> {
    try {
      const stored = await AsyncStorage.getItem(SoulCore.STORAGE_KEYS.SOUL_LEARNING_HISTORY);
      if (stored) {
        const history = JSON.parse(stored);
        this.learningHistory = new Map(history);
      }
    } catch (error) {
      console.error('Error loading Soul learning history:', error);
    }
  }

  private async saveUserProfiles(): Promise<void> {
    try {
      const profiles = Array.from(this.userProfiles.entries());
      await AsyncStorage.setItem(
        SoulCore.STORAGE_KEYS.SOUL_USER_PROFILES,
        JSON.stringify(profiles)
      );
    } catch (error) {
      console.error('Error saving Soul user profiles:', error);
    }
  }
}

// Type definitions for Soul system
export interface SoulConfig {
  weights: {
    hhcWeight: number;
    factualWeight: number;
  };
  learning: {
    learningRate: number;
    attractionDecay: number;
    repulsionDecay: number;
    confidenceThreshold: number;
  };
  matching: {
    minCompatibility: number;
    maxCandidates: number;
    diversityBonus: number;
  };
}

export interface FactualProfile {
  age?: number;
  genderIdentity?: string;
  heightCm?: number;
  relationshipGoal?: string;
  familyPlans?: string;
  educationLevel?: string;
  exerciseHabits?: string;
  languagesSpoken?: string[];
  zodiacSign?: string;
  pets?: string[];
  smokingHabits?: string;
  drinkingHabits?: string;
  dietaryPreferences?: string;
  sleepingHabits?: string;
  interests?: string[];
  communicationStyle?: string;
  loveLanguage?: string;
}

export interface PartnerPreferences {
  maxSearchDistanceKm?: number;
  desiredAgeRange?: [number, number];
  interestedInGenders?: string[];
  desiredPartnerHeight?: { min: number; max: number };
  relationshipGoal?: string | string[];
  familyPlans?: string | string[];
  smokingHabits?: string[];
  exerciseHabits?: string[];
  interestPreferenceWeights?: Record<string, number>;
  vetoCriteria?: {
    nonSmokerOnly?: boolean;
    mustWantChildren?: boolean;
    [key: string]: any;
  };
}

export interface SoulMatchingOptions {
  minCompatibility: number;
  maxResults: number;
  includeComplementary: boolean;
  includeGrowthOriented: boolean;
  preferredArchetypes: string[];
  excludedArchetypes: string[];
}

export default SoulCore.getInstance();