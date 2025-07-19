// SoulAI Learning Engine - Passive personality and compatibility analysis
// This engine silently learns about users through natural conversation

import AsyncStorage from '@react-native-async-storage/async-storage';

class SoulAILearningEngine {
  constructor() {
    this.userId = null;
    this.userProfile = null;
    this.conversationCount = 0;
    this.knowledgeBase = null;
  }

  // Initialize user profile
  async initializeUser(userId) {
    this.userId = userId;
    this.userProfile = await this.loadUserProfile(userId);
    this.conversationCount = this.userProfile.conversationCount || 0;
  }

  // Load existing user profile or create new one
  async loadUserProfile(userId) {
    try {
      const profile = await AsyncStorage.getItem(`soulai_profile_${userId}`);
      if (profile) {
        return JSON.parse(profile);
      }
    } catch (error) {
      console.log('Creating new user profile');
    }

    // Create new profile with all levels
    return {
      userId,
      createdAt: new Date().toISOString(),
      lastUpdated: new Date().toISOString(),
      conversationCount: 0,
      
      // LEVEL 1: Core Personality Framework
      personality: {
        mbti: {
          energyDirection: null, // E/I
          informationProcessing: null, // S/N
          decisionMaking: null, // T/F
          worldInteraction: null, // J/P
          confidence: 0 // 0-100
        },
        bigFive: {
          openness: 50,
          conscientiousness: 50,
          extraversion: 50,
          agreeableness: 50,
          neuroticism: 50,
          confidence: 0
        },
        attachment: {
          style: null, // Secure/Anxious/Avoidant/Disorganized
          confidence: 0
        }
      },

      // LEVEL 2: Values & Life Philosophy
      values: {
        priorities: {
          family: 5,
          career: 5,
          adventure: 5,
          stability: 5,
          creativity: 5,
          spirituality: 5,
          socialImpact: 5,
          confidence: 0
        },
        relationship: {
          communicationStyle: null,
          conflictResolution: null,
          intimacyNeeds: null,
          independenceNeeds: null,
          confidence: 0
        }
      },

      // LEVEL 3: Behavioral Patterns
      behavior: {
        communication: {
          responseTime: null,
          emotionalExpression: null,
          humorStyle: null,
          topicPreferences: [],
          confidence: 0
        },
        social: {
          energyFromSocial: null,
          groupDynamics: null,
          boundaryStyle: null,
          confidence: 0
        }
      },

      // LEVEL 4: Emotional Intelligence
      emotional: {
        processing: {
          emotionalAwareness: null,
          empathyLevel: null,
          emotionalRegulation: null,
          stressResponse: null,
          confidence: 0
        },
        triggers: [],
        needs: [],
        confidence: 0
      },

      // LEVEL 5: Lifestyle & Interests
      lifestyle: {
        patterns: {
          energyPeaks: null,
          socialFrequency: null,
          routinePreference: null,
          changeAdaptability: null,
          confidence: 0
        },
        interests: {
          primary: [],
          casual: [],
          learning: [],
          sharing: [],
          confidence: 0
        }
      },

      // LEVEL 6: Relationship History & Patterns
      relationships: {
        patterns: {
          relationshipLength: null,
          endingReasons: [],
          learningPoints: [],
          redFlags: [],
          greenFlags: [],
          confidence: 0
        },
        seeking: {
          timelineSerious: null,
          dealBreakers: [],
          mustHaves: [],
          niceToHaves: [],
          confidence: 0
        }
      },

      // Learning metadata
      insights: [],
      keyQuotes: [],
      conversationThemes: [],
      learningPhase: 'personality_discovery' // personality_discovery -> values_exploration -> behavioral_patterns -> emotional_depth -> lifestyle_mapping -> relationship_goals
    };
  }

  // Main analysis function - called after every user message
  async analyzeMessage(userMessage, conversationHistory) {
    if (!this.userProfile) return;

    this.conversationCount++;
    this.userProfile.conversationCount = this.conversationCount;

    // Analyze based on conversation phase
    const insights = await this.extractInsights(userMessage, conversationHistory);
    await this.updateProfile(insights);
    await this.saveProfile();

    // Return updated profile confidence for adaptation
    return this.getProfileConfidence();
  }

  // Extract insights from user message
  async extractInsights(userMessage, conversationHistory) {
    const insights = {
      personality: {},
      values: {},
      behavior: {},
      emotional: {},
      lifestyle: {},
      relationships: {}
    };

    // PERSONALITY INDICATORS
    insights.personality = this.analyzePersonalityIndicators(userMessage);
    
    // VALUES EXTRACTION
    insights.values = this.analyzeValues(userMessage);
    
    // BEHAVIORAL PATTERNS
    insights.behavior = this.analyzeBehavioralPatterns(userMessage, conversationHistory);
    
    // EMOTIONAL PATTERNS
    insights.emotional = this.analyzeEmotionalPatterns(userMessage);
    
    // LIFESTYLE INDICATORS
    insights.lifestyle = this.analyzeLifestyleIndicators(userMessage);
    
    // RELATIONSHIP INSIGHTS
    insights.relationships = this.analyzeRelationshipPatterns(userMessage);

    return insights;
  }

  // Analyze personality indicators from message
  analyzePersonalityIndicators(message) {
    const indicators = {};
    const text = message.toLowerCase();

    // MBTI Indicators
    // Extraversion/Introversion
    if (text.includes('love being around people') || text.includes('party') || text.includes('social')) {
      indicators.energyDirection = { type: 'E', confidence: 0.3 };
    } else if (text.includes('quiet time') || text.includes('alone') || text.includes('drained by people')) {
      indicators.energyDirection = { type: 'I', confidence: 0.3 };
    }

    // Sensing/Intuition
    if (text.includes('practical') || text.includes('details') || text.includes('facts')) {
      indicators.informationProcessing = { type: 'S', confidence: 0.2 };
    } else if (text.includes('possibilities') || text.includes('big picture') || text.includes('imagine')) {
      indicators.informationProcessing = { type: 'N', confidence: 0.2 };
    }

    // Thinking/Feeling
    if (text.includes('logical') || text.includes('analyze') || text.includes('objective')) {
      indicators.decisionMaking = { type: 'T', confidence: 0.2 };
    } else if (text.includes('feel') || text.includes('heart') || text.includes('values')) {
      indicators.decisionMaking = { type: 'F', confidence: 0.2 };
    }

    // Judging/Perceiving
    if (text.includes('plan') || text.includes('organized') || text.includes('schedule')) {
      indicators.worldInteraction = { type: 'J', confidence: 0.2 };
    } else if (text.includes('spontaneous') || text.includes('flexible') || text.includes('go with flow')) {
      indicators.worldInteraction = { type: 'P', confidence: 0.2 };
    }

    return indicators;
  }

  // Analyze values from message
  analyzeValues(message) {
    const values = {};
    const text = message.toLowerCase();

    // Priority indicators
    if (text.includes('family') || text.includes('parents') || text.includes('kids')) {
      values.family = { importance: 8, confidence: 0.3 };
    }
    if (text.includes('career') || text.includes('job') || text.includes('work')) {
      values.career = { importance: 7, confidence: 0.3 };
    }
    if (text.includes('travel') || text.includes('adventure') || text.includes('explore')) {
      values.adventure = { importance: 7, confidence: 0.3 };
    }

    return values;
  }

  // Analyze behavioral patterns
  analyzeBehavioralPatterns(message, conversationHistory) {
    const patterns = {};
    
    // Communication style analysis
    if (message.length > 200) {
      patterns.communicationDepth = 'detailed';
    } else if (message.length < 50) {
      patterns.communicationDepth = 'concise';
    }

    // Emotional expression analysis
    const emotionalWords = ['feel', 'love', 'hate', 'excited', 'worried', 'happy', 'sad'];
    const emotionalCount = emotionalWords.filter(word => message.toLowerCase().includes(word)).length;
    
    if (emotionalCount > 2) {
      patterns.emotionalExpression = 'open';
    } else if (emotionalCount === 0) {
      patterns.emotionalExpression = 'guarded';
    }

    return patterns;
  }

  // Analyze emotional patterns
  analyzeEmotionalPatterns(message) {
    const emotional = {};
    const text = message.toLowerCase();

    // Emotional awareness indicators
    if (text.includes('i feel') || text.includes('i\'m feeling') || text.includes('emotionally')) {
      emotional.awareness = { level: 'high', confidence: 0.3 };
    }

    // Empathy indicators
    if (text.includes('others feel') || text.includes('understand them') || text.includes('empathize')) {
      emotional.empathy = { level: 'high', confidence: 0.3 };
    }

    return emotional;
  }

  // Analyze lifestyle indicators
  analyzeLifestyleIndicators(message) {
    const lifestyle = {};
    const text = message.toLowerCase();

    // Routine preferences
    if (text.includes('routine') || text.includes('schedule') || text.includes('plan')) {
      lifestyle.routinePreference = { type: 'structured', confidence: 0.3 };
    } else if (text.includes('spontaneous') || text.includes('flexible') || text.includes('improvise')) {
      lifestyle.routinePreference = { type: 'flexible', confidence: 0.3 };
    }

    // Interest extraction
    const interestKeywords = ['love', 'enjoy', 'passionate about', 'hobby', 'favorite'];
    interestKeywords.forEach(keyword => {
      if (text.includes(keyword)) {
        // Extract what comes after the keyword
        const index = text.indexOf(keyword);
        const after = text.substring(index + keyword.length, index + keyword.length + 50);
        lifestyle.interests = lifestyle.interests || [];
        lifestyle.interests.push(after.trim());
      }
    });

    return lifestyle;
  }

  // Analyze relationship patterns
  analyzeRelationshipPatterns(message) {
    const relationships = {};
    const text = message.toLowerCase();

    // Relationship timeline indicators
    if (text.includes('ready for something serious') || text.includes('looking for long term')) {
      relationships.timeline = { type: 'serious', confidence: 0.4 };
    } else if (text.includes('taking it slow') || text.includes('see where it goes')) {
      relationships.timeline = { type: 'gradual', confidence: 0.4 };
    }

    // Deal breakers
    if (text.includes('deal breaker') || text.includes('can\'t stand') || text.includes('never')) {
      relationships.dealBreakers = relationships.dealBreakers || [];
      // Extract what comes after these phrases
    }

    return relationships;
  }

  // Update user profile with new insights
  async updateProfile(insights) {
    // Update personality
    if (insights.personality.energyDirection) {
      this.updatePersonalityTrait('energyDirection', insights.personality.energyDirection);
    }
    if (insights.personality.informationProcessing) {
      this.updatePersonalityTrait('informationProcessing', insights.personality.informationProcessing);
    }
    if (insights.personality.decisionMaking) {
      this.updatePersonalityTrait('decisionMaking', insights.personality.decisionMaking);
    }
    if (insights.personality.worldInteraction) {
      this.updatePersonalityTrait('worldInteraction', insights.personality.worldInteraction);
    }

    // Update values
    if (insights.values.family) {
      this.userProfile.values.priorities.family = Math.max(
        this.userProfile.values.priorities.family,
        insights.values.family.importance
      );
    }
    if (insights.values.career) {
      this.userProfile.values.priorities.career = Math.max(
        this.userProfile.values.priorities.career,
        insights.values.career.importance
      );
    }
    if (insights.values.adventure) {
      this.userProfile.values.priorities.adventure = Math.max(
        this.userProfile.values.priorities.adventure,
        insights.values.adventure.importance
      );
    }

    // Update behavioral patterns
    if (insights.behavior.communicationDepth) {
      this.userProfile.behavior.communication.responseTime = insights.behavior.communicationDepth;
    }
    if (insights.behavior.emotionalExpression) {
      this.userProfile.behavior.communication.emotionalExpression = insights.behavior.emotionalExpression;
    }

    // Update emotional patterns
    if (insights.emotional.awareness) {
      this.userProfile.emotional.processing.emotionalAwareness = insights.emotional.awareness.level;
    }
    if (insights.emotional.empathy) {
      this.userProfile.emotional.processing.empathyLevel = insights.emotional.empathy.level;
    }

    // Update lifestyle
    if (insights.lifestyle.routinePreference) {
      this.userProfile.lifestyle.patterns.routinePreference = insights.lifestyle.routinePreference.type;
    }
    if (insights.lifestyle.interests) {
      this.userProfile.lifestyle.interests.primary = [
        ...this.userProfile.lifestyle.interests.primary,
        ...insights.lifestyle.interests
      ];
    }

    // Update relationships
    if (insights.relationships.timeline) {
      this.userProfile.relationships.seeking.timelineSerious = insights.relationships.timeline.type;
    }

    this.userProfile.lastUpdated = new Date().toISOString();
  }

  // Update personality trait with confidence weighting
  updatePersonalityTrait(trait, insight) {
    const current = this.userProfile.personality.mbti[trait];
    const currentConfidence = this.userProfile.personality.mbti.confidence || 0;
    
    if (!current) {
      this.userProfile.personality.mbti[trait] = insight.type;
      this.userProfile.personality.mbti.confidence = insight.confidence;
    } else if (current === insight.type) {
      // Reinforce existing trait
      this.userProfile.personality.mbti.confidence = Math.min(1, currentConfidence + insight.confidence);
    } else {
      // Conflicting evidence - reduce confidence
      this.userProfile.personality.mbti.confidence = Math.max(0, currentConfidence - insight.confidence);
    }
  }

  // Save profile to storage
  async saveProfile() {
    try {
      await AsyncStorage.setItem(
        `soulai_profile_${this.userId}`,
        JSON.stringify(this.userProfile)
      );
    } catch (error) {
      console.error('Error saving profile:', error);
    }
  }

  // Get overall profile confidence
  getProfileConfidence() {
    const confidences = [
      this.userProfile.personality.mbti.confidence,
      this.userProfile.values.priorities.confidence,
      this.userProfile.behavior.communication.confidence,
      this.userProfile.emotional.processing.confidence,
      this.userProfile.lifestyle.patterns.confidence,
      this.userProfile.relationships.patterns.confidence
    ];

    return confidences.reduce((sum, conf) => sum + conf, 0) / confidences.length;
  }

  // Get user profile (for compatibility analysis)
  getUserProfile() {
    return this.userProfile;
  }

  // Calculate compatibility between two users
  async calculateCompatibility(userProfile1, userProfile2) {
    const compatibility = {
      overall: 0,
      personality: 0,
      values: 0,
      behavior: 0,
      emotional: 0,
      lifestyle: 0,
      relationships: 0,
      details: {}
    };

    // MBTI compatibility
    compatibility.personality = this.calculateMBTICompatibility(
      userProfile1.personality.mbti,
      userProfile2.personality.mbti
    );

    // Values compatibility
    compatibility.values = this.calculateValuesCompatibility(
      userProfile1.values,
      userProfile2.values
    );

    // Behavioral compatibility
    compatibility.behavior = this.calculateBehavioralCompatibility(
      userProfile1.behavior,
      userProfile2.behavior
    );

    // Emotional compatibility
    compatibility.emotional = this.calculateEmotionalCompatibility(
      userProfile1.emotional,
      userProfile2.emotional
    );

    // Lifestyle compatibility
    compatibility.lifestyle = this.calculateLifestyleCompatibility(
      userProfile1.lifestyle,
      userProfile2.lifestyle
    );

    // Relationship compatibility
    compatibility.relationships = this.calculateRelationshipCompatibility(
      userProfile1.relationships,
      userProfile2.relationships
    );

    // Overall weighted score
    compatibility.overall = (
      compatibility.personality * 0.25 +
      compatibility.values * 0.25 +
      compatibility.behavior * 0.15 +
      compatibility.emotional * 0.15 +
      compatibility.lifestyle * 0.1 +
      compatibility.relationships * 0.1
    );

    return compatibility;
  }

  // MBTI compatibility calculation
  calculateMBTICompatibility(mbti1, mbti2) {
    if (!mbti1.energyDirection || !mbti2.energyDirection) return 0.5;

    let score = 0;
    
    // Complementary pairs often work well
    if (mbti1.energyDirection !== mbti2.energyDirection) score += 0.2;
    if (mbti1.informationProcessing === mbti2.informationProcessing) score += 0.3;
    if (mbti1.decisionMaking !== mbti2.decisionMaking) score += 0.2; // T+F often complement
    if (mbti1.worldInteraction === mbti2.worldInteraction) score += 0.3;

    return Math.min(1, score);
  }

  // Values compatibility calculation
  calculateValuesCompatibility(values1, values2) {
    const priorities1 = values1.priorities;
    const priorities2 = values2.priorities;

    let totalDifference = 0;
    let comparisons = 0;

    Object.keys(priorities1).forEach(key => {
      if (key !== 'confidence' && priorities2[key] !== undefined) {
        totalDifference += Math.abs(priorities1[key] - priorities2[key]);
        comparisons++;
      }
    });

    if (comparisons === 0) return 0.5;

    // Convert difference to similarity (0-1 scale)
    const averageDifference = totalDifference / comparisons;
    return Math.max(0, 1 - (averageDifference / 10));
  }

  // Behavioral compatibility calculation
  calculateBehavioralCompatibility(behavior1, behavior2) {
    let score = 0.5; // Default neutral

    // Communication style compatibility
    if (behavior1.communication.emotionalExpression === behavior2.communication.emotionalExpression) {
      score += 0.3;
    } else if (
      (behavior1.communication.emotionalExpression === 'open' && behavior2.communication.emotionalExpression === 'guarded') ||
      (behavior1.communication.emotionalExpression === 'guarded' && behavior2.communication.emotionalExpression === 'open')
    ) {
      score -= 0.2; // Potential conflict
    }

    return Math.max(0, Math.min(1, score));
  }

  // Emotional compatibility calculation
  calculateEmotionalCompatibility(emotional1, emotional2) {
    let score = 0.5;

    // High emotional awareness + high empathy = good match
    if (emotional1.processing.emotionalAwareness === 'high' && emotional2.processing.empathyLevel === 'high') {
      score += 0.3;
    }
    if (emotional2.processing.emotionalAwareness === 'high' && emotional1.processing.empathyLevel === 'high') {
      score += 0.3;
    }

    return Math.max(0, Math.min(1, score));
  }

  // Lifestyle compatibility calculation
  calculateLifestyleCompatibility(lifestyle1, lifestyle2) {
    let score = 0.5;

    // Routine preferences
    if (lifestyle1.patterns.routinePreference === lifestyle2.patterns.routinePreference) {
      score += 0.4;
    } else if (
      (lifestyle1.patterns.routinePreference === 'structured' && lifestyle2.patterns.routinePreference === 'flexible') ||
      (lifestyle1.patterns.routinePreference === 'flexible' && lifestyle2.patterns.routinePreference === 'structured')
    ) {
      score += 0.1; // Can complement each other
    }

    // Interest overlap
    const interests1 = lifestyle1.interests.primary || [];
    const interests2 = lifestyle2.interests.primary || [];
    const overlap = interests1.filter(interest => interests2.includes(interest));
    if (overlap.length > 0) {
      score += 0.2 * Math.min(1, overlap.length / 3);
    }

    return Math.max(0, Math.min(1, score));
  }

  // Relationship compatibility calculation
  calculateRelationshipCompatibility(relationships1, relationships2) {
    let score = 0.5;

    // Timeline compatibility
    if (relationships1.seeking.timelineSerious === relationships2.seeking.timelineSerious) {
      score += 0.5;
    } else if (
      (relationships1.seeking.timelineSerious === 'serious' && relationships2.seeking.timelineSerious === 'gradual') ||
      (relationships1.seeking.timelineSerious === 'gradual' && relationships2.seeking.timelineSerious === 'serious')
    ) {
      score += 0.2; // Some compatibility
    }

    return Math.max(0, Math.min(1, score));
  }
}

// Export singleton instance
export default new SoulAILearningEngine();