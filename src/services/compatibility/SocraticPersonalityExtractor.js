// Socratic Personality Extraction System
// Intelligent follow-up questioning to extract high-resolution personality data
// Maps natural conversation to specific HHC facets with precision

import HighResolutionHHC from './HighResolutionHHC.js';

class SocraticPersonalityExtractor {
  constructor() {
    this.hhcSchema = HighResolutionHHC;
    this.extractionPatterns = this.initializeExtractionPatterns();
    this.followUpQuestions = this.initializeFollowUpQuestions();
    this.conversationContext = new Map(); // Track conversation state per user
  }

  // Initialize patterns that map language to HHC facets
  initializeExtractionPatterns() {
    return {
      // Openness facets
      imagination: {
        keywords: ['daydream', 'fantasy', 'imagine', 'creative', 'visualize', 'dream'],
        phrases: ['in my head', 'imagine if', 'picture this', 'creative visualization'],
        negativeKeywords: ['practical', 'realistic', 'down to earth', 'concrete']
      },
      adventurousness: {
        keywords: ['adventure', 'spontaneous', 'thrill', 'risk', 'new experience', 'explore'],
        phrases: ['try new things', 'step outside comfort zone', 'take risks', 'be spontaneous'],
        contexts: ['travel', 'activities', 'experiences', 'challenges']
      },
      intellectualCuriosity: {
        keywords: ['learn', 'understand', 'research', 'study', 'analyze', 'investigate'],
        phrases: ['love learning', 'deep dive', 'figure out how', 'understand why'],
        contexts: ['reading', 'research', 'questions', 'knowledge']
      },

      // Conscientiousness facets
      orderliness: {
        keywords: ['organized', 'neat', 'tidy', 'structured', 'system', 'order'],
        phrases: ['keep things organized', 'have a system', 'like order', 'plan ahead'],
        negativeKeywords: ['messy', 'chaotic', 'disorganized', 'cluttered']
      },
      achievementStriving: {
        keywords: ['goals', 'ambitious', 'success', 'achieve', 'accomplish', 'excel'],
        phrases: ['set goals', 'work hard', 'push myself', 'want to succeed'],
        contexts: ['career', 'personal growth', 'challenges', 'competition']
      },
      selfDiscipline: {
        keywords: ['discipline', 'willpower', 'persist', 'stick to', 'follow through'],
        phrases: ['stick with it', 'see it through', 'stay focused', 'push through'],
        contexts: ['habits', 'commitments', 'difficulties', 'temptations']
      },

      // Extraversion facets
      warmth: {
        keywords: ['friendly', 'caring', 'affectionate', 'warm', 'loving', 'kind'],
        phrases: ['care about people', 'show affection', 'warm person', 'loving nature'],
        contexts: ['relationships', 'friendships', 'family', 'interactions']
      },
      gregariousness: {
        keywords: ['social', 'people', 'groups', 'parties', 'gatherings', 'crowds'],
        phrases: ['love being around people', 'social butterfly', 'enjoy groups', 'party person'],
        negativeKeywords: ['alone', 'solitary', 'private', 'quiet']
      },
      assertiveness: {
        keywords: ['assertive', 'leader', 'take charge', 'confident', 'direct', 'speak up'],
        phrases: ['take the lead', 'speak my mind', 'stand up for', 'take control'],
        contexts: ['leadership', 'decisions', 'conflict', 'groups']
      },

      // Agreeableness facets
      trust: {
        keywords: ['trust', 'believe', 'faith', 'reliable', 'honest', 'genuine'],
        phrases: ['trust people', 'believe in people', 'give benefit of doubt', 'take at word'],
        negativeKeywords: ['suspicious', 'skeptical', 'doubt', 'question motives']
      },
      altruism: {
        keywords: ['help', 'others', 'volunteer', 'give', 'support', 'care'],
        phrases: ['help others', 'give back', 'support people', 'make a difference'],
        contexts: ['volunteering', 'charity', 'helping', 'service']
      },
      cooperation: {
        keywords: ['teamwork', 'collaborate', 'work together', 'compromise', 'cooperate'],
        phrases: ['work together', 'find middle ground', 'team player', 'collaborate well'],
        contexts: ['work', 'relationships', 'groups', 'conflicts']
      },

      // Neuroticism facets
      anxiety: {
        keywords: ['worry', 'anxious', 'nervous', 'stress', 'fear', 'concerned'],
        phrases: ['worry about', 'feel anxious', 'get nervous', 'stress over'],
        contexts: ['future', 'performance', 'relationships', 'health']
      },
      emotionalStability: {
        keywords: ['calm', 'stable', 'even-tempered', 'balanced', 'composed'],
        phrases: ['stay calm', 'handle stress', 'emotionally stable', 'keep cool'],
        negativeKeywords: ['moody', 'volatile', 'emotional', 'ups and downs']
      },

      // Relationship-specific facets
      attachmentSecurity: {
        keywords: ['secure', 'comfortable', 'trust', 'safe', 'stable'],
        phrases: ['feel secure', 'trust in relationship', 'comfortable being close'],
        contexts: ['relationships', 'love', 'partners', 'commitment']
      },
      intimacyComfort: {
        keywords: ['close', 'intimate', 'vulnerable', 'open', 'share'],
        phrases: ['comfortable being close', 'open up', 'share feelings', 'be vulnerable'],
        contexts: ['relationships', 'emotions', 'personal', 'deep']
      }
    };
  }

  // Initialize intelligent follow-up questions
  initializeFollowUpQuestions() {
    return {
      // Adventure follow-ups
      adventureGeneral: [
        "That's interesting! What kind of adventures or spontaneous activities energize you most?",
        "When you think of adventure, do you prefer physical challenges, new experiences, or exploring ideas?",
        "How do you feel about last-minute plans versus having some things organized ahead of time?"
      ],
      adventureSpecific: {
        travel: [
          "Do you prefer detailed itineraries or figuring things out as you go?",
          "What's been your most meaningful travel experience and why?",
          "How important is it to you to visit completely unfamiliar places?"
        ],
        activities: [
          "Are you drawn more to physical adventures or intellectual explorations?",
          "How do you feel about trying activities that might not work out perfectly?",
          "Do you prefer adventuring solo or with others?"
        ]
      },

      // Social interaction follow-ups
      socialGeneral: [
        "Tell me more about the kind of social energy that feels most natural to you.",
        "Do you find you recharge more from being around people or having quiet time alone?",
        "What size groups do you feel most comfortable in?"
      ],
      socialSpecific: {
        parties: [
          "At a party, are you more likely to have deep conversations with a few people or mingle with lots of people?",
          "How do you feel about being the center of attention?",
          "What kind of social atmosphere brings out the best in you?"
        ],
        communication: [
          "In conversations, do you prefer to ask questions or share your own thoughts?",
          "How comfortable are you with sharing personal things about yourself?",
          "Do you find small talk energizing or do you prefer jumping into deeper topics?"
        ]
      },

      // Values and life philosophy
      valuesGeneral: [
        "What principles or values feel most important to who you are?",
        "When making big decisions, what do you find yourself prioritizing?",
        "What does a meaningful life look like to you?"
      ],
      valuesSpecific: {
        relationships: [
          "In relationships, what matters most to you - stability, growth, adventure, or something else?",
          "How do you show someone you care about them?",
          "What does emotional support look like to you?"
        ],
        work: [
          "Do you work primarily for financial security, personal fulfillment, or to make a difference?",
          "How important is it that your work aligns with your personal values?",
          "What motivates you to do your best work?"
        ]
      },

      // Conflict and stress responses
      conflictGeneral: [
        "How do you typically handle disagreements or conflicts?",
        "When you're stressed, what helps you feel better?",
        "Do you prefer to address issues directly or think through them first?"
      ],

      // Learning and growth
      growthGeneral: [
        "What kinds of things do you find yourself naturally curious about?",
        "How do you like to learn new things - through experience, reading, talking with others?",
        "What's something you've been working on developing about yourself?"
      ]
    };
  }

  // Main extraction method
  async extractPersonalityData(userInput, userId) {
    const context = this.getConversationContext(userId);
    const extractedData = this.analyzeText(userInput);
    const followUpQuestion = this.generateFollowUp(extractedData, context);
    
    // Update conversation context
    this.updateConversationContext(userId, userInput, extractedData);

    return {
      extractedFacets: extractedData.facets,
      confidence: extractedData.confidence,
      followUpQuestion: followUpQuestion,
      suggestedHHCUpdates: this.mapToHHCDimensions(extractedData.facets),
      conversationStage: context.stage
    };
  }

  // Analyze text for personality indicators
  analyzeText(text) {
    const lowerText = text.toLowerCase();
    const words = lowerText.split(/\s+/);
    const sentences = text.split(/[.!?]+/);
    
    const extractedFacets = [];
    let totalConfidence = 0;

    // Pattern matching against each facet
    Object.entries(this.extractionPatterns).forEach(([facetName, patterns]) => {
      const facetScore = this.calculateFacetMatch(lowerText, words, patterns);
      
      if (facetScore.score > 0.1) {
        extractedFacets.push({
          facet: facetName,
          value: facetScore.score,
          evidence: facetScore.evidence,
          confidence: facetScore.confidence
        });
        totalConfidence += facetScore.confidence;
      }
    });

    // Calculate contextual modifiers
    const contextModifiers = this.analyzeContext(text, sentences);

    return {
      facets: extractedFacets,
      confidence: extractedFacets.length > 0 ? totalConfidence / extractedFacets.length : 0,
      contextualFactors: contextModifiers,
      textComplexity: this.analyzeTextComplexity(sentences),
      emotionalTone: this.analyzeEmotionalTone(text)
    };
  }

  // Calculate how well text matches a facet pattern
  calculateFacetMatch(text, words, patterns) {
    let score = 0;
    let confidence = 0;
    const evidence = [];

    // Keyword matching
    if (patterns.keywords) {
      patterns.keywords.forEach(keyword => {
        if (text.includes(keyword)) {
          score += 0.2;
          confidence += 0.15;
          evidence.push(`keyword: ${keyword}`);
        }
      });
    }

    // Phrase matching (higher weight)
    if (patterns.phrases) {
      patterns.phrases.forEach(phrase => {
        if (text.includes(phrase)) {
          score += 0.4;
          confidence += 0.3;
          evidence.push(`phrase: ${phrase}`);
        }
      });
    }

    // Context matching
    if (patterns.contexts) {
      patterns.contexts.forEach(context => {
        if (text.includes(context)) {
          score += 0.1;
          confidence += 0.1;
          evidence.push(`context: ${context}`);
        }
      });
    }

    // Negative keyword penalties
    if (patterns.negativeKeywords) {
      patterns.negativeKeywords.forEach(negKeyword => {
        if (text.includes(negKeyword)) {
          score -= 0.3;
          evidence.push(`negative: ${negKeyword}`);
        }
      });
    }

    // Intensity modifiers
    const intensityWords = ['very', 'really', 'extremely', 'absolutely', 'definitely'];
    intensityWords.forEach(intensifier => {
      if (text.includes(intensifier)) {
        score *= 1.2;
        confidence += 0.05;
      }
    });

    return {
      score: Math.max(0, Math.min(1, score)),
      confidence: Math.max(0, Math.min(1, confidence)),
      evidence
    };
  }

  // Generate intelligent follow-up question
  generateFollowUp(extractedData, context) {
    if (extractedData.facets.length === 0) {
      return this.getGenericFollowUp(context.stage);
    }

    // Get the strongest facet for follow-up
    const strongestFacet = extractedData.facets
      .sort((a, b) => b.confidence - a.confidence)[0];

    return this.getSpecificFollowUp(strongestFacet, context);
  }

  getSpecificFollowUp(facet, context) {
    const facetName = facet.facet;
    
    // Adventure-related follow-ups
    if (['adventurousness', 'excitementSeeking'].includes(facetName)) {
      if (facet.evidence.some(e => e.includes('travel'))) {
        return this.getRandomFromArray(this.followUpQuestions.adventureSpecific.travel);
      } else {
        return this.getRandomFromArray(this.followUpQuestions.adventureSpecific.activities);
      }
    }

    // Social-related follow-ups  
    if (['gregariousness', 'warmth', 'assertiveness'].includes(facetName)) {
      if (facet.evidence.some(e => e.includes('party') || e.includes('group'))) {
        return this.getRandomFromArray(this.followUpQuestions.socialSpecific.parties);
      } else {
        return this.getRandomFromArray(this.followUpQuestions.socialSpecific.communication);
      }
    }

    // Values-related follow-ups
    if (['altruism', 'trust', 'cooperation'].includes(facetName)) {
      if (context.topicsDiscussed.includes('work')) {
        return this.getRandomFromArray(this.followUpQuestions.valuesSpecific.work);
      } else {
        return this.getRandomFromArray(this.followUpQuestions.valuesSpecific.relationships);
      }
    }

    // Default to general follow-ups
    return this.getRandomFromArray(this.followUpQuestions[`${facetName}General`] || 
                                   this.followUpQuestions.growthGeneral);
  }

  getGenericFollowUp(stage) {
    const genericQuestions = [
      "What aspects of yourself do you think are most important in relationships?",
      "Tell me about a time when you felt most like yourself.",
      "What energizes you and what drains your energy?",
      "How do you like to spend your time when you're completely free to choose?",
      "What matters most to you in how you connect with others?"
    ];

    return this.getRandomFromArray(genericQuestions);
  }

  // Map extracted facets to HHC dimensions
  mapToHHCDimensions(facets) {
    const hhcUpdates = [];

    facets.forEach(facet => {
      const facetInfo = this.hhcSchema.getFacetInfo(facet.facet);
      if (facetInfo) {
        hhcUpdates.push({
          dimension: facetInfo.dimension,
          facet: facet.facet,
          value: facet.value,
          confidence: facet.confidence,
          category: facetInfo.category,
          evidence: facet.evidence
        });
      }
    });

    return hhcUpdates;
  }

  // Conversation context management
  getConversationContext(userId) {
    if (!this.conversationContext.has(userId)) {
      this.conversationContext.set(userId, {
        stage: 'initial',
        topicsDiscussed: [],
        facetsExplored: [],
        questionCount: 0,
        lastInteraction: new Date()
      });
    }
    return this.conversationContext.get(userId);
  }

  updateConversationContext(userId, userInput, extractedData) {
    const context = this.getConversationContext(userId);
    
    context.questionCount++;
    context.lastInteraction = new Date();
    
    // Add topics discussed
    const topics = this.extractTopics(userInput);
    context.topicsDiscussed.push(...topics);
    
    // Add facets explored
    extractedData.facets.forEach(facet => {
      if (!context.facetsExplored.includes(facet.facet)) {
        context.facetsExplored.push(facet.facet);
      }
    });

    // Update conversation stage
    if (context.questionCount > 10) {
      context.stage = 'deep_exploration';
    } else if (context.questionCount > 5) {
      context.stage = 'active_discovery';
    } else {
      context.stage = 'initial_exploration';
    }
  }

  extractTopics(text) {
    const topicKeywords = {
      work: ['job', 'work', 'career', 'profession', 'office', 'colleague'],
      relationships: ['relationship', 'partner', 'dating', 'marriage', 'love', 'friend'],
      travel: ['travel', 'trip', 'vacation', 'visit', 'country', 'city'],
      family: ['family', 'parent', 'sibling', 'child', 'mother', 'father'],
      hobbies: ['hobby', 'interest', 'passion', 'enjoy', 'love doing', 'free time'],
      values: ['important', 'matter', 'value', 'principle', 'believe', 'meaningful']
    };

    const topics = [];
    const lowerText = text.toLowerCase();

    Object.entries(topicKeywords).forEach(([topic, keywords]) => {
      if (keywords.some(keyword => lowerText.includes(keyword))) {
        topics.push(topic);
      }
    });

    return topics;
  }

  // Analyze additional contextual factors
  analyzeContext(text, sentences) {
    return {
      enthusiasm: this.detectEnthusiasm(text),
      certainty: this.detectCertainty(text),
      personalness: this.detectPersonalness(sentences),
      specificity: this.detectSpecificity(text)
    };
  }

  detectEnthusiasm(text) {
    const enthusiasmWords = ['love', 'amazing', 'awesome', 'fantastic', 'incredible', 'passionate'];
    const exclamationMarks = (text.match(/!/g) || []).length;
    
    let score = 0;
    enthusiasmWords.forEach(word => {
      if (text.toLowerCase().includes(word)) score += 0.2;
    });
    score += exclamationMarks * 0.1;
    
    return Math.min(1, score);
  }

  detectCertainty(text) {
    const certaintyWords = ['definitely', 'absolutely', 'always', 'never', 'certainly', 'sure'];
    const uncertaintyWords = ['maybe', 'perhaps', 'sometimes', 'might', 'possibly'];
    
    let score = 0.5; // neutral baseline
    certaintyWords.forEach(word => {
      if (text.toLowerCase().includes(word)) score += 0.15;
    });
    uncertaintyWords.forEach(word => {
      if (text.toLowerCase().includes(word)) score -= 0.15;
    });
    
    return Math.max(0, Math.min(1, score));
  }

  detectPersonalness(sentences) {
    const personalIndicators = ['I ', 'my ', 'me ', 'myself', 'personally'];
    let personalCount = 0;
    
    sentences.forEach(sentence => {
      personalIndicators.forEach(indicator => {
        if (sentence.toLowerCase().includes(indicator)) personalCount++;
      });
    });
    
    return Math.min(1, personalCount / sentences.length);
  }

  detectSpecificity(text) {
    const specificIndicators = ['specifically', 'exactly', 'particular', 'precise', 'detailed'];
    const examples = text.match(/for example|like when|such as/gi) || [];
    
    let score = 0;
    specificIndicators.forEach(indicator => {
      if (text.toLowerCase().includes(indicator)) score += 0.2;
    });
    score += examples.length * 0.15;
    
    return Math.min(1, score);
  }

  analyzeTextComplexity(sentences) {
    const avgLength = sentences.reduce((sum, s) => sum + s.length, 0) / sentences.length;
    const complexity = Math.min(1, avgLength / 100); // Normalize to 0-1
    return complexity;
  }

  analyzeEmotionalTone(text) {
    const positiveWords = ['happy', 'excited', 'love', 'great', 'wonderful', 'enjoy'];
    const negativeWords = ['sad', 'angry', 'hate', 'terrible', 'awful', 'dislike'];
    
    let tone = 0.5; // neutral
    positiveWords.forEach(word => {
      if (text.toLowerCase().includes(word)) tone += 0.1;
    });
    negativeWords.forEach(word => {
      if (text.toLowerCase().includes(word)) tone -= 0.1;
    });
    
    return Math.max(0, Math.min(1, tone));
  }

  // Utility methods
  getRandomFromArray(array) {
    return array[Math.floor(Math.random() * array.length)];
  }

  // Get extraction statistics
  getExtractionStats(userId) {
    const context = this.getConversationContext(userId);
    return {
      questionsAsked: context.questionCount,
      facetsExplored: context.facetsExplored.length,
      topicsDiscussed: context.topicsDiscussed.length,
      stage: context.stage,
      completeness: context.facetsExplored.length / Object.keys(this.extractionPatterns).length
    };
  }
}

export default new SocraticPersonalityExtractor();