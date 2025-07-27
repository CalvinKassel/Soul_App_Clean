// Enhanced Feedback Parser
// Granular analysis of match feedback to extract specific facet preferences
// Works with AI to understand the "why" behind user choices

import HighResolutionHHC from './HighResolutionHHC.js';

class EnhancedFeedbackParser {
  constructor() {
    this.hhcSchema = HighResolutionHHC;
    this.feedbackPatterns = this.initializeFeedbackPatterns();
    this.userFeedbackHistory = new Map(); // Track learning per user
  }

  initializeFeedbackPatterns() {
    return {
      // Preference indicators with facet mappings
      positiveIndicators: {
        energy: {
          facets: ['activityLevel', 'excitementSeeking', 'positiveEmotions'],
          keywords: ['energetic', 'lively', 'vibrant', 'dynamic', 'enthusiastic', 'upbeat'],
          phrases: ['high energy', 'full of life', 'brings energy', 'energizing to be around']
        },
        calm: {
          facets: ['emotionalStability', 'anxiety', 'cautiousness'],
          keywords: ['calm', 'peaceful', 'serene', 'stable', 'grounded', 'composed'],
          phrases: ['very calm', 'peaceful presence', 'emotionally stable', 'grounding influence']
        },
        intelligence: {
          facets: ['intellect', 'curiosity', 'cognitiveComplexity'],
          keywords: ['smart', 'intelligent', 'thoughtful', 'insightful', 'clever', 'brilliant'],
          phrases: ['really smart', 'deep thinker', 'intellectually stimulating', 'thought-provoking']
        },
        kindness: {
          facets: ['altruism', 'sympathy', 'warmth', 'compassion'],
          keywords: ['kind', 'caring', 'compassionate', 'gentle', 'sweet', 'considerate'],
          phrases: ['really kind', 'caring person', 'thoughtful', 'heart of gold']
        },
        humor: {
          facets: ['humorStylePlayful', 'humorStyleWitty', 'positiveEmotions'],
          keywords: ['funny', 'hilarious', 'witty', 'clever', 'humorous', 'amusing'],
          phrases: ['great sense of humor', 'makes me laugh', 'really funny', 'quick wit']
        },
        adventure: {
          facets: ['adventurousness', 'excitementSeeking', 'openness'],
          keywords: ['adventurous', 'spontaneous', 'exciting', 'bold', 'daring'],
          phrases: ['loves adventure', 'spontaneous person', 'up for anything', 'exciting to be with']
        },
        stability: {
          facets: ['reliability', 'emotionalStability', 'consistency'],
          keywords: ['stable', 'reliable', 'consistent', 'dependable', 'steady', 'grounded'],
          phrases: ['really stable', 'can depend on', 'consistent person', 'emotionally stable']
        },
        creativity: {
          facets: ['imagination', 'artisticInterest', 'creativity', 'unconventionality'],
          keywords: ['creative', 'artistic', 'imaginative', 'original', 'innovative'],
          phrases: ['very creative', 'artistic soul', 'unique perspective', 'creative mind']
        },
        communication: {
          facets: ['verbalFluency', 'expressiveness', 'listeningStyle'],
          keywords: ['articulate', 'expressive', 'communicative', 'eloquent', 'clear'],
          phrases: ['great communicator', 'expresses well', 'good listener', 'easy to talk to']
        }
      },

      negativeIndicators: {
        lowEnergy: {
          facets: ['activityLevel', 'excitementSeeking', 'positiveEmotions'],
          keywords: ['low-energy', 'quiet', 'subdued', 'mellow', 'low-key', 'reserved'],
          phrases: ['too quiet', 'low energy', 'not energetic enough', 'bit too mellow'],
          adjustment: 'increase_preference' // User wants MORE energy
        },
        tooIntense: {
          facets: ['excitementSeeking', 'emotionalSensitivity', 'activityLevel'],
          keywords: ['intense', 'overwhelming', 'too much', 'dramatic', 'extreme'],
          phrases: ['too intense', 'bit much', 'overwhelming personality', 'too dramatic'],
          adjustment: 'decrease_preference' // User wants LESS intensity
        },
        superficial: {
          facets: ['intellect', 'depthPreference', 'cognitiveComplexity'],
          keywords: ['shallow', 'superficial', 'basic', 'simple', 'surface-level'],
          phrases: ['too superficial', 'not deep enough', 'lacks depth', 'bit shallow'],
          adjustment: 'increase_preference' // User wants MORE depth
        },
        serious: {
          facets: ['humorStylePlayful', 'positiveEmotions', 'playfulness'],
          keywords: ['serious', 'stern', 'humorless', 'rigid', 'stiff'],
          phrases: ['too serious', 'no sense of humor', 'bit rigid', 'needs to lighten up'],
          adjustment: 'increase_preference' // User wants MORE playfulness
        },
        unreliable: {
          facets: ['reliability', 'consistency', 'dutifulness'],
          keywords: ['unreliable', 'flaky', 'inconsistent', 'unpredictable'],
          phrases: ['bit flaky', 'unreliable', 'inconsistent', 'hard to depend on'],
          adjustment: 'increase_preference' // User wants MORE reliability
        }
      },

      contextualFactors: {
        communication: {
          contexts: ['texting', 'conversation', 'talking', 'communication', 'messaging'],
          facets: ['verbalFluency', 'expressiveness', 'communicationStyle']
        },
        social: {
          contexts: ['social', 'party', 'group', 'friends', 'social situation'],
          facets: ['gregariousness', 'socialConfidence', 'warmth']
        },
        relationship: {
          contexts: ['relationship', 'dating', 'romantic', 'intimacy', 'connection'],
          facets: ['intimacyComfort', 'attachmentSecurity', 'emotionalVulnerability']
        },
        lifestyle: {
          contexts: ['lifestyle', 'living', 'daily', 'routine', 'habits'],
          facets: ['orderliness', 'consistency', 'activityLevel']
        }
      },

      intensityModifiers: {
        high: ['very', 'really', 'extremely', 'super', 'incredibly', 'way too'],
        medium: ['pretty', 'quite', 'fairly', 'somewhat', 'kind of'],
        low: ['a bit', 'slightly', 'a little', 'maybe', 'sort of']
      }
    };
  }

  // Main feedback analysis method
  async analyzeMatchFeedback(userId, matchId, action, feedback = '', matchProfile = {}) {
    console.log(`🔍 Analyzing feedback: ${action} on ${matchId}`);

    const analysis = {
      userId,
      matchId,
      action, // 'like', 'pass', 'maybe'
      timestamp: new Date(),
      specificReasons: [],
      facetPreferences: [],
      confidenceLevel: 0,
      learningValue: 0
    };

    // Analyze explicit feedback text
    if (feedback && feedback.trim()) {
      const textAnalysis = this.analyzeFeedbackText(feedback);
      analysis.specificReasons = textAnalysis.reasons;
      analysis.facetPreferences = textAnalysis.facetPreferences;
      analysis.confidenceLevel = textAnalysis.confidence;
      analysis.learningValue = textAnalysis.learningValue;
    }

    // Analyze implicit feedback from match profile
    if (matchProfile && Object.keys(matchProfile).length > 0) {
      const profileAnalysis = this.analyzeProfilePreferences(action, matchProfile, userId);
      analysis.facetPreferences.push(...profileAnalysis.facetPreferences);
      analysis.implicitLearning = profileAnalysis;
    }

    // Store learning for this user
    this.updateUserFeedbackHistory(userId, analysis);

    // Generate learning recommendations
    analysis.hhcUpdates = this.generateHHCUpdates(analysis, userId);
    analysis.improvementSuggestions = this.generateImprovementSuggestions(analysis, userId);

    console.log(`✅ Feedback analysis complete: ${analysis.facetPreferences.length} facet insights`);
    return analysis;
  }

  // Analyze explicit feedback text
  analyzeFeedbackText(feedbackText) {
    const lowerText = feedbackText.toLowerCase();
    const words = lowerText.split(/\s+/);
    
    const reasons = [];
    const facetPreferences = [];
    let totalConfidence = 0;
    let matchCount = 0;

    // Check positive indicators
    Object.entries(this.feedbackPatterns.positiveIndicators).forEach(([category, pattern]) => {
      const match = this.findPatternMatch(lowerText, pattern);
      if (match.found) {
        reasons.push({
          type: 'positive',
          category,
          strength: match.intensity,
          evidence: match.evidence
        });

        // Map to specific facets
        pattern.facets.forEach(facet => {
          facetPreferences.push({
            facet,
            preference: 'increase', // User likes this trait
            strength: match.intensity,
            evidence: match.evidence,
            category
          });
        });

        totalConfidence += match.confidence;
        matchCount++;
      }
    });

    // Check negative indicators
    Object.entries(this.feedbackPatterns.negativeIndicators).forEach(([category, pattern]) => {
      const match = this.findPatternMatch(lowerText, pattern);
      if (match.found) {
        reasons.push({
          type: 'negative',
          category,
          strength: match.intensity,
          evidence: match.evidence,
          adjustment: pattern.adjustment
        });

        // Map to specific facets with appropriate adjustment
        pattern.facets.forEach(facet => {
          const preferenceDirection = pattern.adjustment === 'increase_preference' ? 'increase' : 'decrease';
          facetPreferences.push({
            facet,
            preference: preferenceDirection,
            strength: match.intensity,
            evidence: match.evidence,
            category,
            reasoning: pattern.adjustment
          });
        });

        totalConfidence += match.confidence;
        matchCount++;
      }
    });

    return {
      reasons,
      facetPreferences,
      confidence: matchCount > 0 ? totalConfidence / matchCount : 0,
      learningValue: this.calculateLearningValue(reasons, facetPreferences)
    };
  }

  // Find pattern matches in text
  findPatternMatch(text, pattern) {
    let found = false;
    let intensity = 0;
    let confidence = 0;
    const evidence = [];

    // Check keywords
    if (pattern.keywords) {
      pattern.keywords.forEach(keyword => {
        if (text.includes(keyword)) {
          found = true;
          intensity += 0.3;
          confidence += 0.2;
          evidence.push(`keyword: ${keyword}`);
        }
      });
    }

    // Check phrases (higher weight)
    if (pattern.phrases) {
      pattern.phrases.forEach(phrase => {
        if (text.includes(phrase)) {
          found = true;
          intensity += 0.6;
          confidence += 0.4;
          evidence.push(`phrase: ${phrase}`);
        }
      });
    }

    // Check for intensity modifiers
    const intensityBoost = this.detectIntensityModifiers(text);
    intensity *= (1 + intensityBoost);
    confidence *= (1 + intensityBoost * 0.5);

    return {
      found,
      intensity: Math.min(1, intensity),
      confidence: Math.min(1, confidence),
      evidence
    };
  }

  // Detect intensity modifiers (very, really, etc.)
  detectIntensityModifiers(text) {
    let boost = 0;
    
    this.feedbackPatterns.intensityModifiers.high.forEach(modifier => {
      if (text.includes(modifier)) boost += 0.3;
    });
    
    this.feedbackPatterns.intensityModifiers.medium.forEach(modifier => {
      if (text.includes(modifier)) boost += 0.15;
    });
    
    this.feedbackPatterns.intensityModifiers.low.forEach(modifier => {
      if (text.includes(modifier)) boost -= 0.1;
    });

    return Math.max(0, boost);
  }

  // Analyze preferences from match profile (implicit feedback)
  analyzeProfilePreferences(action, matchProfile, userId) {
    const facetPreferences = [];
    const userHistory = this.getUserFeedbackHistory(userId);
    
    // Extract key traits from match profile
    const profileTraits = this.extractProfileTraits(matchProfile);
    
    profileTraits.forEach(trait => {
      const historicalPreference = this.getHistoricalPreference(userHistory, trait.facet);
      
      let preference = 'neutral';
      let confidence = 0.3; // Lower confidence for implicit feedback
      
      if (action === 'like') {
        preference = 'increase';
        confidence = 0.4;
      } else if (action === 'pass') {
        preference = 'decrease';
        confidence = 0.4;
      }
      
      // Adjust based on historical patterns
      if (historicalPreference) {
        confidence += 0.2;
      }
      
      facetPreferences.push({
        facet: trait.facet,
        preference,
        strength: trait.strength,
        confidence,
        source: 'profile_analysis',
        traitValue: trait.value
      });
    });

    return {
      facetPreferences,
      profileTraits,
      confidenceLevel: facetPreferences.length > 0 ? 
        facetPreferences.reduce((sum, fp) => sum + fp.confidence, 0) / facetPreferences.length : 0
    };
  }

  // Extract personality traits from profile
  extractProfileTraits(profile) {
    const traits = [];
    
    // Age-based energy inference
    if (profile.age) {
      const ageEnergyMapping = profile.age < 25 ? 0.7 : profile.age < 35 ? 0.6 : 0.5;
      traits.push({
        facet: 'activityLevel',
        value: ageEnergyMapping,
        strength: 0.3,
        source: 'age_inference'
      });
    }

    // Interests-based trait inference
    if (profile.interests) {
      profile.interests.forEach(interest => {
        const interestTraits = this.mapInterestToTraits(interest.toLowerCase());
        traits.push(...interestTraits);
      });
    }

    // Bio analysis
    if (profile.bio) {
      const bioTraits = this.analyzeBioForTraits(profile.bio);
      traits.push(...bioTraits);
    }

    // Personality type mapping
    if (profile.personalityType) {
      const mbtiTraits = this.mapMBTIToTraits(profile.personalityType);
      traits.push(...mbtiTraits);
    }

    return traits;
  }

  // Map interests to personality facets
  mapInterestToTraits(interest) {
    const interestMappings = {
      'art': [{ facet: 'artisticInterest', value: 0.8, strength: 0.6 }],
      'travel': [
        { facet: 'adventurousness', value: 0.7, strength: 0.5 },
        { facet: 'openness', value: 0.6, strength: 0.4 }
      ],
      'technology': [
        { facet: 'intellect', value: 0.6, strength: 0.4 },
        { facet: 'curiosity', value: 0.7, strength: 0.5 }
      ],
      'sports': [
        { facet: 'activityLevel', value: 0.8, strength: 0.6 },
        { facet: 'competitiveness', value: 0.6, strength: 0.4 }
      ],
      'reading': [
        { facet: 'intellect', value: 0.7, strength: 0.5 },
        { facet: 'imagination', value: 0.6, strength: 0.4 }
      ],
      'music': [
        { facet: 'artisticInterest', value: 0.7, strength: 0.5 },
        { facet: 'emotionality', value: 0.6, strength: 0.4 }
      ]
    };

    return interestMappings[interest] || [];
  }

  // Map MBTI to HHC facets
  mapMBTIToTraits(mbtiType) {
    const traits = [];
    const type = mbtiType.substring(0, 4).toUpperCase();
    
    // Extraversion vs Introversion
    if (type[0] === 'E') {
      traits.push(
        { facet: 'gregariousness', value: 0.7, strength: 0.6 },
        { facet: 'assertiveness', value: 0.6, strength: 0.5 },
        { facet: 'positiveEmotions', value: 0.6, strength: 0.5 }
      );
    } else {
      traits.push(
        { facet: 'gregariousness', value: 0.3, strength: 0.6 },
        { facet: 'reflectiveness', value: 0.7, strength: 0.5 }
      );
    }

    // Sensing vs Intuition
    if (type[1] === 'N') {
      traits.push(
        { facet: 'imagination', value: 0.7, strength: 0.6 },
        { facet: 'openness', value: 0.6, strength: 0.5 }
      );
    } else {
      traits.push(
        { facet: 'practicality', value: 0.7, strength: 0.6 },
        { facet: 'reliability', value: 0.6, strength: 0.5 }
      );
    }

    // Thinking vs Feeling
    if (type[2] === 'T') {
      traits.push(
        { facet: 'logicalAnalysis', value: 0.7, strength: 0.6 },
        { facet: 'objectivity', value: 0.6, strength: 0.5 }
      );
    } else {
      traits.push(
        { facet: 'empathy', value: 0.7, strength: 0.6 },
        { facet: 'warmth', value: 0.6, strength: 0.5 }
      );
    }

    // Judging vs Perceiving
    if (type[3] === 'J') {
      traits.push(
        { facet: 'orderliness', value: 0.7, strength: 0.6 },
        { facet: 'planning', value: 0.6, strength: 0.5 }
      );
    } else {
      traits.push(
        { facet: 'flexibility', value: 0.7, strength: 0.6 },
        { facet: 'spontaneity', value: 0.6, strength: 0.5 }
      );
    }

    return traits;
  }

  // Generate HHC updates based on feedback analysis
  generateHHCUpdates(analysis, userId) {
    const updates = [];
    const userHistory = this.getUserFeedbackHistory(userId);

    analysis.facetPreferences.forEach(preference => {
      const facetInfo = this.hhcSchema.getFacetInfo(preference.facet);
      
      if (facetInfo) {
        const historicalPattern = this.getHistoricalPreference(userHistory, preference.facet);
        const adjustmentStrength = this.calculateAdjustmentStrength(preference, historicalPattern);

        updates.push({
          dimension: facetInfo.dimension,
          facet: preference.facet,
          adjustment: preference.preference, // 'increase' or 'decrease'
          strength: adjustmentStrength,
          confidence: preference.confidence || 0.5,
          reasoning: preference.evidence || preference.category,
          category: facetInfo.category
        });
      }
    });

    return updates;
  }

  calculateAdjustmentStrength(preference, historicalPattern) {
    let baseStrength = preference.strength || 0.5;
    
    // Increase strength if this is a consistent pattern
    if (historicalPattern && historicalPattern.consistency > 0.7) {
      baseStrength *= 1.3;
    }
    
    // Adjust based on confidence
    baseStrength *= (preference.confidence || 0.5);
    
    return Math.min(1, baseStrength);
  }

  // User feedback history management
  getUserFeedbackHistory(userId) {
    if (!this.userFeedbackHistory.has(userId)) {
      this.userFeedbackHistory.set(userId, {
        feedbackCount: 0,
        facetPatterns: new Map(),
        lastUpdated: new Date(),
        learningVelocity: 0
      });
    }
    return this.userFeedbackHistory.get(userId);
  }

  updateUserFeedbackHistory(userId, analysis) {
    const history = this.getUserFeedbackHistory(userId);
    history.feedbackCount++;
    history.lastUpdated = new Date();
    
    // Update facet patterns
    analysis.facetPreferences.forEach(preference => {
      const facetName = preference.facet;
      
      if (!history.facetPatterns.has(facetName)) {
        history.facetPatterns.set(facetName, {
          samples: [],
          averagePreference: 0,
          consistency: 0,
          confidence: 0
        });
      }
      
      const pattern = history.facetPatterns.get(facetName);
      pattern.samples.push({
        preference: preference.preference,
        strength: preference.strength || 0.5,
        confidence: preference.confidence || 0.5,
        timestamp: new Date()
      });
      
      // Keep only recent samples (last 20)
      if (pattern.samples.length > 20) {
        pattern.samples = pattern.samples.slice(-20);
      }
      
      // Recalculate statistics
      this.recalculatePatternStats(pattern);
    });
    
    // Update learning velocity
    history.learningVelocity = this.calculateLearningVelocity(history);
  }

  recalculatePatternStats(pattern) {
    const samples = pattern.samples;
    if (samples.length === 0) return;
    
    // Calculate average preference (increase = +1, decrease = -1)
    const prefValues = samples.map(s => s.preference === 'increase' ? 1 : -1);
    pattern.averagePreference = prefValues.reduce((sum, val) => sum + val, 0) / prefValues.length;
    
    // Calculate consistency (how consistent are the preferences)
    const consistencySum = prefValues.reduce((sum, val) => {
      return sum + Math.abs(val - pattern.averagePreference);
    }, 0);
    pattern.consistency = Math.max(0, 1 - (consistencySum / samples.length));
    
    // Average confidence
    pattern.confidence = samples.reduce((sum, s) => sum + s.confidence, 0) / samples.length;
  }

  calculateLearningVelocity(history) {
    // How quickly is the user providing useful feedback
    const recentFeedback = Array.from(history.facetPatterns.values())
      .filter(pattern => pattern.samples.length > 0)
      .map(pattern => pattern.samples[pattern.samples.length - 1])
      .filter(sample => {
        const timeDiff = new Date() - sample.timestamp;
        return timeDiff < 7 * 24 * 60 * 60 * 1000; // Last week
      });
    
    return recentFeedback.length / 7; // Feedback per day
  }

  getHistoricalPreference(userHistory, facetName) {
    return userHistory.facetPatterns.get(facetName) || null;
  }

  // Generate improvement suggestions
  generateImprovementSuggestions(analysis, userId) {
    const suggestions = [];
    const history = this.getUserFeedbackHistory(userId);
    
    if (history.feedbackCount < 5) {
      suggestions.push({
        type: 'more_feedback',
        message: 'Provide more specific feedback to improve match quality',
        priority: 'high'
      });
    }
    
    if (analysis.confidenceLevel < 0.3) {
      suggestions.push({
        type: 'specific_feedback',
        message: 'Try to be more specific about what you liked or disliked',
        priority: 'medium'
      });
    }
    
    return suggestions;
  }

  calculateLearningValue(reasons, facetPreferences) {
    let value = 0;
    
    // More specific reasons = higher learning value
    value += reasons.length * 0.2;
    
    // Facet preferences with high confidence = higher value
    facetPreferences.forEach(fp => {
      value += fp.strength * (fp.confidence || 0.5) * 0.3;
    });
    
    return Math.min(1, value);
  }

  // Analytics and insights
  getUserInsights(userId) {
    const history = this.getUserFeedbackHistory(userId);
    const insights = {
      totalFeedback: history.feedbackCount,
      learningVelocity: history.learningVelocity,
      strongPreferences: [],
      learningProgress: this.calculateLearningProgress(history),
      recommendations: this.generateInsightRecommendations(history)
    };
    
    // Find strong preferences
    for (const [facetName, pattern] of history.facetPatterns.entries()) {
      if (pattern.consistency > 0.7 && pattern.confidence > 0.6) {
        insights.strongPreferences.push({
          facet: facetName,
          preference: pattern.averagePreference > 0 ? 'high' : 'low',
          strength: Math.abs(pattern.averagePreference),
          consistency: pattern.consistency
        });
      }
    }
    
    return insights;
  }

  calculateLearningProgress(history) {
    const totalFacets = Object.keys(this.feedbackPatterns.positiveIndicators).length + 
                       Object.keys(this.feedbackPatterns.negativeIndicators).length;
    const exploredFacets = history.facetPatterns.size;
    
    return Math.min(1, exploredFacets / totalFacets);
  }

  generateInsightRecommendations(history) {
    const recommendations = [];
    
    if (history.learningVelocity < 0.5) {
      recommendations.push('Try providing feedback more regularly to improve matches');
    }
    
    if (history.facetPatterns.size < 5) {
      recommendations.push('Be more specific about what you like and dislike in matches');
    }
    
    return recommendations;
  }
}

export default new EnhancedFeedbackParser();