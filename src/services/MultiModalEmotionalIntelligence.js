// Multi-Modal Emotional Intelligence Engine
// Revolutionary AI system combining text, photo, and behavioral analysis for comprehensive emotional intelligence

import PersonalityProfilingEngine from './PersonalityProfilingEngine';
import PhotoPersonalityAnalyzer from './PhotoPersonalityAnalyzer';
import ConversationCoachingEngine from './ConversationCoachingEngine';
import VectorEmbeddingService from './VectorEmbeddingService';
import AsyncStorage from '@react-native-async-storage/async-storage';

class MultiModalEmotionalIntelligence {
  constructor() {
    this.initialized = false;
    this.storageKey = 'multimodal_ei_data';
    this.userEmotionalProfiles = new Map();
    this.emotionalAnalysisHistory = new Map();
    this.realTimeEmotionalState = new Map();
    
    // Emotional dimensions and weights
    this.emotionalDimensions = {
      self_awareness: {
        weight: 0.20,
        components: {
          emotion_recognition: 0.3,
          trigger_awareness: 0.3,
          self_reflection: 0.2,
          emotional_granularity: 0.2
        }
      },
      self_regulation: {
        weight: 0.20,
        components: {
          impulse_control: 0.3,
          adaptability: 0.25,
          stress_management: 0.25,
          emotional_stability: 0.2
        }
      },
      motivation: {
        weight: 0.15,
        components: {
          achievement_drive: 0.4,
          optimism: 0.3,
          initiative: 0.3
        }
      },
      empathy: {
        weight: 0.20,
        components: {
          emotional_understanding: 0.4,
          perspective_taking: 0.3,
          compassionate_response: 0.3
        }
      },
      social_skills: {
        weight: 0.25,
        components: {
          communication_effectiveness: 0.3,
          conflict_resolution: 0.25,
          influence_and_persuasion: 0.2,
          teamwork_collaboration: 0.25
        }
      }
    };

    // Modal analysis types
    this.modalTypes = {
      text: {
        name: 'Text Analysis',
        weight: 0.4,
        analyzer: 'analyzeTextEmotions',
        confidence_threshold: 0.3
      },
      photo: {
        name: 'Photo Analysis',
        weight: 0.3,
        analyzer: 'analyzePhotoEmotions',
        confidence_threshold: 0.2
      },
      behavioral: {
        name: 'Behavioral Analysis',
        weight: 0.3,
        analyzer: 'analyzeBehavioralEmotions',
        confidence_threshold: 0.4
      }
    };

    // Emotional fusion algorithms
    this.fusionAlgorithms = new Map();
    this.initializeFusionAlgorithms();
  }

  // Initialize the multi-modal EI engine
  async initialize() {
    if (this.initialized) return;

    try {
      // Initialize required services
      await PersonalityProfilingEngine.initialize();
      await PhotoPersonalityAnalyzer.initialize();
      await ConversationCoachingEngine.initialize();
      await VectorEmbeddingService.initialize();
      
      // Load stored data
      await this.loadEmotionalProfiles();
      
      this.initialized = true;
      console.log('Multi-Modal Emotional Intelligence Engine initialized successfully');
    } catch (error) {
      console.error('Error initializing Multi-Modal EI Engine:', error);
      this.initialized = true; // Continue with limited functionality
    }
  }

  // Initialize fusion algorithms
  initializeFusionAlgorithms() {
    // Weighted average fusion
    this.fusionAlgorithms.set('weighted_average', {
      name: 'Weighted Average Fusion',
      description: 'Combines modalities using weighted averages',
      method: this.weightedAverageFusion.bind(this)
    });

    // Confidence-based fusion
    this.fusionAlgorithms.set('confidence_based', {
      name: 'Confidence-Based Fusion',
      description: 'Weights modalities based on confidence levels',
      method: this.confidenceBasedFusion.bind(this)
    });

    // Dynamic fusion
    this.fusionAlgorithms.set('dynamic', {
      name: 'Dynamic Fusion',
      description: 'Adapts fusion strategy based on context',
      method: this.dynamicFusion.bind(this)
    });

    // Consensus fusion
    this.fusionAlgorithms.set('consensus', {
      name: 'Consensus Fusion',
      description: 'Finds consensus across modalities',
      method: this.consensusFusion.bind(this)
    });
  }

  // Comprehensive multi-modal emotional analysis
  async analyzeEmotionalIntelligence(userId, inputData, context = {}) {
    if (!this.initialized) await this.initialize();

    try {
      // Prepare analysis structure
      const analysis = {
        userId,
        timestamp: new Date().toISOString(),
        context,
        modalAnalyses: {},
        fusedAnalysis: {},
        insights: [],
        recommendations: []
      };

      // Analyze each available modality
      const modalPromises = [];

      if (inputData.text) {
        modalPromises.push(
          this.analyzeTextEmotions(inputData.text, context)
            .then(result => ({ type: 'text', analysis: result }))
        );
      }

      if (inputData.photo) {
        modalPromises.push(
          this.analyzePhotoEmotions(inputData.photo, context)
            .then(result => ({ type: 'photo', analysis: result }))
        );
      }

      if (inputData.behavioral) {
        modalPromises.push(
          this.analyzeBehavioralEmotions(inputData.behavioral, context)
            .then(result => ({ type: 'behavioral', analysis: result }))
        );
      }

      // Wait for all modal analyses to complete
      const modalResults = await Promise.all(modalPromises);

      // Store modal analyses
      for (const result of modalResults) {
        analysis.modalAnalyses[result.type] = result.analysis;
      }

      // Fuse modal analyses
      analysis.fusedAnalysis = await this.fuseModalAnalyses(analysis.modalAnalyses, context);

      // Update user's emotional profile
      await this.updateUserEmotionalProfile(userId, analysis);

      // Generate insights and recommendations
      analysis.insights = this.generateEmotionalInsights(analysis);
      analysis.recommendations = this.generateEmotionalRecommendations(analysis);

      // Store analysis in history
      this.storeAnalysisHistory(userId, analysis);

      return analysis;

    } catch (error) {
      console.error('Error in multi-modal emotional analysis:', error);
      return this.getDefaultEmotionalAnalysis(userId, inputData);
    }
  }

  // Analyze text emotions
  async analyzeTextEmotions(text, context) {
    const analysis = {
      timestamp: new Date().toISOString(),
      input: text,
      emotions: {},
      ei_dimensions: {},
      confidence: 0.5,
      evidence: []
    };

    const msg = text.toLowerCase();

    // Analyze emotional dimensions
    analysis.ei_dimensions = {
      self_awareness: await this.analyzeTextSelfAwareness(msg, context),
      self_regulation: await this.analyzeTextSelfRegulation(msg, context),
      motivation: await this.analyzeTextMotivation(msg, context),
      empathy: await this.analyzeTextEmpathy(msg, context),
      social_skills: await this.analyzeTextSocialSkills(msg, context)
    };

    // Detect specific emotions
    analysis.emotions = this.detectTextEmotions(msg);

    // Calculate overall confidence
    analysis.confidence = this.calculateTextAnalysisConfidence(analysis);

    // Generate evidence
    analysis.evidence = this.generateTextEvidence(msg, analysis);

    return analysis;
  }

  // Analyze text self-awareness
  async analyzeTextSelfAwareness(text, context) {
    const analysis = {
      emotion_recognition: 0.5,
      trigger_awareness: 0.5,
      self_reflection: 0.5,
      emotional_granularity: 0.5,
      confidence: 0.3
    };

    // Emotion recognition
    const emotionWords = ['i feel', 'i\'m feeling', 'emotion', 'emotional', 'mood'];
    const emotionCount = emotionWords.reduce((count, word) => count + (text.includes(word) ? 1 : 0), 0);
    analysis.emotion_recognition = Math.min(1, emotionCount * 0.3);

    // Trigger awareness
    const triggerWords = ['because', 'triggered by', 'makes me', 'when this happens', 'caused by'];
    const triggerCount = triggerWords.reduce((count, word) => count + (text.includes(word) ? 1 : 0), 0);
    analysis.trigger_awareness = Math.min(1, triggerCount * 0.4);

    // Self-reflection
    const reflectionWords = ['i realize', 'i notice', 'i understand', 'i learned', 'i recognize'];
    const reflectionCount = reflectionWords.reduce((count, word) => count + (text.includes(word) ? 1 : 0), 0);
    analysis.self_reflection = Math.min(1, reflectionCount * 0.4);

    // Emotional granularity
    const specificEmotions = ['anxious', 'excited', 'frustrated', 'grateful', 'disappointed', 'hopeful'];
    const granularityCount = specificEmotions.reduce((count, word) => count + (text.includes(word) ? 1 : 0), 0);
    analysis.emotional_granularity = Math.min(1, granularityCount * 0.3);

    analysis.confidence = Math.min(0.8, 0.3 + (analysis.emotion_recognition * 0.5));

    return analysis;
  }

  // Analyze text self-regulation
  async analyzeTextSelfRegulation(text, context) {
    const analysis = {
      impulse_control: 0.5,
      adaptability: 0.5,
      stress_management: 0.5,
      emotional_stability: 0.5,
      confidence: 0.3
    };

    // Impulse control
    const controlWords = ['i thought before', 'i paused', 'i took a breath', 'i controlled myself'];
    const impulsiveWords = ['i snapped', 'i couldn\'t help', 'i lost it', 'i reacted immediately'];
    const controlCount = controlWords.reduce((count, word) => count + (text.includes(word) ? 1 : 0), 0);
    const impulsiveCount = impulsiveWords.reduce((count, word) => count + (text.includes(word) ? 1 : 0), 0);
    analysis.impulse_control = Math.max(0, Math.min(1, 0.5 + (controlCount - impulsiveCount) * 0.3));

    // Adaptability
    const adaptWords = ['i adjusted', 'i adapted', 'i changed approach', 'i tried differently'];
    const adaptCount = adaptWords.reduce((count, word) => count + (text.includes(word) ? 1 : 0), 0);
    analysis.adaptability = Math.min(1, adaptCount * 0.4);

    // Stress management
    const stressManagementWords = ['i managed', 'i coped', 'i handled', 'i dealt with'];
    const stressOverwhelmWords = ['overwhelmed', 'can\'t cope', 'too much', 'breaking down'];
    const managementCount = stressManagementWords.reduce((count, word) => count + (text.includes(word) ? 1 : 0), 0);
    const overwhelmCount = stressOverwhelmWords.reduce((count, word) => count + (text.includes(word) ? 1 : 0), 0);
    analysis.stress_management = Math.max(0, Math.min(1, 0.5 + (managementCount - overwhelmCount) * 0.3));

    // Emotional stability
    const stabilityWords = ['calm', 'stable', 'balanced', 'consistent'];
    const instabilityWords = ['unstable', 'erratic', 'unpredictable', 'all over the place'];
    const stabilityCount = stabilityWords.reduce((count, word) => count + (text.includes(word) ? 1 : 0), 0);
    const instabilityCount = instabilityWords.reduce((count, word) => count + (text.includes(word) ? 1 : 0), 0);
    analysis.emotional_stability = Math.max(0, Math.min(1, 0.5 + (stabilityCount - instabilityCount) * 0.3));

    analysis.confidence = Math.min(0.7, 0.3 + (analysis.impulse_control * 0.4));

    return analysis;
  }

  // Analyze text motivation
  async analyzeTextMotivation(text, context) {
    const analysis = {
      achievement_drive: 0.5,
      optimism: 0.5,
      initiative: 0.5,
      confidence: 0.3
    };

    // Achievement drive
    const achievementWords = ['goal', 'achieve', 'accomplish', 'succeed', 'strive', 'ambition'];
    const achievementCount = achievementWords.reduce((count, word) => count + (text.includes(word) ? 1 : 0), 0);
    analysis.achievement_drive = Math.min(1, achievementCount * 0.3);

    // Optimism
    const optimismWords = ['hope', 'positive', 'optimistic', 'confident', 'bright', 'believe'];
    const pessimismWords = ['hopeless', 'negative', 'pessimistic', 'doubt', 'dark', 'impossible'];
    const optimismCount = optimismWords.reduce((count, word) => count + (text.includes(word) ? 1 : 0), 0);
    const pessimismCount = pessimismWords.reduce((count, word) => count + (text.includes(word) ? 1 : 0), 0);
    analysis.optimism = Math.max(0, Math.min(1, 0.5 + (optimismCount - pessimismCount) * 0.3));

    // Initiative
    const initiativeWords = ['i will', 'i\'ll start', 'i\'m going to', 'i decided', 'i\'m taking action'];
    const initiativeCount = initiativeWords.reduce((count, word) => count + (text.includes(word) ? 1 : 0), 0);
    analysis.initiative = Math.min(1, initiativeCount * 0.4);

    analysis.confidence = Math.min(0.6, 0.3 + (analysis.achievement_drive * 0.3));

    return analysis;
  }

  // Analyze text empathy
  async analyzeTextEmpathy(text, context) {
    const analysis = {
      emotional_understanding: 0.5,
      perspective_taking: 0.5,
      compassionate_response: 0.5,
      confidence: 0.3
    };

    // Emotional understanding
    const understandingWords = ['i understand', 'i can see', 'i get it', 'i feel for', 'i sense'];
    const understandingCount = understandingWords.reduce((count, word) => count + (text.includes(word) ? 1 : 0), 0);
    analysis.emotional_understanding = Math.min(1, understandingCount * 0.4);

    // Perspective taking
    const perspectiveWords = ['from your perspective', 'i imagine', 'you must feel', 'in your shoes'];
    const perspectiveCount = perspectiveWords.reduce((count, word) => count + (text.includes(word) ? 1 : 0), 0);
    analysis.perspective_taking = Math.min(1, perspectiveCount * 0.5);

    // Compassionate response
    const compassionWords = ['i\'m sorry', 'i care', 'i\'m here for you', 'i support you'];
    const compassionCount = compassionWords.reduce((count, word) => count + (text.includes(word) ? 1 : 0), 0);
    analysis.compassionate_response = Math.min(1, compassionCount * 0.4);

    analysis.confidence = Math.min(0.8, 0.3 + (analysis.emotional_understanding * 0.5));

    return analysis;
  }

  // Analyze text social skills
  async analyzeTextSocialSkills(text, context) {
    const analysis = {
      communication_effectiveness: 0.5,
      conflict_resolution: 0.5,
      influence_and_persuasion: 0.5,
      teamwork_collaboration: 0.5,
      confidence: 0.3
    };

    // Communication effectiveness
    const effectiveCommWords = ['clearly', 'specifically', 'i mean', 'to clarify', 'let me explain'];
    const effectiveCount = effectiveCommWords.reduce((count, word) => count + (text.includes(word) ? 1 : 0), 0);
    analysis.communication_effectiveness = Math.min(1, effectiveCount * 0.4);

    // Conflict resolution
    const conflictResWords = ['let\'s resolve', 'we can work this out', 'common ground', 'compromise'];
    const conflictResCount = conflictResWords.reduce((count, word) => count + (text.includes(word) ? 1 : 0), 0);
    analysis.conflict_resolution = Math.min(1, conflictResCount * 0.5);

    // Influence and persuasion
    const influenceWords = ['consider', 'what if', 'imagine', 'think about', 'you might'];
    const influenceCount = influenceWords.reduce((count, word) => count + (text.includes(word) ? 1 : 0), 0);
    analysis.influence_and_persuasion = Math.min(1, influenceCount * 0.3);

    // Teamwork collaboration
    const teamworkWords = ['we can', 'together', 'collaborate', 'work with', 'let\'s'];
    const teamworkCount = teamworkWords.reduce((count, word) => count + (text.includes(word) ? 1 : 0), 0);
    analysis.teamwork_collaboration = Math.min(1, teamworkCount * 0.4);

    analysis.confidence = Math.min(0.7, 0.3 + (analysis.communication_effectiveness * 0.4));

    return analysis;
  }

  // Detect specific emotions in text
  detectTextEmotions(text) {
    const emotions = {
      joy: 0,
      sadness: 0,
      anger: 0,
      fear: 0,
      surprise: 0,
      disgust: 0,
      love: 0,
      excitement: 0,
      anxiety: 0,
      contentment: 0
    };

    const emotionKeywords = {
      joy: ['happy', 'joyful', 'delighted', 'cheerful', 'glad', 'pleased'],
      sadness: ['sad', 'depressed', 'melancholy', 'down', 'blue', 'gloomy'],
      anger: ['angry', 'furious', 'mad', 'irritated', 'frustrated', 'annoyed'],
      fear: ['afraid', 'scared', 'terrified', 'anxious', 'worried', 'nervous'],
      surprise: ['surprised', 'amazed', 'shocked', 'astonished', 'startled'],
      disgust: ['disgusted', 'revolted', 'sickened', 'appalled', 'repulsed'],
      love: ['love', 'adore', 'cherish', 'affection', 'devoted', 'caring'],
      excitement: ['excited', 'thrilled', 'elated', 'enthusiastic', 'energetic'],
      anxiety: ['anxious', 'nervous', 'worried', 'stressed', 'tense', 'uneasy'],
      contentment: ['content', 'satisfied', 'peaceful', 'calm', 'serene', 'relaxed']
    };

    for (const [emotion, keywords] of Object.entries(emotionKeywords)) {
      const count = keywords.reduce((sum, keyword) => sum + (text.includes(keyword) ? 1 : 0), 0);
      emotions[emotion] = Math.min(1, count * 0.3);
    }

    return emotions;
  }

  // Analyze photo emotions
  async analyzePhotoEmotions(photoData, context) {
    const analysis = {
      timestamp: new Date().toISOString(),
      input: photoData,
      emotions: {},
      ei_dimensions: {},
      confidence: 0.2,
      evidence: []
    };

    try {
      // Use PhotoPersonalityAnalyzer for photo analysis
      const photoAnalysis = await PhotoPersonalityAnalyzer.analyzePhoto(
        context.userId || 'unknown',
        photoData,
        context.photoMetadata || {}
      );

      // Extract emotional intelligence dimensions from photo analysis
      if (photoAnalysis.personality_insights) {
        analysis.ei_dimensions = this.extractEIFromPhotoAnalysis(photoAnalysis.personality_insights);
      }

      // Detect emotions from photo
      analysis.emotions = this.detectPhotoEmotions(photoAnalysis);

      // Calculate confidence
      analysis.confidence = Math.min(0.7, 0.2 + (analysis.ei_dimensions.confidence || 0) * 0.5);

      // Generate evidence
      analysis.evidence = this.generatePhotoEvidence(photoAnalysis);

    } catch (error) {
      console.error('Error in photo emotion analysis:', error);
      analysis.error = error.message;
    }

    return analysis;
  }

  // Extract EI dimensions from photo analysis
  extractEIFromPhotoAnalysis(photoInsights) {
    const dimensions = {
      self_awareness: {
        emotion_recognition: 0.5,
        trigger_awareness: 0.3,
        self_reflection: 0.4,
        emotional_granularity: 0.4,
        confidence: 0.2
      },
      self_regulation: {
        impulse_control: 0.5,
        adaptability: 0.5,
        stress_management: photoInsights.neuroticism ? (1 - photoInsights.neuroticism.score) : 0.5,
        emotional_stability: photoInsights.neuroticism ? (1 - photoInsights.neuroticism.score) : 0.5,
        confidence: photoInsights.neuroticism ? photoInsights.neuroticism.confidence : 0.2
      },
      motivation: {
        achievement_drive: photoInsights.conscientiousness ? photoInsights.conscientiousness.score : 0.5,
        optimism: photoInsights.extraversion ? photoInsights.extraversion.score : 0.5,
        initiative: photoInsights.openness ? photoInsights.openness.score : 0.5,
        confidence: 0.3
      },
      empathy: {
        emotional_understanding: photoInsights.agreeableness ? photoInsights.agreeableness.score : 0.5,
        perspective_taking: photoInsights.agreeableness ? photoInsights.agreeableness.score : 0.5,
        compassionate_response: photoInsights.agreeableness ? photoInsights.agreeableness.score : 0.5,
        confidence: photoInsights.agreeableness ? photoInsights.agreeableness.confidence : 0.2
      },
      social_skills: {
        communication_effectiveness: photoInsights.extraversion ? photoInsights.extraversion.score : 0.5,
        conflict_resolution: photoInsights.agreeableness ? photoInsights.agreeableness.score : 0.5,
        influence_and_persuasion: photoInsights.extraversion ? photoInsights.extraversion.score : 0.5,
        teamwork_collaboration: photoInsights.agreeableness ? photoInsights.agreeableness.score : 0.5,
        confidence: 0.3
      }
    };

    return dimensions;
  }

  // Detect emotions from photo
  detectPhotoEmotions(photoAnalysis) {
    const emotions = {
      joy: 0.5,
      sadness: 0.5,
      anger: 0.5,
      fear: 0.5,
      surprise: 0.5,
      disgust: 0.5,
      love: 0.5,
      excitement: 0.5,
      anxiety: 0.5,
      contentment: 0.5
    };

    // Map photo insights to emotions
    if (photoAnalysis.personality_insights) {
      const insights = photoAnalysis.personality_insights;
      
      // Joy from extraversion and positive expressions
      if (insights.extraversion && insights.extraversion.score > 0.6) {
        emotions.joy = Math.min(1, emotions.joy + 0.3);
        emotions.excitement = Math.min(1, emotions.excitement + 0.2);
      }

      // Anxiety from neuroticism
      if (insights.neuroticism && insights.neuroticism.score > 0.6) {
        emotions.anxiety = Math.min(1, emotions.anxiety + 0.4);
        emotions.fear = Math.min(1, emotions.fear + 0.2);
      }

      // Contentment from low neuroticism and high agreeableness
      if (insights.neuroticism && insights.neuroticism.score < 0.4 && 
          insights.agreeableness && insights.agreeableness.score > 0.6) {
        emotions.contentment = Math.min(1, emotions.contentment + 0.3);
      }

      // Love from agreeableness and warmth
      if (insights.agreeableness && insights.agreeableness.score > 0.7) {
        emotions.love = Math.min(1, emotions.love + 0.3);
      }
    }

    return emotions;
  }

  // Analyze behavioral emotions
  async analyzeBehavioralEmotions(behavioralData, context) {
    const analysis = {
      timestamp: new Date().toISOString(),
      input: behavioralData,
      emotions: {},
      ei_dimensions: {},
      confidence: 0.4,
      evidence: []
    };

    try {
      // Analyze behavioral patterns
      analysis.ei_dimensions = this.analyzeBehavioralEIDimensions(behavioralData, context);
      analysis.emotions = this.detectBehavioralEmotions(behavioralData, context);
      analysis.confidence = this.calculateBehavioralConfidence(behavioralData);
      analysis.evidence = this.generateBehavioralEvidence(behavioralData);

    } catch (error) {
      console.error('Error in behavioral emotion analysis:', error);
      analysis.error = error.message;
    }

    return analysis;
  }

  // Analyze behavioral EI dimensions
  analyzeBehavioralEIDimensions(behavioralData, context) {
    const dimensions = {
      self_awareness: this.analyzeBehavioralSelfAwareness(behavioralData),
      self_regulation: this.analyzeBehavioralSelfRegulation(behavioralData),
      motivation: this.analyzeBehavioralMotivation(behavioralData),
      empathy: this.analyzeBehavioralEmpathy(behavioralData),
      social_skills: this.analyzeBehavioralSocialSkills(behavioralData)
    };

    return dimensions;
  }

  // Analyze behavioral self-awareness
  analyzeBehavioralSelfAwareness(behavioralData) {
    return {
      emotion_recognition: behavioralData.emotionRecognitionFrequency || 0.5,
      trigger_awareness: behavioralData.triggerAwarenessScore || 0.5,
      self_reflection: behavioralData.selfReflectionTime || 0.5,
      emotional_granularity: behavioralData.emotionVocabularySize || 0.5,
      confidence: 0.6
    };
  }

  // Analyze behavioral self-regulation
  analyzeBehavioralSelfRegulation(behavioralData) {
    return {
      impulse_control: behavioralData.impulseControlScore || 0.5,
      adaptability: behavioralData.adaptabilityScore || 0.5,
      stress_management: behavioralData.stressManagementScore || 0.5,
      emotional_stability: behavioralData.emotionalStabilityScore || 0.5,
      confidence: 0.7
    };
  }

  // Analyze behavioral motivation
  analyzeBehavioralMotivation(behavioralData) {
    return {
      achievement_drive: behavioralData.achievementDriveScore || 0.5,
      optimism: behavioralData.optimismScore || 0.5,
      initiative: behavioralData.initiativeScore || 0.5,
      confidence: 0.6
    };
  }

  // Analyze behavioral empathy
  analyzeBehavioralEmpathy(behavioralData) {
    return {
      emotional_understanding: behavioralData.emotionalUnderstandingScore || 0.5,
      perspective_taking: behavioralData.perspectiveTakingScore || 0.5,
      compassionate_response: behavioralData.compassionateResponseScore || 0.5,
      confidence: 0.6
    };
  }

  // Analyze behavioral social skills
  analyzeBehavioralSocialSkills(behavioralData) {
    return {
      communication_effectiveness: behavioralData.communicationEffectivenessScore || 0.5,
      conflict_resolution: behavioralData.conflictResolutionScore || 0.5,
      influence_and_persuasion: behavioralData.influenceScore || 0.5,
      teamwork_collaboration: behavioralData.teamworkScore || 0.5,
      confidence: 0.7
    };
  }

  // Detect behavioral emotions
  detectBehavioralEmotions(behavioralData, context) {
    return {
      joy: behavioralData.joyIndicators || 0.5,
      sadness: behavioralData.sadnessIndicators || 0.5,
      anger: behavioralData.angerIndicators || 0.5,
      fear: behavioralData.fearIndicators || 0.5,
      surprise: behavioralData.surpriseIndicators || 0.5,
      disgust: behavioralData.disgustIndicators || 0.5,
      love: behavioralData.loveIndicators || 0.5,
      excitement: behavioralData.excitementIndicators || 0.5,
      anxiety: behavioralData.anxietyIndicators || 0.5,
      contentment: behavioralData.contentmentIndicators || 0.5
    };
  }

  // Fuse modal analyses
  async fuseModalAnalyses(modalAnalyses, context) {
    const fusedAnalysis = {
      algorithm: 'dynamic',
      timestamp: new Date().toISOString(),
      ei_dimensions: {},
      emotions: {},
      confidence: 0.3,
      modal_weights: {},
      fusion_quality: 0.5
    };

    try {
      // Determine optimal fusion algorithm
      const fusionAlgorithm = this.selectFusionAlgorithm(modalAnalyses, context);
      fusedAnalysis.algorithm = fusionAlgorithm;

      // Apply fusion algorithm
      const algorithm = this.fusionAlgorithms.get(fusionAlgorithm);
      if (algorithm) {
        const fusionResult = await algorithm.method(modalAnalyses, context);
        fusedAnalysis.ei_dimensions = fusionResult.ei_dimensions;
        fusedAnalysis.emotions = fusionResult.emotions;
        fusedAnalysis.confidence = fusionResult.confidence;
        fusedAnalysis.modal_weights = fusionResult.modal_weights;
        fusedAnalysis.fusion_quality = fusionResult.fusion_quality;
      }

    } catch (error) {
      console.error('Error in modal fusion:', error);
      fusedAnalysis.error = error.message;
    }

    return fusedAnalysis;
  }

  // Select optimal fusion algorithm
  selectFusionAlgorithm(modalAnalyses, context) {
    const modalCount = Object.keys(modalAnalyses).length;
    const avgConfidence = this.calculateAverageConfidence(modalAnalyses);

    // Use dynamic fusion for multiple high-confidence modalities
    if (modalCount >= 2 && avgConfidence > 0.6) {
      return 'dynamic';
    }

    // Use confidence-based fusion for mixed confidence levels
    if (modalCount >= 2 && avgConfidence > 0.4) {
      return 'confidence_based';
    }

    // Use consensus fusion for low confidence
    if (modalCount >= 2) {
      return 'consensus';
    }

    // Default to weighted average
    return 'weighted_average';
  }

  // Weighted average fusion
  async weightedAverageFusion(modalAnalyses, context) {
    const result = {
      ei_dimensions: {},
      emotions: {},
      confidence: 0.3,
      modal_weights: {},
      fusion_quality: 0.5
    };

    // Calculate modal weights
    for (const [modalType, analysis] of Object.entries(modalAnalyses)) {
      const modalConfig = this.modalTypes[modalType];
      const confidenceWeight = analysis.confidence || 0.3;
      result.modal_weights[modalType] = modalConfig.weight * confidenceWeight;
    }

    // Normalize weights
    const totalWeight = Object.values(result.modal_weights).reduce((sum, weight) => sum + weight, 0);
    if (totalWeight > 0) {
      for (const modalType in result.modal_weights) {
        result.modal_weights[modalType] /= totalWeight;
      }
    }

    // Fuse EI dimensions
    result.ei_dimensions = this.fuseEIDimensions(modalAnalyses, result.modal_weights);

    // Fuse emotions
    result.emotions = this.fuseEmotions(modalAnalyses, result.modal_weights);

    // Calculate overall confidence
    result.confidence = this.calculateFusionConfidence(modalAnalyses, result.modal_weights);

    // Calculate fusion quality
    result.fusion_quality = this.calculateFusionQuality(modalAnalyses, result);

    return result;
  }

  // Confidence-based fusion
  async confidenceBasedFusion(modalAnalyses, context) {
    const result = {
      ei_dimensions: {},
      emotions: {},
      confidence: 0.3,
      modal_weights: {},
      fusion_quality: 0.5
    };

    // Weight modalities by confidence
    for (const [modalType, analysis] of Object.entries(modalAnalyses)) {
      result.modal_weights[modalType] = analysis.confidence || 0.3;
    }

    // Normalize weights
    const totalWeight = Object.values(result.modal_weights).reduce((sum, weight) => sum + weight, 0);
    if (totalWeight > 0) {
      for (const modalType in result.modal_weights) {
        result.modal_weights[modalType] /= totalWeight;
      }
    }

    // Apply fusion
    result.ei_dimensions = this.fuseEIDimensions(modalAnalyses, result.modal_weights);
    result.emotions = this.fuseEmotions(modalAnalyses, result.modal_weights);
    result.confidence = this.calculateFusionConfidence(modalAnalyses, result.modal_weights);
    result.fusion_quality = this.calculateFusionQuality(modalAnalyses, result);

    return result;
  }

  // Dynamic fusion
  async dynamicFusion(modalAnalyses, context) {
    const result = {
      ei_dimensions: {},
      emotions: {},
      confidence: 0.3,
      modal_weights: {},
      fusion_quality: 0.5
    };

    // Dynamically adjust weights based on context and consistency
    const modalConsistency = this.calculateModalConsistency(modalAnalyses);
    
    for (const [modalType, analysis] of Object.entries(modalAnalyses)) {
      const modalConfig = this.modalTypes[modalType];
      const confidenceWeight = analysis.confidence || 0.3;
      const consistencyWeight = modalConsistency[modalType] || 0.5;
      
      result.modal_weights[modalType] = modalConfig.weight * confidenceWeight * consistencyWeight;
    }

    // Normalize weights
    const totalWeight = Object.values(result.modal_weights).reduce((sum, weight) => sum + weight, 0);
    if (totalWeight > 0) {
      for (const modalType in result.modal_weights) {
        result.modal_weights[modalType] /= totalWeight;
      }
    }

    // Apply fusion
    result.ei_dimensions = this.fuseEIDimensions(modalAnalyses, result.modal_weights);
    result.emotions = this.fuseEmotions(modalAnalyses, result.modal_weights);
    result.confidence = this.calculateFusionConfidence(modalAnalyses, result.modal_weights);
    result.fusion_quality = this.calculateFusionQuality(modalAnalyses, result);

    return result;
  }

  // Consensus fusion
  async consensusFusion(modalAnalyses, context) {
    const result = {
      ei_dimensions: {},
      emotions: {},
      confidence: 0.3,
      modal_weights: {},
      fusion_quality: 0.5
    };

    // Find consensus across modalities
    const consensusData = this.findConsensus(modalAnalyses);
    
    // Weight modalities based on consensus agreement
    for (const [modalType, analysis] of Object.entries(modalAnalyses)) {
      const consensusScore = consensusData.modalConsensusScores[modalType] || 0.5;
      result.modal_weights[modalType] = consensusScore;
    }

    // Normalize weights
    const totalWeight = Object.values(result.modal_weights).reduce((sum, weight) => sum + weight, 0);
    if (totalWeight > 0) {
      for (const modalType in result.modal_weights) {
        result.modal_weights[modalType] /= totalWeight;
      }
    }

    // Apply fusion
    result.ei_dimensions = this.fuseEIDimensions(modalAnalyses, result.modal_weights);
    result.emotions = this.fuseEmotions(modalAnalyses, result.modal_weights);
    result.confidence = this.calculateFusionConfidence(modalAnalyses, result.modal_weights);
    result.fusion_quality = consensusData.overallConsensus;

    return result;
  }

  // Helper methods for fusion
  fuseEIDimensions(modalAnalyses, weights) {
    const fusedDimensions = {};

    for (const [dimensionName, dimensionConfig] of Object.entries(this.emotionalDimensions)) {
      fusedDimensions[dimensionName] = {};
      
      for (const componentName of Object.keys(dimensionConfig.components)) {
        let weightedSum = 0;
        let totalWeight = 0;

        for (const [modalType, analysis] of Object.entries(modalAnalyses)) {
          const weight = weights[modalType] || 0;
          const componentValue = analysis.ei_dimensions?.[dimensionName]?.[componentName];
          
          if (typeof componentValue === 'number') {
            weightedSum += componentValue * weight;
            totalWeight += weight;
          }
        }

        fusedDimensions[dimensionName][componentName] = totalWeight > 0 ? weightedSum / totalWeight : 0.5;
      }
    }

    return fusedDimensions;
  }

  fuseEmotions(modalAnalyses, weights) {
    const fusedEmotions = {};
    const emotionNames = ['joy', 'sadness', 'anger', 'fear', 'surprise', 'disgust', 'love', 'excitement', 'anxiety', 'contentment'];

    for (const emotionName of emotionNames) {
      let weightedSum = 0;
      let totalWeight = 0;

      for (const [modalType, analysis] of Object.entries(modalAnalyses)) {
        const weight = weights[modalType] || 0;
        const emotionValue = analysis.emotions?.[emotionName];
        
        if (typeof emotionValue === 'number') {
          weightedSum += emotionValue * weight;
          totalWeight += weight;
        }
      }

      fusedEmotions[emotionName] = totalWeight > 0 ? weightedSum / totalWeight : 0.5;
    }

    return fusedEmotions;
  }

  calculateAverageConfidence(modalAnalyses) {
    const confidences = Object.values(modalAnalyses).map(analysis => analysis.confidence || 0.3);
    return confidences.reduce((sum, conf) => sum + conf, 0) / confidences.length;
  }

  calculateModalConsistency(modalAnalyses) {
    const consistency = {};
    
    // Calculate consistency based on how well modalities agree
    for (const modalType of Object.keys(modalAnalyses)) {
      consistency[modalType] = 0.7; // Default consistency
      // In a real implementation, this would compare values across modalities
    }

    return consistency;
  }

  findConsensus(modalAnalyses) {
    const consensusData = {
      modalConsensusScores: {},
      overallConsensus: 0.5
    };

    // Calculate consensus scores for each modality
    for (const modalType of Object.keys(modalAnalyses)) {
      consensusData.modalConsensusScores[modalType] = 0.6; // Default consensus
    }

    // Calculate overall consensus
    const scores = Object.values(consensusData.modalConsensusScores);
    consensusData.overallConsensus = scores.reduce((sum, score) => sum + score, 0) / scores.length;

    return consensusData;
  }

  calculateFusionConfidence(modalAnalyses, weights) {
    let weightedConfidence = 0;
    let totalWeight = 0;

    for (const [modalType, analysis] of Object.entries(modalAnalyses)) {
      const weight = weights[modalType] || 0;
      const confidence = analysis.confidence || 0.3;
      
      weightedConfidence += confidence * weight;
      totalWeight += weight;
    }

    return totalWeight > 0 ? weightedConfidence / totalWeight : 0.3;
  }

  calculateFusionQuality(modalAnalyses, fusionResult) {
    // Quality based on number of modalities, their confidence, and consistency
    const modalCount = Object.keys(modalAnalyses).length;
    const avgConfidence = this.calculateAverageConfidence(modalAnalyses);
    
    let quality = 0.3; // Base quality
    quality += modalCount * 0.2; // More modalities = higher quality
    quality += avgConfidence * 0.3; // Higher confidence = higher quality
    
    return Math.min(1, quality);
  }

  // Update user emotional profile
  async updateUserEmotionalProfile(userId, analysis) {
    let profile = this.userEmotionalProfiles.get(userId) || this.createEmptyEmotionalProfile(userId);

    // Update with new analysis
    profile.lastUpdated = new Date().toISOString();
    profile.analysisCount++;

    // Update EI dimensions (weighted average)
    const weight = 0.3; // 30% new data, 70% existing
    for (const [dimensionName, dimensionData] of Object.entries(analysis.fusedAnalysis.ei_dimensions)) {
      if (!profile.ei_dimensions[dimensionName]) {
        profile.ei_dimensions[dimensionName] = { ...dimensionData };
      } else {
        for (const [componentName, componentValue] of Object.entries(dimensionData)) {
          if (typeof componentValue === 'number') {
            profile.ei_dimensions[dimensionName][componentName] = 
              profile.ei_dimensions[dimensionName][componentName] * (1 - weight) + componentValue * weight;
          }
        }
      }
    }

    // Update emotions (weighted average)
    for (const [emotionName, emotionValue] of Object.entries(analysis.fusedAnalysis.emotions)) {
      if (typeof emotionValue === 'number') {
        profile.emotions[emotionName] = profile.emotions[emotionName] * (1 - weight) + emotionValue * weight;
      }
    }

    // Update confidence
    profile.confidence = Math.min(1, profile.confidence + 0.1);

    // Store updated profile
    this.userEmotionalProfiles.set(userId, profile);
    await this.saveEmotionalProfiles();
  }

  // Create empty emotional profile
  createEmptyEmotionalProfile(userId) {
    return {
      userId,
      createdAt: new Date().toISOString(),
      lastUpdated: new Date().toISOString(),
      analysisCount: 0,
      ei_dimensions: {},
      emotions: {},
      confidence: 0.3,
      insights: [],
      recommendations: []
    };
  }

  // Generate emotional insights
  generateEmotionalInsights(analysis) {
    const insights = [];

    // Analyze fused results for insights
    const fusedAnalysis = analysis.fusedAnalysis;
    
    // EI dimension insights
    for (const [dimensionName, dimensionData] of Object.entries(fusedAnalysis.ei_dimensions)) {
      const avgScore = this.calculateDimensionAverage(dimensionData);
      
      if (avgScore > 0.7) {
        insights.push({
          type: 'strength',
          dimension: dimensionName,
          insight: `High ${dimensionName.replace('_', ' ')} - this is a key emotional strength`,
          confidence: fusedAnalysis.confidence,
          score: avgScore
        });
      } else if (avgScore < 0.4) {
        insights.push({
          type: 'growth_area',
          dimension: dimensionName,
          insight: `${dimensionName.replace('_', ' ')} could benefit from development`,
          confidence: fusedAnalysis.confidence,
          score: avgScore
        });
      }
    }

    // Emotion insights
    const dominantEmotions = this.findDominantEmotions(fusedAnalysis.emotions);
    for (const emotion of dominantEmotions) {
      insights.push({
        type: 'emotional_pattern',
        emotion: emotion.name,
        insight: `Strong ${emotion.name} pattern detected`,
        confidence: fusedAnalysis.confidence,
        score: emotion.score
      });
    }

    return insights;
  }

  // Generate emotional recommendations
  generateEmotionalRecommendations(analysis) {
    const recommendations = [];

    // Analyze growth areas and generate recommendations
    const fusedAnalysis = analysis.fusedAnalysis;
    
    for (const [dimensionName, dimensionData] of Object.entries(fusedAnalysis.ei_dimensions)) {
      const avgScore = this.calculateDimensionAverage(dimensionData);
      
      if (avgScore < 0.5) {
        recommendations.push({
          category: dimensionName,
          priority: avgScore < 0.3 ? 'high' : 'medium',
          title: `Develop ${dimensionName.replace('_', ' ')}`,
          description: this.getDimensionRecommendation(dimensionName),
          exercises: this.getDimensionExercises(dimensionName)
        });
      }
    }

    // Emotional regulation recommendations
    const negativeEmotions = ['sadness', 'anger', 'fear', 'anxiety'];
    for (const emotion of negativeEmotions) {
      if (fusedAnalysis.emotions[emotion] > 0.7) {
        recommendations.push({
          category: 'emotional_regulation',
          priority: 'high',
          title: `Manage ${emotion}`,
          description: `High levels of ${emotion} detected - focus on regulation strategies`,
          exercises: this.getEmotionRegulationExercises(emotion)
        });
      }
    }

    return recommendations;
  }

  // Helper methods
  calculateDimensionAverage(dimensionData) {
    const values = Object.values(dimensionData).filter(v => typeof v === 'number');
    return values.length > 0 ? values.reduce((sum, val) => sum + val, 0) / values.length : 0.5;
  }

  findDominantEmotions(emotions) {
    return Object.entries(emotions)
      .filter(([name, score]) => score > 0.6)
      .map(([name, score]) => ({ name, score }))
      .sort((a, b) => b.score - a.score)
      .slice(0, 3);
  }

  getDimensionRecommendation(dimensionName) {
    const recommendations = {
      self_awareness: 'Practice mindfulness and emotional check-ins',
      self_regulation: 'Develop coping strategies and impulse control',
      motivation: 'Set meaningful goals and cultivate optimism',
      empathy: 'Practice perspective-taking and active listening',
      social_skills: 'Work on communication and conflict resolution'
    };

    return recommendations[dimensionName] || 'Focus on personal development';
  }

  getDimensionExercises(dimensionName) {
    const exercises = {
      self_awareness: ['Daily emotion journaling', 'Mindfulness meditation', 'Body scan exercises'],
      self_regulation: ['Deep breathing techniques', 'Progressive muscle relaxation', 'Pause and reflect practice'],
      motivation: ['Goal setting exercises', 'Gratitude practice', 'Visualization techniques'],
      empathy: ['Perspective-taking exercises', 'Active listening practice', 'Compassion meditation'],
      social_skills: ['Communication skills practice', 'Conflict resolution training', 'Social interaction exercises']
    };

    return exercises[dimensionName] || ['General emotional intelligence exercises'];
  }

  getEmotionRegulationExercises(emotion) {
    const exercises = {
      anxiety: ['Deep breathing', 'Progressive muscle relaxation', 'Grounding techniques'],
      anger: ['Timeout techniques', 'Physical exercise', 'Cognitive reframing'],
      sadness: ['Gratitude practice', 'Social connection', 'Gentle self-care'],
      fear: ['Gradual exposure', 'Positive self-talk', 'Relaxation techniques']
    };

    return exercises[emotion] || ['General emotion regulation techniques'];
  }

  // Calculate confidence for different analysis types
  calculateTextAnalysisConfidence(analysis) {
    const dimensionConfidences = Object.values(analysis.ei_dimensions).map(d => d.confidence || 0.3);
    const avgConfidence = dimensionConfidences.reduce((sum, conf) => sum + conf, 0) / dimensionConfidences.length;
    return Math.min(0.8, avgConfidence);
  }

  calculateBehavioralConfidence(behavioralData) {
    // Confidence based on data completeness and quality
    const dataCompleteness = Object.keys(behavioralData).length / 10; // Assume 10 expected fields
    return Math.min(0.9, 0.4 + (dataCompleteness * 0.5));
  }

  // Generate evidence for different analysis types
  generateTextEvidence(text, analysis) {
    const evidence = [];
    
    // Add evidence for high-scoring dimensions
    for (const [dimensionName, dimensionData] of Object.entries(analysis.ei_dimensions)) {
      const avgScore = this.calculateDimensionAverage(dimensionData);
      if (avgScore > 0.6) {
        evidence.push(`${dimensionName}: Indicated by language patterns in text`);
      }
    }

    return evidence;
  }

  generatePhotoEvidence(photoAnalysis) {
    const evidence = [];
    
    if (photoAnalysis.photoInsights) {
      for (const insight of photoAnalysis.photoInsights) {
        evidence.push(`Visual indicator: ${insight.insight}`);
      }
    }

    return evidence;
  }

  generateBehavioralEvidence(behavioralData) {
    const evidence = [];
    
    for (const [key, value] of Object.entries(behavioralData)) {
      if (typeof value === 'number' && value > 0.6) {
        evidence.push(`Behavioral pattern: High ${key.replace(/([A-Z])/g, ' $1').toLowerCase()}`);
      }
    }

    return evidence;
  }

  // Store analysis history
  storeAnalysisHistory(userId, analysis) {
    if (!this.emotionalAnalysisHistory.has(userId)) {
      this.emotionalAnalysisHistory.set(userId, []);
    }
    
    const history = this.emotionalAnalysisHistory.get(userId);
    history.push(analysis);
    
    // Keep only last 50 analyses
    if (history.length > 50) {
      history.splice(0, history.length - 50);
    }
  }

  // Get default emotional analysis
  getDefaultEmotionalAnalysis(userId, inputData) {
    return {
      userId,
      timestamp: new Date().toISOString(),
      context: {},
      modalAnalyses: {},
      fusedAnalysis: {
        algorithm: 'default',
        ei_dimensions: {
          self_awareness: { emotion_recognition: 0.5, trigger_awareness: 0.5, confidence: 0.2 },
          self_regulation: { impulse_control: 0.5, adaptability: 0.5, confidence: 0.2 },
          motivation: { achievement_drive: 0.5, optimism: 0.5, confidence: 0.2 },
          empathy: { emotional_understanding: 0.5, perspective_taking: 0.5, confidence: 0.2 },
          social_skills: { communication_effectiveness: 0.5, conflict_resolution: 0.5, confidence: 0.2 }
        },
        emotions: {
          joy: 0.5, sadness: 0.5, anger: 0.5, fear: 0.5, surprise: 0.5,
          disgust: 0.5, love: 0.5, excitement: 0.5, anxiety: 0.5, contentment: 0.5
        },
        confidence: 0.2,
        modal_weights: {},
        fusion_quality: 0.2
      },
      insights: [],
      recommendations: [],
      error: 'Limited functionality - using default analysis'
    };
  }

  // Get user's emotional profile
  getUserEmotionalProfile(userId) {
    return this.userEmotionalProfiles.get(userId) || this.createEmptyEmotionalProfile(userId);
  }

  // Get analysis history
  getAnalysisHistory(userId) {
    return this.emotionalAnalysisHistory.get(userId) || [];
  }

  // Save emotional profiles
  async saveEmotionalProfiles() {
    try {
      const data = {
        profiles: Array.from(this.userEmotionalProfiles.entries()),
        history: Array.from(this.emotionalAnalysisHistory.entries()),
        savedAt: new Date().toISOString()
      };
      await AsyncStorage.setItem(this.storageKey, JSON.stringify(data));
    } catch (error) {
      console.error('Error saving emotional profiles:', error);
    }
  }

  // Load emotional profiles
  async loadEmotionalProfiles() {
    try {
      const data = await AsyncStorage.getItem(this.storageKey);
      if (data) {
        const parsed = JSON.parse(data);
        this.userEmotionalProfiles = new Map(parsed.profiles);
        this.emotionalAnalysisHistory = new Map(parsed.history);
        console.log('Loaded emotional profiles from storage');
      }
    } catch (error) {
      console.error('Error loading emotional profiles:', error);
    }
  }

  // Get system statistics
  getStats() {
    return {
      initialized: this.initialized,
      userProfiles: this.userEmotionalProfiles.size,
      totalAnalyses: Array.from(this.emotionalAnalysisHistory.values()).reduce((sum, history) => sum + history.length, 0),
      emotionalDimensions: Object.keys(this.emotionalDimensions).length,
      fusionAlgorithms: this.fusionAlgorithms.size,
      averageConfidence: this.calculateAverageSystemConfidence()
    };
  }

  calculateAverageSystemConfidence() {
    if (this.userEmotionalProfiles.size === 0) return 0;
    
    const confidences = Array.from(this.userEmotionalProfiles.values()).map(profile => profile.confidence);
    return confidences.reduce((sum, conf) => sum + conf, 0) / confidences.length;
  }
}

export default new MultiModalEmotionalIntelligence();