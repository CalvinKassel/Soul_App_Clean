// Soul Interaction Engine - Handles "Guess Who" learning and dynamic preference evolution
// Implements attraction/repulsion forces and conversational question generation

import {
  SoulUserProfile,
  SoulInteractionSignal,
  GuessWhoSession,
  GuessWhoQuestion,
  LearningOutcome,
  LearningMilestone,
  SoulQuestionContext,
  SoulConfig,
  SoulError,
  SoulErrorType
} from '../types/SoulTypes';
import { GeneratedQuestion, InferencePhase } from '../types/HarmonyTypes';
import { getArchetypeFromHue } from './HarmonyCore';

/**
 * Soul Interaction Engine
 * Manages conversational learning through "Guess Who" interactions
 * Implements dynamic preference weight adjustment using attraction/repulsion forces
 */
export class SoulInteractionEngine {
  private config: SoulConfig;
  private activeSessions: Map<string, GuessWhoSession> = new Map();
  private questionTemplates: Map<string, string[]> = new Map();
  private learningPatterns: Map<string, any> = new Map();

  constructor(config: SoulConfig) {
    this.config = config;
    this.initializeQuestionTemplates();
  }

  /**
   * Start a new "Guess Who" session with a candidate
   */
  async startGuessWhoSession(
    userId: string,
    candidateId: string,
    userProfile: SoulUserProfile
  ): Promise<GuessWhoSession> {
    const sessionId = `guess_who_${userId}_${candidateId}_${Date.now()}`;
    
    const session: GuessWhoSession = {
      sessionId,
      candidateId,
      startTime: new Date().toISOString(),
      questions: [],
      outcome: 'incomplete',
      learningOutcomes: []
    };

    this.activeSessions.set(sessionId, session);
    
    // Generate initial question
    const initialQuestion = await this.generateAdaptiveQuestion(
      userProfile,
      candidateId,
      session
    );
    
    return session;
  }

  /**
   * Generate adaptive questions based on user's learning history and gaps
   */
  async generateAdaptiveQuestion(
    userProfile: SoulUserProfile,
    candidateId: string,
    session: GuessWhoSession
  ): Promise<GuessWhoQuestion> {
    const context = this.buildQuestionContext(userProfile, candidateId, session);
    
    // Identify priority attributes to explore
    const priorityAttributes = this.identifyPriorityAttributes(userProfile, context);
    
    // Select optimal attribute based on learning strategy
    const targetAttribute = this.selectOptimalAttribute(priorityAttributes, context);
    
    // Generate personalized question
    const question = this.generatePersonalizedQuestion(targetAttribute, context);
    
    const guessWhoQuestion: GuessWhoQuestion = {
      id: `question_${Date.now()}`,
      question,
      attributeTarget: targetAttribute,
      userReaction: 'neutral',
      timestamp: new Date().toISOString(),
      confidenceImpact: this.calculatePotentialConfidenceImpact(targetAttribute, userProfile)
    };

    return guessWhoQuestion;
  }

  /**
   * Process user's answer and reaction to update preferences
   */
  async processUserResponse(
    sessionId: string,
    questionId: string,
    response: string,
    reaction: 'positive' | 'negative' | 'neutral',
    userProfile: SoulUserProfile
  ): Promise<SoulInteractionSignal> {
    const session = this.activeSessions.get(sessionId);
    if (!session) {
      throw new SoulError(
        SoulErrorType.INTERACTION_FAILED,
        'Session not found'
      );
    }

    const question = session.questions.find(q => q.id === questionId);
    if (!question) {
      throw new SoulError(
        SoulErrorType.INTERACTION_FAILED,
        'Question not found'
      );
    }

    // Update question with response
    question.userReaction = reaction;
    question.response = response;

    // Create interaction signal
    const signal: SoulInteractionSignal = {
      timestamp: new Date().toISOString(),
      candidateId: session.candidateId,
      question: question.question,
      attributeInvolved: question.attributeTarget,
      userReaction: reaction,
      attractionForce: this.calculateAttractionForce(reaction, question.attributeTarget, userProfile),
      repulsionForce: this.calculateRepulsionForce(reaction, question.attributeTarget, userProfile),
      confidenceLevel: this.calculateInteractionConfidence(question, response, reaction),
      context: {
        interactionType: 'guess_who',
        sessionId,
        additionalData: {
          questionId,
          response,
          candidateId: session.candidateId
        }
      }
    };

    // Update preference weights based on signal
    const learningOutcome = await this.updatePreferenceWeights(userProfile, signal);
    session.learningOutcomes.push(learningOutcome);

    // Check for learning milestones
    await this.checkForLearningMilestones(userProfile, signal, learningOutcome);

    return signal;
  }

  /**
   * Update preference weights using attraction/repulsion dynamics
   */
  async updatePreferenceWeights(
    userProfile: SoulUserProfile,
    signal: SoulInteractionSignal
  ): Promise<LearningOutcome> {
    const attribute = signal.attributeInvolved;
    const previousWeight = userProfile.dynamicPreferenceWeights[attribute] || 0;
    
    // Calculate net force
    const netForce = signal.attractionForce - signal.repulsionForce;
    
    // Apply temporal decay to previous interactions
    const decayedWeight = previousWeight * this.config.learning.attractionDecay;
    
    // Calculate weight change
    const weightChange = this.config.learning.learningRate * netForce * signal.confidenceLevel;
    
    // Apply weight change with bounds
    const rawNewWeight = decayedWeight + weightChange;
    const boundedWeight = Math.max(0, Math.min(1, rawNewWeight));
    
    // Update the weight
    userProfile.dynamicPreferenceWeights[attribute] = boundedWeight;
    
    // Normalize all weights to maintain balance
    this.normalizeWeights(userProfile.dynamicPreferenceWeights);
    
    // Create learning outcome
    const learningOutcome: LearningOutcome = {
      attribute,
      previousWeight,
      newWeight: boundedWeight,
      confidenceChange: signal.confidenceLevel,
      reasoning: this.generateLearningReasoning(signal, previousWeight, boundedWeight)
    };

    return learningOutcome;
  }

  /**
   * Calculate attraction force based on user reaction
   */
  private calculateAttractionForce(
    reaction: 'positive' | 'negative' | 'neutral',
    attribute: string,
    userProfile: SoulUserProfile
  ): number {
    const baseAttraction = {
      positive: 0.3,
      neutral: 0.05,
      negative: 0
    };

    let force = baseAttraction[reaction];
    
    // Amplify attraction for underexplored attributes
    const explorationCount = userProfile.learningHistory.attributeQuestions.get(attribute) || 0;
    if (explorationCount < 3) {
      force *= 1.5;
    }
    
    // Amplify for attributes with current low confidence
    const currentWeight = userProfile.dynamicPreferenceWeights[attribute] || 0;
    if (currentWeight < 0.2) {
      force *= 1.3;
    }

    return force;
  }

  /**
   * Calculate repulsion force based on user reaction
   */
  private calculateRepulsionForce(
    reaction: 'positive' | 'negative' | 'neutral',
    attribute: string,
    userProfile: SoulUserProfile
  ): number {
    const baseRepulsion = {
      negative: 0.25,
      neutral: 0.02,
      positive: 0
    };

    let force = baseRepulsion[reaction];
    
    // Amplify repulsion for consistently negative reactions
    const negativeReactions = userProfile.learningHistory.preferenceSignals
      .filter(s => s.attributeInvolved === attribute && s.userReaction === 'negative')
      .length;
    
    if (negativeReactions > 2) {
      force *= 1.4;
    }

    return force;
  }

  /**
   * Calculate interaction confidence based on question quality and response
   */
  private calculateInteractionConfidence(
    question: GuessWhoQuestion,
    response: string,
    reaction: 'positive' | 'negative' | 'neutral'
  ): number {
    let confidence = 0.5; // Base confidence
    
    // Reaction strength contributes to confidence
    const reactionConfidence = {
      positive: 0.8,
      negative: 0.8,
      neutral: 0.3
    };
    
    confidence = reactionConfidence[reaction];
    
    // Response length and specificity
    if (response && response.length > 20) {
      confidence += 0.1;
    }
    
    // Question specificity
    if (question.question.includes('?') && question.question.length > 30) {
      confidence += 0.1;
    }
    
    return Math.min(1, confidence);
  }

  /**
   * Identify priority attributes for exploration
   */
  private identifyPriorityAttributes(
    userProfile: SoulUserProfile,
    context: SoulQuestionContext
  ): string[] {
    const weights = userProfile.dynamicPreferenceWeights;
    const explorationCounts = userProfile.learningHistory.attributeQuestions;
    
    // Score attributes by learning priority
    const attributeScores = Object.keys(weights).map(attr => {
      const currentWeight = weights[attr] || 0;
      const explorationCount = explorationCounts.get(attr) || 0;
      
      // Priority factors
      const unexploredBonus = explorationCount === 0 ? 0.5 : 0;
      const lowConfidenceBonus = currentWeight < 0.3 ? 0.3 : 0;
      const importanceBonus = currentWeight > 0.7 ? 0.2 : 0;
      
      const score = unexploredBonus + lowConfidenceBonus + importanceBonus;
      
      return { attribute: attr, score };
    });
    
    // Sort by score and return top attributes
    return attributeScores
      .sort((a, b) => b.score - a.score)
      .slice(0, 5)
      .map(item => item.attribute);
  }

  /**
   * Select optimal attribute based on learning strategy
   */
  private selectOptimalAttribute(
    priorityAttributes: string[],
    context: SoulQuestionContext
  ): string {
    if (priorityAttributes.length === 0) {
      return 'interests'; // Default fallback
    }
    
    // Use round-robin strategy for exploration
    const sessionProgress = context.sessionProgress;
    const index = sessionProgress % priorityAttributes.length;
    
    return priorityAttributes[index];
  }

  /**
   * Generate personalized question based on attribute and context
   */
  private generatePersonalizedQuestion(
    targetAttribute: string,
    context: SoulQuestionContext
  ): string {
    const templates = this.questionTemplates.get(targetAttribute) || [];
    const userArchetype = context.personalityContext.userArchetype;
    
    // Select template based on user's archetype
    const template = this.selectTemplateForArchetype(templates, userArchetype);
    
    // Personalize the template
    return this.personalizeTemplate(template, context);
  }

  /**
   * Build question context for generation
   */
  private buildQuestionContext(
    userProfile: SoulUserProfile,
    candidateId: string,
    session: GuessWhoSession
  ): SoulQuestionContext {
    const userArchetype = getArchetypeFromHue(userProfile.hhcProfile.rawDimensions.hue);
    
    return {
      candidateId,
      targetAttribute: '',
      userLearningHistory: userProfile.learningHistory,
      sessionProgress: session.questions.length,
      previousQuestions: session.questions.map(q => q.question),
      personalityContext: {
        userArchetype: userArchetype.name,
        candidateArchetype: 'Unknown', // Would be filled from candidate profile
        personalityDistance: 0
      }
    };
  }

  /**
   * Check for learning milestones and create records
   */
  private async checkForLearningMilestones(
    userProfile: SoulUserProfile,
    signal: SoulInteractionSignal,
    outcome: LearningOutcome
  ): Promise<void> {
    const milestones: LearningMilestone[] = [];
    
    // Check for weight stabilization
    if (Math.abs(outcome.newWeight - outcome.previousWeight) < 0.05) {
      milestones.push({
        id: `milestone_${Date.now()}`,
        timestamp: new Date().toISOString(),
        type: 'weight_stabilized',
        description: `Preference weight for ${outcome.attribute} has stabilized`,
        impact: 'medium',
        relatedAttributes: [outcome.attribute]
      });
    }
    
    // Check for strong preference discovery
    if (outcome.newWeight > 0.8 && outcome.previousWeight < 0.5) {
      milestones.push({
        id: `milestone_${Date.now()}`,
        timestamp: new Date().toISOString(),
        type: 'preference_discovered',
        description: `Strong preference discovered for ${outcome.attribute}`,
        impact: 'high',
        relatedAttributes: [outcome.attribute]
      });
    }
    
    // Check for veto identification
    if (signal.repulsionForce > 0.3 && signal.userReaction === 'negative') {
      milestones.push({
        id: `milestone_${Date.now()}`,
        timestamp: new Date().toISOString(),
        type: 'veto_identified',
        description: `Potential veto criteria identified for ${outcome.attribute}`,
        impact: 'high',
        relatedAttributes: [outcome.attribute]
      });
    }
    
    // Add milestones to user profile
    userProfile.learningHistory.learningMilestones.push(...milestones);
  }

  /**
   * Generate learning reasoning explanation
   */
  private generateLearningReasoning(
    signal: SoulInteractionSignal,
    previousWeight: number,
    newWeight: number
  ): string {
    const change = newWeight - previousWeight;
    const attribute = signal.attributeInvolved;
    
    if (change > 0.1) {
      return `Increased importance of ${attribute} due to ${signal.userReaction} reaction`;
    } else if (change < -0.1) {
      return `Decreased importance of ${attribute} due to ${signal.userReaction} reaction`;
    } else {
      return `Minor adjustment to ${attribute} preference based on interaction`;
    }
  }

  /**
   * Normalize preference weights to maintain balance
   */
  private normalizeWeights(weights: { [key: string]: number }): void {
    const totalWeight = Object.values(weights).reduce((sum, w) => sum + w, 0);
    
    if (totalWeight > 0) {
      for (const key in weights) {
        weights[key] = weights[key] / totalWeight;
      }
    }
  }

  /**
   * Calculate potential confidence impact of exploring an attribute
   */
  private calculatePotentialConfidenceImpact(
    attribute: string,
    userProfile: SoulUserProfile
  ): number {
    const currentWeight = userProfile.dynamicPreferenceWeights[attribute] || 0;
    const explorationCount = userProfile.learningHistory.attributeQuestions.get(attribute) || 0;
    
    // Higher impact for unexplored or low-confidence attributes
    let impact = 0.5;
    
    if (explorationCount === 0) impact += 0.3;
    if (currentWeight < 0.2) impact += 0.2;
    
    return Math.min(1, impact);
  }

  /**
   * Select question template based on user archetype
   */
  private selectTemplateForArchetype(templates: string[], archetype: string): string {
    if (templates.length === 0) return "What would you like to know about them?";
    
    // For now, use simple random selection
    // In a full implementation, this would be more sophisticated
    const randomIndex = Math.floor(Math.random() * templates.length);
    return templates[randomIndex];
  }

  /**
   * Personalize template with context
   */
  private personalizeTemplate(template: string, context: SoulQuestionContext): string {
    // Replace placeholders with context-specific information
    let personalized = template;
    
    // Add personalization based on context
    if (context.sessionProgress > 0) {
      personalized = `Following up on our conversation... ${personalized}`;
    }
    
    return personalized;
  }

  /**
   * Initialize question templates for different attributes
   */
  private initializeQuestionTemplates(): void {
    this.questionTemplates.set('age', [
      "What age range feels right for you?",
      "Do you prefer someone around your age?",
      "How important is age compatibility to you?"
    ]);
    
    this.questionTemplates.set('height', [
      "Do you have height preferences?",
      "How important is physical compatibility?",
      "What height range appeals to you?"
    ]);
    
    this.questionTemplates.set('interests', [
      "What hobbies or interests caught your attention?",
      "Are shared interests important to you?",
      "What activities would you want to do together?"
    ]);
    
    this.questionTemplates.set('familyPlans', [
      "Are family plans important to you?",
      "How do you feel about having children?",
      "What's your ideal family situation?"
    ]);
    
    this.questionTemplates.set('lifestyle', [
      "How important is lifestyle compatibility?",
      "What kind of lifestyle appeals to you?",
      "Do you prefer similar daily routines?"
    ]);
    
    this.questionTemplates.set('exerciseHabits', [
      "How important is fitness in a relationship?",
      "Do you prefer an active partner?",
      "What role does exercise play in your life?"
    ]);
    
    this.questionTemplates.set('smokingHabits', [
      "How do you feel about smoking?",
      "Is this a deal-breaker for you?",
      "What are your thoughts on smoking in relationships?"
    ]);
    
    this.questionTemplates.set('relationshipGoal', [
      "What kind of relationship are you looking for?",
      "How important is relationship goal alignment?",
      "Are you looking for something serious?"
    ]);
    
    this.questionTemplates.set('communicationStyle', [
      "How do you prefer to communicate?",
      "Is communication style important to you?",
      "What communication patterns work best for you?"
    ]);
    
    this.questionTemplates.set('values', [
      "What values are most important to you?",
      "How important is values alignment?",
      "What core beliefs matter most in a relationship?"
    ]);
  }

  /**
   * End a "Guess Who" session
   */
  async endGuessWhoSession(
    sessionId: string,
    outcome: 'liked' | 'passed' | 'incomplete'
  ): Promise<GuessWhoSession> {
    const session = this.activeSessions.get(sessionId);
    if (!session) {
      throw new SoulError(
        SoulErrorType.INTERACTION_FAILED,
        'Session not found'
      );
    }
    
    session.endTime = new Date().toISOString();
    session.outcome = outcome;
    
    // Remove from active sessions
    this.activeSessions.delete(sessionId);
    
    return session;
  }

  /**
   * Get active session for user
   */
  getActiveSession(userId: string, candidateId: string): GuessWhoSession | null {
    for (const session of this.activeSessions.values()) {
      if (session.sessionId.includes(userId) && session.candidateId === candidateId) {
        return session;
      }
    }
    return null;
  }

  /**
   * Get session statistics
   */
  getSessionStatistics(): {
    activeSessions: number;
    totalQuestions: number;
    averageSessionLength: number;
  } {
    const sessions = Array.from(this.activeSessions.values());
    
    return {
      activeSessions: sessions.length,
      totalQuestions: sessions.reduce((sum, s) => sum + s.questions.length, 0),
      averageSessionLength: sessions.length > 0 
        ? sessions.reduce((sum, s) => sum + s.questions.length, 0) / sessions.length
        : 0
    };
  }
}

export default SoulInteractionEngine;