// Real-Time Personality Profiling Engine
// Revolutionary multi-dimensional personality analysis from every interaction

import AsyncStorage from '@react-native-async-storage/async-storage';
import VectorEmbeddingService from './VectorEmbeddingService';
import RAGService from './RAGService';

class PersonalityProfilingEngine {
  constructor() {
    this.profiles = new Map();
    this.initialized = false;
    this.storageKey = 'personality_profiles';
    this.updateThreshold = 0.05; // Minimum change needed to trigger profile update
    this.analysisBuffer = new Map(); // Buffer for batching analyses
    this.bufferSize = 10; // Analyze in batches for efficiency
    
    // Personality dimension weights
    this.dimensionWeights = {
      big_five: 0.25,
      mbti: 0.20,
      attachment: 0.20,
      communication: 0.15,
      emotional_intelligence: 0.10,
      values: 0.10
    };
  }

  // Initialize the personality profiling engine
  async initialize() {
    if (this.initialized) return;

    try {
      await this.loadProfiles();
      this.initialized = true;
      console.log('Personality Profiling Engine initialized successfully');
    } catch (error) {
      console.error('Error initializing Personality Profiling Engine:', error);
      this.initialized = true; // Continue with empty profiles
    }
  }

  // Analyze a message and update personality profile
  async analyzeMessage(userId, message, context = {}) {
    if (!this.initialized) await this.initialize();

    try {
      // Get or create user profile
      let profile = this.profiles.get(userId) || this.createEmptyProfile(userId);

      // Perform multi-dimensional analysis
      const analysis = await this.performComprehensiveAnalysis(message, context);

      // Update profile with new insights
      const updatedProfile = this.updateProfile(profile, analysis, context);

      // Store updated profile
      this.profiles.set(userId, updatedProfile);

      // Save to storage periodically
      if (Math.random() < 0.1) { // 10% chance to save (for performance)
        await this.saveProfiles();
      }

      return {
        profile: updatedProfile,
        analysis: analysis,
        insights: this.generateInsights(updatedProfile, analysis)
      };

    } catch (error) {
      console.error('Error analyzing message:', error);
      return null;
    }
  }

  // Perform comprehensive personality analysis
  async performComprehensiveAnalysis(message, context) {
    const analysis = {
      timestamp: new Date().toISOString(),
      message: message,
      context: context,
      dimensions: {}
    };

    // Run all analysis dimensions in parallel
    const [
      bigFiveAnalysis,
      mbtiAnalysis,
      attachmentAnalysis,
      communicationAnalysis,
      emotionalAnalysis,
      valuesAnalysis
    ] = await Promise.all([
      this.analyzeBigFive(message, context),
      this.analyzeMBTI(message, context),
      this.analyzeAttachment(message, context),
      this.analyzeCommunication(message, context),
      this.analyzeEmotionalIntelligence(message, context),
      this.analyzeValues(message, context)
    ]);

    analysis.dimensions = {
      big_five: bigFiveAnalysis,
      mbti: mbtiAnalysis,
      attachment: attachmentAnalysis,
      communication: communicationAnalysis,
      emotional_intelligence: emotionalAnalysis,
      values: valuesAnalysis
    };

    return analysis;
  }

  // Big Five personality analysis
  async analyzeBigFive(message, context) {
    const analysis = {
      openness: 0,
      conscientiousness: 0,
      extraversion: 0,
      agreeableness: 0,
      neuroticism: 0,
      confidence: 0
    };

    const msg = message.toLowerCase();
    const wordCount = message.split(' ').length;

    // Openness to Experience
    const opennessKeywords = ['new', 'different', 'creative', 'art', 'travel', 'explore', 'adventure', 'unique', 'innovative', 'curious'];
    const opennessScore = this.calculateKeywordScore(msg, opennessKeywords);
    analysis.openness = Math.min(1, opennessScore * 0.3 + (wordCount > 30 ? 0.2 : 0));

    // Conscientiousness
    const conscientiousnessKeywords = ['plan', 'organize', 'schedule', 'goal', 'achieve', 'work', 'responsible', 'detail', 'prepare', 'commit'];
    analysis.conscientiousness = Math.min(1, this.calculateKeywordScore(msg, conscientiousnessKeywords) * 0.4);

    // Extraversion
    const extraversionKeywords = ['people', 'party', 'social', 'friends', 'talk', 'meet', 'energy', 'excited', 'group', 'fun'];
    const questionMarks = (message.match(/\?/g) || []).length;
    const exclamationMarks = (message.match(/!/g) || []).length;
    analysis.extraversion = Math.min(1, this.calculateKeywordScore(msg, extraversionKeywords) * 0.3 + (questionMarks + exclamationMarks) * 0.1);

    // Agreeableness
    const agreeablenessKeywords = ['help', 'support', 'understand', 'care', 'kind', 'empathy', 'listen', 'agree', 'compromise', 'harmony'];
    const positiveWords = ['yes', 'sure', 'absolutely', 'definitely', 'love', 'like', 'appreciate'];
    analysis.agreeableness = Math.min(1, this.calculateKeywordScore(msg, agreeablenessKeywords) * 0.3 + this.calculateKeywordScore(msg, positiveWords) * 0.2);

    // Neuroticism
    const neuroticismKeywords = ['worry', 'anxious', 'stress', 'nervous', 'fear', 'scared', 'overwhelmed', 'panic', 'emotional', 'sensitive'];
    const negativeWords = ['hate', 'terrible', 'awful', 'horrible', 'worst', 'annoying', 'frustrating'];
    analysis.neuroticism = Math.min(1, this.calculateKeywordScore(msg, neuroticismKeywords) * 0.4 + this.calculateKeywordScore(msg, negativeWords) * 0.2);

    // Confidence based on certainty markers
    const uncertaintyMarkers = ['maybe', 'perhaps', 'might', 'probably', 'think', 'guess', 'suppose'];
    const certaintyMarkers = ['definitely', 'absolutely', 'certainly', 'sure', 'know', 'confident'];
    analysis.confidence = Math.max(0, Math.min(1, this.calculateKeywordScore(msg, certaintyMarkers) * 0.3 - this.calculateKeywordScore(msg, uncertaintyMarkers) * 0.2 + 0.5));

    return analysis;
  }

  // MBTI analysis
  async analyzeMBTI(message, context) {
    const analysis = {
      extraversion: 0, // E vs I
      sensing: 0, // S vs N
      thinking: 0, // T vs F
      judging: 0, // J vs P
      confidence: 0
    };

    const msg = message.toLowerCase();

    // Extraversion vs Introversion
    const extraversionWords = ['people', 'social', 'talk', 'share', 'group', 'party', 'energy', 'excited'];
    const introversionWords = ['quiet', 'alone', 'think', 'reflect', 'private', 'space', 'recharge', 'deep'];
    analysis.extraversion = this.calculateDimensionScore(msg, extraversionWords, introversionWords);

    // Sensing vs Intuition
    const sensingWords = ['practical', 'real', 'facts', 'details', 'experience', 'concrete', 'specific', 'actual'];
    const intuitionWords = ['possibility', 'future', 'potential', 'theory', 'concept', 'abstract', 'imagine', 'creative'];
    analysis.sensing = this.calculateDimensionScore(msg, sensingWords, intuitionWords);

    // Thinking vs Feeling
    const thinkingWords = ['logical', 'analyze', 'objective', 'reason', 'decide', 'efficient', 'rational', 'facts'];
    const feelingWords = ['feel', 'emotion', 'heart', 'values', 'personal', 'harmony', 'empathy', 'care'];
    analysis.thinking = this.calculateDimensionScore(msg, thinkingWords, feelingWords);

    // Judging vs Perceiving
    const judgingWords = ['plan', 'organize', 'schedule', 'decide', 'finish', 'closure', 'structure', 'goal'];
    const perceivingWords = ['flexible', 'adapt', 'open', 'spontaneous', 'explore', 'maybe', 'options', 'change'];
    analysis.judging = this.calculateDimensionScore(msg, judgingWords, perceivingWords);

    // Confidence based on message clarity and structure
    const messageStructure = this.analyzeMessageStructure(message);
    analysis.confidence = messageStructure.clarity * 0.3 + messageStructure.coherence * 0.2;

    return analysis;
  }

  // Attachment style analysis
  async analyzeAttachment(message, context) {
    const analysis = {
      secure: 0,
      anxious: 0,
      avoidant: 0,
      disorganized: 0,
      confidence: 0
    };

    const msg = message.toLowerCase();

    // Secure attachment indicators
    const secureWords = ['trust', 'comfortable', 'open', 'support', 'balance', 'healthy', 'communicate', 'understand'];
    analysis.secure = this.calculateKeywordScore(msg, secureWords) * 0.4;

    // Anxious attachment indicators
    const anxiousWords = ['worry', 'need', 'afraid', 'abandon', 'clingy', 'jealous', 'insecure', 'reassurance', 'fear'];
    analysis.anxious = this.calculateKeywordScore(msg, anxiousWords) * 0.5;

    // Avoidant attachment indicators
    const avoidantWords = ['independent', 'space', 'alone', 'distance', 'uncomfortable', 'close', 'intimacy', 'self-reliant'];
    analysis.avoidant = this.calculateKeywordScore(msg, avoidantWords) * 0.4;

    // Disorganized attachment indicators
    const disorganizedWords = ['confused', 'mixed', 'chaotic', 'unpredictable', 'complicated', 'conflict', 'push-pull'];
    analysis.disorganized = this.calculateKeywordScore(msg, disorganizedWords) * 0.3;

    // Relationship context analysis
    if (context.relationship_context) {
      if (context.relationship_context.includes('conflict')) {
        analysis.anxious += 0.1;
        analysis.disorganized += 0.1;
      }
      if (context.relationship_context.includes('distance')) {
        analysis.avoidant += 0.1;
      }
    }

    // Normalize scores so they sum to 1
    const total = analysis.secure + analysis.anxious + analysis.avoidant + analysis.disorganized;
    if (total > 0) {
      analysis.secure /= total;
      analysis.anxious /= total;
      analysis.avoidant /= total;
      analysis.disorganized /= total;
    }

    analysis.confidence = Math.min(1, total * 0.3);

    return analysis;
  }

  // Communication style analysis
  async analyzeCommunication(message, context) {
    const analysis = {
      directness: 0,
      emotionalExpression: 0,
      activeListening: 0,
      conflictStyle: 0,
      responseTime: 0,
      confidence: 0
    };

    const msg = message.toLowerCase();

    // Directness vs Indirect
    const directWords = ['directly', 'honestly', 'straightforward', 'clear', 'simply', 'exactly', 'specifically'];
    const indirectWords = ['maybe', 'perhaps', 'sort of', 'kind of', 'might', 'possibly', 'probably'];
    analysis.directness = this.calculateDimensionScore(msg, directWords, indirectWords);

    // Emotional expression
    const emotionalWords = ['feel', 'emotion', 'heart', 'excited', 'sad', 'angry', 'happy', 'love', 'hate'];
    const emoticons = (message.match(/[\u{1F600}-\u{1F64F}\u{1F300}-\u{1F5FF}\u{1F680}-\u{1F6FF}\u{2600}-\u{26FF}\u{2700}-\u{27BF}]/gu) || []).length;
    analysis.emotionalExpression = Math.min(1, this.calculateKeywordScore(msg, emotionalWords) * 0.3 + emoticons * 0.1);

    // Active listening indicators
    const listeningWords = ['understand', 'hear', 'listen', 'acknowledge', 'recognize', 'appreciate', 'validate'];
    const questionWords = ['what', 'how', 'why', 'when', 'where', 'tell me'];
    analysis.activeListening = Math.min(1, this.calculateKeywordScore(msg, listeningWords) * 0.4 + this.calculateKeywordScore(msg, questionWords) * 0.2);

    // Conflict style (0 = avoidant, 1 = confrontational)
    const confrontationalWords = ['disagree', 'wrong', 'argue', 'fight', 'defend', 'challenge', 'confront'];
    const avoidantWords = ['avoid', 'ignore', 'whatever', 'fine', 'drop it', 'forget', 'later'];
    analysis.conflictStyle = this.calculateDimensionScore(msg, confrontationalWords, avoidantWords);

    // Response time analysis (if available in context)
    if (context.response_time) {
      analysis.responseTime = this.analyzeResponseTime(context.response_time);
    }

    analysis.confidence = 0.6; // Communication analysis is generally reliable

    return analysis;
  }

  // Emotional intelligence analysis
  async analyzeEmotionalIntelligence(message, context) {
    const analysis = {
      selfAwareness: 0,
      empathy: 0,
      emotionalRegulation: 0,
      socialSkills: 0,
      confidence: 0
    };

    const msg = message.toLowerCase();

    // Self-awareness indicators
    const selfAwareWords = ['feel', 'realize', 'notice', 'aware', 'recognize', 'understand myself', 'reflection'];
    analysis.selfAwareness = this.calculateKeywordScore(msg, selfAwareWords) * 0.4;

    // Empathy indicators
    const empathyWords = ['understand', 'feel for', 'imagine', 'perspective', 'others feel', 'empathy', 'compassion'];
    analysis.empathy = this.calculateKeywordScore(msg, empathyWords) * 0.5;

    // Emotional regulation
    const regulationWords = ['calm', 'control', 'manage', 'cope', 'handle', 'breathe', 'regulate', 'balance'];
    const dysregulationWords = ['overwhelmed', 'out of control', 'can\'t handle', 'explosive', 'reactive'];
    analysis.emotionalRegulation = Math.max(0, this.calculateKeywordScore(msg, regulationWords) * 0.4 - this.calculateKeywordScore(msg, dysregulationWords) * 0.3);

    // Social skills
    const socialWords = ['communicate', 'connect', 'relate', 'social', 'relationship', 'interact', 'friendship'];
    analysis.socialSkills = this.calculateKeywordScore(msg, socialWords) * 0.3;

    analysis.confidence = 0.5; // Moderate confidence for EI analysis

    return analysis;
  }

  // Values analysis
  async analyzeValues(message, context) {
    const analysis = {
      family: 0,
      career: 0,
      adventure: 0,
      security: 0,
      creativity: 0,
      helping: 0,
      independence: 0,
      spirituality: 0,
      confidence: 0
    };

    const msg = message.toLowerCase();

    // Family values
    const familyWords = ['family', 'children', 'kids', 'parents', 'home', 'marriage', 'commitment', 'tradition'];
    analysis.family = this.calculateKeywordScore(msg, familyWords) * 0.4;

    // Career values
    const careerWords = ['career', 'work', 'job', 'success', 'achievement', 'ambition', 'professional', 'goals'];
    analysis.career = this.calculateKeywordScore(msg, careerWords) * 0.3;

    // Adventure values
    const adventureWords = ['adventure', 'travel', 'explore', 'new', 'experience', 'discovery', 'journey', 'freedom'];
    analysis.adventure = this.calculateKeywordScore(msg, adventureWords) * 0.4;

    // Security values
    const securityWords = ['security', 'stable', 'safe', 'comfort', 'predictable', 'routine', 'consistent', 'reliable'];
    analysis.security = this.calculateKeywordScore(msg, securityWords) * 0.3;

    // Creativity values
    const creativityWords = ['creative', 'art', 'music', 'design', 'imagination', 'innovative', 'original', 'express'];
    analysis.creativity = this.calculateKeywordScore(msg, creativityWords) * 0.4;

    // Helping values
    const helpingWords = ['help', 'support', 'care', 'volunteer', 'service', 'community', 'giving', 'compassion'];
    analysis.helping = this.calculateKeywordScore(msg, helpingWords) * 0.4;

    // Independence values
    const independenceWords = ['independent', 'freedom', 'autonomous', 'self-reliant', 'own way', 'individual'];
    analysis.independence = this.calculateKeywordScore(msg, independenceWords) * 0.3;

    // Spirituality values
    const spiritualityWords = ['spiritual', 'faith', 'meaning', 'purpose', 'soul', 'meditation', 'growth', 'universe'];
    analysis.spirituality = this.calculateKeywordScore(msg, spiritualityWords) * 0.4;

    analysis.confidence = 0.4; // Values analysis has moderate confidence

    return analysis;
  }

  // Helper methods
  calculateKeywordScore(text, keywords) {
    let score = 0;
    for (const keyword of keywords) {
      const regex = new RegExp(keyword, 'gi');
      const matches = (text.match(regex) || []).length;
      score += matches;
    }
    return Math.min(1, score * 0.1); // Normalize to 0-1 range
  }

  calculateDimensionScore(text, positiveWords, negativeWords) {
    const positive = this.calculateKeywordScore(text, positiveWords);
    const negative = this.calculateKeywordScore(text, negativeWords);
    return Math.max(0, Math.min(1, 0.5 + (positive - negative) * 0.5));
  }

  analyzeMessageStructure(message) {
    const sentences = message.split(/[.!?]+/).filter(s => s.trim().length > 0);
    const words = message.split(/\s+/).filter(w => w.length > 0);
    
    return {
      clarity: Math.min(1, sentences.length * 0.2), // More sentences = more clarity
      coherence: Math.min(1, words.length / sentences.length * 0.1), // Average words per sentence
      complexity: Math.min(1, words.filter(w => w.length > 6).length / words.length)
    };
  }

  analyzeResponseTime(responseTime) {
    // Response time in milliseconds
    if (responseTime < 5000) return 0.9; // Very fast
    if (responseTime < 15000) return 0.7; // Fast
    if (responseTime < 60000) return 0.5; // Medium
    if (responseTime < 300000) return 0.3; // Slow
    return 0.1; // Very slow
  }

  // Update user profile with new analysis
  updateProfile(profile, analysis, context) {
    const updatedProfile = { ...profile };
    updatedProfile.lastUpdated = new Date().toISOString();
    updatedProfile.messageCount += 1;

    // Update each dimension with weighted averaging
    for (const [dimension, data] of Object.entries(analysis.dimensions)) {
      if (!updatedProfile.dimensions[dimension]) {
        updatedProfile.dimensions[dimension] = { ...data };
      } else {
        // Weighted average: 70% existing, 30% new
        const existing = updatedProfile.dimensions[dimension];
        const weight = 0.3;
        
        for (const [key, value] of Object.entries(data)) {
          if (typeof value === 'number') {
            existing[key] = existing[key] * (1 - weight) + value * weight;
          }
        }
      }
    }

    // Update confidence scores
    this.updateConfidenceScores(updatedProfile);

    return updatedProfile;
  }

  updateConfidenceScores(profile) {
    const messageCount = profile.messageCount;
    const baseConfidence = Math.min(1, messageCount / 100); // More messages = higher confidence
    
    for (const dimension of Object.values(profile.dimensions)) {
      if (dimension.confidence !== undefined) {
        dimension.confidence = Math.min(1, dimension.confidence + baseConfidence * 0.1);
      }
    }
  }

  // Generate insights from profile
  generateInsights(profile, analysis) {
    const insights = [];

    // Big Five insights
    const bigFive = profile.dimensions.big_five;
    if (bigFive && bigFive.confidence > 0.5) {
      if (bigFive.extraversion > 0.7) {
        insights.push({
          category: 'personality',
          insight: 'Highly extraverted - gains energy from social interactions',
          confidence: bigFive.confidence
        });
      }
      if (bigFive.neuroticism > 0.6) {
        insights.push({
          category: 'emotional',
          insight: 'May experience higher levels of stress and emotional sensitivity',
          confidence: bigFive.confidence
        });
      }
    }

    // Attachment insights
    const attachment = profile.dimensions.attachment;
    if (attachment && attachment.confidence > 0.4) {
      const primary = this.getPrimaryAttachmentStyle(attachment);
      insights.push({
        category: 'attachment',
        insight: `Primary attachment style appears to be ${primary}`,
        confidence: attachment.confidence
      });
    }

    // Communication insights
    const communication = profile.dimensions.communication;
    if (communication && communication.confidence > 0.5) {
      if (communication.directness > 0.7) {
        insights.push({
          category: 'communication',
          insight: 'Direct communication style - values clarity and honesty',
          confidence: communication.confidence
        });
      }
      if (communication.activeListening > 0.6) {
        insights.push({
          category: 'communication',
          insight: 'Shows strong active listening skills',
          confidence: communication.confidence
        });
      }
    }

    return insights;
  }

  getPrimaryAttachmentStyle(attachment) {
    const styles = {
      secure: attachment.secure,
      anxious: attachment.anxious,
      avoidant: attachment.avoidant,
      disorganized: attachment.disorganized
    };
    
    return Object.keys(styles).reduce((a, b) => styles[a] > styles[b] ? a : b);
  }

  // Create empty profile structure
  createEmptyProfile(userId) {
    return {
      userId,
      createdAt: new Date().toISOString(),
      lastUpdated: new Date().toISOString(),
      messageCount: 0,
      dimensions: {},
      insights: [],
      metadata: {
        version: '1.0',
        analysisEngine: 'PersonalityProfilingEngine'
      }
    };
  }

  // Get user profile
  getUserProfile(userId) {
    return this.profiles.get(userId) || this.createEmptyProfile(userId);
  }

  // Get all profiles
  getAllProfiles() {
    return Array.from(this.profiles.values());
  }

  // Save profiles to storage
  async saveProfiles() {
    try {
      const data = {
        profiles: Array.from(this.profiles.entries()),
        savedAt: new Date().toISOString()
      };
      await AsyncStorage.setItem(this.storageKey, JSON.stringify(data));
    } catch (error) {
      console.error('Error saving personality profiles:', error);
    }
  }

  // Load profiles from storage
  async loadProfiles() {
    try {
      const data = await AsyncStorage.getItem(this.storageKey);
      if (data) {
        const parsed = JSON.parse(data);
        this.profiles = new Map(parsed.profiles);
        console.log('Loaded personality profiles from storage');
      }
    } catch (error) {
      console.error('Error loading personality profiles:', error);
    }
  }

  // Get engine statistics
  getStats() {
    return {
      initialized: this.initialized,
      profileCount: this.profiles.size,
      totalMessages: Array.from(this.profiles.values()).reduce((sum, p) => sum + p.messageCount, 0),
      averageConfidence: this.calculateAverageConfidence(),
      dimensionWeights: this.dimensionWeights
    };
  }

  calculateAverageConfidence() {
    if (this.profiles.size === 0) return 0;
    
    let totalConfidence = 0;
    let count = 0;
    
    for (const profile of this.profiles.values()) {
      for (const dimension of Object.values(profile.dimensions)) {
        if (dimension.confidence !== undefined) {
          totalConfidence += dimension.confidence;
          count++;
        }
      }
    }
    
    return count > 0 ? totalConfidence / count : 0;
  }
}

export default new PersonalityProfilingEngine();