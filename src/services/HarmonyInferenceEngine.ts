// Harmony Conversational Inference Engine
// Advanced AI-powered personality parameter inference through natural conversation

import {
  HarmonyUserProfile,
  ParameterData,
  InferenceEvent,
  InferencePhase,
  InferenceJourney,
  ConversationMessage,
  ParameterDefinition,
  ParameterDefinitions,
  NLPAnalysis,
  QuestionContext,
  GeneratedQuestion,
  InferenceConfig,
  HarmonyError,
  HarmonyErrorType,
  ParameterUpdate
} from '../types/HarmonyTypes';
import { generateHarmonySignature, HARMONY_ARCHETYPES } from './HarmonyCore';

/**
 * Core inference engine for the Harmony Algorithm
 * Handles probabilistic parameter inference through conversational analysis
 */
export class HarmonyInferenceEngine {
  private config: InferenceConfig;
  private parameterDefinitions: ParameterDefinitions;
  private nlpEngine: NLPEngine;
  private questionGenerator: QuestionGenerator;
  private initialized: boolean = false;

  constructor(config?: Partial<InferenceConfig>) {
    this.config = {
      minConfidenceThreshold: 0.3,
      maxInferenceIterations: 1000,
      questionCooldown: 5000,
      phaseTransitionThreshold: 0.7,
      inconsistencyTolerance: 0.2,
      temporalDecay: 0.95,
      ...config
    };

    this.parameterDefinitions = this.initializeParameterDefinitions();
    this.nlpEngine = new NLPEngine();
    this.questionGenerator = new QuestionGenerator(this.parameterDefinitions);
  }

  /**
   * Initialize the inference engine
   */
  async initialize(): Promise<void> {
    try {
      await this.nlpEngine.initialize();
      await this.questionGenerator.initialize();
      this.initialized = true;
    } catch (error) {
      throw new HarmonyError(
        HarmonyErrorType.INFERENCE_FAILED,
        'Failed to initialize inference engine',
        error
      );
    }
  }

  /**
   * Analyze a conversation and update the user profile
   */
  async analyzeConversation(
    userProfile: HarmonyUserProfile,
    newMessages: ConversationMessage[]
  ): Promise<HarmonyUserProfile> {
    if (!this.initialized) {
      await this.initialize();
    }

    try {
      // Process each new message
      for (const message of newMessages) {
        if (message.sender === 'user') {
          await this.processUserMessage(userProfile, message);
        }
      }

      // Update conversation history
      userProfile.conversationHistory.push(...newMessages);

      // Update inference journey
      this.updateInferenceJourney(userProfile);

      // Recompute signature code
      this.recomputeSignatureCode(userProfile);

      // Update metadata
      userProfile.metadata.lastUpdated = new Date().toISOString();

      return userProfile;
    } catch (error) {
      throw new HarmonyError(
        HarmonyErrorType.INFERENCE_FAILED,
        'Failed to analyze conversation',
        error
      );
    }
  }

  /**
   * Process a single user message for parameter inference
   */
  private async processUserMessage(
    userProfile: HarmonyUserProfile,
    message: ConversationMessage
  ): Promise<void> {
    // Analyze message with NLP
    const nlpAnalysis = await this.nlpEngine.analyzeMessage(message.content);

    // Extract parameter influences
    const parameterInfluences = this.extractParameterInfluences(nlpAnalysis, message);

    // Update parameters based on influences
    const parameterUpdates = this.calculateParameterUpdates(
      userProfile,
      parameterInfluences,
      message
    );

    // Apply updates to user profile
    this.applyParameterUpdates(userProfile, parameterUpdates, message);

    // Handle inconsistencies
    this.handleInconsistencies(userProfile, parameterUpdates);

    // Apply temporal decay to old inferences
    this.applyTemporalDecay(userProfile);
  }

  /**
   * Extract parameter influences from NLP analysis
   */
  private extractParameterInfluences(
    nlpAnalysis: NLPAnalysis,
    message: ConversationMessage
  ): Map<string, number> {
    const influences = new Map<string, number>();

    // Process personality indicators from NLP
    for (const [parameter, strength] of Object.entries(nlpAnalysis.personalityIndicators)) {
      if (strength > 0.1) {
        influences.set(parameter, strength);
      }
    }

    // Process sentiment indicators
    if (nlpAnalysis.sentiment.polarity > 0.3) {
      influences.set('life_satisfaction_resonance', nlpAnalysis.sentiment.polarity * 0.3);
      influences.set('inner_peace_resonance', nlpAnalysis.sentiment.polarity * 0.2);
    }

    // Process emotional markers
    for (const marker of nlpAnalysis.emotionalMarkers) {
      const parameterMapping = this.getEmotionalMarkerMapping(marker);
      if (parameterMapping) {
        influences.set(parameterMapping.parameter, parameterMapping.strength);
      }
    }

    // Process keywords for archetype identification
    const archetypeInfluences = this.extractArchetypeInfluences(nlpAnalysis.keywords);
    for (const [archetype, strength] of archetypeInfluences) {
      influences.set(`archetype_${archetype.toLowerCase()}`, strength);
    }

    // Process linguistic features
    const linguisticInfluences = this.extractLinguisticInfluences(nlpAnalysis.linguisticFeatures);
    for (const [parameter, strength] of linguisticInfluences) {
      influences.set(parameter, strength);
    }

    return influences;
  }

  /**
   * Calculate parameter updates based on influences
   */
  private calculateParameterUpdates(
    userProfile: HarmonyUserProfile,
    influences: Map<string, number>,
    message: ConversationMessage
  ): ParameterUpdate {
    const updates: ParameterUpdate = {};

    for (const [paramId, influence] of influences) {
      const existingParam = this.getExistingParameter(userProfile, paramId);
      const paramDefinition = this.getParameterDefinition(paramId);

      if (paramDefinition) {
        const currentValue = existingParam?.value || 50; // Default middle value
        const currentConfidence = existingParam?.confidence || 0;

        // Calculate new value using weighted average
        const influenceWeight = influence * 0.3; // Scale influence
        const newValue = this.calculateWeightedAverage(
          currentValue,
          currentConfidence,
          influence * 100,
          influenceWeight
        );

        // Calculate new confidence
        const newConfidence = Math.min(1, currentConfidence + influenceWeight * 0.5);

        // Update probability range
        const newProbRange = this.calculateProbabilityRange(
          newValue,
          newConfidence,
          paramDefinition.range
        );

        updates[paramId] = {
          value: newValue,
          confidence: newConfidence,
          probRange: newProbRange,
          lastUpdated: new Date().toISOString(),
          contributingCues: [...(existingParam?.contributingCues || []), message.content]
        };
      }
    }

    return updates;
  }

  /**
   * Apply parameter updates to user profile
   */
  private applyParameterUpdates(
    userProfile: HarmonyUserProfile,
    updates: ParameterUpdate,
    message: ConversationMessage
  ): void {
    for (const [paramId, update] of Object.entries(updates)) {
      const dimension = this.getParameterDimension(paramId);
      
      if (dimension) {
        // Update parameter data
        userProfile.dimensions[dimension].paramBreakdown[paramId] = {
          ...userProfile.dimensions[dimension].paramBreakdown[paramId],
          ...update
        };

        // Add to inference history
        const inferenceEvent: InferenceEvent = {
          timestamp: new Date().toISOString(),
          cue: message.content,
          param: paramId,
          contribution: update.confidence || 0,
          confidenceGain: update.confidence || 0,
          phase: userProfile.inferenceJourney.currentPhase
        };

        userProfile.inferenceHistory.push(inferenceEvent);
      }
    }

    // Update dimensional confidence scores
    this.updateDimensionalConfidence(userProfile);
  }

  /**
   * Handle inconsistencies in parameter inferences
   */
  private handleInconsistencies(
    userProfile: HarmonyUserProfile,
    updates: ParameterUpdate
  ): void {
    // Check for contradictory parameter values
    for (const [paramId, update] of Object.entries(updates)) {
      const existingParam = this.getExistingParameter(userProfile, paramId);
      
      if (existingParam && existingParam.confidence > 0.5) {
        const valueDifference = Math.abs(existingParam.value - (update.value || 0));
        
        if (valueDifference > 30) { // Significant contradiction
          // Reduce confidence for both values
          const dimension = this.getParameterDimension(paramId);
          if (dimension) {
            userProfile.dimensions[dimension].paramBreakdown[paramId].confidence *= 0.8;
            if (update.confidence) {
              update.confidence *= 0.8;
            }
          }
        }
      }
    }
  }

  /**
   * Apply temporal decay to old inferences
   */
  private applyTemporalDecay(userProfile: HarmonyUserProfile): void {
    const now = new Date().getTime();
    const decayRate = this.config.temporalDecay;

    for (const dimension of Object.values(userProfile.dimensions)) {
      for (const [paramId, paramData] of Object.entries(dimension.paramBreakdown)) {
        const lastUpdated = new Date(paramData.lastUpdated).getTime();
        const hoursSinceUpdate = (now - lastUpdated) / (1000 * 60 * 60);
        
        if (hoursSinceUpdate > 24) { // Apply decay after 24 hours
          const decayFactor = Math.pow(decayRate, hoursSinceUpdate / 24);
          paramData.confidence *= decayFactor;
        }
      }
    }
  }

  /**
   * Update the inference journey progress
   */
  private updateInferenceJourney(userProfile: HarmonyUserProfile): void {
    const journey = userProfile.inferenceJourney;
    
    // Update message count
    journey.messageCount = userProfile.conversationHistory.length;

    // Count parameters with sufficient confidence
    journey.parametersInferred = this.countConfidentParameters(userProfile);

    // Calculate overall progress
    journey.overallProgress = journey.parametersInferred / 50; // 50 total parameters

    // Update current phase
    journey.currentPhase = this.determineCurrentPhase(journey);

    // Update next targets
    journey.nextTargets = this.determineNextTargets(userProfile);

    // Update confidence growth
    journey.confidenceGrowth.push(userProfile.overallConfidence);
    if (journey.confidenceGrowth.length > 100) {
      journey.confidenceGrowth = journey.confidenceGrowth.slice(-100);
    }
  }

  /**
   * Recompute the signature code based on updated parameters
   */
  private recomputeSignatureCode(userProfile: HarmonyUserProfile): void {
    // Extract archetype weights
    const archetypeWeights: { [key: string]: number } = {};
    for (const archetype of HARMONY_ARCHETYPES) {
      const paramId = `archetype_${archetype.name.toLowerCase()}`;
      const param = this.getExistingParameter(userProfile, paramId);
      if (param && param.confidence > this.config.minConfidenceThreshold) {
        archetypeWeights[archetype.name.toLowerCase()] = param.value / 100;
      }
    }

    // Extract manifested self parameters
    const manifestedParams: { [key: string]: number } = {};
    for (const [paramId, paramData] of Object.entries(
      userProfile.dimensions.manifestedSelf.paramBreakdown
    )) {
      if (paramData.confidence > this.config.minConfidenceThreshold) {
        manifestedParams[paramId] = paramData.value;
      }
    }

    // Extract soul parameters
    const soulParams: { [key: string]: number } = {};
    for (const [paramId, paramData] of Object.entries(
      userProfile.dimensions.humanSoul.paramBreakdown
    )) {
      if (paramData.confidence > this.config.minConfidenceThreshold) {
        soulParams[paramId] = paramData.value;
      }
    }

    // Generate new signature code
    const newSignature = generateHarmonySignature(
      archetypeWeights,
      manifestedParams,
      soulParams
    );

    // Update profile
    userProfile.signatureCode = newSignature;
    userProfile.overallConfidence = this.calculateOverallConfidence(userProfile);
  }

  /**
   * Generate the next question based on current profile state
   */
  async generateNextQuestion(userProfile: HarmonyUserProfile): Promise<GeneratedQuestion> {
    const context: QuestionContext = {
      targetParameters: this.determineNextTargets(userProfile),
      currentPhase: userProfile.inferenceJourney.currentPhase,
      conversationHistory: userProfile.conversationHistory,
      userProfile,
      questionHistory: this.extractQuestionHistory(userProfile)
    };

    return this.questionGenerator.generateQuestion(context);
  }

  /**
   * Utility methods
   */
  private initializeParameterDefinitions(): ParameterDefinitions {
    // This would be loaded from the knowledge base
    // For now, return a basic structure
    return {
      metaphysicalCore: [],
      manifestedSelf: [],
      humanSoul: []
    };
  }

  private getExistingParameter(userProfile: HarmonyUserProfile, paramId: string): ParameterData | null {
    for (const dimension of Object.values(userProfile.dimensions)) {
      if (dimension.paramBreakdown[paramId]) {
        return dimension.paramBreakdown[paramId];
      }
    }
    return null;
  }

  private getParameterDefinition(paramId: string): ParameterDefinition | null {
    const allParams = [
      ...this.parameterDefinitions.metaphysicalCore,
      ...this.parameterDefinitions.manifestedSelf,
      ...this.parameterDefinitions.humanSoul
    ];
    
    return allParams.find(p => p.id === paramId) || null;
  }

  private getParameterDimension(paramId: string): 'metaphysicalCore' | 'manifestedSelf' | 'humanSoul' | null {
    if (paramId.startsWith('archetype_')) return 'metaphysicalCore';
    
    const param = this.getParameterDefinition(paramId);
    return param?.dimension || null;
  }

  private calculateWeightedAverage(
    currentValue: number,
    currentWeight: number,
    newValue: number,
    newWeight: number
  ): number {
    const totalWeight = currentWeight + newWeight;
    if (totalWeight === 0) return newValue;
    
    return (currentValue * currentWeight + newValue * newWeight) / totalWeight;
  }

  private calculateProbabilityRange(
    value: number,
    confidence: number,
    allowedRange: [number, number]
  ): [number, number] {
    const uncertainty = (1 - confidence) * 50; // Max uncertainty of 50 points
    const min = Math.max(allowedRange[0], value - uncertainty);
    const max = Math.min(allowedRange[1], value + uncertainty);
    return [min, max];
  }

  private updateDimensionalConfidence(userProfile: HarmonyUserProfile): void {
    for (const [dimensionName, dimensionData] of Object.entries(userProfile.dimensions)) {
      let totalConfidence = 0;
      let paramCount = 0;

      for (const paramData of Object.values(dimensionData.paramBreakdown)) {
        totalConfidence += paramData.confidence;
        paramCount++;
      }

      dimensionData.confidence = paramCount > 0 ? totalConfidence / paramCount : 0;
    }
  }

  private countConfidentParameters(userProfile: HarmonyUserProfile): number {
    let count = 0;
    for (const dimension of Object.values(userProfile.dimensions)) {
      for (const paramData of Object.values(dimension.paramBreakdown)) {
        if (paramData.confidence > this.config.minConfidenceThreshold) {
          count++;
        }
      }
    }
    return count;
  }

  private determineCurrentPhase(journey: InferenceJourney): InferencePhase {
    if (journey.messageCount <= 25) return InferencePhase.SURFACE;
    if (journey.messageCount <= 75) return InferencePhase.LAYER_PEELING;
    if (journey.messageCount <= 150) return InferencePhase.CORE_EXCAVATION;
    return InferencePhase.SOUL_MAPPING;
  }

  private determineNextTargets(userProfile: HarmonyUserProfile): string[] {
    const targets: Array<{ paramId: string; confidence: number }> = [];

    for (const dimension of Object.values(userProfile.dimensions)) {
      for (const [paramId, paramData] of Object.entries(dimension.paramBreakdown)) {
        if (paramData.confidence < this.config.phaseTransitionThreshold) {
          targets.push({ paramId, confidence: paramData.confidence });
        }
      }
    }

    // Sort by lowest confidence first
    targets.sort((a, b) => a.confidence - b.confidence);
    
    return targets.slice(0, 5).map(t => t.paramId);
  }

  private calculateOverallConfidence(userProfile: HarmonyUserProfile): number {
    let totalConfidence = 0;
    let dimensionCount = 0;

    for (const dimension of Object.values(userProfile.dimensions)) {
      totalConfidence += dimension.confidence;
      dimensionCount++;
    }

    return dimensionCount > 0 ? totalConfidence / dimensionCount : 0;
  }

  private extractQuestionHistory(userProfile: HarmonyUserProfile): string[] {
    return userProfile.conversationHistory
      .filter(msg => msg.sender === 'ai' && msg.messageType === 'question')
      .map(msg => msg.content);
  }

  private getEmotionalMarkerMapping(marker: string): { parameter: string; strength: number } | null {
    const mappings: { [key: string]: { parameter: string; strength: number } } = {
      'joy': { parameter: 'life_satisfaction_resonance', strength: 0.4 },
      'sadness': { parameter: 'emotional_regulation_mastery', strength: -0.3 },
      'anger': { parameter: 'emotional_regulation_mastery', strength: -0.4 },
      'fear': { parameter: 'confidence_resonance', strength: -0.3 },
      'love': { parameter: 'unconditional_love_capacity', strength: 0.5 },
      'peace': { parameter: 'inner_peace_resonance', strength: 0.4 }
    };

    return mappings[marker] || null;
  }

  private extractArchetypeInfluences(keywords: string[]): Map<string, number> {
    const influences = new Map<string, number>();
    
    // This would be much more sophisticated in the real implementation
    const archetypeKeywords = {
      'cognitive': ['think', 'analyze', 'logic', 'reason', 'rational'],
      'visionary': ['imagine', 'create', 'future', 'possibility', 'innovation'],
      'relational': ['connect', 'relationship', 'emotional', 'empathy', 'together'],
      'nurturing': ['care', 'support', 'harmony', 'help', 'compassion'],
      'purposeful': ['meaning', 'purpose', 'values', 'principle', 'cause'],
      'driven': ['achieve', 'goal', 'success', 'ambition', 'determination'],
      'experiential': ['experience', 'adventure', 'present', 'sensation', 'immersion'],
      'analytical': ['system', 'organize', 'detail', 'method', 'structure']
    };

    for (const [archetype, archetypeKeywordList] of Object.entries(archetypeKeywords)) {
      let strength = 0;
      for (const keyword of keywords) {
        if (archetypeKeywordList.includes(keyword.toLowerCase())) {
          strength += 0.2;
        }
      }
      if (strength > 0) {
        influences.set(archetype, Math.min(1, strength));
      }
    }

    return influences;
  }

  private extractLinguisticInfluences(features: any): Map<string, number> {
    const influences = new Map<string, number>();

    if (features.complexity > 0.7) {
      influences.set('abstract_concrete_thinking', 0.3);
    }

    if (features.formality > 0.6) {
      influences.set('communication_clarity', 0.2);
    }

    if (features.emotionality > 0.5) {
      influences.set('emotional_intelligence_application', 0.25);
    }

    return influences;
  }
}

/**
 * NLP Engine for message analysis
 */
class NLPEngine {
  async initialize(): Promise<void> {
    // Initialize NLP models
  }

  async analyzeMessage(content: string): Promise<NLPAnalysis> {
    // This would use advanced NLP models
    // For now, return mock analysis
    return {
      sentiment: {
        polarity: 0,
        subjectivity: 0.5,
        confidence: 0.7
      },
      keywords: this.extractKeywords(content),
      topics: [],
      emotionalMarkers: this.extractEmotionalMarkers(content),
      personalityIndicators: {},
      linguisticFeatures: {
        complexity: this.calculateComplexity(content),
        formality: this.calculateFormality(content),
        emotionality: this.calculateEmotionality(content)
      }
    };
  }

  private extractKeywords(content: string): string[] {
    return content.toLowerCase()
      .split(/\s+/)
      .filter(word => word.length > 3)
      .slice(0, 10);
  }

  private extractEmotionalMarkers(content: string): string[] {
    const emotionalWords = ['happy', 'sad', 'angry', 'excited', 'peaceful', 'love', 'fear'];
    return emotionalWords.filter(word => 
      content.toLowerCase().includes(word)
    );
  }

  private calculateComplexity(content: string): number {
    const words = content.split(/\s+/);
    const avgWordLength = words.reduce((sum, word) => sum + word.length, 0) / words.length;
    return Math.min(1, avgWordLength / 10);
  }

  private calculateFormality(content: string): number {
    const formalWords = ['therefore', 'however', 'furthermore', 'consequently'];
    const formalCount = formalWords.filter(word => 
      content.toLowerCase().includes(word)
    ).length;
    return Math.min(1, formalCount / 10);
  }

  private calculateEmotionality(content: string): number {
    const emotionalPunctuation = (content.match(/[!?]/g) || []).length;
    const emotionalWords = this.extractEmotionalMarkers(content).length;
    return Math.min(1, (emotionalPunctuation + emotionalWords) / 10);
  }
}

/**
 * Question Generator for guided inference
 */
class QuestionGenerator {
  private parameterDefinitions: ParameterDefinitions;

  constructor(parameterDefinitions: ParameterDefinitions) {
    this.parameterDefinitions = parameterDefinitions;
  }

  async initialize(): Promise<void> {
    // Initialize question templates
  }

  async generateQuestion(context: QuestionContext): Promise<GeneratedQuestion> {
    // This would use sophisticated question generation
    // For now, return a basic question
    const targetParam = context.targetParameters[0];
    
    return {
      question: `Can you tell me about a time when you felt most like yourself?`,
      targetParameters: [targetParam],
      expectedResponses: [],
      questionType: 'reflection',
      priority: 0.8
    };
  }
}

export default HarmonyInferenceEngine;