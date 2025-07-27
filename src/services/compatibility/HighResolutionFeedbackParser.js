// High-Resolution Feedback Parser
// Extracts maximum detail from user feedback to adjust HHC dimensions with surgical precision
// "They're too low-key" → adjusts Activity Level (dim 23) and Excitement-Seeking (dim 24)

import HighResolutionHHC from './HighResolutionHHC.js';

class HighResolutionFeedbackParser {
  constructor() {
    this.hhcSchema = HighResolutionHHC;
    this.feedbackMappings = this.initializeFeedbackMappings();
    this.contextualModifiers = this.initializeContextualModifiers();
  }

  // Initialize comprehensive feedback-to-dimension mappings
  initializeFeedbackMappings() {
    return {
      // ENERGY & ACTIVITY LEVEL
      energyLevel: {
        patterns: [
          'too energetic', 'too hyper', 'too much energy', 'exhausting',
          'too low-key', 'too mellow', 'not energetic enough', 'too chill',
          'perfect energy', 'great energy match', 'good energy level'
        ],
        dimensionMappings: {
          'too energetic': { dimensions: [23, 24], direction: 'reduce', strength: 0.3 }, // activityLevel, excitementSeeking
          'too hyper': { dimensions: [23, 28], direction: 'reduce', strength: 0.4 }, // activityLevel, enthusiasm
          'too low-key': { dimensions: [23, 24, 25], direction: 'increase', strength: 0.3 }, // activityLevel, excitementSeeking, positiveEmotions
          'too mellow': { dimensions: [23, 28], direction: 'increase', strength: 0.2 },
          'perfect energy': { dimensions: [23, 24], direction: 'maintain', strength: 0.5 }
        }
      },

      // COMMUNICATION STYLE
      communicationStyle: {
        patterns: [
          'too quiet', 'too talkative', 'too direct', 'too indirect',
          'great communicator', 'hard to talk to', 'easy to talk to',
          'good listener', 'poor listener', 'interrupts too much'
        ],
        dimensionMappings: {
          'too quiet': { dimensions: [84, 27, 92], direction: 'increase', strength: 0.3 }, // verbalFluency, expressiveness, communicationEnergy
          'too talkative': { dimensions: [84, 92], direction: 'reduce', strength: 0.2 },
          'too direct': { dimensions: [94, 22], direction: 'reduce', strength: 0.3 }, // directness, assertiveness
          'too indirect': { dimensions: [94, 90], direction: 'increase', strength: 0.3 }, // directness, clarityPreference
          'great communicator': { dimensions: [84, 82, 95], direction: 'maintain', strength: 0.4 }, // verbalFluency, activeListening, emotionalSupport
          'good listener': { dimensions: [82, 93], direction: 'maintain', strength: 0.4 } // activeListening, listeningStyle
        }
      },

      // EMOTIONAL EXPRESSION & INTIMACY
      emotionalConnection: {
        patterns: [
          'too emotional', 'not emotional enough', 'emotionally distant',
          'great emotional connection', 'emotionally unavailable',
          'too intense', 'not passionate enough', 'perfect emotional match'
        ],
        dimensionMappings: {
          'too emotional': { dimensions: [83, 91, 2], direction: 'reduce', strength: 0.3 }, // emotionalExpression, emotionalVulnerability, emotionality
          'emotionally distant': { dimensions: [83, 91, 20], direction: 'increase', strength: 0.4 }, // emotionalExpression, emotionalVulnerability, warmth
          'too intense': { dimensions: [46, 44, 83], direction: 'reduce', strength: 0.3 }, // emotionalVolatility, impulsiveness, emotionalExpression
          'great emotional connection': { dimensions: [83, 37, 35], direction: 'maintain', strength: 0.5 } // emotionalExpression, empathy, sympathy
        }
      },

      // PERSONALITY TRAITS
      personalityFit: {
        patterns: [
          'too serious', 'not serious enough', 'too playful', 'too boring',
          'great sense of humor', 'no sense of humor', 'perfect personality match',
          'too introverted', 'too extroverted', 'great personality balance'
        ],
        dimensionMappings: {
          'too serious': { dimensions: [97, 234, 25], direction: 'increase', strength: 0.3 }, // playfulCommunication, playfulHumor, positiveEmotions
          'too playful': { dimensions: [97, 234], direction: 'reduce', strength: 0.2 },
          'too introverted': { dimensions: [21, 26, 104], direction: 'increase', strength: 0.3 }, // gregariousness, sociability, socialInitiation
          'too extroverted': { dimensions: [21, 26], direction: 'reduce', strength: 0.2 }
        }
      },

      // VALUES & LIFESTYLE
      lifestyleCompatibility: {
        patterns: [
          'different values', 'shared values', 'lifestyle mismatch',
          'similar interests', 'nothing in common', 'perfect lifestyle match',
          'different priorities', 'same goals', 'incompatible lifestyles'
        ],
        dimensionMappings: {
          'different values': { dimensions: [120, 121, 122, 123, 124], direction: 'question_compatibility', strength: 0.4 }, // core values
          'lifestyle mismatch': { dimensions: [149, 150, 151], direction: 'question_compatibility', strength: 0.3 }, // riskTolerance, changeOrientation, competitiveSpirit
          'similar interests': { dimensions: [220, 221, 222, 223], direction: 'maintain', strength: 0.4 } // interests categories
        }
      },

      // ATTACHMENT & RELATIONSHIP STYLE
      relationshipStyle: {
        patterns: [
          'too clingy', 'too independent', 'great balance', 'too needy',
          'emotionally available', 'commitment issues', 'relationship ready',
          'too jealous', 'very trusting', 'secure attachment'
        ],
        dimensionMappings: {
          'too clingy': { dimensions: [63, 64, 214], direction: 'reduce', strength: 0.4 }, // fearOfAbandonment, needForReassurance, jealousyManagement
          'too independent': { dimensions: [67, 208], direction: 'reduce', strength: 0.3 }, // selfReliance, independenceInRelationship
          'too needy': { dimensions: [64, 65, 79], direction: 'reduce', strength: 0.4 }, // needForReassurance, preoccupation, relationshipAnxiety
          'secure attachment': { dimensions: [60, 61, 62], direction: 'maintain', strength: 0.5 } // secureBase, trustInRelationships, emotionalRegulation
        }
      },

      // PHYSICAL & INTIMACY PREFERENCES
      physicalConnection: {
        patterns: [
          'great chemistry', 'no chemistry', 'physical compatibility',
          'affectionate', 'not affectionate enough', 'too touchy',
          'perfect physical connection', 'awkward physically'
        ],
        dimensionMappings: {
          'great chemistry': { dimensions: [180, 181, 182], direction: 'maintain', strength: 0.5 }, // physicalTouch love languages
          'not affectionate enough': { dimensions: [180, 181, 20], direction: 'increase', strength: 0.3 }, // physicalTouch, casualTouch, warmth
          'too touchy': { dimensions: [180, 181], direction: 'reduce', strength: 0.3 }
        }
      },

      // INTELLECTUAL CONNECTION
      intellectualConnection: {
        patterns: [
          'intellectually stimulating', 'boring conversations', 'smart',
          'great discussions', 'nothing to talk about', 'deep thinker',
          'too intellectual', 'not intellectual enough'
        ],
        dimensionMappings: {
          'intellectually stimulating': { dimensions: [4, 96, 50], direction: 'maintain', strength: 0.4 }, // intellect, intellectualDiscussion, cognitiveComplexity
          'boring conversations': { dimensions: [4, 96, 177], direction: 'increase', strength: 0.3 }, // intellect, intellectualDiscussion, qualityConversation
          'too intellectual': { dimensions: [4, 96], direction: 'reduce', strength: 0.2 },
          'great discussions': { dimensions: [96, 177, 173], direction: 'maintain', strength: 0.4 } // intellectualDiscussion, qualityConversation, verbalIntimacy
        }
      }
    };
  }

  // Initialize contextual modifiers that affect interpretation
  initializeContextualModifiers() {
    return {
      intensity: {
        'very': 1.5,
        'extremely': 2.0,
        'somewhat': 0.7,
        'a bit': 0.5,
        'slightly': 0.3,
        'really': 1.3,
        'quite': 1.2,
        'totally': 1.8
      },
      certainty: {
        'definitely': 1.0,
        'probably': 0.8,
        'maybe': 0.5,
        'I think': 0.7,
        'seemed like': 0.6,
        'absolutely': 1.0
      },
      comparison: {
        'compared to others': 0.8,
        'for me': 1.2,
        'than I prefer': 1.0,
        'than usual': 0.9
      }
    };
  }

  // Main parsing method - extract detailed insights from feedback
  async parseFeedback(userId, feedback, matchData) {
    try {
      console.log(`🔍 Parsing high-resolution feedback from user ${userId}: "${feedback}"`);
      
      const normalizedFeedback = feedback.toLowerCase().trim();
      const parseResults = {
        dimensionAdjustments: [],
        confidenceLevel: 0,
        reasoningPath: [],
        extractedMeaning: {}
      };

      // Step 1: Identify all matching patterns
      const patternMatches = this.identifyPatterns(normalizedFeedback);
      parseResults.reasoningPath.push(`Identified ${patternMatches.length} pattern matches`);

      // Step 2: Apply contextual modifiers
      const modifiedMatches = this.applyContextualModifiers(patternMatches, normalizedFeedback);
      parseResults.reasoningPath.push(`Applied contextual modifiers to ${modifiedMatches.length} matches`);

      // Step 3: Generate dimension adjustments
      for (const match of modifiedMatches) {
        const adjustments = this.generateDimensionAdjustments(match, matchData);
        parseResults.dimensionAdjustments.push(...adjustments);
      }

      // Step 4: Resolve conflicts and optimize adjustments
      const optimizedAdjustments = this.optimizeAdjustments(parseResults.dimensionAdjustments);
      parseResults.dimensionAdjustments = optimizedAdjustments;

      // Step 5: Calculate overall confidence
      parseResults.confidenceLevel = this.calculateConfidence(parseResults);
      parseResults.extractedMeaning = this.generateMeaningExtraction(patternMatches, normalizedFeedback);

      console.log(`✅ Parsed feedback: ${parseResults.dimensionAdjustments.length} dimension adjustments with ${parseResults.confidenceLevel.toFixed(2)} confidence`);
      
      return parseResults;

    } catch (error) {
      console.error('❌ Error parsing feedback:', error);
      return {
        dimensionAdjustments: [],
        confidenceLevel: 0,
        reasoningPath: ['Error during parsing'],
        extractedMeaning: { error: error.message }
      };
    }
  }

  // Step 1: Identify patterns in feedback
  identifyPatterns(feedback) {
    const matches = [];

    for (const [categoryName, category] of Object.entries(this.feedbackMappings)) {
      for (const pattern of category.patterns) {
        if (feedback.includes(pattern.toLowerCase())) {
          const mapping = category.dimensionMappings[pattern];
          if (mapping) {
            matches.push({
              category: categoryName,
              pattern,
              mapping,
              matchIndex: feedback.indexOf(pattern.toLowerCase()),
              matchLength: pattern.length
            });
          }
        }
      }
    }

    // Sort by match quality (longer patterns first, earlier positions first)
    return matches.sort((a, b) => {
      if (a.matchLength !== b.matchLength) {
        return b.matchLength - a.matchLength; // Longer patterns first
      }
      return a.matchIndex - b.matchIndex; // Earlier positions first
    });
  }

  // Step 2: Apply contextual modifiers
  applyContextualModifiers(matches, feedback) {
    return matches.map(match => {
      let intensityModifier = 1.0;
      let certaintyModifier = 1.0;

      // Check for intensity modifiers
      for (const [modifier, multiplier] of Object.entries(this.contextualModifiers.intensity)) {
        if (feedback.includes(modifier.toLowerCase())) {
          intensityModifier = multiplier;
          break;
        }
      }

      // Check for certainty modifiers
      for (const [modifier, multiplier] of Object.entries(this.contextualModifiers.certainty)) {
        if (feedback.includes(modifier.toLowerCase())) {
          certaintyModifier = multiplier;
          break;
        }
      }

      // Apply modifiers
      const modifiedMapping = {
        ...match.mapping,
        strength: Math.min(1.0, match.mapping.strength * intensityModifier * certaintyModifier)
      };

      return {
        ...match,
        mapping: modifiedMapping,
        appliedModifiers: {
          intensity: intensityModifier,
          certainty: certaintyModifier
        }
      };
    });
  }

  // Step 3: Generate dimension adjustments
  generateDimensionAdjustments(match, matchData) {
    const adjustments = [];

    for (const dimensionIndex of match.mapping.dimensions) {
      const dimensionInfo = this.hhcSchema.getDimensionInfo(dimensionIndex);
      
      const adjustment = {
        dimensionIndex,
        dimensionName: dimensionInfo.facet,
        category: dimensionInfo.category,
        subCategory: dimensionInfo.subCategory,
        direction: match.mapping.direction,
        strength: match.mapping.strength,
        reason: `User feedback: "${match.pattern}" affects ${dimensionInfo.facet}`,
        sourcePattern: match.pattern,
        sourceCategory: match.category,
        matchData: {
          matchId: matchData?.id,
          matchName: matchData?.name
        }
      };

      adjustments.push(adjustment);
    }

    return adjustments;
  }

  // Step 4: Optimize and resolve conflicts
  optimizeAdjustments(adjustments) {
    // Group by dimension to handle conflicts
    const dimensionGroups = new Map();
    
    adjustments.forEach(adj => {
      if (!dimensionGroups.has(adj.dimensionIndex)) {
        dimensionGroups.set(adj.dimensionIndex, []);
      }
      dimensionGroups.get(adj.dimensionIndex).push(adj);
    });

    const optimized = [];

    for (const [dimensionIndex, dimensionAdjustments] of dimensionGroups) {
      if (dimensionAdjustments.length === 1) {
        optimized.push(dimensionAdjustments[0]);
      } else {
        // Resolve conflicts by averaging or taking strongest
        const resolved = this.resolveConflictingAdjustments(dimensionAdjustments);
        if (resolved) optimized.push(resolved);
      }
    }

    return optimized;
  }

  resolveConflictingAdjustments(adjustments) {
    // If all adjustments are in the same direction, combine them
    const directions = [...new Set(adjustments.map(adj => adj.direction))];
    
    if (directions.length === 1) {
      // Same direction - combine strengths
      const combinedStrength = Math.min(1.0, 
        adjustments.reduce((sum, adj) => sum + adj.strength, 0)
      );
      
      return {
        ...adjustments[0],
        strength: combinedStrength,
        reason: `Combined: ${adjustments.map(adj => adj.sourcePattern).join(', ')}`
      };
    } else {
      // Conflicting directions - take the strongest
      const strongest = adjustments.reduce((max, adj) => 
        adj.strength > max.strength ? adj : max
      );
      
      return {
        ...strongest,
        reason: `Strongest signal: ${strongest.sourcePattern} (resolved conflict)`
      };
    }
  }

  // Step 5: Calculate confidence level
  calculateConfidence(parseResults) {
    if (parseResults.dimensionAdjustments.length === 0) return 0;

    const avgStrength = parseResults.dimensionAdjustments
      .reduce((sum, adj) => sum + adj.strength, 0) / parseResults.dimensionAdjustments.length;

    const patternCoverage = parseResults.dimensionAdjustments.length / 10; // Normalize by max expected
    const reasoningQuality = parseResults.reasoningPath.length > 2 ? 0.8 : 0.5;

    return Math.min(1.0, avgStrength * 0.5 + patternCoverage * 0.3 + reasoningQuality * 0.2);
  }

  // Generate meaning extraction
  generateMeaningExtraction(matches, feedback) {
    const categories = [...new Set(matches.map(m => m.category))];
    const patterns = matches.map(m => m.pattern);
    
    return {
      primaryConcerns: categories.slice(0, 3),
      specificIssues: patterns.slice(0, 3),
      feedbackType: this.classifyFeedbackType(feedback),
      emotionalTone: this.analyzeEmotionalTone(feedback),
      specificityLevel: this.calculateSpecificity(feedback)
    };
  }

  classifyFeedbackType(feedback) {
    if (feedback.includes('perfect') || feedback.includes('great') || feedback.includes('love')) {
      return 'positive';
    } else if (feedback.includes('too') || feedback.includes('not enough') || feedback.includes('hate')) {
      return 'negative';
    } else {
      return 'neutral';
    }
  }

  analyzeEmotionalTone(feedback) {
    const positiveWords = ['great', 'love', 'perfect', 'amazing', 'wonderful'];
    const negativeWords = ['hate', 'dislike', 'annoying', 'terrible', 'awful'];
    
    let score = 0;
    positiveWords.forEach(word => {
      if (feedback.includes(word)) score += 1;
    });
    negativeWords.forEach(word => {
      if (feedback.includes(word)) score -= 1;
    });

    if (score > 0) return 'positive';
    if (score < 0) return 'negative';
    return 'neutral';
  }

  calculateSpecificity(feedback) {
    const specificWords = ['because', 'when', 'always', 'never', 'specifically', 'particularly'];
    let count = 0;
    specificWords.forEach(word => {
      if (feedback.includes(word)) count++;
    });
    
    return Math.min(1.0, count / 3);
  }

  // Generate follow-up questions for unclear feedback
  generateClarifyingQuestions(userId, feedback, parseResults) {
    if (parseResults.confidenceLevel > 0.7) {
      return []; // High confidence, no questions needed
    }

    const questions = [];

    if (parseResults.confidenceLevel < 0.3) {
      questions.push("Could you be more specific about what didn't feel like a good fit?");
    }

    if (parseResults.extractedMeaning.specificityLevel < 0.5) {
      questions.push("Can you give me an example of what you mean?");
    }

    if (parseResults.dimensionAdjustments.length === 0) {
      questions.push("Was it more about their personality, communication style, or something else?");
    }

    return questions;
  }

  // Apply feedback adjustments to user's preference profile
  async applyAdjustmentsToProfile(userId, adjustments, currentProfile) {
    try {
      const updatedProfile = { ...currentProfile };
      const changeLog = [];

      for (const adjustment of adjustments) {
        const oldValue = updatedProfile.vector[adjustment.dimensionIndex];
        let newValue;

        switch (adjustment.direction) {
          case 'increase':
            newValue = Math.min(1.0, oldValue + adjustment.strength);
            break;
          case 'reduce':
            newValue = Math.max(0.0, oldValue - adjustment.strength);
            break;
          case 'maintain':
            newValue = oldValue; // No change, but increase confidence
            break;
          case 'question_compatibility':
            // This affects matching algorithm but not user's profile
            newValue = oldValue;
            break;
          default:
            newValue = oldValue;
        }

        updatedProfile.vector[adjustment.dimensionIndex] = newValue;
        
        // Update confidence and source
        updatedProfile.metadata.confidenceScores[adjustment.dimensionIndex] = Math.max(
          updatedProfile.metadata.confidenceScores[adjustment.dimensionIndex],
          adjustment.strength
        );
        
        updatedProfile.metadata.dataSources[adjustment.dimensionIndex] = 'feedback';
        
        changeLog.push({
          dimension: adjustment.dimensionIndex,
          facet: adjustment.dimensionName,
          change: newValue - oldValue,
          reason: adjustment.reason
        });
      }

      // Update metadata
      updatedProfile.metadata.lastUpdated = new Date();
      updatedProfile.metadata.learningHistory.push({
        timestamp: new Date(),
        source: 'high_resolution_feedback',
        adjustments: changeLog
      });

      console.log(`🎯 Applied ${changeLog.length} high-resolution adjustments to user ${userId} profile`);
      
      return {
        success: true,
        updatedProfile,
        changeLog,
        summary: this.generateAdjustmentSummary(changeLog)
      };

    } catch (error) {
      console.error('❌ Error applying adjustments to profile:', error);
      return {
        success: false,
        error: error.message
      };
    }
  }

  generateAdjustmentSummary(changeLog) {
    const categories = {};
    
    changeLog.forEach(change => {
      const dimensionInfo = this.hhcSchema.getDimensionInfo(change.dimension);
      const category = dimensionInfo.category;
      
      if (!categories[category]) {
        categories[category] = { increases: 0, decreases: 0, facets: [] };
      }
      
      if (change.change > 0) {
        categories[category].increases++;
      } else if (change.change < 0) {
        categories[category].decreases++;
      }
      
      categories[category].facets.push(change.facet);
    });

    return {
      totalAdjustments: changeLog.length,
      categoriesAffected: Object.keys(categories).length,
      categoryBreakdown: categories
    };
  }
}

export default new HighResolutionFeedbackParser();