// High-Resolution HHC Integration Service
// Orchestrates personality extraction, feedback learning, and vector updates
// Provides dimension-specific population algorithms for maximum precision

import HighResolutionHHC from './HighResolutionHHC.js';
import SocraticPersonalityExtractor from './SocraticPersonalityExtractor.js';
import EnhancedFeedbackParser from './EnhancedFeedbackParser.js';
import SocraticPersonalityAnalyzer from './SocraticPersonalityAnalyzer.js';

class HighResolutionHHCService {
  constructor() {
    this.hhcSchema = HighResolutionHHC;
    this.personalityExtractor = SocraticPersonalityExtractor;
    this.feedbackParser = EnhancedFeedbackParser;
    this.personalityAnalyzer = SocraticPersonalityAnalyzer;
    
    this.userVectors = new Map(); // Cache user HHC vectors
    this.populationAlgorithms = this.initializePopulationAlgorithms();
    this.learningRates = this.initializeLearningRates();
  }

  // Initialize dimension-specific population algorithms
  initializePopulationAlgorithms() {
    return {
      // Conversation-based population (high precision)
      conversation: {
        confidence: 0.8,
        method: 'socratic_extraction',
        applicableDimensions: [0, 1, 2, 3, 4, 20, 21, 22, 30, 31, 32, 60, 61, 62, 80, 81, 82, 120, 121, 122], // Core personality facets
        algorithm: this.populateFromConversation.bind(this)
      },

      // Behavioral feedback population (medium-high precision)
      feedback: {
        confidence: 0.7,
        method: 'preference_analysis',
        applicableDimensions: [170, 171, 172, 173, 174, 175, 176, 177, 178, 179, 180, 181, 182, 183, 184, 185, 186, 187, 188, 189], // Love languages & relationship
        algorithm: this.populateFromFeedback.bind(this)
      },

      // Profile analysis population (medium precision)
      profile: {
        confidence: 0.6,
        method: 'profile_inference',
        applicableDimensions: [220, 221, 222, 223, 224, 225, 226, 227], // Interests
        algorithm: this.populateFromProfile.bind(this)
      },

      // Cross-reference validation (high confidence boost)
      validation: {
        confidence: 0.9,
        method: 'cross_validation',
        applicableDimensions: 'all',
        algorithm: this.validateCrossReferences.bind(this)
      }
    };
  }

  // Initialize learning rates for different dimension types
  initializeLearningRates() {
    return {
      corePersonality: 0.1,    // Slow updates - personality is stable
      socialStyle: 0.2,        // Medium updates - social patterns evolve
      preferences: 0.3,        // Faster updates - preferences can change
      learned: 0.5             // Fast updates - learned traits are dynamic
    };
  }

  // Main method: Create or update user's high-resolution HHC
  async processUserPersonality(userId, inputData) {
    console.log(`🧠 Processing high-resolution personality for ${userId}`);

    try {
      // Get or create user's HHC vector
      let userHHC = this.getUserVector(userId);
      if (!userHHC) {
        userHHC = this.createNewUserVector(userId);
      }

      const updates = [];
      const processingLog = [];

      // Process conversation data
      if (inputData.conversationData) {
        const conversationUpdates = await this.processConversationData(userId, inputData.conversationData, userHHC);
        updates.push(...conversationUpdates);
        processingLog.push(`Conversation: ${conversationUpdates.length} dimensions updated`);
      }

      // Process feedback data
      if (inputData.feedbackData) {
        const feedbackUpdates = await this.processFeedbackData(userId, inputData.feedbackData, userHHC);
        updates.push(...feedbackUpdates);
        processingLog.push(`Feedback: ${feedbackUpdates.length} dimensions updated`);
      }

      // Process profile data
      if (inputData.profileData) {
        const profileUpdates = await this.processProfileData(userId, inputData.profileData, userHHC);
        updates.push(...profileUpdates);
        processingLog.push(`Profile: ${profileUpdates.length} dimensions updated`);
      }

      // Apply all updates with intelligent merging
      const finalUpdates = this.mergeUpdates(updates, userHHC);
      this.applyUpdates(userHHC, finalUpdates);

      // Validate and cross-reference
      const validationResults = await this.validateCrossReferences(userId, userHHC);
      if (validationResults.updates.length > 0) {
        this.applyUpdates(userHHC, validationResults.updates);
        processingLog.push(`Validation: ${validationResults.updates.length} dimensions refined`);
      }

      // Update metadata
      userHHC.metadata.lastUpdated = new Date();
      userHHC.metadata.processingLog = processingLog;
      userHHC.metadata.totalDimensionsPopulated = userHHC.vector.filter(v => v > 0).length;
      userHHC.metadata.averageConfidence = this.calculateAverageConfidence(userHHC);

      console.log(`✅ HHC processing complete: ${finalUpdates.length} total updates, ${userHHC.metadata.totalDimensionsPopulated}/256 dimensions populated`);

      return {
        success: true,
        userHHC,
        updates: finalUpdates,
        validation: validationResults,
        processingLog,
        insights: this.generatePersonalityInsights(userHHC)
      };

    } catch (error) {
      console.error('Error processing user personality:', error);
      return {
        success: false,
        error: error.message,
        userHHC: this.getUserVector(userId) // Return existing vector if available
      };
    }
  }

  // Population Algorithm: Conversation Data
  async populateFromConversation(userId, conversationData, userHHC) {
    const updates = [];

    for (const conversation of conversationData) {
      // Use Socratic personality extractor
      const extractionResult = await this.personalityExtractor.extractPersonalityData(conversation.message, userId);
      
      // Convert extracted facets to HHC updates
      for (const facet of extractionResult.extractedFacets) {
        const dimensionInfo = this.findDimensionForFacet(facet.facet);
        if (dimensionInfo) {
          updates.push({
            dimension: dimensionInfo.index,
            value: facet.value,
            confidence: facet.confidence,
            source: 'conversation',
            evidence: facet.evidence,
            method: 'socratic_extraction'
          });
        }
      }

      // Use personality analyzer for deeper insights
      if (conversation.followUpNeeded) {
        const analysisResult = await this.personalityAnalyzer.analyzeResponseForTraits(userId, 'general', conversation.message);
        
        for (const [traitName, insight] of Object.entries(analysisResult)) {
          const dimensionInfo = this.findDimensionForTrait(traitName);
          if (dimensionInfo) {
            updates.push({
              dimension: dimensionInfo.index,
              value: insight.score,
              confidence: insight.confidence,
              source: 'conversation_analysis',
              evidence: insight.evidence,
              method: 'personality_analyzer'
            });
          }
        }
      }
    }

    return updates;
  }

  // Population Algorithm: Feedback Data
  async populateFromFeedback(userId, feedbackData, userHHC) {
    const updates = [];

    for (const feedback of feedbackData) {
      // Use enhanced feedback parser
      const feedbackAnalysis = await this.feedbackParser.analyzeMatchFeedback(
        userId, 
        feedback.matchId, 
        feedback.action, 
        feedback.feedback, 
        feedback.matchProfile
      );

      // Convert HHC updates from feedback analysis
      for (const hhcUpdate of feedbackAnalysis.hhcUpdates) {
        const adjustmentValue = this.calculateAdjustmentValue(
          userHHC.vector[hhcUpdate.dimension],
          hhcUpdate.adjustment,
          hhcUpdate.strength
        );

        updates.push({
          dimension: hhcUpdate.dimension,
          value: adjustmentValue,
          confidence: hhcUpdate.confidence,
          source: 'feedback',
          evidence: hhcUpdate.reasoning,
          method: 'preference_analysis'
        });
      }
    }

    return updates;
  }

  // Population Algorithm: Profile Data
  async populateFromProfile(userId, profileData, userHHC) {
    const updates = [];

    // Age-based inferences
    if (profileData.age) {
      const ageTraits = this.inferTraitsFromAge(profileData.age);
      updates.push(...ageTraits);
    }

    // Interest-based inferences
    if (profileData.interests) {
      for (const interest of profileData.interests) {
        const interestTraits = this.inferTraitsFromInterest(interest);
        updates.push(...interestTraits);
      }
    }

    // Education-based inferences
    if (profileData.education) {
      const educationTraits = this.inferTraitsFromEducation(profileData.education);
      updates.push(...educationTraits);
    }

    // Location-based inferences
    if (profileData.location) {
      const locationTraits = this.inferTraitsFromLocation(profileData.location);
      updates.push(...locationTraits);
    }

    // MBTI mapping
    if (profileData.personalityType) {
      const mbtiTraits = this.mapMBTIToHHC(profileData.personalityType);
      updates.push(...mbtiTraits);
    }

    return updates;
  }

  // Cross-validation algorithm
  async validateCrossReferences(userId, userHHC) {
    const validationUpdates = [];
    const inconsistencies = [];

    // Check for personality consistency
    const consistencyChecks = [
      // Openness consistency
      this.checkOpennessCrossDimensions(userHHC),
      // Extraversion consistency
      this.checkExtraversionCrossDimensions(userHHC),
      // Relationship style consistency
      this.checkRelationshipCrossDimensions(userHHC)
    ];

    for (const check of consistencyChecks) {
      if (check.inconsistent) {
        inconsistencies.push(check.issue);
        
        // Apply consistency corrections
        for (const correction of check.corrections) {
          validationUpdates.push({
            dimension: correction.dimension,
            value: correction.adjustedValue,
            confidence: 0.6, // Medium confidence for corrections
            source: 'validation',
            evidence: correction.reasoning,
            method: 'cross_validation'
          });
        }
      }
    }

    return {
      updates: validationUpdates,
      inconsistencies,
      validated: true
    };
  }

  // Update merging with conflict resolution
  mergeUpdates(updates, userHHC) {
    const mergedUpdates = new Map();

    for (const update of updates) {
      const key = update.dimension;
      
      if (!mergedUpdates.has(key)) {
        mergedUpdates.set(key, update);
      } else {
        // Resolve conflicts by confidence weighting
        const existing = mergedUpdates.get(key);
        if (update.confidence > existing.confidence) {
          mergedUpdates.set(key, update);
        } else if (update.confidence === existing.confidence) {
          // Average the values
          const avgUpdate = {
            ...existing,
            value: (existing.value + update.value) / 2,
            evidence: `${existing.evidence}; ${update.evidence}`,
            method: `${existing.method}, ${update.method}`
          };
          mergedUpdates.set(key, avgUpdate);
        }
      }
    }

    return Array.from(mergedUpdates.values());
  }

  // Apply updates to HHC vector
  applyUpdates(userHHC, updates) {
    for (const update of updates) {
      const currentValue = userHHC.vector[update.dimension];
      const currentConfidence = userHHC.metadata.confidenceScores[update.dimension];
      
      // Calculate learning rate based on dimension type
      const learningRate = this.getDimensionLearningRate(update.dimension);
      
      // Apply weighted update
      const confidenceWeight = update.confidence;
      const newValue = currentValue * (1 - learningRate * confidenceWeight) + 
                      update.value * (learningRate * confidenceWeight);
      
      // Update vector and metadata
      userHHC.vector[update.dimension] = Math.max(0, Math.min(1, newValue));
      userHHC.metadata.confidenceScores[update.dimension] = Math.max(currentConfidence, update.confidence);
      userHHC.metadata.dataSources[update.dimension] = update.source;
      
      // Log the update
      userHHC.metadata.learningHistory.push({
        timestamp: new Date(),
        dimension: update.dimension,
        oldValue: currentValue,
        newValue: userHHC.vector[update.dimension],
        source: update.source,
        method: update.method,
        confidence: update.confidence,
        evidence: update.evidence
      });
    }
  }

  // Utility methods for trait inference

  inferTraitsFromAge(age) {
    const updates = [];
    
    if (age < 25) {
      updates.push({ dimension: 24, value: 0.7, confidence: 0.4, source: 'age_inference', evidence: 'young_adult_energy' });
      updates.push({ dimension: 131, value: 0.8, confidence: 0.4, source: 'age_inference', evidence: 'young_adult_adventure' });
    } else if (age > 40) {
      updates.push({ dimension: 53, value: 0.7, confidence: 0.4, source: 'age_inference', evidence: 'mature_resilience' });
      updates.push({ dimension: 58, value: 0.6, confidence: 0.4, source: 'age_inference', evidence: 'life_maturity' });
    }
    
    return updates;
  }

  inferTraitsFromInterest(interest) {
    const interestMappings = {
      'art': [{ dimension: 1, value: 0.8, confidence: 0.5, evidence: 'artistic_interest' }],
      'technology': [{ dimension: 4, value: 0.7, confidence: 0.5, evidence: 'tech_intellect' }],
      'travel': [{ dimension: 3, value: 0.8, confidence: 0.6, evidence: 'travel_adventure' }],
      'fitness': [{ dimension: 23, value: 0.8, confidence: 0.6, evidence: 'fitness_activity' }],
      'reading': [{ dimension: 4, value: 0.7, confidence: 0.5, evidence: 'reading_intellect' }]
    };

    const traits = interestMappings[interest.toLowerCase()] || [];
    return traits.map(trait => ({ ...trait, source: 'interest_inference' }));
  }

  // Helper methods

  getUserVector(userId) {
    return this.userVectors.get(userId);
  }

  createNewUserVector(userId) {
    const newVector = this.hhcSchema.createEmptyVector();
    this.userVectors.set(userId, newVector);
    return newVector;
  }

  findDimensionForFacet(facetName) {
    // Use the schema to find dimension mapping
    return this.hhcSchema.getFacetInfo?.(facetName);
  }

  findDimensionForTrait(traitName) {
    // Map trait names to specific dimensions
    const traitMappings = {
      imagination: { index: 0 },
      adventurousness: { index: 3 },
      activityLevel: { index: 23 },
      warmth: { index: 20 }
      // ... add more mappings
    };
    
    return traitMappings[traitName];
  }

  getDimensionLearningRate(dimension) {
    if (dimension < 60) return this.learningRates.corePersonality;
    if (dimension < 120) return this.learningRates.socialStyle;
    if (dimension < 220) return this.learningRates.preferences;
    return this.learningRates.learned;
  }

  calculateAverageConfidence(userHHC) {
    const nonZeroConfidences = userHHC.metadata.confidenceScores.filter(c => c > 0);
    return nonZeroConfidences.length > 0 ? 
           nonZeroConfidences.reduce((sum, c) => sum + c, 0) / nonZeroConfidences.length : 0;
  }

  calculateAdjustmentValue(currentValue, adjustment, strength) {
    if (adjustment === 'increase') {
      return Math.min(1, currentValue + (strength * 0.3));
    } else if (adjustment === 'decrease') {
      return Math.max(0, currentValue - (strength * 0.3));
    }
    return currentValue;
  }

  // Consistency checking methods

  checkOpennessCrossDimensions(userHHC) {
    const opennessDimensions = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9];
    const values = opennessDimensions.map(d => userHHC.vector[d]);
    const average = values.reduce((sum, v) => sum + v, 0) / values.length;
    
    const inconsistencies = [];
    const corrections = [];
    
    values.forEach((value, i) => {
      if (Math.abs(value - average) > 0.4) {
        inconsistencies.push(`Dimension ${opennessDimensions[i]} inconsistent with other openness traits`);
        corrections.push({
          dimension: opennessDimensions[i],
          adjustedValue: (value + average) / 2,
          reasoning: 'Openness consistency correction'
        });
      }
    });

    return {
      inconsistent: inconsistencies.length > 0,
      issue: inconsistencies,
      corrections
    };
  }

  checkExtraversionCrossDimensions(userHHC) {
    // Similar consistency checking for extraversion
    return { inconsistent: false, issue: [], corrections: [] };
  }

  checkRelationshipCrossDimensions(userHHC) {
    // Check relationship dimensions for consistency
    return { inconsistent: false, issue: [], corrections: [] };
  }

  generatePersonalityInsights(userHHC) {
    const insights = {};
    const summary = this.hhcSchema.generateVectorSummary(userHHC);
    
    // Generate insights for each major category
    Object.entries(summary).forEach(([category, data]) => {
      insights[category] = {
        topTraits: data.topTraits.map(trait => ({
          trait: trait.facet,
          strength: trait.interpretation.level,
          description: trait.interpretation.description
        })),
        overallScore: Math.round(data.averageScore * 100)
      };
    });

    return insights;
  }

  // Public API methods

  async getUserPersonalityVector(userId) {
    return this.getUserVector(userId);
  }

  async updateFromConversation(userId, message, context = {}) {
    return await this.processUserPersonality(userId, {
      conversationData: [{ message, context }]
    });
  }

  async updateFromFeedback(userId, feedbackData) {
    return await this.processUserPersonality(userId, {
      feedbackData: [feedbackData]
    });
  }

  async updateFromProfile(userId, profileData) {
    return await this.processUserPersonality(userId, {
      profileData
    });
  }

  async getPersonalityInsights(userId) {
    const userHHC = this.getUserVector(userId);
    if (!userHHC) {
      throw new Error(`No personality data found for user ${userId}`);
    }

    return {
      summary: this.hhcSchema.generateVectorSummary(userHHC),
      insights: this.generatePersonalityInsights(userHHC),
      metadata: userHHC.metadata,
      completeness: (userHHC.metadata.totalDimensionsPopulated / 256) * 100
    };
  }

  async calculateCompatibility(userId1, userId2) {
    const user1HHC = this.getUserVector(userId1);
    const user2HHC = this.getUserVector(userId2);
    
    if (!user1HHC || !user2HHC) {
      throw new Error('Both users must have personality data for compatibility calculation');
    }

    // Calculate compatibility across different dimension categories
    const compatibilityScores = {};
    
    for (const [categoryName, categoryData] of Object.entries(this.hhcSchema.dimensionMap)) {
      const dimensions = this.hhcSchema.getCategoryDimensions(categoryName);
      let categoryCompatibility = 0;
      
      for (const dim of dimensions) {
        const diff = Math.abs(user1HHC.vector[dim.index] - user2HHC.vector[dim.index]);
        const compatibility = 1 - diff; // Higher similarity = higher compatibility
        categoryCompatibility += compatibility;
      }
      
      compatibilityScores[categoryName] = (categoryCompatibility / dimensions.length) * 100;
    }

    // Calculate overall compatibility
    const overallCompatibility = Object.values(compatibilityScores)
                               .reduce((sum, score) => sum + score, 0) / Object.keys(compatibilityScores).length;

    return {
      overallCompatibility: Math.round(overallCompatibility),
      categoryScores: compatibilityScores,
      insights: this.generateCompatibilityInsights(user1HHC, user2HHC, compatibilityScores)
    };
  }

  generateCompatibilityInsights(user1HHC, user2HHC, scores) {
    const insights = [];
    
    // High compatibility areas
    Object.entries(scores).forEach(([category, score]) => {
      if (score > 80) {
        insights.push({
          type: 'strength',
          category,
          message: `High compatibility in ${category} (${Math.round(score)}%)`
        });
      } else if (score < 60) {
        insights.push({
          type: 'growth_area',
          category,
          message: `Potential growth area in ${category} (${Math.round(score)}%)`
        });
      }
    });

    return insights;
  }

  /**
   * Process conversation data to update HHC vector
   * @param {string} userId - User ID
   * @param {Array} conversationData - Array of conversation messages
   * @param {Object} userHHC - Current user HHC vector
   * @returns {Array} Array of dimension updates
   */
  async processConversationData(userId, conversationData, userHHC) {
    const updates = [];
    
    if (!conversationData || !Array.isArray(conversationData)) {
      return updates;
    }

    // Process each conversation message for personality insights
    for (const message of conversationData) {
      if (message.from === 'user' && message.text) {
        // Extract personality traits from user messages
        const traits = this.extractPersonalityTraits(message.text);
        
        // Convert traits to HHC dimension updates
        for (const trait of traits) {
          if (trait.dimension >= 0 && trait.dimension < 256) {
            updates.push({
              dimension: trait.dimension,
              value: trait.value,
              confidence: trait.confidence || 0.7,
              source: 'conversation',
              message: message.text.substring(0, 100) + '...'
            });
          }
        }
      }
    }

    return updates;
  }

  /**
   * Extract personality traits from text using simple keyword analysis
   * @param {string} text - Message text
   * @returns {Array} Array of trait objects
   */
  extractPersonalityTraits(text) {
    const traits = [];
    const lowerText = text.toLowerCase();
    console.log('🧠 Extracting traits from text:', text.substring(0, 100) + '...');
    
    // Expanded keyword-based trait extraction
    const traitKeywords = {
      // Openness traits (0-9) - More common words
      imagination: { keywords: ['imagine', 'creative', 'dream', 'fantasy', 'think', 'wonder', 'curious', 'idea'], dimension: 0 },
      artistic: { keywords: ['art', 'music', 'beautiful', 'aesthetic', 'design', 'create', 'artistic'], dimension: 1 },
      adventure: { keywords: ['adventure', 'travel', 'explore', 'new', 'experience', 'try', 'different'], dimension: 3 },
      
      // Conscientiousness traits (10-19)
      organization: { keywords: ['organized', 'plan', 'schedule', 'structure', 'order', 'prepare'], dimension: 11 },
      achievement: { keywords: ['goal', 'achieve', 'success', 'ambitious', 'work', 'accomplish', 'finish'], dimension: 13 },
      
      // Extraversion traits (20-29)
      social: { keywords: ['social', 'party', 'people', 'friends', 'meet', 'talk', 'chat', 'group'], dimension: 21 },
      assertive: { keywords: ['confident', 'leader', 'assertive', 'bold', 'strong', 'speak up'], dimension: 22 },
      
      // Agreeableness traits (30-39)
      helpful: { keywords: ['help', 'care', 'kind', 'support', 'nice', 'gentle', 'considerate'], dimension: 32 },
      trusting: { keywords: ['trust', 'honest', 'reliable', 'faithful', 'believe', 'depend'], dimension: 30 },
      
      // Neuroticism traits (40-49)
      anxious: { keywords: ['worry', 'anxious', 'stress', 'nervous', 'afraid', 'scared', 'tense'], dimension: 40 },
      calm: { keywords: ['calm', 'peaceful', 'relaxed', 'stable', 'chill', 'easy', 'comfortable'], dimension: 40, invert: true },
      
      // General conversational traits
      thoughtful: { keywords: ['think', 'believe', 'feel', 'opinion', 'perspective', 'view'], dimension: 5 },
      communicative: { keywords: ['say', 'tell', 'share', 'express', 'communicate', 'talk'], dimension: 25 },
      emotional: { keywords: ['feel', 'emotion', 'heart', 'soul', 'mood', 'feelings'], dimension: 45 }
    };

    // Check for trait keywords
    for (const [traitName, traitData] of Object.entries(traitKeywords)) {
      for (const keyword of traitData.keywords) {
        if (lowerText.includes(keyword)) {
          const value = traitData.invert ? 0.3 : 0.7; // Lower value if inverted trait
          traits.push({
            dimension: traitData.dimension,
            value: value,
            confidence: 0.6,
            trait: traitName,
            keyword: keyword
          });
          console.log(`🎯 Found trait: ${traitName} (${keyword}) -> dimension ${traitData.dimension}`);
          break; // Only count each trait once per message
        }
      }
    }

    console.log(`🧠 Extracted ${traits.length} traits from message`);
    return traits;
  }
}

export default new HighResolutionHHCService();