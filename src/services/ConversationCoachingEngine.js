// Real-time Conversation Coaching Engine
// Revolutionary AI-powered real-time conversation analysis and coaching

import PersonalityProfilingEngine from './PersonalityProfilingEngine';
import CompatibilityMatchingEngine from './CompatibilityMatchingEngine';
import RelationshipMilestoneTracker from './RelationshipMilestoneTracker';
import RAGService from './RAGService';

class ConversationCoachingEngine {
  constructor() {
    this.initialized = false;
    this.activeCoachingSessions = new Map();
    this.coachingHistory = new Map();
    this.realTimeAnalysis = new Map();
    
    // Coaching categories
    this.coachingCategories = {
      communication_style: {
        name: 'Communication Style',
        weight: 0.25,
        indicators: ['tone', 'directness', 'emotional_expression', 'listening_cues']
      },
      emotional_intelligence: {
        name: 'Emotional Intelligence',
        weight: 0.20,
        indicators: ['empathy', 'self_awareness', 'emotional_regulation', 'social_awareness']
      },
      conversation_flow: {
        name: 'Conversation Flow',
        weight: 0.20,
        indicators: ['question_asking', 'active_listening', 'topic_transitions', 'engagement_level']
      },
      relationship_building: {
        name: 'Relationship Building',
        weight: 0.15,
        indicators: ['vulnerability', 'trust_building', 'shared_experiences', 'future_focus']
      },
      conflict_resolution: {
        name: 'Conflict Resolution',
        weight: 0.10,
        indicators: ['disagreement_handling', 'compromise', 'understanding_seeking', 'resolution_focus']
      },
      intimacy_development: {
        name: 'Intimacy Development',
        weight: 0.10,
        indicators: ['personal_sharing', 'emotional_closeness', 'physical_comfort', 'romantic_connection']
      }
    };

    // Real-time coaching patterns
    this.coachingPatterns = new Map();
    this.initializeCoachingPatterns();
  }

  // Initialize the conversation coaching engine
  async initialize() {
    if (this.initialized) return;

    try {
      // Initialize required services
      await PersonalityProfilingEngine.initialize();
      await CompatibilityMatchingEngine.initialize();
      await RelationshipMilestoneTracker.initialize();
      await RAGService.initialize();
      
      this.initialized = true;
      console.log('Conversation Coaching Engine initialized successfully');
    } catch (error) {
      console.error('Error initializing Conversation Coaching Engine:', error);
      this.initialized = true; // Continue with limited functionality
    }
  }

  // Initialize coaching patterns
  initializeCoachingPatterns() {
    // Communication style patterns
    this.coachingPatterns.set('improve_directness', {
      category: 'communication_style',
      trigger: 'indirect_communication',
      coaching: {
        immediate: 'Try being more direct: "I feel..." instead of "Maybe we could..."',
        explanation: 'Direct communication helps avoid misunderstandings',
        example: 'Instead of: "Maybe we could think about..." Try: "I\'d like to discuss..."'
      }
    });

    this.coachingPatterns.set('enhance_emotional_expression', {
      category: 'communication_style',
      trigger: 'low_emotional_expression',
      coaching: {
        immediate: 'Share how that makes you feel - emotions create connection',
        explanation: 'Emotional expression helps build intimacy and understanding',
        example: 'Add: "That makes me feel..." or "I\'m excited about..."'
      }
    });

    this.coachingPatterns.set('active_listening_cues', {
      category: 'communication_style',
      trigger: 'poor_listening_signals',
      coaching: {
        immediate: 'Show you\'re listening: "That sounds..." or "I hear you saying..."',
        explanation: 'Active listening makes your partner feel heard and valued',
        example: 'Use: "What I\'m hearing is..." or "That must have felt..."'
      }
    });

    // Emotional intelligence patterns
    this.coachingPatterns.set('show_empathy', {
      category: 'emotional_intelligence',
      trigger: 'low_empathy_response',
      coaching: {
        immediate: 'Acknowledge their feelings: "That must have been difficult"',
        explanation: 'Empathy shows you understand their emotional experience',
        example: 'Try: "I can imagine how that felt" or "That sounds challenging"'
      }
    });

    this.coachingPatterns.set('emotional_validation', {
      category: 'emotional_intelligence',
      trigger: 'dismissive_response',
      coaching: {
        immediate: 'Validate their emotions before offering solutions',
        explanation: 'People need to feel heard before they\'re ready for advice',
        example: 'Start with: "Your feelings are valid" or "I understand why you\'d feel that way"'
      }
    });

    // Conversation flow patterns
    this.coachingPatterns.set('ask_follow_up_questions', {
      category: 'conversation_flow',
      trigger: 'minimal_questions',
      coaching: {
        immediate: 'Ask a follow-up question to show deeper interest',
        explanation: 'Questions demonstrate curiosity and keep conversations flowing',
        example: 'Try: "What was that like for you?" or "How did that make you feel?"'
      }
    });

    this.coachingPatterns.set('smooth_topic_transition', {
      category: 'conversation_flow',
      trigger: 'abrupt_topic_change',
      coaching: {
        immediate: 'Bridge topics: "That reminds me..." or "Speaking of..."',
        explanation: 'Smooth transitions help maintain conversation flow',
        example: 'Use: "That\'s interesting, it reminds me of..." or "On a related note..."'
      }
    });

    // Relationship building patterns
    this.coachingPatterns.set('share_vulnerability', {
      category: 'relationship_building',
      trigger: 'surface_level_sharing',
      coaching: {
        immediate: 'Share something personal to deepen the connection',
        explanation: 'Vulnerability builds trust and emotional intimacy',
        example: 'Try: "I\'ve never told anyone this, but..." or "Something I struggle with is..."'
      }
    });

    this.coachingPatterns.set('future_focus', {
      category: 'relationship_building',
      trigger: 'only_past_present_focus',
      coaching: {
        immediate: 'Ask about their hopes, dreams, or future plans',
        explanation: 'Future-focused conversations build shared vision',
        example: 'Ask: "What are you excited about in the future?" or "Where do you see yourself in 5 years?"'
      }
    });

    // Conflict resolution patterns
    this.coachingPatterns.set('seek_understanding', {
      category: 'conflict_resolution',
      trigger: 'defensive_response',
      coaching: {
        immediate: 'Seek to understand their perspective first',
        explanation: 'Understanding before being understood reduces conflict',
        example: 'Try: "Help me understand your point of view" or "What am I missing?"'
      }
    });

    this.coachingPatterns.set('find_common_ground', {
      category: 'conflict_resolution',
      trigger: 'polarized_disagreement',
      coaching: {
        immediate: 'Look for areas where you agree: "We both want..."',
        explanation: 'Common ground provides foundation for resolving differences',
        example: 'Use: "What we both seem to care about is..." or "I think we agree that..."'
      }
    });

    // Intimacy development patterns
    this.coachingPatterns.set('deepen_emotional_sharing', {
      category: 'intimacy_development',
      trigger: 'surface_emotional_sharing',
      coaching: {
        immediate: 'Share the deeper emotion behind your thoughts',
        explanation: 'Emotional depth creates stronger intimate connections',
        example: 'Instead of "I think..." try "I feel..." or "In my heart, I..."'
      }
    });

    this.coachingPatterns.set('express_appreciation', {
      category: 'intimacy_development',
      trigger: 'lack_of_appreciation',
      coaching: {
        immediate: 'Express what you appreciate about them or the conversation',
        explanation: 'Appreciation builds positive emotional connection',
        example: 'Try: "I really appreciate..." or "What I love about you is..."'
      }
    });
  }

  // Start real-time coaching session
  async startCoachingSession(userId, partnerId, sessionType = 'general') {
    if (!this.initialized) await this.initialize();

    const sessionId = `${userId}-${partnerId}-${Date.now()}`;
    
    try {
      // Get personality profiles and compatibility
      const userProfile = PersonalityProfilingEngine.getUserProfile(userId);
      const partnerProfile = PersonalityProfilingEngine.getUserProfile(partnerId);
      const compatibility = await CompatibilityMatchingEngine.calculateCompatibility(userId, partnerId);
      const relationshipData = RelationshipMilestoneTracker.getRelationshipData(userId, partnerId);

      // Create coaching session
      const session = {
        id: sessionId,
        userId,
        partnerId,
        sessionType,
        startTime: new Date().toISOString(),
        userProfile,
        partnerProfile,
        compatibility,
        relationshipData,
        messageHistory: [],
        coachingHistory: [],
        realTimeMetrics: {
          engagement_level: 0.5,
          emotional_tone: 0.5,
          conversation_flow: 0.5,
          connection_depth: 0.5
        },
        personalizedCoaching: this.generatePersonalizedCoaching(userProfile, partnerProfile, compatibility),
        activeAlerts: []
      };

      this.activeCoachingSessions.set(sessionId, session);
      return session;

    } catch (error) {
      console.error('Error starting coaching session:', error);
      return null;
    }
  }

  // Analyze message in real-time and provide coaching
  async analyzeMessageRealTime(sessionId, message, messageType = 'sent') {
    const session = this.activeCoachingSessions.get(sessionId);
    if (!session) return null;

    try {
      // Analyze message for coaching opportunities
      const analysis = await this.performMessageAnalysis(message, session, messageType);
      
      // Update session with message and analysis
      this.updateSessionWithMessage(session, message, analysis, messageType);
      
      // Generate real-time coaching
      const coaching = this.generateRealTimeCoaching(analysis, session);
      
      // Update session metrics
      this.updateSessionMetrics(session, analysis);
      
      // Check for coaching alerts
      const alerts = this.checkCoachingAlerts(session, analysis);

      return {
        analysis,
        coaching,
        metrics: session.realTimeMetrics,
        alerts,
        sessionInsights: this.generateSessionInsights(session)
      };

    } catch (error) {
      console.error('Error analyzing message in real-time:', error);
      return null;
    }
  }

  // Perform comprehensive message analysis
  async performMessageAnalysis(message, session, messageType) {
    const analysis = {
      timestamp: new Date().toISOString(),
      message,
      messageType,
      length: message.length,
      wordCount: message.split(/\s+/).length,
      indicators: {},
      scores: {},
      patterns: [],
      opportunities: []
    };

    const msg = message.toLowerCase();

    // Analyze communication style
    analysis.indicators.communication_style = this.analyzeCommunicationStyle(msg, session);
    analysis.scores.communication_style = this.scoreCommunicationStyle(analysis.indicators.communication_style);

    // Analyze emotional intelligence
    analysis.indicators.emotional_intelligence = this.analyzeEmotionalIntelligence(msg, session);
    analysis.scores.emotional_intelligence = this.scoreEmotionalIntelligence(analysis.indicators.emotional_intelligence);

    // Analyze conversation flow
    analysis.indicators.conversation_flow = this.analyzeConversationFlow(msg, session);
    analysis.scores.conversation_flow = this.scoreConversationFlow(analysis.indicators.conversation_flow);

    // Analyze relationship building
    analysis.indicators.relationship_building = this.analyzeRelationshipBuilding(msg, session);
    analysis.scores.relationship_building = this.scoreRelationshipBuilding(analysis.indicators.relationship_building);

    // Analyze conflict resolution (if applicable)
    if (this.detectConflictContext(msg, session)) {
      analysis.indicators.conflict_resolution = this.analyzeConflictResolution(msg, session);
      analysis.scores.conflict_resolution = this.scoreConflictResolution(analysis.indicators.conflict_resolution);
    }

    // Analyze intimacy development
    analysis.indicators.intimacy_development = this.analyzeIntimacyDevelopment(msg, session);
    analysis.scores.intimacy_development = this.scoreIntimacyDevelopment(analysis.indicators.intimacy_development);

    // Identify coaching patterns
    analysis.patterns = this.identifyCoachingPatterns(analysis, session);

    // Generate coaching opportunities
    analysis.opportunities = this.generateCoachingOpportunities(analysis, session);

    return analysis;
  }

  // Analyze communication style
  analyzeCommunicationStyle(message, session) {
    const indicators = {
      directness: 0.5,
      emotional_expression: 0.5,
      active_listening: 0.5,
      tone: 'neutral'
    };

    // Directness analysis
    const directWords = ['i think', 'i feel', 'i want', 'i need', 'i believe'];
    const indirectWords = ['maybe', 'perhaps', 'sort of', 'kind of', 'possibly'];
    
    const directCount = directWords.reduce((count, word) => count + (message.includes(word) ? 1 : 0), 0);
    const indirectCount = indirectWords.reduce((count, word) => count + (message.includes(word) ? 1 : 0), 0);
    
    indicators.directness = Math.max(0, Math.min(1, 0.5 + (directCount - indirectCount) * 0.2));

    // Emotional expression analysis
    const emotionalWords = ['feel', 'emotion', 'happy', 'sad', 'excited', 'worried', 'love', 'care'];
    const emotionalCount = emotionalWords.reduce((count, word) => count + (message.includes(word) ? 1 : 0), 0);
    indicators.emotional_expression = Math.min(1, emotionalCount * 0.3);

    // Active listening cues
    const listeningWords = ['understand', 'hear', 'sounds like', 'what you mean', 'tell me more'];
    const listeningCount = listeningWords.reduce((count, word) => count + (message.includes(word) ? 1 : 0), 0);
    indicators.active_listening = Math.min(1, listeningCount * 0.4);

    // Tone analysis
    if (message.includes('!') || message.includes('excited') || message.includes('amazing')) {
      indicators.tone = 'enthusiastic';
    } else if (message.includes('sorry') || message.includes('worried') || message.includes('concerned')) {
      indicators.tone = 'concerned';
    } else if (message.includes('love') || message.includes('care') || message.includes('appreciate')) {
      indicators.tone = 'warm';
    }

    return indicators;
  }

  // Analyze emotional intelligence
  analyzeEmotionalIntelligence(message, session) {
    const indicators = {
      empathy: 0.5,
      self_awareness: 0.5,
      emotional_regulation: 0.5,
      social_awareness: 0.5
    };

    // Empathy analysis
    const empathyWords = ['understand', 'feel for you', 'must be', 'imagine', 'that sounds'];
    const empathyCount = empathyWords.reduce((count, word) => count + (message.includes(word) ? 1 : 0), 0);
    indicators.empathy = Math.min(1, empathyCount * 0.3);

    // Self-awareness analysis
    const selfAwareWords = ['i realize', 'i notice', 'i recognize', 'i\'m aware', 'i struggle'];
    const selfAwareCount = selfAwareWords.reduce((count, word) => count + (message.includes(word) ? 1 : 0), 0);
    indicators.self_awareness = Math.min(1, selfAwareCount * 0.4);

    // Emotional regulation analysis
    const regulationWords = ['calm', 'breathe', 'take a step back', 'think about', 'process'];
    const dysregulationWords = ['can\'t handle', 'overwhelmed', 'losing it', 'freaking out'];
    
    const regulationCount = regulationWords.reduce((count, word) => count + (message.includes(word) ? 1 : 0), 0);
    const dysregulationCount = dysregulationWords.reduce((count, word) => count + (message.includes(word) ? 1 : 0), 0);
    
    indicators.emotional_regulation = Math.max(0, Math.min(1, 0.5 + (regulationCount - dysregulationCount) * 0.3));

    // Social awareness analysis
    const socialWords = ['you might', 'you probably', 'others might', 'people usually'];
    const socialCount = socialWords.reduce((count, word) => count + (message.includes(word) ? 1 : 0), 0);
    indicators.social_awareness = Math.min(1, socialCount * 0.4);

    return indicators;
  }

  // Analyze conversation flow
  analyzeConversationFlow(message, session) {
    const indicators = {
      question_asking: 0.5,
      topic_transitions: 0.5,
      engagement_level: 0.5,
      response_relevance: 0.5
    };

    // Question asking analysis
    const questionCount = (message.match(/\?/g) || []).length;
    const questionWords = ['what', 'how', 'why', 'when', 'where', 'tell me'];
    const questionWordCount = questionWords.reduce((count, word) => count + (message.includes(word) ? 1 : 0), 0);
    indicators.question_asking = Math.min(1, (questionCount * 0.3) + (questionWordCount * 0.2));

    // Topic transitions analysis
    const transitionWords = ['speaking of', 'that reminds me', 'on another note', 'by the way'];
    const transitionCount = transitionWords.reduce((count, word) => count + (message.includes(word) ? 1 : 0), 0);
    indicators.topic_transitions = Math.min(1, transitionCount * 0.5);

    // Engagement level analysis
    const engagementWords = ['interesting', 'tell me more', 'i\'d love to know', 'that\'s amazing'];
    const engagementCount = engagementWords.reduce((count, word) => count + (message.includes(word) ? 1 : 0), 0);
    indicators.engagement_level = Math.min(1, engagementCount * 0.4);

    // Response relevance (simplified - would need conversation context)
    indicators.response_relevance = 0.7; // Default - would analyze against previous messages

    return indicators;
  }

  // Analyze relationship building
  analyzeRelationshipBuilding(message, session) {
    const indicators = {
      vulnerability: 0.5,
      trust_building: 0.5,
      shared_experiences: 0.5,
      future_focus: 0.5
    };

    // Vulnerability analysis
    const vulnerabilityWords = ['scared', 'nervous', 'insecure', 'struggle', 'difficult', 'personal'];
    const vulnerabilityCount = vulnerabilityWords.reduce((count, word) => count + (message.includes(word) ? 1 : 0), 0);
    indicators.vulnerability = Math.min(1, vulnerabilityCount * 0.3);

    // Trust building analysis
    const trustWords = ['honest', 'open', 'share', 'trust', 'believe', 'confidence'];
    const trustCount = trustWords.reduce((count, word) => count + (message.includes(word) ? 1 : 0), 0);
    indicators.trust_building = Math.min(1, trustCount * 0.3);

    // Shared experiences analysis
    const sharedWords = ['we', 'us', 'our', 'together', 'both', 'shared'];
    const sharedCount = sharedWords.reduce((count, word) => count + (message.includes(word) ? 1 : 0), 0);
    indicators.shared_experiences = Math.min(1, sharedCount * 0.2);

    // Future focus analysis
    const futureWords = ['future', 'plan', 'someday', 'hope', 'dream', 'goal'];
    const futureCount = futureWords.reduce((count, word) => count + (message.includes(word) ? 1 : 0), 0);
    indicators.future_focus = Math.min(1, futureCount * 0.3);

    return indicators;
  }

  // Analyze conflict resolution
  analyzeConflictResolution(message, session) {
    const indicators = {
      understanding_seeking: 0.5,
      compromise: 0.5,
      common_ground: 0.5,
      resolution_focus: 0.5
    };

    // Understanding seeking analysis
    const understandingWords = ['help me understand', 'your perspective', 'what do you mean', 'explain'];
    const understandingCount = understandingWords.reduce((count, word) => count + (message.includes(word) ? 1 : 0), 0);
    indicators.understanding_seeking = Math.min(1, understandingCount * 0.4);

    // Compromise analysis
    const compromiseWords = ['middle ground', 'compromise', 'both ways', 'work together'];
    const compromiseCount = compromiseWords.reduce((count, word) => count + (message.includes(word) ? 1 : 0), 0);
    indicators.compromise = Math.min(1, compromiseCount * 0.5);

    // Common ground analysis
    const commonWords = ['agree', 'both want', 'share', 'common', 'similar'];
    const commonCount = commonWords.reduce((count, word) => count + (message.includes(word) ? 1 : 0), 0);
    indicators.common_ground = Math.min(1, commonCount * 0.4);

    // Resolution focus analysis
    const resolutionWords = ['solve', 'fix', 'resolve', 'work out', 'move forward'];
    const resolutionCount = resolutionWords.reduce((count, word) => count + (message.includes(word) ? 1 : 0), 0);
    indicators.resolution_focus = Math.min(1, resolutionCount * 0.4);

    return indicators;
  }

  // Analyze intimacy development
  analyzeIntimacyDevelopment(message, session) {
    const indicators = {
      personal_sharing: 0.5,
      emotional_closeness: 0.5,
      romantic_connection: 0.5,
      physical_comfort: 0.5
    };

    // Personal sharing analysis
    const personalWords = ['never told anyone', 'personal', 'private', 'secret', 'intimate'];
    const personalCount = personalWords.reduce((count, word) => count + (message.includes(word) ? 1 : 0), 0);
    indicators.personal_sharing = Math.min(1, personalCount * 0.4);

    // Emotional closeness analysis
    const closenessWords = ['close', 'connected', 'bond', 'special', 'mean to me'];
    const closenessCount = closenessWords.reduce((count, word) => count + (message.includes(word) ? 1 : 0), 0);
    indicators.emotional_closeness = Math.min(1, closenessCount * 0.4);

    // Romantic connection analysis
    const romanticWords = ['love', 'romantic', 'beautiful', 'amazing', 'special'];
    const romanticCount = romanticWords.reduce((count, word) => count + (message.includes(word) ? 1 : 0), 0);
    indicators.romantic_connection = Math.min(1, romanticCount * 0.3);

    // Physical comfort analysis
    const physicalWords = ['hug', 'touch', 'hold', 'close', 'physical'];
    const physicalCount = physicalWords.reduce((count, word) => count + (message.includes(word) ? 1 : 0), 0);
    indicators.physical_comfort = Math.min(1, physicalCount * 0.4);

    return indicators;
  }

  // Identify coaching patterns
  identifyCoachingPatterns(analysis, session) {
    const patterns = [];

    // Check each coaching pattern
    for (const [patternId, pattern] of this.coachingPatterns) {
      if (this.matchesPattern(analysis, pattern, session)) {
        patterns.push({
          id: patternId,
          pattern: pattern,
          confidence: this.calculatePatternConfidence(analysis, pattern),
          priority: this.calculatePatternPriority(pattern, session)
        });
      }
    }

    // Sort by priority and confidence
    return patterns.sort((a, b) => (b.priority * b.confidence) - (a.priority * a.confidence));
  }

  // Check if analysis matches a coaching pattern
  matchesPattern(analysis, pattern, session) {
    const category = pattern.category;
    const trigger = pattern.trigger;
    
    // Get relevant indicators for this category
    const indicators = analysis.indicators[category];
    if (!indicators) return false;

    // Check specific trigger conditions
    switch (trigger) {
      case 'indirect_communication':
        return indicators.directness < 0.4;
      case 'low_emotional_expression':
        return indicators.emotional_expression < 0.3;
      case 'poor_listening_signals':
        return indicators.active_listening < 0.3;
      case 'low_empathy_response':
        return indicators.empathy < 0.3;
      case 'dismissive_response':
        return indicators.empathy < 0.2;
      case 'minimal_questions':
        return indicators.question_asking < 0.3;
      case 'abrupt_topic_change':
        return indicators.topic_transitions < 0.2;
      case 'surface_level_sharing':
        return indicators.personal_sharing < 0.3;
      case 'only_past_present_focus':
        return indicators.future_focus < 0.2;
      case 'defensive_response':
        return indicators.understanding_seeking < 0.3;
      case 'polarized_disagreement':
        return indicators.common_ground < 0.2;
      case 'surface_emotional_sharing':
        return indicators.emotional_closeness < 0.3;
      case 'lack_of_appreciation':
        return analysis.message.includes('appreciate') === false;
      default:
        return false;
    }
  }

  // Generate real-time coaching
  generateRealTimeCoaching(analysis, session) {
    const coaching = {
      immediate: [],
      contextual: [],
      strategic: [],
      personalized: []
    };

    // Immediate coaching from patterns
    const topPatterns = analysis.patterns.slice(0, 2);
    for (const patternData of topPatterns) {
      coaching.immediate.push({
        type: 'pattern_coaching',
        category: patternData.pattern.category,
        message: patternData.pattern.coaching.immediate,
        explanation: patternData.pattern.coaching.explanation,
        example: patternData.pattern.coaching.example,
        priority: patternData.priority
      });
    }

    // Contextual coaching based on relationship stage
    const relationshipStage = session.relationshipData?.relationshipStage || 'pre_relationship';
    coaching.contextual.push(...this.generateContextualCoaching(analysis, relationshipStage));

    // Strategic coaching based on compatibility
    coaching.strategic.push(...this.generateStrategicCoaching(analysis, session.compatibility));

    // Personalized coaching based on personality
    coaching.personalized.push(...this.generatePersonalizedCoaching(
      session.userProfile,
      session.partnerProfile,
      session.compatibility
    ));

    return coaching;
  }

  // Generate contextual coaching
  generateContextualCoaching(analysis, relationshipStage) {
    const coaching = [];

    switch (relationshipStage) {
      case 'pre_relationship':
        coaching.push({
          type: 'stage_coaching',
          message: 'Focus on learning about each other - ask curious questions',
          explanation: 'This stage is about discovery and building initial connection'
        });
        break;
      case 'early_relationship':
        coaching.push({
          type: 'stage_coaching',
          message: 'Share more personal stories to deepen your connection',
          explanation: 'Early relationships benefit from increasing vulnerability and trust'
        });
        break;
      case 'developing_relationship':
        coaching.push({
          type: 'stage_coaching',
          message: 'Discuss future plans and shared goals together',
          explanation: 'Developing relationships need future-focused conversations'
        });
        break;
    }

    return coaching;
  }

  // Generate strategic coaching
  generateStrategicCoaching(analysis, compatibility) {
    const coaching = [];

    // Communication compatibility coaching
    if (compatibility.dimensions.communication.score < 0.6) {
      coaching.push({
        type: 'strategic_coaching',
        message: 'Focus on understanding their communication style',
        explanation: 'Your communication styles differ - adapt to bridge the gap'
      });
    }

    // Attachment compatibility coaching
    if (compatibility.dimensions.attachment.score < 0.6) {
      coaching.push({
        type: 'strategic_coaching',
        message: 'Be patient with attachment differences - create safety',
        explanation: 'Different attachment styles need different approaches to feel secure'
      });
    }

    return coaching;
  }

  // Generate personalized coaching
  generatePersonalizedCoaching(userProfile, partnerProfile, compatibility) {
    const coaching = [];

    // Personality-based coaching
    const userBigFive = userProfile.dimensions.big_five || {};
    const partnerBigFive = partnerProfile.dimensions.big_five || {};

    // Extraversion coaching
    if (userBigFive.extraversion > 0.7 && partnerBigFive.extraversion < 0.4) {
      coaching.push({
        type: 'personality_coaching',
        message: 'Give them processing time - introverts need space to think',
        explanation: 'Your partner may need more time to process and respond'
      });
    }

    // Neuroticism coaching
    if (partnerBigFive.neuroticism > 0.6) {
      coaching.push({
        type: 'personality_coaching',
        message: 'Use reassuring language and avoid criticism',
        explanation: 'They may be more sensitive to emotional stress'
      });
    }

    // Agreeableness coaching
    if (userBigFive.agreeableness < 0.4) {
      coaching.push({
        type: 'personality_coaching',
        message: 'Focus on warmth and validation in your responses',
        explanation: 'A softer approach will improve your connection'
      });
    }

    return coaching;
  }

  // Update session with message and analysis
  updateSessionWithMessage(session, message, analysis, messageType) {
    session.messageHistory.push({
      timestamp: new Date().toISOString(),
      message,
      messageType,
      analysis
    });

    // Keep only last 50 messages
    if (session.messageHistory.length > 50) {
      session.messageHistory = session.messageHistory.slice(-50);
    }
  }

  // Update session metrics
  updateSessionMetrics(session, analysis) {
    const metrics = session.realTimeMetrics;
    
    // Update engagement level
    const engagementScore = (
      analysis.scores.conversation_flow * 0.4 +
      analysis.scores.emotional_intelligence * 0.3 +
      analysis.scores.relationship_building * 0.3
    );
    metrics.engagement_level = (metrics.engagement_level * 0.7) + (engagementScore * 0.3);

    // Update emotional tone
    const emotionalScore = (
      analysis.scores.emotional_intelligence * 0.5 +
      analysis.scores.intimacy_development * 0.3 +
      analysis.scores.communication_style * 0.2
    );
    metrics.emotional_tone = (metrics.emotional_tone * 0.8) + (emotionalScore * 0.2);

    // Update conversation flow
    metrics.conversation_flow = (metrics.conversation_flow * 0.7) + (analysis.scores.conversation_flow * 0.3);

    // Update connection depth
    const connectionScore = (
      analysis.scores.relationship_building * 0.4 +
      analysis.scores.intimacy_development * 0.4 +
      analysis.scores.emotional_intelligence * 0.2
    );
    metrics.connection_depth = (metrics.connection_depth * 0.8) + (connectionScore * 0.2);
  }

  // Check for coaching alerts
  checkCoachingAlerts(session, analysis) {
    const alerts = [];

    // Low engagement alert
    if (session.realTimeMetrics.engagement_level < 0.3) {
      alerts.push({
        type: 'engagement',
        severity: 'medium',
        message: 'Engagement seems low - try asking an open-ended question',
        actionable: true
      });
    }

    // Communication breakdown alert
    if (analysis.scores.communication_style < 0.3) {
      alerts.push({
        type: 'communication',
        severity: 'high',
        message: 'Communication could be clearer - be more direct and specific',
        actionable: true
      });
    }

    // Emotional disconnect alert
    if (analysis.scores.emotional_intelligence < 0.3) {
      alerts.push({
        type: 'emotional',
        severity: 'medium',
        message: 'Show more empathy and emotional awareness',
        actionable: true
      });
    }

    return alerts;
  }

  // Generate session insights
  generateSessionInsights(session) {
    const insights = {
      strengths: [],
      improvements: [],
      patterns: [],
      progress: {}
    };

    // Analyze strengths
    const metrics = session.realTimeMetrics;
    if (metrics.engagement_level > 0.7) {
      insights.strengths.push('High engagement and active participation');
    }
    if (metrics.emotional_tone > 0.7) {
      insights.strengths.push('Strong emotional connection and expression');
    }
    if (metrics.conversation_flow > 0.7) {
      insights.strengths.push('Excellent conversation flow and listening skills');
    }

    // Analyze improvement areas
    if (metrics.engagement_level < 0.5) {
      insights.improvements.push('Focus on asking more questions and showing curiosity');
    }
    if (metrics.emotional_tone < 0.5) {
      insights.improvements.push('Express emotions more openly and show empathy');
    }
    if (metrics.conversation_flow < 0.5) {
      insights.improvements.push('Improve active listening and smooth topic transitions');
    }

    return insights;
  }

  // Helper methods
  detectConflictContext(message, session) {
    const conflictWords = ['disagree', 'wrong', 'argue', 'upset', 'frustrated', 'angry'];
    return conflictWords.some(word => message.includes(word));
  }

  scoreCommunicationStyle(indicators) {
    return (indicators.directness * 0.3 + indicators.emotional_expression * 0.3 + 
            indicators.active_listening * 0.4);
  }

  scoreEmotionalIntelligence(indicators) {
    return (indicators.empathy * 0.3 + indicators.self_awareness * 0.2 + 
            indicators.emotional_regulation * 0.3 + indicators.social_awareness * 0.2);
  }

  scoreConversationFlow(indicators) {
    return (indicators.question_asking * 0.3 + indicators.topic_transitions * 0.2 + 
            indicators.engagement_level * 0.3 + indicators.response_relevance * 0.2);
  }

  scoreRelationshipBuilding(indicators) {
    return (indicators.vulnerability * 0.3 + indicators.trust_building * 0.3 + 
            indicators.shared_experiences * 0.2 + indicators.future_focus * 0.2);
  }

  scoreConflictResolution(indicators) {
    return (indicators.understanding_seeking * 0.3 + indicators.compromise * 0.3 + 
            indicators.common_ground * 0.2 + indicators.resolution_focus * 0.2);
  }

  scoreIntimacyDevelopment(indicators) {
    return (indicators.personal_sharing * 0.3 + indicators.emotional_closeness * 0.3 + 
            indicators.romantic_connection * 0.2 + indicators.physical_comfort * 0.2);
  }

  calculatePatternConfidence(analysis, pattern) {
    const categoryScore = analysis.scores[pattern.category] || 0.5;
    return 1 - categoryScore; // Lower scores = higher confidence in coaching need
  }

  calculatePatternPriority(pattern, session) {
    const categoryWeight = this.coachingCategories[pattern.category]?.weight || 0.1;
    const relationshipStageBonus = this.getRelationshipStageBonus(pattern, session);
    return categoryWeight + relationshipStageBonus;
  }

  getRelationshipStageBonus(pattern, session) {
    const stage = session.relationshipData?.relationshipStage || 'pre_relationship';
    
    // Boost communication and emotional intelligence in early stages
    if (stage === 'pre_relationship' || stage === 'early_relationship') {
      if (pattern.category === 'communication_style' || pattern.category === 'emotional_intelligence') {
        return 0.1;
      }
    }
    
    // Boost intimacy and relationship building in later stages
    if (stage === 'developing_relationship' || stage === 'committed_relationship') {
      if (pattern.category === 'intimacy_development' || pattern.category === 'relationship_building') {
        return 0.1;
      }
    }
    
    return 0;
  }

  // End coaching session
  endCoachingSession(sessionId) {
    const session = this.activeCoachingSessions.get(sessionId);
    if (!session) return null;

    // Generate session summary
    const summary = {
      sessionId,
      duration: Date.now() - new Date(session.startTime).getTime(),
      messageCount: session.messageHistory.length,
      finalMetrics: session.realTimeMetrics,
      coachingProvided: session.coachingHistory.length,
      insights: this.generateSessionInsights(session),
      recommendations: this.generateSessionRecommendations(session)
    };

    // Store in history
    this.coachingHistory.set(sessionId, {
      ...session,
      endTime: new Date().toISOString(),
      summary
    });

    // Remove from active sessions
    this.activeCoachingSessions.delete(sessionId);

    return summary;
  }

  // Generate session recommendations
  generateSessionRecommendations(session) {
    const recommendations = [];
    const metrics = session.realTimeMetrics;

    // Improvement recommendations
    if (metrics.engagement_level < 0.6) {
      recommendations.push({
        area: 'engagement',
        priority: 'high',
        suggestion: 'Practice asking more follow-up questions to show deeper interest'
      });
    }

    if (metrics.emotional_tone < 0.6) {
      recommendations.push({
        area: 'emotional_connection',
        priority: 'medium',
        suggestion: 'Share more personal feelings and validate their emotions'
      });
    }

    if (metrics.conversation_flow < 0.6) {
      recommendations.push({
        area: 'conversation_skills',
        priority: 'medium',
        suggestion: 'Work on smooth topic transitions and active listening'
      });
    }

    return recommendations;
  }

  // Get coaching statistics
  getStats() {
    return {
      initialized: this.initialized,
      activeSessions: this.activeCoachingSessions.size,
      totalSessionsCompleted: this.coachingHistory.size,
      coachingPatterns: this.coachingPatterns.size,
      coachingCategories: Object.keys(this.coachingCategories).length
    };
  }
}

export default new ConversationCoachingEngine();