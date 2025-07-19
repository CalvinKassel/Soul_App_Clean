// Soul Types - Type definitions for the advanced hybrid matchmaking system
// Integrates HHC personality types with explicit factual preferences

import { HarmonyUserProfile, ConversationMessage, GeneratedQuestion } from './HarmonyTypes';

/**
 * Core Soul User Profile
 * Combines HHC personality with explicit factual data and learning history
 */
export interface SoulUserProfile {
  userId: string;
  
  // Core personality from HHC system
  hhcProfile: HarmonyUserProfile;
  
  // Explicit factual profile data
  factualProfile: FactualProfile;
  
  // Partner preferences with weights
  partnerPreferences: PartnerPreferences;
  
  // Dynamic preference weights learned over time
  dynamicPreferenceWeights: SoulPreferenceWeights;
  
  // Learning and interaction history
  learningHistory: SoulLearningHistory;
  
  // Compatibility scoring cache
  compatibilityCache: Map<string, SoulCompatibilityScore>;
  
  // Profile metadata
  metadata: SoulProfileMetadata;
}

/**
 * Factual Profile - Explicit user-provided data
 */
export interface FactualProfile {
  // Basic demographics
  age?: number;
  genderIdentity?: string;
  heightCm?: number;
  
  // Relationship and life goals
  relationshipGoal?: string;
  familyPlans?: string;
  
  // Education and career
  educationLevel?: string;
  profession?: string;
  
  // Lifestyle and habits
  exerciseHabits?: string;
  smokingHabits?: string;
  drinkingHabits?: string;
  dietaryPreferences?: string;
  sleepingHabits?: string;
  
  // Personal attributes
  languagesSpoken?: string[];
  zodiacSign?: string;
  pets?: string[];
  
  // Interests and hobbies
  interests?: string[];
  
  // Communication and relationship style
  communicationStyle?: string;
  loveLanguage?: string;
  
  // Location (for distance calculations)
  location?: {
    latitude: number;
    longitude: number;
    city?: string;
    country?: string;
  };
}

/**
 * Partner Preferences - What the user is looking for
 */
export interface PartnerPreferences {
  // Search parameters
  maxSearchDistanceKm?: number;
  desiredAgeRange?: [number, number];
  interestedInGenders?: string[];
  desiredPartnerHeight?: { min: number; max: number };
  
  // Relationship preferences
  relationshipGoal?: string | string[];
  familyPlans?: string | string[];
  
  // Lifestyle preferences
  smokingHabits?: string[];
  drinkingHabits?: string[];
  exerciseHabits?: string[];
  dietaryPreferences?: string[];
  
  // Interest preferences with weights
  interestPreferenceWeights?: Record<string, number>;
  
  // Hard requirements (veto criteria)
  vetoCriteria?: {
    nonSmokerOnly?: boolean;
    mustWantChildren?: boolean;
    mustNotHaveChildren?: boolean;
    minimumHeight?: number;
    maximumHeight?: number;
    minimumAge?: number;
    maximumAge?: number;
    requiredEducationLevel?: string;
    dealBreakerInterests?: string[];
    requiredInterests?: string[];
    [key: string]: any;
  };
}

/**
 * Dynamic Preference Weights - Learned importance of different attributes
 */
export interface SoulPreferenceWeights {
  // Demographics
  age: number;
  height: number;
  genderIdentity: number;
  
  // Relationship and life goals
  relationshipGoal: number;
  familyPlans: number;
  
  // Lifestyle factors
  lifestyle: number;
  exerciseHabits: number;
  smokingHabits: number;
  drinkingHabits: number;
  dietaryPreferences: number;
  
  // Personal attributes
  interests: number;
  communicationStyle: number;
  loveLanguage: number;
  educationLevel: number;
  
  // Values and beliefs
  values: number;
  religion: number;
  politicalViews: number;
  
  // Social factors
  socialEnergy: number;
  culturalBackground: number;
  
  // Additional dynamic weights
  [key: string]: number;
}

/**
 * Learning History - Tracks user interactions and preference evolution
 */
export interface SoulLearningHistory {
  totalInteractions: number;
  attributeQuestions: Map<string, number>;
  preferenceSignals: SoulInteractionSignal[];
  guessWhoSessions: GuessWhoSession[];
  learningMilestones: LearningMilestone[];
}

/**
 * Interaction Signal - Represents a single user interaction
 */
export interface SoulInteractionSignal {
  timestamp: string;
  candidateId: string;
  question: string;
  attributeInvolved: string;
  userReaction: 'positive' | 'negative' | 'neutral';
  attractionForce: number;
  repulsionForce: number;
  confidenceLevel: number;
  context?: {
    interactionType: string;
    sessionId?: string;
    additionalData?: any;
  };
}

/**
 * Guess Who Session - Represents a complete "Guess Who" interaction
 */
export interface GuessWhoSession {
  sessionId: string;
  candidateId: string;
  startTime: string;
  endTime?: string;
  questions: GuessWhoQuestion[];
  outcome: 'liked' | 'passed' | 'incomplete';
  learningOutcomes: LearningOutcome[];
}

/**
 * Individual Guess Who Question
 */
export interface GuessWhoQuestion {
  id: string;
  question: string;
  attributeTarget: string;
  userReaction: 'positive' | 'negative' | 'neutral';
  response?: string;
  timestamp: string;
  confidenceImpact: number;
}

/**
 * Learning Outcome - What was learned from an interaction
 */
export interface LearningOutcome {
  attribute: string;
  previousWeight: number;
  newWeight: number;
  confidenceChange: number;
  reasoning: string;
}

/**
 * Learning Milestone - Significant learning events
 */
export interface LearningMilestone {
  id: string;
  timestamp: string;
  type: 'preference_discovered' | 'weight_stabilized' | 'veto_identified' | 'interest_evolved';
  description: string;
  impact: 'low' | 'medium' | 'high';
  relatedAttributes: string[];
}

/**
 * Soul Compatibility Score - Comprehensive compatibility assessment
 */
export interface SoulCompatibilityScore {
  totalScore: number;
  hhcScore: number;
  factualScore: number;
  vetoFactor: number;
  breakdown: {
    personalityAlignment: number;
    factualAlignment: number;
    interestOverlap: number;
    preferenceMatch: number;
    vetoViolation: boolean;
  };
  confidenceLevel: number;
  explanation: string;
}

/**
 * Soul Matching Result - Complete matching outcome
 */
export interface SoulMatchingResult {
  totalMatches: number;
  matches: SoulMatch[];
  searchCriteria: SoulMatchingCriteria;
  systemInsights: SoulSystemInsights;
}

/**
 * Individual Soul Match
 */
export interface SoulMatch {
  candidate: SoulUserProfile;
  compatibility: SoulCompatibilityScore;
  soulFitScore: number;
  personalityInsights: PersonalityInsights;
  connectionPotential: ConnectionPotential;
  suggestedConversationStarters: string[];
}

/**
 * Matching Criteria used for search
 */
export interface SoulMatchingCriteria {
  minCompatibility: number;
  maxResults: number;
  hhcWeight: number;
  factualWeight: number;
  searchRadius?: number;
  preferredArchetypes?: string[];
  excludedArchetypes?: string[];
}

/**
 * System Insights about the matching results
 */
export interface SoulSystemInsights {
  averageCompatibility: number;
  topArchetypeMatches: string[];
  personalityDiversityScore: number;
  factsVsPersonalityBalance: number;
  learningRecommendations: string[];
}

/**
 * Personality Insights for a specific match
 */
export interface PersonalityInsights {
  complementaryTraits: string[];
  sharedStrengths: string[];
  potentialChallenges: string[];
  growthOpportunities: string[];
  communicationStyle: string;
  conflictStyle: string;
}

/**
 * Connection Potential assessment
 */
export interface ConnectionPotential {
  shortTermCompatibility: number;
  longTermCompatibility: number;
  growthPotential: number;
  passionAlignment: number;
  stabilityFactor: number;
  adventureCompatibility: number;
}

/**
 * Profile Metadata
 */
export interface SoulProfileMetadata {
  createdAt: string;
  lastUpdated: string;
  version: string;
  soulfitScore: number;
  profileCompleteness: number;
  learningProgress: number;
  privacySettings: SoulPrivacySettings;
  verificationStatus: VerificationStatus;
}

/**
 * Privacy Settings for Soul profiles
 */
export interface SoulPrivacySettings {
  dataRetention: 'temporary' | 'permanent';
  analyticsOptIn: boolean;
  profileVisibility: 'public' | 'private' | 'limited';
  matchingOptIn: boolean;
  guessWhoOptIn: boolean;
  learningOptIn: boolean;
  shareInsights: boolean;
}

/**
 * Verification Status
 */
export interface VerificationStatus {
  profileVerified: boolean;
  photosVerified: boolean;
  phoneVerified: boolean;
  emailVerified: boolean;
  identityVerified: boolean;
  verificationScore: number;
}

/**
 * Soul Configuration
 */
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
    maxInteractionsPerSession: number;
    weightStabilizationThreshold: number;
  };
  matching: {
    minCompatibility: number;
    maxCandidates: number;
    diversityBonus: number;
    distanceWeightDecay: number;
  };
  guessWho: {
    maxQuestionsPerSession: number;
    sessionTimeoutMinutes: number;
    adaptiveQuestionGeneration: boolean;
    personalizedQuestionTemplates: boolean;
  };
}

/**
 * Soul Matching Options
 */
export interface SoulMatchingOptions {
  minCompatibility: number;
  maxResults: number;
  includeComplementary: boolean;
  includeGrowthOriented: boolean;
  preferredArchetypes: string[];
  excludedArchetypes: string[];
  searchRadius?: number;
  ageRange?: [number, number];
  heightRange?: [number, number];
  prioritizeFactualAlignment: boolean;
  prioritizePersonalityAlignment: boolean;
  diversityWeight: number;
}

/**
 * Soul Question Generation Context
 */
export interface SoulQuestionContext {
  candidateId: string;
  targetAttribute: string;
  userLearningHistory: SoulLearningHistory;
  sessionProgress: number;
  previousQuestions: string[];
  personalityContext: {
    userArchetype: string;
    candidateArchetype: string;
    personalityDistance: number;
  };
}

/**
 * Soul Analytics Event
 */
export interface SoulAnalyticsEvent {
  eventType: 'interaction' | 'match' | 'preference_update' | 'session_complete';
  userId: string;
  timestamp: string;
  eventData: {
    candidateId?: string;
    attribute?: string;
    reaction?: string;
    weightChange?: number;
    sessionId?: string;
    compatibilityScore?: number;
    [key: string]: any;
  };
  systemContext: {
    version: string;
    configSnapshot: Partial<SoulConfig>;
    userProfileCompleteness: number;
  };
}

/**
 * Soul Error Types
 */
export enum SoulErrorType {
  PROFILE_NOT_FOUND = 'PROFILE_NOT_FOUND',
  INSUFFICIENT_DATA = 'INSUFFICIENT_DATA',
  LEARNING_FAILED = 'LEARNING_FAILED',
  MATCHING_FAILED = 'MATCHING_FAILED',
  INTERACTION_FAILED = 'INTERACTION_FAILED',
  CONFIGURATION_ERROR = 'CONFIGURATION_ERROR',
  STORAGE_ERROR = 'STORAGE_ERROR',
  VALIDATION_ERROR = 'VALIDATION_ERROR'
}

/**
 * Soul Error class
 */
export class SoulError extends Error {
  constructor(
    public type: SoulErrorType,
    message: string,
    public context?: any
  ) {
    super(message);
    this.name = 'SoulError';
  }
}

/**
 * Soul System Status
 */
export interface SoulSystemStatus {
  isInitialized: boolean;
  totalUsers: number;
  totalInteractions: number;
  averageLearningProgress: number;
  systemHealth: 'excellent' | 'good' | 'fair' | 'poor';
  performanceMetrics: {
    averageMatchingTime: number;
    averageQuestionGenerationTime: number;
    cacheHitRate: number;
    learningAccuracy: number;
  };
}

// All types are already exported individually above
// No need for re-export to avoid conflicts