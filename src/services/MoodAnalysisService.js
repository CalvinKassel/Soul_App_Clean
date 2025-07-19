// Mood Analysis Service
// Real-time mood detection from user messages using SoulAI integration

import ChatGPTService from './ChatGPTService';
import { getMoodGradient, getMoodCategory, MOOD_CONFIDENCE_THRESHOLDS } from './MoodToGradientMap';

class MoodAnalysisService {
  constructor() {
    this.initialized = false;
    this.moodCache = new Map();
    this.cacheTimeout = 5 * 60 * 1000; // 5 minutes
    this.analysisQueue = [];
    this.isProcessing = false;
    
    // Mood detection patterns
    this.moodPatterns = {
      // Positive emotions
      joyful: {
        keywords: ['happy', 'joy', 'excited', 'amazing', 'wonderful', 'fantastic', 'great', 'awesome', 'brilliant'],
        emoticons: ['😊', '😄', '😃', '🎉', '✨', '🌟', '💫', '🔥'],
        phrases: ['so happy', 'feeling great', 'on cloud nine', 'over the moon', 'best day ever'],
        intensity: 0.8
      },
      
      loving: {
        keywords: ['love', 'adore', 'cherish', 'care', 'affection', 'heart', 'sweet', 'darling'],
        emoticons: ['❤️', '💕', '💖', '💗', '💘', '💝', '💞', '💓'],
        phrases: ['love you', 'care about', 'mean everything', 'in my heart', 'feel so close'],
        intensity: 0.9
      },
      
      flirty: {
        keywords: ['cute', 'beautiful', 'handsome', 'sexy', 'attractive', 'charming', 'gorgeous', 'stunning'],
        emoticons: ['😉', '😘', '😍', '🥰', '😏', '💋', '🔥', '😈'],
        phrases: ['you look', 'so attractive', 'can\'t resist', 'drive me crazy', 'thinking of you'],
        intensity: 0.7
      },
      
      hopeful: {
        keywords: ['hope', 'optimistic', 'looking forward', 'excited about', 'can\'t wait', 'future', 'dreams'],
        emoticons: ['🌟', '✨', '🌈', '🦋', '🌸', '🌺', '💫', '🎯'],
        phrases: ['looking forward', 'excited about', 'can\'t wait', 'hopeful about', 'future together'],
        intensity: 0.7
      },
      
      playful: {
        keywords: ['fun', 'funny', 'silly', 'playful', 'joke', 'laugh', 'tease', 'game'],
        emoticons: ['😄', '😂', '🤣', '😜', '😋', '🙃', '😝', '🤪'],
        phrases: ['just kidding', 'playing around', 'being silly', 'for fun', 'haha'],
        intensity: 0.6
      },
      
      // Neutral emotions
      calm: {
        keywords: ['calm', 'peaceful', 'relaxed', 'serene', 'tranquil', 'zen', 'centered', 'balanced'],
        emoticons: ['😌', '😇', '🧘', '🕊️', '🌊', '🍃', '🌙', '☮️'],
        phrases: ['feeling calm', 'at peace', 'relaxed about', 'taking it easy', 'no rush'],
        intensity: 0.6
      },
      
      thoughtful: {
        keywords: ['thinking', 'wondering', 'considering', 'reflecting', 'pondering', 'contemplating'],
        emoticons: ['🤔', '💭', '🧠', '💡', '🤯', '📚', '🎓', '🔍'],
        phrases: ['been thinking', 'wondering about', 'makes me think', 'got me thinking', 'deep thoughts'],
        intensity: 0.5
      },
      
      // Challenging emotions
      anxious: {
        keywords: ['worried', 'nervous', 'anxious', 'stressed', 'concerned', 'afraid', 'scared', 'panic'],
        emoticons: ['😰', '😟', '😧', '😨', '😱', '💔', '😞', '😔'],
        phrases: ['worried about', 'makes me nervous', 'feeling anxious', 'stressed out', 'concerned that'],
        intensity: 0.8
      },
      
      sad: {
        keywords: ['sad', 'down', 'depressed', 'upset', 'disappointed', 'hurt', 'lonely', 'blue'],
        emoticons: ['😢', '😭', '😔', '😞', '💔', '😿', '🥺', '😓'],
        phrases: ['feeling sad', 'really down', 'disappointed about', 'hurts me', 'feel alone'],
        intensity: 0.8
      },
      
      frustrated: {
        keywords: ['frustrated', 'angry', 'annoyed', 'irritated', 'mad', 'upset', 'bothered', 'pissed'],
        emoticons: ['😠', '😡', '🤬', '😤', '💢', '👿', '😾', '🙄'],
        phrases: ['so frustrated', 'really annoying', 'drives me crazy', 'fed up', 'had enough'],
        intensity: 0.7
      },
      
      // Romantic/Dating specific
      vulnerable: {
        keywords: ['vulnerable', 'open', 'honest', 'scared', 'risk', 'trust', 'sharing', 'intimate'],
        emoticons: ['🥺', '😌', '💫', '🦋', '💕', '🤍', '✨', '🌸'],
        phrases: ['opening up', 'being vulnerable', 'trusting you', 'sharing this', 'scared but'],
        intensity: 0.8
      },
      
      grateful: {
        keywords: ['thank', 'grateful', 'appreciate', 'blessed', 'lucky', 'thankful', 'grateful for'],
        emoticons: ['🙏', '💝', '🌟', '💖', '😊', '🤗', '💐', '🌹'],
        phrases: ['thank you', 'so grateful', 'appreciate you', 'feel blessed', 'lucky to have'],
        intensity: 0.7
      }
    };
  }

  // Initialize the service
  async initialize() {
    if (this.initialized) return;
    
    try {
      console.log('Mood Analysis Service initialized successfully');
      this.initialized = true;
    } catch (error) {
      console.error('Error initializing Mood Analysis Service:', error);
      this.initialized = true; // Continue with limited functionality
    }
  }

  // Main mood analysis function
  async analyzeMood(message, context = {}) {
    if (!message || typeof message !== 'string') {
      return this.getDefaultMoodResult();
    }

    // Check cache first
    const cacheKey = `${message}_${JSON.stringify(context)}`;
    const cached = this.moodCache.get(cacheKey);
    if (cached && Date.now() - cached.timestamp < this.cacheTimeout) {
      return cached.result;
    }

    try {
      // Multi-layer analysis
      const patternAnalysis = this.analyzeWithPatterns(message);
      const aiAnalysis = await this.analyzeWithAI(message, context);
      const contextAnalysis = this.analyzeWithContext(message, context);
      
      // Combine analyses
      const combinedResult = this.combineAnalyses(patternAnalysis, aiAnalysis, contextAnalysis);
      
      // Cache result
      this.moodCache.set(cacheKey, {
        result: combinedResult,
        timestamp: Date.now()
      });
      
      return combinedResult;
      
    } catch (error) {
      console.error('Error analyzing mood:', error);
      return this.getDefaultMoodResult();
    }
  }

  // Pattern-based mood analysis
  analyzeWithPatterns(message) {
    const text = message.toLowerCase();
    const results = [];
    
    for (const [mood, pattern] of Object.entries(this.moodPatterns)) {
      let score = 0;
      let matches = 0;
      
      // Check keywords
      for (const keyword of pattern.keywords) {
        if (text.includes(keyword)) {
          score += 1;
          matches += 1;
        }
      }
      
      // Check emoticons
      for (const emoticon of pattern.emoticons) {
        if (message.includes(emoticon)) {
          score += 1.5; // Emoticons are strong indicators
          matches += 1;
        }
      }
      
      // Check phrases
      for (const phrase of pattern.phrases) {
        if (text.includes(phrase)) {
          score += 2; // Phrases are very strong indicators
          matches += 1;
        }
      }
      
      if (score > 0) {
        const confidence = Math.min(score * 0.3, 1.0) * pattern.intensity;
        results.push({
          mood,
          confidence,
          matches,
          method: 'pattern'
        });
      }
    }
    
    return results.sort((a, b) => b.confidence - a.confidence);
  }

  // AI-based mood analysis using SoulAI
  async analyzeWithAI(message, context) {
    try {
      const prompt = this.buildMoodAnalysisPrompt(message, context);
      
      const response = await ChatGPTService.sendMessage(prompt, {
        onComplete: (response) => response,
        onError: (error) => {
          console.error('AI mood analysis error:', error);
          return null;
        }
      });
      
      return this.parseAIMoodResponse(response);
      
    } catch (error) {
      console.error('AI mood analysis failed:', error);
      return [];
    }
  }

  // Build AI analysis prompt
  buildMoodAnalysisPrompt(message, context) {
    const availableMoods = Object.keys(this.moodPatterns).join(', ');
    
    return `You are a mood analysis expert. Analyze the emotional tone of this message and return the mood with confidence score.

Available moods: ${availableMoods}

Message: "${message}"

Context: ${JSON.stringify(context)}

Return format: [mood]:[confidence 0-1]:[reasoning]

Examples:
- "I'm so happy!" → joyful:0.9:Clear expression of happiness
- "feeling a bit worried" → anxious:0.6:Mild expression of worry
- "you look amazing" → flirty:0.7:Compliment with romantic undertones

Analyze the message:`;
  }

  // Parse AI response
  parseAIMoodResponse(response) {
    if (!response) return [];
    
    try {
      const lines = response.split('\n').filter(line => line.includes(':'));
      const results = [];
      
      for (const line of lines) {
        const parts = line.split(':');
        if (parts.length >= 3) {
          const mood = parts[0].trim().toLowerCase();
          const confidence = parseFloat(parts[1].trim());
          const reasoning = parts.slice(2).join(':').trim();
          
          if (this.moodPatterns[mood] && confidence > 0) {
            results.push({
              mood,
              confidence,
              reasoning,
              method: 'ai'
            });
          }
        }
      }
      
      return results;
      
    } catch (error) {
      console.error('Error parsing AI mood response:', error);
      return [];
    }
  }

  // Context-based mood analysis
  analyzeWithContext(message, context) {
    const results = [];
    
    // Time-based context
    const hour = new Date().getHours();
    if (hour < 6 || hour > 22) {
      // Late night messages might be more intimate/vulnerable
      results.push({
        mood: 'vulnerable',
        confidence: 0.3,
        method: 'context_time'
      });
    }
    
    // Conversation context
    if (context.isFirstMessage) {
      results.push({
        mood: 'nervous',
        confidence: 0.4,
        method: 'context_first'
      });
    }
    
    // Message length context
    if (message.length > 200) {
      results.push({
        mood: 'thoughtful',
        confidence: 0.5,
        method: 'context_length'
      });
    }
    
    return results;
  }

  // Combine different analysis results
  combineAnalyses(patternResults, aiResults, contextResults) {
    const allResults = [...patternResults, ...aiResults, ...contextResults];
    
    if (allResults.length === 0) {
      return this.getDefaultMoodResult();
    }
    
    // Group by mood
    const moodGroups = {};
    for (const result of allResults) {
      if (!moodGroups[result.mood]) {
        moodGroups[result.mood] = [];
      }
      moodGroups[result.mood].push(result);
    }
    
    // Calculate combined confidence for each mood
    const finalResults = [];
    for (const [mood, results] of Object.entries(moodGroups)) {
      const weights = {
        pattern: 0.4,
        ai: 0.5,
        context: 0.1
      };
      
      let totalConfidence = 0;
      let totalWeight = 0;
      
      for (const result of results) {
        const weight = weights[result.method] || 0.3;
        totalConfidence += result.confidence * weight;
        totalWeight += weight;
      }
      
      const avgConfidence = totalWeight > 0 ? totalConfidence / totalWeight : 0;
      
      finalResults.push({
        mood,
        confidence: avgConfidence,
        methods: results.map(r => r.method),
        gradient: getMoodGradient(mood)
      });
    }
    
    // Sort by confidence and return top result
    finalResults.sort((a, b) => b.confidence - a.confidence);
    
    return {
      primaryMood: finalResults[0] || this.getDefaultMoodResult(),
      allMoods: finalResults.slice(0, 3), // Top 3 moods
      analysisMetadata: {
        totalResults: allResults.length,
        methodsUsed: [...new Set(allResults.map(r => r.method))],
        timestamp: Date.now()
      }
    };
  }

  // Get default mood result
  getDefaultMoodResult() {
    return {
      primaryMood: {
        mood: 'neutral',
        confidence: 0.5,
        methods: ['default'],
        gradient: getMoodGradient('neutral')
      },
      allMoods: [{
        mood: 'neutral',
        confidence: 0.5,
        methods: ['default'],
        gradient: getMoodGradient('neutral')
      }],
      analysisMetadata: {
        totalResults: 0,
        methodsUsed: ['default'],
        timestamp: Date.now()
      }
    };
  }

  // Batch analyze multiple messages
  async batchAnalyzeMoods(messages, context = {}) {
    const results = [];
    
    for (const message of messages) {
      const result = await this.analyzeMood(message, context);
      results.push(result);
    }
    
    return results;
  }

  // Get mood trends over time
  getMoodTrends(analysisResults) {
    const trends = {
      dominant: {},
      timeline: [],
      shifts: []
    };
    
    for (const result of analysisResults) {
      const mood = result.primaryMood.mood;
      trends.dominant[mood] = (trends.dominant[mood] || 0) + 1;
      trends.timeline.push({
        mood,
        confidence: result.primaryMood.confidence,
        timestamp: result.analysisMetadata.timestamp
      });
    }
    
    // Detect mood shifts
    for (let i = 1; i < trends.timeline.length; i++) {
      const prev = trends.timeline[i - 1];
      const curr = trends.timeline[i];
      
      if (prev.mood !== curr.mood) {
        trends.shifts.push({
          from: prev.mood,
          to: curr.mood,
          timestamp: curr.timestamp
        });
      }
    }
    
    return trends;
  }

  // Clear mood cache
  clearCache() {
    this.moodCache.clear();
  }
}

export default new MoodAnalysisService();