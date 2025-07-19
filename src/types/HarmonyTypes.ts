// Harmony Algorithm Type Definitions
// Complete TypeScript interfaces for the Harmony personality mapping system

import { HarmonyDimensions } from '../services/HarmonyCore';

/**
 * Represents a single parameter with its value and confidence
 */
export interface ParameterData {
  value: number;                    // Parameter value (0-100 for most, 0-255 for some)
  confidence: number;               // Confidence level (0-1)
  probRange: [number, number];      // Probability range [min, max]
  lastUpdated: string;              // ISO timestamp of last update
  contributingCues: string[];       // Conversational cues that influenced this parameter
}

/**
 * Represents a single inference event in the conversation history
 */
export interface InferenceEvent {
  timestamp: string;                // ISO 8601 timestamp
  cue: string;                      // The user's conversational input
  param: string;                    // The parameter that was inferred
  contribution: number;             // How much this cue contributed (0-1)
  confidenceGain: number;           // How much confidence increased
  phase: InferencePhase;            // Which inference phase this occurred in
}

/**
 * Inference phases for the conversational analysis
 */
export enum InferencePhase {
  SURFACE = 'surface',
  LAYER_PEELING = 'layer_peeling',
  CORE_EXCAVATION = 'core_excavation',
  SOUL_MAPPING = 'soul_mapping'
}

/**
 * Dimensional data with confidence and parameter breakdown
 */
export interface DimensionData {
  value: number;                    // Final computed value
  confidence: number;               // Overall confidence for this dimension (0-1)
  probRange: [number, number];      // Probability range for the dimension
  paramBreakdown: {                 // Individual parameter contributions
    [paramId: string]: ParameterData;
  };
}

/**
 * Metaphysical Core dimension with archetype information
 */
export interface MetaphysicalCoreData extends DimensionData {
  degree: number;                   // Actual degree value (0-359.99)
  primaryArchetype: string;         // Primary archetype name
  archetypeTitle: string;           // Archetype title (e.g., "The Analyst")
  archetypeDistance: number;        // Distance from closest archetype
  anchorWeights: {                  // Weights for each archetype
    [archetypeName: string]: number;
  };
}

/**
 * Current state of the inference journey
 */
export interface InferenceJourney {
  currentPhase: InferencePhase;     // Current inference phase
  messageCount: number;             // Number of messages processed
  questionsAsked: number;           // Number of questions asked
  parametersInferred: number;       // Number of parameters with >0.3 confidence
  overallProgress: number;          // Overall progress (0-1)
  nextTargets: string[];            // Next parameters to focus on
  confidenceGrowth: number[];       // Historical confidence growth
}

/**
 * Complete user profile for the Harmony Algorithm
 */
export interface HarmonyUserProfile {
  // Identity
  userId: string;
  signatureCode: string;            // The #HHMMSS hex code
  
  // Overall metrics
  overallConfidence: number;        // 0-1, overall confidence in the profile
  rarityScore: number;              // 0-1, how rare this combination is
  
  // Dimensional data
  dimensions: {
    metaphysicalCore: MetaphysicalCoreData;
    manifestedSelf: DimensionData;
    humanSoul: DimensionData;
  };
  
  // Raw dimensional values
  rawDimensions: HarmonyDimensions;
  
  // Inference tracking
  inferenceHistory: InferenceEvent[];
  inferenceJourney: InferenceJourney;
  
  // Conversation data
  conversationHistory: ConversationMessage[];
  
  // Metadata
  metadata: {
    createdAt: string;              // ISO timestamp
    lastUpdated: string;            // ISO timestamp
    version: string;                // Profile version
    privacySettings: PrivacySettings;
  };
}

/**
 * A single conversation message
 */
export interface ConversationMessage {
  id: string;
  timestamp: string;
  sender: 'user' | 'ai';
  content: string;
  messageType: 'question' | 'response' | 'analysis';
  inferenceData?: {
    triggeredParameters: string[];
    confidenceChanges: { [param: string]: number };
  };
}

/**
 * Privacy settings for user data
 */
export interface PrivacySettings {
  dataRetention: 'session' | 'temporary' | 'permanent';
  analyticsOptIn: boolean;
  profileVisibility: 'private' | 'anonymous' | 'public';
  matchingOptIn: boolean;
}

/**
 * Compatibility match result
 */
export interface CompatibilityMatch {
  targetUserId: string;
  signatureCode: string;
  compatibilityScore: number;       // 0-100
  compatibilityBreakdown: {
    dimensional: number;            // Dimensional compatibility
    parameterLevel: number;         // Parameter-level compatibility
    complementarity: number;        // Complementarity bonus
    hueAlignment: number;           // Hue compatibility
    manifestedAlignment: number;    // Manifested self compatibility
    soulAlignment: number;          // Soul depth compatibility
  };
  distance: {
    hue: number;
    manifested: number;
    soul: number;
    weighted: number;
  };
  matchType: MatchType;
  isComplementaryMatch: boolean;
  matchReason: string;              // Why this match was suggested
  harmonyZone: HarmonyZone;         // Which compatibility zone
}

/**
 * Match types based on compatibility score
 */
export enum MatchType {
  SOULMATE = 'soulmate',              // 90-100%
  HIGH_COMPATIBILITY = 'high_compatibility',  // 80-89%
  GOOD_MATCH = 'good_match',          // 70-79%
  COMPLEMENTARY = 'complementary',     // 60-69%
  GROWTH_ORIENTED = 'growth_oriented', // 50-59%
  EXPLORATORY = 'exploratory',        // 40-49%
  INCOMPATIBLE = 'incompatible'       // 0-39%
}

/**
 * Harmony zones for compatibility filtering
 */
export enum HarmonyZone {
  INNER = 'inner',                    // Closest matches (80%+)
  MIDDLE = 'middle',                  // Complementary matches (60-80%)
  OUTER = 'outer',                    // Marginal matches (40-60%)
  EXCLUDED = 'excluded'               // Below threshold
}

/**
 * Filtering options for compatibility matching
 */
export interface MatchingOptions {
  minCompatibility: number;          // Minimum compatibility score (0-100)
  maxResults: number;                // Maximum number of results
  includeComplementary: boolean;     // Include complementary matches
  includeGrowthOriented: boolean;    // Include growth-oriented matches
  preferredArchetypes: string[];     // Preferred archetype names
  excludedArchetypes: string[];      // Excluded archetype names
  soulDepthRange: [number, number];  // Preferred soul depth range
  manifestedRange: [number, number]; // Preferred manifested range
  harmonyZones: HarmonyZone[];       // Which zones to include
}

/**
 * Result of a compatibility search
 */
export interface MatchingResult {
  matches: CompatibilityMatch[];
  totalCandidates: number;
  filteredCandidates: number;
  searchMetrics: {
    searchTime: number;              // Time in milliseconds
    filtersApplied: string[];
    averageCompatibility: number;
    topMatchScore: number;
  };
}

/**
 * Mock partner profile for testing and development
 */
export interface MockPartnerProfile {
  userId: string;
  signatureCode: string;
  dimensions: HarmonyDimensions;
  archetype: string;
  manifestedLevel: 'low' | 'medium' | 'high';
  soulDepth: 'surface' | 'moderate' | 'deep' | 'profound';
  tags: string[];                    // Additional tags for filtering
}

/**
 * Parameter definition for the inference system
 */
export interface ParameterDefinition {
  id: string;
  name: string;
  dimension: 'metaphysicalCore' | 'manifestedSelf' | 'humanSoul';
  type: 'spectrum' | 'scalar' | 'categorical';
  range: [number, number];
  weight: number;                    // Importance weight for this parameter
  categories?: string[];             // For categorical parameters
  inferenceCues: string[];           // Example conversational cues
  description: string;
  examples: string[];
}

/**
 * Complete parameter definitions for all 50 parameters
 */
export interface ParameterDefinitions {
  metaphysicalCore: ParameterDefinition[];
  manifestedSelf: ParameterDefinition[];
  humanSoul: ParameterDefinition[];
}

/**
 * Inference engine configuration
 */
export interface InferenceConfig {
  minConfidenceThreshold: number;    // Minimum confidence to consider parameter
  maxInferenceIterations: number;    // Maximum inference iterations
  questionCooldown: number;          // Time between questions (ms)
  phaseTransitionThreshold: number;  // Confidence needed to advance phases
  inconsistencyTolerance: number;    // Tolerance for contradictory cues
  temporalDecay: number;             // How much old cues decay over time
}

/**
 * NLP analysis result
 */
export interface NLPAnalysis {
  sentiment: {
    polarity: number;                // -1 to 1
    subjectivity: number;            // 0 to 1
    confidence: number;              // 0 to 1
  };
  keywords: string[];
  topics: string[];
  emotionalMarkers: string[];
  personalityIndicators: {
    [parameter: string]: number;
  };
  linguisticFeatures: {
    complexity: number;
    formality: number;
    emotionality: number;
  };
}

/**
 * Question generation context
 */
export interface QuestionContext {
  targetParameters: string[];
  currentPhase: InferencePhase;
  conversationHistory: ConversationMessage[];
  userProfile: HarmonyUserProfile;
  questionHistory: string[];
}

/**
 * Generated question with metadata
 */
export interface GeneratedQuestion {
  question: string;
  targetParameters: string[];
  expectedResponses: string[];
  questionType: 'open' | 'scenario' | 'preference' | 'reflection';
  priority: number;                  // 0-1, how important this question is
  followUp?: string;                 // Optional follow-up question
}

/**
 * Harmony algorithm configuration
 */
export interface HarmonyConfig {
  dimensions: {
    hue: {
      weight: number;
      circularDistance: boolean;
    };
    manifested: {
      weight: number;
      scalingFunction: 'linear' | 'quadratic' | 'logarithmic';
    };
    soul: {
      weight: number;
      scalingFunction: 'linear' | 'quadratic' | 'sqrt';
    };
  };
  compatibility: {
    proximityThreshold: number;      // 60% threshold
    complementarityBonus: number;    // Bonus for complementary matches
    maxDistance: number;             // Maximum distance for scoring
  };
  inference: InferenceConfig;
}

/**
 * System statistics and metrics
 */
export interface HarmonySystemStats {
  totalProfiles: number;
  averageConfidence: number;
  archetypeDistribution: { [archetype: string]: number };
  compatibilityMetrics: {
    averageScore: number;
    topScorePairings: Array<{ score: number; archetypes: [string, string] }>;
  };
  inferenceMetrics: {
    averageQuestionsToConvergence: number;
    mostDifficultParameters: string[];
    averageSessionLength: number;
  };
  performanceMetrics: {
    averageInferenceTime: number;
    averageMatchingTime: number;
    cacheHitRate: number;
  };
}

/**
 * Utility type for creating partial profiles during inference
 */
export type PartialHarmonyProfile = Partial<HarmonyUserProfile>;

/**
 * Utility type for parameter updates
 */
export type ParameterUpdate = {
  [paramId: string]: Partial<ParameterData>;
};

/**
 * Error types for the Harmony system
 */
export enum HarmonyErrorType {
  INVALID_SIGNATURE = 'invalid_signature',
  INSUFFICIENT_DATA = 'insufficient_data',
  INFERENCE_FAILED = 'inference_failed',
  COMPATIBILITY_ERROR = 'compatibility_error',
  STORAGE_ERROR = 'storage_error',
  VALIDATION_ERROR = 'validation_error'
}

/**
 * Custom error class for Harmony system
 */
export class HarmonyError extends Error {
  constructor(
    public type: HarmonyErrorType,
    message: string,
    public details?: any
  ) {
    super(message);
    this.name = 'HarmonyError';
  }
}

// All types are already exported individually above
// No need for default export to avoid conflicts