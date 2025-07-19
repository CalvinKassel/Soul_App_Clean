/**
 * Chat-Based Recommendation Engine
 * 
 * Orchestrates the conversational matchmaking experience by integrating the
 * HHC personality system, Harmony Algorithm, and feedback parser to deliver
 * intelligent, context-aware recommendations through natural conversation.
 */

import { HHCPersonalityVector, HHC_DIMENSIONS, HHCUtils } from './HHCPersonalitySystem.js';
import { HarmonyAlgorithm } from './HarmonyAlgorithm.js';
import { FeedbackParser, FEEDBACK_TYPES, SENTIMENT_SCORES } from './FeedbackParser.js';

export const RECOMMENDATION_MODES = {
  DISCOVERY: 'discovery',           // Initial exploration
  REFINEMENT: 'refinement',         // Based on feedback
  EXPLANATION: 'explanation',       // Explaining matches
  COMPARISON: 'comparison'          // Comparing options
};

export const MESSAGE_TYPES = {
  PROFILE_PRESENTATION: 'profile_presentation',
  COMPATIBILITY_EXPLANATION: 'compatibility_explanation',
  FOLLOW_UP_QUESTION: 'follow_up_question',
  CLARIFICATION: 'clarification',
  ENCOURAGEMENT: 'encouragement',
  SUGGESTION: 'suggestion'
};

export class ChatRecommendationEngine {
  constructor() {
    this.harmonyAlgorithm = new HarmonyAlgorithm();
    this.feedbackParser = new FeedbackParser();
    this.conversationState = {
      mode: RECOMMENDATION_MODES.DISCOVERY,
      currentCandidate: null,
      candidateQueue: [],
      userId: null,
      userHHC: null,
      conversationHistory: [],
      preferences: {
        learned: {},
        explicit: {},
        avoided: {}
      }
    };
    this.candidateDatabase = new Map(); // In real app, this would be external DB
  }

  /**
   * Initialize the recommendation engine for a user
   */
  async initializeForUser(userId, userProfile) {
    this.conversationState.userId = userId;
    
    // Create or load user's HHC personality vector
    if (userProfile.hhcVector) {
      this.conversationState.userHHC = HHCPersonalityVector.fromJSON(userProfile.hhcVector);
    } else {
      this.conversationState.userHHC = new HHCPersonalityVector();
      await this.buildInitialProfile(userProfile);
    }

    // Load personalized algorithm weights
    if (userProfile.algorithmState) {
      this.harmonyAlgorithm.importState(userProfile.algorithmState);
    }

    // Generate initial candidate queue
    await this.refreshCandidateQueue();

    return {
      initialized: true,
      profileCompleteness: this.calculateProfileCompleteness(),
      initialMessage: this.generateWelcomeMessage()
    };
  }

  /**
   * Build initial personality profile from user data
   */
  async buildInitialProfile(userProfile) {
    const hhcAdjustments = {};

    // Convert MBTI if available
    if (userProfile.mbtiType) {
      Object.assign(hhcAdjustments, HHCUtils.mbtiToHHC(userProfile.mbtiType));
    }

    // Convert Big Five if available
    if (userProfile.bigFive) {
      Object.assign(hhcAdjustments, HHCUtils.bigFiveToHHC(userProfile.bigFive));
    }

    // Apply interests and values
    if (userProfile.interests) {
      this.applyInterestsToHHC(userProfile.interests, hhcAdjustments);
    }

    if (userProfile.values) {
      this.applyValuesToHHC(userProfile.values, hhcAdjustments);
    }

    // Update the personality vector
    this.conversationState.userHHC.updateDimensions(hhcAdjustments);
  }

  /**
   * Process user message and generate appropriate response
   */
  async processUserMessage(message) {
    const response = {
      messages: [],
      candidateUpdate: null,
      modeChange: null,
      learningUpdate: null
    };

    // Parse user feedback
    const feedback = this.feedbackParser.parseFeedback(
      message, 
      this.conversationState.currentCandidate
    );

    // Add to conversation history
    this.conversationState.conversationHistory.push({
      timestamp: Date.now(),
      userMessage: message,
      feedback,
      candidate: this.conversationState.currentCandidate?.id || null
    });

    // Update learning from feedback
    if (feedback.feedbackType !== FEEDBACK_TYPES.NEUTRAL) {
      response.learningUpdate = await this.updateLearningFromFeedback(feedback);
    }

    // Generate response based on feedback type
    switch (feedback.feedbackType) {
      case FEEDBACK_TYPES.EXPLICIT_LIKE:
        response.messages = await this.handleExplicitLike(feedback);
        break;
        
      case FEEDBACK_TYPES.EXPLICIT_DISLIKE:
        response.messages = await this.handleExplicitDislike(feedback);
        break;
        
      case FEEDBACK_TYPES.TRAIT_APPRECIATION:
        response.messages = await this.handleTraitAppreciation(feedback);
        break;
        
      case FEEDBACK_TYPES.TRAIT_CONCERN:
        response.messages = await this.handleTraitConcern(feedback);
        break;
        
      case FEEDBACK_TYPES.QUESTION:
        response.messages = await this.handleQuestion(feedback);
        break;
        
      case FEEDBACK_TYPES.REQUEST_MORE:
        response.messages = await this.handleRequestMore(feedback);
        break;
        
      case FEEDBACK_TYPES.REQUEST_DIFFERENT:
        response.messages = await this.handleRequestDifferent(feedback);
        break;
        
      default:
        response.messages = await this.handleNeutralResponse(feedback);
    }

    return response;
  }

  /**
   * Handle explicit positive feedback
   */
  async handleExplicitLike(feedback) {
    const messages = [];
    
    // Enthusiastic response
    messages.push({
      type: MESSAGE_TYPES.ENCOURAGEMENT,
      content: this.generateEnthusiasticResponse(),
      timestamp: Date.now()
    });

    // Explain why it's a good match
    if (this.conversationState.currentCandidate) {
      const compatibility = this.harmonyAlgorithm.calculateCompatibility(
        this.conversationState.userHHC,
        this.conversationState.currentCandidate.hhcVector,
        this.conversationState.userId
      );
      
      messages.push({
        type: MESSAGE_TYPES.COMPATIBILITY_EXPLANATION,
        content: this.generateCompatibilityExplanation(compatibility),
        compatibility,
        timestamp: Date.now()
      });
    }

    // Offer next steps
    messages.push({
      type: MESSAGE_TYPES.SUGGESTION,
      content: "Would you like me to help you start a conversation with them, or shall we look at more profiles like this?",
      options: ['Start conversation', 'More similar profiles', 'Keep exploring'],
      timestamp: Date.now()
    });

    return messages;
  }

  /**
   * Handle explicit negative feedback
   */
  async handleExplicitDislike(feedback) {
    const messages = [];
    
    // Acknowledge feedback
    messages.push({
      type: MESSAGE_TYPES.CLARIFICATION,
      content: "Got it! That helps me understand your preferences better.",
      timestamp: Date.now()
    });

    // Ask for specific feedback if not provided
    if (feedback.traits.concerns.length === 0) {
      messages.push({
        type: MESSAGE_TYPES.FOLLOW_UP_QUESTION,
        content: "What specifically didn't feel right? This will help me find better matches for you.",
        timestamp: Date.now()
      });
    }

    // Move to next candidate
    await this.moveToNextCandidate();
    
    if (this.conversationState.currentCandidate) {
      messages.push(...await this.presentCurrentCandidate());
    } else {
      messages.push({
        type: MESSAGE_TYPES.SUGGESTION,
        content: "Let me find some fresh profiles for you. What type of person are you hoping to meet?",
        timestamp: Date.now()
      });
    }

    return messages;
  }

  /**
   * Handle trait-specific appreciation
   */
  async handleTraitAppreciation(feedback) {
    const messages = [];
    
    // Acknowledge the specific traits they like
    const likedTraits = feedback.traits.appreciated.map(t => t.trait).join(', ');
    messages.push({
      type: MESSAGE_TYPES.ENCOURAGEMENT,
      content: `I love that you appreciate ${likedTraits}! I'll prioritize finding people with these qualities.`,
      timestamp: Date.now()
    });

    // Update preferences
    await this.updateTraitPreferences(feedback.traits.appreciated, 'positive');

    // Offer similar profiles
    messages.push({
      type: MESSAGE_TYPES.SUGGESTION,
      content: "Should I look for more people with similar traits, or would you like to see what else this person has to offer?",
      options: ['More similar people', 'Learn more about this person', 'Continue exploring'],
      timestamp: Date.now()
    });

    return messages;
  }

  /**
   * Handle trait-specific concerns
   */
  async handleTraitConcern(feedback) {
    const messages = [];
    
    // Acknowledge concerns
    const concernedTraits = feedback.traits.concerns.map(t => t.trait).join(', ');
    messages.push({
      type: MESSAGE_TYPES.CLARIFICATION,
      content: `I understand your concerns about ${concernedTraits}. Let me explain or find alternatives.`,
      timestamp: Date.now()
    });

    // Update preferences
    await this.updateTraitPreferences(feedback.traits.concerns, 'negative');

    // Offer explanation or alternatives
    if (this.conversationState.currentCandidate) {
      messages.push({
        type: MESSAGE_TYPES.COMPATIBILITY_EXPLANATION,
        content: this.generateTraitContextExplanation(feedback.traits.concerns),
        timestamp: Date.now()
      });
    }

    messages.push({
      type: MESSAGE_TYPES.SUGGESTION,
      content: "Would you like me to find someone different, or shall I explain why this might still work?",
      options: ['Find someone different', 'Explain the match', 'Ask them about it'],
      timestamp: Date.now()
    });

    return messages;
  }

  /**
   * Handle user questions
   */
  async handleQuestion(feedback) {
    const messages = [];
    
    // Determine what they're asking about
    const questionContent = await this.analyzeQuestion(feedback);
    
    switch (questionContent.type) {
      case 'compatibility':
        messages.push({
          type: MESSAGE_TYPES.COMPATIBILITY_EXPLANATION,
          content: await this.generateDetailedCompatibilityExplanation(),
          timestamp: Date.now()
        });
        break;
        
      case 'profile_details':
        messages.push({
          type: MESSAGE_TYPES.PROFILE_PRESENTATION,
          content: await this.generateDetailedProfileInfo(questionContent.aspect),
          timestamp: Date.now()
        });
        break;
        
      case 'process':
        messages.push({
          type: MESSAGE_TYPES.CLARIFICATION,
          content: this.generateProcessExplanation(),
          timestamp: Date.now()
        });
        break;
        
      default:
        messages.push({
          type: MESSAGE_TYPES.CLARIFICATION,
          content: "I'd be happy to help! Could you be more specific about what you'd like to know?",
          timestamp: Date.now()
        });
    }

    return messages;
  }

  /**
   * Present current candidate in chat format
   */
  async presentCurrentCandidate() {
    if (!this.conversationState.currentCandidate) {
      return [{
        type: MESSAGE_TYPES.SUGGESTION,
        content: "Let me find some great matches for you!",
        timestamp: Date.now()
      }];
    }

    const candidate = this.conversationState.currentCandidate;
    const compatibility = this.harmonyAlgorithm.calculateCompatibility(
      this.conversationState.userHHC,
      candidate.hhcVector,
      this.conversationState.userId
    );

    const messages = [];

    // Main profile presentation
    messages.push({
      type: MESSAGE_TYPES.PROFILE_PRESENTATION,
      candidate: {
        id: candidate.id,
        name: candidate.name,
        age: candidate.age,
        photos: candidate.photos,
        bio: candidate.bio,
        interests: candidate.interests,
        personality: HHCUtils.generateInsights(candidate.hhcVector)
      },
      compatibility: {
        score: compatibility.overall,
        confidence: compatibility.confidence,
        strengths: compatibility.factors.filter(f => f.type === 'strength').slice(0, 3)
      },
      content: this.generateProfilePresentationText(candidate, compatibility),
      timestamp: Date.now()
    });

    // Highlight key compatibility points
    if (compatibility.factors.length > 0) {
      const topFactor = compatibility.factors[0];
      messages.push({
        type: MESSAGE_TYPES.COMPATIBILITY_EXPLANATION,
        content: `What I find especially interesting: ${topFactor.description.toLowerCase()}. ${this.generateCompatibilityInsight(topFactor)}`,
        timestamp: Date.now()
      });
    }

    // Encourage interaction
    messages.push({
      type: MESSAGE_TYPES.FOLLOW_UP_QUESTION,
      content: "What do you think? Does this seem like someone you'd like to get to know?",
      timestamp: Date.now()
    });

    return messages;
  }

  /**
   * Generate profile presentation text
   */
  generateProfilePresentationText(candidate, compatibility) {
    const matchScore = Math.round(compatibility.overall * 100);
    const personalityInsights = HHCUtils.generateInsights(candidate.hhcVector);
    
    let text = `Meet ${candidate.name}, ${candidate.age} 🌟\n\n`;
    text += `${candidate.bio}\n\n`;
    
    if (personalityInsights.length > 0) {
      text += `What makes them special:\n`;
      personalityInsights.slice(0, 2).forEach(insight => {
        text += `• ${insight}\n`;
      });
    }
    
    text += `\n🎯 Compatibility: ${matchScore}% match`;
    
    if (compatibility.confidence > 0.8) {
      text += ` (high confidence)`;
    }
    
    return text;
  }

  /**
   * Update learning from user feedback
   */
  async updateLearningFromFeedback(feedback) {
    const updates = {
      personalityAdjustments: {},
      preferenceUpdates: {},
      algorithmLearning: null
    };

    // Update Harmony Algorithm
    if (this.conversationState.currentCandidate) {
      updates.algorithmLearning = this.harmonyAlgorithm.updateFromFeedback(
        this.conversationState.userId,
        this.conversationState.currentCandidate.id,
        this.conversationState.userHHC,
        this.conversationState.currentCandidate.hhcVector,
        {
          liked: feedback.sentiment > 0,
          feedback_type: feedback.feedbackType,
          specific_traits: feedback.traits
        }
      );
    }

    // Update user's personality vector based on revealed preferences
    if (feedback.traits.appreciated.length > 0) {
      await this.adjustUserHHCFromPreferences(feedback.traits.appreciated, 'attraction');
    }

    if (feedback.traits.concerns.length > 0) {
      await this.adjustUserHHCFromPreferences(feedback.traits.concerns, 'avoidance');
    }

    // Update explicit preferences
    this.updateExplicitPreferences(feedback);

    // Refresh candidate queue with new learnings
    await this.refreshCandidateQueue();

    return updates;
  }

  /**
   * Refresh candidate queue based on current preferences
   */
  async refreshCandidateQueue() {
    // In a real app, this would query the database
    // For now, we'll simulate with improved scoring
    
    const allCandidates = Array.from(this.candidateDatabase.values());
    const scoredCandidates = [];

    for (const candidate of allCandidates) {
      const compatibility = this.harmonyAlgorithm.calculateCompatibility(
        this.conversationState.userHHC,
        candidate.hhcVector,
        this.conversationState.userId
      );

      scoredCandidates.push({
        ...candidate,
        compatibilityScore: compatibility.overall,
        compatibility: compatibility
      });
    }

    // Sort by compatibility and add diversity
    scoredCandidates.sort((a, b) => b.compatibilityScore - a.compatibilityScore);
    
    // Add some diversity to avoid showing only similar profiles
    this.conversationState.candidateQueue = this.diversifyQueue(scoredCandidates);
    
    // Set current candidate if none selected
    if (!this.conversationState.currentCandidate && this.conversationState.candidateQueue.length > 0) {
      this.conversationState.currentCandidate = this.conversationState.candidateQueue.shift();
    }
  }

  /**
   * Add diversity to candidate queue
   */
  diversifyQueue(sortedCandidates) {
    const diverseQueue = [];
    const topTier = sortedCandidates.slice(0, Math.min(10, sortedCandidates.length));
    const secondTier = sortedCandidates.slice(10, Math.min(25, sortedCandidates.length));
    
    // Interleave top matches with some variety
    for (let i = 0; i < 15; i++) {
      if (i % 3 === 0 && secondTier.length > 0) {
        diverseQueue.push(secondTier.shift());
      } else if (topTier.length > 0) {
        diverseQueue.push(topTier.shift());
      }
    }
    
    return diverseQueue;
  }

  /**
   * Move to next candidate
   */
  async moveToNextCandidate() {
    if (this.conversationState.candidateQueue.length > 0) {
      this.conversationState.currentCandidate = this.conversationState.candidateQueue.shift();
    } else {
      await this.refreshCandidateQueue();
      this.conversationState.currentCandidate = this.conversationState.candidateQueue.shift() || null;
    }
  }

  /**
   * Generate welcome message
   */
  generateWelcomeMessage() {
    const completeness = this.calculateProfileCompleteness();
    
    if (completeness < 0.5) {
      return {
        type: MESSAGE_TYPES.CLARIFICATION,
        content: "Hi! I'm Soul, your personal matchmaker. I'd love to learn more about you to find amazing connections. What kind of person are you hoping to meet?",
        timestamp: Date.now()
      };
    } else {
      return {
        type: MESSAGE_TYPES.PROFILE_PRESENTATION,
        content: `Hi! Based on what I know about you, I've found some really interesting people. Ready to meet them?`,
        timestamp: Date.now()
      };
    }
  }

  /**
   * Calculate profile completeness
   */
  calculateProfileCompleteness() {
    if (!this.conversationState.userHHC) return 0;
    
    const vector = this.conversationState.userHHC.vector;
    let completeness = 0;
    let totalDimensions = 0;
    
    for (let i = 0; i < vector.length; i++) {
      totalDimensions++;
      if (Math.abs(vector[i] - 0.5) > 0.1) { // Not default value
        completeness++;
      }
    }
    
    return completeness / totalDimensions;
  }

  /**
   * Add candidate to database (for demo purposes)
   */
  addCandidate(candidateData) {
    const candidate = {
      id: candidateData.id || Date.now().toString(),
      name: candidateData.name,
      age: candidateData.age,
      photos: candidateData.photos || [],
      bio: candidateData.bio || '',
      interests: candidateData.interests || [],
      hhcVector: candidateData.hhcVector || new HHCPersonalityVector(),
      ...candidateData
    };
    
    this.candidateDatabase.set(candidate.id, candidate);
    return candidate;
  }

  /**
   * Get conversation state for persistence
   */
  getConversationState() {
    return {
      ...this.conversationState,
      userHHC: this.conversationState.userHHC?.toJSON(),
      algorithmState: this.harmonyAlgorithm.exportState(),
      feedbackParserContext: this.feedbackParser.getConversationContext()
    };
  }

  /**
   * Load conversation state
   */
  loadConversationState(state) {
    this.conversationState = {
      ...state,
      userHHC: state.userHHC ? HHCPersonalityVector.fromJSON(state.userHHC) : null
    };
    
    if (state.algorithmState) {
      this.harmonyAlgorithm.importState(state.algorithmState);
    }
  }

  /**
   * Apply interests to HHC personality adjustments
   */
  applyInterestsToHHC(interests, hhcAdjustments) {
    const interestMappings = {
      'art': { [HHC_DIMENSIONS.CREATIVITY]: 0.8, [HHC_DIMENSIONS.OPENNESS]: 0.7 },
      'technology': { [HHC_DIMENSIONS.ANALYTICAL_THINKING]: 0.8, [HHC_DIMENSIONS.OPENNESS]: 0.6 },
      'philosophy': { [HHC_DIMENSIONS.ABSTRACT_THINKING]: 0.9, [HHC_DIMENSIONS.OPENNESS]: 0.8 },
      'travel': { [HHC_DIMENSIONS.ADVENTURE]: 0.8, [HHC_DIMENSIONS.OPENNESS]: 0.7 },
      'reading': { [HHC_DIMENSIONS.INTELLECTUAL_CURIOSITY]: 0.7, [HHC_DIMENSIONS.OPENNESS]: 0.6 },
      'hiking': { [HHC_DIMENSIONS.PHYSICAL_ACTIVITY]: 0.7, [HHC_DIMENSIONS.NATURE_APPRECIATION]: 0.8 },
      'cooking': { [HHC_DIMENSIONS.CREATIVITY]: 0.6, [HHC_DIMENSIONS.NURTURING]: 0.7 },
      'meditation': { [HHC_DIMENSIONS.MINDFULNESS]: 0.9, [HHC_DIMENSIONS.EMOTIONAL_STABILITY]: 0.7 },
      'music': { [HHC_DIMENSIONS.ARTISTIC_EXPRESSION]: 0.8, [HHC_DIMENSIONS.EMOTIONAL_SENSITIVITY]: 0.6 },
      'fitness': { [HHC_DIMENSIONS.PHYSICAL_ACTIVITY]: 0.8, [HHC_DIMENSIONS.DISCIPLINE]: 0.7 }
    };

    interests.forEach(interest => {
      const mapping = interestMappings[interest.toLowerCase()];
      if (mapping) {
        Object.assign(hhcAdjustments, mapping);
      }
    });
  }

  /**
   * Apply values to HHC personality adjustments
   */
  applyValuesToHHC(values, hhcAdjustments) {
    const valueMappings = {
      'authenticity': { [HHC_DIMENSIONS.GENUINENESS]: 0.9, [HHC_DIMENSIONS.SELF_AWARENESS]: 0.8 },
      'creativity': { [HHC_DIMENSIONS.CREATIVITY]: 0.9, [HHC_DIMENSIONS.OPENNESS]: 0.7 },
      'growth': { [HHC_DIMENSIONS.PERSONAL_DEVELOPMENT]: 0.8, [HHC_DIMENSIONS.ADAPTABILITY]: 0.7 },
      'knowledge': { [HHC_DIMENSIONS.INTELLECTUAL_CURIOSITY]: 0.8, [HHC_DIMENSIONS.ANALYTICAL_THINKING]: 0.7 },
      'empathy': { [HHC_DIMENSIONS.EMOTIONAL_INTELLIGENCE]: 0.9, [HHC_DIMENSIONS.COMPASSION]: 0.8 },
      'balance': { [HHC_DIMENSIONS.EMOTIONAL_STABILITY]: 0.8, [HHC_DIMENSIONS.MINDFULNESS]: 0.7 },
      'adventure': { [HHC_DIMENSIONS.ADVENTURE]: 0.9, [HHC_DIMENSIONS.SPONTANEITY]: 0.7 },
      'stability': { [HHC_DIMENSIONS.RELIABILITY]: 0.8, [HHC_DIMENSIONS.ROUTINE_PREFERENCE]: 0.7 },
      'family': { [HHC_DIMENSIONS.FAMILY_ORIENTATION]: 0.9, [HHC_DIMENSIONS.NURTURING]: 0.8 },
      'independence': { [HHC_DIMENSIONS.AUTONOMY]: 0.8, [HHC_DIMENSIONS.SELF_RELIANCE]: 0.7 }
    };

    values.forEach(value => {
      const mapping = valueMappings[value.toLowerCase()];
      if (mapping) {
        Object.assign(hhcAdjustments, mapping);
      }
    });
  }

  /**
   * Generate detailed compatibility explanation
   */
  generateCompatibilityExplanation(compatibility) {
    const score = Math.round(compatibility.overall * 100);
    const factors = compatibility.factors || [];
    
    let explanation = `We're a ${score}% match! `;
    
    if (factors.length > 0) {
      const topFactor = factors[0];
      explanation += `What I find most interesting is ${topFactor.description.toLowerCase()}. `;
      
      if (factors.length > 1) {
        explanation += `We also ${factors[1].description.toLowerCase()}.`;
      }
    }
    
    return explanation;
  }

  /**
   * Update trait preferences from feedback
   */
  async updateTraitPreferences(traits, direction) {
    const multiplier = direction === 'positive' ? 1.1 : 0.9;
    
    traits.forEach(trait => {
      if (this.conversationState.preferences.learned[trait.trait]) {
        this.conversationState.preferences.learned[trait.trait] *= multiplier;
      } else {
        this.conversationState.preferences.learned[trait.trait] = direction === 'positive' ? 0.7 : 0.3;
      }
    });
  }

  /**
   * Analyze user question to determine response type
   */
  async analyzeQuestion(feedback) {
    const message = feedback.originalText.toLowerCase();
    
    if (message.includes('why') || message.includes('recommend')) {
      return { type: 'compatibility' };
    }
    
    if (message.includes('age') || message.includes('old')) {
      return { type: 'profile_details', aspect: 'age' };
    }
    
    if (message.includes('interest') || message.includes('hobby') || message.includes('like')) {
      return { type: 'profile_details', aspect: 'interests' };
    }
    
    if (message.includes('work') || message.includes('job')) {
      return { type: 'profile_details', aspect: 'career' };
    }
    
    return { type: 'general' };
  }

  /**
   * Generate detailed profile information
   */
  async generateDetailedProfileInfo(aspect) {
    const candidate = this.conversationState.currentCandidate;
    if (!candidate) return "I don't have a current recommendation to discuss.";
    
    switch (aspect) {
      case 'age':
        return `${candidate.name} is ${candidate.age} years old.`;
      
      case 'interests':
        if (candidate.interests && candidate.interests.length > 0) {
          return `${candidate.name} enjoys ${candidate.interests.join(', ')}. These interests suggest they're ${this.generatePersonalityInsight(candidate.interests)}.`;
        }
        return `I don't have specific interest information for ${candidate.name} right now.`;
      
      case 'career':
        return candidate.career ? 
          `${candidate.name} works in ${candidate.career}.` : 
          `I don't have career information for ${candidate.name} at the moment.`;
      
      default:
        return `What specifically would you like to know about ${candidate.name}?`;
    }
  }

  /**
   * Generate personality insight from interests
   */
  generatePersonalityInsight(interests) {
    const insights = [];
    
    if (interests.includes('art') || interests.includes('music')) {
      insights.push('creative and expressive');
    }
    if (interests.includes('travel') || interests.includes('adventure')) {
      insights.push('adventurous and open-minded');
    }
    if (interests.includes('reading') || interests.includes('philosophy')) {
      insights.push('thoughtful and intellectual');
    }
    if (interests.includes('fitness') || interests.includes('hiking')) {
      insights.push('active and health-conscious');
    }
    
    return insights.length > 0 ? insights.join(' and ') : 'well-rounded';
  }

  /**
   * Generate process explanation
   */
  generateProcessExplanation() {
    return "I use your personality profile and preferences to find people who might be great matches. I look at compatibility across personality traits, values, communication styles, and lifestyle preferences. The more you tell me about what you like or don't like, the better I get at finding your type!";
  }

  /**
   * Generate enthusiastic response
   */
  generateEnthusiasticResponse() {
    const responses = [
      "That's wonderful! I'm so glad you like them!",
      "Excellent choice! I had a feeling you two would click!",
      "Perfect! I love when my recommendations hit the mark!",
      "Amazing! I'm excited to see where this connection goes!",
      "Fantastic! My algorithm is learning so much about your preferences!"
    ];
    
    return responses[Math.floor(Math.random() * responses.length)];
  }
}