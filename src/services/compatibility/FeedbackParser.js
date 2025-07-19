/**
 * Natural Language Feedback Parser
 * 
 * Analyzes user text responses to extract detailed feedback about potential matches,
 * including explicit preferences, emotional responses, and specific trait reactions.
 * This enables nuanced preference learning beyond simple like/dislike inputs.
 */

export const FEEDBACK_TYPES = {
  EXPLICIT_LIKE: 'explicit_like',
  EXPLICIT_DISLIKE: 'explicit_dislike',
  TRAIT_APPRECIATION: 'trait_appreciation',
  TRAIT_CONCERN: 'trait_concern',
  QUESTION: 'question',
  NEUTRAL: 'neutral',
  REQUEST_MORE: 'request_more',
  REQUEST_DIFFERENT: 'request_different'
};

export const SENTIMENT_SCORES = {
  VERY_POSITIVE: 0.8,
  POSITIVE: 0.6,
  SLIGHTLY_POSITIVE: 0.3,
  NEUTRAL: 0.0,
  SLIGHTLY_NEGATIVE: -0.3,
  NEGATIVE: -0.6,
  VERY_NEGATIVE: -0.8
};

export const TRAIT_KEYWORDS = {
  // Personality traits
  personality: {
    extroverted: ['outgoing', 'social', 'energetic', 'talkative', 'people person'],
    introverted: ['quiet', 'reserved', 'introspective', 'thoughtful', 'calm'],
    creative: ['artistic', 'creative', 'imaginative', 'innovative', 'original'],
    analytical: ['logical', 'rational', 'analytical', 'systematic', 'methodical'],
    spontaneous: ['spontaneous', 'adventurous', 'flexible', 'impulsive', 'free-spirited'],
    organized: ['organized', 'structured', 'planned', 'responsible', 'reliable']
  },
  
  // Values and lifestyle
  values: {
    family: ['family', 'children', 'kids', 'parenting', 'family-oriented'],
    career: ['ambitious', 'career-focused', 'professional', 'driven', 'success'],
    spiritual: ['spiritual', 'religious', 'faith', 'beliefs', 'meditation'],
    travel: ['travel', 'adventure', 'explore', 'wanderlust', 'culture'],
    fitness: ['fit', 'healthy', 'exercise', 'gym', 'active', 'sports'],
    intellectual: ['smart', 'intelligent', 'educated', 'intellectual', 'knowledge']
  },
  
  // Physical and lifestyle preferences
  lifestyle: {
    active: ['active', 'outdoorsy', 'hiking', 'running', 'cycling', 'adventure'],
    homebody: ['homebody', 'cozy', 'relaxing', 'comfortable', 'peaceful'],
    social: ['social', 'parties', 'events', 'gatherings', 'nightlife'],
    cultural: ['museums', 'art', 'theater', 'culture', 'sophisticated'],
    casual: ['casual', 'laid-back', 'easygoing', 'relaxed', 'simple']
  }
};

export class FeedbackParser {
  constructor() {
    this.patterns = this.initializePatterns();
    this.contextHistory = [];
  }

  /**
   * Parse user text feedback and extract structured insights
   */
  parseFeedback(text, matchContext = null) {
    const feedback = {
      originalText: text.toLowerCase().trim(),
      timestamp: Date.now(),
      feedbackType: FEEDBACK_TYPES.NEUTRAL,
      sentiment: SENTIMENT_SCORES.NEUTRAL,
      traits: {
        appreciated: [],
        concerns: [],
        questions: []
      },
      preferences: {
        attracted_to: [],
        deterred_by: []
      },
      actionRequests: [],
      confidence: 0.7,
      extractedInsights: []
    };

    // Clean and normalize text
    const normalizedText = this.normalizeText(text);
    
    // Determine primary feedback type
    feedback.feedbackType = this.classifyFeedbackType(normalizedText);
    
    // Calculate sentiment
    feedback.sentiment = this.analyzeSentiment(normalizedText);
    
    // Extract trait-specific feedback
    feedback.traits = this.extractTraitFeedback(normalizedText);
    
    // Extract preferences
    feedback.preferences = this.extractPreferences(normalizedText);
    
    // Identify action requests
    feedback.actionRequests = this.extractActionRequests(normalizedText);
    
    // Generate insights
    feedback.extractedInsights = this.generateInsights(feedback, matchContext);
    
    // Calculate confidence in parsing
    feedback.confidence = this.calculateParsingConfidence(feedback);
    
    return feedback;
  }

  /**
   * Initialize pattern matching rules
   */
  initializePatterns() {
    return {
      // Explicit approval patterns
      explicit_like: [
        /\b(love|like|interested|attracted|yes|definitely|absolutely)\b/i,
        /\b(sounds great|looks good|seems nice|i'm into)\b/i,
        /\b(would love to|would like to|want to meet)\b/i
      ],
      
      // Explicit rejection patterns
      explicit_dislike: [
        /\b(not interested|no thanks|pass|not for me|don't like)\b/i,
        /\b(not my type|not compatible|wouldn't work)\b/i,
        /\b(too different|not attracted|not feeling it)\b/i
      ],
      
      // Question patterns
      questions: [
        /\?$/,
        /\b(what|how|when|where|why|tell me more|can you explain)\b/i,
        /\b(more info|learn more|know more)\b/i
      ],
      
      // Request for alternatives
      request_different: [
        /\b(someone else|different|alternatives|other options)\b/i,
        /\b(not quite right|something different|try again)\b/i
      ],
      
      // Request for more of same type
      request_more: [
        /\b(more like this|similar|same type|keep going)\b/i,
        /\b(on the right track|more of these)\b/i
      ],
      
      // Trait appreciation
      trait_positive: [
        /\b(love that|like that|appreciate|admire|attractive|appealing)\b/i,
        /\b(great that|nice that|good that|perfect)\b/i
      ],
      
      // Trait concerns
      trait_negative: [
        /\b(concerned about|worry about|not sure about|hesitant)\b/i,
        /\b(don't like|bothers me|issue with|problem with)\b/i
      ]
    };
  }

  /**
   * Normalize text for consistent processing
   */
  normalizeText(text) {
    return text
      .toLowerCase()
      .replace(/[^\w\s\?!.]/g, ' ')
      .replace(/\s+/g, ' ')
      .trim();
  }

  /**
   * Classify the primary type of feedback
   */
  classifyFeedbackType(text) {
    // Check explicit patterns first
    for (const pattern of this.patterns.explicit_like) {
      if (pattern.test(text)) return FEEDBACK_TYPES.EXPLICIT_LIKE;
    }
    
    for (const pattern of this.patterns.explicit_dislike) {
      if (pattern.test(text)) return FEEDBACK_TYPES.EXPLICIT_DISLIKE;
    }
    
    for (const pattern of this.patterns.questions) {
      if (pattern.test(text)) return FEEDBACK_TYPES.QUESTION;
    }
    
    for (const pattern of this.patterns.request_different) {
      if (pattern.test(text)) return FEEDBACK_TYPES.REQUEST_DIFFERENT;
    }
    
    for (const pattern of this.patterns.request_more) {
      if (pattern.test(text)) return FEEDBACK_TYPES.REQUEST_MORE;
    }
    
    // Check for trait-specific feedback
    const hasTraitPositive = this.patterns.trait_positive.some(p => p.test(text));
    const hasTraitNegative = this.patterns.trait_negative.some(p => p.test(text));
    
    if (hasTraitPositive) return FEEDBACK_TYPES.TRAIT_APPRECIATION;
    if (hasTraitNegative) return FEEDBACK_TYPES.TRAIT_CONCERN;
    
    return FEEDBACK_TYPES.NEUTRAL;
  }

  /**
   * Analyze sentiment using keyword-based approach
   */
  analyzeSentiment(text) {
    const positiveWords = [
      'love', 'like', 'great', 'amazing', 'wonderful', 'perfect', 'excellent',
      'attractive', 'interested', 'excited', 'beautiful', 'smart', 'funny',
      'kind', 'sweet', 'charming', 'fascinating', 'impressive'
    ];
    
    const negativeWords = [
      'hate', 'dislike', 'terrible', 'awful', 'boring', 'unattractive',
      'not interested', 'concerned', 'worried', 'problem', 'issue',
      'disappointing', 'annoying', 'incompatible', 'wrong'
    ];
    
    const intensifiers = ['very', 'really', 'extremely', 'absolutely', 'totally'];
    
    let positiveScore = 0;
    let negativeScore = 0;
    let intensifier = 1;
    
    const words = text.split(/\s+/);
    
    for (let i = 0; i < words.length; i++) {
      const word = words[i];
      
      // Check for intensifiers
      if (intensifiers.includes(word)) {
        intensifier = 1.5;
        continue;
      }
      
      // Score positive words
      if (positiveWords.includes(word)) {
        positiveScore += intensifier;
      }
      
      // Score negative words
      if (negativeWords.includes(word)) {
        negativeScore += intensifier;
      }
      
      intensifier = 1; // Reset intensifier
    }
    
    // Calculate net sentiment
    const netSentiment = positiveScore - negativeScore;
    const totalWords = words.length;
    const normalizedSentiment = netSentiment / Math.max(1, totalWords * 0.1);
    
    // Map to sentiment scale
    if (normalizedSentiment > 0.5) return SENTIMENT_SCORES.VERY_POSITIVE;
    if (normalizedSentiment > 0.2) return SENTIMENT_SCORES.POSITIVE;
    if (normalizedSentiment > 0.05) return SENTIMENT_SCORES.SLIGHTLY_POSITIVE;
    if (normalizedSentiment < -0.5) return SENTIMENT_SCORES.VERY_NEGATIVE;
    if (normalizedSentiment < -0.2) return SENTIMENT_SCORES.NEGATIVE;
    if (normalizedSentiment < -0.05) return SENTIMENT_SCORES.SLIGHTLY_NEGATIVE;
    
    return SENTIMENT_SCORES.NEUTRAL;
  }

  /**
   * Extract trait-specific feedback
   */
  extractTraitFeedback(text) {
    const traits = {
      appreciated: [],
      concerns: [],
      questions: []
    };

    // Check each trait category
    for (const [category, traitMap] of Object.entries(TRAIT_KEYWORDS)) {
      for (const [trait, keywords] of Object.entries(traitMap)) {
        const traitMentioned = keywords.some(keyword => text.includes(keyword));
        
        if (traitMentioned) {
          const context = this.extractTraitContext(text, keywords);
          const traitFeedback = {
            category,
            trait,
            keywords: keywords.filter(k => text.includes(k)),
            context,
            sentiment: this.getTraitSentiment(text, keywords)
          };
          
          if (traitFeedback.sentiment > 0.1) {
            traits.appreciated.push(traitFeedback);
          } else if (traitFeedback.sentiment < -0.1) {
            traits.concerns.push(traitFeedback);
          }
          
          // Check for questions about this trait
          if (this.hasQuestionAboutTrait(text, keywords)) {
            traits.questions.push({
              ...traitFeedback,
              type: 'clarification'
            });
          }
        }
      }
    }

    return traits;
  }

  /**
   * Extract context around trait mentions
   */
  extractTraitContext(text, keywords) {
    const words = text.split(/\s+/);
    const contexts = [];
    
    for (const keyword of keywords) {
      const index = words.findIndex(word => word.includes(keyword));
      if (index !== -1) {
        const start = Math.max(0, index - 3);
        const end = Math.min(words.length, index + 4);
        contexts.push(words.slice(start, end).join(' '));
      }
    }
    
    return contexts;
  }

  /**
   * Get sentiment specifically about a trait
   */
  getTraitSentiment(text, keywords) {
    // Find the context around trait keywords
    const contexts = this.extractTraitContext(text, keywords);
    
    let totalSentiment = 0;
    for (const context of contexts) {
      totalSentiment += this.analyzeSentiment(context);
    }
    
    return contexts.length > 0 ? totalSentiment / contexts.length : 0;
  }

  /**
   * Check if there's a question about a specific trait
   */
  hasQuestionAboutTrait(text, keywords) {
    const questionWords = ['what', 'how', 'why', 'when', 'where', '?'];
    const words = text.split(/\s+/);
    
    for (const keyword of keywords) {
      const keywordIndex = words.findIndex(word => word.includes(keyword));
      if (keywordIndex !== -1) {
        // Check surrounding words for question indicators
        const start = Math.max(0, keywordIndex - 5);
        const end = Math.min(words.length, keywordIndex + 5);
        const context = words.slice(start, end);
        
        if (questionWords.some(qw => context.includes(qw))) {
          return true;
        }
      }
    }
    
    return false;
  }

  /**
   * Extract preference patterns
   */
  extractPreferences(text) {
    const preferences = {
      attracted_to: [],
      deterred_by: []
    };

    // Look for preference indicators
    const attractionPatterns = [
      /\bi like (people|someone|guys|girls) who (.*)/i,
      /\bi'm attracted to (.*)/i,
      /\bi prefer (.*)/i,
      /\bi want someone who (.*)/i
    ];

    const deterrentPatterns = [
      /\bi don't like (people|someone|guys|girls) who (.*)/i,
      /\bi'm not attracted to (.*)/i,
      /\bi avoid (.*)/i,
      /\bi don't want someone who (.*)/i
    ];

    // Extract attractions
    for (const pattern of attractionPatterns) {
      const match = text.match(pattern);
      if (match) {
        preferences.attracted_to.push({
          statement: match[0],
          trait: match[match.length - 1],
          confidence: 0.8
        });
      }
    }

    // Extract deterrents
    for (const pattern of deterrentPatterns) {
      const match = text.match(pattern);
      if (match) {
        preferences.deterred_by.push({
          statement: match[0],
          trait: match[match.length - 1],
          confidence: 0.8
        });
      }
    }

    return preferences;
  }

  /**
   * Extract action requests
   */
  extractActionRequests(text) {
    const requests = [];

    const actionPatterns = {
      'show_more_info': /\b(tell me more|more info|learn more|details)\b/i,
      'show_photos': /\b(see photos|more pictures|other pics)\b/i,
      'explain_match': /\b(why|how|explain|reasoning)\b.*\b(match|compatible|similar)\b/i,
      'next_profile': /\b(next|skip|pass|move on)\b/i,
      'previous_profile': /\b(go back|previous|last one)\b/i,
      'contact': /\b(message|contact|reach out|connect)\b/i
    };

    for (const [action, pattern] of Object.entries(actionPatterns)) {
      if (pattern.test(text)) {
        requests.push({
          action,
          confidence: 0.7,
          matched_text: text.match(pattern)?.[0]
        });
      }
    }

    return requests;
  }

  /**
   * Generate insights from parsed feedback
   */
  generateInsights(feedback, matchContext) {
    const insights = [];

    // Insight from sentiment
    if (Math.abs(feedback.sentiment) > 0.5) {
      insights.push({
        type: 'sentiment',
        description: feedback.sentiment > 0 ? 
          'User shows strong positive interest' : 
          'User shows strong negative reaction',
        impact: Math.abs(feedback.sentiment)
      });
    }

    // Insights from trait feedback
    if (feedback.traits.appreciated.length > 0) {
      insights.push({
        type: 'trait_preference',
        description: `User appreciates: ${feedback.traits.appreciated.map(t => t.trait).join(', ')}`,
        impact: 0.7
      });
    }

    if (feedback.traits.concerns.length > 0) {
      insights.push({
        type: 'trait_concern',
        description: `User has concerns about: ${feedback.traits.concerns.map(t => t.trait).join(', ')}`,
        impact: 0.6
      });
    }

    // Insights from questions
    if (feedback.traits.questions.length > 0) {
      insights.push({
        type: 'curiosity',
        description: `User wants to know more about: ${feedback.traits.questions.map(t => t.trait).join(', ')}`,
        impact: 0.5
      });
    }

    return insights;
  }

  /**
   * Calculate confidence in parsing accuracy
   */
  calculateParsingConfidence(feedback) {
    let confidence = 0.5; // Base confidence

    // Increase confidence for clear patterns
    if (feedback.feedbackType !== FEEDBACK_TYPES.NEUTRAL) confidence += 0.2;
    if (Math.abs(feedback.sentiment) > 0.3) confidence += 0.15;
    if (feedback.traits.appreciated.length + feedback.traits.concerns.length > 0) confidence += 0.1;
    if (feedback.actionRequests.length > 0) confidence += 0.05;

    // Decrease confidence for ambiguous text
    if (feedback.originalText.length < 10) confidence -= 0.2;
    if (feedback.extractedInsights.length === 0) confidence -= 0.1;

    return Math.max(0.2, Math.min(1.0, confidence));
  }

  /**
   * Get feedback summary for display
   */
  getFeedbackSummary(feedback) {
    const summary = {
      type: feedback.feedbackType,
      sentiment: feedback.sentiment > 0 ? 'positive' : feedback.sentiment < 0 ? 'negative' : 'neutral',
      key_points: [],
      action_needed: null
    };

    // Add key points
    if (feedback.traits.appreciated.length > 0) {
      summary.key_points.push(`Likes: ${feedback.traits.appreciated.map(t => t.trait).join(', ')}`);
    }

    if (feedback.traits.concerns.length > 0) {
      summary.key_points.push(`Concerns: ${feedback.traits.concerns.map(t => t.trait).join(', ')}`);
    }

    // Determine action needed
    if (feedback.actionRequests.length > 0) {
      summary.action_needed = feedback.actionRequests[0].action;
    } else if (feedback.feedbackType === FEEDBACK_TYPES.REQUEST_MORE) {
      summary.action_needed = 'show_similar_profiles';
    } else if (feedback.feedbackType === FEEDBACK_TYPES.REQUEST_DIFFERENT) {
      summary.action_needed = 'show_different_profiles';
    }

    return summary;
  }

  /**
   * Add feedback to context history for better understanding
   */
  addToContext(feedback) {
    this.contextHistory.push({
      timestamp: feedback.timestamp,
      feedbackType: feedback.feedbackType,
      sentiment: feedback.sentiment,
      traits: feedback.traits,
      insights: feedback.extractedInsights
    });

    // Keep only recent history (last 20 interactions)
    if (this.contextHistory.length > 20) {
      this.contextHistory = this.contextHistory.slice(-20);
    }
  }

  /**
   * Get conversation context for better parsing
   */
  getConversationContext() {
    const recentFeedback = this.contextHistory.slice(-5);
    
    return {
      recent_sentiments: recentFeedback.map(f => f.sentiment),
      preferred_traits: this.extractPreferredTraits(recentFeedback),
      avoided_traits: this.extractAvoidedTraits(recentFeedback),
      conversation_tone: this.analyzeConversationTone(recentFeedback)
    };
  }

  /**
   * Extract preferred traits from conversation history
   */
  extractPreferredTraits(feedbackHistory) {
    const preferredTraits = {};
    
    for (const feedback of feedbackHistory) {
      for (const trait of feedback.traits.appreciated) {
        const key = `${trait.category}_${trait.trait}`;
        preferredTraits[key] = (preferredTraits[key] || 0) + 1;
      }
    }
    
    return Object.entries(preferredTraits)
      .sort(([,a], [,b]) => b - a)
      .slice(0, 5)
      .map(([trait]) => trait);
  }

  /**
   * Extract avoided traits from conversation history
   */
  extractAvoidedTraits(feedbackHistory) {
    const avoidedTraits = {};
    
    for (const feedback of feedbackHistory) {
      for (const trait of feedback.traits.concerns) {
        const key = `${trait.category}_${trait.trait}`;
        avoidedTraits[key] = (avoidedTraits[key] || 0) + 1;
      }
    }
    
    return Object.entries(avoidedTraits)
      .sort(([,a], [,b]) => b - a)
      .slice(0, 5)
      .map(([trait]) => trait);
  }

  /**
   * Analyze overall conversation tone
   */
  analyzeConversationTone(feedbackHistory) {
    if (feedbackHistory.length === 0) return 'neutral';
    
    const avgSentiment = feedbackHistory.reduce((sum, f) => sum + f.sentiment, 0) / feedbackHistory.length;
    
    if (avgSentiment > 0.3) return 'positive';
    if (avgSentiment < -0.3) return 'negative';
    return 'neutral';
  }
}